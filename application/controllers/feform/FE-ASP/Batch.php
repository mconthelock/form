<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/batch/manual_generate_yearly?controlNo=AMEC-AR-MAR-001&empno=08189&admin_empno=13204
// === http://localhost:8080/form/feform/FE-ASP/batch/manual_generate_yearly?controlNo=AMEC-AR-MAR-001&empno=08189&admin_empno=13204

use GuzzleHttp\Client;
require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/api/webform/form.php';
require_once APPPATH . 'controllers/api/webform/flow.php';
require_once APPPATH . 'controllers/api/webform/formmst.php';
require_once APPPATH . 'controllers/_file.php';

class Batch extends MY_Controller {
    use formApi, flow, formmst;

    public $CodeForm = 'AMEC-AR';

    public function __construct() {
        parent::__construct();
        $this->client = new Client(['verify' => false]);
        
        // 1. โหลด Database Connection เริ่มต้น
        $this->load->database();
        $this->load->library('Mail');
        $this->load->model('form_model', 'frm');

        // 2. โหลด Database SMMT และ DEFAULT
        if (!isset($this->smmt)) {
            $this->smmt = $this->load->database('SMMT', TRUE);
        }
        if (!isset($this->webflow)) {
            $this->webflow = $this->load->database('DEFAULT', TRUE);
        }

        $this->load->model('feform/FE-ASP/Fe_asp_model', 'MainModel');
    }

