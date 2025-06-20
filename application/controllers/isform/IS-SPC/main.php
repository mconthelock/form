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
        // Load necessary models, libraries, or helpers here
        $this->load->model('isform/IS-TID/userEnv_model', 'ue');
        $this->load->model('isform/IS-SPC/specialauth_model', 'sa');
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        $data = [
            'NFRMNO' => $nfrmno = $this->input->get('no'),
            'VORGNO' => $vorgno = $this->input->get('orgNo'),
            'CYEAR'  => $cyear = $this->input->get('y'),
            'CYEAR2' => $cyear2 = $this->input->get('y2'),
            'NRUNNO' => $nrunno = $this->input->get('runNo'),
            'EMPNO'  => $empno = $this->input->get('empno'),
        ];

        if (!$cyear2 || !$nrunno) {
            $data['serverName'] = $this->ue->getServerName();
            $data['controller'] = $this->ue->getController();
            $this->views('isform/IS-SPC/create', $data);
        } else {
            $data['formNumber'] = $this->toFormNumber($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
            $data['mode']       = $this->getMode($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
            $data['extdata']    = $this->getExtdata($nfrmno, $vorgno, $cyear, $cyear2, $nrunno, $empno);
            $data['data']       = $form = $this->sa->getSpecialAuth($nfrmno, $vorgno, $cyear, $cyear2, $nrunno)[0];
            $data['input_name'] = $this->sa->getDataEmp($form['EMP_INPUT'])->SNAME;
            $data['req_name']   = $this->sa->getDataEmp($form['EMP_REQUEST'])->SNAME;

            $this->views('isform/IS-SPC/view', $data);
        }
    }

    public function getController()
    {
        $data = $this->ue->getController();
        echo json_encode($data);
    }

    public function insert()
    {
        $p = array_map('trim', $this->input->post());

        $data = [
            'NFRMNO'      => $p['NFRMNO'],
            'VORGNO'      => $p['VORGNO'],
            'CYEAR'       => $p['CYEAR'],
            'CYEAR2'      => $p['CYEAR2'],
            'NRUNNO'      => $p['NRUNNO'],
            'ACTION'      => $p['action'],
            'PLATFORM'    => $p['platform'],
            'REASON'      => $p['reason'],
            'STATUS'      => '1',
            'EMP_INPUT'   => $p['inputer'],
            'EMP_REQUEST' => $p['requester'],
        ];

        if ($p['action'] == 'ADD') {
            $data['CLASS']         = $p['class_auth'];
            $data['CATEGORY']      = $p['category'];
            $data['ROLE']          = $p['role'];
            $data['DURATION_TYPE'] = $p['duration'];
            $data['USER_TYPE']     = $p['user_type'];
            $data['OWNER']         = $p['owner'];
            $data['ORGANIZER']     = $p['org'];
        } else {
            $data['USERNAME'] = $p['username'];
        }
        $dateFields = [];
        if (!empty($p['requestDate'])) {
            $dateFields['REQUEST_DATE'] = "TO_DATE('{$p['requestDate']}', 'YYYY-MM-DD')";
        }

        $this->updateFlowApv("", $p['admin'], $p['NFRMNO'], $p['VORGNO'], $p['CYEAR'], $p['CYEAR2'], $p['NRUNNO'], "08", "00");
        $this->sa->insert('ISSPC_FORM', $data, $dateFields);
    }

    public function insertID()
    {
        $p       = $this->input->post();
        $dataReq = $this->sa->getSpecialAuth($p['NFRMNO'], $p['VORGNO'], $p['CYEAR'], $p['CYEAR2'], $p['NRUNNO'])[0];
        $dataEmp = $this->sa->getDataEmp($dataReq['EMP_REQUEST']);


        $this->sendEmail($dataEmp, $dataReq, $p);

        $data = [
            'SERVER_NAME'   => $dataReq['PLATFORM'],
            'USER_LOGIN'    => trim($p['USERNAME']),
            'USER_OWNER'    => $dataReq['OWNER'] ?: '(None)',
            'USER_DOMAIN'   => ' ',
            'DESCRIPT'      => $dataReq['REASON'],
            'AUTH_CLASS'    => $dataReq['CLASS'],
            'CATEGORY'      => $dataReq['CATEGORY'],
            'AUTH_OGANIZE'  => $dataReq['ORGANIZER'],
            'USER_TYPE1'    => $dataReq['DURATION_TYPE'],
            'USER_TYPE2'    => $dataReq['USER_TYPE'],
            'SERVER_TITLE'  => $dataReq['PLATFORM'],
            'USER_STATUS'   => $dataReq['USER_TYPE'] === 'Human' ? '0' : '1',
            'ROLE'          => $dataReq['ROLE'],
            'EMPNO'         => $dataReq['OWNER'] ? $dataReq['EMP_REQUEST'] : '',
            'START_DATE'    => $p['START_DATE'],
            'ACTIVE_STATUS' => '1',
        ];
        $this->sa->insertAudit($data);

        $data_update = [
            'USERNAME' => $p['USERNAME']
        ];
        $where       = [
            'NFRMNO' => $p['NFRMNO'],
            'VORGNO' => $p['VORGNO'],
            'CYEAR'  => $p['CYEAR'],
            'CYEAR2' => $p['CYEAR2'],
            'NRUNNO' => $p['NRUNNO']
        ];
        $this->sa->update('ISSPC_FORM', $data_update, $where);
    }

    public function sendEmail($dataEmp, $dataReq, $p)
    {
        // $mail_requester = $dataEmp->SRECMAIL;
        // print_r($dataEmp);

        $to      = $dataEmp->MEMEML;
        $subject = "Request Confirmation for Special Authorization ID";

        $passwordText = !empty($p['PASSWORD']) ? $p['PASSWORD'] : "(Not Apply)";

        $message = '
                <html>
                <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: "Sarabun", sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                </style>
                </head>
                <body>
                <h2>System Notification</h2>
                <p>Dear K. ' . $dataEmp->SNAME . ',</p>
                <p>Here are your login details for <strong>' . $dataReq['PLATFORM'] . '</strong>:</p>
                <p>Username: <strong>' . $p['USERNAME'] . '</strong></p>
                <p>Password: <strong>' . $passwordText . '</strong></p>
                <p>Please keep this information safe.</p>
                <p>--<br>Thank you,<br>WSD Sec. / IS Dept.<br>Mitsubishi Elevator Asia</p>
                </body>
                </html>';


        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html; charset=UTF-8" . "\r\n";
        $headers .= "From: System Notification <noreplay@MitsubishiElevatorAsia.co.th>" . "\r\n";

        if (mail($to, $subject, $message, $headers)) {
            echo json_encode(['status' => 'success', 'message' => 'Email sent successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to send email.']);
        }
    }

    public function Update_status()
    {
        $p = $this->input->post();
        print_r($p);
        $data  = [
            'ACTIVE_STATUS' => '0'
        ];
        $where = [
            'SERVER_NAME' => $p['servername'],
            'USER_LOGIN'  => $p['username']
        ];
        $this->sa->update_audit('ITGC_SPECIALUSER', $data, $where);
    }

    public function getUser()
    {
        $servername = $this->input->post('platform');
        $data       = $this->sa->getUser($servername);
        echo json_encode($data);
    }
}
