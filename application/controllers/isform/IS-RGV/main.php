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
    public function __construct()
    {
        parent::__construct();
        $this->load->model('isform/IS-RGV/rgv_model', 'rm');
        $this->client = new Client(['verify' => false]);
        $program      = ['Invoice'];
    }

    public function index()
    {
        $no    = $this->input->get('no');
        $orgNo = $this->input->get('orgNo');
        $y     = $this->input->get('y');
        $y2    = $this->input->get('y2');
        $runno = $this->input->get('runNo');
        $empno = $this->input->get('empno');
        $data  = [
            'NFRMNO' => $no,
            'VORGNO' => $orgNo,
            'CYEAR'  => $y,
            'CYEAR2' => $y2,
            'NRUNNO' => $runno,
            'EMPNO'  => $empno,
        ];

        $data_form          = $this->rm->getForm($no, $orgNo, $y, $y2, $runno)[0];
        $program            = isset($data_form->PROGRAM) ? $data_form->PROGRAM : null;
        $data['empform']    = $emp_form = $this->rm->getEmpForm($y2, $runno);
        $data['form']       = $data_form;
        $data['program']    = $program;
        $data['mode']       = $this->getMode($no, $orgNo, $y, $y2, $runno, $empno);
        $empno              = array_column($emp_form, 'EMPNO');
        $data['formNumber'] = $this->toFormNumber($no, $orgNo, $y, $y2, $runno);
        // print_r($empno);
        // $program = 'scm';
        switch (strtolower($program)) {
            case 'invoice':
                $invoice = $this->rm->invoice_user();
                $filtered = array_filter($invoice, function ($item) use ($empno) {
                    return in_array($item->user_id, $empno);
                });
                $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'user_id');
                $this->views('isform/IS-RGV/invoice_view', $data);
                break;

            case 'marketing':
                $marketing = $this->rm->marketing_user();
                $filtered = array_filter($marketing, function ($item) use ($empno) {
                    return in_array($item->user_id, $empno);
                });
                $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'user_id');
                $this->views('isform/IS-RGV/marketing_view', $data);
                break;

            case 'procurement':
                $procurement = $this->rm->procurement_user();
                $filtered = array_filter($procurement, function ($item) use ($empno) {
                    return in_array($item->SEMPNO, $empno);
                });
                $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'SEMPNO');
                $this->views('isform/IS-RGV/procurement_view', $data);
                break;

            case 'scm':
                $scm = $this->rm->scm_user();
                $filtered = array_filter($scm, function ($item) use ($empno) {
                    return in_array($item->EMPNO, $empno);
                });
                $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'EMPNO');
                $this->views('isform/IS-RGV/scm_view', $data);
                break;

            case 'as400':
                $as400 = $this->rm->as400_user();
                $filtered = array_filter($as400, function ($item) use ($empno) {
                    return in_array(trim($item->EMPNO), $empno);
                });
                $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'EMPNO');
                $this->views('isform/IS-RGV/as400_view', $data);
                break;
            case 'ln':
                $data['rows'] = $this->rm->test_data($data_form->EMPCHECKER);
                $this->views('isform/IS-RGV/test', $data);
                break;
            default:
                # code...
                break;
        }
        // pre_array($filtered);
        // $this->views('isform/IS-RGV/view', $data);
    }

    public function createSummaryView(){
        $this->views('isform/IS-RGV/summary_view');
    }

    public function test_view()
    {
        $no    = $this->input->get('no');
        $orgNo = $this->input->get('orgNo');
        $y     = $this->input->get('y');
        $y2    = $this->input->get('y2');
        $runno = $this->input->get('runNo');
        $empno = $this->input->get('empno');
        $data  = [
            'NFRMNO' => $no,
            'VORGNO' => $orgNo,
            'CYEAR'  => $y,
            'CYEAR2' => $y2,
            'NRUNNO' => $runno,
            'EMPNO'  => $empno,
        ];

        $data_form       = $this->rm->getForm($no, $orgNo, $y, $y2, $runno)[0];
        $program         = isset($data_form->PROGRAM) ? $data_form->PROGRAM : null;
        $data['empform'] = $emp_form = $this->rm->getEmpForm($y2, $runno);
        $data['form']    = $data_form;
        $data['program'] = $program;
        $data['mode']    = $this->getMode($no, $orgNo, $y, $y2, $runno, $empno);
        $empno           = array_column($emp_form, 'EMPNO');
        // print_r($empno);
        // $program = 'scm';

        // switch (strtolower($program)) {
        //     case 'invoice':
        //         $invoice = $this->rm->invoice_user();
        //         $filtered = array_filter($invoice, function ($item) use ($empno) {
        //             return in_array($item->user_id, $empno);
        //         });
        //         $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'user_id');
        //         $this->views('isform/IS-RGV/invoice_view', $data);
        //         break;

        //     case 'marketing':
        //         $marketing = $this->rm->marketing_user();
        //         $filtered = array_filter($marketing, function ($item) use ($empno) {
        //             return in_array($item->user_id, $empno);
        //         });
        //         $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'user_id');
        //         $this->views('isform/IS-RGV/marketing_view', $data);
        //         break;

        //     case 'procurement':
        //         $procurement = $this->rm->procurement_user();
        //         $filtered = array_filter($procurement, function ($item) use ($empno) {
        //             return in_array($item->SEMPNO, $empno);
        //         });
        //         $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'SEMPNO');
        //         $this->views('isform/IS-RGV/procurement_view', $data);
        //         break;

        //     case 'scm':
        //         $scm = $this->rm->scm_user();
        //         $filtered = array_filter($scm, function ($item) use ($empno) {
        //             return in_array($item->EMPNO, $empno);
        //         });
        //         $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'EMPNO');
        //         $this->views('isform/IS-RGV/scm_view', $data);
        //         break;

        //     case 'as400':
        //         $as400 = $this->rm->as400_user();
        //         $filtered = array_filter($as400, function ($item) use ($empno) {
        //             return in_array(trim($item->EMPNO), $empno);
        //         });
        //         $data['user'] = $this->mergeResultToUser($filtered, $emp_form, 'EMPNO');
        //         $this->views('isform/IS-RGV/as400_view', $data);
        //         break;

        //     default:
        //         # code...
        //         break;
        // }
        // pre_array($filtered);

        $this->views('isform/IS-RGV/view', $data);
    }

    private function mergeResultToUser($userList, $empForm, $keyField)
    {
        // pre_array($empForm);
        $empMap = [];
        foreach ($empForm as $e) {
            $empMap[$e['EMPNO']] = [
                'RESULT' => $e['RESULT'] ?? null,
                'DETAIL' => $e['DETAIL'] ?? null,
            ];
        }
        // pre_array($empMap);
        foreach ($userList as &$item) {
            $key = trim($item->$keyField) ?? null;
            if (isset($empMap[$key])) {
                $item->RESULT = $empMap[$key]['RESULT'];
                $item->DETAIL = $empMap[$key]['DETAIL'];
            } else {
                $item->RESULT = null;
                $item->DETAIL = null;
            }
        }

        return $userList;
    }

    public function createform($empno, $program, $owner)
    {
        $form = $this->create('7', '050601', '25', $empno, $empno, '', 1);
        pre_array($form);
        $NFRMNO = $form['message']['formtype'];
        $VORGNO = $form['message']['owner'];
        $CYEAR  = $form['message']['cyear'];
        $CYEAR2 = $form['message']['cyear2'];
        $NRUNNO = $form['message']['runno'];

        $data = [
            'NFRMNO'     => $NFRMNO,
            'VORGNO'     => $VORGNO,
            'CYEAR'      => $CYEAR,
            'CYEAR2'     => $CYEAR2,
            'NRUNNO'     => $NRUNNO,
            'PROGRAM'    => $program,
            'EMPCHECKER' => $empno,
            'STATUS'     => '1',
        ];
        $this->rm->insert('ISRGV_FORM', $data);

        if ($program == 'SCM') {
            $this->updateFlowApv("", "10001", $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
        } else if ($program == 'AS400') {
            $this->updateFlowApv("", "10001", $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
        } else if ($program == 'Procurement') {
            $this->updateFlowApv("", "10001", $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
        } else if ($program == 'Invoice') {
            $this->updateFlowApv("", "08243", $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
        } else if ($program == 'Marketing') {
            $this->updateFlowApv("", "08243", $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
        } else if ($program == 'LN') {
            // $this->updateFlowApv("", "13255", $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
            $this->deleteFlowStep('', $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '57', '18');
        }
        $this->updateFlowApv("", $owner, $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, '18', '00');
        // print_r($form['message']['runno']);
        // $this->deleteFlowStep('', '7', '050601', '25', '2025', $form['message']['runno'], '01', '00');

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

        $data  = [
            'PIC' => $PIC
        ];
        $where = [
            'ORG_CODE' => $org_code,
            'PROGRAM'  => $program
        ];
        $this->rm->update("ISRGV_INCHARGE", $data, $where);
    }

    public function getIncharge()
    {
        $data = $this->rm->getUserIncharge();
        // pre_array($data);
        echo json_encode($data);
    }

    public function JobsCreateRGV()
    {
        $programList = $this->rm->getProgram();

        foreach ($programList as $programItem) {
            $programName = strtolower($programItem->PROGRAM);

            // ดึงรายชื่อ user ตามโปรแกรม
            switch ($programName) {
                case 'invoice':
                    $userList = $this->rm->invoice_user();
                    $userIds = array_column($userList, 'user_id');
                    break;

                case 'marketing':
                    $userList = $this->rm->marketing_user();
                    $userIds = array_column($userList, 'user_id');
                    break;

                case 'procurement':
                    $userList = $this->rm->procurement_user();
                    $userIds = array_column($userList, 'SEMPNO');
                    break;

                case 'as400':
                    $userList = $this->rm->as400_user();
                    $userIds = array_map('trim', array_column($userList, 'EMPNO'));
                    break;

                case 'scm':
                    $userList = $this->rm->scm_user();

                    // แปลง USR_LOGIN ให้เหลือแต่ตัวเลขเพื่อนำไปเทียบ SEMPNO
                    $userIds = array_map(function ($val) {
                        return preg_replace('/^(\d+)[A-Za-z]*$/', '$1', $val);
                    }, array_column($userList, 'USR_LOGIN'));

                    // สร้าง mapping: 13273 => [13273, 13273M]
                    $scmUsrMap = [];
                    foreach ($userList as $item) {
                        $clean               = preg_replace('/^(\d+)[A-Za-z]*$/', '$1', $item->USR_LOGIN);
                        $scmUsrMap[$clean][] = $item->USR_LOGIN;
                    }
                    break;

                default:
                    continue 2;
            }

            // ดึงข้อมูลพนักงานทั้งหมดในระบบ และ filter เฉพาะที่อยู่ในรายชื่อ
            $dataUser     = $this->rm->get_data_user($programItem->PROGRAM);
            $filteredData = array_filter($dataUser, function ($item) use ($userIds) {
                return in_array($item->SEMPNO, $userIds);
            });

            // ดึง incharge และ map org_code + owner
            $incharge = $this->rm->getIncharge($programItem->PROGRAM);
            $orgMap   = array_reduce($incharge, function ($carry, $item) {
                $carry[$item->PIC][]        = $item->ORG_CODE;
                $carry[$item->PIC]['owner'] = $item->DATAOWNER;
                return $carry;
            }, []);

            // จัดกลุ่ม user ตาม PIC และ ORG
            $groupedData = [];
            foreach ($filteredData as $index => $user) {
                $owner    = $this->rm->getOwner($user->PROGRAM_CODE)[0]->DATAOWNER;
                $main_apv = $this->rm->getMainApv($owner)[0]->EMPNO;
                $pic      = $user->PIC;
                $org      = $user->ORG_CODE;

                if (isset($orgMap[$pic]) && in_array($org, $orgMap[$pic])) {
                    $groupedData[$pic]['users'][$index] = $user;
                    $groupedData[$pic]['owner']         = $main_apv;
                }
            }

            // echo "<pre>";
            // print_r($groupedData);
            // echo "</pre>";





            // สร้างฟอร์มและ insert ข้อมูล

            // foreach ($groupedData as $pic => $userGroup) {
            //     $owner  = $userGroup['owner'];
            //     $form   = $this->createform(trim($pic), $programItem->PROGRAM, $owner);
            //     $NRUNNO = $form['runno'];
            //     $CYEAR2 = $form['cyear2'];

            //     echo "--------------------------------------$programName ($pic)-------------------------------------------------------------<br>";

            //     foreach ($userGroup['users'] as $item) {
            //         $empno = $item->SEMPNO;

            //         if ($programName === 'scm') {
            //             $loginList = isset($scmUsrMap[$empno]) ? $scmUsrMap[$empno] : [$empno];

            //             foreach ($loginList as $usr_login) {
            //                 $data = [
            //                     'NRUNNO' => $NRUNNO,
            //                     'CYEAR2' => $CYEAR2,
            //                     'EMPNO'  => $usr_login,
            //                 ];
            //                 // pre_array($data);
            //                 $this->rm->insert('ISRGV_EMP', $data);
            //             }
            //         } else {
            //             $data = [
            //                 'NRUNNO' => $NRUNNO,
            //                 'CYEAR2' => $CYEAR2,
            //                 'EMPNO'  => $empno,
            //             ];
            //             $this->rm->insert('ISRGV_EMP', $data);
            //         }
            //     }
            // }
        }

        $authorizeList = $this->rm->getLnauthorize();
        $lnUsers       = array_column($authorizeList, 'EMPNO');
        // $lnOwner       = $this->rm->get_orgpos("040101", "10")[0];
        foreach ($lnUsers as $key => $val) {
            $lnOwner = $this->rm->get_orgpos("040101", "10")[0];
            $form    = $this->createform(trim($val), 'LN', $lnOwner->VEMPNO);
            $NRUNNO  = $form['runno'];
            $CYEAR2  = $form['cyear2'];
            $data    = [
                'NRUNNO' => $NRUNNO,
                'CYEAR2' => $CYEAR2,
                'EMPNO'  => $val,
            ];
            // pre_array($data);
            $this->rm->insert('ISRGV_EMP', $data);
        }
        echo "<pre>";
        print_r($lnUsers);
        echo "</pre>";
    }


    public function Update_Result()
    {
        $post = $this->input->post('data');
        // pre_array($post);

        foreach ($post as $key => $value) {
            $where = [
                'NRUNNO' => $value['nrunno'],
                'CYEAR2' => $value['cyear2'],
                'EMPNO'  => trim($value['usr_login']),
            ];
            $data  = [
                'RESULT' => $value['result'],
                'DETAIL' => $value['remark'],
            ];

            $where_form = [
                'NFRMNO' => $value['nfrmno'],
                'VORGNO' => $value['vorgno'],
                'CYEAR'  => $value['cyear'],
                'CYEAR2' => $value['cyear2'],
                'NRUNNO' => $value['nrunno'],
            ];
            $data_form  = [
                'STATUS' => '2',
            ];

            pre_array($where);
            pre_array($data);

            $this->rm->update('ISRGV_EMP', $data, $where);
            $this->rm->update('ISRGV_FORM', $data_form, $where_form);
        }
    }

    public function LN()
    {
        $data['rows'] = $this->rm->test_data();
        $this->views('isform/IS-RGV/test', $data);
    }

    public function test_one()
    {
        $this->views('isform/IS-RGV/test_one');
    }

    public function insert()
    {
        $menu_id    = $this->input->post('menu_id');
        $is_checked = $this->input->post('is_checked');
        $empno      = $this->input->post('empno');

        $data = [
            'MENU_ID' => $menu_id,
            'STATUS'  => '1',
            'EMPNO'   => $empno
        ];

        $this->rm->insert('ISRGV_LN_AUTHORIZE', $data);
    }

    public function read_excel()
    {
        $path = FCPATH . 'assets/files/data2.csv';
        if (!file_exists($path)) {
            echo "ไม่พบไฟล์: $path";
            return;
        }

        $file = fopen($path, "r");

        $header = fgetcsv($file, 1000, ","); // อ่านหัวตาราง
        $empnos = array_slice($header, 4);   // เอาเฉพาะคอลัมน์พนักงาน (ตั้งแต่คอลัมน์ที่ 5)

        // echo "<table border='1' cellpadding='5'>";
        // echo "<tr><th>MENU_LEVEL</th><th>MENU_TREE</th><th>MENU_ID</th><th>EMPNO</th><th>STATUS</th></tr>";

        while (($row = fgetcsv($file, 1000, ",")) !== FALSE) {
            $menu_level = trim($row[0]);
            $menu_tree  = trim($row[1]);
            $menu_id    = trim($row[2]);

            foreach ($empnos as $i => $empno) {
                $val = trim($row[$i + 4]); // เริ่มนับจากคอลัมน์ที่ 5
                if ($val !== '') { // มีค่า เช่น 'P'

                    $data = [
                        'EMPNO'   => $empno,
                        'MENU_ID' => $menu_id,
                        'STATUS'  => ($val === 'P') ? '1' : '0'
                    ];
                    $this->rm->insert('ISRGV_LN_AUTHORIZE', $data);

                    // echo "<pre>";
                    // print_r($data);
                    // echo "</pre>";
                    // echo "<tr>
                    //     <td>$menu_level</td>
                    //     <td>$menu_tree</td>
                    //     <td>$menu_id</td>
                    //     <td>$empno</td>
                    //     <td>$val</td>
                    //   </tr>";
                }
            }
        }

        // echo "</table>";
        fclose($file);
    }


    public function test_curl()
    {
        // // $url = 'https://amecwebtest.mitsubishielevatorasia.co.th/form/gpform/GP-ENT/main/InsertForm22';
        // $url = base_url('gpform/GP-ENT/main/InsertForm22');

        // $postData = [
        //     "key1" => "value1",
        //     "key2" => "value2"
        // ];

        // $ch = curl_init($url);
        // curl_setopt($ch, CURLOPT_POST, true);
        // curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        // // curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        // // curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);


        // $result = curl_exec($ch);

        // if ($result === false) {
        //     echo "cURL Error: " . curl_error($ch);
        // } else {
        //     echo $result; // จะได้ JSON เช่น {"status":"success","message":"Data received successfully","received":{"key1":"value1","key2":"value2"}}
        // }

        // curl_close($ch);
        // // echo base_url('gpform/GP-ENT/main/InsertForm22');

        $url = 'https://amecwebtest.mitsubishielevatorasia.co.th/form/gpform/GP-ENT/main/InsertForm22';
        // $client   = new \GuzzleHttp\Client(['verify' => false]); // ปิด verify
        $response = $this->client->post($url, [
            'form_params' => [
                'key1' => 'value1',
                'key2' => 'value2'
            ]
        ]);

        echo $response->getBody();
    }


}
?>