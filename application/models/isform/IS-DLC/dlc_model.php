<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Dlc_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        // Load database
        $this->load->database();
        $this->ad = $this->load->database('auditDB', TRUE);
    }

    public function getLog($date)
    {
        $this->ad->select('*');
        $this->ad->from('ITGC_OSLOG');
        $this->ad->where('LOG_SERVER', 'AS400');
        $this->ad->where('USER_TYPE1', 'Temporary');
        $this->ad->where('USER_TYPE2', 'Human');
        $this->ad->where('LOG_DATE', $date);
        $query = $this->ad->get();
        return $query->result();
    }

    public function get_TID($servername, $user, $date)
    {
        $this->db->select('*');
        $this->db->from('ISTID_FORM');
        $this->db->where('TID_SERVERNAME', $servername);
        $this->db->where('TID_USERLOGIN', $user);
        $this->db->where("TID_REQ_DATE", "TO_DATE('$date', 'YYYY-MM-DD')", false);
        $query = $this->db->get();
        return $query->result();
    }


}