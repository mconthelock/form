<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/api/escs/user_section.php';
require_once APPPATH.'controllers/api/escs/audit_report_revision.php';
class form extends MY_Controller{
    use formApi, flow, formmst, escs_user_section, audit_report_revision;
    
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
        try {
            // $secId = 1; // รอ qc อื่นขอใช้ด้วยค่อยเอาออก
            $data['userId'] = $userId;
            $data['secId'] = $secId;
            $checkSec = $this->getUserSecByID($secId);
            if($checkSec['status'] == "false"){
                throw new Exception('Section id not found', 1);
            }
            $this->views('qaform/QA-INS/auditMaster', $data);
        } catch (Exception $e) {
            show_error($e->getMessage());
        }
    }

    public function preview($secId, $rev){
        try {
            // $secId = 1; // รอ qc อื่นขอใช้ด้วยค่อยเอาออก
            $checkSec = $this->getUserSecByID($secId);
            $revision = $this->getAuditReportRevision(['ARR_SECID' => $secId, 'ARR_REV' => $rev]);
            // $this->_print_r($revision);
            if($checkSec['status'] == "false"){
                throw new Exception('Section id not found', 1);
            }
            if(empty($revision)){
                throw new Exception('Revision not found', 1);
            }
            $data['secId'] = $secId;
            $data['rev'] = $revision[0]['ARR_REV'];
            $data['revText'] = $revision[0]['ARR_REV'] == 0 ? "\u{002A}" : $revision[0]['ARR_REV_TEXT'];
            // $this->_print_r($data);
            $this->views('qaform/QA-INS/preview', $data);
        } catch (Exception $e) {
            show_error($e->getMessage());
        }
    }

    public function audit($nfmrno, $vorNo, $cyear, $cyear2, $nrunno, $seq, $empno){
        try {
            $data = [
                'NFRMNO' => $nfmrno,
                'VORGNO' => $vorNo,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'seq'    => $seq,
                'empno'  => $empno
            ];
            $this->views('qaform/QA-INS/audit', $data);
        } catch (Exception $e) {
            show_error($e->getMessage());
        }
    }

    public function authorizeReportList($userId){
        $data['userId'] = $userId;
        $this->views('qaform/QA-INS/authorizeReportList', $data);
    }


}