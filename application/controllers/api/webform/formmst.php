<?php
/**
 * Form master
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-08-22
 * @note   PHP Version 7.1.30
 * @note   Apache, Set run by user iswin
 */
defined('BASEPATH') or exit('No direct script access allowed');

use GuzzleHttp\Psr7\Request;

trait formmst{


    private function getFormMaster($condition = []){
        try{
            // $response = $this->client->post("http://localhost:3001/formmst/getFormmst", [
            $response = $this->client->post($_ENV['APP_APIPHP']."/formmst/getFormmst", [
                'json' => $condition
            ]);
            $result = json_decode($response->getBody(), true);
            return [ 'status' => "true", 'data' => $result ];
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get form master', 'e' => $e]), 1);
        }
    }


    private function getFormMasterByVaname($vaname){
        try{
            // $response = $this->client->get("http://localhost:3001/formmst/$vaname");
            $response = $this->client->get($_ENV['APP_APIPHP']."/formmst/$vaname"); // docker
            $result = json_decode($response->getBody(), true);
            return [ 'status' => "true", 'data' => $result ];
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get form master by vaname', 'e' => $e]), 1);
        }
    }

    private function setFormProp($name){
        $data = [];
        $form = $this->getFormMasterByVaname($name);
        if(!empty($form)){
            // $_GET keys are case-sensitive in PHP, normalize to lowercase before reading
            $get = array_change_key_case($_GET, CASE_LOWER);
            $data = [
                'NFRMNO' => isset($get['no']) ? $get['no'] : $form['data']['NNO'],
                'VORGNO' => isset($get['orgNo']) ? $get['orgNo'] : $form['data']['VORGNO'],
                'CYEAR'  => isset($get['y']) ? $get['y'] : $form['data']['CYEAR'],
                'CYEAR2' => isset($get['y2']) ? $get['y2'] : date('Y'),
                'NRUNNO' => isset($get['runno']) ? $get['runno'] : 0,
                'EMPNO'  => isset($get['empno']) ? $get['empno'] : '',
            ];
        }
        return $data;
    }
}