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
            $log->TID_FORMNO = !empty($tidList[0])
                ? $this->toFormNumber($tidList[0]->NFRMNO, $tidList[0]->VORGNO, $tidList[0]->CYEAR, $tidList[0]->CYEAR2, $tidList[0]->NRUNNO)
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
            $fm   = $this->fm->getFormMaster('IS-DLC')[0];
            $flow = $this->create($fm->NNO, $fm->VORGNO, $fm->CYEAR, '92260', '92260', '', 1);
        }
    }
}