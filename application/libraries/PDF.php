<?php
/**
 * FPDF.
 * @author	Mr.Pathanapong Sokpukeaw
 * @since 	2022-12-19
 */
 
if(!defined('BASEPATH')) exit('No direct script access allowed');  

/*
    install font
    cd Y:\wwwroot\development\form\application\vendor\tecnickcom\tcpdf\tools\   
    php tcpdf_addfont.php -i Y:\wwwroot\development\form\assets\fonts\sarabun\Sarabun-Regular.ttf
*/
require_once APPPATH . 'vendor/autoload.php';
use setasign\Fpdi\Tcpdf\Fpdi;

class PDF extends Fpdi{
	
	// include -> "PDF\FPDF\script"
	// use PDF_Protect, AlphaPDF, PDF_Ellipse, FPDF_CellFit, PDF_TextBox, PDF_Rotate, PDF_ViewPref, RPDF;
	
	function SetCellMargin($margin){
	  $this->cMargin = $margin; 
	}

    public function TextWithRotation($x, $y, $txt, $angle) {
       // Save current transformation
       $this->StartTransform();
       // Rotate around (x, y)
       $this->Rotate($angle, $x, $y);
       // Write text
       $this->Text($x, $y, $txt);
       // Restore previous transformation
       $this->StopTransform();
    }
}