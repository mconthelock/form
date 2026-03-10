<?php
defined('BASEPATH') or exit('No direct script access allowed');

class chr_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->wk = $this->load->database('WORKLOAD', TRUE);

    }

    public function getDataRecord($month, $year, $shop = null)
    {
        $month = str_pad($month, 2, '0', STR_PAD_LEFT);
        $sql   = "SELECT cr.*,csm.SHOP_INCHARGE FROM CRIMPHEIGHT_RECORD cr 
                LEFT JOIN CRIMPHEIGHT_SHOP_MST csm ON cr.SHOP = csm.SHOP_NAME 
                WHERE TO_CHAR(cr.CREATED_AT, 'YYYY-MM') = '$year-$month'";

        if (!empty($shop)) {
            $sql .= " AND cr.SHOP = " . $this->wk->escape($shop);
        }

        $sql .= " ORDER BY cr.CREATED_AT DESC";

        $query = $this->wk->query($sql);
        return $query->result();
    }

    public function getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunnno)
    {
        $sql   = "SELECT t.*, TO_CHAR(TO_DATE(MONTH, 'MM'), 'FMMonth') AS MONTH_NAME 
                FROM IECHR_FORM t 
                WHERE NFRMNO = '$nfrmno' AND VORGNO = '$vorgno' AND CYEAR = '$cyear' AND CYEAR2 = '$cyear2' AND NRUNNO = '$nrunnno'";
        $query = $this->db->query($sql);
        return $query->result();

    }

    public function insertWebform($table, $data)
    {
        $this->db->insert($table, $data);
    }
}