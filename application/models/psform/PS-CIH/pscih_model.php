<?php
defined('BASEPATH') or exit('No direct script access allowed');

class pscih_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->sk = $this->load->database('SKID', TRUE);

    }
}