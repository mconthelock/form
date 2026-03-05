<?php
use GuzzleHttp\Client;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\{Border, Fill, Alignment};
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Style\Color;
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
        flow::deleteFlowStep insteadOf _Form;
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
        if($data['empno'] <> "")
        {
            $data['empinf']   = $this->cn->customSelect("AMEC.AEMPLOYEE",array('SEMPNO' =>  $data['empno'] ),'*');
        }
        $data['cncls'] = $this->cn->customSelect("CNCLSCHANGE",array(),'CLSNO , CLSCHANGE');
        $data['cnreason'] = $this->cn->customSelect("CNREASON",array(),'RSNNO , REASON');
      
          
        if(isset($_GET["runNo"]) && $_GET["runNo"] != "")
        {
           // $data['return']   = false;
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
            $data['cextData'] = intval($this->getExtdata($form));
            $data['mode']     = $this->getMode($form);
            $data['form']     = $this->frm->getForm($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO']);
            $data['formno'] = $this->toFormNumber($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO']);
            $data['cnform'] = $this->cn->getcnform($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO'])[0];
            $data['resultdwg'] = $this->cn->customSelect("RESULTCHKDWG",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO']),'DWGNO , REVNO , RESULT , REMARK');
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
                
                $data['jstaff'] = $this->getjstaff($data['empinf'], 'J');
                $data['eng'] = $this->getjstaff($data['empinf'], 'E');
                $data['foreman'] = $this->getForeman($data['empno']);
                $data['opr'] =  $this->getOpr($data['cnform']->MSTATUS, $data['empinf']);
            }
            //var_dump($data['stepready']);
            //exit;
            $this->views('qaform/QA-CN/view', $data);
        }else{
             $this->views('qaform/QA-CN/create', $data);
        }



    }

    public function getjstaff($head, $type)
    {
        if ($head[0]->SDEPCODE == "000401") {
            
            // ถ้า type เป็น 'E' ใช้ '35','40' ถ้าไม่ใช่ ให้ใช้ค่าเดิมของเงื่อนไขนี้
            $posCode = ($type == 'E') ? "'35','40'" : "'41','42','43','40','35'";
            if($type == 'E')
            {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000404' and  SPOSCODE in (".$posCode.")  order by sname";
            
            }else
            {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000404' and ( SPOSCODE in (".$posCode.") or SEMPNO IN ('09019','13067')) order by sname";
            
            }
       
        } else if ($head[0]->SDEPCODE == "000501") {
            
            $posCode = ($type == 'E') ? "'35','40'" : "'40','41','42','43'";
            if ($head[0]->SSECCODE == "00") {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000502' and SPOSCODE in (".$posCode.") order by sname";
            } else {
                $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '".$head[0]->SSECCODE."' and SPOSCODE in (".$posCode.") order by sname";
            }
            
        } else {
            
            $posCode = ($type == 'E') ? "'35','40'" : "'41','42','43'";
            $sql = "select SEMPNO , SNAME from AMEC.AEMPLOYEE where CSTATUS = '1' and SSECCODE = '000303' and SPOSCODE in (".$posCode.") order by sname";
            
        }
        
        $data = $this->cn->getdatasql($sql);
        return $data;
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
        $stepno = $_POST["stepready"];
     
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
                //
                $this->updateresult($form);
                if(isset($_POST["cnt"]) && $act <> "return")
                {
                    $data = array();
                    for($i = 0; $i < $_POST["cnt"]; $i++)
                    {
                        if(isset($_POST["radDwg".$i]))
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
                    if($stepno == "--")
                    {
                       unset($form["CEXTDATA"]);
                       $this->updaterequest($form);
                    }
             
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
                    $this->cn->execAssql($sqlOra);
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
                $sqlOra = "update flow set CSTEPST = '2' , VREMA = '".$_POST['txtRemark']."' where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' and CSTEPST = '3'";
                $this->cn->execsql($sqlOra);
                $sqlOra = "update flow set CSTEPST = '3' , CAPVSTNO = '0' , DAPVDATE ='' , CAPVTIME = ''  where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' and CSTART = '1'";
                $this->cn->execsql($sqlOra);

            }else if($act == "sendApv")
            {
                unset($form["CEXTDATA"]);
                $this->updaterequest($form);
                $this->insertdwg($form);
                $sqlOra = "update form set CST = '1' where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$cyear2."' and NRUNNO = '".$nrunno."' ";
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
            $path = $this->upload_path.$nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno. "/";
            unset($form["CEXTDATA"]);
            if($act != "deleteApv")
            {
                $this->savefile($form,$path);
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
                  if($_POST["radReason"] == "5")
            {
                $data = [
                    'RSNOTHER' =>  $_POST["txtOther"]
                ];
                 $this->cn->update("CNFORM",  $data , $form);
            }
  
  

    }

    private function updateresult($form)
    {
            $radJudge = isset($_POST["radJudge"]) ? $_POST["radJudge"] : '';
            $data = [
                    'JDGMNTNO' => isset($_POST["radJudge"]) ? $_POST["radJudge"] : '',
                    'JDGOTHER' =>  ($radJudge=="2.5" ? $_POST["txtJdgOther1"] : ($radJudge=="4.2" ?  $_POST["txtJdgOther2"] :''))
            ];
            $this->cn->update("CNFORM",  $data , $form);
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

    public function insertcn()
    {
    
        if ($this->chkdup400($_POST["txtInvNo"], $_POST["txtPurItem"])) {

        echo json_encode([
            "status" => false,
            "message" => "CN NO. duplicate, Please check"
        ]);
            return;  
        }

        $status = true;
        $message = "";
        $act = $_POST["act"];
        $form = array(
            'NFRMNO' => $_POST["nfrmno"],
            'VORGNO' => $_POST["vorgno"],
            'CYEAR'  => $_POST["cyear"],
            'REQBY'  => $_POST["txtReqId"],
            'INPUTBY' => $_POST["txtInput"],
            'REMARK'  => $_POST["txtRemark"]
        ); 
        if($act == "save")
        {
            $form["DRAFT"] = '0';
        }
        $datacn = array(
            'TITLE' => $_POST["txtTitle"],
            'ITEMNO' => trim($_POST["txtItemno"]),
            'ORDERNO' => $_POST["orderno"],
            'SVENDNAME' => $_POST["txtSupName"],
            'CLSNO' => $_POST["chkClass"],
            'RSNNO' => $_POST["radReason"],
            'RSNOTHER' => ($_POST["radReason"]=="5"? $_POST["txtOther"]:''),
            'PRDCTNAME' => $_POST["part_date"],
            'BEFCHANGE' => $_POST["txtBefChg"],
            'AFTCHANGE' => $_POST["txtAftChg"],
            'PRTNAME' => $_POST["txtPrtName"],
            'PURITEM' => $_POST["txtPurItem"],
            'INVNO' => $_POST["txtInvNo"],
            'ORDQ' => $_POST["txtOrdQ"],
            'PRTLOC' => ($_POST["radLoc"] == "1"? "WareHouse Receive": $_POST["txtLoc"]) ,
            'RQCNREF' => $_POST["txtNoRef"],
            'TRANSNO' => $_POST["radSample"],
            'DETTRANS' => ($_POST["radSample"] == "1"? "": ($_POST["radSample"] == "2"? $_POST["txtReturn"]: ($_POST["radSample"] == "3"? $_POST["txtOth"]: "" ))) 
        );
        try{

              if(!in_array(substr($_POST["txtItemno"],0,1),['1','2','3','6','7']))
              {
                    $status = false;
                    $message = "Item No. not found.";

              }else
              {
                $rsf = $this->createForm($form);
                if ($rsf['status']) {
                        $datacn["NFRMNO"]  = $form["NFRMNO"];
                        $datacn["VORGNO"]  = $form["VORGNO"];  
                        $datacn["CYEAR"]  =  $form["CYEAR"];
                        $datacn["CYEAR2"]  = $rsf["data"]["CYEAR2"];
                        $datacn["NRUNNO"]  = $rsf["data"]["NRUNNO"];
                        $res = $this->cnflow(array( 'NFRMNO' => $_POST["nfrmno"],'VORGNO' => $_POST["vorgno"],'CYEAR'  => $_POST["cyear"],'CYEAR2'  => $rsf["data"]["CYEAR2"],'NRUNNO'  => $rsf["data"]["NRUNNO"]));

                                if($_POST["submit_date"] != "")
                                {
                                    $datacn["SUBMITDATE"] =  $_POST["submit_date"];
                                }
                                if($_POST["inspec_date"] != "")
                                {
                                    $datacn["INSPECDATE"] =  $_POST["inspec_date"];
                                }
                                if($_POST["expchg_date"] != "")
                                {
                                    $datacn["EXPCHGDATE"] =  $_POST["expchg_date"];
                                }
                             
                                $this->cn->insert("CNFORM",$datacn);
                                $con = array(
                                        'NFRMNO' => $form["NFRMNO"],
                                        'VORGNO' => $form["VORGNO"],
                                        'CYEAR'  => $form["CYEAR"],
                                        'CYEAR2' => $rsf["data"]["CYEAR2"],
                                        'NRUNNO' => $rsf["data"]["NRUNNO"]
                                );
                                $this->insertdwg($con );
                                $path = $this->upload_path .$con["NFRMNO"]."_".$con["VORGNO"]."_".$con["CYEAR"]."_".$con["CYEAR2"]."_".$con["NRUNNO"]. "/";
                                $this->savefile( $con,$path);
                      
                    $status = true;
                    $message = "Success to save data";

                }else{
                    $status = false;
                    $message = "Failed to create flow";
                }

              }
             
        }catch ( Exception $e) {
            $status = false;
            $message = "Failed to save data.".$e->getMessage();
        } finally {
            $res = [
                'status' => $status,
                'message' => $message
            ];
            echo json_encode($res);
        }
    }

    private function chkdup400($invno,$puritem)
    {
        $sqlas = "select * From RTNLIBF.J736KP where REPLACE(J36K01,' ','') = REPLACE('".$invno."',' ','') and REPLACE(J36K03,' ','') = REPLACE('".$puritem."',' ','')";
        $rsas = $this->cn->getdataAssql($sqlas);
        return !empty($rsas);
    }

    private function cnflow($form)
    {
        $radsec = $_POST["radsec"];                       
        /* เจาะจงแผนก*/
        if($radsec == "1")
        {
            $sec = $_POST["Sec"];
            if(($sec == "1") || ($sec == "2")){
                   if($sec == "1")
                    {
                        $rsapv =  $this->cn->customSelect("ORGPOS", array('VORGNO' => '000502' , 'VPOSNO' => '30'),"VEMPNO");
                    }else
                    {
                        $rsapv =  $this->cn->customSelect("ORGPOS", array('VORGNO' => '000503' , 'VPOSNO' => '30'),"VEMPNO");
                    }
                   $dataapv = array(
                        'VAPVNO' => (!empty($rsapv[0]->VEMPNO)? $rsapv[0]->VEMPNO : ""),
                        'VREPNO' => (!empty($rsapv[0]->VEMPNO)? $this->getRep(array('NFRMNO' =>  $form["NFRMNO"] , 'VORGNO' => $form["VORGNO"] , 'CYEAR' => $form["CYEAR"] , 'VEMPNO' => $rsapv[0]->VEMPNO)) : "")
                    );
                    $form["CEXTDATA"] = '01';
                    $this->cn->update("FLOW",  $dataapv , $form);
                    $form["CEXTDATA"] = '04';
                    $this->cn->update("FLOW",  $dataapv , $form);
                    // $stepDel = array([ 'CSTEPNO' => '07', 'CSTEPNEXTNO' => '61'],
                    //                  [ 'CSTEPNO' => '61', 'CSTEPNEXTNO' => '51']
                    // );
                    $condition = [
                        'NFRMNO' => $form['NFRMNO'],
                        'VORGNO' => $form['VORGNO'],
                        'CYEAR'  => $form['CYEAR'],
                        'CYEAR2' => $form['CYEAR2'],
                        'NRUNNO' => $form['NRUNNO'],
                        'CSTEPNO'=> '07'
                    ];
                    $this->deleteFlowStep($condition);
                    $condition['CSTEPNO'] = '61';
                    $this->deleteFlowStep($condition);
            }else if($sec == "3"){
                    $dataapv = array(
                        'VAPVNO' => '16063',
                        'VREPNO' => '16063',
                    );
                    $form["CEXTDATA"] = '01';
                    $this->cn->update("FLOW",  $dataapv , $form);

                    $rsapv =  $this->cn->customSelect("ORGPOS", array('VORGNO' => '000404' , 'VPOSNO' => '30'),"VEMPNO");
                    $dataapv = array(
                        'VAPVNO' => (!empty($rsapv[0]->VEMPNO)? $rsapv[0]->VEMPNO : ""),
                        'VREPNO' => (!empty($rsapv[0]->VEMPNO)? $this->getRep(array('NFRMNO' =>  $form["NFRMNO"] , 'VORGNO' => $form["VORGNO"] , 'CYEAR' => $form["CYEAR"] , 'VEMPNO' => $rsapv[0]->VEMPNO)) : "")
                    );
                    $form["CEXTDATA"] = '04';
                    $this->cn->update("FLOW",  $dataapv , $form);
                    $rsapv =  $this->cn->customSelect("ORGPOS", array('VORGNO' => '000401' , 'VPOSNO' => '20'),"VEMPNO");
                    $dataapv = array(
                        'VAPVNO' => (!empty($rsapv[0]->VEMPNO)? $rsapv[0]->VEMPNO : ""),
                        'VREPNO' => (!empty($rsapv[0]->VEMPNO)? $this->getRep(array('NFRMNO' =>  $form["NFRMNO"] , 'VORGNO' => $form["VORGNO"] , 'CYEAR' => $form["CYEAR"] , 'VEMPNO' => $rsapv[0]->VEMPNO)) : "")
                    );
                    $form["CEXTDATA"] = '05';
                    $this->cn->update("FLOW",  $dataapv , $form);


            }
        }else /* ไม่เจาะจงแผนก*/
        {
            $rsitm =  $this->cn->customSelect("CNITMINCHARGE", array('ITEMNO' => substr($_POST["txtItemno"],0,1)),"INCHARGE");
            if(!empty($rsitm))
            {
                $itm = ['630', '631', '632' , '633' , '636' , '640' , '644' , '645' , '649' , '656' , '362' , '364' , '366' , '367' , '368'];
                $apvno = $rsitm[0]->INCHARGE;
                if(in_array($_POST["txtItemno"],$itm ))
                {
                       $rsapv =  $this->cn->customSelect("ORGPOS", array('VORGNO' => '000502' , 'VPOSNO' => '30'),"VEMPNO");
                       $apvno = $rsapv[0]->VEMPNO;
                }
                 $dataapv = array(
                        'VAPVNO' => $apvno,
                        'VREPNO' =>  $this->getRep(array('NFRMNO' =>  $form["NFRMNO"] , 'VORGNO' => $form["VORGNO"] , 'CYEAR' => $form["CYEAR"] , 'VEMPNO' => $apvno))
                    );
                    $form["CEXTDATA"] = '01';
                    $this->cn->update("FLOW",  $dataapv , $form);
                    $form["CEXTDATA"] = '04';
                    $this->cn->update("FLOW",  $dataapv , $form);
                    $res = array(
                        'status' => true ,
                        'message' => "FLOW OK"
                    );

            }
            if($_POST["radProcAMEC"] == "2")
            {
                if(($_POST["radobj"] == "2")|| ($_POST["radobj"] == "3"))
                {
                     $dataapv = array(
                        'VAPVNO' => '16063',
                        'VREPNO' => '16063',
                    );
                    $form["CEXTDATA"] = '01';
                    $this->cn->update("FLOW",  $dataapv , $form);

                    $rsapv =  $this->cn->customSelect("ORGPOS", array('VORGNO' => '000404' , 'VPOSNO' => '30'),"VEMPNO");
                    $dataapv = array(
                        'VAPVNO' => (!empty($rsapv[0]->VEMPNO)? $rsapv[0]->VEMPNO : ""),
                        'VREPNO' => (!empty($rsapv[0]->VEMPNO)? $this->getRep(array('NFRMNO' =>  $form["NFRMNO"] , 'VORGNO' => $form["VORGNO"] , 'CYEAR' => $form["CYEAR"] , 'VEMPNO' => $rsapv[0]->VEMPNO)) : "")
                    );
                    $form["CEXTDATA"] = '04';
                    $this->cn->update("FLOW",  $dataapv , $form);
                    $rsapv =  $this->cn->customSelect("ORGPOS", array('VORGNO' => '000401' , 'VPOSNO' => '20'),"VEMPNO");
                    $dataapv = array(
                        'VAPVNO' => (!empty($rsapv[0]->VEMPNO)? $rsapv[0]->VEMPNO : ""),
                        'VREPNO' => (!empty($rsapv[0]->VEMPNO)? $this->getRep(array('NFRMNO' =>  $form["NFRMNO"] , 'VORGNO' => $form["VORGNO"] , 'CYEAR' => $form["CYEAR"] , 'VEMPNO' => $rsapv[0]->VEMPNO)) : "")
                    );
                    $form["CEXTDATA"] = '05';
                    $this->cn->update("FLOW",  $dataapv , $form);

                }
                         $res = array(
                        'status' => true ,
                        'message' => "FLOW OK"
                    );
            }

            $rsqic = $this->cn->customSelect("FLOW", array('NFRMNO' =>  $form["NFRMNO"] , 'VORGNO' => $form["VORGNO"] , 'CYEAR' => $form["CYEAR"] , 'CYEAR2' => $form["CYEAR2"] , 'NRUNNO' => $form["NRUNNO"] , 'VAPVNO' => '05030'),"VAPVNO");
            if(empty($rsqic))
            {
                    // $stepDel = array([ 'CSTEPNO' => '07', 'CSTEPNEXTNO' => '61'],
                    //                  [ 'CSTEPNO' => '61', 'CSTEPNEXTNO' => '51']
                    // );
                    $condition = [
                        'NFRMNO' => $form['NFRMNO'],
                        'VORGNO' => $form['VORGNO'],
                        'CYEAR'  => $form['CYEAR'],
                        'CYEAR2' => $form['CYEAR2'],
                        'NRUNNO' => $form['NRUNNO'],
                        'CSTEPNO'=> '07'
                    ];
                    $this->deleteFlowStep($condition);
                    $condition['CSTEPNO'] = '61';
                    $this->deleteFlowStep($condition);
                             $res = array(
                        'status' => true ,
                        'message' => "FLOW OK"
                    );
                    // $this->deleteFlowStep($stepDel,$form["NFRMNO"], $form["VORGNO"], $form["CYEAR"], $form["CYEAR2"], $form["NRUNNO"]);
            }
        } // end ไม่เจาะจงแผนก

      

    }

    private function savefile($form,$path)
    {
            $apvno = $_POST["empno"];
            $upfile =  $this->uploadMultiFile($_FILES, ['DWGFILE','MATFILE','MAKFILE','ROHFILE','PURFILE','SUBFILE','CHKFILE','JUDFILE'], $path);
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
    }

    public function exportexcel()
    {
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear = $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
        $data["cn"] = $this->cn->getcnform($nfrmno,$vorgno,$cyear,$cyear2,$nrunno);
        $data['resultdwg'] = $this->cn->customSelect("RESULTCHKDWG",array( 'NFRMNO' => $nfrmno,'VORGNO' => $vorgno,'CYEAR'  => $cyear,'CYEAR2' => $cyear2,'NRUNNO' => $nrunno),'DWGNO , REVNO , RESULT , REMARK');
        $f = $this->create_save_cnexcel($data);
        $dFile = array(
            'content'  =>  base64_encode($f['content']),
            'filename' =>  $f['filename'],
        );
        echo json_encode($dFile);
    }

    public function exportfrm()
    {
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear = $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
        $form  = [
                    'NFRMNO' => $nfrmno,
                    'VORGNO' => $vorgno,
                    'CYEAR'  => $cyear,
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno
        ];
        $data["cn"] = $this->cn->getcnform($nfrmno,$vorgno,$cyear,$cyear2,$nrunno);
        $data['resultdwg'] = $this->cn->customSelect("RESULTCHKDWG",array( 'NFRMNO' => $nfrmno,'VORGNO' => $vorgno,'CYEAR'  => $cyear,'CYEAR2' => $cyear2,'NRUNNO' => $nrunno),'DWGNO , REVNO , RESULT , REMARK');
        $data['attdwg'] = $this->cn->getfilename($nfrmno, $vorgno, $cyear, $cyear2, $nrunno , '0');
        $data['attmat'] = $this->cn->getfilename($nfrmno, $vorgno, $cyear, $cyear2, $nrunno , '1');
        $data['attmaker'] = $this->cn->getfilename($nfrmno, $vorgno, $cyear, $cyear2, $nrunno , '2');
        $data['attrohs'] = $this->cn->getfilename($nfrmno, $vorgno, $cyear, $cyear2, $nrunno , '3');
        $data['attpur'] = $this->cn->getfilename($nfrmno, $vorgno, $cyear, $cyear2, $nrunno , '4');
        $data['attchk'] = $this->cn->getfilename($nfrmno, $vorgno, $cyear, $cyear2, $nrunno , '6');
        $data['flow'] = $this->getFlowTree($form);
        foreach( $data['flow']  as $row)
        {
            $empno = $row["VAPVNO"];
            $data["empinf"][$empno] = $this->cn->customSelect("AMEC.AMECUSERALL",array('SEMPNO' => $empno),"SPOSNAME , SSEC,SDEPT,SDIV");
        }
        $f = $this->create_save_cnfrmexcel($data);
        $dFile = array(
            'content'  =>  base64_encode($f['content']),
            'filename' =>  $f['filename'],
        );
        echo json_encode($dFile);

    }

    public function create_save_cnfrmexcel($data)
    {
        $spreadsheet = IOFactory::load($this->upload_path.'TEMPLATE/cn.xlsx');
        $sheet = $spreadsheet->getActiveSheet();
        $cnt = count($data["flow"])-1;
        $formno = $this->toFormNumber($data["cn"][0]->NFRMNO , $data["cn"][0]->VORGNO , $data["cn"][0]->CYEAR,  $data["cn"][0]->CYEAR2,  $data["cn"][0]->NRUNNO);
        $sheet->setCellValue('D3',$formno);
        $sheet->setCellValue('D4',$data["cn"][0]->SREQDATE);
        $sheet->setCellValue('D5',(!is_null($data["flow"][$cnt]["DAPVDATE"])? date('d/m/Y', strtotime($data["flow"][$cnt]["DAPVDATE"])):""));
        $sheet->setCellValue('D6',$data["cn"][0]->TITLE);
        $sheet->setCellValue('D7',$data["cn"][0]->ITEMNO);
        $templateStart = 8; // แถวแรกของ template data
        $templateCount = 1;  // Template มี 3 แถว (12–14)
        $templateEnd   = $templateStart + $templateCount - 1;
        $extra = count($data['resultdwg']) - $templateCount;
        if ($extra > 0) {
            $this->insertEmptyRowsWithTemplate($sheet, $templateStart ,$templateCount ,  $extra );
        }
        foreach($data['resultdwg'] as $i => $row)
        {
            $currentRow = $templateStart + $i;
            $sheet->setCellValue("D{$currentRow}", $row->DWGNO.(!is_null($row->REVNO)? " (".$row->REVNO.")":"" ));
            $sheet->setCellValue("E{$currentRow}", ($row->RESULT == "0"? "OK":($row->RESULT == "1"? "NG":"")));
        }
        $templateEnd = $currentRow+1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->PRTNAME);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->PURITEM);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->INVNO);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->ORDQ);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->SVENDNAME);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->CLSCHANGE);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", ($data["cn"][0]->RSNNO == "5"? $data["cn"][0]->REASON." ".$data["cn"][0]->RSNOTHER : $data["cn"][0]->REASON ));
        $templateEnd += 2;
        $sheet->setCellValue("D{$templateEnd}", $data["attdwg"][0]->FILE_LIST);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["attmat"][0]->FILE_LIST);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["attmaker"][0]->FILE_LIST);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["attrohs"][0]->FILE_LIST);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["attpur"][0]->FILE_LIST);
        $templateEnd += 3;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->PRDCTNAME);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->BEFCHANGE);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->AFTCHANGE);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->SSUBMITDATE);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->SINSPECDATE);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->SEXPCHGDATE);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["attchk"][0]->FILE_LIST);
        $templateEnd += 1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->JUDGEMENT." ". $data["cn"][0]->JDGOTHER);
        $templateEnd += 4;
        $templateStart = $templateEnd; // แถวแรกของ template data
        $templateCount = 1;  // Template มี 3 แถว (12–14)
        $templateEnd   = $templateStart + $templateCount - 1;
        $extra = count($data["flow"]) - $templateCount;
        if ($extra > 0) {
            $this->insertEmptyRowsWithTemplate($sheet, $templateStart ,$templateCount ,  $extra );
        }
        
        foreach($data["flow"] as $i => $row)
        {
            $currentRow = $templateStart + $i;
            $sheet->setCellValue("B{$currentRow}", ($row["CSTEPST"] == "5"? "Approved" : ($row["CSTEPST"] == "6"? "Rejected" : ($row["CSTEPST"] == "7"? "Approved by other" : ($row["CSTEPST"] == "3"? "Waiting for approval" : ($row["CSTEPST"] == "2"? "Coming soon" : "" ) ) ) )));
            $sheet->setCellValue("C{$currentRow}", $row["VNAME"]);
            if($row["CSTEPST"] == "5")
            {
                if($row["VAPVNO"] == $row["VREPNO"])
                {
                    $sheet->setCellValue("D{$currentRow}", $row["VREALAPV"] );
                }else{
                    if($row["VREALAPV"] == $row["VAPVNO"])
                    {
                        $sheet->setCellValue("D{$currentRow}", " 👊".$row["VAPVNO"]."/".$row["VREALAPV"] );
                    }else
                    {
                        $sheet->setCellValue("D{$currentRow}", $row["VAPVNO"]."/ 👊".$row["VREALAPV"] );
                    }
                }

            }else
            {
                 $sheet->setCellValue("D{$currentRow}", ($row["VAPVNO"] == $row["VREPNO"]? $row["VAPVNO"]:$row["VAPVNO"]."/".$row["VREPNO"] ));
            }
            $sheet->setCellValue("E{$currentRow}", $row["SNAME"] );
            $sheet->setCellValue("F{$currentRow}", $data["empinf"][$row["VAPVNO"]][0]->SPOSNAME );
            $sheet->setCellValue("G{$currentRow}", $data["empinf"][$row["VAPVNO"]][0]->SSEC."/".$data["empinf"][$row["VAPVNO"]][0]->SDEPT."/".$data["empinf"][$row["VAPVNO"]][0]->SDIV);
            $sheet->setCellValue("H{$currentRow}", (!is_null($row["DAPVDATE"])? date('d-M-Y', strtotime($row["DAPVDATE"])):"") );
            $sheet->setCellValue("I{$currentRow}", $row["CAPVTIME"] );
            $sheet->setCellValue("J{$currentRow}", $row["VREMARK"] ); 
        }
        $templateStart =  $currentRow+ 1;
        $status = "";
        if($data["cn"][0]->CST == "1")
        {
            $status = "Running";
        }else if($data["cn"][0]->CST == "2")
        {
            $status = "Approve";
        }else if($data["cn"][0]->CST == "3")
        {
            $status = "Reject";
        }
        $richText = new RichText();

        $blackText = $richText->createTextRun('Status : ');
        $blackText->getFont()->getColor()->setARGB('FF000000');

        if ($status == 'Approve') {

            $text = $richText->createTextRun('Approve');
            $text->getFont()->getColor()->setARGB('FF008000');

        } elseif ($status == 'Reject') {

            $text = $richText->createTextRun('Reject');
            $text->getFont()->getColor()->setARGB('FFFF0000');
        }

        $sheet->setCellValue("B{$templateStart}",  $richText);
        //$sheet->setCellValue("B{$templateStart}", $status); 
        

        $writer = new Xlsx($spreadsheet);
        $filename = 'CN.xlsx';
        ob_start();
        $writer->save('php://output');
        $excelContent = ob_get_contents(); // ได้ binary data
        ob_end_clean();

        $dFile = array(
            'content'  => $excelContent,
            'filename' => $filename, 
        );
        return $dFile;

    }
    
     public function create_save_cnexcel($data)
    {

        $spreadsheet = IOFactory::load($this->upload_path.'TEMPLATE/cnrpt.xlsx');
        $sheet = $spreadsheet->getActiveSheet();
        $formno = $this->toFormNumber($data["cn"][0]->NFRMNO , $data["cn"][0]->VORGNO , $data["cn"][0]->CYEAR,  $data["cn"][0]->CYEAR2,  $data["cn"][0]->NRUNNO);
        $sheet->setCellValue('C3',$formno);
        $sheet->setCellValue('J3',$data["cn"][0]->REQNAME);
        $sheet->setCellValue('C4',$data["cn"][0]->TITLE);
        $sheet->setCellValue('C5',$data["cn"][0]->ITEMNO);
        $sheet->setCellValue('J5',$data["cn"][0]->PURITEM);

        $templateStart = 7; // แถวแรกของ template data
        $templateCount = 1;  // Template มี 3 แถว (12–14)
        $templateEnd   = $templateStart + $templateCount - 1;
        $extra = count($data['resultdwg']) - $templateCount;
        if ($extra > 0) {
            $this->insertEmptyRowsWithTemplate($sheet, $templateStart ,$templateCount ,  $extra );
        }
        foreach($data['resultdwg'] as $i => $row)
        {
            $currentRow = $templateStart + $i;
            $sheet->setCellValue("C{$currentRow}", $row->DWGNO.(!is_null($row->REVNO)? " (".$row->REVNO.")":""));
            $sheet->setCellValue("H{$currentRow}", ($row->RESULT == "0"? "O":""));
            $sheet->setCellValue("I{$currentRow}", ($row->RESULT == "1"? "O":""));
            $sheet->setCellValue("J{$currentRow}", $row->REMARK);
        }
        $templateEnd = $currentRow+1;
        $sheet->setCellValue("C{$templateEnd}", $data["cn"][0]->PRTNAME);
        $templateEnd = $templateEnd +1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->INVNO);
        $sheet->setCellValue("K{$templateEnd}", $data["cn"][0]->ORDQ);
        $templateEnd = $templateEnd +1;
        $sheet->setCellValue("F{$templateEnd}", $data["cn"][0]->SVENDNAME);
        $templateEnd = $templateEnd +1;
        $sheet->setCellValue("E{$templateEnd}", $data["cn"][0]->CLSCHANGE);
        $templateEnd = $templateEnd +1;
        $sheet->setCellValue("C{$templateEnd}", ($data["cn"][0]->RSNNO == "5"? $data["cn"][0]->REASON." ".$data["cn"][0]->RSNOTHER : $data["cn"][0]->REASON));
        $templateEnd = $templateEnd +1;
        $sheet->setCellValue("F{$templateEnd}", $data["cn"][0]->PRDCTNAME);
        $templateEnd = $templateEnd +1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->BEFCHANGE);
        $templateEnd = $templateEnd +1;
        $sheet->setCellValue("D{$templateEnd}", $data["cn"][0]->AFTCHANGE);

        $writer = new Xlsx($spreadsheet);
        $filename = 'FORMCN.xlsx';
        ob_start();
        $writer->save('php://output');
        $excelContent = ob_get_contents(); // ได้ binary data
        ob_end_clean();

        $dFile = array(
            'content'  => $excelContent,
            'filename' => $filename, 
        );
        return $dFile;
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
                    $data["html"] .= "<div>Status: ". ($r->RESULT == "0" ? "<font color='green'>OK</font>" : ($r->RESULT == "1" ? "<font color='red'>NG</font>" : "")) ."</div>";
                    $i++;
                }
                
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
                    ON f.VAPVNO = e.SEMPNO
                WHERE f.NFRMNO  = '".$data['NFRMNO']."'
                AND f.VORGNO  = '".$data['VORGNO']."'
                AND f.CYEAR   = '".$data['CYEAR']."'
                AND f.CYEAR2  = '".$data['CYEAR2']."'
                AND f.NRUNNO  = '".$data['NRUNNO']."'
                AND e.CSTATUS = '1' AND CSTEPNO in ('--') union 
                SELECT DISTINCT e.SRECMAIL AS EMAIL
                FROM FLOW f
                JOIN AMEC.AEMPLOYEE e 
                    ON f.VREPNO = e.SEMPNO
                WHERE f.NFRMNO  = '".$data['NFRMNO']."'
                AND f.VORGNO  = '".$data['VORGNO']."'
                AND f.CYEAR   = '".$data['CYEAR']."'
                AND f.CYEAR2  = '".$data['CYEAR2']."'
                AND f.NRUNNO  = '".$data['NRUNNO']."'
                AND e.CSTATUS = '1' AND CSTEPNO in ('--') union
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
                
                    
                    $rsf = $this->createForm($form);
                    //var_dump($rsf);
                    if ($rsf['status']) {
                        // $stepDel = array([ 'CSTEPNO' => '04', 'CSTEPNEXTNO' => '19'],
                        //                  [ 'CSTEPNO' => '19', 'CSTEPNEXTNO' => '26'],
                        //                  [ 'CSTEPNO' => '26', 'CSTEPNEXTNO' => '07'],
                        //                  [ 'CSTEPNO' => '10', 'CSTEPNEXTNO' => '13'],
                        //                  [ 'CSTEPNO' => '13', 'CSTEPNEXTNO' => '00']
                        //                   );
                        //  $this->deleteFlowStep($stepDel,$nfrmno, $vorgno, $cyear, $rsf["data"]["CYEAR2"], $rsf["data"]["NRUNNO"]);
                        $condition = [
                            'NFRMNO' => $form['NFRMNO'],
                            'VORGNO' => $form['VORGNO'],
                            'CYEAR'  => $form['CYEAR'],
                            'CYEAR2' => $rsf["data"]["CYEAR2"],
                            'NRUNNO' => $rsf["data"]["NRUNNO"],
                            'CSTEPNO'=> '04'
                        ];
                        $this->deleteFlowStep($condition);
                        $condition['CSTEPNO'] = '19';
                        $this->deleteFlowStep($condition);
                        $condition['CSTEPNO'] = '26';
                        $this->deleteFlowStep($condition);
                        $condition['CSTEPNO'] = '10';
                        $this->deleteFlowStep($condition);
                        $condition['CSTEPNO'] = '13';
                        $this->deleteFlowStep($condition);
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
                                            'VREPNO' => $cnflowpre[0]->VREPNO,
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


 /**
 * Insert empty row(s) based on template row style
 *
 * @param Worksheet $sheet
 * @param int       $templateStart  แถวแรกของ template data
 * @param int       $templateCount  จำนวน template row
 * @param int       $insertCount    จำนวนแถวที่จะเพิ่ม
 */
function insertEmptyRowsWithTemplate(Worksheet $sheet, int $templateStart, int $templateCount, int $insertCount)
{
    $templateEnd = $templateStart + $templateCount - 1;
    $highestCol = Coordinate::columnIndexFromString($sheet->getHighestColumn());

    // insert row
    $sheet->insertNewRowBefore($templateEnd + 1, $insertCount);

    for ($i = 0; $i < $insertCount; $i++) {
        $targetRow = $templateEnd + 1 + $i;

        // copy row height
        $sheet->getRowDimension($targetRow)
              ->setRowHeight($sheet->getRowDimension($templateEnd)->getRowHeight());

        // copy style ของแต่ละ cell
        for ($col = 1; $col <= $highestCol; $col++) {
            $colLetter = Coordinate::stringFromColumnIndex($col);
            $sheet->duplicateStyle(
                $sheet->getStyle($colLetter . $templateEnd),
                $colLetter . $targetRow
            );
        }

        // copy merge cell ของ template row สุดท้าย
        /*foreach ($sheet->getMergeCells() as $merge) {
            if (preg_match_all('/\d+/', $merge, $matches)) {
                $rows = $matches[0];
                if (in_array($templateEnd, $rows)) {
                    $newMerge = str_replace($templateEnd, $targetRow, $merge);
                    $sheet->mergeCells($newMerge);
                }
            }
        }*/
    }
}

public function printcn() 
{
    $nfrmno = $_GET['no'];
    $vorgno = $_GET['orgNo'];
    $cyear =  $_GET['y'];
    $cyear2 = $_GET['y2'];
    $nrunno = $_GET['runNo'];
    $cnData  = $this->cn->getcnform($nfrmno,$vorgno,$cyear,$cyear2,$nrunno);
    $drawings  = $this->cn->customSelect("RESULTCHKDWG",array( 'NFRMNO' => $nfrmno,'VORGNO' => $vorgno,'CYEAR'  => $cyear,'CYEAR2' => $cyear2,'NRUNNO' => $nrunno),'DWGNO , REVNO , RESULT , REMARK');
    $this->views('qaform/QA-CN/printcn', [
        'cnData'   => $cnData,
        'drawings' => $drawings,
        'formno'   => $this->toFormNumber($nfrmno,$vorgno,$cyear,$cyear2,$nrunno)
    ]);
    
}


}