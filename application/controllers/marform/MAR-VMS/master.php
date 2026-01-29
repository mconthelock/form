<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH . 'controllers/_file.php';
class master extends MY_Controller{
    use _Form, _File;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'frm');
        $this->load->model('user_model', 'usr');
        $this->load->model('marform/MAR-VMS/vms_model', 'vms');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/MAR/VMS/";
    }

    public function main(){
  
    }

    public function master()
    {

       // $data["participants"] = $this->vms->get_participants();
        $this->views('marform/MAR-VMS/master');

    }

    public function get_group_master()
    {

        echo json_encode($this->vms->get_group());
    }

    public function get_detail_email()
    {
        $email = trim($_POST["email"]);
        $con = array('SRECMAIL' => $email);
        echo json_encode($this->vms->get_participants($con));
    }

    public function get_group_email()
    {
        $GID = $_POST["GID"];
        $group = $this->vms->get_group(array('GID' => $GID));
        $sql = "SELECT g.*, u.SNAME, u.SPOSNAME, u.SSEC, u.SDEPT, u.SDIV
        FROM VMS_GROUP_EMAIL g
        LEFT JOIN AMECUSERALL u
               ON g.EMAIL = u.SRECMAIL
        WHERE g.GID = '".$GID."'";
        $participants = $this->vms->getdatasql($sql);
        $data = array(
            "status" => true,
            "data" => array(
                "GID"   => $group[0]->GID,
                "GNAME" => $group[0]->GNAME,
                "GDETAIL" => $group[0]->GDETAIL,
                "participants" => $participants
            )
        );
        echo json_encode($data);
    }



    public function update_status_group()
    {
        $con = array(
            "GID" => $_POST["GID"]
        );
        $data = array(
            "GSTATUS" => $_POST["GSTATUS"]
        );
        try {
                $this->vms->update("VMS_GROUP", $data, $con);
                echo json_encode([
                    "status" => true,
                    "message" => "Update status success"
                ]);
        }catch (Exception $e) {
                echo json_encode([
                    "status" => false,
                    "message" => $e->getMessage()  // ส่งข้อความ error ออกไป
                 ]);
        } 

    }

    public function save_group()
    {
        try {
                $GID = isset($_POST["GID"]) ? $_POST['GID'] : '';
                if($GID == "")
                {
                    $GID = $this->vms->generate_id("VMS_GROUP", "GID");
                    $data = array(
                        'GID' => $GID,
                        'GNAME' => $_POST["groupName"],
                        'GDETAIL' => $_POST["groupDetail"],
                        'GSTATUS' => '1'
                    );
                    $status  = $this->vms->insert("VMS_GROUP",$data);
                }else
                {
                    $con = array(
                        'GID' => $GID
                    );
                    $data = array(
                        'GNAME' => $_POST["groupName"],
                        'GDETAIL' => $_POST["groupDetail"]
                    );
                    $status = $this->vms->update("VMS_GROUP", $data,  $con);
                }
                $sempo = $_POST["pst"];
                $datap = array();
                foreach($sempo as $s)
                {
                    if(trim($s) != "")
                    {
                        $datap[] = array(
                            'GID' =>  $GID,
                            'EMAIL' => $s
                        ); 

                    }
                }
                if(count($datap) > 0)
                {
                    $this->vms->delete("VMS_GROUP_EMAIL", array('GID' => $GID));
                    $this->vms->insert_batch("VMS_GROUP_EMAIL",  $datap);
                }
                echo json_encode([
                    "status" => true,
                    "message" => "Save Data success"
                ]);
        }catch (Exception $e) {
                echo json_encode([
                    "status" => false,
                    "message" => $e->getMessage()  // ส่งข้อความ error ออกไป
                ]);
        } 

    }
    
   



}