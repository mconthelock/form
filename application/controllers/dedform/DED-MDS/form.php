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


class form extends MY_Controller {
    use formApi, flow, formmst;

    public function __construct() {
        parent::__construct();
        
        $this->client = new Client(['verify' => false]);
        
        $this->load->library('Mail');
        // // ปิด Deprecation error ชั่วคราวก่อนโหลด TCPDF wrapper
        // $old_level = error_reporting(error_reporting() & ~E_USER_DEPRECATED & ~E_DEPRECATED);

        // $this->load->library('pdf');
        // error_reporting($old_level); // คืนค่าเดิม
        $this->load->model('form_model', 'frm');
        $this->load->model('dedform/DED-MDS/DED_MDS_model', 'MDSModel');
        $this->host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'amecweb';
        
        $this->DDS = 'DDS';
    }

    // === https://amecwebtest.mitsubishielevatorasia.co.th/form/dedform/DED-MDS/form/main/?no=29&orgNo=070101&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === http://localhost:8080/form/dedform/DED-MDS/form/main
    // === http://localhost:8080/form/dedform/DED-MDS/form/main/?no=29&orgNo=070101&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === http://localhost:8080/form/dedform/DED-MDS/form/main?no=29&orgNo=070101&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
    public function main() {
        $empno = $this->input->get('empno') ?? '';
        // var_dump($empno);
        $data['CYEAR2']    = $this->input->get('y2') ?? '';
        $data['NRUNNO']    = $this->input->get('runNo') ?? '';
        $data['EMPNO']     = (string)$empno;
        $data['REQBY']   = $empno;
        $data['INPUTBY'] = $empno;
        $data['DOC_NO'] = '';
        $data['PLANHEADERID']    ='';

        // 1. ตรวจสอบการส่ง Form Key จาก URL
        if (
            $this->input->get('no') !== null && $this->input->get('no') !== '' &&
            $this->input->get('orgNo') !== null && $this->input->get('orgNo') !== '' &&
            $this->input->get('y') !== null && $this->input->get('y') !== ''
        ) {
            $data['NFRMNO'] = $this->input->get('no');
            $data['VORGNO'] = $this->input->get('orgNo');
            $data['CYEAR']  = $this->input->get('y');
        } else {
            // กรณีไม่ส่งตัวแปรมา ให้ค้นหาข้อมูล Master ของแบบฟอร์ม DED-MDS อัตโนมัติ
            $formMst = $this->getFormMasterByVaname('DED-MDS');
            if (!empty($formMst)) {
                // รองรับทั้งแบบ Array หรือ Object จาก Master API
                $data['NFRMNO'] = is_array($formMst) ? ($formMst['data']['NNO'] ?? $formMst[0]->NNO) : $formMst->NNO;
                $data['VORGNO'] = is_array($formMst) ? ($formMst['data']['VORGNO'] ?? $formMst[0]->VORGNO) : $formMst->VORGNO;
                $data['CYEAR']  = is_array($formMst) ? ($formMst['data']['CYEAR'] ?? $formMst[0]->CYEAR) : $formMst->CYEAR;
            } else {
                
            }
        }



        // 2. ดึง Master DesType ทั้งหมดที่ IsActive = 1
        $sqlDesType = "SELECT DesType, DesTypeName, P_Type, Seq, IsDefault 
                    FROM Tb_MS_Master_DESBM_DesType 
                    WHERE IsActive = 1 
                    ORDER BY Seq ASC";
        $desTypeMasterList = $this->MDSModel->QuerySetBase($sqlDesType, $this->DDS, [])->result();
        $data['desTypeList'] = $desTypeMasterList;

        $data['PLAN_YEAR'] = date('Y');
        $data['PERIOD']    = '';
        $data['REVISION']  = '-';
        $data['DOC_NO']    = '';
        $data['REMARK']    = '';
        $data['STATUS']    = '';


        // หา Default DesTypes จากฐานข้อมูล (ตัวที่ IsDefault = 1)
        $defaultDesTypes = [];
        if (!empty($desTypeMasterList)) {
            foreach ($desTypeMasterList as $item) {
                if (!empty($item->IsDefault) && (int)$item->IsDefault === 1) {
                    $defaultDesTypes[] = $item->DesType;
                }
            }
        }

        // 2. แยก Logic ระหว่าง 'View/Edit' (มี NRUNNO) กับ 'เตรียมสร้างฟอร์ม' (ไม่มี NRUNNO)
        if (!empty($data['NRUNNO'])) {
            // --- CASE: View หรือ Edit (เปิดฟอร์มเดิมที่มีในระบบแล้ว) ---
            $mdsform = $this->frm->getForm(
                (int)$data['NFRMNO'], 
                (string)$data['VORGNO'], 
                (string)$data['CYEAR'], 
                (string)$data['CYEAR2'], 
                (int)$data['NRUNNO']
            );

            if (!empty($mdsform)) {
                $data['REQBY']   = $mdsform[0]->VREQNO ?? '';
                $data['INPUTBY'] = $mdsform[0]->VINPUTER ?? '';
                $data['CST']     = $mdsform[0]->CST ?? '0';
            } else {
                $data['CST']     = '0';
            }

            $data['DOC_NO'] = "DED-MDS-" . $data['CYEAR2'] . "-" . str_pad($data['NRUNNO'], 6, '0', STR_PAD_LEFT);
            
            // ดึงข้อมูล Header เพิ่มเติมจากตารางจริงถ้ามี
            $sqlHeader = "SELECT TOP 1 PlanYear, PeriodCode, Revision, Remark ,PlanHeaderID,Status
                        FROM Tb_Master_DESBM_Header 
                        WHERE CYEAR2 = ? and NRUNNO = ?";
            $headerInfo = $this->MDSModel->QuerySetBase($sqlHeader, $this->DDS, [$data['CYEAR2'],(int)$data['NRUNNO']])->row();
            if ($headerInfo) {
                $data['PLAN_YEAR'] = $headerInfo->PlanYear;
                $data['PERIOD']    = $headerInfo->PeriodCode;
                $data['REVISION']  = $headerInfo->Revision?? '*';
                $data['REMARK']    = $headerInfo->Remark ?? '';
                $data['STATUS']    = $headerInfo->Status ?? '';
                $data['PLANHEADERID']    = $headerInfo->PlanHeaderID ?? '';
                // ถ้ามีค่าใน Header เดิมให้ใช้ค่านั้น ถ้าไม่มีให้ fallback ไปยัง default
                $data['selectedDesTypes'] = !empty($headerInfo->DesType) ? explode('|', $headerInfo->DesType) : $defaultDesTypes;
            }

        } else {
            // --- CASE: เตรียมสร้างฟอร์มใหม่ (Create Mode) ---
            $data['REQBY']   = $empno;
            $data['INPUTBY'] = $empno;
            $data['CST']     = '0';
            $data['MODE']    = '1'; // กำหนดให้เป็น Mode 1 (Create) ชัดเจน
            $data['selectedDesTypes'] = $defaultDesTypes;
            
            $data['PLANHEADERID']    ='';
                
        }


        $this->views('dedform/DED-MDS/form', $data);
    }

