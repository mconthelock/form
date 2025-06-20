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
    }
}