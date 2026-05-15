<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';

class form extends MY_Controller{
    use formApi, flow, formmst;
    protected $client;
    function __construct(){
		parent::__construct();
        $this->client = new Client(['verify' => false]);
    }



 public function main()
    {
        $data = [];

        /*
         * 1) ดึง form key จาก URL ก่อน
         * URL ตัวอย่าง create:
         * /main?no=13&orgNo=000101&y=25&empno=24008
         *
         * URL ตัวอย่าง show:
         * /main?no=13&orgNo=000101&y=25&y2=2025&runNo=1&empno=24008
         */
        if (
            isset($_GET['no']) && $_GET['no'] !== '' &&
            isset($_GET['orgNo']) && $_GET['orgNo'] !== '' &&
            isset($_GET['y']) && $_GET['y'] !== ''
        ) {
            $data['NFRMNO'] = $_GET['no'];
            $data['VORGNO'] = $_GET['orgNo'];
            $data['CYEAR']  = $_GET['y'];
        } else {
            /*
             * 2) ถ้า URL ไม่มี no/orgNo/y ให้ไปหา form master เอง
             * เปลี่ยน FIN-DS ให้ตรงกับ VANAME จริงในระบบ ถ้าชื่อไม่ใช่อันนี้
             */
            $form = $this->getFormMasterByVaname('FIN-DS');

            if (!empty($form)) {
                $data['NFRMNO'] = $form[0]->NNO;
                $data['VORGNO'] = $form[0]->VORGNO;
                $data['CYEAR']  = $form[0]->CYEAR;
            }
        }

        /*
         * 3) empno / requester / approver ที่ติดมาจาก URL
         */
        $empno = isset($_GET['empno']) ? $_GET['empno'] : '';

        $data['apv'] = $empno;

        /*
         * 4) เช็คว่ามี runNo ไหม
         *
         * ไม่มี runNo = create mode
         * มี runNo = show mode
         */
        if (isset($_GET['runNo']) && $_GET['runNo'] !== '') {
            /*
             * SHOW MODE
             */
            $data['mode'] = 3;

            $data['CYEAR2'] = isset($_GET['y2']) ? $_GET['y2'] : '';
            $data['NRUNNO'] = $_GET['runNo'];

            $formKey = [
                'NFRMNO' => (int) $data['NFRMNO'],
                'VORGNO' => (string) $data['VORGNO'],
                'CYEAR'  => (string) $data['CYEAR'],
                'CYEAR2' => (string) $data['CYEAR2'],
                'NRUNNO' => (int) $data['NRUNNO'],
            ];

            $formKey['EMPNO'] = (string) $empno;

            /*
             * ถ้าต้องใช้ ext data / mode จาก workflow ก็เปิดใช้ตรงนี้
             */
            $data['cextData'] = $this->getExtData($formKey);

            /*
             * ถ้าระบบคุณมี getMode และอยากใช้ mode จริงจาก workflow
             * ก็ใช้บรรทัดนี้แทน mode = 3 ได้
             */
            // $data['mode'] = $this->getMode($formKey);

            $this->views('gpform/GP-GAR/show', $data);
        } else {
            /*
             * CREATE MODE
             */
            $data['mode'] = 1;

            $this->views('gpform/GP-GAR/create', $data);
        }
    }


}