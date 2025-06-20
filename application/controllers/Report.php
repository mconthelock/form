<?php
class Report extends MY_Controller {
    public function __construct(){
        parent::__construct();
        // if(!isset($_SESSION['user'])) redirect('welcome');
    }

    public function index() {
        $this->views('report/index');
    }
}