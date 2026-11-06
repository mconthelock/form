<?php
// === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
// === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=95147&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1

// === http://localhost:8082/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
// === http://localhost:8082/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=95147&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
    
use GuzzleHttp\Client;

defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/api/webform/form.php';
require_once APPPATH . 'controllers/api/webform/flow.php';
require_once APPPATH . 'controllers/api/webform/formmst.php';
require_once APPPATH . 'controllers/_file.php';

class Form extends MY_Controller {
    use formApi, flow, formmst;

    public $CodeForm = 'AMEC-AR';
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
        
        $this->SmmtBase    = 'SMMT';    
        $this->webflowBase = 'DEFAULT'; 
    }

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

        // 2. ดึง Org ของ User เพื่อเป็นค่าเริ่มต้น
        $userOrg = $this->MainModel->getUserOrgSnapshot($reqBy);
        $data['REQBY_NAME']    = $userOrg['SNAME'] ?? $data['REQBY_NAME'];
        $data['SDIVCODE']      = $userOrg['SDIVCODE'] ?? '';
        $data['DIVISION_NAME'] = $userOrg['SDIV'] ?? '';
        $data['SDEPCODE']      = $userOrg['SDEPCODE'] ?? '';
        $data['SSECCODE']      = $userOrg['SSECCODE'] ?? '00';

        $data['prevApprovedFile'] = null;
        $data['savedDetails']     = [];
        $data['attachedFiles']    = [];

        // 3. จัดการ Webflow Keys
        if ($this->input->get('no') !== null) {
            $data['NFRMNO'] = $this->input->get('no');
            $data['VORGNO'] = $this->input->get('orgNo');
            $data['CYEAR']  = $this->input->get('y');
        } else {
            $formMst        = $this->getFormMasterByVaname($this->CodeForm);
            $data['NFRMNO'] = $formMst['data']['NNO'] ?? $formMst[0]->NNO;
            $data['VORGNO'] = $formMst['data']['VORGNO'] ?? $formMst[0]->VORGNO;
            $data['CYEAR']  = $formMst['data']['CYEAR'] ?? $formMst[0]->CYEAR;
        }

        // 4. สิทธิ์การใช้งาน
        $data['isAdmin']      = $this->MainModel->isFormAdmin($this->CodeForm, $data['EMPNO']);
        $data['isSuperAdmin'] = ($data['EMPNO'] === '13204');

        // 5. โหมด View / Edit
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
                
                $data['prevApprovedFile'] = $this->MainModel->getLatestApprovedFile(
                    $header->CONTROL_NO, 
                    $data['CYEAR2'], 
                    $data['NRUNNO']
                );
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

        // 6. ดึง Controls ตามสิทธิ์ และ Topics[cite: 19]
        $data['controls'] = $this->MainModel->getAllActiveControls($data['REQBY_EMPNO'], $data['SDIVCODE'], $data['SDEPCODE']);
        $data['topics']   = $this->MainModel->getActiveTopics();

        // 7. โหมดสร้างเอกสารใหม่: Default Control พร้อมดึง DEPT และ SECT ของ Control นั้นมาเป็น Default[cite: 19]
        if (empty($data['NRUNNO']) && !empty($data['controls']) && is_array($data['controls'])) {
            $bestCtrl = $this->MainModel->pickDefaultControl($data['controls'], $data['SSECCODE']);
            if ($bestCtrl) {
                $data['CONTROL_NO'] = $bestCtrl['CONTROL_NO'];

                // ดึง DEPT และ SEC ของ Control ตัวที่ถูก Default มาใช้ทันที
                if (!empty($bestCtrl['SDEPCODE'])) {
                    $data['SDEPCODE'] = $bestCtrl['SDEPCODE'];
                }
                $data['SSECCODE'] = !empty($bestCtrl['SSECCODE']) ? $bestCtrl['SSECCODE'] : '00';

                // หากเป็น Super Admin (13204) ให้ดึง Division ประจำ Control มาด้วย[cite: 19]
                if ($data['isSuperAdmin']) {
                    $data['SDIVCODE']      = $bestCtrl['SDIVCODE'] ?? $data['SDIVCODE'];
                    $data['DIVISION_NAME'] = $bestCtrl['DIVISION_NAME'] ?? $data['DIVISION_NAME'];
                }

                // ดึงไฟล์ Approved ล่าสุดตั้งแต่ Server Side[cite: 19]
                $data['prevApprovedFile'] = $this->MainModel->getLatestApprovedFile(
                    $data['CONTROL_NO'], 
                    '', 
                    ''
                );
            }
        }

        // 8. ดึง Dropdowns: Departments และ Sections ตามค่า SDEPCODE ที่อัปเดตแล้ว[cite: 19]
        $data['departments'] = $this->MainModel->getDepartmentsByRole($data['SDIVCODE'], $data['SDEPCODE'], $data['REQBY_EMPNO']);
        $data['sections']    = !empty($data['SDEPCODE']) ? $this->MainModel->getSectionsByDept($data['SDEPCODE']) : [];

        // 9. ตรวจสอบสถานะการอนุมัติ Step 1[cite: 19]
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

        $data['isLocked'] = $data['isFirstStepApproved'];

        $this->views('feform/FE-ASP/form', $data);
    }

    public function ajaxGetEmpFullContext() {
        $this->output->set_content_type('application/json');
        try {
            $empno     = trim($this->input->get('empno') ?? '');
            $controlNo = trim($this->input->get('controlNo') ?? '');
            $cyear2    = trim($this->input->get('y2') ?? '');
            $runNo     = trim($this->input->get('runNo') ?? '');

            if (empty($empno)) throw new Exception('กรุณาระบุรหัสพนักงาน');

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
            $divName = $userOrg['SDIV'] ?? '';

            $isSuperAdmin = ($empno === '13204');

            // Controls กรองตามฝ่าย/แผนกพนักงาน
            $controls = $this->MainModel->getAllActiveControls($empno, $divCode, $depCode);
            $defaultControl = $this->MainModel->pickDefaultControl($controls, $secCode);

            if ($isSuperAdmin && $defaultControl) {
                $divCode = $defaultControl['SDIVCODE'] ?? $divCode;
                $divName = $defaultControl['DIVISION_NAME'] ?? $divName;
                $depCode = $defaultControl['SDEPCODE'] ?? $depCode;
                $secCode = $defaultControl['SSECCODE'] ?? '00';
            }

            $targetControlNo = !empty($controlNo) ? $controlNo : ($defaultControl['CONTROL_NO'] ?? '');
            $prevFile = null;
            if (!empty($targetControlNo)) {
                $prevFile = $this->MainModel->getLatestApprovedFile($targetControlNo, $cyear2, $runNo);
            }

            $departments = $this->MainModel->getDepartmentsByRole($divCode, $depCode, $empno);
            $sections    = !empty($depCode) ? $this->MainModel->getSectionsByDept($depCode) : [];

            return $this->output->set_output(json_encode([
                'status'         => true,
                'emp'            => [
                    'empno'   => $empno,
                    'name'    => $userOrg['SNAME'] ?? '',
                    'divCode' => $divCode,
                    'divName' => $divName,
                    'depCode' => $depCode,
                    'secCode' => $secCode
                ],
                'departments'    => $departments ?: [],
                'sections'       => $sections ?: [],
                'controls'       => $controls ?: [],
                'defaultControl' => $defaultControl,
                'prevFile'       => $prevFile
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }

    public function GetControlInfo() {
        $controlNo = trim($this->input->get('controlNo') ?? '');
        $empNo     = trim($this->input->get('empno') ?? '');
        $cyear2    = trim($this->input->get('y2') ?? '');
        $runNo     = trim($this->input->get('runNo') ?? '');
        
        $control = $this->MainModel->getControlMasterInfo($controlNo);
        if (!$control) {
            return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => false]));
        }

        $isSuperAdmin = ($empNo === '13204');

        $divCode = $control['SDIVCODE'] ?? '';
        $ctrlDep = $control['SDEPCODE'] ?? '';
        $ctrlSec = $control['SSECCODE'] ?? '00';

        // ดึงรายการ Department ถ้าเป็น Super Admin
        $departments = [];
        if ($isSuperAdmin) {
            $departments = $this->MainModel->getDepartmentsByRole($divCode, $ctrlDep, $empNo);
        }

        // ดึงรายการ Section ของ Department ประจำ Control นั้นให้ทุกคนเสมอ เพื่อใช้อัปเดต Dropdown
        $sections = !empty($ctrlDep) ? $this->MainModel->getSectionsByDept($ctrlDep) : [];

        $prevFile = $this->MainModel->getLatestApprovedFile($controlNo, $cyear2, $runNo);

        return $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status'       => true,
                'control'      => $control,
                'isSuperAdmin' => $isSuperAdmin,
                'divCode'      => $divCode,
                'divName'      => $control['DIVISION_NAME'] ?? '',
                'targetDept'   => $ctrlDep,
                'targetSec'    => $ctrlSec,
                'departments'  => $departments,
                'sections'     => $sections,
                'prevFile'     => $prevFile
            ]));
    }

    public function ajaxGetSections() {
        $depCode = $this->input->get('depCode');
        $secs    = $this->MainModel->getSectionsByDept($depCode);
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode(['status' => true, 'data' => $secs ?: []]));
    }

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

            $nfrmno = $this->input->post('NFRMNO');
            $vorgno = $this->input->post('VORGNO');
            $cyear  = $this->input->post('CYEAR');
            $cyear2 = $this->input->post('CYEAR2');
            $nrunno = $this->input->post('NRUNNO');

            $currentEmpNo = !empty($reqByPost) ? $reqByPost : (!empty($empNoPost) ? $empNoPost : '');

            if (empty($controlNo)) throw new Exception("กรุณาเลือก Control No.");
            if (empty($sDepCode))  throw new Exception("กรุณาระบุ Department");

            if (!empty($nrunno)) {
                $isApproved = $this->MainModel->isFirstStepApproved($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
                if ($isApproved) {
                    throw new Exception("เอกสารนี้เข้าสู่กระบวนการอนุมัติแล้ว ไม่อนุญาตให้แก้ไขข้อมูล");
                }
            }

            $this->db->trans_begin();
            $isCreateNew = empty($headerId) && empty($nrunno);

            if ($isCreateNew) {
                $formMst  = $this->getFormMasterByVaname($this->CodeForm);
                $formData = $formMst['data'];

                $flowData = [
                    'NFRMNO'  => $formData['NNO'],
                    'VORGNO'  => $formData['VORGNO'],
                    'CYEAR'   => $formData['CYEAR'],
                    'REQBY'   => $currentEmpNo,
                    'INPUTBY' => !empty($empNoPost) ? $empNoPost : $currentEmpNo,
                    'REMARK'  => $remark ?: $detailChange,
                    'DRAFT'   => $isDraft ? '1' : '0'
                ];

                $rsf = $this->createForm($flowData);
                if (!$rsf || empty($rsf['status'])) {
                    throw new Exception("สร้างเอกสาร Webflow ไม่สำเร็จ: " . ($rsf['message'] ?? ''));
                }

                $cyear2 = $rsf['data']['CYEAR2'];
                $nrunno = $rsf['data']['NRUNNO'];
                $docNo  = $this->CodeForm . "-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);

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
                $docNo = $this->input->post('DOC_NO');

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

            if (!empty($topicsJson)) {
                $topics = json_decode($topicsJson, true);
                if (is_array($topics)) {
                    $this->MainModel->deleteConfirmationDetails($headerId);
                    foreach ($topics as $t) {
                        $this->MainModel->insertConfirmationDetail([
                            'HEADER_ID'     => $headerId,
                            'TOPIC_ID'      => $t['TOPIC_ID'],
                            'CONDITION_VAL' => $t['CONDITION_VAL'] ?? null,
                            'CHANGE_VAL'    => $t['CHANGE_VAL'] ?? null, // สำหรับกลุ่ม AUDIT_COMPLAIN (FOUND / NOT_FOUND)
                            'INC_VAL'       => $t['INC_VAL'] ?? 'N',
                            'DEC_VAL'       => $t['DEC_VAL'] ?? 'N',
                            'NO_CHANGE_VAL' => $t['NO_CHANGE_VAL'] ?? 'N',
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
                    'NFRMNO'        => $formData['NNO'] ?? $nfrmno,
                    'VORGNO'        => $formData['VORGNO'] ?? $vorgno,
                    'CYEAR'         => $formData['CYEAR'] ?? $cyear,
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
            $empno    = (string)($this->input->post('EMPNO') ?: '');
            $headerId = $this->input->post('DOC_HEADER_ID');

            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $header = $dbSmmt->where('HEADER_ID', $headerId)->get('FE_ASP_HEADER')->row();

            if (!$header) throw new Exception('ไม่พบเอกสารในระบบ');

            if ($action === 'REJECT' && $header->IS_AUTO_JOB === 'Y') {
                throw new Exception('เอกสารทบทวนประจำปี (Yearly Review) ไม่อนุญาตให้ Reject ให้เลือก Return แทน');
            }

            $status = 'PROCESS';
            if ($action === 'APPROVE') {
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