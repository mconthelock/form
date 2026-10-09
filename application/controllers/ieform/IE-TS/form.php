<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/api/webform/form.php';
class form extends MY_Controller{
    use flow, formmst, formApi;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
        // $this->doc = $this->load->database('AS400',true);
    }

    public function main(){
            $data['empno']       = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
        $data['mode']        = 1; // create mode
        $this->views('ieform/IE-TS/create', $data);
    }


}