<?php
use GuzzleHttp\Client;
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
class Main extends MY_Controller {
    use _Form;

    protected $client;
    public function __construct()
    {
        parent::__construct();

    }

    public function index()
    {
        $data = [
            'NFRMNO' => $this->input->get('no'),
            'VORGNO' => $this->input->get('orgNo'),
            'CYEAR'  => $this->input->get('y'),
            'CYEAR2' => $this->input->get('y2'),
            'NRUNNO' => $this->input->get('runNo'),
            'EMPNO'  => $this->input->get('empno')
        ];
        $this->views('psform/PS-YIC/index', $data);
    }

    public function detail()
    {
        $this->views('psform/PS-YIC/detail');
    }

    public function detail2()
    {
        $this->views('psform/PS-YIC/detail2');
    }
}