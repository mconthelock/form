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

trait formApi{


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
    private function getMode($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/form/getMode', [
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            return $result;
        }catch(Exception $e){
            return array('status' => "false", 'message' => 'Failed to get mode', 'e' => $e);
        }
    }
}