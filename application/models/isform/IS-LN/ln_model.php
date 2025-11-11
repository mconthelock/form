<?php
defined('BASEPATH') or exit('No direct script access allowed');

class ln_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    public function select($table, $where = [], $join = [])
    {
        if (!empty($where)) {
            $this->db->where($where);
        }
        if (!empty($join)) {
            foreach ($join as $joinTable => $condition) {
                // $condition can be either a string or an array with [condition, type]
                if (is_array($condition)) {
                    $this->db->join($joinTable, $condition[0], $condition[1]);
                } else {
                    $this->db->join($joinTable, $condition);
                }
            }
        }
        $query = $this->db->get($table);
        return $query->result();
    }

    public function insert($table, $data)
    {
        return $this->db->insert($table, $data);
    }

    public function update($table, $data, $where)
    {
        $this->db->where($where);
        return $this->db->update($table, $data);
    }
}