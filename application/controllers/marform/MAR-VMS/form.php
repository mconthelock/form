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
        $this->load->model('marform/MAR-VMS/vms_model', 'vms');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = "//amecnas/AMECWEB/File/" .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/MAR/VMS/";
    }

    public function main(){
        $cform = true; 
        if(!isset($_GET["y2"]) && !isset($_GET["runNo"]))
        {
            if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {

                if(isset($_GET["mode"]) && $_GET["mode"] == "A")
                {
                    $cform = true;
             
                }else
                {
                    $data = [
                        'NFRMNO' => $_GET['no'],
                        'VORGNO' => $_GET['orgNo'],
                        'CYEAR'  => $_GET['y'],
                    ];
                    $data['empno'] = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
                    $this->views('marform/MAR-VMS/main', $data);
                    $cform = false;
                }
            }
        }

        if($cform)
        {

            if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
                $data = [
                    'NFRMNO' => $_GET['no'],
                    'VORGNO' => $_GET['orgNo'],
                    'CYEAR'  => $_GET['y'],
                ];
    
            }else{
                $formmst = $this->frm->getFormMaster('MAR-VMS');
                if(!empty($formmst)){
                    $data = [
                        'NFRMNO' => $formmst[0]->NNO,
                        'VORGNO' => $formmst[0]->VORGNO,
                        'CYEAR'  =>$formmst[0]->CYEAR,
                    ];
                }
    
            }
            $data['empno'] = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
            $data['allgroup'] = $this->vms->get_group(array("GSTATUS" => '1')); 
            $data['participants'] = $this->vms->get_participants();
            if(!isset($_GET["runNo"]))
            {
                $data['mode'] = "1";
            }else
            {
                $data["CYEAR2"] = $_GET["y2"];
                $data["NRUNNO"] = $_GET["runNo"];
                $conall = array('NFRMNO' => $data["NFRMNO"],'VORGNO' => $data["VORGNO"],'CYEAR' => $data["CYEAR"],'CYEAR2' => $data["CYEAR2"],'NRUNNO' => $data["NRUNNO"]);
                $data["form"] = $this->vms->customSelect("FORM",$conall ,'*');
                if($data["form"][0]->VREQNO ==  $data['empno'])
                {
                    $data['mode'] = "2";
                }else
                {
                    $data['mode'] = "3";
                }
               
            }
            // mode : ADD or EDIT
            if(($data['mode']=="1")||($data['mode']=="2"))
            {
                $data["guesttype"] = $this->vms->get_guest_type();
                $data["purpose"] = $this->vms->get_purpose_visit();
                $data["visittype"] = $this->vms->get_visit_type();
                $data["salecom"] = $this->vms->get_salecompany();
                $data["activity"] = $this->vms->get_activity();
                $data["room"] = $this->vms->get_room();
                $data["dietary"] = $this->vms->get_dietary();
                $data["attfile"] = array();
                $data["attgfile"] = array();
                $data["attbfile"] = array();
                $data["pstk"] = array();
                $data["istk"] = array();
                $data["sch"]  = array();
                $data["visitinf"] = array();
                if($data['mode']=="2")
                {
                    $con = array("CYEAR2" => $data["CYEAR2"],"NRUNNO" => $data["NRUNNO"]);
                    $conatt = array("CYEAR2" => $data["CYEAR2"],"NRUNNO" => $data["NRUNNO"],"TYPENO" =>'S');
                    $data["visit"] =  $this->vms->customSelect("VMS_VISIT",$con ,'*');
                    $data["sch"] =  $this->vms->get_schedule($con);
                    $data["visitinf"] =   $this->vms->customSelect("VMS_VISITINF",$con,'*');
                    $con["TYPEEMP"] = "P";
                    $data["pstk"] = $this->vms->get_stakeholders($con);
                    $con["TYPEEMP"] = "I";
                    $data["istk"] = $this->vms->get_stakeholders($con);
                    $data["attfile"] =  $this->vms->customSelect("VMS_ATTFILE",$conatt,'*');
                    $conatt["TYPENO"] = "G";
                    $data["attgfile"] =  $this->vms->customSelect("VMS_ATTFILE",$conatt,'*');
                    $conatt["TYPENO"] = "B";
                    $data["attbfile"] =  $this->vms->customSelect("VMS_ATTFILE",$conatt,'*');
                    $customOptions = array();
                    foreach($data["visitinf"] as $vt)
                    {
                       // echo $vt->DIETREQ;
                        //echo "<br/>";
                        $customOptions[] =  (object)[ 'DID' => $vt->DIETREQ , 'DIETARY' => $vt->DIETREQ];
                    }
                    $dbDIDs = array_column($data["dietary"], 'DIETARY');
                    foreach ($customOptions as $opt) {
                        if (!in_array($opt->DIETARY, $dbDIDs)) {
                            $data["dietary"][] = $opt;
                            $dbDIDs[] = $opt->DIETARY; // อัปเดต DID list เพื่อกันซ้ำ
                        }
                    }
            
                  
                }else
                {
                    $data["formversion"] = $this->vms->get_formversion();
                }
    
                $this->views('marform/MAR-VMS/create', $data);
            }
        }
        
    }

    public function master()
    {

        $data["participants"] = $this->vms->get_participants();
        $this->views('marform/MAR-VMS/master', $data);

    }
    
    public function save()
    {
        $tab = $_POST["tab"];
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear =  $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
        $this->vms->update("FORM", array("CST" => '0') ,array("NFRMNO" => $nfrmno , "VORGNO" => $vorgno , "CYEAR" => $cyear , "CYEAR2" => $cyear2 , "NRUNNO" => $nrunno));
        if($tab == "visitarg")
        {

            $path = $this->upload_path.$nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno;
            if (!is_dir($path))
            {
                mkdir($path, 0777, true);
            }
            $upfile =  $this->uploadMultiFile($_FILES, ['specificAttachment','fileAttachment'], $path);
            $fid = $this->vms->generate_attfile_id($cyear2,$nrunno);
            $datafile = array();
            foreach ($upfile["files"] as $fileType => $fileArray) {
             foreach ($fileArray as $file) {
                 $datafile[] = array
                 (
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'ITEMNO' => $fid,
                    'TYPENO' => ($fileType == "specificAttachment"? "S":"G"),
                    'SFILE'  => $file['file_name']
                 );
                 $this->vms->delete("VMS_ATTFILE",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno , "TYPENO" =>'S',"SFILE" =>$file['file_name']));
                 $fid++;
             }
            }
            if(count($datafile) > 0)
            {
                $this->vms->insert_batch("VMS_ATTFILE", $datafile);
            }
            $con = array(
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
            );
            $data = array(
                'FORMVER'       => $_POST["formVersion"],
                'SALECOM'       => $_POST["salecom"],
                'FORMC1_1'      => $_POST["formC1"],
                'VISITDATE'     => ($_POST["visitDate"] != ""? date("d/m/Y", strtotime($_POST["visitDate"])):""),
                'BOOKING'       => $_POST["bookingTime"],
                'RECEPTROOM'    => $_POST["receptionRoom"],
                'PURPOSE'       => $_POST["purposevisit"],
                'PURPOSEDETAIL' => $_POST["detail"],
                'VISITTYPE'     => $_POST["visitTypes"],
                'GUESTTYPE'     => $_POST["guestType"],
                'COMTYPE'       => $_POST["guestDetail"],
                'SHOPTOUR'      => $_POST["shoptour"],
                'LUNCH'         => $_POST["hasLunch"],
                'LUNCH_LOC'     => $_POST["lunch"],
                'LUNCH_PLACE'   => $_POST["lunchPlace"],
                'DINNER'        => $_POST["hasDinner"],
                'DINNER_PLACE'  => $_POST["dinnerPlace"],
                'HOTELNAME'     => $_POST["hotelReservation"],
                'CARHOTEL'      => $_POST["carHotel"],
                'CARHOTELNOTE'  => $_POST["carHotelNote"]
            );
            $rs = $this->vms->customSelect("VMS_VISIT",$con,'REFNO');
            if(count($rs) > 0)
            {
                //update
                try {
                    $status = false;
                    $update = $this->vms->update("VMS_VISIT", $data,  $con);
                    if(!$update){
                        throw new Exception("Can not update this Visit Arrangement", 0);
                    }else{
                        $status = true;
                    }
                }catch (Exception $e) {
                    $status = false;
                } finally {
                    $result = [
                        'status'  => $status,
                        'message' => $status ? 'Data saved successfully' : 'Failed to save data'
                    ];
                    echo json_encode($result);
                }

            }else
            {
                $data['CYEAR2'] = $cyear2;
                $data['NRUNNO'] = $nrunno;
                $data['REFNO']  = $this->createrefno($cyear2);
                //insert
                try {
                    $status = false;
                    $insert = $this->vms->insert("VMS_VISIT",$data);
                    if(!$insert){
                        throw new Exception("Can not insert this Visit Arrangement", 0);
                    }else{
                        $status = true;
                    }
                }catch (Exception $e) {
                    $status = false;
                } finally {
                    $result = [
                        'status'  => $status,
                        'message' => $status ? 'Data saved successfully' : 'Failed to save data'
                    ];
                    echo json_encode($result);
                }
              
            }

        }else if($tab == "stk")
        {
            $pst = $_POST["pst"];
            $data  = array();
            foreach($pst as $p)
            {
                if($p != "")
                {
                    $data[] = array(
                        'CYEAR2' => $cyear2,
                        'NRUNNO' => $nrunno,
                        'GID' => $p,
                        'TYPEEMP' => 'P'
                    );
                }
            } 
            $ist = $_POST["ist"];
            foreach($ist as $i)
            {
                if($i != "")
                {
                    $data[] = array(
                        'CYEAR2' => $cyear2,
                        'NRUNNO' => $nrunno,
                        'GID' => $i,
                        'TYPEEMP' => 'I'
                    );
                }
            } 
            $this->vms->trans_start();
            $delfn = $this->vms->delete("VMS_STAKEHOLDERS","CYEAR2 = '".$cyear2."' AND NRUNNO = '".$nrunno."'");
            $this->vms->trans_complete();

            if(count($data) > 0)
            {

                try {
                    $status = false;
                    $insert = $this->vms->insert_batch("VMS_STAKEHOLDERS", $data);
                    if(!$insert){
                        throw new Exception("Can not insert this Stakeholders", 0);
                    }else{
                        $status = true;
                    }
                }catch (Exception $e) {
                    $status = false;
                } finally {
                    $result = [
                        'status'  => $status,
                        'message' => $status ? 'Data saved successfully' : 'Failed to save data'
                    ];
                    echo json_encode($result);
                }
            }

        }else if($tab == "sch")
        {
            $visitDate = $_POST["visitDate"];
            $starttime = $_POST["starttime"];
            $endtime = $_POST["endtime"];
            $place = $_POST["place"];
            $content = $_POST["content"];
            $participants = $_POST["participants"];
            $note = $_POST["note"];
            $activity  = $_POST["activity"];
            $i=0;
            $id = 0;
            $data  = array();
            foreach($starttime as $s)
            {
                if($s != "")
                {
                    $id++;
                    $data[] = array(
                        "CYEAR2"    => $cyear2,
                        "NRUNNO"    => $nrunno,
                        "ID"        => $id,
                        "SCHSTIME" =>  $visitDate." ".$s,
                        "SCHETIME"   => $visitDate." ".$endtime[$i],
                        "PLACE"     => $place[$i],
                        "CONTENT"   => $content[$i],
                        "AMECP"     => $participants[$i],
                        "NOTE"      => $note[$i],
                        "AID"       =>  $activity[$i]
                    );
                }
                $i++;

            }
            $this->vms->trans_start();
            $delfn = $this->vms->delete("VMS_SCHEDULE","CYEAR2 = '".$cyear2."' AND NRUNNO = '".$nrunno."'");
            $this->vms->trans_complete();
            if(count($data) > 0)
            {

                try {
                    $status = false;
                    foreach($data as $d)
                    {
                        $insert = $this->vms->insert("VMS_SCHEDULE",$d);
                    }

                    if(!$insert){
                        throw new Exception("Can not insert this Schedule", 0);
                    }else{
                        $status = true;
                    }
                }catch (Exception $e) {
                    $status = false;
                } finally {
                    $result = [
                        'status'  => $status,
                        'message' => $status ? 'Data saved successfully' : 'Failed to save data'
                    ];
                    echo json_encode($result);
                }
            } 

        }else if($tab == "req")
        {
            $con = array(
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
            );
            $data = array(
                'BOARD' => $_POST["requireWelcomeBoard"]
            );
            try {
                $status = true;
                $update = $this->vms->update("VMS_VISIT", $data,  $con);
                $path = $this->upload_path.$nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno;
                if (!is_dir($path))
                {
                    mkdir($path, 0777, true);
                }
                $upfile =  $this->uploadMultiFile($_FILES, ['welcomeBoardFile'], $path);
                $fid = $this->vms->generate_attfile_id($cyear2,$nrunno);
                $datafile = array();
                foreach ($upfile["files"] as $fileType => $fileArray) {
                foreach ($fileArray as $file) {
                    $datafile[] = array
                    (
                        'CYEAR2' => $cyear2,
                        'NRUNNO' => $nrunno,
                        'ITEMNO' => $fid,
                        'TYPENO' => "B",
                        'SFILE'  => $file['file_name']
                    );
                    $this->vms->delete("VMS_ATTFILE",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno , "TYPENO" =>'B'));
                    $fid++;
                }
                }
                if(count($datafile) > 0)
                {
                    $this->vms->insert_batch("VMS_ATTFILE", $datafile);
                }
            }catch (Exception $e) {
                $status = false;
            } finally {
                $result = [
                    'status'  => $status,
                    'message' => $status ? 'Data saved successfully' : 'Failed to save data'
                ];
                echo json_encode($result);
            } 
        }else if($tab == "inf")
        {
            $country = $_POST["country"];
            $company = $_POST["company"];
            $name    = $_POST["name"]; 
            $pos = $_POST["pos"];      
            $exp = $_POST["exp"];
            $lunch_provided = $_POST["lunch_provided"];
            $dinner_provided = $_POST["dinner_provided"];
            $dietary_require = $_POST["dietary_require"];
            $con = array(
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
            );
            $i=0;
            $id = 0;
            $data  = array();
            foreach($name as $n)
            {
                if($name != "")
                {
                    $id++;
                    $data[] = array(
                        'CYEAR2'  => $cyear2,
                        'NRUNNO'  => $nrunno,
                        'ID'      => $id,
                        'COUNTRY' => $country[$i],
                        'COMPANY' => $company[$i],
                        'NAME'    => $name[$i],
                        'POSITION'=> $pos[$i],
                        'VISITEXP'=> $exp[$i],
                        'LUNCH'   => (($_POST["hasLunch"]=="Y") ? $lunch_provided[$i] : ""),
                        'DINNER'  => (($_POST["hasDinner"]=="Y") ? $dinner_provided[$i] : ""),
                        'DIETREQ' => ((($_POST["hasLunch"]=="Y") || ($_POST["hasDinner"]=="Y")) ? $dietary_require[$i]:"")
                    );
                }
                $i++;
            }
            try{
                $status = true;
                if(count($data) > 0)
                {
                    $this->vms->trans_start();
                    $delfn = $this->vms->delete("VMS_VISITINF","CYEAR2 = '".$cyear2."' AND NRUNNO = '".$nrunno."'");
                    $this->vms->trans_complete();
                    $this->vms->insert_batch("VMS_VISITINF", $data);
                }
            }catch (Exception $e) {
                $status = false;
            } finally {
                $result = [
                    'status'  => $status,
                    'message' => $status ? 'Data saved successfully' : 'Failed to save data'
                ];
                echo json_encode($result);
            } 

        }
        
    }


    public function update_form_version()
    {
        
       /* $result = [
            'status'  => true,
            'message' => ">>>".$_POST["formVersion"]
        ];
        echo json_encode($result);*/
        $sql = "UPDATE VMS_FORM_VERSION  SET VERSION_NO = '".$_POST["formVersion"]."', UPDATED_AT = SYSTIMESTAMP WHERE ID = '1'";
        $status = $this->vms->execsql($sql);
        $result = [
                'status'  => $status,
                'message' => $status ? 'Data updated successfully' : 'Failed to update'
        ];
        echo json_encode($result);
    }


    public function createrefno($cyear2)
    {
          return  $this->vms->generate_id("VMS_VISIT", "REFNO", array('CYEAR2'=>$cyear2));
    }

    public function delfile()
    {
    $fd = $_POST['fd'];
    $path = $this->upload_path.$fd."/";
    $fid = $_POST['fid'];
    $nfile = $_POST['nfile'];
    $this->deleteFile($nfile,$path);
    $this->vms->trans_start();
    $delfn = $this->vms->delete("VMS_ATTFILE","ITEMNO = '".$fid."' AND SFILE = '".$nfile."'");
    $this->vms->trans_complete();
    $res = [
        'status' => $delfn,
        'message' => ""
    ];
    echo json_encode($res);
    }

    public function mdownload($fd,$file,$ofile)
    {
        $path = $this->upload_path.$fd;
        $this->downloadFile($file,$ofile,$path);
    }

}