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


        $getEmp = $this->ent->get_orgpos("020101", "02")[0]; // PRESIDENT
        if ($post['total_amount'] > 10000 && $post['requested_by'] != $getEmp->VEMPNO) {
            $this->updateFlowApv("", $getEmp->VEMPNO, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, "18", "87");
        }

        if ($post['cash_adv'] == '0') {
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

        $where       = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno,
        ];
        $cstepnextno = $this->ent->select('FLOW', array_merge($where, ['CSTEPNO' => '18']));
        $this->updateFlowApv("", $getEmp->VEMPNO, $nfrmno, $vorgno, $cyear, $cyear2, $nrunno, "18", $cstepnextno[0]->CSTEPNEXTNO);

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

    public function UpdateApprove()
    {
        $nfrmno        = $this->input->post('nfrmno');
        $vorgno        = $this->input->post('vorgno');
        $cyear         = $this->input->post('cyear');
        $cyear2        = $this->input->post('cyear2');
        $nrunno        = $this->input->post('nrunno');
        $approveRemark = $this->input->post('approveRemark');
        $acceptval  = $this->input->post('acceptval');

        // echo json_encode($nfrmno);

        $where = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno,
        ];
        $data  = [
            'FORM_APPROVE'   => $acceptval,
            'REMARK_APPROVE' => $approveRemark
        ];
        $this->ent->update('GPENT_FORM', $data, $where, []);

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

    public function sendMailToApprover()
    {
        $nfrmno = $this->input->post('nfrmno');
        $vorgno = $this->input->post('vorgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');

        $nfrmno = '9';
        $vorgno = '030101';
        $cyear  = '25';
        $cyear2 = '2025';
        $nrunno = '11';

        $where         = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno,
        ];
        $flow_approver = $this->ent->select('FLOW', array_merge($where, ['CSTEPST' => '3']));
        $emp_approver  = $this->ent->select('AMECUSERALL', ['SEMPNO' => $flow_approver[0]->VAPVNO]);
        $formNumber    = $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);

        $arr_m = array_merge((array) $flow_approver[0], (array) $emp_approver[0]);
        $link  = '<a href="https://amecwebtest.mitsubishielevatorasia.co.th/form/gpform/GP-ENT/main?sr=1&no=9&orgNo=030101&y=25&y2=' . $cyear2 . '&runNo=' . $nrunno . '&empno=' . $emp_approver[0]->SEMPNO . '&m=3&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1"> LINK WEBFLOW </a>';

        $emp_aprv = "approver";
        if ($arr_m['SPOSCODE'] == "10") {
            $emp_aprv = "RAF DIM.";
        } else if ($arr_m['SPOSCODE'] == "02") {
            $emp_aprv = "PRESIDENT.";
        }



        pre_array($arr_m);

        $d['VIEW']    = 'layouts/mail/GP-ENT/mailAlert';
        $d['SUBJECT'] = 'Remind your Entertainment form not yet get approve from approver';
        $d['TO']      = 'perapatr@mitsubishielevatorasia.co.th';
        // $d['TO']      = [$emp_req[0]->SRECMAIL];
        $d['BODY'] = [
            '<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                <p>Dear ' . $emp_aprv . '</p>

                <p>
                    Your Entertainment form no. <strong>' . $formNumber . '</strong> must get approved by <span style="color: red;">' . $emp_approver[0]->SNAME . ' (Emp. No. ' . $emp_approver[0]->SEMPNO . ')</span>.
                </p>
                <p>
                    Please consideration this Entertainment form on webflow system by Click link ' . $link . '.
                </p>
                <p>
                    For your consideration and Approval.
                </p>

                <p style="margin-top: 24px;">
                    Best regards,<br>
                    GA System
                </p>
            </div>'
        ];
        // $d['ENFILE']  = array(['filename' => 'file.xlsx', 'content' => ob_get_contents]);
        $mail = $this->mail->sendmail($d);
        print_r($mail);

        // pre_array($emp_approver);
    }


}