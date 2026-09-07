<?php
class report extends MY_Controller {
    public function __construct(){
        parent::__construct();
        //if(!isset($_SESSION['user'])) redirect('welcome');
        $this->load->library('FormDept');
    }

    public function index(){
        $data['department'] = $this->formdept->setFormDept();
        $data['title'] = 'nav-report';
        $this->views('report/index', $data);
    }

    public function detail($dept_id){
        $data['department'] = $this->formdept->setFormDept();
        $data['selected_dept'] = null;
        foreach($data['department'] as $dept){
            if($dept['id'] == $dept_id){
                $data['selected_dept'] = $dept;
                break;
            }
        }
        $this->views('report/detail', $data);
    }
}