<?php
class Report extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('admin/report/index', array('title' => 'nav-report-master'));
    }
    public function detail(){
        $this->views('admin/report/detail', array('title' => 'nav-report-master'));
    }

    public function authen($id){
        $this->views('admin/report/authen', array('title' => 'nav-report-master', 'id' => $id));
    }
}