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
        if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
            $data = [
                'NFRMNO' => $_GET['no'],
                'VORGNO' => $_GET['orgNo'],
                'CYEAR'  => $_GET['y'],
            ];

        }else{
            $form = $this->frm->getFormMaster('MAR-VMS');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }

        }
        $data['empno'] = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
      
        if(!isset($_GET["runNo"]))
        {
            $data["guesttype"] = $this->vms->get_guest_type();
            $data["purpose"] = $this->vms->get_purpose_visit();
            $data["visittype"] = $this->vms->get_visit_type();
            $data["salecom"] = $this->vms->get_salecompany();
            $data["participants"] = $this->vms->get_participants();
            $this->views('marform/MAR-VMS/create', $data);
        }

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
            if (!empty($_FILES['specificAttachment']['name'][0])) {
                $this->vms->delete("VMS_ATTFILE",array("CYEAR2" => $cyear2 , "NRUNNO" => $nrunno , "TYPENO" =>'S'));
            }
            $upfile =  $this->uploadMultiFile($_FILES, ['specificAttachment'], $path);
            $fid = $this->vms->generate_attfile_id($cyear2,$nrunno);
            $datafile = array();
            foreach ($upfile["files"] as $fileType => $fileArray) {
             foreach ($fileArray as $file) {
                 $datafile[] = array
                 (
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'ITEMNO' => $fid,
                    'TYPENO' => ($fileType == "specificAttachment"? "S":""),
                    'SFILE'  => $fid."_".date("dmYHis"),
                    'UFILE'  => $file['file_name']
                 );
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
                'RECEPTROOM'    => $_POST["receptionRoom"],
                'PURPOSE'       => $_POST["purposevisit"],
                'PURPOSEDETAIL' => $_POST["detail"],
                'VISITTYPE'     => $_POST["visitTypes"],
                'GUESTTYPE'     => $_POST["guestType"],
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

        }
    
    }

}