<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Trouble_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function get_category()
    {
        $this->db->select('c.CATEGORY_ID, c.CATEGORY_NAME, t.TYPE_ID, t.TYPE_NAME');
        $this->db->from('ISTRB_CATEGORY c');
        $this->db->join('ISTRB_TYPE t', 'c.CATEGORY_ID = t.CATEGORY_ID', 'left');
        $this->db->order_by('c.CATEGORY_ID');
        $this->db->order_by('t.TYPE_ID');

        $query = $this->db->get();
        return $query->result();
    }

    public function insert($table, $data, $dateFields = [])
    {
        foreach ($dateFields as $key => $value) {
            $this->db->set($key, $value, false); // <-- ไม่ escape
        }
        $this->db->insert($table, $data);
    }

    public function get_user($q = null)
    {
        $this->db->select('*');
        $this->db->from('AMECUSERALL');
        $this->db->where('CSTATUS', '1');
        $this->db->where('SEMPPRT IS NOT NULL');
        if ($q) {
            $this->db->where($q);
        }
        return $this->db->get()->result();

    }

    public function get_request($nrunno, $cyear2)
    {
        $this->db->select('*');
        $this->db->from('ISTRB_FORM');
        $this->db->where('NRUNNO', $nrunno);
        $this->db->where('CYEAR2', $cyear2);
        $query = $this->db->get();
        return $query->result();
    }

    public function get_emp($nrunno, $cyear2)
    {
        $this->db->select('*');
        $this->db->from('ISTRB_EMP i');
        $this->db->join('AMECUSERALL a','i.EMPNO = a.SEMPNO');
        $this->db->where('NRUNNO', $nrunno);
        $this->db->where('CYEAR2', $cyear2);
        $query = $this->db->get();
        return $query->result();
    }

    public function get_trouble($nrunno, $cyear2)
    {
        $this->db->select('*');
        $this->db->from('ISTRB_REPORT_TYPE irt');
        $this->db->join('ISTRB_TYPE it', 'irt.TYPE_ID = it.TYPE_ID');
        $this->db->where('NRUNNO', $nrunno);
        $this->db->where('CYEAR2', $cyear2);
        $query = $this->db->get();
        return $query->result();
    }

}