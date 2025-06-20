<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Test extends MY_Controller
{

    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        $data['title'] = 'Test Page';
        print_r($_SESSION);
        $this->views('otform/test_view', $data);
    }

    public function read_card()
    {
        $this->views("otform/login");
    }
}