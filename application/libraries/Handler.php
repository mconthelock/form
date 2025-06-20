<?php
/**
 * Define a custom error handler so we can log PHP errors
 * @author	Mr.Pathanapong Sokpukeaw
 * @since   2023-09-14
 * @note    Set => core/Exceptions.php
 *              => libraries/Mail.php
 */
if(!defined('BASEPATH')) exit('No direct script access allowed');

class Handler{
    public $_err; // Show error on web.
	public $_ex; // Set try{...}catch(Exception $e){...}
    public $_mail;	// Send error to mail admin.
    public $_message = '';

    function __construct($config = []){
        $this->_err  = isset($_ENV['APP_ERR_DSP']) ? ($_ENV['APP_ERR_DSP']==='true') : true;
        $this->_ex   = isset($_ENV['APP_ERR_EXCEPTION']) ? ($_ENV['APP_ERR_EXCEPTION']==='true') : true;
        $this->_mail = isset($_ENV['APP_ERR_MAIL']) ? ($_ENV['APP_ERR_MAIL']==='true') : false;

        $this->_initialize($config);
        $this->_error_handler();
        $this->_exception_handler();
        $this->_shutdown();
        $this->setShowError($this->_err);
        $ex =& load_class('Exceptions', 'core');
        $ex->buffer = true;
    }

	private function _initialize($config = []){
		foreach ($config as $key => $val) {
			if(isset($this->$key)){
				$this->$key = $val;
			}
		}
	}

	/**
	 * An uncaught Exception was encountered
	 * Type: ErrorException
     * @since   2023-09-14
	 */
	private function _exception_handler(){
        function exceptionHandler($exception){
            $ci =& get_instance();
            $_error =& load_class('Exceptions', 'core');
            if($ci->handler->_message != $exception->getMessage()){
                $_error->log_exception('error', 'Exception: '.$exception->getMessage(), $exception->getFile(), $exception->getLine());
            }
            $_error->show_exception($exception);
        }
        set_exception_handler('exceptionHandler');
    }

	/**
	 * A PHP Error was encountered
	 * Severity: (*** Not Error ***)
     * @author  Mr.Pathanapong Sokpukeaw
	 * @since	2023-09-15
     */
    private function _error_handler(){
        function errorHandler($severity, $message, $filepath, $line){
            $ci =& get_instance();
            $_error =& load_class('Exceptions', 'core');
            $_error->log_exception($severity, $message, $filepath, $line);
            if($ci->handler->_ex){
                $ci->handler->_message = $message;
                throw new ErrorException($message, 0, $severity, $filepath, $line);
            }else{
                $_error->show_php_error($severity, $message, $filepath, $line);
            }
        }
        set_error_handler('errorHandler');
    }

	/**
	 * Cancel error handler codeigniter all and add shutdown funtion
	 * Register a function for execution on shutdown
     * @author  Mr.Pathanapong Sokpukeaw
	 * @since	2023-09-16
	 */
	private function _shutdown(){
		function shutDownFunction(){
            $ci =& get_instance();
            $last_error = error_get_last();
            if(isset($last_error) && ($last_error['type'] & (E_ERROR | E_PARSE | E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_COMPILE_WARNING))){
                $_error =& load_class('Exceptions', 'core');
                $_error->log_exception($last_error["type"], $last_error["message"], $last_error["file"], $last_error["line"]);
                $_error->show_php_error($last_error["type"], $last_error["message"], $last_error["file"], $last_error["line"]);
            }
            $ci->handler->email();
		}
		register_shutdown_function('shutDownFunction');
	}

    /**
     * Send error to e-mail admin.
     * @author  Mr.Pathanapong Sokpukeaw
     */
    public function email(){
        if($this->_mail){
            $ci =& get_instance();
            $ex =& load_class('Exceptions', 'core');
            if($ex->message != ''){
                $ci->load->library('mail');
                $data = array(
                    'SUBJECT' => 'Application Error 😒',
                    'BODY'    => array($ex->message)
                );
                $ci->mail->sendmail($data);
            }
        }
    }

    /**
     * Set show error to web.
     */
	public function setShowError($val){
		error_reporting(0);
        if($val){
            ini_set('display_errors', 1);
        }else{
            ini_set('display_errors', 0);
        }
	}
}