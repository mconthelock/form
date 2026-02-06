<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Routes extends MY_Controller {

    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $data['api_base'] = $_ENV['APP_API'];
        $this->views('gpform/BUS/routes/index', $data);
    }

}
