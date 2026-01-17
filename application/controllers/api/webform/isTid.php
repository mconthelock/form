<?php
/**
 * Form master
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-10-21
 * @note   PHP Version 7.1.30
 * @note   Apache, Set run by user iswin
 */
defined('BASEPATH') or exit('No direct script access allowed');

use GuzzleHttp\Psr7\Request;

trait isTid{


    /**
     * @param array $condition
     * @property int $NFRMNO
     * @property string $VORGNO
     * @property string $CYEAR
     * @property string $CYEAR2
     * @property int $NRUNNO
     * @return array
     */
    private function getFormData($condition){
        try{
            $response = $this->client->post($_env['APP_API']."/isform/is-tid/getFormData", [
                'json' => $condition
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get form data', 'e' => $e]), 1);
        }
    }

    private function getServerName(){
        try{
            $response = $this->client->get($_env['APP_API']."/itgc/specialuser/getServerName");
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get server name', 'e' => $e]), 1);
        }
    }

    private function getUserLogin(){
        try{
            $response = $this->client->get($_env['APP_API']."/itgc/specialuser/getUserLogin");
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get user login', 'e' => $e]), 1);
        }
    }

    private function getController(){
        try{
            $response = $this->client->get($_env['APP_API']."/itgc/specialuser/getController");
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get controller', 'e' => $e]), 1);
        }
    }



}