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
        $data['EMPNO'] = isset($_GET['empno']) ? trim($_GET['empno']) : '';

        if (!empty($data['NRUNNO'])) {
            $data['mode'] = 3;
            $this->views("gpform/{$this->formname}/show", $data);
            return;
        }

        $data['mode'] = 1;
        $this->views("gpform/{$this->formname}/create", $data);
    }

    public function report(){

    }
    public function area(){
        $this->views("gpform/{$this->formname}/area");
    }
}
