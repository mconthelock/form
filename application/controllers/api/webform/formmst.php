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
}