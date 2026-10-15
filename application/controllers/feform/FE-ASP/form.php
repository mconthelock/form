<?php
use GuzzleHttp\Client;

defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/api/webform/form.php';
require_once APPPATH . 'controllers/api/webform/flow.php';
require_once APPPATH . 'controllers/api/webform/formmst.php';
require_once APPPATH . 'controllers/_file.php';

class Form extends MY_Controller {
    use formApi, flow, formmst;

    public function __construct() {
        parent::__construct();
        $this->client = new Client(['verify' => false]);
        $this->load->library('Mail');
        $this->load->model('form_model', 'frm');
        $this->load->model('feform/FE-ASP/Fe_asp_model', 'MainModel');

        $this->host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'amecweb';
        
        $isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') 
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

        $this->http = "http" . ($isHttps ? "s" : "");
        
        $this->SmmtBase    = 'SMMT';    // SMMT: FE_ASP_HEADER, FE_ASP_CONTROL_MST, FE_ASP_TOPIC_MST, FE_ASP_CONFIRMATION_DTL
        $this->webflowBase = 'DEFAULT'; // DEFAULT: FORM, FLOW, FE_FILE, AMECUSERALL
    }
    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1

    // === http://localhost:8080/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === http://localhost:8080/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=2&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList.asp&menu=1
 
