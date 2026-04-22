<?php

class main extends MY_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('purform/PUR-SCP/scrap_model', 'sc');
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

    public function saveWinner()
    {
        $json = file_get_contents('php://input');
        $body = json_decode($json, true);

        $rows   = $body['rows'] ?? [];
        $fyear  = $body['fyear'] ?? null;
        $period = $body['period'] ?? null;
        $nrunno = $body['nrunno'] ?? null;
        $cyear2 = $body['cyear2'] ?? null;

        if (!is_array($rows) || empty($rows)) {
            http_response_code(400);
            echo json_encode(['error' => 'No data']);
            return;
        }

        $this->sc->saveWinner($rows, $fyear, $period, $nrunno, $cyear2);
        echo json_encode(['success' => true]);
    }
}