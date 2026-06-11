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
require_once APPPATH . 'controllers/_file.php';
class form extends MY_Controller{
    use formApi, flow, formmst;
    protected $title;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
        
        
        $this->load->model('form_model', 'frm');
        $this->load->model('user_model', 'usr');
        $this->load->model('feform/FE-EIA/eia_model', 'MainModel');
        $this->mimsBase = 'MIMS';
    }
    // http://localhost:8080/form/isform/IS-TID/form/main/?no=17&orgNo=050601&y=16&empno=13204&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/is/create.asp
    // http://localhost:8080/form/feform/FE-EIA/form/main?no=11&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
    public function main(){
        
        /*
         * 1) ดึง form key จาก URL ก่อน
         * URL ตัวอย่าง create:
         * /main?no=11&orgNo=051001&y=26&empno=13204
         *
         * URL ตัวอย่าง show:
         * /main?no=11&orgNo=051001&y=26&y2=2026&runNo=1&empno=13204
         */
        if (
            isset($_GET['no']) && $_GET['no'] !== '' &&
            isset($_GET['orgNo']) && $_GET['orgNo'] !== '' &&
            isset($_GET['y']) && $_GET['y'] !== ''
        ) {
            $data['NFRMNO'] = $_GET['no'];
            $data['VORGNO'] = $_GET['orgNo'];
            $data['CYEAR']  = $_GET['y'];
        } else {
            $form = $this->getFormMasterByVaname('FE-EIA');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }
        }


        // $data['MODE'] = $_GET['m']; //create mode default
        // $data['CEXTDATA'] = "";
        $empno = isset($_GET["empno"]) ? $_GET['empno'] : '' ;
        // $data['apv'] = $empno;
        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {
            $data['CYEAR2'] = $_GET['y2'];
            $data['NRUNNO'] = $_GET['runNo'];
            $data['EMPNO']    = (string)$empno;
            $form = [
                'NFRMNO' => (int)$data['NFRMNO'],
                'VORGNO' => (string)$data['VORGNO'],
                'CYEAR'  => (string)$data['CYEAR'],
                'CYEAR2' => (string)$data['CYEAR2'],
                'NRUNNO' => (int)$data['NRUNNO'],
            ];

            // $data['CEXTDATA'] = $this->getExtData($form);
            // $data['MODE']     = $this->getMode($form);
            $eiaform    = $this->frm->getForm((int)$data['NFRMNO'],  (string)$data['VORGNO'], (string)$data['CYEAR'],  (string)$data['CYEAR2'],  (int)$data['NRUNNO']);
            $data["REQBY"] = $eiaform[0]->VREQNO;
            $data["INPUTBY"] = $eiaform[0]->VINPUTER; 
            $data["REMARK"] = "";



            // == get WPS_MIMS_EIAFORM   find MIMS_YEAR,MIMS_MONTH where form runNo,cyear2 match

                $db_mims = $this->load->database('MIMS', TRUE);
                $query = $db_mims->get_where('WPS_MIMS_EIAFORM', $form );
                $data['mimsForm'] = $query->row();

                if (!empty($data['mimsForm'])) {
                    $data['MIMS_MONTH'] = $data['mimsForm']->MIMS_MONTH;
                    $data['MIMS_YEAR']  = $data['mimsForm']->MIMS_YEAR;
                    $data['DOC_NO']     = $data['mimsForm']->DOC_NO;
                }
            

            $this->views('feform/FE-EIA/form', $data);
        }
        else{
            
            $data['mode'] = 3; //view mode default
            $this->views('feform/FE-EIA/form', $data);
        }
    }


    public function GetStockCost()
    {
        
        $YEAR = $this->input->post('YEAR');
        $MONTH = $this->input->post('MONTH');
        $w="";

        
        if($MONTH != "")
        {
            $w .= " AND  COST_MONTH = '" . $MONTH . "' ";
        }
        if ($YEAR != "" ) {
            $w .= " AND  COST_YEAR = '" . $YEAR . "' ";
        }

        $sql="SELECT * FROM WPS_MIMS_REPORT_STOCKCOST WHERE 1=1  " .$w;
        $dataOnhand = $this->MainModel->QuerySetBase($sql, $this->mimsBase)->result();

        $sql = "select *  from WPS_MIMS_REPORT_STOCKCOST_RECEIVE where 1=1 " .$w;
        $dataReceive = $this->MainModel->QuerySetBase($sql, $this->mimsBase)->result();

        $sql = "select *  from WPS_MIMS_REPORT_STOCKCOST_ISSUE where 1=1 " .$w;
        $dataIssue = $this->MainModel->QuerySetBase($sql, $this->mimsBase)->result();
        
        $output = array(
            "dataOnhand" =>  $dataOnhand,
            "dataReceive" => $dataReceive,
            "dataIssue" => $dataIssue,
        );
        
        echo json_encode ($output); 
    }


    // http://localhost:8080/form/feform/FE-EIA/form/AutoCreateFEMSC/?MIMS_YEAR=2026&MIMS_MONTH=01
    public function AutoCreateFEMSC()
    {
        try {
            // ดึงค่าจาก Query String พร้อมใส่ค่า Default ด้วยเครื่องหมาย ?? 
            $MIMS_YEAR  = $this->input->get('MIMS_YEAR') ?? date('Y');
            $MIMS_MONTH = $this->input->get('MIMS_MONTH') ?? date('m');

            $sql = "SELECT * FROM WPS_MIMS_EIAFORM_USERCREATE WHERE 1=1";
            $REQBY = $this->MainModel->QuerySetBase($sql, $this->mimsBase)->result();
            
            $form = $this->getFormMasterByVaname('FE-EIA');
            
            if (!empty($form) && (isset($form['status']) && $form['status'] === 'true')) {
                
                $formData = $form['data']; 
                
                // สกัดรหัสพนักงาน ดักจับสำรองถ้าหาก Query ว่างเปล่า
                $empNo = (!empty($REQBY) && isset($REQBY[0]->REQBY)) ? $REQBY[0]->REQBY : '13204';

                $data = [
                    'NFRMNO'  => $formData['NNO'],     
                    'VORGNO'  => $formData['VORGNO'],   
                    'CYEAR'   => $formData['CYEAR'],    
                    'REQBY'   => $empNo,                
                    'INPUTBY' => $empNo,
                    'REMARK'  => '',
                    'DRAFT'   => '0', // ส่งค่าสร้างโพลว์ทันที
                ];

                // 1. เรียกใช้งานฟังก์ชันสร้างฟอร์มหลักของระบบ Webflow
                $rsf = $this->createForm($data);
                
                if ($rsf['status']) {
                    // ดึงค่า CYEAR2 และ NRUNNO ที่ระบบสร้างให้มาผูกเพิ่มเข้าก้อนข้อมูล $data
                    $data["CYEAR2"]  = $rsf["data"]["CYEAR2"];
                    $data["NRUNNO"]  = $rsf["data"]["NRUNNO"];

                    // 2. ประกอบฟอร์แมตเลขเอกสาร (e.g., FE-EIA-26-000004)
                    $docNo = "FE-EIA-" . $data["CYEAR2"] . "-" . str_pad($data["NRUNNO"], 6, "0", STR_PAD_LEFT);

                    // 3. จัดเตรียมชุดข้อมูลให้ตรงกับโครงสร้างตาราง Oracle (WPS_MIMS_EIAFORM)
                    $mscFormData = array(
                        'NFRMNO'      => $data["NFRMNO"],
                        'VORGNO'      => $data["VORGNO"],
                        'CYEAR'       => $data["CYEAR"],
                        'CYEAR2'      => $data["CYEAR2"],
                        'NRUNNO'      => $data["NRUNNO"],
                        'DOC_NO'      => $docNo,
                        'VIEW_TYPE'   => '1',
                        'MIMS_YEAR'   => $MIMS_YEAR,  
                        'MIMS_MONTH'  => $MIMS_MONTH, 
                        'WORK_CON'    => 'Auto generated report',
                        'REASON'      => '', 
                        'EMPNO'       => $empNo, 
                        'STATUS'      => '1'
                    );

                    // 4. บันทึกลงฐานข้อมูลย่อยกลุ่ม MIMS
                    $db_mims = $this->load->database('MIMS', TRUE);
                    $db_mims->insert('WPS_MIMS_EIAFORM', $mscFormData);

                    // สั่งคืนค่าแจ้งสถานะ JSON ออกบนหน้าเว็บเพื่อความสะดวกในการตรวจสอบ
                    return $this->output
                                ->set_content_type('application/json')
                                ->set_output(json_encode(array(
                                    'status' => true,
                                    'message' => 'Created successfully',
                                    'doc_no' => $docNo,
                                    'data' => $mscFormData
                                )));

                } else {
                    return $this->output
                                ->set_content_type('application/json')
                                ->set_output(json_encode(array(
                                    'status' => false,
                                    'message' => 'Failed to create main Webflow form'
                                )));
                }
            }

        } catch (Exception $error) {
            return $this->output
                        ->set_content_type('application/json')
                        ->set_output(json_encode(array(
                            'status' => false,
                            'message' => 'Error: ' . $error->getMessage()
                        )));
        }
    }

}