<?php
require_once 'fpdf.php';
require_once 'script/Protection/src/autoload.php'; 

$folder = __DIR__ . '/script';
foreach(glob("{$folder}/*.php") as $filename){
    require_once $filename;
}
