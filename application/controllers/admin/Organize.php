<?php
class Organize extends MY_Controller {
    public function __construct(){
        parent::__construct();
        //if(!isset($_SESSION['user'])) redirect('welcome');
    }

    public function index($status = 1){}
}