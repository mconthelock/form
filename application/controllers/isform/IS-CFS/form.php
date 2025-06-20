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
        $this->upload_path = "//amecnas/AMECWEB/File/" .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/IS/ISCFS/";
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

    public function createForm(){
        try {
            $frmMst = $this->frm->getFormMaster('IS-CFS');
            $post = $this->input->post();
            $status = false;
            $delete = [];
            $create = [];
            $flow = [];
            $updateFlowStep = [];
            $deleteFlowStep = [];
            // echo json_encode($post);
            $this->conf->trans_start();
            foreach($post['reqNo'] as $key => $reqNo){
                $form = $this->create($frmMst[0]->NNO, $frmMst[0]->VORGNO, $frmMst[0]->CYEAR, $post['requester'], $post['requester'],'', 1);
                $create[$key] = $form;
                if($form['status']){
                    $NFRMNO = $form['message']['formtype'];
                    $VORGNO = $form['message']['owner'];
                    $CYEAR  = $form['message']['cyear'];
                    $CYEAR2 = $form['message']['cyear2'];
                    $NRUNNO = $form['message']['runno'];
                    $data = [
                        'NFRMNO' => $NFRMNO,
                        'VORGNO' => $VORGNO,
                        'CYEAR'  => $CYEAR,
                        'CYEAR2' => $CYEAR2,
                        'NRUNNO' => $NRUNNO,
                        'CFS_REQUESTER' => $post['requester'],
                        'CFS_REQNO'     => $reqNo,
                        'CFS_TID_REQNO' => $this->toFormNumber($post['formtype'], $post['owner'], $post['cyear'], $post['cyear2'], $post['runno'])
                    ];
                    $flowStep = $this->setflowStep($data);
                    $flow[] = $flowStep; 
                    $updateFlowStep[] = $this->updateFlowApv($data, $flowStep['flowStep']);
                    $deleteFlowStep[] = $this->deleteFlowStep($flowStep['stepDelete'], $data['NFRMNO'], $data['VORGNO'], $data['CYEAR'], $data['CYEAR2'], $data['NRUNNO']);
                    $insert   = $this->conf->insert('ISCFS_FORM', $data);
                    // $insert = false;
                    if(!$insert){
                        $delete[] = $data;
                        // $this->deleteForm($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO);
                        throw new Exception("Can not insert this form", 0);
                    }else{
                        $status = true;
                    }
                }
            }
            $this->conf->trans_complete();
            $status = $this->conf->trans_status() === FALSE  ? false : true;
        } catch (Exception $e) {
            if(!empty($delete)){
                foreach($delete as $d){
                    $cond = [
                        'NFRMNO' => $d['NFRMNO'],
                        'VORGNO' => $d['VORGNO'],
                        'CYEAR'  => $d['CYEAR'],
                        'CYEAR2' => $d['CYEAR2'],
                        'NRUNNO' => $d['NRUNNO'],
                    ];
                    $this->delete($cond);
                    // $this->conf->delete('ISCFS_FORM', $cond);
                }
            }
            $status = false;
        } finally {
            $result = [
                'status'  => $status,
                'message' => $status ? 'Create form success' : 'Create form failed',
                'form'    => [
                    'create'  => $create,
                    'delete'  => $delete,
                ],
                'flow'    => [
                    'flowStep' => $flow,
                    'flowStepDelete' => $deleteFlowStep,
                    'flowStepUpdate' => $updateFlowStep,
                ]
            ];
            echo json_encode($result);
        }
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

    // public function testSetflow(){
    //     $form = [
    //         // 'CFS_REQNO' => 'IS-TID25-000008',
    //         // 'CFS_REQNO' => 'IS-DEV21-000007',
    //         'CFS_REQNO' => 'IS-DEV22-000008',
    //         'CFS_REQUESTER' => '13249',
    //     ];
    //     $this->setflow($form);
    // }


    // private function setflow($form){
    //     $reqNo = $form['CFS_REQNO'];
    //     $apv = [
    //         [ 'CSTEPNO' => '10', 'CSTEPNEXTNO' => '11'], // SEM
    //         [ 'CSTEPNO' => '11', 'CSTEPNEXTNO' => '18'], // DEM
    //         [ 'CSTEPNO' => '18', 'CSTEPNEXTNO' => '06'], // REQUESTER IS-DEV
    //         [ 'CSTEPNO' => '06', 'CSTEPNEXTNO' => '05'], // SEM
    //         [ 'CSTEPNO' => '05', 'CSTEPNEXTNO' => '04'], // DDEM
    //         [ 'CSTEPNO' => '04', 'CSTEPNEXTNO' => '09'], // DEM
    //         // [ 'CSTEPNO' => '09', 'CSTEPNEXTNO' => '--'], // OWNER
    //     ];
    //     $empno = '';
    //     $k = 3;
    //     for ($i=0; $i < 2; $i++) { 
    //         $req = '';
    //         if($i == 0){
    //             // $k = 2;
    //             $req = $form['CFS_REQUESTER'];
    //         }else{
    //             // $k = 3;
    //             $form = $this->crackRequestNo($form['CFS_REQNO']);
    //             if(!empty($form)){
    //                 foreach($form as $key => $f){
    //                     $formDetail = $this->frm->getRequestNo($f);
    //                     if(!empty($formDetail)){
    //                         $req = $formDetail[0]->VREQNO;
    //                         $apv[2]['apv'] = $req;
    //                     }
    //                 }
    //             }
    //         }
    //         if(!empty($req)){
    //             for ($j=0; $j < $k; $j++) {
    //                 $manager = $j == 0 ? $this->getManager($req) : $this->getManager($empno);
    //                 if(!empty($manager['empno'])){
    //                     $empno    = $manager['empno'];
    //                     $position = $manager['position'];

    //                     echo $i. ': '.$empno . ' - ' . $position . '<br>';
    //                     switch($position){
    //                         case 'SEM':
    //                             if($i == 0){
    //                                 $apv[0]['apv'] = $empno;
    //                             }else{
    //                                 $apv[3]['apv'] = $empno;
    //                             }
    //                             break;
    //                         case 'DDEM':
    //                             if($i == 1){
    //                                 $apv[4]['apv'] = $empno;
    //                             }
    //                             break;
    //                         case 'DEM':
    //                             if($i == 0){
    //                                 $apv[1]['apv'] = $empno;
    //                             }else{
    //                                 $apv[5]['apv'] = $empno;
    //                             }
    //                             break;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     echo '<pre>';
    //     print_r($apv);
    //     echo '</pre>';
    // }
    
    /**
     * Set flow step for the form IS-CFS
     * @param array $form Form data 
     */
    private function setflowStep($form){
        $reqNo = $form['CFS_REQNO'];
        $flowStep = [
            [ 'CSTEPNO' => '10', 'CSTEPNEXTNO' => '11'], // SEM
            [ 'CSTEPNO' => '11', 'CSTEPNEXTNO' => '18'], // DEM
            [ 'CSTEPNO' => '18', 'CSTEPNEXTNO' => '06'], // REQUESTER IS-DEV
            [ 'CSTEPNO' => '06', 'CSTEPNEXTNO' => '05'], // SEM
            [ 'CSTEPNO' => '05', 'CSTEPNEXTNO' => '04'], // DDEM
            [ 'CSTEPNO' => '04', 'CSTEPNEXTNO' => '09'], // DEM
            // [ 'CSTEPNO' => '09', 'CSTEPNEXTNO' => '00'], // OWNER
        ];

        $flowStep = $this->setTIDStep($form['CFS_REQUESTER'], $flowStep);
        $flowStep = $this->setDevStep($form['CFS_REQNO'], $flowStep);
        $res = $this->cleanStep($flowStep);
        // echo '<pre>';
        // print_r($res);
        // echo '</pre>';  
        return $res;
    }

    /**
     * Set flow step for TID
     * @param string $requester Employee number of the requester e.g. '24008'
     * @param array $flowStep Flow step data e.g. [ ['CSTEPNO' => '10', 'CSTEPNEXTNO' => '11'], ... ]
     * @return array 
     */
    private function setTIDStep($requester, $flowStep){
        $empno = '';
        for ($j = 0; $j < 3; $j++) {
            $manager = $this->getManager($j === 0 ? $requester : $empno);
            if (!empty($manager['empno'])) {
                $empno = $manager['empno'];
                $flowStep = $this->assignToApv($flowStep, $manager['position'], $empno, 0);
            }
        }
        return $flowStep;
    }

    /**
     * Set flow step for DEV
     * @param string $reqNo Request number e.g. 'IS-DEV21-000007'
     * @param array $flowStep Flow step data e.g. [ ['CSTEPNO' => '10', 'CSTEPNEXTNO' => '11'], ... ]
     * @return array
     */
    private function setDEVStep($reqNo, $flowStep){
        $crackedForms = $this->crackRequestNo($reqNo);
        foreach ($crackedForms as $f) {
            $form = $this->frm->getRequestNo($f);
            if (!empty($form)) {
                $requester = $form[0]->VREQNO ?? null;
                if ($requester) {
                    $flowStep[2]['apv'] = $requester;
                    $empno = '';
                    for ($j = 0; $j < 3; $j++) {
                        $manager = $this->getManager($j === 0 ? $requester : $empno);
                        if (!empty($manager['empno'])) {
                            $empno = $manager['empno'];
                            $flowStep = $this->assignToApv($flowStep, $manager['position'], $empno, 1);
                        }
                    }
                }
            }
        }
        return $flowStep;
    }

    /**
     * Assign employee number to the flow step based on position and round
     * @param array $flowStep Flow step data e.g. [ ['CSTEPNO' => '10', 'CSTEPNEXTNO' => '11'], ... ]
     * @param string $position Position of the employee e.g. 'SEM', 'DDEM', 'DEM'
     * @param string $empno Employee number e.g. '24008'
     * @param int $round Round number e.g. 0 for first round, 1 for second round
     * @return array 
     */
    private function assignToApv($flowStep, $position, $empno, $round){
        $map = [
            'SEM'  => [0, 3],
            'DDEM' => [null, 4],
            'DEM'  => [1, 5],
        ];
        $index = $map[$position][$round] ?? null;
        if ($index !== null) {
            $flowStep[$index]['apv'] = $empno;
        }
        return $flowStep;
    }

    /**
     * Clean flow step by removing empty approval steps
     * @param array $flowStep Flow step data e.g. [ ['CSTEPNO' => '10', 'CSTEPNEXTNO' => '11'], ... ]
     * @return array 
     */
    private function cleanStep($flowStep){
        $stepDelete = [];
        foreach ($flowStep as $key => $step){
            if(empty($step['apv'])){
                $stepDelete[] = $step;
                unset($flowStep[$key]);
            }
        }
        return ['flowStep' => $flowStep, 'stepDelete' => $stepDelete];
    }


    /**
     * Get manager of the employee
     * @param string $empno Employee number e.g. '24008'
     * @return array Manager details including employee number and position
     */
    private function getManager($empno){
        $manager = $this->usr->getHeadno($empno);
        $empno = '';
        $position = '';
        if (!empty($manager) && isset($manager[0])) {
            $manager = $manager[0];
            switch($manager->SPOSCODE1){
                case '30':
                    $position = 'SEM';
                    $empno = $manager->HEADNO;
                    break;
                case '21':
                    $position = 'DDEM';
                    $empno = $manager->HEADNO;
                    break;
                case '20':
                    $position = 'DEM';
                    $empno = $manager->HEADNO;
                    break;
                case '11':
                    $position = 'DDIM';
                    $empno = $manager->HEADNO;
                    break;
                case '10':
                    $position = 'DIM';
                    $empno = $manager->HEADNO;
                    break;
                case '05':
                    $position = 'GM';
                    $empno = $manager->HEADNO;
                    break;
                case '02':
                    $position = 'PRESIDENT';
                    $empno = $manager->HEADNO;
                    break;
            }
        }
        $res = ['empno' => $empno, 'position' => $position];
        return $res;
    }
}