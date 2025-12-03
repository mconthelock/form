<?php
use GuzzleHttp\Client;
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
function pre_array($array)
{
    echo '<pre>';
    print_r($array);
    echo '</pre>';
}
class Main extends MY_Controller
{
    use _Form;

    protected $client;
    protected $programMap;

    public function __construct()
    {
        parent::__construct();
        $this->load->model('isform/IS-RGV/rgv_model', 'rm');
        $this->client = new Client(['verify' => false]);

        $this->programMap = [
            'invoice'     => [
                'user_fn' => 'invoice_user',
                'key'     => 'user_id',
                'view'    => 'isform/IS-RGV/invoice_view',
            ],
            'marketing'   => [
                'user_fn' => 'marketing_user',
                'key'     => 'user_id',
                'view'    => 'isform/IS-RGV/marketing_view',
            ],
            'procurement' => [
                'user_fn' => 'procurement_user',
                'key'     => 'SEMPNO',
                'view'    => 'isform/IS-RGV/procurement_view',
            ],
            'scm'         => [
                'user_fn' => 'scm_user',
                'key'     => 'EMPNO',
                'view'    => 'isform/IS-RGV/scm_view',
            ],
            'as400'       => [
                'user_fn' => 'as400_user',
                'key'     => 'EMPNO',
                'view'    => 'isform/IS-RGV/as400_view',
            ],
            'ln'          => [
                'user_fn' => null,
                'key'     => null,
                'view'    => 'isform/IS-RGV/ln_view',
            ],
            'wsd'         => [
                'user_fn' => 'is_user',
                'key'     => 'EMPNO',
                'view'    => 'isform/IS-RGV/is_view',
            ],
            'aas'         => [
                'user_fn' => 'is_user',
                'key'     => 'EMPNO',
                'view'    => 'isform/IS-RGV/is_view',
            ],
            'ssa'         => [
                'user_fn' => 'is_user',
                'key'     => 'EMPNO',
                'view'    => 'isform/IS-RGV/is_view',
            ],
        ];
    }

    public function index()
    {
        $req  = $this->getRequestParams();
        $data = [
            'NFRMNO' => $req['no'],
            'VORGNO' => $req['orgNo'],
            'CYEAR'  => $req['y'],
            'CYEAR2' => $req['y2'],
            'NRUNNO' => $req['runNo'],
            'EMPNO'  => $req['empno'],
        ];

        $form = $this->rm->getForm($req['no'], $req['orgNo'], $req['y'], $req['y2'], $req['runNo']);
        if (empty($form)) {
            show_error('Form not found', 404);
            return;
        }

        $data_form = $form[0];
        $program   = isset($data_form->PROGRAM) ? strtolower($data_form->PROGRAM) : null;
        $emp_form  = $this->rm->getEmpForm($req['y2'], $req['runNo']);
        $empnos    = array_column($emp_form, 'EMPNO');
        $empSet    = array_flip($empnos);

        $data['form']       = $data_form;
        $data['empform']    = $emp_form;
        $data['program']    = strtoupper($program);
        $data['mode']       = $this->getMode($req['no'], $req['orgNo'], $req['y'], $req['y2'], $req['runNo'], $req['empno']);
        $data['formNumber'] = $this->toFormNumber($req['no'], $req['orgNo'], $req['y'], $req['y2'], $req['runNo']);

        if (!isset($this->programMap[$program])) {
            show_error('Program not supported', 400);
            return;
        }

        if ($program === 'ln') {
            $data['rows'] = $this->rm->test_data($data_form->EMPCHECKER);
            $this->views($this->programMap[$program]['view'], $data);
            return;
        }

        $cfg      = $this->programMap[$program];
        $userList = call_user_func([$this->rm, $cfg['user_fn']], strtoupper($program));
        $key      = $cfg['key'];

        $filtered = [];
        foreach ($userList as $u) {
            $k = isset($u->$key) ? trim($u->$key) : null;
            if ($k !== null && isset($empSet[$k]))
                $filtered[] = $u;
        }

        $data['user'] = $this->mergeResultToUser($filtered, $emp_form, $key, $program);
        $this->views($cfg['view'], $data);
    }

