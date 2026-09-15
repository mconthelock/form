<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use GuzzleHttp\Client;
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/_file.php';

class jig extends MY_Controller {
    use _Form, _File;
    public function __construct(){
        parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/IE/IE-JIG/";
    }

    public function index(){
        $this->show_create_jig_form();
    }

    public function show_create_jig_form(){
        $data = [];
        $parameters = [
            'NFRMNO' => 'no', 'VORGNO' => 'orgNo', 'CYEAR' => 'y',
            'CYEAR2' => 'y2', 'NRUNNO' => 'runNo', 'EMPNO' => 'empno',
        ];
        foreach ($parameters as $key => $parameter) {
            $value = $this->input->get($parameter);
            // Preserve leading zeroes in organization and employee numbers.
            if ($value !== null && (!is_string($value) || !preg_match('/^[0-9]*$/D', $value))) {
                show_error('Invalid parameter: ' . $parameter, 400);
                return;
            }
            $data[$key] = $value ?? '';
        }
        foreach (['NFRMNO', 'VORGNO', 'CYEAR', 'EMPNO'] as $key) {
            if ($data[$key] === '') {
                show_error('Missing parameter: ' . $parameters[$key], 400);
                return;
            }
        }
        if ($data['NRUNNO'] !== '' && $data['CYEAR2'] === '') {
            show_error('Missing parameter: y2', 400);
            return;
        }

        $data['mode'] = $this->getMode($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'], $data['CYEAR2'], $data['NRUNNO'], $data['EMPNO']);
        $data['pageMode'] = $data['NRUNNO'] === '' ? 'create' : ($data['mode'] === '2' ? 'edit' : 'view');
        // empno is the caller's form context; it does not establish a login session.
        $data['inputBy'] = $data['EMPNO'];
        $user = $_SESSION['user'] ?? null;
        $data['inputName'] = $user && (string)($user->SEMPNO ?? '') === $data['EMPNO'] ? ($user->SNAME ?? '') : '';
        $data['formno'] = '';
        if ($data['NRUNNO'] !== '') {
            $data['exdata'] = $this->getExtData($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'], $data['CYEAR2'], $data['NRUNNO'], $data['EMPNO']);
            $data['formno'] = $this->toFormNumber($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'], $data['CYEAR2'], $data['NRUNNO']);
        }
        $this->views('ieform/IE-JIG/request_form', $data);
    }
}