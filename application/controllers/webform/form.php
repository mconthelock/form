<?php
class form extends MY_Controller {
    public function __construct(){
        parent::__construct();
        $this->load->library('FormDept');
    }

    public function index($id = 1){
        $status = array(
            0 => 'nav-form-draft',
            1 => 'nav-form-waitapprove',
            2 => 'nav-form-comming',
            3 => 'nav-form-mine',
            4 => 'nav-form-approved',
            5 => 'nav-form-represent',
            6 => 'nav-form-finish'
        );
        $uri = base_url().'webform/form/list/'.$id;
        $this->views('form/detail', array('id' => $id, 'title' => $status[$id], 'target' => $uri));
    }

    public function list($id = 1){
        $this->views('form/index',array('id' => $id));
    }

    public function create(){
        $data = array('department' => $this->formdept->setFormDept(), 'title' => 'nav-form-create');
        $this->views('form/create/index', $data);
    }

    public function createdetail($id){
        $dept = $this->formdept->setFormDept();
        $selectedDept = array_filter($dept, function($d) use ($id) {
            return $d['id'] == $id;
        });
        $data['department'] = reset($selectedDept);
        $data['title'] = 'form-create';
        $this->views('form/create/createdetail', $data);
    }

    public function detail(){
        $target = $_GET['data']; //$url;
        $title = isset($_GET['title']) ? $_GET['title'] : 'nav-form-create'; //$title;
        $this->views('form/detail', array('target' => $target, 'title' => $title));
    }

     public function getFormDept(){
        $data = $this->formdept->setFormDept();
        echo json_encode($data);
     }
}