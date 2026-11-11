<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';

class Fe_asp_model extends my_model 
{
    public $smmtBase;
    public $webflowBase;
    public $CodeForm = 'AMEC-AR';

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->smmtBase    = 'SMMT';    
        $this->webflowBase = 'DEFAULT'; 
    }

    public function QuerySetBase($q, $base = "", $bindData = array())
    {
        if (empty($base)) $base = $this->smmtBase;
        if (!is_array($bindData)) $bindData = array($bindData);
        $conf = $this->load->database($base, TRUE); 
        return $conf->query($q, $bindData);
    }

    public function deleteData($base = "", $tb = '', $w = array())
    {
        if (empty($base)) $base = $this->smmtBase;
        $db = $this->load->database($base, TRUE);
        if (!empty($w) && !empty($tb)) {
            $db->where($w);
            return $db->delete($tb);
        }
        return false;
    }


    
    public function isFormAdmin($formCode, $empno) {
        $sql = "SELECT COUNT(*) AS CNT FROM FE_FORM_ADMIN 
                WHERE EMPNO = ? AND IS_ACTIVE = 1 
                  AND (FORM_CODE = ? OR FORM_CODE = 'ALL')";
        $row = $this->QuerySetBase($sql, $this->smmtBase, [trim((string)$empno), (string)$formCode])->row_array();
        return ((int)($row['CNT'] ?? 0)) > 0;
    }

    
    // =================================================================
    // == form.php
    // =================================================================

        public function getNextHeaderId() {
            $q = $this->QuerySetBase("SELECT NVL(MAX(HEADER_ID), 0) + 1 AS NEXT_ID FROM FE_ASP_HEADER", $this->smmtBase);
            return (int)$q->row_array()['NEXT_ID'];
        }

        public function getNextDetailId() {
            $q = $this->QuerySetBase("SELECT NVL(MAX(DTL_ID), 0) + 1 AS NEXT_ID FROM FE_ASP_CONFIRMATION_DTL", $this->smmtBase);
            return (int)$q->row_array()['NEXT_ID'];
        }

        public function insertHeader($data) {
            $data['HEADER_ID'] = $this->getNextHeaderId();
            $db = $this->load->database($this->smmtBase, TRUE);
            $db->set('DOC_DATE', 'SYSDATE', FALSE);
            $db->set('DATE_ACTION', 'SYSDATE', FALSE);
            $db->set('CREATE_DATE', 'SYSDATE', FALSE);
            $db->set('UPDATE_DATE', 'SYSDATE', FALSE);
            $db->insert('FE_ASP_HEADER', $data);
            return $data['HEADER_ID'];
        }

        public function updateHeader($headerId, $data) {
            $db = $this->load->database($this->smmtBase, TRUE);
            $db->set('UPDATE_DATE', 'SYSDATE', FALSE);
            $db->where('HEADER_ID', $headerId);
            return $db->update('FE_ASP_HEADER', $data);
        }

        public function getHeaderByKeys($formKeys) {
            $sql = "SELECT * FROM FE_ASP_HEADER 
                    WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR2 = ? AND NRUNNO = ?";
            return $this->QuerySetBase($sql, $this->smmtBase, [
                (int)$formKeys['NFRMNO'],
                (string)$formKeys['VORGNO'],
                (string)$formKeys['CYEAR2'],
                (int)$formKeys['NRUNNO']
            ])->row();
        }

        public function insertConfirmationDetail($data) {
            $data['DTL_ID'] = $this->getNextDetailId();
            $db = $this->load->database($this->smmtBase, TRUE);
            $db->set('CREATE_DATE', 'SYSDATE', FALSE);
            return $db->insert('FE_ASP_CONFIRMATION_DTL', $data);
        }

        public function deleteConfirmationDetails($headerId) {
            $db = $this->load->database($this->smmtBase, TRUE);
            $db->where('HEADER_ID', $headerId);
            return $db->delete('FE_ASP_CONFIRMATION_DTL');
        }

        public function getConfirmationDetailsByHeaderId($headerId) {
            $sql = "SELECT * FROM FE_ASP_CONFIRMATION_DTL WHERE HEADER_ID = ? ORDER BY TOPIC_ID ASC";
            return $this->QuerySetBase($sql, $this->smmtBase, [$headerId])->result_array();
        }

        public function getAllActiveControls($empNo = '', $divCode = '', $depCode = '') {
            $empNo   = trim((string)$empNo);
            $divCode = trim((string)$divCode);
            $depCode = trim((string)$depCode);

            $sql = "SELECT DISTINCT 
                        M.CONTROL_NO, 
                        M.CONTROL_NAME, 
                        M.SDIVCODE, 
                        M.SDEPCODE, 
                        M.SSECCODE, 
                        M.RESP_EMPNO,
                        U.SDIV AS DIVISION_NAME
                    FROM SMARTMAT.FE_ASP_CONTROL_MST M
                    LEFT JOIN (SELECT DISTINCT SDIVCODE, SDIV FROM AMEC.AMECUSERALL WHERE SDIVCODE IS NOT NULL) U
                        ON M.SDIVCODE = U.SDIVCODE
                    WHERE M.ACTIVE_FLAG = 'Y'";

            if ($empNo === '13204') {
                $sql .= " ORDER BY M.CONTROL_NO ASC";
                return $this->QuerySetBase($sql, $this->smmtBase)->result_array();
            }

            $binds = [];
            if (!empty($depCode) && $depCode !== '00') {
                $sql .= " AND SUBSTR(M.SDEPCODE, 1, 4) = ?";
                $binds[] = substr($depCode, 0, 4);
            } elseif (!empty($divCode) && $divCode !== '00') {
                $sql .= " AND SUBSTR(M.SDIVCODE, 1, 2) = ?";
                $binds[] = substr($divCode, 0, 2);
            }

            $sql .= " ORDER BY M.CONTROL_NO ASC";
            return $this->QuerySetBase($sql, $this->smmtBase, $binds)->result_array();
        }

        public function pickDefaultControl($controls, $userSecCode = '') {
            if (empty($controls)) return null;

            $userSecCode = trim((string)$userSecCode);

            if (!empty($userSecCode) && $userSecCode !== '00') {
                foreach ($controls as $c) {
                    if (!empty($c['SSECCODE']) && trim($c['SSECCODE']) === $userSecCode) {
                        return $c;
                    }
                }
            }

            return $controls[0];
        }

        public function getControlMasterInfo($controlNo) {
            $sql = "SELECT M.CONTROL_NO, M.CONTROL_NAME, M.SDIVCODE, M.SDEPCODE, M.SSECCODE, M.RESP_EMPNO, U.SDIV AS DIVISION_NAME
                    FROM SMARTMAT.FE_ASP_CONTROL_MST M
                    LEFT JOIN (SELECT DISTINCT SDIVCODE, SDIV FROM AMEC.AMECUSERALL WHERE SDIVCODE IS NOT NULL) U
                        ON M.SDIVCODE = U.SDIVCODE
                    WHERE M.CONTROL_NO = ? AND M.ACTIVE_FLAG = 'Y'";
            return $this->QuerySetBase($sql, $this->smmtBase, [$controlNo])->row_array();
        }

        public function getActiveTopics() {
            $sql = "SELECT * FROM SMARTMAT.FE_ASP_TOPIC_MST WHERE ACTIVE_FLAG = 'Y' ORDER BY TOPIC_GROUP ASC, TOPIC_SEQ ASC";
            return $this->QuerySetBase($sql, $this->smmtBase)->result_array();
        }

        public function getUserOrgSnapshot($empNo) {
            $empNo = trim((string)$empNo);
            if (empty($empNo)) return null;

            $sql = "SELECT SEMPNO, SNAME, SDIVCODE, SDIV, SDEPCODE, SDEPT, SSECCODE, SSEC
                    FROM AMEC.AMECUSERALL
                    WHERE SEMPNO = ?";
            return $this->QuerySetBase($sql, $this->webflowBase, [$empNo])->row_array();
        }

        public function getDepartmentsByRole($divCode, $depCode, $empNo = '') {
            $divCode = trim((string)$divCode);
            $depCode = trim((string)$depCode);
            $empNo   = trim((string)$empNo);

            if ($empNo === '13204') {
                if (!empty($divCode) && $divCode !== '00') {
                    $prefixDiv = substr($divCode, 0, 2);
                    $sql = "SELECT SDEPCODE, SDEPT AS DEPT_NAME, SDEPARTMENT, SDEPT 
                            FROM AMEC.PDEPARTMENT 
                            WHERE SDEPARTMENT NOT LIKE '(Cancel)%'
                            AND (SUBSTR(SDEPCODE, 1, 2) = ? OR SDEPCODE = '00')
                            ORDER BY CASE WHEN SDEPCODE = '00' THEN 0 ELSE 1 END, SDEPCODE ASC";
                    return $this->QuerySetBase($sql, $this->webflowBase, [$prefixDiv])->result_array();
                }

                $sql = "SELECT SDEPCODE, SDEPT AS DEPT_NAME, SDEPARTMENT, SDEPT 
                        FROM AMEC.PDEPARTMENT 
                        WHERE SDEPARTMENT NOT LIKE '(Cancel)%'
                        ORDER BY CASE WHEN SDEPCODE = '00' THEN 0 ELSE 1 END, SDEPCODE ASC";
                return $this->QuerySetBase($sql, $this->webflowBase)->result_array();
            }

            if (!empty($depCode) && $depCode !== '00') {
                $prefixDept = substr($depCode, 0, 4);
                $sql = "SELECT SDEPCODE, SDEPT AS DEPT_NAME, SDEPARTMENT, SDEPT 
                        FROM AMEC.PDEPARTMENT 
                        WHERE SDEPARTMENT NOT LIKE '(Cancel)%'
                        AND SUBSTR(SDEPCODE, 1, 4) = ?
                        ORDER BY SDEPCODE ASC";
                return $this->QuerySetBase($sql, $this->webflowBase, [$prefixDept])->result_array();
            }

            return [];
        }

        public function getSectionsByDept($depCode) {
            $depCode = trim((string)$depCode);

            $defaultSec = [
                'SSECCODE' => '00',
                'SEC_NAME' => '00 : No Section / ทั้งแผนก',
                'SSECTION' => 'No Section / ทั้งแผนก',
                'SSEC'     => 'No Section'
            ];

            if (empty($depCode) || $depCode === '00') {
                return [$defaultSec];
            }

            $prefix = substr($depCode, 0, 4);
            $sql = "SELECT SSECCODE, SSEC AS SEC_NAME, SSECTION, SSEC 
                    FROM AMEC.PSECTION 
                    WHERE SSECTION NOT LIKE '(Cancel)%'
                    AND SUBSTR(SSECCODE, 1, 4) = ?
                    AND SSECCODE <> '00'
                    ORDER BY SSECCODE ASC";

            $dbSections = $this->QuerySetBase($sql, $this->webflowBase, [$prefix])->result_array();

            return array_merge([$defaultSec], $dbSections ?: []);
        }



        public function getLatestApprovedFile($controlNo, $currentYear2 = '', $currentRunNo = '') {
            $controlNo    = trim((string)$controlNo);
            $currentYear2 = trim((string)$currentYear2);
            $currentRunNo = trim((string)$currentRunNo);

            if (empty($controlNo)) return null;

            $binds = [$controlNo];
            // 1. ดึงเอกสารล่าสุดที่ APPROVED (ทั้ง CHANGE และ NO CHANGE เพื่อให้ได้ไฟล์ที่ ACTIVE จริงล่าสุด)
            $whereSql = "WHERE CONTROL_NO = ? AND STATUS = 'APPROVE' and REVIEW_DETAILS = 'CHANGE' ";

            if (!empty($currentYear2) && !empty($currentRunNo)) {
                $whereSql .= " AND (
                    TO_NUMBER(CYEAR2) < ? 
                    OR (TO_NUMBER(CYEAR2) = ? AND TO_NUMBER(NRUNNO) < ?)
                )";
                $binds[] = (int)$currentYear2;
                $binds[] = (int)$currentYear2;
                $binds[] = (int)$currentRunNo;
            }

            $sqlHeader = "SELECT DOC_NO, CONTROL_NO, NVL(DOC_REVISION, '*') AS DOC_REVISION, NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO 
                        FROM (
                            SELECT DOC_NO, CONTROL_NO, DOC_REVISION, NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO 
                            FROM SMARTMAT.FE_ASP_HEADER 
                            {$whereSql}
                            ORDER BY TO_NUMBER(CYEAR2) DESC, TO_NUMBER(NRUNNO) DESC
                        )
                        WHERE ROWNUM = 1";
            
            $header = $this->QuerySetBase($sqlHeader, $this->smmtBase, $binds)->row_array();

            // 2. ถ้าไม่พบประวัติ Approved เลย (เป็นเอกสารสร้างใหม่ครั้งแรกสุดของระบบ)
            if (empty($header)) {
                return null;
            }

            // 3. ดึงไฟล์แนบของเอกสาร Approved ฉบับล่าสุดนั้น
            $sqlFile = "SELECT FILE_ID, FILE_ONAME, FILE_FNAME, FILE_PATH
                        FROM FE_FILE 
                        WHERE NFRMNO = ? 
                        AND VORGNO = ? 
                        AND CYEAR2 = ? 
                        AND NRUNNO = ?
                        ORDER BY FILE_ID ASC";

            $files = $this->QuerySetBase($sqlFile, $this->webflowBase, [
                (int)$header['NFRMNO'],
                (string)$header['VORGNO'],
                (string)$header['CYEAR2'],
                (int)$header['NRUNNO']
            ])->result_array();

            return [
                'header' => $header,
                'files'  => $files ?: []
            ];
        }

        public function getEmpName($EmpNo) {
            $empNo = trim((string)$EmpNo);
            if (empty($empNo)) return ['empno' => '', 'name' => ''];

            $sql = "SELECT SEMPNO, SNAME FROM AMEC.AMECUSERALL WHERE SEMPNO = ?";
            $user = $this->QuerySetBase($sql, $this->webflowBase, [$empNo])->row();

            return [
                'empno' => $empNo,
                'name'  => ($user && !empty($user->SNAME)) ? trim($user->SNAME) : ''
            ];
        }

        public function getApprovalLogList($formKeys) {
            $sql = "SELECT 
                        F.CSTEPNO,
                        F.CSTEPNEXTNO,
                        F.CEXTDATA,
                        F.CSTART,
                        F.CSTEPST,
                        F.VAPVNO,
                        F.VREPNO,
                        F.VREALAPV,
                        F.CAPVSTNO,
                        TO_CHAR(F.DAPVDATE, 'DD/MM/YYYY') AS DAPVDATE_STR,
                        F.CAPVTIME,
                        U.SNAME,
                        U.SPOSNAME
                    FROM FLOW F
                    LEFT JOIN AMEC.AMECUSERALL U ON TRIM(F.VREALAPV) = TRIM(U.SEMPNO)
                    WHERE F.NFRMNO = ? 
                    AND F.VORGNO = ? 
                    AND F.CYEAR = ? 
                    AND F.CYEAR2 = ? 
                    AND F.NRUNNO = ?
                    AND F.CAPVSTNO = '1'
                    ORDER BY F.CEXTDATA ASC NULLS FIRST, F.CSTEPNO ASC";

            return $this->QuerySetBase($sql, $this->webflowBase, [
                (int)$formKeys['NFRMNO'],
                (string)$formKeys['VORGNO'],
                (string)$formKeys['CYEAR'],
                (string)$formKeys['CYEAR2'],
                (int)$formKeys['NRUNNO']
            ])->result();
        }

        public function checkFlowCompleted($nFrmNo, $vOrgNo, $cYear, $cYear2, $nRunNo) {
            $sql = "SELECT COUNT(*) AS REMAINING 
                    FROM FLOW 
                    WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ? 
                    AND (CAPVSTNO IS NULL OR CAPVSTNO != '1')";
            $row = $this->QuerySetBase($sql, $this->webflowBase, [(int)$nFrmNo, (string)$vOrgNo, (string)$cYear,(string)$cYear2, (int)$nRunNo])->row_array();
            return ((int)$row['REMAINING']) === 0;
        }


        public function isFirstStepApproved($nFrmNo, $vOrgNo, $cYear, $cYear2, $nRunNo) {
            $sql = "SELECT COUNT(*) AS CNT 
                    FROM FLOW 
                    WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ?
                    AND CSTEPNO = '01' 
                    AND CAPVSTNO = '1'";

            $row = $this->QuerySetBase($sql, $this->webflowBase, [
                (int)$nFrmNo,
                (string)$vOrgNo,
                (string)$cYear,
                (string)$cYear2,
                (int)$nRunNo
            ])->row_array();

            return ((int)($row['CNT'] ?? 0)) > 0;
        }

            
        /**
         * ดึง Revision ปัจจุบันจาก FE_ASP_CONTROL_MST
         */
        public function getCurrentRevisionFromMaster($controlNo) {
            $controlNo = trim((string)$controlNo);
            if (empty($controlNo)) return '*';

            $sql = "SELECT NVL(REVISION, '*') AS CURRENT_REV 
                    FROM SMARTMAT.FE_ASP_CONTROL_MST 
                    WHERE CONTROL_NO = ? AND ACTIVE_FLAG = 'Y'";
            $row = $this->QuerySetBase($sql, $this->smmtBase, [$controlNo])->row_array();
            
            $rev = trim((string)($row['CURRENT_REV'] ?? '*'));
            return (!empty($rev) && $rev !== '') ? $rev : '*';
        }

            
        /**
         * อัปเดต Revision ของเอกสารและ Master Control
         * - NO_CHANGE: คง Revision เดิมไว้
         * - CHANGE: เดิน Revision ถัดไป (* -> A -> B ...) และอัปเดตทั้ง Header และ Master Control
         */
        public function updateDocRevision($headerId, $controlNo, $reviewDetails, $currentRev) {
            $finalRev = (!empty($currentRev) && $currentRev !== '') ? $currentRev : '*';

            $db = $this->load->database($this->smmtBase, TRUE);

            if ($reviewDetails === 'CHANGE') {
                // คำนวณ Revision ถัดไป (* -> A -> B ...)
                $finalRev = $this->getNextRevisionChar($finalRev);

                // 1. อัปเดต Revision ใหม่ลง Master Control บน SMARTMAT
                $db->where('CONTROL_NO', $controlNo)
                ->set('REVISION', $finalRev)
                ->set('UPDATE_DATE', 'SYSDATE', FALSE)
                ->update('SMARTMAT.FE_ASP_CONTROL_MST');

                // 2. อัปเดต Revision ใหม่ลงใน FE_ASP_HEADER ของใบงานนี้
                $db->where('HEADER_ID', $headerId)
                ->set('DOC_REVISION', $finalRev)
                ->set('UPDATE_DATE', 'SYSDATE', FALSE)
                ->update('SMARTMAT.FE_ASP_HEADER');
            }

            return $finalRev;
        }

    // =================================================================

    // =================================================================
    // == Auto Yearly
    // =================================================================
        /**
         * ดึงรายการ Control Master ที่เปิดใช้งาน และมีกำหนดผู้รับผิดชอบ (RESP_EMPNO)
         * สำหรับการสร้างเอกสาร Yearly Review
         */
        public function getActiveControlsForYearly($controlNo = '', $empNo = '') {
            $sql = "SELECT CONTROL_NO, SDIVCODE, SDEPCODE, SSECCODE, CONTROL_NAME, RESP_EMPNO
                    FROM SMARTMAT.FE_ASP_CONTROL_MST
                    WHERE ACTIVE_FLAG = 'Y'
                    AND RESP_EMPNO IS NOT NULL";
            
            $binds = [];
            if (!empty($controlNo)) {
                $sql .= " AND CONTROL_NO = ?";
                $binds[] = trim((string)$controlNo);
            }
            if (!empty($empNo)) {
                $sql .= " AND RESP_EMPNO = ?";
                $binds[] = trim((string)$empNo);
            }

            $sql .= " ORDER BY CONTROL_NO ASC, SDEPCODE ASC";
            return $this->QuerySetBase($sql, $this->smmtBase, $binds)->result_array();
        }

        /**
         * ตรวจสอบว่าในรอบปีเดียวกัน (CYEAR2 = '2026') Control No. ของแผนกนั้น มีการสร้าง Yearly ไปแล้วหรือยัง
         */
        public function isYearlyDocExistInYear($controlNo, $depCode, $cYear) {
            $cYear4 = strlen($cYear) === 4 ? $cYear : ('20' . $cYear);

            $sql = "SELECT DOC_NO 
                    FROM SMARTMAT.FE_ASP_HEADER 
                    WHERE CONTROL_NO = ? 
                      AND SDEPCODE = ?
                      AND CYEAR2 = ? 
                      AND REVIEW_PERIOD = 'YEARLY'
                      AND STATUS NOT IN ('REJECT', 'CANCEL', '0')";

            $res = $this->QuerySetBase($sql, $this->smmtBase, [
                trim($controlNo),
                trim($depCode),
                (string)$cYear4
            ])->row_array();

            return !empty($res);
        }
        /**
         * ตรวจสอบว่ามีเอกสาร Yearly ในรอบปีที่กำหนดหรือไม่
         * คืนค่าข้อมูลเอกสาร (DOC_NO, STATUS) หากมีเอกสารที่ยังไม่ถูก Reject/Cancel
         */

    
    // =================================================================
    // == Batch.php
    // =================================================================
        public function getExistingYearlyDoc($controlNo, $depCode, $cYear) {
            $cYear4 = strlen($cYear) === 4 ? $cYear : ('20' . $cYear);

            $sql = "SELECT DOC_NO, STATUS, SDEPCODE 
                    FROM SMARTMAT.FE_ASP_HEADER 
                    WHERE CONTROL_NO = ? 
                      AND SDEPCODE = ?
                      AND CYEAR2 = ? 
                      AND REVIEW_PERIOD = 'YEARLY'
                      AND STATUS NOT IN ('REJECT', 'CANCEL', '0')
                    ORDER BY HEADER_ID DESC";

            return $this->QuerySetBase($sql, $this->smmtBase, [
                trim($controlNo),
                trim($depCode),
                (string)$cYear4
            ])->row_array();
        }

        
        /**
         * ดึงรายการ Control No. สำหรับทำ Yearly Review โดยยุบรวมไม่ให้ 1 Control No. สร้างซ้ำหลายแผนก
         * (หาก 1 Control No. มีหลายแผนก จะเลือกแผนกที่มีการกำหนดผู้รับผิดชอบ RESP_EMPNO มาก่อน)
         */
        public function getAllActiveControlsForYearly($targetControlNo = '', $cYear = '') {
            if (empty($cYear)) {
                $cYear = date('Y');
            }
            $cYear4 = strlen($cYear) === 4 ? $cYear : ('20' . $cYear);

            $sql = "WITH FILTERED_CONTROLS AS (
                        SELECT 
                            M.CONTROL_NO,
                            M.CONTROL_NAME,
                            M.SDIVCODE,
                            M.SDEPCODE,
                            NVL(M.SSECCODE, '00') AS SSECCODE,
                            TRIM(M.RESP_EMPNO) AS RESP_EMPNO,
                            EMP.SNAME AS RESP_NAME,
                            EMP.SRECMAIL AS RESP_EMAIL,
                            -- นับจำนวนคนที่มีใน Control No. เดียวกัน
                            COUNT(CASE WHEN M.RESP_EMPNO IS NOT NULL AND TRIM(M.RESP_EMPNO) <> '' THEN 1 END) OVER (PARTITION BY M.CONTROL_NO) AS HAS_PIC_COUNT,
                            -- ลำดับแถวกรณีที่ไม่มีคนเลยทั้งกลุ่ม
                            ROW_NUMBER() OVER (PARTITION BY M.CONTROL_NO ORDER BY M.SDEPCODE ASC, M.SSECCODE ASC) AS RN_NO_PIC
                        FROM SMARTMAT.FE_ASP_CONTROL_MST M
                        LEFT JOIN AMEC.AEMPLOYEE EMP 
                            ON TRIM(M.RESP_EMPNO) = TRIM(EMP.SEMPNO)
                        WHERE M.ACTIVE_FLAG = 'Y'
                    )
                    SELECT 
                        F.CONTROL_NO,
                        F.CONTROL_NAME,
                        F.SDIVCODE,
                        F.SDEPCODE,
                        F.SSECCODE,
                        F.RESP_EMPNO,
                        F.RESP_NAME,
                        F.RESP_EMAIL,
                        NVL(HE.DOC_NO, '-') AS FORMNO,
                        NVL(HE.STATUS, '-') AS DOC_STATUS
                    FROM FILTERED_CONTROLS F
                    LEFT JOIN 
                    (
                        SELECT 
                            H.DOC_NO,
                            H.CONTROL_NO,
                            H.SDEPCODE AS DEP_CODE,
                            NVL(H.SSECCODE, '00') AS SEC_CODE,
                            H.STATUS
                        FROM SMARTMAT.FE_ASP_HEADER H
                        WHERE H.CYEAR2 = ?
                        AND H.REVIEW_PERIOD = 'YEARLY'
                        AND H.STATUS NOT IN ('REJECT', 'CANCEL', '0')
                    ) HE
                        ON HE.CONTROL_NO = F.CONTROL_NO
                    AND HE.DEP_CODE = F.SDEPCODE
                    AND HE.SEC_CODE = NVL(F.SSECCODE, '00')
                    WHERE 
                        -- เงื่อนไขที่ 1: ถ้ามีคน ให้หยิบเฉพาะแถวที่มี RESP_EMPNO เท่านั้น (แถวที่เป็น NULL ตัดทิ้ง)
                        (F.HAS_PIC_COUNT > 0 AND F.RESP_EMPNO IS NOT NULL AND TRIM(F.RESP_EMPNO) <> '')
                        OR 
                        -- เงื่อนไขที่ 2: ถ้าไม่มีคนเลยสักแถว ให้หยิบมาแค่แถวแรกแถวเดียวเพื่อรายงานเตือน Admin
                        (F.HAS_PIC_COUNT = 0 AND F.RN_NO_PIC = 1)";

            $params = [(string)$cYear4];

            if (!empty($targetControlNo)) {
                $sql .= " AND F.CONTROL_NO = ?";
                $params[] = trim($targetControlNo);
            }

            $sql .= " ORDER BY F.CONTROL_NO ASC, F.SDEPCODE ASC";

            return $this->QuerySetBase($sql, $this->smmtBase, $params)->result_array();
        }

        
        /**
         * ดึงข้อมูลอีเมลและชื่อของพนักงาน
         * ดึงจาก AMEC.AEMPLOYEE ก่อน (ฟิลด์ SRECMAIL) หากไม่พบให้ค้นหาจาก AMECUSERALL
         */
        public function getEmployeeEmail($empNo) 
        {
            $empNo = trim((string)$empNo);
            if (empty($empNo)) return null;

            // 1. ค้นหาจาก AMEC.AEMPLOYEE ก่อน (มาตรฐาน Webflow)
            $sqlAemp = "SELECT SEMPNO, SNAME, SRECMAIL 
                        FROM AMEC.AEMPLOYEE 
                        WHERE TRIM(SEMPNO) = ?";
            $resAemp = $this->load->database('DEFAULT', TRUE)->query($sqlAemp, [$empNo])->row_array();
            if (!empty($resAemp) && !empty($resAemp['SRECMAIL'])) {
                return $resAemp;
            }

            // 2. Fallback: ค้นหาจาก AMEC.AMECUSERALL
            $sqlUser = "SELECT SEMPNO, SNAME, SEMAIL AS SRECMAIL 
                        FROM AMEC.AMECUSERALL 
                        WHERE TRIM(SEMPNO) = ? AND (CSTATUS IS NULL OR CSTATUS <> '0')";
            $resUser = $this->load->database('DEFAULT', TRUE)->query($sqlUser, [$empNo])->row_array();
            if (!empty($resUser) && !empty($resUser['SRECMAIL'])) {
                return $resUser;
            }

            // 3. Fallback สุดท้าย: สร้าง mock data กรณีเป็น local/test
            return [
                'SEMPNO'   => $empNo,
                'SNAME'    => 'Employee (' . $empNo . ')',
                'SRECMAIL' => $empNo . '@mitsubishielevatorasia.co.th'
            ];
        }

        
        /**
         * ดึงรายชื่อ Email ของ Admin ประจำฟอร์ม 
         */
        public function getAdminEmails() {
            $sql = "SELECT DISTINCT
                        A.EMPNO AS SEMPNO, 
                        EMP.SNAME, 
                        NVL(EMP.SRECMAIL, USR.SEMAIL) AS SRECMAIL 
                    FROM SMARTMAT.FE_FORM_ADMIN A
                    LEFT JOIN AMEC.AEMPLOYEE EMP 
                        ON TRIM(A.EMPNO) = TRIM(EMP.SEMPNO)
                    LEFT JOIN AMEC.AMECUSERALL USR 
                        ON TRIM(A.EMPNO) = TRIM(USR.SEMPNO)
                    WHERE (A.FORM_CODE = '" . $this->CodeForm. "' OR A.FORM_CODE = 'ALL')
                    AND A.IS_ACTIVE = 1 
                    AND (EMP.SRECMAIL IS NOT NULL OR USR.SEMAIL IS NOT NULL)";

            return $this->QuerySetBase($sql, $this->smmtBase)->result_array();
        }


    // =================================================================

    // =================================================================
    // == Control_mst.php
    // =================================================================
        
        /**
         * ดึงรายการ Master Control No. ทั้งหมดสำหรับ Admin
         */
        public function getAdminControlMasterList() {
            $sql = "SELECT M.CONTROL_NO, M.CONTROL_NAME, M.SDIVCODE, M.SDEPCODE, M.SSECCODE, 
                        M.RESP_EMPNO, M.ACTIVE_FLAG,
                        U.SNAME AS RESP_NAME,
                        D.SDEPT AS DEPT_NAME,
                        S.SSEC AS SEC_NAME,
                        V.SDIV AS DIV_NAME
                    FROM SMARTMAT.FE_ASP_CONTROL_MST M
                    LEFT JOIN AMEC.AMECUSERALL U ON TRIM(M.RESP_EMPNO) = TRIM(U.SEMPNO)
                    LEFT JOIN AMEC.PDEPARTMENT D ON TRIM(M.SDEPCODE) = TRIM(D.SDEPCODE)
                    LEFT JOIN AMEC.PSECTION S ON TRIM(M.SSECCODE) = TRIM(S.SSECCODE)
                    LEFT JOIN (SELECT DISTINCT SDIVCODE, SDIV FROM AMEC.AMECUSERALL WHERE SDIVCODE IS NOT NULL) V 
                        ON TRIM(M.SDIVCODE) = TRIM(V.SDIVCODE)
                    ORDER BY M.SDIVCODE ASC, M.SDEPCODE ASC, M.CONTROL_NO ASC, M.SSECCODE ASC";

            return $this->QuerySetBase($sql, $this->smmtBase)->result_array();
        }

        /**
         * ดึง Department ทั้งหมดภายใต้ Division (เทียบ 2 หลักแรก)
         */
        public function getDepartmentsByDiv($divCode) {
            $divCode = trim((string)$divCode);
            if (empty($divCode) || $divCode === '00') return [];

            $prefix = substr($divCode, 0, 2);
            $sql = "SELECT SDEPCODE, SDEPT AS DEPT_NAME, SDEPARTMENT 
                    FROM AMEC.PDEPARTMENT 
                    WHERE SDEPARTMENT NOT LIKE '(Cancel)%' 
                    AND SUBSTR(SDEPCODE, 1, 2) = ?
                    ORDER BY SDEPCODE ASC";

            return $this->QuerySetBase($sql, $this->webflowBase, [$prefix])->result_array();
        }

        /**
         * ดึงพนักงานทั้งหมดที่สังกัดใน Department นั้น (4 หลักแรกตรงกัน)
         */
        public function getEmployeesByDept($depCode) {
            $depCode = trim((string)$depCode);
            if (empty($depCode) || $depCode === '00') return [];

            $prefix = substr($depCode, 0, 4);
            $sql = "SELECT SEMPNO, SNAME, SPOSNAME, SDEPCODE, SDEPT, SSECCODE, SSEC 
                    FROM AMEC.AMECUSERALL 
                    WHERE SUBSTR(SDEPCODE, 1, 4) = ? 
                    AND CSTATUS <> '0' 
                    ORDER BY SEMPNO ASC";

            return $this->QuerySetBase($sql, $this->webflowBase, [$prefix])->result_array();
        }



        /**
         * บันทึกข้อมูล Master Control No. (Insert / Update อิง Composite PK 4 ตัว)
         */
        public function saveControlMasterRow($data, $isEdit = false, $oldKeys = []) {
            $db = $this->load->database($this->smmtBase, TRUE);

            $controlNo = trim((string)$data['CONTROL_NO']);
            $divCode   = trim((string)$data['SDIVCODE']);
            $depCode   = trim((string)$data['SDEPCODE']);
            $secCode   = trim((string)$data['SSECCODE']);

            if ($isEdit && !empty($oldKeys)) {
                $db->where([
                    'CONTROL_NO' => trim((string)$oldKeys['CONTROL_NO']),
                    'SDIVCODE'   => trim((string)$oldKeys['SDIVCODE']),
                    'SDEPCODE'   => trim((string)$oldKeys['SDEPCODE']),
                    'SSECCODE'   => trim((string)$oldKeys['SSECCODE']),
                ]);
                $db->set('UPDATE_DATE', 'SYSDATE', FALSE);
                return $db->update('FE_ASP_CONTROL_MST', $data);
            }

            $exists = $db->where([
                'CONTROL_NO' => $controlNo,
                'SDIVCODE'   => $divCode,
                'SDEPCODE'   => $depCode,
                'SSECCODE'   => $secCode,
            ])->count_all_results('FE_ASP_CONTROL_MST') > 0;

            if ($exists) {
                throw new Exception("มีรายการ Control No. {$controlNo} ในสังกัด ฝ่าย {$divCode} / แผนก {$depCode} / ส่วนงาน {$secCode} นี้อยู่แล้ว");
            }

            $db->set('CREATE_DATE', 'SYSDATE', FALSE);
            $db->set('UPDATE_DATE', 'SYSDATE', FALSE);
            return $db->insert('FE_ASP_CONTROL_MST', $data);
        }

        /**
         * ลบแถว Master Control No.
         */
        public function deleteControlMasterRow($keys) {
            $db = $this->load->database($this->smmtBase, TRUE);
            $db->where([
                'CONTROL_NO' => trim((string)$keys['CONTROL_NO']),
                'SDIVCODE'   => trim((string)$keys['SDIVCODE']),
                'SDEPCODE'   => trim((string)$keys['SDEPCODE']),
                'SSECCODE'   => trim((string)$keys['SSECCODE']),
            ]);
            return $db->delete('FE_ASP_CONTROL_MST');
        }
    // =================================================================


    // =================================================================
    // == compare Form Yearly & Email Helper
    // =================================================================

    /**
     * ดึงรายงานตรวจสอบความครบถ้วนของเอกสาร Yearly ในรอบปีที่กำหนด
     * ใช้ดูว่า Control No. ใดสร้างแล้ว หรือยังไม่ได้สร้าง (เช็คครบทุก Control แม้ไม่มี PIC)
     */
    public function getYearlyCompletenessStatus($cYear2) {
        $cYear2 = trim((string)$cYear2);

        $sql = "SELECT DISTINCT
                    M.CONTROL_NO,
                    M.CONTROL_NAME,
                    M.SDIVCODE,
                    M.SDEPCODE,
                    NVL(M.SSECCODE, '00') AS SSECCODE,
                    TRIM(M.RESP_EMPNO) AS RESP_EMPNO,
                    EMP.SNAME AS RESP_NAME,
                    EMP.SRECMAIL AS RESP_EMAIL,
                    H.DOC_NO,
                    H.STATUS AS DOC_STATUS,
                    H.NFRMNO,
                    H.VORGNO,
                    H.CYEAR,
                    H.CYEAR2,
                    H.NRUNNO,
                    CASE 
                        WHEN H.DOC_NO IS NOT NULL THEN 'CREATED'
                        WHEN M.RESP_EMPNO IS NULL OR TRIM(M.RESP_EMPNO) = '' THEN 'NO_PIC'
                        ELSE 'MISSING'
                    END AS GENERATE_STATUS
                FROM SMARTMAT.FE_ASP_CONTROL_MST M
                LEFT JOIN AMEC.AEMPLOYEE EMP 
                    ON TRIM(M.RESP_EMPNO) = TRIM(EMP.SEMPNO)
                LEFT JOIN SMARTMAT.FE_ASP_HEADER H 
                    ON M.CONTROL_NO = H.CONTROL_NO 
                AND M.SDEPCODE = H.SDEPCODE 
                AND NVL(M.SSECCODE, '00') = NVL(H.SSECCODE, '00')
                AND H.CYEAR2 = ? 
                AND H.REVIEW_PERIOD = 'YEARLY'
                AND H.STATUS NOT IN ('REJECT', 'CANCEL')
                WHERE M.ACTIVE_FLAG = 'Y'
                ORDER BY M.SDIVCODE ASC, M.SDEPCODE ASC, M.CONTROL_NO ASC";

        return $this->QuerySetBase($sql, $this->smmtBase, [$cYear2])->result_array();
    }



    // =================================================================


    // =================================================================
    // == Report FE-ASP
    // =================================================================
        /**
         * ดึงข้อมูลรายงาน FE-ASP พร้อมรายการไฟล์แนบ
         */
        public function getReportData($filters = []) {
            $where = "WHERE 1=1";
            $binds = [];

            if (!empty($filters['docNo'])) {
                $where .= " AND (UPPER(H.DOC_NO) LIKE ? OR UPPER(H.CONTROL_NO) LIKE ?)";
                $binds[] = '%' . strtoupper(trim($filters['docNo'])) . '%';
                $binds[] = '%' . strtoupper(trim($filters['docNo'])) . '%';
            }

            if (!empty($filters['status'])) {
                $where .= " AND H.STATUS = ?";
                $binds[] = strtoupper(trim($filters['status']));
            }

            // เพิ่มเงื่อนไขกรอง Review period
            if (!empty($filters['reviewPeriod'])) {
                $where .= " AND H.REVIEW_PERIOD = ?";
                $binds[] = strtoupper(trim($filters['reviewPeriod']));
            }

            if (!empty($filters['divCode'])) {
                $where .= " AND H.SDIVCODE = ?";
                $binds[] = trim($filters['divCode']);
            }

            if (!empty($filters['depCode'])) {
                $where .= " AND H.SDEPCODE = ?";
                $binds[] = trim($filters['depCode']);
            }

            // กรองตาม Fiscal Year (01 เม.ย. ปีที่เลือก ถึง 31 มี.ค. ปีถัดไป)
            if (!empty($filters['fiscalYear'])) {
                $range = $this->getFiscalYearRange($filters['fiscalYear']);
                $where .= " AND H.CREATE_DATE >= TO_DATE(?, 'YYYY-MM-DD') 
                            AND H.CREATE_DATE < TO_DATE(?, 'YYYY-MM-DD') + 1";
                $binds[] = $range['start'];
                $binds[] = $range['end'];
            }

            if (!empty($filters['startDate'])) {
                $where .= " AND TRUNC(H.CREATE_DATE) >= TO_DATE(?, 'YYYY-MM-DD')";
                $binds[] = $filters['startDate'];
            }

            if (!empty($filters['endDate'])) {
                $where .= " AND TRUNC(H.CREATE_DATE) <= TO_DATE(?, 'YYYY-MM-DD')";
                $binds[] = $filters['endDate'];
            }

            $sql = "SELECT 
                        H.HEADER_ID,
                        H.DOC_NO,
                        H.CONTROL_NO,
                        H.DOC_REVISION,
                        H.SDIVCODE,
                        H.SDEPCODE,
                        H.SSECCODE,
                        H.NFRMNO,
                        H.VORGNO,
                        H.CYEAR,
                        H.CYEAR2,
                        H.NRUNNO,
                        H.REVIEW_PERIOD,
                        H.REVIEW_DETAILS,
                        H.DETAIL_OF_CHANGE,
                        H.EFFECT_STATUS,
                        H.STATUS,
                        TO_CHAR(H.CREATE_DATE, 'DD/MM/YYYY') AS REVIEWED_DATE,
                        H.REQ_BY,
                        U.SNAME AS REQ_NAME,
                        V.SDIV AS DIVISION_NAME,
                        D.SDEPT AS DEPT_NAME,
                        S.SSEC AS SEC_NAME
                    FROM SMARTMAT.FE_ASP_HEADER H
                    LEFT JOIN AMEC.AMECUSERALL U ON TRIM(H.REQ_BY) = TRIM(U.SEMPNO)
                    LEFT JOIN (SELECT DISTINCT SDIVCODE, SDIV FROM AMEC.AMECUSERALL WHERE SDIVCODE IS NOT NULL) V 
                        ON TRIM(H.SDIVCODE) = TRIM(V.SDIVCODE)
                    LEFT JOIN AMEC.PDEPARTMENT D ON TRIM(H.SDEPCODE) = TRIM(D.SDEPCODE)
                    LEFT JOIN AMEC.PSECTION S ON TRIM(H.SSECCODE) = TRIM(S.SSECCODE)
                    {$where}
                    ORDER BY H.HEADER_ID DESC";

            $records = $this->QuerySetBase($sql, $this->smmtBase, $binds)->result_array();

            if (empty($records)) {
                return [];
            }

            // ดึงไฟล์แนบจาก FE_FILE
            $dbWebflow = $this->load->database($this->webflowBase, TRUE);
            foreach ($records as &$row) {
                $files = $dbWebflow->where([
                    'NFRMNO' => (int)$row['NFRMNO'],
                    'VORGNO' => (string)$row['VORGNO'],
                    'CYEAR2' => (string)$row['CYEAR2'],
                    'NRUNNO' => (int)$row['NRUNNO'],
                ])->order_by('FILE_ID', 'ASC')->get('FE_FILE')->result_array();

                $row['FILES'] = $files ?: [];
            }

            return $records;
        }

            
        /**
         * ดึงประวัติเอกสารทั้งหมดตาม Control No. (History Modal View)
         */
        public function getDocHistoryByControlNo($controlNo) {
            $controlNo = trim((string)$controlNo);
            if (empty($controlNo)) return [];

            $sql = "SELECT 
                        H.HEADER_ID,
                        H.DOC_NO,
                        H.CONTROL_NO,
                        NVL(H.DOC_REVISION, '*') AS DOC_REVISION,
                        H.REVIEW_PERIOD,
                        H.REVIEW_DETAILS,
                        H.DETAIL_OF_CHANGE,
                        H.STATUS,
                        TO_CHAR(H.CREATE_DATE, 'DD/MM/YYYY HH24:MI') AS CREATE_DATE_TXT,
                        H.REQ_BY,
                        U.SNAME AS REQ_NAME,
                        H.NFRMNO,
                        H.VORGNO,
                        H.CYEAR,
                        H.CYEAR2,
                        H.NRUNNO
                    FROM SMARTMAT.FE_ASP_HEADER H
                    LEFT JOIN AMEC.AMECUSERALL U 
                        ON H.REQ_BY = U.SEMPNO
                    WHERE H.CONTROL_NO = ?
                    ORDER BY H.HEADER_ID DESC";

            $records = $this->QuerySetBase($sql, $this->smmtBase, [$controlNo])->result_array();

            return $records ?: [];
        }

        
        /**
         * ดึงรหัสพนักงาน Admin หรือ PIC ของฝ่ายสิ่งแวดล้อม (E/P) สำหรับเป็นผู้สร้าง FE-DOC
         */
        public function getEpAdminEmpNo() {
            $sql = "SELECT EMPNO FROM SMARTMAT.FE_FORM_ADMIN 
                    WHERE (FORM_CODE = 'FE-ASP' OR FORM_CODE = 'ALL') AND IS_ACTIVE = 1 
                    ORDER BY EMPNO ASC";
            $row = $this->QuerySetBase($sql, $this->smmtBase)->row_array();
            return $row['EMPNO'] ?? '13204';
        }
        
        /**
         * ดึงและคำนวณ Revision ถัดไปของเอกสารสรุปทบทวนประเมินสิ่งแวดล้อมประจำปี (FE-DOC)
         */
        public function getNextYearlySummaryRevision() {
            $dbSmmt = $this->load->database($this->smmtBase, TRUE);

            // ดึง Revision ล่าสุดจากเอกสาร FE-DOC ประเภท AMEC-AS ที่สร้างไว้ล่าสุด
            $sql = "SELECT DOC_REVISION 
                    FROM SMARTMAT.FE_DOC_HEADER 
                    WHERE DOC_TYPE_CODE = 'AMEC-AS' 
                    AND DOC_REVISION IS NOT NULL 
                    ORDER BY CREATE_DATE DESC, DOC_HEADER_ID DESC";
            $row = $dbSmmt->query($sql)->row();

            if (!$row || empty($row->DOC_REVISION)) {
                return '*'; // ถ้าเป็นเอกสารฉบับแรกสุด
            }

            $curRev = trim(strtoupper($row->DOC_REVISION));
            if ($curRev === '*' || $curRev === '-') {
                return 'A';
            }

            // ขยับตัวอักษร เช่น A -> B, B -> C
            return chr(ord($curRev) + 1);
        }

        /**
         * ดึงรหัสพนักงาน Admin สำหรับงาน FE-ASP Cover Yearly จาก FE_FORM_ADMIN
         */
        public function getYearlyCoverAdminEmpNo() {
            $dbSmmt = $this->load->database($this->smmtBase, TRUE);
            $row =$dbSmmt->select('EMPNO')
                        ->from('SMARTMAT.FE_FORM_ADMIN')
                        ->where('FORM_CODE', 'FE-ASP-COVERYEARLY')
                        ->where('IS_ACTIVE', 1)
                        ->order_by('CREATE_DATE', 'DESC')
                        ->get()
                        ->row();

            return !empty($row->EMPNO) ? trim((string)$row->EMPNO) : '24010';
        }

    // =================================================================

    
    // =================================================================
    // == function model
    // =================================================================
        /**
         * คำนวณ Revision ตัวถัดไป (* -> A -> B -> ... -> Z)
         */
        public function getNextRevisionChar($currentRev) {
            $rev = strtoupper(trim((string)$currentRev));

            // 1. กรณีฉบับแรกเริ่มที่เป็น * หรือยังไม่มีค่า เมื่อ Change จะเริ่มเป็น Revision A
            if (empty($rev) || $rev === '*' || $rev === '-') {
                return 'A';
            }

            // 2. ถ้าเป็นตัวอักษร A-Y ให้เดินไปยังตัวถัดไป (เช่น A -> B, B -> C)
            if (preg_match('/^[A-Y]$/', $rev)) {
                return chr(ord($rev) + 1);
            }

            // 3. ป้องกันกรณีเกิน Z
            if ($rev === 'Z') {
                return 'AA';
            }

            return $rev;
        }

        /**
         * คำนวณช่วงวันที่ Fiscal Year (01/04 ถึง 31/03 ของปีถัดไป)
         */
        public function getFiscalYearRange($year) {
            $startYear = (int)$year;
            $nextYear  = $startYear + 1;
            return [
                'start' => "{$startYear}-04-01",
                'end'   => "{$nextYear}-03-31"
            ];
        }

        
    
        /**
         * ดึงรายการ Division ทั้งหมด
         */
        public function getAllDivisions() {
            $sql = "SELECT DISTINCT SDIVCODE, SDIV AS DIV_NAME 
                    FROM AMEC.AMECUSERALL 
                    WHERE SDIVCODE IS NOT NULL 
                    ORDER BY SDIVCODE ASC";
            return $this->QuerySetBase($sql, $this->webflowBase)->result_array();
        }
        
        /**
         * ดึงรายการ Department ทั้งหมด
         */
        public function getAllDepartmentsList() {
            $sql = "SELECT SDEPCODE, SDEPT AS DEPT_NAME 
                    FROM AMEC.PDEPARTMENT 
                    WHERE SDEPARTMENT NOT LIKE '(Cancel)%' 
                    ORDER BY SDEPCODE ASC";
            return $this->QuerySetBase($sql, $this->webflowBase)->result_array();
        }
        
        /**
         * ตรวจสอบว่าเอกสาร Yearly ใน Fiscal Year นั้นอนุมัติครบทุกใบแล้วหรือยัง
         */
        public function checkYearlyBatchCompleted($year) {
            $range = $this->getFiscalYearRange($year);

            $sql = "SELECT 
                        COUNT(*) AS TOTAL,
                        COUNT(CASE WHEN STATUS = 'APPROVE' THEN 1 END) AS APPROVED_COUNT
                    FROM SMARTMAT.FE_ASP_HEADER
                    WHERE CREATE_DATE >= TO_DATE(?, 'YYYY-MM-DD')
                    AND CREATE_DATE < TO_DATE(?, 'YYYY-MM-DD') + 1";

            $row = $this->QuerySetBase($sql, $this->smmtBase, [
                $range['start'], 
                $range['end']
            ])->row_array();

            $total    = (int)($row['TOTAL'] ?? 0);
            $approved = (int)($row['APPROVED_COUNT'] ?? 0);

            return [
                'isCompleted' => ($total > 0 && $total === $approved),
                'total'       => $total,
                'approved'    => $approved,
                'remaining'   => ($total - $approved),
                'fiscalYear'  => (string)$year
            ];
        }
    // =================================================================



    /**
     * ดึงรายการเอกสารรอบปีที่ Approved แล้วทั้งหมดสำหรับสร้าง Cover Excel สรุปประจำปี
     */
    public function getYearlyApprovedRecordsForSummary($year) {
        $range = $this->getFiscalYearRange($year);

        $sql = "SELECT 
                    H.HEADER_ID,
                    H.DOC_NO,
                    H.CONTROL_NO,
                    NVL(H.DOC_REVISION, '*') AS DOC_REVISION,
                    H.SDIVCODE,
                    H.SDEPCODE,
                    H.SSECCODE,
                    -- ดึงชื่อ Division, Department, Section
                    NVL(V.SDIV, H.SDIVCODE) AS DIVISION_NAME,
                    NVL(D.SDEPT, H.SDEPCODE) AS DEPT_NAME,
                    NVL(S.SSEC, H.SSECCODE) AS SEC_NAME,
                    H.REVIEW_PERIOD,
                    H.REVIEW_DETAILS,
                    H.DETAIL_OF_CHANGE,
                    TO_CHAR(H.CREATE_DATE, 'DD-Mon-YY') AS REVIEWED_DATE,
                    TO_CHAR(H.CREATE_DATE, 'DD-Mon-YY') AS ISSUE_DATE,
                    H.REQ_BY,
                    U.SNAME AS REQ_NAME
                FROM SMARTMAT.FE_ASP_HEADER H
                LEFT JOIN AMEC.AMECUSERALL U 
                    ON TRIM(H.REQ_BY) = TRIM(U.SEMPNO)
                LEFT JOIN (SELECT DISTINCT SDIVCODE, SDIV FROM AMEC.AMECUSERALL WHERE SDIVCODE IS NOT NULL) V 
                    ON TRIM(H.SDIVCODE) = TRIM(V.SDIVCODE)
                LEFT JOIN AMEC.PDEPARTMENT D 
                    ON TRIM(H.SDEPCODE) = TRIM(D.SDEPCODE)
                LEFT JOIN AMEC.PSECTION S 
                    ON TRIM(H.SSECCODE) = TRIM(S.SSECCODE)
                WHERE H.CREATE_DATE >= TO_DATE(?, 'YYYY-MM-DD')
                  AND H.CREATE_DATE < TO_DATE(?, 'YYYY-MM-DD') + 1
                  AND H.REVIEW_PERIOD = 'YEARLY'
                  AND H.STATUS = 'APPROVE'
                ORDER BY H.SDIVCODE ASC, H.SDEPCODE ASC, H.CONTROL_NO ASC";

        return $this->QuerySetBase($sql, $this->smmtBase, [
            $range['start'], 
            $range['end']
        ])->result_array();
    }



    /**
     * ตรวจสอบว่ามีเอกสาร FE-DOC สำหรับรอบปีนี้ถูกสร้างไปแล้วหรือยัง (ป้องกันสร้างซ้ำ)
     */
    public function getExistingFeDocForYear($fiscalYear) {
        $dbSmmt = $this->load->database($this->smmtBase, TRUE);
        $fiscalYear = trim((string)$fiscalYear);

        // ค้นหาเอกสาร FE-DOC ของปี Fiscal Year นั้นๆ โดยเฉพาะ
        // ตรวจสอบทั้งรหัส DOC_TYPE_CODE = 'AMEC-AS' และมีคำว่า FY ตามด้วยปี หรือปี ค.ศ. นั้น
        $sql = "SELECT H.*
                FROM SMARTMAT.FE_DOC_HEADER H
                WHERE H.DOC_TYPE_CODE = 'AMEC-AS'
                  AND (
                      UPPER(H.DOC_SUBJECT) LIKE UPPER(?) 
                      OR UPPER(H.REMARK) LIKE UPPER(?)
                      OR UPPER(H.DOC_SUBJECT) LIKE UPPER(?)
                  )
                ORDER BY H.CREATE_DATE DESC, H.NRUNNO DESC";
        
        $term1 = "%FY{$fiscalYear}%";
        $term2 = "%FY {$fiscalYear}%";
        $term3 = "%{$fiscalYear}%";

        return $dbSmmt->query($sql, [$term1, $term1, $term2])->row_array();
    }

    /**
     * คัดลอกและบันทึกไฟล์ Excel เข้าตาราง FE_FILE ของเอกสาร FE-DOC
     */
    public function attachExcelToFeDoc($feDocKeys, $excelFileName, $excelFilePath) {
        $dbWebflow = $this->load->database($this->webflowBase, TRUE);

        // ดึง NEXT FILE_ID
        $q = $dbWebflow->query("SELECT NVL(MAX(FILE_ID), 0) + 1 AS NEXT_ID FROM FE_FILE");
        $nextFileId = (int)$q->row_array()['NEXT_ID'];

        $fileData = [
            'FILE_ID'    => $nextFileId,
            'NFRMNO'     => (int)$feDocKeys['NFRMNO'],
            'VORGNO'     => (string)$feDocKeys['VORGNO'],
            'CYEAR'      => (string)$feDocKeys['CYEAR'],
            'CYEAR2'     => (string)$feDocKeys['CYEAR2'],
            'NRUNNO'     => (int)$feDocKeys['NRUNNO'],
            'FILE_ONAME' => $excelFileName,
            'FILE_FNAME' => $excelFileName,
            'FILE_PATH'  => dirname($excelFilePath),
            'FILE_SIZE'  => file_exists($excelFilePath) ? filesize($excelFilePath) : 0,
        ];

        $dbWebflow->set('DUPDATE', 'SYSDATE', FALSE);
        return $dbWebflow->insert('FE_FILE', $fileData);
    }

}