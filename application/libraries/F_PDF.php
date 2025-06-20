<?php
/**
 * FPDF.
 * @author	Mr.Pathanapong Sokpukeaw
 * @since 	2022-12-19
 */
 
if(!defined('BASEPATH')) exit('No direct script access allowed');  

require_once APPPATH . 'libraries/PDF/FPDF/autoload.php';
require_once APPPATH . 'libraries/PDF/FPDI/src/autoload.php';
use setasign\FpdiProtection\FpdiProtection;

class F_PDF extends FpdiProtection{
	
	// include -> "PDF\FPDF\script"
	use PDF_Protect, AlphaPDF, PDF_Ellipse, FPDF_CellFit, PDF_TextBox, PDF_Rotate, PDF_ViewPref, RPDF;
	
	function SetCellMargin($margin){
	  $this->cMargin = $margin; 
	}
}