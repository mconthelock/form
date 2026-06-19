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
    //==============================================================================================================
    public function AutoCreateFEEIAForm()
    {
        try {
            // ดึงค่าจาก Query String พร้อมใส่ค่า Default ด้วยเครื่องหมาย ?? 
            $COST_YEAR  = $this->input->get('COST_YEAR') ?? date('Y');
            $COST_MONTH = $this->input->get('COST_MONTH') ?? date('m');

            $sql = "SELECT * FROM WPS_MIMS_EIAFORM_USERCREATE WHERE 1=1 and GROUPTYPE = 'REQ' ";
            $REQBY = $this->MainModel->QuerySetBase($sql, $this->mimsBase)->result();
            
            $form = $this->getFormMasterByVaname('FE-EIA');
            
            if (!empty($form) && (isset($form['status']) && $form['status'] === 'true')) {
                
                $formData = $form['data']; 
                
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

                // == Email Notification (Optional)
                
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
                    NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO, COST_MONTH, COST_YEAR,
                    OPENINGBALANCE, RECEIVED_AMOUNT, ISSUE_AMOUNT, TOTAL_COST_ONHAND, DIFF, CREATE_DATE,
                    INITCAP(TO_CHAR(TO_DATE(COST_YEAR || '-' || COST_MONTH, 'YYYY-MM'), 'Mon''YYYY', 'NLS_DATE_LANGUAGE = AMERICAN')) AS COSTMONTH
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
                            'COST_MONTH'        => (string)($row['COST_MONTH'] ?? ''),
                            'COST_YEAR'         => (string)($row['COST_YEAR'] ?? ''),
                            'OPENINGBALANCE'    => (float)($row['OPENINGBALANCE'] ?? 0),
                            'RECEIVED_AMOUNT'   => (float)($row['RECEIVED_AMOUNT'] ?? 0),
                            'ISSUE_AMOUNT'      => (float)($row['ISSUE_AMOUNT'] ?? 0),
                            'TOTAL_COST_ONHAND' => (float)($row['TOTAL_COST_ONHAND'] ?? 0),
                            'DIFF'              => (float)($row['DIFF'] ?? 0)
                            // 💡 หมายเหตุ: ตัด 'CREATE_DATE' ออกแล้ว เพื่อให้โครงสร้างใช้ DEFAULT SYSDATE ของ Oracle ป้องกัน ORA-01861
                        ]);
                        $db_mims->insert('WPS_MIMS_EIAFORMDETAIL', $detailData);
                    }
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
                'NFRMNO' => (int)$this->input->get('NFRMNO'),
                'VORGNO' => (string)$this->input->get('VORGNO'),
                'CYEAR'  => (string)$this->input->get('CYEAR'),
                'CYEAR2' => (string)$this->input->get('CYEAR2'),
                'NRUNNO' => (int)$this->input->get('NRUNNO'),
            ];
            $sql = "DELETE FROM WPS_MIMS_EIAFORM WHERE NFRMNO = ? AND VORGNO = ? AND CYEAR = ? AND CYEAR2 = ? AND NRUNNO = ?";
            $this->MainModel->QuerySetBase($sql, $this->mimsBase, [
                $form['NFRMNO'],
                $form['VORGNO'],
                $form['CYEAR'],
                $form['CYEAR2'],
                $form['NRUNNO']
            ]);

             // 2. ลบฟอร์มหลักในระบบ Webflow ด้วย
             $this->deleteForm($form);

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
    public function EndpProcess() 
    { 
        try {
            $NFRMNO    = (int)$this->input->post('NFRMNO');
            $VORGNO    = (string)$this->input->post('VORGNO');
            $CYEAR     = (string)$this->input->post('CYEAR');
            $CYEAR2    = (string)$this->input->post('CYEAR2');
            $NRUNNO    = (int)$this->input->post('NRUNNO');
            $COST_YEAR = (int)$this->input->post('COST_YEAR');

            if (empty($NRUNNO) ) {
                throw new \Exception("ข้อมูลฟอร์มไม่ครบถ้วน");
            }
            // 1. แก้ไข Syntax วันที่
            $SUBJECT = "Maintenance Stock Cost Report (FE-EIA)_" . $COST_YEAR . "/" . date('m');
            $TO = "";
            $CC = "";


            if (strpos($this->host, 'test') !== false || strpos($this->host, 'localhost') !== false) {
                // กรณี Test Server

                $TO = "siripapa@mitsubishielevatorasia.co.th";
                $CC = "siripapa@mitsubishielevatorasia.co.th";
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
                    $CC = "siripapa@mitsubishielevatorasia.co.th";
                } else {
                    // กรณีไม่พบ Flow อาจจะ log หรือแจ้งเตือน
                    log_message('error', "EndpProcess: ไม่พบอีเมลในตาราง FLOW");
                }
            }

            $BODY = ["
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #0056b3; color: white; padding: 20px; text-align: center;'>
                        <h2 style='margin: 0;'>Maintenance Stock Cost Report</h2>
                    </div>
                    <div style='padding: 20px;'>
                        <p>Dear All,</p>
                        <p>This is an automated notification regarding the stock cost report for <strong>FE-EIA</strong>.</p>
                        
                        <table style='width: 100%; margin: 20px 0; border-collapse: collapse;'>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; color: #777;'><strong>Report Period:</strong></td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee;'>{$COST_YEAR}/" . date('m') . "</td>
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

    public function exportPdf()
    {
        try {
            // 1. รับค่าพารามิเตอร์คีย์หลักของฟอร์มจากลิงก์ URL
            $form = [
                'NFRMNO' => (int)$this->input->get('no'),
                'VORGNO' => (string)$this->input->get('orgNo'),
                'CYEAR'  => (string)$this->input->get('y'),
                'CYEAR2' => (string)$this->input->get('y2'),
                'NRUNNO' => (int)$this->input->get('runNo'),
            ];

            // 2. ดึงข้อมูลพิกัดปีเดือนของฟอร์มและเลขที่เอกสาร DOC_NO จากตารางหลัก
            $db_mims = $this->load->database('MIMS', TRUE);
            $mimsForm = $db_mims->get_where('WPS_MIMS_EIAFORM', $form)->row();

            // $sql ="select * from WPS_MIMS_EIAFORM where NFRMNO =";
            // $mimsForm = 
            if (empty($mimsForm)) {
                show_error('ไม่พบข้อมูลเอกสารที่ต้องการพิมพ์', 404);
            }

            // 3. ดึงกลุ่มข้อมูลตัวเลขรายงานจากฐานข้อมูล (ลอจิกคิวรีชุดเดียวกับ GetStockCost)
            $w = "";
            if (!empty($mimsForm->COST_MONTH) && $mimsForm->COST_MONTH !== 'all') {
                $w .= " AND COST_MONTH = '" . $mimsForm->COST_MONTH . "' ";
            }
            if (!empty($mimsForm->COST_YEAR)) {
                $w .= " AND COST_YEAR = '" . $mimsForm->COST_YEAR . "' ";
            }

            $sqlOnhand = "SELECT * FROM WPS_MIMS_REPORT_STOCKCOST WHERE 1=1 " . $w;
            $dataOnhand = $this->MainModel->QuerySetBase($sqlOnhand, 'default')->result();

            $sqlReceive = "SELECT * FROM WPS_MIMS_REPORT_STOCKCOST_RECEIVE WHERE 1=1 " . $w;
            $dataReceive = $this->MainModel->QuerySetBase($sqlReceive, 'default')->result();

            $sqlIssue = "SELECT * FROM WPS_MIMS_REPORT_STOCKCOST_ISSUE WHERE 1=1 " . $w;
            $dataIssue = $this->MainModel->QuerySetBase($sqlIssue, 'default')->result();

            // 4. ผสานข้อมูล (Merge) ตัวเลขรายงานฝั่งหลังบ้านก่อนพ่นลงพิมพ์ (ลอจิกเดียวกับ JS)
            $recvMap = [];
            foreach ($dataReceive as $recv) {
                $recvMap[$recv->COSTMONTH] = (float)($recv->RECEIVE_AMOUNT ?? 0);
            }

            $issueMap = [];
            foreach ($dataIssue as $issue) {
                $issueMap[$issue->COSTMONTH] = (float)($issue->ISSUE_AMOUNT ?? 0);
            }

            $reportRows = [];
            $totalReceived = 0;
            $totalIssued = 0;
            $totalDiff = 0;

            foreach ($dataOnhand as $onhand) {
                $monthKey = $onhand->COSTMONTH;
                $opening = (float)($onhand->OPENINGBALANCE ?? 0);
                $received = $recvMap[$monthKey] ?? 0.0;
                $issued = $issueMap[$monthKey] ?? 0.0;
                $totalCost = (float)($onhand->TOTAL_COST_ONHAND ?? 0);

                // คำนวณ Diff หาส่วนต่างสะสม
                $diff = $opening + $received - $issued - $totalCost;
                if ($diff >= -0.02 && $diff <= 0.02) {
                    $diff = 0.0;
                }

                $reportRows[] = [
                    'COSTMONTH' => $monthKey,
                    'OPENING' => $opening,
                    'RECEIVED' => $received,
                    'ISSUED' => $issued,
                    'TOTAL_COST' => $totalCost,
                    'DIFF' => $diff
                ];

                // รวมยอดสุทธิท้ายใบ
                $totalReceived += $received;
                $totalIssued += $issued;
                $totalDiff += $diff;
            }

            // 5. ประกอบโครงสร้าง HTML & CSS มิติกระดาษ A4 แนวนอน (Landscape) ส่งต่อให้ WeasyPrint
            $htmlContent = $this->generateHtmlTemplate($mimsForm, $reportRows, $totalReceived, $totalIssued, $totalDiff);

            // 6. ตั้งชื่อไฟล์บันทึกส่งออกและสั่งประมวลผลระบบสร้าง PDF
            $fileName = 'Maintenance_Stock_Cost_Report_' . $mimsForm->DOC_NO . '.pdf';
            
            // กำหนดพิกัดสร้างไฟล์ชั่วคราวในเครื่องเซิร์ฟเวอร์
            $tmpHtmlPath = sys_get_temp_dir() . '/' . uniqid() . '.html';
            $tmpPdfPath = sys_get_temp_dir() . '/' . uniqid() . '.pdf';
            
            file_put_contents($tmpHtmlPath, $htmlContent);
            
            // ยิงคำสั่ง Exec รันโปรแกรมระบบ WeasyPrint ประมวลผลออกมาเป็น PDF
            exec("weasyprint " . escapeshellarg($tmpHtmlPath) . " " . escapeshellarg($tmpPdfPath));
            
            if (file_exists($tmpPdfPath)) {
                header('Content-Type: application/pdf');
                header('Content-Disposition: inline; filename="' . $fileName . '"');
                header('Content-Length: ' . filesize($tmpPdfPath));
                readfile($tmpPdfPath);
                
                // ล้างไฟล์ขยะชั่วคราวออกจากเซิร์ฟเวอร์หลังส่งงานเสร็จ
                unlink($tmpHtmlPath);
                unlink($tmpPdfPath);
                exit;
            } else {
                throw new Exception("ระบบจัดสร้าง PDF ขัดข้องภายในขอบเขตคำสั่งเครื่อง");
            }

        } catch (Exception $e) {
            show_error('เกิดข้อผิดพลาดในการส่งออกไฟล์ PDF: ' . $e->getMessage(), 500);
        }
    }

    // 📄 ฟังก์ชันย่อยสำหรับวาดโครงสร้างหน้าตาเอกสาร HTML สำหรับ Print Layout
    private function generateHtmlTemplate($formInfo, $rows, $totalRecv, $totalIssue, $totalDiff)
    {
        $rowsHtml = '';
        $no = 1;
        foreach ($rows as $r) {
            $diffStyle = $r['DIFF'] < 0 ? 'color: #dc2626;' : 'color: #16a34a;';
            $rowsHtml .= '
            <tr>
                <td style="text-align: center;">' . $no++ . '</td>
                <td style="text-align: center; font-weight: bold;">' . htmlspecialchars($r['COSTMONTH']) . '</td>
                <td class="text-right">' . number_format($r['OPENING'], 2) . '</td>
                <td class="text-right" style="color: #16a34a;">' . number_format($r['RECEIVED'], 2) . '</td>
                <td class="text-right" style="color: #dc2626;">' . number_format($r['ISSUED'], 2) . '</td>
                <td class="text-right font-bold">' . number_format($r['TOTAL_COST'], 2) . '</td>
                <td class="text-right font-bold" style="' . $diffStyle . '">' . number_format($r['DIFF'], 2) . '</td>
            </tr>';
        }

        $diffFooterStyle = $totalDiff < 0 ? 'color: #dc2626;' : 'color: #16a34a;';

        // ส่งโครงสร้าง Layout กระดาษ A4 สไตล์โมเดิร์นกลับไป
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @page {
                    size: A4 landscape;
                    margin: 15mm 12mm;
                    background-color: #ffffff;
                }
                body {
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    color: #1e293b;
                    margin: 0;
                    padding: 0;
                    font-size: 10pt;
                    line-height: 1.5;
                }
                *, *::before, *::after { box-sizing: border-box; }
                .header-container {
                    margin-bottom: 20px;
                    border-bottom: 2px solid #0284c7;
                    padding-bottom: 10px;
                }
                .main-title {
                    font-size: 20pt;
                    color: #0284c7;
                    font-weight: bold;
                    margin: 0 0 5px 0;
                }
                .info-table {
                    width: 100%;
                    margin-bottom: 20px;
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px;
                }
                .info-table td {
                    padding: 5px 10px;
                    vertical-align: top;
                }
                .label {
                    font-size: 9pt;
                    font-weight: bold;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .value {
                    font-size: 10pt;
                    font-weight: 500;
                    color: #334155;
                }
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                .report-table th {
                    background-color: #0284c7;
                    color: #ffffff;
                    font-weight: bold;
                    font-size: 10pt;
                    padding: 10px 8px;
                    border: 1px solid #0284c7;
                    text-align: center;
                }
                .report-table td {
                    padding: 8px;
                    border: 1px solid #e2e8f0;
                    font-size: 10pt;
                }
                .report-table tr:nth-child(even) {
                    background-color: #f8fafc;
                }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .footer-total-row {
                    background-color: #f1f5f9 !important;
                    font-weight: bold;
                }
                .footer-total-row td {
                    border-top: 2px solid #0284c7;
                    border-bottom: 2px solid #0284c7;
                }
            </style>
        </head>
        <body>
            <div class="header-container">
                <div class="main-title">Maintenance Stock Cost Report</div>
                <div style="font-size: 9pt; color: #64748b;">System Generated Official Document</div>
            </div>

            <table class="info-table">
                <tr>
                    <td width="33%">
                        <div class="label">Form ID</div>
                        <div class="value">' . htmlspecialchars($formInfo->DOC_NO) . '</div>
                    </td>
                    <td width="33%">
                        <div class="label">Input By</div>
                        <div class="value">Auto Job</div>
                    </td>
                    <td width="34%">
                        <div class="label">Request By</div>
                        <div class="value">' . htmlspecialchars($formInfo->EMPNO) . '</div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="label">Year / Month</div>
                        <div class="value">' . htmlspecialchars($formInfo->COST_YEAR) . ' / ' . htmlspecialchars($formInfo->COST_MONTH) . '</div>
                    </td>
                    <td colspan="2">
                        <div class="label">Remark</div>
                        <div class="value">' . htmlspecialchars($formInfo->REMARK ?? '-') . '</div>
                    </td>
                </tr>
            </table>

            <table class="report-table">
                <thead>
                    <tr>
                        <th width="5%">No.</th>
                        <th width="15%">Cost Month</th>
                        <th width="16%">Opening Balance</th>
                        <th width="16%">Received FY' . htmlspecialchars($formInfo->COST_YEAR) . '</th>
                        <th width="16%">Issued FY' . htmlspecialchars($formInfo->COST_YEAR) . '</th>
                        <th width="16%">Total Cost</th>
                        <th width="16%">Diff</th>
                    </tr>
                </thead>
                <tbody>
                    ' . $rowsHtml . '
                    <tr class="footer-total-row">
                        <td colspan="2" style="text-align: center;">Total</td>
                        <td></td>
                        <td class="text-right" style="color: #16a34a;">' . number_format($totalRecv, 2) . '</td>
                        <td class="text-right" style="color: #dc2626;">' . number_format($totalIssue, 2) . '</td>
                        <td></td>
                        <td class="text-right" style="' . $diffFooterStyle . '">' . number_format($totalDiff, 2) . '</td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>';
    }

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