<?php

defined('BASEPATH') or exit('No direct script access allowed');
class Form extends MY_Controller
{
    public function __construct(){
        parent::__construct();
    }

    public function main(){
        $data = array();
        $this->views('isform/form-1/create', $data);
    }
}