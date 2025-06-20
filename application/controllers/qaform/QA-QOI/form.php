<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
class form extends MY_Controller{
    use _Form;
    
    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'frm');
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
            echo "ifff";
        }else{
            $form = $this->frm->getFormMaster('QA-QOI');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }
            echo "else";
        }
        $data['empno'] = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") 
        {
            $data['return']   = false;
            $data['cextData'] = $this->getExtdata($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], $data['empno']);
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
           // $getEmpFlow = $this->frm->getEmpFlow($form, $data['empno']);
            $this->views('qaform/QA-QOI/view', $data);
        }
       


    }

   


}