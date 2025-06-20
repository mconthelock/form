<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_file.php';
require_once APPPATH . 'controllers/_form.php';
use GuzzleHttp\Client;
function pre_array($array)
{
    echo "<pre>";
    print_r($array);
    echo "</pre>";
}
class Main extends MY_Controller
{
    use _File;
    use _Form;
    protected $client;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('gpform/GP-ENT/ent_model', 'ent');
        $this->load->model('form_model', 'form');
        $this->upload_path = "//amecnas/AMECWEB/File/" . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/GP/GPENT/";
        $this->client      = new Client(['verify' => false]);
        $this->load->library('Mail');
        // Load models here if needed
        // $this->load->model('your_model');
    }

    public function index()
    {
        $data                  = [
            'NFRMNO' => $nfrmno = $this->input->get('no'),
            'VORGNO' => $vorgno = $this->input->get('orgNo'),
            'CYEAR'  => $cyear = $this->input->get('y'),
            'CYEAR2' => $cyear2 = $this->input->get('y2'),
            'NRUNNO' => $nrunno = $this->input->get('runNo'),
            'EMPNO'  => $empno = $this->input->get('empno'),
        ];
        $data['mode']          = $this->getMode($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
        $data['guest_type']    = $this->ent->get_guest_type();
        $data['estimate_type'] = $this->ent->get_estimate_type();
        if (!$cyear2 || !$nrunno) {
            $this->views('gpform/GP-ENT/main', $data);
        } else {
            $data['formNumber']       = $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['dataForm']         = $this->ent->dataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)[0];
            $data['dataParticipants'] = $this->ent->dataParticipants($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['estimate_cost']    = $this->ent->get_estimate_cost($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['company']          = $this->ent->dataCompany($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['form']             = $this->form->getForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $form                     = [
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno
            ];
            $getEmpFlow               = $this->form->getEmpFlow($form, $empno);
            $data['flowstep']         = $this->ent->getFlowStep($form, $empno);
            if (!empty($getEmpFlow)) {
                $checkReturnb = $this->form->checkReturnb($form, $getEmpFlow[0]->CSTEPNEXTNO);
            }
            if (!empty($checkReturnb)) {
                $this->views('gpform/GP-ENT/edit', $data);
            } else {
                $this->views('gpform/GP-ENT/view', $data);
            }

        }

    }

    public function export_pdf($form_id)
    {
        // 1. ดึงข้อมูล
        $data['form'] = $this->Your_model->getForm($form_id);

        // 2. Render view blade เป็น HTML string
        $html = $this->blade->view()->make('gpform.GP-ENT.main', $data)->render();

        // 3. โหลด mPDF (ใช้ composer หรือ manual ก็ได้)
        require_once APPPATH . 'third_party/mpdf/autoload.php';
        $mpdf = new \Mpdf\Mpdf([
            'format'        => 'A4',
            'margin_left'   => 10,
            'margin_right'  => 10,
            'margin_top'    => 10,
            'margin_bottom' => 10,
        ]);

        // 4. เขียน HTML ลง mPDF
        $mpdf->WriteHTML($html);

        // 5. ส่ง PDF ให้ user download
        $mpdf->Output('form_' . $form_id . '.pdf', 'D');
    }

    public function form()
    {
        $this->views('gpform/GP-ENT/form_part1');
    }

    public function getDataEmp()
    {
        $empcode = $this->input->post('empcode');
        $data    = $this->ent->getDataEmp($empcode);
        echo json_encode($data);
    }

    public function InsertForm()
    {

        $post   = $this->input->post();
        $nfrmno = $post['nfrmno'];
        $vorgno = $post['vorgno'];
        $cyear  = $post['cyear'];
        $cyear2 = $post['cyear2'];
        $nrunno = $post['nrunno'];

        if ($post['total_amount'] > 10000) {
            $this->deleteFlowStep('', $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, '18', '19'); // delete RAF dim
        } else {
            $this->deleteFlowStep('', $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, '01', '87'); // delete President
        }

        if ($post['cash_adv'] == '1') {
            $this->deleteFlowStep('', $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, '87', '00'); // delete FIN Staff
        }
        // $this->updateFlowApv("", $getEmp->VEMPNO, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, "18", "00");

        $data = [
            'NFRMNO'               => $nfrmno,
            'VORGNO'               => $vorgno,
            'CYEAR'                => $cyear,
            'CYEAR2'               => $cyear2,
            'NRUNNO'               => $nrunno,
            'EMP_INPUT'            => $post['input_by'],
            'EMP_REQ'              => $post['requested_by'],
            'PURPOSE'              => $post['purpose'],
            'TYPE_TIME'            => $post['time'],
            'LOCATION_TYPE'        => $post['location'],
            'LOCATION'             => $post['location_detail'],
            'ENTERTAINMENT_BUDGET' => $post['entertain_budget'],
            'GUEST_TYPE'           => $post['guest_type'],
            'REMARK'               => $post['remark'],
            'REIMBURSEMENT'        => $post['cash_adv'],
            'TOTAL_AMOUNT'         => $post['total_amount'],
            'STATUS'               => '1',
        ];

        $dateFields = [];
        if (!empty($post['entertain_date'])) {
            $dateFields['ENTERTAINMENT_DATE'] = "TO_DATE('{$post['entertain_date']}', 'YYYY-MM-DD')";
        }

        $this->ent->insert('GPENT_FORM', $data, $dateFields);

        foreach (json_decode($post['estimate_items']) as $key => $value) {
            $data_estimate = [
                'NFRMNO'     => $nfrmno,
                'VORGNO'     => $vorgno,
                'CYEAR'      => $cyear,
                'CYEAR2'     => $cyear2,
                'NRUNNO'     => $nrunno,
                'DETAILS'    => $value->details,
                'QTY'        => $value->qty,
                'UNIT_COST'  => $value->cost,
                'TOTAL_COST' => $value->total,
                'REMARK'     => $value->remark
            ];

            $this->ent->insert('GPENT_ESTIMATE', $data_estimate);
        }

        foreach (json_decode($post['guest_list']) as $key => $value) {
            $data_guest = [
                'NFRMNO'   => $nfrmno,
                'VORGNO'   => $vorgno,
                'CYEAR'    => $cyear,
                'CYEAR2'   => $cyear2,
                'NRUNNO'   => $nrunno,
                'TYPE'     => 'guest',
                'NAME'     => $value,
                'EMP_CODE' => '',
            ];
            $this->ent->insert('GPENT_PARTICIPANTS', $data_guest);
        }

        foreach (json_decode($post['amec_list']) as $key => $value) {
            $data_amec = [
                'NFRMNO'   => $nfrmno,
                'VORGNO'   => $vorgno,
                'CYEAR'    => $cyear,
                'CYEAR2'   => $cyear2,
                'NRUNNO'   => $nrunno,
                'TYPE'     => 'amec',
                'NAME'     => '',
                'EMP_CODE' => $value,
            ];
            $this->ent->insert('GPENT_PARTICIPANTS', $data_amec);
        }

        $companies = json_decode($_POST['companies'], true);
        $files     = $_FILES['company_files'];

        foreach ($companies as $idx => $company) {

            $data = [
                'NFRMNO'       => $nfrmno,
                'VORGNO'       => $vorgno,
                'CYEAR'        => $cyear,
                'CYEAR2'       => $cyear2,
                'NRUNNO'       => $nrunno,
                'COMPANY_NAME' => $company['name'],
                'COMPANY_TYPE' => $company['orgType'],
                // 'ATTACH_FILE'  => ''
            ];
            if (isset($files['name'][$idx])) {
                $extension = pathinfo($files['name'][$idx], PATHINFO_EXTENSION);
                $oneFile   = array(
                    'name'     => "File_guest_$idx.$extension",
                    'type'     => $files['type'][$idx],
                    'tmp_name' => $files['tmp_name'][$idx],
                    'error'    => $files['error'][$idx],
                    'size'     => $files['size'][$idx]
                );

                $file = $this->uploadFile($oneFile);

                pre_array($file);
                if ($file['status'] == '1') {
                    $data['ATTACH_FILE'] = $file['file_name'];
                }
            }
            $this->ent->insert('GPENT_COMPANY', $data);
        }
    }

    public function update()
    {
        $post   = $this->input->post();
        $nfrmno = $post['nfrmno'];
        $vorgno = $post['vorgno'];
        $cyear  = $post['cyear'];
        $cyear2 = $post['cyear2'];
        $nrunno = $post['nrunno'];

        if ($post['total_amount'] > 10000) {
            $getEmp = $this->ent->get_orgpos("020101", "02")[0]; // PRESIDENT
        } else {
            $getEmp = $this->ent->get_orgpos("040101", "10")[0]; // RAF DIM
        }
        $this->updateFlowApv("", $getEmp->VEMPNO, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, "18", "00");

        $data = [
            'NFRMNO'               => $nfrmno,
            'VORGNO'               => $vorgno,
            'CYEAR'                => $cyear,
            'CYEAR2'               => $cyear2,
            'NRUNNO'               => $nrunno,
            'EMP_INPUT'            => $post['input_by'],
            'EMP_REQ'              => $post['requested_by'],
            'PURPOSE'              => $post['purpose'],
            'TYPE_TIME'            => $post['time'],
            'LOCATION_TYPE'        => $post['location'],
            'LOCATION'             => $post['location_detail'],
            'ENTERTAINMENT_BUDGET' => $post['entertain_budget'],
            'GUEST_TYPE'           => $post['guest_type'],
            'REMARK'               => $post['remark'],
            'TOTAL_AMOUNT'         => $post['total-amount'],
            'STATUS'               => '1',
        ];

        $where = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ];

        $dateFields = [];
        if (!empty($post['entertain_date'])) {
            $dateFields['ENTERTAINMENT_DATE'] = "TO_DATE('{$post['entertain_date']}', 'YYYY-MM-DD')";
        }

        $this->ent->update('GPENT_FORM', $data, $where, $dateFields);

        $this->ent->delete('GPENT_ESTIMATE', $where);
        foreach (json_decode($post['estimate_items']) as $key => $value) {
            $data_estimate = [
                'NFRMNO'     => $nfrmno,
                'VORGNO'     => $vorgno,
                'CYEAR'      => $cyear,
                'CYEAR2'     => $cyear2,
                'NRUNNO'     => $nrunno,
                'DETAILS'    => $value->details,
                'QTY'        => $value->qty,
                'UNIT_COST'  => $value->cost,
                'TOTAL_COST' => $value->total,
                'REMARK'     => $value->remark
            ];

            $this->ent->insert('GPENT_ESTIMATE', $data_estimate);
        }

        $this->ent->delete('GPENT_PARTICIPANTS', $where);

        foreach (json_decode($post['guest_list']) as $key => $value) {
            $data_guest = [
                'NFRMNO'   => $nfrmno,
                'VORGNO'   => $vorgno,
                'CYEAR'    => $cyear,
                'CYEAR2'   => $cyear2,
                'NRUNNO'   => $nrunno,
                'TYPE'     => 'guest',
                'NAME'     => $value,
                'EMP_CODE' => '',
            ];
            $this->ent->insert('GPENT_PARTICIPANTS', $data_guest);
        }

        foreach (json_decode($post['amec_list']) as $key => $value) {
            $data_amec = [
                'NFRMNO'   => $nfrmno,
                'VORGNO'   => $vorgno,
                'CYEAR'    => $cyear,
                'CYEAR2'   => $cyear2,
                'NRUNNO'   => $nrunno,
                'TYPE'     => 'amec',
                'NAME'     => '',
                'EMP_CODE' => $value,
            ];
            $this->ent->insert('GPENT_PARTICIPANTS', $data_amec);
        }

        $companies = json_decode($_POST['companies'], true);
        $files     = $_FILES['company_files'];

        $this->ent->delete('GPENT_COMPANY', $where);
        foreach ($companies as $idx => $company) {

            $data = [
                'NFRMNO'       => $nfrmno,
                'VORGNO'       => $vorgno,
                'CYEAR'        => $cyear,
                'CYEAR2'       => $cyear2,
                'NRUNNO'       => $nrunno,
                'COMPANY_NAME' => $company['name'],
                'COMPANY_TYPE' => $company['orgType'],
                // 'ATTACH_FILE'  => ''
            ];

            // แนบไฟล์ใหม่กรณีอัปโหลด
            if (isset($files['name'][$idx]) && $files['name'][$idx]) {
                $extension = pathinfo($files['name'][$idx], PATHINFO_EXTENSION);
                $oneFile   = array(
                    'name'     => "File_guest_$idx.$extension",
                    'type'     => $files['type'][$idx],
                    'tmp_name' => $files['tmp_name'][$idx],
                    'error'    => $files['error'][$idx],
                    'size'     => $files['size'][$idx]
                );

                $file = $this->uploadFile($oneFile);

                if ($file['status'] == '1') {
                    $data['ATTACH_FILE'] = $file['file_name'];
                }
            } else {
                // ถ้า edit แล้วไม่มีไฟล์ใหม่ แต่มีไฟล์เดิม ให้ใช้ไฟล์เดิม
                if (!empty($company['current_file'])) {
                    $data['ATTACH_FILE'] = $company['current_file'];
                }
                // ถ้าไม่มีไฟล์เดิมเลย (เพิ่มใหม่) จะไม่ set ATTACH_FILE หรือจะ set เป็นค่าว่างก็ได้
            }

            $this->ent->insert('GPENT_COMPANY', $data);
        }

    }

    public function UpdatePayDate()
    {
        $nfrmno  = $this->input->post('nfrmno');
        $vorgno  = $this->input->post('vorgno');
        $cyear   = $this->input->post('cyear');
        $cyear2  = $this->input->post('cyear2');
        $nrunno  = $this->input->post('nrunno');
        $paydate = $this->input->post('pay_date');
        $where   = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ];
        $data    = [
            'PAYDATE' => "TO_DATE('{$paydate}', 'YYYY-MM-DD')"
        ];
        $this->ent->update('GPENT_FORM', [], $where, $data);

    }

    public function preview($filename)
    {
        $filepath = $this->upload_path . $filename;

        if (file_exists($filepath)) {
            $mime = mime_content_type($filepath);
            header("Content-Type: $mime");
            readfile($filepath);
            exit;
        } else {
            show_404();
        }
    }

    public function JobRejectForm()
    {
        $ent = $this->ent->getGPENTForm();

        foreach ($ent as $value) {
            $filter    = [
                'NFRMNO' => $value->NFRMNO,
                'VORGNO' => $value->VORGNO,
                'CYEAR'  => $value->CYEAR,
                'CYEAR2' => $value->CYEAR2,
                'NRUNNO' => $value->NRUNNO,
            ];
            $data_form = array_values(array_filter(
                $this->ent->select('FLOW', $filter),
                function ($item) {
                    return $item->CSTEPST === '3' && ($item->CSTEPNO != '00' || $item->CEXTDATA != '01');
                }
            ));

            if (!empty($data_form)) {
                $response = $this->client->post('http://localhost/api-auth/api-dev/appflow/doaction', [
                    'form_params' => [
                        'action' => 'reject',
                        'frmNo'  => $data_form[0]->NFRMNO,
                        'orgNo'  => $data_form[0]->VORGNO,
                        'y'      => $data_form[0]->CYEAR,
                        'y2'     => $data_form[0]->CYEAR2,
                        'runNo'  => $data_form[0]->NRUNNO,
                        'apv'    => $data_form[0]->VAPVNO,
                        'remark' => ''
                    ]
                ]);

                $body = json_decode($response->getBody());
                if ($body->status === true) {
                    $formNumber = $this->toFormNumber($data_form[0]->NFRMNO, $data_form[0]->VORGNO, $data_form[0]->CYEAR, $data_form[0]->CYEAR2, $data_form[0]->NRUNNO);
                    $mail_data  = [
                        'TO'      => 'perapatr@mitsubishielevatorasia.co.th',
                        'SUBJECT' => 'Form Rejection Notification: ' . $formNumber,
                        'BODY'    => ['<b>For your Requisition Entertainment form for Approval part has <label style="color:red;">REJECTED</label> because requester don’t get approval from <label style="color:red;">“ President or RAF DIM ”</label> on time</b>']
                    ];
                    $this->mail->sendmail($mail_data);
                }
                echo json_encode($body);
            }
        }



        // $data = $this->ent->getFlow($data);
        // if ($data[0]->CAPVSTNO == '0') {
        //     echo "Reject";
        // }


        // $response = $this->client->post('http://localhost/api-auth/api-dev/appflow/doaction', [
        //     'form_params' => [
        //         'action' => 'reject',
        //         'frmNo'  => $ent[0]->NFRMNO,
        //         'orgNo'  => $ent[0]->VORGNO,
        //         'y'      => $ent[0]->CYEAR,
        //         'y2'     => $ent[0]->CYEAR2,
        //         'runNo'  => $ent[0]->NRUNNO,
        //         'apv'    => '24012',
        //         'remark' => ''
        //     ]
        // ]);

        // $body = $response->getBody();
        // echo $body;
    }

    public function test_array()
    {
        $data = $this->ent->test_array();
        pre_array($data);

        $arr = [];
        foreach ($data as $val) {
            $obj             = new stdClass();
            $obj->NFRMNO     = $val->NFRMNO;
            $obj->VORGNO     = $val->VORGNO;
            $obj->CYEAR      = $val->CYEAR;
            $obj->CYEAR2     = $val->CYEAR2;
            $obj->NRUNNO     = $val->NRUNNO;
            $obj->DPAYDATE   = $val->PAYDATE;
            $obj->CATEGORY   = 'E';
            $obj->DPAYDATE2  = '';
            $obj->SEMPNO     = $val->SEMPNO;
            $obj->SNAME      = $val->SNAME;
            $obj->DESCTION   = $val->PURPOSE;
            $obj->SSEC       = $val->SSEC;
            $obj->ADVANCEAMT = $val->TOTAL_AMOUNT;
            $obj->CAT        = '';
            $obj->CLNFRMNO   = $val->CNFRMNO;
            $obj->CLVORGNO   = $val->CVORGNO;
            $obj->CCYEAR     = $val->CCYEAR;
            $obj->CCYEAR2    = $val->CCYEAR2;
            $obj->CNRUNNO    = $val->CNRUNNO;
            $obj->CLEARAMT   = $val->ACTUAL_COST;
            $obj->CLSTATUS   = $val->CST;
            $obj->CLAPVDATE  = '';
            $obj->CHKNO      = '';
            $obj->CHKNAME    = '';
            $obj->CHKDATE    = '';
            $arr[]           = $obj;
        }
        pre_array($arr);
    }
}