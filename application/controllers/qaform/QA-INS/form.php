<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
class form extends MY_Controller{
    use _Form;
    
    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('qaform/QA-INS/autorize_model', 'atr');
        $this->load->model('form_model', 'fr0m');
        $this->load->model('user_model', 'usr');
        $this->client = new Client(['verify' => false]);
    }

    public function main(){
        if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
            $data = [
                'NFRMNO' => $_GET['no'],
                'VORGNO' => $_GET['orgNo'],
                'CYEAR'  => $_GET['y'],
            ];

        }else{
            $form = $this->frm->getFormMaster('QA-INS');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }
        }
        $data['mode']  = 1; // create mode
        $data['empno'] = isset($_GET["empno"]) ? $_GET['empno'] : '' ;

        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {
            $data['return']   = false;
            $data['cextData'] = '';
            $data['NRUNNO']   = $_GET["runNo"];
            $data['CYEAR2']   = $_GET["y2"];
            $data['mode']     = $this->getMode($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], $data['empno']);
            $form       = [
                'NFRMNO' => $data['NFRMNO'],
                'VORGNO' => $data['VORGNO'],
                'CYEAR'  => $data['CYEAR'],
                'CYEAR2' => $data['CYEAR2'],
                'NRUNNO' => $data['NRUNNO'],
            ];
            $getEmpFlow = $this->form->getEmpFlow($form, $data['empno']);
            if (!empty($getEmpFlow)) {
                $data['cextData'] = $getEmpFlow[0]->CEXTDATA;
                $data['return'] = count($this->form->checkReturnb($form, $getEmpFlow[0]->CSTEPNEXTNO)) > 0 ? true : false;
            }
            if($data['return']){
                $this->views('qaform/QA-INS/form', $data);
            }else{
                $this->views('qaform/QA-INS/view', $data);
            }
        }else{
            // $data['item'] = $this->atr->getItem();
            $this->views('qaform/QA-INS/form', $data);
        }
    }

    public function getItem(){
        $item = $this->atr->getItem();
        echo json_encode($item);
    }

    public function getSection(){
        $section = $this->atr->getSection();
        echo json_encode($section);
    }

    public function getUserBySection($id = ''){
        if($id == ''){
            $user = $this->atr->getUserByID();
        }else{
            $user = $this->atr->getUserByID(['SEC_ID' => $id]);
        }
        echo json_encode($user);
    }

    public function getUser(){
        $user = $this->atr->getUser();
        echo json_encode($user);
    }

    public function getUserOrganize(){
        $user = $this->atr->getUserOrganize();
        echo json_encode($user);
    }


}