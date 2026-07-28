<?php
class formmaster extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('formmst/index', array('title' => 'nav-master-form'));
    }

    public function detail(){
        $this->views('formmst/detail', array('title' => 'nav-master-form'));
    }

    public function group(){
        $this->views('formmst/group', array('title' => 'nav-master-group'));
    }

    public function authen(){
        $this->views('formmst/authen', array('title' => 'nav-master-authen'));
    }
}