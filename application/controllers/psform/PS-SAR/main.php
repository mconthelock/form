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
        $this->load->model('psform/PS-SAR/sar_model', 'sar');
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        $this->views('psform/index');
    }

    public function getDataForm()
    {
        $nfrmno = $this->input->post('nfrmno');
        $vorgno = $this->input->post('vorgno');
        $cyear  = $this->input->post('cyear');
        $cyear2 = $this->input->post('cyear2');
        $nrunno = $this->input->post('nrunno');
        $data   = $this->sar->getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        echo json_encode($data);
    }
}