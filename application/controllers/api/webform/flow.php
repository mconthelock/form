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

trait flow{


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
        }catch(Exception $e){
            return array('status' => "false", 'message' => 'Failed to get Employee Flow StepReady', 'e' => $e);
        }
    }

    private function getExtData($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/flow/getExtData', [
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            return $result;
        }catch(Exception $e){
            return array('status' => "false", 'message' => 'Failed to get Extra Data', 'e' => $e);
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
        }catch(Exception $e){
            return array('status' => "false", 'message' => 'Failed to check Return', 'e' => $e);
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
        }catch(Exception $e){
            return array('status' => "false", 'message' => 'Failed to check Return back', 'e' => $e);
        }
    }
}