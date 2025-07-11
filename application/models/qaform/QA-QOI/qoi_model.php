<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class qoi_model extends my_model 
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->dbas = $this->load->database('as400', true);
        
    }

    public function generate_dwg_id(){
        $data = $this->db->select('NVL(MAX(MID),0) AS MID')->get('QOI_DWGMASTER')->result();
        return $data[0]->MID+1;
    }

    public function generate_file_id($mid){
        $this->db->select('NVL(MAX(FID),0) AS FID')
                ->from('QOI_ATTFILE')
                ->where('MID', $mid);
        return $this->db->get()->result()[0]->FID+1;
    }

    public function generate_attfile_id($nfrmno, $vorgno, $cyear, $cyear2, $nrunno){
        $this->db->select('NVL(MAX(ITEMNO),0) AS ITEMNO')
                ->from('ATTQOIFRM')
                ->where('NFRMNO', $nfrmno)
                ->where('VORGNO', $vorgno)
                ->where('CYEAR', $cyear)
                ->where('CYEAR2', $cyear2)
                ->where('NRUNNO', $nrunno);
        return $this->db->get()->result()[0]->ITEMNO+1;
    }

    public function get_qoi_schedule($year)
    {
        $next = $year+1;
        $q = "CASE 
        WHEN MON IS NULL THEN 'Unspecified'
        ELSE TO_CHAR(TO_DATE(S.MON,'yyyymm'),'MON')
        END as MON , M.* ,  S.MON AS MONNUM  , TO_CHAR(TO_DATE(S.MON,'yyyymm'),'MON yyyy')  AS MONSTR , (SELECT LISTAGG(SUBSTR(MON,5,2), ',') WITHIN GROUP (ORDER BY MON) MONLIST  FROM  QOI_DWGSCHEDULE WHERE MID = M.MID) AS SCH ";
        $q .= ", (SELECT LISTAGG(FID||'|'||SFILE||'|'||UFILE||'|'||FTYPE, ',') WITHIN GROUP (ORDER BY FID) ATTFILE  FROM  QOI_ATTFILE WHERE MID = M.MID) AS ATTFILE ";
        $this->db->select($q)
            ->from('QOI_DWGMASTER M')
            ->join('QOI_DWGSCHEDULE S', 'M.MID = S.MID', 'left')
            ->where("MON >= $year"."04")
            ->where("MON <= $next"."03")
            ->or_where("MON IS NULL")
            ->order_by('TO_DATE(S.MON,\'yyyymm\') ASC');
        return $this->db->get()->result();
    }

    public function get_Jstaff()
    {
        $this->db->select("SEMPNO , SNAME")
        ->from('AMECUSERALL')
        ->where("CSTATUS = '1'")
        ->where("SSECCODE = '000503'")
        ->where("SPOSCODE in ('41','42','43','40','35')")
        ->order_by('SNAME ASC');
        return $this->db->get()->result();
    }

    public function get_Engineer()
    {
        $this->db->select("SEMPNO , SNAME")
        ->from('AMECUSERALL')
        ->where("CSTATUS = '1'")
        ->where("SSECCODE = '000503'")
        ->where("SPOSCODE in ('40','35')")
        ->order_by('SNAME ASC');
        return $this->db->get()->result();
    }   

    
    public function get_SEMING()
    {
        $this->db->select("SEMPNO , SNAME")
        ->from('AMECUSERALL')
        ->where("CSTATUS = '1'")
        ->where("SSECCODE in ('000402','000403')")
        ->where("SPOSCODE in ('30')")
        ->order_by('SNAME ASC');
        return $this->db->get()->result();
    }
    public function deletesch($con){
        $this->db->where($con);
        return $this->db->delete('QOI_DWGSCHEDULE');
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
    
    public function getDwgrev($drawingNo)
    {
        $pdm = $this->load->database('pdm', TRUE);
        $sql="SELECT fml.drawing_no,fml.revision_no,fml.internal_revision_no,vfml.file_seqno,vfml.file_name,vfml.folder_path,vfml.file_extention,vfml.file_name||'_'|| CAST(vfml.internal_revision_no AS TEXT) ||'_DWGVIEW_'||CAST(vfml.file_seqno AS TEXT) AS tifname 
        FROM(SELECT drawing_no,revision_no,internal_revision_no
        FROM  pdm.drawing_fml WHERE drawing_no=? AND  latest_released_flg='1' AND drawing_status='9') fml
        INNER JOIN  pdm.drawing_view_fml  vfml  ON vfml.drawing_no=fml.drawing_no AND vfml.revision_no=fml.revision_no";
        return $pdm->query($sql,array($drawingNo))->result();
    }

    public function getqoiform($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->db
        ->select('Q.* , to_char(Q.INSPECDATE,\'dd/mm/YYYY\') as SINSPECDATE, to_char(Q.EXPCHGDATE,\'dd/mm/YYYY\') as SEXPCHGDATE, F.VREQNO , R.SNAME as REQNAME , F.VINPUTER , I.SNAME as INPNAME')
        ->from('QOIFORM Q')
        ->join('FORM F', 'F.NFRMNO = Q.NFRMNO AND F.VORGNO = Q.VORGNO AND F.CYEAR = Q.CYEAR AND F.CYEAR2 = Q.CYEAR2 AND F.NRUNNO = Q.NRUNNO')
        ->join('AMECUSERALL I', 'I.SEMPNO = F.VINPUTER AND I.CSTATUS = \'1\'')
        ->join('AMECUSERALL R', 'R.SEMPNO = F.VREQNO AND R.CSTATUS = \'1\'')
        ->where('Q.NFRMNO', $nfrmno)
        ->where('Q.VORGNO', $vorgno)
        ->where('Q.CYEAR', $cyear)
        ->where('Q.CYEAR2', $cyear2)
        ->where('Q.NRUNNO', $nrunno);
    return $this->db->get()->result();
    }

}