<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/_file.php';
use GuzzleHttp\Client;

class Main extends MY_Controller {
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

        $ent_frmno = $this->_servername() == 'amecweb' ? '17' : '9';

        $form_entertain        = $this->clr->get_entertain_formEMP($ent_frmno, $vorgno, $cyear, $empno);
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
            $this->views('gpform/GP-CLER/Clearance', $data);
        } else {
            $data['formCler']         = $formCler = $this->clr->get_clearance_form($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)[0];
            $data['clearance_formno'] = $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['file_attach']      = $this->clr->getFileAttach($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);

            $form       = [
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ];
            $getEmpFlow = $this->form->getEmpFlow($form, $empno);
            if (!empty($getEmpFlow)) {
                // $checkReturnb = $this->form->checkReturnb($form, $getEmpFlow[0]->CSTEPNEXTNO);
                $checkReturnb = $this->form->checkReturn($form, $empno);
            }

            $data['expense']     = $this->clr->get_expense($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['flowstep']    = $flow = $this->ent->getFlowStep($form, $empno);
            $data['needPayDate'] = (
                !empty($flow) &&
                in_array($flow[0]->CSTEPNO, ['87', '19']) &&
                $flow[0]->CSTEPNEXTNO == '00'
            );
            if (!empty($formCler->FORM_ENT)) {
                $keyform1 = $this->parseFormNumber($formCler->FORM_ENT);
                $FrmENT   = $this->clr->getFormMst($keyform1['vaname'])[0];

                $data['ENT_FORM'] = $entform = $this->ent->dataForm($FrmENT->NNO, $FrmENT->VORGNO, $FrmENT->CYEAR, $keyform1['cyear2'], $keyform1['runno'])[0];
                $empno = $this->ent->getDataEmp($entform->EMP_REQ);
                // $arr_merge = array_merge((array) $entform, (array) $empno);
                // print_r($empno);
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
                $this->views('gpform/GP-CLER/Clear_report_new', $data);
            }
        }
    }

    public function test()
    {
        $this->views('gpform/GP-CLER/Clear_report_new');
    }

    public function Clearance_form()
    {
        $FrmENT    = $this->clr->getFormMst('GP-ENT')[0];
        $FrmCLR    = $this->clr->getFormMst('GP-CLER')[0];
        $formno    = explode("/", $this->input->post('form_no'));
        $empcode   = $this->input->post("empcode");
        $inputer   = $this->input->post('inputer');
        $entertain = $this->input->post('no_entertain');

        $data['empcode'] = $empcode;
        $data['inputer'] = $inputer;
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
            $this->views('gpform/GP-CLER/Clearance_form', $data);
        }
    }

    public function insert()
    {
        $post = $this->input->post();


        if ($post['p_join'] == "1") {
            $getEmp = $this->ent->get_orgpos("040101", "10")[0]; // RAF DIM
        } else {
            $getEmp = $this->ent->get_orgpos("020101", "02")[0]; // PRESIDENT
        }
        $this->updateFlowApv("", $getEmp->VEMPNO, $post['nfrmno'], $post['vorgno'], $post['cyear'], $post['cyear2'], $post['nrunno'], "18", "19");
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
            'EMP_INPUT'      => $post['inputer'],
            'EMP_REQ'        => $post['requester'],
            'FORM_ENT'       => $post['formnumber']
        ];

        // if (isset($_FILES['receipt'])) {
        //     $file = $this->uploadFile($_FILES['receipt']);
        //     if ($file['status'] == '1') {
        //         $data['RECEIPT_FILE'] = $file['file_name'];
        //     }
        // }

        if (isset($_FILES['file_group'])) {
            $fileGroup = $_FILES['file_group'];
            foreach ($fileGroup['name'] as $i => $name) {
                if ($fileGroup['error'][$i] === UPLOAD_ERR_OK) {
                    $extension = pathinfo($name, PATHINFO_EXTENSION);
                    $fileIndex = $i + 1;
                    $oneFile   = [
                        'name'     => "Attach_{$post['cyear2']}_{$post['nrunno']}_{$fileIndex}.{$extension}",
                        'type'     => $fileGroup['type'][$i],
                        'tmp_name' => $fileGroup['tmp_name'][$i],
                        'error'    => $fileGroup['error'][$i],
                        'size'     => $fileGroup['size'][$i]
                    ];
                    $file      = $this->uploadFile($oneFile);
                    if ($file['status'] == '1') {
                        $data_file = [
                            'NFRMNO'    => $post['nfrmno'],
                            'VORGNO'    => $post['vorgno'],
                            'CYEAR'     => $post['cyear'],
                            'CYEAR2'    => $post['cyear2'],
                            'NRUNNO'    => $post['nrunno'],
                            'FILE_NAME' => $file['file_name'],
                            'FILE_PATH' => $file['file_path'],
                        ];
                        $this->clr->insert('GPCLER_FILE', $data_file);
                    }
                }
            }
        }

        // ตรวจสอบว่าเป็นแบบตารางปกติหรือแบบแยก (Split)
        if (!empty($post['expense'])) {
            // กรณีตารางปกติ
            $expenses = json_decode($post['expense']);
            foreach ($expenses as $key => $value) {
                $data_expense = [
                    'NFRMNO'  => $post['nfrmno'],
                    'VORGNO'  => $post['vorgno'],
                    'CYEAR'   => $post['cyear'],
                    'CYEAR2'  => $post['cyear2'],
                    'NRUNNO'  => $post['nrunno'],
                    'RECEIPT' => $value->receipt_no,
                    'COST'    => $value->cost
                ];

                // Handle date_issue
                $dateFields_expense = [];
                if (!empty($value->date_issue)) {
                    $dateFields_expense['DATE_ISSUE'] = "TO_DATE('{$value->date_issue}', 'YYYY-MM-DD')";
                }

                // อัปโหลดไฟล์ receipt สำหรับแต่ละแถว
                $receiptFileKey = "receipt_file_{$key}";
                if (isset($_FILES[$receiptFileKey]) && $_FILES[$receiptFileKey]['error'] === UPLOAD_ERR_OK) {
                    $extension   = pathinfo($_FILES[$receiptFileKey]['name'], PATHINFO_EXTENSION);
                    $rowIndex    = $key + 1;
                    $expenseFile = [
                        'name'     => "ExpenseReceipt_{$post['cyear2']}_{$post['nrunno']}_{$rowIndex}.{$extension}",
                        'type'     => $_FILES[$receiptFileKey]['type'],
                        'tmp_name' => $_FILES[$receiptFileKey]['tmp_name'],
                        'error'    => $_FILES[$receiptFileKey]['error'],
                        'size'     => $_FILES[$receiptFileKey]['size']
                    ];
                    $file        = $this->uploadFile($expenseFile);
                    if ($file['status'] == '1') {
                        $data_expense['RECEIPT_FILE'] = $file['file_name'];
                    }
                }

                $this->clr->insert('GPCLER_EXPENSE', $data_expense, $dateFields_expense);
            }
        } elseif (!empty($post['expenseSplit'])) {
            // กรณีตารางแยก (Lunch และ Break)
            $expenseSplit = json_decode($post['expenseSplit']);

            // บันทึก Lunch expenses (type=1)
            if (!empty($expenseSplit->lunch)) {
                foreach ($expenseSplit->lunch as $key => $value) {
                    $data_expense = [
                        'NFRMNO'  => $post['nfrmno'],
                        'VORGNO'  => $post['vorgno'],
                        'CYEAR'   => $post['cyear'],
                        'CYEAR2'  => $post['cyear2'],
                        'NRUNNO'  => $post['nrunno'],
                        'RECEIPT' => $value->receipt_no,
                        'COST'    => $value->cost,
                        'TYPE'    => $value->type // 1 = Lunch
                    ];

                    // Handle date_issue
                    $dateFields_lunch = [];
                    if (!empty($value->date_issue)) {
                        $dateFields_lunch['DATE_ISSUE'] = "TO_DATE('{$value->date_issue}', 'YYYY-MM-DD')";
                    }

                    // อัปโหลดไฟล์ receipt สำหรับ Lunch
                    $receiptFileKey = "receipt_file_lunch_{$key}";
                    if (isset($_FILES[$receiptFileKey]) && $_FILES[$receiptFileKey]['error'] === UPLOAD_ERR_OK) {
                        $extension = pathinfo($_FILES[$receiptFileKey]['name'], PATHINFO_EXTENSION);
                        $rowIndex  = $key + 1;
                        $lunchFile = [
                            'name'     => "LunchReceipt_{$post['cyear2']}_{$post['nrunno']}_{$rowIndex}.{$extension}",
                            'type'     => $_FILES[$receiptFileKey]['type'],
                            'tmp_name' => $_FILES[$receiptFileKey]['tmp_name'],
                            'error'    => $_FILES[$receiptFileKey]['error'],
                            'size'     => $_FILES[$receiptFileKey]['size']
                        ];
                        $file      = $this->uploadFile($lunchFile);
                        if ($file['status'] == '1') {
                            $data_expense['RECEIPT_FILE'] = $file['file_name'];
                        }
                    }

                    $this->clr->insert('GPCLER_EXPENSE', $data_expense, $dateFields_lunch);
                }
            }

            // บันทึก Break expenses (type=4)
            if (!empty($expenseSplit->break)) {
                foreach ($expenseSplit->break as $key => $value) {
                    $data_expense = [
                        'NFRMNO'  => $post['nfrmno'],
                        'VORGNO'  => $post['vorgno'],
                        'CYEAR'   => $post['cyear'],
                        'CYEAR2'  => $post['cyear2'],
                        'NRUNNO'  => $post['nrunno'],
                        'RECEIPT' => $value->receipt_no,
                        'COST'    => $value->cost,
                        'TYPE'    => $value->type // 4 = Break
                    ];

                    // Handle date_issue
                    $dateFields_break = [];
                    if (!empty($value->date_issue)) {
                        $dateFields_break['DATE_ISSUE'] = "TO_DATE('{$value->date_issue}', 'YYYY-MM-DD')";
                    }

                    // อัปโหลดไฟล์ receipt สำหรับ Break
                    $receiptFileKey = "receipt_file_break_{$key}";
                    if (isset($_FILES[$receiptFileKey]) && $_FILES[$receiptFileKey]['error'] === UPLOAD_ERR_OK) {
                        $extension = pathinfo($_FILES[$receiptFileKey]['name'], PATHINFO_EXTENSION);
                        $rowIndex  = $key + 1;
                        $breakFile = [
                            'name'     => "BreakReceipt_{$post['cyear2']}_{$post['nrunno']}_{$rowIndex}.{$extension}",
                            'type'     => $_FILES[$receiptFileKey]['type'],
                            'tmp_name' => $_FILES[$receiptFileKey]['tmp_name'],
                            'error'    => $_FILES[$receiptFileKey]['error'],
                            'size'     => $_FILES[$receiptFileKey]['size']
                        ];
                        $file      = $this->uploadFile($breakFile);
                        if ($file['status'] == '1') {
                            $data_expense['RECEIPT_FILE'] = $file['file_name'];
                        }
                    }

                    $this->clr->insert('GPCLER_EXPENSE', $data_expense, $dateFields_break);
                }
            }

            // อัปโหลดไฟล์ Memo สำหรับ Lunch (memo_1)
            if (isset($_FILES['memo_1']) && $_FILES['memo_1']['error'] === UPLOAD_ERR_OK) {
                $extension     = pathinfo($_FILES['memo_1']['name'], PATHINFO_EXTENSION);
                $memoLunchFile = [
                    'name'     => "MemoLunch_{$post['cyear2']}_{$post['nrunno']}.{$extension}",
                    'type'     => $_FILES['memo_1']['type'],
                    'tmp_name' => $_FILES['memo_1']['tmp_name'],
                    'error'    => $_FILES['memo_1']['error'],
                    'size'     => $_FILES['memo_1']['size']
                ];
                $file          = $this->uploadFile($memoLunchFile);
                if ($file['status'] == '1') {
                    $data_memo = [
                        'NFRMNO'    => $post['nfrmno'],
                        'VORGNO'    => $post['vorgno'],
                        'CYEAR'     => $post['cyear'],
                        'CYEAR2'    => $post['cyear2'],
                        'NRUNNO'    => $post['nrunno'],
                        'FILE_NAME' => $file['file_name'],
                        'FILE_PATH' => $file['file_path'],
                        'FILE_TYPE' => 'MEMO_LUNCH'
                    ];
                    $this->clr->insert('GPCLER_FILE', $data_memo);
                }
            }

            // อัปโหลดไฟล์ Memo สำหรับ Break (memo_4)
            if (isset($_FILES['memo_4']) && $_FILES['memo_4']['error'] === UPLOAD_ERR_OK) {
                $extension     = pathinfo($_FILES['memo_4']['name'], PATHINFO_EXTENSION);
                $memoBreakFile = [
                    'name'     => "MemoBreak_{$post['cyear2']}_{$post['nrunno']}.{$extension}",
                    'type'     => $_FILES['memo_4']['type'],
                    'tmp_name' => $_FILES['memo_4']['tmp_name'],
                    'error'    => $_FILES['memo_4']['error'],
                    'size'     => $_FILES['memo_4']['size']
                ];
                $file          = $this->uploadFile($memoBreakFile);
                if ($file['status'] == '1') {
                    $data_memo = [
                        'NFRMNO'    => $post['nfrmno'],
                        'VORGNO'    => $post['vorgno'],
                        'CYEAR'     => $post['cyear'],
                        'CYEAR2'    => $post['cyear2'],
                        'NRUNNO'    => $post['nrunno'],
                        'FILE_NAME' => $file['file_name'],
                        'FILE_PATH' => $file['file_path'],
                        'FILE_TYPE' => 'MEMO_BREAK'
                    ];
                    $this->clr->insert('GPCLER_FILE', $data_memo);
                }
            }
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
        } else {
            $getEmp = $this->ent->get_orgpos("020101", "02")[0]; // PRESIDENT
        }
        $this->updateFlowApv("", $getEmp->VEMPNO, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, "18", "00");

        // Handle Gift Memo
        $giftMemoFile = null;
        if (isset($_FILES['file_memo_gift']) && $_FILES['file_memo_gift']['error'] == 0) {
            $file       = $_FILES['file_memo_gift'];
            $extension  = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uploadFile = array(
                'name'     => "GiftMemo_{$cyear2}_{$nrunno}.{$extension}",
                'type'     => $file['type'],
                'tmp_name' => $file['tmp_name'],
                'error'    => $file['error'],
                'size'     => $file['size']
            );
            $result     = $this->uploadFile($uploadFile, "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPENT/");
            if ($result['status'] == '1') {
                $giftMemoFile = $result['file_name'];
            }
        }

        // Handle Other Memo
        $otherMemoFile = null;
        if (isset($_FILES['file_memo_other']) && $_FILES['file_memo_other']['error'] == 0) {
            $file       = $_FILES['file_memo_other'];
            $extension  = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uploadFile = array(
                'name'     => "OtherMemo_{$cyear2}_{$nrunno}.{$extension}",
                'type'     => $file['type'],
                'tmp_name' => $file['tmp_name'],
                'error'    => $file['error'],
                'size'     => $file['size']
            );
            $result     = $this->uploadFile($uploadFile, "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPENT/");
            if ($result['status'] == '1') {
                $otherMemoFile = $result['file_name'];
            }
        }
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
            'ENTERTAINMENT_BUDGET' => $post['entertain_budget'] ?? "",
            'GUEST_TYPE'           => $post['guest_type'],
            'REMARK'               => $post['remark'],
            'STATUS'               => '1',
        ];

        if ($giftMemoFile) {
            $data['FILE_MEMO_GIFT'] = $giftMemoFile;
        }
        if ($otherMemoFile) {
            $data['FILE_MEMO_OTHER'] = $otherMemoFile;
        }

        $dateFields = [];
        if (!empty($post['entertain_date'])) {
            $dateFields['ENTERTAINMENT_DATE'] = "TO_DATE('{$post['entertain_date']}', 'YYYY-MM-DD')";
        }

        $this->ent->insert('GPENT_FORM', $data, $dateFields);

        if (!empty($post['estimate_items'])) {
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
        $files     = isset($_FILES['company_files']) ? $_FILES['company_files'] : null;

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

            // Handle date_issue
            $dateFields_expense = [];
            if (!empty($value->date_issue)) {
                $dateFields_expense['DATE_ISSUE'] = "TO_DATE('{$value->date_issue}', 'YYYY-MM-DD')";
            }

            // Handle receipt file per row
            $receiptFileKey = "receipt_file_{$key}";
            if (isset($_FILES[$receiptFileKey]) && $_FILES[$receiptFileKey]['error'] === UPLOAD_ERR_OK) {
                $extension   = pathinfo($_FILES[$receiptFileKey]['name'], PATHINFO_EXTENSION);
                $rowIndex    = $key + 1;
                $expenseFile = [
                    'name'     => "ExpenseReceipt_{$cyear2}_{$nrunno}_{$rowIndex}.{$extension}",
                    'type'     => $_FILES[$receiptFileKey]['type'],
                    'tmp_name' => $_FILES[$receiptFileKey]['tmp_name'],
                    'error'    => $_FILES[$receiptFileKey]['error'],
                    'size'     => $_FILES[$receiptFileKey]['size']
                ];
                $file        = $this->uploadFile($expenseFile, "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPCLER/");
                if ($file['status'] == '1') {
                    $data_expense['RECEIPT_FILE'] = $file['file_name'];
                }
            }

            $this->clr->insert('GPCLER_EXPENSE', $data_expense, $dateFields_expense);
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
            'REMARK'         => $post['remark_president'] ?? $post['remark'] ?? '',
            'EMP_INPUT'      => $post['input_by'],
            'EMP_REQ'        => $post['input_by'],
            'REASON'         => $post['Reason'],
        ];

        if (isset($_FILES['receipt'])) {
            $file = $this->uploadFile($_FILES['receipt'], "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPCLER/");
            if ($file['status'] == '1') {
                $data_cler['RECEIPT_FILE'] = $file['file_name'];
            }
        }

        if (isset($_FILES['file_memo'])) {
            $file = $this->uploadFile($_FILES['file_memo'], "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPCLER/");
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
        $filepath = $this->upload_path . rawurldecode($filename);

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

        if (isset($_FILES['memo'])) {
            $fileGroup = $_FILES['memo'];
            foreach ($fileGroup['name'] as $i => $name) {
                if ($fileGroup['error'][$i] === UPLOAD_ERR_OK) {
                    $oneFile = [
                        'name'     => $name,
                        'type'     => $fileGroup['type'][$i],
                        'tmp_name' => $fileGroup['tmp_name'][$i],
                        'error'    => $fileGroup['error'][$i],
                        'size'     => $fileGroup['size'][$i]
                    ];
                    $file    = $this->uploadFile($oneFile);
                    if ($file['status'] == '1') {
                        print_r($file);
                        $data_file = [
                            'NFRMNO'    => $post['nfrmno'],
                            'VORGNO'    => $post['vorgno'],
                            'CYEAR'     => $post['cyear'],
                            'CYEAR2'    => $post['cyear2'],
                            'NRUNNO'    => $post['nrunno'],
                            'FILE_NAME' => $file['file_name'],
                            'FILE_PATH' => $file['file_path'],
                        ];
                        $this->clr->insert('GPCLER_FILE', $data_file);
                    }
                }
            }
        }
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
            'ENTERTAINMENT_BUDGET' => $post['entertain_budget'] ?? "",
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

        // Delete and re-insert expenses
        $this->clr->delete('GPCLER_EXPENSE', $where);
        if (!empty($post['expense'])) {
            foreach (json_decode($post['expense']) as $key => $value) {
                $data_expense = [
                    'NFRMNO'  => $nfrmno,
                    'VORGNO'  => $vorgno,
                    'CYEAR'   => $cyear,
                    'CYEAR2'  => $cyear2,
                    'NRUNNO'  => $nrunno,
                    'RECEIPT' => $value->receipt_no,
                    'COST'    => $value->cost
                ];

                // Handle date_issue
                $dateFields_expense = [];
                if (!empty($value->date_issue)) {
                    $dateFields_expense['DATE_ISSUE'] = "TO_DATE('{$value->date_issue}', 'YYYY-MM-DD')";
                }

                // Handle receipt file per row
                $receiptFileKey = "receipt_file_{$key}";
                if (isset($_FILES[$receiptFileKey]) && $_FILES[$receiptFileKey]['error'] === UPLOAD_ERR_OK) {
                    $extension   = pathinfo($_FILES[$receiptFileKey]['name'], PATHINFO_EXTENSION);
                    $rowIndex    = $key + 1;
                    $expenseFile = [
                        'name'     => "ExpenseReceipt_{$cyear2}_{$nrunno}_{$rowIndex}.{$extension}",
                        'type'     => $_FILES[$receiptFileKey]['type'],
                        'tmp_name' => $_FILES[$receiptFileKey]['tmp_name'],
                        'error'    => $_FILES[$receiptFileKey]['error'],
                        'size'     => $_FILES[$receiptFileKey]['size']
                    ];
                    $file        = $this->uploadFile($expenseFile, "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPCLER/");
                    if ($file['status'] == '1') {
                        $data_expense['RECEIPT_FILE'] = $file['file_name'];
                    }
                }

                $this->clr->insert('GPCLER_EXPENSE', $data_expense, $dateFields_expense);
            }
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
            'REMARK'         => $post['remark_president'] ?? $post['remark'] ?? '',
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

    public function getformEmp()
    {
        $frmmst         = $this->form->getFormMaster('GP-CLER');
        $empno          = $this->input->post('empno');
        $vorgno         = $frmmst[0]->VORGNO;
        $cyear          = $frmmst[0]->CYEAR;
        $ent_frmno      = $this->_servername() == 'amecweb' ? '17' : '9';
        $form_entertain = $this->clr->get_entertain_formEMP($ent_frmno, $vorgno, $cyear, $empno);
        foreach ($form_entertain as &$item) {
            $item->form_number = $this->toFormNumber(
                $item->NFRMNO,
                $item->VORGNO,
                $item->CYEAR,
                $item->CYEAR2,
                $item->NRUNNO
            );
        }

        echo json_encode($form_entertain);
    }

    public function UpdatePayDate()
    {
        $nfrmno  = $this->input->post('nfrmno');
        $vorgno  = $this->input->post('vorgno');
        $cyear   = $this->input->post('cyear');
        $cyear2  = $this->input->post('cyear2');
        $nrunno  = $this->input->post('nrunno');
        $paydate = $this->input->post('pay_date');
        $where   = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ];
        $data    = [
            'PAYDATE' => "TO_DATE('{$paydate}', 'YYYY-MM-DD')"
        ];
        $this->ent->update('GPCLER_FORM', [], $where, $data);

    }

    public function delete_file()
    {
        $file   = $this->input->post('file');
        $nfrmno = $this->input->post('nfrmno');
        $vorgno = $this->input->post('vorgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');

        $where = [
            'NFRMNO'    => $nfrmno,
            'VORGNO'    => $vorgno,
            'CYEAR'     => $cyear,
            'CYEAR2'    => $cyear2,
            'NRUNNO'    => $nrunno,
            'FILE_NAME' => $file
        ];

        $this->clr->delete('GPCLER_FILE', $where);
        // unlink actual file ถ้าอยู่ใน local/server
        $filePath = $this->upload_path . $file;
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        echo json_encode(['status' => 'success']);
    }



}
