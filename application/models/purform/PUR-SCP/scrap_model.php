<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Scrap_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->sk = $this->load->database('SKID', TRUE);
        // Load necessary libraries, helpers, or models here
    }

    public function getDataPrice()
    {
        // SELECT * FROM SCRAP_PRODUCT sp 
        // JOIN V_SCRAP_PRICE sp2 ON sp.SCRAP_ID = sp2.SCRAP_ID 
        // LEFT JOIN AMEC.PVENDER p ON sp2.VENDOR = p.svendcode
        // WHERE sp.STATUS = '1'
        $this->sk->select('*')
            ->from('SCRAP_PRODUCT sp')
            ->join('V_SCRAP_PRICE sp2', 'sp.SCRAP_ID = sp2.SCRAP_ID')
            // ->join('AMEC.PVENDER p', 'sp2.VENDOR = p.svendcode', 'left')
            ->where('sp.STATUS', '1')
            ->where('sp.TYPE', '1');
        $query = $this->sk->get();

        return $query->result();
    }

    public function getDataPriceByRunNo($nfrmno, $vorgno, $cyear, $cyear2, $runno)
    {
        // ดึง FYEAR และ PERIOD ของ run นี้ก่อน เพื่อคำนวณ old period
        $infoQ = $this->sk->query(
            "SELECT FYEAR, PERIOD FROM SCRAP_PRICE WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ? AND ROWNUM = 1 AND TYPE = '1'",
            [$nfrmno, $vorgno, $cyear, $cyear2, $runno]
        );
        $info  = $infoQ->row();

        // $sql = "SELECT * FROM SCRAP_PRICE WHERE NFRMNO = $nfrmno AND VORGNO = $vorgno AND CYEAR = $cyear AND CYEAR2 = $cyear2 AND NRUNNO = $runno AND TYPE = '1'";
        // echo $sql;
        $oldFyear  = null;
        $oldPeriod = null;
        if ($info) {
            $oldPeriod = ((int) $info->PERIOD === 1) ? 2 : 1;
            $oldFyear  = ((int) $info->PERIOD === 1) ? ((int) $info->FYEAR - 1) : (int) $info->FYEAR;
        }

        // JOIN SCRAP_PRICE สองครั้ง: sp2 = winner (run นี้), old_p = period ก่อนหน้า
        $sql   = "
            SELECT
                sp.SCRAP_ID,
                sp.SCRAP_NAME,
                sp.UNIT,
                sp.BOI,
                sp.B_GUARANTEE,
                sp2.QUOTATION,
                old_p.VENDOR          AS VENDOR,
                old_p.PRICE           AS PRICE,
                old_p.FYEAR           AS FYEAR,
                old_p.PERIOD          AS PERIOD,
                sp2.VENDOR            AS NEW_VENDOR,
                sp2.PRICE             AS NEW_PRICE,
                sp2.EFFECTIVE_DATE    AS EFFECTIVE_DATE,
                sp2.FYEAR             AS NEW_FYEAR,
                sp2.PERIOD            AS NEW_PERIOD
            FROM SCRAP_PRODUCT sp
            JOIN SCRAP_PRICE sp2
                ON sp.SCRAP_ID = sp2.SCRAP_ID
               AND sp2.NRUNNO  = $runno
               AND sp2.CYEAR2  = $cyear2
            LEFT JOIN SCRAP_PRICE old_p
                ON sp.SCRAP_ID  = old_p.SCRAP_ID
               AND old_p.FYEAR  = $oldFyear
               AND old_p.PERIOD = $oldPeriod
               AND old_p.TYPE   = '1'
            WHERE sp.STATUS = '1'
              AND sp.TYPE   = '1'
            ORDER BY sp2.QUOTATION ASC, sp2.SCRAP_ID ASC
        ";
        $query = $this->sk->query($sql);
        return $query->result();
    }

    /**
     * TODO: ยืนยัน TABLE และ COLUMN ที่ถูกต้องก่อน Deploy
     * สมมติว่า Table = SCRAP_WINNER, Columns = (SCRAP_ID, NEW_VENDOR, NEW_PRICE, EFFECTIVE_DATE)
     */
    public function saveWinner($rows, $fyear, $period, $nfrmno, $vorgno, $cyear, $nrunno, $cyear2)
    {
        foreach ($rows as $row) {
            $scrapId       = $row['SCRAP_ID'] ?? null;
            $newVendor     = $row['_NEW_VENDOR'] ?? null;
            $newPrice      = $row['_NEW_PRICE'] ?? null;
            $effectiveDate = $row['_EFFECTIVE_DATE'] ?? null;
            $quotation     = $row['QUOTATION'] ?? null;

            if (!$scrapId)
                continue;

            $data = [
                'FYEAR'     => $fyear,
                'PERIOD'    => $period,
                'SCRAP_ID'  => $scrapId,
                'VENDOR'    => $newVendor,
                'PRICE'     => $newPrice,
                'QUOTATION' => $quotation,
                'STATUS'    => '1',
                'TYPE'      => '1',
                'NFRMNO'    => $nfrmno,
                'VORGNO'    => $vorgno,
                'CYEAR'     => $cyear,
                'NRUNNO'    => $nrunno,
                'CYEAR2'    => $cyear2,
            ];

            if ($effectiveDate) {
                $this->sk->set('EFFECTIVE_DATE', "TO_DATE('{$effectiveDate}', 'YYYY-MM-DD')", false);
            }

            $this->sk->insert('SCRAP_PRICE', $data);
            // Check if record exists
            // $this->sk->where('SCRAP_ID', $scrapId);
            // $exists = $this->sk->count_all_results('SCRAP_WINNER');

            // if ($exists > 0) {
            //     $this->sk->where('SCRAP_ID', $scrapId);
            //     $this->sk->update('SCRAP_WINNER', [
            //         'NEW_VENDOR'     => $newVendor,
            //         'NEW_PRICE'      => $newPrice,
            //         'EFFECTIVE_DATE' => $effectiveDate,
            //     ]);
            // } else {
            //     $this->sk->insert('SCRAP_WINNER', [
            //         'SCRAP_ID'       => $scrapId,
            //         'NEW_VENDOR'     => $newVendor,
            //         'NEW_PRICE'      => $newPrice,
            //         'EFFECTIVE_DATE' => $effectiveDate,
            //     ]);
            // }
        }
    }

}