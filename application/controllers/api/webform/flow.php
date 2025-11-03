<?php
/**
 * Form master
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-08-22
 * @note   PHP Version 7.1.30
 * @note   Apache, Set run by user iswin
 */
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH.'controllers/api/nestHeader.php';
use GuzzleHttp\Psr7\Request;

trait flow{
    use NestRequestHelper;

    /**
     * Get form mode
     * @param array $condition
     * [
     *   'NFRMNO' => '',
     *   'VORGNO' => '',
     *   'CYEAR'  => '',
     *   'CYEAR2' => '',
     *   'NRUNNO' => '',
     *   'EMPNO'  => '',
     * ]
     */
    private function getEmpFlowStepReady($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/flow/getEmpFlowStepReady', [
                'json' => $condition
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get Extra Data', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get Employee Flow StepReady', 'e' => $e]), 1);
        }
    }

    private function getExtData($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/flow/getExtData', [
                'headers' => $this->buildForwardHeaders(),
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get Extra Data', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get Extra Data', 'e' => $e]), 1);
        }
    }

    private function checkReturn($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/flow/checkReturn', [
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            $decoded = json_decode($result, true);
            return $decoded;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get Extra Data', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to check Return', 'e' => $e]), 1);
        }
    }

    private function checkReturnb($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/flow/checkReturnb', [
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            $decoded = json_decode($result, true);
            return $decoded;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get Extra Data', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to check Return back', 'e' => $e]), 1);
        }
    }

    /**
     * Update flow
     * @param array $condition
     * [
     *   "condition"=> [
     *      "NFRMNO"=> 13,          //number
     *      "VORGNO"=> "000101",    //string
     *      "CYEAR"=> "25",     //string
     *      "CYEAR2"=> "2025",  //string
     *      "NRUNNO"=> 2,       //number    
     *      "CSTART"=> "1"      //string
     *   ],
     *   data ที่ต้องการเปลี่ยนแปลงได้ทุก column ใน flow เช่น
     *   "CSTEPNEXTNO"=> "-1"   //string
     */
    private function updateFlow($condition){
        try{
            $response = $this->client->patch($_ENV['APP_APIPHP'].'/flow/updateFlow', [
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            return $result;
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to update flow', 'e' => $e]), 1);
        }
    }
}