<?php
class report extends MY_Controller {
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

    public function create(){
        $data = array('department' => $this->setDept());
        $this->views('form/create/index', $data);
    }

    public function createdetail($id){
        $dept = $this->setDept();
        $selectedDept = array_filter($dept, function($d) use ($id) {
            return $d['link'] === $id;
        });
        $data['department'] = reset($selectedDept);
        $this->views('form/create/createdetail', $data);
    }

    private function setDept(){
        return array(
            array('id' => 'is' , 'name' => 'IS Form', 'link'=> '050601'),
            array('id' => 'gp' , 'name' => 'GA & HR Form', 'link'=> '030101'),
            array('id' => 'qa' , 'name' => 'QA Form', 'link'=> '000101'),
            array('id' => 'fe' , 'name' => 'FE Form', 'link'=> '050401'),
            array('id' => 'ie' , 'name' => 'IE Form', 'link'=> '050401'),
            array('id' => 'ps' , 'name' => 'PS Form', 'link'=> '050501'),
            array('id' => 'fin' , 'name' => 'Fin Form', 'link'=> '#'),
            array('id' => 'de' , 'name' => 'DED Form', 'link'=> '#'),
            array('id' => 'pur' , 'name' => 'PUR Form', 'link'=> '#'),
            array('id' => 'mfg' , 'name' => 'MFG Form', 'link'=> '#'),
            array('id' => 'epl' , 'name' => 'EPL Form', 'link'=> '#'),
            array('id' => 'mar' , 'name' => 'MAR Form', 'link'=> '#'),
        );
    }
}