<?php
class form extends MY_Controller {
    public function __construct(){
        parent::__construct();
    }

    public function index($id = 1){
        $this->views('form/index', array('id' => $id, 'title' => 'nav-approval'));
    }

    public function create(){
        $data = array('department' => $this->setFormDept(), 'title' => 'form-create');
        $this->views('form/create/index', $data);
    }

    public function createdetail($id){
        $dept = $this->setFormDept();
        $selectedDept = array_filter($dept, function($d) use ($id) {
            return $d['id'] == $id;
        });
        $data['department'] = reset($selectedDept);
        $data['title'] = 'form-create';
        $this->views('form/create/createdetail', $data);
    }

    public function detail(){
        $target = $_GET['data']; //$url;
        $this->views('form/detail', array('target' => $target));
    }

     public function getFormDept(){
        $data = $this->setFormDept();
        echo json_encode($data);
     }

    private function setFormDept(){
        return array(
            array('id'=> 1, 'code' => 'gp' , 'name' => 'GA & HR Form', 'link'=> array('030101', '020601')),
            array('id'=> 2, 'code' => 'mfg' , 'name' => 'MFG Form', 'link'=> array('060101', '060701')),
            array('id'=> 3, 'code' => 'qa' , 'name' => 'QA Form', 'link'=> array('000101', '050301', '000301', '000501')),
            array('id'=> 4, 'code' => 'is' , 'name' => 'IS Form', 'link'=> array('050601', '050603')),
            array('id'=> 5, 'code' => 'fe' , 'name' => 'FE Form', 'link'=> array('050401', '051003', '051001')),
            array('id'=> 6, 'code' => 'ie' , 'name' => 'IE Form', 'link'=> array('051401')),
            array('id'=> 7, 'code' => 'ps' , 'name' => 'PS Form', 'link'=> array('050501', '050504')),
            array('id'=> 8, 'code' => 'de' , 'name' => 'DED Form', 'link'=> array('070101')),
            array('id'=> 9, 'code' => 'epl' , 'name' => 'EPL Form', 'link'=> array('070202')),
            array('id'=> 10, 'code' => 'pur' , 'name' => 'PUR Form', 'link'=> array('090101', '120101')),
            array('id'=> 11, 'code' => 'mar' , 'name' => 'MAR Form', 'link'=> array('110101', '110201', '090301')),
            array('id'=> 12, 'code' => 'fin' , 'name' => 'Fin Form', 'link'=> array('080101')),
        );
    }
}