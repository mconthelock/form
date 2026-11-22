<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/api/webform/form.php';

class form extends MY_Controller {
    use flow, formmst, formApi;

    protected $client;
    protected $webformApiUrl;
    protected $scmApiUrl;
    protected $internalApiKey;

    public function __construct() {
        parent::__construct();
        $this->client = new Client(['verify' => false, 'timeout' => 15]);
        $this->webformApiUrl = rtrim($_ENV['APP_API'] ?? 'http://localhost:3001', '/');
        $this->scmApiUrl = rtrim($_ENV['SCM_API_URL'] ?? 'http://localhost:3002', '/');
        $this->internalApiKey = $_ENV['INTERNAL_API_KEY'] ?? 'amec-scm-internal-dev-key';
    }

    /**
     * GET /form/purform/PUR-PO/form/main?no=...&orgNo=...&y=...&y2=...&runNo=...&empno=...
     */
    public function main() {
        $empno = $this->input->get('empno') ?: '';
        $nfrmno = $this->input->get('no');
        $vorgno = $this->input->get('orgNo');
        $cyear  = $this->input->get('y');
        $cyear2 = $this->input->get('y2');
        $nrunno = $this->input->get('runNo');

        if (!$nfrmno || !$vorgno || !$cyear) {
            $mst = $this->getFormMasterByVaname('PUR-PO');
            if (!empty($mst['data'])) {
                $nfrmno = $mst['data']['NNO'];
                $vorgno = $mst['data']['VORGNO'];
                $cyear  = $mst['data']['CYEAR'];
            }
        }

        if (!$nrunno || !$cyear2) {
            redirect('purform/PUR-PO/form/approveList?empno=' . urlencode($empno));
            return;
        }

        $formKey = [
            'NFRMNO' => (int)$nfrmno,
            'VORGNO' => $vorgno,
            'CYEAR'  => $cyear,
            'CYEAR2' => $cyear2,
            'NRUNNO' => (int)$nrunno,
        ];

        // 1. Fetch PURPO_FORM + FORM + FLOW from Webform API (Oracle)
        $wfRes = $this->client->get($this->webformApiUrl . '/purform/pur-po/detail', [
            'query' => [
                'nfrmno' => $formKey['NFRMNO'],
                'vorgno' => $formKey['VORGNO'],
                'cyear'  => $formKey['CYEAR'],
                'cyear2' => $formKey['CYEAR2'],
                'nrunno' => $formKey['NRUNNO'],
            ],
        ]);
        $wfJson = json_decode((string)$wfRes->getBody(), true);
        $wfData = $wfJson['data'] ?? [];
        $purpo  = $wfData['purpo'] ?? null;
        $wfForm = $wfData['form'] ?? null;
        $flows  = $wfData['flows'] ?? [];

        // 2. Fetch real-time PO Header & Line Items from backend-scm (SQL Server)
        $orderData = null;
        if (!empty($purpo['ORD_ID'])) {
            try {
                $scmRes = $this->client->get($this->scmApiUrl . '/api/v1/internal/orders/' . $purpo['ORD_ID'], [
                    'headers' => ['x-internal-api-key' => $this->internalApiKey],
                ]);
                $scmJson = json_decode((string)$scmRes->getBody(), true);
                $orderData = $scmJson['data'] ?? null;
            } catch (Exception $e) {
                $orderData = null;
            }
        }

        $formCheck = array_merge($formKey, ['EMPNO' => $empno]);
        $isDraft  = isset($wfForm['CST']) && $wfForm['CST'] === '0';
        $isReturn = false;
        if (!$isDraft && $empno) {
            try {
                $isReturn = (bool)$this->checkReturn($formCheck);
            } catch (Exception $e) {
                $isReturn = false;
            }
        }

        $canApprove = false;
        if (isset($wfForm['CST']) && $wfForm['CST'] === '1' && $empno) {
            foreach ($flows as $fl) {
                if (($fl['CSTEPST'] ?? '') === '3' && (($fl['VAPVNO'] ?? '') === $empno || ($fl['VREPNO'] ?? '') === $empno)) {
                    $canApprove = true;
                    break;
                }
            }
        }

        $data = [
            'formKey'    => $formKey,
            'empno'      => $empno,
            'purpo'      => $purpo,
            'wfForm'     => $wfForm,
            'flows'      => $flows,
            'order'      => $orderData,
            'isDraft'    => $isDraft,
            'isReturn'   => $isReturn,
            'canApprove' => $canApprove,
        ];

        if ($isDraft || $isReturn) {
            $this->views('purform/PUR-PO/edit', $data);
        } else {
            $this->views('purform/PUR-PO/view', $data);
        }
    }

