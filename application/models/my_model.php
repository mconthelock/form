<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class my_model extends CI_Model {
    public function __construct(){
        parent::__construct();
        // $this->load->database();
    }

    public function generate_id($table, $col, $cond = ''){
        if(!empty($cond)){
            foreach($cond as $key => $value){
                $this->set_where($key, $value);
            }
        }
        $data = $this->db->select("NVL(MAX($col),0) AS ID")->get($table)->result();
        return $data[0]->ID+1;
    }

    public function select($table){
        return $this->db->from($table)->get()->result();
    }

    public function customSelect($table, $cond = '', $select='', $distinct='', $order=''){
        !empty($distinct) ? $this->db->distinct() : '';
        !empty($select)   ? $this->db->select($select) : '';
        !empty($order)   ? $this->db->order_by($order) : '';
        if(!empty($cond)){
            foreach($cond as $key => $value){
                $this->set_where($key, $value);
            }
        }
        return $this->db->from($table)
                        ->get()
                        ->result();
    }

    public function insert($table, $data){
        foreach($data as $key => $value){
			$this->setData($key, $value);
		}
		$this->db->insert($table);
		return $this->db->affected_rows();
    }

	public function insert_batch($table, $data){
        $this->db->insert_batch($table, $data);
        return $this->db->affected_rows();
    }

    public function update_batch($table, $data, $key){
        $this->db->update_batch($table, $data, $key);
        return $this->db->affected_rows();
    }
    
    public function update($table, $data, $condition){
		foreach($data as $key => $value){
			$this->setData($key, $value);
		}
        foreach($condition as $k => $v){
            $this->set_where($k, $v);
        }
		$this->db->update($table);
		return $this->db->affected_rows();
	}
    
    public function delete($table, $condition){
		$this->db->where($condition);
		$this->db->delete($table);
        return $this->db->affected_rows();
    }

    private function setData($key, $value){
		if($value == 'sysdate'){
            $this->db->set($key, $value, false);
        }elseif(in_array($key, array('TID_REQ_DATE', 'TID_COMP_DATE', 'TID_DISABLE_DATE','INSPECDATE','EXPCHGDATE'))){
			$this->db->set($key, "to_date('".$value."','dd/mm/yyyy')", false);
		// }else if(in_array($key, array())){
		// 	$this->db->set($key, $value, false);
		}else{
			$this->db->set($key, $value);
		}
	}

    
    protected function set_where($key, $value){
        // if(in_array($key,['CSTEPNO','CHEMICAL_NAME'])){
        //     $this->db->where_in($key, $value);
        // }elseif(in_array($key,['PA_DATE'])){
        //     $this->db->where("$key $value", null, false);
        // }else{
            $this->db->where($key, $value);
        // }
    }

    public function trans_start(){
        $this->db->trans_start();
    }

    public function trans_complete(){
        $this->db->trans_complete();
    }

    public function trans_rollback(){
        $this->db->trans_rollback();
    }

    public function trans_status(){
        $this->db->trans_status();
    }

    public function checkoption(){
        return $this->db->query('SELECT @@OPTIONS AS CurrentOptions;')->result();
    }

    public function getAllTable(){
        return $this->db->query('SELECT table_name FROM user_tables ORDER BY table_name')->result();
    }

    public function getAllCol($table = ''){
        if($table != ''){
            $this->db->where('TABLE_NAME', $table);
        }
        return $this->db->select('TABLE_NAME, COLUMN_NAME')
                    ->from('USER_TAB_COLUMNS')
                    ->get()
                    ->result();
    }

}