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
<<<<<<< HEAD
<<<<<<< HEAD
        $data['CATEGORY'] = 2;
        $data['PLANYEAR'] = date('Y');
=======
        $data['CATAGORY'] = 2;
>>>>>>> 171584cc (feat: enhance form handling by adding category data and refactoring form submission logic)
=======
        $data['CATEGORY'] = 2;
        $data['PLANYEAR'] = date('Y');
>>>>>>> 1922b1ad (fix: correct category key and add plan year to form data; update hidden inputs in create view)
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 1;
        if(isset($data["NRUNNO"]) && $data["NRUNNO"] != 0) {
            $this->views("isform/IS-DEV/show", $data);
        }else{
            //Create mode
            $this->views("isform/IS-DEV/create", $data);
        }
    }

    public function show(){
        $data = $this->setFormProp($this->formname);
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 2;
        $this->views("isform/IS-DEV/show", $data);
    }
}