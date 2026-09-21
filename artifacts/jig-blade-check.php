<?php
error_reporting(E_ALL);
set_error_handler(function($severity,$message,$file,$line){throw new ErrorException($message,0,$severity,$file,$line);});
require __DIR__.'/../application/vendor/autoload.php';
function base_url(){return 'http://jig.test/form/';}
function root_url(){return 'http://jig.test/';}
$_ENV['APP_NAME']='test'; $_ENV['STATE']='development'; $_ENV['APP_CDN']='http://jig.test/cdn'; $GLOBALS['version']='test';
$cache=__DIR__.'/jig-blade-test-cache'; if(!is_dir($cache))mkdir($cache);
$data=['NFRMNO'=>'31','VORGNO'=>'051401','CYEAR'=>'26','CYEAR2'=>'','NRUNNO'=>'','EMPNO'=>'15199','mode'=>'1','pageMode'=>'create','inputBy'=>'15199','inputName'=>'','formno'=>'','cst'=>'','exdata'=>''];
foreach(['create','edit','view'] as $mode){
 $blade=new Coolpraz\PhpBlade\PhpBlade(__DIR__.'/../application/views',$cache);
 $data['pageMode']=$mode; $data['NRUNNO']=$mode==='create'?'':'1';
 $html=$blade->view()->make($mode==='create'?'ieform/IE-JIG/request_form':'ieform/IE-JIG/approve_form',$data)->render();
 if(strpos($html,'id="jig-form"')===false)throw new Exception('Missing form');
 if(substr_count($html,'id="jig-form"')!==1)throw new Exception('Duplicate form');
 if($mode==='create' && strpos($html,'id="jig-fields" disabled')!==false)throw new Exception('Create disabled');
 if ($mode === 'create') file_put_contents(__DIR__.'/jig-create-rendered.html',$html);
 echo 'PASS '.$mode.' Blade render ('.strlen($html).' bytes)'.PHP_EOL;
}
