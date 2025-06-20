<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Specialauth_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        // Load database
        $this->load->database();
        $this->ad = $this->load->database('auditDB', true);
    }

    public function insert($table, $data, $rawFields = [])
    {
        $this->db->set($data);
        foreach ($rawFields as $key => $value) {
            $this->db->set($key, $value, false); // <-- ไม่ escape
        }
        $this->db->insert($table);
    }

    public function update($table, $data, $where)
    {
        $this->db->set($data);
        $this->db->where($where);
        $this->db->update($table);
    }

    public function update_audit($table, $data, $where)
    {
        $this->ad->set($data);
        $this->ad->where($where);
        $this->ad->update($table);
    }

    public function getSpecialAuth($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO)
    {
        $this->db->select('*');
        $this->db->from('ISSPC_FORM');
        $this->db->where('NFRMNO', $NFRMNO);
        $this->db->where('VORGNO', $VORGNO);
        $this->db->where('CYEAR', $CYEAR);
        $this->db->where('CYEAR2', $CYEAR2);
        $this->db->where('NRUNNO', $NRUNNO);
        return $this->db->get()->result_array();
    }

    public function insertAudit($data)
    {
        $this->ad->set($data);
        $this->ad->insert('ITGC_SPECIALUSER');
    }

    public function getUser($servername)
    {
        $this->ad->select('*');
        $this->ad->from('ITGC_SPECIALUSER');
        $this->ad->where('SERVER_NAME', $servername);
        $this->ad->where('ACTIVE_STATUS', '1');

        return $this->ad->get()->result();
    }

    public function getDataEmp($empno)
    {
        $this->db->select('*');
        $this->db->from('AMECUSERALL');
        $this->db->where('SEMPNO', $empno);
        return $this->db->get()->row();
    }
}
