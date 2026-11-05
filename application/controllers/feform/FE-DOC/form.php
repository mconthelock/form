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
    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-DOC/form/main/?no=27&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-DOC/form/main?no=27&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1

    // === http://localhost:8080/form/feform/FE-DOC/form/main/?no=27&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === http://localhost:8080/form/feform/FE-DOC/form/main?no=27&orgNo=051001&y=26&y2=2026&runNo=2&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList.asp&menu=1
   
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

        $data['DOC_HEADER_ID'] = '';
        $data['DOC_TYPE_CODE'] = '';
        $data['DOC_NO']        = '';
        $data['DOC_SUBJECT']   = '';
        $data['REMARK']        = '';
        $data['STATUS']        = '';
        $data['attachedFiles'] = [];

        if ($this->input->get('no') !== null) {
            $data['NFRMNO'] = $this->input->get('no');
            $data['VORGNO'] = $this->input->get('orgNo');
            $data['CYEAR']  = $this->input->get('y');
        } else {
            $formMst        = $this->getFormMasterByVaname('FE-DOC');
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
                $data['DOC_SUBJECT']   = $header->DOC_SUBJECT ?? '';
                $data['REMARK']        = $header->REMARK;
                $data['STATUS']        = $header->STATUS;
            }

            $detailform = $this->frm->getForm(
                (int)$data['NFRMNO'], 
                (string)$data['VORGNO'], 
                (string)$data['CYEAR'], 
                (string)$data['CYEAR2'], 
                (int)$data['NRUNNO']
            );

            $reqEmp   = $this->MainModel->getEmpName($detailform[0]->VREQNO ?? '');
            $inputEmp = $this->MainModel->getEmpName($detailform[0]->VINPUTER ?? '');

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

        $data['isAdmin'] = $this->MainModel->isFormAdmin('FE-DOC', $data['EMPNO']);

        $this->views('feform/FE-DOC/form', $data);
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

    public function SaveDocMaster() {
        $this->output->set_content_type('application/json');
        try {
            $docHeaderId = trim((string)$this->input->post('DOC_HEADER_ID'));
            $isResubmit  = $this->input->post('IS_RESUBMIT') === '1' || !empty($docHeaderId);
            $docTypeCode = trim((string)$this->input->post('DOC_TYPE_CODE'));
            $docSubject  = trim((string)$this->input->post('docSubject'));
            $remark      = trim((string)($this->input->post('REMARK') ?? ''));
            $reqByPost   = trim((string)$this->input->post('REQBY'));
            $empNoPost   = trim((string)$this->input->post('EMPNO'));

            $currentEmpNo = !empty($reqByPost) ? $reqByPost : (!empty($empNoPost) ? $empNoPost : '');

            if (empty($docTypeCode)) {
                throw new Exception("กรุณาระบุประเภทเอกสาร (DOC_TYPE_CODE)");
            }

            $requesterEmpNo = $currentEmpNo;
            if (empty($requesterEmpNo)) {
                $step00 = $this->MainModel->getStepByDocAndExtData($docTypeCode, '00');
                if ($step00 && !empty(trim($step00->TARGET_EMPNO))) {
                    $requesterEmpNo = trim($step00->TARGET_EMPNO);
                }
            }

            if (empty($requesterEmpNo)) {
                throw new Exception("ไม่พบรหัสผู้ขออนุมัติ (REQBY) กรุณากรอกรหัสพนักงาน");
            }

            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);

            // ----------------------------------------------------
            // กรณี RESUBMIT (หลัง Return กลับมา): อัปเดตข้อมูลเดิม ไม่เขียนทับ Creator
            // ----------------------------------------------------
            if ($isResubmit) {
                $updateData = [
                    'DOC_TYPE_CODE' => $docTypeCode,
                    'DOC_SUBJECT'   => $docSubject,
                    'REMARK'        => $remark,
                    'STATUS'        => 'PROCESS',
                ];

                $dbSmmt->where('DOC_HEADER_ID', $docHeaderId);
                $dbSmmt->set('UPDATE_DATE', 'SYSDATE', FALSE);
                // ไม่ใส่ CREATE_BY และ CREATE_DATE เพื่อคงค่าคนสร้างคนแรกไว้ตลอดไป
                $dbSmmt->update('FE_DOC_HEADER', $updateData);

                return $this->output->set_output(json_encode([
                    'status'  => true,
                    'message' => 'บันทึกและส่งเอกสารสำเร็จ',
                ]));
            }

            // ----------------------------------------------------
            // กรณี CREATE ครั้งแรกสุด: สร้าง Flow และบันทึก Creator + เวลาสร้าง
            // ----------------------------------------------------
            $formMst  = $this->getFormMasterByVaname('FE-DOC');
            $formData = $formMst['data'];

            $flowData = [
                'NFRMNO'  => $formData['NNO'],
                'VORGNO'  => $formData['VORGNO'],
                'CYEAR'   => $formData['CYEAR'],
                'REQBY'   => $requesterEmpNo,
                'INPUTBY' => !empty($empNoPost) ? $empNoPost : $requesterEmpNo,
                'REMARK'  => $remark,
                // 'DRAFT'   => '0', // ส่งเข้าสายอนุมัติทันที
            ];
            $rsf = $this->createForm($flowData);
            if (!$rsf || empty($rsf['status'])) {
                throw new Exception("สร้างเอกสาร Webflow ไม่สำเร็จ: " . ($rsf['message'] ?? ''));
            }

            $cyear2      = $rsf['data']['CYEAR2'];
            $nrunno      = $rsf['data']['NRUNNO'];
            $docNo       = "FE-DOC-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);
            $docHeaderId = date('Ymd') . str_pad($nrunno, 4, '0', STR_PAD_LEFT);

            // กรองและลบ Step Flow ที่ไม่เกี่ยวข้องตาม Doc Type
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

            // จัดเรียงลำดับ Flow ถัดไป
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
                    $newStepSt  = ($index === 0) ? '3' : (($index === 1) ? '2' : '1');
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

            // บันทึก Header ครั้งแรกสุด
            $headerData = [
                'DOC_HEADER_ID' => $docHeaderId,
                'NFRMNO'        => $formData['NNO'],
                'VORGNO'        => $formData['VORGNO'],
                'CYEAR'         => $formData['CYEAR'],
                'CYEAR2'        => $cyear2,
                'NRUNNO'        => $nrunno,
                'DOC_NO'        => $docNo,
                'DOC_TYPE_CODE' => $docTypeCode,
                'DOC_SUBJECT'   => $docSubject,
                'REMARK'        => $remark,
                'STATUS'        => 'PROCESS',
                'CREATE_BY'   => $requesterEmpNo,
            ];

            $dbSmmt->set('CREATE_DATE', 'SYSDATE', FALSE);
            $dbSmmt->set('UPDATE_DATE', 'SYSDATE', FALSE);
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
            // $dbSmmt->set('CREATE_BY', $empno);
            // $dbSmmt->set('CREATE_DATE', 'SYSDATE', FALSE);
            $dbSmmt->update('FE_DOC_HEADER');

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
            $res  = $this->MainModel->getMasterDocDetail($code);
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

            return $this->output->set_output(json_encode(['status' => true, 'message' => 'บันทึก Master สำเร็จ']));
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