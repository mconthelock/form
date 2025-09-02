<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Sar_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();

    }

    public function getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        //LEFT JOIN K13098KP k ON pf.CODE_ITEM = k.CODE
        $this->db->select('*')
            ->from('PSSAR_FORM')
            ->join('K13098KP k', 'PSSAR_FORM.CODE_ITEM = k.CODE', 'left')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        $query = $this->db->get();
        return $query->result();
    }
}