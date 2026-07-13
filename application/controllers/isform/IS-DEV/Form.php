<?php

defined('BASEPATH') or exit('No direct script access allowed');
class Form extends MY_Controller
{
    public function __construct(){
        parent::__construct();
    }

    public function main(){
        if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
            $data = [
                'NFRMNO' => $_GET['no'],
                'VORGNO' => $_GET['orgNo'],
                'CYEAR'  => $_GET['y'],
            ];

        }else{
            $form = $this->getFormMasterByVaname('IS-DEV');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form["data"]["NNO"],
                    'VORGNO' => $form["data"]["VORGNO"],
                    'CYEAR'  => $form["data"]["CYEAR"],
                ];
            }
        }
        $data['empno']       = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
        $data['mode']        = 1; // create mode

        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {$form = array(
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
            $data['return']   = $this->checkReturn($form);
            $this->views('isform/is-dev/view', $data);
        }else
        {
            $this->views('isform/is-dev/create', $data);
        }


    }
}