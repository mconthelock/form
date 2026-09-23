<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
class form extends MY_Controller{
    function __construct(){
		parent::__construct();
    }

    public function main(){
        if (isset($_GET['runNo']) && $_GET['runNo'] !== '') {
            $this->views('purform/PUR-CPC/view');
        } else{
            $this->views('purform/PUR-CPC/form');
        }
    }
<<<<<<< HEAD

    public function view(){
        $this->views('purform/PUR-CPC/view');
    }

    public function lists(){
        $this->views('purform/PUR-CPC/lists');
    }
=======
>>>>>>> e2e73ccd (feat: implement PUR-CPC form and related functionality, add price comparison steps and data handling)
}