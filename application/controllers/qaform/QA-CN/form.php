<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/api/webform/isTid.php';
require_once APPPATH . 'controllers/_file.php';
class form extends MY_Controller{
    //use _Form, _File;
    //use  formApi, flow, formmst, _File;
        use _Form , _File , formApi, flow, formmst, isTid{
        formApi::getMode insteadOf _Form;
        formApi::getRequestNo  insteadOf _Form;
        flow::getExtData insteadOf _Form;
        flow::doaction insteadOf _Form;
        _Form::getMode as getModeWebservice;
    }
    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'frm');
        $this->load->model('user_model', 'usr');
        $this->load->model('qaform/QA-CN/cn_model', 'cn');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/QA/CN/";
    }

       /**
     * @param array $condition
     * [
     *     NFRMNO   => number,
     *     VORGNO   => string,
     *     CYEAR    => string,
     *    VEMPNO    => string
     * ]
    */
    private function getRep($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/rep/getRep', [
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            // $result = json_decode($response->getBody(), true); 
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e]), 1);
        }
    }

    public function main(){
        if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
            $data = [
                'NFRMNO' => $_GET['no'],
                'VORGNO' => $_GET['orgNo'],
                'CYEAR'  => $_GET['y'],
            ];

        }else{
            $form = $this->frm->getFormMaster('QA-CN');
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
            $form  = [
                    'NFRMNO' => $data['NFRMNO'],
                    'VORGNO' => $data['VORGNO'],
                    'CYEAR'  => $data['CYEAR'],
                    'CYEAR2' => $data['CYEAR2'],
                    'NRUNNO' => $data['NRUNNO'],
                    'EMPNO' =>  $data['empno']
            ];
            $data['empinf']   = $this->cn->customSelect("AMEC.AEMPLOYEE",array('SEMPNO' =>  $data['empno'] ),'*');
            $data['cextData'] = intval($this->getExtdata($form));
            $data['mode']     = $this->getMode($form);
            $data['form']     = $this->frm->getForm($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO']);
            $data['formno'] = $this->toFormNumber($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO']);
            $data['cnform'] = $this->cn->getcnform($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO'])[0];
            $data['resultdwg'] = $this->cn->customSelect("RESULTCHKDWG",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO']),'DWGNO , REVNO , RESULT , REMARK');
            $data['cncls'] = $this->cn->customSelect("CNCLSCHANGE",array(),'CLSNO , CLSCHANGE');
            $data['cnreason'] = $this->cn->customSelect("CNREASON",array(),'RSNNO , REASON');
            $data['cnjudg'] = $this->cn->customSelect("CNJUDGEMENT",array(),'JDGMNTNO , JUDGEMENT');
            
            $data['attdwg'] = $this->cn->customSelect("ATTCNFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '0' ),'ITEMNO , SFILE');
            $data['attmat'] = $this->cn->customSelect("ATTCNFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '1' ),'ITEMNO , SFILE');
            $data['attmaker'] = $this->cn->customSelect("ATTCNFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '2' ),'ITEMNO , SFILE');
            $data['attrohs'] = $this->cn->customSelect("ATTCNFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '3' ),'ITEMNO , SFILE');
            $data['attpur'] = $this->cn->customSelect("ATTCNFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '4' ),'ITEMNO , SFILE');
            $data['attsubcon'] = $this->cn->customSelect("ATTCNFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '8' ),'ITEMNO , SFILE');
            $data['attchk'] = $this->cn->customSelect("ATTCNFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '6' ),'ITEMNO , SFILE');
            $data['attjud'] = $this->cn->customSelect("ATTCNFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '7' ),'ITEMNO , SFILE');
            $data['chkopr'] = $this->chkopr($data['NFRMNO'],$data['VORGNO'],$data['CYEAR'],$data['CYEAR2'], $data['NRUNNO']);
            $data['demapv'] = $this->demapv($data['NFRMNO'],$data['VORGNO'],$data['CYEAR'],$data['CYEAR2'], $data['NRUNNO']);
            $data['jstaff'] = array();
            $data['eng'] = array();
            $data['foreman'] = array();
            $data['opr'] = array();
            $data['stepready'] = $this->frm->getCSETPNO(array(
                'NFRMNO' => $data['NFRMNO'],
                'VORGNO' => $data['VORGNO'],
                'CYEAR'  => $data['CYEAR'],
                'CYEAR2' => $data['CYEAR2'],
                'NRUNNO' => $data['NRUNNO'],
                'CSTEPST'=> '3'
            ));  
            if(!empty($data['empinf']))
            {
                
                $data['jstaff'] = $this->getjstaff($data['empinf']);
                $data['eng'] = $this->getjstaff($data['empinf']);
                $data['foreman'] = $this->getForeman($data['empno']);
                $data['opr'] =  $this->getOpr($data['cnform']->MSTATUS, $data['empinf']);
            }
            //var_dump($data['stepready']);
            //exit;
            $this->views('qaform/QA-CN/view', $data);
        }



    }

    public function getjstaff($head)
    {
        if(($head[0]->SDEPCODE=="000401") && ($head[0]->SSECCODE=="00"))
        {
            $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000404' and ( SPOSCODE in ('41','42','43','40','35') or SEMPNO IN ('09019','13067')) order by sname";
        }else if(($head[0]->SDEPCODE=="000501"))
        {
            if(($head[0]->SSECCODE=="00"))
            {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000502' and SPOSCODE in ('40','41','42','43') order by sname";
            }else
            {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '".$head[0]->SSECCODE."' and SPOSCODE in ('40','41','42','43') order by sname";
            }
        }else
        {
            $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000303' and SPOSCODE in ('41','42','43') order by sname";
  
        }
        $data = $this->cn->getdatasql($sql);
       return   $data;
        // echo json_encode($data);
    }
    
    public function geteng($head)
    {
        if(($head[0]->SDEPCODE=="000401") && ($head[0]->SSECCODE=="00"))
        {
            $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000404' and SPOSCODE in ('35','40') order by sname";
        }else if(($head[0]->SDEPCODE=="000501"))
        {
            if(($head[0]->SSECCODE=="00"))
            {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000502' and SPOSCODE in ('35','40')  order by sname";
            }else
            {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '".$head[0]->SSECCODE."' and SPOSCODE in ('35','40') order by sname";
            }
        }else
        {
            $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000303' and SPOSCODE in ('35','40')  order by sname";
        }
        $data = $this->cn->getdatasql($sql);
        //echo json_encode($data);
        return   $data;
    }

    public function getForeman($emp)
    {
        $sql = "select DISTINCT SEMPNO , SNAME from AMEC.AEMPLOYEE , CNSHOPPIC where CSTATUS = '1' and SEMPNO = FM and SEMPNO <> '".$emp."' order by SNAME";
        $data = $this->cn->getdatasql($sql);
       // echo json_encode($data);
       return   $data;
    }

    public function getOpr($mstauts,$head)
    {
        if(!is_null($mstauts))
        {
            if($head[0]->SSECCODE == "000404")
            {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE A , SEQUENCEORG S where A.SEMPNO = S.EMPNO and S.HEADNO ='".$head[0]->SEMPNO."' and A.CSTATUS = '1' and A.SPOSCODE in ('64','65') order by SNAME ";      
            }else
            {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where  CSTATUS = '1' and SPOSCODE in ('64','65') and SSECCODE = '".$head[0]->SSECCODE."' order by SNAME";    
            }
        }else{
            $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000404' and SPOSCODE in ('64','65') order by SNAME";
        }
        //echo $sql;
        $data = $this->cn->getdatasql($sql);
       // echo json_encode($data);
       return   $data;
    }
    
    public function action()
    {
        
        $act = $_POST["action"];
        $cextData = intval($_POST["cextData"]);
        $apvno =  $_POST["empno"];
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear =  $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
     
        $form  = ['NFRMNO' => $nfrmno,
                  'VORGNO' => $vorgno,
                  'CYEAR'  => $cyear,
                  'CYEAR2' => $cyear2,
                  'NRUNNO' => $nrunno
         ];
         $status = true;
         $message = "";
        try{
             
            if (isset($_POST['selJInchrg'])  && $_POST['selJInchrg'] != '') {
                $rep = $this->getRep(array('NFRMNO' =>  $nfrmno , 'VORGNO' => $vorgno , 'CYEAR' => $cyear , 'VEMPNO' => $_POST['selJInchrg']));
                $dataapv = [
                        'VAPVNO' => $_POST['selJInchrg'],
                        'VREPNO' => $rep
                ];
                $form["CEXTDATA"] = '02';
                $this->cn->update("FLOW",  $dataapv , $form);
            }
 
            if (isset($_POST['selEInchrg'])  && $_POST['selEInchrg'] != '') {
                $rep = $this->getRep(array('NFRMNO' =>  $nfrmno , 'VORGNO' => $vorgno , 'CYEAR' => $cyear , 'VEMPNO' => $_POST['selEInchrg']));
                $dataapv = [
                        'VAPVNO' => $_POST['selEInchrg'],
                        'VREPNO' => $rep
                ];
                $form["CEXTDATA"] = '03';
                $this->cn->update("FLOW",  $dataapv , $form);
            }
          
            if (isset($_POST['Operator'])  && $_POST['Operator'] != ''){
                  
                $rep = $this->getRep(array('NFRMNO' =>  $nfrmno , 'VORGNO' => $vorgno , 'CYEAR' => $cyear , 'VEMPNO' => $_POST['Operator']));
                $dataapv = [
                        'VAPVNO' => $_POST['Operator'],
                        'VREPNO' => $rep
                ];
                $form["CEXTDATA"] = '07';
                $this->cn->update("FLOW",  $dataapv , $form);
            }
  
            if(($cextData >= 2) && ($cextData < 8))
            {
                unset($form["CEXTDATA"]);
                $this->updaterequest($form);
                if(isset($_POST["cnt"]) && $act <> "return")
                {
                    $data = array();
                    for($i = 0; $i < $_POST["cnt"]; $i++)
                    {
                        if(isset($_POST["txtDwgRem".$i]))
                        {
                            $data = array(
                                'RESULT' => $_POST["radDwg".$i]
                            );
                        }
                        if(isset($_POST["txtDwgRem".$i]))
                        {
                            $data['REMARK'] = $_POST["txtDwgRem".$i];
                        }
                        if(!empty($data))
                        {
                            $this->cn->update("RESULTCHKDWG",  $data , $form);
                        }
                    }
                }
            }
 
            if($act == "approve")
            {
                    
                
                    if($cextData == 8)
                    {
                        if($_POST["chkClass"] == "2")
                        {
                            if (isset($_POST['txtInvNo']) && strlen($_POST['txtInvNo']) >= 8) {
                                $pono = substr($_POST['txtInvNo'], 0, 8);
                                if (is_numeric($pono)) 
                                {
                                        $pord  = substr($pono, 0, 2) . substr($pono, 4, 4);
                                        $pprod = $_POST['txtPurItem'];
                                        $sqlOra = "update BPCSFVNEW.HPO SET PCMT = '".$this->toFormNumber($nfrmno,  $vorgno, $cyear,  $cyear2,  $nrunno)." WHERE PORD = ".$pord." AND PPROD = '".$pprod."'";
                                        $this->cn->execAssql($sqlOra);
                                }

                            }
                        }
                    }else if($cextData == 7 )
                    {
                        $sqlOra = "update RTNLIBF.J736KP set J36K05 = 'Y' where J36K04 = '".$this->toFormNumber($nfrmno,  $vorgno, $cyear,  $cyear2,  $nrunno)."'";
                        $this->cn->execAssql($sqlOra);
                    }
                    
            }else if($act == "reject")
            {
                if($cextData == 7)
                {
                    $sqlOra = "update RTNLIBF.J736KP set J36K05 = 'Y' where J36K04 = '".$this->toFormNumber($nfrmno,  $vorgno, $cyear,  $cyear2,  $nrunno)."'";
                   // $this->cn->execAssql($sqlOra);
                }
                if($cextData >1 && $cextData != 5)
                {
                    $sqlOra = "update flow set CSTEPST = '6' , CAPVSTNO = '2' where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' and (VAPVNO = '".$apvno."' or VREPNO = '".$apvno."')";
                    $this->cn->execsql($sqlOra);
                }
                if($cextData == 4)
                {
                    $sqlOra = "select * from flow where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' and CEXTDATA = '05' and (VAPVNO = '".$apvno."' or VREPNO = '".$apvno."') ";
                    $rs = $this->cn->getdatasql($sqlOra);
                    if(count($rs))
                    {
                        $sqlOra = "update flow set CSTEPST = '6' , CAPVSTNO = '2' where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' and (VAPVNO = '".$apvno."' or VREPNO = '".$apvno."') and CEXTDATA = '05'";
                        $this->cn->execsql($sqlOra);
                        $sqlOra = "update form set CST = '3' where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' ";
                        $this->cn->execsql($sqlOra);
                    }
                }
            }else if($act == "return")
            {
                $sqlOra = "update flow set CSTEPST = '1' where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' and CSTEPST = '2'";
                $this->cn->execsql($sqlOra);
                $sqlOra = "update flow set CSTEPST = '2' where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' and CSTEPST = '3'";
                $this->cn->execsql($sqlOra);
                $sqlOra = "update flow set CSTEPST = '3' , CAPVSTNO = '0' , DAPVDATE ='' , CAPVTIME = ''  where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' and CSTART = '1'";
                $this->cn->execsql($sqlOra);

            }else if($act == "sendApv")
            {
                unset($form["CEXTDATA"]);
                $this->updaterequest($form);
                $this->insertdwg($form);
                $sqlOra = "update form set CST = '3' where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' ";
                $this->cn->execsql($sqlOra);

            }else if($act == "saveData")
            {
                unset($form["CEXTDATA"]);
                $this->updaterequest($form);
                $this->insertdwg($form);
            }else if($act == "deleteApv")
            {
                $this->cn->delete("RESULTCHKDWG", $form);
                $this->cn->delete("ATTCNFRM", $form);
                $this->cn->delete("CNFORM", $form);
                $this->cn->delete("FLOW", $form);
                $this->cn->delete("FORM", $form);
                $path = $this->upload_path . $nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno. "/";
                foreach (glob($path . '*') as $file) {
                    if (is_file($file)) {
                        unlink($file);
                    }
                }
            }else if($act == "change")
            {
                $rep = $this->getRep(array('NFRMNO' =>  $nfrmno , 'VORGNO' => $vorgno , 'CYEAR' => $cyear , 'VEMPNO' => $_POST['Foreman']));
                $dataapv = [
                        'VAPVNO' => $_POST['Foreman'],
                        'VREPNO' => $rep
                ];
                $form["CEXTDATA"] = '06';
                $this->cn->update("FLOW",  $dataapv , $form);
                $form["CEXTDATA"] = '03';
                $this->cn->update("FLOW",  $dataapv , $form);
                
            }

            $path = $this->upload_path . $nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno. "/";
            // if (!is_dir($path))
            // {
            //     mkdir($path, 0777, true);
            // }
            $upfile =  $this->uploadMultiFile($_FILES, ['DWGFILE','MATFILE','MAKFILE','ROHFILE','PURFILE','SUBFILE','CHKFILE','JUDFILE'], $path);
            // $upfile = $this->saveFile($_FILES, $path);
            unset($form["CEXTDATA"]);
            $fid = $this->cn->generate_id("ATTCNFRM", "ITEMNO", $form);
            $datadwgfile = array();
                $typeMap = [
                    'DWGFILE' => '0',
                    'MATFILE' => '1',
                    'MAKFILE' => '2',
                    'ROHFILE' => '3',
                    'PURFILE' => '4',
                    'CHKFILE' => '6',
                    'JUDFILE' => '7',
                    'SUBFILE' => '8',
                ];
            foreach ($upfile["files"] as $fileType => $fileArray) {
                foreach ($fileArray as $file) {
                        $datadwgfile[] = [
                            'NFRMNO' => $form['NFRMNO'],
                            'VORGNO' => $form['VORGNO'],
                            'CYEAR'  => $form['CYEAR'],
                            'CYEAR2' => $form['CYEAR2'],
                            'NRUNNO' => $form['NRUNNO'],
                            'ITEMNO' => $fid,
                            'TYPENO' => $typeMap[$fileType] ?? null, // หรือ '' ถ้าต้องการ
                            'SFILE'  => $file['file_name'],
                            'SEMPNO' => $apvno
                        ];
                    $fid++;
                }
            }
            if(!empty($datadwgfile)){
                $this->cn->insert_batch("ATTCNFRM", $datadwgfile);
            }
            $status = true;
            $message = "Action successfully.";
         }catch ( Exception $e) {
            $status = false;
            $message = "Failed to save data.";
        } finally {
            $res = [
                'status' => $status,
                'message' => $message
            ];
            echo json_encode($res);
        }


    }

    private function updaterequest($form)
    {
             $data = array(
                'JDGMNTNO' => isset($_POST["radJudge"]) ? $_POST["radJudge"] : '',
                'CLSNO'    => $_POST["chkClass"],
                'RSNNO'    => $_POST["radReason"],
                'TITLE'    => $_POST["txtTitle"],
                'PRTNAME'   => $_POST["txtPrtName"],
                'PURITEM'   => $_POST["txtPurItem"],
                'INVNO' => $_POST["txtInvNo"],
                'ITEMNO' => $_POST["txtItemno"],
                'ORDQ' => $_POST["txtOrdQ"],
                'SVENDNAME' => $_POST["txtSupName"],
                'PRTLOC' => $_POST["txtprtLoc"],
                'BEFCHANGE' => $_POST["txtBefChg"],
                'AFTCHANGE' => $_POST["txtAftChg"],
                'RQCNREF' => $_POST["txtNoRef"],
                'TRANSNO' => $_POST["radSample"],
                'DETTRANS' => ($_POST["radSample"]==2? $_POST["txtReturn"] : ($_POST["radSample"]==3? $_POST["txtOth"] : "")),
                'PRDCTNAME' => $_POST["part_date"],
                'ORDERNO' => $_POST["txtOrder"]
                
            );
            if(isset($_POST["submit_date"]) && $_POST["submit_date"] != "")
            {
                $data['SUBMITDATE'] = $_POST["submit_date"];
            }
            if(isset($_POST["inspec_date"]) && $_POST["inspec_date"] != "")
            {
                    $data['INSPECDATE'] = $_POST["inspec_date"];
            }
             if(isset($_POST["expchg_date"]) && $_POST["expchg_date"] != "")
            {
                    $data['EXPCHGDATE'] = $_POST["expchg_date"];
            }

            unset($form["CEXTDATA"]);
            $this->cn->update("CNFORM",  $data , $form);
            $radJudge = isset($_POST["radJudge"]) ? $_POST["radJudge"] : '';
            if( $radJudge == "2.5" || $radJudge == "4.2" )
            {
               $data = [
                    'JDGOTHER' =>  ($radJudge=="2.5" ? $_POST["txtJdgOther1"] : $_POST["txtJdgOther2"])
                ];
                 $this->cn->update("CNFORM",  $data , $form);

            }
            if($_POST["radReason"] == "5")
            {
                $data = [
                    'RSNOTHER' =>  $_POST["txtOther"]
                ];
                 $this->cn->update("CNFORM",  $data , $form);
            }
  

    }

    private function insertdwg($form)
    {
        $this->cn->delete("RESULTCHKDWG", $form);
        $dwg = $_POST["txtDwgNo"];
        $g = $_POST["txtG"];
        $l = $_POST["txtL"];
        $r = $_POST["revNo"];
        $i = 0;
        
        foreach($dwg as $d)
        { 
            if($d <> "")
            {
                $data = array(
                    'NFRMNO' => $form["NFRMNO"],
                    'VORGNO' => $form["VORGNO"],
                    'CYEAR'  => $form["CYEAR"],
                    'CYEAR2' => $form["CYEAR2"],
                    'NRUNNO' => $form["NRUNNO"],
                    "DWGNO" => $d.(trim($g[$i]) != "" ? " ".trim($g[$i]) : "").(trim($l[$i]) != "" ? " ".trim($l[$i]) : "" ),
                    "REVNO" => $r[$i],
                );
                //var_dump($data);
                $this->cn->insert("RESULTCHKDWG", $data);
            }
            $i++;
        }
    }



    private function updateconcern()
    {

        $con = [
            'NFRMNO' => $_POST["nfrmno"],
            'VORGNO' => $_POST["vorgno"],
            'CYEAR'  => $_POST["cyear"],
            'CYEAR2' => $_POST["cyear2"],
            'NRUNNO' => $_POST["nrunno"]
        ];
        $dataqoi = [
            'TITLE'     => $_POST["title"],
            'ITEMNO'    => $_POST["itemno"],
            'PRTNAME'   => $_POST["prtname"],
            'PURITEM'   => $_POST["puritem"],
            'SVENDNAME' => $_POST["svendname"],
            'INSPECDATE' => $_POST["request_date"],
            'EXPCHGDATE' => $_POST["expect_date"],
            'JDGMNTNO'   => isset($_POST["judgement"]) ? $_POST["judgement"] : ""
        ];
        $this->qoi->update("QOIFORM", $dataqoi , $con);
        $dwg = $_POST["dwgno"];
        $result = $_POST["result"];
        $dwgrem = $_POST["dwgrem"];
        $arrdwg = array();
        $i = 0;
        foreach($dwg as $d)
        {
            if($d <> "")
            {
                $arrdwg[] = array(
                    'NFRMNO' => $con["NFRMNO"],
                    'VORGNO' => $con["VORGNO"],
                    'CYEAR'  => $con["CYEAR"],
                    'CYEAR2' => $con["CYEAR2"],
                    'NRUNNO' => $con["NRUNNO"],
                    "DWGNO" => $d,
                    "RESULT" => $result[$i],
                    "REMARK" => $dwgrem[$i]
                );
            }

            $i++;
        }
        $path = $this->upload_path.$con["NFRMNO"]."_".$con["VORGNO"]."_".$con["CYEAR"]."_".$con["CYEAR2"]."_".$con["NRUNNO"];
        if (!is_dir($path))
        {
            mkdir($path, 0777, true);
        }
        $upfile =  $this->uploadMultiFile($_FILES, ['DWGFILE','SPECFILE','SHEETFILE','NGFILE'], $path);
        $fid = $this->qoi->generate_attfile_id($con["NFRMNO"],$con["VORGNO"],$con["CYEAR"],$con["CYEAR2"],$con["NRUNNO"]);
        $datadwgfile = array();
        foreach ($upfile["files"] as $fileType => $fileArray) {
         foreach ($fileArray as $file) {
             $datadwgfile[] = array
             (
                'NFRMNO' => $con["NFRMNO"],
                'VORGNO' => $con["VORGNO"],
                'CYEAR'  => $con["CYEAR"],
                'CYEAR2' => $con["CYEAR2"],
                'NRUNNO' => $con["NRUNNO"],
                'ITEMNO' => $fid,
                'TYPENO' => ($fileType == "DWGFILE"? "0":($fileType == "SPECFILE"? "1":($fileType == "SHEETFILE"? "2":($fileType == "NGFILE"? "3":"")))),
                'SFILE'  => $file['file_name'],
                'SEMPNO' => $_POST["empno"]
             );
             $fid++;
         }

         }
         if(count($arrdwg) > 0)
         {
             $this->qoi->delete("RESULTQOIDWG", $con);
             $this->qoi->insert_batch("RESULTQOIDWG",$arrdwg);
         }
         if(count($datadwgfile) > 0)
         {
             $this->qoi->insert_batch("ATTQOIFRM",$datadwgfile);
         }
         return true;
    }

    private function updateQOR()
    {
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear = $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
        $m_action = $_POST["m_action"];
        $m_due_date = $_POST["m_due_date"];
        $m_in_charge = $_POST["m_in_charge"];
        $c_action = $_POST["c_action"];
        $c_due_date = $_POST["c_due_date"];
        $c_in_charge = $_POST["c_in_charge"];
        $dataqor = array();
        $i=0;
        $qid = 1;
        foreach($m_action as $m)
        {
            if(($m <> "")&&($m_due_date[$i] <> "")&&($m_in_charge[$i] <> ""))
            {
                $dataqor[] = array(
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'TYPENO' => 'M',
                    'QID'    => $qid,
                    'QACTION' => $m,
                    'QDUEDATE' => $m_due_date[$i],
                    'QINCHARGE' => $m_in_charge[$i]
                );
                $qid++;
            }
        }
        $i=0;
        foreach($c_action as $c)
        {
            if(($c <> "")&&($c_due_date[$i] <> "")&&($c_in_charge[$i] <> ""))
            {
                $dataqor[] = array(
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'TYPENO' => 'C',
                    'QID'    => $qid,
                    'QACTION' => $c,
                    'QDUEDATE' => $c_due_date[$i],
                    'QINCHARGE' => $c_in_charge[$i]
                );
                $qid++;
            }
        }
        if(count($dataqor) > 0)
        {
            $this->qoi->delete("QOI_QOR", array('CYEAR2' => $cyear2,'NRUNNO' => $nrunno));
            $this->qoi->insert_batch("QOI_QOR",$dataqor);
        }
        $path = $this->upload_path.$nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno;
        if (!is_dir($path))
        {
            mkdir($path, 0777, true);
        }
        $upfile =  $this->uploadMultiFile($_FILES, ['MEASUREFILE','CORRECTFILE'], $path);
        $fid = $this->qoi->generate_attfile_id($nfrmno,$vorgno,$cyear,$cyear2,$nrunno);
        $dataqorfile = array();
        foreach ($upfile["files"] as $fileType => $fileArray) {
         foreach ($fileArray as $file) {
             $dataqorfile[] = array
             (
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'ITEMNO' => $fid,
                'TYPENO' => ($fileType == "MEASUREFILE"? "4":($fileType == "CORRECTFILE"? "5":"")),
                'SFILE'  => $file['file_name'],
                'SEMPNO' => $_POST["empno"]
             );
             $fid++;
         }
         }
         if(count($dataqorfile) > 0)
         {
             $this->qoi->insert_batch("ATTQOIFRM",$dataqorfile);
         }
        return true;
    }

    private function updateQE()
    {
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear = $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
        $qe_option = $_POST["qe_option"];
        $con = array(
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        );
        $dataqe = array(
            'QECHECK' => $qe_option,
            'RQCN'    => ($qe_option == "1" ? ($_POST["rq_no"] ?? "") : ($qe_option == "2" ? ($_POST["cn_no"] ?? "") : ""))
        );
        $this->qoi->update("QOIFORM", $dataqe , $con);
        $path = $this->upload_path.$nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno;
        if (!is_dir($path))
        {
            mkdir($path, 0777, true);
        }
        $upfile =  $this->uploadMultiFile($_FILES, ['QEFILE'], $path);
        $fid = $this->qoi->generate_attfile_id($nfrmno,$vorgno,$cyear,$cyear2,$nrunno);
        $dataqefile = array();
        foreach ($upfile["files"] as $fileType => $fileArray) {
         foreach ($fileArray as $file) {
             $dataqefile[] = array
             (
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'ITEMNO' => $fid,
                'TYPENO' => '6',
                'SFILE'  => $file['file_name'],
                'SEMPNO' => $_POST["empno"]
             );
             $fid++;
         }
         }
        if(count($dataqefile) > 0)
        {
            $this->qoi->insert_batch("ATTQOIFRM",$dataqefile);
        }
       return true;
    }

    public function delfile()
    {
        $path = $this->upload_path.$_POST["nfrmno"]."_".$_POST["vorgno"]."_".$_POST["cyear"]."_".$_POST["cyear2"]."_".$_POST["nrunno"]."/";
        $itemno = $_POST['itemno'];
        $sfile = $_POST['sfile'];
        $this->deleteFile($sfile,$path);
        $this->cn->trans_start();
        $delfn = $this->cn->delete("ATTCNFRM ","CYEAR2 ='".$_POST["cyear2"]."' AND NRUNNO = '".$_POST["nrunno"]."' AND ITEMNO = '".$itemno."' AND SFILE = '".$sfile."'");
        $this->cn->trans_complete();
        $res = [
            'status' => $delfn,
            'message' => ""
        ];
        echo json_encode($res);
    }

    public function mdownload($fd,$file,$ofile)
    {
        $path = $this->upload_path.$fd;
        $this->downloadFile($ofile,$file,$path);

    }

    private function chkopr($nfrmno,$vorgno,$cyear,$cyear2,$nrunno)
    {
        $rs = $this->cn->customSelect("FLOW",array( 'NFRMNO' => $nfrmno,'VORGNO' => $vorgno,'CYEAR'  => $cyear,'CYEAR2' => $cyear2,'NRUNNO' => $nrunno ,'CEXTDATA' => '07' ),'');
        return count($rs) > 0;
    }

    private function demapv($nfrmno,$vorgno,$cyear,$cyear2,$nrunno)
    {
        $rs = $this->cn->customSelect("FLOW",array( 'NFRMNO' => $nfrmno,'VORGNO' => $vorgno,'CYEAR'  => $cyear,'CYEAR2' => $cyear2,'NRUNNO' => $nrunno ,'CEXTDATA' => '04' , "CSTEPST IN ('1','2','3')" => null ),'');
        return count($rs) > 0;
    }



public function buildmail()
{
    $nfrmno  = $_POST["NFRMNO"]  ?? null;
    $vorgno  = $_POST["VORGNO"]  ?? null;
    $cyear   = $_POST["CYEAR"]   ?? null;
    $cyear2  = $_POST["CYEAR2"]  ?? null;
    $nrunno  = $_POST["NRUNNO"]  ?? null;
    $mtype   = $_POST["MTYPE"]   ?? null;
    $fstatus = $_POST["FSTATUS"] ?? null;
    $formno = $this->toFormNumber($nfrmno,  $vorgno, $cyear,  $cyear2,  $nrunno);
    $data = array();
        // ---- To ----
          $rsEmail = $this->getApvEmail([
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno,
            'TYPE'  => ($mtype === "FOREMAN") ? "FOREMAN" : ($mtype === "PIC") ? "PIC" : ($mtype === "REQUESTER") ? "REQUESTER" : "ALL"
        ]);
        $emails = array_column($rsEmail, 'EMAIL');
        $data["to"] = implode(',', $emails);
        $rs = $this->cn->getcnresult($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $first = $rs[0] ?? null;
    if ($mtype === "ALL") {
        // ---- SUBJECT ----
        $data["subject"] =
            ($fstatus == "2") ? "E-Form {$formno} was approved" :
            (($fstatus == "3") ? "E-Form {$formno} was rejected" : "");
        // ---- HTML BODY ----
                // ---- CONTENT ----
        if ($first) {
            $data["html"] = <<<HTML
<div>Changing notice no.: {$formno}</div>
<div>Supplier or Sub-contractor Name: {$first->SVENDNAME}</div>
<div>Part Name: {$first->PRTNAME}</div>
HTML;

            foreach ($rs as $r) {
                $data["html"] .= "<div>Drawing No.: {$r->DWGNO}</div>";
            }

            $data["html"] .= "<div>Status: {$first->JUDGEMENT}</div>";
        } else {
            $data["html"] = "<div>No data found</div>";
        }

     //  var_dump($rsEmail);
      // exit;
    }else if ($mtype === "FOREMAN") {
         $data["subject"] = "E-Form ".$formno;
         $data["html"] = "<div>Changing notice no.: ".$formno."</div>";
         if ($first) {
                $data["html"] .= "<div>First no.: ".$first->FIRSTNO."</div>";
                $data["html"] .= "<div>Part Name: ".$first->PRTNAME."</div>";
                $i = 1;
                foreach ($rs as $r) {
                    if($i == 1)
                    {
                        $data["html"] .= "<div>Drawing No.: ".$r->DWGNO."</div>";
                    }else{ 
                        $data["html"] .= "<div>&nbsp;&nbsp;&nbsp;&nbsp;".$r->DWGNO."</div>";
                    }
                    $i++;
                }
         }
         
    }else if ($mtype === "PIC") {
         $data["subject"] = "Result of ".$formno;
         $data["html"] = "<div>Changing notice no.: ".$formno."</div>";
         if ($first) {
                $data["html"] .= "<div>First no.: ".$first->FIRSTNO."</div>";
                $data["html"] .= "<div>Part Name: ".$first->PRTNAME."</div>";
                $i = 1;
                foreach ($rs as $r) {
                    if($i == 1)
                    {
                        $data["html"] .= "<div>Drawing No.: ".$r->DWGNO."</div>";
                    }else{ 
                        $data["html"] .= "<div>&nbsp;&nbsp;&nbsp;&nbsp;".$r->DWGNO."</div>";
                    }
                    $i++;
                }
                $data["html"] .= "<div>Status: ". ($fstatus == "2" ? "Approved" : ($fstatus == "3" ? "Rejected" : "Unknown")) ."</div>";
         }
         
    }else if( $mtype === "REQUESTER"){
            $data["subject"] = "E-Form ".$formno." has been returned";
            $data["html"] = "<div>Changing notice no.: ".$formno."</div>";
            if ($first) {
                    $data["html"] .= "<div>First no.: ".$first->FIRSTNO."</div>";
                    $data["html"] .= "<div>Part Name: ".$first->PRTNAME."</div>";
                    $i = 1;
                    foreach ($rs as $r) {
                        if($i == 1)
                        {
                            $data["html"] .= "<div>Drawing No.: ".$r->DWGNO."</div>";
                        }else{ 
                            $data["html"] .= "<div>&nbsp;&nbsp;&nbsp;&nbsp;".$r->DWGNO."</div>";
                        }
                        $i++;
                    }
            }
    }

    echo json_encode($data);
}

private function getApvEmail($data)
    {
        if($data['TYPE'] == "PIC")
        {
                 $sql = " SELECT DISTINCT e.SRECMAIL AS EMAIL
                FROM FLOW f
                JOIN AMEC.AEMPLOYEE e 
                    ON f.VREALAPV = e.SEMPNO
                WHERE f.NFRMNO  = '".$data['NFRMNO']."'
                AND f.VORGNO  = '".$data['VORGNO']."'
                AND f.CYEAR   = '".$data['CYEAR']."'
                AND f.CYEAR2  = '".$data['CYEAR2']."'
                AND f.NRUNNO  = '".$data['NRUNNO']."'
                AND e.CSTATUS = '1' AND CSTEPNO in ('--','06') union 
                SELECT DISTINCT e.SRECMAIL AS EMAIL FROM CNSHOPPIC c JOIN AMEC.AEMPLOYEE e ON c.ENG = e.SEMPNO
                WHERE c.FM in (select VAPVNO from FLOW where NFRMNO = '".$data['NFRMNO']."' AND VORGNO = '".$data['VORGNO']."' AND CYEAR = '".$data['CYEAR']."' AND CYEAR2 = '".$data['CYEAR2']."' AND NRUNNO = '".$data['NRUNNO']."' and CEXTDATA ='06') ";

        }else if($data['TYPE'] == "REQUESTER")
        { $sql = " SELECT DISTINCT e.SRECMAIL AS EMAIL
                FROM FLOW f
                JOIN AMEC.AEMPLOYEE e 
                    ON f.VREALAPV = e.SEMPNO
                WHERE f.NFRMNO  = '".$data['NFRMNO']."'
                AND f.VORGNO  = '".$data['VORGNO']."'
                AND f.CYEAR   = '".$data['CYEAR']."'
                AND f.CYEAR2  = '".$data['CYEAR2']."'
                AND f.NRUNNO  = '".$data['NRUNNO']."'
                AND e.CSTATUS = '1' AND CSTEPNO in ('--')";
        }else{
            $sql = " SELECT DISTINCT e.SRECMAIL AS EMAIL
                FROM FLOW f
                JOIN AMEC.AEMPLOYEE e 
                    ON f.VREALAPV = e.SEMPNO
                WHERE f.NFRMNO  = '".$data['NFRMNO']."'
                AND f.VORGNO  = '".$data['VORGNO']."'
                AND f.CYEAR   = '".$data['CYEAR']."'
                AND f.CYEAR2  = '".$data['CYEAR2']."'
                AND f.NRUNNO  = '".$data['NRUNNO']."'
                AND e.CSTATUS = '1'";
            if ($data['TYPE'] == "FOREMAN") {
                $sql .= " AND f.CEXTDATA = '06' ";
            }else if ($data['TYPE'] === "ALL") {
                $sql .= " AND f.CSTEPNO NOT IN ('05','04','11') ";
            }
    }    
        return $this->cn->getdatasql($sql);
    }

public function createcnng()
{
    try {
        $status = false;
        $message = "";
        $nfrmno  = $_POST["NFRMNO"]  ?? null;
        $vorgno  = $_POST["VORGNO"]  ?? null;
        $cyear   = $_POST["CYEAR"]   ?? null;
        $cyear2  = $_POST["CYEAR2"]  ?? null;
        $nrunno  = $_POST["NRUNNO"]  ?? null;
        $form = array(
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear
        );         
        $firstno = $this->cn->getfirstno($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        if (count($firstno) > 0) {
            $sqlas = "SELECT
            'F'||VARCHAR_FORMAT(CURRENT DATE, 'YY')||
            RIGHT(
                DIGITS(
                COALESCE(
                    INTEGER(
                    RIGHT(
                        (SELECT MAX(R27M09)
                        FROM DATALIBO.R027MP1 WHERE R27M09 LIKE 'F'||VARCHAR_FORMAT(CURRENT DATE, 'YY')||'%'
                        
                        ),
                        4
                    )
                    ),
                    0
                ) + 1
                ),
                4
            ) AS R27M09
            FROM DATALIBO.R027MP1
            WHERE R27M09 = '".trim($firstno[0]->FIRSTNO)."'";
            $newcnng = $this->cn->getdataAssql($sqlas);

            if(count($newcnng) > 0) {
          $sqlas = "INSERT INTO DATALIBO.R027MP1(R27M01 , R27M02 , R27M03 , R27M04 , R27M05 , R27M06 , R27M07 , R27M08 , R27M09 , R27M10 , R27M11 , R27M12 , R27M13 , R27M14)
SELECT
  L.R27M01,
  L.R27M02,
  L.R27M03,
  L.R27M04,
  L.R27M05,
  L.R27M06,
  L.R27M07,
  L.R27M08,

   '".$newcnng[0]->R27M09."' AS R27M09,

  L.R27M10,
  L.R27M11,
  L.R27M12,
  VARCHAR_FORMAT(CURRENT DATE, 'YYYYMMDD') AS R27M13,
  L.R27M14

FROM DATALIBO.R027MP1 L
WHERE L.R27M09 = '".trim($firstno[0]->FIRSTNO)."'";
                //echo $sqlas;

                $res = $this->cn->execAssql($sqlas);
                //var_dump($res);
                if (!$res) {
                    //throw new Exception("Failed to update first no.");
                       $status = false;
                        $message = "Failed to update first no.";
                }else
                {
                   // $newcnng="F260239";
                    $cnform    = $this->frm->getForm($nfrmno,  $vorgno, $cyear,  $cyear2,  $nrunno);
                    $form["REQBY"] = $cnform[0]->VREQNO;
                    $form["INPUTBY"] = $cnform[0]->VINPUTER; 
                    $form["REMARK"] = "";
                    $form["DRAFT"] = 1;
                    $rsf = $this->createForm($form);
                    //var_dump($rsf);
                    if ($rsf['status']) {
                        $stepDel = array([ 'CSTEPNO' => '04', 'CSTEPNEXTNO' => '19'],
                                         [ 'CSTEPNO' => '19', 'CSTEPNEXTNO' => '26'],
                                         [ 'CSTEPNO' => '26', 'CSTEPNEXTNO' => '07'],
                                         [ 'CSTEPNO' => '10', 'CSTEPNEXTNO' => '13'],
                                         [ 'CSTEPNO' => '13', 'CSTEPNEXTNO' => '00']
                                          );
                         $this->deleteFlowStep($stepDel,$nfrmno, $vorgno, $cyear, $rsf["data"]["CYEAR2"], $rsf["data"]["NRUNNO"]);
                         $cnformpre = $this->cn->customSelect("CNFORM",array( 'NFRMNO' => $nfrmno,'VORGNO' => $vorgno,'CYEAR'  => $cyear,'CYEAR2' => $cyear2,'NRUNNO' => $nrunno ),'*');
                            if(count($cnformpre) > 0)
                            {
                                $datacn = array(
                                    'NFRMNO' => $nfrmno,
                                    'VORGNO' => $vorgno,
                                    'CYEAR'  => $cyear,
                                    'CYEAR2' => $rsf["data"]["CYEAR2"],
                                    'NRUNNO' => $rsf["data"]["NRUNNO"],
                                    'TITLE'  => $cnformpre[0]->TITLE,
                                    'SVENDNAME' =>  $cnformpre[0]->SVENDNAME,
                                    'CLSNO'  =>   $cnformpre[0]->CLSNO,
                                    'RSNNO'  => $cnformpre[0]->RSNNO,
                                    'RSNOTHER' => '1 st No.,'.$newcnng[0]->R27M09,
                                    'TRANSNO' =>  $cnformpre[0]->TRANSNO,
                                    'DETTRANS' =>  $cnformpre[0]->DETTRANS,
                                    'PRTNAME' => $cnformpre[0]->PRTNAME,
                                    'PURITEM' => $cnformpre[0]->PURITEM,
                                    'INVNO' =>  $cnformpre[0]->INVNO,
                                    'ITEMNO' => $cnformpre[0]->ITEMNO,
                                    'ORDERNO' => $cnformpre[0]->ORDERNO,
                                    'ORDQ' => $cnformpre[0]->ORDQ,
                                    'PRTLOC' => $cnformpre[0]->PRTLOC,
                                    'PRDCTNAME' =>  $cnformpre[0]->PRDCTNAME,
                                    'AFTCHANGE' => $cnformpre[0]->AFTCHANGE,
                                    'MSTATUS' => '1'
                                );
                                $this->cn->insert("CNFORM", $datacn);
                                $sqlOra = "INSERT INTO RESULTCHKDWG (NFRMNO,VORGNO,CYEAR,CYEAR2,NRUNNO,DWGNO,REVNO)
                                        SELECT
                                            '".$nfrmno."' AS NFRMNO,
                                            '".$vorgno."' AS VORGNO,
                                            '".$cyear."' AS CYEAR,
                                            '".$rsf["data"]["CYEAR2"]."' AS CYEAR2,
                                            '".$rsf["data"]["NRUNNO"]."' AS NRUNNO,
                                            DWGNO,
                                            REVNO
                                        FROM RESULTCHKDWG
                                        WHERE NFRMNO = '".$nfrmno."'
                                        AND VORGNO = '".$vorgno."'
                                        AND CYEAR  = '".$cyear."'
                                        AND CYEAR2 = '".$cyear2."'
                                        AND NRUNNO = '".$nrunno."'";
                                $this->cn->execsql($sqlOra); 
                                $cnflowpre = $this->cn->customSelect("FLOW",array( 'NFRMNO' => $nfrmno,'VORGNO' => $vorgno,'CYEAR'  => $cyear,'CYEAR2' => $cyear2,'NRUNNO' => $nrunno ,'CEXTDATA' => '06'),'*');
                                if(count($cnflowpre) > 0)
                                {
                                        $key = array(
                                            'NFRMNO' => $nfrmno,
                                            'VORGNO' => $vorgno,
                                            'CYEAR'  => $cyear,
                                            'CYEAR2' => $rsf["data"]["CYEAR2"],
                                            'NRUNNO' => $rsf["data"]["NRUNNO"],
                                            'CEXTDATA' => '06'
                                        );
                                        $dataapv = array(
                                            'VAPVNO' => $cnflowpre[0]->VAPVNO,
                                            'VREPNO' => $cnflowpre[0]->VREPNO,
                                        );
                                         $this->cn->update("FLOW",  $dataapv , $key);
                                         $key["CEXTDATA"] = '03';
                                         $this->cn->update("FLOW",  $dataapv , $key);

                                }
                                $cnflowpre = $this->cn->customSelect("FLOW",array( 'NFRMNO' => $nfrmno,'VORGNO' => $vorgno,'CYEAR'  => $cyear,'CYEAR2' => $cyear2,'NRUNNO' => $nrunno ,'CSTEPNO' => '--'),'*');
                                if(count($cnflowpre) > 0)
                                {
                                        $key = array(
                                            'NFRMNO' => $nfrmno,
                                            'VORGNO' => $vorgno,
                                            'CYEAR'  => $cyear,
                                            'CYEAR2' => $rsf["data"]["CYEAR2"],
                                            'NRUNNO' => $rsf["data"]["NRUNNO"],
                                            'CSTEPNO' => '--'
                                        );
                                        $dataapv = array(
                                            'VREPNO' => $this->getRep(array('NFRMNO' =>  $nfrmno , 'VORGNO' => $vorgno , 'CYEAR' => $cyear , 'VEMPNO' => $cnflowpre[0]->VAPVNO )),
                                        );
                                         $this->cn->update("FLOW",  $dataapv , $key);

                                }
                                $status = true;
                                $message = "New CN/NG form created successfully.";
                            } else {
                                $status = false;
                                $message = "Failed to retrieve CN/NG form data.";
                            }


                    } else {
                        $status = false;
                        $message = "Failed to create new CN/NG form.";
                    }
    
                }
            } else {
                $status = false;
                $message = "Failed to generate new CN/NG number.";
            }
            
        } else {
            $status = false;
            $message = "Failed to retrieve first no.";
        }

            
     }catch ( Exception $e) {
        $status = false;
        $message = "Failed to save data.";
        //var_dump($e->getMessage());
        
    } finally {
        $res = [
            'status' => $status,
            'message' => $message
        ];
        echo json_encode($res);
    }
}




}