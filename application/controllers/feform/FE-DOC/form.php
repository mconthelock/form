<?php
use GuzzleHttp\Client;
use setasign\Fpdi\Tcpdf\Fpdi;

defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/api/webform/form.php';
require_once APPPATH . 'controllers/api/webform/flow.php';
require_once APPPATH . 'controllers/api/webform/formmst.php';
require_once APPPATH . 'controllers/_file.php';

class form extends MY_Controller {
    use formApi, flow, formmst;

    public function __construct() {
        parent::__construct();
        $this->client = new Client(['verify' => false]);
        $this->load->library('Mail');
        $this->load->model('form_model', 'frm');
        $this->load->model('feform/FE-DOC/edoc_model', 'MainModel');

        $this->host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'amecweb';
        
        $isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') 
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

        $this->http = "http" . ($isHttps ? "s" : "");
        
        $this->SmmtBase    = 'SMMT';    // SMMT: Header, Master Type/Step, Admin
        $this->webflowBase = 'DEFAULT'; // DEFAULT: FORM, FLOW, FE_FILE, AMECUSERALL
    }

    public function main() {
        $empno          = $this->input->get('empno') ?? '';
        $data['CYEAR2'] = $this->input->get('y2') ?? '';
        $data['NRUNNO'] = $this->input->get('runNo') ?? '';
        $data['EMPNO']   = (string)$empno;
        $data['REQBY']   = (string)$empno;
        $data['INPUTBY'] = (string)$empno;

        $data['DOC_HEADER_ID'] = '';
        $data['DOC_TYPE_CODE'] = '';
        $data['DOC_NO']        = '';
        $data['REMARK']        = '';
        $data['STATUS']        = '';
        $data['attachedFiles'] = [];

        if ($this->input->get('no') !== null) {
            $data['NFRMNO'] = $this->input->get('no');
            $data['VORGNO'] = $this->input->get('orgNo');
            $data['CYEAR']  = $this->input->get('y');
        } else {
            $formMst = $this->getFormMasterByVaname('FE-DOC');
            $data['NFRMNO'] = $formMst['data']['NNO'] ?? $formMst[0]->NNO;
            $data['VORGNO'] = $formMst['data']['VORGNO'] ?? $formMst[0]->VORGNO;
            $data['CYEAR']  = $formMst['data']['CYEAR'] ?? $formMst[0]->CYEAR;
        }

        $data['docTypes'] = $this->MainModel->getActiveDocTypes();

        if (!empty($data['NRUNNO'])) {
            $header = $this->MainModel->getHeaderByKeys($data);
            if ($header) {
                $data['DOC_HEADER_ID'] = $header->DOC_HEADER_ID;
                $data['DOC_TYPE_CODE'] = $header->DOC_TYPE_CODE;
                $data['DOC_NO']        = $header->DOC_NO;
                $data['REMARK']        = $header->REMARK;
                $data['STATUS']        = $header->STATUS;
            }

            $detailform     = $this->frm->getForm((int)$data['NFRMNO'], (string)$data['VORGNO'], (string)$data['CYEAR'], (string)$data['CYEAR2'], (int)$data['NRUNNO']);
            $data["REQBY"]   = $detailform[0]->VREQNO ?? '';
            $data["INPUTBY"] = $detailform[0]->VINPUTER ?? ''; 
            $data['CST']     = $detailform[0]->CST ?? '';

            $dbWebflow = $this->load->database($this->webflowBase, TRUE);
            $data['attachedFiles'] = $dbWebflow->where([
                'NFRMNO' => (int)$data['NFRMNO'],
                'VORGNO' => (string)$data['VORGNO'],
                'CYEAR2' => (string)$data['CYEAR2'],
                'NRUNNO' => (int)$data['NRUNNO'],
            ])->get('FE_FILE')->result();
        }

        $data['isAdmin'] = $this->MainModel->isFormAdmin('FE-DOC', $data['EMPNO']);

        $this->views('feform/FE-DOC/form', $data);
    }

