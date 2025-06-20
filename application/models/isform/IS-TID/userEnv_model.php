<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class userEnv_model extends my_model {
    public function __construct(){
        parent::__construct();
        $this->ad = $this->load->database('auditDB',true);
    }
    
    public function getController(){
        $this->ad->from('ITGC_SPECIALUSER')
                 ->where('AUTH_CLASS', 'Almighty')
                 ->where('USER_TYPE2', 'Human')
                 ->where('ACTIVE_STATUS', 1);
        return $this->ad->get()->result();
    }

    public function getUserLogin(){
        $this->ad->from('ITGC_SPECIALUSER')
                 ->where('AUTH_CLASS', 'General')
                 ->where('USER_TYPE1', 'Temporary')
                 ->where('USER_TYPE2', 'Human')
                 ->where('ACTIVE_STATUS', 1);
        return $this->ad->get()->result();
    }

    public function getServerName(){
        $this->ad->distinct()
                 ->select('RTRIM(LTRIM(SERVER_NAME)) AS SERVER_NAME')
                 ->from('ITGC_SPECIALUSER');
        return $this->ad->get()->result();
    }

    public function getData($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO){
        $this->db->from('ISTID_FORM')
                 ->where('NFRMNO', $NFRMNO)
                 ->where('VORGNO', $VORGNO)
                 ->where('CYEAR', $CYEAR)
                 ->where('CYEAR2', $CYEAR2)
                 ->where('NRUNNO', $NRUNNO);
        return $this->db->get()->result();
    }
}