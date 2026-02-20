<?php
use GuzzleHttp\Client;
defined('BASEPATH') or exit('No direct script access allowed');
// require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/api/webform/form.php';
class Main extends MY_Controller {
    use formApi;

    protected $client;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('psform/PS-CI/psci_model', 'psci');
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        // $data['nfrmno'] = $this->input->get('nfrmno');
        // $data['vorgno'] = $this->input->get('vorgno');
        // $data['cyear']  = $this->input->get('cyear');
        // $data['cyear2'] = $this->input->get('cyear2');
        // $data['nrunno'] = $this->input->get('nrunno');
        $data['mode'] = $this->getMode([
            'NFRMNO' => $this->input->get('no'),
            'VORGNO' => $this->input->get('orgNo'),
            'CYEAR'  => $this->input->get('y'),
            'CYEAR2' => $this->input->get('y2'),
            'NRUNNO' => $this->input->get('runNo'),
            'EMPNO'  => $this->input->get('empno')
        ]);
        $this->views('psform/PS-CI/index', $data);
    }

    public function getDataForm()
    {
        $nfrmno = $this->input->post('nfrmno');
        $vorgno = $this->input->post('vorgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');
        $data   = $this->psci->getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $list   = $this->psci->getListItem($data[0]->ASSIGN_ID);


        // echo "<pre>";
        // print_r($list);
        // echo "</pre>";
        echo json_encode($list);
    }
}