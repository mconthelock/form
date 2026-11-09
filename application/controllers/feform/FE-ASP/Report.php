<?php
// === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/Report

// === http://localhost:8082/form/feform/FE-ASP/Report
 
defined('BASEPATH') OR exit('No direct script access allowed');

class Report extends MY_Controller {

    public $CodeForm = 'AMEC-AR';

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('feform/FE-ASP/Fe_asp_model', 'MainModel');
    }

    public function index() {
        $empNo = trim((string)($this->input->get('empno') ?? ''));

        $data['empno']       = $empNo;
        $data['divisions']   = $this->MainModel->getAllDivisions();
        $data['departments'] = $this->MainModel->getAllDepartmentsList();

        $this->views('feform/FE-ASP/report', $data);
    }

    /**
     * AJAX Endpoint สำหรับดึงข้อมูลตาราง Report
     */
    public function ajaxGetReportData() {
        $this->output->set_content_type('application/json');
        try {
            $filters = [
                'docNo'     => $this->input->get('docNo'),
                'status'    => $this->input->get('status'),
                'divCode'   => $this->input->get('divCode'),
                'depCode'   => $this->input->get('depCode'),
                'startDate' => $this->input->get('startDate'),
                'endDate'   => $this->input->get('endDate'),
            ];

            $records = $this->MainModel->getReportData($filters);

            return $this->output->set_output(json_encode([
                'status' => true,
                'data'   => $records ?: []
            ], JSON_UNESCAPED_UNICODE));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE));
        }
    }
}