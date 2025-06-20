<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Documents extends MY_Controller {
    public function __construct(){
        parent::__construct();
        if(!isset($_SESSION['user'])) redirect('welcome');
    }

    public function index(){
        $data = array('title' => 'Licence Documents');
        $this->views('licence/documents/index', $data);
    }
}