<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
class form extends MY_Controller{
    use _Form;
    
    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('qaform/QA-INS/autorize_model', 'atr');
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->client = new Client(['verify' => false]);
    }

    public function main(){
        if(isset($_GET["no"]) && $_GET["no"] != "" && isset($_GET["orgNo"]) && $_GET["orgNo"] != "" && isset($_GET["y"]) && $_GET["y"] != "" ) {
            $data = [
                'NFRMNO' => $_GET['no'],
                'VORGNO' => $_GET['orgNo'],
                'CYEAR'  => $_GET['y'],
            ];

        }else{
            $form = $this->form->getFormMaster('QA-INS');
            if(!empty($form)){
                $data = [
                    'NFRMNO' => $form[0]->NNO,
                    'VORGNO' => $form[0]->VORGNO,
                    'CYEAR'  =>$form[0]->CYEAR,
                ];
            }
        }
        $data['mode']  = 1; // create mode
        $data['empno'] = isset($_GET["empno"]) ? $_GET['empno'] : '' ;

        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {
            $data['return']   = false;
            $data['cextData'] = '';
            $data['NRUNNO']   = $_GET["runNo"];
            $data['CYEAR2']   = $_GET["y2"];
            $data['mode']     = $this->getMode($_GET["no"], $_GET["orgNo"], $_GET["y"], $_GET["y2"], $_GET["runNo"], $data['empno']);
            $form       = [
                'NFRMNO' => $data['NFRMNO'],
                'VORGNO' => $data['VORGNO'],
                'CYEAR'  => $data['CYEAR'],
                'CYEAR2' => $data['CYEAR2'],
                'NRUNNO' => $data['NRUNNO'],
            ];
            $getEmpFlow = $this->form->getEmpFlow($form, $data['empno']);
            if (!empty($getEmpFlow)) {
                $data['cextData'] = $getEmpFlow[0]->CEXTDATA;
                $data['return'] = count($this->form->checkReturnb($form, $getEmpFlow[0]->CSTEPNEXTNO)) > 0 ? true : false;
            }
            if($data['return']){
                $this->views('qaform/QA-INS/form', $data);
            }else{
                $this->views('qaform/QA-INS/view', $data);
            }
        }else{
            // $data['item'] = $this->atr->getItem();
            $this->views('qaform/QA-INS/form', $data);
        }
    }

    public function getItem(){
        $item = $this->atr->getItem();
        echo json_encode($item);
    }

    public function getSection(){
        $section = $this->atr->getSection();
        echo json_encode($section);
    }

    public function getUserBySection($id = ''){
        if($id == ''){
            $user = $this->atr->getUserByID();
        }else{
            $user = $this->atr->getUserByID(['SEC_ID' => $id]);
        }
        echo json_encode($user);
    }

    public function getUser(){
        $user = $this->atr->getUser();
        echo json_encode($user);
    }

    public function getUserOrganize(){
        $user = $this->atr->getUserOrganize();
        echo json_encode($user);
    }

    // https://amecwebtest.mitsubishielevatorasia.co.th/form/qaform/QA-INS/form/test
    public function test()
    {
        $organizerName = 'ระบบจองห้อง';
        // $organizerEmail = 'noreplay@MitsubishiElevatorAsia.co.th';
        // $organizerName = 'AMEC (IS) SUTTHIPONG TANGMONGKHONCHAROEN';
        $organizerEmail = 'kanittha@MitsubishiElevatorAsia.co.th';

        $attendees = [
            ['name' => 'Kanittha', 'email' => 'kanittha@mitsubishielevatorasia.co.th'],
            // ['name' => 'Kunyane', 'email' => 'kunyane@mitsubishielevatorasia.co.th'],
            ['name' => 'Sutthipong', 'email' => 'sutthipongt@mitsubishielevatorasia.co.th'],
            ['name' => 'EP Fueangfa Room', 'email' => 'fueangfa@mitsubishielevatorasia.co.th'],
        ];

        $start = '2025-07-20 14:00:00';
        $end = '2025-07-20 15:00:00';
        $dtstart = date('Ymd\THis', strtotime($start)); 
        $dtend = date('Ymd\THis', strtotime($end));
        $dtstamp = gmdate('Ymd\THis\Z');
        $uid = uniqid();
        $eol = "\r\n";

        // ⚙️ สร้าง iCalendar
        $ical = "BEGIN:VCALENDAR{$eol}";
        $ical .= "PRODID:-//Booking System//MEA//EN{$eol}";
        $ical .= "VERSION:2.0{$eol}";
        $ical .= "CALSCALE:GREGORIAN{$eol}";
        $ical .= "METHOD:REQUEST{$eol}";
        $ical .= "BEGIN:VEVENT{$eol}";
        $ical .= "UID:$uid{$eol}";
        $ical .= "DTSTAMP:$dtstamp{$eol}";
        $ical .= "DTSTART;TZID=SE Asia Standard Time:$dtstart{$eol}";
        $ical .= "DTEND;TZID=SE Asia Standard Time:$dtend{$eol}";
        $ical .= "SUMMARY:จองห้องประชุม EP Fueangfa Room{$eol}";
        $ical .= "DESCRIPTION:ระบบจองห้องโดยคุณขนิษฐา{$eol}";
        $ical .= "LOCATION:EP Fueangfa Room{$eol}";
        $ical .= "ORGANIZER;CN=$organizerName:mailto:$organizerEmail{$eol}";

        // 🧑‍🤝‍🧑 เพิ่ม Attendee แบบถูกต้อง
        foreach ($attendees as $a) {
            if ($a['email'] === 'fueangfa@mitsubishielevatorasia.co.th') {
                echo 1;
                // $ical .= "ATTENDEE;CN={$a['name']};CUTYPE=RESOURCE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:{$a['email']}{$eol}";
                // $ical .= "ATTENDEE;CN={$a['name']};CUTYPE=RESOURCE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE:mailto:{$a['email']}{$eol}";
                $ical .= "ATTENDEE;CN={$a['name']};CUTYPE=RESOURCE;ROLE=NON-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:{$a['email']}{$eol}";

                // $ical .= "ATTENDEE;CN={$a['name']};CUTYPE=RESOURCE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:{$a['email']}{$eol}";
            } else {
                echo 2;
                $ical .= "ATTENDEE;CN={$a['name']};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:{$a['email']}{$eol}";
            }
        }

        $ical .= "SEQUENCE:0{$eol}";
        $ical .= "STATUS:CONFIRMED{$eol}";
        $ical .= "TRANSP:OPAQUE{$eol}";
        // 🔑 เพิ่ม Microsoft-specific header เพื่อให้ Outlook ทำงาน
        $ical .= "X-MS-OLK-FORCEINSPECTOROPEN:TRUE{$eol}";
        $ical .= "X-MICROSOFT-CDO-BUSYSTATUS:BUSY{$eol}";
        $ical .= "X-MICROSOFT-CDO-IMPORTANCE:1{$eol}";
        $ical .= "X-MICROSOFT-DISALLOW-COUNTER:FALSE{$eol}";
        $ical .= "X-MS-OLK-CONFTYPE:0{$eol}";
        // 🔔 เพิ่ม Alarm
        $ical .= "BEGIN:VALARM{$eol}";
        $ical .= "TRIGGER:-PT15M{$eol}";
        $ical .= "ACTION:DISPLAY{$eol}";
        $ical .= "DESCRIPTION:Reminder{$eol}";
        $ical .= "END:VALARM{$eol}";

        $ical .= "END:VEVENT{$eol}";
        $ical .= "END:VCALENDAR{$eol}";

        $data = array(
            "TO" => 'fueangfa@mitsubishielevatorasia.co.th',
            "CC" => [
                'sutthipongt@mitsubishielevatorasia.co.th'
            ],
            "SUBJECT" => '📅 จองห้องประชุมแบบ PHPMailer',
            "MIME"    => $ical,
            "BODY"    => "เรียนผู้รับ<br>ระบบจองห้องได้ส่งคำเชิญประชุม กรุณาตรวจสอบในปฏิทิน Outlook ของท่านค่ะ"
        );
        $this->mail->sendmailMIME($data);
    }


}