    /**
     * GET /form/purform/PUR-PO/form/approveList?empno=...
     * หน้า Batch Approve สำหรับ Approver (Manager / GM)
     */
    public function approveList() {
        $empno = $this->input->get('empno') ?: '';
        $pending = [];

        if ($empno) {
            try {
                $res = $this->client->get($this->webformApiUrl . '/purform/pur-po/pending', [
                    'query' => ['empno' => $empno],
                ]);
                $json = json_decode((string)$res->getBody(), true);
                $pending = $json['data'] ?? [];
            } catch (Exception $e) {
                $pending = [];
            }
        }

        $this->views('purform/PUR-PO/approve_list', [
            'empno'   => $empno,
            'pending' => $pending,
        ]);
    }

    /**
     * POST /form/purform/PUR-PO/form/saveDraft
     * Proxy ไปยัง backend-scm PATCH /api/v1/internal/orders/:ordId/draft
     */
    public function saveDraft() {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $ordId = (int)($body['ordId'] ?? 0);
        if (!$ordId) {
            return $this->jsonOutput(['status' => false, 'message' => 'Missing ordId'], 400);
        }

        try {
            $res = $this->client->patch($this->scmApiUrl . '/api/v1/internal/orders/' . $ordId . '/draft', [
                'headers' => ['x-internal-api-key' => $this->internalApiKey],
                'json'    => $body['draft'] ?? [],
            ]);
            return $this->jsonOutput(json_decode((string)$res->getBody(), true));
        } catch (Exception $e) {
            return $this->jsonOutput(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /form/purform/PUR-PO/form/submitForm
     * 1) บันทึกการแก้ไข Draft ลง backend-scm (SQL Server)
     * 2) ส่ง Submit ฟอร์มบน api (Oracle) + Callback กลับ backend-scm
     */
    public function submitForm() {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $ordId = (int)($body['ordId'] ?? 0);
        $updatedAmount = null;

        try {
            if ($ordId && !empty($body['draft'])) {
                $scmRes = $this->client->patch($this->scmApiUrl . '/api/v1/internal/orders/' . $ordId . '/draft', [
                    'headers' => ['x-internal-api-key' => $this->internalApiKey],
                    'json'    => $body['draft'],
                ]);
                $scmJson = json_decode((string)$scmRes->getBody(), true);
                $updatedAmount = $scmJson['data']['totalAmount'] ?? null;
            }

            $submitPayload = $body['form'] ?? [];
            if ($updatedAmount !== null) {
                $submitPayload['ordAmount'] = $updatedAmount;
            }

            $wfRes = $this->client->patch($this->webformApiUrl . '/purform/pur-po/submit', [
                'json' => $submitPayload,
            ]);
            return $this->jsonOutput(json_decode((string)$wfRes->getBody(), true));
        } catch (Exception $e) {
            return $this->jsonOutput(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /form/purform/PUR-PO/form/batchAction
     * ส่ง Approve / Return / Reject (รองรับทั้ง 1 ใบ และ Batch หลายใบ)
     */
    public function batchAction() {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        try {
            $res = $this->client->post($this->webformApiUrl . '/purform/pur-po/batch-action', [
                'json' => $body,
            ]);
            return $this->jsonOutput(json_decode((string)$res->getBody(), true));
        } catch (Exception $e) {
            return $this->jsonOutput(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /form/purform/PUR-PO/form/recreateFromRejected
     * สร้าง Draft Form ใบใหม่จากฟอร์มที่ถูก Reject (ผูก ORD_ID เดิม)
     */
    public function recreateFromRejected() {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        try {
            $res = $this->client->post($this->webformApiUrl . '/purform/pur-po/recreate-from-rejected', [
                'json' => $body,
            ]);
            return $this->jsonOutput(json_decode((string)$res->getBody(), true));
        } catch (Exception $e) {
            return $this->jsonOutput(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function jsonOutput($payload, $statusCode = 200) {
        $this->output
            ->set_status_header($statusCode)
            ->set_content_type('application/json')
            ->set_output(json_encode($payload));
    }
}
