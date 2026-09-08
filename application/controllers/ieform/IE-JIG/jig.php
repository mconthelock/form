<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Jig extends MY_Controller {
    public function index() {
        //$this->session_expire();
       // $user = $_SESSION['user'];
        echo 'OK';
        /*
        $this->views('ieform/IE-JIG/request_form', [
            'inputBy' => $user->SEMPNO ?? '',
            'inputName' => $user->SNAME ?? '',
            'mode' => $this->input->get('mode') === 'edit' ? 'edit' : 'create',
        ]);*/
    }
}
