<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Cler_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function get_entertain_formAll($nfrmno, $vorgno, $cyear)
    {
        $this->db->select('f.*')
            ->from('FORM f')
            ->join('GPENT_FORM gf', 'f.NFRMNO = gf.NFRMNO AND f.VORGNO = gf.VORGNO AND f.CYEAR = gf.CYEAR AND f.CYEAR2 = gf.CYEAR2 AND f.NRUNNO = gf.NRUNNO','left')
            ->where('f.NFRMNO', $nfrmno)
            ->where('f.VORGNO', $vorgno)
            ->where('f.CYEAR', $cyear)
            ->where('f.CST !=', 3)
            ->where('gf.STATUS', '1')
            ->order_by('f.NRUNNO', 'ASC');

        return $this->db->get()->result();

    }

    public function get_entertain_form($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
            ->select('*')
            ->from('GPENT_FORM')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        return $this->db->get()->result();
    }

    public function get_clearance_form($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
            ->select('*')
            ->from('GPCLER_FORM')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        return $this->db->get()->result();
    }

    public function get_expense($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
            ->select('*')
            ->from('GPCLER_EXPENSE')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        return $this->db->get()->result();
    }

    public function getFormMst($VANAME)
    {
        $this->db
            ->select('*')
            ->from('FORMMST')
            ->where('VANAME', $VANAME);
        return $this->db->get()->result();
    }

    public function insert($table, $data)
    {
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
        $this->db->where($where);
        $this->db->delete($table);
    }
}