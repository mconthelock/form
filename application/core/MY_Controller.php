<?php
    defined('BASEPATH') OR exit('No direct script access allowed');
    use Coolpraz\PhpBlade\PhpBlade;
    class MY_Controller extends CI_Controller {
        protected $views = APPPATH . 'views';
        protected $cache = APPPATH . 'cache';
        protected $blade;
        protected $callback;

        public function __construct(){
            parent::__construct();
            $this->callback = 'https://' . $_SERVER['HTTP_HOST'].'/form/authen/index/6/';
            //$this->callback = 'https://' . $_SERVER['HTTP_HOST'].'/itadmin';
            //$this->session_expire();
            $this->blade = new PhpBlade($this->views, $this->cache);
            $GLOBALS['version'] = $_ENV['STATE'] == 'development' ? time() : $_ENV['VERSION'];
            $this->load->database();
            $this->load->library('mail');
        }

        public function views($view_name, $data = array()){
            echo $this->blade->view()->make($view_name, $data);
        }

        public function session_expire(){
            if(!isset($_SESSION['user'])){
                if ($this->isAjaxRequest()) {
                    echo json_encode(['status' => '403', 'url' => $this->callback]);
                    exit;
                } else {
                    redirect($this->callback);
                    session_write_close();
                    exit;
                }
            }
        }

        public function isAjaxRequest() {
            return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
        }

        public function _servername(){
            return strtolower(preg_replace('/\d+/u', '', gethostname()));
        }


        /** 
         * Send email
         */
        public function sendMail(){
            $data = $this->input->post('data');
            if (empty($data)) {
                echo json_encode(['status' => 'error', 'message' => 'No data provided for sending email.']);
                return;
            }
            $this->mail->sendmail($data);
        }

         /**
         * convert date to database format
         * @param string $date
         */
        public function conVdateToDB($date){
            return date('j/n/Y',strtotime($date));
        }

        /**
         * Convert image to base64
         * @param string $pathFile
         */
        public function conVBase64($pathFile){
            $mimeType = 'image/png';
            $baseURL = '';
            if(!file_exists($pathFile)) return $baseURL;
            $baseURL = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($pathFile));
            return $baseURL;
        }
    }