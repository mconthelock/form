<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
class form extends MY_Controller{
    use formApi, flow, formmst;
    protected $title;
    protected $client;
    function __construct(){
		parent::__construct();
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
            $form = $this->getFormMasterByVaname('IS-TID');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }
        }
        $data['mode']     = 1;
        $empno = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
        $data['apv'] = $empno;
        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {
            $data['CYEAR2'] = $_GET['y2'];
            $data['NRUNNO'] = $_GET['runNo'];
            $form = [
                'NFRMNO' => (int)$data['NFRMNO'],
                'VORGNO' => (string)$data['VORGNO'],
                'CYEAR'  => (string)$data['CYEAR'],
                'CYEAR2' => (string)$data['CYEAR2'],
                'NRUNNO' => (int)$data['NRUNNO'],
            ];
            $form['EMPNO']    = (string)$empno;
            if(!empty($empno)){
                $data['cextData'] = $this->getExtData($form);
                $data['mode']     = $this->getMode($form);
            }
            $this->views('isform/IS-TID/view', $data);
        }else{
            $this->views('isform/IS-TID/form', $data);
        }
    }
}