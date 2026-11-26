<?php
class form extends MY_Controller {
    public function __construct(){
        parent::__construct();
        $this->load->library('FormDept');
    }

    public function index($id = 1){
        $status = array(
            0 => 'nav-form-draft',
            1 => 'nav-form-waitapprove',
            2 => 'nav-form-comming',
            3 => 'nav-form-mine',
            4 => 'nav-form-approved',
            5 => 'nav-form-represent',
            6 => 'nav-form-finish'
        );
        $title = isset($status[$id]) ? $status[$id] : 'nav-form-waitapprove';
        $this->views('webform/form/index', array('id' => $id, 'title' => $title));
    }

    public function list($id = 1){
        $this->index($id);
    }

    public function create(){
        $data = array('department' => $this->formdept->setFormDept(), 'title' => 'nav-form-create');
        $this->views('webform/form/create/index', $data);
    }

    public function createdetail($id){
        $dept = $this->formdept->setFormDept();
        $selectedDept = array_filter($dept, function($d) use ($id) {
            return $d['id'] == $id;
        });
        $data['department'] = reset($selectedDept);
        $data['title'] = 'nav-form-create';
        $this->views('webform/form/create/createdetail', $data);
    }

    private function isAllowedFormTarget($url){
        if (empty($url) || !is_string($url)) {
            return false;
        }
        $parts = parse_url($url);
        if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
            return false;
        }
        $scheme = strtolower($parts['scheme']);
        if (!in_array($scheme, array('http', 'https'), true)) {
            return false;
        }
        $host = strtolower($parts['host']);
        $currentHost = strtolower($_SERVER['HTTP_HOST'] ?? '');
        $currentHost = preg_replace('/:\d+$/', '', $currentHost);

        if ($currentHost !== '' && $host === $currentHost) {
            return true;
        }

        $allowedSuffix = '.mitsubishielevatorasia.co.th';
        return $host === 'mitsubishielevatorasia.co.th'
            || substr($host, -strlen($allowedSuffix)) === $allowedSuffix;
    }

    public function detail(){
        $target = isset($_GET['data']) ? trim($_GET['data']) : '';
        if (!$this->isAllowedFormTarget($target)) {
            redirect('webform/form/create');
            return;
        }

        $title = isset($_GET['title']) ? $_GET['title'] : 'nav-form-create';
        $code  = isset($_GET['code']) ? mb_substr(trim($_GET['code']), 0, 50) : '';
        $name  = isset($_GET['name']) ? mb_substr(trim($_GET['name']), 0, 200) : '';

        $this->views('webform/form/detail', array(
            'target' => $target,
            'title'  => $title,
            'code'   => $code,
            'name'   => $name,
        ));
    }

    public function callback(){
        $to = isset($_GET['to']) ? strtolower(trim($_GET['to'])) : 'waitapprove';
        $statusMap = array(
            'draft'       => 0,
            'waitapprove' => 1,
            'comming'     => 2,
            'mine'        => 3,
            'approved'    => 4,
            'represent'   => 5,
            'finish'      => 6,
        );
        $statusId = isset($statusMap[$to]) ? $statusMap[$to] : 1;
        $redirectUrl = base_url('webform/form/index/' . $statusId);

        echo '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>';
        echo '<script>';
        echo 'try { window.top.location.href = ' . json_encode($redirectUrl) . '; } ';
        echo 'catch (e) { window.location.href = ' . json_encode($redirectUrl) . '; }';
        echo '</script>';
        echo '<noscript><a target="_top" href="' . htmlspecialchars($redirectUrl, ENT_QUOTES, 'UTF-8') . '">Continue to Waiting for Approve</a></noscript>';
        echo '</body></html>';
    }

     public function getFormDept(){
        $data = $this->formdept->setFormDept();
        echo json_encode($data);
     }
}
