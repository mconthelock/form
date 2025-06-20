<?php
defined('BASEPATH') or exit('No direct script access allowed');

trait _File{
    
    public function downloadFile($filename, $oldName, $path = ''){  
        $path = $this->setPath($path);
        $this->load->helper('download');
        $path = $path."/";
        $data = file_get_contents($path.$oldName);
        force_download($filename, $data);
    }

    /**
     * Download excel template for Export excel file from exceljs
     * @author Sutthipong Tangmongkhoncharoen
     * @since 2024-10-2
     */
    public function getArrayBufferFile(){
        $filename = $_POST['filename'];
        // $file = FCPATH . "assets/file/template/" .$filename; 
        $filePath = $_POST['filePath']; // assets/file/template/
        $file = FCPATH.$filePath.$filename; 
        // var_dump($file);
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="'.$filename.'"');
        header('Content-Length: ' . filesize($file));

        readfile($file); // ส่งไฟล์ไปยัง client
        exit();
    }

    /**
     * Get excel file in path and convert to base64
     * @param string $path e.g. "assets/file/master/chemical"
     */
    public function getfileInPath(){
        $path      = $_POST['path'];
        $fileName  = isset($_POST['fileName']) ? $_POST['fileName'] : '';
        $directory = FCPATH.$path;
        $files = scandir($directory);
        $response = [];
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'xlsx' && !(substr($file, 0, 2)=='~$')) {
                $filePath = $directory . DIRECTORY_SEPARATOR . $file;
                $fileContent = file_get_contents($filePath);
                if ($fileName != '') {
                    if($fileName == $file){
                        $response[] = [
                            'filename' => $file,
                            'content' => base64_encode($fileContent)
                        ];
                    }
                }else{
                    $response[] = [
                        'filename' => $file,
                        'content' => base64_encode($fileContent)
                    ];
                }
            }
        }
        echo json_encode($response);
    }

    /**
     * Get excel file in path
     * @param string $path e.g. "//amecnas/IS_Dept/project/Annual Development/FY2024/Form1/GP/ST/Chemical"
     */
    private function getExcelFile($path){
        $res = array();
        if(is_dir($path)){
            $d = scandir($path);
            foreach($d as $v){
                if(((substr($v,-5)=='.xlsx') || (substr($v,-4)=='.xls'))&& !(substr($v, 0, 2)=='~$')){
                    $res[] = $v;
                }
            }
        }
        return $res;
    }

    /**
     * Upload file
     * @param array $file 
     * @param string $path default is $this->upload_path 
     */
    private function uploadFile($files, $path = ''){
        $path = $this->setPath($path);
        $status = '';
        $msg  = '';
        $name = '';
        $size = '';
        $type = '';
        $dt   = date('YmdHi');
        
        if(!(is_dir($path))) mkdir($path, 0777, true);

        $oriName = $files['name'];
        
        $_FILES['file']['name']     = $dt.'_'.$oriName;
        $_FILES['file']['type']     = $files['type'];
        $_FILES['file']['tmp_name'] = $files['tmp_name'];
        $_FILES['file']['error']    = $files['error'];
        $_FILES['file']['size']     = $files['size'];

        $config['upload_path']   = $path;
        $config['allowed_types'] = '*';
        $config['max_size'] = 1024*8;
        
        $this->load->library('upload', $config);
        if($this->upload->do_upload('file')){
            $data = $this->upload->data();
            $image_path = $data['full_path'];
            if(file_exists($image_path)){
                $name   = $data['file_name'];
                $oname  = $data['orig_name'];
                $size   = $data['file_size'];
                $type   = $data['file_ext'];
                $status = true;
                $msg    = 'File successfully uploaded';
            }else{
                $status = false;
                $msg = 'Something went wrong when saving the file, please try again.';
            }
        }else{
            $status = false;
            $msg = $this->upload->display_errors('', '');
        }
        return array(
                'status' => $status,
                'msg'    => $msg,
                'file_origin_name' => $oriName,
                'file_name' => $name,
                'file_size' => $size,
                'file_type' => $type,
                'file_path' => $path,
        );
    }

    /**
     * Upload multiple files
     * @param array $files e.g. $_FILES
     * @param array $inputName e.g. ['file1', 'file2']
     * @param string $path default is $this->upload_path 
     */
    private function uploadMultiFile($files, $inputName, $path = ''){
        try {
            $fileUpload = [];
            $msg = '';
            $status = false;
            $path   = $this->setPath($path); 
            foreach ($inputName as $key => $name) {
                if(isset($files[$name]) && $files[$name]['name'][0] != ''){
                    $fileUpload[$name]  = [];
                    $file       = $files[$name];
                    $total_files = count($file['name']); // นับไฟล์
                    for ($i = 0; $i < $total_files; $i++) {
                        if (empty($file['name'][$i])) continue;
                        // สร้างอาร์เรย์ใsหม่เพื่อเก็บไฟล์แต่ละไฟล์
                        $fileData = [
                            'name'     => $file['name'][$i],
                            'type'     => $file['type'][$i],
                            'tmp_name' => $file['tmp_name'][$i],
                            'error'    => $file['error'][$i],
                            'size'     => $file['size'][$i]
                        ];
                        // อัปโหลดไฟล์
                        $uploadedFile = $this->uploadFile($fileData, $path);
                        
                        // ตรวจสอบว่าอัปโหลดสำเร็จหรือไม่
                        if ($uploadedFile['status']) {
                            $fileUpload[$name][] = $uploadedFile;
                        }else{
                            throw new Exception($uploadedFile['msg'], 0);
                        }
                    }
                    if(!empty($fileUpload[$name])){
                        // $res[$name] = $fileUpload;
                        $status = true;
                        $msg = 'Upload file success';
                    
                    }else{
                        throw new Exception("No files uploaded", 0);
                    }
                }
                // else{
                //     throw new Exception("No files found for upload", 1);
                // }
            }
        } catch (Exception $e) {
            $status = false;
            $msg    = $e->getMessage();
            if($e->getCode() == 0) {
                $this->deleteMultiFile($fileUpload, $path);
                // foreach( $fileUpload as $files){
                //     foreach($files as $file){
                //         $this->deleteFile($file['file_name'], $path);
                //     }
                // }
            }
        } finally {
            return ['status' => $status, 'msg' => $msg, 'files' => $fileUpload];
        }
        
    }

    /**
     * Insert file into the database
     * @param array $file 
     * @param array $data e.g. ['NFRMNO' => '12', 'VORGNO' => '050601', 'CYEAR' => '19', 'CYEAR2' => '2025', 'NRUNNO' => '1', 'empno' => '24008']
     * @param string $table default is 'IS_FILE'
     */
    private function insertFile($file, $data, $table = 'IS_FILE', $columnID = 'FILE_ID'){
        $this->load->model('my_model', 'my');
        $d = array(
            'NFRMNO'     => $data['NFRMNO'],
            'VORGNO'     => $data['VORGNO'],
            'CYEAR'      => $data['CYEAR'],
            'CYEAR2'     => $data['CYEAR2'],
            'NRUNNO'     => $data['NRUNNO'],
            'FILE_ID'    => $this->my->generate_id($table, $columnID, ['NFRMNO' => $data['NFRMNO'], 'VORGNO' => $data['VORGNO'], 'CYEAR' => $data['CYEAR'], 'CYEAR2' => $data['CYEAR2'], 'NRUNNO' => $data['NRUNNO']]),
            'FILE_ONAME' => $file['file_origin_name'],
            'FILE_FNAME' => $file['file_name'],
            'FILE_USERCREATE' => $data['empno'],
            'FILE_TYPE' =>  isset($data['type']) && !empty($data['type']) ? $data['type'] : null,
            'FILE_PATH'  => $data['filePath'],
        );
        return $this->my->insert($table, $d);
    }

    /**
     * Delete file
     * @param string $filename 
     */
    private function deleteFile($filename, $path = ''){
        $path = $this->setPath($path);
        $filePath = $path.$filename;
        if (file_exists($filePath) && !empty($filename)) {
            @unlink($filePath);
        } 
    }

    private function deleteMultiFile($filesData, $path = ''){
        $path = $this->setPath($path);
        foreach( $filesData as $files){
            foreach($files as $file){
                $this->deleteFile($file['file_name'], $path);
            }
        }
    }
    
    /**
     * Set path for file operations
     * @param string $path
     * @return string
     */
    private function setPath($path){
        return empty($path) ? $this->upload_path : $path;
    }
}