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
        $this->load->model('qaform/QA-QOI/qoi_model', 'qoi');
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
            $form = $this->frm->getFormMaster('QA-QOI');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }
            
        }
        $data['empno'] = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") 
        {
            $data['return']   = false;
            $data['NRUNNO']   = $_GET["runNo"];
            $data['CYEAR2']   = $_GET["y2"];
            $data['cextData'] = $this->getExtdata($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO'], $data['empno']);
            $data['mode']     = $this->getMode($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO'], $data['empno']);
            $form       = [
                'NFRMNO' => $data['NFRMNO'],
                'VORGNO' => $data['VORGNO'],
                'CYEAR'  => $data['CYEAR'],
                'CYEAR2' => $data['CYEAR2'],
                'NRUNNO' => $data['NRUNNO']
            ];
            $data['formno'] = $this->toFormNumber($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO']);
            $data['qoiform'] = $this->qoi->getqoiform($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO'])[0];
            $data['resultdwg'] = $this->qoi->customSelect("RESULTQOIDWG",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO']),'DWGNO , RESULT , REMARK');

           // customSelect($table, $cond = '', $select='', $distinct='', $order='');
           // $getEmpFlow = $this->frm->getEmpFlow($form, $data['empno']);
            $this->views('qaform/QA-QOI/view', $data);
        }
       


    }

   


}