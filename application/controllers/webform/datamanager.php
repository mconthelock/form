<?php
class datamanager extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('webform/datamanager/index',['title' => 'nav-data-manager']);
    }
}