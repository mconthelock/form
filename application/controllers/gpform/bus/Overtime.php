<?php
class Overtime extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('gpform/bus/overtime/index');
    }
}