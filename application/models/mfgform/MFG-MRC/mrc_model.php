<?php

class Mrc_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        // Load database if not autoloaded
        $this->load->database();
        $this->wk = $this->load->database('workload', TRUE);
    }

    public function getGroupData()
    {
        $this->wk->select('*')
            ->from('CRIMPHEIGHT_SHOP_MST');
        $query = $this->wk->get();
        return $query->result();
    }

    public function get_data($shop, $monthyear)
    {
        $sql = "SELECT * FROM CRIMPHEIGHT_RECORD cr WHERE SHOP = '$shop' AND TO_CHAR(CREATED_AT, 'MMYYYY') = '$monthyear'";
        // Print the query for debugging
        $query = $this->wk->query($sql);
        return $query->result();
    }

    public function select($table, $where = [])
    {
        $this->db->select('*')
            ->from($table)
            ->where($where);
        // Print the last query for debugging
        $query = $this->db->get();
        return $query->result();
    }

    public function insert($table, $data)
    {
        return $this->db->insert($table, $data);
    }

    // Example: Get all MRC records

}