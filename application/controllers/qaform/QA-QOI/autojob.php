<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
Class autojob extends CI_Controller {
	private $NFRMNO = "2";
	private $VORGNO = "050301";
	private $CYEAR = "13";  
	use _Form;
	protected $client;
	function __construct()
	{
		parent::__construct();
		$this->load->model('qaform/QA-QOI/qoi_model', 'qoi');
		$this->client = new Client(['verify' => false]);
	}
	
	/**
	 * Load index.
	 */
	public function index()
	{
	
	
	}
	
	public function createQoiSch()
	{
		$y = date("Y");
		$ny = $y+1;
		$q = "INSERT INTO QOI_DWGSCHEDULE SELECT TO_CHAR(TO_NUMBER(SUBSTR(MON, 1, 4)) + 1) || SUBSTR(MON, 5, 2) AS NEXT_MON , MID FROM QOI_DWGSCHEDULE WHERE MON >= '".$y."04' AND MON <= '".$ny."03'";
		$this->qoi->execsql($q);
	}


	public function createQoi()
	{
		$y = date("Ym");
		$inspecdate = "01/".date("m/Y");;
		$expchgdate = date('t/m/Y',strtotime('today'));
		$tilte = "Quality Observation Inspection on ".date("M Y");
		$q = "select * From QOI_DWGMASTER M, QOI_DWGSCHEDULE S where M.MID = S.MID and S.MON = '".$y."'";
		$rs = $this->qoi->getdatasql($q);
		foreach($rs as $r)
		{
			
			$flow = $this->create($this->NFRMNO, $this->VORGNO, $this->CYEAR, '02051', '02051', $r->REMARK,'');
			if(isset($flow["message"]["runno"]))
			{
				$data = array(
					'NFRMNO' => $this->NFRMNO,
					'VORGNO' => $this->VORGNO,
					'CYEAR'  => $this->CYEAR,
					'CYEAR2' => $flow["message"]["cyear2"],
					'NRUNNO' => $flow["message"]["runno"], 
					'TITLE'  => $tilte,
					'ITEMNO' => $r->ITMNO,
					'PRTNAME' => $r->PARTNAME,
					'SVENDNAME' => $r->SUBCONNAME,
					'INSPECDATE' => $inspecdate,
					'EXPCHGDATE' => $expchgdate
				);
				$this->qoi->insert("QOIFORM", $data);
				$datadwg = array(
					'NFRMNO' => $this->NFRMNO,
					'VORGNO' => $this->VORGNO,
					'CYEAR'  => $this->CYEAR,
					'CYEAR2' => $flow["message"]["cyear2"],
					'NRUNNO' => $flow["message"]["runno"],
					'DWGNO'  => (is_null($r->DWGNO)? $r->SPEC : $r->DWGNO)
				);
				$this->qoi->insert("RESULTQOIDWG", $datadwg);
				//create folder 
				$dstfolder = $this->NFRMNO."_".$this->VORGNO."_".$this->CYEAR."_".$flow["message"]["cyear2"]."_". $flow["message"]["runno"];
				$dstFile = '\\\\webflow\\iscompaq24\\qa\\qoi\\file\\'.$dstfolder."\\";
				$this->createPath($dstFile); //check create path 
				$fid = 0;
				$datafile = array();
				if(strtoupper(substr($r->DWGNO,0,1)) == "X")
				{
					// get X DWG  
					$str = str_replace(" ","",strstr($r->DWGNO, '-', true));
					$xdwg = $str."_draw.pdf";
					$xdwglst = $str."_list.pdf";
					$fname = $this->getxdwgfile($xdwg,$dstFile);
					if($fname != "")
					{
						$fid++;
						$datafile[] = array(
							'NFRMNO' => $this->NFRMNO,
							'VORGNO' => $this->VORGNO,
							'CYEAR'  => $this->CYEAR,
							'CYEAR2' => $flow["message"]["cyear2"],
							'NRUNNO' => $flow["message"]["runno"],
							'ITEMNO' => $fid,
							'TYPENO' => '0',
							'SFILE'  => $fname
						);
					}
					$fname = $this->getxdwgfile($xdwglst,$dstFile);
					if($fname != "")
					{
						$fid++;
						$datafile[] = array(
							'NFRMNO' => $this->NFRMNO,
							'VORGNO' => $this->VORGNO,
							'CYEAR'  => $this->CYEAR,
							'CYEAR2' => $flow["message"]["cyear2"],
							'NRUNNO' => $flow["message"]["runno"],
							'ITEMNO' => $fid,
							'TYPENO' => '0',
							'SFILE'  => $fname
						);
					}
					// end
				}else
				{
					// get DWG from PDM
					$fname = $this->getdwgfilepdm(SUBSTR(str_replace(' ', '', $r->DWGNO),0,9),$dstfolder);
					if($fname != "")
					{
						$fid++;
						$datafile[] = array(
							'NFRMNO' => $this->NFRMNO,
							'VORGNO' => $this->VORGNO,
							'CYEAR'  => $this->CYEAR,
							'CYEAR2' => $flow["message"]["cyear2"],
							'NRUNNO' => $flow["message"]["runno"],
							'ITEMNO' => $fid,
							'TYPENO' => '0',
							'SFILE'  => $fname
						);
					}
					// End
				}
				// get file from Dwg master of QOI
				$srcFile = "\\\\amecnas\\AMECWEB\\file\\development\\Form\\QA\QOI\\master\\";
				$rsatt = $this->qoi->customSelect("QOI_ATTFILE",array('MID' => $r->MID),'SFILE , FTYPE');
				foreach($rsatt as $att)
				{
					$fid++;
					$datafile[] = array
					(
						'NFRMNO' => $this->NFRMNO,
						'VORGNO' => $this->VORGNO,
						'CYEAR'  => $this->CYEAR,
						'CYEAR2' => $flow["message"]["cyear2"],
						'NRUNNO' => $flow["message"]["runno"],
						'ITEMNO' => $fid,
						'TYPENO' => ($att->FTYPE == "S"? "1":"0"),
						'SFILE'  => $att->SFILE
					);
					copy($srcFile.$att->SFILE, $dstFile.$att->SFILE);
				}
				//End
				// get file from PATHSPEC
				if($r->PATHSPEC != "")
				{
					$pathspec =  $r->PATHSPEC;
					$pathspec = str_replace('\\', '\\\\', $pathspec);
					$pathspec = str_replace('O:', '\\\\amecnas', $pathspec);
					if(is_dir($pathspec))
					{
						
						$latestFile = null;
						$latestModTime = 0;
						$files = scandir($pathspec);
						$files = array_filter($files, function($file) use ($pathspec) {
							return $file !== '.' && $file !== '..' && is_file($pathspec ."\\". $file);
						});
						$latestFile = '';
						$latestTime = 0;
	
						foreach ($files as $file) {
							$filePath =  $pathspec."\\".$file;
							$fileTime = filemtime($filePath);
							if ($fileTime > $latestTime) {
								$latestTime = $fileTime;
								$latestFile = $file;
							}
						}
						$nlatestFile =  date('YmdHi')."_".$latestFile;
						$fid++;
						$datafile[] = array
						(
							'NFRMNO' => $this->NFRMNO,
							'VORGNO' => $this->VORGNO,
							'CYEAR'  => $this->CYEAR,
							'CYEAR2' => $flow["message"]["cyear2"],
							'NRUNNO' => $flow["message"]["runno"],
							'ITEMNO' => $fid,
							'TYPENO' => '1',
							'SFILE'  => $nlatestFile 
						);
						copy($pathspec."\\".$latestFile, $dstFile.$nlatestFile);
					}
				}
				//END

				if(count($datafile) > 0)
				{
					$this->qoi->insert_batch("ATTQOIFRM",$datafile);
				}
				//if(!is_null($r->PATHDWG))
				//{


				//}
			}
			
		}
	}
	/**
	 * get drawing file from PDM
	*/
	private function getdwgfilepdm($drawingNo,$dstfolder)
	{
		$obj 	    = $this->qoi->getDwgrev($drawingNo);
		$stamptext  = "FOR QA ONLY";
		if(count($obj)!=0){
			$obj 		 = $obj[0];
			$obj->folder_path = str_replace('Y:\\', '\\\\amecnas\\xfiles\\localpdm\\', $obj->folder_path);
			$srcFile  	 = $obj->folder_path . '\\' . $obj->file_name . '_' . $obj->internal_revision_no . '_DWGVIEW_' . $obj->file_seqno;
			$dstFile 	 = '\\\\webflow\\iscompaq24\\qa\\qoi\\file\\'.$dstfolder."\\"; //file for qa
			$filename    = $this->get_microtime().$obj->file_name;
			$fileTIF 	 = $dstFile .$filename .".tif";
			$dwgname = explode('_', $filename); //change file name drawing.pdf by extract drawing only underscore file time_drawing_revision.pdf
			$newfile = date('YmdHi')."_".$dwgname[1] .".pdf";
			$filePDF 	 = $dstFile .$newfile; //file name drawing.pdf
			$this->copyFileTif($srcFile, $fileTIF);
			$this->convertTIFtoPDF($fileTIF, $filePDF);				
			$this->pdfAddInfo($filePDF,$stamptext);
			@unlink($fileTIF); //delete file tif
			return $newfile; 
		}else{
			return "";
		}
	}
	/**
	 * get X drawing file from \\\\amecnas\DED_Div\CONFIDENTIAL\Centralized_Manual\X 
	*/
	private function getxdwgfile($file,$dstfolder)
	{
		$srcFile = "\\\\amecnas\\DED_Div\\CONFIDENTIAL\\Centralized_Manual\\X\\".$file;
		if(file_exists($srcFile))
		{
			$nfile = date('YmdHi')."_".$file;
			$dstfolder = $dstfolder.$nfile;
			copy($srcFile,$dstfolder);
			return $nfile;
		}else
		{
			return "";
		}

	}



	/**
	* recursively create a long directory path
	*/
	function createPath($path) {
		if (is_dir($path)) 
		return true;
		$prev_path = substr($path, 0, strrpos($path, '/', -2) + 1 );
		$return = $this->createPath($prev_path);
		return ($return && is_writable($prev_path)) ? mkdir($path) : false;
	}

	private function get_microtime(){
		return floor(microtime(true) * 1000).'_';
    }

	private function copyFileTif($srcFile, $dstFile){
		copy($srcFile, $dstFile);
	}

    /**
     * Convert TIF to PDF file.
     * @author  Mr.Pathanapong Sokpukeaw
     * @since 2018-07-19
     */
	private function convertTIFtoPDF($inputPath, $outputPath){
		$programPath = "//amecnas/AMECWEB/wwwroot/production/cdn/Application/GnuWin32/bin/tiff2pdf.exe";
		exec('"'.$programPath.'" -z -q 100 -o "'.$outputPath.'" "'.$inputPath.'"');
	}

		/**
	 * pdfAddInfo (Stamp Text etc For QA Only)
	 *
	 * Support program of Jeab (unprotect file)
	 *
	 * @author Mr.Pornprasit
	 * @since 2022-09-13
	 * @param  $filePDF  file pdf
	 * @return 	 pdf file 
	 */
	private function pdfAddInfo($filePDF,$stamptext){
		//wait modify
		$this->load->library('F_PDF');
		$pdf = new F_PDF("L","mm","A4");
		$pagecount = $pdf->setSourceFile($filePDF);
		for($loop=1; $loop<=$pagecount; $loop++){
			$tplidx = $pdf->importPage($loop);
			$pdf->addPage();
			$pdf->useTemplate($tplidx, 0, 0,297,210);
			$pdf->SetFont('Arial','',12);
			$pdf->SetTextColor(216, 0, 0);
			$pdf->TextWithRotation(4,120,$stamptext." - ".date("Y/m/d"),90);
		}
		$pdf->Output('F', $filePDF);
	}

}
?>