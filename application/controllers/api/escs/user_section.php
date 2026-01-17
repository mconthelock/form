<?php
/**
 * Form master
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-09-11
 * @note   PHP Version 7.1.30
 * @note   Apache, Set run by user iswin
 */
defined('BASEPATH') or exit('No direct script access allowed');

use GuzzleHttp\Psr7\Request;

trait escs_user_section{

     private function getUserSecByID($id){
        try{
            // $response = $this->client->get("http://localhost:3001/formmst/$id");
            $response = $this->client->get($_env['APP_API']."/escs/userSection/$id"); // docker
            $result = json_decode($response->getBody(), true);
            if(empty($result)) {
                return [ 'status' => "false", 'data' => null ];
            }
            return [ 'status' => "true", 'data' => $result ];
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get user section by ID', 'e' => $e]), 1);
        }
    }
}