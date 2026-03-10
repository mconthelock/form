<?php
use GuzzleHttp\Client;
require_once APPPATH . 'controllers/api/webform/form.php';

defined('BASEPATH') OR exit('No direct script access allowed');
class main extends MY_Controller {

    use formApi;
    protected $client;
    function __construct()
    {
        parent::__construct();
        $this->load->model('ieform/IE-CHR/chr_model', 'chr');

        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        $data['NFRMNO'] = $nfrmno = $this->input->get('no');
        $data['VORGNO'] = $vorgno = $this->input->get('orgNo');
        $data['CYEAR']  = $cyear = $this->input->get('y');
        $data['CYEAR2'] = $cyear2 = $this->input->get('y2');
        $data['NRUNNO'] = $nrunno = $this->input->get('runNo');
        $data['EMPNO'] = $empno = $this->input->get('empno');

        $data['mode'] = $this->getMode(['NFRMNO' => $nfrmno, 'VORGNO' => $vorgno, 'CYEAR' => $cyear, 'CYEAR2' => $cyear2, 'NRUNNO' => $nrunno, 'EMPNO' => $empno,]);
        // print_r([$nfrmno, $vorgno, $cyear, $cyear2, $nrunno]);
        $dataform = $this->chr->getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);

        // print_r($dataform);

        $form = !empty($dataform) ? $dataform[0] : null;

        $data['form']   = $form;
        $data['record'] = $form
            ? $this->chr->getDataRecord($form->MONTH, $form->YEAR, $form->SHOP)
            : [];

        $this->views('ieform/IE-CHR/main', $data);
    }

    public function report()
    {
        $this->views('ieform/IE-CHR/report');
    }
}