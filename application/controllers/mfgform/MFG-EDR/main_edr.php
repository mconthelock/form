<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use GuzzleHttp\Client;
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/_file.php';

class main_edr extends MY_Controller {
    use _Form, _File;
    public function __construct(){
        parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/MFG/MFG-EDR/";
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
            $this->views('mfgform/MFG-EDR/approve_view', $data);
        } else {
            $this->views('mfgform/MFG-EDR/create_edr', $data);
        }
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

            if (!is_dir($targetPath)) {
                mkdir($targetPath, 0777, true);
            }

            if (empty($_FILES['filUpload_ref']['name'])) {
                echo json_encode([
                    'status' => true,
                    'message' => 'No file',
                    'files' => []
                ]);
                return;
            }

            $file = $_FILES['filUpload_ref'];
            $countfiles = count($file['name']);
            $uploadedFiles = [];

            for ($i = 0; $i < $countfiles; $i++) {
                if (empty($file['name'][$i])) {
                    continue;
                }

                $originalName = trim($file['name'][$i]);
                $ext = pathinfo($originalName, PATHINFO_EXTENSION);
                $nameOnly = pathinfo($originalName, PATHINFO_FILENAME);

                $safeName = preg_replace('/[^A-Za-z0-9ก-๙_\-]/u', '', $nameOnly);
                $safeName = preg_replace('/\s+/', '', $safeName);

                if ($safeName === '') {
                    $safeName = 'file';
                }

                $newName = $safeName . '_' . date('YmdHis') . '_' . ($i + 1);

                if ($ext) {
                    $newName .= '.' . strtolower($ext);
                }

                $_FILES['file']['name']     = $newName;
                $_FILES['file']['type']     = $file['type'][$i];
                $_FILES['file']['tmp_name'] = $file['tmp_name'][$i];
                $_FILES['file']['error']    = $file['error'][$i];
                $_FILES['file']['size']     = $file['size'][$i];

                $config = [];
                $config['upload_path']   = $targetPath;
                $config['allowed_types'] = '*';
                $config['file_name']     = $newName;
                $config['overwrite']     = false;

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
                'files' => $uploadedFiles
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'status' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function preview_file($formno, $filename){
        $filepath = $this->upload_path."/".$formno;
        $this->downloadFile($filename, $filepath);
    }
}