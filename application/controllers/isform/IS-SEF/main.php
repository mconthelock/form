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
        $this->load->model('isform/IS-SEF/sef_model', 'sm');
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        $cyear2       = $this->input->get('y2');
        $nrunno       = $this->input->get('runNo');
        if (!$cyear2 && !$nrunno) {
            $this->views('isform/IS-SEF/assign');
        } else {
            $this->views('isform/IS-SEF/views');
        }
        
    }

    public function form()
    {
        $nfrmno       = $this->input->get('NFRMNO');
        $vorgno       = $this->input->get('VORGNO');
        $cyear        = $this->input->get('CYEAR');
        $cyear2       = $this->input->get('CYEAR2');
        $nrunno       = $this->input->get('NRUNNO');
        $data         = [
            'NFRMNO' => $nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => $nrunno
        ];
        $data_session = $this->sm->select('ISEVA_SESSIONS');
        // if ($data_session[0]->EVAPRO_AVG != null) {
        //     $this->views('isform/IS-SEF/views', $data);
        // } else {
        //     $this->views('isform/IS-SEF/index', $data);
        // }
        $this->views('isform/IS-SEF/views', $data);
        // if (!$cyear2 && !$nrunno) {
        //     $this->views('isform/IS-SEF/views', $data);
        // } else {

        //     $this->views('isform/IS-SEF/index');
        // }
    }

    public function old_views()
    {
        $this->views('isform/IS-SEF/index2');
    }

    public function assign()
    {
        $this->views('isform/IS-SEF/assign');
    }

    public function getCriteria()
    {
        $data = $this->sm->getCriteria();
        echo json_encode($data);
    }

    public function insert_form()
    {
        $data = $this->input->post();

        $sessionData = [
            'NFRMNO'        => $data['NFRMNO'],
            'VORGNO'        => $data['VORGNO'],
            'CYEAR'         => $data['CYEAR'],
            'CYEAR2'        => $data['CYEAR2'],
            'NRUNNO'        => $data['NRUNNO'],
            'PROJECT_ID'    => isset($data['PROJECT_ID']) ? $data['PROJECT_ID'] : null,
            'EVAPRO_AVG'    => $data['PRO_AVG'],
            'EVAAPP_AVG'    => $data['APP_AVG'],
            'OVERALL_AVG'   => $data['OVERALL_AVG'],
            'OVERALL_LEVEL' => $data['LEVEL'],
            'COMMENTS'      => $data['COMMENT']
        ];

        $scoreData = [];

        foreach ($data['SCORE'] as $evaId => $score) {
            $scoreData[] = [
                'NFRMNO' => $data['NFRMNO'],
                'VORGNO' => $data['VORGNO'],
                'CYEAR'  => $data['CYEAR'],
                'CYEAR2' => $data['CYEAR2'],
                'NRUNNO' => $data['NRUNNO'],
                'EVA_ID' => $evaId,
                'SCORE'  => $score
            ];
        }

        print_r($sessionData);
        print_r($scoreData);

        // insert main
        // $this->sm->insert('ISEVA_SESSIONS', $sessionData);
        // $this->db->insert('ISEVA_SESSIONS', $sessionData);

        // insert batch score
        // $this->sm->insertBatch('ISEVA_SCORES', $scoreData);
        // $this->db->insert_batch('ISEVA_SCORES', $scoreData);
    }

}