    public function getSummaryData()
    {
        $period  = $this->input->post('period');
        $year    = $this->input->post('year');
        $data    = $this->rm->getSummaryData($period, $year);
        $grouped = [];
        $id      = 1;
        foreach ($data as $row) {
            $group = trim($row->SYSTEM_GROUP_NAME);
            if (!isset($grouped[$group])) {
                $grouped[$group] = [
                    'id'               => $id++,
                    'main_system_name' => $group,
                    'total_users'      => 0,
                    'unmatched'        => rand(0, 5), // ใส่ตัวอย่างไว้ก่อน (สามารถดึงจริงภายหลัง)
                    'programs'         => []
                ];
            }

            $grouped[$group]['total_users']  += $row->EMP_COUNT;
            $grouped[$group]['programs'][]    = ['name' => $row->PROGRAM_NAME, 'checked' => $row->RESULT_1, 'uncheck' => $row->RESULT_NULL];
        }

        $systems = array_values($grouped);

        echo json_encode(['systems' => $systems]);
    }

    public function createSummaryView()
    {
        // $data    = $this->rm->getSummaryData(date("Y"));
        // $grouped = [];
        // $id      = 1;
        // foreach ($data as $row) {
        //     $group = trim($row->SYSTEM_GROUP_NAME);
        //     if (!isset($grouped[$group])) {
        //         $grouped[$group] = [
        //             'id'               => $id++,
        //             'main_system_name' => $group,
        //             'total_users'      => 0,
        //             'unmatched'        => rand(0, 5), // ใส่ตัวอย่างไว้ก่อน (สามารถดึงจริงภายหลัง)
        //             'programs'         => []
        //         ];
        //     }

        //     $grouped[$group]['total_users'] += $row->EMP_COUNT;
        //     $grouped[$group]['programs'][]  = ['name' => $row->PROGRAM_NAME, 'checked' => $row->RESULT_1, 'uncheck' => $row->RESULT_NULL];
        // }

        // $systems = array_values($grouped);

        // $systems = [
        //     [
        //         'id'               => 1,
        //         'main_system_name' => 'Purchasing system',
        //         'total_users'      => 476,
        //         'unmatched'        => 2,
        //         'programs'         => [['name' => 'AS400'], ['name' => 'Procurement']]
        //     ],
        //     [
        //         'id'               => 2,
        //         'main_system_name' => 'Financial system',
        //         'total_users'      => 76,
        //         'unmatched'        => 2,
        //         'programs'         => [['name' => 'Invoice'], ['name' => 'LN']]
        //     ],
        //     [
        //         'id'               => 3,
        //         'main_system_name' => 'Marketing system',
        //         'total_users'      => 98,
        //         'unmatched'        => 5,
        //         'programs'         => [['name' => 'Invoice System'], ['name' => 'Marketing System']]
        //     ],
        //     [
        //         'id'               => 4,
        //         'main_system_name' => 'Production & Logistics system',
        //         'total_users'      => 125,
        //         'unmatched'        => 0,
        //         'programs'         => [['name' => 'AS400']]
        //     ],
        // ];
        $this->views('isform/IS-RGV/summary_view');
    }

