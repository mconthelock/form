<?php
class Formmaster extends MY_Controller {
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

    public function authen(){
        $this->views('admin/formmst/authen', array('title' => 'nav-master-form'));
    }

    public function getStepMaster(){
        $this->load->model('my_model');
        $data = $this->my_model->customSelect('STEPMST', '', 'CNO, VNAME', '', 'CNO ASC');
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}