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
        $this->formname = 'DEV';
    }

    public function main(){
        $data = $this->setFormProp($this->formname);
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 1;
        if(isset($data["NRUNNO"]) && $data["NRUNNO"] != 0) {
            $this->views("isform/FORM-1/show", $data);
        }else{
            //Create mode
            $this->views("isform/FORM-1/create", $data);
        }
    }
}