<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
class form extends MY_Controller{
    protected $client;
    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
    }

    public function main(){
    }

    public function report(){
        $this->views('ieform/IE-BGR/report');
    }
}