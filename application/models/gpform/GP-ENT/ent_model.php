<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ent_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->load->database();

    }

    public function get_guest_type()
    {
        $this->db
            ->select('*')
            ->from('GPENT_GUEST_TYPE')
            ->where('STATUS', '1')
            ->order_by('SEQ', 'asc');
        return $this->db->get()->result();
    }

    public function get_estimate_type()
    {
        $this->db
            ->select('*')
            ->from('GPENT_ESTIMATE_TYPE')
            ->where('ET_STATUS', '1');
        return $this->db->get()->result();
    }

    public function getDataEmp($empcode)
    {
        $this->db
            ->select('*')
            ->from('AMECUSERALL')
            ->WHERE('SEMPNO', $empcode)
            ->where('CSTATUS', '1');
        return $this->db->get()->result();
    }

    public function dataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
            ->select('*')
            ->from('GPENT_FORM')
            ->join('GPENT_GUEST_TYPE', 'GUEST_TYPE = GT_ID', 'left')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        return $this->db->get()->result();
    }

    public function dataCompany($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
            ->select('*')
            ->from('GPENT_COMPANY')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        return $this->db->get()->result();
    }

    public function dataParticipants($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
            ->select('*')
            ->from('GPENT_PARTICIPANTS')
            ->join('AMECUSERALL', 'EMP_CODE = SEMPNO', 'left')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        return $this->db->get()->result();
    }

    public function getamecParticipants($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
            ->select('*')
            ->from('GPENT_PARTICIPANTS')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno)
            ->where('TYPE', 'amec');
        return $this->db->get()->result();
    }

    public function get_estimate_cost($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
            ->select('*')
            ->from('GPENT_ESTIMATE')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        return $this->db->get()->result();
    }

    public function get_orgpos($vorgno, $vposno)
    {
        $this->db
            ->select('*')
            ->from('ORGPOS')
            ->where('VORGNO', $vorgno)
            ->where('VPOSNO', $vposno);
        return $this->db->get()->result();
    }

    public function insert($table, $data, $dateFields = [])
    {
        foreach ($dateFields as $key => $value) {
            $this->db->set($key, $value, false); // <-- ไม่ escape
        }
        $this->db->insert($table, $data);
    }

    public function update($table, $data, $where, $dateFields = [])
    {
        $this->db->where($where);
        foreach ($dateFields as $key => $value) {
            $this->db->set($key, $value, false); // <-- ไม่ escape
        }
        $this->db->update($table, $data);
    }

    public function delete($table, $where)
    {
        $this->db->delete($table, $where);
    }

    public function getGPENTForm()
    {
        $this->db
            ->select('*')
            ->from('GPENT_FORM et')
            ->join('FORM', 'et.NFRMNO = FORM.NFRMNO AND et.VORGNO = FORM.VORGNO AND et.CYEAR = FORM.CYEAR AND et.CYEAR2 = FORM.CYEAR2 AND et.NRUNNO = FORM.NRUNNO')
            ->where('ENTERTAINMENT_DATE < TO_DATE(SYSDATE)', null, false);
        return $this->db->get()->result();
    }

    public function select($table, $where)
    {
        $this->db
            ->select('*')
            ->from($table)
            ->where($where);
        return $this->db->get()->result();
    }

    /**
     *
     * @param array $where An associative array of conditions to filter the query.
     * Example:
     * $where = [
     *     'NFRMNO' => $ent[0]->NFRMNO,
     *     'VORGNO' => $ent[0]->VORGNO,
     *     'CYEAR'  => $ent[0]->CYEAR,
     *     'CYEAR2' => $ent[0]->CYEAR2,
     *     'NRUNNO' => $ent[0]->NRUNNO,
     * ];
     */
    public function getFlow($where)
    {
        $this->db
            ->select('*')
            ->from('FLOW')
            ->where($where)
            ->group_start()
            ->where('CSTEPNO', '18')
            ->or_where('CSTEPNO', '01')
            ->group_end();
        return $this->db->get()->result();
    }

    /**
     * @param mixed $FrmNo
     * $where = [
     *     'NFRMNO' => $ent[0]->NFRMNO,
     *     'VORGNO' => $ent[0]->VORGNO,
     *     'CYEAR'  => $ent[0]->CYEAR,
     *     'CYEAR2' => $ent[0]->CYEAR2,
     *     'NRUNNO' => $ent[0]->NRUNNO,
     * ];
     */
    public function getFlowStep($FrmNo, $apv)
    {
        $this->db
            ->select('*')
            ->from('FLOW')
            ->where($FrmNo)
            ->group_start()
            ->where('VAPVNO', $apv)
            ->or_where('VREPNO', $apv)
            ->group_end();
        // ->where('CSTEPNO', $cstepno)
        // ->where('CSTEPNEXTNO', $cstepnextno);
        return $this->db->get()->result();
    }

    public function test_array()
    {
        $sql = "SELECT D.NFRMNO,D.VORGNO,D.CYEAR,D.CYEAR2,D.NRUNNO,D.PAYDATE,D.SEMPNO,D.SNAME,D.PURPOSE,D.SSEC,D.TOTAL_AMOUNT,gcf.NFRMNO CNFRMNO,gcf.VORGNO CVORGNO,gcf.CYEAR CCYEAR,gcf.CYEAR2 CCYEAR2,gcf.NRUNNO CNRUNNO,gcf.ACTUAL_COST,D.CST
            FROM (SELECT gf.*,f.CST,a.*,fm.VANAME||SUBSTR(f.CYEAR2,-2)||'-'||LPAD(f.NRUNNO,6,'0') REFNO
                  FROM GPENT_FORM gf
                  JOIN FORM f ON gf.NFRMNO=f.NFRMNO AND gf.VORGNO=f.VORGNO AND gf.CYEAR=f.CYEAR AND gf.CYEAR2=f.CYEAR2 AND gf.NRUNNO=f.NRUNNO
                  JOIN AMECUSERALL a ON f.VREQNO=a.SEMPNO
                  JOIN FORMMST fm ON f.NFRMNO=fm.NNO AND f.VORGNO=fm.VORGNO AND f.CYEAR=fm.CYEAR
                  WHERE f.DREQDATE>=TO_DATE('2025-06-16','yyyy-mm-dd') AND REIMBURSEMENT='1'
            ) D
            LEFT JOIN GPCLER_FORM gcf ON gcf.FORM_ENT=D.REFNO";
        return $this->db->query($sql)->result();
    }
    public function get_Section()
    {
        // SELECT *
        // FROM amec.psection
        // WHERE ssec NOT LIKE '%Cancel%'
        // AND ssec NOT LIKE '%CANCEL%'
        // order by ssec

        $this->db->select('*');
        $this->db->from('AMEC.PSECTION');
        $this->db->where('SSEC NOT LIKE', '%Cancel%');
        $this->db->where('SSEC NOT LIKE', '%CANCEL%');
        $this->db->order_by('SSEC', 'ASC');
        return $this->db->get()->result();
    }

    public function get_Department()
    {
        //select * from amec.pdepartment where sdept not like '%Cancel% order by sdept'
        $this->db->select('*');
        $this->db->from('AMEC.PDEPARTMENT');
        $this->db->where('SDEPT NOT LIKE', '%Cancel%');
        $this->db->where('SDEPT NOT LIKE', '%CANCEL%');
        $this->db->order_by('SDEPT', 'ASC');

        return $this->db->get()->result();
    }

    public function get_Division()
    {
        // select * from amec.pdivision
        $this->db->select('*');
        $this->db->from('AMEC.PDIVISION');
        $this->db->where('SDIV NOT LIKE', '%Cancel%');
        $this->db->where('SDIV NOT LIKE', '%CANCEL%');
        $this->db->order_by('SDIV', 'ASC');
        return $this->db->get()->result();
    }

    public function get_report_ent($filters = [])
    {
        $this->db->select('*');
        $this->db->from('GPENT_FORM gf');
        $this->db->join('AMECUSERALL a', 'gf.EMP_REQ = a.SEMPNO', 'left');
        $this->db->join('GPENT_GUEST_TYPE gt', 'gf.GUEST_TYPE = gt.GT_ID', 'left');
        $this->db->join('FORM f', 'gf.NFRMNO = f.NFRMNO AND gf.VORGNO = f.VORGNO AND gf.CYEAR = f.CYEAR AND gf.CYEAR2 = f.CYEAR2 AND gf.NRUNNO = f.NRUNNO', 'left');

        // EmpCode
        if (!empty($filters['SEMPNO'])) {
            $this->db->where('a.SEMPNO', $filters['SEMPNO']);
        }

        // Section
        if (!empty($filters['SSECCODE'])) {
            $this->db->where('a.SSECCODE', $filters['SSECCODE']);
        }

        // Department
        if (!empty($filters['SDEPCODE'])) {
            $this->db->where('a.SDEPCODE', $filters['SDEPCODE']);
        }

        // Division
        if (!empty($filters['SDIVCODE'])) {
            $this->db->where('a.SDIVCODE', $filters['SDIVCODE']);
        }

        // Start Date (TO_DATE) - FIXED
        if (!empty($filters['start_date'])) {
            $this->db->where(
                "ENTERTAINMENT_DATE >= TO_DATE('" . $filters['start_date'] . "', 'YYYY-MM-DD')",
                null,
                false
            );
        }

        // End Date (TO_DATE) - FIXED
        if (!empty($filters['end_date'])) {
            $this->db->where(
                "ENTERTAINMENT_DATE <= TO_DATE('" . $filters['end_date'] . "', 'YYYY-MM-DD')",
                null,
                false
            );
        }

        $this->db->order_by('ENTERTAINMENT_DATE', 'asc');
        $query = $this->db->get();
        return $query->result();
    }

    public function get_report_cler($filters = [])
    {
        $this->db->select('gf.*, a.*, f.*');
        $this->db->from('GPCLER_FORM gf');
        $this->db->join('AMECUSERALL a', 'gf.EMP_REQ = a.SEMPNO', 'left');
        $this->db->join('FORM f', 'gf.NFRMNO = f.NFRMNO AND gf.VORGNO = f.VORGNO AND gf.CYEAR = f.CYEAR AND gf.CYEAR2 = f.CYEAR2 AND gf.NRUNNO = f.NRUNNO', 'left');


        // EmpCode
        if (!empty($filters['SEMPNO'])) {
            $this->db->where('a.SEMPNO', $filters['SEMPNO']);
        }

        // Section
        if (!empty($filters['SSECCODE'])) {
            $this->db->where('a.SSECCODE', $filters['SSECCODE']);
        }

        // Department
        if (!empty($filters['SDEPCODE'])) {
            $this->db->where('a.SDEPCODE', $filters['SDEPCODE']);
        }

        // Division
        if (!empty($filters['SDIVCODE'])) {
            $this->db->where('a.SDIVCODE', $filters['SDIVCODE']);
        }

        // Start Date (TO_DATE) - FIXED
        if (!empty($filters['start_date'])) {
            $this->db->where(
                "DREQDATE >= TO_DATE('" . $filters['start_date'] . "', 'YYYY-MM-DD')",
                null,
                false
            );
        }

        // End Date (TO_DATE) - FIXED
        if (!empty($filters['end_date'])) {
            $this->db->where(
                "DREQDATE <= TO_DATE('" . $filters['end_date'] . "', 'YYYY-MM-DD')",
                null,
                false
            );
        }

        $this->db->order_by('DREQDATE', 'asc');
        $query = $this->db->get();
        return $query->result();
    }

    public function UpdateRep($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $RepApv)
    {
        $this->db->where('NFRMNO', $nfrmno);
        $this->db->where('VORGNO', $vorgno);
        $this->db->where('CYEAR', $cyear);
        $this->db->where('CYEAR2', $cyear2);
        $this->db->where('NRUNNO', $nrunno);
        $this->db->where('CSTEPNO', '--');
        $this->db->update('FLOW', ['VREPNO' => $RepApv]);
    }

    // public function getForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    // {
    //     $this->db->select('*')
    //         ->from('FORM')
    //         ->where('NFRMNO', $nfrmno)
    //         ->where('VORGNO', $vorgno)
    //         ->where('CYEAR', $cyear)
    //         ->where('CYEAR2', $cyear2)
    //         ->where('NRUNNO', $nrunno);
    //     return $this->db->get()->result();
    // }


}