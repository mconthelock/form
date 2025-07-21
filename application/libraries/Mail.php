<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class Mail {
	private $ci;
    private $admin;
	private $from;
	private $from_name;

	public function __construct(){
        $this->ci =& get_instance();
		$this->admin = isset($_ENV['MAIL_ADMIN']) ? $this->convert_type($_ENV['MAIL_ADMIN']) : 'wsd@MitsubishiElevatorAsia.co.th';
		$this->from  = isset($_ENV['MAIL_FROM']) ? $_ENV['MAIL_FROM'] : 'noreplay@MitsubishiElevatorAsia.co.th';
		$this->from_name = isset($_ENV['MAIL_NAME']) ? $_ENV['MAIL_NAME'] : 'Webflow System';
    }

	private function begining(){
        $mail = new PHPMailer();
        $mail->Mailer	= 'mail';
		$mail->CharSet 	= 'UTF-8';
		$mail->Port 	= 25;
        $mail->From 	= $this->from;
		$mail->FromName	= $this->from_name;
        $mail->isHTML(true);
        return $mail;
	}

	private function set_to($mail, $data){
        $data = $this->convert_type($data);
        foreach($data as $d){
			$mail->addAddress($d);
        }
        return $mail;
    }

    private function set_cc($mail, $data){
        $data = $this->convert_type($data);
        foreach($data as $d){
            $mail->AddCC($d);
        }
        return $mail;
    }

    private function set_bcc($mail, $data){
        $data = $this->convert_type($data);
        foreach($data as $d){
            $mail->AddBCC($d);
        }
        return $mail;
    }

    private function convert_type($data){
        if(gettype($data) == 'string'){
            return explode(',', $data);
        }else{
            return $data;
        }
    }

    private function setMime($mail,$ical){
        $mail->ContentType = 'multipart/alternative';
        $mail->addStringAttachment($ical, 'invite.ics', 'base64', 'text/calendar; method=REQUEST; charset=UTF-8');
    }

    /**
     * Send e-mail.
     * @param   array $d => d['VIEW']    = 'mail/message'
	 *						d['SUBJECT'] = 'Test'
	 *						d['TO']      = array('a@mail.com')
     *                      d['CC']      = array('b@mail.com')
     *                      d['BODY']    = array('test1', 'test2')
	 *						d['ENFILE']  = array(['filename'=>'file.xlsx', 'content'=>ob_get_contents])
     */
    public function sendmail($d){
		$mail = $this->begining();
        $view = isset($d['VIEW']) ? $d['VIEW'] : 'layouts/mail/mailAlert';
        $d['SUBJECT'] = isset($d['SUBJECT']) ? $d['SUBJECT'] : $mail->Subject;

        // Set TO.
        if((isset($d['TO'])) && (count($d['TO']) != 0)){
            $mail = $this->set_to($mail, $d['TO']);
            $mail = $this->set_bcc($mail, $this->admin);
        }else{
            $mail = $this->set_to($mail, $this->admin);
            $d['TO'] = $this->admin;
        }

        // Set CC.
        if(isset($d['CC'])){
            $mail = $this->set_cc($mail, $d['CC']);
        }

        // Set BCC.
        if(isset($d['BCC'])){
            $mail = $this->set_bcc($mail, $d['BCC']);
        }

		// Attach file by encode.
		if(isset($d['ENFILE'])){
			foreach($d['ENFILE'] as $f){
				$mail->AddStringAttachment($f['content'], $f['filename']);
			}
		}

        if(isset($d['MIME'])){

            $this->setMime($mail,$d['MIME']);
        }

        $mail->Subject = $d['SUBJECT'];
        $mail->Body = $this->ci->load->view($view, $d, true);
        // return $mail->send();

        // Generate error
        if ( ! $mail->send())
		{
			return ['status' => FALSE, 'message' => $mail->ErrorInfo];
		} else {
			return [
                'status'    => TRUE,
                'to'        => $d['TO'],
                'subject'   => $d['SUBJECT'],
                'body'      => $d['BODY'],
                'view'      => $view,
                'message'   => 'Email sent successfully.'
            ];
		}
    }

    public function sendmailMIME($d){
        try {
            $mail = new PHPMailer();
            $mail->Mailer	= 'mail';
            $mail->CharSet 	= 'UTF-8';
            $mail->Port 	= 25;
            $mail->From 	= "kanittha@mitsubishielevatorasia.co.th";
            $mail->FromName	= "OWNER";
            $mail->isHTML(true);


            // เนื้อหาเมล
            $mail->Subject = $d['SUBJECT'];
            $this->set_to($mail, $d['TO']);
            $this->set_cc($mail, $d['CC']);
            //old
            $mail->Body = $d['BODY'];
            $mail->AltBody = $d['BODY'];
            $mail->Ical = $d['MIME'];
    
            $mail->send();
            echo 'ส่งเมลสำเร็จ!';
        }catch (Exception $e) {
            echo "ส่งเมลไม่สำเร็จ: {$mail->ErrorInfo}";
        }
    }

    public function sendfilemail($d)
    {
      

        

            
            $subject = "จองห้องประชุม EP Fueangfa Room";
            $description = "ระบบจองห้องโดยคุณขนิษฐา";
            $location = "EP Fueangfa Room";
            $organizer_email = "kanittha@mitsubishielevatorasia.co.th";
            $room_email = "fueangfa@mitsubishielevatorasia.co.th";
            
            $uid = uniqid();
            $dtstamp = gmdate('Ymd\THis\Z');
            $dtstart = "20250720T140000Z";
            $dtend = "20250720T150000Z";
            
            $ical = "BEGIN:VCALENDAR\r\n" .
                    "PRODID:-//Booking System//MEA//EN\r\n" .
                    "VERSION:2.0\r\n" .
                    "CALSCALE:GREGORIAN\r\n" .
                    "METHOD:REQUEST\r\n" .
                    "BEGIN:VEVENT\r\n" .
                    "UID:$uid\r\n" .
                    "DTSTAMP:$dtstamp\r\n" .
                    "DTSTART:$dtstart\r\n" .
                    "DTEND:$dtend\r\n" .
                    "SUMMARY:จองห้องประชุม EP Fueangfa Room\r\n" .
                    "DESCRIPTION:ระบบจองห้องโดยคุณขนิษฐา\r\n" .
                    "LOCATION:EP Fueangfa Room\r\n" .
                    "ORGANIZER;CN=ระบบจองห้อง:mailto:kanittha@mitsubishielevatorasia.co.th\r\n" .
                    "ATTENDEE;CN=Kanittha Satidpaisankul;ROLE=CHAIR;PARTSTAT=ACCEPTED:mailto:kanittha@mitsubishielevatorasia.co.th\r\n" .
                    "ATTENDEE;CN=EP Fueangfa Room;CUTYPE=RESOURCE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:fueangfa@mitsubishielevatorasia.co.th\r\n" .
                    "SEQUENCE:0\r\n" .
                    "STATUS:CONFIRMED\r\n" .
                    "TRANSP:OPAQUE\r\n" .
                    "BEGIN:VALARM\r\n" .
                    "TRIGGER:-PT10M\r\n" .
                    "DESCRIPTION:Reminder\r\n" .
                    "ACTION:DISPLAY\r\n" .
                    "END:VALARM\r\n" .
                    "END:VEVENT\r\n" .
                    "END:VCALENDAR\r\n";    
            // สร้าง PHPMailer
            $mail = new PHPMailer();
        
            try {
                $mail->Mailer = 'mail';
                $mail->CharSet = 'UTF-8';
                $mail->Port = 25;
                $mail->From = $organizer_email;
                $mail->FromName = "ระบบจองห้อง";
                $mail->isHTML(true);
        
                $mail->Subject = $subject;
                $mail->Body = "กรุณาคลิกเพื่อดาวน์โหลดไฟล์คำเชิญการประชุม และเปิดด้วย Outlook เพื่อส่งจองห้องประชุม";
                $this->set_to($mail, $d['TO']);
                if (!empty($d['CC'])) {
                    $this->set_cc($mail, $d['CC']);
                }
        
                // แนบไฟล์ .ics แบบเป็นไฟล์ธรรมดาให้โหลด
                $mail->addStringAttachment($ical, 'invite.ics', 'base64', 'text/calendar; method=REQUEST; charset=UTF-8');
        
                $mail->send();
                echo "ส่งเมลสำเร็จ!";
            } catch (Exception $e) {
                echo "ส่งเมลไม่สำเร็จ: {$mail->ErrorInfo}";
            }
        
        
    }
}
?>