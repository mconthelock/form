<?php

defined('BASEPATH') or exit('No direct script access allowed');
class Main extends MY_Controller
{
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $data = array();
        $this->views('isform/form-1/create', $data);
    }
}