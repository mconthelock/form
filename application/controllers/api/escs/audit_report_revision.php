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

trait audit_report_revision{

     private function getAuditReportRevision($condition = []){
         try{
            $response = $this->client->post($_ENV['APP_APIPHP'].'/escs/audit-report-revision/getAuditReportRevision', [
                'json' => $condition
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(guzzlehttp\Exception\RequestException $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to create form', 'e' => $e->getMessage()]), 1);
        }catch(Exception $e){
            throw new Exception(json_encode(['status' => "false", 'message' => 'Failed to get revision', 'e' => $e]), 1);
        }
    }
}

