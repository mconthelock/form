<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';
require_once APPPATH . 'controllers/api/webform/flow.php';

class main_edr extends MY_Controller {
    use _File;
    use _Form, flow {
        flow::getExtData insteadof _Form;
        flow::doaction insteadof _Form;
        _Form::deleteFlowStep insteadOf flow;
    }

    public function __construct(){
        parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPTRN/";
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
        $this->views('mfgform/MFG-EDR/create_edr', $data);
    }

    public function saveForm(){
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
}