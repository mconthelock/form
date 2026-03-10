<?php
use GuzzleHttp\Client;
require_once APPPATH . 'controllers/api/webform/form.php';
require_once APPPATH . 'controllers/api/webform/formmst.php';
defined('BASEPATH') OR exit('No direct script access allowed');
class jobs extends MY_Controller {
    protected $client;
    use formApi;
    use formmst;
    function __construct()
    {
        parent::__construct();
        $this->load->model('ieform/IE-CHR/chr_model', 'chr');
        $this->client = new Client(['verify' => false]);
    }

    public function JobsCreateForm()
    {
        $month       = date('m');
        $year        = date('Y');
        $data        = $this->chr->getDataRecord($month, $year);
        $groupedData = [];

        foreach ($data as $item) {
            $shopName                 = !empty($item->SHOP) ? $item->SHOP : 'UNKNOWN';
            $groupedData[$shopName][] = $item;
        }
        $formmst = $this->getFormMasterByVaname("IE-CHR")['data'];
        print_r($formmst);
        foreach ($groupedData as $key => $value) {

            $form = $this->createForm([
                'NFRMNO'  => $formmst['NNO'],
                'VORGNO'  => $formmst['VORGNO'],
                'CYEAR'   => $formmst['CYEAR'],
                'REQBY'   => $value[0]->SHOP_INCHARGE,
                'INPUTBY' => $value[0]->SHOP_INCHARGE,
                'REMARK'  => '',
                'DRAFT'   => '0'
            ]);

            if ($form['status'] == '1') {
                $data = [
                    'NFRMNO' => $form['data']['NFRMNO'],
                    'VORGNO' => $form['data']['VORGNO'],
                    'CYEAR'  => $form['data']['CYEAR'],
                    'CYEAR2' => $form['data']['CYEAR2'],
                    'NRUNNO' => $form['data']['NRUNNO'],
                    'MONTH'  => $month,
                    'YEAR'   => $year,
                    'SHOP'   => $key,
                ];
                $this->chr->insertWebform('IECHR_FORM', $data);
            }
            print_r($form);
        }

        // echo '<pre>';
        // print_r($groupedData);
        // echo '</pre>';
    }


}