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
        $this->load->model('form_model', 'fm');
        $this->load->model('isform/IS-DLC/dlc_model', 'dm');
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        $no    = $this->input->get('no');
        $orgNo = $this->input->get('orgNo');
        $y     = $this->input->get('y');
        $y2    = $this->input->get('y2');
        $runno = $this->input->get('runNo');
        $empno = $this->input->get('empno');

        $form     = $this->fm->getForm($no, $orgNo, $y, $y2, $runno)[0];
        $datetime = DateTime::createFromFormat('d-M-y', $form->DREQDATE)->modify('-1 day')->format('Y-m-d');
        $logdata  = $this->dm->getLog($datetime);


        foreach ($logdata as $log) {
            $tidList         = $this->dm->get_TID($log->LOG_SERVER, $log->LOG_USER, $log->LOG_DATE);
            $log->TID_DATA   = $tidList;
            $lastTid         = !empty($tidList) ? end($tidList) : null;
            $log->TID_FORMNO = $lastTid
                ? $this->toFormNumber($lastTid->NFRMNO, $lastTid->VORGNO, $lastTid->CYEAR, $lastTid->CYEAR2, $lastTid->NRUNNO)
                : '-';
        }

        $data = [
            'NFRMNO'  => $no,
            'VORGNO'  => $orgNo,
            'CYEAR'   => $y,
            'CYEAR2'  => $y2,
            'NRUNNO'  => $runno,
            'EMPNO'   => $empno,
            'form'    => $form,
            'date'    => $datetime,
            'logdata' => $logdata,
            'mode'    => $this->getMode($no, $orgNo, $y, $y2, $runno, $empno)
        ];

        // echo "<pre>" . print_r($logdata, true) . "</pre>";
        $this->views('isform/IS-DLC/view', $data);
    }

    public function jobcreateform()
    {
        $datetime = date("Y-m-d", strtotime("-1 day"));
        $logdata  = $this->dm->getLog($datetime);
        if ($logdata) {
            $fm      = $this->fm->getFormMaster('IS-DLC')[0];
            $flow    = $this->create($fm->NNO, $fm->VORGNO, $fm->CYEAR, '13214', '13214', '', 1);
            $form    = $flow['message'];
            $empData = $this->dm->getDataUser($form['empno']);

            $mail = [
                'SUBJECT' => 'Daily Log Check Sheet Reminder',
                // 'TO'      => 'sutthipongt@MitsubishiElevatorAsia.co.th',
                'TO'      => $empData[0]->SRECMAIL,
                'CC'      => 'perapatr@MitsubishiElevatorAsia.co.th',
                'BODY'    => [
                    '<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                    <p>Dear K.' . $empData[0]->SNAME . '</p>

                    <p>
                        This is a reminder to complete your Daily Log Check Sheet for today.<br>
                        Please fill out the form using the link below.
                    </p>
                    <p>
                        Form Link: <a href="' . $_ENV['APP_ENV'] . '/isform/IS-DLC/main?no=' . $fm->NNO . '&orgNo=' . $fm->VORGNO . '&y=' . $form['cyear'] . '&y2=' . $form['cyear2'] . '&runNo=' . $form['runno'] . '&empno=' . $form['empno'] . '">Click Here to page</a>
                    </p>
                    <p>
                        For your consideration and Approval.
                    </p>

                    <p style="margin-top: 24px;">
                        Best regards,<br>
                        Thank you,<br>
                        IS Department
                    </p>
                </div>'
                ],
                'VIEW'    => 'layouts/mail/GP-ENT/mailAlert',
            ];
            echo json_encode($this->mail->sendmail($mail));
        }
    }
}