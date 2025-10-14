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
require_once APPPATH.'controllers/_excel.php';
class report extends MY_Controller{
    use formApi, _File, _excel;
    protected $client;
    private $nfrmno = "14";
    private $vorgno = "090301";
    private $cyear = "25";  
    function __construct(){
		parent::__construct();
        $this->load->model('form_model', 'frm');
        $this->load->model('user_model', 'usr');
        $this->load->model('marform/MAR-VMS/vms_model', 'vms');
        $this->load->library('Mail');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = "//amecnas/AMECWEB/File/" .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/MAR/VMS/";
        $this->ent_path = "//amecnas/AMECWEB/File/" .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/GP/GPENT/";
    }

    public function main(){
            $data = array();
            $this->views('marform/MAR-VMS/report', $data);
        }
    public function get_report_vms()
        {
            $datemode = $_POST["datemode"];
            $reporttype = $_POST["reporttype"];
            $startdate = $_POST["startdate"];
            $enddate = $_POST["enddate"];
            if($reporttype == "VR"){
                echo json_encode($this->vms->get_visitor_raw_data_report($datemode , $startdate , $enddate));   
            }else if($reporttype == "VO")
            {
                echo json_encode($this->vms->get_visitor_overview_report($datemode , $startdate , $enddate));   
            }else if($reporttype == "VF")
            {
                echo json_encode($this->vms->get_visitor_Frequency_report($datemode , $startdate , $enddate));   
            }else if($reporttype == "WE")
            {
                echo json_encode($this->vms->get_activity_duration_report($datemode , $startdate , $enddate));   
            }else if($reporttype == "CE")
            {
                echo json_encode($this->vms->get_gpent_report($datemode , $startdate , $enddate)); 
            }
        }
        
    }







?>