<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/api/escs/user_section.php';
class form extends MY_Controller{
    use formApi, flow, formmst, escs_user_section;
    
    protected $client;
    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
    }

    public function main(){
        try {
            if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
                $data = [
                    'NFRMNO' => $_GET['no'],
                    'VORGNO' => $_GET['orgNo'],
                    'CYEAR'  => $_GET['y'],
                ];

            }else{
                $form = $this->getFormMasterByVaname('QA-INS');
                if(!empty($form)){
                    $data = [
                        'NFRMNO' => $form[0]->NNO,
                        'VORGNO' => $form[0]->VORGNO,
                        'CYEAR'  =>$form[0]->CYEAR,
                    ];
                }
            }
            $data['empno'] = isset($_GET["empno"]) ? $_GET['empno'] : '' ;

            if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {
                $data['NRUNNO']   = $_GET["runNo"];
                $data['CYEAR2']   = $_GET["y2"];
                $form       = [
                    'NFRMNO' => $data['NFRMNO'],
                    'VORGNO' => $data['VORGNO'],
                    'CYEAR'  => $data['CYEAR'],
                    'CYEAR2' => $data['CYEAR2'],
                    'NRUNNO' => $data['NRUNNO'],
                    'EMPNO' =>  $data['empno']
                ];
                $data['cextData'] = $this->getExtData($form);
                $data['mode']     = $this->getMode($form);
                $data['return']   = $this->checkReturn($form);
                if($data['return']){
                    $this->views('qaform/QA-INS/form', $data);
                }else{
                    $this->views('qaform/QA-INS/view', $data);
                }
            }else{
                $data['mode']  = 1; // create mode
                $this->views('qaform/QA-INS/form', $data);
            }
        } catch (Exception $e) {
            show_error($e->getMessage());
        }
    }

    public function auditMaster($userId, $secId){
        $data['userId'] = $userId;
        $data['secId'] = $secId;
        $checkSec = $this->getUserSecByID($secId);
        if($checkSec['status'] == "false"){
            show_error('Section id not found');
        }
        $this->views('qaform/QA-INS/auditMaster', $data);
    }


}