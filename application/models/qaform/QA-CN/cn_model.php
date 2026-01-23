<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class cn_model extends my_model 
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        // $this->dbas = $this->load->database('as400', true);
        
    }

    public function execsql($q)
	{
		$this->db->query($q);
	}
    
    public function execAssql($q)
	{
		$this->dbas->query($q);
	}

    public function getdatasql($q)
	{
		return $this->db->query($q)->result();
	}

    public function getdataAssql($q)
	{
		return $this->dbas->query($q)->result();
	}


    
    public function getcnform($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
        ->select('Q.* , CLS.CLSCHANGE , RS.REASON , JUD.JUDGEMENT, F.VREQNO , R.SNAME as REQNAME , F.VINPUTER , I.SNAME as INPNAME')
        ->from('CNFORM Q')
        ->join('CNCLSCHANGE CLS' ,'CLS.CLSNO = Q.CLSNO', 'LEFT')
        ->join('CNREASON RS' ,'RS.RSNNO = Q.RSNNO', 'LEFT')
        ->join('CNJUDGEMENT JUD' ,'JUD.JDGMNTNO = Q.JDGMNTNO', 'LEFT')
        ->join('FORM F', 'F.NFRMNO = Q.NFRMNO AND F.VORGNO = Q.VORGNO AND F.CYEAR = Q.CYEAR AND F.CYEAR2 = Q.CYEAR2 AND F.NRUNNO = Q.NRUNNO')
        ->join('AMECUSERALL I', 'I.SEMPNO = F.VINPUTER  ')
        ->join('AMECUSERALL R', 'R.SEMPNO = F.VREQNO ')
        ->where('Q.NFRMNO', $nfrmno)
        ->where('Q.VORGNO', $vorgno)
        ->where('Q.CYEAR', $cyear)
        ->where('Q.CYEAR2', $cyear2)
        ->where('Q.NRUNNO', $nrunno);
    return $this->db->get()->result();
    }


}