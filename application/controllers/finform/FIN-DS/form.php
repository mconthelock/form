<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';

class form extends MY_Controller{
    use formApi, flow, formmst;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
    }

    public function main(){
        $this->views('finform/FIN-DS/show');
    } 
    public function submain(){
        $this->views('finform/FIN-DS/create');
    }
}