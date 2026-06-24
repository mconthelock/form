<?php
use GuzzleHttp\Client;
defined('BASEPATH') or exit('No direct script access allowed');
// require_once APPPATH . 'controllers/_form.php';
require_once APPPATH . 'controllers/api/webform/form.php';
class Main extends MY_Controller {
    use formApi;

    protected $client;
    public function __construct()
    {
        parent::__construct();
        $this->load->model('psform/PS-CI/psci_model', 'psci');
        $this->client = new Client(['verify' => false]);
    }

    public function index()
    {
        // $data['nfrmno'] = $this->input->get('nfrmno');
        // $data['vorgno'] = $this->input->get('vorgno');
        // $data['cyear']  = $this->input->get('cyear');
        // $data['cyear2'] = $this->input->get('cyear2');
        // $data['nrunno'] = $this->input->get('nrunno');
        $data['mode'] = $this->getMode([
            'NFRMNO' => $this->input->get('no'),
            'VORGNO' => $this->input->get('orgNo'),
            'CYEAR'  => $this->input->get('y'),
            'CYEAR2' => $this->input->get('y2'),
            'NRUNNO' => $this->input->get('runNo'),
            'EMPNO'  => $this->input->get('empno')
        ]);
        $this->views('psform/PS-CI/index', $data);
    }

    public function getDataForm()
    {
        $nfrmno   = $this->input->post('nfrmno');
        $vorgno   = $this->input->post('vorgno');
        $cyear    = $this->input->post('cyear');
        $cyear2   = $this->input->post('cyear2');
        $nrunno   = $this->input->post('nrunno');
        $data     = $this->psci->getDataForm($nfrmno, $vorgno, $cyear, $cyear2, $nrunno);
        $assignId = $data[0]->ASSIGN_ID ?? null;

        $logs = $this->psci->getLogEdit($assignId);

        $logMap = [];

        foreach ($logs as $log) {
            $logMap[$log->ITEM_CODE][] = $log;
        }

        foreach ($data as &$row) {
            $row->LOG_EDIT = $logMap[$row->ITEM_CODE] ?? [];
        }

        echo json_encode($data);


        // $list   = $this->psci->getListItem($data[0]->ASSIGN_ID);


        // echo "<pre>";
        // print_r($list);
        // echo "</pre>";
        // echo json_encode($data);
    }

    public function insertLogEdit()
    {
        $post  = $this->input->post('editedRows');
        $empno = $this->input->post('empno');
        if (empty($post) || !is_array($post)) {
            echo json_encode([]);
            return;
        }

        foreach ($post as $row) {
            // Log for ACTUAL_QTY changes -> TYPE = 1
            if (array_key_exists('OLD_ACTUAL_QTY', $row) || array_key_exists('ACTUAL_QTY', $row)) {
                $old = isset($row['OLD_ACTUAL_QTY']) ? $row['OLD_ACTUAL_QTY'] : null;
                $new = isset($row['ACTUAL_QTY']) ? $row['ACTUAL_QTY'] : null;
                if ((string)$old !== (string)$new) {
                    $data_log = [
                        'ITEM_CODE' => $row['IPROD'],
                        'OLD_VALUE' => $old ?? 0,
                        'NEW_VALUE' => $new ?? 0,
                        'EDIT_BY'   => $empno,
                        'ASSIGN_ID' => $row['ASSIGN_ID'],
                        'REMARK'    => $row['REMARK'] ?? '',
                        'TYPE'      => 1
                    ];
                    $this->psci->insertLogEdit($data_log);
                }
            }

            // Log for RANDOM_CHECK changes -> TYPE = 2
            if (array_key_exists('OLD_RANDOM_CHECK', $row) || array_key_exists('RANDOM_CHECK', $row)) {
                $oldR = isset($row['OLD_RANDOM_CHECK']) ? $row['OLD_RANDOM_CHECK'] : null;
                $newR = isset($row['RANDOM_CHECK']) ? $row['RANDOM_CHECK'] : null;
                if ((string)$oldR !== (string)$newR) {
                    $data_log = [
                        'ITEM_CODE' => $row['IPROD'],
                        'OLD_VALUE' => $oldR ?? 0,
                        'NEW_VALUE' => $newR ?? 0,
                        'EDIT_BY'   => $empno,
                        'ASSIGN_ID' => $row['ASSIGN_ID'],
                        'REMARK'    => $row['REMARK'] ?? '',
                        'TYPE'      => 2
                    ];
                    $this->psci->insertLogEdit($data_log);
                }
            }
        }

        echo json_encode($post);
    }
}