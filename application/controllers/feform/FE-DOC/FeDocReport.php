<?php
defined('BASEPATH') or exit('No direct script access allowed');

class FeDocReport extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('feform/FE-DOC/edoc_model', 'MainModel');
    }

    /**
     * หน้าแรกของ Report
     * http://localhost:8080/form/feform/FE-DOC/FeDocReport/
     * https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-DOC/FeDocReport/
     */
    public function index()
    {
        $empno = $this->input->get('empno') ||  '';
        $data['EMPNO'] = (string)$empno;
        $data['docTypes'] = $this->MainModel->getActiveDocTypes();

        $this->views('feform/FE-DOC/report/index', $data);
    }

    /**
     * API ค้นหาข้อมูลสำหรับตารางผลลัพธ์
     */
    public function Search()
    {
        $this->output->set_content_type('application/json');

        try {
            $filter = [
                'doc_type'  => $this->input->post('doc_type'),
                'status'    => $this->input->post('status'),
                'date_from' => $this->input->post('date_from'),
                'date_to'   => $this->input->post('date_to'),
                'keyword'   => $this->input->post('keyword'),
            ];

            $result = $this->MainModel->getReportList($filter);

            return $this->output->set_output(json_encode([
                'status' => true,
                'data'   => $result ?: []
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_status_header(500)->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }
}