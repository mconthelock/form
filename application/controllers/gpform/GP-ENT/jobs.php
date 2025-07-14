<?php
defined('BASEPATH') or exit('No direct script access allowed');
use GuzzleHttp\Client;
require_once APPPATH . 'controllers/_form.php';
class Jobs extends CI_Controller
{

    protected $client;
    use _Form;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('gpform/GP-ENT/ent_model', 'ent');
        $this->load->model('form_model', 'form');
        $this->client = new Client(['verify' => false]);
        $this->load->library('Mail');
        // Load models here if needed
        // $this->load->model('jobs_model');
    }

    public function mailAlertNotApprove()
    {
        $data = $this->ent->getGPENTForm();

        $filtered = array_filter($data, function ($row) {
            $dateTime  = DateTime::createFromFormat('d-M-y', $row->ENTERTAINMENT_DATE);
            $formatted = $dateTime ? $dateTime->format('Y-m-d') : '';
            $date = date("Y-m-d", strtotime("-1 days"));
            return isset($row->ENTERTAINMENT_DATE) && $formatted == $date;
        });
        echo "<pre>" . print_r($filtered, true) . "</pre>";

        foreach ($filtered as $value) {

            $where         = [
                'NFRMNO' => $value->NFRMNO,
                'VORGNO' => $value->VORGNO,
                'CYEAR'  => $value->CYEAR,
                'CYEAR2' => $value->CYEAR2,
                'NRUNNO' => $value->NRUNNO,
            ];
            $form          = $this->ent->select('FORM', $where);
            $flow_main     = $this->ent->select('FLOW', array_merge($where, ['CSTEPNO' => '18']));
            $flow_approver = $this->ent->select('FLOW', array_merge($where, ['CSTEPST' => '3']));
            $emp_req       = $this->ent->select('AMECUSERALL', ['SEMPNO' => $value->EMP_REQ]);
            $emp_approver  = $this->ent->select('AMECUSERALL', ['SEMPNO' => $flow_approver[0]->VAPVNO]);
            $formNumber    = $this->toFormNumber($value->NFRMNO, $value->VORGNO, $value->CYEAR, $value->CYEAR2, $value->NRUNNO);
            print_r($emp_approver);
            if ($flow_main[0]->VREALAPV == null) {
                // send email
                $d['VIEW']    = 'layouts/mail/GP-ENT/mailAlert';
                $d['SUBJECT'] = 'Remind your Entertainment form not yet get approve from approver';
                // $d['TO']      = 'perapatr@mitsubishielevatorasia.co.th';
                $d['TO']      = [$emp_req[0]->SRECMAIL];
                $d['BODY'] = [
                    '<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                        <p>Dear User,</p>

                        <p>
                            Your Entertainment form no. <strong>' . $formNumber . '</strong> has not yet been approved by <span style="color: red;">' . $emp_approver[0]->SNAME . ' (Emp. No. ' . $emp_approver[0]->SEMPNO . ')</span>.
                        </p>
                        <p>
                            Please contact the approver to complete the approval process for your requisition.
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
            }
            // echo "<pre>" . print_r($flow, true) . "</pre>";
        }

    }



    // public function JobRejectForm()
    // {
    //     $ent = $this->ent->getGPENTForm();

    //     foreach ($ent as $value) {
    //         $filter    = [
    //             'NFRMNO' => $value->NFRMNO,
    //             'VORGNO' => $value->VORGNO,
    //             'CYEAR'  => $value->CYEAR,
    //             'CYEAR2' => $value->CYEAR2,
    //             'NRUNNO' => $value->NRUNNO,
    //         ];
    //         $data_form = array_values(array_filter(
    //             $this->ent->select('FLOW', $filter),
    //             function ($item) {
    //                 return $item->CSTEPST === '3' && ($item->CSTEPNO != '00' || $item->CEXTDATA != '01');
    //             }
    //         ));

    //         if (!empty($data_form)) {
    //             $response = $this->client->post('http://localhost/api-auth/api-dev/appflow/doaction', [
    //                 'form_params' => [
    //                     'action' => 'reject',
    //                     'frmNo'  => $data_form[0]->NFRMNO,
    //                     'orgNo'  => $data_form[0]->VORGNO,
    //                     'y'      => $data_form[0]->CYEAR,
    //                     'y2'     => $data_form[0]->CYEAR2,
    //                     'runNo'  => $data_form[0]->NRUNNO,
    //                     'apv'    => $data_form[0]->VAPVNO,
    //                     'remark' => ''
    //                 ]
    //             ]);

    //             $body = json_decode($response->getBody());
    //             if ($body->status === true) {
    //                 $formNumber = $this->toFormNumber($data_form[0]->NFRMNO, $data_form[0]->VORGNO, $data_form[0]->CYEAR, $data_form[0]->CYEAR2, $data_form[0]->NRUNNO);
    //                 $mail_data  = [
    //                     'TO'      => 'perapatr@mitsubishielevatorasia.co.th',
    //                     'SUBJECT' => 'Form Rejection Notification: ' . $formNumber,
    //                     'BODY'    => ['<b>For your Requisition Entertainment form for Approval part has <label style="color:red;">REJECTED</label> because requester don’t get approval from <label style="color:red;">“ President or RAF DIM ”</label> on time</b>']
    //                 ];
    //                 $this->mail->sendmail($mail_data);
    //             }
    //             echo json_encode($body);
    //         }
    //     }
    // }
}