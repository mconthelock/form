<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';

class main_edr extends MY_Controller {
    use _Form, _File;

    public function __construct(){
        parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
    }

    public function index(){
        $data = array();
        $this->views('mfgform/MFG-EDR/create_edr', $data);
    }
}