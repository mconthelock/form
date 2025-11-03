<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

if (!function_exists('nh_get_ip')) {
    function nh_get_ip(array $server = null) {
        $s = $server ?? $_SERVER;
        return $s['HTTP_X_FORWARDED_FOR']
            ?? $s['HTTP_CF_CONNECTING_IP']
            ?? $s['HTTP_TRUE_CLIENT_IP']
            ?? $s['REMOTE_ADDR']
            ?? '';
    }
}

if (!function_exists('nh_get_proto')) {
    function nh_get_proto(array $server = null) {
        $s = $server ?? $_SERVER;
        return (!empty($s['HTTPS']) && $s['HTTPS'] !== 'off') ? 'https' : 'http';
    }
}

if (!function_exists('build_forward_headers')) {
    function build_forward_headers(array $server = null): array {
        $ip    = nh_get_ip($server);
        $proto = nh_get_proto($server);
        return [
            'X-Forwarded-For' => $ip,
            'X-Real-IP'       => $server['REMOTE_ADDR'] ?? ($_SERVER['REMOTE_ADDR'] ?? ''),
            'X-Forwarded-Proto'=> $proto,
        ];
    }
}
