<?php
defined('BASEPATH') or exit('No direct script access allowed');

class psci_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->sk = $this->load->database('skid', TRUE);

    }

    public function getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        //LEFT JOIN K13098KP k ON pf.CODE_ITEM = k.CODE
        $this->db->select('*')
            ->from('PSCI_FORM')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        $query = $this->db->get();
        return $query->result();
    }

    public function getListItem($assignId)
    {
        $this->sk->select('i.IBUYC, i.IPROD, i.IDESC, i.IDRAW, i.IABBT, icr.CONTROLLER_ID, a.STNAME, icr.ON_HAND, i.IUMS, icr.ACTUAL_QTY, icr.DIFF, icr.REMARK')
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
}