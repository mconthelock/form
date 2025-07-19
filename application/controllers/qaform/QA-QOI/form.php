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
                   // $data['enginc'] = $this->qoi->get_Engineer();

                }
                if($data['cextData'] == 4)
                {
                    $data['seminc'] = $this->qoi->get_SEMING();

                }
            }

            $data["NG"] = false;
            foreach($data['resultdwg'] as $rs)
            {
                    if($rs->RESULT == "1")
                    {
                        $data["NG"] = true;
                        break;
                    }
            }


            //echo $data['cextData'];
            $this->views('qaform/QA-QOI/view', $data);
        }



    }

    public function get_list($type,$head='')
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
        }else{

            $sql = "select SEMPNO , SNAME from AMECUSERALL where CSTATUS = '1' AND SEMPNO in (select EMPNO from  SEQUENCEORG WHERE headno = '".$head."') AND SPOSCODE in ('40','41','35') ORDER BY SNAME";
            $data = $this->qoi->getdatasql($sql);
        }
        echo json_encode($data);
    }

    public function action()
    {
        $action = $_POST["action"];
        $cextData = $_POST["cextData"];
        $apvno =  $_POST["empno"];
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
                    ];
                    $fstatus = $this->updateFlowApv($form , $dataflow);
                    $status = $fstatus['status'];
                }else if($cextData == "02")
                {
                    $delstep =  [
                        [ 'CSTEPNO' => '88', 'CSTEPNEXTNO' => '26'],
                        [ 'CSTEPNO' => '26', 'CSTEPNEXTNO' => '89'],
                        [ 'CSTEPNO' => '89', 'CSTEPNEXTNO' => '81'],
                        [ 'CSTEPNO' => '81', 'CSTEPNEXTNO' => '84'],
                        [ 'CSTEPNO' => '84', 'CSTEPNEXTNO' => '12'],
                        [ 'CSTEPNO' => '12', 'CSTEPNEXTNO' => '14'],
                        [ 'CSTEPNO' => '14', 'CSTEPNEXTNO' => '00'],
                    ];
                    $this->deleteFlowStep($delstep, $_POST["nfrmno"], $_POST["vorgno"], $_POST["cyear"],  $_POST["cyear2"], $_POST["nrunno"]);
                    $status = $this->updateconcern();
                }else{
                    $status = true;
                }
            }else if($action == "reject")
            {
                $q = "update FLOW set CSTEPST = '6' , CAPVSTNO = '2' where NFRMNO = '".$_POST["nfrmno"]."' AND VORGNO = '".$_POST["vorgno"]."' and CYEAR = '".$_POST["cyear"]."' and CYEAR2 = '".$_POST["cyear2"]."' and NRUNNO = '".$_POST["nrunno"]."' and VAPVNO = '".$apvno."' and CEXTDATA = '".$cextData."'";
                $this->qoi->execsql($q);
                if($cextData == "02")
                {
                    $status = $this->updateconcern();
                }else if($cextData == "04")
                {
                    $dataflow =  [
                        [ 'CSTEPNO' => '88', 'apv' => $_POST["seminc"]], //sem inc
                        [ 'CSTEPNO' => '89', 'apv' => $_POST["seminc"]]
                    ];
                    $fstatus  = $this->updateFlowApv($form , $dataflow);
                    $status = $fstatus['status'];
                }else if($cextData == "07"){
                    $dataflow =  [
                        [ 'CSTEPNO' => '26', 'apv' => $_POST["enginc"]], //eng inc

                    ];
                    $fstatus  = $this->updateFlowApv($form , $dataflow);
                    $status = $fstatus['status'];

                }else if($cextData == "08")
                {
                    $status = $this->updateQOR();
                }else if($cextData == "11")
                {
                    $status = $this->updateQE();
                }else
                {
                    $status = true;
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
        $datadwgfile = array();
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
         return true;
    }

    private function updateQOR()
    {
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear = $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
        $m_action = $_POST["m_action"];
        $m_due_date = $_POST["m_due_date"];
        $m_in_charge = $_POST["m_in_charge"];
        $c_action = $_POST["c_action"];
        $c_due_date = $_POST["c_due_date"];
        $c_in_charge = $_POST["c_in_charge"];
        $dataqor = array();
        $i=0;
        $qid = 1;
        foreach($m_action as $m)
        {
            if(($m <> "")&&($m_due_date[$i] <> "")&&($m_in_charge[$i] <> ""))
            {
                $dataqor[] = array(
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'TYPENO' => 'M',
                    'QID'    => $qid,
                    'QACTION' => $m,
                    'QDUEDATE' => $m_due_date[$i],
                    'QINCHARGE' => $m_in_charge[$i]
                );
                $qid++;
            }
        }
        $i=0;
        foreach($c_action as $c)
        {
            if(($c <> "")&&($c_due_date[$i] <> "")&&($c_in_charge[$i] <> ""))
            {
                $dataqor[] = array(
                    'CYEAR2' => $cyear2,
                    'NRUNNO' => $nrunno,
                    'TYPENO' => 'C',
                    'QID'    => $qid,
                    'QACTION' => $c,
                    'QDUEDATE' => $c_due_date[$i],
                    'QINCHARGE' => $c_in_charge[$i]
                );
                $qid++;
            }
        }
        if(count($dataqor) > 0)
        {
            $this->qoi->delete("QOI_QOR", array('CYEAR2' => $cyear2,'NRUNNO' => $nrunno));
            $this->qoi->insert_batch("QOI_QOR",$dataqor);
        }
        $path = $this->upload_path.$nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno;
        if (!is_dir($path))
        {
            mkdir($path, 0777, true);
        }
        $upfile =  $this->uploadMultiFile($_FILES, ['MEASUREFILE','CORRECTFILE'], $path);
        $fid = $this->qoi->generate_attfile_id($nfrmno,$vorgno,$cyear,$cyear2,$nrunno);
        $dataqorfile = array();
        foreach ($upfile["files"] as $fileType => $fileArray) {
         foreach ($fileArray as $file) {
             $dataqorfile[] = array
             (
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'ITEMNO' => $fid,
                'TYPENO' => ($fileType == "MEASUREFILE"? "4":($fileType == "CORRECTFILE"? "5":"")),
                'SFILE'  => $file['file_name'],
                'SEMPNO' => $_POST["empno"]
             );
             $fid++;
         }
         }
         if(count($dataqorfile) > 0)
         {
             $this->qoi->insert_batch("ATTQOIFRM",$dataqorfile);
         }
        return true;
    }

    private function updateQE()
    {
        $nfrmno = $_POST["nfrmno"];
        $vorgno = $_POST["vorgno"];
        $cyear = $_POST["cyear"];
        $cyear2 = $_POST["cyear2"];
        $nrunno = $_POST["nrunno"];
        $qe_option = $_POST["qe_option"];
        $con = array(
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        );
        $dataqe = array(
            'QECHECK' => $qe_option,
            'RQCN'    => ($qe_option == "1" ? ($_POST["rq_no"] ?? "") : ($qe_option == "2" ? ($_POST["cn_no"] ?? "") : ""))
        );
        $this->qoi->update("QOIFORM", $dataqe , $con);
        $path = $this->upload_path.$nfrmno."_".$vorgno."_".$cyear."_".$cyear2."_".$nrunno;
        if (!is_dir($path))
        {
            mkdir($path, 0777, true);
        }
        $upfile =  $this->uploadMultiFile($_FILES, ['QEFILE'], $path);
        $fid = $this->qoi->generate_attfile_id($nfrmno,$vorgno,$cyear,$cyear2,$nrunno);
        $dataqefile = array();
        foreach ($upfile["files"] as $fileType => $fileArray) {
         foreach ($fileArray as $file) {
             $dataqefile[] = array
             (
                'NFRMNO' => $nfrmno,
                'VORGNO' => $vorgno,
                'CYEAR'  => $cyear,
                'CYEAR2' => $cyear2,
                'NRUNNO' => $nrunno,
                'ITEMNO' => $fid,
                'TYPENO' => '6',
                'SFILE'  => $file['file_name'],
                'SEMPNO' => $_POST["empno"]
             );
             $fid++;
         }
         }
        if(count($dataqefile) > 0)
        {
            $this->qoi->insert_batch("ATTQOIFRM",$dataqefile);
        }
       return true;
    }

    public function delfile()
    {
        $path = $this->upload_path.$_POST["nfrmno"]."_".$_POST["vorgno"]."_".$_POST["cyear"]."_".$_POST["cyear2"]."_".$_POST["nrunno"]."/";
        $itemno = $_POST['itemno'];
        $sfile = $_POST['sfile'];
        $this->deleteFile($sfile,$path);
        $this->qoi->trans_start();
        $delfn = $this->qoi->delete("ATTQOIFRM","CYEAR2 ='".$_POST["cyear2"]."' AND NRUNNO = '".$_POST["nrunno"]."' AND ITEMNO = '".$itemno."' AND SFILE = '".$sfile."'");
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

    public function testmeeting()
    {
        $organizerName = 'ระบบจองห้อง';
        $organizerEmail = 'kanittha@mitsubishielevatorasia.co.th';

        $attendees = [
            ['name' => 'Kanittha', 'email' => 'kanittha@mitsubishielevatorasia.co.th'],
            ['name' => 'EP Fueangfa Room', 'email' => 'fueangfa@mitsubishielevatorasia.co.th'], // เพิ่มห้อง
        ];

        $start = '2025-07-20 14:00:00';
        $end = '2025-07-20 15:00:00';
        $startUTC = gmdate('Ymd\THis\Z', strtotime($start . ' +7 hours'));
        $endUTC = gmdate('Ymd\THis\Z', strtotime($end . ' +7 hours'));
        $dtstamp = gmdate('Ymd\THis\Z');
        $uid = uniqid();

        // สร้าง .ics content
        $ical = "BEGIN:VCALENDAR\r\n";
        $ical .= "PRODID:-//Booking System//MEA//EN\r\n";
        $ical .= "VERSION:2.0\r\n";
        $ical .= "CALSCALE:GREGORIAN\r\n";
        $ical .= "METHOD:REQUEST\r\n";
        $ical .= "BEGIN:VEVENT\r\n";
        $ical .= "UID:$uid\r\n";
        $ical .= "DTSTAMP:$dtstamp\r\n";
        $ical .= "DTSTART:$startUTC\r\n";
        $ical .= "DTEND:$endUTC\r\n";
        $ical .= "SUMMARY:จองห้องประชุม EP Fueangfa Room\r\n";
        $ical .= "DESCRIPTION:ระบบจองห้องโดยคุณขนิษฐา\r\n";
        $ical .= "LOCATION:EP Fueangfa Room\r\n";
        $ical .= "ORGANIZER;CN=$organizerName:mailto:$organizerEmail\r\n";

        // foreach ($attendees as $a) {
        //     $ical .= "ATTENDEE;CN={$a['name']};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:{$a['email']}\r\n";
        // }

        foreach ($attendees as $a) {
            if ($a['email'] === 'fueangfa@mitsubishielevatorasia.co.th') {
                // สำหรับห้องประชุม
                //$ical .= "ATTENDEE;CN={$a['name']};CUTYPE=RESOURCE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:mailto:{$a['email']}\r\n";
                $ical .= "ATTENDEE;CN={$a['name']};CUTYPE=RESOURCE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:{$a['email']}\r\n";

            } else {
                // สำหรับผู้เข้าร่วมทั่วไป
                $ical .= "ATTENDEE;CN={$a['name']};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:{$a['email']}\r\n";
            }
        }

        $ical .= "SEQUENCE:0\r\n";
        $ical .= "STATUS:CONFIRMED\r\n";
        $ical .= "TRANSP:OPAQUE\r\n";
        $ical .= "BEGIN:VALARM\r\n";
        $ical .= "TRIGGER:-PT10M\r\n";
        $ical .= "DESCRIPTION:Reminder\r\n";
        $ical .= "ACTION:DISPLAY\r\n";
        $ical .= "END:VALARM\r\n";
        $ical .= "END:VEVENT\r\n";
        $ical .= "END:VCALENDAR\r\n";
        echo nl2br(htmlspecialchars($ical));

        //exit;
        $data = array(
            "TO" => 'fueangfa@mitsubishielevatorasia.co.th',
            "CC" => 'kanittha@mitsubishielevatorasia.co.th',
            //"CC" => ['kanittha@mitsubishielevatorasia.co.th', 'sutthipongt@mitsubishielevatorasia.co.th'],
            // "CC" => ['sutthipongt@mitsubishielevatorasia.co.th'],
            "SUBJECT" =>'📅 จองห้องประชุมแบบ PHPMailer',
            "MIME"    => $ical,
            "BODY"    => "test"
        );
        $this->mail->sendmailMIME($data);


    }

}