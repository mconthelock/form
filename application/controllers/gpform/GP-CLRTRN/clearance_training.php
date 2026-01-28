<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';

class clearance_training extends MY_Controller {
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
        $data['formno'] =  $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $data['exdata'] =  $this->getExtData($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
        $data['form'] = $this->form->getForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $data['data_head']  = $this->trn->get_data_clrtrn_head($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $data['ref_formno'] =  $this->toFormNumber( $data['data_head'][0]->REF_NFRMNO, $data['data_head'][0]->REF_VORGNO, $data['data_head'][0]->REF_CYEAR, $data['data_head'][0]->REF_CYEAR2, $data['data_head'][0]->REF_NRUNNO);
        $this->views('gpform/GP-CLRTRN/clearance_training_view', $data);  
    }

    public function update_data_trnrp(){
      header('Content-Type: application/json; charset=utf-8');
        $frmno   = $this->input->post('frmno');
        $orgno   = $this->input->post('orgno');
        $cyear   = $this->input->post('cyear');
        $cyear2  = $this->input->post('cyear2');
        $nrunno  = $this->input->post('nrunno');
        $content = $this->input->post('content');
        $apply   = $this->input->post('apply'); 

        try {
            if (!$content || !$apply) {
                echo json_encode(['status' => false, 'message' => 'Missing date']);
                return;
            }

            $result = $this->trn->update_data_report($frmno, $orgno, $cyear, $cyear2, $nrunno, $content, $apply);
        } catch (Exception $e) {
            echo json_encode(['status' => false, 'message' => $e->getMessage()]);
        }
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
            'SPOSCODE'      => $data[0]->SPOSCODE
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
            'SPOSCODE'      => $data[0]->SPOSCODE
        ]);
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

    public function insert_and_upload($table, $base, $files, $type, $formno, $dest_path) {
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

                // ✅ Insert ลงฐานข้อมูล
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


}
