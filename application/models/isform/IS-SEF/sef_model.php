<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Sef_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function getCriteria()
    {
        $this->db->select('*');
        $this->db->from('ISEVA_CRITERIA');
        $query = $this->db->get();
        return $query->result();
    }

    public function select($table, $where = [])
    {
        $this->db->select('*');
        $this->db->from($table);
        if (!empty($where)) {
            $this->db->where($where);
        }
        $query = $this->db->get();
        return $query->result();
    }

    public function insert($table, $data)
    {
        $this->db->insert($table, $data);
    }

    public function insertBatch($table, $object)
    {
        $this->db->insert_batch($table, $object);
    }



}