    /**
     * Logic สร้างเอกสาร Yearly Review (Draft) พร้อมตรวจเช็คความครบถ้วนทุกรายการ
     */
    protected function generateYearlyDrafts($targetControlNo = '', $targetEmpNo = '', $checkDuplicate = true) {
        // 1. ดึง Master Form จากตาราง FORMMST โดยตรง
        $formMst  = $this->getFormMasterByVaname($this->CodeForm);
        $formData = $formMst['data'] ?? ($formMst[0] ?? null);

        if (empty($formData)) {
            $formRow = $this->load->database('DEFAULT', TRUE)
                ->query("SELECT NNO, VORGNO, CYEAR FROM FORMMST WHERE UPPER(TRIM(VANAME)) = ? AND (CSTATUS IS NULL OR CSTATUS <> '0')", [strtoupper(trim($this->CodeForm))])
                ->row_array();

            if (empty($formRow)) {
                throw new Exception("ไม่พบการตั้งค่า Master Form สำหรับ {$this->CodeForm} ในตาราง FORMMST");
            }

            $formData = [
                'NNO'    => (int)$formRow['NNO'],
                'VORGNO' => (string)$formRow['VORGNO'],
                'CYEAR'  => (string)$formRow['CYEAR'], // ดึง CYEAR ของ Master โดยตรง (เช่น '26') ห้ามทับด้วย date('Y')[cite: 4]
            ];
        }

        $currentYear4 = date('Y'); // '2026' สำหรับเทียบรอบปีจริง (CYEAR2)[cite: 3]

        // 2. ดึงรายการ Control No. ทั้งหมดที่ Active
        $controls = $this->MainModel->getAllActiveControlsForYearly($targetControlNo, $currentYear4);
        if (empty($controls)) {
            return [
                'status'  => false,
                'message' => 'ไม่พบรายการ Control No. ที่เปิดใช้งานในระบบ',
                'created' => [],
                'skipped' => []
            ];
        }

        $createdList = [];
        $skippedList = [];
        $smmtDb = $this->load->database('SMMT', TRUE);

        foreach ($controls as $ctrl) {
            $cNo    = $ctrl['CONTROL_NO'];
            $dep    = $ctrl['SDEPCODE'];
            $div    = $ctrl['SDIVCODE'];
            $sec    = $ctrl['SSECCODE'] ?: '00';
            $formNo = (!empty($ctrl['FORMNO']) && $ctrl['FORMNO'] !== '-') ? $ctrl['FORMNO'] : '-';
            $resp   = !empty($targetEmpNo) ? $targetEmpNo : $ctrl['RESP_EMPNO'];

            // เงื่อนไขที่ 1: ตรวจสอบรายการที่ยังไม่ได้กำหนดผู้รับผิดชอบ (RESP_EMPNO)
            if (empty($resp)) {
                $skippedList[] = [
                    'control_no' => $cNo,
                    'dep_code'   => $dep,
                    'empno'      => '-',
                    'reason'     => 'ยังไม่ได้กำหนดผู้รับผิดชอบ (RESP_EMPNO)',
                    'FORMNO'     => $formNo
                ];
                continue;
            }

            // ตรวจสอบเอกสารเดิมที่มีอยู่แล้วในรอบปี (ระดับ Control No. + Department)
            $existDoc = $this->MainModel->getExistingYearlyDoc($cNo, $dep, $currentYear4);
            if ($checkDuplicate && !empty($existDoc)) {
                $statusUpper = strtoupper(trim($existDoc['STATUS'] ?? ''));
                $actualDocNo = !empty($existDoc['DOC_NO']) ? $existDoc['DOC_NO'] : $formNo;

                if ($statusUpper === 'DRAFT') {
                    $reason = "มีเอกสารค้างดำเนินการ (DRAFT)";
                } elseif ($statusUpper === 'APPROVE' || $statusUpper === 'APPROVED') {
                    $reason = "มีเอกสารดำเนินการเสร็จสิ้นแล้ว (APPROVED)";
                } else {
                    $reason = "มีเอกสาร Yearly ในรอบปี {$currentYear4} อยู่แล้ว (สถานะ: {$statusUpper})";
                }

                $skippedList[] = [
                    'control_no' => $cNo,
                    'dep_code'   => $dep,
                    'empno'      => $resp,
                    'reason'     => $reason,
                    'FORMNO'     => $actualDocNo
                ];
                continue;
            }

            // เริ่ม Transaction ทั้งฝั่ง Webflow และ SMMT
            $this->db->trans_begin();
            $smmtDb->trans_begin();

            try {
                // 3. สั่งสร้าง Form บน Flow โดยส่ง Key Master จริง (NNO, VORGNO, CYEAR)
                $flowData = [
                    'NFRMNO'  => $formData['NNO'],
                    'VORGNO'  => $formData['VORGNO'],
                    'CYEAR'   => $formData['CYEAR'], // ส่งปีคงที่ของ Master ฟอร์ม[cite: 4]
                    'REQBY'   => $resp,
                    'INPUTBY' => $resp,
                    'REMARK'  => 'Yearly Review (Auto Generated)',
                    'DRAFT'   => '1'
                ];

                $rsf = $this->createForm($flowData);
                if (!$rsf || empty($rsf['status'])) {
                    $errMsg = is_array($rsf) ? json_encode($rsf, JSON_UNESCAPED_UNICODE) : 'Create Form Failed';
                    throw new Exception("Webflow Error: " . $errMsg);
                }

                $cyear2Return = $rsf['data']['CYEAR2'] ?? $currentYear4; // ปีเอกสาร (2026)[cite: 3]
                $nrunno       = $rsf['data']['NRUNNO'];
                $docNo        = $this->CodeForm ."-" . $cyear2Return . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);

                // 4. บันทึก Header ตาราง FE_ASP_HEADER
                $headerData = [
                    'DOC_NO'           => $docNo,
                    'CONTROL_NO'       => $cNo,
                    'SDIVCODE'         => $div,
                    'SDEPCODE'         => $dep,
                    'SSECCODE'         => $sec,
                    'NFRMNO'           => $formData['NNO'],
                    'VORGNO'           => $formData['VORGNO'],
                    'CYEAR'            => $formData['CYEAR'],      // CYEAR Master[cite: 3]
                    'CYEAR2'           => $cyear2Return,           // CYEAR2 ปีที่สร้างจริง (2026)[cite: 3]
                    'NRUNNO'           => $nrunno,
                    'REQ_BY'           => $resp,
                    'INPUT_BY'         => $resp,
                    'REVIEW_PERIOD'    => 'YEARLY',
                    'REVIEW_DETAILS'   => 'NO_CHANGE',
                    'DETAIL_OF_CHANGE' => '',
                    'EFFECT_STATUS'    => 'NO_EFFECT',
                    'STATUS'           => 'DRAFT',
                    'CREATE_MODE'      => 'AUTO',
                    'IS_AUTO_JOB'      => 'Y',
                    'USER_ACTION'      => $resp,
                    'REMARK'           => 'Yearly Review Draft (รอพนักงานยืนยันข้อมูล)',
                ];

                $headerId = $this->MainModel->insertHeader($headerData);

                if ($this->db->trans_status() === FALSE || $smmtDb->trans_status() === FALSE) {
                    throw new Exception('เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล');
                }

                $this->db->trans_commit();
                $smmtDb->trans_commit();

                $itemData = [
                    'doc_no'     => $docNo,
                    'header_id'  => $headerId,
                    'control_no' => $cNo,
                    'dep_code'   => $dep,
                    'empno'      => $resp,
                    'nfrmno'     => $formData['NNO'],
                    'vorgno'     => $formData['VORGNO'],
                    'cyear'      => $formData['CYEAR'],
                    'cyear2'     => $cyear2Return,
                    'nrunno'     => $nrunno,
                    'FORMNO'     => $docNo
                ];

                $createdList[] = $itemData;

                // 5. ส่ง Email แจ้งเตือนพนักงาน (ส่งหลังจาก Commit สำเร็จแล้วเท่านั้น)
                $this->sendNotifyEmailToPic($itemData, $formData);

            } catch (\Throwable $e) {
                $this->db->trans_rollback();
                $smmtDb->trans_rollback();

                $skippedList[] = [
                    'control_no' => $cNo,
                    'dep_code'   => $dep,
                    'empno'      => $resp,
                    'reason'     => $e->getMessage(),
                    'FORMNO'     => $formNo
                ];
            }
        }

