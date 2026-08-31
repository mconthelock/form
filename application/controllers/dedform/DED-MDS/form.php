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
        $this->load->library('pdf');
        $this->load->model('form_model', 'frm');
        $this->load->model('dedform/DED-MDS/DED_MDS_model', 'MDSModel');
        $this->host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'amecweb';
        
        $this->DDS = 'DDS';
    }

    // === http://localhost:8080/form/dedform/DED-MDS/form/main
    // === http://localhost:8080/form/dedform/DED-MDS/form/main/?no=29&orgNo=070101&y=26&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // === http://localhost:8080/form/dedform/DED-MDS/form/main?no=29&orgNo=070101&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
    public function main() {
        $empno = $this->input->get('empno') ?? '';

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

        $data['CYEAR2']    = $this->input->get('y2') ?? '';
        $data['NRUNNO']    = $this->input->get('runNo') ?? '';
        $data['EMPNO']     = (string)$empno;
        $data['PLAN_YEAR'] = date('Y');
        $data['PERIOD']    = '04X-09C';
        $data['PLAN_YEAR'] = '';
        $data['PERIOD']    = '';
        $data['REVISION']  = '*';
        $data['DOC_NO']    = '';
        $data['REMARK']    = '';

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
                $data['REQBY']   = $empno;
                $data['INPUTBY'] = $empno;
                $data['CST']     = '0';
            }

            $data['DOC_NO'] = "DED-MDS-" . $data['CYEAR2'] . "-" . str_pad($data['NRUNNO'], 6, '0', STR_PAD_LEFT);
            
            // ดึงข้อมูล Header เพิ่มเติมจากตารางจริงถ้ามี
            $sqlHeader = "SELECT TOP 1 PlanYear, PeriodCode, Revision, Remark 
                        FROM Tb_Master_DESBM_Header 
                        WHERE CYEAR2 = ? and NRUNNO = ?";
            $headerInfo = $this->MDSModel->QuerySetBase($sqlHeader, $this->DDS, [$data['CYEAR2'],(int)$data['NRUNNO']])->row();
            if ($headerInfo) {
                $data['PLAN_YEAR'] = $headerInfo->PlanYear;
                $data['PERIOD']    = $headerInfo->PeriodCode;
                $data['REVISION']  = $headerInfo->Revision?? '*';
                $data['REMARK']    = $headerInfo->Remark ?? '';
            }

        } else {
            // --- CASE: เตรียมสร้างฟอร์มใหม่ (Create Mode) ---
            $data['REQBY']   = $empno;
            $data['INPUTBY'] = $empno;
            $data['CST']     = '0';
            $data['MODE']    = '1'; // กำหนดให้เป็น Mode 1 (Create) ชัดเจน
        }

        // ดึง Master DesType ที่เปิดใช้งาน (IsActive = 1)
        $sqlDesType = "SELECT DesType, DesTypeName, P_Type, Seq 
                       FROM Tb_MS_Master_DESBM_DesType 
                       WHERE IsActive = 1 
                       ORDER BY Seq ASC";
                       
        $data['desTypeList'] = $this->MDSModel->QuerySetBase($sqlDesType, $this->DDS, [])->result();
        $this->views('dedform/DED-MDS/form', $data);
    }

    // Ajax ดึง Master DesType
    public function GetDesTypeMaster() {
        $sql = "SELECT DesType, DesTypeName, P_Type, IsActive FROM Tb_MS_Master_DESBM_DesType WHERE IsActive = 1 ORDER BY Seq ASC";
        $result = $this->MDSModel->QuerySetBase($sql, $this->DDS)->result();
        return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true, 'data' => $result]));
    }


    // ==============================================================================
    // 1. Controller Method: ดึง DRAFT เดิม 
    // ==============================================================================
    public function GetOrInitDraftPlan() {
        try {
            $year     = $this->input->post('YEAR') ?? date('Y');
            $period   = $this->input->post('PERIOD') ?? '04X-09C';
            $empno    = $this->input->post('EMPNO') ?? 'SYSTEM';
            $REVISION    = $this->input->post('REVISION');

            // 1. ตรวจสอบว่ามี Header สถานะ DRAFT ค้างอยู่หรือไม่
            $sqlCheckDraft = "SELECT TOP 1 PlanHeaderID, PlanYear, PeriodCode, Revision, Status, Remark 
                            FROM Tb_Master_DESBM_Header 
                            WHERE PlanYear = ? AND PeriodCode = ? AND UPPER(Status) = 'DRAFT'
                            ORDER BY PlanHeaderID DESC";
            $draftHeader = $this->MDSModel->QuerySetBase($sqlCheckDraft, $this->DDS, [$year, $period])->row();

            if ($draftHeader) {
                // --- CASE A: มี Draft เดิมค้างอยู่ -> ดึง Detail เดิมขึ้นมาแสดง ---
                $sqlDetail = "SELECT * FROM Tb_Master_DESBM_Detail 
                            WHERE PlanHeaderID = ? 
                            ORDER BY SeqNo ASC";
                $dataDetail = $this->MDSModel->QuerySetBase($sqlDetail, $this->DDS, [$draftHeader->PlanHeaderID])->result();

                return $this->output->set_content_type('application/json')->set_output(json_encode([
                    'status'       => true,
                    'hasDraft'     => true,
                    'revision'     => $draftHeader->Revision,
                    'planHeaderID' => $draftHeader->PlanHeaderID,
                    'data'         => $dataDetail
                ]));
            } else {
                // --- CASE B: ไม่พบ Draft -> หา Revision ถัดไปรอไว้ และส่งตารางว่างกลับไป ---
                $sqlLastApproved = "SELECT TOP 1 Revision 
                                    FROM Tb_Master_DESBM_Header 
                                    WHERE PlanYear = ? AND PeriodCode = ? AND UPPER(Status) = 'APPROVED'
                                    ORDER BY PlanHeaderID DESC";
                $lastApproved = $this->MDSModel->QuerySetBase($sqlLastApproved, $this->DDS, [$year, $period])->row();

                $nextRevision = "*";
                if ($lastApproved && !empty($lastApproved->Revision)) {
                    $nextRevision = $this->getNextAlphaRevision($lastApproved->Revision);
                }

                return $this->output->set_content_type('application/json')->set_output(json_encode([
                    'status'       => true,
                    'hasDraft'     => false,
                    'revision'     => $nextRevision,
                    'planHeaderID' => null,
                    'data'         => [] // ส่งตารางว่าง
                ]));
            }

        } catch (\Exception $e) {
            return $this->output->set_content_type('application/json')->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }

    // ==============================================================================
    // 2. Controller Method: คำนวณใหม่ทับ DRAFT เดิม (เมื่อกด Process Calculation)
    // ==============================================================================
    public function ProcessPlan() {
        try {
            $year        = $this->input->post('YEAR');
            $period      = $this->input->post('PERIOD');
            $desTypes    = $this->input->post('DESTYPES');
            $REVISION    = $this->input->post('REVISION');
            $empno       = $this->input->post('EMPNO') ?? 'SYSTEM';
            
            $userSession = $empno;

            $db = $this->load->database($this->DDS, TRUE);

            // 1. ถ้ามี DRAFT เก่าค้างอยู่ ให้ลบทั้ง Detail และ Header ทิ้งทันที
            $sqlCheckDraft = "SELECT PlanHeaderID FROM Tb_Master_DESBM_Header 
                            WHERE PlanYear = ? AND PeriodCode = ? AND UPPER(Status) = 'DRAFT'";
            $oldDrafts = $this->MDSModel->QuerySetBase($sqlCheckDraft, $this->DDS, [$year, $period])->result();

            if (!empty($oldDrafts)) {
                foreach ($oldDrafts as $draft) {
                    $db->where('PlanHeaderID', $draft->PlanHeaderID)->delete('Tb_Master_DESBM_Detail');
                    $db->where('PlanHeaderID', $draft->PlanHeaderID)->delete('Tb_Master_DESBM_Header');
                }
            }

            // 2. คำนวณ Revision ใหม่ตาม Max Approved Plan
            $sqlLastApproved = "SELECT TOP 1 Revision 
                                FROM Tb_Master_DESBM_Header 
                                WHERE PlanYear = ? AND PeriodCode = ? AND UPPER(Status) = 'APPROVED'
                                ORDER BY PlanHeaderID DESC";
            $lastApproved = $this->MDSModel->QuerySetBase($sqlLastApproved, $this->DDS, [$year, $period])->row();

            if (!$lastApproved || empty($lastApproved->Revision)) {
                $nextRevision = "*"; // ครั้งแรกสุดที่ยังไม่เคย Approve
            } else {
                $nextRevision = $this->getNextAlphaRevision($lastApproved->Revision);
            }

            // 3. ประมวลผลสูตรคำนวณวันทำงานลง Temp Table
            $this->MDSModel->processPlanMaster($year, $period, $desTypes, $userSession);

            // 4. บันทึก Header ใหม่เป็น DRAFT
            $headerData = [
                'PlanYear'       => $year,
                'PeriodCode'     => $period,
                'Revision'       => $nextRevision,
                'Status'         => 'DRAFT',
                'Remark'         => 'Process calculated draft plan',
                'UserAction'     => $empno,
                'ComputerAction' => gethostbyaddr($_SERVER['REMOTE_ADDR']),
                'DateAction'     => date('Y-m-d H:i:s')
            ];
            $db->insert('Tb_Master_DESBM_Header', $headerData);
            $newPlanHeaderID = $db->insert_id();

            // 5. โอนย้ายข้อมูลจากตาราง Temp เข้าสู่ Tb_Master_DESBM_Detail จริง
            $sqlTransfer = "
                INSERT INTO Tb_Master_DESBM_Detail (
                    PlanHeaderID, SeqNo, Rev, PROD, MFG_BM, P_Type,
                    DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                    Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                    SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                    TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES,
                    UserAction, ComputerAction, DateAction
                )
                SELECT 
                    ?, SeqNo, ?, PROD, MFG_BM, P_Type,
                    DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                    Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                    SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                    TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES,
                    ?, ?, GETDATE()
                FROM Tb_Master_DESBM_Detail_temp
                WHERE UserSessionID = ?;
            ";
            $this->MDSModel->QuerySetBase($sqlTransfer, $this->DDS, [
                $newPlanHeaderID, 
                $nextRevision,
                $empno, 
                gethostbyaddr($_SERVER['REMOTE_ADDR']), 
                $userSession
            ]);

            // 6. ดึงข้อมูล Detail ออกมาแสดงบนหน้าเว็บ
            $sqlDetail = "SELECT * FROM Tb_Master_DESBM_Detail WHERE PlanHeaderID = ? ORDER BY SeqNo ASC";
            $data = $this->MDSModel->QuerySetBase($sqlDetail, $this->DDS, [$newPlanHeaderID])->result();

            return $this->output->set_content_type('application/json')->set_output(json_encode([
                'status'       => true,
                'revision'     => $nextRevision,
                'planHeaderID' => $newPlanHeaderID,
                'data'         => $data
            ]));
        } catch (\Exception $e) {
            return $this->output->set_content_type('application/json')->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ]));
        }
    }

    // ==============================================================================
    // 3. Controller Method: อนุมัติ/ยืนยัน DRAFT เปลี่ยนสถานะเป็น Approved และรันเลข Rev
    // ==============================================================================
    public function SavePlanMaster() {
        try {
            $year     = $this->input->post('YEAR');
            $period   = $this->input->post('PERIOD');
            $empno    = $this->input->post('EMPNO');
            $headerID = $this->input->post('PLAN_HEADER_ID');

            // 1. หาเลข Revision ถัดไปจาก Header ที่เคย Approved แล้ว
            $sqlLastApproved = "SELECT TOP 1 Revision FROM Tb_Master_DESBM_Header 
                                WHERE PlanYear = ? AND PeriodCode = ? AND Status = 'Approved' 
                                ORDER BY PlanHeaderID DESC";
            $lastAppr = $this->MDSModel->QuerySetBase($sqlLastApproved, $this->DDS, [$year, $period])->row();

            $nextRev = "Rev 0";
            if ($lastAppr && !empty($lastAppr->Revision)) {
                $num = (int)str_ireplace("Rev ", "", $lastAppr->Revision);
                $nextRev = "Rev " . ($num + 1);
            }

            // 2. อัปเดตสถานะ Header จาก DRAFT เป็น Approved พร้อมกำหนดเลข Rev จริง
            $db = $this->load->database($this->DDS, TRUE);
            $db->where('PlanHeaderID', $headerID)->update('Tb_Master_DESBM_Header', [
                'Revision'       => $nextRev,
                'Status'         => 'Approved',
                'UserAction'     => $empno,
                'ComputerAction' => gethostbyaddr($_SERVER['REMOTE_ADDR']),
                'DateAction'     => date('Y-m-d H:i:s')
            ]);

            // 3. อัปเดต Rev ในตาราง Detail
            $db->where('PlanHeaderID', $headerID)->update('Tb_Master_DESBM_Detail', [
                'Rev' => $nextRev
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

    private function getNextAlphaRevision($currentRev = null) {
        if (empty($currentRev) || $currentRev === '*') {
            return 'A';
        }
        
        // ตัดคำว่า 'Rev' หรือช่องว่างออก เหลือเฉพาะตัวอักษร
        $char = strtoupper(trim(str_ireplace(['Rev', ' ', '*'], '', $currentRev)));
        
        if (empty($char) || !ctype_alpha($char)) {
            return 'A';
        }
        
        // ขยับตัวอักษรถัดไป เช่น 'A' -> 'B', 'B' -> 'C', 'Z' -> 'AA'
        return ++$char;
    }
}