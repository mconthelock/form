<?php
class formmaster extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index(){
        $this->views('formmst/index');
    }

    public function detail(){
        $this->views('formmst/detail');
    }
}