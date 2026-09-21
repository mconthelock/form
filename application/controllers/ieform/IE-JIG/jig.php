<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use GuzzleHttp\Client;
require_once APPPATH.'controllers/_form.php';
require_once APPPATH.'controllers/api/webform/form.php';
require_once APPPATH.'controllers/api/webform/flow.php';
require_once APPPATH.'controllers/api/webform/formmst.php';
require_once APPPATH.'controllers/_file.php';

class jig extends MY_Controller {
    use _Form, _File;
    public function __construct(){
        parent::__construct();
        $this->load->model('form_model', 'form');
        $this->load->model('user_model', 'usr');
        $this->upload_path = $_ENV['AMEC_FILE_PATH'] . ($this->_servername() == 'amecweb' ? 'production' : 'development') . "/Form/IE/IE-JIG/";
    }

    public function index(){
        $this->show_create_jig_form();
    }

    public function show_create_jig_form(){
        echo "test";
        exit;
        $data = [];
        $parameters = [
            'NFRMNO' => 'no', 'VORGNO' => 'orgNo', 'CYEAR' => 'y',
            'CYEAR2' => 'y2', 'NRUNNO' => 'runNo', 'EMPNO' => 'empno',
        ];
        foreach ($parameters as $key => $parameter) {
            $value = $this->input->get($parameter);
            // Preserve leading zeroes in organization and employee numbers.
            $pattern = $key === 'EMPNO' ? '/^[A-Za-z0-9]{0,10}$/D' : '/^[0-9]*$/D';
            if ($value !== null && (!is_string($value) || !preg_match($pattern, $value))) {
                show_error('Invalid parameter: ' . $parameter, 400);
                return;
            }
            $data[$key] = $value ?? '';
        }
        foreach (['NFRMNO', 'VORGNO', 'CYEAR', 'EMPNO'] as $key) {
            if ($data[$key] === '') {
                show_error('Missing parameter: ' . $parameters[$key], 400);
                return;
            }
        }
        if ($data['NRUNNO'] !== '' && $data['CYEAR2'] === '') {
            show_error('Missing parameter: y2', 400);
            return;
        }

        $data['mode'] = $this->getMode($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'], $data['CYEAR2'], $data['NRUNNO'], $data['EMPNO']);
        $data['pageMode'] = $data['NRUNNO'] === '' ? 'create' : ($data['mode'] === '2' ? 'edit' : 'view');
        // empno is the caller's form context; it does not establish a login session.
        $data['inputBy'] = $data['EMPNO'];
        $user = $_SESSION['user'] ?? null;
        $data['inputName'] = $user && (string)($user->SEMPNO ?? '') === $data['EMPNO'] ? ($user->SNAME ?? '') : '';
        $data['formno'] = '';
        $data['cst'] = '';
        $data['exdata'] = '';
        if ($data['NRUNNO'] !== '') {
            $key = array_intersect_key($data, array_flip(['NFRMNO', 'VORGNO', 'CYEAR', 'CYEAR2', 'NRUNNO']));
            $webforms = $this->form->getRequestNo($key);
            if (!$webforms) { show_404(); return; }
            $data['cst'] = (string)$webforms[0]->CST;
            // Normalize the legacy read-only mode 3 to the page contract's mode 1.
            $data['mode'] = (string)$data['mode'] === '2' ? '2' : '1';
            $data['pageMode'] = $data['mode'] === '2' && $data['cst'] === '0' ? 'edit' : 'view';
            $data['exdata'] = $this->getExtData($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'], $data['CYEAR2'], $data['NRUNNO'], $data['EMPNO']);
            $data['formno'] = $this->toFormNumber($data['NFRMNO'], $data['VORGNO'], $data['CYEAR'], $data['CYEAR2'], $data['NRUNNO']);
        }
        $this->views($data['NRUNNO'] === '' ? 'ieform/IE-JIG/request_form' : 'ieform/IE-JIG/approve_form', $data);
    }

    private function fileKey($method = 'post') {
        $key = [];
        foreach (['NFRMNO', 'VORGNO', 'CYEAR', 'CYEAR2', 'NRUNNO'] as $name) {
            $value = $this->input->$method($name);
            if (!is_string($value) || !preg_match('/^[0-9]{1,6}$/D', $value)) throw new Exception('Invalid form key');
            $key[$name] = $value;
        }
        return $key;
    }

    public function uploadfile() {
        try {
            $key = $this->fileKey();
            $forms = $this->form->getRequestNo($key);
            $actor = (string)$this->input->post('EMPNO');
            if (!preg_match('/^[A-Za-z0-9]{1,10}$/D', $actor)) throw new Exception('Invalid employee');
            if (isset($_SESSION['user']) && (string)$_SESSION['user']->SEMPNO !== $actor) throw new Exception('Employee does not match login');
            if (!$forms || (string)$forms[0]->CST !== '0') throw new Exception('Form is not editable');
            $mode = $this->getMode($key['NFRMNO'], $key['VORGNO'], $key['CYEAR'], $key['CYEAR2'], $key['NRUNNO'], $actor);
            if ((string)$mode !== '2' && (string)$forms[0]->VINPUTER !== $actor) throw new Exception('No permission to upload');
            if (empty($_FILES['files']['name']) || !is_array($_FILES['files']['name'])) throw new Exception('No files');
            $incoming = $_FILES['files'];
            if (count($incoming['name']) > 5) throw new Exception('Maximum 5 files');
            $directory = rtrim($this->upload_path, '/\\') . DIRECTORY_SEPARATOR . implode('_', $key);
            if (!is_dir($directory) && !mkdir($directory, 0770, true)) throw new Exception('Cannot create upload directory');
            $allowed = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'pdf' => 'application/pdf'];
            $files = [];
            foreach ($incoming['name'] as $i => $name) {
                $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                if ($incoming['error'][$i] !== UPLOAD_ERR_OK || $incoming['size'][$i] > 10 * 1024 * 1024 || !isset($allowed[$ext])) throw new Exception('Invalid attachment');
                $tmp = $incoming['tmp_name'][$i];
                if (!is_uploaded_file($tmp)) throw new Exception('Invalid upload');
                $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
                if ($mime !== $allowed[$ext]) throw new Exception('Attachment content does not match file type');
                // Content-addressed names make retries safe and avoid overwriting a different file.
                $stored = hash_file('sha256', $tmp) . '.' . $ext;
                $destination = $directory . DIRECTORY_SEPARATOR . $stored;
                if (!is_file($destination) && !move_uploaded_file($tmp, $destination)) throw new Exception('Upload failed');
                $files[] = ['FILE_NAME' => basename($name), 'FILE_PATH' => implode('_', $key) . '/' . $stored, 'FILE_TYPE' => $mime, 'FILE_SIZE' => (int)$incoming['size'][$i]];
            }
            $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true, 'files' => $files]));
        } catch (Exception $e) {
            $this->output->set_status_header(400)->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function preview_file() {
        try {
            $key = $this->fileKey('get');
            if (!$this->form->getRequestNo($key)) throw new Exception('Form not found');
            $name = $this->input->get('file');
            if (!is_string($name) || !preg_match('/^[a-f0-9]{64}\.(jpg|jpeg|png|pdf)$/D', $name)) throw new Exception('Invalid filename');
            $path = rtrim($this->upload_path, '/\\') . DIRECTORY_SEPARATOR . implode('_', $key) . DIRECTORY_SEPARATOR . $name;
            if (!is_file($path)) throw new Exception('File not found');
            $this->output->set_header('X-Content-Type-Options: nosniff');
            $this->output->set_content_type((new finfo(FILEINFO_MIME_TYPE))->file($path));
            $this->output->set_output(file_get_contents($path));
        } catch (Exception $e) { show_404(); }
    }
}
