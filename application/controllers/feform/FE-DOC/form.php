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
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH . 'controllers/_file.php';


use setasign\Fpdi\Tcpdf\Fpdi;

class form extends MY_Controller {
    use formApi, flow, formmst;


    
// <?php
// defined('BASEPATH') OR exit('No direct script access allowed');

// require_once APPPATH . 'controllers/_form.php';
// require_once APPPATH . 'controllers/api/webform/form.php';
// require_once APPPATH . 'controllers/api/webform/flow.php';
// require_once APPPATH . 'controllers/api/webform/formmst.php';
// require_once APPPATH . 'controllers/_file.php';

// use setasign\Fpdi\Tcpdf\Fpdi;

// class form extends MY_Controller {
    // use formApi, flow, formmst;

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
        
        
        // แยก Database Configuration ชัดเจน
        $this->SmmtBase    = 'SMMT';    // ข้อมูลของ FE (Header, File, Master Type/Step)
        $this->webflowBase = 'DEFAULT'; // โครงสร้าง Webflow (FORM, FLOW)
    }

    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-DOC/form/main/?no=27&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    //===  https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-DOC/form/main?no=27&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
    // === http://localhost:8080/form/feform/FE-DOC/form/main/?no=27&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    //===  http://localhost:8080/form/feform/FE-DOC/form/main?no=27&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList.asp&menu=1
    public function main() {
        $empno = $this->input->get('empno') ?? '';
        $data['CYEAR2'] = $this->input->get('y2') ?? '';
        $data['NRUNNO'] = $this->input->get('runNo') ?? '';
        $data['EMPNO']  = (string)$empno;
        $data['REQBY']  = (string)$empno;
        $data['INPUTBY'] = (string)$empno;

        // กำหนดค่า Default ป้องกัน Undefined Variable ใน Blade
        $data['DOC_HEADER_ID'] = '';
        $data['DOC_TYPE_CODE'] = '';
        $data['DOC_NO']        = '';
        $data['REMARK']        = '';
        $data['STATUS']        = '';

        if ($this->input->get('no') !== null) {
            $data['NFRMNO'] = $this->input->get('no');
            $data['VORGNO'] = $this->input->get('orgNo');
            $data['CYEAR']  = $this->input->get('y');
        } else {
            // ดึง Master แบบฟอร์มจาก Webflow Base (DEFAULT)
            $formMst = $this->getFormMasterByVaname('FE-DOC');
            $data['NFRMNO'] = $formMst['data']['NNO'] ?? $formMst[0]->NNO;
            $data['VORGNO'] = $formMst['data']['VORGNO'] ?? $formMst[0]->VORGNO;
            $data['CYEAR']  = $formMst['data']['CYEAR'] ?? $formMst[0]->CYEAR;
        }

        // ดึงรายการ Master Type จาก SMMT Base
        $data['docTypes'] = $this->MainModel->getActiveDocTypes();

        if (!empty($data['NRUNNO'])) {
            // ดึง Header จาก SMMT Base
            $header = $this->MainModel->getHeaderByKeys($data);

            if ($header) {
                $data['DOC_HEADER_ID'] = $header->DOC_HEADER_ID;
                $data['DOC_TYPE_CODE'] = $header->DOC_TYPE_CODE;
                $data['DOC_NO']        = $header->DOC_NO;
                $data['REMARK']        = $header->REMARK;
                $data['STATUS']        = $header->STATUS;
            }

            
            $detailform    = $this->frm->getForm((int)$data['NFRMNO'],  (string)$data['VORGNO'], (string)$data['CYEAR'],  (string)$data['CYEAR2'],  (int)$data['NRUNNO']);
            $data["REQBY"] = $detailform[0]->VREQNO;
            $data["INPUTBY"] = $detailform[0]->VINPUTER; 
            $data['CST']     = $detailform[0]->CST;
            $data["REMARK"] = "";
        }

        $this->views('feform/FE-DOC/form', $data);
    }

    public function GetDocTypeSteps() {
        $docTypeCode = $this->input->get('docTypeCode');
        // ดึง Step ตามประเภทเอกสารจาก SMMT Base
        $steps = $this->MainModel->getStepsByDocType($docTypeCode);
        return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true, 'data' => $steps]));
    }

    public function SaveDocMaster() {
        $this->output->set_content_type('application/json');
        try {
            $docTypeCode  = $this->input->post('DOC_TYPE_CODE');
            $remark       = $this->input->post('REMARK') ?? '';
            $currentEmpNo = $this->input->get_post('empno') ?? ($this->input->post('EMPNO') ?? 'SYSTEM');

            if (empty($docTypeCode)) {
                throw new Exception("กรุณาระบุประเภทเอกสาร (DOC_TYPE_CODE)");
            }

            // 1. ตรวจสอบ Step 00 (REQUESTER) ว่ามีการ Fix TARGET_EMPNO ไว้หรือไม่
            $step00 = $this->MainModel->getStepByDocAndExtData($docTypeCode, '00');
            $requesterEmpNo = ($step00 && !empty($step00->TARGET_EMPNO)) 
                              ? trim($step00->TARGET_EMPNO) 
                              : trim($currentEmpNo);

            // 2. ดึง Master Form FE-DOC จาก Webflow Base (DEFAULT)
            $formMst  = $this->getFormMasterByVaname('FE-DOC');
            $formData = $formMst['data'];

            // 3. สั่งสร้าง Form Webflow (ระบบจะสร้าง Step 01-05 ไว้ล่วงหน้าทั้งหมดในตาราง FLOW)
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

            // 4. ดึง Master Steps ของ DOC_TYPE นี้จากตาราง FE_DOC_STEP_MST (ฝั่ง SMMT)
            $activeSteps = $this->MainModel->getStepsByDocType($docTypeCode);

            $validExtDataList = [];
            foreach ($activeSteps as $st) {
                // เก็บเฉพาะ CEXTDATA ที่ไม่ใช่ 00 (เช่น '01', '02', '03')
                if (!empty($st->CEXTDATA) && trim($st->CEXTDATA) !== '00') {
                    $validExtDataList[] = trim($st->CEXTDATA);
                }
            }

            $dbWebflow = $this->load->database($this->webflowBase, TRUE); // ต่อฐานข้อมูล DEFAULT

            // 5. ลบ Step ในตาราง FLOW ที่ไม่มีอยู่ใน FE_DOC_STEP_MST ของประเภทเอกสารนี้ทิ้ง
            $dbWebflow->where('NFRMNO', $formData['NNO'])
                      ->where('VORGNO', $formData['VORGNO'])
                      ->where('CYEAR', $formData['CYEAR'])
                      ->where('CYEAR2', $cyear2)
                      ->where('NRUNNO', $nrunno)
                      ->where("CEXTDATA != '00'"); // ไม่ลบ step ของ Requester (ถ้ามี)

            if (!empty($validExtDataList)) {
                // ลบ CEXTDATA ที่ไม่อยู่ในรายการที่ต้องการ
                $dbWebflow->where_not_in('CEXTDATA', $validExtDataList);
            }
            $dbWebflow->delete('FLOW');

            // 6. อัปเดตรายชื่อ Approver ลงใน Step ที่คงเหลืออยู่จริง
            foreach ($activeSteps as $st) {
                if (trim($st->CEXTDATA) === '00') continue; // ข้าม Requester

                $approverEmpNo = $this->MainModel->resolveApproverEmpNo($st, $requesterEmpNo);

                if (!empty($approverEmpNo)) {
                    $dbWebflow->where([
                        'NFRMNO'   => $formData['NNO'],
                        'VORGNO'   => $formData['VORGNO'],
                        'CYEAR'    => $formData['CYEAR'],
                        'CYEAR2'   => $cyear2,
                        'NRUNNO'   => $nrunno,
                        'CEXTDATA' => trim($st->CEXTDATA),
                    ])->update('FLOW', [
                        'VAPVNO' => $approverEmpNo,
                        'VREPNO' => $approverEmpNo
                    ]);
                }
            }

            // -------------------------------------------------------------------------
            // 7. Re-sequence FLOW: อัปเดต CSTEPST และต่อสาย CSTEPNEXTNO ใหม่ทั้งหมด
            // -------------------------------------------------------------------------
            // 7.1 ดึงเฉพาะแถว Approver ที่เหลืออยู่จริง (CSTART = 0) เรียงลำดับตาม CEXTDATA
            $approverRows = $dbWebflow->select('CSTEPNO, CEXTDATA')
                                      ->where([
                                          'NFRMNO' => $formData['NNO'],
                                          'VORGNO' => $formData['VORGNO'],
                                          'CYEAR'  => $formData['CYEAR'],
                                          'CYEAR2' => $cyear2,
                                          'NRUNNO' => $nrunno,
                                          'CSTART' => 0, // เฉพาะแถว Approver
                                      ])
                                      ->where("CEXTDATA IS NOT NULL")
                                      ->order_by('CEXTDATA', 'ASC')
                                      ->get('FLOW')
                                      ->result();

            if (!empty($approverRows)) {
                $totalApprovers = count($approverRows);

                // 7.2 อัปเดต CSTEPNEXTNO ของแถว Requester (CSTART = 1) ให้ชี้ไปยัง Approver คนแรก
                $firstApproverStepNo = trim($approverRows[0]->CSTEPNO);
                $dbWebflow->where([
                    'NFRMNO' => $formData['NNO'],
                    'VORGNO' => $formData['VORGNO'],
                    'CYEAR'  => $formData['CYEAR'],
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'CSTART' => 1, // ชี้เฉพาะแถว Requester ตรงๆ
                ])->update('FLOW', [
                    'CSTEPNEXTNO' => $firstApproverStepNo // 🟢 เปลี่ยนเป็น CSTEPNEXTNO
                ]);

                // 7.3 วนลูปอัปเดต CSTEPST และ CSTEPNEXTNO ของ Approver แต่ละสเต็ป
                foreach ($approverRows as $index => $row) {
                    // กำหนดสถานะลำดับ: คนแรกเป็น 3 (รออนุมัติ), คนที่สองเป็น 2, ที่เหลือเป็น 1
                    $newStepSt = '1';
                    if ($index === 0) {
                        $newStepSt = '3';
                    } elseif ($index === 1) {
                        $newStepSt = '2';
                    }

                    // หา Step ถัดไป (คนสุดท้ายชี้ไป '00')
                    $nextStepNo = '00';
                    if ($index + 1 < $totalApprovers) {
                        $nextStepNo = trim($approverRows[$index + 1]->CSTEPNO);
                    }

                    // อัปเดตสถานะและตัวชี้ Step ถัดไป
                    $dbWebflow->where([
                        'NFRMNO'  => $formData['NNO'],
                        'VORGNO'  => $formData['VORGNO'],
                        'CYEAR'   => $formData['CYEAR'],
                        'CYEAR2'  => $cyear2,
                        'NRUNNO'  => $nrunno,
                        'CSTEPNO' => trim($row->CSTEPNO),
                    ])->update('FLOW', [
                        'CSTEPST'     => $newStepSt,
                        'CSTEPNEXTNO' => $nextStepNo // 🟢 เปลี่ยนเป็น CSTEPNEXTNO
                    ]);
                }
            }

            // 8. บันทึกข้อมูลลง FE_DOC_HEADER (ฝั่ง SMMT)
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
                // 'DATE_ACTION'   => date('Y-m-d H:i:s')
            ];
            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $dbSmmt->set('DATE_ACTION', 'SYSDATE', FALSE);
            $dbSmmt->insert('FE_DOC_HEADER', $headerData);

            // // 8. บันทึกไฟล์แนบ (PDF / Excel)
            // if (!empty($_FILES['files']['name'][0])) {
            //     $this->uploadAttachmentFiles($formData['NNO'], $formData['VORGNO'], $formData['CYEAR'], $cyear2, $nrunno);
            // }

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

    public function ActionFlow() {
        $this->output->set_content_type('application/json');
        try {
            $nfrmno  = $this->input->post('NFRMNO');
            $vorgno  = $this->input->post('VORGNO');
            $cyear2  = $this->input->post('CYEAR2');
            $nrunno  = $this->input->post('NRUNNO');
            $action  = strtoupper(trim((string)$this->input->post('ACTION')));
            $extdata = trim((string)$this->input->post('EXTDATA'));

            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $status = 'PROCESS';

            // 1. ดึง Header เพื่อหา DOC_TYPE_CODE ปัจจุบัน
            $header = $dbSmmt->where(['NFRMNO' => $nfrmno, 'VORGNO' => $vorgno, 'CYEAR2' => $cyear2, 'NRUNNO' => $nrunno])
                             ->get('FE_DOC_HEADER')->row();

            if ($action === 'APPROVE' && $header) {
                // เช็คว่าถึง Step สุดท้ายหรือไม่
                $lastStep = $dbSmmt->where('DOC_TYPE_CODE', $header->DOC_TYPE_CODE)
                                   ->order_by('STEP_NO', 'DESC')
                                   ->get('FE_DOC_STEP_MST')->row();

                if ($lastStep && $lastStep->CEXTDATA === $extdata) {
                    $status = 'APPROVE';
                }
            }

            // 2. อัปเดตสถานะเอกสารลง SMMT
            $dbSmmt->where([
                'NFRMNO'  => $nfrmno,
                'VORGNO'  => $vorgno,
                'CYEAR2'  => $cyear2,
                'NRUNNO'  => $nrunno
            ]);
            $dbSmmt->set('STATUS', $status);
            // $dbSmmt->set('DATE_ACTION', "TO_DATE('" . date('Y-m-d H:i:s') . "', 'YYYY-MM-DD HH24:MI:SS')", FALSE);
            $dbSmmt->set('DATE_ACTION', 'SYSDATE', FALSE);
            $dbSmmt->update('FE_DOC_HEADER');

            return $this->output->set_output(json_encode(['status' => true, 'statusDoc' => $status]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
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
        
        // 🟢 ดึงทุกไฟล์ของ NRUNNO นี้ โดยไม่จำกัดเฉพาะ .pdf
        $files = $dbWebflow->where($formKeys)
                           ->order_by('FILE_ID', 'ASC')
                           ->get('FE_FILE')
                           ->result();

        return $this->output->set_output(json_encode([
            'status' => true,
            'files'  => $files ?: []
        ]));
    }

    
    
    


    private function getRealFilePath($dbFilePath, $fileName) {
        $cleanDirPath = rtrim($dbFilePath, '/\\');
        
        // 1. รวม Path ปกติแบบ Windows Backslash
        $fullPath = str_replace('/', '\\', $cleanDirPath) . '\\' . $fileName;

        // ถ้าไฟล์เปิดอ่านได้ทันที (กรณี Production Server หรือ Windows Native)
        if (@file_exists($fullPath) || @is_readable($fullPath)) {
            return $fullPath;
        }

        // 2. กรณีรันบน Linux Container (Docker) หรือเครื่อง Localhost
        // ให้ดึงชื่อโฟลเดอร์เอกสารปลายทาง เช่น FE-DOC26-000001
        $pathParts = explode('\\', str_replace('/', '\\', $cleanDirPath));
        $docFolder = end($pathParts); // จะได้ FE-DOC26-000001

        // 2.1 ตรวจสอบ Path ในโฟลเดอร์ File_Sys ข้างเคียงโปรเจกต์
        $localFallback = realpath(FCPATH . '../File_Sys/form/feform/FE-DOC/' . $docFolder) . DIRECTORY_SEPARATOR . $fileName;
        if (@file_exists($localFallback)) {
            return $localFallback;
        }

        // 2.2 กรณี Docker มีการ mount drive ไว้ที่ /mnt หรือ /amecnas
        $linuxSmbPath = str_replace('\\', '/', $cleanDirPath) . '/' . $fileName;
        $linuxSmbPath = preg_replace('/^\/\/[^\/]+/', '', $linuxSmbPath); // ตัด //amecnas ออก
        if (@file_exists($linuxSmbPath)) {
            return $linuxSmbPath;
        }

        return $fullPath;
    }

    public function DeleteFile() 
    {
        $file_id = $this->input->post('id');
        if (!$file_id) {
            return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => 'No ID provided']));
        }

        // ลบ Record ออกจาก FE_FILE
        $this->MainModel->deleteData($this->webflowBase, 'FE_FILE', ['FILE_ID' => $file_id]);

        return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true]));
    }

    public function DeleteDraftDoc() 
    {
        $this->output->set_content_type('application/json');
        try {
            $docHeaderId = $this->input->post('DOC_HEADER_ID');
            $nfrmno      = (int)$this->input->post('NFRMNO');
            $vorgno      = (string)$this->input->post('VORGNO');
            $cyear       = (string)$this->input->post('CYEAR');
            $cyear2      = (string)$this->input->post('CYEAR2');
            $nrunno      = (int)$this->input->post('NRUNNO');

            $formKeys = [
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ];

            $dbWebflow = $this->load->database($this->webflowBase, TRUE);
            $dbSmmt    = $this->load->database($this->SmmtBase, TRUE);

            // 1. ค้นหาไฟล์แนบทั้งหมดของเอกสารนี้เพื่อลบไฟล์จริงออกจาก Storage
            $attachedFiles = $dbWebflow->where($formKeys)->get('FE_FILE')->result();
            $folderToDelete = null;

            foreach ($attachedFiles as $file) {
                $fullPath = rtrim($file->FILE_PATH, '/\\') . DIRECTORY_SEPARATOR . $file->FILE_FNAME;
                if (file_exists($fullPath) && is_file($fullPath)) {
                    @unlink($fullPath);
                    $folderToDelete = dirname($fullPath);
                }
            }

            // ถ้าโฟลเดอร์ว่างเปล่า ให้ลบโฟลเดอร์ทิ้งด้วย
            if ($folderToDelete && is_dir($folderToDelete)) {
                $filesInFolder = array_diff(scandir($folderToDelete), ['.', '..']);
                if (empty($filesInFolder)) {
                    @rmdir($folderToDelete);
                }
            }

            // 2. ลบออกจากตาราง FE_FILE ฝั่ง Webflow Base
            $dbWebflow->where($formKeys)->delete('FE_FILE');

            // 3. ลบออกจากตาราง FE_DOC_HEADER ฝั่ง SMMT
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

    // get flow approve webflow
    public function GetStampData() {
        $this->output->set_content_type('application/json');

        try {
            $formKeys = [
                'NFRMNO' => (int)$this->input->get_post('no'),
                'VORGNO' => (string)$this->input->get_post('orgNo'),
                'CYEAR'  => (string)$this->input->get_post('y'),
                'CYEAR2' => (string)$this->input->get_post('y2'),
                'NRUNNO' => (int)$this->input->get_post('runNo'),
            ];

            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $header = $dbSmmt->where($formKeys)->get('FE_DOC_HEADER')->row();
            if (!$header) {
                throw new Exception('ไม่พบข้อมูลเอกสารในระบบ');
            }

            // 1. ดึง Master Steps เพื่อเอาชื่อตำแหน่ง (POSITION_TITLE)
            $masterSteps = $this->MainModel->getStepsByDocType($header->DOC_TYPE_CODE);
            $posTitleMap = [];
            foreach ($masterSteps as $ms) {
                if (!empty($ms->CEXTDATA)) {
                    $posTitleMap[trim($ms->CEXTDATA)] = trim($ms->POSITION_TITLE);
                }
            }

            // 2. ดึงทุก Step ที่มีอยู่ในตาราง FLOW ของเอกสารใบนี้จริง ๆ
            $dbWebflow = $this->load->database($this->webflowBase, TRUE);
            $flowRows = $dbWebflow->select('CSTEPNO, CEXTDATA, CSTART')
                                  ->where($formKeys)
                                  ->order_by('CSTART', 'DESC') // เอา Requester (CSTART=1) ขึ้นเป็น Step แรก
                                  ->order_by('CEXTDATA', 'ASC')
                                  ->order_by('CSTEPNO', 'ASC')
                                  ->get('FLOW')
                                  ->result();

            $steps = [];
            foreach ($flowRows as $row) {
                $ext = trim($row->CEXTDATA ?? '');
                $posTitle = $posTitleMap[$ext] ?? ($row->CSTART == '1' ? 'REPORTER' : 'APPROVER');

                $steps[] = [
                    'CSTEPNO'        => trim($row->CSTEPNO),
                    'CEXTDATA'       => $ext,
                    'CSTART'         => (string)$row->CSTART,
                    'POSITION_TITLE' => $posTitle
                ];
            }

            // 3. ดึงเฉพาะรายการที่อนุมัติแล้ว (CAPVSTNO = '1')
            $approvalLogs = $this->MainModel->getApprovalLogList($formKeys);

            return $this->output->set_output(json_encode([
                'status' => true,
                'steps'  => $steps,
                'logs'   => $approvalLogs
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_status_header(500)->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }

    public function StampExcelDirect() {
        try {
            if (empty($_FILES['file']['tmp_name'])) {
                show_error('No file uploaded', 400);
                return;
            }

            $formKeys = [
                'NFRMNO' => (int)$this->input->post('no'),
                'VORGNO' => (string)$this->input->post('orgNo'),
                'CYEAR'  => (string)$this->input->post('y'),
                'CYEAR2' => (string)$this->input->post('y2'),
                'NRUNNO' => (int)$this->input->post('runNo'),
            ];

            // 1. ดึงข้อมูลตำแหน่งและประวัติอนุมัติ
            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $header = $dbSmmt->where($formKeys)->get('FE_DOC_HEADER')->row();
            $masterSteps = $this->MainModel->getStepsByDocType($header->DOC_TYPE_CODE);
            $posTitleMap = [];
            foreach ($masterSteps as $ms) {
                if (!empty($ms->CEXTDATA)) {
                    $posTitleMap[trim($ms->CEXTDATA)] = trim($ms->POSITION_TITLE);
                }
            }

            $dbWebflow = $this->load->database($this->webflowBase, TRUE);
            $flowRows = $dbWebflow->select('CSTEPNO, CEXTDATA, CSTART')
                                  ->where($formKeys)
                                  ->order_by('CSTART', 'DESC')
                                  ->order_by('CEXTDATA', 'ASC')
                                  ->order_by('CSTEPNO', 'ASC')
                                  ->get('FLOW')
                                  ->result();

            $steps = [];
            foreach ($flowRows as $row) {
                $ext = trim($row->CEXTDATA ?? '');
                $steps[] = [
                    'CSTEPNO'        => trim($row->CSTEPNO),
                    'CEXTDATA'       => $ext,
                    'POSITION_TITLE' => $posTitleMap[$ext] ?? ($row->CSTART == '1' ? 'REPORTER' : 'APPROVER'),
                ];
            }

            $approvalLogs = $this->MainModel->getApprovalLogList($formKeys);
            $appMap = [];
            foreach ($approvalLogs as $log) {
                $appMap[trim($log->CEXTDATA ?? '')] = $log;
                $appMap[trim($log->CSTEPNO ?? '')] = $log;
            }

            // 2. โหลดไฟล์ Excel จาก $_FILES ชั่วคราวโดยตรง
            $spreadsheet = IOFactory::load($_FILES['file']['tmp_name']);
            $sheet = $spreadsheet->getActiveSheet();

            // แทรก 4 บรรทัดบนสุด
            $sheet->insertNewRowBefore(1, 4);

            $stepCount = count($steps);
            $startColIndex = max(1, 10 - $stepCount); 

            // วาดตารางตรายาง: Step 0 อยู่ขวาสุด
            foreach ($steps as $idx => $st) {
                $colFromRight = ($stepCount - 1) - $idx;
                $colNum = $startColIndex + $colFromRight;
                $colLetter = Coordinate::stringFromColumnIndex($colNum);

                // รวมเซลล์สำหรับวางตรายาง
                $sheet->mergeCells("{$colLetter}1:{$colLetter}3");
                
                $extKey = trim($st['CEXTDATA'] ?? '');
                $stepKey = trim($st['CSTEPNO'] ?? '');
                $app = $appMap[$extKey] ?? ($appMap[$stepKey] ?? null);

                if ($app && !empty($app->DAPVDATE_STR)) {
                    $firstName = explode(' ', trim($app->SNAME ?? ''))[0];
                    $stampText = "AMEC\n" . $app->DAPVDATE_STR . "\n" . $firstName;
                    $sheet->setCellValue("{$colLetter}1", $stampText);
                    $sheet->getStyle("{$colLetter}1")->applyFromArray([
                        'font' => ['bold' => true, 'size' => 8, 'color' => ['rgb' => 'D32F2F']],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                            'wrapText' => true
                        ]
                    ]);
                }

                if ($hasBorder) {
                    $sheet->getStyle("{$colLetter}1:{$colLetter}3")->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '999999']]]
                    ]);
                }

                $sheet->getColumnDimension($colLetter)->setWidth(16);
            }

            // ล้าง Buffer
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            $origName = $this->input->post('origName') ?: 'document.xlsx';
            $outputFileName = 'Stamped_' . $origName;

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . rawurlencode($outputFileName) . '"');
            header('Cache-Control: max-age=0');

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            exit;

        } catch (\Throwable $e) {
            show_error('Stamp Excel Error: ' . $e->getMessage(), 500);
        }
    }

}