<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';

class Trainingreport extends MY_Controller {
    use _Form, _File;
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->load->model('gpform/GP-TRN/training_model', 'trn');
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPTRN/";
        $this->upload_path_report = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPTRNRP/";

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
        $data['data_head']  = $this->trn->get_data_trnrp_head($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $data['data_attach_report']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_ATT', 'ID', ['TYPE_ATT' => 'REPORT']);
        $data['data_attach_report_other']  = $this->trn->select_all_by_tb($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, 'GP_TRN_ATT', 'ID', ['TYPE_ATT' => 'REPORT_OTHER']);
        $data['chk_attach_report'] = !empty($data['data_attach_report']) ? 'yes' : 'no';
        $data['ref_formno'] =  $this->toFormNumber( $data['data_head'][0]->REF_NFRMNO, $data['data_head'][0]->REF_VORGNO, $data['data_head'][0]->REF_CYEAR, $data['data_head'][0]->REF_CYEAR2, $data['data_head'][0]->REF_NRUNNO);
        $this->views('gpform/GP-TRNRP/training_report_view', $data);  
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

            $result = $this->trn->update_data_report($frmno, $orgno, $cyear, $cyear2, $nrunno, 'req',$content, $apply);
        } catch (Exception $e) {
            echo json_encode(['status' => false, 'message' => $e->getMessage()]);
        }
    }

    public function handle_trnrp() {
        header('Content-Type: application/json; charset=utf-8');
        $mode   = $this->input->post('mode');
        $frmno  = $this->input->post('frmno');
        $orgno  = $this->input->post('orgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');
        $exdata = $this->input->post('exdata');
        $formno =  $this->toFormNumber($frmno, $orgno, $cyear, $cyear2, $nrunno);
        $base = [
                'NFRMNO' => $frmno,
                'VORGNO' => $orgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ];
        try {
            /* ============================================================
            *  MODE 1 : UPLOAD FILE (ตำแหน่ง >= 55 to <= 69)
            * ============================================================ */
            if ($mode === "upload") {
                if (empty($_FILES['txt_trn_att']['name'][0])) {
                    echo json_encode(['status' => false, 'message' => 'No file uploaded']);
                    return;
                }

                $dest = rtrim($this->upload_path_report, '/\\') . '/' . $formno . '/';
                if (!is_dir($dest)) { mkdir($dest, 0777, true);}

                // อัปโหลดทั้งหมด
                $uploadedList = $this->uploadMultiFile($_FILES,['txt_trn_att'],$dest);

                // ถ้า upload fail ทั้งหมด
                if (!$uploadedList['status']) {
                    echo json_encode([
                        'status'  => false,
                        'message' => $uploadedList['msg']
                    ]);
                    return;
                }
                $this->insert_and_upload("GP_TRN_ATT", $base, $uploadedList['files']['txt_trn_att'], "REPORT", $formno, $dest);

                if (isset($_FILES['txt_trn_att_other'])) {
                    $uploadedList = $this->uploadMultiFile($_FILES, ['txt_trn_att_other'], $dest);
                    $this->insert_and_upload("GP_TRN_ATT", $base, $uploadedList['files']['txt_trn_att_other'], "REPORT_OTHER", $formno, $dest);
                }

                echo json_encode(['status' => true, 'message' => 'Update successfully']);
                return;
            }else if ($mode === "update_only") {
            /* ============================================================
            *  MODE 2 : UPDATE ONLY (CONTENT + APPLY)
            * ============================================================ */
                $content = $this->input->post('content');
                $apply   = $this->input->post('apply');

                $result = $this->trn->update_data_report($frmno, $orgno, $cyear, $cyear2, $nrunno, 'req', $content, $apply);

                if (!$result['status']) {
                    echo json_encode($result);
                    return;
                }

                // ✅ เช็คว่ามีไฟล์จริงไหมก่อน
                if ( isset($_FILES['txt_trn_att_other'])) {
                    $dest = rtrim($this->upload_path_report, '/\\') . '/' . $formno . '/';
                    if (!is_dir($dest)) { mkdir($dest, 0777, true); }
                    $uploadedList = $this->uploadMultiFile($_FILES, ['txt_trn_att_other'], $dest);

                    if (!$uploadedList['status']) {
                        echo json_encode($uploadedList);
                        return;
                    }

                    $this->insert_and_upload("GP_TRN_ATT", $base, $uploadedList['files']['txt_trn_att_other'], "REPORT_OTHER", $formno, $dest);
                }

                echo json_encode(['status' => true, 'message' => 'Update successfully']);
                return;
            }else if ($mode === "manager_score") {
                $score = $this->input->post('score');
                $comment   = $this->input->post('comment');
                $result = $this->trn->update_data_report($frmno, $orgno, $cyear, $cyear2, $nrunno, 'manager', $score, $comment );
                echo json_encode($result);
                return;
            }

            echo json_encode(['status' => false, 'message' => 'Invalid mode']);

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
            $orig_name = $f['file_origin_name'] ?? '';
            $real_name = $f['file_name'] ?? '';

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
        $filepath = $this->upload_path_report."/".$formno;
        $this->downloadFile($origin_name, $filename, $filepath);
    }

    public function update_flow_after_3month(){
        $nfrmno = '2';
        $vorgno = '030101';
        $cyear = '26';
        
        $get_form_3month = $this->trn->get_3month_train_report($nfrmno, $vorgno, $cyear);
        //$get_form_3month = $this->trn->get_3month_train_report_for_test($nfrmno, $vorgno, $cyear, $cyear2, '15');
        print_r($get_form_3month);
        foreach($get_form_3month as $val){
            echo $val->CYEAR2."_".$val->NRUNNO."<br>";
            $nrunno = $val->NRUNNO;
            $cyear2 = $val->CYEAR2;
            $where_form = [
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ];
            $data_update_form = ['CST' => 1];
            $result = $this->trn->update_data('FORM', $data_update_form, $where_form);

            //--- update flow ---
            $where_flow = [
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'CEXTDATA' => '01'
            ];
            $data_update_flow = [ 'CSTEPNEXTNO' => '18'];
            $result = $this->trn->update_data('FLOW', $data_update_flow, $where_flow);
            
            $ref_vurl = "http://".$this->_servername().".mitsubishielevatorasia.co.th/form/gpform/GP-TRNRP/trainingreport?sr=1";
            $data_add_flow = [
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $val->CYEAR2,
                'NRUNNO' => $val->NRUNNO,
                'CSTEPNO'     => '18',
                'CSTEPNEXTNO' => '19',
                'CSTART'      => '0',
                'CSTEPST'     => '3',
                'CTYPE'       => '3',
                'VPOSNO'      => null,
                'VAPVNO'      => $val->VAPVNO,
                'VREPNO'      => $val->VREPNO,
                'VREALAPV'    => null,
                'CAPVSTNO'    => '0',
                'DAPVDATE'    => null,
                'CAPVTIME'    => null,
                'CEXTDATA'    => '02',
                'CAPVTYPE'    => '1',
                'CREJTYPE'    => null,
                'CAPPLYALL'   => '0',
                'VURL'        => $ref_vurl,
                'VREMARK'     => null,
                'VREMOTE'     => null
            ];
            $result = $this->trn->insert_data('FLOW', $data_add_flow);

            //inset flow Job controller
            $data_add_flow['CSTEPNO'] = '19';
            $data_add_flow['CSTEPNEXTNO'] = '00';
            $data_add_flow['CSTEPST'] = '2';
            $data_add_flow['VAPVNO'] = '01027'; 
            $data_add_flow['VREPNO'] = '14001';
            $data_add_flow['CEXTDATA'] = '03';
            $result = $this->trn->insert_data('FLOW', $data_add_flow);
            echo "insert flow successful !!";
        }
           
    }


}
