<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use GuzzleHttp\Client;
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/_file.php';

class main_or extends MY_Controller {
    use _Form, _File;
    public function __construct(){
        parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/MFG/MFG-OR/";
    }

    public function index(){
        $data = array();
        $bp = isset($_GET['bp']) ? $_GET['bp'] : '';
        $data = [
            'NFRMNO' => $nfrmno = $this->input->get('no'),
            'VORGNO' => $vorgno = $this->input->get('orgNo'),
            'CYEAR'  => $cyear = $this->input->get('y'),
            'CYEAR2' => $cyear2 = $this->input->get('y2'),
            'NRUNNO' => $nrunno = $this->input->get('runNo'),
            'EMPNO'  => $empno = $this->input->get('empno'),
        ];
        $data['mode']  = $this->getMode($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
        if(isset($nrunno) && $nrunno != "") {
            $data['exdata'] =  $this->getExtData($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
            $data['formno'] = $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $this->views('mfgform/MFG-OR/approve_view', $data);
        } else {
           $this->views('mfgform/MFG-OR/create_or', $data);
        }
    }

    public function show_view_report(){
        $this->views('mfgform/MFG-OR/report_or');
    }
    public function show_orcenter(){
        $this->views('mfgform/MFG-OR/or_center');
    }

    public function save_request(){
        try {
            $inputBy     = $this->input->post('inputBy');
            $requestBy   = $this->input->post('request_by');
            $repairBy   = $this->input->post('repair_by');

            $nfrmno  = $this->input->post('nfrmno');
            $vorgno  = $this->input->post('vorgno');
            $cyear   = $this->input->post('cyear');
            $flow    = $this->create($nfrmno, $vorgno, $cyear, $inputBy, $requestBy, '');
            //$form    = $flow['message'];
            $cyear2  = $form['cyear2'];
            $nrunno  = $form['runno'];





        } catch (Exception $e) {
            log_message('error', 'Error in saveForm: ' . $e->getMessage());
            echo json_encode(['status' => false, 'message' => 'An error occurred while saving the form.']);
            return; 
        }
    }

    public function uploadfile(){
        header('Content-Type: application/json; charset=utf-8');
        try {
            $nfrmno = $this->input->post('NFRMNO');
            $vorgno = $this->input->post('VORGNO');
            $cyear  = $this->input->post('CYEAR');
            $cyear2 = $this->input->post('CYEAR2');
            $nrunno = $this->input->post('NRUNNO');

            $formno = $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $targetPath = rtrim($this->upload_path, "/\\") . DIRECTORY_SEPARATOR . $formno . DIRECTORY_SEPARATOR;

            if (!is_dir($targetPath)) { mkdir($targetPath, 0777, true); }

            if (empty($_FILES['filUpload_ref']['name'])) {
                echo json_encode(['status' => true, 'message' => 'No file', 'files' => []]);
                return;
            }

            $file = $_FILES['filUpload_ref'];
            $uploadedFiles = [];
            $countfiles = count($file['name']);

            for ($i = 0; $i < $countfiles; $i++) {
                if (empty($file['name'][$i])) { continue; }

                $ext = strtolower(pathinfo(trim($file['name'][$i]), PATHINFO_EXTENSION));
                if (!$ext) { throw new Exception('Invalid file extension'); }

                $newName = $formno . '.' . $ext;

                $_FILES['file'] = [
                    'name'     => $newName,
                    'type'     => $file['type'][$i],
                    'tmp_name' => $file['tmp_name'][$i],
                    'error'    => $file['error'][$i],
                    'size'     => $file['size'][$i],
                ];

                $config = [
                    'upload_path'   => $targetPath,
                    'allowed_types' => '*',
                    'file_name'     => $newName,
                    'overwrite'     => true,
                ];

                $this->load->library('upload');
                $this->upload->initialize($config);

                if (!$this->upload->do_upload('file')) {
                    throw new Exception($this->upload->display_errors('', ''));
                }

                $uploadedFiles[] = $newName;
            }

            echo json_encode([
                'status' => true,
                'message' => 'Upload success',
                'formno' => $formno,
                'path' => $targetPath,
                'files' => array_values(array_unique($uploadedFiles))
            ]);
        } catch (Exception $e) {
            echo json_encode(['status' => false, 'message' => $e->getMessage()]);
        }
    }

    public function preview_file($formno, $filename){
        $filename = urldecode($filename);
        $filepath = rtrim($this->upload_path, "/\\").DIRECTORY_SEPARATOR.$formno.DIRECTORY_SEPARATOR.$filename;

        if (!is_file($filepath)) {
            show_error('File not found: ' . $filepath, 404);
            return;
        }

        if (ob_get_length()) {
            ob_end_clean();
        }

        $mime = function_exists('mime_content_type') ? mime_content_type($filepath) : 'application/octet-stream';

        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($filepath));
        header('Content-Disposition: inline; filename="' . basename($filename) . '"');
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');
        readfile($filepath);
        exit;
    }

    public function download_template($type = '')
    {
        try {
            switch ($type) {
                case 'vertical':
                    $filePath = rtrim($this->upload_path, "/\\"). DIRECTORY_SEPARATOR. 'temp'. DIRECTORY_SEPARATOR. 'Form_Verti.xlsx';
                    break;
                case 'horizontal':
                    $filePath = rtrim($this->upload_path, "/\\"). DIRECTORY_SEPARATOR. 'temp'. DIRECTORY_SEPARATOR. 'Form_Hori.xlsx';
                    break;
                default:
                    show_404();
                    return;
            }

            if (!is_file($filePath)) {
                show_error('File not found', 404);
                return;
            }

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
            header('Content-Length: ' . filesize($filePath));

            readfile($filePath);
            exit;
        } catch (Exception $e) {
            show_error($e->getMessage(), 500);
        }
    }


    public function export_pdf(){
        header('Content-Type: application/json; charset=utf-8');
        try {
            $formno = $this->input->post('formno');
            if (!$formno) { throw new Exception('formno is required'); }

            $folder = $this->normalize_windows_path(rtrim($this->upload_path, "/\\") . DIRECTORY_SEPARATOR . $formno . DIRECTORY_SEPARATOR);
            if (!is_dir($folder)) { throw new Exception('Form folder not found: ' . $folder); }

            $excelFiles = glob($folder . '*.{xlsx,xlsm,xls}', GLOB_BRACE);
            if (empty($excelFiles)) { throw new Exception('Excel file not found: ' . $folder); }

            $excelPath = $this->normalize_windows_path($excelFiles[0]);
            $pdfPath = $this->normalize_windows_path(preg_replace('/\.(xlsx|xlsm|xls)$/i', '.pdf', $excelPath));

            $this->excel_to_pdf_com($excelPath, $pdfPath);

            echo json_encode([
                'status' => true,
                'pdf' => basename($pdfPath)
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'status' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    private function normalize_windows_path($path){
        return str_replace('/', '\\', $path);
    }

    private function excel_to_pdf_com($excelPath, $pdfPath){
        if (!class_exists('COM')) { throw new Exception('PHP COM extension is not enabled'); }

        $excelPath = $this->normalize_windows_path($excelPath);
        $pdfPath = $this->normalize_windows_path($pdfPath);

        if (!is_file($excelPath)) { throw new Exception('Excel file not found by PHP: ' . $excelPath); }

        $pdfDir = dirname($pdfPath);
        if (!is_dir($pdfDir)) { mkdir($pdfDir, 0777, true); }

        $excel = null;
        $workbook = null;

        try {
            $excel = new COM("Excel.Application");
            $excel->Visible = false;
            $excel->DisplayAlerts = false;
            $workbook = $excel->Workbooks->Open($excelPath);
            $workbook->ExportAsFixedFormat(0, $pdfPath);
            $workbook->Close(false);
            $excel->Quit();
            unset($workbook, $excel);
            if (!is_file($pdfPath)) { throw new Exception('PDF export failed: ' . $pdfPath); }
            return $pdfPath;
        } catch (Exception $e) {
            if ($workbook) { $workbook->Close(false); }
            if ($excel) { $excel->Quit(); }
            unset($workbook, $excel);
            throw $e;
        }
    }

}