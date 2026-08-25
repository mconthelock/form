<?php
class formmaster extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('admin/formmst/index', array('title' => 'nav-master-form'));
    }

    public function detail(){
        $this->views('admin/formmst/detail', array('title' => 'nav-master-form'));
    }

    public function group(){
        $this->views('admin/formmst/group', array('title' => 'nav-master-group'));
    }

    public function authen($no, $org, $cyear){
        $this->views('admin/formmst/authen', array(
            'title' => 'nav-master-authen',
            'no' => $no,
            'org' => $org,
            'cyear' => $cyear,
        ));
    }
}