<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class Task_model extends my_model{
    public function __construct(){
        parent::__construct();
    }


    public function getReport($cond = ''){
        if($cond['JOBSECTION'] == 'AAS'){
            $this->db = $this->load->database('docinv', TRUE);
        }else{
            $this->db = $this->load->database('auditDB', TRUE);
        }
        if($cond) $this->db->where($cond);
        $this->db->select("JOBSECTION AS SECTION,
                            COUNT(JOBSECTION) AS TOTAL,
                            COUNT(CASE WHEN JOBSTATUS = 'COMPLETED' THEN 1 END) AS COMPLETED,
                            COUNT(CASE WHEN JOBSTATUS = 'END ABNORMAL' THEN 1 END) AS END_ABNORMAL,
                            COUNT(CASE WHEN RC_ACTION = 0 THEN 1 END) AS SKIP,
                            COUNT(CASE WHEN RC_ACTION = 1 THEN 1 END) AS RERUN")
                            
                ->from('JOB_RESULT_CONFIRMATION A')
                ->group_by('JOBSECTION');
        return $this->db->get()->result();
    }

    public function getData($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO){
        $this->db->from('ISJDR_FORM ')
                 ->where('NFRMNO', $NFRMNO)
                 ->where('VORGNO', $VORGNO)
                 ->where('CYEAR', $CYEAR)
                 ->where('CYEAR2', $CYEAR2)
                 ->where('NRUNNO', $NRUNNO)
                 ->order_by('JDR_SECTION ASC');
        return $this->db->get()->result();
    }

    public function getMonthly($cond = ''){
        if($cond['JOBSECTION'] == 'AAS'){
            $this->db = $this->load->database('docinv', TRUE);
        }else{
            $this->db = $this->load->database('auditDB', TRUE);
        }
        if($cond) $this->db->where($cond);
        $this->db->select("JOBSECTION, LOG_DATE,
            COUNT(LOG_DATE) AS ALLPLAN,
            COUNT(CASE WHEN JOBSTATUS = 'COMPLETED' THEN 1 END) AS COMPLETED,
            CASE 
                WHEN COUNT(LOG_DATE) != COUNT(CASE WHEN JOBSTATUS = 'COMPLETED' THEN 1 END) 
                THEN 'END ABNORMAL' 
                ELSE 'COMPLETED' END AS  JOBSTATUS")
                 ->from('JOB_RESULT_CONFIRMATION')
                 ->group_by('JOBSECTION, LOG_DATE')
                 ->order_by('LOG_DATE ASC');
        return $this->db->get()->result();
    }

    public function getEndAb($cond){
        if($cond['JOBSECTION'] == 'AAS'){
            $this->db = $this->load->database('docinv', TRUE);
        }else{
            $this->db = $this->load->database('auditDB', TRUE);
        }
        if($cond) $this->db->where($cond);
        $this->db->from('JOB_RESULT_CONFIRMATION')
                 ->where('LTRIM(RTRIM(JOBSTATUS))', 'END ABNORMAL')
                 ->order_by('LOG_DATE ASC');
        return $this->db->get()->result();
    }


}