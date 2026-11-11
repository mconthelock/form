<?php

// === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
// === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=95147&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1

// === http://localhost:8082/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
// === http://localhost:8082/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=95147&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
    
use GuzzleHttp\Client;


use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\{Border, Fill, Alignment};
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Style\Color;



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

    /**
     * ดึงข้อมูล Form Master พื้นฐาน (NNO, VORGNO, CYEAR)
     */
    private function getFormMasterInfo()
    {
        $formMst = $this->getFormMasterByVaname($this->CodeForm);

        return [
            'no'    => $formMst['data']['NNO'] ?? $formMst[0]->NNO ?? '',
            'orgNo' => $formMst['data']['VORGNO'] ?? $formMst[0]->VORGNO ?? '',
            'y'     => $formMst['data']['CYEAR'] ?? $formMst[0]->CYEAR ?? '',
        ];
    }

    /**
     * Helper Function สำหรับประกอบ URL และทำการ Redirect ไปยัง main
     * 
     * @param array $extraParams พารามิเตอร์เพิ่มเติมที่ต้องการส่งไปกับ URL
     * @param bool  $trailingSlash เลือกว่าปลายทางต้องการปิดท้ายด้วย / ก่อน ? หรือไม่ (default: true)
     */
    private function redirectToFeAspMain(array $extraParams = [], $trailingSlash = true)
    {
        $baseParams = $this->getFormMasterInfo();

        // รวม parameters และกรองค่า null / ค่าว่างออก
        $allParams = array_merge($baseParams, $extraParams);
        $filteredParams = array_filter($allParams, function($val) {
            return $val !== null && $val !== '';
        });

        $path = $trailingSlash ? 'main/' : 'main';
        $queryString = http_build_query($filteredParams);
        $redirectUrl = "{$this->http}://{$this->host}/form/feform/FE-ASP/form/{$path}?" . $queryString;

        redirect($redirectUrl, 'location', 302);
    }

    /**
     * Endpoint: /form/feform/FE-ASP/form/feaspcreate/{empno}
     */
    
    // == http://localhost:8082/form/feform/FE-ASP/form/feaspcreate/13204/
    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === https://localhost:8082/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
   
    public function feaspcreate($empno = null)
    {
        $empno = !empty($empno) ? $empno : $this->input->get('empno');
        $defaultBp = 'http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp';

        $this->redirectToFeAspMain([
            'empno' => $empno,
            'bp'    => $this->input->get('bp') ?: $defaultBp,
        ], true); // true = main/?...
    }

    /**
     * Endpoint: /form/feform/FE-ASP/form/feaspform/{empno}
     */
    
    // == http://localhost:8082/form/feform/FE-ASP/form/feaspform/2026/1/13204/
    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=95147&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
    // === https://localhost:8082/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=95147&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
   
    public function feaspform($y2= null, $runNo = null,$empno = null)
    {
        $empno = !empty($empno) ? $empno : $this->input->get('empno');
        $runNo = !empty($runNo) ? $runNo : $this->input->get('runNo');
        $y2 = !empty($y2) ? $y2 : $this->input->get('y2');
        $m    = $this->input->get('m') ?? '3';
        $bp   = $this->input->get('bp') ?? '/formtest/workflow/mineList.asp';
        $menu = $this->input->get('menu') ?? '1';
        $this->redirectToFeAspMain([
            'y2'    => $y2 ,
            'runNo' => $runNo,
            'm'     => $m,
            'empno' => $empno,
            'bp'    => $bp,
            'menu'  => $menu,
        ], false); // false = main?...
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

                $nfrmno = $formData['NNO'];
                $vorgno = $formData['VORGNO'];
                $cyear  = $formData['CYEAR'];

                $flowData = [
                    'NFRMNO'  => $nfrmno,
                    'VORGNO'  => $vorgno,
                    'CYEAR'   => $cyear,
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

                // ดึง Revision ปัจจุบันจากตาราง FE_ASP_CONTROL_MST
                $baseRev = $this->MainModel->getCurrentRevisionFromMaster($controlNo);
                
                $headerData = [
                    'DOC_NO'           => $docNo,
                    'CONTROL_NO'       => $controlNo,
                    'DOC_REVISION'     => $baseRev, // บันทึก Revision ล่าสุดตั้งแต่ตอนสร้างใบงาน
                    'SDIVCODE'         => $sDivCode,
                    'SDEPCODE'         => $sDepCode,
                    'SSECCODE'         => $sSecCode,
                    'NFRMNO'           => $nfrmno,
                    'VORGNO'           => $vorgno,
                    'CYEAR'            => $cyear,
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
                if (empty($docNo)) {
                    $docNo = $this->CodeForm . "-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);
                }

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

            // บันทึกรายการ Checksheet Detail
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
                            'INC_VAL'       => $t['INC_VAL'] ?? 'N',
                            'DEC_VAL'       => $t['DEC_VAL'] ?? 'N',
                            'NO_CHANGE_VAL' => $t['NO_CHANGE_VAL'] ?? 'N',
                            'DETAILS'       => $t['DETAILS'] ?? null,
                        ]);
                    }
                }
            }

            // สร้างไฟล์ Cover PDF ลงชั่วคราวบน Disk (ไม่ใช่ Draft)
            $coverFileData = null;
            if (!$isDraft) {
                $tempDir = FCPATH . 'assets/upload/fe_asp/';
                if (!is_dir($tempDir)) {
                    @mkdir($tempDir, 0777, true);
                }

                $coverFileName = "{$docNo}_CoverSheet.pdf";
                $savePath = $tempDir . $coverFileName;

                // 1. สร้างไฟล์ PDF ด้วย TCPDF
                $this->generateCoverPdfInternal([
                    'controlNo'     => $controlNo,
                    'reviewPeriod'  => $reviewPeriod,
                    'reviewDetails' => $reviewDetails,
                    'detailChange'  => $detailChange,
                    'effectStatus'  => $effectStatus,
                    'dateStr'       => date('d/m/Y')
                ], 'F', $savePath);

                // 2. ส่งข้อมูลไฟล์กลับไปให้ JS เพื่อนำไปอัปโหลดผ่าน NestJS
                $coverFileData = [
                    'fileName' => $coverFileName,
                    'fileUrl'  => base_url('assets/upload/fe_asp/' . $coverFileName)
                ];
            }

            $this->db->trans_commit();

            return $this->output->set_output(json_encode([
                'status'    => true,
                'message'   => $isDraft ? "บันทึกแบบร่างสำเร็จ" : "บันทึกและส่งเอกสารสำเร็จ ({$docNo})",
                'docNo'     => $docNo,
                'coverFile' => $coverFileData,
                'data'      => [
                    'NFRMNO'        => $nfrmno,
                    'VORGNO'        => $vorgno,
                    'CYEAR'         => $cyear,
                    'CYEAR2'        => $cyear2,
                    'NRUNNO'        => $nrunno,
                    'DOC_HEADER_ID' => $headerId,
                    'DOC_NO'        => $docNo
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
            $cyear   = (string)$this->input->post('CYEAR');
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
                $isCompleted = $this->MainModel->checkFlowCompleted($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
                
                if ($isCompleted) {
                    $status = 'APPROVE';

                    // 1. จัดการ Revision: ถ้าเป็น CHANGE จะขยับตัวอักษรและอัปเดตลง Master + Header
                    $newRev = $this->MainModel->updateDocRevision(
                        $headerId, 
                        $header->CONTROL_NO, 
                        $header->REVIEW_DETAILS, 
                        $header->DOC_REVISION ?? '*'
                    );

                    // 2. ถ้าเป็น Yearly ให้ตรวจดูว่าครบ Fiscal Year หรือยัง
                    if ($header->REVIEW_PERIOD === 'YEARLY') {
                        $docTime = !empty($header->CREATE_DATE) ? strtotime($header->CREATE_DATE) : time();
                        $docMonth = (int)date('n', $docTime);
                        $docYear  = (int)date('Y', $docTime);
                        $fiscalYear = ($docMonth < 4) ? ($docYear - 1) : $docYear;

                        $batchStatus = $this->MainModel->checkYearlyBatchCompleted($fiscalYear);
                        if ($batchStatus['isCompleted']) {
                            $this->generateYearlySummaryExcel($fiscalYear);
                        }
                    }
                }
            } elseif ($action === 'RETURN' || $action === 'RETURNP' ) {
                $status = 'DRAFT';
                $this->deleteCoverFile($nfrmno, $vorgno,$cyear, $cyear2, $nrunno);

            } elseif ($action === 'REJECT') {
                $status = 'REJECT';
                $this->deleteCoverFile($nfrmno, $vorgno,$cyear,$cyear2, $nrunno);
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


    public function deleteCoverFile($nfrmno, $vorgno,$cyear, $cyear2, $nrunno)
    {
        $dbWebflow = $this->load->database($this->webflowBase, TRUE);

        // ค้นหาเฉพาะไฟล์ Cover Sheet ของเอกสารใบนี้
        $coverFiles = $dbWebflow->where([
            'NFRMNO' => (int)$nfrmno,
            'VORGNO' => (string)$vorgno,
            'CYEAR' => (string)$cyear,
            'CYEAR2' => (string)$cyear2,
            'NRUNNO' => (int)$nrunno,
        ])
        ->like('FILE_ONAME', 'CoverSheet.pdf') // ตัด Underscore เพื่อเลี่ยงปัญหา Wildcard ของ SQL
        ->get('FE_FILE')
        ->result();

        if (empty($coverFiles)) {
            return;
        }

        foreach ($coverFiles as $cFile) {
            // 1. ลบไฟล์จริงบน Path / Network Drive NAS
            if (!empty($cFile->FILE_PATH) && !empty($cFile->FILE_FNAME)) {
                $baseDir = rtrim($cFile->FILE_PATH, '/\\');
                // จัดรูปแบบ slash ให้ตรงกับ OS
                $fullPath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $baseDir . DIRECTORY_SEPARATOR . $cFile->FILE_FNAME);
                
                if (file_exists($fullPath) && is_file($fullPath)) {
                    @unlink($fullPath);
                }
            }

            // 2. ลบไฟล์สำรองชั่วคราวในโฟลเดอร์ upload (ถ้ามี)
            if (!empty($cFile->FILE_FNAME)) {
                $tempPath = FCPATH . 'assets/upload/fe_asp/' . $cFile->FILE_FNAME;
                if (file_exists($tempPath) && is_file($tempPath)) {
                    @unlink($tempPath);
                }
            }

            // 3. ลบ Record จากตาราง FE_FILE โดยอิงจาก FILE_ID รายแถวโดยตรง
            $dbWebflow->where('FILE_ID', $cFile->FILE_ID)->delete('FE_FILE');
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


    /**
     * ลบไฟล์ Cover Sheet ชั่วคราวออกจากเซิร์ฟเวอร์หลังจากส่งเข้า Storage กลางสำเร็จ
     */
    public function deleteTempCoverFile() {
        $this->output->set_content_type('application/json');
        try {
            $fileName = trim((string)$this->input->post('fileName'));
            
            // ป้องกัน Path Traversal
            $fileName = basename($fileName);

            if (empty($fileName)) {
                throw new Exception('ไม่พบชื่อไฟล์ที่ต้องการลบ');
            }

            $fullPath = FCPATH . 'assets/upload/fe_asp/' . $fileName;

            if (file_exists($fullPath) && is_file($fullPath)) {
                @unlink($fullPath);
            }

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => 'ลบไฟล์ชั่วคราวเรียบร้อยแล้ว'
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }
    
    /**
     * สำหรับปุ่ม Preview / Test Generate Cover PDF (เปิดดูใน Browser ทันที)
     */
    public function preview_cover_pdf() {
        $controlNo     = trim((string)$this->input->get('controlNo')) ?: 'AMEC-AR-TEST-001';
        $reviewPeriod  = trim((string)$this->input->get('reviewPeriod')) ?: 'YEARLY';
        $reviewDetails = trim((string)$this->input->get('reviewDetails')) ?: 'NO_CHANGE';
        $detailChange  = trim((string)$this->input->get('detailChange')) ?: '';
        $effectStatus  = trim((string)$this->input->get('effectStatus')) ?: 'NO_EFFECT';
        $dateStr       = trim((string)$this->input->get('date')) ?: date('d/m/Y');

        $this->generateCoverPdfInternal([
            'controlNo'     => $controlNo,
            'reviewPeriod'  => $reviewPeriod,
            'reviewDetails' => $reviewDetails,
            'detailChange'  => $detailChange,
            'effectStatus'  => $effectStatus,
            'dateStr'       => $dateStr
        ], 'I'); // 'I' = ส่งออกไปแสดงผลบน Browser ทันที
    }

    /**
     * Logic วาดหน้า Cover PDF ด้วย TCPDF (ขยับระยะหัวกระดาษหลบตรายาง Stamp ด้านบน)
     */
    protected function generateCoverPdfInternal($data, $outputDest = 'I', $saveFilePath = '') {
        require_once APPPATH . 'libraries/PDF/TCPDF/tcpdf.php';

        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

        $pdf->SetCreator('AMEC Webflow');
        $pdf->SetAuthor('FE-ASP');
        $pdf->SetTitle('Review Table - ' . $data['controlNo']);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        // เผื่อขอบบนเป็น 27 เพื่อเว้นที่ให้ตรายางด้านบนสุด
        $pdf->SetMargins(15, 27, 15);
        $pdf->SetAutoPageBreak(false);

        $pdf->AddPage();

        $fontName = 'thsarabunnew';
        $pdf->SetFont($fontName, 'B', 14);

        // 1. Header Title (เริ่มที่ Y = 27 พ้นจากโซนตรายางด้านบน)
        $pdf->SetY(27);
        $pdf->Cell(180, 7, 'Review table of Environmental aspect evaluation and Environmental Risk', 0, 1, 'C');
        $pdf->Ln(1.5);

        $ts = strtotime(str_replace('/', '-', $data['dateStr']));
        $day   = date('d', $ts);
        $month = date('F', $ts);
        $year  = date('Y', $ts);

        // 2. Control No Box
        $pdf->SetFont($fontName, 'B', 11.5);
        $y = $pdf->GetY();
        $pdf->Rect(15, $y, 180, 12);
        $pdf->SetXY(17, $y + 0.5);
        $pdf->Write(6.5, 'Control no.  :  ' . $data['controlNo']);
        $pdf->SetXY(17, $y + 6.5);
        $pdf->SetFont($fontName, '', 9);
        $pdf->SetTextColor(90, 90, 90);
        $pdf->Write(5, '(Details in Table control record number of Environmental aspect evaluation and Environmental Risk)');
        $pdf->SetTextColor(0, 0, 0);

        // 3. Review Date Box
        $pdf->SetY($y + 12);
        $yDate = $pdf->GetY();
        $pdf->Rect(15, $yDate, 180, 7.5);
        $pdf->SetFont($fontName, 'B', 11.5);
        $pdf->SetXY(17, $yDate + 1);
        $pdf->Write(5.5, "Review date  :   DD   {$day}      MM   {$month}      YY   {$year}");

        // 4. Review Period Bar
        $pdf->SetY($yDate + 7.5);
        $yBar = $pdf->GetY();
        $pdf->SetFillColor(230, 230, 230);
        $pdf->Rect(15, $yBar, 180, 6.5, 'DF');
        $pdf->SetXY(17, $yBar + 0.8);
        $pdf->SetFont($fontName, 'B', 11.5);
        $pdf->Write(5.5, 'Review period');

        $textX = 26;
        $textW = 165;

        // เช็คเงื่อนไข Review Period & Change
        $isYearlyPeriod   = ($data['reviewPeriod'] === 'YEARLY');
        $isChangingPeriod = ($data['reviewPeriod'] === 'CHANGING');
        $isChangeSelected = ($data['reviewDetails'] === 'CHANGE');
        $isNoChange       = ($data['reviewDetails'] === 'NO_CHANGE');

        // ==========================================
        // 5. Section 1: Yearly Review
        // ==========================================
        $pdf->SetY($yBar + 6.5);
        $ySec1 = $pdf->GetY();
        $sec1Height = 77;
        $pdf->Rect(15, $ySec1, 180, $sec1Height);

        $pdf->SetFillColor(245, 245, 245);
        $pdf->Rect(15, $ySec1, 180, 5.5, 'DF');
        $pdf->SetXY(20, $ySec1 + 0.3);
        $pdf->SetFont($fontName, 'B', 10.5);
        $pdf->Write(5, '1.Yearly review / ทบทวนตามวาระทุก 1 ปี');

        // 1.1 No change checkbox
        $chk1_1 = ($isYearlyPeriod && $isNoChange) ? '[ / ]' : '[   ]';
        $pdf->SetXY(17, $ySec1 + 8);
        $pdf->SetFont('helvetica', 'B', 9.5);
        $pdf->Write(5, $chk1_1);

        $pdf->SetXY($textX, $ySec1 + 7.5);
        $pdf->SetFont($fontName, 'B', 10);
        $pdf->MultiCell($textW, 4.2, "No change in AMEC's activities, products and services which effect to environmental aspects and environmental risks, in this year. *Refer {$data['controlNo']} (Revision *), No revise detail", 0, 'L');
        
        $pdf->SetX($textX);
        $pdf->SetFont($fontName, '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->MultiCell($textW, 3.8, "ไม่พบการเปลี่ยนแปลงของกิจกรรม, ผลิตภัณฑ์และบริการของ AMEC ที่มีผลกระทบต่อประเด็นปัญหาสิ่งแวดล้อมและความเสี่ยงด้านสิ่งแวดล้อม", 0, 'L');
        $pdf->SetTextColor(0, 0, 0);

        // 1.2 Change checkbox
        $chk1_2 = ($isYearlyPeriod && $isChangeSelected) ? '[ / ]' : '[   ]';
        $pdf->SetXY(17, $ySec1 + 31);
        $pdf->SetFont('helvetica', 'B', 9.5);
        $pdf->Write(5, $chk1_2);

        $pdf->SetXY($textX, $ySec1 + 30.5);
        $pdf->SetFont($fontName, 'B', 10);
        $pdf->MultiCell($textW, 4.2, "Change in AMEC's activities, products and services which effect to environmental aspects and environmental risks, in this year.\nShall be updated details in \"Environmental aspect evaluation and Environmental Risk form\"", 0, 'L');
        
        $pdf->SetX($textX);
        $pdf->SetFont($fontName, '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->MultiCell($textW, 3.8, "พบการเปลี่ยนแปลงของกิจกรรม, ผลิตภัณฑ์และบริการของ AMEC และส่งผลกระทบต่อประเด็นปัญหาและความเสี่ยง ด้านสิ่งแวดล้อม จะต้องเปลี่ยนแปลงรายละเอียดในแบบฟอร์ม \"Environmental aspect evaluation and Environmental Risk\"", 0, 'L');
        $pdf->SetTextColor(0, 0, 0);

        // ==========================================
        // 6. Section 2: Review on changing
        // ==========================================
        $pdf->SetY($ySec1 + $sec1Height);
        $ySec2 = $pdf->GetY();
        $sec2Height = 94;
        $pdf->Rect(15, $ySec2, 180, $sec2Height);

        $pdf->SetFillColor(245, 245, 245);
        $pdf->Rect(15, $ySec2, 180, 5.5, 'DF');
        $pdf->SetXY(20, $ySec2 + 0.3);
        $pdf->SetFont($fontName, 'B', 10.5);
        $pdf->Write(5, '2. Review on changing / ทบทวนเมื่อมีการเปลี่ยนแปลง');

        $hasChangeCondition = $isChangingPeriod || ($isYearlyPeriod && $isChangeSelected);

        // Checkbox Change in (Identify)
        $chk2_1 = $hasChangeCondition ? '[ / ]' : '[   ]';
        $pdf->SetXY(17, $ySec2 + 7.5);
        $pdf->SetFont('helvetica', 'B', 9.5);
        $pdf->Write(5, $chk2_1);

        $pdf->SetXY($textX, $ySec2 + 7);
        $pdf->SetFont($fontName, 'B', 10);
        $detailTxt = !empty($data['detailChange']) ? $data['detailChange'] : '...............................................................................................................................';
        $pdf->MultiCell($textW, 4.2, "Change in (Identify) :  {$detailTxt}", 0, 'L');
        
        $pdf->SetX($textX);
        $pdf->SetFont($fontName, '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->MultiCell($textW, 3.8, "พบการเปลี่ยนแปลง (ระบุรายละเอียด)", 0, 'L');
        $pdf->SetTextColor(0, 0, 0);

        // Detail of change description
        $pdf->Ln(1.5);
        $pdf->SetX($textX);
        $pdf->SetFont($fontName, 'B', 9.5);
        $pdf->Write(4.2, "Detail of change : ");
        $pdf->SetFont($fontName, '', 9.5);
        $pdf->MultiCell($textW - 25, 4.2, "New developments, and or new modified activities, products and services including abnormal conditions and reasonably foreseeable emergency situations.", 0, 'L');
        
        $pdf->SetX($textX);
        $pdf->SetFont($fontName, '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->MultiCell($textW, 3.8, "รายละเอียดการเปลี่ยนแปลง : การเปลี่ยนแปลงหรือการพัฒนาใหม่ๆ หรือกิจกรรมใหม่ที่เกิดขึ้น ผลิตภัณฑ์ และบริการ รวมถึงสถานการณ์ผิดปกติ และสถานการณ์ฉุกเฉินที่มีโอกาสเกิดขึ้นได้", 0, 'L');
        $pdf->SetTextColor(0, 0, 0);

        // 2.1 No Effect Radio
        $isNoEffect = ($data['effectStatus'] === 'NO_EFFECT');
        $rad2_1 = ($hasChangeCondition && $isNoEffect) ? '( O )' : '(   )';
        $pdf->Ln(1.5);
        $yRad1 = $pdf->GetY();
        $pdf->SetXY(17, $yRad1 + 0.3);
        $pdf->SetFont('helvetica', 'B', 8.5);
        $pdf->Write(5, $rad2_1);

        $pdf->SetXY($textX, $yRad1);
        $pdf->SetFont($fontName, 'B', 10);
        $pdf->MultiCell($textW, 4.2, "No effect, change in AMEC's activities, products and services but no effect to environmental aspects and environmental risks.", 0, 'L');
        
        $pdf->SetX($textX);
        $pdf->SetFont($fontName, '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->MultiCell($textW, 3.8, "ไม่มีผลกระทบ, มีการเปลี่ยนแปลงของกิจกรรม, ผลิตภัณฑ์และบริการของ AMEC แต่ไม่มีผลกระทบต่อประเด็นปัญหาสิ่งแวดล้อม และความเสี่ยงด้านสิ่งแวดล้อม", 0, 'L');
        $pdf->SetTextColor(0, 0, 0);

        // 2.2 Effect Radio
        $rad2_2 = ($hasChangeCondition && !$isNoEffect) ? '( O )' : '(   )';
        $pdf->Ln(1.5);
        $yRad2 = $pdf->GetY();
        $pdf->SetXY(17, $yRad2 + 0.3);
        $pdf->SetFont('helvetica', 'B', 8.5);
        $pdf->Write(5, $rad2_2);

        $pdf->SetXY($textX, $yRad2);
        $pdf->SetFont($fontName, 'B', 10);
        $pdf->MultiCell($textW, 4.2, "Effect, change in AMEC's activities, products and services and effect to environmental aspects and environmental risks.\nShall be updated details in \"Environmental aspect evaluation and Environmental Risk form\"", 0, 'L');
        
        $pdf->SetX($textX);
        $pdf->SetFont($fontName, '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->MultiCell($textW, 3.8, "มีผลกระทบ, มีการเปลี่ยนแปลงของกิจกรรม, ผลิตภัณฑ์และบริการของ AMEC และส่งผลกระทบต่อประเด็นปัญหาสิ่งแวดล้อม และความเสี่ยงด้านสิ่งแวดล้อม\nจะต้องเปลี่ยนแปลงรายละเอียดในแบบฟอร์ม \"Environmental aspect evaluation and Environmental Risk\"", 0, 'L');
        $pdf->SetTextColor(0, 0, 0);

        if ($outputDest === 'F') {
            return $pdf->Output($saveFilePath, 'F');
        } else {
            return $pdf->Output('FE-ASP-Cover.pdf', 'I');
        }
    }


    public function generateYearlySummaryExcel($year) {
        $records = $this->MainModel->getYearlyApprovedRecordsForSummary($year);
        if (empty($records)) return null;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle("FY{$year}");

        // Title Header
        $sheet->setCellValue('A1', 'List of Review Environmental aspect evaluation and Environmental Risk record');
        $sheet->setCellValue('A2', 'Date: ' . date('d-M-Y'));

        // Table Header
        $headers = [
            'A4' => 'No.',
            'B4' => 'Div.',
            'C4' => 'Sec. or Dept.',
            'D4' => 'Control no.',
            'E4' => 'Review period',
            'F4' => 'Review detail',
            'G4' => 'Revision',
            'H4' => 'Reviewed Date',
            'I4' => 'In charge',
            'J4' => 'Main Envi. impact',
            'K4' => 'Rule/Procedure for control'
        ];

        foreach ($headers as $cell => $val) {
            $sheet->setCellValue($cell, $val);
            $sheet->getStyle($cell)->getFont()->setBold(true);
            $sheet->getStyle($cell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        $rowIdx = 5;
        foreach ($records as $i => $r) {
            $periodTxt = ($r['REVIEW_PERIOD'] === 'YEARLY') ? 'Yearly Review By term' : 'Changing review';
            $detailTxt = ($r['REVIEW_DETAILS'] === 'NO_CHANGE') ? 'No change' : 'Change, ' . ($r['DETAIL_OF_CHANGE'] ?? '');

            $sheet->setCellValue("A{$rowIdx}", $i + 1);
            $sheet->setCellValue("B{$rowIdx}", $r['SDIVCODE'] ?? '');
            $sheet->setCellValue("C{$rowIdx}", !empty($r['SSECCODE']) && $r['SSECCODE'] !== '00' ? $r['SSECCODE'] : $r['SDEPCODE']);
            $sheet->setCellValue("D{$rowIdx}", $r['CONTROL_NO'] ?? '');
            $sheet->setCellValue("E{$rowIdx}", $periodTxt);
            $sheet->setCellValue("F{$rowIdx}", $detailTxt);
            $sheet->setCellValue("G{$rowIdx}", $r['DOC_REVISION'] ?? '*');
            $sheet->setCellValue("H{$rowIdx}", $r['REVIEWED_DATE'] ?? '');
            $sheet->setCellValue("I{$rowIdx}", $r['REQ_NAME'] ?? $r['REQ_BY']);
            
            // คอลัมน์ J เป็นต้นไป เว้นไว้ให้ E/P เติมต่อตามเงื่อนไข
            $sheet->setCellValue("J{$rowIdx}", '');
            $sheet->setCellValue("K{$rowIdx}", '');
            $rowIdx++;
        }

        // เซ็ตขอบตาราง (Border)
        $sheet->getStyle("A4:K" . ($rowIdx - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        $fileName = "List_of_Review_Environmental_Aspect_FY{$year}.xlsx";
        $savePath = FCPATH . 'assets/upload/fe_asp/' . $fileName;
        $writer = new Xlsx($spreadsheet);
        $writer->save($savePath);

        return [
            'fileName' => $fileName,
            'fileUrl'  => base_url('assets/upload/fe_asp/' . $fileName)
        ];
    }

    /**
     * ดาวน์โหลดไฟล์ Template สำหรับ Environmental Aspect & Risk
     */
    public function downloadAspectTemplate() {
        $fileName = 'Environmental_aspect_evaluation_and_Risk.xls';
        $filePath = APPPATH . 'controllers/feform/FE-ASP/' . $fileName;

        if (!file_exists($filePath)) {
            // สำรองกรณีเป็นนามสกุล .xlsx
            $filePathXlsx = APPPATH . 'controllers/feform/FE-ASP/Environmental_aspect_evaluation_and_Risk.xlsx';
            if (file_exists($filePathXlsx)) {
                $filePath = $filePathXlsx;
                $fileName = 'Environmental_aspect_evaluation_and_Risk.xlsx';
            } else {
                show_error("ไม่พบไฟล์ Template: {$fileName}", 404);
                return;
            }
        }

        $this->load->helper('download');
        force_download($fileName, file_get_contents($filePath));
    }
}