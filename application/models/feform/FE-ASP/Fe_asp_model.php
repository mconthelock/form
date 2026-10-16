<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';

class Fe_asp_model extends my_model 
{
    public $smmtBase;
    public $webflowBase;

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

    /**
     * ดึง Control No. ตามสิทธิ์:
     * - 13204 หรือ Admin: เห็นทั้งหมด
     * - พนักงานทั่วไป: ล็อกกรองตามฝ่าย (2 หลัก) และ แผนก (4 หลักแรก)
     */
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

        // เฉพาะ 13204 เท่านั้นที่เห็นทุกแผนก
        if ($empNo === '13204') {
            $sql .= " ORDER BY M.CONTROL_NO ASC";
            return $this->QuerySetBase($sql, $this->smmtBase)->result_array();
        }

        // ผู้ใช้ทั่วไป: บังคับกรองเฉพาะแผนกของตนเอง โดยเทียบ 4 หลักแรกเสมอ
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

    /**
     * ดึง Department ตามบทบาท:
     * - User ทั่วไป: ล็อกดึงเฉพาะแผนกของตนเอง (4 ตัวแรกเหมือนกัน)
     * - 13204 (Admin): ดึงทุกแผนกภายใต้ Division
     */
    public function getDepartmentsByRole($divCode, $depCode, $empNo = '') {
        $divCode = trim((string)$divCode);
        $depCode = trim((string)$depCode);
        $empNo   = trim((string)$empNo);

        // เฉพาะ 13204 เท่านั้นที่เห็นทุกแผนกในฝ่าย
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

        // กรณี User ทั่วไป: ล็อกดึงเฉพาะแผนกของตนเองเท่านั้น (4 หลักแรก)
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

        if (empty($depCode) || $depCode === '00') {
            $sql = "SELECT SSECCODE, SSEC AS SEC_NAME, SSECTION, SSEC 
                    FROM AMEC.PSECTION 
                    WHERE SSECCODE = '00'";
            return $this->QuerySetBase($sql, $this->webflowBase)->result_array();
        }

        $prefix = substr($depCode, 0, 4);
        $sql = "SELECT SSECCODE, SSEC AS SEC_NAME, SSECTION, SSEC 
                FROM AMEC.PSECTION 
                WHERE SSECTION NOT LIKE '(Cancel)%'
                  AND (SUBSTR(SSECCODE, 1, 4) = ? OR SSECCODE = '00')
                ORDER BY CASE WHEN SSECCODE = '00' THEN 0 ELSE 1 END, SSECCODE ASC";

        return $this->QuerySetBase($sql, $this->webflowBase, [$prefix])->result_array();
    }

    /**
     * ดึงข้อมูลเอกสารคำขอฉบับที่อนุมัติล่าสุด (Status = APPROVE)
     */
    public function getLatestApprovedFile($controlNo, $currentYear2 = '', $currentRunNo = '') {
        $controlNo    = trim((string)$controlNo);
        $currentYear2 = trim((string)$currentYear2);
        $currentRunNo = trim((string)$currentRunNo);

        if (empty($controlNo)) return null;

        $binds = [$controlNo];
        $whereSql = "WHERE CONTROL_NO = ? AND STATUS = 'APPROVE'";

        // กรณี Edit/View: ดักไม่ให้ดึงเอกสารปัจจุบัน
        if (!empty($currentYear2) && !empty($currentRunNo)) {
            $whereSql .= " AND (
                TO_NUMBER(CYEAR2) < ? 
                OR (TO_NUMBER(CYEAR2) = ? AND TO_NUMBER(NRUNNO) < ?)
            )";
            $binds[] = (int)$currentYear2;
            $binds[] = (int)$currentYear2;
            $binds[] = (int)$currentRunNo;
        }

        // 1. ดึงเอกสารคำขอล่าสุด
        $sqlHeader = "SELECT DOC_NO, CONTROL_NO, NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO 
                      FROM (
                          SELECT DOC_NO, CONTROL_NO, NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO 
                          FROM SMARTMAT.FE_ASP_HEADER 
                          {$whereSql}
                          ORDER BY TO_NUMBER(CYEAR2) DESC, TO_NUMBER(NRUNNO) DESC
                      )
                      WHERE ROWNUM = 1";
        
        $header = $this->QuerySetBase($sqlHeader, $this->smmtBase, $binds)->row_array();

        if (empty($header)) return null;

        // 2. ดึงไฟล์แนบ
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

    public function checkFlowCompleted($nFrmNo, $vOrgNo, $cYear2, $nRunNo) {
        $sql = "SELECT COUNT(*) AS REMAINING 
                FROM FLOW 
                WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR2 = ? AND NRUNNO = ? 
                  AND (CAPVSTNO IS NULL OR CAPVSTNO != '1')";
        $row = $this->QuerySetBase($sql, $this->webflowBase, [(int)$nFrmNo, (string)$vOrgNo, (string)$cYear2, (int)$nRunNo])->row_array();
        return ((int)$row['REMAINING']) === 0;
    }

    public function isFormAdmin($formCode, $empno) {
        $sql = "SELECT COUNT(*) AS CNT FROM FE_FORM_ADMIN 
                WHERE EMPNO = ? AND IS_ACTIVE = 1 
                  AND (FORM_CODE = ? OR FORM_CODE = 'ALL')";
        $row = $this->QuerySetBase($sql, $this->smmtBase, [trim((string)$empno), (string)$formCode])->row_array();
        return ((int)($row['CNT'] ?? 0)) > 0;
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
}