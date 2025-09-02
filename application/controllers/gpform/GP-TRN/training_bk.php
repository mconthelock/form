<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH . 'controllers/_file.php';

class Training extends MY_Controller {
    use _Form, _File;
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->load->model('gpform/GP-TRN/training_model', 'trn');
        $this->upload_path = "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPTRN/";
    }

    public function index()
    {
        // หน้าเลือก type
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
        $data['sects'] = $this->trn->getSect();
        $data['depts'] = $this->trn->getDept();
        $data['divs']  = $this->trn->getDiv();
        $data['emp_detail']  = $this->trn->get_empinfo($empno);
        if (!$cyear2 || !$nrunno) { // Create Form
            $this->views('gpform/GP-TRN/training_select', $data);
        }else{ // Approve / View
           
        }

    }

    public function form($type = null)
    {
        if ($type === null) {
            show_404();
        }
        $data['type'] = $type;
        $this->load->view('training_form', $data);
    }

    public function get_emp() {
        $empno = $this->input->post('empno');
        $data = $this->trn->get_empinfo($empno);

        if (!$data) {
            echo json_encode(['status' => 'error', 'message' => 'ไม่พบข้อมูล กรุณาตรวจสอบอีกครั้ง']);
            return;
        }

        if ($data[0]->CSTATUS == 0) {
            echo json_encode(['status' => 'error', 'message' => 'พนักงานนี้ได้ลาออกจากบริษัทแล้ว']);
            return;
        }

        echo json_encode(['status' => 'success', 'SNAME' => $data[0]->SNAME]);
    }


}
