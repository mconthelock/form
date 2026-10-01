<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
class form extends MY_Controller{
    function __construct(){
		parent::__construct();
    }

    public function main(){
        if (isset($_GET['runNo']) && $_GET['runNo'] !== '') {
            $this->views('purform/PUR-PRA/view');
        } else{
            $this->views('purform/PUR-PRA/form');
        }
    }
}