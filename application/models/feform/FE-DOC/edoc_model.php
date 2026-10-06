<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';

class edoc_model extends my_model 
{
    public $smmtBase;
    public $webflowBase;

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->smmtBase    = 'SMMT';    // ฐานข้อมูลตาราง FE_DOC_STEP_MST, FE_DOC_HEADER
        $this->webflowBase = 'DEFAULT'; // ฐานข้อมูลตาราง FLOW, FORM, AMECUSERALL
    }

    public function QuerySetBase($q, $base = "", $bindData = array())
    {
        if (empty($base)) {
            $base = $this->smmtBase;
        }
        if (!is_array($bindData)) {
            $bindData = array($bindData);
        }
        $conf = $this->load->database($base, TRUE); 
        return $conf->query($q, $bindData);
    }

    public function deleteData($base = "", $tb = '', $w = array())
    {
        if (empty($base)) {
            $base = $this->smmtBase;
        }
        $db = $this->load->database($base, TRUE);
        if (!empty($w) && !empty($tb)) {
            $db->where($w);
            return $db->delete($tb);
        }
        return false;
    }

    public function getActiveDocTypes()
    {
        $sql = "SELECT DOC_TYPE_CODE, DOC_TYPE_NAME, DEFAULT_ORIENTATION, IS_ACTIVE 
                FROM FE_DOC_TYPE_MST 
                WHERE IS_ACTIVE = 1 
                ORDER BY DOC_TYPE_CODE ASC";
        return $this->QuerySetBase($sql, $this->smmtBase)->result();
    }

    public function getStepsByDocType($docTypeCode)
    {
        $sql = "SELECT  DOC_TYPE_CODE, STEP_NO, CEXTDATA, POSITION_TITLE, 
                       APV_TYPE, TARGET_EMPNO, SPOSCODE, SDIVCODE, SDEPCODE, SSECCODE, IS_ACTIVE
                FROM FE_DOC_STEP_MST 
                WHERE DOC_TYPE_CODE = ? AND IS_ACTIVE = 1 
                ORDER BY STEP_NO ASC";
        return $this->QuerySetBase($sql, $this->smmtBase, [$docTypeCode])->result();
    }

    public function getStepByDocAndExtData($docTypeCode, $extData)
    {
        $sql = "SELECT DOC_TYPE_CODE, STEP_NO, CEXTDATA, POSITION_TITLE, 
                       APV_TYPE, TARGET_EMPNO, SPOSCODE, SDIVCODE, SDEPCODE, SSECCODE, IS_ACTIVE
                FROM FE_DOC_STEP_MST 
                WHERE DOC_TYPE_CODE = ? AND CEXTDATA = ? AND IS_ACTIVE = 1";
        return $this->QuerySetBase($sql, $this->smmtBase, [$docTypeCode, $extData])->row();
    }

    public function getHeaderByKeys($formKeys)
    {
        $sql = "SELECT * FROM FE_DOC_HEADER 
                WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR2 = ? AND NRUNNO = ?";
        $binds = [
            (int)$formKeys['NFRMNO'],
            (string)$formKeys['VORGNO'],
            (string)$formKeys['CYEAR2'],
            (int)$formKeys['NRUNNO']
        ];
        return $this->QuerySetBase($sql, $this->smmtBase, $binds)->row();
    }

    /**
     * ค้นหา EMPNO ของผู้อนุมัติจากตาราง AMECUSERALL (ฐานข้อมูล DEFAULT)
     */
    public function resolveApproverEmpNo($stepRow, $defaultEmpNo)
    {
        if (!$stepRow) return $defaultEmpNo;

        // 1. ถ้าเป็นประเภทระบุตัวบุคคล (APV_TYPE = 'EMP')
        if (strtoupper(trim($stepRow->APV_TYPE)) === 'EMP') {
            return !empty($stepRow->TARGET_EMPNO) ? trim($stepRow->TARGET_EMPNO) : trim($defaultEmpNo);
        }

        // 2. ถ้าเป็นประเภทตำแหน่ง (APV_TYPE = 'POS') -> ค้นหาใน AMECUSERALL
        $dbWebflow = $this->load->database($this->webflowBase, TRUE);
        $dbWebflow->select('SEMPNO')->from('AMECUSERALL');

        if (!empty($stepRow->SPOSCODE)) {
            $dbWebflow->where('SPOSCODE', trim($stepRow->SPOSCODE));
        }
        if (!empty($stepRow->SDIVCODE) && trim($stepRow->SDIVCODE) !== '00') {
            $dbWebflow->where('SDIVCODE', trim($stepRow->SDIVCODE));
        }
        if (!empty($stepRow->SDEPCODE) && trim($stepRow->SDEPCODE) !== '00') {
            $dbWebflow->where('SDEPCODE', trim($stepRow->SDEPCODE));
        }
        if (!empty($stepRow->SSECCODE) && trim($stepRow->SSECCODE) !== '00') {
            $dbWebflow->where('SSECCODE', trim($stepRow->SSECCODE));
        }

        $user = $dbWebflow->limit(1)->get()->row();

        if ($user && !empty($user->SEMPNO)) {
            return trim($user->SEMPNO);
        }

        // กรณีหาไม่พบ ให้ fallback ไปที่ TARGET_EMPNO หรือ defaultEmpNo
        return !empty($stepRow->TARGET_EMPNO) ? trim($stepRow->TARGET_EMPNO) : trim($defaultEmpNo);
    }

    /**
     * ดึงประวัติ Log และสถานะการอนุมัติจากตาราง FLOW ฝั่ง DEFAULT (Webflow Base)
     * เพื่อนำไปแสดงในตรายาง Stamp บน PDF
     */
    public function getApprovalLogList($formKeys)
    {
        $dbWebflow = $this->load->database($this->webflowBase, TRUE);

        // ดึงข้อมูลการ Action จากตาราง FLOW โดยจับคู่กับชื่อ-นามสกุลจาก AMECUSERALL
        $sql = "SELECT 
                    F.CSTEPNO,
                    F.CSTEPNEXTNO,
                    F.CEXTDATA,
                    F.CSTART,
                    F.CSTEPST,
                    F.VAPVNO,
                    F.VREPNO,
                    F.VREALAPV,
                    F.CAPVSTNO,
                    TO_CHAR(F.DAPVDATE, 'DD/MM/YYYY') AS DAPVDATE_STR,
                    F.CAPVTIME,
                    U.SNAME,
                    U.SPOSNAME
                FROM FLOW F
                LEFT JOIN AMECUSERALL U ON TRIM(F.VREALAPV) = TRIM(U.SEMPNO)
                WHERE F.NFRMNO = ? 
                  AND F.VORGNO = ? 
                  AND F.CYEAR = ? 
                  AND F.CYEAR2 = ? 
                  AND F.NRUNNO = ?
                  AND F.CAPVSTNO = '1'  -- เฉพาะรายการที่อนุมัติแล้ว
                ORDER BY F.CEXTDATA ASC NULLS FIRST, F.CSTEPNO ASC";

        $binds = [
            (int)$formKeys['NFRMNO'],
            (string)$formKeys['VORGNO'],
            (string)$formKeys['CYEAR'],
            (string)$formKeys['CYEAR2'],
            (int)$formKeys['NRUNNO']
        ];

        return $dbWebflow->query($sql, $binds)->result();
    }
}