<?php
class Lines extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('gpform/bus/lines/index');
    }
}