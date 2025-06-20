<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class confirm_model extends my_model {
    public function __construct(){
        parent::__construct();
        $this->doc = $this->load->database('docinv',true);
    }

    public function getProgram(){
        $this->doc->distinct()
                    ->select("A.DIVCODE || '-' || LPAD(A.PROMID , 3, '0') || A.PROTID  AS SYSCODE, A.DIVCODE || '-' || LPAD(A.PROMID , 3, '0') || A.PROTID || ' : ' || PROMNAME   AS TITLE, A.*, B.SDIVCODE")
                    ->from('PROGRAM_MSTLST A')
                    ->join('DIVISION_MSTLST B', 'A.DIVCODE = B.DIVCODE')
                    ->join('DOCUMENT_MSTLST C', 'A.DIVCODE = C.DIVCODE AND A.PROMID = C.PROMID AND A.PROTID = C.PROTID')
                    ->order_by('SYSCODE', 'ASC');
        // $this->doc->from('DOCUMENT_LIST');
        return $this->doc->get()->result();
    }

    public function getModule(){
        return $this->doc->select("'M' || LPAD(FUNCCODE , 3, '0') AS MODULECODE, 'M' || LPAD(FUNCCODE , 3, '0') || ' : ' || FUNCNAME AS TITLE, A.*, B.SDIVCODE")
                         ->from('DOCUMENT_LIST A')
                        //  ->from('DOCUMENT_MSTLST A')
                         ->join('DIVISION_MSTLST B', 'A.DIVCODE = B.DIVCODE')
                         ->get()
                         ->result();
    }

    public function getDivision(){
        $this->doc->from('DIVISION_MSTLST')
                    ->order_by('DIVCODE', 'ASC');
        return $this->doc->get()->result();
    }

    public function getProgramType(){
        $this->doc->from('PROGRAMTYPE')
                    ->order_by('PROTID', 'ASC');
        return $this->doc->get()->result();
    }
    
    //PROGRAM_MSTLST
    public function insertPrograms($data){
        $this->doc->insert('PROGRAM_MSTLST', $data);
        return $this->doc->select('MAX(PROMID) AS ID')
                        ->from('PROGRAM_MSTLST')
                        ->where('DIVCODE', $data['DIVCODE'])
                        ->where('PROTID', $data['PROTID'])
                        ->get()
                        ->row();
    }


    public function insertProgramsModule($data){
        $this->doc->insert('DOCUMENT_MSTLST', $data);
        return $this->doc->select('MAX(FUNCCODE) AS ID')
                        ->from('DOCUMENT_MSTLST')
                        ->where('DIVCODE', $data['DIVCODE'])
                        ->where('PROTID', $data['PROTID'])
                        ->where('PROMID', $data['PROMID'])
                        ->get()
                        ->row();
    }

    public function getData($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO){
        $this->db->from('ISCFS_FORM')
                 ->where('NFRMNO', $NFRMNO)
                 ->where('VORGNO', $VORGNO)
                 ->where('CYEAR', $CYEAR)
                 ->where('CYEAR2', $CYEAR2)
                 ->where('NRUNNO', $NRUNNO);
        return $this->db->get()->result();
    }

    public function getOwner($code){
        $this->doc->from('DIVISION_MSTLST')
                  ->where('DIVCODE', $code);
        return $this->doc->get()->result();
    }

    public function getFile($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, $type){
        $this->db->from('IS_FILE')
                 ->where('NFRMNO', $NFRMNO)
                 ->where('VORGNO', $VORGNO)
                 ->where('CYEAR', $CYEAR)
                 ->where('CYEAR2', $CYEAR2)
                 ->where('NRUNNO', $NRUNNO)
                 ->where('FILE_TYPE', $type);
        return $this->db->get()->result();
    }
}