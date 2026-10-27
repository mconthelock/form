<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Main extends MY_Controller {
    public function __construct()
    {
        parent::__construct();
        $this->load->model('form_model', 'form');

    }

    public function index()
    {
        $nfrmno = $this->input->get('no');
        $vorgno = $this->input->get('orgNo');
        $cyear  = $this->input->get('y');
        $cyear2 = $this->input->get('y2');
        $nrunno = $this->input->get('runNo');
        $empno  = $this->input->get('empno');
        $form   = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno,
        ];
        if (!$cyear2 && !$nrunno) {
            $this->views('psform/PS-UPI/index');
        } else {
            $checkReturnb = $this->form->checkReturn($form, $empno);
            
            if (!empty($checkReturnb)) {
                $this->views('psform/PS-UPI/edit');
            } else {
                $this->views('psform/PS-UPI/views');
            }
        }
        // Controller entry point.

    }

    public function report()
    {
        $this->views('psform/PS-UPI/report');
    }
}