        // 6. ส่ง Email สรุปภาพรวมความครบถ้วนให้ Admin เมื่อประมวลผลเสร็จสิ้น
        $this->sendSummaryReportToAdmin($createdList, $skippedList, $currentYear4);

        return [
            'status'  => true,
            'created' => $createdList,
            'skipped' => $skippedList
        ];
    }

    /**
     * Endpoint สำหรับกดส่ง Email แจ้งเตือน Yearly ซ้ำ (รายตัว หรือ ทั้งหมด)
     */
    public function resend_yearly_email() {
        $this->output->set_content_type('application/json');

        $controlNo    = trim((string)$this->input->post('controlNo'));
        $currentAdmin = trim((string)($this->input->post('admin_empno') ?? $this->input->post('empno')));

        $isAdmin = ($currentAdmin === '13204') || (!empty($currentAdmin) && $this->MainModel->isFormAdmin($this->CodeForm, $currentAdmin));
        if (!$isAdmin) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => 'Access Denied: เฉพาะ Admin เท่านั้นที่สามารถสั่งส่ง Email ซ้ำได้'
            ], JSON_UNESCAPED_UNICODE));
        }

        try {
            // ดึง Master Form เพื่ออ่านข้อมูลฟอร์ม
            $formMst  = $this->getFormMasterByVaname($this->CodeForm);
            $formData = $formMst['data'] ?? ($formMst[0] ?? null);
            if (empty($formData)) {
                $formRow = $this->load->database('DEFAULT', TRUE)
                    ->query("SELECT NNO, VORGNO, CYEAR FROM FORMMST WHERE UPPER(TRIM(VANAME)) = ? AND (CSTATUS IS NULL OR CSTATUS <> '0')", [strtoupper(trim($this->CodeForm))])
                    ->row_array();
                $formData = [
                    'NNO'    => (int)($formRow['NNO'] ?? 1),
                    'VORGNO' => (string)($formRow['VORGNO'] ?? '051001'),
                    'CYEAR'  => (string)($formRow['CYEAR'] ?? '26'),
                ];
            }

            $currentYear4 = date('Y'); // '2026' สำหรับเทียบ CYEAR2[cite: 3]

            // 1. Query ค้นหาเอกสาร Yearly ที่ถูกสร้างไว้แล้วในรอบปีนี้
            $smmtDb = $this->load->database('SMMT', TRUE);
            $sql = "SELECT 
                        H.DOC_NO,
                        H.CONTROL_NO,
                        H.SDEPCODE AS DEP_CODE,
                        H.REQ_BY   AS EMPNO,
                        H.NFRMNO,
                        H.VORGNO,
                        H.CYEAR,
                        H.CYEAR2,
                        H.NRUNNO
                    FROM SMARTMAT.FE_ASP_HEADER H
                    WHERE H.CYEAR2 = ?
                      AND H.REVIEW_PERIOD = 'YEARLY'
                      AND H.STATUS NOT IN ('REJECT', 'CANCEL', '0')";

            $params = [(string)$currentYear4];
            if (!empty($controlNo)) {
                $sql .= " AND H.CONTROL_NO = ?";
                $params[] = $controlNo;
            }

            $docs = $smmtDb->query($sql, $params)->result_array();

            if (empty($docs)) {
                return $this->output->set_output(json_encode([
                    'status'  => false,
                    'message' => "ไม่พบเอกสาร Yearly Review ประจำปี {$currentYear4} ที่สามารถส่งอีเมลได้"
                ], JSON_UNESCAPED_UNICODE));
            }

            $sentSuccessList = [];
            $skippedList     = [];

            // 2. วนลูปส่ง Email แจ้งเตือนไปยัง PIC แต่ละเอกสาร
            foreach ($docs as $d) {
                $item = [
                    'doc_no'     => $d['DOC_NO'],
                    'control_no' => $d['CONTROL_NO'],
                    'dep_code'   => $d['DEP_CODE'],
                    'empno'      => $d['EMPNO'],
                    'nfrmno'     => $d['NFRMNO'],
                    'vorgno'     => $d['VORGNO'],
                    'cyear'      => $d['CYEAR'],
                    'cyear2'     => $d['CYEAR2'],
                    'nrunno'     => $d['NRUNNO'],
                    'FORMNO'     => $d['DOC_NO']
                ];

                if ($this->sendNotifyEmailToPic($item, $formData)) {
                    $sentSuccessList[] = $item;
                } else {
                    $skippedList[] = [
                        'control_no' => $d['CONTROL_NO'],
                        'dep_code'   => $d['DEP_CODE'],
                        'empno'      => $d['EMPNO'],
                        'reason'     => 'คำสั่งส่งเมลแจ้งเตือนล้มเหลว หรือไม่พบข้อมูลอีเมลผู้รับ',
                        'FORMNO'     => $d['DOC_NO']
                    ];
                }
            }

            // 3. รวบรวม Control No. ที่ Active แต่ยังไม่ได้สร้างเอกสาร หรือยังไม่กำหนด PIC
            $allActiveControls  = $this->MainModel->getAllActiveControlsForYearly($controlNo, $currentYear4);
            $existingControlNos = array_column($docs, 'CONTROL_NO');

            foreach ($allActiveControls as $ctrl) {
                if (!in_array($ctrl['CONTROL_NO'], $existingControlNos)) {
                    $skippedList[] = [
                        'control_no' => $ctrl['CONTROL_NO'],
                        'dep_code'   => $ctrl['SDEPCODE'],
                        'empno'      => !empty($ctrl['RESP_EMPNO']) ? $ctrl['RESP_EMPNO'] : '-',
                        'reason'     => empty($ctrl['RESP_EMPNO']) 
                            ? 'ยังไม่ได้กำหนดผู้รับผิดชอบ (RESP_EMPNO)' 
                            : "ยังไม่ได้สร้างเอกสาร Yearly ในรอบปี {$currentYear4}",
                        'FORMNO'     => $ctrl['FORMNO'] ?? '-'
                    ];
                }
            }

            // 4. ส่ง Email รายงานสรุปภาพรวมให้ Admin
            $this->sendSummaryReportToAdmin($sentSuccessList, $skippedList, $currentYear4);

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => "ส่ง Email แจ้งเตือนซ้ำสำเร็จ (" . count($sentSuccessList) . "/" . count($docs) . " ฉบับ) พร้อมส่งรายงานสรุปให้ Admin เรียบร้อยแล้ว",
                'created' => $sentSuccessList,
                'skipped' => $skippedList
            ], JSON_UNESCAPED_UNICODE));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => 'เกิดข้อผิดพลาดในการส่งอีเมลซ้ำ: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE));
        }
    }

    /**
     * Cron Job / รัน Yearly ทั้งหมด
     */
    public function run_yearly_cron() {
        $isCli = $this->input->is_cli_request();
        $empno = trim((string)($this->input->get_post('empno') ?? $this->input->get_post('admin_empno')));

        if (!$isCli) {
            $isAdmin = ($empno === '13204') || (!empty($empno) && $this->MainModel->isFormAdmin($this->CodeForm, $empno));
            if (!$isAdmin) {
                return $this->output->set_content_type('application/json')->set_output(json_encode([
                    'status'  => false,
                    'message' => 'Access Denied: เฉพาะ Admin เท่านั้นที่สามารถรันฟังก์ชันนี้ได้'
                ], JSON_UNESCAPED_UNICODE));
            }
        }

        try {
            $result = $this->generateYearlyDrafts();
            
            if ($isCli) {
                echo "Yearly Auto-Job Finished.\n";
                echo "Created: " . count($result['created']) . "\n";
                echo "Skipped: " . count($result['skipped']) . "\n";
            } else {
                return $this->output->set_content_type('application/json')->set_output(
                    json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
                );
            }
        } catch (\Throwable $e) {
            if ($isCli) {
                echo "Error: " . $e->getMessage() . "\n";
            } else {
                return $this->output->set_content_type('application/json')->set_output(
                    json_encode(['status' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE)
                );
            }
        }
    }

    /**
     * Manual Trigger รายตัว ผ่าน URL หรือ AJAX
     */
    public function manual_generate_yearly() {
        $this->output->set_content_type('application/json');

        $controlNo    = trim((string)$this->input->get_post('controlNo'));
        $targetEmpNo  = trim((string)$this->input->get_post('empno'));
        $currentAdmin = trim((string)($this->input->get_post('admin_empno') ?? ''));
        $forceCreate  = (int)($this->input->get_post('forceCreate') ?? 0);

        $isAdmin = ($currentAdmin === '13204') || (!empty($currentAdmin) && $this->MainModel->isFormAdmin($this->CodeForm, $currentAdmin));
        if (!$isAdmin) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => 'Access Denied: เฉพาะ Admin เท่านั้นที่สามารถสั่งสร้างเอกสาร Yearly Review ได้'
            ], JSON_UNESCAPED_UNICODE));
        }

        if (empty($controlNo)) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => 'กรุณาระบุ controlNo'
            ], JSON_UNESCAPED_UNICODE));
        }

        try {
            // หาก forceCreate = 1 จะตั้ง $checkDuplicate = false เพื่อข้ามการดักซ้ำ
            $checkDuplicate = ($forceCreate === 1) ? false : true;

            $result = $this->generateYearlyDrafts($controlNo, $targetEmpNo, $checkDuplicate);

            if (!empty($result['created'])) {
                $doc = $result['created'][0];
                return $this->output->set_output(json_encode([
                    'status'       => true,
                    'message'      => 'สร้างแบบร่างเอกสาร Yearly สำเร็จ',
                    'data'         => $doc,
                    'redirect_url' => site_url("feform/FE-ASP/form/main?no={$doc['nfrmno']}&orgNo={$doc['vorgno']}&y={$doc['cyear']}&y2={$doc['cyear2']}&runNo={$doc['nrunno']}&empno={$currentAdmin}")
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            } else {
                return $this->output->set_output(json_encode([
                    'status'  => false,
                    'message' => 'ไม่สามารถสร้างเอกสารได้: ' . ($result['skipped'][0]['reason'] ?? 'มีเอกสารในระบบอยู่แล้ว')
                ], JSON_UNESCAPED_UNICODE));
            }
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE));
        }
    }

    /**
     * ส่ง Email แจ้งเตือน PIC ว่ามีแบบร่าง Yearly Review ถูกสร้างขึ้นแล้ว
     */
    protected function sendNotifyEmailToPic($item, $formData) {
        try {
            $user = $this->MainModel->getEmployeeEmail($item['empno']);

            $realEmail = $user['SRECMAIL'] ?? ($user['SEMAIL'] ?? '');
            if (empty($realEmail)) {
                $realEmail = $item['empno'] . '@mitsubishielevatorasia.co.th';
            }

            $empName   = $user['SNAME'] ?? ('Employee ' . $item['empno']);
            $docNo     = $item['doc_no'];
            $cNo       = $item['control_no'];
            $dept      = $item['dep_code'];

            $toEmail   = $this->getTargetEmail($realEmail);
            $isTest    = $this->isTestEnvironment();

            $curHost  = prep_url($_SERVER['HTTP_HOST'] ?? 'amecweb');
            $backPath = rawurlencode('/formtest/workflow/mineList.asp');
            $docUrl   = rtrim($curHost, '/') . "/form/feform/FE-ASP/form/main?no={$item['nfrmno']}&orgNo={$item['vorgno']}&y={$item['cyear']}&y2={$item['cyear2']}&runNo={$item['nrunno']}&empno={$item['empno']}&bp={$backPath}&menu=1";

            $prefixSubject = $isTest ? "[TEST ENV - ส่งจริงถึง: {$realEmail}] " : "";
            $subject = "{$prefixSubject}[" .  $this->CodeForm . "] แจ้งดำเนินการทบทวนเอกสารประจำปี (Yearly Review) - {$docNo}";

            $testNotice = $isTest 
                ? "<div style='background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 12px;'>
                       ⚠️ <b>[TEST ENVIRONMENT NOTICE]</b> อีเมลฉบับนี้ถูกส่งจากระบบทดสอบ และเปลี่ยนเป้าหมายมาที่ <b>siripapa@mitsubishielevatorasia.co.th</b> (อีเมลจริงของ PIC: {$realEmail})
                   </div>" 
                : "";

            $body = "
                <div style='font-family: Tahoma, sans-serif; font-size: 13px; line-height: 1.6; color: #333;'>
                    {$testNotice}
                    <h3 style='color: #047857;'>🌿 แจ้งเตือนการจัดทำเอกสารประจำปี (". $this->CodeForm ." Yearly Review)</h3>
                    <p>เรียนคุณ <b>{$empName} ({$item['empno']})</b>,</p>
                    <p>ระบบได้ทำการสร้างแบบร่าง (Draft) สำหรับการทบทวนความเสี่ยงและปัญหาสิ่งแวดล้อมประจำปี (ISO14001) เรียบร้อยแล้ว รายละเอียดดังนี้:</p>
                    <table style='border-collapse: collapse; margin: 15px 0; font-size: 13px;'>
                        <tr><td style='padding: 4px 8px; font-weight: bold;'>เลขที่เอกสาร:</td><td style='padding: 4px 8px; color: #047857;'><b>{$docNo}</b></td></tr>
                        <tr><td style='padding: 4px 8px; font-weight: bold;'>Control No.:</td><td style='padding: 4px 8px;'>{$cNo}</td></tr>
                        <tr><td style='padding: 4px 8px; font-weight: bold;'>สังกัดแผนก:</td><td style='padding: 4px 8px;'>{$dept}</td></tr>
                        <tr><td style='padding: 4px 8px; font-weight: bold;'>สถานะปัจจุบัน:</td><td style='padding: 4px 8px;'><span style='background:#fef3c7; color:#92400e; padding: 2px 6px; border-radius: 4px;'>DRAFT (รอการทบทวน)</span></td></tr>
                    </table>
                    <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อเข้าสู่ระบบ ดำเนินการประเมินตาราง Confirmation แนบไฟล์ฉบับทบทวน และส่งอนุมัติต่อไป:</p>
                    <p style='margin: 20px 0;'>
                        <a href='{$docUrl}' target='_blank' style='background: #059669; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>
                            👉 เปิดดูเอกสารแบบร่าง ({$docNo})
                        </a>
                    </p>
                    <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;'>
                    <p style='font-size: 11px; color: #64748b;'>ข้อความนี้ถูกส่งจากระบบอัตโนมัติ AMEC Webflow (Environmental Aspect and Risk Evaluation System) กรุณาอย่าตอบกลับอีเมลนี้</p>
                </div>
            ";

            if (!isset($this->mail)) {
                $this->load->library('Mail');
            }

            $dataM = [
                'SUBJECT' => $subject,
                'TO'      => $toEmail,
                'CC'      => '',
                'BODY'    => [$body]
            ];

            return $this->mail->sendmail($dataM);

        } catch (\Throwable $e) {
            log_message('error', $this->CodeForm . ' Send Email Error: ' . $e->getMessage());
        }
        return false;
    }
    
    /**
     * ส่ง Email สรุปผลภาพรวมความครบถ้วนให้ Admin
     */
    protected function sendSummaryReportToAdmin($createdList, $skippedList, $cYear2) {
        try {
            $isTest = $this->isTestEnvironment();
            $adminEmails = [];

            if ($isTest) {
                $adminEmails = ['siripapa@mitsubishielevatorasia.co.th'];
            } else {
                $admins = $this->MainModel->getAdminEmails();
                foreach ($admins as $adm) {
                    $m = $adm['SRECMAIL'] ?? ($adm['SEMAIL'] ?? '');
                    if (!empty($m)) $adminEmails[] = $m;
                }

                $super = $this->MainModel->getEmployeeEmail('13204');
                $superMail = $super['SRECMAIL'] ?? ($super['SEMAIL'] ?? '');
                if (!empty($superMail)) $adminEmails[] = $superMail;

                $adminEmails = array_unique(array_filter($adminEmails));
            }

            if (empty($adminEmails)) return false;

            $totalCreated = count($createdList);
            $totalSkipped = count($skippedList);

            $prefixSubject = $isTest ? "[TEST ENV] " : "";
            $subject = "{$prefixSubject}[" . $this->CodeForm ." Admin Summary] สรุปผลการสร้างเอกสาร Yearly Review ประจำปี {$cYear2}";

            $testNotice = $isTest 
                ? "<div style='background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 12px;'>
                       ⚠️ <b>[TEST ENVIRONMENT NOTICE]</b> อีเมลฉบับนี้ส่งจากระบบทดสอบ
                   </div>" 
                : "";

            $body = "
                <div style='font-family: Tahoma, sans-serif; font-size: 13px; line-height: 1.6; color: #333;'>
                    {$testNotice}
                    <h3 style='color: #1e3a8a;'>📊 สรุปผลการสร้างเอกสาร Yearly Review ประจำปี {$cYear2}</h3>
                    <p>รายงานผลการรัน Batch Auto Job ในระบบ ". $this->CodeForm ." มีรายละเอียดดังนี้:</p>
                    <ul>
                        <li><b>ส่ง Email สำเร็จ :</b> <span style='color: #059669; font-weight: bold;'>{$totalCreated} ฉบับ</span></li>
                        <li><b>ยังไม่ได้สร้าง / อยู่ใน Process :</b> <span style='color: #dc2626; font-weight: bold;'>{$totalSkipped} รายการ</span></li>
                    </ul>
            ";

            if ($totalSkipped > 0) {
                $body .= "
                    <h4 style='color: #b91c1c; margin-top: 15px;'>⚠️ รายการที่ไม่ได้สร้าง / มีเอกสารเดิมอยู่แล้ว (กรุณาตรวจสอบ):</h4>
                    <table border='1' cellpadding='6' cellspacing='0' style='border-collapse: collapse; font-size: 12px; width: 100%; border-color: #cbd5e1;'>
                        <tr style='background: #f1f5f9;'>
                            <th style='width: 40px;'>No.</th>
                            <th>Control No.</th>
                            <th>แผนก</th>
                            <th>PIC (พนักงาน)</th>
                            <th>สาเหตุ</th>
                            <th>Doc No</th>
                        </tr>";
                $i = 0;
                foreach ($skippedList as $sk) {
                    $i++;
                    $docDisplay = (!empty($sk['FORMNO']) && $sk['FORMNO'] !== '-') 
                        ? "<b style='color: #047857;'>{$sk['FORMNO']}</b>" 
                        : "<span style='color: #94a3b8;'>-</span>";

                    $body .= "
                        <tr>
                            <td align='center'>{$i}</td>
                            <td>{$sk['control_no']}</td>
                            <td>" . ($sk['dep_code'] ?? '-') . "</td>
                            <td>{$sk['empno']}</td>
                            <td style='color: #dc2626;'>{$sk['reason']}</td>
                            <td>{$docDisplay}</td>
                        </tr>";
                }
                $body .= "</table>";
            }

            $body .= "
                    <p style='margin-top: 20px;'>ผู้ดูแลระบบสามารถตรวจสอบสถานะรายฉบับได้ที่หน้าจอ Master Control Configuration</p>
                </div>
            ";

            if (!isset($this->mail)) {
                $this->load->library('Mail');
            }

            $dataM = [
                'SUBJECT' => $subject,
                'TO'      => implode(',', $adminEmails),
                'CC'      => '',
                'BODY'    => [$body]
            ];

            return $this->mail->sendmail($dataM);

        } catch (\Throwable $e) {
            log_message('error', $this->CodeForm .' Admin Summary Email Error: ' . $e->getMessage());
        }
        return false;
    }

    /**
     * ตรวจสอบว่าระบบกำลังรันอยู่บน Test Environment หรือไม่
     */
    protected function isTestEnvironment() {
        if ($this->input->is_cli_request()) {
            return false;
        }

        $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
        $baseUrl = strtolower(config_item('base_url') ?? '');

        return (
            strpos($host, 'localhost') !== false ||
            strpos($host, '127.0.0.1') !== false ||
            strpos($host, 'amecwebtest') !== false ||
            strpos($baseUrl, 'localhost') !== false ||
            strpos($baseUrl, '127.0.0.1') !== false ||
            strpos($baseUrl, 'amecwebtest') !== false
        );
    }

    /**
     * กำหนดอีเมลผู้รับ: หากเป็น Test ให้ส่งเข้าอีเมลทดสอบ
     */
    protected function getTargetEmail($originalEmail) {
        $testEmail = 'siripapa@MitsubishiElevatorAsia.co.th';
        return $this->isTestEnvironment() ? $testEmail : $originalEmail;
    }

    /**
     * AJAX Endpoint สำหรับทดสอบส่ง Email โดยใช้ข้อมูลจริงจาก Form หน้าจอ
     */
    public function ajax_test_send_email() {
        $this->output->set_content_type('application/json');

        try {
            $nfrmno    = trim((string)$this->input->post('NFRMNO'));
            $vorgno    = trim((string)$this->input->post('VORGNO'));
            $cyear     = trim((string)$this->input->post('CYEAR'));
            $cyear2    = trim((string)$this->input->post('CYEAR2'));
            $nrunno    = trim((string)$this->input->post('NRUNNO'));
            $docNo     = trim((string)$this->input->post('DOC_NO'));
            $empNo     = trim((string)$this->input->post('empno')) ?: '13204';
            $controlNo = trim((string)$this->input->post('controlNo'));

            if (empty($nrunno)) {
                throw new Exception('ไม่พบค่า NRUNNO กรุณาบันทึกเอกสารร่างก่อนทำการทดสอบส่งอีเมล');
            }

            if (empty($docNo)) {
                $docNo = $this->CodeForm."-{$cyear2}-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);
            }

            $ctrlInfo = !empty($controlNo) ? $this->MainModel->getAllActiveControlsForYearly($controlNo, $cyear2) : [];
            $targetCtrl = !empty($ctrlInfo) ? $ctrlInfo[0] : null;

            $dept = $targetCtrl['SDEPCODE'] ?? $vorgno;
            $resp = !empty($targetCtrl['RESP_EMPNO']) ? $targetCtrl['RESP_EMPNO'] : $empNo;

            $item = [
                'doc_no'     => $docNo,
                'control_no' => $controlNo ?: ($targetCtrl['CONTROL_NO'] ?? '-'),
                'dep_code'   => $dept,
                'empno'      => $resp,
                'nfrmno'     => $nfrmno,
                'vorgno'     => $vorgno,
                'cyear'      => $cyear,
                'cyear2'     => $cyear2,
                'nrunno'     => $nrunno
            ];

            $formData = [
                'NNO'    => $nfrmno,
                'VORGNO' => $vorgno ?: '051001',
                'CYEAR'  => $cyear
            ];

            $isSent = $this->sendNotifyEmailToPic($item, $formData);

            if ($isSent) {
                return $this->output->set_output(json_encode([
                    'status'  => true,
                    'message' => "ส่ง Email แจ้งเตือนเอกสาร {$docNo} ไปยัง siripapa@mitsubishielevatorasia.co.th สำเร็จแล้ว",
                    'data'    => $item
                ], JSON_UNESCAPED_UNICODE));
            } else {
                throw new Exception("คำสั่ง sendmail คืนค่า false (อาจเกิดข้อผิดพลาดในระบบ Mail Relay)");
            }

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => 'เกิดข้อผิดพลาดในการทดสอบส่ง Email: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE));
        }
    }
}