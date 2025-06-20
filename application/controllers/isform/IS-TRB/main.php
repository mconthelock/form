<?php

defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/_file.php';
class Main extends MY_Controller
{
    use _Form;
    use _File;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('isform/IS-TRB/trouble_model', 'tm');
        $this->upload_path = "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/IS/ISTRB/";
    }

    public function index()
    {
        $data         = [
            'NFRMNO' => $nfrmno = $this->input->get('no'),
            'VORGNO' => $vorgno = $this->input->get('orgNo'),
            'CYEAR'  => $cyear = $this->input->get('y'),
            'CYEAR2' => $cyear2 = $this->input->get('y2'),
            'NRUNNO' => $nrunno = $this->input->get('runNo'),
            'EMPNO'  => $empno = $this->input->get('empno'),
        ];
        $data['mode'] = $this->getMode($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
        if (!$cyear2 || !$nrunno) {
            $data['category'] = $this->get_category();
            $this->views('isform/IS-TRB/create', $data);
        } else {
            $data['formNumber'] = $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['form']    = $this->tm->get_request($nrunno, $cyear2)[0];
            $data['emp']     = $this->tm->get_emp($nrunno, $cyear2);
            $data['trouble'] = $this->tm->get_trouble($nrunno, $cyear2);
            $data['path']    = $this->upload_path;
            $this->views('isform/IS-TRB/view', $data);
        }

    }

    public function get_category()
    {
        $data    = $this->tm->get_category();
        $grouped = [];
        foreach ($data as $row) {
            $cat_id = $row->CATEGORY_ID;
            if (!isset($grouped[$cat_id])) {
                $grouped[$cat_id] = [
                    'category_name' => $row->CATEGORY_NAME,
                    'types'         => []
                ];
            }

            if ($row->TYPE_ID) {
                $grouped[$cat_id]['types'][] = [
                    'type_id'   => $row->TYPE_ID,
                    'type_name' => $row->TYPE_NAME
                ];
            }
        }

        return $grouped;
    }

    public function get_user()
    {
        $q    = [
            'SDEPCODE' => '050601',
        ];
        $data = $this->tm->get_user($q);
        echo json_encode($data);
    }

    public function insert()
    {
        $post = $this->input->post();

        print_r($post);

        // เตรียมข้อมูลหลัก
        $data       = [
            'NFRMNO'         => $post['NFRMNO'],
            'VORGNO'         => $post['VORGNO'],
            'CYEAR'          => $post['CYEAR'],
            'CYEAR2'         => $post['CYEAR2'],
            'NRUNNO'         => $post['NRUNNO'],
            'NAME'           => $post['request_name'],
            'LOCATION'       => $post['request_location'],
            'TEL'            => $post['request_tel'] ?? '-',
            'EMAIL'          => $post['request_email'] ?? '-',
            'NOTE'           => $post['request_note'] ?? '-',
            'RESULT'         => $post['result'],
            'RESULTDETAIL'   => $post['result_detail'],
            'INFORM'         => $post['inform'],
            'INFORMDETAIL'   => $post['when'],
            'CAUSETROUBLE'   => $post['cause_detail'],
            'COUNTERMEASURE' => $post['fix_detail'],
            'PREVENTION'     => $post['Prevention'],
        ];
        $dateFields = [];
        if (!empty($post['request_date'])) {
            $dateFields['REQUEST_DATE'] = "TO_DATE('{$post['request_date']}', 'YYYY-MM-DD')";
        }

        if (!empty($_FILES['cause_image'])) {
            $file = $this->uploadFile($_FILES['cause_image']);
            if ($file['status'] == 'success') {
                $data['CAUSEFILE'] = $file['file_name'];
            }
        }

        if (!empty($_FILES['fix_image'])) {
            $file = $this->uploadFile($_FILES['fix_image']);
            if ($file['status'] == 'success') {
                $data['COUNTERMEASUREFILE'] = $file['file_name'];
            }
        }

        $this->tm->insert("ISTRB_FORM", $data, $dateFields);


        if (!empty($post['employee'])) {
            foreach ($post['employee'] as $emp_id) {
                $data = [
                    'NRUNNO' => $post['NRUNNO'],
                    'CYEAR2' => $post['CYEAR2'],
                    'EMPNO'  => $emp_id,
                ];
                $this->tm->insert("ISTRB_EMP", $data);
            }
        }

        // บันทึก trouble_type ทีละประเภท
        if (!empty($post['trouble_type'])) {
            foreach ($post['trouble_type'] as $type_id) {
                // $this->Trouble_model->insert_type([
                //     'trouble_id' => $insert_id,
                //     'type_id'    => $type_id
                // ]);
                $data = [
                    'NRUNNO'  => $post['NRUNNO'],
                    'CYEAR2'  => $post['CYEAR2'],
                    'TYPE_ID' => $type_id,
                ];
                $this->tm->insert("ISTRB_REPORT_TYPE", $data);
            }
        }

        // echo 'บันทึกข้อมูลสำเร็จ';
    }

    public function preview($filename)
    {
        $filepath = $this->upload_path . $filename;

        if (file_exists($filepath)) {
            $mime = mime_content_type($filepath);
            header("Content-Type: $mime");
            readfile($filepath);
            exit;
        } else {
            show_404();
        }
    }



}