    public function GetDocTypeSteps() {
        $docTypeCode = $this->input->get('docTypeCode');
        $steps = $this->MainModel->getStepsByDocType($docTypeCode);
        return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true, 'data' => $steps]));
    }

    public function SaveDocMaster() {
        $this->output->set_content_type('application/json');
        try {
            $docTypeCode  = $this->input->post('DOC_TYPE_CODE');
            $remark       = $this->input->post('REMARK') ?? '';
            
            $currentEmpNo = $this->input->post('EMPNO') 
                         ?: ($this->input->post('REQBY') 
                         ?: ($this->input->get('empno') 
                         ?: ($this->session->userdata('empno') ?? '')));

            if (empty($docTypeCode)) {
                throw new Exception("กรุณาระบุประเภทเอกสาร (DOC_TYPE_CODE)");
            }

            $step00 = $this->MainModel->getStepByDocAndExtData($docTypeCode, '00');
            $requesterEmpNo = ($step00 && !empty(trim($step00->TARGET_EMPNO))) 
                            ? trim($step00->TARGET_EMPNO) 
                            : trim((string)$currentEmpNo);

            if (empty($requesterEmpNo)) {
                throw new Exception("ไม่พบรหัสผู้ขออนุมัติ (REQBY) กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
            }

            $formMst  = $this->getFormMasterByVaname('FE-DOC');
            $formData = $formMst['data'];

            $flowData = [
                'NFRMNO'  => $formData['NNO'],
                'VORGNO'  => $formData['VORGNO'],
                'CYEAR'   => $formData['CYEAR'],
                'REQBY'   => $requesterEmpNo,
                'INPUTBY' => $requesterEmpNo,
                'REMARK'  => $remark,
            ];
            $rsf = $this->createForm($flowData);
            if (!$rsf || empty($rsf['status'])) {
                throw new Exception("สร้างเอกสาร Webflow ไม่สำเร็จ: " . ($rsf['message'] ?? ''));
            }

            $cyear2      = $rsf['data']['CYEAR2'];
            $nrunno      = $rsf['data']['NRUNNO'];
            $docNo       = "FE-DOC-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);
            $docHeaderId = date('Ymd') . str_pad($nrunno, 4, '0', STR_PAD_LEFT);

            $activeSteps = $this->MainModel->getStepsByDocType($docTypeCode);
            $validExtDataList = [];
            foreach ($activeSteps as $st) {
                if (!empty($st->CEXTDATA) && trim($st->CEXTDATA) !== '00') {
                    $validExtDataList[] = trim($st->CEXTDATA);
                }
            }

            $dbWebflow = $this->load->database($this->webflowBase, TRUE);

            $dbWebflow->where('NFRMNO', $formData['NNO'])
                      ->where('VORGNO', $formData['VORGNO'])
                      ->where('CYEAR', $formData['CYEAR'])
                      ->where('CYEAR2', $cyear2)
                      ->where('NRUNNO', $nrunno)
                      ->where("CEXTDATA != '00'");

            if (!empty($validExtDataList)) {
                $dbWebflow->where_not_in('CEXTDATA', $validExtDataList);
            }
            $dbWebflow->delete('FLOW');

            $approverRows = $dbWebflow->select('CSTEPNO, CEXTDATA')
                                      ->where([
                                          'NFRMNO' => $formData['NNO'],
                                          'VORGNO' => $formData['VORGNO'],
                                          'CYEAR'  => $formData['CYEAR'],
                                          'CYEAR2' => $cyear2,
                                          'NRUNNO' => $nrunno,
                                          'CSTART' => 0,
                                      ])
                                      ->where("CEXTDATA IS NOT NULL")
                                      ->order_by('CEXTDATA', 'ASC')
                                      ->get('FLOW')
                                      ->result();

            if (!empty($approverRows)) {
                $totalApprovers = count($approverRows);
                $firstApproverStepNo = trim($approverRows[0]->CSTEPNO);

                $dbWebflow->where([
                    'NFRMNO' => $formData['NNO'],
                    'VORGNO' => $formData['VORGNO'],
                    'CYEAR'  => $formData['CYEAR'],
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'CSTART' => 1,
                ])->update('FLOW', [
                    'CSTEPNEXTNO' => $firstApproverStepNo
                ]);

                foreach ($approverRows as $index => $row) {
                    $newStepSt = ($index === 0) ? '3' : (($index === 1) ? '2' : '1');
                    $nextStepNo = ($index + 1 < $totalApprovers) ? trim($approverRows[$index + 1]->CSTEPNO) : '00';

                    $dbWebflow->where([
                        'NFRMNO'  => $formData['NNO'],
                        'VORGNO'  => $formData['VORGNO'],
                        'CYEAR'   => $formData['CYEAR'],
                        'CYEAR2'  => $cyear2,
                        'NRUNNO'  => $nrunno,
                        'CSTEPNO' => trim($row->CSTEPNO),
                    ])->update('FLOW', [
                        'CSTEPST'     => $newStepSt,
                        'CSTEPNEXTNO' => $nextStepNo
                    ]);
                }
            }

            $headerData = [
                'DOC_HEADER_ID' => $docHeaderId,
                'NFRMNO'        => $formData['NNO'],
                'VORGNO'        => $formData['VORGNO'],
                'CYEAR'         => $formData['CYEAR'],
                'CYEAR2'        => $cyear2,
                'NRUNNO'        => $nrunno,
                'DOC_NO'        => $docNo,
                'DOC_TYPE_CODE' => $docTypeCode,
                'REMARK'        => $remark,
                'STATUS'        => 'PROCESS',
                'USER_ACTION'   => $requesterEmpNo,
            ];
            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $dbSmmt->set('DATE_ACTION', 'SYSDATE', FALSE);
            $dbSmmt->insert('FE_DOC_HEADER', $headerData);

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => "บันทึกและสร้างเอกสารสำเร็จ ({$docNo})",
                'docNo'   => $docNo,
                'data'    => [
                    'NFRMNO'        => $formData['NNO'],
                    'VORGNO'        => $formData['VORGNO'],
                    'CYEAR'         => $formData['CYEAR'],
                    'CYEAR2'        => $cyear2,
                    'NRUNNO'        => $nrunno,
                    'DOC_HEADER_ID' => $docHeaderId
                ]
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function StampRequesterStep() {
        $this->output->set_content_type('application/json');
        try {
            $nfrmno  = (int)$this->input->post('NFRMNO');
            $vorgno  = (string)$this->input->post('VORGNO');
            $cyear2  = (string)$this->input->post('CYEAR2');
            $nrunno  = (int)$this->input->post('NRUNNO');
            $empno   = trim((string)$this->input->post('EMPNO'));

            // แสตมป์เฉพาะตราของ Requester (EXT 00) ดวงเดียวลงไฟล์
            $this->stampSingleApproverOnFiles($nfrmno, $vorgno, $cyear2, $nrunno, $empno, '00');

            return $this->output->set_output(json_encode(['status' => true]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    //==========================================================
    //=== stamp PDF on server ===
    //==========================================================
    public function ActionFlow() {
        $this->output->set_content_type('application/json');
        try {
            $nfrmno   = (int)$this->input->post('NFRMNO');
            $vorgno   = (string)$this->input->post('VORGNO');
            $cyear2   = (string)$this->input->post('CYEAR2');
            $nrunno   = (int)$this->input->post('NRUNNO');
            // 🟢 ปรับให้รับทั้ง approve และ APPROVE
            $action   = strtoupper(trim((string)$this->input->post('ACTION')));
            $extdata  = trim((string)$this->input->post('EXTDATA'));
            $empno    = (string)($this->input->post('EMPNO') ?: ($this->session->userdata('empno') ?? ''));

            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $header = $dbSmmt->where([
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ])->get('FE_DOC_HEADER')->row();

            if (!$header) {
                throw new Exception('ไม่พบเอกสารในระบบ');
            }

            $status = 'PROCESS';
            if ($action === 'APPROVE') {
                $lastStep = $dbSmmt->where('DOC_TYPE_CODE', $header->DOC_TYPE_CODE)
                                   ->order_by('STEP_NO', 'DESC')
                                   ->get('FE_DOC_STEP_MST')->row();

                if ($lastStep && trim($lastStep->CEXTDATA) === $extdata) {
                    $status = 'APPROVE';
                }

                // 🟢 เรียก Stamp และปล่อยให้โยน Exception ออกมาหากเกิดปัญหา
                $this->stampSingleApproverOnFiles($nfrmno, $vorgno, $cyear2, $nrunno, $empno, $extdata);
            } elseif ($action === 'REJECT') {
                $status = 'REJECT';
            }

            $dbSmmt->where([
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ]);
            $dbSmmt->set('STATUS', $status);
            $dbSmmt->set('USER_ACTION', $empno);
            $dbSmmt->set('DATE_ACTION', 'SYSDATE', FALSE);
            $dbSmmt->update('FE_DOC_HEADER');

            return $this->output->set_output(json_encode([
                'status'    => true, 
                'statusDoc' => $status,
                'message'   => 'ดำเนินการสำเร็จและประทับตราลงเอกสารเรียบร้อยแล้ว'
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => 'ActionFlow Error: ' . $e->getMessage()]));
        }
    }

    private function stampSingleApproverOnFiles($nfrmno, $vorgno, $cyear2, $nrunno, $empno, $extdata) {
        $dbWebflow = $this->load->database($this->webflowBase, TRUE);
        $dbSmmt    = $this->load->database($this->SmmtBase, TRUE);

        $files = $dbWebflow->where([
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ])->get('FE_FILE')->result();

        if (empty($files)) {
            throw new Exception("ไม่พบรายการไฟล์แนบในระบบ (NRUNNO: {$nrunno})");
        }

        $header = $dbSmmt->where([
            'NFRMNO' => $nfrmno, 'VORGNO' => $vorgno, 'CYEAR2' => $cyear2, 'NRUNNO' => $nrunno
        ])->get('FE_DOC_HEADER')->row();

        if (!$header) {
            throw new Exception("ไม่พบ Header สำหรับคำนวณตำแหน่ง Step");
        }

        $masterSteps = $dbSmmt->where('DOC_TYPE_CODE', $header->DOC_TYPE_CODE)
                              ->where('IS_ACTIVE', 1)
                              ->order_by('STEP_NO', 'ASC')
                              ->get('FE_DOC_STEP_MST')
                              ->result();

        $totalSteps = count($masterSteps);
        $currentStepIndex = -1;

        foreach ($masterSteps as $idx => $st) {
            if (trim((string)$st->CEXTDATA) === trim((string)$extdata)) {
                $currentStepIndex = $idx;
                break;
            }
        }

        // หากหา Step ไม่เจอ (เช่น Requester ส่ง extdata ว่างมา) ให้ default ช่องแรก (0)
        if ($currentStepIndex === -1) {
            $currentStepIndex = 0;
        }

        // ดึงชื่อภาษาอังกฤษจาก SNAME ใน AMECUSERALL
        $userRow = $dbWebflow->select('SNAME')
                             ->where('SEMPNO', trim((string)$empno))
                             ->get('AMECUSERALL')
                             ->row();

        $fullName = $userRow && !empty($userRow->SNAME) ? trim((string)$userRow->SNAME) : (string)$empno;
        
        // ตัดเอาเฉพาะชื่อตัวแรก (First Name) เช่น "SOMCHAI P." ได้ "SOMCHAI"
        $firstName = explode(' ', $fullName)[0] ?: $fullName;

        $stampInfo = [
            'stepIndex'  => $currentStepIndex,
            'totalSteps' => max(1, $totalSteps),
            'orgName'    => 'AMEC',
            'dateStr'    => date('d/m/Y'),
            'empName'    => substr($firstName, 0, 14)
        ];

        foreach ($files as $file) {
            $ext = strtolower(pathinfo($file->FILE_ONAME, PATHINFO_EXTENSION));
            if ($ext !== 'pdf') continue;

            $realPath = $this->getRealFilePath($file->FILE_PATH, $file->FILE_FNAME);

            // 🟢 ตรวจสอบไฟล์จริง หากไม่พบค่อยแจ้งเตือนตรงๆ แทนการเงียบ
            if (!file_exists($realPath)) {
                throw new Exception("ไม่พบไฟล์จริงบน Storage: " . $realPath);
            }

            // นำเงื่อนไข is_writable() ออก แล้วสั่ง Stamp ทันที
            $this->stampSingleCircleOnPdf($realPath, $stampInfo);
        }
    }

    private function stampSingleCircleOnPdf($pdfPath, array $stamp) {
        $pdf = new Fpdi();
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetAutoPageBreak(false);

        // ดึงไฟล์ต้นฉบับ
        $pageCount = $pdf->setSourceFile($pdfPath);

        $stampWidth  = 26; // mm
        $marginRight = 10;
        $marginTop   = 10;
        $gap         = 28;

        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            $templateId = $pdf->importPage($pageNo);
            $size       = $pdf->getTemplateSize($templateId);

            $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';
            $pdf->AddPage($orientation, [$size['width'], $size['height']]);
            $pdf->useTemplate($templateId);

            if ($pageNo === 1) {
                $idx        = (int)$stamp['stepIndex'];
                $totalSteps = (int)$stamp['totalSteps'];

                $colFromRight = ($totalSteps - 1) - $idx;

                $centerX = $size['width'] - $marginRight - ($stampWidth / 2) - ($colFromRight * $gap);
                $centerY = $marginTop + ($stampWidth / 2);
                $radius  = $stampWidth / 2;

                // วงกลมสีแดง
                $pdf->SetDrawColor(200, 30, 30);
                $pdf->SetLineWidth(0.4);
                $pdf->Circle($centerX, $centerY, $radius);
                $pdf->Circle($centerX, $centerY, $radius - 0.8);

                // ข้อความตรายาง
                $pdf->SetTextColor(200, 30, 30);
                $pdf->SetFont('freeserif', 'B', 7);

                $pdf->SetXY($centerX - $radius, $centerY - 6.5);
                $pdf->Cell($stampWidth, 4, $stamp['orgName'], 0, 0, 'C');

                $pdf->SetFont('freeserif', '', 6);
                $pdf->SetXY($centerX - $radius, $centerY - 2);
                $pdf->Cell($stampWidth, 4, $stamp['dateStr'], 0, 0, 'C');

                $pdf->SetFont('freeserif', 'B', 6);
                $pdf->SetXY($centerX - $radius, $centerY + 2.5);
                $pdf->Cell($stampWidth, 4, $stamp['empName'], 0, 0, 'C');
            }
        }

        // 🟢 เขียนทับลงไฟล์เดิมโดยตรง หากติด Permission ให้แจ้ง Error ทันที
        $pdf->Output($pdfPath, 'F');
    }
    //==========================================================

    
    /**
     * ค้นหาไฟล์ PDF ของเอกสาร แล้ว Stamp ทุกตราที่มีการ Approve แล้ว (จาก getApprovalLogList)
     */
    private function stampAllFilesForCurrentStep($nfrmno, $vorgno, $cyear2, $nrunno) {
        $dbWebflow = $this->load->database($this->webflowBase, TRUE);
        $dbSmmt    = $this->load->database($this->SmmtBase, TRUE);

        // 1. ดึงไฟล์แนบทั้งหมดของ NRUNNO นี้
        $files = $dbWebflow->where([
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ])->get('FE_FILE')->result();

        if (empty($files)) return;

        // 2. ดึง Header เพื่อหา CYEAR และ DOC_TYPE_CODE
        $header = $dbSmmt->where([
            'NFRMNO' => $nfrmno, 
            'VORGNO' => $vorgno, 
            'CYEAR2' => $cyear2, 
            'NRUNNO' => $nrunno
        ])->get('FE_DOC_HEADER')->row();

        if (!$header) return;

        // 3. ดึง Step ทั้งหมดของ Doc Type นี้เพื่อทำ Map ลำดับการวางตรายาง (Index 0, 1, 2, ...)
        $masterSteps = $this->MainModel->getStepsByDocType($header->DOC_TYPE_CODE);
        $stepIndexMap = [];
        foreach ($masterSteps as $idx => $st) {
            $ext = trim((string)$st->CEXTDATA);
            if ($ext !== '') {
                $stepIndexMap[$ext] = $idx;
            }
        }

        // 4. ดึงรายการ Log ที่อนุมัติแล้วทั้งหมดจาก FLOW
        $formKeys = [
            'NFRMNO' => (int)$nfrmno,
            'VORGNO' => (string)$vorgno,
            'CYEAR'  => (string)$header->CYEAR,
            'CYEAR2' => (string)$cyear2,
            'NRUNNO' => (int)$nrunno
        ];
        $approvedLogs = $this->MainModel->getApprovalLogList($formKeys);
        if (empty($approvedLogs)) return;

        // 5. เตรียมรายการตรายางที่จะประทับ
        $stampsToApply = [];
        foreach ($approvedLogs as $log) {
            $ext = trim((string)$log->CEXTDATA);
            
            // หา Index ช่องวางตราประทับจาก Master Steps
            $idx = isset($stepIndexMap[$ext]) ? $stepIndexMap[$ext] : (int)$ext;
            
            // ตัดเฉพาะชื่อหน้า เช่น "SOMCHAI P." ให้พอดีกับขอบเขตวงกลม
            $fullName = trim((string)($log->SNAME ?: $log->VREALAPV));
            $shortName = explode(' ', $fullName)[0] ?: $fullName;

            $stampsToApply[] = [
                'stepIndex' => $idx,
                'orgName'   => 'AMEC',
                'dateStr'   => trim((string)$log->DAPVDATE_STR), // วันที่จริง DD/MM/YYYY จาก DB
                'empName'   => substr($shortName, 0, 14)
            ];
        }

        // 6. ประทับตรายางลงไฟล์ PDF ทุกไฟล์
        foreach ($files as $file) {
            $ext = strtolower(pathinfo($file->FILE_ONAME, PATHINFO_EXTENSION));
            if ($ext !== 'pdf') continue;

            $realPath = $this->getRealFilePath($file->FILE_PATH, $file->FILE_FNAME);
            if (file_exists($realPath) && is_writable($realPath)) {
                $this->stampPdfOnServer($realPath, $stampsToApply);
            }
        }
    }

    

    /**
     * วาดวงกลมตรายางทั้งหมดลงบนหน้าแรกของ PDF (FPDI + TCPDF)
     * 
     * @param string $pdfPath        Path ของไฟล์จริง
     * @param array  $stampsToApply  รายการตราประทับ [['stepIndex' => 0, 'orgName' => 'AMEC', 'dateStr' => '09/10/2026', 'empName' => '...'], ...]
     */
    private function stampPdfOnServer($pdfPath, array $stampsToApply) {
        if (empty($stampsToApply)) return false;

        try {
            $pdf = new Fpdi();
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pdf->SetAutoPageBreak(false);

            $pageCount = $pdf->setSourceFile($pdfPath);

            $stampWidth  = 26; // เส้นผ่านศูนย์กลาง (mm)
            $marginRight = 10;
            $marginTop   = 10;
            $gap         = 28;

            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $size       = $pdf->getTemplateSize($templateId);

                $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';
                $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);

                // Stamp เฉพาะหน้าแรก
                if ($pageNo === 1) {
                    foreach ($stampsToApply as $st) {
                        $idx = (int)$st['stepIndex'];
                        $centerX = $size['width'] - $marginRight - ($stampWidth / 2) - ($idx * $gap);
                        $centerY = $marginTop + ($stampWidth / 2);
                        $radius  = $stampWidth / 2;

                        // วาดวงกลมขอบคู่สีแดง
                        $pdf->SetDrawColor(200, 30, 30);
                        $pdf->SetLineWidth(0.4);
                        $pdf->Circle($centerX, $centerY, $radius);
                        $pdf->Circle($centerX, $centerY, $radius - 0.8);

                        // ข้อความตรายาง
                        $pdf->SetTextColor(200, 30, 30);
                        $pdf->SetFont('freeserif', 'B', 7);

                        // แถว 1: ORG
                        $pdf->SetXY($centerX - $radius, $centerY - 6.5);
                        $pdf->Cell($stampWidth, 4, $st['orgName'], 0, 0, 'C');

                        // แถว 2: วันที่จริง
                        $pdf->SetFont('freeserif', '', 6);
                        $pdf->SetXY($centerX - $radius, $centerY - 2);
                        $pdf->Cell($stampWidth, 4, $st['dateStr'], 0, 0, 'C');

                        // แถว 3: ชื่อผู้อนุมัติ
                        $pdf->SetFont('freeserif', 'B', 6);
                        $pdf->SetXY($centerX - $radius, $centerY + 2.5);
                        $pdf->Cell($stampWidth, 4, $st['empName'], 0, 0, 'C');
                    }
                }
            }

            // บันทึกทับไฟล์เดิมบนเซิร์ฟเวอร์
            $pdf->Output($pdfPath, 'F');
            return true;
        } catch (\Throwable $e) {
            log_message('error', 'Stamp PDF Error: ' . $e->getMessage());
            return false;
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

    private function getRealFilePath($dbFilePath, $fileName) {
        $cleanDirPath = rtrim($dbFilePath, '/\\');
        $fullPath = str_replace('/', '\\', $cleanDirPath) . '\\' . $fileName;

        if (@file_exists($fullPath) || @is_readable($fullPath)) {
            return $fullPath;
        }

        $pathParts = explode('\\', str_replace('/', '\\', $cleanDirPath));
        $docFolder = end($pathParts);

        $localFallback = realpath(FCPATH . '../File_Sys/form/feform/FE-DOC/' . $docFolder) . DIRECTORY_SEPARATOR . $fileName;
        if (@file_exists($localFallback)) {
            return $localFallback;
        }

        $linuxSmbPath = str_replace('\\', '/', $cleanDirPath) . '/' . $fileName;
        $linuxSmbPath = preg_replace('/^\/\/[^\/]+/', '', $linuxSmbPath);
        if (@file_exists($linuxSmbPath)) {
            return $linuxSmbPath;
        }

        return $fullPath;
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
            $folderToDelete = null;

            foreach ($attachedFiles as $file) {
                $fullPath = rtrim($file->FILE_PATH, '/\\') . DIRECTORY_SEPARATOR . $file->FILE_FNAME;
                if (file_exists($fullPath) && is_file($fullPath)) {
                    @unlink($fullPath);
                    $folderToDelete = dirname($fullPath);
                }
            }

            if ($folderToDelete && is_dir($folderToDelete)) {
                $filesInFolder = array_diff(scandir($folderToDelete), ['.', '..']);
                if (empty($filesInFolder)) {
                    @rmdir($folderToDelete);
                }
            }

            $dbWebflow->where($formKeys)->delete('FE_FILE');

            if (!empty($docHeaderId)) {
                $dbSmmt->where('DOC_HEADER_ID', $docHeaderId)->delete('FE_DOC_HEADER');
            } else {
                $dbSmmt->where($formKeys)->delete('FE_DOC_HEADER');
            }

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

    public function GetMasterDetail() {
        $this->output->set_content_type('application/json');
        try {
            $code = trim((string)$this->input->get('docTypeCode'));
            $res = $this->MainModel->getMasterDocDetail($code);
            return $this->output->set_output(json_encode([
                'status' => true,
                'type'   => $res['type'],
                'steps'  => $res['steps']
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function SaveMaster() {
        $this->output->set_content_type('application/json');
        try {
            $currentEmp = (string)($this->input->post('EMPNO') ?: $this->input->get('empno'));
            if (!$this->MainModel->isFormAdmin('FE-DOC', $currentEmp)) {
                throw new Exception('คุณไม่มีสิทธิ์จัดการ Master');
            }

            $docTypeCode = strtoupper(trim((string)$this->input->post('DOC_TYPE_CODE')));
            $docTypeName = trim((string)$this->input->post('DOC_TYPE_NAME'));
            $steps       = json_decode($this->input->post('STEPS'), true);

            if (empty($docTypeCode) || empty($docTypeName)) {
                throw new Exception('กรุณากรอกรหัสและชื่อประเภทเอกสาร');
            }
            if (empty($steps) || !is_array($steps)) {
                throw new Exception('กรุณาระบุข้อมูล Steps อย่างน้อย 1 Step');
            }

            $ok = $this->MainModel->saveDocTypeAndSteps($docTypeCode, $docTypeName, $steps);
            if (!$ok) throw new Exception('บันทึกข้อมูลไม่สำเร็จ');

            return $this->output->set_output(json_encode(['status' => true, 'message' => 'บันทึก Master สำสำเร็จ']));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function DeleteDocType() {
        $this->output->set_content_type('application/json');
        try {
            $currentEmp = (string)($this->input->post('EMPNO') ?: $this->input->get('empno'));
            if (!$this->MainModel->isFormAdmin('FE-DOC', $currentEmp)) {
                throw new Exception('คุณไม่มีสิทธิ์ดำเนินการ');
            }

            $docTypeCode = trim((string)$this->input->post('DOC_TYPE_CODE'));
            $ok = $this->MainModel->deleteDocTypeCascade($docTypeCode);
            if (!$ok) throw new Exception('ลบข้อมูลไม่สำเร็จ');

            return $this->output->set_output(json_encode(['status' => true, 'message' => 'ลบข้อมูลสำเร็จ']));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }
}