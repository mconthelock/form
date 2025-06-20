<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';
class form extends MY_Controller{
    use _Form;
    use _File;
    protected $title;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('isform/IS-OFF/Varied_model', 'vr');
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

        }else{
            $form = $this->frm->getFormMaster('IS-CFS');
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
                'NRUNNO' => $_GET['runNo']
            );
            $flowStep         = $this->frm->getEmpFlow($form, $data['empno']);
            $cstep            = !empty($flowStep) ? $flowStep[0]->CSTEPNO : '';
            $formData         = $this->vr->getData($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"]);
            $data['NRUNNO']   = $_GET["runNo"];
            $data['CYEAR2']   = $_GET["y2"];
            $data['cextData'] = $this->getExtdata($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"] , $data['empno']);
            $data['mode']     = $this->getMode($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], $data['empno']);
            $data['data']     = $formData;
            $data['cstep']    = $cstep;
            $data['firstStep'] = $cstep == '--' ? TRUE : FALSE;
            // if(!$data['firstStep']){
                $this->views('isform/IS-OFF/view', $data);
            // }
        }
    }

    public function getData(){
        $NFRMNO = $this->input->post('NFRMNO');
        $VORGNO = $this->input->post('VORGNO');
        $CYEAR  = $this->input->post('CYEAR');
        $CYEAR2 = $this->input->post('CYEAR2');
        $NRUNNO = $this->input->post('NRUNNO');
        $data   = $this->vr->getData($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO);
        echo json_encode($data);
    }  
    
    public function sendmailNextApv(){
        $form = [
            'NFRMNO' => $this->input->post('NFRMNO'),
            'VORGNO' => $this->input->post('VORGNO'),
            'CYEAR'  => $this->input->post('CYEAR'),
            'CYEAR2' => $this->input->post('CYEAR2'),
            'NRUNNO' => $this->input->post('NRUNNO'),
            'CEXTDATA' => '02'
        ];
        $data = $this->vr->getMail($form);
        if(!empty($data)){
            $mail = [
                'SUBJECT' => 'E-Form '.$this->toFormNumber($form['NFRMNO'], $form['VORGNO'], $form['CYEAR'], $form['CYEAR2'], $form['NRUNNO']),
                // 'TO'      => 'sutthipongt@MitsubishiElevatorAsia.co.th',
                'TO'      => $data[0]->SRECMAIL,
                'BODY'    => [
                    "List for Varied off AS400 display : Please approve/reject",
                    "1. Get into http://webflow/form",
                    "2. select 'Electronic forms'",
                    "3. select 'Waiting for approval'"
                ],
                'VIEW' =>'layouts/mail/mailAlert',
            ];
            echo json_encode($this->mail->sendmail($mail));
        }

    }




}