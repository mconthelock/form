<?php

defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_file.php';

class main extends MY_Controller {

    use _File;

    public function __construct()
    {
        parent::__construct();
        $this->load->model('purform/PUR-SCP/scrap_model', 'sc');
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/PUR/PURSCP/";
    }

    public function index()
    {
        // Add your logic here
        $cyear2 = $this->input->get('y2');
        $nrunno = $this->input->get('runNo');
        if (!$cyear2 || !$nrunno) {
            $this->views('purform/PUR-SCP/create');
        } else {
            $this->views('purform/PUR-SCP/view');
        }
    }

    public function getDataPrice()
    {
        $data = $this->sc->getDataPrice();
        echo json_encode($data);
    }

    public function checkPeriodExists()
    {
        $fyear  = (int) $this->input->get('fyear');
        $period = (int) $this->input->get('period');

        if (!$fyear || !$period) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing parameters']);
            return;
        }

        $exists = $this->sc->checkPeriodExists($fyear, $period);
        echo json_encode(['exists' => $exists]);
    }

    public function getDataPriceByRunNo()
    {
        $nfrmno = $this->input->get('nfrmno');
        $vorgno = $this->input->get('vorgno');
        $cyear  = $this->input->get('cyear');
        $cyear2 = $this->input->get('cyear2');
        $runno  = $this->input->get('runNo');

        if (!$runno || !$cyear2) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing parameters']);
            return;
        }
        $data = $this->sc->getDataPriceByRunNo($nfrmno, $vorgno, $cyear, $cyear2, $runno);
        echo json_encode($data);
    }

    public function getBankGuarantees()
    {
        $nfrmno = $this->input->get('nfrmno');
        $vorgno = $this->input->get('vorgno');
        $cyear  = $this->input->get('cyear');
        $cyear2 = $this->input->get('cyear2');
        $runno  = $this->input->get('runNo');

        if (!$runno || !$cyear2) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing parameters']);
            return;
        }
        $data = $this->sc->getBankGuarantees($nfrmno, $vorgno, $cyear, $cyear2, $runno);
        echo json_encode($data);
    }

    public function saveWinner()
    {
        $json = file_get_contents('php://input');
        $body = json_decode($json, true);

        $rows   = $body['rows'] ?? [];
        $fyear  = $body['fyear'] ?? null;
        $period = $body['period'] ?? null;
        $nfrmno = $body['nfrmno'] ?? null;
        $vorgno = $body['vorgno'] ?? null;
        $cyear  = $body['cyear'] ?? null;
        $nrunno             = $body['nrunno'] ?? null;
        $cyear2             = $body['cyear2'] ?? null;
        $selectedQuotations = isset($body['selectedQuotations']) && is_array($body['selectedQuotations'])
                              ? $body['selectedQuotations'] : [];
        $bankGuarantees     = isset($body['bankGuarantees']) && is_array($body['bankGuarantees'])
                              ? $body['bankGuarantees'] : [];
        $remark             = isset($body['remark']) ? trim($body['remark']) : '';
        $empno              = $body['empno'] ?? null;
        $isFullYear         = !empty($body['isFullYear']);

        if (!is_array($rows) || empty($rows)) {
            http_response_code(400);
            echo json_encode(['error' => 'No data']);
            return;
        }

        $result = $this->sc->saveWinner($rows, $fyear, $period, $nfrmno, $vorgno, $cyear, $nrunno, $cyear2, $selectedQuotations, $empno);

        if (!empty($bankGuarantees)) {
            $this->sc->saveBankGuarantees($bankGuarantees, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $fyear, $period);
        }

        $this->sc->savePurscpForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $fyear, $period, $remark, $isFullYear);

        echo json_encode(['success' => true, 'inserted' => $result['inserted'], 'skipped' => $result['skipped']]);
    }

    public function uploadAttachFiles()
    {
        $nrunno = $this->input->post('nrunno');
        $cyear2 = $this->input->post('cyear2');
        $nfrmno = $this->input->post('nfrmno');
        $vorgno = $this->input->post('vorgno');
        $cyear  = $this->input->post('cyear');

        if (!$nrunno || !$cyear2 || !$nfrmno || !$vorgno || !$cyear) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing parameters']);
            return;
        }

        $path = $this->upload_path;
        $uploaded = [];

        foreach ($_FILES as $key => $file) {
            if (strpos($key, 'attach_file_') === 0 && !empty($file['name'])) {
                $result = $this->uploadFile($file, $path);
                if ($result['status']) {
                    $uploaded[] = [
                        'original_name' => $result['file_origin_name'],
                        'file_name'     => $result['file_name'],
                        'file_path'     => $result['file_path'] . $result['file_name'],
                    ];
                }
            }
        }

        if (!empty($uploaded)) {
            $this->sc->saveScrapFiles($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $uploaded);
        }

        echo json_encode(['success' => true, 'files' => $uploaded]);
    }

    public function getScrapFiles()
    {
        $nfrmno = $this->input->get('nfrmno');
        $vorgno = $this->input->get('vorgno');
        $cyear  = $this->input->get('cyear');
        $cyear2 = $this->input->get('cyear2');
        $nrunno = $this->input->get('runNo');

        if (!$nrunno || !$cyear2) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing parameters']);
            return;
        }

        $files = $this->sc->getScrapFiles($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);

        $result = array_map(function ($row) {
            $path     = $row->FILE_PATH;
            $basename = basename($path);
            // Strip datetime prefix (YmdHi_originalname)
            $origName = preg_replace('/^\d{12}_/', '', $basename);
            return [
                'file_path' => $path,
                'file_name' => $basename,
                'orig_name' => $origName,
            ];
        }, $files);

        echo json_encode($result);
    }

    public function downloadScrapFile()
    {
        $filePath = $this->input->get('path');

        if (!$filePath || !file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(['error' => 'File not found']);
            return;
        }

        $basename = basename($filePath);
        $origName = preg_replace('/^\d{12}_/', '', $basename);
        $dir      = dirname($filePath);

        $this->downloadFile($origName, $basename, $dir);
    }

    public function getPurscpForm()
    {
        $nfrmno = $this->input->get('nfrmno');
        $vorgno = $this->input->get('vorgno');
        $cyear  = $this->input->get('cyear');
        $cyear2 = $this->input->get('cyear2');
        $nrunno = $this->input->get('runNo');

        if (!$nrunno || !$cyear2) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing parameters']);
            return;
        }

        $row = $this->sc->getPurscpForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        echo json_encode($row ?: (object)[]);
    }
}