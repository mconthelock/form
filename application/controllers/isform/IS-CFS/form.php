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
        $this->load->model('isform/IS-CFS/confirm_model', 'conf');
        $this->load->model('form_model', 'frm');
        $this->load->model('user_model', 'usr');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/IS/ISCFS/";
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
        $data['program']     = $this->getProgram();
        $data['programType'] = $this->conf->getProgramType();
        $data['division']    = $this->conf->getDivision();
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
            $formData         = $this->getData($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"]);
            $data['NRUNNO']   = $_GET["runNo"];
            $data['CYEAR2']   = $_GET["y2"];
            $data['cextData'] = $this->getExtdata($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"] , $data['empno']);
            $data['mode']     = $this->getMode($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], $data['empno']);
            $data['data']     = $formData;
            $data['cstep']    = $cstep;
            $data['firstStep'] = $cstep == '--' ? TRUE : FALSE;
            $data['fileBefore'] = $this->setImage($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], 1);
            $data['fileResult'] = $this->setImage($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], 2);
            // var_dump($data);
            // exit();
            if(!$data['firstStep']){
                $this->views('isform/IS-CFS/view', $data);
                exit();
            }
        }
        // echo json_encode($data['data']);
        $this->views('isform/IS-CFS/form', $data);
    }

    public function getProgram(){
        $data = $this->conf->getProgram();
        if($this->isAjaxRequest()){
            echo json_encode($data);
        }else{
            return $data;
        }
    }
    public function getData($NFRMNO = '', $VORGNO = '', $CYEAR = '', $CYEAR2 = '', $NRUNNO = ''){
        if($this->isAjaxRequest()){
            $post = $this->input->post();
            $data = $this->conf->getData($post['NFRMNO'], $post['VORGNO'], $post['CYEAR'], $post['CYEAR2'], $post['NRUNNO']);
            $data = $this->setLink($data);
            // if(!empty($data)){
            //     $data = $data[0];
            //     if(!empty($data->CFS_REQNO)){
            //         $form = $this->crackRequestNo($data->CFS_REQNO)[0];
            //         $data->link = $this->createLink($form['NFRMNO'], $form['VORGNO'], $form['CYEAR'], $form['CYEAR2'], $form['NRUNNO']);
            //     }else{
            //         $data->link = null;
            //     }
            // }
            echo json_encode($data);
        }else{
            $data = $this->conf->getData($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO);
            $data = $this->setLink($data);
            // if(!empty($data)){
                // $data = $data[0];
                // if(!empty($data->CFS_REQNO)){
                //     $form = $this->crackRequestNo($data->CFS_REQNO)[0];
                //     $data->link = $this->createLink($form['NFRMNO'], $form['VORGNO'], $form['CYEAR'], $form['CYEAR2'], $form['NRUNNO']);
                // }else{
                //     $data->link = null;
                // }
            // }
            return $data;
        }
    }
    
    private function setLink($data){
        if(!empty($data)){
            $data = $data[0];
            if(!empty($data->CFS_REQNO)){
                $form = $this->crackRequestNo($data->CFS_REQNO)[0];
                $data->link = $this->createLink($form['NFRMNO'], $form['VORGNO'], $form['CYEAR'], $form['CYEAR2'], $form['NRUNNO']);
            }else{
                $data->link = null;
            }
        }
        return $data;
    }

    private function setImage($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, $type){
        $images = $this->conf->getFile($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO, $type);
        if(!empty($images)){
            foreach ($images as $key => $image) {
                $image->base64 = $this->conVBase64($image->FILE_PATH.$image->FILE_FNAME);
            }

        }
        return $images;
    }

    public function getModule(){
        echo json_encode($this->conf->getModule());
    }

    public function savePrograms(){
        $this->conf->trans_start();
        if($_POST['action'] == '1'){
            $program = array(
                'DIVCODE' => $_POST['division'],
                'PROTID'  => $_POST['type'],
                'PROMNAME' => $_POST['programname'],
                'PIC'      => $_POST['pic'],
                'PROMSTATUS' => 'A',
                'RELEASERS1' => $_POST['releaser']
            );
            $proid = $this->conf->insertPrograms($program);
            $moduleid = $this->saveProgramsModule($proid->ID);
            $sysCode = $_POST['division']."-".str_pad($proid->ID, 3, "0", STR_PAD_LEFT).$_POST['type'];
        }else{
            $moduleid = $this->saveProgramsModule($_POST['programid']);
            $sysCode = $_POST['division']."-".str_pad($_POST['programid'], 3, "0", STR_PAD_LEFT).$_POST['type'];
        }
        $this->conf->trans_complete();
        $status = $this->conf->trans_status() === FALSE  ? false : true;
        $result = [
            'sysCode' => $sysCode, 
            'status'  => $status, 
            'message' => $status ? 'Add new program success' : 'Add new program failed',
            'program' => $this->conf->getProgram(),
        ];
        echo json_encode($result);
    }

    /**
     * Save program module
     * @param int $id Program ID e.g. 33
     */
    private function saveProgramsModule($id){
        $module = array(
            'DIVCODE' => $_POST['division'],
            'PROTID'  => $_POST['type'],
            'PROMID'  => $id,
            'FUNCREV' => 0,
            'DOCTID'  => 0,
            'FUNCNAME'=> $_POST['module'],
            'FUNCSTATUS' => 'A',
            'PIC1'  => $_POST['pic']
        );
        return $this->conf->insertProgramsModule($module);
    }
    
    public function update(){
        try{
            $post = $this->input->post();
            // exit(var_dump($_FILES));
            $status = false;
            $ownerCode = $this->conf->getOwner($post['code']);
            $message = 'Update success';
            if(empty($ownerCode)){
                throw new Exception("OwnerCode not found", 0);  
            }
            $owner = $this->usr->getDim($ownerCode[0]->SDIVCODE);
            if(empty($owner)){
                throw new Exception("Owner not found", 0);  
            }
            // exit(var_dump($owner));
            $form = [
                'NFRMNO' => $post['NFRMNO'],
                'VORGNO' => $post['VORGNO'],
                'CYEAR'  => $post['CYEAR'],
                'CYEAR2' => $post['CYEAR2'],
                'NRUNNO' => $post['NRUNNO'],
            ];

            $flowStep = [
                [ 'CSTEPNO' => '09', 'CSTEPNEXTNO' => '00', 'apv' => $owner[0]->EMPNO], // OWNER
            ];
            // exit(var_dump($this->updateFlowApv($form, $flowStep)));
            if(!$this->updateFlowApv($form, $flowStep)){
                throw new Exception("Can not update flow step", 0);
            }
            if(!$this->addImage($_FILES, $post)){
                throw new Exception("Upload file failed", 0);
            }
            
            $data = [
                'CFS_SYSCODE' => $post['sysCode'],
                'CFS_DIVCODE' => $post['code'],
                'CFS_PROTID'  => $post['type'],
                'CFS_PROMID'  => $post['id'],
                'CFS_SYSNAME' => $post['sysName'],
                'CFS_WORKCONTENT' => $post['workCon'],
            ];
            if(!$this->conf->update('ISCFS_FORM', $data, $form)){
                throw new Exception("Can not update data", 0);
            }
            $status = true;
        }catch (Exception $e) {
            $status = false;
            $message = $e->getMessage();
        }finally{
            echo json_encode([
                'status'  => $status, 
                'message' => $message
            ]);    
        }
    }

    private function addImage($files, $data){
        $formNo = $this->toFormNumber($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'], $data['CYEAR2'], $data['NRUNNO']);
        $path   = $this->upload_path . $formNo . '/';
        $data['filePath'] = $path;
        $upload = $this->uploadMultiFile($files, ['fileBefore', 'fileResult'], $path);
        // var_dump($data);
        // exit(var_dump($upload));
        $status = false;
        $files  = [];
        if($upload['status']){
            $files = $upload['files'];
            foreach($files as $key => $file){
                foreach($file as $f){
                    $data['type'] = $key == 'fileBefore' ? 1 : ( $key == 'fileResult' ? 2 : null);
                    if(!$this->insertFile($f, $data)){
                        $this->deleteMultiFile($files, $path);
                        return false;
                    }else{
                        $status = true;
                    }
                }
            }
        }
        return $status;
    }

    

    public function delete($form = ''){
        if($form == ''){
            $form = $this->input->post('form');
            $status = $this->conf->delete('ISCFS_FORM', $form);
            echo json_encode(['status' => $status, 'message' => $status ? 'Delete form success' : 'Delete form failed']);
        }else{
            $status = $this->conf->delete('ISCFS_FORM', $form);
            return ['status' => $status, 'message' => $status ? 'Delete form success' : 'Delete form failed'];
        }
    }
}