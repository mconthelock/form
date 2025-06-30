<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class autorize_model extends my_model {
    public function __construct(){
        parent::__construct();
        $this->db = $this->load->database('escs', TRUE);
    }

    public function getItem($cond = ''){
        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db->from('ITEM')
                 ->where('IT_STATUS', '1')
                 ->order_by('IT_NO', 'ASC');
        return $this->db->get()->result();
    }

    public function getSection($cond = ''){
        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db->from('USERS_SECTION')
                 ->where('SEC_STATUS', '1')
                 ->order_by('SEC_ID', 'ASC');
        return $this->db->get()->result();
    }

    public function getUserByID($cond = ''){
        if($cond != ''){
            foreach($cond as $key => $val) {
                $this->set_where($key, $val);
            }
        }
        $this->db->from('USERS')
                 ->where_not_in('GRP_ID', [1,4,7])
                 
                 ->where('USR_STATUS', '1');
        return $this->db->get()->result();
    }

    public function getUser($cond = ''){
        if($cond != ''){
            foreach($cond as $key => $val) {
                $this->set_where($key, $val);
            }
        }
        $this->db->select('SEMPNO, SNAME, SSEC, SDEPT, SDIV, SSECCODE, SDEPCODE, SDIVCODE')
                 ->from('USERS A')
                 ->join('AMECUSERALL B', 'A.USR_NO = B.SEMPNO')
                 ->where('USR_STATUS', '1')
                 ->where('GRP_ID', '1') // 1 = inspector อาจมีการเปลี่ยนแปลงเพิ่ม 2 = foreman, 5 = leader
                 ->order_by('USR_NO', 'ASC');
        return $this->db->get()->result();
    }

    public function getUserOrganize($cond){
        if($cond != ''){
            foreach($cond as $key => $val) {
                $this->set_where($key, $val);
            }
        }
        $this->db->distinct()
                 ->select("CASE 
                                WHEN SDEPCODE = '00' THEN SDIV 
                                WHEN SSECCODE = '00' THEN SDEPT 
                                ELSE SSEC
                            END AS ORGANIZE,
                            CASE 
                                WHEN SDEPCODE = '00' THEN SDIVCODE 
                                WHEN SSECCODE = '00' THEN SDEPCODE  
                                ELSE SSECCODE
                            END AS ORGANIZECODE", false)
                 ->from('USERS A')
                 ->join('AMECUSERALL B', 'A.USR_NO = B.SEMPNO')
                 ->where('USR_STATUS', '1')
                 ->where('GRP_ID', '1') // 1 = inspector อาจมีการเปลี่ยนแปลงเพิ่ม 2 = foreman, 5 = leader
                 ->order_by('ORGANIZECODE', 'ASC');
        return $this->db->get()->result();
    }
}