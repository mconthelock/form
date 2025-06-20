<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class user_model extends my_model {

    public function __construct(){
        parent::__construct();
    }

    public function getHeadno($empno){
        $this->db->from('SEQUENCEORG')
                 ->where('EMPNO', $empno)
                //  ->where('CCO', '0')
                 ->where('HEADNO != EMPNO', false, false);
        return $this->db->get()->result();
    }

    public function getDim($code){
        $this->db->from('SEQUENCEORG')
                 ->where('VORGNO', $code)
                 ->where('SPOSCODE', '10');
        return $this->db->get()->result();
    }

}