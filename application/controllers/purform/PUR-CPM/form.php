<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/api/webform/form.php';
class form extends MY_Controller{
    use flow, formmst, formApi;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
        // $this->doc = $this->load->database('AS400',true);
    }

    public function main(){
        if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
            $data = [
                'NFRMNO' => $_GET['no'],
                'VORGNO' => $_GET['orgNo'],
                'CYEAR'  => $_GET['y'],
            ];

        }else{
            $form = $this->getFormMasterByVaname('PUR-CPM');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }
        }
        $data['empno']       = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
        $data['mode']        = 1; // create mode

        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {
            $form = array(
                'NFRMNO' => $_GET['no'],
                'VORGNO' => $_GET['orgNo'],
                'CYEAR'  => $_GET['y'],
                'CYEAR2' => $_GET['y2'],
                'NRUNNO' => $_GET['runNo'],
                'EMPNO'  => $data['empno']
            );
            $data['NRUNNO']   = $_GET["runNo"];
            $data['CYEAR2']   = $_GET["y2"];
            $data['cextData'] = $this->getExtdata($form);
            $data['mode']     = $this->getMode($form);
            $this->views('purform/PUR-CPM/view', $data);
            exit();
        }
        $this->views('purform/PUR-CPM/form', $data);
    }
}