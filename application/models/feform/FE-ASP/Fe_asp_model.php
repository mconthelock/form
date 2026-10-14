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
        $this->smmtBase    = 'SMMT';    // ฐานข้อมูล SMMT
        $this->webflowBase = 'DEFAULT'; // ฐานข้อมูล Webflow กลาง
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

    // --- ID Generators (Non-Identity) ---
    public function getNextHeaderId() {
        $q = $this->QuerySetBase("SELECT NVL(MAX(HEADER_ID), 0) + 1 AS NEXT_ID FROM FE_ASP_HEADER", $this->smmtBase);
        return (int)$q->row_array()['NEXT_ID'];
    }

    public function getNextDetailId() {
        $q = $this->QuerySetBase("SELECT NVL(MAX(DTL_ID), 0) + 1 AS NEXT_ID FROM FE_ASP_CONFIRMATION_DTL", $this->smmtBase);
        return (int)$q->row_array()['NEXT_ID'];
    }

    // --- CRUD FE_ASP_HEADER ---
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
        $db->set('DATE_ACTION', 'SYSDATE', FALSE);
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

    // --- Confirmation Details ---
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

    // --- Master Data Access ---
    public function getAllActiveControls() {
        $sql = "SELECT * FROM FE_ASP_CONTROL_MST WHERE ACTIVE_FLAG = 'Y' ORDER BY CONTROL_NO ASC";
        return $this->QuerySetBase($sql, $this->smmtBase)->result_array();
    }

    public function getActiveTopics() {
        $sql = "SELECT * FROM FE_ASP_TOPIC_MST WHERE ACTIVE_FLAG = 'Y' ORDER BY TOPIC_GROUP ASC, TOPIC_SEQ ASC";
        return $this->QuerySetBase($sql, $this->smmtBase)->result_array();
    }

    
    /**
     * ดึงข้อมูล Control พร้อมรวมรายชื่อแผนกทั้งหมด (รองรับ 1 Control No. มีหลายแผนก)
     */
    public function getControlMasterWithOrg($controlNo) {
        $sql = "SELECT 
                    M.CONTROL_NO,
                    M.CONTROL_NAME,
                    M.RESP_EMPNO,
                    MAX(U_DIV.SDIV) AS DIVISION_NAME,
                    LISTAGG(
                        CASE 
                            WHEN O.POSITION = 'SEC' THEN U_SEC.SSEC 
                            WHEN O.POSITION = 'DEP' THEN U_DEP.SDEPT 
                            ELSE U_DIV.SDIV 
                        END, ', '
                    ) WITHIN GROUP (ORDER BY O.ORG_MAP_ID) AS DEPARTMENT_NAME
                FROM SMARTMAT.FE_ASP_CONTROL_MST M
                LEFT JOIN SMARTMAT.FE_ASP_CONTROL_ORG O 
                    ON M.CONTROL_NO = O.CONTROL_NO AND O.ACTIVE_FLAG = 'Y'
                LEFT JOIN (SELECT DISTINCT SDIVCODE, SDIV FROM AMECUSERALL WHERE SDIVCODE IS NOT NULL) U_DIV 
                    ON O.SDIVCODE = U_DIV.SDIVCODE
                LEFT JOIN (SELECT DISTINCT SDEPCODE, SDEPT FROM AMECUSERALL WHERE SDEPCODE IS NOT NULL) U_DEP 
                    ON O.SDEPCODE = U_DEP.SDEPCODE
                LEFT JOIN (SELECT DISTINCT SSECODE, SSEC FROM AMECUSERALL WHERE SSECODE IS NOT NULL) U_SEC 
                    ON O.SSECODE = U_SEC.SSECODE
                WHERE M.CONTROL_NO = ? AND M.ACTIVE_FLAG = 'Y'
                GROUP BY M.CONTROL_NO, M.CONTROL_NAME, M.RESP_EMPNO";

        return $this->QuerySetBase($sql, $this->smmtBase, [$controlNo])->row_array();
    }

    public function getLatestApprovedFile($controlNo) {
        $sqlHeader = "SELECT NFRMNO, VORGNO, CYEAR2, NRUNNO 
                      FROM FE_ASP_HEADER 
                      WHERE CONTROL_NO = ? AND STATUS = 'APPROVE'
                      ORDER BY CYEAR DESC, NRUNNO DESC";
        $header = $this->QuerySetBase($sqlHeader, $this->smmtBase, [$controlNo])->row_array();

        if (empty($header)) return null;

        $sqlFile = "SELECT FILE_ID, FILE_ONAME, FILE_FNAME, FILE_PATH
                    FROM FE_FILE 
                    WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR2 = ? AND NRUNNO = ?
                    ORDER BY FILE_ID DESC";
        return $this->QuerySetBase($sqlFile, $this->webflowBase, [
            (int)$header['NFRMNO'],
            (string)$header['VORGNO'],
            (string)$header['CYEAR2'],
            (int)$header['NRUNNO']
        ])->row_array();
    }

    public function getEmpName($EmpNo) {
        $empNo = trim((string)$EmpNo);
        if (empty($empNo)) return ['empno' => '', 'name' => ''];

        $dbWebflow = $this->load->database($this->webflowBase, TRUE);
        $user = $dbWebflow->select('SEMPNO, SNAME')->from('AMECUSERALL')->where('SEMPNO', $empNo)->limit(1)->get()->row();

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
                LEFT JOIN AMECUSERALL U ON TRIM(F.VREALAPV) = TRIM(U.SEMPNO)
                WHERE F.NFRMNO = ? AND F.VORGNO = ? AND F.CYEAR = ? AND F.CYEAR2 = ? AND F.NRUNNO = ?
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
        $db = $this->load->database($this->smmtBase, TRUE);
        $count = $db->where('EMPNO', trim((string)$empno))
                    ->where('IS_ACTIVE', 1)
                    ->group_start()
                        ->where('FORM_CODE', (string)$formCode)
                        ->or_where('FORM_CODE', 'ALL')
                    ->group_end()
                    ->count_all_results('FE_FORM_ADMIN');
        return $count > 0;
    }
}