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
        $this->formname = 'IS-DEV';
    }

    public function main(){
        $data = $this->setFormProp($this->formname);
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 1;
        if(isset($data["NRUNNO"]) && $data["NRUNNO"] != 0) {
            print_r($data);
            exit;
            $this->views("isform/{$this->formname}/show", $data);
        }else{
            //Create mode
            //Array ( [NFRMNO] => 5 [VORGNO] => 050601 [CYEAR] => 14 [CYEAR2] => 2026 [NRUNNO] => 0 [EMPNO] => 12069 [mode] => 1 )
            $this->views("isform/{$this->formname}/create", $data);
        }
    }
}