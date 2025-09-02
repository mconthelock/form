<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Training_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function get_empinfo($empno) {
        $sql = "SELECT * FROM AMEC.AMECUSERALL WHERE SEMPNO = '".$empno."'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function getSect() {
        $sql = "SELECT SSECCODE, SSEC  FROM AMEC.PSECTION  WHERE UPPER(SSEC) NOT LIKE '%CANCEL%'  AND SSECCODE <> '00' ORDER BY SSEC";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function getDept() {
        $sql = "SELECT SDEPCODE, SDEPT FROM AMEC.PDEPARTMENT WHERE UPPER(SDEPT) NOT LIKE '%CANCEL%' AND SDEPCODE <> '00' ORDER BY SDEPT";
        $query = $this->db->query($sql);
        return $query->result();
    }

    public function getDiv() {
        $sql = "SELECT SDIVCODE, SDIV FROM AMEC.PDIVISION WHERE UPPER(SDIV) NOT LIKE '%CANCEL%' AND SDIVCODE <> '00' ORDER BY SDIV";
        $query = $this->db->query($sql);
        return $query->result();
    }

}