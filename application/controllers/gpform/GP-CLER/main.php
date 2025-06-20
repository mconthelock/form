<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/_file.php';
use GuzzleHttp\Client;

class Main extends MY_Controller
{
    use _Form, _File;
    protected $client;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('gpform/GP-CLER/cler_model', 'clr');
        $this->load->model('gpform/GP-ENT/ent_model', 'ent');
        $this->load->model('form_model', 'form');
        $this->upload_path = "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPCLER/";
        $this->client      = new Client(['verify' => false]);
    }

    public function index()
    {
        $data['NFRMNO'] = $nfrmno = $this->input->get('no');
        $data['VORGNO'] = $vorgno = $this->input->get('orgNo');
        $data['CYEAR']  = $cyear = $this->input->get('y');
        $data['CYEAR2'] = $cyear2 = $this->input->get('y2');
        $data['NRUNNO'] = $nrunno = $this->input->get('runNo');
        $data['EMPNO'] = $empno = $this->input->get('empno');

        $bp = isset($_GET['bp']) ? $_GET['bp'] : '';

        $form_entertain        = $this->clr->get_entertain_formAll('9', $vorgno, $cyear);
        $data['estimate_type'] = $this->ent->get_estimate_type();
        $data['mode']          = $this->getMode($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);

        if (!$cyear2 || !$nrunno) {
            foreach ($form_entertain as &$item) {
                $item->form_number = $this->toFormNumber(
                    $item->NFRMNO,
                    $item->VORGNO,
                    $item->CYEAR,
                    $item->CYEAR2,
                    $item->NRUNNO
                );
            }
            $data['form_entertain'] = $form_entertain;
            $this->views('gpform/GP-ENT/Clearance', $data);
        } else {
            $data['formCler'] = $formCler = $this->clr->get_clearance_form($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)[0];

            $form       = [
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ];
            $getEmpFlow = $this->form->getEmpFlow($form, $empno);
            if (!empty($getEmpFlow)) {
                $checkReturnb = $this->form->checkReturnb($form, $getEmpFlow[0]->CSTEPNEXTNO);
            }

            $data['expense'] = $this->clr->get_expense($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);

            if (!empty($formCler->FORM_ENT)) {
                $keyform1 = $this->parseFormNumber($formCler->FORM_ENT);
                $FrmENT   = $this->clr->getFormMst($keyform1['vaname'])[0];

                $data['ENT_FORM']         = $this->ent->dataForm($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $keyform1['cyear2'], $keyform1['runno'])[0];
                $data['estimate_cost']    = $this->ent->get_estimate_cost($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $keyform1['cyear2'], $keyform1['runno']);
                $data['dataParticipants'] = $this->ent->dataParticipants($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $keyform1['cyear2'], $keyform1['runno']);
                $data['company']          = $this->ent->dataCompany($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $keyform1['cyear2'], $keyform1['runno']);
                $data['form']             = $this->form->getForm($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $keyform1['cyear2'], $keyform1['runno']);
            } else {
                $data['ENT_FORM']         = $this->ent->dataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)[0];
                $data['estimate_cost']    = $this->ent->get_estimate_cost($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
                $data['dataParticipants'] = $this->ent->dataParticipants($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
                $data['company']          = $this->ent->dataCompany($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
                $data['form']             = $this->form->getForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            }


            if (!empty($checkReturnb)) {
                $data['guest_type'] = $this->ent->get_guest_type();
                if (!empty($formCler->FORM_ENT)) {
                    $this->views('gpform/GP-CLER/Clear_edit', $data);
                } else {
                    $this->views('gpform/GP-CLER/Clear_edit_noAdv', $data);
                }

            } else {
                $this->views('gpform/GP-CLER/Clear_report', $data);
            }
        }
    }

    public function Clearance_form()
    {
        $FrmENT    = $this->clr->getFormMst('GP-ENT')[0];
        $FrmCLR    = $this->clr->getFormMst('GP-CLER')[0];
        $formno    = explode("/", $this->input->post('form_no'));
        $empcode   = $this->input->post("empcode");
        $entertain = $this->input->post('no_entertain');

        $data['empcode'] = $empcode;
        $data['NFRMNO']  = $FrmCLR->NNO;
        $data['VORGNO']  = $FrmCLR->VORGNO;
        $data['CYEAR']   = $FrmCLR->CYEAR;

        if (isset($entertain)) {
            $data['guest_type']    = $this->ent->get_guest_type();
            $data['estimate_type'] = $this->ent->get_estimate_type();
            $this->views('gpform/GP-CLER/Clear_noAdv', $data);
        } else {
            $entertainData = $this->ent->dataForm(
                $FrmENT->NNO,
                $FrmENT->VORGNO,
                $FrmENT->CYEAR,
                $formno[0],
                $formno[1]
            )[0];

            $data['ent'] = [
                'NFRMNO' => $FrmENT->NNO,
                'VORGNO' => $FrmENT->VORGNO,
                'CYEAR'  => $FrmENT->CYEAR,
                'CYEAR2' => $formno[0],
                'NRUNNO' => $formno[1]
            ];

            $data['entertainData']    = $entertainData;
            $data['estimate_cost']    = $this->ent->get_estimate_cost($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $formno[0], $formno[1]);
            $data['dataParticipants'] = $this->ent->dataParticipants($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $formno[0], $formno[1]);
            $data['formNumber']       = $this->toFormNumber($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $formno[0], $formno[1]);
            $data['company']          = $this->ent->dataCompany($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $formno[0], $formno[1]);
            $this->views('gpform/GP-ENT/Clearance_form', $data);
        }
    }

    public function insert()
    {
        $post = $this->input->post();

        // print_r($post);

        // print_r(json_decode($post['expense']));


        if ($post['p_join'] == "1") {
            $getEmp = $this->ent->get_orgpos("040101", "10")[0]; // RAF DIM
        }
        $this->updateFlowApv("", $getEmp->VEMPNO, $post['nfrmno'], $post['vorgno'], $post['cyear'], $post['cyear2'], $post['nrunno'], "01", "00");
        $data = [
            'NFRMNO'         => $post['nfrmno'],
            'VORGNO'         => $post['vorgno'],
            'CYEAR'          => $post['cyear'],
            'CYEAR2'         => $post['cyear2'],
            'NRUNNO'         => $post['nrunno'],
            'PRESIDENT_JOIN' => $post['p_join'],
            'ACTUAL_COST'    => $post['actual_cost'],
            'REMAIN_BUDGET'  => $post['remain'],
            'REMARK'         => $post['remark'],
            'EMP_INPUT'      => $post['empcode'],
            'EMP_REQ'        => $post['empcode'],
            'FORM_ENT'       => $post['formnumber']
        ];

        if (isset($_FILES['receipt'])) {
            $file = $this->uploadFile($_FILES['receipt']);
            if ($file['status'] == '1') {
                $data['RECEIPT_FILE'] = $file['file_name'];
            }
        }

        foreach (json_decode($post['expense']) as $key => $value) {
            $data_expense = [
                'NFRMNO'  => $post['nfrmno'],
                'VORGNO'  => $post['vorgno'],
                'CYEAR'   => $post['cyear'],
                'CYEAR2'  => $post['cyear2'],
                'NRUNNO'  => $post['nrunno'],
                'RECEIPT' => $value->receipt_no,
                'COST'    => $value->cost
            ];
            $this->clr->insert('GPCLER_EXPENSE', $data_expense);
        }

        $ent_where = [
            'NFRMNO' => $post['ent_nfrmno'],
            'VORGNO' => $post['ent_vorgno'],
            'CYEAR'  => $post['ent_cyear'],
            'CYEAR2' => $post['ent_cyear2'],
            'NRUNNO' => $post['ent_nrunno']
        ];
        $this->clr->update('GPENT_FORM', ['STATUS' => '2'], $ent_where, $dateFields = []);

        $this->clr->insert('GPCLER_FORM', $data);
    }

    public function InsertFormNoAdv()
    {
        $post   = $this->input->post();
        $nfrmno = $post['nfrmno'];
        $vorgno = $post['vorgno'];
        $cyear  = $post['cyear'];
        $cyear2 = $post['cyear2'];
        $nrunno = $post['nrunno'];

        if ($post['p_join'] == "1") {
            $getEmp = $this->ent->get_orgpos("040101", "10")[0]; // RAF DIM
        }
        $this->updateFlowApv("", $getEmp->VEMPNO, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, "18", "00");

        $data = [
            'NFRMNO'               => $nfrmno,
            'VORGNO'               => $vorgno,
            'CYEAR'                => $cyear,
            'CYEAR2'               => $cyear2,
            'NRUNNO'               => $nrunno,
            'EMP_INPUT'            => $post['input_by'],
            'EMP_REQ'              => $post['requested_by'],
            'PURPOSE'              => $post['purpose'],
            'TYPE_TIME'            => $post['time'],
            'LOCATION_TYPE'        => $post['location'],
            'LOCATION'             => $post['location_detail'],
            'ENTERTAINMENT_BUDGET' => $post['entertain_budget'],
            'GUEST_TYPE'           => $post['guest_type'],
            'REMARK'               => $post['remark'],
            'STATUS'               => '1',
        ];

        $dateFields = [];
        if (!empty($post['entertain_date'])) {
            $dateFields['ENTERTAINMENT_DATE'] = "TO_DATE('{$post['entertain_date']}', 'YYYY-MM-DD')";
        }

        $this->ent->insert('GPENT_FORM', $data, $dateFields);

        foreach (json_decode($post['estimate_items']) as $key => $value) {
            $data_estimate = [
                'NFRMNO'     => $nfrmno,
                'VORGNO'     => $vorgno,
                'CYEAR'      => $cyear,
                'CYEAR2'     => $cyear2,
                'NRUNNO'     => $nrunno,
                'DETAILS'    => $value->details,
                'QTY'        => $value->qty,
                'UNIT_COST'  => $value->cost,
                'TOTAL_COST' => $value->total,
                'REMARK'     => $value->remark
            ];

            $this->ent->insert('GPENT_ESTIMATE', $data_estimate);
        }

        foreach (json_decode($post['guest_list']) as $key => $value) {
            $data_guest = [
                'NFRMNO'   => $nfrmno,
                'VORGNO'   => $vorgno,
                'CYEAR'    => $cyear,
                'CYEAR2'   => $cyear2,
                'NRUNNO'   => $nrunno,
                'TYPE'     => 'guest',
                'NAME'     => $value,
                'EMP_CODE' => '',
            ];
            $this->ent->insert('GPENT_PARTICIPANTS', $data_guest);
        }

        foreach (json_decode($post['amec_list']) as $key => $value) {
            $data_amec = [
                'NFRMNO'   => $nfrmno,
                'VORGNO'   => $vorgno,
                'CYEAR'    => $cyear,
                'CYEAR2'   => $cyear2,
                'NRUNNO'   => $nrunno,
                'TYPE'     => 'amec',
                'NAME'     => '',
                'EMP_CODE' => $value,
            ];
            $this->ent->insert('GPENT_PARTICIPANTS', $data_amec);
        }

        $companies = json_decode($_POST['companies'], true);
        $files     = $_FILES['company_files'];

        foreach ($companies as $idx => $company) {

            $data_company = [
                'NFRMNO'       => $nfrmno,
                'VORGNO'       => $vorgno,
                'CYEAR'        => $cyear,
                'CYEAR2'       => $cyear2,
                'NRUNNO'       => $nrunno,
                'COMPANY_NAME' => $company['name'],
                'COMPANY_TYPE' => $company['orgType'],
                // 'ATTACH_FILE'  => ''
            ];
            if (isset($files['name'][$idx])) {
                $extension = pathinfo($files['name'][$idx], PATHINFO_EXTENSION);
                $oneFile   = array(
                    'name'     => "File_guest_$idx.$extension",
                    'type'     => $files['type'][$idx],
                    'tmp_name' => $files['tmp_name'][$idx],
                    'error'    => $files['error'][$idx],
                    'size'     => $files['size'][$idx]
                );

                $file = $this->uploadFile($oneFile);

                pre_array($file);
                if ($file['status'] == '1') {
                    $data_company['ATTACH_FILE'] = $file['file_name'];
                }
            }
            $this->ent->insert('GPENT_COMPANY', $data_company);
        }

        foreach (json_decode($post['expense']) as $key => $value) {
            $data_expense = [
                'NFRMNO'  => $post['nfrmno'],
                'VORGNO'  => $post['vorgno'],
                'CYEAR'   => $post['cyear'],
                'CYEAR2'  => $post['cyear2'],
                'NRUNNO'  => $post['nrunno'],
                'RECEIPT' => $value->receipt_no,
                'COST'    => $value->cost
            ];
            $this->clr->insert('GPCLER_EXPENSE', $data_expense);
        }

        $data_cler = [
            'NFRMNO'         => $post['nfrmno'],
            'VORGNO'         => $post['vorgno'],
            'CYEAR'          => $post['cyear'],
            'CYEAR2'         => $post['cyear2'],
            'NRUNNO'         => $post['nrunno'],
            'PRESIDENT_JOIN' => $post['p_join'],
            'ACTUAL_COST'    => $post['actual_cost'],
            // 'REMAIN_BUDGET'  => $post['remain'],
            'REMARK'         => $post['remark'],
            'EMP_INPUT'      => $post['input_by'],
            'EMP_REQ'        => $post['input_by'],
            'REASON'         => $post['Reason'],
        ];

        if (isset($_FILES['receipt'])) {
            $file = $this->uploadFile($_FILES['receipt']);
            if ($file['status'] == '1') {
                $data_cler['RECEIPT_FILE'] = $file['file_name'];
            }
        }

        if (isset($_FILES['file_memo'])) {
            $file = $this->uploadFile($_FILES['file_memo']);
            if ($file['status'] == '1') {
                $data_cler['MEMO_FILE'] = $file['file_name'];
            }
        }

        $this->clr->insert('GPCLER_FORM', $data_cler);

        echo "<pre>";
        print_r($post);
        echo "</pre>";
    }

    function parseFormNumber($formNumber)
    {
        // ตัวอย่าง: ST-INT24-000001
        $matches = [];
        if (preg_match('/^([A-Z\-]+)(\d{2})-(\d{6})$/', $formNumber, $matches)) {
            $year_short = $matches[2];    // ได้ 24
            $year_full  = "20" . $year_short; // สมมติเป็นปี 20xx
            return [
                'vaname' => $matches[1],       // ST-INT
                'cyear2' => $year_full,        // 2024
                'runno'  => ltrim($matches[3], '0'), // 1
            ];
        }
        return false;
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

    public function update()
    {
        $post = $this->input->post();
        if ($post['p_join'] == "1") {
            $getEmp = $this->ent->get_orgpos("040101", "10")[0]; // RAF DIM
        } else {
            $getEmp = $this->ent->get_orgpos("020101", "02")[0]; // PRESIDENT
        }
        $this->updateFlowApv("", $getEmp->VEMPNO, $post['nfrmno'], $post['vorgno'], $post['cyear'], $post['cyear2'], $post['nrunno'], "01", "00");
        $data  = [

            'PRESIDENT_JOIN' => $post['p_join'],
            'ACTUAL_COST'    => $post['actual_cost'],
            'REMAIN_BUDGET'  => $post['remain'],
            'REMARK'         => $post['remark']
        ];
        $where = [
            'NFRMNO' => $post['nfrmno'],
            'VORGNO' => $post['vorgno'],
            'CYEAR'  => $post['cyear'],
            'CYEAR2' => $post['cyear2'],
            'NRUNNO' => $post['nrunno'],
        ];

        if (isset($_FILES['receipt'])) {
            $file = $this->uploadFile($_FILES['receipt']);
            if ($file['status'] == '1') {
                $data['RECEIPT_FILE'] = $file['file_name'];
            }
        }

        $this->clr->update('GPCLER_FORM', $data, $where);
        // $this->clr->insert('GPCLER_FORM', $data);
    }

    public function UpdateNoAdv()
    {
        $post   = $this->input->post();
        $nfrmno = $post['nfrmno'];
        $vorgno = $post['vorgno'];
        $cyear  = $post['cyear'];
        $cyear2 = $post['cyear2'];
        $nrunno = $post['nrunno'];

        $where = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ];

        if ($post['p_join'] == "1") {
            $getEmp = $this->ent->get_orgpos("040101", "10")[0]; // RAF DIM
        } else {
            $getEmp = $this->ent->get_orgpos("020101", "02")[0]; // PRESIDENT
        }
        $this->updateFlowApv("", $getEmp->VEMPNO, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, "18", "00");

        $data = [
            'NFRMNO'               => $nfrmno,
            'VORGNO'               => $vorgno,
            'CYEAR'                => $cyear,
            'CYEAR2'               => $cyear2,
            'NRUNNO'               => $nrunno,
            'EMP_INPUT'            => $post['input_by'],
            'EMP_REQ'              => $post['requested_by'],
            'PURPOSE'              => $post['purpose'],
            'TYPE_TIME'            => $post['time'],
            'LOCATION_TYPE'        => $post['location'],
            'LOCATION'             => $post['location_detail'],
            'ENTERTAINMENT_BUDGET' => $post['entertain_budget'],
            'GUEST_TYPE'           => $post['guest_type'],
            'REMARK'               => $post['remark'],
            'STATUS'               => '1',
        ];

        $dateFields = [];
        if (!empty($post['entertain_date'])) {
            $dateFields['ENTERTAINMENT_DATE'] = "TO_DATE('{$post['entertain_date']}', 'YYYY-MM-DD')";
        }

        $this->clr->update('GPENT_FORM', $data, $where, $dateFields);


        $this->clr->delete('GPENT_ESTIMATE', $where);
        foreach (json_decode($post['estimate_items']) as $key => $value) {
            $data_estimate = [
                'NFRMNO'     => $nfrmno,
                'VORGNO'     => $vorgno,
                'CYEAR'      => $cyear,
                'CYEAR2'     => $cyear2,
                'NRUNNO'     => $nrunno,
                'DETAILS'    => $value->details,
                'QTY'        => $value->qty,
                'UNIT_COST'  => $value->cost,
                'TOTAL_COST' => $value->total,
                'REMARK'     => $value->remark
            ];


            $this->clr->insert('GPENT_ESTIMATE', $data_estimate);
        }

        $this->clr->delete('GPENT_PARTICIPANTS', $where);
        foreach (json_decode($post['guest_list']) as $key => $value) {
            $data_guest = [
                'NFRMNO'   => $nfrmno,
                'VORGNO'   => $vorgno,
                'CYEAR'    => $cyear,
                'CYEAR2'   => $cyear2,
                'NRUNNO'   => $nrunno,
                'TYPE'     => 'guest',
                'NAME'     => $value,
                'EMP_CODE' => '',
            ];

            $this->clr->insert('GPENT_PARTICIPANTS', $data_guest);
        }

        foreach (json_decode($post['amec_list']) as $key => $value) {
            $data_amec = [
                'NFRMNO'   => $nfrmno,
                'VORGNO'   => $vorgno,
                'CYEAR'    => $cyear,
                'CYEAR2'   => $cyear2,
                'NRUNNO'   => $nrunno,
                'TYPE'     => 'amec',
                'NAME'     => '',
                'EMP_CODE' => $value,
            ];
            // $this->clr->delete('GPENT_PARTICIPANTS', $where_del);
            $this->clr->insert('GPENT_PARTICIPANTS', $data_amec);
        }

        $companies = json_decode($_POST['companies'], true);
        $files     = $_FILES['company_files'];

        $this->clr->delete('GPENT_COMPANY', $where);
        foreach ($companies as $idx => $company) {

            $data = [
                'NFRMNO'       => $nfrmno,
                'VORGNO'       => $vorgno,
                'CYEAR'        => $cyear,
                'CYEAR2'       => $cyear2,
                'NRUNNO'       => $nrunno,
                'COMPANY_NAME' => $company['name'],
                'COMPANY_TYPE' => $company['orgType'],
                // 'ATTACH_FILE'  => ''
            ];

            // แนบไฟล์ใหม่กรณีอัปโหลด
            if (isset($files['name'][$idx]) && $files['name'][$idx]) {
                $extension = pathinfo($files['name'][$idx], PATHINFO_EXTENSION);
                $oneFile   = array(
                    'name'     => "File_guest_$idx.$extension",
                    'type'     => $files['type'][$idx],
                    'tmp_name' => $files['tmp_name'][$idx],
                    'error'    => $files['error'][$idx],
                    'size'     => $files['size'][$idx]
                );

                $file = $this->uploadFile($oneFile);

                if ($file['status'] == '1') {
                    $data['ATTACH_FILE'] = $file['file_name'];
                }
            } else {
                // ถ้า edit แล้วไม่มีไฟล์ใหม่ แต่มีไฟล์เดิม ให้ใช้ไฟล์เดิม
                if (!empty($company['current_file'])) {
                    $data['ATTACH_FILE'] = $company['current_file'];
                }
                // ถ้าไม่มีไฟล์เดิมเลย (เพิ่มใหม่) จะไม่ set ATTACH_FILE หรือจะ set เป็นค่าว่างก็ได้
            }

            // print_r($data_company);

            $this->clr->insert('GPENT_COMPANY', $data);
        }

        $data_cler = [
            'NFRMNO'         => $post['nfrmno'],
            'VORGNO'         => $post['vorgno'],
            'CYEAR'          => $post['cyear'],
            'CYEAR2'         => $post['cyear2'],
            'NRUNNO'         => $post['nrunno'],
            'PRESIDENT_JOIN' => $post['p_join'],
            'ACTUAL_COST'    => $post['actual_cost'],
            // 'REMAIN_BUDGET'  => $post['remain'],
            'REMARK'         => $post['remark'],
            'EMP_INPUT'      => $post['input_by'],
            'EMP_REQ'        => $post['input_by'],
            'REASON'         => $post['Reason'],
        ];

        if (isset($_FILES['receipt'])) {
            $file = $this->uploadFile($_FILES['receipt']);
            if ($file['status'] == '1') {
                $data_cler['RECEIPT_FILE'] = $file['file_name'];
            }
        }

        if (isset($_FILES['file_memo'])) {
            $file = $this->uploadFile($_FILES['file_memo']);
            if ($file['status'] == '1') {
                $data_cler['MEMO_FILE'] = $file['file_name'];
            }
        }

        $this->clr->update('GPCLER_FORM', $data_cler, $where);
    }



}