    public function test_view()
    {
        $req  = $this->getRequestParams();
        $data = [
            'NFRMNO' => $req['no'],
            'VORGNO' => $req['orgNo'],
            'CYEAR'  => $req['y'],
            'CYEAR2' => $req['y2'],
            'NRUNNO' => $req['runNo'],
            'EMPNO'  => $req['empno'],
        ];

        $form = $this->rm->getForm($req['no'], $req['orgNo'], $req['y'], $req['y2'], $req['runNo']);
        if (empty($form)) {
            show_error('Form not found', 404);
            return;
        }

        $data['form']    = $form[0];
        $data['program'] = isset($data['form']->PROGRAM) ? $data['form']->PROGRAM : null;
        $data['empform'] = $this->rm->getEmpForm($req['y2'], $req['runNo']);
        $data['mode']    = $this->getMode($req['no'], $req['orgNo'], $req['y'], $req['y2'], $req['runNo'], $req['empno']);

        $this->views('isform/IS-RGV/view', $data);
    }

    private function mergeResultToUser($userList, $empForm, $keyField, $program)
    {
        $empMap = [];
        // pre_array($userList);
        foreach ($empForm as $e) {
            if (in_array($program, ['wsd', 'aas', 'ssa'])) {
                $empno  = isset($e['EMPNO']) ? trim($e['EMPNO']) : null;
                $userno = isset($e['USER_LOGIN']) ? trim($e['USER_LOGIN']) : null;
                if ($empno !== null && $userno !== null)
                    $empMap[$empno . '|' . $userno] = ['RESULT' => $e['RESULT'] ?? null, 'DETAIL' => $e['DETAIL'] ?? null];
            } else {
                $k = isset($e['EMPNO']) ? trim($e['EMPNO']) : null;
                if ($k !== null)
                    $empMap[$k] = ['RESULT' => $e['RESULT'] ?? null, 'DETAIL' => $e['DETAIL'] ?? null];
            }

        }
        foreach ($userList as $item) {

            $k = isset($item->$keyField) ? trim($item->$keyField) : null;
            if (in_array($program, ['wsd', 'aas', 'ssa'])) {
                $empno  = $k;
                $userno = isset($item->USER_LOGIN) ? trim($item->USER_LOGIN . "_" . $item->SERVER_NAME) : null;
                $k      = $empno . '|' . $userno;
            }
            // echo $k;
            // pre_array($empMap);
            if ($k !== null && isset($empMap[$k])) {
                $item->RESULT = $empMap[$k]['RESULT'];
                $item->DETAIL = $empMap[$k]['DETAIL'];
            } else {
                $item->RESULT = null;
                $item->DETAIL = null;
            }
        }
        return $userList;
    }

