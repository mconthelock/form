<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
class form extends MY_Controller{
    function __construct(){
		parent::__construct();
    }

    public function main(){
        $this->views('purform/PUR-CPC/form');
    }

    public function view(){
        $this->views('purform/PUR-CPC/view');
    }
}