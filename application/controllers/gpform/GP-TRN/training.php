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
        $this->upload_path = "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPTRN/";
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
            $data['mode'] = $this->getMode($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
            $data['form'] = $this->form->getForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['data_head']  = $this->trn->get_main_data($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['data_trainee']  = $this->trn->get_trainee($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['data_purpose']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_PURPOSE', 'PID');
            $data['data_benefit']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_BENEFIT', 'BID');
            $data['data_attach_compare']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_ATT', 'ID', ['TYPE_ATT' => 'COMPARE']);
            if( $data['data_head'][0]->FID == '1'){
                $data['data_attach_jd']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_ATT', 'ID', ['TYPE_ATT' => 'JD']);
            }
        
            $data['data_attach_compare']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_ATT', 'ID', ['TYPE_ATT' => 'COMPARE']);
            $this->views('gpform/GP-TRN/training_view', $data);
        }
    }

    public function get_emp() {
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
            'SNAME'     => $data[0]->SNAME,
            'SPOSITION' => $data[0]->SPOSITION,
            'SSEC'      => $data[0]->SSEC,
            'SDEPT'     => $data[0]->SDEPT,
            'SDIV'      => $data[0]->SDIV
        ]);
    }


    public function save_formcreate(){
        header('Content-Type: application/json; charset=utf-8');
        try {
            // ✅ รับค่าจาก FormData (multipart/form-data)
            $data = $this->input->post();
            
            if (empty($data)) {
                echo json_encode(["status" => "error", "message" => "No POST data received"]);
                return;
            }

            //Update Flow Training Officer  01027/14001
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VAPVNO', '01027', 'CEXTDATA', '04');
            $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'VREPNO', '14001', 'CEXTDATA', '04');

            $formno = $this->toFormNumber($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"]);
            $reason = $data["TRN_EXPENSE_REASON"] ?? "";
            $cost   = $data["COST"] ?? 0;
            if (strtolower($reason) === "free") {
                $cost = 0;
            }
            $insert = [
                "NFRMNO" => $data["NFRMNO"] ?? null,
                "VORGNO" => $data["VORGNO"] ?? null,
                "CYEAR"  => $data["CYEAR"] ?? null,
                "CYEAR2" => $data["CYEAR2"] ?? null,
                "NRUNNO" => $data["NRUNNO"] ?? null,
                "FID"    => $data["FID"] ?? null,
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
                "LAWS" => $data["LAWS"] ?? ""
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
            ];

            if (!isset($map[$prefix])) {throw new Exception("Unknown training form prefix: ".$prefix);}
            $this->insertListData("GP_TRN_PURPOSE", $base, $data, "PID", "PURPOSE", $data[$map[$prefix]["obj"]]);
            $this->insertListData("GP_TRN_BENEFIT", $base, $data, "BID", "BENEFIT", $data[$map[$prefix]["exp"]]);


            $dest_path = $this->upload_path.$formno;
            if (!is_dir($dest_path)) {mkdir($dest_path, 0777, true);}
            // ✅ Upload JD Files (มีเฉพาะ functional)
            if ($prefix === "func" && !empty($_FILES['funcJdFiles']['name'][0])) {
                foreach ($_FILES['funcJdFiles']['name'] as $i => $name) {
                    $_FILES['funcJdFiles']['name'][$i] = preg_replace('/[^A-Za-z0-9._-]/', '_', $name);
                }
                $uploaded_jd = $this->uploadMultiFile($_FILES, ['funcJdFiles'], $dest_path);
                if ($uploaded_jd['status'] && !empty($uploaded_jd['files']['funcJdFiles'])) {
                    $filenames = array_column($uploaded_jd['files']['funcJdFiles'], 'file_name');
                    $this->insert_and_upload("GP_TRN_ATT", $base, $filenames, 'JD');
                }
            }

            // ✅ Upload Compare Files (ทุกฟอร์มใช้ได้)
            if (!empty($_FILES[$prefix.'CompareFiles']['name'][0])) {
                foreach ($_FILES[$prefix.'CompareFiles']['name'] as $i => $name) {
                    $_FILES[$prefix.'CompareFiles']['name'][$i] = preg_replace('/[^A-Za-z0-9._-]/', '_', $name);
                }
                $uploaded_compare = $this->uploadMultiFile($_FILES, [$prefix.'CompareFiles'], $dest_path);
                if ($uploaded_compare['status'] && !empty($uploaded_compare['files'][$prefix.'CompareFiles'])) {
                    $filenames = array_column($uploaded_compare['files'][$prefix.'CompareFiles'], 'file_name');
                    $this->insert_and_upload("GP_TRN_ATT", $base, $filenames, 'COMPARE');
                }
            }

            // ✅ Insert Trainee
            // อ่านค่ารหัสพนักงานจาก form (จะได้เป็น array หรือ string)
            $traineeCodes = $this->input->post('TRAINEE_ID');

            // ถ้าเป็น string เดียวให้แปลงเป็น array เพื่อวน loop ได้เหมือนกัน
            if (!empty($traineeCodes) && !is_array($traineeCodes)) {
                $traineeCodes = [$traineeCodes];
            }

            // ถ้ามีข้อมูลจริง
            if (!empty($traineeCodes)) {
                foreach ($traineeCodes as $code) {
                    if (trim($code) !== "") {
                        $arr_trainee = $base;
                        $arr_trainee['EMPNO']    = $code;
                        $arr_trainee['JD_NAME']  = $data["JD_NAME"] ?? "";
                        $arr_trainee['JD_DESC']  = $data["JD_DESC"] ?? "";
                        $this->trn->insert_data("GP_TRN_TRAINEE", $arr_trainee);
                    }
                }
            }

            //Update flow 
            if($prefix == 'meth'){
                $where = " AND CSTEPNO = '--'";
                $get_first_step = $this->trn->get_data_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], $where);
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNEXTNO', '10', 'CSTEPNEXTNO', '52');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNEXTNO', '52', 'CSTEPNO', '--');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNEXTNO', $get_first_step[0]->CSTEPNEXTNO, 'CSTEPNO', '52');

                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '3', 'CSTEPNO', '52');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '1', 'CSTEPST', '2');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '2', 'CSTEPNO', $get_first_step[0]->CSTEPNEXTNO);
            }else if($prefix == 'legal'){
                $this->trn->delete_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNO', '06');
                $this->trn->delete_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNO', '04');
                $this->trn->delete_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNO', '02');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPNEXTNO', '52', 'CSTEPNO', '--');

                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '3', 'CSTEPNO', '52');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '1', 'CSTEPST', '2');
                $this->trn->update_flow($data["NFRMNO"], $data["VORGNO"], $data["CYEAR"], $data["CYEAR2"], $data["NRUNNO"], 'CSTEPST', '2', 'CSTEPNO', '10');
            }

            echo json_encode(["status" => "success", "message" => "Insert successful", "received" => $data]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }

    private function insertListData($table, $base, $data, $fieldId, $fieldName, $values) {
        if (empty($values) || !is_array($values)) return;
        $no = 1;
        foreach ($values as $val) {
            if (trim($val) !== "") {
                $row = $base;
                $row[$fieldId]   = $no;
                $row[$fieldName] = $val;
                $this->trn->insert_data($table, $row);
                $no++;
            }
        }
    }

    public function insert_and_upload($table, $base,  $file, $type) {
        $no = 1;
        foreach ($file as $val) {
            if (trim($val) !== "") {
                $row = $base;
                $row['ID'] = $no;
                $row['FILENAME'] = $val;
                $row['TYPE_ATT'] = $type;
                $this->trn->insert_data($table, $row);
                $no++;
            }
        }
    }
    
     public function preview_file($filename)
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

}