    public function createform($empno, $program, $owner, $org_code)
    {
        $form   = $this->create('7', '050601', '25', $empno, $empno, '', 1);
        $NFRMNO = $form['message']['formtype'];
        $VORGNO = $form['message']['owner'];
        $CYEAR  = $form['message']['cyear'];
        $CYEAR2 = $form['message']['cyear2'];
        $NRUNNO = $form['message']['runno'];

        $month  = date('n');
        $month  = 11;
        $period = ($month == 5) ? 1 : (($month == 11) ? 2 : 1);

        $this->rm->insert('ISRGV_FORM', [
            'NFRMNO'     => $NFRMNO,
            'VORGNO'     => $VORGNO,
            'CYEAR'      => $CYEAR,
            'CYEAR2'     => $CYEAR2,
            'NRUNNO'     => $NRUNNO,
            'PROGRAM'    => $program,
            'EMPCHECKER' => $empno,
            'STATUS'     => '1',
            'ORGCODE'    => $org_code,
            'PERIOD'     => $period
        ]);

        $prog     = strtoupper($program);
        $mapFirst = [
            'SCM'         => '10001',
            'AS400'       => '10001',
            'PROCUREMENT' => '10001',
            'INVOICE'     => '08243',
            'MARKETING'   => '08243',
            'LN'          => null
        ];
        if ($prog === 'LN') {
            $this->deleteFlowStep('', $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
        } else if ($prog === 'WSD' || $prog === 'AAS' || $prog === 'SSA') {
            $this->deleteFlowStep('', $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '03', '02');
            $this->deleteFlowStep('', $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '02', '57');
            $this->deleteFlowStep('', $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
            $this->deleteFlowStep('', $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '18', '00');
        } else {
            $apv = isset($mapFirst[$prog]) ? $mapFirst[$prog] : '10001';
            $this->updateFlowApv("", $apv, $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
        }
        $this->updateFlowApv("", $owner, $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '18', '00');

        return $form['message'];
    }

    public function setIncharge()
    {
        $data['program'] = $this->rm->getProgram();
        $this->views('isform/IS-RGV/setIncharge', $data);
    }

    public function updatePic()
    {
        $program  = $this->input->post('program');
        $org_code = $this->input->post('org_code');
        $PIC      = $this->input->post('PIC');

        $this->rm->update("ISRGV_INCHARGE", ['PIC' => $PIC], ['ORG_CODE' => $org_code, 'PROGRAM' => $program]);
    }

    public function getIncharge()
    {
        $data = $this->rm->getUserIncharge();
        $this->output->set_content_type('application/json')->set_output(json_encode($data));
    }

    public function JobsCreateRGV()
    {
        $programList = $this->rm->getProgram();
        $emailSent   = []; // เก็บ PIC ที่ส่ง email ไปแล้ว
        $picForms    = []; // เก็บฟอร์มของแต่ละ PIC

        foreach ($programList as $programItem) {
            $pname = strtolower($programItem->PROGRAM);
            if (!isset($this->programMap[$pname]) || $pname === 'ln')
                continue;

            $cfg = $this->programMap[$pname];
            echo "pname : " . $pname . "<br>";

            $filteredData = [];
            if (in_array($pname, ['wsd', 'aas', 'ssa'])) {
                $userList = call_user_func([$this->rm, $cfg['user_fn']], strtoupper($pname));
                $userIds  = $this->collectProgramUserIds($pname, $userList);
                $dataIn   = $this->rm->getIncharge($programItem->PROGRAM);

                $arr = [];
                foreach ($userIds as $item) {
                    $dataEmp = $this->rm->getUserall($item['EMPNO']);
                    if (!empty($dataEmp)) {
                        $emp   = $dataEmp[0];
                        $arr[] = [
                            'SEMPNO'      => $emp->SEMPNO,
                            'SNAME'       => $emp->SNAME,
                            'CSTATUS'     => $emp->CSTATUS,
                            'SSECTYPE'    => $emp->SSECCODE,
                            'SDEPTTYPE'   => $emp->SDEPCODE,
                            'USER_LOGIN'  => $item['USER_LOGIN'],
                            'SERVER_NAME' => $item['SERVER_NAME']
                        ];
                    }
                }

                $program      = (array) $dataIn[0];
                $filteredData = array();
                foreach ($arr as $a) {
                    $filteredData[] = (object) array_merge($a, $program);
                }
            } else {
                $userList  = call_user_func([$this->rm, $cfg['user_fn']]);
                $userIds   = $this->collectProgramUserIds($pname, $userList);
                $dataUser  = $this->rm->get_data_user($programItem->PROGRAM);
                $userIdSet = array_flip($userIds);
                foreach ($dataUser as $item) {
                    if (isset($userIdSet[$item->SEMPNO]))
                        $filteredData[] = $item;
                }
            }

            $incharge = $this->rm->getIncharge($programItem->PROGRAM);
            $orgMap   = [];
            foreach ($incharge as $it) {
                if (!isset($orgMap[$it->PIC])) {
                    $orgMap[$it->PIC] = [
                        'orgs'      => [],
                        'owner'     => null,
                        'sum_group' => $it->SUMMARY_GROUP
                    ];
                }
                $orgMap[$it->PIC]['orgs'][] = $it->ORG_CODE;
                $orgMap[$it->PIC]['owner']  = $it->DATAOWNER;
            }

            $ownerCache   = [];
            $mainApvCache = [];
            $grouped      = [];

            foreach ($filteredData as $idx => $u) {
                $progCode = $u->PROGRAM_CODE;
                if (!isset($ownerCache[$progCode])) {
                    $o                     = $this->rm->getOwner($progCode);
                    $ownerCache[$progCode] = empty($o) ? null : $o[0]->DATAOWNER;
                }
                $owner = $ownerCache[$progCode];
                if ($owner === null)
                    continue;

                if (!isset($mainApvCache[$owner])) {
                    $m                    = $this->rm->getMainApv($owner);
                    $mainApvCache[$owner] = empty($m) ? null : $m[0]->EMPNO;
                }
                $main_apv = $mainApvCache[$owner];
                if ($main_apv === null)
                    continue;

                $pic = $u->PIC;
                $org = $u->ORG_CODE;

                if (!isset($orgMap[$pic]) || !in_array($org, $orgMap[$pic]['orgs']))
                    continue;

                if (!isset($grouped[$pic])) {
                    $grouped[$pic] = ['users' => [], 'owner' => $main_apv, 'org' => $org];
                }
                $grouped[$pic]['users'][$idx] = $u;
            }

            echo "<br>Count : " . count($grouped) . "<br>";
            echo "<pre>";
            print_r($grouped);
            echo "</pre>";

            foreach ($grouped as $pic => $userGroup) {
                $form   = $this->createform(trim($pic), $programItem->PROGRAM, $userGroup['owner'], $userGroup['org']);
                $NRUNNO = $form['runno'];
                $CYEAR2 = $form['cyear2'];

                $form_arr = [
                    'nfrmno'  => $form['formtype'],
                    'vorgno'  => $form['owner'],
                    'cyear'   => $form['cyear'],
                    'cyear2'  => $form['cyear2'],
                    'nrunno'  => $form['runno'],
                    'program' => $programItem->PROGRAM, // เก็บ program สำหรับส่ง email
                ];

                $picTrimmed = trim($pic);
                if (!isset($picForms[$picTrimmed])) {
                    $picForms[$picTrimmed] = [];
                }
                $picForms[$picTrimmed][] = $form_arr;

                $this->db->trans_start();
                foreach ($userGroup['users'] as $it) {
                    $data = [
                        'NRUNNO'        => $NRUNNO,
                        'CYEAR2'        => $CYEAR2,
                        'EMPNO'         => $it->SEMPNO,
                        'SUMMARY_GROUP' => $it->SUMMARY_GROUP
                    ];

                    if (in_array($pname, ['wsd', 'aas', 'ssa'])) {
                        $data['USER_LOGIN'] = isset($it->USER_LOGIN)
                            ? $it->USER_LOGIN . "_" . $it->SERVER_NAME
                            : null;
                    } elseif ($pname === 'scm') {
                        $loginList = $this->expandScmLoginList($userList, $it->SEMPNO);
                        foreach ($loginList as $login) {
                            $data['EMPNO'] = $login;
                            $this->rm->insert('ISRGV_EMP', $data);
                        }
                        continue;
                    }

                    $this->rm->insert('ISRGV_EMP', $data);
                }
                $this->db->trans_complete();

                // break;
            }
            // break;
        }

        $authorizeList = $this->rm->getLnauthorize();
        $lnUsers       = array_column($authorizeList, 'EMPNO');

        print_r($lnUsers);

        foreach ($lnUsers as $val) {
            $lnOwner = $this->rm->get_orgpos("040101", "10");
            if (empty($lnOwner))
                continue;

            $form   = $this->createform(trim($val), 'LN', $lnOwner[0]->VEMPNO, '040101');
            $NRUNNO = $form['runno'];
            $CYEAR2 = $form['cyear2'];

            $this->rm->insert('ISRGV_EMP', [
                'NRUNNO'        => $NRUNNO,
                'CYEAR2'        => $CYEAR2,
                'EMPNO'         => $val,
                'SUMMARY_GROUP' => '4'
            ]);

            $valTrimmed = trim($val);
            if (!isset($picForms[$valTrimmed])) {
                $picForms[$valTrimmed] = [];
            }
            $picForms[$valTrimmed][] = [
                'nfrmno'  => $form['formtype'],
                'vorgno'  => $form['owner'],
                'cyear'   => $form['cyear'],
                'cyear2'  => $form['cyear2'],
                'nrunno'  => $form['runno'],
                'program' => 'LN', // เก็บ program สำหรับส่ง email
            ];
        }

        // ส่ง email รวมให้แต่ละ PIC ทีเดียว
        echo "<br>---------------Sending emails------------------------<br>";
        foreach ($picForms as $pic => $forms) {
            if (!empty($forms)) {
                // ใช้ program จากฟอร์มแรกเป็นชื่อหลักใน subject
                $programName = isset($forms[0]['program']) ? $forms[0]['program'] : 'Regular Review';
                $formCount   = count($forms);
                
                echo "Sending email to: " . $pic . " with " . $formCount . " form(s)<br>";
                $this->sendmail($pic, $programName, $formCount, $forms);
            }
        }
        echo "<br>----------------------------------------------<br>";
    }


    public function Update_Result()
    {
        $post = $this->input->post('data');
        if (!is_array($post) || empty($post))
            return;

        $this->db->trans_start();
        foreach ($post as $v) {
            $whereEmp = [
                'NRUNNO' => $v['nrunno'],
                'CYEAR2' => $v['cyear2'],
                'EMPNO'  => trim($v['usr_login']),
            ];
            // If userLoginData exists in post, add to where condition
            if (isset($v['userLoginData']) && $v['userLoginData'] !== '') {
                $whereEmp['USER_LOGIN'] = $v['userLoginData'];
            }
            $dataEmp = [
                'RESULT' => $v['result'],
                'DETAIL' => $v['remark'],
            ];
            $this->rm->update('ISRGV_EMP', $dataEmp, $whereEmp, 'UPDATE_AT');

            $whereForm = [
                'NFRMNO' => $v['nfrmno'],
                'VORGNO' => $v['vorgno'],
                'CYEAR'  => $v['cyear'],
                'CYEAR2' => $v['cyear2'],
                'NRUNNO' => $v['nrunno'],
            ];
            $this->rm->update('ISRGV_FORM', ['STATUS' => '2'], $whereForm);
        }
        $this->db->trans_complete();
    }

    // public function LN()
    // {
    //     $data['rows'] = $this->rm->test_data();
    //     $this->views('isform/IS-RGV/test', $data);
    // }

    public function test_one()
    {
        $this->views('isform/IS-RGV/test_one');
    }

    public function insert()
    {
        $menu_id    = $this->input->post('menu_id');
        $is_checked = $this->input->post('is_checked');
        $empno      = $this->input->post('empno');

        $this->rm->insert('ISRGV_LN_AUTHORIZE', [
            'MENU_ID' => $menu_id,
            'STATUS'  => '1',
            'EMPNO'   => $empno
        ]);
    }

    private function getRequestParams()
    {
        return [
            'no'    => $this->input->get('no'),
            'orgNo' => $this->input->get('orgNo'),
            'y'     => $this->input->get('y'),
            'y2'    => $this->input->get('y2'),
            'runNo' => $this->input->get('runNo'),
            'empno' => $this->input->get('empno'),
        ];
    }

    private function collectProgramUserIds($programName, $userList)
    {
        if ($programName === 'invoice' || $programName === 'marketing') {
            return array_column($userList, 'user_id');
        }
        if ($programName === 'procurement') {
            return array_column($userList, 'SEMPNO');
        }
        if ($programName === 'as400') {
            $ids = array_column($userList, 'EMPNO');
            return array_map('trim', $ids);
        }
        if ($programName === 'scm') {
            $logins = array_column($userList, 'USR_LOGIN');
            return array_map(function ($v) {
                return preg_replace('/^(\d+)[A-Za-z]*$/', '$1', $v);
            }, $logins);
        }
        if ($programName === 'wsd') {
            $result = [];
            foreach ($userList as $item) {
                $empno       = isset($item->EMPNO) ? trim($item->EMPNO) : '';
                $user_login  = isset($item->USER_LOGIN) ? trim($item->USER_LOGIN) : '';
                $server_name = isset($item->SERVER_NAME) ? trim($item->SERVER_NAME) : '';
                if (!empty($empno) && !empty($user_login)) {
                    $result[] = [
                        'EMPNO'       => $empno,
                        'USER_LOGIN'  => $user_login,
                        'SERVER_NAME' => $server_name
                    ];
                }
            }
            return $result;
        }
        if ($programName === 'aas') {
            // คืนค่าเป็น array ของ array ที่มี EMPNO และ USER_LOGIN
            $result = [];
            foreach ($userList as $item) {
                $empno       = isset($item->EMPNO) ? trim($item->EMPNO) : '';
                $user_login  = isset($item->USER_LOGIN) ? trim($item->USER_LOGIN) : '';
                $server_name = isset($item->SERVER_NAME) ? trim($item->SERVER_NAME) : '';
                if (!empty($empno) && !empty($user_login)) {
                    $result[] = [
                        'EMPNO'       => $empno,
                        'USER_LOGIN'  => $user_login,
                        'SERVER_NAME' => $server_name
                    ];
                }
            }
            return $result;
        }
        if ($programName === 'ssa') {
            // คืนค่าเป็น array ของ array ที่มี EMPNO และ USER_LOGIN
            $result = [];
            foreach ($userList as $item) {
                $empno       = isset($item->EMPNO) ? trim($item->EMPNO) : '';
                $user_login  = isset($item->USER_LOGIN) ? trim($item->USER_LOGIN) : '';
                $server_name = isset($item->SERVER_NAME) ? trim($item->SERVER_NAME) : '';
                if (!empty($empno) && !empty($user_login)) {
                    $result[] = [
                        'EMPNO'       => $empno,
                        'USER_LOGIN'  => $user_login,
                        'SERVER_NAME' => $server_name
                    ];
                }
            }
            return $result;
        }
        return [];
    }

    private function expandScmLoginList($userList, $empno)
    {
        $map = [];
        foreach ($userList as $item) {
            $clean = preg_replace('/^(\d+)[A-Za-z]*$/', '$1', $item->USR_LOGIN);
            if (!isset($map[$clean]))
                $map[$clean] = [];
            $map[$clean][] = $item->USR_LOGIN;
        }
        return isset($map[$empno]) ? $map[$empno] : [$empno];
    }

    public function sendmail($pic = null, $program = 'Regular Review', $formCount = 0, $formsOfPic = [])
    {
        $email = $this->rm->getUserall($pic);
        if ($email && isset($email[0]->SRECMAIL)) {
            // สร้าง array ของ formNumber
            $formNumbers = [];
            foreach ($formsOfPic as $f) {
                $formNumbers[] = $this->toFormNumber($f['nfrmno'], $f['vorgno'], $f['cyear'], $f['cyear2'], $f['nrunno']);
            }

            $body = [
                'form_count'   => $formCount,
                'forms'        => $formsOfPic,
                'form_numbers' => $formNumbers,
                'pic'          => $pic
            ];

            print_r($body);
            $mail = [
                'SUBJECT' => 'แจ้งเตือน Regular Review - ' . strtoupper($program) . ' ' . $pic,
                // 'TO'      => $email[0]->SRECMAIL,
                'BODY'    => $body,
                'TO'      => 'perapatr@mitsubishielevatorasia.co.th',
                'VIEW'    => 'layouts/mail/IS-RGV/mail',
            ];
            $this->mail->sendmail($mail);
            return true;
        }
        return false;
    }
}
