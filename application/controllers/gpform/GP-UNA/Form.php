<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/formmst.php';

class form extends MY_Controller{
    use formmst;
    protected $formkey;
    protected $client;
    protected $formname;

    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
        $this->formname = 'GP-UNA';
    }

    public function main(){
        $data = $this->setFormProp($this->formname);
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        if(isset($data["NRUNNO"]) && $data["NRUNNO"] != 0) {
            //Approve or view mode
            $this->views("gpform/{$this->formname}/show", $data);

        }else{show_404();}
        //throw new Exception("Error Processing Request", 1);


    }
}