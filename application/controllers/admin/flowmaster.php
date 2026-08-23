<?php
class flowmaster extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('admin/flowmaster/index', array('title' => 'nav-master-flow'));
    }
}