    public function main() {
        $empno          = $this->input->get('empno') ?? '';
        $data['CYEAR2'] = $this->input->get('y2') ?? '';
        $data['NRUNNO'] = $this->input->get('runNo') ?? '';
        $data['EMPNO']  = (string)$empno;

        $initEmp = !empty($empno) ? $this->MainModel->getEmpName($empno) : ['empno' => '', 'name' => ''];
        $data['REQBY_EMPNO']   = $initEmp['empno'];
        $data['REQBY_NAME']    = $initEmp['name'];
        $data['INPUTBY_EMPNO'] = $initEmp['empno'];
        $data['INPUTBY_NAME']  = $initEmp['name'];

        // ค่าเริ่มต้น Header
        $data['DOC_HEADER_ID']    = '';
        $data['DOC_NO']           = '';
        $data['CONTROL_NO']       = '';
        $data['REVIEW_PERIOD']    = 'CHANGING';
        $data['REVIEW_DETAILS']   = 'NO_CHANGE';
        $data['DETAIL_OF_CHANGE'] = '';
        $data['EFFECT_STATUS']    = 'NO_EFFECT';
        $data['STATUS']           = '';
        $data['CREATE_MODE']      = 'MANUAL';
        $data['IS_AUTO_JOB']      = 'N';
        $data['REMARK']           = '';
        $data['CST']              = '';

        $reqBy = !empty($data['REQBY_EMPNO']) ? $data['REQBY_EMPNO'] : $empno;

        // 1. ดึงข้อมูล Org เริ่มต้นของผู้จัดทำ
        $userOrg = $this->MainModel->getUserOrgSnapshot($reqBy);
        $data['REQBY_NAME']    = $userOrg['SNAME'] ?? $data['REQBY_NAME'];
        $data['SDIVCODE']      = $userOrg['SDIVCODE'] ?? '';
        $data['DIVISION_NAME'] = $userOrg['SDIV'] ?? '';
        $data['SDEPCODE']      = $userOrg['SDEPCODE'] ?? '';
        $data['SSECCODE']      = $userOrg['SSECCODE'] ?? '00';

        $data['prevApprovedFile'] = null;
        $data['savedDetails']     = [];
        $data['attachedFiles']    = [];

        // Webflow Keys
        if ($this->input->get('no') !== null) {
            $data['NFRMNO'] = $this->input->get('no');
            $data['VORGNO'] = $this->input->get('orgNo');
            $data['CYEAR']  = $this->input->get('y');
        } else {
            $formMst        = $this->getFormMasterByVaname('FE-ASP');
            $data['NFRMNO'] = $formMst['data']['NNO'] ?? $formMst[0]->NNO;
            $data['VORGNO'] = $formMst['data']['VORGNO'] ?? $formMst[0]->VORGNO;
            $data['CYEAR']  = $formMst['data']['CYEAR'] ?? $formMst[0]->CYEAR;
        }

        // โหมด View / Edit: นำข้อมูล Snapshot จาก Header เดิมมาแทนที่
        if (!empty($data['NRUNNO'])) {
            $header = $this->MainModel->getHeaderByKeys($data);
            if ($header) {
                $data['DOC_HEADER_ID']    = $header->HEADER_ID;
                $data['DOC_NO']           = $header->DOC_NO;
                $data['CONTROL_NO']       = $header->CONTROL_NO;
                $data['SDIVCODE']         = $header->SDIVCODE;
                $data['SDEPCODE']         = $header->SDEPCODE;
                $data['SSECCODE']         = $header->SSECCODE;
                $data['REVIEW_PERIOD']    = $header->REVIEW_PERIOD;
                $data['REVIEW_DETAILS']   = $header->REVIEW_DETAILS;
                $data['DETAIL_OF_CHANGE'] = $header->DETAIL_OF_CHANGE;
                $data['EFFECT_STATUS']    = $header->EFFECT_STATUS;
                $data['STATUS']           = $header->STATUS;
                $data['CREATE_MODE']      = $header->CREATE_MODE;
                $data['IS_AUTO_JOB']      = $header->IS_AUTO_JOB;
                $data['REMARK']           = $header->REMARK;

                $ctrl = $this->MainModel->getControlMasterInfo($header->CONTROL_NO);
                $data['DIVISION_NAME']    = $ctrl['DIVISION_NAME'] ?? '';
                $data['prevApprovedFile'] = $this->MainModel->getLatestApprovedFile($header->CONTROL_NO);
                $data['savedDetails']     = $this->MainModel->getConfirmationDetailsByHeaderId($header->HEADER_ID);
            }

            $detailform = $this->frm->getForm((int)$data['NFRMNO'], (string)$data['VORGNO'], (string)$data['CYEAR'], (string)$data['CYEAR2'], (int)$data['NRUNNO']);
            $reqEmp   = $this->MainModel->getEmpName($detailform[0]->VREQNO ?? ($header->REQ_BY ?? ''));
            $inputEmp = $this->MainModel->getEmpName($detailform[0]->VINPUTER ?? ($header->INPUT_BY ?? ''));

            $data['REQBY_EMPNO']   = $reqEmp['empno'];
            $data['REQBY_NAME']    = $reqEmp['name'];
            $data['INPUTBY_EMPNO'] = $inputEmp['empno'];
            $data['INPUTBY_NAME']  = $inputEmp['name'];
            $data['CST']           = $detailform[0]->CST ?? '';

            $dbWebflow = $this->load->database($this->webflowBase, TRUE);
            $data['attachedFiles'] = $dbWebflow->where([
                'NFRMNO' => (int)$data['NFRMNO'],
                'VORGNO' => (string)$data['VORGNO'],
                'CYEAR2' => (string)$data['CYEAR2'],
                'NRUNNO' => (int)$data['NRUNNO'],
            ])->get('FE_FILE')->result();
        }

        // เตรียม Dropdown แผนกและส่วนงาน
        $data['departments'] = !empty($data['SDIVCODE']) ? $this->MainModel->getDepartmentsByDiv($data['SDIVCODE']) : [];
        $data['sections']    = !empty($data['SDEPCODE']) ? $this->MainModel->getSectionsByDept($data['SDEPCODE']) : [];

        // กรองรายการ Control Number ตามสิทธิ์
        $data['controls'] = $this->MainModel->getAllActiveControls($data['REQBY_EMPNO'], $data['SDIVCODE']);
        $data['topics']   = $this->MainModel->getActiveTopics();

        // 🟢 เพิ่มตรงนี้: กรณีสร้างเอกสารใหม่ (ยังไม่มี NRUNNO) ให้ Default Control No. แรกและดึงไฟล์ Approved ล่าสุดทันที
        if (empty($data['NRUNNO']) && !empty($data['controls']) && is_array($data['controls'])) {
            $defaultCtrl = $data['controls'][0];
            $data['CONTROL_NO']       = $defaultCtrl['CONTROL_NO'];
            $data['prevApprovedFile'] = $this->MainModel->getLatestApprovedFile($defaultCtrl['CONTROL_NO']);
        }

        // สิทธิ์การใช้งาน
        $data['isAdmin']      = $this->MainModel->isFormAdmin('FE-ASP', $data['EMPNO']);
        $data['isSuperAdmin'] = ($data['EMPNO'] === '13204');

        // ตรวจสอบว่า Step แรก Approve แล้วหรือยัง
        $data['isFirstStepApproved'] = false;
        if (!empty($data['NRUNNO'])) {
            $data['isFirstStepApproved'] = $this->MainModel->isFirstStepApproved(
                $data['NFRMNO'],
                $data['VORGNO'],
                $data['CYEAR'],
                $data['CYEAR2'],
                $data['NRUNNO']
            );
        }

        // สถานะล็อกฟอร์ม: Step 1 ผ่านแล้ว และไม่ใช่รหัส 13204
        $data['isLocked'] = $data['isFirstStepApproved'] && !$data['isSuperAdmin'];

        $this->views('feform/FE-ASP/form', $data);
    }
    /**
     * ดึงข้อมูล Full Context ครบวงจรเมื่อระบุรหัสพนักงาน (ยิงรอบเดียวจบ)
     * คืนค่า: ข้อมูลพนักงาน, Org, Department List, Section List, Control List, Default Control และไฟล์ PDF Revision ล่าสุด
     */
    public function ajaxGetEmpFullContext() {
        $this->output->set_content_type('application/json');
        try {
            $empno = trim($this->input->get('empno') ?? '');
            if (empty($empno)) {
                throw new Exception('กรุณาระบุรหัสพนักงาน');
            }

            // 1. ดึงข้อมูล User Org Snapshot
            $userOrg = $this->MainModel->getUserOrgSnapshot($empno);
            if (empty($userOrg)) {
                return $this->output->set_output(json_encode([
                    'status'  => false,
                    'message' => 'ไม่พบข้อมูลพนักงาน'
                ]));
            }

            $divCode = $userOrg['SDIVCODE'] ?? '';
            $depCode = $userOrg['SDEPCODE'] ?? '';
            $secCode = $userOrg['SSECCODE'] ?? '00';

            // 2. ดึง Master Dropdown ของฝ่ายและแผนก
            $departments = !empty($divCode) ? $this->MainModel->getDepartmentsByDiv($divCode) : [];
            $sections    = !empty($depCode) ? $this->MainModel->getSectionsByDept($depCode) : [];

            // 3. ดึงรายการ Controls ทั้งหมดตามสิทธิ์
            $controls = $this->MainModel->getAllActiveControls($empno, $divCode);

            // 4. เลือก Control No. แรกเป็นค่าเริ่มต้น (ถ้ามี)
            $defaultControl = null;
            $prevFile = null;
            if (!empty($controls) && is_array($controls)) {
                $defaultControl = $controls[0]; // หยิบ Control แรกขึ้นมา
                // 5. ดึงไฟล์ Revision ล่าสุดของ Control นั้นมาพร้อมกันทันที
                $prevFile = $this->MainModel->getLatestApprovedFile($defaultControl['CONTROL_NO']);
            }

            return $this->output->set_output(json_encode([
                'status'         => true,
                'emp'            => [
                    'empno'   => $empno,
                    'name'    => $userOrg['SNAME'] ?? '',
                    'divCode' => $divCode,
                    'divName' => $userOrg['SDIV'] ?? '',
                    'depCode' => $depCode,
                    'secCode' => $secCode
                ],
                'departments'    => $departments ?: [],
                'sections'       => $sections ?: [],
                'controls'       => $controls ?: [],
                'defaultControl' => $defaultControl,
                'prevFile'       => $prevFile ?: null
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }
    /**
     * ดึงสังกัดเริ่มต้นของพนักงาน (เมื่อมีการเปลี่ยน Request By ในหน้าจอ)
     */
    public function ajaxGetUserOrg() {
        $empno = trim($this->input->get('empno') ?? '');
        $org   = $this->MainModel->getUserOrgSnapshot($empno);
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status' => !empty($org),
                'org'    => $org ?: null
            ]));
    }

    public function ajaxGetEmpName() {
        $empno = trim($this->input->get('empno') ?? '');
        $res   = $this->MainModel->getEmpName($empno);

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status' => !empty($res['name']),
                'name'   => $res['name'] ?? ''
            ]));
    }

    
    /**
     * AJAX ดึงรายการ Control No. ตามรหัสพนักงาน Request By
     */
    public function ajaxGetControlsByEmp() {
        $empno = trim($this->input->get('empno') ?? '');
        $userOrg = $this->MainModel->getUserOrgSnapshot($empno);
        $divCode = $userOrg['SDIVCODE'] ?? '';

        $controls = $this->MainModel->getAllActiveControls($empno, $divCode);

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status'   => true,
                'divCode'  => $divCode,
                'divName'  => $userOrg['SDIV'] ?? '',
                'controls' => $controls ?: []
            ]));
    }
    /**
     * ดึงข้อมูล Control และ Active Revision PDF
     */
    public function GetControlInfo() {
        $controlNo      = trim($this->input->get('controlNo') ?? '');
        $currentDepCode = trim($this->input->get('depCode') ?? '');
        $currentSecCode = trim($this->input->get('secCode') ?? '');
        
        // 1. ดึง Master Info ของ Control
        $control = $this->MainModel->getControlMasterInfo($controlNo);

        $divCode = $control['SDIVCODE'] ?? '';

        // 2. ดึง Department ตาม Division ของ Control
        $departments = [];
        if (!empty($divCode)) {
            $departments = $this->MainModel->getDepartmentsByDiv($divCode);
        }

        // 3. ดึง Sections: ให้ใช้ depCode ปัจจุบันของ Emp เพื่อไม่ให้ Section หลุดหาย
        $sections = [];
        $targetDepCode = !empty($currentDepCode) ? $currentDepCode : ($control['SDEPCODE'] ?? '');
        if (!empty($targetDepCode)) {
            $sections = $this->MainModel->getSectionsByDept($targetDepCode);
        }

        // 4. ดึงไฟล์ Revision ล่าสุดที่ผ่าน Approve
        $prevFile = $this->MainModel->getLatestApprovedFile($controlNo);

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status'         => true,
                'control'        => $control ?: null,
                'departments'    => $departments ?: [],
                'sections'       => $sections ?: [],
                'keepDept'       => $currentDepCode, // ส่งกลับไปยืนยัน
                'keepSec'        => $currentSecCode,
                'prevFile'       => $prevFile ?: null
            ]));
    }
    /**
     * AJAX โหลด Department เมื่อ Division เปลี่ยน
     */
    public function ajaxGetDepartments() {
        $divCode = $this->input->get('divCode');
        $depts = $this->MainModel->getDepartmentsByDiv($divCode);
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode(['status' => true, 'data' => $depts ?: []]));
    }

    /**
     * AJAX โหลด Section เมื่อ Department เปลี่ยน
     */
    public function ajaxGetSections() {
        $depCode = $this->input->get('depCode');
        $secs = $this->MainModel->getSectionsByDept($depCode);
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode(['status' => true, 'data' => $secs ?: []]));
    }


    /**
     * บันทึกเอกสาร (Save Draft & Submit)
     */
    public function SaveDocMaster() {
        $this->output->set_content_type('application/json');
        try {
            $headerId      = $this->input->post('DOC_HEADER_ID');
            $controlNo     = trim((string)$this->input->post('CONTROL_NO'));
            $sDivCode      = trim((string)$this->input->post('SDIVCODE'));
            $sDepCode      = trim((string)$this->input->post('SDEPCODE'));
            $sSecCode      = trim((string)$this->input->post('SSECCODE')) ?: '00';
            $reviewPeriod  = trim((string)$this->input->post('REVIEW_PERIOD'));
            $reviewDetails = trim((string)$this->input->post('REVIEW_DETAILS'));
            $detailChange  = trim((string)$this->input->post('DETAIL_OF_CHANGE'));
            $effectStatus  = trim((string)$this->input->post('EFFECT_STATUS'));
            $topicsJson    = $this->input->post('TOPICS_JSON');
            $remark        = trim((string)($this->input->post('REMARK') ?? ''));
            $reqByPost     = trim((string)$this->input->post('REQBY'));
            $empNoPost     = trim((string)$this->input->post('EMPNO'));
            $isDraft       = $this->input->post('IS_DRAFT') === '1';
            $isSuperAdmin = ($empNoPost === '13204');

            $currentEmpNo = !empty($reqByPost) ? $reqByPost : (!empty($empNoPost) ? $empNoPost : ($this->session->userdata('empno') ?? ''));



            // --- ตรวจสอบสิทธิ์การแก้ไข (ห้ามแก้ถ้า Step 1 Approve แล้ว ยกเว้น 13204 หรือ Admin) ---
            if (!empty($nrunno)) {
                $isApproved = $this->MainModel->isFirstStepApproved($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
                if ($isApproved) {
                    throw new Exception("เอกสารนี้เข้าสู่กระบวนการอนุมัติแล้ว ไม่อนุญาตให้แก้ไขข้อมูล หากต้องการแก้ไขกรุณาให้ผู้อนุมัติกด Return เอกสาร");
                }
            }




            if (empty($controlNo)) throw new Exception("กรุณาเลือก Control No.");
            if (empty($sDepCode))  throw new Exception("กรุณาระบุ Department");

            $this->db->trans_begin();
            $isCreateNew = empty($headerId) && empty($this->input->post('NRUNNO'));

            if ($isCreateNew) {
                $formMst  = $this->getFormMasterByVaname('FE-ASP');
                $formData = $formMst['data'];

                $flowData = [
                    'NFRMNO'  => $formData['NNO'],
                    'VORGNO'  => $formData['VORGNO'],
                    'CYEAR'   => $formData['CYEAR'],
                    'REQBY'   => $currentEmpNo,
                    'INPUTBY' => !empty($empNoPost) ? $empNoPost : $currentEmpNo,
                    'REMARK'  => $remark ?: $detailChange,
                    'DRAFT'   => $isDraft ? '1' : '0'  // '0' = ส่งสร้างโฟลว์อนุมัติทันที, '1' = ดราฟต์ไว้ก่อน
                ];

                $rsf = $this->createForm($flowData);
                if (!$rsf || empty($rsf['status'])) {
                    throw new Exception("สร้างเอกสาร Webflow ไม่สำเร็จ: " . ($rsf['message'] ?? ''));
                }

                $cyear2 = $rsf['data']['CYEAR2'];
                $nrunno = $rsf['data']['NRUNNO'];
                $docNo  = "FE-ASP-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);

                $headerData = [
                    'DOC_NO'           => $docNo,
                    'CONTROL_NO'       => $controlNo,
                    'SDIVCODE'         => $sDivCode,
                    'SDEPCODE'         => $sDepCode,
                    'SSECCODE'         => $sSecCode,
                    'NFRMNO'           => $formData['NNO'],
                    'VORGNO'           => $formData['VORGNO'],
                    'CYEAR'            => $formData['CYEAR'],
                    'CYEAR2'           => $cyear2,
                    'NRUNNO'           => $nrunno,
                    'REQ_BY'           => $currentEmpNo,
                    'INPUT_BY'         => !empty($empNoPost) ? $empNoPost : $currentEmpNo,
                    'REVIEW_PERIOD'    => $reviewPeriod,
                    'REVIEW_DETAILS'   => $reviewDetails,
                    'DETAIL_OF_CHANGE' => $detailChange,
                    'EFFECT_STATUS'    => $effectStatus,
                    'STATUS'           => $isDraft ? 'DRAFT' : 'PROCESS',
                    'CREATE_MODE'      => 'MANUAL',
                    'IS_AUTO_JOB'      => 'N',
                    'USER_ACTION'      => $currentEmpNo,
                    'REMARK'           => $remark,
                ];

                $headerId = $this->MainModel->insertHeader($headerData);
            } else {
                $cyear2 = $this->input->post('CYEAR2');
                $nrunno = $this->input->post('NRUNNO');
                $docNo  = $this->input->post('DOC_NO');

                $updateData = [
                    'CONTROL_NO'       => $controlNo,
                    'SDIVCODE'         => $sDivCode,
                    'SDEPCODE'         => $sDepCode,
                    'SSECCODE'         => $sSecCode,
                    'REVIEW_PERIOD'    => $reviewPeriod,
                    'REVIEW_DETAILS'   => $reviewDetails,
                    'DETAIL_OF_CHANGE' => $detailChange,
                    'EFFECT_STATUS'    => $effectStatus,
                    'REMARK'           => $remark,
                    'USER_ACTION'      => $currentEmpNo,
                    'STATUS'           => $isDraft ? 'DRAFT' : 'PROCESS',
                ];
                $this->MainModel->updateHeader($headerId, $updateData);
            }

            // คำตอบตารางเขียว
            if (!empty($topicsJson)) {
                $topics = json_decode($topicsJson, true);
                if (is_array($topics)) {
                    $this->MainModel->deleteConfirmationDetails($headerId);
                    foreach ($topics as $t) {
                        $this->MainModel->insertConfirmationDetail([
                            'HEADER_ID'     => $headerId,
                            'TOPIC_ID'      => $t['TOPIC_ID'],
                            'CONDITION_VAL' => $t['CONDITION_VAL'] ?? null,
                            'CHANGE_VAL'    => $t['CHANGE_VAL'] ?? null,
                            'DETAILS'       => $t['DETAILS'] ?? null,
                        ]);
                    }
                }
            }

            $this->db->trans_commit();

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => $isDraft ? "บันทึกแบบร่างสำเร็จ" : "บันทึกและส่งเอกสารสำเร็จ ({$docNo})",
                'docNo'   => $docNo,
                'data'    => [
                    'NFRMNO'        => $formData['NNO'] ?? $this->input->post('NFRMNO'),
                    'VORGNO'        => $formData['VORGNO'] ?? $this->input->post('VORGNO'),
                    'CYEAR'         => $formData['CYEAR'] ?? $this->input->post('CYEAR'),
                    'CYEAR2'        => $cyear2,
                    'NRUNNO'        => $nrunno,
                    'DOC_HEADER_ID' => $headerId
                ]
            ]));
        } catch (\Throwable $e) {
            $this->db->trans_rollback();
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function ActionFlow() {
        $this->output->set_content_type('application/json');
        try {
            $nfrmno   = (int)$this->input->post('NFRMNO');
            $vorgno   = (string)$this->input->post('VORGNO');
            $cyear2   = (string)$this->input->post('CYEAR2');
            $nrunno   = (int)$this->input->post('NRUNNO');
            $action   = strtoupper(trim((string)$this->input->post('ACTION')));
            $extdata  = trim((string)$this->input->post('EXTDATA'));
            $empno    = (string)($this->input->post('EMPNO') ?: ($this->session->userdata('empno') ?? ''));
            $headerId = $this->input->post('DOC_HEADER_ID');

            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $header = $dbSmmt->where('HEADER_ID', $headerId)->get('FE_ASP_HEADER')->row();

            if (!$header) throw new Exception('ไม่พบเอกสารในระบบ');

            // ป้องกันการ Reject ในกรณี Yearly Review (Auto Job)
            if ($action === 'REJECT' && $header->IS_AUTO_JOB === 'Y') {
                throw new Exception('เอกสารทบทวนประจำปี (Yearly Review) ไม่อนุญาตให้ Reject ให้เลือก Return แทน');
            }

            $status = 'PROCESS';
            if ($action === 'APPROVE') {
                // เช็คว่าถึงขั้นสุดท้ายของสายอนุมัติ FE-ASP หรือยัง (E/P DIM: EXT '05')
                if ($extdata === '05' || $this->MainModel->checkFlowCompleted($nfrmno, $vorgno, $cyear2, $nrunno)) {
                    $status = 'APPROVE';
                }
            } elseif ($action === 'RETURN') {
                $status = 'DRAFT';
            } elseif ($action === 'REJECT') {
                $status = 'REJECT';
            }

            $dbSmmt->where('HEADER_ID', $headerId);
            $dbSmmt->set('STATUS', $status);
            $dbSmmt->set('USER_ACTION', $empno);
            $dbSmmt->set('DATE_ACTION', 'SYSDATE', FALSE);
            $dbSmmt->set('UPDATE_DATE', 'SYSDATE', FALSE);
            $dbSmmt->update('FE_ASP_HEADER');

            return $this->output->set_output(json_encode([
                'status'    => true, 
                'statusDoc' => $status
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function GetStampData() {
        $this->output->set_content_type('application/json');
        try {
            $formKeys = [
                'NFRMNO' => (int)$this->input->post('no'),
                'VORGNO' => (string)$this->input->post('orgNo'),
                'CYEAR'  => (string)$this->input->post('y'),
                'CYEAR2' => (string)$this->input->post('y2'),
                'NRUNNO' => (int)$this->input->post('runNo'),
            ];

            $approvalLogs = $this->MainModel->getApprovalLogList($formKeys);

            return $this->output->set_output(json_encode([
                'status' => true,
                'logs'   => $approvalLogs ?: []
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_status_header(500)->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }

    public function GetFilesDisplay() {
        $this->output->set_content_type('application/json');
        $formKeys = [
            'NFRMNO' => (int)$this->input->post('NFRMNO'),
            'VORGNO' => (string)$this->input->post('VORGNO'),
            'CYEAR2' => (string)$this->input->post('CYEAR2'),
            'NRUNNO' => (int)$this->input->post('NRUNNO'),
        ];

        $dbWebflow = $this->load->database($this->webflowBase, TRUE);
        $files = $dbWebflow->where($formKeys)->order_by('FILE_ID', 'ASC')->get('FE_FILE')->result();

        return $this->output->set_output(json_encode(['status' => true, 'files' => $files ?: []]));
    }
    
    public function DeleteFile() {
        $file_id = $this->input->post('id');
        if (!$file_id) {
            return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => 'No ID provided']));
        }
        $this->MainModel->deleteData($this->webflowBase, 'FE_FILE', ['FILE_ID' => $file_id]);
        return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true]));
    }

    public function DeleteDraftDoc() {
        $this->output->set_content_type('application/json');
        try {
            $docHeaderId = $this->input->post('DOC_HEADER_ID');
            $nfrmno      = (int)$this->input->post('NFRMNO');
            $vorgno      = (string)$this->input->post('VORGNO');
            $cyear       = (string)$this->input->post('CYEAR');
            $cyear2      = (string)$this->input->post('CYEAR2');
            $nrunno      = (int)$this->input->post('NRUNNO');

            $formKeys = [
                'NFRMNO' => $nfrmno, 'VORGNO' => $vorgno, 'CYEAR' => $cyear,
                'CYEAR2' => $cyear2, 'NRUNNO' => $nrunno
            ];

            $dbWebflow = $this->load->database($this->webflowBase, TRUE);
            $dbSmmt    = $this->load->database($this->SmmtBase, TRUE);

            $attachedFiles = $dbWebflow->where($formKeys)->get('FE_FILE')->result();
            foreach ($attachedFiles as $file) {
                $fullPath = rtrim($file->FILE_PATH, '/\\') . DIRECTORY_SEPARATOR . $file->FILE_FNAME;
                if (file_exists($fullPath) && is_file($fullPath)) {
                    @unlink($fullPath);
                }
            }

            $dbWebflow->where($formKeys)->delete('FE_FILE');
            $dbSmmt->where('HEADER_ID', $docHeaderId)->delete('FE_ASP_HEADER');

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => 'ลบข้อมูลเอกสารและไฟล์แนบเรียบร้อยแล้ว'
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => 'เกิดข้อผิดพลาดในการลบ: ' . $e->getMessage()
            ]));
        }
    }
}