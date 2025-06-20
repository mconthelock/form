<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Template extends MY_Controller {
    public function __construct(){
        parent::__construct();
        if(!isset($_SESSION['user'])) redirect('/');
        $this->load->model('licence/Template_model', 'tmp');
    }

    public function index(){
        $data = array('title' => 'Documents Template');
        $this->views('licence/template/index', $data);
    }

    public function add(){
        $data = array('title' => 'New Document template');
        $this->views('licence/template/detail/add', $data);
    }

    public function getDocCategory(){
        $data = $this->tmp->getDocCategory();
        echo json_encode($data);
    }
}