    // Ajax ดึง Master DesType 
    public function GetDesTypeMaster() {
        $sql = "SELECT DesType, DesTypeName, P_Type, IsActive FROM Tb_MS_Master_DESBM_DesType WHERE IsActive = 1 ORDER BY Seq ASC";
        $result = $this->MDSModel->QuerySetBase($sql, $this->DDS)->result();
        return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true, 'data' => $result]));
    }


    // ==============================================================================
    // 1. Controller Method: ดึง DRAFT เดิม   getOrInitDraftPlan
    // ==============================================================================
    public function GetOrInitDraftPlan() {
        try {
            $year    = trim((string)$this->input->post('YEAR'));
            $period  = trim((string)$this->input->post('PERIOD'));
            $empno   = $this->input->post('EMPNO') ?? 'SYSTEM';
            $EXTDATA = trim((string)$this->input->post('EXTDATA'));
            $MODE    = trim((string)$this->input->post('MODE'));

            // รับค่าคีย์อ้างอิงเอกสาร Webflow (ถ้ามี)
            $vorgno  = trim((string)$this->input->post('VORGNO'));
            $cyear2  = trim((string)$this->input->post('CYEAR2'));
            $nrunno  = trim((string)$this->input->post('NRUNNO'));
            $planheaderid  = trim((string)$this->input->post('PLANHEADERID'));

            if (empty($year) || empty($period)) {
                return $this->output->set_content_type('application/json')->set_output(json_encode([
                    'statusTb'     => true,
                    'hasDraft'     => false,
                    'revision'     => '*',
                    'nextRevision' => '*',
                    'desType'      => null,
                    'planHeaderID' => null,
                    'status'       => '',
                    'docNo'        => '',
                    'data'         => [],
                ]));
            }

            $headerRow = null;

            $nextRevision = $this->getNextApprovedRevision($year, $period);


            if ($MODE === '1') {
                // -------------------------------------------------------------
                // 🟢 MODE 1: CREATE MODE
                // -------------------------------------------------------------
                // 1. ค้นหาว่ามี DRAFT ค้างอยู่ในระบบหรือไม่
                $sqlDraft = "SELECT TOP 1 PlanHeaderID, PlanYear, PeriodCode, Revision, DesType, Status, Remark,
                                        VORGNO, CYEAR2, NRUNNO
                            FROM Tb_Master_DESBM_Header 
                            WHERE PlanYear = ? AND PeriodCode = ? AND UPPER(Status) IN ('DRAFT', 'PROCESS')
                            ORDER BY PlanHeaderID DESC";
                $headerRow = $this->MDSModel->QuerySetBase($sqlDraft, $this->DDS, [$year, $period])->row();

                // 2. ถ้าไม่มี DRAFT ให้หา Next Revision สำหรับเตรียมขึ้น Plan ใหม่
                if (!$headerRow) {

                    return $this->output->set_content_type('application/json')->set_output(json_encode([
                        'statusTb'     => true,
                        'hasDraft'     => false,
                        'revision'     => $nextRevision,
                        'nextRevision' => $nextRevision,
                        'desType'      => null,
                        'planHeaderID' => null,
                        'status'       => '',
                        'docNo'        => '',
                        'data'         => [],
                    ]));
                }

            } else {
                // -------------------------------------------------------------
                // MODE อื่นๆ: (PROCESS, APPROVE, VIEW)
                // -------------------------------------------------------------
                if (!empty($nrunno) && !empty($cyear2) && !empty($vorgno)) {
                    // ดึงตรงตามเลขเอกสาร Webflow ของตั๋วใบนี้
                    $sqlByDoc = "SELECT TOP 1 PlanHeaderID, PlanYear, PeriodCode, Revision, DesType, Status, Remark,
                                            VORGNO, CYEAR2, NRUNNO
                                FROM Tb_Master_DESBM_Header 
                                WHERE  NRUNNO = ? AND CYEAR2 = ? AND VORGNO = ? 
                                ORDER BY PlanHeaderID DESC";
                    $headerRow = $this->MDSModel->QuerySetBase($sqlByDoc, $this->DDS, [$nrunno, $cyear2, $vorgno])->row();
                }

                // ถ้าหาตามตั๋วไม่เจอ ให้ดึงตัวล่าสุดของรอบนั้นมาแสดง
                if (!$headerRow) {
                    $sqlLatest = "SELECT TOP 1 PlanHeaderID, PlanYear, PeriodCode, Revision, DesType, Status, Remark,
                                            VORGNO, CYEAR2, NRUNNO
                                FROM Tb_Master_DESBM_Header 
                                WHERE PlanYear = ? AND PeriodCode = ?
                                ORDER BY PlanHeaderID DESC";
                    $headerRow = $this->MDSModel->QuerySetBase($sqlLatest, $this->DDS, [$year, $period])->row();
                }
            }

            // -------------------------------------------------------------
            // จัดการดึง Detail ของ Header ที่ค้นพบ
            // -------------------------------------------------------------
            if ($headerRow) {
                $rawStatus = strtoupper(trim($headerRow->Status));
                $docNo = (!empty($headerRow->VORGNO) && !empty($headerRow->CYEAR2) && !empty($headerRow->NRUNNO))
                        ? "DED-MDS-" . $headerRow->CYEAR2 . "-" . str_pad($headerRow->NRUNNO, 6, '0', STR_PAD_LEFT)
                        : '';

                // ดึง Detail พร้อมข้อมูล Diff เทียบกับ Revision ล่าสุดก่อนหน้า
                // $sql = "select * from Tb_Master_DESBM_Detail where PlanHeaderID = ?";
                // $dataDetail = $this->MDSModel->QuerySetBase($sql, $this->DDS, [$headerRow->PlanHeaderID])->result();
                $dataDetail = $this->MDSModel->getPlanDetailWithDiff(
                    $headerRow->PlanHeaderID, 
                    $year, 
                    $period, 
                    $headerRow->Revision
                );


                return $this->output->set_content_type('application/json')->set_output(json_encode([
                    'statusTb'     => true,
                    'hasDraft'     => ($rawStatus === 'DRAFT'),
                    'revision'     => $headerRow->Revision,
                    'nextRevision' => $nextRevision,
                    'desType'      => $headerRow->DesType ?? '',
                    'planHeaderID' => $headerRow->PlanHeaderID,
                    'status'       => $headerRow->Status,
                    'docNo'        => $docNo,
                    'remark'       => $headerRow->Remark ?? '',
                    'data'         => $dataDetail,    
                ]));
            }

            // กรณีไม่พบข้อมูลใดๆ เลย
            $nextRevision = $this->getNextApprovedRevision($year, $period);
            return $this->output->set_content_type('application/json')->set_output(json_encode([
                'statusTb'     => true,
                'hasDraft'     => false,
                'revision'     => $nextRevision,
                'nextRevision' => $nextRevision,
                'desType'      => null,
                'planHeaderID' => null,
                'status'       => '',
                'docNo'        => '',
                'data'         => [],
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_content_type('application/json')->set_output(json_encode([
                'statusTb' => false,
                'message'  => $e->getMessage()
            ]));
        }
    }

    // ==============================================================================
    // 2. Controller Method: คำนวณใหม่ทับ DRAFT เดิม (เมื่อกด Process Calculation)  processPlanCalculation
    // ==============================================================================
    public function ProcessPlan() {
        $this->output->set_content_type('application/json');
        $db = $this->load->database($this->DDS, TRUE);
        try {
            $year     = trim((string)$this->input->post('YEAR'));
            $period   = trim((string)$this->input->post('PERIOD'));
            $desTypes = $this->input->post('DESTYPES');
            $empno    = $this->input->post('EMPNO') ?? 'SYSTEM';
            $MODE    = $this->input->post('MODE') ?? 'SYSTEM';
            $EXTDATA    = $this->input->post('EXTDATA') ?? 'SYSTEM';
            $PLANHEADERID    = $this->input->post('PLANHEADERID') ;

            // 1. Validation กั้นไว้ก่อน: ถ้าไม่ได้ระบุ Year / Period / DesType ห้ามเริ่มงานเด็ดขาด
            if (empty($year) || empty($period)) {
                return $this->output->set_output(json_encode([
                    'status'  => false,
                    'message' => 'กรุณาเลือก Year และ Period ก่อนกด Process Plan'
                ]));
            }

            if (empty($desTypes)) {
                return $this->output->set_output(json_encode([
                    'status'  => false,
                    'message' => 'กรุณาเลือก DesType อย่างน้อย 1 รายการ'
                ]));
            }

            // if($MODE === '2' && ($EXTDATA === '' || $EXTDATA === '01'))
            // {

            // }
            // else{

            // }
            // 2. ป้องกันการ Process ซ้อน: ตรวจสอบก่อนว่ารอบนี้ติดสถานะ PROCESS ใน Flow อยู่หรือไม่
            $sqlCheckProcess = "SELECT TOP 1 PlanHeaderID, VORGNO, CYEAR2, NRUNNO 
                                FROM Tb_Master_DESBM_Header WITH (NOLOCK)
                                WHERE PlanYear = ? AND PeriodCode = ? AND Status ='PROCESS'";
            $qProcess = $db->query($sqlCheckProcess, [$year, $period]);
            if ($qProcess && $qProcess->num_rows() > 0) {
                $rowProc = $qProcess->row();
                $docNo = "DED-MDS-{$rowProc->CYEAR2}-" . str_pad($rowProc->NRUNNO, 6, '0', STR_PAD_LEFT);
                return $this->output->set_output(json_encode([
                    'status'  => false,
                    'message' => "รอบแผนงานนี้กำลังอยู่ในขั้นตอนการอนุมัติ [{$docNo}] ไม่สามารถประมวลผลใหม่ได้"
                ]));
            }

            // 1. อ่านข้อมูลเตรียมไว้ก่อน (ไม่เปิด Transaction)
            $nextRevision = $this->getNextApprovedRevision($year, $period);

            // 2. เปิด Transaction ให้สั้นที่สุด (มีเฉพาะงานเขียนลง DB)
            // $db->query("SET LOCK_TIMEOUT 5000;");
            // $db->trans_begin();

            // 2.1 ล้าง Draft เดิม
            $this->MDSModel->DeleteDraftDesBM($year, $period, null, $db);
            // สร้าง PlanHeaderID รูปแบบ Custom Code (เช่น 202601001)
            $newPlanHeaderID = $this->MDSModel->generatePlanHeaderID($year, $period, $db);
            // 3. สร้าง Header ฉบับร่างใหม่
            $headerData = [
                'PlanHeaderID'   => (string)$newPlanHeaderID,
                'PlanYear'       => $year,
                'PeriodCode'     => $period,
                'Revision'       => $nextRevision,
                'Status'         => 'DRAFT',
                'DesType'        => is_array($desTypes) ? implode('|', $desTypes) : (string)$desTypes,
                'Remark'         => 'Process draft plan',
                'UserAction'     => 'SYSTEM',
                'ComputerAction' => (string)gethostbyaddr($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'),
                'DateAction'     => date('Y-m-d H:i:s')
            ];
            $db->insert('Tb_Master_DESBM_Header', $headerData);

            // 4. แยกการประมวลผลตาม Revision
            if ($nextRevision === '*' || $nextRevision === '0') {
                // 🟢 Rev * : ดึงจาก A002MP และคำนวณใหม่ตามสูตร
                $this->MDSModel->processPlanMasterDirect($newPlanHeaderID, $year, $period, $desTypes, $nextRevision, 'SYSTEM', $db);
            } else {
                // 🟠 Rev อื่นๆ : ดึง Detail ของ Revision ล่าสุดที่ Approved มา Copy ตั้งต้น
                $this->MDSModel->copyPreviousApprovedRevision($newPlanHeaderID, $year, $period, $desTypes, $nextRevision, $db);
            }

            // $db->trans_commit();

            // 5. ดึงข้อมูลพร้อมข้อมูลเปรียบเทียบกับ Revision ก่อนหน้า
            $data = $this->MDSModel->getPlanDetailWithDiff($newPlanHeaderID, $year, $period, $nextRevision);

            return $this->output->set_output(json_encode([
                'status'       => true,
                'revision'     => $nextRevision,
                'planHeaderID' => $newPlanHeaderID,
                'data'         => $data
            ]));

        } catch (\Throwable $e) {
            // $db->trans_rollback();
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function UpdateInlineDetail() {
        $this->output->set_content_type('application/json');

        try {
            $planHeaderID = trim((string)$this->input->post('PlanHeaderID'));
            $seqNo        = (int)$this->input->post('SeqNo');
            $field        = trim((string)$this->input->post('Field'));
            $value        = $this->input->post('Value');
            $empno        = $this->input->post('EMPNO') ?? 'SYSTEM';

            $allowedFields = ['DES_BM', 'Go_DES'];
            if (!in_array($field, $allowedFields)) {
                throw new Exception("ฟิลด์ {$field} ไม่อนุญาตให้แก้ไข");
            }

            if (empty($planHeaderID) || empty($seqNo)) {
                throw new Exception("ข้อมูล PlanHeaderID หรือ SeqNo ไม่ถูกต้อง");
            }

            $formattedDate = null;
            if (!empty($value)) {
                $cleanDate = trim(substr((string)$value, 0, 10));
                if (strtotime($cleanDate)) {
                    $formattedDate = date('Y-m-d 00:00:00', strtotime($cleanDate));
                }
            }

            $db = $this->load->database($this->DDS, TRUE);

            // 1. ดึงแถวปัจจุบันที่กำลังแก้ไข (ชี้ตาม Composite Key: PlanHeaderID + DetailID/SeqNo)
            $currentRow = $db->where('PlanHeaderID', $planHeaderID)
                            ->where('DetailID', $seqNo)
                            ->get('Tb_Master_DESBM_Detail')
                            ->row();

            if (!$currentRow) {
                throw new Exception("ไม่พบข้อมูลแถวที่ต้องการแก้ไข");
            }

            $pType   = $currentRow->P_Type;
            $desType = $currentRow->DesType;
            $mfgDate = $currentRow->MFG_BM;
            $a2m01   = $currentRow->A2M01;

            // 2. ดึง Config ทั้งหมดที่ Active จาก Tb_MS_Master_DESBM_Cal
            $calConfigs = $db->where('IsActive', 1)->get('Tb_MS_Master_DESBM_Cal')->result();

            // ฟังก์ชันช่วยค้นหา Config ตาม TargetField และ P_Type (Fallback ไปหา 'ALL')
            $getConfig = function($targetField, $currentPType) use ($calConfigs) {
                foreach ($calConfigs as $cfg) {
                    if ($cfg->TargetField === $targetField && $cfg->P_Type === $currentPType) {
                        return $cfg;
                    }
                }
                foreach ($calConfigs as $cfg) {
                    if ($cfg->TargetField === $targetField && $cfg->P_Type === 'ALL') {
                        return $cfg;
                    }
                }
                return null;
            };

            // Helper แปลง CalDate <-> WorkSeq
            $getWorkSeq = function($date) use ($db) {
                if (empty($date)) return null;
                $row = $db->select('WorkSeq')
                        ->where('CalDate <=', $date)
                        ->order_by('CalDate', 'DESC')
                        ->limit(1)
                        ->get('dbo.V_WorkingDays')
                        ->row();
                return $row ? (int)$row->WorkSeq : null;
            };

            $getCalDate = function($workSeq) use ($db) {
                if ($workSeq === null) return null;
                $row = $db->select('CalDate')
                        ->where('WorkSeq', (int)$workSeq)
                        ->get('dbo.V_WorkingDays')
                        ->row();
                return $row ? $row->CalDate : null;
            };

            // 3. กำหนดค่าเริ่มต้นของแถวปัจจุบันหลังแก้ไข
            $newDesBM = ($field === 'DES_BM') ? $formattedDate : $currentRow->DES_BM;
            $newGoDES = ($field === 'Go_DES') ? $formattedDate : $currentRow->Go_DES;

            $mfgSeq = $getWorkSeq($mfgDate);
            $desSeq = $getWorkSeq($newDesBM);

            // 🟢 แก้ไขจุดที่ 1: ดึงแถว P1_ROW อ้างอิงจาก A2M01 + DesType = 'N' โดยตรง (แม่นยำ ไม่ต้อง LIKE)
            $p1Row = null;
            if (!empty($a2m01)) {
                $p1Row = $db->where('PlanHeaderID', $planHeaderID)
                            ->where('A2M01', $a2m01)
                            ->where('DesType', 'N')
                            ->get('Tb_Master_DESBM_Detail')
                            ->row();
            }

            // 4. คำนวณ Go_DES แบบ Dynamic ตามตาราง CalConfig
            $cfgGoDes = $getConfig('Go_DES', $pType);
            if ($cfgGoDes && $field === 'DES_BM') {
                if ($cfgGoDes->BaseRowType === 'CURRENT' && $cfgGoDes->BaseField === 'DES_BM' && $desSeq !== null) {
                    $goSeq = $desSeq + (int)$cfgGoDes->OffsetDays;
                    $newGoDES = $getCalDate($goSeq);
                } elseif ($cfgGoDes->BaseRowType === 'P1_ROW' && $p1Row) {
                    $newGoDES = $p1Row->Go_DES;
                    $goSeq = $getWorkSeq($newGoDES);
                } else {
                    $goSeq = $getWorkSeq($newGoDES);
                }
            } else {
                $goSeq = $getWorkSeq($newGoDES);
            }

            // 5. คำนวณ Field วันที่อื่นๆ แบบ Dynamic
            $newConfirmMelina = null;
            $newMSE           = null;
            $newSWAssembly    = null;
            $newZeroLevel     = null;

            // (1) Confirm_MELINA
            $cfgConfirm = $getConfig('Confirm_MELINA', $pType);
            if ($cfgConfirm && $goSeq !== null) {
                $newConfirmMelina = $getCalDate($goSeq + (int)$cfgConfirm->OffsetDays);
            }

            // (2) MSE_to_MELINA
            $cfgMse = $getConfig('MSE_to_MELINA', $pType);
            if ($cfgMse && $desSeq !== null) {
                $newMSE = $getCalDate($desSeq + (int)$cfgMse->OffsetDays);
            }

            // (3) SW_Assembly
            $cfgSw = $getConfig('SW_Assembly', $pType);
            if ($cfgSw) {
                if ($cfgSw->BaseRowType === 'CURRENT' && $mfgSeq !== null) {
                    $newSWAssembly = $getCalDate($mfgSeq + (int)$cfgSw->OffsetDays);
                } elseif ($cfgSw->BaseRowType === 'P1_ROW' && $p1Row) {
                    $newSWAssembly = $p1Row->SW_Assembly;
                }
            }

            // (4) Zero_Level_Check
            $cfgZero = $getConfig('Zero_Level_Check', $pType);
            if ($cfgZero && $desSeq !== null) {
                $newZeroLevel = $getCalDate($desSeq + (int)$cfgZero->OffsetDays);
            }

            // 6. คำนวณช่วงเวลา Networkdays (ช่อง TIME ต่างๆ)
            $confirmSeq = $getWorkSeq($newConfirmMelina);
            $mseSeq     = $getWorkSeq($newMSE);
            $swSeq      = $getWorkSeq($newSWAssembly);
            $zeroSeq    = $getWorkSeq($newZeroLevel);

            $timeDesToMfg   = ($desSeq && $mfgSeq) ? abs($mfgSeq - $desSeq) : null;
            $timeGoToDes    = ($goSeq && $desSeq) ? abs($desSeq - $goSeq) : null;
            $timeConfirmMel = ($goSeq && $confirmSeq) ? abs($confirmSeq - $goSeq) : null;
            $timeMse        = ($desSeq && $mseSeq) ? abs($mseSeq - $desSeq) : null;
            $timeSw         = ($mfgSeq && $swSeq) ? abs($mfgSeq - $swSeq) : null;
            $timeZeroLvl    = ($desSeq && $zeroSeq) ? abs($desSeq - $zeroSeq) : null;

            // 7. คำนวณ 3 ฟิลด์เสริม
            // (1) Design_working_day
            $cfgDwd = $getConfig('Design_working_day', $pType);
            $dwdOffset = $cfgDwd ? (int)$cfgDwd->OffsetDays : 0;
            
            $prevRow = $db->select('DES_BM')
                        ->where('PlanHeaderID', $planHeaderID)
                        ->where('DesType', $desType)
                        ->where('SeqNo <', $seqNo)
                        ->order_by('SeqNo', 'DESC')
                        ->limit(1)
                        ->get('Tb_Master_DESBM_Detail')
                        ->row();

            $prevDesSeq = $prevRow ? $getWorkSeq($prevRow->DES_BM) : null;
            $designWorkingDay = ($desSeq !== null && $prevDesSeq !== null) ? (abs($desSeq - $prevDesSeq) + $dwdOffset) : null;

            // (2) LeadTime
            $cfgLt = $getConfig('LeadTime', $pType);
            $ltOffset = $cfgLt ? (int)$cfgLt->OffsetDays : 0;
            $leadTime = null;
            if (!empty($mfgDate) && !empty($newGoDES)) {
                $diffDays = (strtotime($mfgDate) - strtotime($newGoDES)) / 86400;
                $leadTime = $ltOffset + (int)round($diffDays);
            }

            // (3) Time_DESBM_to_MFGBM_2
            $cfgDes2 = $getConfig('Time_DESBM_to_MFGBM_2', $pType);
            $des2Offset = $cfgDes2 ? (int)$cfgDes2->OffsetDays : 0;
            $timeDesToMfg2 = null;
            if (!empty($mfgDate) && !empty($newDesBM)) {
                $diffDays = (strtotime($mfgDate) - strtotime($newDesBM)) / 86400;
                $timeDesToMfg2 = (int)round($diffDays) + $des2Offset;
            }

            // 8. บันทึกข้อมูลแถวปัจจุบัน (ระบุชัดทั้ง PlanHeaderID และ DetailID)
            $updateData = [
                'DES_BM'                    => $newDesBM,
                'Time_DESBM_to_MFGBM'       => $timeDesToMfg,
                'Go_DES'                    => $newGoDES,
                'Time_GoDES_to_DESBM'       => $timeGoToDes,
                'Confirm_MELINA_Portion'    => $newConfirmMelina,
                'Time_Confirm_Melina'       => $timeConfirmMel,
                'MSE_to_MELINA'             => $newMSE,
                'Time_MSE_to_MELINA'        => $timeMse,
                'SW_Assembly'               => $newSWAssembly,
                'Time_SW_Assembly'          => $timeSw,
                'Zero_Level_Check_Temp_DWG' => $newZeroLevel,
                'Time_Zero_Level'           => $timeZeroLvl,
                'Design_working_day'        => $designWorkingDay,
                'LeadTime'                  => $leadTime,
                'Time_DESBM_to_MFGBM_2'     => $timeDesToMfg2,
                'UserAction'                => (string)$empno,
                'DateAction'                => date('Y-m-d H:i:s')
            ];

            $db->where('PlanHeaderID', $planHeaderID)
               ->where('DetailID', $seqNo)
               ->update('Tb_Master_DESBM_Detail', $updateData);

            // 9. อัปเดต Design_working_day ของแถวถัดไป (Next Row) ที่เป็น DesType เดียวกัน
            $updatedNextRow = null;
            if ($field === 'DES_BM') {
                $nextRow = $db->where('PlanHeaderID', $planHeaderID)
                            ->where('DesType', $desType)
                            ->where('SeqNo >', $seqNo)
                            ->order_by('SeqNo', 'ASC')
                            ->limit(1)
                            ->get('Tb_Master_DESBM_Detail')
                            ->row();

                if ($nextRow && !empty($nextRow->DES_BM) && $desSeq !== null) {
                    $nextDesSeq = $getWorkSeq($nextRow->DES_BM);
                    if ($nextDesSeq !== null) {
                        $nextDwd = abs($nextDesSeq - $desSeq) + $dwdOffset;

                        $db->where('PlanHeaderID', $planHeaderID)
                           ->where('DetailID', (int)$nextRow->DetailID)
                           ->update('Tb_Master_DESBM_Detail', [
                               'Design_working_day' => (int)$nextDwd,
                               'DateAction'         => date('Y-m-d H:i:s')
                           ]);

                        $updatedNextRow = $db->where('PlanHeaderID', $planHeaderID)
                                            ->where('DetailID', (int)$nextRow->DetailID)
                                            ->get('Tb_Master_DESBM_Detail')
                                            ->row();
                    }
                }
            }

            // 10. ดึงข้อมูลแถวปัจจุบันที่อัปเดตเรียบร้อยแล้ว
            $updatedCurrentRow = $db->where('PlanHeaderID', $planHeaderID)
                                    ->where('DetailID', $seqNo)
                                    ->get('Tb_Master_DESBM_Detail')
                                    ->row();

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => 'Updated successfully',
                'row'     => $updatedCurrentRow,
                'nextRow' => $updatedNextRow
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }
    // ==============================================================================
    // 3. Controller Method: อนุมัติ/ยืนยัน DRAFT เปลี่ยนสถานะเป็น Approved และรันเลข Rev savePlanMaster
    // ==============================================================================
    public function SavePlanMaster() {
        $this->output->set_content_type('application/json');

        try {
            $year     = $this->input->post('YEAR');
            $period   = $this->input->post('PERIOD');
            $desTypes = $this->input->post('DESTYPES');
            $revision = $this->input->post('REVISION');
            $empNo    = $this->input->post('EMPNO') ?? 'SYSTEM';
            $remark   = $this->input->post('REMARK') ?? '';
            $DOC_ID   = $this->input->post('DOC_ID') ?? '';
            $PLANHEADERID   = $this->input->post('PLANHEADERID') ?? '';

            if (empty($year) || empty($period)) {
                throw new Exception("ข้อมูลไม่ครบถ้วน (Year / Period)");
            }

            // เรียกใช้งานฟังก์ชันสร้าง Webflow Ticket
            $result = $this->createFormDesBM($year, $period, $empNo, $remark);

            return $this->output->set_output(json_encode([
                'status'   => true,
                'message'  => $result['message'],
                'revision' => $result['revision'],
                'docNo'    => $result['docNo']
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }
        

    // ==============================================================================
    // 2. ฟังก์ชันประสานงาน Webflow ใน Controller
    // ==============================================================================
    public function createFormDesBM($year, $period, $empNo = 'SYSTEM', $remark = '')
    {
        $db = $this->load->database($this->DDS, TRUE);

        // 1. ตรวจสอบหา Draft ล่าสุดในระบบ
        $draftHeader = $db->where('PlanYear', (string)$year)
                        ->where('PeriodCode', (string)$period)
                        ->where('UPPER(Status)', 'DRAFT')
                        ->order_by('PlanHeaderID', 'DESC')
                        ->get('Tb_Master_DESBM_Header')
                        ->row();

        if (!$draftHeader) {
            throw new Exception("ไม่พบข้อมูล Draft Plan ที่พร้อมส่งบันทึก");
        }

        $planHeaderID = (int)$draftHeader->PlanHeaderID;
        $currentRevision = $draftHeader->Revision;

        // 2. ดึง Form Master ของ Webflow (DED-MDS)
        $form = $this->getFormMasterByVaname('DED-MDS');
        if (empty($form) || !isset($form['status']) || $form['status'] !== 'true') {
            throw new Exception("ไม่สามารถดึงข้อมูลฟอร์ม Webflow (DED-MDS) ได้");
        }

        $formData = $form['data'];

        // 3. เตรียมข้อมูลและสร้าง Webflow Ticket
        $flowData = [
            'NFRMNO'  => $formData['NNO'],
            'VORGNO'  => $formData['VORGNO'],
            'CYEAR'   => $formData['CYEAR'],
            'REQBY'   => $empNo,
            'INPUTBY' => $empNo,
            'REMARK'  => !empty($remark) ? $remark : "Plan Master {$year} ({$period}) Rev.{$currentRevision}",
            // 'DRAFT'   => '1', // ส่งสร้างโฟลว์อนุมัติทันที
        ];

        $cyear2 = '';
        $nrunno = '';
        $rsf = $this->createForm($flowData);
        if (!$rsf || empty($rsf['status'])) {
            throw new Exception("สร้างเอกสาร Webflow ไม่สำเร็จ: " . ($rsf['message'] ?? ''));
        }
        else{
            $cyear2 = $rsf['data']['CYEAR2'];
            $nrunno = $rsf['data']['NRUNNO'];
            $flowID = [
                'NFRMNO'  => $formData['NNO'],
                'VORGNO'  => $formData['VORGNO'],
                'CYEAR'   => $formData['CYEAR'],
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'CEXTDATA' => '01',
            ];
            // เรียกฟังก์ชันอัปเดตผู้อนุมัติลงตาราง FLOW
            $this->MDSModel->updateWebflowApprover($flowID);
        }

        $docNo = (!empty($formData['VORGNO']) && !empty($cyear2) && !empty($nrunno))
                        ? "DED-MDS-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT)
                        : '';

        // 4. จัดเตรียมข้อมูลสำหรับ Update Header
        $headerUpdate = [
            'NFRMNO'         => $formData['NNO'],
            'VORGNO'         => $formData['VORGNO'],
            'CYEAR'          => $formData['CYEAR'],
            'CYEAR2'         => $cyear2,
            'NRUNNO'         => $nrunno,
            'Status'         => 'PROCESS',
            'Remark'         => $flowData['REMARK'],
            'UserAction'     => (string)$empNo,
            'ComputerAction' => (string)gethostbyaddr($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'),
            'DateAction'     => date('Y-m-d H:i:s')
        ];

        // 5. เรียก Model ให้ทำการ Update Database
        $this->MDSModel->SavePlanTicket($planHeaderID, $headerUpdate);

        // ส่งค่าผลลัพธ์กลับ
        return [
            'status'   => true,
            'revision' => $currentRevision,
            'docNo'    => $docNo,
            'message'  => "บันทึกและส่งเอกสารอนุมัติเรียบร้อยแล้ว (Doc No: {$docNo})"
        ];
    }

    // ==============================================================================
    // ลบ Plan สถานะ Draft ออกจากฐานข้อมูล (เรียกใช้ผ่าน Model)
    // ==============================================================================
    public function DeleteDraftPlan() {
        $this->output->set_content_type('application/json');

        try {
            $headerID = $this->input->post('PLAN_HEADER_ID');
            $year     = $this->input->post('YEAR');
            $period   = $this->input->post('PERIOD');

            if (empty($headerID) && (empty($year) || empty($period))) {
                throw new Exception("ข้อมูลไม่ครบถ้วน ไม่สามารถลบฉบับร่างได้");
            }

            // เรียกใช้งาน Model
            $isDeleted = $this->MDSModel->DeleteDraftDesBM($year, $period, $headerID);

            if (!$isDeleted) {
                throw new Exception("เกิดข้อผิดพลาดระหว่างการลบข้อมูล");
            }

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => 'ลบฉบับร่าง (Draft) เรียบร้อยแล้ว'
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }

    public function ActionFlow()
    {
        $this->output->set_content_type('application/json');

        try {
            $NFRMNO  = $this->input->post('NFRMNO');
            $VORGNO  = $this->input->post('VORGNO');
            $CYEAR   = $this->input->post('CYEAR');
            $CYEAR2  = $this->input->post('CYEAR2');
            $NRUNNO  = $this->input->post('NRUNNO');
            $EMPNO   = $this->input->post('EMPNO') ?? 'SYSTEM';
            $EXTDATA = trim((string)$this->input->post('EXTDATA'));
            $ACTION  = strtoupper(trim((string)$this->input->post('ACTION')));

            if (empty($NFRMNO) || empty($VORGNO) || empty($CYEAR2) || empty($NRUNNO)) {
                throw new Exception("ข้อมูลอ้างอิงเอกสารไม่ครบถ้วน");
            }

            $formID = [
                'NFRMNO' => $NFRMNO,
                'VORGNO' => $VORGNO,
                'CYEAR'  => $CYEAR,
                'CYEAR2' => $CYEAR2,
                'NRUNNO' => $NRUNNO,
            ];

            $data = [
                'UserAction'     => (string)$EMPNO,
                'ComputerAction' => (string)gethostbyaddr($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'),
                'DateAction'     => date('Y-m-d H:i:s')
            ];

            if ($ACTION === 'APPROVE') {
                if ($EXTDATA === '03') {
                    // 🟢 Step 03 กด APPROVE -> ถือว่าจบ Flow เป็น APPROVE สมบูรณ์
                    $data['Status'] = 'APPROVE';
                } else {
                    // 🟠 Step 00, 01, 02 กด APPROVE -> เอกสารยังอยู่ระหว่างเดิน Flow
                    $data['Status'] = 'PROCESS';
                }
            } elseif ($ACTION === 'RETURNP') {
                // โดน Return ตีกลับ -> ยังคงอยู่ในกระบวนการ PROCESS
                $data['Status'] = 'PROCESS';
            }elseif ($ACTION === 'RETURN') {
                // โดน Return ตีกลับ -> ยังคงอยู่ในกระบวนการ PROCESS
                $data['Status'] = 'PROCESS';
            }

            $this->MDSModel->UpdateHeader($formID, $data);

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => "อัปเดตสถานะเป็น {$data['Status']} เรียบร้อยแล้ว"
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }
    
    
    /**
     * ดึง Revision ถัดไปของ Plan ตาม Year และ Period (รวม Logic ตรวจสอบและขยับตัวอักษร)
     * @param string $year
     * @param string $period
     * @return string
     */
    private function getNextApprovedRevision($year, $period) {
        $sqlLastApproved = "SELECT TOP 1 Revision 
                            FROM Tb_Master_DESBM_Header 
                            WHERE PlanYear = ? AND PeriodCode = ? AND UPPER(Status) = 'APPROVE'
                            ORDER BY PlanHeaderID DESC";

        $query = $this->MDSModel->QuerySetBase($sqlLastApproved, $this->DDS, [$year, $period]);
        $lastApproved = $query ? $query->row() : null;

        // 1. ถ้าไม่เคยมี Approved มาก่อน หรือไม่มี Revision ให้เริ่มที่ '*'
        if (!$lastApproved || empty($lastApproved->Revision)) {
            return '*';
        }

        $currentRev = trim($lastApproved->Revision);

        // 2. ถ้าฉบับล่าสุดเป็น '*' ให้ Revision ถัดไปเป็น 'A'
        if ($currentRev === '*') {
            return 'A';
        }

        // 3. ตัดช่องว่าง, 'Rev', หรือ '*' ออกให้เหลือเฉพาะตัวอักษร
        $char = strtoupper(trim(str_ireplace(['Rev', ' ', '*'], '', $currentRev)));

        if (empty($char) || !ctype_alpha($char)) {
            return 'A';
        }

        // 4. ขยับตัวอักษรถัดไป: 'A' -> 'B', 'B' -> 'C', ..., 'Z' -> 'AA'
        return ++$char;
    }


    //=======================================================
    //== Modal: Tb_MS_Master_DESBM_Cal Config
    //=======================================================
    // 🟢 1. Ajax ดึง Master Cal Config ทั้งหมด
    public function GetCalConfigMaster() {
        $this->output->set_content_type('application/json');
        $db = $this->load->database($this->DDS, TRUE);
        $empno = $this->input->get_post('EMPNO') ;

        //== ตรวจสอบสิทธิ์ Admin/PIC
        $ms = false;
        $sqlPic = "SELECT TOP 1 USERID
                   FROM Tb_MS_Master_DESBM_PIC WITH (NOLOCK)
                   WHERE USERID = ? AND (STATUS = 'DED-MDS_PIC' OR STATUS = 'DED-MDS_ADMIN')";
        
        // 🟢 ใช้ $db แทน $this->db
        $qPic = $db->query($sqlPic, [$empno]);
        if ($qPic && $qPic->num_rows() > 0) {
            $ms = true;
        }

        $sql = "SELECT TargetField, P_Type, BaseField, BaseRowType, OffsetDays 
                FROM Tb_MS_Master_DESBM_Cal
                WHERE IsActive = 1
                ORDER BY TargetField ASC, P_Type ASC";
        $result = $db->query($sql)->result();

        return $this->output->set_output(json_encode([
            'status' => true,
            'data'   => $result,
            'ms'    =>$ms,
        ]));
    }

    // 🟢 2. Ajax บันทึกการแก้ไข OffsetDays
    public function UpdateCalConfigOffset() {
        $this->output->set_content_type('application/json');

        try {
            $targetField = trim((string)$this->input->post('TargetField'));
            $pType       = trim((string)$this->input->post('P_Type'));
            $offsetDays  = $this->input->post('OffsetDays');
            $empno       = $this->input->post('EMPNO') ?? 'SYSTEM';

            if ($targetField === '' || $pType === '' || !is_numeric($offsetDays)) {
                throw new Exception("ข้อมูลไม่ถูกต้องหรือระบุไม่ครบถ้วน");
            }

            $db = $this->load->database($this->DDS, TRUE);

            $updateData = [
                'OffsetDays' => (int)$offsetDays,
                'UserAction' => (string)$empno,
                'DateAction' => date('Y-m-d H:i:s')
            ];

            $db->where('TargetField', $targetField)
               ->where('P_Type', $pType)
               ->update('Tb_MS_Master_DESBM_Cal', $updateData);

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => 'บันทึก Offset Days เรียบร้อยแล้ว'
            ]));

        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }
    //=======================================================

    // use PhpOffice\PhpSpreadsheet\IOFactory;
    // use PhpOffice\PhpSpreadsheet\Style\Color;

    public function GetExcelTemplate() {
        $tplParam = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$this->input->get('template'));
        $baseName = !empty($tplParam) ? $tplParam : '04X-09C';

        // ค้นหาทั้งแบบมีขีด (-) และไม่มีขีด เผื่อกรณีชื่อไฟล์ในเครื่อง
        $possibleFiles = [
            $baseName . '.xlsx',
            str_replace('-', '', $baseName) . '.xlsx',
            str_replace('X', 'X-', $baseName) . '.xlsx'
        ];

        $filePath = null;
        foreach ($possibleFiles as $fileName) {
            $checkPath = __DIR__ . DIRECTORY_SEPARATOR . $fileName;
            if (file_exists($checkPath)) {
                $filePath = $checkPath;
                break;
            }
        }

        if (!$filePath) {
            return $this->output
                ->set_status_header(404)
                ->set_output("Template not found: " . $baseName . ".xlsx");
        }

        $fileContent = file_get_contents($filePath);
        return $this->output
            ->set_content_type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ->set_output($fileContent);
    }


    
    public function SavePlanMaster0() {
        try {
            $year     = $this->input->post('YEAR');
            $period   = $this->input->post('PERIOD');
            $empno    = $this->input->post('EMPNO');
            $headerID = $this->input->post('PLAN_HEADER_ID');
            $Remark = $this->input->post('REMARK')??'';
            

            // 1. หาเลข Revision ถัดไปจาก Header ที่เคย Approved แล้ว
            
            $nextRevision = $this->getNextApprovedRevision($year, $period);

            // 2. อัปเดตสถานะ Header จาก DRAFT เป็น Approved พร้อมกำหนดเลข Rev จริง
            $db = $this->load->database($this->DDS, TRUE);
            $db->where('PlanHeaderID', $headerID)->update('Tb_Master_DESBM_Header', [
                'Revision'       => $nextRevision,
                'Status'         => 'Approved',
                'UserAction'     => $empno,
                'ComputerAction' => gethostbyaddr($_SERVER['REMOTE_ADDR']),
                'DateAction'     => date('Y-m-d H:i:s')
            ]);

            // 3. อัปเดต Rev ในตาราง Detail
            $db->where('PlanHeaderID', $headerID)->update('Tb_Master_DESBM_Detail', [
                'Rev' => $nextRevision
            ]);

            // 4. Merge Sync เข้าตาราง Master หลัก (Tb_Master_DESBM)
            $sqlSync = "
                MERGE INTO Tb_Master_DESBM AS Target
                USING (
                    SELECT TypeJun, DES_BM, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES
                    FROM Tb_Master_DESBM_Detail
                    WHERE PlanHeaderID = ?
                ) AS Source
                ON Target.TypeJun = Source.TypeJun
                WHEN MATCHED THEN
                    UPDATE SET 
                        Target.DesBMDate = Source.DES_BM,
                        Target.UserAction = ?,
                        Target.DateAction = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (TypeJun, DesBMDate, UserAction, ComputerAction, DateAction, BeforeEditDesBMDate, UpdateMKT, ChangeJunTodate, DesType, FormatAs400, MARIssueDES)
                    VALUES (Source.TypeJun, Source.DES_BM, ?, ?, GETDATE(), Source.BeforeEditDesBMDate, 0, Source.ChangeJunTodate, Source.DesType, Source.FormatAs400, Source.MARIssueDES);
            ";
            $this->MDSModel->QuerySetBase($sqlSync, $this->DDS, [$headerID, $empno, $empno, gethostbyaddr($_SERVER['REMOTE_ADDR'])]);

            return $this->output->set_content_type('application/json')->set_output(json_encode([
                'status'   => true, 
                'revision' => $nextRev,
                'message'  => "ยืนยันและบันทึก Master Plan ($nextRev) สำเร็จ"
            ]));
        } catch (\Exception $e) {
            return $this->output->set_content_type('application/json')->set_output(json_encode([
                'status'  => false, 
                'message' => $e->getMessage()
            ]));
        }
    }

}