<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';

class Training_manage extends MY_Controller {
    use _Form, _File;

    function __construct(){
        parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->load->model('gpform/GP-TRN/training_model', 'trn');
    }

    public function index(){
        // โหลดข้อมูล form types (dropdown)
        $data['form_types'] = $this->trn->get_training_form_mst(' WHERE FID NOT IN (2,5)');

        // โหลดหน้าเต็ม (ใช้เฉพาะเวลาเปิด URL โดยตรง)
        $this->blade->view('gpform.GP-TRN.training_manage_group', $data);
    }

    public function get_form_types(){
        try {
            $data = $this->trn->get_training_form_mst(' WHERE FID NOT IN (2,5)');
            echo json_encode([
                "status" => "success",
                "data"   => $data
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status"  => "error",
                "message" => $e->getMessage()
            ]);
        }
    }

    public function get_form_running(){
        $fid = $this->input->post('FID');
        $where = " AND A.FID = '".$fid."' AND A.GROUP_TRAIN IS NULL ";
        $data = $this->trn->get_data_group_train($where);

        echo json_encode([
            "status" => "success",
            "data"   => $data
        ]);
    }
}
