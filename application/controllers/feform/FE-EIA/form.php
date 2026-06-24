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
        
        $this->load->library('Mail');
        $this->load->library('pdf');
        
        $this->load->model('form_model', 'frm');
        $this->load->model('feform/FE-EIA/eia_model', 'MainModel');
        
        $this->mimsBase = 'MIMS';
        $this->webflowBase = "DEFAULT";
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/FE/FE_EIA/";
        $this->host = $_SERVER['HTTP_HOST']; // เช่น localhost, amecwebtest, amecweb
        
    }
    //https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-EIA/form/main?no=11&orgNo=051001&y=26&y2=2026&runNo=1&m=3&empno=13204&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1
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
            // $form = [
            //     'NFRMNO' => (int)$data['NFRMNO'],
            //     'VORGNO' => (string)$data['VORGNO'],
            //     'CYEAR'  => (string)$data['CYEAR'],
            //     'CYEAR2' => (string)$data['CYEAR2'],
            //     'NRUNNO' => (int)$data['NRUNNO'],
            // ];

            // $data['CEXTDATA'] = $this->getExtData($form);
            // $data['MODE']     = $this->getMode($form);
            $eiaform    = $this->frm->getForm((int)$data['NFRMNO'],  (string)$data['VORGNO'], (string)$data['CYEAR'],  (string)$data['CYEAR2'],  (int)$data['NRUNNO']);
            $data["REQBY"] = $eiaform[0]->VREQNO;
            $data["INPUTBY"] = $eiaform[0]->VINPUTER; 
            $data['CST']     = $eiaform[0]->CST;
            $data["REMARK"] = "";



            // == get WPS_MIMS_EIAFORM   find COST_YEAR,COST_MONTH where form runNo,cyear2 match
                $sql = "SELECT * FROM WPS_MIMS_EIAFORM 
                    WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ?";
                    $bindData = [
                        (int)$data['NFRMNO'],
                        (string)$data['VORGNO'],
                        (string)$data['CYEAR'],
                        (string)$data['CYEAR2'],
                        (int)$data['NRUNNO']
                    ];
                $data['mimsForm'] = $this->MainModel->QuerySetBase($sql, $this->mimsBase, $bindData)->result();
                if (!empty($data['mimsForm'])) {
                    // 🟢 แบบนี้ใช้ -> ได้ตามที่เขียนไว้เดิม
                    $data['COST_MONTH'] = $data['mimsForm'][0]->COST_MONTH;
                    $data['COST_YEAR']  = $data['mimsForm'][0]->COST_YEAR;
                    $data['DOC_NO']     = $data['mimsForm'][0]->DOC_NO;
                }
            

            $this->views('feform/FE-EIA/form', $data);
        }
        else{
            
            $data['mode'] = 3; //view mode default
            $this->views('feform/FE-EIA/form', $data);
        }
    }


    //==============================================================================================================
    //=== 202605
    //=== Auto Create form WebFlow  Maintenance Stock Cost Report
    //=== Case Monthy Report /1/2025/01/
    //== Case Yearly Report /1/2026/all/
    // http://localhost:8080/form/feform/FE-EIA/form/AutoCreateFEEIAForm/?COST_YEAR=2026&COST_MONTH=01
    // http://localhost:8080/form/feform/FE-EIA/form/AutoCreateFEEIAForm/?COST_YEAR=2026&COST_MONTH=ALL
    // http://localhost:8080/form/feform/FE-EIA/form/AutoCreateFEEIAForm/
    // https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-EIA/form/AutoCreateFEEIAForm/?COST_YEAR=2026&COST_MONTH=ALL
    // https://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-EIA/form/AutoCreateFEEIAForm/
    //==============================================================================================================
    public function AutoCreateFEEIAForm()
    {
        try {
            $currentYear = (int)date('Y');
            $currentMonth = (int)date('m');

            // คำนวณปีงบประมาณ: 
            // ถ้าเดือน >= 4 ให้เป็นปีปัจจุบัน, ถ้า < 4 ให้เป็นปีปัจจุบัน - 1
            $fiscalYear = ((int)$currentMonth >= 4) ? $currentYear : ($currentYear - 1);

            // รับค่าจาก input หรือใช้ค่าปีงบประมาณที่คำนวณไว้
            $COST_YEAR = $this->input->get('COST_YEAR') ?? (string)$fiscalYear;
            $COST_MONTH = $this->input->get('COST_MONTH') ?? "ALL";
            if( $COST_MONTH == "ALL" && (int)$currentYear == (int)$COST_YEAR)
            {
                $COST_MONTH =  str_pad($currentMonth, 2, '0', STR_PAD_LEFT);
            }
            else if($COST_MONTH == "ALL"  && (int)$currentYear > (int)$COST_YEAR){
                $COST_MONTH = '03';
            }
            
            $sql = "SELECT * FROM WPS_MIMS_EIAFORM_USERCREATE WHERE 1=1 and GROUPTYPE = 'REQ' ";
            $REQBY = $this->MainModel->QuerySetBase($sql, $this->mimsBase)->result();
            
            $form = $this->getFormMasterByVaname('FE-EIA');
            
            if (!empty($form) && (isset($form['status']) && $form['status'] === 'true')) {
                
                $formData = $form['data']; 
                
                $empNo = (!empty($REQBY) && isset($REQBY[0]->USERID)) ? $REQBY[0]->USERID : '13204';

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
                        'COST_YEAR'   => $COST_YEAR,  
                        'COST_MONTH'  => $COST_MONTH, 
                        'WORK_CON'    => 'Auto generated report',
                        'REASON'      => '', 
                        'EMPNO'       => $empNo, 
                        'STATUS'      => '1'
                    );

                    // 4. บันทึกลงฐานข้อมูลย่อยกลุ่ม MIMS
                    $db_mims = $this->load->database('MIMS', TRUE);
                    $db_mims->insert('WPS_MIMS_EIAFORM', $mscFormData);

                    

                } else {
                    return $this->output
                                ->set_content_type('application/json')
                                ->set_output(json_encode(array(
                                    'status' => false,
                                    'message' => 'Failed to create main Webflow form'
                                )));
                }

                // == Email Notification (Optional)
                // 1. แก้ไข Syntax วันที่
                $SUBJECT = "MIMS : Auto Create (FE-EIA FORM)_" . $COST_YEAR . "/" . $COST_MONTH ;
                $TO = "";
                $CC = "";

                $sql = "SELECT  LISTAGG(SRECMAIL, ',') WITHIN GROUP (ORDER BY SEMPNO) AS ALL_EMAILS FROM WPS_MIMS_EIAFORM_USERCREATE_VIEW WHERE  GROUPTYPE = 'REQ' ";
                $emailResult = $this->MainModel->QuerySetBase($sql, $this->mimsBase)->row();
                $CC_MAIL= ($emailResult) ? trim($emailResult->ALL_EMAILS) : "";

                if (strpos($this->host, 'test') !== false || strpos($this->host, 'localhost') !== false) {
                    // กรณี Test Server
                    $TO = $CC_MAIL;
                    $TO = str_ireplace("kanittha", "siripapa", $TO);
                    $CC = "siripapa@mitsubishielevatorasia.co.th,";
                    // var_dump($this->host . $TO);
                    // exit;
                } else {
                    $TO = $CC_MAIL;
                    $CC = "siripapa@mitsubishielevatorasia.co.th";
                }
                //kanittha@MitsubishiElevatorAsia.co.th
                

                $BODY = ["
                    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                        <div style='background-color: #0056b3; color: white; padding: 20px; text-align: center;'>
                            <h2 style='margin: 0;'>MIMS Create FE-EIA FORM</h2>
                        </div>
                        <div style='padding: 20px;'>
                            <p>Dear All,</p>
                            <p>This is an automated notification: Form for <strong>FE-EIA</strong> has been created.</p>
                            
                            <p>You can view the form at: 
                            <a href='http://webflow/form' target='_blank'>http://webflow/form</a> 
                            (Menu: <strong>Under Preparation</strong>)
                            </p>
                            
                            <table style='width: 100%; margin: 20px 0; border-collapse: collapse;'>
                                <tr>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; color: #777;'><strong>Report Period:</strong></td>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee;'>{$COST_YEAR}/" . $COST_MONTH . "</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; color: #777;'><strong>Run Time:</strong></td>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee;'>" . date('Y-m-d H:i:s') . "</td>
                                </tr>
                            </table>
                            
                            <p style='font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;'>
                                * This is an automated email. Please do not reply directly to this message.
                            </p>
                        </div>
                        <div style='background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 11px; color: #777;'>
                            Mitsubishi Elevator Asia Co., Ltd.
                        </div>
                    </div>"];
                // $BODY = "test";
                if($TO != "")
                {

                    $dataM = [
                        // 'VIEW' =>'layouts/mail/mailAlert',
                        'SUBJECT' => $SUBJECT,
                        'TO'      => $TO,
                        'CC'      => $CC,
                        'BODY'    => $BODY
                    ];
                    // $dataM['ENFILE']  = array(['filename' => 'file.xlsx', 'content' => ob_get_contents]);
                    // ส่งเมล์ (ถ้าต้องส่งหาผู้อนุมัติหลายคน ให้วน Loop ตรงนี้)
                    $this->mail->sendmail($dataM);

                }

                // exit;
                // สั่งคืนค่าแจ้งสถานะ JSON ออกบนหน้าเว็บเพื่อความสะดวกในการตรวจสอบ
                    return $this->output
                                ->set_content_type('application/json')
                                ->set_output(json_encode(array(
                                    'status' => true,
                                    'message' => 'Created successfully',
                                    'doc_no' => $docNo,
                                    'data' => $mscFormData
                                )));

                
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

    public function GetStockCostReal()
    {
        
        $YEAR = $this->input->post('YEAR');
        $MONTH = $this->input->post('MONTH');
        $w="";

        
        // if($MONTH != "ALL")
        // {
        //     $w .= " AND  COST_MONTH = '" . $MONTH . "' ";
        // }
        if ($YEAR != "" ) {
            $w .= " AND  COST_YEAR = '" . $YEAR . "' ";
        }

        if((int)$MONTH <= (int)"03")
        {
            $w .= " AND (( COST_MONTH >= '04' and COST_MONTH <= '12') or ( COST_MONTH >= '01' and COST_MONTH <= '".$MONTH."')) ";
        }
        else if((int)$MONTH > (int)"03")
        {
            $w .= " AND ( COST_MONTH >= '04' and COST_MONTH <= '".$MONTH."')  ";
            
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

    public function GetFEEIADetail()
    {
        
        $NFRMNO = $this->input->post('NFRMNO');
        $VORGNO = $this->input->post('VORGNO');
        $CYEAR = $this->input->post('CYEAR');
        $CYEAR2 = $this->input->post('CYEAR2');
        $NRUNNO = $this->input->post('NRUNNO');
        $YEAR = $this->input->post('YEAR');
        $MONTH = $this->input->post('MONTH');
        $w="";

        $w = " AND NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ? ";
        $params = [(int)$NFRMNO, (string)$VORGNO, (string)$CYEAR, (string)$CYEAR2, (int)$NRUNNO];

        // if ($MONTH != "") {
        //     $w .= " AND COST_MONTH = ? ";
        //     $params[] = (int)$MONTH;
        // }
        // if ($YEAR != "") {
        //     $w .= " AND COST_YEAR = ? ";
        //     $params[] = (int)$YEAR;
        // }

        $sql = "SELECT 
                    *
                FROM WPS_MIMS_EIAFORMDETAIL 
                WHERE 1=1 " . $w;

        $dataOnhand = $this->MainModel->QuerySetBase($sql, $this->mimsBase, $params)->result();
        
        $output = array(
            "dataOnhand" =>  $dataOnhand,
            "dataReceive" => [],
            "dataIssue" => [],
        );
        
        echo json_encode ($output); 
    }

    public function AddFEEIADetail()
    {
        try {
            $NFRMNO = (int)$this->input->post('NFRMNO');
            $VORGNO = (string)$this->input->post('VORGNO');
            $CYEAR  = (string)$this->input->post('CYEAR');
            $CYEAR2 = (string)$this->input->post('CYEAR2');
            $NRUNNO = (int)$this->input->post('NRUNNO');

            $formKeys = [
                'NFRMNO' => $NFRMNO,
                'VORGNO' => $VORGNO,
                'CYEAR'  => $CYEAR,
                'CYEAR2' => $CYEAR2,
                'NRUNNO' => $NRUNNO
            ];

            // -------------------------------------------------------------------------
            // ส่วนที่ 1: บันทึกข้อมูลตาราง EIA Detail ลง Oracle MIMS (ตรรกะเดิมที่นิ่งแล้ว)
            // -------------------------------------------------------------------------
            // $db_mims->delete('WPS_MIMS_EIAFORMDETAIL', $formKeys);
            if($NRUNNO != "")
            {
                $this->MainModel->deleteData($this->mimsBase,'WPS_MIMS_EIAFORMDETAIL', $formKeys);

                    
                $dataOnhandRaw = $this->input->post('DATAONHAND');
                $dataOnhandArray = is_string($dataOnhandRaw) ? json_decode($dataOnhandRaw, true) : $dataOnhandRaw;

                // var_dump($formKeys );
                // var_dump($dataOnhandArray );
                // exit;
                $db_mims = $this->load->database('MIMS', TRUE);
                if (!empty($dataOnhandArray) && is_array($dataOnhandArray)) {
                    foreach ($dataOnhandArray as $row) {
                        $detailData = array_merge($formKeys, [
                            'COSTMONTH'        => (string)($row['COSTMONTH'] ?? ''),
                            'COST_MONTH'        => (string)($row['COST_MONTH'] ?? ''),
                            'COST_YEAR'         => (string)($row['COST_YEAR'] ?? ''),
                            'OPENINGBALANCE'    => (float)($row['OPENINGBALANCE'] ?? 0),
                            'RECEIVED_AMOUNT'   => (float)($row['RECEIVED_AMOUNT'] ?? 0),
                            'ISSUE_AMOUNT'      => (float)($row['ISSUE_AMOUNT'] ?? 0),
                            'TOTAL_COST_ONHAND' => (float)($row['TOTAL_COST_ONHAND'] ?? 0),
                            'DIFF'              => (float)($row['DIFF'] ?? 0),
                            'TOTAL_PCB_AMOUNT' => (float)($row['TOTAL_PCB_AMOUNT'] ?? 0),
                            'TOTAL_PART_AMOUNT' => (float)($row['TOTAL_PART_AMOUNT'] ?? 0),
                        ]);
                        $db_mims->insert('WPS_MIMS_EIAFORMDETAIL', $detailData);
                    }

                    // update FORM.CST = 1
                    $sql = "UPDATE FORM SET CST = 1 where CST=0 AND NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ? ";
                    $params = [(int)$NFRMNO, (string)$VORGNO, (string)$CYEAR, (string)$CYEAR2, (int)$NRUNNO];
                    $CSTData = $this->MainModel->QuerySetBase($sql, $this->webflowBase, $params);
                }
                
                return $this->output
                        ->set_content_type('application/json')
                        ->set_output(json_encode(['status' => true, 'message' => 'บันทึกข้อมูล EIA Detail สำเร็จ']));
            }
            else {
                    
                return $this->output
                        ->set_content_type('application/json')
                        ->set_output(json_encode(['status' => true, 'message' => 'NRUNNO is null']));
            }
            
        } catch (\Exception $e) {
            return $this->output
                        ->set_content_type('application/json')
                        ->set_output(json_encode(['status' => false, 'message' => 'Error: ' . $e->getMessage()]));
        }
    }

   
    public function DeleteFEEIAForm()
    {
        try {
            $form = [
                'NFRMNO' => (int)$this->input->post('NFRMNO'),
                'VORGNO' => (string)$this->input->post('VORGNO'),
                'CYEAR'  => (string)$this->input->post('CYEAR'),
                'CYEAR2' => (string)$this->input->post('CYEAR2'),
                'NRUNNO' => (int)$this->input->post('NRUNNO'),
            ];
            $sql = "DELETE FROM WPS_MIMS_EIAFORM WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ?";
            $this->MainModel->QuerySetBase($sql, $this->mimsBase, [
                $form['NFRMNO'],
                $form['VORGNO'],
                $form['CYEAR'],
                $form['CYEAR2'],
                $form['NRUNNO']
            ]);

            
            $sql = "DELETE FROM WPS_MIMS_EIAFORMDETAIL WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ?";
            $this->MainModel->QuerySetBase($sql, $this->mimsBase, [
                $form['NFRMNO'],
                $form['VORGNO'],
                $form['CYEAR'],
                $form['CYEAR2'],
                $form['NRUNNO']
            ]);


             // 3. สั่งคืนค่าแจ้งสถานะ JSON ออกบนหน้าเว็บเพื่อความสะดวกในการตรวจสอบ
             return $this->output
                        ->set_content_type('application/json')
                        ->set_output(json_encode(array(
                            'status' => true,
                            'message' => 'Deleted successfully'
                        )));
        } catch (\Exception $e) {
            // Handle the exception
        }
    }

    //--send mail email
    public function EndpProcess() 
    { 
        try {
            $NFRMNO    = (int)$this->input->post('NFRMNO');
            $VORGNO    = (string)$this->input->post('VORGNO');
            $CYEAR     = (string)$this->input->post('CYEAR');
            $CYEAR2    = (string)$this->input->post('CYEAR2');
            $NRUNNO    = (int)$this->input->post('NRUNNO');
            $COST_YEAR = $this->input->post('COST_YEAR');
            $COST_MONTH = $this->input->post('COST_MONTH');

            if (empty($NRUNNO) ) {
                throw new \Exception("ข้อมูลฟอร์มไม่ครบถ้วน");
            }
            
            // 1. แก้ไข Syntax วันที่
            $SUBJECT = "MIMS : Maintenance Stock Cost Report (FE-EIA)_" . $COST_YEAR . "/" . $COST_MONTH;
            $TO = "";
            $CC = "";

            $sql = "SELECT  LISTAGG(SRECMAIL, ',') WITHIN GROUP (ORDER BY SEMPNO) AS ALL_EMAILS FROM WPS_MIMS_EIAFORM_USERCREATE_VIEW WHERE  GROUPTYPE = 'EIA_CC' ";
            $emailResult = $this->MainModel->QuerySetBase($sql, $this->mimsBase)->row();
            $CC_MAIL= ($emailResult) ? trim($emailResult->ALL_EMAILS) : "";

            if (strpos($this->host, 'test') !== false || strpos($this->host, 'localhost') !== false) {
                // กรณี Test Server

                $TO = "siripapa@mitsubishielevatorasia.co.th";
                $CC = "siripapa@mitsubishielevatorasia.co.th," . $CC_MAIL;
                $CC = str_ireplace("kanittha", "siripapa", $CC);
                // var_dump($this->host . $TO);
                // exit;
            } else {
                
                // กรณี Production (ตัวจริง)
                // 2. ดึงข้อมูล FLOW (ต้องใช้ result() เพื่อรองรับหลายแถว)
                $sql = "SELECT LISTAGG(SRECMAIL, ',') WITHIN GROUP (ORDER BY SEMPNO) AS ALL_EMAILS FROM FLOW 
                        LEFT JOIN AMECUSERALL ON  VAPVNO = SEMPNO
                        WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ?";
                $bindParams = [ $NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO ];
                
                $flowList = $this->MainModel->QuerySetBase($sql, $this->webflowBase, $bindParams)->result();


                // 3. เตรียมส่งเมล์
                if (!empty($flowList) && isset($flowList[0]->ALL_EMAILS)) {
                    $TO = $flowList[0]->ALL_EMAILS;
                    $CC = "siripapa@mitsubishielevatorasia.co.th," . $CC_MAIL;
                } else {
                    // กรณีไม่พบ Flow อาจจะ log หรือแจ้งเตือน
                    log_message('error', "EndpProcess: ไม่พบอีเมลในตาราง FLOW");
                }
            }

            $BODY = ["
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #0056b3; color: white; padding: 20px; text-align: center;'>
                        <h2 style='margin: 0;'>MIMS : Maintenance Stock Cost Report</h2>
                    </div>
                    <div style='padding: 20px;'>
                        <p>Dear All,</p>
                        <p>This is an automated notification regarding the stock cost report for <strong>FE-EIA</strong>.</p>
                        
                        <table style='width: 100%; margin: 20px 0; border-collapse: collapse;'>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; color: #777;'><strong>Report Period:</strong></td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee;'>{$COST_YEAR}/" . $COST_MONTH . "</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; color: #777;'><strong>Run Time:</strong></td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee;'>" . date('Y-m-d H:i:s') . "</td>
                            </tr>
                        </table>

                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='http://amecwebtest.mitsubishielevatorasia.co.th/form/feform/FE-EIA/form/main?no={$NFRMNO}&orgNo={$VORGNO}&y={$CYEAR}&y2={$CYEAR2}&runNo={$NRUNNO}&m=3' 
                            style='background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                            View Report Detail
                            </a>
                        </div>
                        
                        <p style='font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;'>
                            * This is an automated email from the Maintenance System. Please do not reply directly to this message.
                        </p>
                    </div>
                    <div style='background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 11px; color: #777;'>
                        Mitsubishi Elevator Asia Co., Ltd.
                    </div>
                </div>"];
            // $BODY = "test";
            if($TO != "")
            {

                $dataM = [
                    // 'VIEW' =>'layouts/mail/mailAlert',
                    'SUBJECT' => $SUBJECT,
                    'TO'      => $TO,
                    'CC'      => $CC,
                    'BODY'    => $BODY
                ];
                // $dataM['ENFILE']  = array(['filename' => 'file.xlsx', 'content' => ob_get_contents]);
                // ส่งเมล์ (ถ้าต้องส่งหาผู้อนุมัติหลายคน ให้วน Loop ตรงนี้)
                $this->mail->sendmail($dataM);

            }
            return $this->output
                        ->set_content_type('application/json')
                        ->set_output(json_encode(['status' => true, 'message' => 'บันทึกข้อมูลและส่งอีเมลเรียบร้อยแล้ว']));

        } catch (\Exception $e) {
            return $this->output
                        ->set_content_type('application/json')
                        ->set_output(json_encode(['status' => false, 'message' => 'Error: ' . $e->getMessage()]));
        }
    }

    //========================================================
    //== Export PDF
    //========================================================
        public function exportPdf()
        {
            $data = [
                'NFRMNO' => (int)$this->input->get('no'),
                'VORGNO' => (string)$this->input->get('orgNo'),
                'CYEAR'  => (string)$this->input->get('y'),
                'CYEAR2' => (string)$this->input->get('y2'),
                'NRUNNO' => (int)$this->input->get('runNo'),
            ];
            try {
                // 1. รับค่าพารามิเตอร์คีย์หลักของฟอร์มจากลิงก์ URL
                $sql = "SELECT * FROM WPS_MIMS_EIAFORM 
                    WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ?";
                    $bindData = [
                        (int)$data['NFRMNO'],
                        (string)$data['VORGNO'],
                        (string)$data['CYEAR'],
                        (string)$data['CYEAR2'],
                        (int)$data['NRUNNO']
                    ];
                $mimsForm = $this->MainModel->QuerySetBase($sql, $this->mimsBase, $bindData)->row();

                // $sql ="select * from WPS_MIMS_EIAFORM where NFRMNO =";
                // $mimsForm = 
                if (empty($mimsForm)) {
                    show_error('ไม่พบข้อมูลเอกสารที่ต้องการพิมพ์', 404);
                }

                // Query ข้อมูลผู้อนุมัติ (ส่วนที่จะเอาไปแสดงในกรอบแดง)
                $sqlApprove = "SELECT APPROVER_NAME, POSITION_NAME, 
                TO_CHAR(APPROVE_DATE, 'DD/MM/YYYY') || ' ' || APPROVE_TIME AS APPROVE_DATE ,CEXTDATA
                FROM WPS_MIMS_APPROVAL_LOG_VIEW 
                WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ?
                ORDER BY CEXTDATA ASC";
                $approvalList = $this->MainModel->QuerySetBase($sqlApprove, $this->mimsBase, $bindData)->result();
                
                $sql = "SELECT * FROM WPS_MIMS_EIAFORMDETAIL 
                    WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ? order by COST_YEAR,COST_MONTH asc";
                    $bindData = [
                        (int)$data['NFRMNO'],
                        (string)$data['VORGNO'],
                        (string)$data['CYEAR'],
                        (string)$data['CYEAR2'],
                        (int)$data['NRUNNO']
                    ];
                $EIAFORMDETAIL = $this->MainModel->QuerySetBase($sql, $this->mimsBase, $bindData)->result();

                $reportRows = [];
                $dataReceiveHist = [];
                $totalReceived = 0;
                $totalIssued = 0;
                $totalDiff = 0;
                $costyear =$mimsForm->COST_YEAR;
                $createform = substr($mimsForm->CREATE_DATE,0,7);
                
                $LAST_MONTH = $mimsForm->COST_YEAR . "-" . $mimsForm->CREATE_DATE;
                if (empty($EIAFORMDETAIL)) {   //-- real
                    // // 3. ดึงกลุ่มข้อมูลตัวเลขรายงานจากฐานข้อมูล (ลอจิกคิวรีชุดเดียวกับ GetStockCost)
                    // // echo "New";
                    // // exit;
                    // $w = "";
                    // if (!empty($mimsForm->COST_MONTH) && $mimsForm->COST_MONTH !== 'ALL') {
                    //     $w .= " AND COST_MONTH = '" . $mimsForm->COST_MONTH . "' ";
                    // }
                    // if (!empty($mimsForm->COST_YEAR)) {
                    //     $w .= " AND COST_YEAR = '" . $mimsForm->COST_YEAR . "' ";
                    // }

                    // $sqlOnhand = "SELECT * FROM WPS_MIMS_REPORT_STOCKCOST WHERE 1=1 " . $w ;//. " ORDER BY RAW_MONTH ASC"
                    // $dataOnhand = $this->MainModel->QuerySetBase($sqlOnhand, $this->mimsBase)->result();

                    //     // var_dump($dataOnhand);
                    //     // exit;
                    // $sqlReceive = "SELECT * FROM WPS_MIMS_REPORT_STOCKCOST_RECEIVE WHERE 1=1 " . $w;
                    // $dataReceive = $this->MainModel->QuerySetBase($sqlReceive, $this->mimsBase)->result();

                    // $sqlIssue = "SELECT * FROM WPS_MIMS_REPORT_STOCKCOST_ISSUE WHERE 1=1 " . $w;
                    // $dataIssue = $this->MainModel->QuerySetBase($sqlIssue, $this->mimsBase)->result();

                    // // 4. ผสานข้อมูล (Merge) ตัวเลขรายงานฝั่งหลังบ้านก่อนพ่นลงพิมพ์ (ลอจิกเดียวกับ JS)
                    // $recvMap = [];
                    // foreach ($dataReceive as $recv) {
                    //     $recvMap[$recv->COSTMONTH] = (float)($recv->RECEIVE_AMOUNT ?? 0);
                    // }

                    // $issueMap = [];
                    // foreach ($dataIssue as $issue) {
                    //     $issueMap[$issue->COSTMONTH] = (float)($issue->ISSUE_AMOUNT ?? 0);
                    // }


                    // foreach ($dataOnhand as $onhand) {
                    //     $monthKey = $onhand->COSTMONTH;
                    //     $opening = (float)($onhand->OPENINGBALANCE ?? 0);
                    //     $received = $recvMap[$monthKey] ?? 0.0;
                    //     $issued = $issueMap[$monthKey] ?? 0.0;
                    //     $totalCost = (float)($onhand->TOTAL_COST_ONHAND ?? 0);
                    //     $TOTAL_PCB_AMOUNT = (float)($onhand->TOTAL_PCB_AMOUNT ?? 0);
                    //     $TOTAL_PART_AMOUNT = (float)($onhand->TOTAL_PART_AMOUNT ?? 0);

                    //     // คำนวณ Diff หาส่วนต่างสะสม
                    //     $diff = $opening + $received - $issued - $totalCost;
                    //     if ($diff >= -0.02 && $diff <= 0.02) {
                    //         $diff = 0.0;
                    //     }

                    //     $reportRows[] = [
                    //         'COSTMONTH' => $monthKey,
                    //         'OPENING' => $opening,
                    //         'RECEIVED' => $received,
                    //         'ISSUED' => $issued,
                    //         'TOTAL_COST' => $totalCost,
                    //         'TOTAL_PCB_AMOUNT' => $TOTAL_PCB_AMOUNT,
                    //         'TOTAL_PART_AMOUNT' => $TOTAL_PART_AMOUNT,
                    //         'DIFF' => $diff
                    //     ];
                    //     // รวมยอดสุทธิท้ายใบ
                    //     $totalReceived += $received;
                    //     $totalIssued += $issued;
                    //     $totalDiff += $diff;
                    // }

                            
                    //     //== Receive History Table
                    //     $sql = "SELECT 
                    //         RECEIVE_ID,
                    //         PO_ID AS PO,
                    //         INVOICE_ID AS INV,
                    //         VENDOR,
                    //         SUBSTR(CONFIRMDATE, 1, 7) AS RECEIVE_MONTH,
                    //         CONFIRM_AMOUNT AS AMOUNT,
                    //         MACHINE_CODES AS REMARK
                    //     FROM 
                    //         WPS_MIMS_REPORT_RECV_VIEW
                    //     WHERE 
                    //         SUBSTR(CONFIRMDATE, 1, 7) = (
                    //             SELECT TO_CHAR(CREATE_DATE, 'YYYY-MM') 
                    //             FROM WPS_MIMS_EIAFORM 
                    //             WHERE NFRMNO = ? 
                    //             AND VORGNO = ? 
                    //             AND CYEAR = ? 
                    //             AND CYEAR2 = ? 
                    //             AND NRUNNO = ?
                    //         )
                    //     ORDER BY 
                    //         RECEIVE_ID,
                    //         RECEIVE_MONTH, 
                    //         VENDOR,
                    //         PO";
                    //     $bindData = [
                    //         (int)$data['NFRMNO'],
                    //         (string)$data['VORGNO'],
                    //         (string)$data['CYEAR'],
                    //         (string)$data['CYEAR2'],
                    //         (int)$data['NRUNNO']
                    //     ];
                    //     $dataReceiveHist = $this->MainModel->QuerySetBase($sql, $this->mimsBase,$bindData )->result();
                }
                else {    //-- get WPS_MIMS_EIAFORMDETAIL
                    foreach ($EIAFORMDETAIL as $onhand) {
                        $reportRows[] = [
                            'COSTMONTH'  => $onhand->COSTMONTH,
                            'OPENING'    => (float)$onhand->OPENINGBALANCE,
                            'RECEIVED'   => (float)$onhand->RECEIVED_AMOUNT, // ปรับให้ตรง Field จริงใน DB
                            'ISSUED'     => (float)$onhand->ISSUE_AMOUNT,
                            'TOTAL_COST' => (float)$onhand->TOTAL_COST_ONHAND,
                            'TOTAL_PCB_AMOUNT' => (float)$onhand->TOTAL_PCB_AMOUNT,
                            'TOTAL_PART_AMOUNT' => (float)$onhand->TOTAL_PART_AMOUNT,
                            'DIFF'       => (float)$onhand->DIFF
                        ];
                        
                        $LAST_MONTH = $onhand->COST_YEAR . "-" . $onhand->COST_MONTH;
                        // สะสมยอดรวม
                        $totalReceived += (float)$onhand->RECEIVED_AMOUNT;
                        $totalIssued   += (float)$onhand->ISSUE_AMOUNT;
                        $totalDiff     += (float)$onhand->DIFF;
                    }

                    
                    //== Receive History Table
                    $sql = "SELECT 
                        RECEIVE_ID,
                        PO_ID AS PO,
                        INVOICE_ID AS INV,
                        VENDOR,
                        SUBSTR(CONFIRMDATE, 1, 7) AS RECEIVE_MONTH,
                        CONFIRM_AMOUNT AS AMOUNT,
                        MACHINE_CODES AS REMARK
                    FROM 
                        WPS_MIMS_REPORT_RECV_VIEW
                    WHERE 
                        SUBSTR(CONFIRMDATE, 1, 7) = '".$LAST_MONTH ."'
                    ORDER BY 
                        RECEIVE_ID,
                        RECEIVE_MONTH, 
                        VENDOR,
                        PO";
                    $bindData = [
                        (int)$data['NFRMNO'],
                        (string)$data['VORGNO'],
                        (string)$data['CYEAR'],
                        (string)$data['CYEAR2'],
                        (int)$data['NRUNNO']
                    ];
                    $dataReceiveHist = $this->MainModel->QuerySetBase($sql, $this->mimsBase,$bindData )->result();
                        
                    //== inventory History Table
                    //== select Apr before FY Ex FY2026 get Mar'2026 = FY2025
                    $sql = "select distinct * from WPS_MIMS_REPORT_STOCKCOST where COST_MONTH = '03' and COST_YEAR ='".  (string)((int)$costyear - 1). "'";
                    $dataInventBFFYHist = $this->MainModel->QuerySetBase($sql, $this->mimsBase,[] )->result();
                    $dataBFStockList = []; // สร้างตัวแปรใหม่เป็น Array
                    foreach ($dataInventBFFYHist as $onhand) {
                        $dataBFStockList[] = [ // เก็บเป็น Object ลงใน Array
                            'TOTAL_PART_AMOUNT'  => number_format($onhand->TOTAL_PART_AMOUNT, 2),
                            'TOTAL_PCB_AMOUNT'   => number_format($onhand->TOTAL_PCB_AMOUNT, 2),
                            'RECEIVED'           => number_format($onhand->RECEIVED_AMOUNT, 2),
                            'ISSUED'             => number_format($onhand->ISSUED_AMOUNT, 2),
                            'TOTAL_COST'  => number_format($onhand->TOTAL_COST_ONHAND, 2),
                            'DIFF'               => null
                        ];
                    }




                    // var_dump($reportRows);
                    // exit;

                    // สร้าง HTML
                    $this->generateHtmlTemplate($mimsForm, $approvalList,$reportRows,$dataBFStockList,$dataReceiveHist, $totalReceived, $totalIssued, $totalDiff);

                }


            } catch (Exception $e) {
                show_error('เกิดข้อผิดพลาดในการส่งออกไฟล์ PDF: ' . $e->getMessage(), 500);
            }
        }

        // 📄 ฟังก์ชันย่อยสำหรับวาดโครงสร้างหน้าตาเอกสาร HTML สำหรับ Print Layout
        private function generateHtmlTemplate($formInfo, $approvalList, $rows, $dataBFStockList,$dataReceiveHist, $totalReceived, $totalIssued, $totalDiff)
        {
            $costyear = $formInfo->COST_YEAR;
            $DOC_NO = $formInfo->DOC_NO;
            
            $stampTable = $this->generateStampTable();

            // 2. ข้อมูลตารางหลัก (เอา padding ออก แล้วใช้ <br> แทน)
            $rowsHtml = '';
            foreach ($rows as $r) {
                $rowsHtml .= '<tr>
                    <td style="border: 1px solid #000; font-size: 8pt; text-align: center;">' . $r['COSTMONTH'] . '</td>
                    <td style="border: 1px solid #000; text-align: right; font-size: 8pt;">' . number_format($r['OPENING'], 2) . '&nbsp;&nbsp;&nbsp;</td>
                    <td style="border: 1px solid #000; text-align: right; font-size: 8pt;">' . number_format($r['RECEIVED'], 2) . '&nbsp;&nbsp;&nbsp;</td>
                    <td style="border: 1px solid #000; text-align: right; font-size: 8pt;">' . number_format($r['ISSUED'], 2) . '&nbsp;&nbsp;&nbsp;</td>
                    <td style="border: 1px solid #000; text-align: right; font-size: 8pt;">&nbsp;&nbsp;' . number_format($r['TOTAL_COST'], 2) . '&nbsp;&nbsp;&nbsp;</td>
                </tr>';
            }
            
            $html = '<html>
                <head>
                    <style>
                        body { font-family: sans-serif; }
                        .main-table { width: 100%; border: none; }
                        .main-table th { background: #d1d5db; border-collapse: collapse; border: 1px solid #000; text-align: center; font-size: 8pt; font-weight: bold;line-height: 2.5; }
                        .main-table td { border-collapse: collapse; border: 1px solid #000; font-size: 8pt; line-height: 2.0;}
                    </style>
                </head>
                <body>
                    
                    <table style="width: 100%; border: none; margin-bottom: 20px;">
                        <tr>
                            <td style="width: 50%; vertical-align: bottom;">
                                <div style="font-weight:bold; font-size: 14pt;">MAINTENANCE STOCK COST FY' . $costyear . '</div>
                                <div style="font-size: 10pt;"></div>
                            </td>
                            <td style="width: 50%; text-align: right; vertical-align: top;">
                                ' . $stampTable . '   
                            </td>
                        </tr>
                    </table>
                    <br>
                    <br>
                    <table class="main-table" cellpadding="0" cellspacing="0">
                        <thead style="text-align: center;">
                            <tr style="background-color: #d1d5db;line-height: 2.5;">
                                <th rowspan="2" style=" border: 1px solid #000; vertical-align: middle;">MONTH</th>
                                <th rowspan="2" style="border: 1px solid #000; vertical-align: middle;">OPENING BALANCE</th>
                                <th colspan="2" style=" border: 1px solid #000;">TRANSACTION ON THIS MONTH</th>
                                <th rowspan="2" style=" border: 1px solid #000; vertical-align: middle;">TOTAL COST</th>
                            </tr>
                            <tr style="background-color: #d1d5db;line-height: 2.0;">
                                <th style=" border: 1px solid #000;">RECEIVED</th>
                                <th style=" border: 1px solid #000;">ISSUED</th>
                            </tr>
                        </thead>
                        <tbody>' . $rowsHtml . '</tbody>
                    </table>
                </body></html>';

            // ---------------------------------------------------------
            // การสร้าง PDF ด้วย TCPDF
            // ---------------------------------------------------------

            $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

            // ปิดการพิมพ์ Header และ Footer ที่มักจะมีเส้นแถมมา
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);

            $pdf->AddPage('L'); 
            $pdf->SetFont('helvetica', '', 7); 
            
            // ตั้งค่า cell padding ของ TCPDF เอง ให้เหลือ 0 
            // (บางครั้ง TCPDF มี default padding ที่เราไม่ต้องการ)
            $pdf->setCellPaddings(0, 0, 0, 0);

            $pdf->writeHTML($html, true, false, true, false, '');

            //--ส่วนเสริม: การวาดตราประทับ (Drawing)
            // ตำแหน่งเริ่มต้น
            $startX = 164; 
            $startY = 30;  
            $circleSpace = 32; 
            $radius = 9; 
            $this->drawStamp($pdf, $approvalList, $startX, $startY, $circleSpace, $radius);


            //-- Paeg 2
            // --- เพิ่มหน้าใหม่ ---
            $pdf->AddPage('L');
            $pdf->SetFont('helvetica', '', 7);

            // --- สร้าง HTML สำหรับตารางที่ 2 ---
            $htmlReceive = $this->generateReceiveHistoryHtml($dataBFStockList,$rows,$dataReceiveHist,  $costyear,$DOC_NO);
            $pdf->writeHTML($htmlReceive, true, false, true, false, '');

            // --- วาดตราประทับสำหรับหน้า 2 (ถ้าต้องการให้มีเหมือนกัน) ---
            $this->drawStamp($pdf, $approvalList, $startX, $startY, $circleSpace, $radius);
            //-- Paeg 2

            // $pdf->Output('Report.pdf', 'I');
            $pdf->Output('Report_FEEIA_FY'.$costyear.'.pdf', 'D');
            exit;
        }

        private function generateStampTable()
        {
            $positions = ['FE DEM', 'MAT SEM', 'EFC SEM', 'REPORTER'];
            
            $stampTable = '<table style="width: 380px; border-collapse: collapse; border: 0.5pt solid #000;">
                <tr style="background-color: #e5e7eb; line-height: 4.0;">';
            
            foreach ($positions as $pos) { 
                $stampTable .= '<th style="border: 0.5pt solid #000; font-size: 7pt; text-align: center;"><br>' . $pos . '</th>'; 
            }
            
            $stampTable .= '</tr><tr style="height: 60px;">';
            
            // สร้าง 4 ช่องว่างสำหรับตราประทับ
            for ($i = 0; $i < 4; $i++) {
                $stampTable .= '<td style="border: 0.5pt solid #000; text-align: center; vertical-align: middle;">
                    <br><br><br><br><br><br><br>
                </td>';
            }
            
            $stampTable .= '</tr></table><br>';
            return $stampTable;
        }

        public function drawStamp($pdf, $approvalList, $startX, $startY, $circleSpace, $radius)
        {

            // ==========================================
            // ส่วนเสริม: การวาดตราประทับ (Drawing)
            // ==========================================
            
            $pdf->SetAlpha(0.7); 
            $pdf->SetDrawColor(255, 0, 0); 
            $pdf->SetTextColor(255, 0, 0); 
            
            
            
            $cextdata = ['03', '02', '01', '00'];
            
            $approvalMap = [];
            foreach ($approvalList as $app) { $approvalMap[$app->CEXTDATA] = $app; }

            foreach ($cextdata as $index => $cext) {
                $data = $approvalMap[$cext] ?? null;

                if ($data && !empty($data->APPROVE_DATE) && trim($data->APPROVE_DATE) !== '') {
                // if ($data ) {
                    $circleX = $startX + ($circleSpace * $index) + 5;
                    $dateOnly = explode(' ', trim($data->APPROVE_DATE))[0];
                    
                    $pdf->Circle($circleX, $startY, $radius, 0, 360, 'D');
                    
                    $pdf->SetFont('helvetica', 'B', 7);
                    $pdf->SetXY($circleX - 10, $startY - 5.5); 
                    $pdf->Cell(20, 5, 'AMEC', 0, 1, 'C'); 
                    
                    $pdf->SetFont('helvetica', '', 5); 
                    $pdf->SetXY($circleX - 10, $startY - 1.5); 
                    $pdf->Cell(20, 5, $dateOnly, 0, 1, 'C');

                    $nameOnly = explode(' ', $data->APPROVER_NAME)[0];
                    $pdf->SetFont('helvetica', 'B', 6); 
                    $pdf->SetXY($circleX - 10, $startY + 2); 
                    $pdf->Cell(20, 5, $nameOnly, 0, 1, 'C');
                }
            }
            $pdf->SetTextColor(0, 0, 0);
            $pdf->SetAlpha(1); 
            // ==========================================
        }

        private function generateReceiveHistoryHtml($dataInventBFFYHist, $datastockCost, $dataReceiveHist,  $costyear,$DOC_NO)
        {

            // $prevYear = substr((int)$costyear - 1, -2);
            $prevYear = (int)$costyear - 1;
            $currYear = (int)$costyear;
            $nextYear = $currYear + 1;

            $months = [
                ['code' => '04', 'label' => "Apr'".$currYear], ['code' => '05', 'label' => "May'".$currYear],
                ['code' => '06', 'label' => "Jun'".$currYear], ['code' => '07', 'label' => "Jul'".$currYear],
                ['code' => '08', 'label' => "Aug'".$currYear], ['code' => '09', 'label' => "Sep'".$currYear],
                ['code' => '10', 'label' => "Oct'".$currYear], ['code' => '11', 'label' => "Nov'".$currYear],
                ['code' => '12', 'label' => "Dec'".$currYear], ['code' => '01', 'label' => "Jan'".$nextYear],
                ['code' => '02', 'label' => "Feb'".$nextYear], ['code' => '03', 'label' => "Mar'".$nextYear]
            ];

            // $currYear = substr((int)$costyear, -2);
            $rows = [
                'Store Part' => 'TOTAL_PART_AMOUNT', 
                'Store PCB'  => 'TOTAL_PCB_AMOUNT', 
                'Receive'    => 'RECEIVED', 
                'Issue'      => 'ISSUED', 
                'Total'      => 'TOTAL_COST', 
                'Diff of month' => 'DIFF'
            ];
            $headerMonth = '<th></th><th>FY'.  $prevYear . '</th>';
            foreach ($months as $m) { $headerMonth .= '<th>' . $m['label'] . '</th>'; }

            $costMap = [];
            foreach ($datastockCost as $r) {
                $costMap[$r['COSTMONTH']] = $r; 
            }
            $rowStock = '';
            foreach ($rows as $label => $field) {
                $rowStock .= '<tr><td style="border: 1px solid #000;font-size: 7pt; text-align: center;">' . $label . '</td>';
                
                // ข้อมูลปีเก่า (FY)
                $bfVal = !empty($dataInventBFFYHist) ? $dataInventBFFYHist[0][$field] : '';
                $rowStock .= '<td style="border: 1px solid #000; font-size: 7pt; text-align: right;">' . $bfVal  . '&nbsp;</td>';
                // ข้อมูล 12 เดือน
                $diff = 0;
                $diffBF = 0;
                foreach ($months as $m) {
                    if(isset($costMap[$m['label']]))
                    {
                            
                        if($field == 'DIFF')
                        {
                            if($costMap[$m['label']]['TOTAL_COST']  == null )
                            {
                                $rawVal = "0.00";
                                $val = number_format((float)$rawVal, 2, '.', ',');  
                            }
                            else {
                                // $rawVal = isset($costMap[$m['label']]) ? $costMap[$m['label']][$field] : '';
                                $diff = (float)(isset($costMap[$m['label']]) ? $costMap[$m['label']]['ISSUED'] : 0)-(float)$diffBF;
                                $val = number_format((float)$diff, 2, '.', ',');
                            }
                        }
                        else {
                            $rawVal = isset($costMap[$m['label']]) ? $costMap[$m['label']][$field] : '';
                            $val = number_format((float)$rawVal, 2, '.', ',');                      
                        }
                        $diffBF = $costMap[$m['label']]['ISSUED'];
                    }
                    else {
                        $val ="";
                    }
                    $rowStock .= '<td style="border: 1px solid #000;font-size: 7pt; text-align: right;">' . $val  . '&nbsp;</td>';
                    
                }
                $rowStock .= '</tr>';
            }


            $rowsHtml = '';
            
            $stampTable = $this->generateStampTable();
            $totalReceived = 0;
            $RECEIVE_MONTH = "";
            foreach ($dataReceiveHist as $r) {
                $rowsHtml .= '<tr>
                    <td style="border: 1px solid #000; font-size: 8pt; text-align: center;">' . $r->PO . '</td>
                    <td style="border: 1px solid #000; font-size: 8pt; text-align: center;">' . $r->INV . '</td>
                    <td style="border: 1px solid #000; font-size: 8pt; padding-left: 5px;">' . $r->VENDOR . '</td>
                    <td style="border: 1px solid #000; font-size: 8pt; text-align: right;">' . number_format($r->AMOUNT, 2) . '&nbsp;&nbsp;</td>
                    <td style="border: 1px solid #000; font-size: 8pt; padding-left: 5px;">' . $r->REMARK . '</td>
                </tr>';
                $totalReceived += (float)$r->AMOUNT;
                $RECEIVE_MONTH = $r->RECEIVE_MONTH;
            }

            return '<html>
            <head>
                <style>
                    body { font-family: sans-serif; }
                    .main-table { width: 100%; border: none; }
                    .main-table th { background: #d1d5db; border-collapse: collapse; border: 1px solid #000; text-align: center; font-size: 8pt; font-weight: bold;line-height: 2.5; }
                    .main-table td { border-collapse: collapse; border: 1px solid #000; font-size: 8pt; line-height: 2.0;}
                </style>
            </head>
            <body>
        
                <table style="width: 100%; border: none; margin-bottom: 20px;">
                    <tr>
                        <td style="width: 50%; vertical-align: bottom;">
                            <div style="font-weight:bold; font-size: 14pt;">Backup data in Form : ' . $DOC_NO . " (REC.". $RECEIVE_MONTH . ') </div>
                            <div style="font-size: 10pt;"></div>
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: top;">
                            ' . $stampTable . '   
                        </td>
                    </tr>
                </table>
                <br>
                <br>
                <table class="main-table" cellpadding="2">
                    <thead>
                        <tr style="background-color: #d1d5db;line-height: 2.5;font-size: 7pt; ">
                            '.$headerMonth.'
                        </tr>
                    </thead>
                    <tbody>' . $rowStock . '</tbody>
                    
                </table>
                <br>
                <br>
                <table class="main-table" cellpadding="2">
                    <thead>
                        <tr style="background-color: #d1d5db;line-height: 2.5; ">
                            <th>PO</th><th>INV</th><th>VENDOR</th><th>AMOUNT</th><th>REMARK</th>
                        </tr>
                    </thead>
                    <tbody>' . $rowsHtml . '</tbody>
                    <tfoot>
                        <tr style="background-color: #f3f4f6; font-weight: bold;">
                            <td colspan="3" style="text-align: right; border: 1px solid #000;">RECEIVE FY' . $costyear . '&nbsp;&nbsp;</td>
                            <td style="text-align: right; border: 1px solid #000;">' . number_format($totalReceived, 2) . '&nbsp;&nbsp;</td>
                            <td style="border: 1px solid #000;"></td>
                        </tr>
                    </tfoot>
                </table>
            </body></html>';
        }

        
        private function generateReceiveHistoryHtml0($dataInventBFFYHist, $datastockCost, $dataReceiveHist, $costyear, $DOC_NO)
        {
            // กำหนดปีเพื่อใช้เปรียบเทียบ Format
            $currYear = substr((int)$costyear, -2);
            $nextYear = substr((int)$costyear + 1, -2);

            // 1. ตั้งค่า Month Labels ให้ตรงกับรูปแบบใน DB (ตัวอย่าง: May'26)
            // ตรวจสอบรูปแบบใน DB อีกครั้งว่าเป็น May'26 หรือ May'2026
            $months = [
                ['code' => '04', 'label' => "Apr'$currYear"], ['code' => '05', 'label' => "May'$currYear"],
                ['code' => '06', 'label' => "Jun'$currYear"], ['code' => '07', 'label' => "Jul'$currYear"],
                ['code' => '08', 'label' => "Aug'$currYear"], ['code' => '09', 'label' => "Sep'$currYear"],
                ['code' => '10', 'label' => "Oct'$currYear"], ['code' => '11', 'label' => "Nov'$currYear"],
                ['code' => '12', 'label' => "Dec'$currYear"], ['code' => '01', 'label' => "Jan'$nextYear"],
                ['code' => '02', 'label' => "Feb'$nextYear"], ['code' => '03', 'label' => "Mar'$nextYear"]
            ];

            // 2. Map ข้อมูล Stock Cost
            $costMap = [];
            foreach ($datastockCost as $r) {
                $costMap[$r['COSTMONTH']] = $r; 
            }

            // 3. เตรียม Row ข้อมูล
            $rows = [
                'Store Part' => 'TOTAL_PART_AMOUNT', 
                'Store PCB'  => 'TOTAL_PCB_AMOUNT', 
                'Receive'    => 'RECEIVED', 
                'Issue'      => 'ISSUED', 
                'Total'      => 'TOTAL_COST', 
                'Diff of month' => 'DIFF'
            ];

            $rowStock = '';
            foreach ($rows as $label => $field) {
                $rowStock .= '<tr><td style="border: 1px solid #000; font-size: 8pt;">' . $label . '</td>';
                
                // ข้อมูลปีเก่า (FY)
                $bfVal = !empty($dataInventBFFYHist) ? (float)$dataInventBFFYHist[0][$field] : 0;
                $rowStock .= '<td style="border: 1px solid #000; font-size: 8pt; text-align: right;">' . number_format($bfVal, 2) . '&nbsp;</td>';
                
                // ข้อมูล 12 เดือน
                foreach ($months as $m) {
                    $val = isset($costMap[$m['label']]) ? (float)($costMap[$m['label']][$field] ?? 0) : 0;
                    $rowStock .= '<td style="border: 1px solid #000; font-size: 8pt; text-align: right;">' . number_format($val, 2) . '&nbsp;</td>';
                }
                $rowStock .= '</tr>';
            }

            // 4. ตาราง Receive History
            $rowsHtml = '';
            $totalReceived = 0;
            foreach ($dataReceiveHist as $r) {
                $rowsHtml .= '<tr>
                    <td style="border: 1px solid #000; font-size: 8pt; text-align: center;">' . $r->PO . '</td>
                    <td style="border: 1px solid #000; font-size: 8pt; text-align: center;">' . $r->INV . '</td>
                    <td style="border: 1px solid #000; font-size: 8pt;">' . $r->VENDOR . '</td>
                    <td style="border: 1px solid #000; font-size: 8pt; text-align: right;">' . number_format((float)$r->AMOUNT, 2) . '&nbsp;</td>
                    <td style="border: 1px solid #000; font-size: 8pt;">' . $r->REMARK . '</td>
                </tr>';
                $totalReceived += (float)$r->AMOUNT;
            }

            // 5. ประกอบ HTML
            $headerMonth = '';
            foreach ($months as $m) { $headerMonth .= '<th>' . $m['label'] . '</th>'; }

            return '<html><body>
                <table class="main-table" cellpadding="2">
                    <thead>
                        <tr style="background-color: #d1d5db;"><th>Category</th><th>FY'.($costyear-1).'</th>' . $headerMonth . '</tr>
                    </thead>
                    <tbody>' . $rowStock . '</tbody>
                </table>
                <br>
                <table class="main-table" cellpadding="2">
                    <thead>
                        <tr style="background-color: #d1d5db;"><th>PO</th><th>INV</th><th>VENDOR</th><th>AMOUNT</th><th>REMARK</th></tr>
                    </thead>
                    <tbody>' . $rowsHtml . '</tbody>
                    <tfoot>
                        <tr style="font-weight:bold;">
                            <td colspan="3" style="text-align:right;">RECEIVE FY' . $costyear . '&nbsp;</td>
                            <td style="text-align:right;">' . number_format($totalReceived, 2) . '&nbsp;</td><td></td>
                        </tr>
                    </tfoot>
                </table>
            </body></html>';
        }

    //========================================================


    // =========================================================================
    // 1. ดึงรายการไฟล์แนบจากฐานข้อมูลมาโชว์ในโหมดดูอย่างเดียว (Mode 3)
    // =========================================================================
    public function GetFilesDisplay()
    {
        $NFRMNO  = (int)$this->input->post('NFRMNO');
        $VORGNO  = (string)$this->input->post('VORGNO');
        $CYEAR2  = (string)$this->input->post('CYEAR2');
        $NRUNNO  = (int)$this->input->post('NRUNNO');

        $sql = "SELECT FILE_ID, NFRMNO, VORGNO, CYEAR2, NRUNNO, FILE_ONAME, FILE_FNAME, FILE_PATH 
            FROM FE_FILE 
            WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR2 = ? AND NRUNNO = ?
            ORDER BY FILE_ID ASC";
        $files = $this->MainModel->QuerySetBase($sql, $this->webflowBase, [$NFRMNO, $VORGNO, $CYEAR2, $NRUNNO])->result();

        return $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'status' => true,
                        'files'  => $files
                    ]));
    }
    

    public function DownloadFile()
    {
        $file_id = $this->input->get('id'); 
        
        $sql = "SELECT * FROM FE_FILE WHERE FILE_ID = ?";
        $file = $this->MainModel->QuerySetBase($sql, $this->webflowBase, [$file_id])->row();
        if ($file) {
            $fullPath = rtrim($file->FILE_PATH, '/\\') . DIRECTORY_SEPARATOR . $file->FILE_FNAME;

            if (file_exists($fullPath)) {
                $this->load->helper('download');
                
                // ใช้ FILE_ONAME เป็นชื่อตอนโหลดลงเครื่อง และอ่านไฟล์จาก $fullPath
                force_download($file->FILE_ONAME, file_get_contents($fullPath));
            } else {
                show_error('ไม่พบไฟล์จริงในระบบ: ' . $fullPath, 404);
            }
        } else {
            show_error('ไม่พบข้อมูลไฟล์ในฐานข้อมูล', 404);
        }
    }

    public function DeleteFile() 
    {
        $file_id = $this->input->post('id');
        if (!$file_id) {
            return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => 'No ID provided']));
        }

        $sql = "SELECT * FROM FE_FILE WHERE FILE_ID = ?";
        $file = $this->MainModel->QuerySetBase($sql, $this->webflowBase, [$file_id])->row();
        if (!$file) {
            return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => 'File not found in DB']));
        }

        // 2. ปรับปรุงการรวม Path ให้รองรับ Windows/NAS
        // rtrim เพื่อกำจัด / หรือ \ ที่เกินมา และเติม separator ให้ถูกต้อง
        $fullPath = rtrim($file->FILE_PATH, '/\\') . DIRECTORY_SEPARATOR . $file->FILE_FNAME;

        if (file_exists($fullPath)) {
            if (!unlink($fullPath)) {
                return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => 'Cannot delete physical file']));
            }
        }
        
        $this->MainModel->deleteData($this->webflowBase, 'FE_FILE', ['FILE_ID' => $file_id]);

        return $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true]));
    }

}