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
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get mode', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get mode', 'e' => $e]), 1);
        }
    }
    /**
     * @param array $condition
     * [
     *     NFRMNO   => number,
     *     VORGNO   => string,
     *     CYEAR    => string,
     *     REQBY    => string, e.g.24008
     *     INPUTBY  => string, e.g.24008
     *     REMARK   => string,
     *     DRAFT    => string e.g. 0 == under preparation, 1 = wait for approval
     * ]
    */
    private function createForm($condition = []){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/form/createForm', [
                'json' => $condition
            ]);
            // $result = trim($response->getBody());
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e]), 1);
        }
    }

    /**
     * @param array $condition
      * [
     *     NFRMNO => number,
     *     VORGNO => string,
     *     CYEAR  => string,
     *     CYEAR2 => string,
     *     NRUNNO => number
     * ]
     * @return boolean
     */
    private function deleteFlowandForm($condition = []){
        try{
            $response = $this->client->delete($_ENV['APP_APIPHP'].'/form/deleteForm', [
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to delete form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to delete form', 'e' => $e]), 1);
        }
    }

    /**
     * @param string $reqNo e.g. ST-INP24-000001
     * @return array
     */
    private function getRequestNo($reqNo){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/form/getRequestNo', [
                'json' => ['reqNo' => $reqNo]
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get request number', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get request number', 'e' => $e]), 1);
        }
    }
    
    /**
     * @param array $condition
      * [
     *     NFRMNO => number,
     *     VORGNO => string,
     *     CYEAR  => string,
     *     CYEAR2 => string,
     *     NRUNNO => number
     * ]
     * @return string form number e.g. ST-INP24-000001
     */
    private function getFormNo($condition){
        try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/form/getFormno', [
                'json' => $condition
            ]);
            $result = trim($response->getBody());
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            var_dump($e->getMessage());
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get form', 'e' => $e]), 1);
        }
    }



}