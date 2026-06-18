<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class eia_model extends my_model 
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->MIMS = $this->load->database('MIMS', TRUE);
        
    }

        public function deleteData($base="",$tb,$w)
       {
            $db = $this->load->database($base, TRUE);
            
            // ตรวจสอบว่ามีเงื่อนไขการลบหรือไม่
            if (!empty($w)) {
                $db->where($w);
                $db->delete($tb);
            } else {
                // กรณีไม่มีเงื่อนไข ให้ log error หรือ return false เพื่อป้องกันการลบทั้งตาราง
                log_message('error', "Attempted to delete from $tb without WHERE clause!");
                return false;
            }
        }

        public function QuerySetBase($q,$base="", $bindData = "")
        {
            if($base == "")
            {
                $base = "DEFAULT";
            }
            if ($bindData == "") {
                $bindData = array();
            }
            $confic = $this->load->database($base, TRUE);   
            return $confic->query($q, $bindData);
        }
    

        public function getFile($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, $type){
            $this->db->from('FE_FILE')
                    ->where('NFRMNO', $NFRMNO)
                    ->where('VORGNO', $VORGNO)
                    ->where('CYEAR', $CYEAR)
                    ->where('CYEAR2', $CYEAR2)
                    ->where('NRUNNO', $NRUNNO)
                    ->where('FILE_TYPE', $type);
            return $this->db->get()->result();
        }

}