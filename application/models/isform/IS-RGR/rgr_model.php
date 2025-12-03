<?php

class Rgr_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        // Load database if not autoloaded
        $this->load->database();
    }

    // Example: Get all RGR records
    public function getSummaryData($period, $year)
    {
        $sql = "SELECT 
                    ism.ID,
                    ism.PROGRAM_NAME,
                    ism.SYSTEM_DESC,
                    ism.SYSTEM_GROUP_NAME,
                    NVL(emp.EMP_COUNT, 0) AS EMP_COUNT,
                    NVL(emp.RESULT_1, 0) AS RESULT_1,
                    NVL(emp.RESULT_0, 0) AS RESULT_0,
                    NVL(emp.RESULT_NULL, 0) AS RESULT_NULL
                FROM ISRGV_SUMMARY_MST ism
                LEFT JOIN ISRGV_INCHARGE ii 
                    ON ism.ID = ii.SUMMARY_GROUP
                LEFT JOIN (
                    SELECT 
                        ie.SUMMARY_GROUP,
                        COUNT(*) AS EMP_COUNT,
                        SUM(CASE WHEN ie.RESULT = '1' THEN 1 ELSE 0 END) AS RESULT_1,
                        SUM(CASE WHEN ie.RESULT = '0' THEN 1 ELSE 0 END) AS RESULT_0,
                        SUM(CASE WHEN ie.RESULT IS NULL OR TRIM(ie.RESULT) = '' THEN 1 ELSE 0 END) AS RESULT_NULL
                    FROM ISRGV_EMP ie 
                    LEFT JOIN ISRGV_FORM t 
                        ON ie.NRUNNO = t.NRUNNO 
                        AND ie.CYEAR2 = t.CYEAR2 
                    WHERE t.PERIOD = '$period' 
                    AND ie.CYEAR2 = '$year'
                    GROUP BY ie.SUMMARY_GROUP
                ) emp 
                    ON emp.SUMMARY_GROUP = ism.ID
                GROUP BY 
                    ism.ID, 
                    ism.PROGRAM_NAME, 
                    ism.SYSTEM_GROUP_NAME, 
                    ism.SYSTEM_DESC,
                    emp.EMP_COUNT,
                    emp.RESULT_1,
                    emp.RESULT_0,
                    emp.RESULT_NULL
                ORDER BY 
                    ism.ID
            ";
        return $this->db->query($sql)->result();
    }

    public function insert($table, $data)
    {
        return $this->db->insert($table, $data);
    }

    public function SelectMaxId($col, $table)
    {
        $sql    = "SELECT MAX($col) AS MAX_ID FROM $table";
        $result = $this->db->query($sql)->row();
        return $result ? $result->MAX_ID : null;
    }

    public function getSummaryReport($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $sql   = "SELECT *
                FROM ISRGV_SUMMARY_HDR ish
                JOIN ISRGV_SUMMARY_DTL isd ON
                    ish.ID = isd.HDR_ID
                JOIN ISRGV_SUMMARY_MST ism ON
                    isd.SUMMARY_MST_ID = ism.ID
                WHERE ish.NFRMNO = '$nfrmno'
                AND ish.VORGNO = '$vorgno'
                AND ish.CYEAR = '$cyear'
                AND ish.CYEAR2 = '$cyear2'
                AND ish.NRUNNO = '$nrunno'
                ORDER BY ism.ID";
        $query = $this->db->query($sql);
        return $query->result();
    }
}