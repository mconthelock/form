<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class form_model extends my_model {
    private $FLOW_RUNNING 	= "1";
	private $FLOW_PREPARE 	= "0";
	public $STEP_READY 	= "3";
	private $STEP_WAIT		= "2";
	private $STEP_APPROVE   = "5";
	private $STEP_REJECT 	= "6";

    public function __construct(){
        parent::__construct();
    }

    public function getFormMaster($VANAME){
        $this->db->from('FORMMST')
				 ->where('VANAME', $VANAME);
		return $this->db->get()->result();
    }

    public function getFormMasterByNo($no, $orgNo, $y){
        $this->db->from('FORMMST')
                 ->where('NNO', $no)
                 ->where('VORGNO', $orgNo)
                 ->where('CYEAR', $y);
        return $this->db->get()->result();
    }

    public function getEmpFlow($form, $empno){
        foreach($form as $key => $val){
            $this->set_where($key, $val);
        }
        $this->db->from('FLOW')
                 ->where("(vapvno = '$empno' or vrepno = '$empno') ", null, false)
                 ->where('CSTEPST', $this->STEP_READY);
        return $this->db->get()->result();
    }

    public function getFormName($frmNo, $orgNo, $y){
	    $q = "select VANAME from webform.formMst where nNo = '" . $frmNo . "' and vOrgNo = '" . $orgNo . "' and cYear = '" . $y . "'";
		return $this->db->query($q)->result();
	}

    public function getRequestNo($cond = ''){
        if($cond != ''){
            foreach($cond as $key => $value){
                $this->set_where($key, $value);
            }
        }   
        $this->db->from('FORM');
        return $this->db->get()->result();    
    }

    /**
     * @param array $form 
     * @param string $apv The empno
     * @return array 
     */
    public function getExtdata($form, $apv){
        foreach($form as $key => $val){
            $this->set_where($key, $val);
        }
        $this->db->select('CEXTDATA')
                 ->from('FLOW')
                 ->where("(vapvno = '$apv' or vrepno = '$apv') ", null, false)
                 ->where('CSTEPST', $this->STEP_READY);
        return $this->db->get()->result();
		//$q = "select CEXTDATA FROM FLOW where nfrmno = '".$no."' and vorgno = '".$orgNo."' and cyear = '".$y."' and cyear2 = '".$y2."' and nrunno = '".$runNo."' and (vapvno = '".$apv."' or vrepno = '".$apv."') and cstepst = '".$this->STEP_READY."'";
		//return $this->db->query($q)->result();
	}

    /**
     * get data apv by CEXTDATA
     * @param array $form 
     * @param string $CEXTDATA 
     * @return array 
     */
    public function getApvData($form, $CEXTDATA){
        foreach($form as $key => $val){
            $this->set_where($key, $val);
        }
        $this->db->from('FLOW')
                 ->where('CEXTDATA', $CEXTDATA);
        return $this->db->get()->result();
	}

    public function getCSETPNO($cond){
        foreach($cond as $key => $val){
            $this->set_where($key, $val);
        }
        $this->db->select('CSTEPNO')
                 ->from('FLOW');
        return $this->db->get()->result();
    }

    /**
     * @param array $cond
     * @param array $extData ['01','02']
     * @return int
     */
    public function deleteExtra($cond, $extData) {
        foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        $this->db->where_in('CEXTDATA', $extData);
        $this->db->delete('FLOW');
        return $this->db->affected_rows();
    }

    /**
     * Check if the form can be returned to the previous step
     * @param array $form
     * @param string $CSTEPNEXTNO
     * ## note ถ้า step ถัดไปมี VREMOTE คือได้มีการ return ไปแล้ว
     */
    public function checkReturnb($form, $CSTEPNEXTNO){
        foreach($form as $key => $val){
            $this->set_where($key, $val);
        }
        $this->db->from('FLOW')
                 ->where('VREMOTE IS NOT NULL')
                 ->where('CSTEPNO', $CSTEPNEXTNO);
        return $this->db->get()->result();
    }

    public function getForm($no, $orgNo, $y, $y2, $runNo){
        $this->db->select("C.VANAME || SUBSTR(F.CYEAR2,3,2) || '-' || LPAD(F.NRUNNO , 6, '0') AS FORMNO, F.*, A.SNAME AS VREQNAME, B.SNAME AS VINPUTNAME")
                 ->from('FORM F')
                 ->join('AMECUSERALL A', 'F.VREQNO = A.SEMPNO')
                 ->join('AMECUSERALL B', 'F.VINPUTER = B.SEMPNO')
                 ->join('FORMMST C', 'F.NFRMNO = C.NNO AND F.VORGNO = C.VORGNO AND F.CYEAR = C.CYEAR')
                 ->where('F.NFRMNO', $no)
                 ->where('F.VORGNO', $orgNo)
                 ->where('F.CYEAR', $y)
                 ->where('F.CYEAR2', $y2)
                 ->where('F.NRUNNO', $runNo);
        return $this->db->get()->result();
    }


}