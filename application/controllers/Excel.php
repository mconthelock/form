<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Excel extends MY_Controller{
    protected $title;
    function __construct(){
		parent::__construct();
    }

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
        header('Content-Type: application/json');
        echo json_encode($response);
    }

    public function getModifyDate(){
        $path = $_POST['path'];
        $directory = FCPATH.$path;
        $files = scandir($directory);
        $response = [];
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'xlsx' && !(substr($file, 0, 2)=='~$')) {
                $filePath = $directory . DIRECTORY_SEPARATOR . $file;
                $fileModifyDate = filemtime($filePath);
                $response[] = [
                    'filename' => $file,
                    'modifyDate' => date('Y-m-d H:i:s', $fileModifyDate)
                ];
            }
        }
        header('Content-Type: application/json');
        echo json_encode($response);
    }
}