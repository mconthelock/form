<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Training_model extends CI_Model
{

    public function __construct(){
        parent::__construct();
        $this->load->database();
        $this->training_db = $this->load->database('TRAIN', TRUE);
    }

    public function get_empinfo($empno) {
        $sql = "SELECT * FROM AMEC.AMECUSERALL WHERE SEMPNO = '".$empno."'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function get_headinfo($empno) {
        $sql = "SELECT A.EMPNO, A.SPOSCODE AS REQ_POS, A.HEADNO, A.SPOSCODE1, B.* FROM SEQUENCEORG A INNER JOIN AMECUSERALL B ON A.HEADNO = B.SEMPNO WHERE A.EMPNO = '".$empno."'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function getSect() {
        $sql = "SELECT SSECCODE, SSEC FROM AMEC.PSECTION WHERE UPPER(SSEC) NOT LIKE '%CANCEL%' AND SSECCODE <> '00' ORDER BY SSEC";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function getDept() {
        $sql = "SELECT SDEPCODE, SDEPT FROM AMEC.PDEPARTMENT WHERE UPPER(SDEPT) NOT LIKE '%CANCEL%' AND SDEPCODE <> '00' ORDER BY SDEPT";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function getDiv() {
        $sql = "SELECT SDIVCODE, SDIV FROM AMEC.PDIVISION WHERE UPPER(SDIV) NOT LIKE '%CANCEL%' AND SDIVCODE <> '00' ORDER BY SDIV";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function insert_data_bk($table, $data) {
        if (empty($table) || empty($data) || !is_array($data)) {
            return false; // ป้องกัน error
        }
        $result = $this->db->insert($table, $data);
        if ($result) {
             return true;
        } else {
            return false;
        }
    }

    public function insert_data($table, $data, $setRaw = []) {
        if (empty($table) || empty($data) || !is_array($data)) {
            return false;
        }

        $this->db->reset_query();
        $this->db->set($data);

        if (!empty($setRaw) && is_array($setRaw)) {
            foreach ($setRaw as $field => $value) {
                $this->db->set($field, $value, false);
            }
        }

        return $this->db->insert($table);
    }

    public function update_data($table, $data, $where) {
        if (empty($table) || empty($data) || !is_array($data)) {
            return false; // ป้องกัน error
        }
        $this->db->where($where);
        $result = $this->db->update($table, $data);
        if ($result) {
             return true;
        } else {
            return false;
        }
    }

    public function select_all_by_tb($frmno, $orgno, $cyear, $cyear2, $nrunno, $table, $order_by, $extra_where = []) {
        $this->db->distinct();
        $this->db->from($table);
        $this->db->where([
            'NFRMNO' => $frmno,
            'VORGNO' => $orgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ]);

        // ✅ Where เพิ่มเติม
        if (!empty($extra_where) && is_array($extra_where)) {
            $this->db->where($extra_where);
        }

        $this->db->order_by($order_by, 'ASC');
        return $this->db->get()->result();
    }

    function get_training_form_mst($where = ''){
        $query = "SELECT * FROM GP_TRN_FORM_MST ".$where." ORDER BY FID";
        return  $this->db->query($query)->result();
    }

    function get_main_data($frmno, $orgno, $cyear, $cyear2, $nrunno){
        $query = "SELECT A.*, C.SEMPNO AS REQ_EMPNO, C.SNAME AS REQ_NAME, D.SEMPNO AS INP_EMPNO, D.SNAME AS INP_NAME, F.FORM_NAME_TH,F.FORM_NAME_EN
            FROM GP_TRN_HEAD A
            INNER JOIN FORM B ON A.NFRMNO = B.NFRMNO AND A.VORGNO = B.VORGNO AND A.CYEAR = B.CYEAR AND A.CYEAR2 = B.CYEAR2 AND A.NRUNNO = B.NRUNNO
            LEFT JOIN AMEC.AMECUSERALL C ON B.VREQNO = C.SEMPNO
            LEFT JOIN AMEC.AMECUSERALL D ON B.VINPUTER = D.SEMPNO
            INNER JOIN GP_TRN_FORM_MST F ON A.FID = F.FID
            WHERE A.NFRMNO = '".$frmno."' AND A.VORGNO = '".$orgno."' AND A.CYEAR = '".$cyear."'
            AND A.CYEAR2 = '".$cyear2."' and A.NRUNNO = '".$nrunno."'";
        return  $this->db->query($query)->result();
    }

    function get_trainee($frmno, $orgno, $cyear, $cyear2, $nrunno){
        $query = "SELECT A.*,
            E.SEMPNO AS TRAINEE_EMPNO, E.STNAME AS TRAINEE_NAME, E.SSEC AS TRAINEE_SEC, E.SDEPT AS TRAINEE_DEPT,
            E.SDIV AS TRAINEE_DIV, E.SPOSITION AS TRAINEE_POS
            FROM GP_TRN_TRAINEE A
            LEFT JOIN AMEC.AMECUSERALL E ON A.EMPNO = E.SEMPNO
            WHERE A.NFRMNO = '".$frmno."' AND A.VORGNO = '".$orgno."' AND A.CYEAR = '".$cyear."'
            AND A.CYEAR2 = '".$cyear2."' and A.NRUNNO = '".$nrunno."' ORDER BY A.EMPNO";
        return  $this->db->query($query)->result();
    }

        function get_data_flow($frmno, $orgno, $cyear, $cyear2, $nrunno, $where){
            $query = "SELECT * FROM FLOW A
                WHERE A.NFRMNO = '".$frmno."' AND A.VORGNO = '".$orgno."' AND A.CYEAR = '".$cyear."'
                AND A.CYEAR2 = '".$cyear2."' and A.NRUNNO = '".$nrunno."' ".$where;
            return  $this->db->query($query)->result();
        }

    function update_flow($frmno, $orgno, $cyear, $cyear2, $nrunno, $conname, $convalue, $where_col, $where_val){
        $this->db->set($conname, $convalue);
        $this->db->where('NFRMNO', $frmno);
        $this->db->where('VORGNO', $orgno);
        $this->db->where('CYEAR', $cyear);
        $this->db->where('CYEAR2', $cyear2);
        $this->db->where('NRUNNO', $nrunno);
        $this->db->where($where_col, $where_val);
        $this->db->update('FLOW');
        return true;
    }

    function delete_flow($nfrmno,$vorgno,$cyear,$cyear2,$runno, $where_col, $where_val){
        $this->db->where('NFRMNO', $nfrmno);
        $this->db->where('VORGNO', $vorgno);
        $this->db->where('CYEAR', $cyear);
        $this->db->where('CYEAR2', $cyear2);
        $this->db->where('NRUNNO', $runno);
            // ✅ ตรวจสอบ ถ้า where_val เป็น array → ใช้ where_in()
        if (is_array($where_val)) {
            $this->db->where_in($where_col, $where_val);
        } else {
            $this->db->where($where_col, $where_val);
        }
        $this->db->delete('FLOW');
        return true;
    }

    public function get_form($frmno, $orgno, $cyear, $cyear2, $nrunno) {
        $query = "SELECT A.* FROM FORM A
                WHERE A.NFRMNO = '".$frmno."'
                    AND A.VORGNO = '".$orgno."'
                    AND A.CYEAR = '".$cyear."'
                    AND A.CYEAR2 = '".$cyear2."'
                    AND A.NRUNNO = '".$nrunno."'";
        return $this->db->query($query)->result();
    }

    function delete_all_table($nfrmno,$vorgno,$cyear,$cyear2,$runno, $table){
        $this->db->where('NFRMNO', $nfrmno);
        $this->db->where('VORGNO', $vorgno);
        $this->db->where('CYEAR', $cyear);
        $this->db->where('CYEAR2', $cyear2);
        $this->db->where('NRUNNO', $runno);
        $this->db->delete($table);
        return true;
    }


    function get_data_trnrp_head($frmno, $orgno, $cyear, $cyear2, $nrunno){
        $query = "SELECT A.*, C.FORM_NAME_TH, C.FORM_NAME_EN, B.SUBJECT,
            TO_CHAR(TO_DATE(B.DATE_FROM, 'YYYYMMDD'), 'DD/MM/YYYY') AS DATE_FROM,
            TO_CHAR(TO_DATE(B.DATE_TO, 'YYYYMMDD'), 'DD/MM/YYYY') AS DATE_TO,
            SUBSTR(B.TIME_FROM, 1, 2) || ':' || SUBSTR(B.TIME_FROM, 3, 2) AS TIME_FROM,
            SUBSTR(B.TIME_TO, 1, 2) || ':' || SUBSTR(B.TIME_TO, 3, 2) AS TIME_TO,
            B.PLACE, B.INSTITUTION, B.COST, B.COST_NOTE,
            E.SEMPNO, E.SNAME, E.STNAME, E.SPOSITION,E.SSEC, E.SDEPT, E.SDIV, E.SPOSCODE,
            B.NFRMNO AS REF_NFRMNO, B.VORGNO AS REF_VORGNO, B.CYEAR AS REF_CYEAR
            FROM GP_TRNRP_HEAD A
            INNER JOIN GP_TRN_HEAD B ON A.REF_CYEAR2 = B.CYEAR2 AND A.REF_NRUNNO = B.NRUNNO
            LEFT JOIN GP_TRN_FORM_MST C ON B.FID = C.FID
            LEFT JOIN GP_TRN_TRAINEE D ON B.CYEAR2 = D.CYEAR2 AND B.NRUNNO = D.NRUNNO
            LEFT JOIN AMECUSERALL E ON D.EMPNO = E.SEMPNO
            WHERE A.NFRMNO = '".$frmno."' AND A.VORGNO = '".$orgno."' AND A.CYEAR = '".$cyear."'
            AND A.CYEAR2 = '".$cyear2."' and A.NRUNNO = '".$nrunno."' ";
        return  $this->db->query($query)->result();
    }

    public function update_data_report($frmno, $orgno, $cyear, $cyear2, $nrunno, $type, $val1, $val2) {
        try {
            $this->db->where('NFRMNO', $frmno);
            $this->db->where('VORGNO', $orgno);
            $this->db->where('CYEAR', $cyear);
            $this->db->where('CYEAR2', $cyear2);
            $this->db->where('NRUNNO', $nrunno);
            if($type == 'req'){
                $this->db->set('CONTENT', $val1);
                $this->db->set('APPLY', $val2);
            }else if($type == 'manager'){
                $this->db->set('SCORE', $val1);
                $this->db->set('MANAGER_COMMENT', $val2);
            }

            $this->db->update('GP_TRNRP_HEAD');

            if ($this->db->affected_rows() > 0) {
                return ['status' => true, 'message' => ' Date updated successfully'];
            } else {
                return ['status' => false, 'message' => 'No record updated'];
            }
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    function get_data_clrtrn_head($frmno, $orgno, $cyear, $cyear2, $nrunno){
        $query = "SELECT A.*, C.FORM_NAME_TH, C.FORM_NAME_EN, B.SUBJECT,
            TO_CHAR(TO_DATE(B.DATE_FROM, 'YYYYMMDD'), 'DD/MM/YYYY') AS DATE_FROM,
            TO_CHAR(TO_DATE(B.DATE_TO, 'YYYYMMDD'), 'DD/MM/YYYY') AS DATE_TO,
            SUBSTR(B.TIME_FROM, 1, 2) || ':' || SUBSTR(B.TIME_FROM, 3, 2) AS TIME_FROM,
            SUBSTR(B.TIME_TO, 1, 2) || ':' || SUBSTR(B.TIME_TO, 3, 2) AS TIME_TO,
            B.PLACE, B.INSTITUTION, B.COST, B.COST_NOTE,
            E.SEMPNO, E.SNAME, E.STNAME, E.SPOSITION,E.SSEC, E.SDEPT, E.SDIV, E.SPOSCODE,
            B.NFRMNO AS REF_NFRMNO, B.VORGNO AS REF_VORGNO, B.CYEAR AS REF_CYEAR
            FROM GP_CLRTRN_HEAD A
            INNER JOIN GP_TRN_HEAD B ON A.REF_CYEAR2 = B.CYEAR2 AND A.REF_NRUNNO = B.NRUNNO
            LEFT JOIN GP_TRN_FORM_MST C ON B.FID = C.FID
            LEFT JOIN GP_TRN_TRAINEE D ON B.CYEAR2 = D.CYEAR2 AND B.NRUNNO = D.NRUNNO
            LEFT JOIN AMECUSERALL E ON D.EMPNO = E.SEMPNO
            WHERE A.NFRMNO = '".$frmno."' AND A.VORGNO = '".$orgno."' AND A.CYEAR = '".$cyear."'
            AND A.CYEAR2 = '".$cyear2."' and A.NRUNNO = '".$nrunno."' ";
        return  $this->db->query($query)->result();
    }

    function get_group_train($cyear2){
        $query = "SELECT MAX(SUBSTR(GROUP_TRAIN,4,4)) AS GP_TRAIN FROM GP_TRN_HEAD WHERE GROUP_TRAIN LIKE '".$cyear2."%'";
        return  $this->db->query($query)->result();
    }

    function get_data_group_train($where){
        $query = "SELECT DISTINCT 'GP-TRN' || SUBSTR(A.CYEAR2,3,2) || '-' || LPAD(A.NRUNNO, 6, '0') AS FORMNO, A.*,  E.SEMPNO, E.SNAME, E.STNAME, A.GROUP_TRAIN
        FROM GP_TRN_HEAD A
        INNER JOIN FORM B ON A.NFRMNO = B.NFRMNO AND A.VORGNO = B.VORGNO AND A.CYEAR = B.CYEAR AND A.CYEAR2 = B.CYEAR2 AND A.NRUNNO = B.NRUNNO
        INNER JOIN GP_TRN_TRAINEE D ON A.CYEAR2 = D.CYEAR2 AND A.NRUNNO = D.NRUNNO
        INNER JOIN AMECUSERALL E ON E.SEMPNO = D.EMPNO
        WHERE B.CST = '1' ".$where."
        ORDER BY A.CYEAR2, A.NRUNNO";
        return  $this->db->query($query)->result();
    }

    function get_data_group_train_view($where){
        $query = "SELECT DISTINCT 'GP-TRN' || SUBSTR(A.CYEAR2,3,2) || '-' || LPAD(A.NRUNNO, 6, '0') AS FORMNO, A.*,  E.SEMPNO, E.SNAME, E.STNAME, A.GROUP_TRAIN, C.CSTEPST , D.COST_PERSON
        FROM GP_TRN_HEAD A
        INNER JOIN FORM B ON A.NFRMNO = B.NFRMNO AND A.VORGNO = B.VORGNO AND A.CYEAR = B.CYEAR AND A.CYEAR2 = B.CYEAR2 AND A.NRUNNO = B.NRUNNO
        INNER JOIN FLOW C ON A.NFRMNO = C.NFRMNO AND A.VORGNO = C.VORGNO AND A.CYEAR = C.CYEAR AND A.CYEAR2 = C.CYEAR2 AND A.NRUNNO = C.NRUNNO AND CEXTDATA = '19'
        INNER JOIN GP_TRN_TRAINEE D ON A.CYEAR2 = D.CYEAR2 AND A.NRUNNO = D.NRUNNO
        INNER JOIN AMECUSERALL E ON E.SEMPNO = D.EMPNO
        WHERE B.CST = '1' ".$where."
        ORDER BY A.CYEAR2, A.NRUNNO";
        return  $this->db->query($query)->result();
    }

    function get_data_report($where){
        $query = "SELECT DISTINCT A.CYEAR2, A.NRUNNO, F.CID, F.CATEGORY,A.FID, C.FORM_NAME_TH, C.FORM_NAME_EN, A.SUBJECT, E.SEMPNO, E.SPOSITION,
            E.SSEC, E.SDEPT, E.SDIV, E.STNAME, A.DATE_FROM, A.DATE_TO, A.COST, ROUND(A.COST * 0.07) AS VAT,
            A.COST + ROUND(A.COST * 0.07) AS TOTAL, FM.CST,
            CASE 
                WHEN A.REF_CASH_NRUNNO IS NULL OR TO_CHAR(A.REF_CASH_NRUNNO) = '' THEN '-'
	            ELSE 'FIN-AV' || SUBSTR(A.REF_CASH_CYEAR2,3,2) || '-' || LPAD(A.REF_CASH_NRUNNO, 6, '0') 
	        END AS CASH_FORMNO,
	        CASE 
	           WHEN A.REF_CLR_NRUNNO IS NULL OR TO_CHAR(A.REF_CLR_NRUNNO) = '' THEN '-'
	           ELSE 'FIN-CL' || SUBSTR(A.REF_CLR_CYEAR2,3,2) || '-' || LPAD(A.REF_CLR_NRUNNO, 6, '0') 
	        END AS CLR_FORMNO
            FROM GP_TRN_HEAD A
            INNER JOIN GP_TRN_LIST B ON A.CYEAR2 = B.CYEAR2 AND A.NRUNNO = B.NRUNNO
            INNER JOIN FORM FM ON A.NFRMNO = FM.NFRMNO AND A.VORGNO = FM.VORGNO AND A.CYEAR = FM.CYEAR AND A.CYEAR2 = FM.CYEAR2 AND A.NRUNNO = FM.NRUNNO
            LEFT JOIN GP_TRN_FORM_MST C ON A.FID = C.FID
            LEFT JOIN GP_TRN_TRAINEE D ON A.NFRMNO = D.NFRMNO AND A.VORGNO = D.VORGNO AND A.CYEAR = D.CYEAR AND A.CYEAR2 = D.CYEAR2 AND A.NRUNNO = D.NRUNNO
            LEFT JOIN AMECUSERALL E ON D.EMPNO = E.SEMPNO
            INNER JOIN GP_TRN_CATEGORY_MST F ON F.CID = C.CID
            WHERE A.FID IS NOT NULL ".$where."
            ORDER BY A.CYEAR2, A.NRUNNO";
        return  $this->db->query($query)->result();
    }

    function get_3month_train_report($frmno, $orgno, $cyear){
        $query = "SELECT * FROM FLOW
            WHERE NFRMNO = ".$frmno." AND VORGNO = '".$orgno."' AND CYEAR = '".$cyear."' 
            AND CEXTDATA = '01' AND TO_CHAR(ADD_MONTHS(DAPVDATE, 3),'MM/DD/YYYY') = TO_CHAR(SYSDATE, 'MM/DD/YYYY')
            ORDER BY CYEAR2, NRUNNO
        ";
        return  $this->db->query($query)->result();
    }

    function get_3month_train_report_for_test($frmno, $orgno, $cyear, $cyear2, $nrunno){
        $query = "SELECT * FROM FLOW
            WHERE NFRMNO = ".$frmno." AND VORGNO = '".$orgno."' AND CYEAR = '".$cyear."' AND CYEAR2 = '".$cyear2."'
            AND NRUNNO = '".$nrunno."' AND CEXTDATA = '01'";
        return  $this->db->query($query)->result();
    }

    function get_traing_record(){
        $query = "SELECT NVL(MAX(nrunno), 0) + 1 AS NEXT_RUNNO FROM TRAINHEADREC WHERE cyear = '".date("y")."'";
        return  $this->training_db->query($query)->result();
    }

     public function insert_trainsys($table, $data) {
        $this->training_db->set('CYEAR', $data['CYEAR']);
        $this->training_db->set('NRUNNO', $data['NRUNNO']);
        if($table == 'TRAINHEADREC'){
            $this->training_db->set('DID', $data['DID']);
            $this->training_db->set('SUBJECT', $data['SUBJECT']);
            $this->training_db->set('PLCID', $data['PLCID']);
            $this->training_db->set('CODEID', $data['CODEID']);
            $this->training_db->set('COST', $data['COST']);
            $this->training_db->set('VAT', $data['VAT']);
        }else if($table == 'TRAINSCHEDULE'){
            $this->training_db->set('STARTTIME', $data['STARTTIME']);
            $this->training_db->set('ENDTIME', $data['ENDTIME']);
            $this->training_db->set('FRMDATE', "TO_DATE('{$data['FRMDATE']}', 'YYYY-MM-DD')", false);
            $this->training_db->set('ENDDATE', "TO_DATE('{$data['ENDDATE']}', 'YYYY-MM-DD')", false);
        }else if($table == 'DETAILINSRUCTOR'){
            $this->training_db->set('INSID', $data['INSID']);
            $this->training_db->set('FRMDATE', "TO_DATE('{$data['FRMDATE']}', 'YYYY-MM-DD')", false);
        }else if($table == 'TRAINEEREC'){
            $this->training_db->set('SEMPNO', $data['SEMPNO']);
            $this->training_db->set('CSTATUS', $data['CSTATUS']);
            $this->training_db->set('ADD_DATE', "TO_DATE('{$data['ADD_DATE']}', 'YYYY-MM-DD')", false);
        }

        $this->training_db->insert($table);
        return true;
     }

}