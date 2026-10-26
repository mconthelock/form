<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/formmst.php';

class Form extends MY_Controller{
    use formmst;
    protected $formkey;
    protected $client;
    protected $formname;

    public function __construct(){
        parent::__construct();
         $this->client = new Client(['verify' => false]);
        $this->formname = 'DEV';
    }

    private function getFormIsDev($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP']."/form/is/is-dev/search", [
                'json' => [
                    'NFRMNO' => $condition['NFRMNO'],
                    'VORGNO' => $condition['VORGNO'],
                    'CYEAR'  => $condition['CYEAR'],
                    'CYEAR2' => $condition['CYEAR2'],
                    'NRUNNO' => $condition['NRUNNO'],
                    'EMPNO'  => $condition['EMPNO'],
                ]
            ]);
            return json_decode($response->getBody(), true);
        }catch(Exception $e){
            return [];
        }
    }

    private function isDraftEditable($form, $empno){
        if (empty($form) || empty($empno)) return false;
        $row = isset($form[0]) ? $form[0] : $form;
        if (!is_array($row)) return false;

        $status = isset($row['STATUS']) ? trim((string)$row['STATUS']) : null;
        $cst = isset($row['form']['CST'])
            ? trim((string)$row['form']['CST'])
            : (isset($row['CST']) ? trim((string)$row['CST']) : null);

        $isDraft = ($status === '0' || strtolower((string)$status) === 'draft' || $cst === '0');
        $inputBy = $row['INPUTBY'] ?? ($row['INPUT_BY'] ?? ($row['form']['VINPUTER'] ?? ($row['VINPUTER'] ?? '')));

        return $isDraft && trim((string)$empno) === trim((string)$inputBy);
    }

    public function main(){
        $data = $this->setFormProp($this->formname);
        $data['CATEGORY'] = 2;
        $data['PLANYEAR'] = date('Y');
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 1;
        if(isset($data["NRUNNO"]) && $data["NRUNNO"] != 0) {
            $form = $this->getFormIsDev($data);
            $forceEditMode = empty($form) && isset($_GET['mode']) && (string)$_GET['mode'] === '2';
            if ($this->isDraftEditable($form, $data['EMPNO']) || $forceEditMode) {
                $data['mode'] = 2;
                $this->views("isform/IS-DEV/create", $data);
                return;
            }
            $this->views("isform/IS-DEV/show", $data);
        }else{
            //Create mode
            $this->views("isform/IS-DEV/create", $data);
        }
    }

    public function show(){
        $data = $this->setFormProp($this->formname);
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 2;
        $this->views("isform/IS-DEV/show", $data);
    }
}