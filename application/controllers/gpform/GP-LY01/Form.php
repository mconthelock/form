<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/formmst.php';

class Form extends MY_Controller{
    use formmst;
    protected $formkey;
    protected $client;
    protected $formname;

    public function __construct(){
        parent::__construct();
         $this->client = new Client(['verify' => false]);
        $this->formname = 'GP-LY01';
    }

    public function main(){
        $data = $this->setFormProp($this->formname);
        if(empty($data)) throw new Exception("Error Processing Request", 1);
        $this->views("gpform/GP-LY01/index", $data);
    }
}