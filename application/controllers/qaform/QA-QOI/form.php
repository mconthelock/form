<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH . 'controllers/_file.php';
class form extends MY_Controller{
    use _Form, _File;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'frm');
        $this->load->model('user_model', 'usr');
        $this->load->model('qaform/QA-QOI/qoi_model', 'qoi');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = "//amecnas/AMECWEB/File/" .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/QA/QOI/";
    }

    public function main(){
        if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
            $data = [
                'NFRMNO' => $_GET['no'],
                'VORGNO' => $_GET['orgNo'],
                'CYEAR'  => $_GET['y'],
            ];
          
        }else{
            $form = $this->frm->getFormMaster('QA-QOI');
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
            $data['cextData'] = $this->getExtdata($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO'], $data['empno']);
            $data['mode']     = $this->getMode($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO'], $data['empno']);
            $data['form']     = $this->frm->getForm($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO']);
            $data['formno'] = $this->toFormNumber($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO']);
            $data['qoiform'] = $this->qoi->getqoiform($data['NFRMNO'],  $data['VORGNO'], $data['CYEAR'],  $data['CYEAR2'],  $data['NRUNNO'])[0];
            $data['resultdwg'] = $this->qoi->customSelect("RESULTQOIDWG",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO']),'DWGNO , RESULT , REMARK');
            $data['attdwg'] = $this->qoi->customSelect("ATTQOIFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '0' ),'ITEMNO , SFILE');
            $data['attspec'] = $this->qoi->customSelect("ATTQOIFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '1' ),'ITEMNO , SFILE');
            $data['attchks'] = $this->qoi->customSelect("ATTQOIFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '2' ),'ITEMNO , SFILE');
            $data['attnot'] = $this->qoi->customSelect("ATTQOIFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '3' ),'ITEMNO , SFILE');
            $data['attmea'] = $this->qoi->customSelect("ATTQOIFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '4' ),'ITEMNO , SFILE');
            $data['attcor'] = $this->qoi->customSelect("ATTQOIFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '5' ),'ITEMNO , SFILE');
            $data['attqe'] = $this->qoi->customSelect("ATTQOIFRM",array( 'NFRMNO' => $data['NFRMNO'],'VORGNO' => $data['VORGNO'],'CYEAR'  => $data['CYEAR'],'CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => '6' ),'ITEMNO , SFILE');
            $data['measure'] =  $this->qoi->customSelect("QOI_QOR",array('CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => 'M' ),'QACTION , QDUEDATE , QINCHARGE','','QID');
            $data['correct'] =  $this->qoi->customSelect("QOI_QOR",array('CYEAR2' => $data['CYEAR2'],'NRUNNO' => $data['NRUNNO'] ,'TYPENO' => 'C' ),'QACTION , QDUEDATE , QINCHARGE','','QID');
            if($data['mode'] == 2)
            {
                if($data['cextData'] == 1)
                {
                    $data['jstaff'] = $this->qoi->get_Jstaff();
                    $data['enginc'] = $this->qoi->get_Engineer();
                    
                }
                if($data['cextData'] == 4)
                {
                    $data['seminc'] = $this->qoi->get_SEMING();
                    
                }
            }
            //echo $data['cextData'];
            $this->views('qaform/QA-QOI/view', $data);
        }
       


    }

    public function get_list($type)
    {
        if($type == "J")
        {
            $data = $this->qoi->get_Jstaff();
        }else if($type == "E")
        {
            $data = $this->qoi->get_Engineer();
        }else if($type == "S")
        {
            $data = $this->qoi->get_SEMING();
        }
        echo json_encode($data);
    }

    public function action()
    {
        $action = $_POST["action"];
        $cextData = $_POST["cextData"];
        $form  = ['NFRMNO' => $_POST["nfrmno"],
                  'VORGNO' => $_POST["vorgno"],
                  'CYEAR'  => $_POST["cyear"],
                  'CYEAR2' => $_POST["cyear2"],
                  'NRUNNO' => $_POST["nrunno"]
         ];
        try{
            $status = false;
            $message = '';
            if($action == "approve")
            {
                if($cextData == "01")
                {
                    $jstaff = $_POST["jstaff"];
                    $enginc = $_POST["enginc"];
                    $dataflow =  [
                        [ 'CSTEPNO' => '57', 'apv' => $jstaff], //jstaff
                        [ 'CSTEPNO' => '58', 'apv' =>  $enginc], // eng
                    ];
                    $fstatus = $this->updateFlowApv($form , $dataflow);
                    $status = $fstatus['status'];
                }else if($cextData == "02")
                {
                    $this->updateconcern();
                }
            }
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
            'JDGMNTNO'   => $_POST["judgement"]
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
        
    }

    public function delfile()
    {
        $path = $this->upload_path.$_POST["nfrmno"]."_".$_POST["vorgno"]."_".$_POST["cyear"]."_".$_POST["cyear2"]."_".$_POST["nrunno"]."/";
        $itemno = $_POST['itemno'];
        $nfile = $_POST['sfile'];
        $this->deleteFile($nfile,$path);
        $this->qoi->trans_start();
        $delfn = $this->qoi->delete("ATTQOIFRM","CYEAR2 ='".$_POST["cyear2"]."' AND NRUNNO = '".$_POST["nrunno"]."' AND ITEMNO = '".$itemno."' AND SFILE = '".$nfile."'");
        $this->qoi->trans_complete();
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

}