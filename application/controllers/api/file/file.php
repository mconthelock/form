<?php
/**
 * File API Trait
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2026-01-28
 * @note   PHP Version 7.1.30
 * @note   Apache, Set run by user iswin
 */
defined('BASEPATH') or exit('No direct script access allowed');

use GuzzleHttp\Psr7\Request;

trait fileApi{

    /**
     * Save file to server
     * @param array $files  e.g. $_FILES
     * @param string $path  e.g. '//amecnas/AMECWEB/File/development/test'
     * @return array
     * @exmample
     * $data = $this->saveFile($_FILES, '//amecnas/AMECWEB/File/development/test');
     * หากหลายไฟล์ต้องตั้งชื่อให้มี [] ต่อท้าย เช่น name="attachFile[]"
     */
    private function saveFile($files, $path){
        try{
            $files = $this->normalizeFilesForGuzzle($files);
            $multipart = array_merge([
                [
                    'name'     => 'path',
                    'contents' => $path
                ],
                [
                    'name'     => 'isPhp',
                    'contents' => true
                ]
            ], $files);
            $response = $this->client->post($_ENV['APP_APIPHP']."/files/saveFile", [
                'multipart' => $multipart 
            ]);
            $result = json_decode($response->getBody(), true);
            return [ 'status' => "true", 'data' => $result ];
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to save file', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to seve file', 'e' => $e]), 1);
        }
    }

    private function normalizeFilesForGuzzle(array $files){
        $result = [];
        foreach ($files as $field => $file) {
            if (!is_array($file['tmp_name'])) {
                if (
                    $file['error'] !== UPLOAD_ERR_OK ||
                    empty($file['tmp_name']) ||
                    !is_uploaded_file($file['tmp_name'])
                ) {
                    continue;
                }
                $result[] = [
                    'name'     => $field,
                    'contents' => fopen($file['tmp_name'], 'r'),
                    'filename' => $file['name'],
                ];
                $result[] = [
                    'name'     => 'newName',
                    'contents' => date('YmdHi').'_'.$file['name'],
                ];
                
            } else {
                foreach ($file['tmp_name'] as $i => $tmp) {
                    if (
                        $file['error'][$i] !== UPLOAD_ERR_OK ||
                        empty($tmp) ||
                        !is_uploaded_file($tmp)
                    ) {
                        continue;
                    }
                    $result[] = [
                        'name'     => $field . '[]',
                        'contents' => fopen($tmp, 'r'),
                        'filename' => $file['name'][$i],
                    ];
                    $result[] = [
                        'name'     => 'newName['.$i.']',
                        'contents' => date('YmdHi').'_'.$file['name'][$i],
                    ];
                }
            }
        }
        return $result;
    }

    private function normalizeFiles($files){
        $result = [];
        foreach ($files as $field => $file) {
            // ไฟล์เดียว
            if (!is_array($file['tmp_name'])) {
                if ($file['error'] !== UPLOAD_ERR_OK) continue;

                $result[] = [
                    'field' => $field,
                    'tmp'   => $file['tmp_name'],
                    'name'  => $file['name'],
                    'type'  => $file['type'],
                ];
            }
            // หลายไฟล์ (name[])
            else {
                foreach ($file['tmp_name'] as $i => $tmp) {
                    if ($file['error'][$i] !== UPLOAD_ERR_OK) continue;

                    $result[] = [
                        'field' => $field . '[]',
                        'tmp'   => $tmp,
                        'name'  => $file['name'][$i],
                        'type'  => $file['type'][$i],
                    ];
                }
            }
        }
        return $result;
    }


}