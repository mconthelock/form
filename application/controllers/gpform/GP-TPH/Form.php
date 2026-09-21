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
        $this->formname = 'GP-TPH';
    }

    public function main(){
        $data = $this->setFormProp($this->formname);
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 1;
        // Use one form for both creation and editing.  The page detects an
        // existing NRUNNO and loads that request before it is submitted.
        $this->views("gpform/{$this->formname}/create", $data);


    }

    public function report(){

    }
    public function area(){
        $this->views("gpform/{$this->formname}/area");
    }
}
