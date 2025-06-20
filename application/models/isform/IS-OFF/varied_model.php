<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class Varied_model extends my_model{
    public function __construct(){
        parent::__construct();
    }

    public function getOrganize($cond = ''){
        if(!empty($cond)){
            foreach($cond as $key => $value){
                $this->set_where($key, $value);
            }
        }
        $this->db->select("ORGANIZE_CODE, ORGANIZE, COUNT(ORGANIZE_CODE)")
                 ->from('LOG_VARIEDOFF_VIEW')
                 ->group_by('ORGANIZE_CODE, ORGANIZE');
        return $this->db->get()->result();
    }

    public function getReason($cond = ''){
        if(!empty($cond)){
            foreach($cond as $key => $value){
                $this->set_where($key, $value);
            }
        }
        $this->db->from('LOGIN_REASON');
        return $this->db->get()->result();
    }

    public function getVaried($cond = ''){
        if(!empty($cond)){
            foreach($cond as $key => $value){
                $this->set_where($key, $value);
            }
        }
        $this->db->from('LOG_VARIEDOFF_VIEW');
        return $this->db->get()->result();
    }

    public function getData($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO){
        $this->db->select("'IS-OFF' || SUBSTR(CYEAR2,3,2) || '-' || LPAD(NRUNNO , 6, '0') AS FORMNO, A.*, B.*")
                 ->from('ISOFF_FORM A')
                 ->join('LOG_VARIEDOFF_VIEW B', 'A.ID = B.OFF_ID')
                 ->where('NFRMNO', $NFRMNO)
                 ->where('VORGNO', $VORGNO)
                 ->where('CYEAR', $CYEAR)
                 ->where('CYEAR2', $CYEAR2)
                 ->where('NRUNNO', $NRUNNO)
                 ->order_by('A.ID ASC');
        return $this->db->get()->result();
    }

    public function getMail($cond = ''){
        if(!empty($cond)){
            foreach($cond as $key => $value){
                $this->set_where($key, $value);
            }
        }
        $this->db->from('FLOW A')
                 ->join('AMECUSERALL B', 'A.VAPVNO = B.SEMPNO');
        return $this->db->get()->result();
    }

}