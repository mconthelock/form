<?php
class formmst extends MY_Controller {
    public function __construct(){
        parent::__construct();
        //if(!isset($_SESSION['user'])) redirect('welcome');
    }

    public function index($status = 1){
        $titles = array(
            0 => 'Under Preparation',
            1 => 'Waiting for approval',
            2 => 'Comming Soon',
            3 => 'Mine',
            4 => 'Approved/Rejected',
            5 => 'Representative',
            6 => 'Finished'
        );
        $data = array('status' => $status,'title'=>$titles[$status]);
        $this->views('form/index', $data);
    }
}