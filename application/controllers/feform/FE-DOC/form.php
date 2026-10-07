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
    // === https://localhost:8080/form/feform/FE-DOC/form/main/?no=27&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    //===  https://localhost:8080/form/feform/FE-DOC/form/main?no=27&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList.asp&menu=1
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

    public function GetFilesDisplay()
    {
        $this->output->set_content_type('application/json');
        $nfrmno = $this->input->post('NFRMNO');
        $vorgno = $this->input->post('VORGNO');
        $cyear2 = $this->input->post('CYEAR2');
        $nrunno = $this->input->post('NRUNNO');

        $sql = "SELECT FILE_ID, FILE_ONAME, FILE_FNAME, FILE_PATH, FILE_DATECREATE 
                FROM FE_FILE 
                WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR2 = ? AND NRUNNO = ?
                ORDER BY FILE_ID ASC";

        $files = $this->MainModel->QuerySetBase($sql, $this->webflowBase, [
            (int)$nfrmno,
            (string)$vorgno,
            (string)$cyear2,
            (int)$nrunno
        ])->result();

        return $this->output->set_output(json_encode([
            'status' => true,
            'files'  => $files
        ]));
    }

    
    
    
    public function DownloadFile()
    {
        $file_id = $this->input->get('id'); 
        
        $sql = "SELECT * FROM FE_FILE WHERE FILE_ID = ?";
        $file = $this->MainModel->QuerySetBase($sql, $this->webflowBase, [$file_id])->row();
        if ($file) {
            $fullPath = rtrim($file->FILE_PATH, '/\\') . DIRECTORY_SEPARATOR . $file->FILE_FNAME;

            if (file_exists($fullPath)) {
                $this->load->helper('download');
                
                // ใช้ FILE_ONAME เป็นชื่อตอนโหลดลงเครื่อง และอ่านไฟล์จาก $fullPath
                force_download($file->FILE_ONAME, file_get_contents($fullPath));
            } else {
                show_error('ไม่พบไฟล์จริงในระบบ: ' . $fullPath, 404);
            }
        } else {
            show_error('ไม่พบข้อมูลไฟล์ในฐานข้อมูล', 404);
        }
    }

    public function DownloadFile0()
    {
        $file_id = $this->input->get('id'); 
        
        $sql = "SELECT * FROM FE_FILE WHERE FILE_ID = ?";
        $file = $this->MainModel->QuerySetBase($sql, $this->webflowBase, [$file_id])->row();
        
        if (!$file) {
            show_error('ไม่พบข้อมูลไฟล์ในฐานข้อมูล', 404);
        }

        // 1. ตรวจสอบบน Disk ตรงๆ (สำหรับ Production Server หรือ Windows Native)
        $cleanDirPath = rtrim($file->FILE_PATH, '/\\');
        $fullPath = $cleanDirPath . '\\' . $file->FILE_FNAME;

        if (@file_exists($fullPath)) {
            $this->load->helper('download');
            force_download($file->FILE_ONAME, file_get_contents($fullPath));
            return;
        }

        // 2. Fallback สำหรับ Docker Local: ดึง Stream ตรงจาก NestJS API
        // บน Docker Linux เรียกหา Host ด้วย host.docker.internal
        $apiUrl = 'http://host.docker.internal:3000/webform/file/' . $file_id;
        $fileContent = @file_get_contents($apiUrl);

        if ($fileContent !== false && !empty($fileContent)) {
            $this->load->helper('download');
            force_download($file->FILE_ONAME, $fileContent);
            return;
        }

        show_error('ไม่พบไฟล์จริงในระบบ: ' . $fullPath, 404);
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

        $sql = "SELECT * FROM FE_FILE WHERE FILE_ID = ?";
        $file = $this->MainModel->QuerySetBase($sql, $this->webflowBase, [$file_id])->row();
        if (!$file) {
            return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => 'File not found in DB']));
        }

        $fullPath = rtrim($file->FILE_PATH, '/\\') . DIRECTORY_SEPARATOR . $file->FILE_FNAME;

        if (file_exists($fullPath) && is_file($fullPath)) {
            @unlink($fullPath);
        }
        
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

    public function PreviewStampedPdf() {
        $formKeys = [
            'NFRMNO' => (int)$this->input->get('no'),
            'VORGNO' => (string)$this->input->get('orgNo'),
            'CYEAR'  => (string)$this->input->get('y'),
            'CYEAR2' => (string)$this->input->get('y2'),
            'NRUNNO' => (int)$this->input->get('runNo'),
        ];

        // 1. ดึง Header จาก SMMT
        $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
        $header = $dbSmmt->where($formKeys)->get('FE_DOC_HEADER')->row();
        if (!$header) show_error('Document not found in SMMT', 404);

        // 2. ดึงไฟล์ PDF จากตาราง FE_FILE ใน Webflow Base
        $dbWebflow = $this->load->database($this->webflowBase, TRUE);
        $filePdf = $dbWebflow->where($formKeys)
                             ->group_start()
                                 ->like('LOWER(FILE_ONAME)', '.pdf')
                                 ->or_like('LOWER(FILE_FNAME)', '.pdf')
                             ->group_end()
                             ->order_by('FILE_ID', 'ASC')
                             ->get('FE_FILE')->row();

        if (!$filePdf) show_error('No PDF file attached to this document', 404);

        // เชื่อม Path ด้วย \ ให้ตรงตามโครงสร้างของ NAS
        $cleanDirPath = rtrim($filePdf->FILE_PATH, '/\\');
        $fullPath = $cleanDirPath . '\\' . $filePdf->FILE_FNAME;

        if (!file_exists($fullPath)) {
            show_error('File not found on server: ' . $fullPath, 404);
        }

        // ส่งเข้ากระบวนการคลายบีบอัดและ Stamp ผ่าน FPDI
        $cleanPdfPath = $this->repairPdfForFpdi($fullPath);

        // 3. ดึง Step และ Log อนุมัติ
        $steps = $this->MainModel->getStepsByDocType($header->DOC_TYPE_CODE);
        $approvalLogs = $this->MainModel->getApprovalLogList($formKeys);

        // 4. นำมา Stamp และ Preview บน Browser
        $pdf = new Fpdi();
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pageCount = $pdf->setSourceFile($cleanPdfPath);

        for ($p = 1; $p <= $pageCount; $p++) {
            $tplId = $pdf->importPage($p);
            $size = $pdf->getTemplateSize($tplId);
            $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';

            $pdf->AddPage($orientation, [$size['width'], $size['height']]);
            $pdf->useTemplate($tplId, 0, 0, $size['width'], $size['height'], true);

            // Stamp เฉพาะหน้าแรก
            if ($p === 1) {
                $this->drawDynamicStamp($pdf, $steps, $approvalLogs, $size['width']);
            }
        }

        // 1. คลาย Handle ของ FPDI ออกจากไฟล์ต้นฉบับ
        if (method_exists($pdf, 'cleanUp')) {
            $pdf->cleanUp();
        }

        // 2. หน่วงเวลาลบไฟล์ Temp หลังสคริปต์ทำงานเสร็จสิ้น ป้องกัน Windows Lock
        if ($cleanPdfPath !== $fullPath && file_exists($cleanPdfPath)) {
            register_shutdown_function(function () use ($cleanPdfPath) {
                if (file_exists($cleanPdfPath)) {
                    @unlink($cleanPdfPath);
                }
            });
        }

        // 3. ล้าง Buffer ทั้งหมด เพื่อไม่ให้ Warning ใดๆ หลุดไปก่อน PDF Headers
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        // 4. แสดงผล Preview บน Browser ('I' = Inline) แล้วหยุดการทำงานทันที
        $pdf->Output('Preview_' . $header->DOC_NO . '.pdf', 'I');
        exit;
    }

    

    /**
     * ฟังก์ชันแปลง PDF 1.5+ หรือไฟล์ที่มี compressed xref streams ให้เป็น PDF 1.4
     * เพื่อให้ FPDI เวอร์ชันฟรีอ่านได้โดยไม่เกิด CrossReferenceException
     */
    private function repairPdfForFpdi($inputPath) {
        $tempPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'fpdi_fixed_' . uniqid() . '.pdf';

        // 1. ลองใช้ Ghostscript (gs)
        $cmdGs = sprintf(
            'gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dNOPAUSE -dQUIET -dBATCH -sOutputFile=%s %s 2>&1',
            escapeshellarg($tempPath),
            escapeshellarg($inputPath)
        );
        @exec($cmdGs, $outputGs, $returnCodeGs);

        if ($returnCodeGs === 0 && file_exists($tempPath) && filesize($tempPath) > 0) {
            return $tempPath;
        }

        // 2. Fallback: qpdf
        $cmdQpdf = sprintf(
            'qpdf --qdf --object-streams=disable %s %s 2>&1',
            escapeshellarg($inputPath),
            escapeshellarg($tempPath)
        );
        @exec($cmdQpdf, $outputQpdf, $returnCodeQpdf);

        if ($returnCodeQpdf === 0 && file_exists($tempPath) && filesize($tempPath) > 0) {
            return $tempPath;
        }

        // ถ้าแปลงไม่สำเร็จ ให้ลบ Temp ที่สร้างค้างไว้ทิ้ง
        if (file_exists($tempPath)) {
            @unlink($tempPath);
        }

        return $inputPath;
    }
    
    private function drawDynamicStamp($pdf, $steps, $approvalLogs, $pageWidth) {
        $stepCount = count($steps);
        if ($stepCount === 0) return;

        $colW = 24;
        $tableW = $colW * $stepCount;
        $startX = $pageWidth - $tableW - 8;
        $startY = 8;
        $boxH = 22;

        $pdf->SetFont('helvetica', 'B', 6.5);
        $pdf->SetDrawColor(80, 80, 80);
        $pdf->SetLineWidth(0.2);

        $x = $startX;
        foreach ($steps as $st) {
            $pdf->SetXY($x, $startY);
            $pdf->SetFillColor(240, 243, 246);
            $pdf->Cell($colW, 5.5, $st->POSITION_TITLE, 1, 0, 'C', 1);
            $pdf->SetXY($x, $startY + 5.5);
            $pdf->Cell($colW, $boxH, '', 1, 0, 'C');
            $x += $colW;
        }

        $appMap = [];
        foreach ($approvalLogs as $log) { $appMap[$log->CEXTDATA] = $log; }

        $pdf->SetAlpha(0.75);
        $pdf->SetDrawColor(220, 38, 38);
        $pdf->SetTextColor(220, 38, 38);

        foreach ($steps as $idx => $st) {
            $app = $appMap[$st->CEXTDATA] ?? null;
            if ($app && !empty($app->APPROVE_DATE)) {
                $cx = $startX + ($idx * $colW) + ($colW / 2);
                $cy = $startY + 5.5 + ($boxH / 2);

                $pdf->Circle($cx, $cy, 7, 0, 360, 'D');

                $pdf->SetFont('helvetica', 'B', 6);
                $pdf->SetXY($cx - 10, $cy - 4);
                $pdf->Cell(20, 3, 'AMEC', 0, 1, 'C');

                $pdf->SetFont('helvetica', '', 4.5);
                $pdf->SetXY($cx - 10, $cy - 1);
                $pdf->Cell(20, 3, $app->APPROVE_DATE, 0, 1, 'C');

                $pdf->SetFont('helvetica', 'B', 5.5);
                $pdf->SetXY($cx - 10, $cy + 2);
                $pdf->Cell(20, 3, $app->APPROVER_NAME, 0, 1, 'C');
            }
        }

        $pdf->SetAlpha(1);
        $pdf->SetTextColor(0, 0, 0);
    }


}