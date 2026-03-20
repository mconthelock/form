<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';

class Training extends MY_Controller {
    use _Form, _File;
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->load->model('gpform/GP-TRN/training_model', 'trn');
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
        $data['emp_detail']  = $this->trn->get_empinfo($empno);
        if (!$cyear2 || !$nrunno) { // Create Form
            $this->views('gpform/GP-TRN/training_select', $data);
        }else{ // Approve / View
            $data['formno'] =  $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['exdata'] =  $this->getExtData($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
            $data['form'] = $this->form->getForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['data_head']  = $this->trn->get_main_data($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['data_trainee']  = $this->trn->get_trainee($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['data_purpose']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_LIST', 'LID', ['TYPE' => '1']);
            $data['data_benefit']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_LIST', 'LID', ['TYPE' => '2']);
            $where_gp = "AND A.FID = '".$data['data_head'][0]->FID."' ";

            if($data['data_head'][0]->FID == '2' || $data['data_head'][0]->FID == '5'){
                $data['show_cost'] = $data['data_trainee'][0]->COST_PERSON;
                $where_gp .= "AND A.GROUP_TRAIN = '".$data['data_head'][0]->GROUP_TRAIN."'";
            }else{
                if($data['data_head'][0]->GROUP_TRAIN == ''){$where_gp .= "AND A.CYEAR2 = '".$cyear2."' AND A.NRUNNO = '".$nrunno."'";}
                $data['show_cost'] = $data['data_head'][0]->COST;
            }

            if($data['data_head'][0]->GROUP_TRAIN == ''){
                $where_gp .= "AND A.CYEAR2 = '".$cyear2."' AND A.NRUNNO = '".$nrunno."'";
            }else{
                $where_gp .= "AND A.GROUP_TRAIN = '".$data['data_head'][0]->GROUP_TRAIN."'";
            }
            $data['data_group'] =  $this->trn->get_data_group_train_view($where_gp);
            if($data['data_head'][0]->FID == '1'){
                $data['data_attach_jd']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_ATT', 'ID', ['TYPE_ATT' => 'JD']);
            }
            $data['data_attach_compare']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_ATT', 'ID', ['TYPE_ATT' => 'COMPARE']);
            $data['data_attach_other']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_ATT', 'ID', ['TYPE_ATT' => 'OTHER']);
            $this->views('gpform/GP-TRN/training_view', $data);
        }
    }

    public function get_new_group_train($tp = null) {
        $cyear2 = date('y');
        $get_gp = $this->trn->get_group_train($cyear2);
        $group_no = ($get_gp && $get_gp[0]->GP_TRAIN !== null) ? $get_gp[0]->GP_TRAIN + 1 : 1;
        $group_train = sprintf("%02d-%04d", $cyear2, $group_no);
        if($tp == 'update'){
            return sprintf("%02d-%04d", $cyear2, $group_no);
        }else{
            echo json_encode([
            "status" => true,
            "group_train" => $group_train
        ]);
        }
    }

    public function update_group_train(){
        $items = $this->input->post("items"); // array
        if (!$items) {
            echo json_encode(["status" => false, "msg" => "No items"]);
            return;
        }

        $cyear2 = date('y');
        $new_group = $this->get_new_group_train('update');
        foreach ($items as $itm) {
            $dataUpdate = [ "GROUP_TRAIN" => $new_group];
            $where = [
                "CYEAR2" => $itm['cyear2'],
                "NRUNNO" => $itm['nrunno']
            ];
            $this->trn->update_data("GP_TRN_HEAD", $dataUpdate, $where);
        }
        echo json_encode([
            "status" => true,
            "group_train" => $new_group
        ]);
    }


    public function get_emp() {
        $chk_cost = 0;
        $empno = $this->input->post('empno');
        $data = $this->trn->get_empinfo($empno);
        if (!$data) {
            echo json_encode([
                'status'  => 'error',
                'message' => 'ไม่พบข้อมูลในระบบ (empno: ' . $empno . ')'
            ]);
            return;
        }

        if ($data[0]->CSTATUS == 0) {
            echo json_encode(['status' => 'error', 'message' => 'พนักงานนี้ได้ลาออกจากบริษัทแล้ว']);
            return;
        }

         echo json_encode([
            'status'    => 'success',
            'SNAME'     => $data[0]->STNAME,
            'SPOSITION' => $data[0]->SPOSITION,
            'SSEC'      => $data[0]->SSEC,
            'SDEPT'     => $data[0]->SDEPT,
            'SDIV'      => $data[0]->SDIV,
            'SPOSCODE'  => $data[0]->SPOSCODE
        ]);
    }

    public function get_head() {
        $chk_cost = 0;
        $empno = $this->input->post('empno');
        $data = $this->trn->get_headinfo($empno);
        if (!$data) {
            echo json_encode([
                'status'  => 'error',
                'message' => 'ไม่พบข้อมูลในระบบ (empno: ' . $empno . ')'
            ]);
            return;
        }

        if ($data[0]->CSTATUS == 0) {
            echo json_encode(['status' => 'error', 'message' => 'พนักงานนี้ได้ลาออกจากบริษัทแล้ว']);
            return;
        }
         echo json_encode([
            'status'    => 'success',
            'SNAME'     => $data[0]->SNAME,
            'SPOSITION' => $data[0]->SPOSITION,
            'SSEC'      => $data[0]->SSEC,
            'SDEPT'     => $data[0]->SDEPT,
            'SDIV'      => $data[0]->SDIV,
            'SPOSCODE'  => $data[0]->SPOSCODE
        ]);
    }

    public function save_formcreate(){
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = $this->input->post();
            if (empty($data)) {
                echo json_encode(["status" => "error", "message" => "No POST data received"]);
                return;
            }
            //SET CEXTDATA = '99' FOR REQUESTER
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CEXTDATA', '99', 'CSTEPNO', '--');

            //Update Flow Training Officer  01027/14001
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VAPVNO', '01027', 'CEXTDATA', '04');
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VREPNO', '14001', 'CEXTDATA', '04');
            $formno = $this->toFormNumber($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"]);
            $reason = $data["TRN_EXPENSE_REASON"] ?? "";
            $cost   = $data["COST"] ?? 0;
            if($reason == '1'){$cost = 0;}

            $insert = [
                "NFRMNO" => $data["NFRMNO"],
                "VORGNO" => $data["VORGNO"],
                "CYEAR"  => $data["CYEAR"],
                "CYEAR2" => $data["CYEAR2"],
                "NRUNNO" => $data["NRUNNO"],
                "FID"    => $data["FID"],
                "SUBJECT" => $data["SUBJECT"] ?? "",
                "DATE_FROM" => !empty($data["DATE_FROM"]) ? $data["DATE_FROM"] : null,
                "DATE_TO"   => !empty($data["DATE_TO"]) ? $data["DATE_TO"] : null,
                "TIME_FROM" => $data["TIME_FROM"] ?? "0000",
                "TIME_TO"   => $data["TIME_TO"] ?? "0000",
                "PLACE"       => $data["PLACE"] ?? "",
                "INSTITUTION" => $data["INSTITUTION"] ?? "",
                "TRN_EXPENSE_STATUS" => $data["TRN_EXPENSE_STATUS"] ?? "",
                "TRN_EXPENSE_REASON" => $reason,
                "TRN_EXPENSE_OTHER"  => $data["TRN_EXPENSE_OTHER"] ?? "",
                "COST"      => $cost,
                "COST_NOTE" => $data["COST_NOTE"] ?? "",
                "LAWS" => $data["LAWS"] ?? "",
                "GROUP_TRAIN" => $data["GROUP_TRAIN"] ?? ""
            ];

            // ✅ Insert HEAD
            $result = $this->trn->insert_data("GP_TRN_HEAD", $insert);
            if (!$result) {
                $db_error = $this->db->error();
                echo json_encode([
                    "status" => "error",
                    "message" => "Insert failed",
                    "db_error" => $db_error,
                    "received" => $data
                ]);
                return;
            }

            // ✅ Base สำหรับ child table
            $base = [
                "NFRMNO" => $data["NFRMNO"],
                "VORGNO" => $data["VORGNO"],
                "CYEAR"  => $data["CYEAR"],
                "CYEAR2" => $data["CYEAR2"],
                "NRUNNO" => $data["NRUNNO"]
            ];
            $prefix = $this->input->post("PREFIX");
            $map = [
                "func"  => ["obj" => "funcObjective",  "exp" => "funcExpectation", "trainee" => "funcTraineeCode"],
                "legal" => ["obj" => "legalObjective", "exp" => "legalExpectation", "trainee" => "legalTraineeCode"],
                "meth"  => ["obj" => "methObjective",  "exp" => "methExpectation", "trainee" => "methTraineeCode"],
                "pos"  => ["obj" => "posObjective",  "exp" => "posExpectation", "trainee" => "posTraineeCode"],
                "out"  => ["obj" => "outObjective",  "exp" => "outExpectation", "trainee" => "outTraineeCode"],
            ];

            if (!isset($map[$prefix])) {throw new Exception("Unknown training form prefix: ".$prefix);}
            $this->insertListData("GP_TRN_LIST", $base, "LID", "DETAIL", $data[$map[$prefix]["obj"]], '1'); //PURPOSE TYPE = 1
            $this->insertListData("GP_TRN_LIST", $base, "LID", "DETAIL", $data[$map[$prefix]["exp"]], '2'); //BENEFIT TYPE = 2
            $dest_path = $this->upload_path.$formno;
            if (!is_dir($dest_path)) {mkdir($dest_path, 0777, true);}

            if ($prefix === "func" && !empty($_FILES['funcJdFiles']['name'][0])) {
                foreach ($_FILES['funcJdFiles']['name'] as $i => $name) {
                    $safe_name = preg_replace('/[^A-Za-z0-9._-]/', '_', $name);
                    $_FILES['funcJdFiles']['name'][$i] = $safe_name;
                }

                $uploaded_jd = $this->uploadMultiFile($_FILES, ['funcJdFiles'], $dest_path);
                if ($uploaded_jd['status'] && !empty($uploaded_jd['files']['funcJdFiles'])) {
                    $files = [];
                    foreach ($uploaded_jd['files']['funcJdFiles'] as $f) {
                        $files[] = [
                            'FILENAME' => $f['file_name'] ?? '',  // ส่งชื่อไฟล์จริง (ที่ uploadMultiFile สร้างไว้)
                            'ORIGIN_FILENAME' => $f['orig_name'] ?? $f['file_name']  //  ส่งชื่อไฟล์เดิมจาก user
                        ];
                    }
                    $this->insert_and_upload("GP_TRN_ATT", $base, $files, 'JD', $formno, $dest_path);
                }
            }

            // ✅ Upload Compare Files (ทุกฟอร์มใช้ได้)
            if (!empty($_FILES[$prefix.'CompareFiles']['name'][0])) {
                foreach ($_FILES[$prefix.'CompareFiles']['name'] as $i => $name) {
                    $safe_name = preg_replace('/[^A-Za-z0-9._-]/', '_', $name);
                    $_FILES[$prefix.'CompareFiles']['name'][$i] = $safe_name;
                }

                $uploaded_compare = $this->uploadMultiFile($_FILES, [$prefix.'CompareFiles'], $dest_path);
                if ($uploaded_compare['status'] && !empty($uploaded_compare['files'][$prefix.'CompareFiles'])) {
                    $files = [];
                    foreach ($uploaded_compare['files'][$prefix.'CompareFiles'] as $f) {
                        $files[] = [
                            'FILENAME' => $f['file_name'] ?? '',  // ส่งชื่อไฟล์จริง (ที่ uploadMultiFile สร้างไว้)
                            'ORIGIN_FILENAME' => $f['orig_name'] ?? $f['file_name']  //  ส่งชื่อไฟล์เดิมจาก user
                        ];
                    }
                    $this->insert_and_upload("GP_TRN_ATT", $base, $files, 'COMPARE', $formno, $dest_path);
                }
            }

            // ✅ Upload Other Files (ทุกฟอร์มใช้ได้)
            if (!empty($_FILES[$prefix.'OtherFiles']['name'][0])) {
                foreach ($_FILES[$prefix.'OtherFiles']['name'] as $i => $name) {
                    $safe_name = preg_replace('/[^A-Za-z0-9._-]/', '_', $name);
                    $_FILES[$prefix.'OtherFiles']['name'][$i] = $safe_name;
                }

                $uploaded_other = $this->uploadMultiFile($_FILES, [$prefix.'OtherFiles'], $dest_path);
                if ($uploaded_other['status'] && !empty($uploaded_other['files'][$prefix.'OtherFiles'])) {
                    $files = [];
                    foreach ($uploaded_other['files'][$prefix.'OtherFiles'] as $f) {
                        $files[] = [
                            'FILENAME' => $f['file_name'] ?? '',  // ส่งชื่อไฟล์จริง (ที่ uploadMultiFile สร้างไว้)
                            'ORIGIN_FILENAME' => $f['orig_name'] ?? $f['file_name']  //  ส่งชื่อไฟล์เดิมจาก user
                        ];
                    }
                    $this->insert_and_upload("GP_TRN_ATT", $base, $files, 'OTHER', $formno, $dest_path);
                }
            }

            // ✅ Insert Trainee
            $req_trngp = "";
            if (!empty($data["TRAINEE_ID"])) {
                // แปลงให้เป็น array เสมอ
                $traineeIds   = (array)$data["TRAINEE_ID"];
                $traineeCosts = isset($data["TRAINEE_COST"]) ? (array)$data["TRAINEE_COST"] : [];
                //$traineePoses = isset($data["SPOSCODE"]) ? (array)$data["SPOSCODE"] : [];
                foreach ($traineeIds as $i => $id) {
                    if (empty($id)) continue;
                    $arr_trainee = $base;
                    $arr_trainee['EMPNO']       = trim($id);
                    $arr_trainee['COST_PERSON'] = isset($traineeCosts[$i]) ? $traineeCosts[$i] : 0;
                    $pos = isset($traineePoses[$i]) ? $traineePoses[$i] : null;

                    $arr_trainee['JD_NAME']     = $data["JD_NAME"] ?? "";
                    $arr_trainee['JD_DESC']     = $data["JD_DESC"] ?? "";
                    $this->trn->insert_data("GP_TRN_TRAINEE", $arr_trainee);

                    $get_head_req = $this->trn->get_headinfo($arr_trainee['EMPNO']);
                    $req_posx = $get_head_req[0]->REQ_POS;

                    $reqPos = (int)$get_head_req[0]->REQ_POS;
                    if ($reqPos >= 55 && $reqPos <= 69) {
                        $req_trngp = $get_head_req[0]->HEADNO;
                    } else {
                        $req_trngp = $arr_trainee['EMPNO'];
                    }
                }
            } else {
                log_message('error', '❌ No trainee data found: ' . json_encode($data));
            }

            //Update flow
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VREPNO', '14001', 'CSTEPNO', '18');
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VREPNO', '14001', 'CSTEPNO', '19');

            if($prefix == 'meth' || $prefix == 'pos' ){
                $this->trn->delete_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CEXTDATA', ['19']);
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNEXTNO', '10', 'CSTEPNEXTNO', '19');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CEXTDATA', '19', 'CSTEPNO', '--');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VAPVNO', $data["INPUTBY"], 'CSTEPNO', '--');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VREPNO', $data["INPUTBY"], 'CSTEPNO', '--');
            }else if($prefix == 'legal'){
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '1', 'CSTEPST', '3');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '1', 'CSTEPST', '2');
                $get_head_inputer = $this->trn->get_headinfo($data["INPUTBY"]);
                    $ref_vurl = "http://".$this->_servername().".mitsubishielevatorasia.co.th/form/gpform/GP-TRN/training?sr=1";
                    $data_legal = [
                        'NFRMNO'      => $data["NFRMNO"],
                        'VORGNO'      => $data["VORGNO"],
                        'CYEAR'       => $data["CYEAR"],
                        'CYEAR2'      => $data["CYEAR2"],
                        'NRUNNO'      => $data["NRUNNO"],
                        'CSTEPNO'     => '57',
                        'CSTEPNEXTNO' => '19',
                        'CSTART'      => '0',
                        'CSTEPST'     => '3',
                        'CTYPE'       => '1',
                        'VPOSNO'      => $get_head_inputer[0]->SPOSCODE1,
                        'VAPVNO'      => $get_head_inputer[0]->HEADNO,
                        'VREPNO'      => $get_head_inputer[0]->HEADNO,
                        'VREALAPV'    => null,
                        'CAPVSTNO'    => '0',
                        'DAPVDATE'    => null,
                        'CAPVTIME'    => null,
                        'CEXTDATA'    => null,
                        'CAPVTYPE'    => '1',
                        'CREJTYPE'    => null,
                        'CAPPLYALL'   => '0',
                        'VURL'        => $ref_vurl,
                        'VREMARK'     => null,
                        'VREMOTE'     => null
                    ];

                // เรียกใช้ฟังก์ชัน generic insert_data
                $result = $this->trn->insert_data('FLOW', $data_legal);
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNEXTNO', '57', 'CSTEPNO', '--');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '2', 'CSTEPNO', '19');

                $where = " AND CSTEPNO in ('07','63','06','05','04','03','02')";
                $get_first_step = $this->trn->get_data_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], $where);
                $steps = array_map(function($r){
                    return strval($r->CSTEPNO);
                }, $get_first_step);

                 // ตรวจสอบเงื่อนไขตามลำดับ
                if (in_array('07', $steps)) {
                    $nextno = "07";
                } elseif (in_array('63', $steps)) {
                    $nextno = "63";
                } elseif (in_array('06', $steps)) {
                    $nextno = "06";
                } elseif (in_array('05', $steps)) {
                    $nextno = "05";
                } elseif (in_array('04', $steps)) {
                    $nextno = "04";
                } elseif (in_array('03', $steps)) {
                    $nextno = "03";
                } elseif (in_array('02', $steps)) {
                    $nextno = "02";
                } else {
                    $nextno = "10";
                }

                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNEXTNO', $nextno, 'CSTEPNO', '19');
                if( $nextno != "10"){
                    $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNEXTNO', '10', 'CSTEPNO', '02');
                }
            }

            //ไม่มีค่าใช้จ่าย ลบ Last step
            if($cost == 0){
                $where = " AND CSTEPNEXTNO = '00'";
                $get_step = $this->trn->get_data_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], $where);
            }

            echo json_encode([
                "status" => "success",
                "message" => "Insert successful",
                "req_by" => $req_trngp,
                "req_pos" => $req_posx,
                "received" => $data]
            );
        } catch (Exception $e) {
            //delete form & flow when error
            //$this->trn->delete_all_table($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'FLOW');
            //$this->trn->delete_all_table($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'FORM');
            //$this->trn->delete_all_table($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'GP_TRN_ATT');
            //$this->trn->delete_all_table($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'GP_TRN_TRAINEE');
            //$this->trn->delete_all_table($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'GP_TRN_LIST');
            //$this->trn->delete_all_table($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'GP_TRN_HEAD');
            echo json_encode([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }

    public function add_dim_for_p_div(){

    }

    private function insertListData($table, $base, $fieldId, $fieldName, $values, $type) {
        if (empty($values) || !is_array($values)) return;
        $no = 1;
        foreach ($values as $val) {
            if (trim($val) !== "") {
                $row = $base;
                $row[$fieldId]   = $no;
                $row[$fieldName] = $val;
                $row['TYPE'] = $type;
                $this->trn->insert_data($table, $row);
                $no++;
            }
        }
    }


    public function insert_and_upload($table, $base, $files, $type, $formno, $dest_path){
        $no = 1;
        $upload_dir = rtrim($dest_path, '/\\') . '/';
        log_message('debug', "🟢 insert_and_upload start: {$formno} ({$type})");
        foreach ($files as $f) {
            $orig_name = $f['ORIGIN_FILENAME'] ?? '';
            $real_name = $f['FILENAME'] ?? ''; // ✅ ตอนนี้คือชื่อจริงจาก uploadMultiFile เช่น 202510301044_F1_1_High_Work.pdf
            if (trim($orig_name) !== '' && trim($real_name) !== '') {
                $ext = pathinfo($orig_name, PATHINFO_EXTENSION);
                $new_name = "{$formno}_{$type}_{$no}.{$ext}";
                $old_path = $upload_dir . $real_name;
                $new_path = $upload_dir . $new_name;

                // ✅ rename ชื่อไฟล์จริง
                if (file_exists($old_path)) {
                    if (rename($old_path, $new_path)) {
                        log_message('debug', "✅ Renamed {$real_name} → {$new_name}");
                    } else {
                        log_message('error', "❌ Rename failed: {$old_path}");
                    }
                } else {
                    log_message('error', "❌ File not found: {$old_path}");
                }

                $row = $base;
                $row['ID'] = $no;
                $row['TYPE_ATT'] = $type;
                $row['ORIGIN_FILENAME'] = $orig_name;
                $row['FILENAME'] = $new_name;
                $result = $this->trn->insert_data($table, $row);
                if ($result) {
                    log_message('debug', "💾 Insert OK: {$new_name}");
                } else {
                    log_message('error', "❌ Insert failed: {$new_name}");
                }
                $no++;
            } else {
                log_message('error', "⚠️ Missing file data: " . json_encode($f));
            }
        }
    }


    public function preview_file($formno, $filename, $origin_name){
        $filepath = $this->upload_path."/".$formno;
        $this->downloadFile($origin_name, $filename, $filepath);
    }

    public function check_fin_form() {
        $frmno  = $this->input->post('frmno');
        $orgno  = $this->input->post('orgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');
        $result = $this->trn->get_form($frmno, $orgno, $cyear, $cyear2, $nrunno);

        if (!empty($result)) {
            echo json_encode(["status" => true, "data" => $result[0]]);
        } else {
            echo json_encode(["status" => false, "message" => "Form not found"]);
        }
    }

    public function save_formcreate_report(){
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = $this->input->post();
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CEXTDATA', '99', 'CSTEPNO', '--');
            $formno = $this->toFormNumber($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"]);
            $insert = [
                "NFRMNO" => $data["NFRMNO"],
                "VORGNO" => $data["VORGNO"],
                "CYEAR"  => $data["CYEAR"] ,
                "CYEAR2" => $data["CYEAR2"] ,
                "NRUNNO" => $data["NRUNNO"] ,
                "REF_CYEAR2"    => $data["REF_CYEAR2"],
                "REF_NRUNNO" => $data["REF_NRUNNO"]
            ];

            // ✅ Insert HEAD
            $result = $this->trn->insert_data("GP_TRNRP_HEAD", $insert);
            if (!$result) {
                $db_error = $this->db->error();
                echo json_encode([
                    "status" => "error",
                    "message" => "Insert TRNRP failed",
                    "db_error" => $db_error,
                    "received" => $data
                ]);
                return;
            }

            $get_head_req = $this->trn->get_headinfo($data["REQBY"]);
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VAPVNO', $get_head_req[0]->HEADNO, 'CEXTDATA', '01');
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VREPNO', $get_head_req[0]->HEADNO, 'CEXTDATA', '01');

            echo json_encode(["status" => "success", "message" => "Insert TRNRP successful", "received" => $data]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }

    public function create_cash_adv(){
        $raw  = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            echo json_encode([
                "status"  => false,
                "message" => "Invalid JSON payload"
            ]);
            return;
        }

        $items    = $data["itemsx"]   ?? [];  // ฟอร์มลูกทั้งหมด (training forms ใน group)
        $cashHead = $data["cashHead"] ?? [];  // ข้อมูลฟอร์ม Cash Advance (ที่เพิ่ง createForm มา)

        // base key ของฟอร์ม Cash Advance
        $base_cash_adv = [
            "NFRMNO" => $cashHead["NFRMNO"],
            "VORGNO" => $cashHead["VORGNO"],
            "CYEAR"  => $cashHead["CYEAR"],
            "CYEAR2" => $cashHead["CYEAR2"],
            "NRUNNO" => $cashHead["NRUNNO"]
        ];

        // ============================================================
        // 2) หา DAPVDATE สูงสุดจาก FLOW (CEXTDATA = '10') ของทุกฟอร์มลูก
        // ============================================================
        $dapvList = [];   // เก็บทุก DAPVDATE พร้อม key ฟอร์มต้นทาง
        foreach ($items as $row) {
            $nfrmno = $row["NFRMNO"];
            $orgno  = $row["VORGNO"];
            $cyear  = $row["CYEAR"];
            $cyear2 = $row["CYEAR2"];
            $nrunno = $row["NRUNNO"];

            $flowRows = $this->trn->get_data_flow($nfrmno, $orgno, $cyear,  $cyear2,$nrunno, " AND CEXTDATA = '10'");

            foreach ($flowRows as $f) {
                if (!empty($f->DAPVDATE)) {
                    $dapvList[] = [
                        "DAPVDATE" => $f->DAPVDATE,
                        "NFRMNO"   => $nfrmno,
                        "VORGNO"   => $orgno,
                        "CYEAR"    => $cyear,
                        "CYEAR2"   => $cyear2,
                        "NRUNNO"   => $nrunno
                    ];
                }
            }
        }


        // ถ้าไม่มี DAPVDATE เลย → จบ
        if (empty($dapvList)) {
            echo json_encode([
                "status"  => false,
                "message" => "No DAPVDATE found for these forms"
            ]);
            return;
        }

        // หา record ที่มี DAPVDATE มากที่สุด
        $maxRow = null;
        foreach ($dapvList as $r) {
            if ($maxRow === null || $r["DAPVDATE"] > $maxRow["DAPVDATE"]) {  $maxRow = $r; }
        }

        // ===================================================================
        // 3) ใช้ฟอร์มที่มี DAPVDATE มากสุด (maxRow) ไปอัพเดต FLOW + FORM
        // ===================================================================
        // ดึง flow ของฟอร์มนั้น เฉพาะ step 19,10,13,11,14
        $flow_for_update = $this->trn->get_data_flow($maxRow["NFRMNO"],$maxRow["VORGNO"],$maxRow["CYEAR"], $maxRow["CYEAR2"], $maxRow["NRUNNO"], " AND CSTEPNO IN ('19','10','13','11','14')");

        // key สำหรับ WHERE ของฟอร์ม Cash Advance (FORM + FLOW)
        $baseWhere = [
            "NFRMNO" => $cashHead["NFRMNO"],
            "VORGNO" => $cashHead["VORGNO"],
            "CYEAR"  => $cashHead["CYEAR"],
            "CYEAR2" => $cashHead["CYEAR2"],
            "NRUNNO" => $cashHead["NRUNNO"]
        ];

        foreach ($flow_for_update as $row_flow) {
            switch ($row_flow->CSTEPNO) {
                case '19':  // JOB CONTROLLER
                    // อัปเดต FORM (หัวฟอร์ม Cash ADV) → DREQDATE / CREQTIME
                    $whereForm  = $baseWhere;
                    $dateForm   = date("d/m/Y", strtotime(str_replace('/', '-', $row_flow->DAPVDATE)));
                    $this->db->set("DREQDATE", "TO_DATE('{$dateForm}','DD/MM/YYYY')", false);
                    $dataUpdateForm = [ "CREQTIME" => $row_flow->CAPVTIME ];
                    $this->trn->update_data("FORM", $dataUpdateForm, $whereForm);

                    // สำหรับ FLOW ของ Cash ADV ใช้ step '--'
                    $targetStep = '--';
                    break;
                case '10':  // SEM
                    $targetStep = '06';
                    break;
                case '13':  // DDEM
                    $targetStep = '05';
                    break;
                case '11':  // DEM
                    $targetStep = '04';
                    break;
                case '14':  // DIM
                    $targetStep = '02';
                    break;
                default:
                    continue; // ข้าม step ที่ไม่เข้าข่าย
            }

            // 3.2 อัปเดต FLOW ของ Cash ADV ตาม step เป้าหมาย
            $whereFlow = array_merge($baseWhere, [
                "CSTEPNO" => $targetStep
            ]);

            $dateStr = date("d/m/Y", strtotime(str_replace('/', '-', $row_flow->DAPVDATE)));
            $timeStr = $row_flow->CAPVTIME;
            $dataUpdateFlow = [
                "CAPVTIME"  => $timeStr,
                "CSTEPST"   => '5',
                "VREALAPV"  => $row_flow->VREALAPV,
                "CAPVSTNO"  => $row_flow->CAPVSTNO,
            ];

            $this->db->set("DAPVDATE", "TO_DATE('{$dateStr}','DD/MM/YYYY')", false);
            $this->trn->update_data("FLOW", $dataUpdateFlow, $whereFlow);
        }

        // 3.3 set CSTEPST = 3 ให้ step สุดท้าย (CSTEPNEXTNO = '00') ของ Cash ADV
        $dataUpdateLast = ["CSTEPST" => '3'];
        $whereLast = array_merge($baseWhere, ["CSTEPNEXTNO" => '00']);
        $this->trn->update_data("FLOW", $dataUpdateLast, $whereLast);

        // ====================================================
        // 4) INSERT CASH ADVANCE HEAD + LIST
        // ====================================================
        $insert_head = array_merge($base_cash_adv, [
            "CPAYBY"   => '3',
            "CATEGORY" => 'T',
            "CURGENT"  => '0',
            "CRECBY"   => '2'
        ]);
        $this->trn->insert_data('CASHADVFORM', $insert_head);
        $insert_list = array_merge($base_cash_adv, [
            "ID"          => 1,
            "DESCRIPTION" => $cashHead["SUBJECT"],
            "NAMOUNT"     => $cashHead["SUMCOST"]
        ]);
        $this->trn->insert_data('CASHADVLIST', $insert_list);

    // UPDATE REF CASH ADVANCE TO GP_TRN_HEAD ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        $data_ref_cash = array();
        $data_main = array();
        $data_main["NFRMNO"] = $nfrmno ;
        $data_main["VORGNO"] = $orgno ;
        $data_main["CYEAR"]  = $cyear ;
        $data_main["CYEAR2"] = $cyear2 ;
        $data_main["NRUNNO"] = $nrunno ;

        // ====================================================
        // 5) (Commented) CLEAR FORM
        // ====================================================

        $clearHead = $data["clearHead"]; // ฟอร์ม clear head
        $base_clear_adv = [
            "NFRMNO" => $clearHead["NFRMNO"],
            "VORGNO" => $clearHead["VORGNO"],
            "CYEAR"  => $clearHead["CYEAR"],
            "CYEAR2" => $clearHead["CYEAR2"],
            "NRUNNO" => $clearHead["NRUNNO"]
        ];

        $insert_head_clear = array_merge($base_clear_adv, [
            "CYADV"   => $cashHead["CYEAR2"],
            "NNOADV"  => $cashHead["NRUNNO"],
            "HOLDTAX" => '0'
        ]);
        $this->trn->insert_data('CLRFORM', $insert_head_clear);

        $this->trn->delete_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNO', '61');
        $this->trn->update_flow($clearHead["NFRMNO"], $clearHead["VORGNO"], $clearHead["CYEAR"], $clearHead["CYEAR2"], $clearHead["NRUNNO"], 'CSTEPNEXTNO','06', 'CSTEPNO', '--');
        $this->trn->update_flow($clearHead["NFRMNO"], $clearHead["VORGNO"], $clearHead["CYEAR"], $clearHead["CYEAR2"], $clearHead["NRUNNO"], 'CSTEPST','3', 'CSTEPNO', '--');
        $this->trn->update_flow($clearHead["NFRMNO"], $clearHead["VORGNO"], $clearHead["CYEAR"], $clearHead["CYEAR2"], $clearHead["NRUNNO"], 'CAPVSTNO','0', 'CSTEPNO', '--');

        $this->db->trans_start(); // เริ่ม Transaction
        $update_payload = [
            "REF_CASH_CYEAR2" => $cashHead["CYEAR2"],
            "REF_CASH_NRUNNO" => $cashHead["NRUNNO"],
            "REF_CLR_CYEAR2"  => $clearHead["CYEAR2"],
            "REF_CLR_NRUNNO"  => $clearHead["NRUNNO"]
        ];

        foreach ($items as $row) {
            $where_gp = [
                "NFRMNO" => $row["NFRMNO"],
                "VORGNO" => $row["VORGNO"],
                "CYEAR"  => $row["CYEAR"],
                "CYEAR2" => $row["CYEAR2"],
                "NRUNNO" => $row["NRUNNO"],
            ];
            // อัปเดตทีเดียว 4 ฟิลด์เลย
            $this->trn->update_data("GP_TRN_HEAD", $update_payload, $where_gp);
        }
        $this->db->trans_complete(); // ยืนยันข้อมูล (ถ้าพังจะ Rollback ทั้งหมด)

        // ====================================================
        // 6) ส่งผลกลับให้ frontend
        // ====================================================
        echo json_encode([
            "status" => true,
            "items"  => $items,
            "head"   => $cashHead
        ]);
    }

    public function show_summary_report() {
        $data = $this->trn->get_data_report('');
        $data['EMPNO'] = $this->input->get('emp');
        $data['FORM_TYPE'] = $this->trn->get_training_form_mst('');
        $data['DATA_SEC'] = $this->trn->getSect();
        $data['DATA_DEPT'] = $this->trn->getDept();
        $data['DATA_DIV'] = $this->trn->getDiv();
        $this->views('gpform/GP-TRN/training_report', $data);
    }

    public function load_data() {
        $from = $this->input->get("from");
        $to = $this->input->get("to");
        $type = $this->input->get("type");
        $empno = $this->input->get("empno");
        $sec = $this->input->get("sec");
        $dept = $this->input->get("dept");
        $div = $this->input->get("div");
        $where = "";

        if ($from != "") {
            $from = str_replace("-", "", $from);
            $where .= " AND A.DATE_FROM >= '$from' ";
        }
        if ($to != "") {
            $to = str_replace("-", "", $to);
            $where .= " AND A.DATE_TO <= '$to' ";
        }
        if ($type != "") { $where .= " AND A.FID = '".$type."'";}
        if ($empno != "") { $where .= " AND D.EMPNO = '".$empno."'";}
        if ($sec != "") { $where .= " AND E.SSECCODE = '".$sec."'"; }
        if ($dept != "") { $where .= " AND E.SDEPCODE = '".$dept."'";}
        if ($div != "") { $where .= " AND E.SDIVCODE = '".$div."'";}

        $data = $this->trn->get_data_report($where);
        echo json_encode($data);
    }

    public function add_to_training_record(){
        $raw  = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            echo json_encode([
                "status"  => false,
                "message" => "Invalid JSON payload"
            ]);
            return;
        }

        $items = $data["itemsx"] ?? [];

        // start a DB transaction
        $this->training_db = $this->load->database('TRAIN', TRUE);
        $this->training_db->trans_start();

        foreach ($items as $item) {
            $mainData = $this->trn->get_main_data($item["NFRMNO"],  $item["VORGNO"], $item["CYEAR"], $item["CYEAR2"], $item["NRUNNO"]);
            $get_next_runno = $this->trn->get_traing_record();

            // --- HEAD ---
            $headData = [
                'CYEAR' => date('y'),
                'NRUNNO' => $get_next_runno[0]->NEXT_RUNNO,
                'SUBJECT' => $mainData[0]->SUBJECT,
                'DID' => '107',
                'PLCID' => '67',
                'CODEID' => 'EXTRN',
                'COST' => 0,
                'VAT' => 0
            ];

            $this->trn->insert_trainsys("TRAINHEADREC", $headData);
            // --- SCHEDULE ---
            $scheduleData = [
                'CYEAR'    => $headData["CYEAR"],
                'NRUNNO'    => $headData["NRUNNO"]
            ];

            if (!empty($mainData)) {
                $scheduleData['FRMDATE']   = $mainData[0]->DATE_FROM;
                $scheduleData['ENDDATE']   = $mainData[0]->DATE_TO;
                $scheduleData['STARTTIME'] = $mainData[0]->TIME_FROM;
                $scheduleData['ENDTIME']   = $mainData[0]->TIME_TO;
            }
            $this->trn->insert_trainsys("TRAINSCHEDULE", $scheduleData);
            $scheduleData['INSID']   = '47';
            $this->trn->insert_trainsys("DETAILINSRUCTOR", $scheduleData);

            // --- TRAINEE ---
            $trainees = $this->trn->get_trainee( $item["NFRMNO"], $item["VORGNO"], $item["CYEAR"], $item["CYEAR2"], $item["NRUNNO"]);

            foreach ($trainees as $t) {
                $traineeData = [
                    'CYEAR'    => $headData["CYEAR"],
                    'NRUNNO'    => $headData["NRUNNO"],
                    'SEMPNO'    => $t->EMPNO,
                    'CSTATUS'    => '1',
                    'ADD_DATE' => date("Y-m-d")
                ];

                $this->trn->insert_trainsys("TRAINEEREC", $traineeData);
            }
        }

        // commit / rollback
        $this->training_db->trans_complete();
        if ($this->training_db->trans_status() === false) {
            echo json_encode([
                "status"  => false,
                "message" => "Insert failed"
            ]);
        } else {
            echo json_encode([
                "status"  => true,
                "message" => "Insert success"
            ]);
        }
    }


}