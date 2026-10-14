<?php
use GuzzleHttp\Client;

defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/api/webform/form.php';
require_once APPPATH . 'controllers/api/webform/flow.php';
require_once APPPATH . 'controllers/api/webform/formmst.php';
require_once APPPATH . 'controllers/_file.php';

class Form extends MY_Controller {
    use formApi, flow, formmst;

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
        
        $this->SmmtBase    = 'SMMT';    // SMMT: FE_ASP_HEADER, FE_ASP_CONTROL_MST, FE_ASP_TOPIC_MST, FE_ASP_CONFIRMATION_DTL
        $this->webflowBase = 'DEFAULT'; // DEFAULT: FORM, FLOW, FE_FILE, AMECUSERALL
    }
    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1

    // === http://localhost:8080/form/feform/FE-ASP/form/main/?no=26&orgNo=051001&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === http://localhost:8080/form/feform/FE-ASP/form/main?no=26&orgNo=051001&y=26&y2=2026&runNo=2&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList.asp&menu=1
 
    public function main() {
        $empno          = $this->input->get('empno') ?? '';
        $data['CYEAR2'] = $this->input->get('y2') ?? '';
        $data['NRUNNO'] = $this->input->get('runNo') ?? '';
        $data['EMPNO']  = (string)$empno;

        // ดึงข้อมูลพนักงานเริ่มต้นสำหรับกรณีสร้างใหม่
        $initEmp = !empty($empno) ? $this->MainModel->getEmpName($empno) : ['empno' => '', 'name' => ''];

        $data['REQBY_EMPNO']   = $initEmp['empno'];
        $data['REQBY_NAME']    = $initEmp['name'];
        $data['INPUTBY_EMPNO'] = $initEmp['empno'];
        $data['INPUTBY_NAME']  = $initEmp['name'];

        // กำหนด Default Values ฟอร์ม FE-ASP
        $data['DOC_HEADER_ID']    = '';
        $data['DOC_NO']           = '';
        $data['CONTROL_NO']       = '';
        $data['REVIEW_PERIOD']    = 'YEARLY';
        $data['REVIEW_DETAILS']   = 'NO_CHANGE';
        $data['DETAIL_OF_CHANGE'] = '';
        $data['EFFECT_STATUS']    = 'NO_EFFECT';
        $data['STATUS']           = '';
        $data['IS_AUTO_JOB']      = 'N';
        $data['REMARK']           = '';
        $data['CST']              = '';

        $data['controlInfo']      = null;
        $data['prevApprovedFile'] = null;
        $data['savedDetails']     = [];
        $data['attachedFiles']    = [];

        // ดึงคีย์ Core Webflow
        if ($this->input->get('no') !== null) {
            $data['NFRMNO'] = $this->input->get('no');
            $data['VORGNO'] = $this->input->get('orgNo');
            $data['CYEAR']  = $this->input->get('y');
        } else {
            $formMst        = $this->getFormMasterByVaname('FE-ASP');
            $data['NFRMNO'] = $formMst['data']['NNO'] ?? $formMst[0]->NNO;
            $data['VORGNO'] = $formMst['data']['VORGNO'] ?? $formMst[0]->VORGNO;
            $data['CYEAR']  = $formMst['data']['CYEAR'] ?? $formMst[0]->CYEAR;
        }

        // ดึง Master Data: Controls และ Topics
        $data['controls'] = $this->MainModel->getAllActiveControls();
        $data['topics']   = $this->MainModel->getActiveTopics();

        // เมื่อเปิดเอกสารเดิม (Edit / Approve / View)
        if (!empty($data['NRUNNO'])) {
            $header = $this->MainModel->getHeaderByKeys($data);
            if ($header) {
                $data['DOC_HEADER_ID']    = $header->HEADER_ID;
                $data['DOC_NO']           = $header->DOC_NO;
                $data['CONTROL_NO']       = $header->CONTROL_NO;
                $data['REVIEW_PERIOD']    = $header->REVIEW_PERIOD;
                $data['REVIEW_DETAILS']   = $header->REVIEW_DETAILS;
                $data['DETAIL_OF_CHANGE'] = $header->DETAIL_OF_CHANGE;
                $data['EFFECT_STATUS']    = $header->EFFECT_STATUS;
                $data['STATUS']           = $header->STATUS;
                $data['IS_AUTO_JOB']      = $header->IS_AUTO_JOB;
                $data['REMARK']           = $header->REMARK;

                $data['controlInfo']      = $this->MainModel->getControlMasterWithOrg($header->CONTROL_NO);
                $data['prevApprovedFile'] = $this->MainModel->getLatestApprovedFile($header->CONTROL_NO);
                $data['savedDetails']     = $this->MainModel->getConfirmationDetailsByHeaderId($header->HEADER_ID);
            }

            $detailform = $this->frm->getForm(
                (int)$data['NFRMNO'], 
                (string)$data['VORGNO'], 
                (string)$data['CYEAR'], 
                (string)$data['CYEAR2'], 
                (int)$data['NRUNNO']
            );

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

        $data['isAdmin'] = $this->MainModel->isFormAdmin('FE-ASP', $data['EMPNO']);

        // เรนเดอร์ View ผ่าน MY_Controller (แก้ Error views)
        $this->views('feform/FE-ASP/form', $data);
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

    public function GetControlInfo() {
        $this->output->set_content_type('application/json');
        try {
            $controlNo = trim((string)$this->input->get('controlNo'));
            if (empty($controlNo)) throw new Exception('ไม่พบรหัส Control No.');

            $ctrl = $this->MainModel->getControlMasterWithOrg($controlNo);
            if (!$ctrl) throw new Exception('ไม่พบข้อมูลสังกัดของ Control No. นี้');

            $prevFile = $this->MainModel->getLatestApprovedFile($controlNo);

            return $this->output->set_output(json_encode([
                'status'   => true,
                'control'  => $ctrl,
                'prevFile' => $prevFile
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function SaveDocMaster() {
        $this->output->set_content_type('application/json');
        try {
            $headerId      = $this->input->post('DOC_HEADER_ID');
            $controlNo     = trim((string)$this->input->post('CONTROL_NO'));
            $reviewPeriod  = trim((string)$this->input->post('REVIEW_PERIOD'));
            $reviewDetails = trim((string)$this->input->post('REVIEW_DETAILS'));
            $detailChange  = trim((string)$this->input->post('DETAIL_OF_CHANGE'));
            $effectStatus  = trim((string)$this->input->post('EFFECT_STATUS'));
            $topicsJson    = $this->input->post('TOPICS_JSON');
            $remark        = trim((string)($this->input->post('REMARK') ?? ''));
            $reqByPost     = trim((string)$this->input->post('REQBY'));
            $empNoPost     = trim((string)$this->input->post('EMPNO'));
            $isDraft       = $this->input->post('IS_DRAFT') === '1';
            $isResubmit    = $this->input->post('IS_RESUBMIT') === '1';

            $currentEmpNo = !empty($reqByPost) ? $reqByPost : (!empty($empNoPost) ? $empNoPost : ($this->session->userdata('empno') ?? ''));

            if (empty($controlNo)) throw new Exception("กรุณาเลือก Control No.");
            if (empty($currentEmpNo)) throw new Exception("กรุณาระบุรหัสผู้จัดทำ (Request By)");

            $this->db->trans_begin();

            $isCreateNew = empty($headerId) && empty($this->input->post('NRUNNO'));

            if ($isCreateNew) {
                $formMst  = $this->getFormMasterByVaname('FE-ASP');
                $formData = $formMst['data'];

                // DRAFT = '1' สำหรับบันทึกร่าง, '0' สำหรับส่ง Flow ทันที
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
                $docNo  = "FE-ASP-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);

                $headerData = [
                    'DOC_NO'           => $docNo,
                    'CONTROL_NO'       => $controlNo,
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
                    'IS_AUTO_JOB'      => 'N',
                    'USER_ACTION'      => $currentEmpNo,
                    'REMARK'           => $remark,
                ];

                $headerId = $this->MainModel->insertHeader($headerData);

            } else {
                $cyear2 = $this->input->post('CYEAR2');
                $nrunno = $this->input->post('NRUNNO');
                $docNo  = $this->input->post('DOC_NO');

                $updateData = [
                    'CONTROL_NO'       => $controlNo,
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

            // บันทึกคำตอบตารางประเมินสีเขียว
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
                    'NFRMNO'        => $formData['NNO'] ?? $this->input->post('NFRMNO'),
                    'VORGNO'        => $formData['VORGNO'] ?? $this->input->post('VORGNO'),
                    'CYEAR'         => $formData['CYEAR'] ?? $this->input->post('CYEAR'),
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
            $empno    = (string)($this->input->post('EMPNO') ?: ($this->session->userdata('empno') ?? ''));
            $headerId = $this->input->post('DOC_HEADER_ID');

            $dbSmmt = $this->load->database($this->SmmtBase, TRUE);
            $header = $dbSmmt->where('HEADER_ID', $headerId)->get('FE_ASP_HEADER')->row();

            if (!$header) throw new Exception('ไม่พบเอกสารในระบบ');

            // ⚠️ ป้องกันการ Reject ในกรณี Yearly Review (Auto Job)
            if ($action === 'REJECT' && $header->IS_AUTO_JOB === 'Y') {
                throw new Exception('เอกสารทบทวนประจำปี (Yearly Review) ไม่อนุญาตให้ Reject ให้เลือก Return แทน');
            }

            $status = 'PROCESS';
            if ($action === 'APPROVE') {
                // เช็คว่าถึงขั้นสุดท้ายของสายอนุมัติ FE-ASP หรือยัง (E/P DIM: EXT '05')
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