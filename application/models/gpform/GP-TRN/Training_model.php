<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Training_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function get_empinfo($empno) {
        $sql = "SELECT * FROM AMEC.AMECUSERALL WHERE SEMPNO = '".$empno."'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function getSect() {
        $sql = "SELECT SSECCODE, SSEC  FROM AMEC.PSECTION  WHERE UPPER(SSEC) NOT LIKE '%CANCEL%'  AND SSECCODE <> '00' ORDER BY SSEC";
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

    public function insert_data($table, $data) {
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
/*
    function get_main_data($frmno, $orgno, $cyear, $cyear2, $nrunno){
        $query = "SELECT A.*, C.SEMPNO AS REQ_EMPNO, C.SNAME AS REQ_NAME, D.SEMPNO AS INP_EMPNO, D.SNAME AS INP_NAME,
            E.SEMPNO AS TRAINEE_EMPNO, E.SNAME AS TRAINEE_NAME, E.SSEC AS TRAINEE_SEC, E.SDEPT AS TRAINEE_DEPT, E.SDIV AS TRAINEE_DIV,
            E.SPOSITION AS TRAINEE_POS, F.FORM_NAME_TH,F.FORM_NAME_EN
            FROM GP_TRN_HEAD A 
            INNER JOIN FORM B ON A.NFRMNO = B.NFRMNO AND A.VORGNO = B.VORGNO AND A.CYEAR = B.CYEAR AND A.CYEAR2 = B.CYEAR2 AND A.NRUNNO = B.NRUNNO
            LEFT JOIN GP_TRN_TRAINEE TB ON A.NFRMNO = TB.NFRMNO AND A.VORGNO = TB.VORGNO AND A.CYEAR = TB.CYEAR AND A.CYEAR2 = TB.CYEAR2 AND A.NRUNNO = TB.NRUNNO
            LEFT JOIN AMEC.AMECUSERALL C ON B.VREQNO = C.SEMPNO
            LEFT JOIN AMEC.AMECUSERALL D ON B.VINPUTER = D.SEMPNO
            LEFT JOIN AMEC.AMECUSERALL E ON A.TRAINEE_ID = E.SEMPNO
            INNER JOIN GP_TRN_FORM_MST F ON A.FID = F.FID
            WHERE A.NFRMNO = '".$frmno."' AND A.VORGNO = '".$orgno."' AND A.CYEAR = '".$cyear."' 
            AND A.CYEAR2 = '".$cyear2."' and A.NRUNNO = '".$nrunno."'";
        return  $this->db->query($query)->result();
    }
*/

    
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
            E.SEMPNO AS TRAINEE_EMPNO, E.SNAME AS TRAINEE_NAME, E.SSEC AS TRAINEE_SEC, E.SDEPT AS TRAINEE_DEPT, 
            E.SDIV AS TRAINEE_DIV, E.SPOSITION AS TRAINEE_POS
            FROM GP_TRN_TRAINEE A 
            LEFT JOIN AMEC.AMECUSERALL E ON A.EMPNO = E.SEMPNO
            WHERE A.NFRMNO = '".$frmno."' AND A.VORGNO = '".$orgno."' AND A.CYEAR = '".$cyear."' 
            AND A.CYEAR2 = '".$cyear2."' and A.NRUNNO = '".$nrunno."'";
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
        $this->db->where($where_col,$where_val);
        $this->db->update('FLOW');
        return true;
    }

    function delete_flow($nfrmno,$vorgno,$cyear,$cyear2,$runno, $where_col, $where_val){
        $this->db->where('NFRMNO', $nfrmno);
        $this->db->where('VORGNO', $vorgno);
        $this->db->where('CYEAR', $cyear);
        $this->db->where('CYEAR2', $cyear2);
        $this->db->where('NRUNNO', $runno);
        $this->db->where($where_col, $where_val);
        $this->db->delete('FLOW');
        return true;
    }
}