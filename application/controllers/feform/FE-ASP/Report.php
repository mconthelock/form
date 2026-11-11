<?php

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

class Report extends MY_Controller {
    use formApi, flow, formmst;

    public $CodeForm = 'AMEC-AR';
    public $client;
    public $SmmtBase;
    public $webflowBase;

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->library('Mail');
        $this->load->model('form_model', 'frm');
        $this->load->model('feform/FE-ASP/Fe_asp_model', 'MainModel');
        
        
        $this->load->model('feform/FE-DOC/edoc_model', 'DocModel');

        // กำหนด Guzzle Client สำหรับเรียก formmst และ Webflow API
        $this->client = new Client(['verify' => false]);

        // กำหนดชื่อเชื่อมต่อฐานข้อมูล
        $this->SmmtBase    = 'SMMT';
        $this->webflowBase = 'DEFAULT';
    }

    public function index($uid = null)
    {
        // 1. ดึงจาก URI Segment parameter ก่อน ($uid)
        $empno = $uid;

        // 2. ถ้ามาในรูปแบบ "uid=13204" ใน URI Segment ให้ตัดเอาเฉพาะตัวเลข
        if (!empty($empno) && strpos($empno, 'uid=') !== false) {
            $empno = str_replace('uid=', '', $empno);
        }

        // 3. ถ้าไม่มีใน URI Segment ให้ลองหาจาก Query String (?uid=... หรือ ?empno=...)
        if (empty($empno)) {
            $empno = $this->input->get('uid') 
                  ?? $this->input->get('empno') 
                  ?? '';
        }

        // คลีนค่ารหัสพนักงาน
        $empno = trim((string)$empno);
        $data['EMPNO'] = (string)$empno;

        // คำนวณ Fiscal Year ปัจจุบัน (เม.ย. - มี.ค. ของปีถัดไป)
        $currentMonth = (int)date('n');
        $currentCalYear = (int)date('Y');
        $currentFY = ($currentMonth < 4) ? ($currentCalYear - 1) : $currentCalYear;

        // สร้างรายการรอบปี 10 ปีย้อนหลัง
        $fiscalYears = [];
        for ($i = 0; $i < 10; $i++) {
            $fy = $currentFY - $i;
            $nextY = $fy + 1;
            $shortFy = substr((string)$fy, -2);
            $shortNextY = substr((string)$nextY, -2);
            
            $fiscalYears[] = [
                'year'       => (string)$fy,
                'label'      => "FY {$fy} (เม.ย. {$shortFy} - มี.ค. {$shortNextY})",
                'isSelected' => ($i === 0)
            ];
        }

        $data['currentFY']   = (string)$currentFY;
        $data['fiscalYears'] = $fiscalYears;
        $data['divisions']   = $this->MainModel->getAllDivisions();
        $data['departments'] = $this->MainModel->getAllDepartmentsList();

        $this->views('feform/FE-ASP/report', $data);
    }
    

    public function ajaxGetReportData() {
        $this->output->set_content_type('application/json');
        try {
            $filters = [
                'docNo'      => $this->input->get('docNo'),
                'status'     => $this->input->get('status'),
                'divCode'    => $this->input->get('divCode'),
                'depCode'    => $this->input->get('depCode'),
                'fiscalYear' => $this->input->get('fiscalYear'),
                'reviewPeriod' => $this->input->get('reviewPeriod'),
                'startDate'  => $this->input->get('startDate'),
                'endDate'    => $this->input->get('endDate'),
            ];

            $records = $this->MainModel->getReportData($filters);

            return $this->output->set_output(json_encode([
                'status' => true,
                'data'   => $records ?: []
            ], JSON_UNESCAPED_UNICODE));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE));
        }
    }

    public function ajaxCheckYearlyProgress() {
        $this->output->set_content_type('application/json');
        try {
            $fy = $this->input->get('fiscalYear') ?: date('Y');
            $summary = $this->MainModel->checkYearlyBatchCompleted($fy);

            // ดึงเอกสาร FE-DOC ใบที่มี Max Revision ของรอบปีนี้
            $feDoc = $this->MainModel->getExistingFeDocForYear($fy);
            if (!empty($feDoc)) {
                $summary['feDocInfo'] = [
                    'docNo'       => $feDoc['DOC_NO'],
                    'docRevision' => $feDoc['DOC_REVISION'] ?? '*',
                    'status'      => $feDoc['STATUS'],
                    'docUrl'      => base_url("feform/FE-DOC/form/main?no={$feDoc['NFRMNO']}&orgNo={$feDoc['VORGNO']}&y={$feDoc['CYEAR']}&y2={$feDoc['CYEAR2']}&runNo={$feDoc['NRUNNO']}&m=3")
                ];
            } else {
                $summary['feDocInfo'] = null;
            }

            return $this->output->set_output(json_encode(['status' => true, 'data' => $summary]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function ajaxGetControlHistory() {
        $this->output->set_content_type('application/json');
        try {
            $controlNo = trim((string)$this->input->get('controlNo'));
            if (empty($controlNo)) throw new Exception('ไม่พบรหัส Control No.');

            $history = $this->MainModel->getDocHistoryByControlNo($controlNo);

            return $this->output->set_output(json_encode([
                'status' => true,
                'data'   => $history
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }
    



    /**
     * AJAX Endpoint: เรียกจากหน้า Report (ปุ่มตรวจสอบรอบปี & สร้าง FE-DOC)
     */
    public function ajaxTriggerYearlyReviewAndFeDoc() {
        $this->output->set_content_type('application/json');
        try {
            $fiscalYear = trim((string)($this->input->post('fiscalYear') ?: date('Y')));
            $currentEmp = trim((string)($this->input->post('empno') ?: '13204'));

            // // 1. ตรวจสอบว่าเคยสร้างเอกสาร FE-DOC ประจำรอบปีนี้ไปแล้วหรือไม่
            // $existingDoc = $this->MainModel->getExistingFeDocForYear($fiscalYear);
            // if (!empty($existingDoc)) {
            //     $docUrl = base_url("feform/FE-DOC/form/main?no={$existingDoc['NFRMNO']}&orgNo={$existingDoc['VORGNO']}&y={$existingDoc['CYEAR']}&y2={$existingDoc['CYEAR2']}&runNo={$existingDoc['NRUNNO']}&m=3");
            //     return $this->output->set_output(json_encode([
            //         'status'      => true,
            //         'alreadyDone' => true,
            //         'message'     => "เอกสาร FE-DOC ประจำรอบปี FY{$fiscalYear} ถูกสร้างไว้แล้ว ({$existingDoc['DOC_NO']})",
            //         'docNo'       => $existingDoc['DOC_NO'],
            //         'docUrl'      => $docUrl
            //     ]));
            // }

            // 2. เรียกใช้ฟังก์ชันแกนกลางตัวเดียวกัน
            $resData = $this->createFeDocAndExcelInternal($fiscalYear, '');

            return $this->output->set_output(json_encode([
                'status'    => true,
                'message'   => "สร้างเอกสาร FE-DOC ({$resData['docNo']}) เรียบร้อยแล้ว กำลังอัปโหลดไฟล์สรุปผ่านระบบ...",
                'docNo'     => $resData['docNo'],
                'docUrl'    => $resData['docUrl'],
                'feDocKeys' => $resData['feDocKeys'],
                'excelFile' => $resData['excelFile']
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
            ]));
        }
    }

    /**
     * ฟังก์ชันแกนกลางสร้าง FE-DOC และ Excel จาก Template (ใช้ร่วมกันทั้ง Report และ Form ตอน Approve)
     */
    public function createFeDocAndExcelInternal($fiscalYear, $currentEmp = '') {
        // 1. คำนวณ Revision ถัดไป
        $nextRevision = $this->MainModel->getNextYearlySummaryRevision();

        // 2. ส่ง Revision เข้าไปหยอดที่ช่อง C4 ของ Excel
        $excelInfo = $this->generateYearlySummaryExcel($fiscalYear, $nextRevision);
        if (!$excelInfo || empty($excelInfo['fileName'])) {
            throw new Exception("ไม่มีทบทวนประเมินสิ่งแวดล้อมประจำปี (Environmental Aspect Yearly Review) รอบปี FY{$fiscalYear} หรือไม่สามารถสร้างไฟล์ Excel ได้");
        }

        // 3. ดึง Master Form ของ FE-DOC
        $formmst = $this->getFormMasterByVaname('FE-DOC');
        $data['NFRMNO'] = $formmst['data']['NNO'] ?? $formmst[0]->NNO;
        $data['VORGNO'] = $formmst['data']['VORGNO'] ?? $formmst[0]->VORGNO;
        $data['CYEAR']  = $formmst['data']['CYEAR'] ?? $formmst[0]->CYEAR;

        $docTypeCode = 'AMEC-AS';
        $docSubject  = "ทบทวนประเมินสิ่งแวดล้อมประจำปี (Environmental Aspect Yearly Review) FY{$fiscalYear}";

        // ดึง EMPNO จาก FE_FORM_ADMIN (FE-ASP-COVERYEARLY) เป็น Requester ของฟอร์ม FE-DOC
        $requesterEmpNo = $this->MainModel->getYearlyCoverAdminEmpNo();
        if (empty($requesterEmpNo)) {
            $requesterEmpNo = !empty($currentEmp) ? $currentEmp : '24010';
        }

        // 4. รัน Webflow สร้าง Form FE-DOC
        $flowData = [
            'NFRMNO'  => $data['NFRMNO'],
            'VORGNO'  => $data['VORGNO'],
            'CYEAR'   => $data['CYEAR'],
            'REQBY'   => $requesterEmpNo,
            'INPUTBY' => $requesterEmpNo,
            'DRAFT'   => '1',
            'REMARK'  => "ระบบสร้างเอกสารทบทวนรอบปี FY{$fiscalYear} อัตโนมัติ พร้อมไฟล์สรุป Excel เพื่อส่งผู้รับผิดชอบดำเนินการ",
        ];

        $rsf = $this->createForm($flowData);
        if (!$rsf || empty($rsf['status'])) {
            throw new Exception("สร้างเอกสาร Webflow FE-DOC ไม่สำเร็จ: " . ($rsf['message'] ?? ''));
        }

        $cyear2      = $rsf['data']['CYEAR2'];
        $nrunno      = $rsf['data']['NRUNNO'];
        $docNo       = "FE-DOC-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);
        $docHeaderId = date('Ymd') . str_pad($nrunno, 4, '0', STR_PAD_LEFT);

        // 5. กรอง Flow Step ตาม Logic ของ FE-DOC
        $activeSteps = $this->DocModel->getStepsByDocType($docTypeCode);
        $validExtDataList = [];
        foreach ($activeSteps as $st) {
            if (!empty($st->CEXTDATA) && trim($st->CEXTDATA) !== '00') {
                $validExtDataList[] = trim($st->CEXTDATA);
            }
        }

        $dbWebflow = $this->load->database($this->webflowBase, TRUE);
        $dbWebflow->where('NFRMNO', $data['NFRMNO'])
                  ->where('VORGNO', $data['VORGNO'])
                  ->where('CYEAR', $data['CYEAR'])
                  ->where('CYEAR2', $cyear2)
                  ->where('NRUNNO', $nrunno)
                  ->where("CEXTDATA != '00'");

        if (!empty($validExtDataList)) {
            $dbWebflow->where_not_in('CEXTDATA', $validExtDataList);
        }
        $dbWebflow->delete('FLOW');

        // จัดเรียง Next Step
        $approverRows = $dbWebflow->select('CSTEPNO, CEXTDATA')
            ->where([
                'NFRMNO' => $data['NFRMNO'],
                'VORGNO' => $data['VORGNO'],
                'CYEAR'  => $data['CYEAR'],
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'CSTART' => 0,
            ])
            ->where("CEXTDATA IS NOT NULL")
            ->order_by('CEXTDATA', 'ASC')
            ->get('FLOW')
            ->result();

        if (!empty($approverRows)) {
            $totalApprovers      = count($approverRows);
            $firstApproverStepNo = trim($approverRows[0]->CSTEPNO);

            $dbWebflow->where([
                'NFRMNO' => $data['NFRMNO'],
                'VORGNO' => $data['VORGNO'],
                'CYEAR'  => $data['CYEAR'],
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'CSTART' => 1,
            ])->update('FLOW', ['CSTEPNEXTNO' => $firstApproverStepNo]);

            foreach ($approverRows as $index => $row) {
                $newStepSt  = ($index === 0) ? '3' : (($index === 1) ? '2' : '1');
                $nextStepNo = ($index + 1 < $totalApprovers) ? trim($approverRows[$index + 1]->CSTEPNO) : '00';

                $dbWebflow->where([
                    'NFRMNO'  => $data['NFRMNO'],
                    'VORGNO'  => $data['VORGNO'],
                    'CYEAR'   => $data['CYEAR'],
                    'CYEAR2'  => $cyear2,
                    'NRUNNO'  => $nrunno,
                    'CSTEPNO' => trim($row->CSTEPNO),
                ])->update('FLOW', [
                    'CSTEPST'     => $newStepSt,
                    'CSTEPNEXTNO' => $nextStepNo
                ]);
            }
        }

        // 6. บันทึก Header เข้า SMARTMAT.FE_DOC_HEADER
        $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
        $headerData = [
            'DOC_HEADER_ID' => $docHeaderId,
            'NFRMNO'        => $data['NFRMNO'],
            'VORGNO'        => $data['VORGNO'],
            'CYEAR'         => $data['CYEAR'],
            'CYEAR2'        => $cyear2,
            'NRUNNO'        => $nrunno,
            'DOC_NO'        => $docNo,
            'DOC_REVISION'  => $nextRevision,
            'DOC_TYPE_CODE' => $docTypeCode,
            'DOC_SUBJECT'   => $docSubject,
            'REMARK'        => "Auto Generate from FE-ASP Report",
            'STATUS'        => 'PROCESS',
            'CREATE_BY'     => $requesterEmpNo,
        ];
        $dbSmmt->set('CREATE_DATE', 'SYSDATE', FALSE);
        $dbSmmt->set('UPDATE_DATE', 'SYSDATE', FALSE);
        $dbSmmt->insert('SMARTMAT.FE_DOC_HEADER', $headerData);

        $docUrl = base_url("feform/FE-DOC/form/main?no={$data['NFRMNO']}&orgNo={$data['VORGNO']}&y={$data['CYEAR']}&y2={$cyear2}&runNo={$nrunno}&m=3");

        return [
            'docNo'       => $docNo,
            'docRevision' => $nextRevision,
            'docUrl'      => $docUrl,
            'feDocKeys'   => [
                'NFRMNO' => $data['NFRMNO'],
                'VORGNO' => $data['VORGNO'],
                'CYEAR'  => $data['CYEAR'],
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ],
            'excelFile'   => [
                'fileName' => $excelInfo['fileName'],
                'fileUrl'  => $excelInfo['fileUrl']
            ]
        ];
    }

    /**
     * สั่งดาวน์โหลด Cover Excel ประจำปีผ่าน Report Controller
     */
    public function exportYearlyCoverExcel() {
        $fy = $this->input->get('fiscalYear') ?: date('Y');
        // $batch = $this->MainModel->checkYearlyBatchCompleted($fy);

        // if (!$batch['isCompleted']) {
        //     show_error("เอกสาร Yearly รอบปี FY{$fy} ยังไม่ครบสมบูรณ์ทุกใบ", 400);
        //     return;
        // }

        $nextRevision = $this->MainModel->getNextYearlySummaryRevision();
        $res = $this->generateYearlySummaryExcel($fy,$nextRevision);
        if ($res && !empty($res['fileUrl'])) {
            redirect($res['fileUrl']);
        } else {
            show_error("ไม่สามารถสร้างไฟล์ Excel ได้ หรือไม่มีข้อมูล", 500);
        }
    }

    public function generateYearlySummaryExcel($year, $nextRev = '*') {
        $records = $this->MainModel->getYearlyApprovedRecordsForSummary($year);
        if (empty($records)) return null;

        $templatePath = APPPATH . 'controllers/feform/FE-ASP/AMEC-ARYearlyTemplate.xlsx';
        if (!file_exists($templatePath)) {
            throw new Exception("ไม่พบไฟล์แม่แบบ: {$templatePath}");
        }

        $spreadsheet = IOFactory::load($templatePath);
        
        $sheet = $spreadsheet->getSheetByName('Template');
        if (!$sheet) {
            $sheet = $spreadsheet->getActiveSheet();
        }

        // หัวกระดาษ: หยอด Issue Date, Update Date และ Revision ที่ช่อง C4
        $firstIssueDate = !empty($records[0]['ISSUE_DATE']) ? $records[0]['ISSUE_DATE'] : date('d-M-y');
        $sheet->setCellValue('C2', $firstIssueDate);
        $sheet->setCellValue('C3', date('d-M-y'));
        $sheet->setCellValue('C4', $nextRev); // <-- ระบุ Revision ที่กำลังจะเกิดขึ้น

        // 2. หยอดข้อมูลตารางตั้งแต่แถวที่ 9 เป็นต้นไป
        $startRow = 9;
        $rowIdx   = $startRow;

        foreach ($records as $i => $r) {
            $isYearly  = ($r['REVIEW_PERIOD'] === 'YEARLY');
            $detailTxt = ($r['REVIEW_DETAILS'] === 'NO_CHANGE') ? 'No change' : ('Change, ' . ($r['DETAIL_OF_CHANGE'] ?? ''));
            
            // แสดงชื่อแผนก/ส่วนงาน แทนรหัส Code
            $secOrDeptName = (!empty($r['SSECCODE']) && $r['SSECCODE'] !== '00') 
                ? ($r['SEC_NAME'] ?: $r['SSECCODE']) 
                : ($r['DEPT_NAME'] ?: $r['SDEPCODE']);

            $divName = $r['DIVISION_NAME'] ?: ($r['SDIVCODE'] ?? '');
            $reqName = $r['REQ_NAME'] ?? $r['REQ_BY'];

            // Col A: No.
            $sheet->setCellValue("A{$rowIdx}", $i + 1);

            // Col B: Div. (ชื่อฝ่าย เช่น MAR Div., D/D DIV.)
            $sheet->setCellValue("B{$rowIdx}", $divName);

            // Col C: Sec. or Dept. (ชื่อแผนก/ส่วนงาน เช่น R&D DEPT., WHI SEC.)
            $sheet->setCellValue("C{$rowIdx}", $secOrDeptName);

            // Col D: Control no.
            $sheet->setCellValue("D{$rowIdx}", $r['CONTROL_NO'] ?? '');

            // Col F & G: Review period
            if ($isYearly) {
                $sheet->setCellValue("F{$rowIdx}", 'Changing review');
                $sheet->setCellValue("G{$rowIdx}", '✓ Yearly Review By term');
            } else {
                $sheet->setCellValue("F{$rowIdx}", '✓ Changing review');
                $sheet->setCellValue("G{$rowIdx}", 'Yearly Review By term');
            }

            // Col I: Review detail
            $sheet->setCellValue("I{$rowIdx}", $detailTxt);

            // Col J: Revision
            $sheet->setCellValue("J{$rowIdx}", $r['DOC_REVISION'] ?? '*');
            $sheet->getStyle("J{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Col K: Reviewed Date
            $sheet->setCellValue("K{$rowIdx}", $r['REVIEWED_DATE'] ?? '');
            $sheet->getStyle("K{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Col L: In charge
            $sheet->setCellValue("L{$rowIdx}", $reqName ?? '');

            // Col M: Main Envi. impact (ตั้งค่า Wrap Text และขยายความกว้างให้อัตโนมัติ)
            $sheet->setCellValue("M{$rowIdx}", "Waste control,\nPaper using");
            $sheet->getStyle("M{$rowIdx}")->getAlignment()->setWrapText(true);

            // Col N - U (Manufacturing): Default เป็น "-"
            foreach (range('N', 'U') as $col) {
                $sheet->setCellValue("{$col}{$rowIdx}", '-');
                $sheet->getStyle("{$col}{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }

            // Col V: Office working -> จุด "●"
            $sheet->setCellValue("V{$rowIdx}", '●');
            $sheet->getStyle("V{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Col W - Y (Indirect): Default เป็น "-"
            foreach (['W', 'X', 'Y'] as $col) {
                $sheet->setCellValue("{$col}{$rowIdx}", '-');
                $sheet->getStyle("{$col}{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }

            // Col Z - AG (Significant items): Default เป็น "-"
            $sigCols = ['Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG'];
            foreach ($sigCols as $col) {
                $sheet->setCellValue("{$col}{$rowIdx}", '-');
                $sheet->getStyle("{$col}{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }

            // Col AH: Rule /Procedure for control
            $sheet->setCellValue("AH{$rowIdx}", '-');
            $sheet->getStyle("AH{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // 3. กำหนดความสูงของแถวให้แสดงผลข้อความ 2 บรรทัดใน Col M ได้เต็ม ไม่ถูกบีบแคบ
            $sheet->getRowDimension($rowIdx)->setRowHeight(30);

            $rowIdx++;
        }

        // ปรับความกว้างคอลัมน์ M ให้พอดีกับข้อความ Waste control, Paper using
        $sheet->getColumnDimension('M')->setWidth(18);

        // 4. บันทึกไฟล์
        $tempDir = FCPATH . 'assets/upload/fe_asp/';
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0777, true);
        }

        $fileName = "List_of_Review_Environmental_Aspect_FY{$year}.xlsx";
        $savePath = $tempDir . $fileName;

        $writer = new Xlsx($spreadsheet);
        $writer->save($savePath);

        return [
            'fileName' => $fileName,
            'fileUrl'  => base_url('assets/upload/fe_asp/' . $fileName)
        ];
    }

    /**
     * ลบไฟล์ Excel ชั่วคราวออกจาก assets/upload/fe_asp/ หลังจากส่งเข้า API กลางสำเร็จ
     */
    public function deleteTempExcelFile() {
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
     * Export รายการเอกสารตามเงื่อนไข Filter ออกมาเป็นไฟล์ Excel
     */
    /**
     * Export รายการเอกสารตามเงื่อนไข Filter ออกมาเป็นไฟล์ Excel (พร้อม Header ระบุปี)
     */
    public function exportReportExcel() {
        $fiscalYear = $this->input->get('fiscalYear') ?: date('Y');
        $nextYear   = (int)$fiscalYear + 1;

        $filter = [
            'fiscalYear'   => $fiscalYear,
            'docNo'        => $this->input->get('docNo'),
            'divCode'      => $this->input->get('divCode'),
            'depCode'      => $this->input->get('depCode'),
            'reviewPeriod' => $this->input->get('reviewPeriod'),
            'status'       => $this->input->get('status'),
            'startDate'    => $this->input->get('startDate'),
            'endDate'      => $this->input->get('endDate'),
        ];

        $dataList = $this->MainModel->getReportData($filter);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle("FY{$fiscalYear}");

        // ==========================================
        // 1. Title Header ด้านบน
        // ==========================================
        $sheet->setCellValue('A1', "รายงานเอกสาร Environmental Aspect & Risk (AMEC-AR Report)");
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $sheet->setCellValue('A2', "Fiscal Year: FY{$fiscalYear} (1 เม.ย. {$fiscalYear} – 31 มี.ค. {$nextYear})    |    Export Date: " . date('d/m/Y H:i'));
        $sheet->getStyle('A2')->getFont()->setSize(10)->setColor(new Color('FF475569'));

        // ==========================================
        // 2. Table Header (แถวที่ 4)
        // ==========================================
        $headers = [
            'A4' => 'No.',
            'B4' => 'Control no.',
            'C4' => 'Doc No.',
            'D4' => 'Revision',
            'E4' => 'Division',
            'F4' => 'Department',
            'G4' => 'Section',
            'H4' => 'Review period',
            'I4' => 'Review details',
            'J4' => 'Detail of change',
            'K4' => 'Status',
            'L4' => 'Reviewed date',
            'M4' => 'Requester',
        ];

        foreach ($headers as $cell => $title) {
            $sheet->setCellValue($cell, $title);
        }

        // จัด Style เฉพาะแถว Header (A4:M4) เท่านั้น
        $sheet->getStyle('A4:M4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => 'FF1E293B']],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFE2E8F0'] // สีเทาอ่อนสวยงามเฉพาะหัวตาราง
            ]
        ]);
        $sheet->getRowDimension(4)->setRowHeight(25);

        // ==========================================
        // 3. หยอดแถวข้อมูล (เริ่มที่แถว 5)
        // ==========================================
        $rowIdx = 5;
        foreach ($dataList as $i => $row) {
            $sheet->setCellValue("A{$rowIdx}", $i + 1);
            $sheet->setCellValue("B{$rowIdx}", $row['CONTROL_NO'] ?? '');
            $sheet->setCellValue("C{$rowIdx}", $row['DOC_NO'] ?? '');
            $sheet->setCellValue("D{$rowIdx}", $row['DOC_REVISION'] ?? '*');
            $sheet->setCellValue("E{$rowIdx}", $row['DIVISION_NAME'] ?? $row['SDIVCODE'] ?? '');
            $sheet->setCellValue("F{$rowIdx}", $row['DEPT_NAME'] ?? $row['SDEPCODE'] ?? '');
            $sheet->setCellValue("G{$rowIdx}", (!empty($row['SSECCODE']) && $row['SSECCODE'] !== '00') ? ($row['SEC_NAME'] ?? $row['SSECCODE']) : '-');
            $sheet->setCellValue("H{$rowIdx}", ($row['REVIEW_PERIOD'] === 'YEARLY') ? 'Yearly review' : 'Review on changing');
            $sheet->setCellValue("I{$rowIdx}", ($row['REVIEW_DETAILS'] === 'NO_CHANGE') ? 'No change' : 'Change');
            $sheet->setCellValue("J{$rowIdx}", $row['DETAIL_OF_CHANGE'] ?? '-');
            $sheet->setCellValue("K{$rowIdx}", $row['STATUS'] ?? 'DRAFT');
            $sheet->setCellValue("L{$rowIdx}", $row['REVIEWED_DATE'] ?? '');
            $sheet->setCellValue("M{$rowIdx}", $row['REQ_NAME'] ?? $row['REQ_BY'] ?? '');

            // จัดกึ่งกลางเฉพาะคอลัมน์โค้ดและวันที่
            $sheet->getStyle("A{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("I{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("K{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("L{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // ความสูงแถวข้อมูล
            $sheet->getRowDimension($rowIdx)->setRowHeight(20);

            $rowIdx++;
        }

        // ==========================================
        // 4. จัดขนาดคอลัมน์ (แก้คอลัมน์ A ไม่ให้ยาวตาม Title)
        // ==========================================
        $sheet->getColumnDimension('A')->setWidth(7); // ฟิกขนาดคอลัมน์ No. ให้แคบพอดี

        foreach (range('B', 'M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // เส้นขอบตารางเฉพาะช่วง A4 ถึงแถวข้อมูลสุดท้าย
        $endRow = ($rowIdx > 5) ? ($rowIdx - 1) : 4;
        $sheet->getStyle("A4:M{$endRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // ส่งออกไฟล์
        $fileName = "Environmental_Aspect_Report_FY{$fiscalYear}_" . date('Ymd_His') . ".xlsx";

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"{$fileName}\"");
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

}