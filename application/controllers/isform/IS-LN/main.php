<?php
use GuzzleHttp\Client;
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
class Main extends MY_Controller
{
    use _Form;
    protected $client;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('isform/IS-LN/ln_model', 'im');
        // Load models, libraries, helpers here if needed
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        // Default method
        $data['action'] = $this->im->select('ISLN_ACTION');
        $data['roles']  = $this->im->select('ISLN_ROLE');
        $data['module'] = $this->im->select('ISLN_MODULE');
        $cyear2         = $this->input->get('y2');
        $nrunno         = $this->input->get('runNo');
        // $data = [
        //     'NFRMNO' => $nfrmno = $this->input->get('no'),
        //     'VORGNO' => $vorgno = $this->input->get('orgNo'),
        //     'CYEAR'  => $cyear = $this->input->get('y'),
        //     'CYEAR2' => $cyear2 = $this->input->get('y2'),
        //     'NRUNNO' => $nrunno = $this->input->get('runNo'),
        //     'EMPNO'  => $empno = $this->input->get('empno'),
        // ];

        if (!$cyear2 || !$nrunno) {
            $this->views('isform/IS-LN/index', $data);
        } else {
            // Get form data for view page
            $nfrmno = $this->input->get('no');
            $vorgno = $this->input->get('orgNo');
            $cyear  = $this->input->get('y');
            $empno  = $this->input->get('empno');

            $data = $this->getFormViewData($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
            $this->views('isform/IS-LN/view', $data);
        }
    }

    /**
     * Get form data for view page
     */
    private function getFormViewData($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno)
    {
        // Get form basic data
        $formData = $this->im->select('ISLN_FORM f', [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ], ['ISLN_ACTION a' => 'a.ACTION_ID = f.ACTION_ID']);

        $formData[0]->EMPNO = $empno;

        $data['formData'] = !empty($formData) ? $formData[0] : null;


        // Get form flow data
        // $formFlow = $this->im->select('FORMFLOW', [
        //     'NFRMNO' => $nfrmno,
        //     'VORGNO' => $vorgno,
        //     'CYEAR'  => $cyear,
        //     'CYEAR2' => $cyear2,
        //     'NRUNNO' => $nrunno
        // ]);

        // $data['formFlow'] = !empty($formFlow) ? $formFlow[0] : null;

        // Get employee data for Input By and Request By
        if (!empty($data['formData'])) {
            $inputByEmp          = $this->im->select('AMECUSERALL', ['SEMPNO' => $data['formData']->INPUT_BY]);
            $data['inputByName'] = !empty($inputByEmp) ? $inputByEmp[0]->SNAME : '';

            $requestByEmp          = $this->im->select('AMECUSERALL', ['SEMPNO' => $data['formData']->REQUEST_BY]);
            $data['requestByName'] = !empty($requestByEmp) ? $requestByEmp[0]->SNAME : '';

            // Get user data (the employee being registered)
            $userData         = $this->im->select('AMECUSERALL', ['SEMPNO' => $data['formData']->REQUEST_BY]);
            $data['userData'] = !empty($userData) ? $userData[0] : null;
        }

        // Get permissions
        $permissions = $this->im->select('ISLN_FORM_PERMISSION', [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ]);

        // Group permissions by module
        $groupedPermissions = [];
        if (!empty($permissions)) {
            $modules = $this->im->select('ISLN_MODULE');
            $roles   = $this->im->select('ISLN_ROLE');

            $moduleMap = [];
            foreach ($modules as $module) {
                $moduleMap[$module->MODULE_ID] = $module->MODULE_NAME;
            }

            $roleMap = [];
            foreach ($roles as $role) {
                $roleMap[$role->ROLE_ID] = $role->ROLE_NAME;
            }

            foreach ($permissions as $perm) {
                if (!isset($groupedPermissions[$perm->MODULE_ID])) {
                    $groupedPermissions[$perm->MODULE_ID] = [
                        'module_name' => $moduleMap[$perm->MODULE_ID] ?? 'Unknown',
                        'roles'       => []
                    ];
                }
                $groupedPermissions[$perm->MODULE_ID]['roles'][] = $roleMap[$perm->ROLE_ID] ?? 'Unknown';
            }
        }

        $data['permissions'] = $groupedPermissions;
        $data['formNumber']  = $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $data['mode']        = $this->getMode($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
        // Get approval history


        return $data;
    }

    public function getEmpData()
    {
        // Method to get employee data
        $empId   = $this->input->post('empId');
        $empData = $this->im->select('AMECUSERALL', ['SEMPNO' => $empId]);
        echo json_encode($empData);
    }

    public function saveForm()
    {
        // Method to save form data
        // Set JSON header        
        try {
            $inputBy     = $this->input->post('inputBy');
            $requestBy   = $this->input->post('requestBy');
            $action      = $this->input->post('action');
            $groupCode   = $this->input->post('groupCode');
            $remark      = $this->input->post('remark');
            $permissions = $this->input->post('permissions'); // array of module permissions

            // Validate required fields
            if (empty($inputBy) || empty($requestBy) || empty($action)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
                ]);
                return;
            }


            $formMst = $this->im->select('FORMMST', ['VANAME' => 'IS-LN'])[0];
            $nfrmno  = $formMst->NNO;
            $vorgno  = $formMst->VORGNO;
            $cyear   = $formMst->CYEAR;
            $flow    = $this->create($nfrmno, $vorgno, $cyear, $requestBy, $inputBy, '');
            $form    = $flow['message'];
            $cyear2  = $form['cyear2'];
            $nrunno  = $form['runno'];


            // Prepare main form data
            $formData = [
                'NFRMNO'     => $nfrmno,
                'VORGNO'     => $vorgno,
                'CYEAR'      => $cyear,
                'CYEAR2'     => $cyear2,
                'NRUNNO'     => $nrunno,
                'INPUT_BY'   => $inputBy,
                'REQUEST_BY' => $requestBy,
                'ACTION_ID'  => $action,
                'GROUP_CODE' => $groupCode,
                'REMARK'     => $remark,
                // 'CREATED_AT' => date('Y-m-d H:i:s'),
                // 'UPDATED_AT' => date('Y-m-d H:i:s')
            ];

            // Start transaction
            $this->db->trans_start();

            // Insert main form data
            $this->im->insert('ISLN_FORM', $formData);

            // Insert permissions if any
            if (!empty($permissions) && is_array($permissions)) {
                foreach ($permissions as $moduleId => $roles) {
                    if (is_array($roles) && !empty($roles)) {
                        foreach ($roles as $roleId) {
                            $permissionData = [
                                'NFRMNO'    => $nfrmno,
                                'VORGNO'    => $vorgno,
                                'CYEAR'     => $cyear,
                                'CYEAR2'    => $cyear2,
                                'NRUNNO'    => $nrunno,
                                'MODULE_ID' => $moduleId,
                                'ROLE_ID'   => $roleId
                            ];
                            $this->im->insert('ISLN_FORM_PERMISSION', $permissionData);
                        }
                    }
                }
            }

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                echo json_encode([
                    'success' => false,
                    'message' => 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'message' => 'บันทึกข้อมูลสำเร็จ',
                    'formNo'  => $nrunno,
                    'formId'  => $vorgno . '-' . $cyear2 . '-' . str_pad($nrunno, 5, '0', STR_PAD_LEFT)
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
            ]);
        }
    }

}