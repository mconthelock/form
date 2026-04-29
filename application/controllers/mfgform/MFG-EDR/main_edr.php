<?php
class main_edr extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        echo "Hello world";
        exit;
        $data = array();
        $this->views('mfgform/MFG-EDR/create_view', $data);
    }
}