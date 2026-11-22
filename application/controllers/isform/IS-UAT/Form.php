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
        $this->formname = 'IS-UAT';
    }

    private function getFormIsUat($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP']."/form/is/is-uat/search", [
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

    private function resolveFormProp(){
        try{
            $data = $this->setFormProp($this->formname);
            if (!empty($data)) {
                return $data;
            }
        }catch(Exception $e){
            // Fallback to query params if IS-UAT is not yet registered in formmst
        }

        $get = array_change_key_case($_GET, CASE_LOWER);
        return [
            'NFRMNO' => isset($get['no']) ? $get['no'] : '',
            'VORGNO' => isset($get['orgno']) ? $get['orgno'] : '',
            'CYEAR'  => isset($get['y']) ? $get['y'] : date('y'),
            'CYEAR2' => isset($get['y2']) ? $get['y2'] : date('Y'),
            'NRUNNO' => isset($get['runno']) ? $get['runno'] : 0,
            'EMPNO'  => isset($get['empno']) ? $get['empno'] : '',
        ];
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
        $data = $this->resolveFormProp();
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 1;
        if(isset($data["NRUNNO"]) && $data["NRUNNO"] != 0) {
            $form = $this->getFormIsUat($data);
            $forceEditMode = empty($form) && isset($_GET['mode']) && (string)$_GET['mode'] === '2';
            if ($this->isDraftEditable($form, $data['EMPNO']) || $forceEditMode) {
                $data['mode'] = 2;
                $this->views("isform/IS-UAT/create", $data);
                return;
            }
            $this->views("isform/IS-UAT/show", $data);
        }else{
            // Create mode
            $this->views("isform/IS-UAT/create", $data);
        }
    }

    public function show(){
        $data = $this->resolveFormProp();
        if(empty($data)) throw new Exception("Error Processing Request", 1);

        $data['mode'] = 2;
        $this->views("isform/IS-UAT/show", $data);
    }
}
