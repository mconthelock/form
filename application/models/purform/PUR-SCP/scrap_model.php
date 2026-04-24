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
        $this->sk->select('sp.*,sp2.*,sp.SCRAP_ID AS SCRAP_ID')
            ->from('SCRAP_PRODUCT sp')
            ->join('V_SCRAP_PRICE sp2', 'sp.SCRAP_ID = sp2.SCRAP_ID', 'left')
            // ->join('AMEC.PVENDER p', 'sp2.VENDOR = p.svendcode', 'left')
            ->where('sp.STATUS', '1')
            ->where('sp.TYPE', '1');
        $query = $this->sk->get();

        return $query->result();
    }

    public function getDataPriceByRunNo($nfrmno, $vorgno, $cyear, $cyear2, $runno)
    {
        // sp2 = ราคาที่เปลี่ยนใน run นี้ (LEFT JOIN: ถ้าไม่มีก็ยังแสดง product)
        // old_p = ราคาล่าสุดก่อน run นี้ (ROW_NUMBER รองรับกรณีที่ไม่ได้ update ทุก period)
        $sql = "
            SELECT
                sp.SCRAP_ID,
                sp.SCRAP_NAME,
                sp.UNIT,
                sp.BOI,
                sp.B_GUARANTEE,
                COALESCE(sp2.QUOTATION, old_p.QUOTATION)  AS QUOTATION,
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
            LEFT JOIN SCRAP_PRICE sp2
                ON sp.SCRAP_ID = sp2.SCRAP_ID
               AND sp2.NRUNNO  = $runno
               AND sp2.CYEAR2  = $cyear2
               AND sp2.TYPE    = '1'
            LEFT JOIN (
                SELECT SCRAP_ID, VENDOR, PRICE, QUOTATION, FYEAR, PERIOD,
                       ROW_NUMBER() OVER (PARTITION BY SCRAP_ID ORDER BY FYEAR DESC, PERIOD DESC) AS RN
                FROM SCRAP_PRICE
                WHERE TYPE = '1'
                  AND NOT (NRUNNO = $runno AND CYEAR2 = $cyear2)
            ) old_p ON sp.SCRAP_ID = old_p.SCRAP_ID AND old_p.RN = 1
            WHERE sp.STATUS = '1'
              AND sp.TYPE   = '1'
            ORDER BY COALESCE(sp2.QUOTATION, old_p.QUOTATION) ASC NULLS LAST, sp.SCRAP_ID ASC
        ";
        $query = $this->sk->query($sql);
        return $query->result();
    }

    /**
     * TODO: ยืนยัน TABLE และ COLUMN ที่ถูกต้องก่อน Deploy
     * สมมติว่า Table = SCRAP_WINNER, Columns = (SCRAP_ID, NEW_VENDOR, NEW_PRICE, EFFECTIVE_DATE)
     */
    public function saveWinner($rows, $fyear, $period, $nfrmno, $vorgno, $cyear, $nrunno, $cyear2, $selectedQuotations = [])
    {
        $count = 0;
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
            $count++;
        }

        return $count;
    }

    public function getBankGuarantees($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->sk->select('VENDOR, AMOUNT')
            ->from('SCRAP_BGRT')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno)
            ->order_by('VENDOR', 'ASC');
        $query = $this->sk->get();
        return $query->result();
    }

    public function getScrapFiles($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)
    {
        $this->sk->select('FILE_PATH')
            ->from('SCRAP_FILE')
            ->where('NFRMNO', $nfrmno)
            ->where('VORGNO', $vorgno)
            ->where('CYEAR', $cyear)
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno);
        $query = $this->sk->get();
        return $query->result();
    }

    public function saveScrapFiles($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $files)
    {
        foreach ($files as $file) {
            $data = [
                'NFRMNO'    => $nfrmno,
                'VORGNO'    => $vorgno,
                'CYEAR'     => $cyear,
                'CYEAR2'    => $cyear2,
                'NRUNNO'    => $nrunno,
                'FILE_PATH' => $file['file_path'],
            ];
            $this->sk->insert('SCRAP_FILE', $data);
        }
    }

    public function saveBankGuarantees($bankGuarantees, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $fyear, $period)
    {
        foreach ($bankGuarantees as $bg) {
            $vendor = $bg['VENDOR'] ?? null;
            $amount = $bg['AMOUNT'] ?? null;

            if (!$vendor) continue;

            $data = [
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'FYEAR'  => $fyear,
                'PERIOD' => $period,
                'VENDOR' => $vendor,
                'AMOUNT' => $amount,
            ];

            $this->sk->insert('SCRAP_BGRT', $data);
        }
    }

}