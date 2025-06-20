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
        $this->load->model('isform/IS-TID/userEnv_model', 'en');
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
            $form = $this->frm->getFormMaster('IS-TID');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }
        }
        $data['serverName'] = $this->en->getServerName();

        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {
            $empno            = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
            $formData         = $this->en->getData($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"])[0];
            $data['NRUNNO']   = $_GET["runNo"];
            $data['CYEAR2']   = $_GET["y2"];
            $data['apv']      = $empno;
            $data['cextData'] = $this->getExtdata($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"] , $empno);
            $data['mode']     = $this->getMode($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], $empno);
            $data['data']     = $formData;
            // $data['data']     = $this->en->getData($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"])[0];
            // $data['link']     = $this->getRequestNo($formData->TID_REQNO)['form'][0]->LINK;
            if(strpos($formData->TID_REQNO, '|') !== false){
                $reqNo = explode('|', $formData->TID_REQNO);
                foreach($reqNo as $key => $r){
                    $link[$key]['url'] = $this->getRequestNo(trim($r))['form'][0]->LINK;
                    $link[$key]['req'] = trim($r);
                }
            }else{
                $link = $this->getRequestNo($formData->TID_REQNO)['form'][0]->LINK;
            }
            $data['link'] = $link;
            $this->views('isform/IS-TID/view', $data);
        }else{
            $this->views('isform/IS-TID/form', $data);
        }
    }

    public function getDataOnLoad(){
        $res = [
            'ctrl'      => $this->en->getController(),
            'userLogin' => $this->en->getUserLogin()
        ];
        echo json_encode($res);
    }

    public function createForm(){
        try {
            $post = $this->input->post();
            $status = false;
            $deleteFlowStep = [];
            $updateFlowStep = [];
            $message = '';
            $stepDelete = [
                [ 'CSTEPNO' => '19', 'CSTEPNEXTNO' => '28',],
                [ 'CSTEPNO' => '08', 'CSTEPNEXTNO' => '04',],
                [ 'CSTEPNO' => '04', 'CSTEPNEXTNO' => '00',],
            ];
            $post = array_map(function($item) {
                return is_array($item) ? $item : trim($item);
            }, $post);
            
            $reqNo = '';
            foreach($post['reqNo'] as $key => $r){
                $reqNo .= $r.'|';
            }
            $this->frm->trans_start();
            $form1 = [
                'NFRMNO' => $post['formtype'],
                'VORGNO' => $post['owner'],
                'CYEAR'  => $post['cyear'],
                'CYEAR2' => $post['cyear2'],
                'NRUNNO' => $post['runno'],
                'TID_REQUESTER' => $post['requester'],
                'TID_REQNO'     => rtrim($reqNo,'|'),
                // 'TID_REQNO'     => $post['reqNo'],
                'TID_REQ_DATE'  => $this->conVdateToDB($post['reqDate']),
                'TID_TIMESTART' => $post['pStart'],
                'TID_TIMEEND'    => $post['pEnd'],
                'TID_SERVERNAME' => $post['serverName'],
                'TID_USERLOGIN'  => $post['userID'],
                'TID_CONTROLLER' => $post['controller'],
                'TID_WORKCONTENT' => $post['workCon'],
                'TID_REASON'      => $post['reason'],
                'TID_CHANGEDATA'  => $post['changeData'],
                'TID_FORMTYPE'    => $post['formType'],
            ];
            $updateFlowStep[] = $this->setFlow($form1, isset($post['ctrlRequester']) ? $post['ctrlRequester'] : '');
            if($post['formType'] == '2'){
                $form2 = [
                    'NFRMNO' => $post['ctrlformtype'],
                    'VORGNO' => $post['ctrlowner'],
                    'CYEAR'  => $post['ctrlcyear'],
                    'CYEAR2' => $post['ctrlcyear2'],
                    'NRUNNO' => $post['ctrlrunno'],
                    'TID_REQUESTER' => $post['ctrlRequester'],
                    'TID_REQNO'     => $this->toFormNumber($post['formtype'], $post['owner'], $post['cyear'], $post['cyear2'], $post['runno']),
                    'TID_REQ_DATE'  => $this->conVdateToDB($post['reqDate']),
                    'TID_TIMESTART' => $post['pStart'],
                    'TID_TIMEEND'    => $post['ctrlPEnd'],
                    'TID_SERVERNAME' => $post['serverName'],
                    'TID_USERLOGIN'  => $post['ctrlUserID'],
                    'TID_WORKCONTENT' => $post['ctrlWorkCon'],
                    'TID_CHANGEDATA'  => $post['changeData'],
                    'TID_FORMTYPE'    => $post['formType'],
                ];
                $updateFlowStep[] = $this->setFlow($form2);
                $deleteFlowStep[] = $this->deleteFlowStep($stepDelete, $form2['NFRMNO'], $form2['VORGNO'], $form2['CYEAR'], $form2['CYEAR2'], $form2['NRUNNO']);
            }else{
                $deleteFlowStep[] = $this->deleteFlowStep($stepDelete, $form1['NFRMNO'], $form1['VORGNO'], $form1['CYEAR'], $form1['CYEAR2'], $form1['NRUNNO']);
            }
            $this->frm->trans_complete();
            $status = $this->frm->trans_status() === FALSE  ? false : true;
            // $status = false;
        } catch ( Exception $e) {
            $status = false;
            $message = "สร้างฟอร์มไม่สำเร็จ";
        } finally {
            // $updateFlowStep[0]['status'] = false;
            // $updateFlowStep[1]['status'] = false;
            foreach ($deleteFlowStep as $key => $d) {
                $d = (object) $d;
                if(!$d->status){
                    $status = false;
                }
            }
            foreach ($updateFlowStep as $key => $u) {
                $u = (object) $u;
                if(!$u->status){
                    $status = false;
                }
            }
            if(!$status){
                foreach ($updateFlowStep as $key => $u) {
                    $u = (object) $u;
                    $res = (object)$u->res;
                    $cond = [
                        'NFRMNO' => $res->FORM['NFRMNO'],
                        'VORGNO' => $res->FORM['VORGNO'],
                        'CYEAR'  => $res->FORM['CYEAR'],
                        'CYEAR2' => $res->FORM['CYEAR2'],
                        'NRUNNO' => $res->FORM['NRUNNO'],
                    ];
                    $this->frm->delete('ISTID_FORM', $cond);
                    $message = "สร้างฟอร์มไม่สำเร็จ";
                }
            }
            $res = [
                'status' => $status,
                'message' => $message,
                'deleteFlowStep' => $deleteFlowStep,
                'updateFlowStep' => $updateFlowStep,
            ];
            echo json_encode($res);
        }
    }

    private function setflow($form, $controller = ''){
        $headno = $this->usr->getHeadno($form['TID_REQUESTER']);
        $sem    = !empty($headno) ? $headno[0]->HEADNO : '' ;
        $apv = [
            [ 'CSTEPNO' => '06', 'CSTEPNEXTNO' => '19', 'apv' => $sem],
            [ 'CSTEPNO' => '19', 'CSTEPNEXTNO' => '28', 'apv' => $controller],
            [ 'CSTEPNO' => '28', 'CSTEPNEXTNO' => '10', 'apv' => $form['TID_REQUESTER']],
            [ 'CSTEPNO' => '10', 'CSTEPNEXTNO' => '08', 'apv' => $sem],
            [ 'CSTEPNO' => '08', 'CSTEPNEXTNO' => '04', 'apv' => $controller],
        ];
        $this->frm->insert('ISTID_FORM', $form);
        return $this->updateFlowApv($form, $apv);
        // return $this->updateFlowApv("", $sem, $form['NFRMNO'], $form['VORGNO'], $form['CYEAR'], $form['CYEAR2'], $form['NRUNNO'], '06', '19');
    }

    public function updateCompTime(){
        $post = $this->input->post();
        $data = [
            'TID_COMP_DATE'   => $this->conVdateToDB($post['compDate']),
            'TID_COMP_TIME'   => $post['compTime'],
        ];

        $cond = [
            'NFRMNO' => $post['NFRMNO'],
            'VORGNO' => $post['VORGNO'],
            'CYEAR'  => $post['CYEAR'],
            'CYEAR2' => $post['CYEAR2'],
            'NRUNNO' => $post['NRUNNO'],
        ];
        $status = $this->frm->update('ISTID_FORM', $data, $cond);
        $res = [
            'status' => $status,
            'message' => $status ? 'Update Success' : 'Update Failed',
            'data' => $data,
            'cond' => $cond,
        ];
        echo json_encode($res);
    }

    public function updateDisTime(){
        $post = $this->input->post();
        $data = [
            'TID_DISABLE_DATE'   => $this->conVdateToDB($post['disDate']),
            'TID_DISABLE_TIME'   => $post['disTime'],
        ];

        $cond = [
            'NFRMNO' => $post['NFRMNO'],
            'VORGNO' => $post['VORGNO'],
            'CYEAR'  => $post['CYEAR'],
            'CYEAR2' => $post['CYEAR2'],
            'NRUNNO' => $post['NRUNNO'],
        ];
        $status = $this->frm->update('ISTID_FORM', $data, $cond);
        $res = [
            'status' => $status,
            'message' => $status ? 'Update Success' : 'Update Failed',
            'data' => $data,
            'cond' => $cond,
        ];
        echo json_encode($res);
    }


}