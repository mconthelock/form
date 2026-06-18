<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class eia_model extends my_model 
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->defualt = $this->load->database('MIMS', TRUE);
        
    }

        public function deleteData($tb,$w)
        {  
            if( $w != ''){$this->defualt->where($w);}
            $this->defualt->delete($tb);
        }

        public function QuerySetBase($q,$base="", $bindData = "")
        {
            if($base == "")
            {
                $base = "default";
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