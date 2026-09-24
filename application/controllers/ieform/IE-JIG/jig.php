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
        //$this->upload_path = "D:/test_file/Form/IE/IE-JIG/"; 
    }

    public function index(){
        $this->show_create_jig_form();
    }


    public function show_create_jig_form(){
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
        $data['CSTEPNO'] = '';
        if ($data['NRUNNO'] !== '') {
            $key = array_intersect_key($data, array_flip(['NFRMNO', 'VORGNO', 'CYEAR', 'CYEAR2', 'NRUNNO']));
            $webforms = $this->form->getRequestNo($key);
            if (!$webforms) { show_404(); return; }
            $data['cst'] = (string)$webforms[0]->CST;
            $data['mode'] = (string)$data['mode'];
            $data['CSTEPNO'] = $this->currentJigStep($key, $data['EMPNO']);
            $data['pageMode'] = $data['mode'] === '2' && $data['CSTEPNO'] === '--' ? 'edit' : 'view';
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

    private function currentJigStep($key, $actor) {
        foreach (['VAPVNO', 'VREPNO'] as $field) {
            $steps = $this->form->getCSETPNO(array_merge($key, ['CSTEPST' => '3', $field => $actor]));
            if ($steps) return trim((string)$steps[0]->CSTEPNO);
        }
        return '';
    }

    private function jigFileDirectory($key) {
        if (!preg_match('/^[0-9]{4}$/D', (string)$key['CYEAR2']) || (int)$key['NRUNNO'] < 1) {
            throw new Exception('Invalid file year or running number');
        }
        return 'IE-JIG' . substr($key['CYEAR2'], -2) . '-' . str_pad((string)(int)$key['NRUNNO'], 6, '0', STR_PAD_LEFT);
    }

    private function jigStoredFilename($name) {
        $base = pathinfo(basename(str_replace('\\', '/', $name)), PATHINFO_FILENAME);
        $base = preg_replace('/[^\p{L}\p{M}\p{N}_-]+/u', '', $base);
        if ($base === null || $base === '') throw new Exception('Filename must contain letters or numbers');
        if (preg_match('/^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])$/iD', $base)) throw new Exception('Reserved filename: ' . $base);
        $stored = $base . '.' . pathinfo($name, PATHINFO_EXTENSION);
        if (strlen($stored) > 255) throw new Exception('Filename is too long');
        return $stored;
    }

    public function uploadfile() {
        try {
            $key = $this->fileKey();
            $forms = $this->form->getRequestNo($key);
            $actor = (string)$this->input->post('EMPNO');
            if (!preg_match('/^[A-Za-z0-9]{1,10}$/D', $actor)) throw new Exception('Invalid employee');
            if (isset($_SESSION['user']) && (string)$_SESSION['user']->SEMPNO !== $actor) throw new Exception('Employee does not match login');
            if (!$forms || !in_array((string)$forms[0]->CST, ['0', '1'], true)) throw new Exception('Form is not editable');
            $mode = $this->getMode($key['NFRMNO'], $key['VORGNO'], $key['CYEAR'], $key['CYEAR2'], $key['NRUNNO'], $actor);
            if ((string)$mode !== '2' && (string)$forms[0]->VINPUTER !== $actor) throw new Exception('No permission to upload');
            if ($this->currentJigStep($key, $actor) !== '--' && !((string)$forms[0]->CST === '0' && (string)$forms[0]->VINPUTER === $actor)) throw new Exception('Only requester can edit attachments');
            if (empty($_FILES['files']['name']) || !is_array($_FILES['files']['name'])) throw new Exception('No files');
            $incoming = $_FILES['files'];
            if (count($incoming['name']) > 5) throw new Exception('Maximum 5 files');
            $folder = $this->jigFileDirectory($key);
            $directory = rtrim($this->upload_path, '/\\') . DIRECTORY_SEPARATOR . $folder;
            if (!is_dir($directory) && !mkdir($directory, 0770, true) && !is_dir($directory)) throw new Exception('Cannot create upload directory');
            $allowed = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'pdf' => 'application/pdf'];
            $files = [];
            foreach ($incoming['name'] as $i => $name) {
                $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                if ($incoming['error'][$i] !== UPLOAD_ERR_OK || $incoming['size'][$i] > 10 * 1024 * 1024 || !isset($allowed[$ext])) throw new Exception('Invalid attachment');
                $tmp = $incoming['tmp_name'][$i];
                if (!is_uploaded_file($tmp)) throw new Exception('Invalid upload');
                $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
                if ($mime !== $allowed[$ext]) throw new Exception('Attachment content does not match file type');
                $stored = $this->jigStoredFilename($name);
                $destination = $directory . DIRECTORY_SEPARATOR . $stored;
                // Reuse identical retries, but never silently substitute an older file with the same name.
                if (is_file($destination) && hash_file('sha256', $destination) !== hash_file('sha256', $tmp)) {
                    throw new Exception('มีไฟล์ชื่อ ' . $stored . ' อยู่แล้ว กรุณาเปลี่ยนชื่อไฟล์ก่อนอัปโหลด');
                }
                if (!is_file($destination) && !move_uploaded_file($tmp, $destination)) throw new Exception('Upload failed');
                $files[] = ['FILE_NAME' => $stored, 'FILE_PATH' => $folder . '/' . $stored, 'FILE_TYPE' => $mime, 'FILE_SIZE' => (int)$incoming['size'][$i]];
            }
            $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true, 'files' => $files]));
        } catch (Exception $e) {
            $this->output->set_status_header(400)->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function start_request() {
        try {
            $key = $this->fileKey();
            $actor = (string)$this->input->post('EMPNO');
            if (!preg_match('/^[A-Za-z0-9]{1,10}$/D', $actor)) throw new Exception('Invalid employee');
            if (isset($_SESSION['user']) && (string)$_SESSION['user']->SEMPNO !== $actor) throw new Exception('Employee does not match login');
            $mode = $this->getMode($key['NFRMNO'], $key['VORGNO'], $key['CYEAR'], $key['CYEAR2'], $key['NRUNNO'], $actor);
            if ((string)$mode !== '2' || $this->currentJigStep($key, $actor) !== '--') throw new Exception('Only requester can submit this form');
            $forms = $this->form->getRequestNo($key);
            if (!$forms || !in_array((string)$forms[0]->CST, ['0', '1'], true)) throw new Exception('Form is not editable');
            // All five form keys are required; never reopen a completed form.
            if ((string)$forms[0]->CST === '0') {
                $updated = $this->form->update('FORM', ['CST' => '1'], array_merge($key, ['CST' => '0']));
                if ($updated !== 1) throw new Exception('Unable to update FORM status');
            }
            $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true]));
        } catch (Exception $e) {
            $this->output->set_status_header(400)->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function deletefile() {
        $staged = null;
        $path = null;
        try {
            $key = $this->fileKey();
            $actor = (string)$this->input->post('EMPNO');
            if (!preg_match('/^[A-Za-z0-9]{1,10}$/D', $actor)) throw new Exception('Invalid employee');
            if (isset($_SESSION['user']) && (string)$_SESSION['user']->SEMPNO !== $actor) throw new Exception('Employee does not match login');
            $mode = $this->getMode($key['NFRMNO'], $key['VORGNO'], $key['CYEAR'], $key['CYEAR2'], $key['NRUNNO'], $actor);
            if ((string)$mode !== '2' || $this->currentJigStep($key, $actor) !== '--') throw new Exception('Only requester can delete attachments');
            $seq = $this->input->post('FILE_SEQ');
            if (!is_string($seq) || !preg_match('/^[1-9][0-9]*$/D', $seq)) throw new Exception('Invalid file sequence');
            $client = new Client(['timeout' => 30]);
            $url = rtrim($_ENV['APP_API'], '/') . '/iedoc/jig/forms/' . implode('/', array_map('rawurlencode', array_values($key)));
            $snapshot = json_decode($client->get($url)->getBody(), true);
            $file = null;
            foreach ($snapshot['FILES'] ?? [] as $entry) {
                if ((string)$entry['FILE_SEQ'] === $seq) { $file = $entry; break; }
            }
            if (!$file) throw new Exception('Attachment not found');
            $name = basename(str_replace('\\', '/', $file['FILE_PATH']));
            if (!preg_match('/^[\p{L}\p{M}\p{N}_-]+\.(jpg|jpeg|png|pdf)$/iuD', $name)) throw new Exception('Invalid filename');
            $root = realpath($this->upload_path);
            if ($root === false) throw new Exception('Upload directory not found');
            $path = $root . DIRECTORY_SEPARATOR . $this->jigFileDirectory($key) . DIRECTORY_SEPARATOR . $name;
            if (!is_file($path) && preg_match('/^[a-f0-9]{64}\.(jpg|jpeg|png|pdf)$/D', $name)) {
                $path = $root . DIRECTORY_SEPARATOR . implode('_', $key) . DIRECTORY_SEPARATOR . $name;
            }
            if (is_file($path)) {
                $path = realpath($path);
                if (strpos($path, $root . DIRECTORY_SEPARATOR) !== 0) throw new Exception('Invalid attachment path');
                // Restore the physical file if deleting its database record fails.
                $staged = $path . '.deleting-' . bin2hex(random_bytes(8));
                if (!rename($path, $staged)) throw new Exception('Cannot remove attachment from directory');
            }
            $result = json_decode($client->delete($url . '/files/' . rawurlencode($seq))->getBody(), true);
            if (empty($result['deleted'])) throw new Exception('API did not confirm attachment deletion');
            $warning = null;
            if ($staged && !unlink($staged)) $warning = 'ลบรายการในฐานข้อมูลแล้ว แต่ลบไฟล์จริงไม่สำเร็จ กรุณาแจ้งผู้ดูแลระบบ';
            $staged = null;
            $this->output->set_content_type('application/json')->set_output(json_encode(['status' => true, 'warning' => $warning]));
        } catch (Exception $e) {
            if ($staged && is_file($staged)) rename($staged, $path);
            $this->output->set_status_header(400)->set_content_type('application/json')->set_output(json_encode(['status' => false, 'message' => $e->getMessage()]));
        }
    }

    public function preview_file() {
        try {
            $key = $this->fileKey('get');
            if (!$this->form->getRequestNo($key)) throw new Exception('Form not found');
            $name = $this->input->get('file');
            if (!is_string($name) || strlen($name) > 255 || !preg_match('/^[\p{L}\p{M}\p{N}_-]+\.(jpg|jpeg|png|pdf)$/iuD', $name)) throw new Exception('Invalid filename');
            $root = rtrim($this->upload_path, '/\\') . DIRECTORY_SEPARATOR;
            $path = $root . $this->jigFileDirectory($key) . DIRECTORY_SEPARATOR . $name;
            // Keep attachments saved before the directory change readable.
            if (!is_file($path) && preg_match('/^[a-f0-9]{64}\.(jpg|jpeg|png|pdf)$/D', $name)) {
                $path = $root . implode('_', $key) . DIRECTORY_SEPARATOR . $name;
            }
            if (!is_file($path)) throw new Exception('File not found');
            $this->output->set_header('X-Content-Type-Options: nosniff');
            $this->output->set_content_type((new finfo(FILEINFO_MIME_TYPE))->file($path));
            $this->output->set_output(file_get_contents($path));
        } catch (Exception $e) { show_404(); }
    }
}
