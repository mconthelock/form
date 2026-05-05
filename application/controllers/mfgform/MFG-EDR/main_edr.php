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
        print_r($data);

        //$this->views('mfgform/MFG-EDR/create_edr', $data);
    }
}