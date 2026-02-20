<?php
class Passenger extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $data = array();
        $this->views('gpform/BUS/passenger/index', $data);
    }
}