<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$active_group = 'DEFAULT';
$query_builder = TRUE;

$list = $_ENV['DBLIST'];
foreach (explode(',', $list) as $db_name) {
    $db_name = trim($db_name);
    if (!empty($db_name)) {
        $db[$db_name] = array(
            'dsn'	=> '',
            'hostname' => $_ENV[strtoupper($db_name) . '_HOST'],
            'username' => $_ENV[strtoupper($db_name) . '_USER'],
            'password' => $_ENV[strtoupper($db_name) . '_PASS'],
            'database' => $_ENV[strtoupper($db_name) . '_NAME'],
            'dbdriver' => $_ENV[strtoupper($db_name) . '_DRIVER'],
            'dbprefix' => '',
            'pconnect' => FALSE,
            'db_debug' => (ENVIRONMENT !== 'production'),
            'cache_on' => FALSE,
            'cachedir' => '',
            'char_set' => 'utf8',
            'dbcollat' => 'utf8_general_ci',
            'swap_pre' => '',
            'encrypt' => FALSE,
            'compress' => FALSE,
            'stricton' => FALSE,
            'failover' => array(),
            'save_queries' => TRUE
        );
    }
}