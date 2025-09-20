<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
//require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/_file.php';
require_once APPPATH.'controllers/api/webform/form.php';

class form extends MY_Controller{
    use formApi, _File;
    protected $client;
    private $nfrmno = "14";
    private $vorgno = "090301";
    private $cyear = "25";  
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'frm');
        $this->load->model('user_model', 'usr');
        $this->load->model('marform/MAR-VMS/vms_model', 'vms');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = "//amecnas/AMECWEB/File/" .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/MAR/VMS/";
        $this->ent_path = "//amecnas/AMECWEB/File/" .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/GP/GPENT/";
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
                $data["costmst"] = $this->vms->customSelect("GPENT_ESTIMATE_TYPE",array('ET_STATUS' => '1') ,'ET_NAME , ET_COST');
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
                $this->vms->delete("VMS_AMEC_MEAL","CYEAR2 = '".$cyear2."' AND NRUNNO = '".$nrunno."'");
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
                $this->vms->delete("VMS_PROJECT","CYEAR2 = '".$cyear2."' AND NRUNNO = '".$nrunno."'");
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
        copy($source, $dest);
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
        if(!empty($rs))
        {
            $head["FORMVER"] = $rs[0]->FORMVER;
            $head["REFNO"] = $rs[0]->REFNO;
            $head["ISSUEDATE"] = $rs[0]->ISSUEDATE;
            $head["ISSUEBY"] = $rs[0]->ISSUEBY;
            $head["VISITDATE"] = $rs[0]->VISITDATE;
            $head["RECEPTROOM"] = $rs[0]->RECEPTROOM;
            $head["VISITOR_COUNT"] = $rs[0]->VISITOR_COUNT;
            $head["PURPOSEVISIT"] = $rs[0]->VTYPE;
            $head["PURPOSEDETAIL"] = $rs[0]->PURPOSEDETAIL;
        }
        $data = array(
            "head" => $head,
            "visitint" => $visitint,
            "schedule" => $schedule,
            "sproj" => $sproj,
            "pproj" => $pproj,
            "item" => $item,
            "dietary" => $dietary
        );
        echo json_encode($data);

    }

    public function getEmail()
    {
        $empno = $_POST["empno"];
        $data = $this->vms->customSelect("AMECUSERALL",array("SEMPNO" => $empno), 'SRECMAIL');
        echo json_encode($data);
    }



}