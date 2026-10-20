<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Fe_asp_service {

    protected $CI;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->model('feform/FE-ASP/Fe_asp_model', 'MainModel');
    }

    /**
     * ประมวลผลการสร้างเอกสาร Yearly Review
     * @param string $targetControlNo หากส่งมาจะทำเฉพาะ Control นั้น
     * @param string $targetEmpNo หากส่งมาจะ override ผู้จัดทำเป็นคนนี้
     * @param bool $checkDuplicate ตรวจสอบว่าเคยสร้างในปีปัจจุบันแล้วหรือไม่
     */
    public function generateYearlyDrafts($targetControlNo = '', $targetEmpNo = '', $checkDuplicate = true) {
        // 1. ดึงข้อมูล Form Master FE-ASP
        $formMst = $this->CI->getFormMasterByVaname('FE-ASP');
        $formData = $formMst['data'] ?? $formMst[0];
        if (empty($formData)) {
            throw new Exception('ไม่พบการตั้งค่า Master Form สำหรับ FE-ASP ในระบบ Webflow');
        }

        // 2. ดึงรายการ Control ตามเงื่อนไข
        $controls = $this->CI->MainModel->getActiveControlsForYearly($targetControlNo, empty($targetEmpNo) ? '' : $targetEmpNo);
        if (empty($controls)) {
            return [
                'status'  => false,
                'message' => 'ไม่พบรายการ Control No. ที่มีผู้รับผิดชอบ (RESP_EMPNO)',
                'created' => [],
                'skipped' => []
            ];
        }

        $createdList = [];
        $skippedList = [];

        foreach ($controls as $ctrl) {
            $cNo    = $ctrl['CONTROL_NO'];
            $dep    = $ctrl['SDEPCODE'];
            $div    = $ctrl['SDIVCODE'];
            $sec    = $ctrl['SSECCODE'] ?: '00';
            $resp   = !empty($targetEmpNo) ? $targetEmpNo : $ctrl['RESP_EMPNO'];

            // 3. ป้องกันการสร้างเอกสาร Yearly ซ้ำในปีเดียวกัน
            if ($checkDuplicate && $this->CI->MainModel->isYearlyDocExistInYear($cNo, $dep, $formData['CYEAR'])) {
                $skippedList[] = [
                    'control_no' => $cNo,
                    'dep_code'   => $dep,
                    'empno'      => $resp,
                    'reason'     => 'มีเอกสาร Yearly ในรอบปีนี้อยู่แล้ว'
                ];
                continue;
            }

            $this->CI->db->trans_begin();
            try {
                // 4. สั่งสร้าง Form บน Flow ด้วยสถานะ DRAFT = 1
                $flowData = [
                    'NFRMNO'  => $formData['NNO'],
                    'VORGNO'  => $formData['VORGNO'],
                    'CYEAR'   => $formData['CYEAR'],
                    'REQBY'   => $resp,
                    'INPUTBY' => $resp,
                    'REMARK'  => 'Yearly Review (Auto Generated)',
                    'DRAFT'   => '1'
                ];

                $rsf = $this->CI->createForm($flowData);
                if (!$rsf || empty($rsf['status'])) {
                    throw new Exception("Webflow Error: " . ($rsf['message'] ?? 'Create Form Failed'));
                }

                $cyear2 = $rsf['data']['CYEAR2'];
                $nrunno = $rsf['data']['NRUNNO'];
                $docNo  = "FE-ASP-" . $cyear2 . "-" . str_pad($nrunno, 6, '0', STR_PAD_LEFT);

                // 5. บันทึก Header ตาราง FE_ASP_HEADER ให้เป็น DRAFT และโหมด AUTO
                $headerData = [
                    'DOC_NO'           => $docNo,
                    'CONTROL_NO'       => $cNo,
                    'SDIVCODE'         => $div,
                    'SDEPCODE'         => $dep,
                    'SSECCODE'         => $sec,
                    'NFRMNO'           => $formData['NNO'],
                    'VORGNO'           => $formData['VORGNO'],
                    'CYEAR'            => $formData['CYEAR'],
                    'CYEAR2'           => $cyear2,
                    'NRUNNO'           => $nrunno,
                    'REQ_BY'           => $resp,
                    'INPUT_BY'         => $resp,
                    'REVIEW_PERIOD'    => 'YEARLY',
                    'REVIEW_DETAILS'   => 'NO_CHANGE',
                    'DETAIL_OF_CHANGE' => '',
                    'EFFECT_STATUS'    => 'NO_EFFECT',
                    'STATUS'           => 'DRAFT',
                    'CREATE_MODE'      => 'AUTO',
                    'IS_AUTO_JOB'      => 'Y',
                    'USER_ACTION'      => $resp,
                    'REMARK'           => 'Yearly Review Draft (รอพนักงานยืนยันข้อมูล)',
                ];

                $headerId = $this->CI->MainModel->insertHeader($headerData);

                $this->CI->db->trans_commit();

                $createdList[] = [
                    'doc_no'        => $docNo,
                    'header_id'     => $headerId,
                    'control_no'    => $cNo,
                    'dep_code'      => $dep,
                    'empno'         => $resp,
                    'nfrmno'        => $formData['NNO'],
                    'vorgno'        => $formData['VORGNO'],
                    'cyear'         => $formData['CYEAR'],
                    'cyear2'        => $cyear2,
                    'nrunno'        => $nrunno
                ];
            } catch (\Throwable $e) {
                $this->CI->db->trans_rollback();
                $skippedList[] = [
                    'control_no' => $cNo,
                    'dep_code'   => $dep,
                    'empno'      => $resp,
                    'reason'     => $e->getMessage()
                ];
            }
        }

        return [
            'status'  => true,
            'created' => $createdList,
            'skipped' => $skippedList
        ];
    }
}