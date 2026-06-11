<?php
defined('BASEPATH') or exit('No direct script access allowed');

class psci_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->sk = $this->load->database('SKID', TRUE);

    }

    public function getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        //LEFT JOIN K13098KP k ON pf.CODE_ITEM = k.CODE
        // $this->db->select('*')
        //     ->from('PSCI_FORM')
        //     ->where('NFRMNO', $nfrmno)
        //     ->where('VORGNO', $vorgno)
        //     ->where('CYEAR', $cyear)
        //     ->where('CYEAR2', $cyear2)
        //     ->where('NRUNNO', $nrunno);
        // $query = $this->db->get();
        $sql   = "SELECT p.*,icr.*,ii.*,ii.ZONE || '-' || SUBSTR(ii.USER_TNAME , 1, INSTR(ii.USER_TNAME || ' ', ' ') - 1) AS STNAME,a.STNAME AS LEADER_NAME FROM PSCI_FORM p 
                LEFT JOIN SKIDCNTRL.INV_CHECK_RESULT icr ON p.ASSIGN_ID = icr.ASSIGN_ID
                LEFT JOIN SKIDCNTRL.IMM_ITEMMST ii ON icr.ITEM_CODE = ii.IPROD
                LEFT JOIN AMECUSERALL a ON icr.LEADER_ID = a.SEMPNO
                WHERE NFRMNO = '$nfrmno' AND VORGNO = '$vorgno' AND CYEAR = '$cyear' AND CYEAR2 = '$cyear2' AND nrunno = '$nrunno'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function getListItem($assignId)
    {
        $this->sk->select('i.IBUYC, i.IPROD, i.IDESC, i.IDRAW, i.IABBT, icr.CONTROLLER_ID, icr.RANDOM_CHECK, a.STNAME, icr.ON_HAND, i.IUMS, icr.ACTUAL_QTY, icr.DIFF, icr.REMARK')
            ->from('INV_CHECK_RESULT icr')
            ->join('IIM i', 'i.IPROD = icr.ITEM_CODE', 'left')
            ->join('AMECUSERALL a', 'a.SEMPNO = icr.CONTROLLER_ID', 'left')
            ->where('icr.ASSIGN_ID', $assignId)
            ->where('icr.CHECKER_ROLE', 'CONTROLLER')
            ->order_by('icr.CONTROLLER_ID', 'ASC')
            ->order_by('i.IPROD', 'ASC');
        $query = $this->sk->get();
        return $query->result();
    }

    public function getLogEdit($assignId)
    {
        // return $this->sk
        //     ->select("icl.*,TO_CHAR(icl.EDIT_AT, 'YYYY-MM-DD HH24:MI:SS') AS EDIT_AT")
        //     ->from('INV_CHECK_LOG icl')
        //     ->where('icl.ASSIGN_ID', $assignId)
        //     ->order_by('icl.EDIT_AT', 'DESC')
        //     ->get()
        //     ->result();

        $sql = "SELECT icl.*, TO_CHAR(icl.EDIT_AT, 'YYYY-MM-DD HH24:MI:SS') AS EDIT_AT FROM INV_CHECK_LOG icl WHERE ASSIGN_ID = '$assignId' ORDER BY icl.EDIT_AT DESC";
        $query = $this->sk->query($sql);
        return $query->result();
    }

    public function insertLogEdit($data)
    {
        $this->sk->insert('INV_CHECK_LOG', $data);
    }
}