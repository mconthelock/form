<?php
class Phone extends MY_Controller {
    public function index() {
        $data =  array('pageid' => 'phone');
        $this->views('phone/index', $data);
    }
}