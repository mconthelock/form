<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Control_mst extends MY_Controller {

    public $CodeForm = 'AMEC-AR';
    public function __construct() {
        parent::__construct();
        
        // 1. ป้องกันปัญหา Database Instance เป็น null
        
        $this->load->database();
        if (!isset($this->smmt)) {
            $this->smmt = $this->load->database('SMMT', TRUE);
        }
        if (!isset($this->webflow)) {
            $this->webflow = $this->load->database('DEFAULT', TRUE);
        }

        
        $this->host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'amecweb';
        
        $isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') 
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

        $this->http = "http" . ($isHttps ? "s" : "");
        
        
        $this->load->model('feform/FE-ASP/Fe_asp_model', 'MainModel');
    }

    public function index() {
        $empNo = trim((string)($this->input->get('empno') ?? ''));
        
        $isAdmin = ($empNo === '13204') || (!empty($empNo) && $this->MainModel->isFormAdmin($this->CodeForm, $empNo));

        if (!$isAdmin) {
            show_error('Access Denied: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการ Master Control No. ได้', 403, 'Forbidden');
        }

        $data['empno']       = $empNo;
        $data['controls']    = $this->MainModel->getAdminControlMasterList();
        $data['divisions']   = $this->MainModel->getAllDivisions();
        $data['departments'] = $this->MainModel->getAllDepartmentsList();

        $this->views('feform/FE-ASP/control_mst', $data);
    }

    /**
     * AJAX ดึง Department ภายใต้ Division (เทียบ 2 หลักแรก)
     */
    public function ajaxGetDepartmentsByDiv() {
        $this->output->set_content_type('application/json');
        try {
            $divCode = trim((string)$this->input->get('divCode'));
            $departments = $this->MainModel->getDepartmentsByDiv($divCode);

            return $this->output->set_output(json_encode([
                'status'      => true,
                'departments' => $departments ?: []
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    /**
     * AJAX ดึง Section (4 หลักแรก) และพนักงานใน Department เดียวกันทั้งหมด
     */
    public function ajaxGetDeptDetails() {
        $this->output->set_content_type('application/json');
        try {
            $depCode = trim((string)$this->input->get('depCode'));
            $sections  = $this->MainModel->getSectionsByDept($depCode);
            $employees = $this->MainModel->getEmployeesByDept($depCode);

            return $this->output->set_output(json_encode([
                'status'    => true,
                'sections'  => $sections ?: [],
                'employees' => $employees ?: []
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    /**
     * AJAX บันทึกข้อมูล
     */
    public function ajaxSave() {
        $this->output->set_content_type('application/json');
        try {
            $isEdit      = $this->input->post('isEdit') === '1';
            $controlNo   = trim((string)$this->input->post('CONTROL_NO'));
            $controlName = trim((string)$this->input->post('CONTROL_NAME'));
            $divCode     = trim((string)$this->input->post('SDIVCODE'));
            $depCode     = trim((string)$this->input->post('SDEPCODE'));
            $secCode     = trim((string)$this->input->post('SSECCODE')) ?: '00';
            $respEmpNo   = trim((string)$this->input->post('RESP_EMPNO'));
            $activeFlag  = trim((string)$this->input->post('ACTIVE_FLAG')) ?: 'Y';

            if (empty($controlNo))   throw new Exception('กรุณากรอก Control Number');
            if (empty($controlName)) throw new Exception('กรุณากรอก Control Name');
            if (empty($divCode))     throw new Exception('กรุณาเลือก Division');
            if (empty($depCode))     throw new Exception('กรุณาเลือก Department');
            if (empty($respEmpNo))   throw new Exception('กรุณาเลือกผู้รับผิดชอบ (PIC ประจำแผนก)');

            $data = [
                'CONTROL_NO'   => $controlNo,
                'CONTROL_NAME' => $controlName,
                'SDIVCODE'     => $divCode,
                'SDEPCODE'     => $depCode,
                'SSECCODE'     => $secCode,
                'RESP_EMPNO'   => $respEmpNo,
                'ACTIVE_FLAG'  => $activeFlag
            ];

            $oldKeys = [];
            if ($isEdit) {
                $oldKeys = [
                    'CONTROL_NO' => trim((string)$this->input->post('OLD_CONTROL_NO')),
                    'SDIVCODE'   => trim((string)$this->input->post('OLD_SDIVCODE')),
                    'SDEPCODE'   => trim((string)$this->input->post('OLD_SDEPCODE')),
                    'SSECCODE'   => trim((string)$this->input->post('OLD_SSECCODE')),
                ];
            }

            $this->MainModel->saveControlMasterRow($data, $isEdit, $oldKeys);

            return $this->output->set_output(json_encode([
                'status'  => true,
                'message' => $isEdit ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มรายการใหม่สำเร็จ'
            ]));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    /**
     * AJAX ลบข้อมูล
     */
    public function ajaxDelete() {
        $this->output->set_content_type('application/json');
        try {
            $keys = [
                'CONTROL_NO' => trim((string)$this->input->post('CONTROL_NO')),
                'SDIVCODE'   => trim((string)$this->input->post('SDIVCODE')),
                'SDEPCODE'   => trim((string)$this->input->post('SDEPCODE')),
                'SSECCODE'   => trim((string)$this->input->post('SSECCODE')),
            ];

            if (empty($keys['CONTROL_NO']) || empty($keys['SDIVCODE']) || empty($keys['SDEPCODE'])) {
                throw new Exception('ข้อมูลสำหรับระบุรายการไม่ครบถ้วน');
            }

            $this->MainModel->deleteControlMasterRow($keys);

            return $this->output->set_output(json_encode(['status' => true, 'message' => 'ลบรายการสำเร็จ']));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }
    
    /**
     * AJAX ตรวจสอบความครบถ้วนของเอกสาร Yearly ในรอบปีปัจจุบัน
     */
    public function ajaxCheckYearlyCompleteness() {
        $this->output->set_content_type('application/json');
        try {
            // ดึงปีปัจจุบันของระบบ Webflow
            $cYear2 = trim((string)$this->input->get('year'));
            if (empty($cYear2)) {
                $formRow = $this->load->database('DEFAULT', TRUE)
                    ->query("SELECT CYEAR FROM FORMMST WHERE UPPER(TRIM(VANAME)) = '". $this->CodeForm ."'")
                    ->row_array();
                $cYear2 = $formRow['CYEAR'] ?? date('Y');
            }

            $records = $this->MainModel->getYearlyCompletenessStatus($cYear2);

            $totalActive = count($records);
            $created     = 0;
            $missing     = [];
            $noPic       = [];

            foreach ($records as $r) {
                if ($r['GENERATE_STATUS'] === 'CREATED') {
                    $created++;
                } elseif ($r['GENERATE_STATUS'] === 'NO_PIC') {
                    $noPic[] = $r;
                } else {
                    $missing[] = $r;
                }
            }

            return $this->output->set_output(json_encode([
                'status'       => true,
                'year'         => $cYear2,
                'total'        => $totalActive,
                'createdCount' => $created,
                'isComplete'   => ($created === $totalActive),
                'missing'      => $missing,
                'noPic'        => $noPic
            ], JSON_UNESCAPED_UNICODE));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE));
        }
    }

    /**
     * AJAX เช็คว่า Control No. ของแผนกนั้น มีเอกสาร Yearly ในรอบปีปัจจุบันหรือยัง
     */
    public function ajaxCheckSingleYearlyDoc() {
        $this->output->set_content_type('application/json');
        try {
            $controlNo = trim((string)$this->input->get('controlNo'));
            $depCode   = trim((string)$this->input->get('depCode'));
            $currentYear4 = date('Y'); // '2026'

            if (empty($controlNo) || empty($depCode)) {
                throw new Exception('ข้อมูลไม่ครบถ้วน');
            }

            $existDoc = $this->MainModel->getExistingYearlyDoc($controlNo, $depCode, $currentYear4);

            return $this->output->set_output(json_encode([
                'status'   => true,
                'hasDoc'   => !empty($existDoc),
                'year'     => $currentYear4,
                'docNo'    => $existDoc['DOC_NO'] ?? null,
                'docStatus'=> $existDoc['STATUS'] ?? null
            ], JSON_UNESCAPED_UNICODE));
        } catch (\Throwable $e) {
            return $this->output->set_output(json_encode([
                'status'  => false,
                'message' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE));
        }
    }

}