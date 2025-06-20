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
}
?>