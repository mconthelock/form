<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class vms_model extends my_model 
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        
        
    }


    public function generate_attfile_id($cyear2,$nrunno)
    {
        $this->db->select('NVL(MAX(ITEMNO),0) AS ITEMNO')
        ->from('VMS_ATTFILE')
        ->where('CYEAR2', $cyear2)
        ->where('NRUNNO', $nrunno);
        return $this->db->get()->result()[0]->ITEMNO+1;
    }

    


    public function get_salecompany()
    {
        $this->db
        ->select('*')
        ->from('TMAINTAINAGENT_ELE')
        ->where('STATUS', 'YES')
        ->order_by('ABBREVIATION', 'asc');
    return $this->db->get()->result();
    }

    public function get_participants()
    {
        $this->db
        ->select('SEMPNO , SNAME , SSEC , SDEPT , SDIV , SPOSNAME')
        ->from('AMECUSERALL')
        ->where('CSTATUS', '1')
        ->where('SPOSCODE <=', 40) 
        ->order_by('SNAME', 'asc');
    return $this->db->get()->result();

    }

    public function get_stakeholders($con)
    {
        if($con != ''){
            foreach($con as $key => $val) {
            $this->set_where($key, $val);
            }
        }
        $this->db
        ->select('V.* , SNAME , SSEC , SDEPT , SDIV , SPOSNAME')
        ->from('VMS_STAKEHOLDERS V')
        ->join('AMECUSERALL A ', 'V.SEMPNO = A.SEMPNO');
        return $this->db->get()->result();

    }

    
    public function get_guest_type()
    {
        $this->db
            ->select('*')
            ->from('GPENT_GUEST_TYPE')
            ->where('STATUS', '1')
            ->order_by('GT_ID', 'asc');
        return $this->db->get()->result();
    }

    public function get_purpose_visit()
    {
        $this->db
            ->select('*')
            ->from('VMS_PURPOSE_VISIT')
            ->order_by('PVID', 'asc');
        return $this->db->get()->result();
    }

    public function get_visit_type()
    {
        $this->db
            ->select('*')
            ->from('VMS_VISIT_TYPE')
            ->order_by('VTID', 'asc');
        return $this->db->get()->result();
    }

    public function getAttfile($cond = '')
    {
        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db->from('VMS_ATTFILE')
                 ->order_by('ID', 'ASC');
        return $this->db->get()->result();
    }

    public function get_activity()
    {
        $this->db
            ->select('*')
            ->from('VMS_ACTIVITY');
        return $this->db->get()->result();
    }

    public function get_schedule($cond = '')
    {

        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db
        ->select('S.* , TO_CHAR(SCHSTIME, \'HH:MI AM\') AS SCHSTIME_FORMAT ,  TO_CHAR(SCHETIME, \'HH:MI AM\') AS SCHETIME_FORMAT')
        ->from('VMS_SCHEDULE S')
        ->order_by('ID', 'ASC');
          return $this->db->get()->result();
    }

    public function get_formversion()
    {
        $this->db
            ->select('VERSION_NO')
            ->from('VMS_FORM_VERSION');
        return $this->db->get()->result()[0]->VERSION_NO;
    }

    public function get_room($cond = '')
    {
        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db
        ->select('*')
        ->from('VMS_ROOM')
        ->order_by('ROOMNAME', 'ASC');
          return $this->db->get()->result();

    }

    public function execsql($q)
	{
		return $this->db->query($q);
	}

}