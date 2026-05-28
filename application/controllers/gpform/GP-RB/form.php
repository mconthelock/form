<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
class form extends MY_Controller{
    use formApi, flow, formmst;
    protected $title;
    protected $client;
    protected $formname = 'GP-RB';
    protected $formno = '4';
    protected $formorg = '030101';
    protected $formyear = '26';

    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
    }

    public function main(){

        $data = array(
            'NFRMNO' => $this->formno,
            'VORGNO' => $this->formorg,
            'CYEAR' => $this->formyear,
            'empno' => isset($_GET["empno"]) ? $_GET['empno'] : '' ,
        );
        if(isset($_GET["runNo"]) && $_GET["runNo"] != "") {
            $data['CYEAR2'] = $_GET['y2'];
            $data['NRUNNO'] = $_GET['runNo'];
            $data['EMPNO'] = $data['empno'];
            //$data['cextData'] = $this->getExtData($data);
            //echo $data['mode']     = $this->getMode($form);
            $this->views('gpform/GP-RB/show', $data);
        } else {
            $this->views('gpform/GP-RB/create', $data);
        }
    }
}