<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
class Report extends MY_Controller
{
    use _Form;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('gpform/GP-ENT/ent_model', 'ent');
        // Load necessary models, libraries, helpers here
    }

    public function index()
    {
        $data['section']    = $this->ent->get_Section();
        $data['department'] = $this->ent->get_Department();
        $data['division']   = $this->ent->get_Division();

        $this->views('gpform/GP-ENT/report', $data);
    }

    public function get_report()
    {
        $type    = $this->input->post('type');
        $filters = [
            'SEMPNO'     => $this->input->post('SEMPNO'),
            'SSECCODE'   => $this->input->post('SSECCODE'),
            'SDEPCODE'   => $this->input->post('SDEPCODE'),
            'SDIVCODE'   => $this->input->post('SDIVCODE'),
            'start_date' => $this->input->post('start_date'),   // รูปแบบ YYYY-MM-DD
            'end_date'   => $this->input->post('end_date'),     // รูปแบบ YYYY-MM-DD
        ];

        if ($type == 'type1') {
            $data = $this->ent->get_report_ent($filters);

            // $where         = [
            //     'NFRMNO' => $data[0]->NFRMNO,
            //     'VORGNO' => $data[0]->VORGNO,
            //     'CYEAR'  => $data[0]->CYEAR,
            //     'CYEAR2' => $data[0]->CYEAR2,
            //     'NRUNNO' => $data[0]->NRUNNO
            // ];
            // $detail_guest  = $this->ent->select('GPENT_COMPANY', $where);
            // $estimate_cost = $this->ent->dataParticipants('GPENT_ESTIMATE', $data[0]->NFRMNO, $data[0]->VORGNO, $data[0]->CYEAR, $data[0]->CYEAR2, $data[0]->NRUNNO);
            // $guest         = $this->ent->select('GPENT_PARTICIPANTS', $where);



            foreach ($data as $item) {
                $where               = [
                    'NFRMNO' => $item->NFRMNO,
                    'VORGNO' => $item->VORGNO,
                    'CYEAR'  => $item->CYEAR,
                    'CYEAR2' => $item->CYEAR2,
                    'NRUNNO' => $item->NRUNNO
                ];
                $detail_guest        = $this->ent->select('GPENT_COMPANY', $where);
                $estimate_cost       = $this->ent->select('GPENT_ESTIMATE', $where);
                $guest               = $this->ent->dataParticipants($item->NFRMNO, $item->VORGNO, $item->CYEAR, $item->CYEAR2, $item->NRUNNO);
                $item->FORM_NUMBER   = $this->toFormNumber(
                    $item->NFRMNO,
                    $item->VORGNO,
                    $item->CYEAR,
                    $item->CYEAR2,
                    $item->NRUNNO
                );
                $item->detail_guest  = $detail_guest;  // <<-- ยัด array ทั้งก้อนเข้าไปเลย
                $item->estimate_cost = $estimate_cost;
                $item->guest         = $guest;
            }

            // echo "<pre>" . print_r($data, true) . "</pre>"; // จะเห็นว่าทุก object มี property detail_guest ที่เป็น array แล้ว
        } else {
            $data = $this->ent->get_report_cler($filters);
            foreach ($data as $item) {
                $where             = [
                    'NFRMNO' => $item->NFRMNO,
                    'VORGNO' => $item->VORGNO,
                    'CYEAR'  => $item->CYEAR,
                    'CYEAR2' => $item->CYEAR2,
                    'NRUNNO' => $item->NRUNNO
                ];
                $item->RECEIPT     = $this->ent->select('GPCLER_EXPENSE', $where);
                $item->FORM_NUMBER = $this->toFormNumber($item->NFRMNO, $item->VORGNO, $item->CYEAR, $item->CYEAR2, $item->NRUNNO);

            }
        }
        // echo "<pre>" . print_r($data, true) . "</pre>";

        echo json_encode($data);
    }


}