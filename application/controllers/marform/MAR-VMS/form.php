<?php
use GuzzleHttp\Client;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\{Border, Fill, Alignment};
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
defined('BASEPATH') OR exit('No direct script access allowed');
//require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/_excel.php';
class form extends MY_Controller{
    use formApi, _File, _excel, formmst;
    protected $client;
    private $nfrmno = "";
    private $vorgno = "";
    private $cyear = "";  
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'frm');
        $this->load->model('user_model', 'usr');
        $this->load->model('marform/MAR-VMS/vms_model', 'vms');
        $this->load->library('Mail');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/MAR/VMS/";
        $this->ent_path = $_ENV['AMEC_FILE_PATH'] .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/GP/GPENT/";
        $formmst = $this->getFormMasterByVaname('MAR-VMS');
        $this->nfrmno = $formmst["data"]['NNO'];
        $this->vorgno = $formmst["data"]['VORGNO'];
        $this->cyear = $formmst["data"]['CYEAR'];
       
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
                if(($data['mode'] == "1")||($data['mode'] == "2"))
                {
                    $data["guesttype"] = $this->vms->get_guest_type();
                    $data["purpose"] = $this->vms->get_purpose_visit();
                    $data["visittype"] = $this->vms->get_visit_type();
                    $data["salecom"] = $this->vms->get_salecompany();
                    $data["activity"] = $this->vms->get_activity();
                    $data["room"] = $this->vms->get_room();
                    $data["dietary"] = $this->vms->get_dietary();
                    $data["costmst"] = $this->vms->customSelect("GPENT_ESTIMATE_TYPE",array('ET_STATUS' => '1') ,'ET_NAME , ET_COST');
                }
                $data["attfile"] = array();
                $data["attgfile"] = array();
                $data["attbfile"] = array();
                $data["pstk"] = array();
                $data["istk"] = array();
                $data["sch"]  = array();
                $data["visitinf"] = array();
                $data["amecmeal"] = array();
                $data["sproj"] = array();
                $data["pproj"] = array();

                if($data['mode']=="2")
                {
                    $con = array("CYEAR2" => $data["CYEAR2"],"NRUNNO" => $data["NRUNNO"]);
                    $conatt = array("CYEAR2" => $data["CYEAR2"],"NRUNNO" => $data["NRUNNO"],"TYPENO" =>'S');
                    $conprj =  array("CYEAR2" => $data["CYEAR2"],"NRUNNO" => $data["NRUNNO"],"PROJTYPE" => 'S');
                    $data["visit"] =  $this->vms->customSelect("VMS_VISIT",$con ,'*');
                    $data["formversion"] = $data["visit"][0]->FORMVER;
                    $data["sch"] =  $this->vms->get_schedule($con);
                    $data["amecmeal"] =  $this->vms->customSelect("VMS_AMEC_MEAL",$con ,'*');
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
                    $rows = $this->vms->customSelect("VMS_PROJECT",$conprj,'*','','','ID');
                    foreach ($rows as $row) {
                        $projno = $row->PROJNO;
                        if (!isset($data["sproj"][$projno])) {
                            $data["sproj"][$projno] = [];
                        }
                        $data["sproj"][$projno][] = [
                            "PROJNAME" => $row->PROJNAME,
                            "MODEL"    => $row->MODEL,
                            "SPEC"     => $row->SPEC,
                            "QTY"     =>  $row->QTY,
                            "STATUS"     => $row->STATUS
                        ];
                    }
                    $conprj["PROJTYPE"] = "P";
                    $data["pproj"] = $this->vms->customSelect("VMS_PROJECT",$conprj,'*','','','ID');
                

                   /* foreach ($rows as $row) {
                        $projno = $row->PROJNO;
                        if (!isset($data["pproj"][$projno])) {
                            $data["pproj"][$projno] = [];
                        }
                        $data["pproj"][$projno][] = [
                            "PROJNAME" => $row->PROJNAME,
                            "MODEL"    => $row->MODEL,
                            "SPEC"     => $row->SPEC,
                            "QTY"     =>  $row->QTY,
                            "STATUS"     => $row->STATUS
                        ];
                    }  */
                }else if($data['mode']=="3")
                {
                    $con = array(
                        'CYEAR2' => $data["CYEAR2"],
                        'NRUNNO' => $data["NRUNNO"]
                    );
                    $rs = $this->vms->getRcp($data["CYEAR2"], $data["NRUNNO"],"P");
                    $head = array();
                    $ent = $this->vms->get_vms_ent(array('VMSCYEAR2' => $data["CYEAR2"] , 'VMSNRUNNO' => $data["NRUNNO"]));
                    $visitint = $this->vms->customSelect("VMS_VISITINF",$con, '*', '', 'ID');
                    $schedule = $this->vms->customSelect("VMS_SCHEDULE",$con, 'TO_CHAR(SCHSTIME, \'HH:MI AM\') as SCHSTIME , TO_CHAR(SCHETIME, \'HH:MI AM\') as SCHETIME , PLACE , CONTENT , AMECP , NOTE ', '', 'ID');
                    $con["PROJTYPE"] = "S";
                    $sproj = $this->vms->customSelect("VMS_PROJECT",$con, '*', '', 'ID');
                    $con["PROJTYPE"] = "P";
                    $pproj = $this->vms->customSelect("VMS_PROJECT",$con, '*', '', 'ID');
                    $head["ATT"] = (!empty($rs)? $rs[0]->RCP:"");
                    $rs = $this->vms->getRcp($data["CYEAR2"], $data["NRUNNO"],"I");
                    $head["CC"] =  (!empty($rs)? $rs[0]->RCP:"");
                    $rs = $this->vms->getHeadVisit($this->nfrmno,$this->vorgno,$this->cyear,$data["CYEAR2"],$data["NRUNNO"]);
                    $item = $this->vms->getItemReq($data["CYEAR2"],$data["NRUNNO"]);
                    $dietary = $this->vms->get_dietary_item($data["CYEAR2"],$data["NRUNNO"]);
                     $timelunch = $this->vms->get_time_lunch($data["CYEAR2"],$data["NRUNNO"]);
                    if(!empty($rs))
                    {
                        $head["FORMVER"] = $rs[0]->FORMVER;
                        $head["REFNO"] = $rs[0]->REFNO;
                        $head["ISSUEDATE"] = $rs[0]->ISSUEDATE;
                        $head["ISSUEBY"] = $rs[0]->ISSUEBY;
                        $head["BCC"] = $rs[0]->SRECMAIL;
                        $head["VISITDATE"] = $rs[0]->VISITDATE;
                        $head["RECEPTROOM"] = $rs[0]->RECEPTROOM;
                        $head["VISITOR_COUNT"] = $rs[0]->VISITOR_COUNT;
                        $head["PURPOSEVISIT"] = $rs[0]->VTYPE;
                        $head["PURPOSEDETAIL"] = $rs[0]->PURPOSEDETAIL;
                        $head["LUNCHTIME"] = !empty($timelunch)
                        ? $timelunch[0]->LUNCH_TIME
                        : "12:00 PM - 01:00 PM";
                    }
                    $data["head"] = $head;
                    $data["visitint"] = $visitint;
                    $data["schedule"] = $schedule;
                    $data["sproj"] = $sproj;
                    $data["pproj"] = $pproj;
                    $data["item"] = $item;
                    $data["dietary"] = $dietary;
                    $data["ent"] = $ent;
                }else
                {
                    $data["formversion"] = $this->vms->get_formversion();
                }
                if(($data['mode'] == "1")||($data['mode'] == "2")){
                     $this->views('marform/MAR-VMS/create', $data);
                }else{
                    $this->views('marform/MAR-VMS/view', $data);
                }
            
        }
        
    }

    /*public function master()
    {

        $data["participants"] = $this->vms->get_participants();
        $this->views('marform/MAR-VMS/master', $data);

    }*/
    
    public function save()
    {
        $tab = $_POST["tab"];
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear =  $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
      //  $this->vms->update("FORM", array("CST" => '0') ,array("NFRMNO" => $nfrmno , "VORGNO" => $vorgno , "CYEAR" => $cyear , "CYEAR2" => $cyear2 , "NRUNNO" => $nrunno));
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
            $seq = 1;
            foreach($pst as $p)
            {
                if($p != "")
                {
                    $data[] = array(
                        'CYEAR2' => $cyear2,
                        'NRUNNO' => $nrunno,
                        'GID' => $p,
                        'TYPEEMP' => 'P',
                        'SEQ' => $seq
                    );
                    $seq++;
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
                        'TYPEEMP' => 'I',
                        'SEQ' => $seq
                    );
                    $seq++;
                }
            } 
            
            $this->vms->trans_start();
            $delfn = $this->vms->delete("VMS_STAKEHOLDERS",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno));
            $this->vms->trans_complete();
      
            if(count($data) > 0)
            {
                try {
                    $status = false;
                    $insertrow = $this->vms->insert_batch("VMS_STAKEHOLDERS", $data);
                    if(!$insertrow ){
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
                        "SCHSTIME" =>  date('Y-m-d h:i A', strtotime($visitDate.' '.$s)),
                        "SCHETIME"   => date('Y-m-d h:i A', strtotime($visitDate.' '.$endtime[$i])),
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
            $delfn = $this->vms->delete("VMS_SCHEDULE",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno));
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
                    $fid++;
                }
                }
                if(count($datafile) > 0)
                {
                    $this->vms->delete("VMS_ATTFILE",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno , "TYPENO" =>'B'));
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
                if($n != "")
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
                    $delfn = $this->vms->delete("VMS_VISITINF",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno));
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

        }else if($tab == "meal")
        {
            $employee = $_POST["employee"];
            $lunch = $_POST["lunch_provided"];
            $dinner = $_POST["dinner_provided"];
            $dietary = $_POST["amecdietary_require"];
            $data = array();
            $i = 0;
            foreach ($employee as $a) {
               if($a <> "")
               {    
                 $data[] = array(
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'SEMPNO' => $a,
                    'LUNCH'  => $lunch[$i],
                    'DINNER' => $dinner[$i],
                    'DIETREQ' => $dietary[$i]
                 );
               }
               $i++;
            }
            try {
                $status = true;
                $this->vms->delete("VMS_AMEC_MEAL",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno));
                if(count($data) > 0)
                {
                    $this->vms->insert_batch("VMS_AMEC_MEAL", $data);
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
        }else if($tab == "prj")
        {
              $projno = $_POST["secured_project_no"];
              $data = array();
              $id = 0;
              foreach($projno as $pj)
              {
                 if(!empty($pj))
                 {
                    $projname = $_POST["sprojname_".$pj];  
                    $model = $_POST["sprojmodel_".$pj];
                    $spec = $_POST["sprojspec_".$pj];
                    $qty = $_POST["sprojqty_".$pj];
                    $status = $_POST["sprojsta_".$pj];
                    $i = 0;
                    foreach($projname as $prn)
                    {
                        if($prn != "")
                        {
                            $id++;
                            $data[] = array(
                                'CYEAR2'    => $cyear2,
                                'NRUNNO'    => $nrunno,
                                'ID'        => $id,
                                'PROJTYPE'  => 'S',
                                'PROJNO'    => $pj,
                                'PROJNAME'  => $projname[$i],
                                'MODEL'     =>  $model[$i],
                                'SPEC'      => $spec[$i],
                                'QTY'       => $qty[$i],
                                'STATUS'    => $status[$i]
                            );
                        }
                        $i++;
                    } 
                 }
              }
              $pprojno = $_POST["prospective_project_no"];
              $pprojname = $_POST["prospective_project_name"];
              $pprojmodel = $_POST["prospective_model"];
              $pprojspec = $_POST["prospective_basic_spec"];
              $pprojqty = $_POST["prospective_units"];
              $pprojsta = $_POST["prospective_status"];
              $i=0;
              foreach( $pprojno as $pj)
              {
                   
                    if(($pj <> "") || ($pprojname[$i] <> "") || ($pprojmodel[$i] <> "") || ($pprojspec[$i] <> "") || ($pprojqty[$i] <> "")|| ($pprojsta[$i] <> "") )
                    {
                        $id++;
                        $data[] = array(
                            'CYEAR2'    => $cyear2,
                            'NRUNNO'    => $nrunno,
                            'ID'        => $id,
                            'PROJTYPE'  => 'P',
                            'PROJNO'    => $pj,
                            'PROJNAME'  => $pprojname[$i],
                            'MODEL'     => $pprojmodel[$i],
                            'SPEC'      => $pprojspec[$i],
                            'QTY'       => $pprojqty[$i],
                            'STATUS'    => $pprojsta[$i]
                        );
                    }
                    $i++;
              }
              try {
                $status = true;
                $this->vms->delete("VMS_PROJECT",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno));
                if(count($data) > 0)
                {
                    $this->vms->insert_batch("VMS_PROJECT", $data);
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

    public function save_vms_gpent()
    {
        try
        {
            $status = true;
            $data = array(
                'VMSCYEAR2' => $_POST["vmscyear2"],
                'VMSNRUNNO' => $_POST["vmsnrunno"],
                'ENTCYEAR2' => $_POST["entcyear2"],
                'ENTNRUNNO' => $_POST["entnrunno"],
            );
            $this->vms->delete("VMS_GPENT", $data);
            $this->vms->insert("VMS_GPENT",$data);

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
   
    $delfn = $this->vms->delete("VMS_ATTFILE",array("ITEMNO" => $fid , "SFILE" => $nfile));
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

    
    public function saveENTfile()
    {
        $vmsnfrmno = $_POST["vmsnfrmno"];
        $vmsvorgno = $_POST["vmsvorgno"];
        $vmscyear = $_POST["vmscyear"];
        $vmscyear2 = $_POST["vmscyear2"];
        $vmsnrunno = $_POST["vmsnrunno"];
        $entcyear2 = $_POST["entcyear2"];
        $entnrunno = $_POST["entnrunno"];
        $filename = $_POST["filename"];
        $this->vms->update("GPENT_COMPANY", array("ATTACH_FILE" => $filename), array("CYEAR2" => $entcyear2 , "NRUNNO" => $entnrunno));
        $source = $this->upload_path.$vmsnfrmno."_".$vmsvorgno."_".$vmscyear."_".$vmscyear2."_".$vmsnrunno."/".$filename;
        $dest = $this->ent_path.$filename;
        if (file_exists($dest)) {
            unlink($dest);
        }
        try{
            $status = true;
            copy($source, $dest);
        }catch (Exception $e)
        {
            $status = false;
        }finally {
            $result = [
                'status'  => $status,
                'message' => $status ? 'Save file successfully' : 'Failed to save file'
            ];
            echo json_encode($result);
        } 
    }

    public function getFormData()
    {
        $vmscyear2 = $_POST["vmscyear2"];
        $vmsnrunno = $_POST["vmsnrunno"];
        $con = array(
            'CYEAR2' => $vmscyear2,
            'NRUNNO' => $vmsnrunno 
        );
     
        $rs = $this->vms->getRcp($vmscyear2, $vmsnrunno,"P");
        $head = array();
        $ent = $this->vms->get_vms_ent(array('VMSCYEAR2' => $vmscyear2 , 'VMSNRUNNO' => $vmsnrunno));
        
        $visitint = $this->vms->customSelect("VMS_VISITINF",$con, '*', '', 'ID');
        $schedule = $this->vms->customSelect("VMS_SCHEDULE",$con, 'TO_CHAR(SCHSTIME, \'HH:MI AM\') as SCHSTIME , TO_CHAR(SCHETIME, \'HH:MI AM\') as SCHETIME , PLACE , CONTENT , AMECP , NOTE ', '', 'ID');
        $con["PROJTYPE"] = "S";
        $sproj = $this->vms->customSelect("VMS_PROJECT",$con, '*', '', 'ID');
        $con["PROJTYPE"] = "P";
        $pproj = $this->vms->customSelect("VMS_PROJECT",$con, '*', '', 'ID');
        $head["ATT"] = (!empty($rs)? $rs[0]->RCP:"");
        $rs = $this->vms->getRcp($vmscyear2, $vmsnrunno,"I");
        $head["CC"] =  (!empty($rs)? $rs[0]->RCP:"");
        $rs = $this->vms->getHeadVisit($this->nfrmno,$this->vorgno,$this->cyear,$vmscyear2,$vmsnrunno);
        $item = $this->vms->getItemReq($vmscyear2,$vmsnrunno);
        $dietary = $this->vms->get_dietary_item($vmscyear2,$vmsnrunno);
        $timelunch = $this->vms->get_time_lunch($vmscyear2,$vmsnrunno);

        if(!empty($rs))
        {
            $head["FORMVER"] = $rs[0]->FORMVER;
            $head["REFNO"] = $rs[0]->REFNO;
            $head["ISSUEDATE"] = $rs[0]->ISSUEDATE;
            $head["ISSUEBY"] = $rs[0]->ISSUEBY;
            $head["BCC"] = $rs[0]->SRECMAIL;
            $head["VISITDATE"] = $rs[0]->VISITDATE;
            $head["RECEPTROOM"] = $rs[0]->RECEPTROOM;
            $head["VISITOR_COUNT"] = $rs[0]->VISITOR_COUNT;
            $head["PURPOSEVISIT"] = $rs[0]->VTYPE;
            $head["PURPOSEDETAIL"] = $rs[0]->PURPOSEDETAIL;
            $head["LUNCHTIME"] = !empty($timelunch)
            ? $timelunch[0]->LUNCH_TIME
            : "12:00 PM - 01:00 PM";
        }
        
        $data = array(
            "head" => $head,
            "visitint" => $visitint,
            "schedule" => $schedule,
            "sproj" => $sproj,
            "pproj" => $pproj,
            "item" => $item,
            "dietary" => $dietary,
            "ent" => $ent
        );
       return $data;
    }

    public function showFormData()
    {
          
        echo json_encode($this->getFormData());
    }

    public function sendmailpic()
    {
        $vmscyear2 = $_POST["vmscyear2"]; 
        $vmsnrunno = $_POST["vmsnrunno"];
        $data = $this->getFormData();
        $d['VIEW']    = 'layouts/mail/message';
        $f = $this->create_save_vmsexcel($data);
        $d['ENFILE'][]   = ['filename'=> $f['filename'], 'content'=> $f['content']];
        $conatt = array(
            'CYEAR2' =>  $vmscyear2,
            'NRUNNO' =>  $vmsnrunno,
            'TYPENO' => 'B'
        );
        $rsf =  $this->vms->customSelect("VMS_ATTFILE",$conatt,'*');
        foreach($rsf as $f)
        {
            $d['ENFILE'][] = [
                'filename' => $f->SFILE,
                'content'  => file_get_contents($this->upload_path.$this->nfrmno."_".$this->vorgno."_".$this->cyear."_".$vmscyear2."_".$vmsnrunno."/".$f->SFILE)
            ];
        }
        $d['SUBJECT'] = "VISITOR NOTICE : ".$data['head']['PURPOSEDETAIL'];
        $d['TO']  = $this->vms->getRcpMail($vmscyear2 , $vmsnrunno,"P");
        $d['CC']  = $this->vms->getRcpMail($vmscyear2 , $vmsnrunno,"I");
        $d['BCC']  = $data["head"]["BCC"];
        $d['BODY'] = [
            '<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                <p>
                We would like to inform you that representatives from '.$data['head']['PURPOSEDETAIL'].' for a '.$data['head']["PURPOSEVISIT"].'.<br/>
                Please find the attached visitor notice for your kind reference and necessary preparation.
                </p>
                <p>
                Your cooperation is highly appreciated.
                </p>


                <p style="margin-top: 24px;">
                    Best regards,<br/>
                    '. $data['head']["ISSUEBY"].'
                </p>
            </div>'
        ];
        try{
            $status = true;
            $this->mail->sendmail($d);
        }catch (Exception $e)
        {
            $status = false;
        }finally {
            $result = [
                'status'  => $status,
                'message' => $status ? 'Sent mail to PIC successfully' : 'Failed to sent mail to PIC'
            ];
            echo json_encode($result);
        } 
    }
     // data is data from function getFormData
    public function create_save_vmsexcel($data)
    {

        $spreadsheet = IOFactory::load($this->upload_path.'TEMPLATE/VMSTEMP.xlsx');
        $sheet = $spreadsheet->getActiveSheet();

        // แก้ค่า
        $sheet->setCellValue('W2', $data['head']['FORMVER']);
        $sheet->setCellValue('B3', "Attn: ".$data['head']['ATT']);
        $sheet->setCellValue('B4', "CC: ".$data['head']['CC']);
        $sheet->setCellValue('E7', $data['head']['PURPOSEVISIT']);
        $sheet->setCellValue('L7', $data['head']['PURPOSEDETAIL']);
        $sheet->setCellValue('V3', $data['head']['ISSUEDATE']);
        $sheet->setCellValue('V4', $data['head']['REFNO']);
        $parts = preg_split('/\s+/', trim($data['head']['ISSUEBY']));
        $shortnm = $parts[0] . " " . $parts[1] . " " . $parts[2][0] . ".";
        $sheet->setCellValue('V5',  $shortnm);
        $sheet->setCellValue('V6', $data['head']['VISITDATE']);
        $sheet->setCellValue('W7', $data['head']['RECEPTROOM']);
        $sheet->setCellValue('W8', $data['head']['VISITOR_COUNT']);
        $templateStart = 12; // แถวแรกของ template data
        $templateCount = 2;  // Template มี 3 แถว (12–14)
        $templateEnd   = $templateStart + $templateCount - 1;
        $extra = count($data['visitint']) - $templateCount;
        if ($extra > 0) {
            $this->insertEmptyRowsWithTemplate($sheet, $templateStart ,$templateCount ,  $extra );
        }
        foreach($data['visitint'] as $i => $row)
        {
            $currentRow = $templateStart + $i;
            $sheet->setCellValue("B{$currentRow}", $i+1);
            $sheet->setCellValue("C{$currentRow}", $row->COUNTRY);
            $sheet->setCellValue("G{$currentRow}", $row->COMPANY);
            $sheet->setCellValue("L{$currentRow}", $row->NAME);
            $sheet->setCellValue("S{$currentRow}", $row->POSITION);
            $sheet->setCellValue("W{$currentRow}", ($row->VISITEXP == "N"? "No":"Yes"));
          
        }
        $templateStart = $templateStart+ $templateCount +$extra+ 3; // แถวแรกของ template data
        $templateCount = 2;  // Template มี 3 แถว (12–14)
        $templateEnd   = $templateStart + $templateCount - 1;
        $extra = count($data['schedule']) - $templateCount;
        if ($extra > 0) {
            $this->insertEmptyRowsWithTemplate($sheet, $templateStart ,$templateCount ,  $extra );
        }
        $currentRow = $templateStart;
        foreach($data['schedule'] as $i => $row)
        {
            $currentRow = $templateStart + $i;
            $sheet->setCellValue(
                "B{$currentRow}", 
                !empty($row->SCHSTIME) && !empty($row->SCHETIME)
                    ? $row->SCHSTIME . ' - ' . $row->SCHETIME
                    : '-'
            );
          
            $sheet->setCellValue("E{$currentRow}", $row->PLACE);
            $sheet->setCellValue("H{$currentRow}", $row->CONTENT);
            $sheet->setCellValue("P{$currentRow}", $row->AMECP);
            $sheet->setCellValue("W{$currentRow}", !empty($row->NOTE) ? $row->NOTE : '-');
          
        }
        $templateStart = $currentRow + 4;
        $sheet->setCellValue("P{$templateStart}", $data['item'][0]->HOTELNAME);
        $sheet->setCellValue("B".($templateStart + 2),($data['item'][0]->BOARD == "N"? "No":"Yes"));
        $sheet->setCellValue("N".($templateStart + 4),($data['item'][0]->SHOPTOUR == "G"? "General":($data['item'][0]->SHOPTOUR == "S"? "Specific":"Inspection")));
        $sheet->setCellValue("V".($templateStart + 4),($data['item'][0]->FORMC1_1 == "Y"? "Yes":"No"));
        $sheet->setCellValue("B".($templateStart + 7),$data['item'][0]->ROOMLUNCH);
        $sheet->setCellValue("D".($templateStart + 8),$data['head']['VISITDATE']);
        $sheet->setCellValue("E".($templateStart + 9), (isset($data['item'][0]->VISITORS)  ? $data['head']['LUNCHTIME']: ''));
        $sheet->setCellValue("K".($templateStart + 7),$data['item'][0]->VISITORS);
        $sheet->setCellValue("K".($templateStart + 8),$data['item'][0]->AMEC);
        $sheet->setCellValue("K".($templateStart + 9),($data['item'][0]->VISITORS+$data['item'][0]->AMEC));
        $dietList = array_map(
            function($item) {
                return $item->DIETREQ . ' (' . $item->CNT . ')';
            },
            array_filter($data['dietary'], function($item) {
                return !empty($item->DIETREQ);
            })
        );
        
        $dietText = implode(", ", $dietList);
        $sheet->setCellValue("G".($templateStart + 11),$dietText);
        $sheet->setCellValue("R".($templateStart + 9),($data['item'][0]->CARHOTEL == "Y"? "Yes":"No"));
        $sheet->setCellValue("O".($templateStart + 11),($data['item'][0]->CARHOTELNOTE));

        $templateStart = $templateStart + 16;
        $templateCount = 2;  // Template มี 3 แถว (12–14)
        $templateEnd   = $templateStart + $templateCount - 1;
        $extra = count($data['sproj']) - $templateCount;
        if ($extra > 0) {
            $this->insertEmptyRowsWithTemplate($sheet, $templateStart ,$templateCount ,  $extra );
        }
        $currentRow = $templateStart;
        $total = 0;
        foreach($data['sproj'] as $i => $row)
        {
            $currentRow = $templateStart + $i;          
            $sheet->setCellValue("B{$currentRow}", $row->PROJNO);
            $sheet->setCellValue("G{$currentRow}", $row->PROJNAME);
            $sheet->setCellValue("L{$currentRow}", $row->MODEL);
            $sheet->setCellValue("O{$currentRow}", $row->SPEC);
            $sheet->setCellValue("S{$currentRow}", $row->QTY);
            $sheet->setCellValue("V{$currentRow}", $row->STATUS);   
            $total += $row->QTY;
        }
        if(count($data['sproj']) >= 2)
        {
            $totalRow = $currentRow + 2;
        }else{
            $totalRow = $currentRow + 3;
        }
        
        $sheet->setCellValue("S{$totalRow}",   $total);   
        $templateStart = $currentRow + 5;
        $templateCount = 2;  // Template มี 3 แถว (12–14)
        $templateEnd   = $templateStart + $templateCount - 1;
        $extra = count($data['pproj']) - $templateCount;
        if ($extra > 0) {
            $this->insertEmptyRowsWithTemplate($sheet, $templateStart ,$templateCount ,  $extra );
        }
        $currentRow = $templateStart;
        $total = 0;
        foreach($data['pproj'] as $i => $row)
        {
            $currentRow = $templateStart + $i;          
            $sheet->setCellValue("B{$currentRow}", $row->PROJNO);
            $sheet->setCellValue("G{$currentRow}", $row->PROJNAME);
            $sheet->setCellValue("L{$currentRow}", $row->MODEL);
            $sheet->setCellValue("O{$currentRow}", $row->SPEC);
            $sheet->setCellValue("S{$currentRow}", $row->QTY);
            $sheet->setCellValue("V{$currentRow}", $row->STATUS);   
            $total += $row->QTY;
        }
        if(count($data['pproj']) >= 2)
        {
            $totalRow = $currentRow + 2;
        }else{
            $totalRow = $currentRow + 4;
        }
        $sheet->setCellValue("S{$totalRow}",   $total);   
        $writer = new Xlsx($spreadsheet);
        $filename = $data['head']['REFNO'].'.xlsx';
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

    public function exportexcel()
    {

        $vmscyear2 = $_POST["vmscyear2"]; 
        $vmsnrunno = $_POST["vmsnrunno"];
        $data = $this->getFormData();
        $f = $this->create_save_vmsexcel($data);
        $dFile = array(
            'content'  =>  base64_encode($f['content']),
            'filename' =>  $f['filename'],
        );
        echo json_encode($dFile);
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
        foreach ($sheet->getMergeCells() as $merge) {
            if (preg_match_all('/\d+/', $merge, $matches)) {
                $rows = $matches[0];
                if (in_array($templateEnd, $rows)) {
                    $newMerge = str_replace($templateEnd, $targetRow, $merge);
                    $sheet->mergeCells($newMerge);
                }
            }
        }
    }
}

    public function getEmail()
    {
        $empno = $_POST["empno"];
        $data = $this->vms->customSelect("AMECUSERALL",array("SEMPNO" => $empno), 'SRECMAIL');
        echo json_encode($data);
    }

    public function updateform()
    {
        try
        {
            $status = true;
            $vmscyear2 = $_POST["vmscyear2"];
            $vmsnrunno = $_POST["vmsnrunno"];
            $con = array(
                    'NFRMNO' => $this->nfrmno,
                    'VORGNO' => $this->vorgno,
                    'CYEAR'  => $this->cyear,
                    'CYEAR2' => $vmscyear2,
                    'NRUNNO' => $vmsnrunno
            );
            $data = array(
                    'DAPVDATE' => date('d/m/Y'),
                    'CAPVTIME' => date('H:i:s')
            );
            $r = $this->vms->update("FLOW", $data, $con);
            $data = array(
                    'CST' => '2'
            );
            $r = $this->vms->update("FORM", $data, $con);
        }catch (Exception $e) {
            $status = false;
        } finally {
            $result = [
                'status'  => $status,
                'message' => $status ? 'Update form status successfully' : 'Failed to update form status'
            ];
            echo json_encode($result);
        }
    }

    public function deleteform()
{
    $status = true;
    $message = 'Delete form successfully';

    try {
    
        $vmscyear2 = $_POST["vmscyear2"];
        $vmsnrunno = $_POST["vmsnrunno"];

        $where_cond = array("CYEAR2" => $vmscyear2 , "NRUNNO" => $vmsnrunno);
        $this->vms->delete("VMS_VISIT", $where_cond);
        $this->vms->delete("VMS_VISITINF", $where_cond);
        $this->vms->delete("VMS_SCHEDULE", $where_cond);
        $this->vms->delete("VMS_PROJECT", $where_cond);
        $this->vms->delete("VMS_AMEC_MEAL", $where_cond);
        $this->vms->delete("VMS_ATTFILE", $where_cond);
        $this->vms->delete("VMS_GPENT", array("VMSCYEAR2" => $vmscyear2 , "VMSNRUNNO" => $vmsnrunno));
        $this->vms->delete("VMS_STAKEHOLDERS", $where_cond);

        $path = $this->upload_path.$this->nfrmno."_".$this->vorgno."_".$this->cyear."_".$vmscyear2."_".$vmsnrunno."/";
        
        if (is_dir($path)) {
          
            $files = glob($path . '*', GLOB_MARK);
            foreach ($files as $file) {
                if (is_file($file)) {
                    @unlink($file); 
                }
            }
          
            @rmdir($path);
        }

    } catch (Exception $e) {
        $status = false;
        $message = 'Failed to delete form: ' . $e->getMessage(); // เก็บ Error ไว้ดูได้
    } finally {
        // 4. ส่งค่ากลับเป็น JSON
        $result = [
            'status'  => $status,
            'message' => $status ? 'Delete form successfully' : $message
        ];
        
        // แนะนำให้ใส่ Header เพื่อบอกฝั่ง Frontend ว่าส่งกลับเป็น JSON ชัวร์ๆ
        header('Content-Type: application/json');
        echo json_encode($result);
        exit; // ใส่ exit ป้องกันไม่ให้มีโค้ดอื่นรันต่อแล้วทำ JSON พัง
    }
}


}