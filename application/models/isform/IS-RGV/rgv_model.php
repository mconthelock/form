<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Rgv_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->ad  = $this->load->database('auditDB', TRUE);
        $this->doc = $this->load->database('docinv', TRUE);
        $this->scm = $this->load->database('scm', TRUE);
    }

    public function invoice_user()
    {
        $this->ad
            ->select('*')
            ->from('invoice..v_user_permission2')
            ->where('user_state', 'A')
            ->order_by('sect_id', 'ASC');
        return $this->ad->get()->result();
    }

    public function marketing_user()
    {
        $this->ad
            ->select('*')
            ->from('mkt..v_usergroup')
            ->where('user_state', 'A')
            ->order_by('group_id', 'ASC');
        return $this->ad->get()->result();
    }

    public function procurement_user()
    {
        $this->doc
            ->select('*')
            ->from('AUTHORIZE_INVENTORY')
            ->order_by('SDIV', 'ASC');
        return $this->doc->get()->result();
    }

    public function scm_user()
    {
        $this->scm
            ->select('*')
            ->from('AUTHORIZE_INVENTORY')
            ->where('USR_STATUS', 'Enable')
            ->where_not_in('EMPNO', ['viewer1'])
            ->order_by('GRP_NAME', 'ASC');
        return $this->scm->get()->result();
    }

    public function as400_user()
    {
        $this->ad
            ->select('*')
            ->from('ITGC_SPECIALUSER')
            ->where('USER_TYPE2', 'Human')
            ->where('CATEGORY', 'APP')
            ->where('SERVER_NAME', 'AS400');
        return $this->ad->get()->result();
    }

    public function get_data_user($program)
    {
        // $this->db
        //     ->select('*')
        //     ->from('AMECUSERALL')
        //     ->where('SEMPNO', $empno);
        // return $this->db->get()->result();

        $this->db
            ->select('*')
            ->from('ISRGV_MEMBER A')
            ->join('ISRGV_INCHARGE B', '(B.ORG_TYPE = 1 AND A.SSECTYPE = B.ORG_CODE) OR (B.ORG_TYPE = 2 AND A.SDEPTTYPE = B.ORG_CODE)')
            ->where('PROGRAM', $program)
            ->where('CSTATUS', '1')
            // ->where('PIC', '14198')
            ->order_by('1');
        return $this->db->get()->result();
    }

    public function getOwner($owner_code)
    {
        $code = explode('/', $owner_code);
        // print_r($code);
        $this->doc
            ->select('*')
            ->from('PROGRAM_MSTLST')
            ->where('DIVCODE', $code[0])
            ->where('PROTID', $code[1])
            ->where('PROMID', $code[2]);
        return $this->doc->get()->result();
    }

    public function getForm($no, $orgNo, $y, $y2, $runno)
    {
        $this->db
            ->select('*')
            ->from('ISRGV_FORM')
            ->where('NFRMNO', $no)
            ->where('VORGNO', $orgNo)
            ->where('CYEAR', $y)
            ->where('CYEAR2', $y2)
            ->where('NRUNNO', $runno);
        return $this->db->get()->result();
    }

    public function getEmpForm($y2, $runno)
    {
        $this->db
            ->select('*')
            ->from('ISRGV_EMP')
            ->where('CYEAR2', $y2)
            ->where('NRUNNO', $runno);
        return $this->db->get()->result_array();
    }



    public function insert($table, $data)
    {
        return $this->db->insert($table, $data);
    }

    public function update($table, $data, $where)
    {
        
        $this->db->update($table, $data, $where);
        echo $this->db->last_query();
    }

    public function getIncharge($program)
    {
        // $this->db
        //     ->select('*')
        //     ->from('ISRGV_INCHARGE');
        // $this->doc->join('PROGRAM_MSTLST', "PROGRAM_CODE = DIVCODE||'/'||PROTID||'/'||PROMID")
        //     ->where('PROGRAM', $program)
        //     ->order_by('1');

        $sql = "
            SELECT A.*, B.DATAOWNER
            FROM ISRGV_INCHARGE A
            JOIN PROGRAM_MSTLST@DOCINV B
            ON A.PROGRAM_CODE = TO_CHAR(B.DIVCODE) || '/' || TO_CHAR(B.PROTID) || '/' || TO_CHAR(B.PROMID)
            WHERE A.PROGRAM = '$program'
        ";
        return $this->db->query($sql)->result();
    }

    public function getUserIncharge()
    {
        $this->db
            ->select('o.PROGRAM, o.ORG_TYPE, o.ORG_CODE, COALESCE(SDEPT, SDIV) AS ORG_NAME, o.PIC')
            ->from('ISRGV_INCHARGE o')
            ->join('AMEC.PDEPARTMENT d', 'o.ORG_CODE = d.SDEPCODE', 'left')
            ->join('AMEC.PDIVISION v', 'o.ORG_CODE = v.SDIVCODE', 'left')
            // ->where('o.PROGRAM', 'Invoice')
            ->order_by('o.ORG_TYPE, o.ORG_CODE, o.PIC');
        return $this->db->get()->result();
    }

    public function getProgram()
    {
        $this->db
            ->distinct()
            ->select('PROGRAM')
            ->from('ISRGV_INCHARGE')
            ->order_by('PROGRAM');
        return $this->db->get()->result();
    }

    public function getMember($q = null)
    {
        $this->db
            ->select('*')
            ->from('ISRGV_MEMBER')
            ->where('CSTATUS', '1');

        if (!empty($q)) {
            $this->db->where($q);
        }
        return $this->db->get()->result();
    }

    public function getMainApv($vorgno)
    {
        $this->db
            ->select('*')
            ->from('SEQUENCEORG')
            ->where('VORGNO', $vorgno)
            ->where('SPOSCODE', '10');
        return $this->db->get()->result();

    }




}