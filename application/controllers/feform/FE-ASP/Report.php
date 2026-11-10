<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class Report extends MY_Controller {

    public $CodeForm = 'AMEC-AR';

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('feform/FE-ASP/Fe_asp_model', 'MainModel');
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

            return $this->output->set_output(json_encode([
                'status' => true,
                'data'   => $summary
            ]));
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
     * สั่งดาวน์โหลด Cover Excel ประจำปีผ่าน Report Controller
     */
    public function exportYearlyCoverExcel() {
        $fy = $this->input->get('fiscalYear') ?: date('Y');
        $batch = $this->MainModel->checkYearlyBatchCompleted($fy);

        if (!$batch['isCompleted']) {
            show_error("เอกสาร Yearly รอบปี FY{$fy} ยังไม่ครบสมบูรณ์ทุกใบ", 400);
            return;
        }

        $res = $this->generateYearlySummaryExcel($fy);
        if ($res && !empty($res['fileUrl'])) {
            redirect($res['fileUrl']);
        } else {
            show_error("ไม่สามารถสร้างไฟล์ Excel ได้ หรือไม่มีข้อมูล", 500);
        }
    }

    public function generateYearlySummaryExcel($year) {
        $records = $this->MainModel->getYearlyApprovedRecordsForSummary($year);
        if (empty($records)) return null;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle("FY{$year}");

        $sheet->setCellValue('A1', 'List of Review Environmental aspect evaluation and Environmental Risk record');
        $sheet->setCellValue('A2', 'Date: ' . date('d-M-Y'));

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
            $sheet->setCellValue("C{$rowIdx}", (!empty($r['SSECCODE']) && $r['SSECCODE'] !== '00') ? $r['SSECCODE'] : $r['SDEPCODE']);
            $sheet->setCellValue("D{$rowIdx}", $r['CONTROL_NO'] ?? '');
            $sheet->setCellValue("E{$rowIdx}", $periodTxt);
            $sheet->setCellValue("F{$rowIdx}", $detailTxt);
            $sheet->setCellValue("G{$rowIdx}", $r['DOC_REVISION'] ?? '*');
            $sheet->setCellValue("H{$rowIdx}", $r['REVIEWED_DATE'] ?? '');
            $sheet->setCellValue("I{$rowIdx}", $r['REQ_NAME'] ?? $r['REQ_BY']);
            $sheet->setCellValue("J{$rowIdx}", '');
            $sheet->setCellValue("K{$rowIdx}", '');
            $rowIdx++;
        }

        $sheet->getStyle("A4:K" . ($rowIdx - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

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
}