<?php
class formmst extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('formmst/index');
    }
}