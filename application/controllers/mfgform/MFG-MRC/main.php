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
        $this->load->model('mfgform/MFG-MRC/mrc_model', 'mm');
        $this->load->model('form_model', 'fm');
        $this->client = new Client(['verify' => false]);
        // Load necessary models, helpers, or libraries here
    }

    public function index()
    {
        // Default method for this controller
        $no    = $this->input->get('no');
        $orgNo = $this->input->get('orgNo');
        $y     = $this->input->get('y');
        $y2    = $this->input->get('y2');
        $runno = $this->input->get('runNo');

        $data           = [
            'NFRMNO' => $no,
            'VORGNO' => $orgNo,
            'CYEAR'  => $y,
            'CYEAR2' => $y2,
            'NRUNNO' => $runno,
        ];
        $empno          = $this->input->get('empno');
        $data_form      = $this->mm->select('MFGMRC_FORM', [
            'NFRMNO' => $no,
            'VORGNO' => $orgNo,
            'CYEAR'  => $y,
            'CYEAR2' => $y2,
            'NRUNNO' => $runno,
        ]);
        $data_record    = $this->mm->get_data($data_form[0]->SHOP, date('mY', strtotime($data_form[0]->CREATE_AT)));
        $data['record'] = $data_record;
        $this->views('mfgform/MFG-MRC/main_view', $data);

    }

    public function createForm()
    {
        $fm   = $this->fm->getFormMaster('MFG-MRC')[0];
        $data = $this->mm->getGroupData();
        echo "<pre>";
        print_r($data);
        echo "</pre>";

        foreach ($data as $key => $item) {
            $flow = $this->create($fm->NNO, $fm->VORGNO, $fm->CYEAR, $item->SHOP_INCHARGE, $item->SHOP_INCHARGE, '');
            $form = $flow['message'];

            $data_form = [
                'NFRMNO' => $fm->NNO,
                'VORGNO' => $fm->VORGNO,
                'CYEAR'  => $fm->CYEAR,
                'CYEAR2' => $form['cyear2'],
                'NRUNNO' => $form['runno'],
                'EMPNO'  => $item->SHOP_INCHARGE,
                'MONTH'  => date('m'),
                'SHOP'   => $item->SHOP_NAME,
            ];

            $this->mm->insert('MFGMRC_FORM', $data_form);

            echo "<pre>";
            print_r($form);
            echo "</pre>";
        }
        // $flow = $this->create($nfrmno, $vorgno, $cyear, '92260', '92260', '', 1);
    }

    // Add more controller methods as needed
}