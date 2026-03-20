<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . 'controllers/api/webform/form.php';
class Main extends MY_Controller {
    use formApi;
    protected $client;
    public function __construct()
    {
        parent::__construct();
        // Load any necessary libraries, models, etc.
        $this->load->model('psform/PS-ID/psid_model', 'psid');
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        $data['nfrmno'] = $this->input->get('no');
        $data['vorgno'] = $this->input->get('orgNo');
        $data['cyear']  = $this->input->get('y');
        $data['cyear2'] = $this->input->get('y2');
        $data['nrunno'] = $this->input->get('runNo');
        $data['empno']  = $this->input->get('empNo');
        $data['mode']   = $this->getMode([
            'NFRMNO' => $data['nfrmno'],
            'VORGNO' => $data['vorgno'],
            'CYEAR'  => $data['cyear'],
            'CYEAR2' => $data['cyear2'],
            'NRUNNO' => $data['nrunno'],
            'EMPNO'  => $this->input->get('empno')
        ]);
        $this->views('psform/PS-ID/index', $data);
    }

    public function getDataForm()
    {
        $nfrmno = $this->input->post('nfrmno');
        $vorgno = $this->input->post('vorgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');
        $data   = $this->psid->getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        echo json_encode($data);
    }


    // Add more methods as needed
}