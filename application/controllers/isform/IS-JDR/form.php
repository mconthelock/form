<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
class form extends MY_Controller{
    use _Form;
    protected $title;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('isform/IS-JDR/Task_model', 'task');
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
            $form = $this->frm->getFormMaster('IS-JDR');
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
            $formData         = $this->task->getData($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"]);
            $data['NRUNNO']   = $_GET["runNo"];
            $data['CYEAR2']   = $_GET["y2"];
            $data['cextData'] = $this->getExtdata($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"] , $data['empno']);
            $data['mode']     = $this->getMode($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], $data['empno']);
            $data['data']     = $formData;
            $data['cstep']    = $cstep;
            $data['firstStep'] = $cstep == '--' ? TRUE : FALSE;
            // if(!$data['firstStep']){
                $this->views('isform/IS-JDR/view', $data);
            // }
        }
    }

    public function getData(){
        $NFRMNO = $this->input->post('NFRMNO');
        $VORGNO = $this->input->post('VORGNO');
        $CYEAR  = $this->input->post('CYEAR');
        $CYEAR2 = $this->input->post('CYEAR2');
        $NRUNNO = $this->input->post('NRUNNO');
        $data   = $this->task->getData($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO);
        $res = [];
        $monthly = [];
        $endAb = [];
        $my = '';
        if(!empty($data)){
            foreach($data as $key => $d){
                $my = (new dateTime($d->JDR_START))->format('F Y');
                $cond = array(
                    'LOG_DATE >=' => (new DateTime($d->JDR_START))->format('Y-m-d'),
                    'LOG_DATE <=' => (new DateTime($d->JDR_END))->format('Y-m-d'),
                    'JOBSECTION'  => $d->JDR_SECTION
                );
                $res = array_merge($res, $this->task->getReport($cond));
                $monthly = array_merge($monthly, $this->task->getMonthly($cond));
                $endAb   = array_merge($endAb, $this->task->getEndAb($cond));
            }
        }
        echo json_encode(['data' => $res, 'my' => $my, 'monthly' => $monthly, 'endAb' => $endAb]);
    }  
}