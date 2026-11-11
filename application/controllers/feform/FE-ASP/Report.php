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
     * AJAX Endpoint: ตรวจสอบความครบถ้วนของ Yearly + สร้าง Excel + สร้างฟอร์ม FE-DOC อัตโนมัติ
     */
    public function ajaxTriggerYearlyReviewAndFeDoc() {
        $this->output->set_content_type('application/json');
        try {
            $fiscalYear = trim((string)($this->input->post('fiscalYear') ?: date('Y')));
            $currentEmp = trim((string)($this->input->post('empno') ?: '13204'));

            // // 1. ตรวจสอบว่าเคยสร้างฟอร์ม FE-DOC ไปแล้วหรือไม่
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

            // 2. สร้างไฟล์สรุป Cover Excel ลงในโฟลเดอร์ชั่วคราว
            $excelInfo = $this->generateYearlySummaryExcel($fiscalYear);
            if (!$excelInfo || empty($excelInfo['fileName'])) {
                throw new Exception("ไม่สามารถสร้างไฟล์ Excel สรุปประจำปีได้");
            }

            // 3. ดึง Master Form ของ FE-DOC
            $formmst = $this->getFormMasterByVaname('FE-DOC');
            
            $data['NFRMNO'] = $formmst['data']['NNO'] ?? $formmst[0]->NNO;
            $data['VORGNO'] = $formmst['data']['VORGNO'] ?? $formmst[0]->VORGNO;
            $data['CYEAR']  = $formmst['data']['CYEAR'] ?? $formmst[0]->CYEAR;

            $docTypeCode    = 'AMEC-AS'; // รหัสประเภทเอกสารของ FE-DOC สำหรับงาน FE-ASP
            $docSubject     = "ทบทวนประเมินสิ่งแวดล้อมประจำปี (Environmental Aspect Yearly Review) FY{$fiscalYear}";
            $requesterEmpNo = !empty($currentEmp) ? $currentEmp : $this->MainModel->getEpAdminEmpNo();

            // 4. รัน Webflow สร้าง Form FE-DOC เข้า Flow
            $flowData = [
                'NFRMNO'  => $data['NFRMNO'],
                'VORGNO'  => $data['VORGNO'],
                'CYEAR'   => $data['CYEAR'],
                'REQBY'   => $requesterEmpNo,
                'INPUTBY' => $requesterEmpNo,
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

            // 7. คืนค่า JSON พร้อม feDocKeys และ excelFile เพื่อให้ JS อัปโหลดผ่าน NestJS API
            return $this->output->set_output(json_encode([
                'status'    => true,
                'message'   => "สร้างเอกสาร FE-DOC ({$docNo}) เรียบร้อยแล้ว กำลังอัปโหลดไฟล์สรุปผ่านระบบ...",
                'docNo'     => $docNo,
                'docUrl'    => $docUrl,
                'feDocKeys' => [
                    'NFRMNO' => $data['NFRMNO'],
                    'VORGNO' => $data['VORGNO'],
                    'CYEAR'  => $data['CYEAR'],
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno
                ],
                'excelFile' => [
                    'fileName' => $excelInfo['fileName'],
                    'fileUrl'  => $excelInfo['fileUrl']
                ]
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
            ]));
        }
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