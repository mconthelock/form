<?php
use GuzzleHttp\Client;
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'controllers/_form.php';
class Main extends MY_Controller {
    use _Form;

    protected $client;
    public function __construct()
    {
        parent::__construct();

    }

    public function index()
    {
        $this->views('psform/PS-VAR/index');
    }
}