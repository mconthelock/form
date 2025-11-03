<?php
/**
 * Form master
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-08-22
 * @note   PHP Version 7.1.30
 * @note   Apache, Set run by user iswin
 */
defined('BASEPATH') or exit('No direct script access allowed');
trait NestRequestHelper {

    protected function buildForwardHeaders(): array {
        $ip    = $this->getip();
        $proto = $this->getproto();

        return [
            'X-Forwarded-For'   => $ip,
            'X-Real-IP'         => $_SERVER['REMOTE_ADDR'] ?? '',
            'X-Forwarded-Proto' => $proto,
        ];
    }

    private function getip() {
        return $_SERVER['HTTP_X_FORWARDED_FOR']
            ?? $_SERVER['HTTP_CF_CONNECTING_IP']
            ?? $_SERVER['HTTP_TRUE_CLIENT_IP']
            ?? $_SERVER['REMOTE_ADDR']
            ?? '';
    }

    private function getproto() {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    }
}
?>