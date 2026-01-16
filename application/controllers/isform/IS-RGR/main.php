<?php
use GuzzleHttp\Client;
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
class Main extends MY_Controller {
    use _Form;
    protected $client;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('isform/IS-RGR/rgr_model', 'rm');
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        $data = [
            'NFRMNO' => $nfrmno = $this->input->get('no'),
            'VORGNO' => $vorgno = $this->input->get('orgNo'),
            'CYEAR'  => $cyear = $this->input->get('y'),
            'CYEAR2' => $cyear2 = $this->input->get('y2'),
            'NRUNNO' => $nrunno = $this->input->get('runNo'),
            'EMPNO'  => $empno = $this->input->get('empno'),
        ];

        if (!$cyear2 || !$nrunno) {
            $this->views('isform/IS-RGR/create', $data);
        } else {
            $data['mode']           = $this->getMode($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
            $data['summary_report'] = $report = $this->rm->getSummaryReport($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            // echo "<pre>";
            // print_r($report);
            // echo "</pre>";
            $this->views('isform/IS-RGR/summary_view', $data);
        }
    }

    public function DataSummaryReport()
    {
        $nfrmno = $this->input->post('nfrmno');
        $vorgno = $this->input->post('vorgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');
        // $nfrmno = '17';
        // $vorgno = '050601';
        // $cyear  = '25';
        // $cyear2 = '2025';
        // $nrunno = '9';
        $data   = $this->rm->getSummaryReport($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $result = [];

        foreach ($data as $row) {
            $group = $row->SYSTEM_GROUP_NAME;


            if (!isset($result[$group])) {
                $result[$group] = [
                    "main_system_name" => $group,
                    "total_users"      => 0,       // ปรับค่าตามจริงได้
                    "unmatched"        => 0,         // ปรับค่าตามจริงได้
                    "programs"         => []
                ];
            }

            $formUnmatch = $this->rm->getUnmatchForm($row->ID, $row->PERIOD, $row->FYEAR);

            $result[$group]["total_users"] += $row->TOTAL_MATCH + $row->TOTAL_UNMATCH;
            $result[$group]["unmatched"]   += $row->TOTAL_UNMATCH;

            $result[$group]["programs"][] = [
                "name"          => $row->PROGRAM_NAME,
                "checked"       => $row->TOTAL_MATCH,
                "uncheck"       => $row->TOTAL_UNMATCH,
                "delete_count"  => $row->COUNT_DELETE,
                "change_count"  => $row->COUNT_CHANGE,
                "detail_remark" => $row->REMARK ?: "-",
                'form_unmatch'  => $formUnmatch
            ];
        }

        $period  = $data[0]->PERIOD ?? null;
        $year    = $data[0]->FYEAR ?? null;
        $remark  = $data[0]->REMARK_HEAD ?? null;
        $systems = array_values($result);

        echo json_encode(['systems' => $systems, 'period' => $period, 'year' => $year, 'remark' => $remark]);
        // echo "<pre>";
        // print_r($systems);
        // echo "</pre>";
    }

    public function getSummaryData()
    {
        $period  = $this->input->post('period');
        $year    = $this->input->post('year');
        $data    = $this->rm->getSummaryData($period, $year);
        $grouped = [];
        $id      = 1;
        foreach ($data as $row) {
            $group = trim($row->SYSTEM_GROUP_NAME);
            if (!isset($grouped[$group])) {
                $grouped[$group] = [
                    'id'               => $id++,
                    'main_system_name' => $group,
                    'total_users'      => 0,
                    'unmatched'        => 0, // ใส่ตัวอย่างไว้ก่อน (สามารถดึงจริงภายหลัง)
                    'programs'         => []
                ];
            }
            $formUnmatch = $this->rm->getUnmatchForm($row->ID, $period, $year);

            $grouped[$group]['total_users'] += $row->EMP_COUNT;
            $grouped[$group]['unmatched']   += $row->RESULT_0;
            // $grouped[$group]['form_unmatch'][]  = $formUnmatch;
            $grouped[$group]['programs'][] = ['name' => $row->PROGRAM_NAME, 'matched' => $row->RESULT_1, 'unmatched' => $row->RESULT_0, 'uncheck' => $row->RESULT_NULL, 'program_id' => $row->ID, 'form_unmatch' => $formUnmatch];
        }

        $systems = array_values($grouped);

        echo json_encode(['systems' => $systems]);
    }

    public function getSummaryData2()
    {
        $period = $this->input->post('period');
        $year   = $this->input->post('year');

        $period  = 2;
        $year    = 2025;
        $data    = $this->rm->getSummaryData($period, $year);
        $grouped = [];
        $id      = 1;
        foreach ($data as $row) {
            $group = trim($row->SYSTEM_GROUP_NAME);
            if (!isset($grouped[$group])) {
                $grouped[$group] = [
                    'id'               => $id++,
                    'main_system_name' => $group,
                    'total_users'      => 0,
                    'unmatched'        => 0, // ใส่ตัวอย่างไว้ก่อน (สามารถดึงจริงภายหลัง)
                    'programs'         => []
                ];
            }

            $grouped[$group]['total_users'] += $row->EMP_COUNT;
            $grouped[$group]['unmatched']   += $row->RESULT_0;
            $grouped[$group]['programs'][]   = ['name' => $row->PROGRAM_NAME, 'matched' => $row->RESULT_1, 'unmatched' => $row->RESULT_0, 'uncheck' => $row->RESULT_NULL, 'program_id' => $row->ID];
        }

        $systems = array_values($grouped);
        echo "<pre>";
        print_r($systems);
        echo "</pre>";
        // echo json_encode(['systems' => $systems]);
    }

    // Add more controller methods as needed

    public function submitReview()
    {
        $nfrmno = $this->input->post('nfrmno');
        $vorgno = $this->input->post('vorgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');
        $empno  = $this->input->post('empno');
        $result = $this->input->post('data_result');

        // foreach ($post as $program_id => $program_data) {

        //     $delete_count  = isset($program_data['delete_count']) ? (int) $program_data['delete_count'] : 0;
        //     $change_count  = isset($program_data['change_count']) ? (int) $program_data['change_count'] : 0;
        //     $detail_remark = isset($program_data['detail_remark']) ? $program_data['detail_remark'] : '';

        //     $data = [
        //         'program_id'    => $program_id,
        //         'delete_count'  => $delete_count,
        //         'change_count'  => $change_count,
        //         'detail_remark' => $detail_remark,
        //     ];

        //     echo "<pre>";
        //     print_r($program_data);
        //     echo "</pre>";
        //     // Here you can process each program's data as needed
        //     // For example, save to database or perform validations
        // }

        $data_hdr = [
            'NFRMNO'    => $nfrmno,
            'VORGNO'    => $vorgno,
            'CYEAR'     => $cyear,
            'CYEAR2'    => $cyear2,
            'NRUNNO'    => $nrunno,
            'EMPNO'     => $empno,
            'PERIOD'    => $this->input->post('period'),
            'FYEAR'     => $this->input->post('fyear'),
            'REMARK'    => $this->input->post('remark'),
            'CREATE_BY' => $empno,
        ];
        $this->rm->insert('ISRGV_SUMMARY_HDR', $data_hdr);
        $hdr_id = $this->rm->SelectMaxId('ID', 'ISRGV_SUMMARY_HDR');
        print_r($hdr_id);
        foreach ($result as $key => $item) {
            $data = [
                'HDR_ID'         => $hdr_id,
                'SUMMARY_MST_ID' => $item['id'],
                'COUNT_DELETE'   => $item['delete_count'] ?: 0,
                'COUNT_CHANGE'   => $item['change_count'] ?: 0,
                'REMARK'         => $item['detail_remark'] ?: '',
                'TOTAL_MATCH'    => $item['matched'] ?: 0,
                'TOTAL_UNMATCH'  => $item['unmatched'] ?: 0,
            ];
            $this->rm->insert('ISRGV_SUMMARY_DTL', $data);
            echo "<pre>";
            print_r($item);
            echo "</pre>";
        }



    }
}