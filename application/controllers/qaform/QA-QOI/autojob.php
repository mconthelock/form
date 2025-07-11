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
        //$this->load->library('F_PDF');
	
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
				$this->doaction($this->NFRMNO, $this->VORGNO, $this->CYEAR, $flow["message"]["cyear2"], $flow["message"]["runno"],"approve","09058", "approve auto");
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
				//$dstFile = '\\\\webflow\\iscompaq24\\qa\\qoi\\file\\'.$dstfolder."\\";
				$dstFile = '\\\\amecnas\\AMECWEB\\file\\development\\Form\\QA\QOI\\'.$dstfolder."\\";
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

    /* create over usage*/

	public function createOverusg()
	{
		$nfrmno = "4";
		$vorgno = "050501";
		$cyear = "12";
		//$nextMonth = date('Ym', strtotime('first day of next month'));
		$y = '202504';
		$q = "select distinct TYREQ From QOI_DWGMASTER M, QOI_DWGSCHEDULE S where M.MID = S.MID and S.MON = '".$y."' and ISSUE = 'Y' and TYREQ in ('1','3')";
		echo "<br/>";
		$rs = $this->qoi->getdatasql($q);
		foreach($rs as $r)
		{
		
				$q = "select distinct PLANCODE from plancode where itemno in (select PURITEM From QOI_DWGMASTER M, QOI_DWGSCHEDULE S where M.MID = S.MID and S.MON = '".$y."' and ISSUE = 'Y' and TYREQ = '".$r->TYREQ."')";	
				$rsinc = $this->qoi->getdatasql($q);
				foreach($rsinc as $inc)
				{
					$q = "select M.TYREQ , M.RQQTY , M.REMARKOVR , P.* From QOI_DWGMASTER M, QOI_DWGSCHEDULE S , PLANCODE P where M.MID = S.MID and S.MON = '".$y."' and ISSUE = 'Y' and TYREQ = '".$r->TYREQ."' and M.PURITEM = P.ITEMNO and P.PLANCODE = '".$inc->PLANCODE."'";
					$rsitm = $this->qoi->getdatasql($q);
					if(count($rsitm) > 0)
					{
						$flow = $this->create($nfrmno, $vorgno , $cyear, '02051', '02051', $rsitm[0]->REMARKOVR,'');
					if(isset($flow["message"]["runno"]))
					{
						$form  = ['NFRMNO' => $nfrmno,
						'VORGNO' => $vorgno,
						'CYEAR'  => $cyear,
						'CYEAR2' => $flow["message"]["cyear2"],
						'NRUNNO' => $flow["message"]["runno"]
						   ];
						$dataflow = [
							['CSTEPNO' => '26', 'apv' => $inc->PLANCODE],
						];
						//find SEM INC
						$q = "select VEMPNO From ORGPOS WHERE VPOSNO = '30' AND VORGNO IN (SELECT SSECCODE FROM amec.aemployee WHERE SEMPNO = '".$inc->PLANCODE."')";
						$rssem = $this->qoi->getdatasql($q);
						if(count($rssem) > 0)
						{
							$dataflow[] = ['CSTEPNO' => '57', 'apv' => $rssem[0]->VEMPNO];
						}
						$q = "select VEMPNO From ORGPOS WHERE VPOSNO = '20' AND VORGNO IN (SELECT SSECCODE FROM amec.aemployee WHERE SEMPNO = '".$inc->PLANCODE."')";
						$rsdem = $this->qoi->getdatasql($q);
						if(count($rsdem) > 0)
						{
							$dataflow[] = ['CSTEPNO' => '59', 'apv' => $rsdem[0]->VEMPNO];
						}else{
							$this->deleteFlowStep('', $nfrmno, $vorgno, $cyear, $flow["message"]["cyear2"], $flow["message"]["runno"], '59', '11');
						}
						if($r->TYREQ == "3")
						{
							$dataflow[] = ['CSTEPNO' => '19', 'apv' => "06241"];
						}

						$fstatus = $this->updateFlowApv($form , $dataflow);
						$this->deleteFlowStep('', $nfrmno, $vorgno, $cyear, $flow["message"]["cyear2"], $flow["message"]["runno"], '56', '00');
						$dataflow = array();
						$q = "select distinct VAPVNO From FLOW where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' AND CYEAR = '".$cyear."' AND CYEAR2 = '".$flow["message"]["cyear2"]."' AND NRUNNO = '".$flow["message"]["runno"]."'";
						$rsflow = $this->qoi->getdatasql($q);
						$dataovu = array(
							'NFRMNO' => $nfrmno,
							'VORGNO' => $vorgno,
							'CYEAR'  => $cyear,
							'CYEAR2' => $flow["message"]["cyear2"],
							'NRUNNO' => $flow["message"]["runno"],
							'TYREQ'  => $r->TYREQ,
							'REQFOR' => '1',
							'TYPESEC' => ($r->TYREQ == "1"? "1":"0"),
							'OTHER'   => "ET6200313",
							'URGENT'  => '0'
						);
						$dataitm = array();
						$id = 1;
						foreach($rsitm as $itm)
						{
							$dataitm[] = array(
								'NFRMNO' => $nfrmno,
								'VORGNO' => $vorgno,
								'CYEAR'  => $cyear,
								'CYEAR2' => $flow["message"]["cyear2"],
								'NRUNNO' => $flow["message"]["runno"],
								'ID'     => $id,
								'PRTNAME' => $itm->VDESC,
								'DWGMATSZ' => $itm->DWGNO,
								'ITEMNO'  => $itm->GRPCODE,
								'WHITMNO' => $itm->ITEMNO,
								'CAPPROVE' =>'0',
								'RQQTY' => $itm->RQQTY,
								'CNDNO' => '4',
								'NCOST' => ($itm->NCOST+($itm->NCOST*0.049)),
								'VADDR' => $itm->VADDR,
								'VUNIT' => 'PCs'
							);
							foreach($rsflow as $f){
								$dataflow[] = array
								(
									'NFRMNO' => $nfrmno,
									'VORGNO' => $vorgno,
									'CYEAR'  => $cyear,
									'CYEAR2' => $flow["message"]["cyear2"],
									'NRUNNO' => $flow["message"]["runno"],
									'ITEMNO'  =>  $itm->ITEMNO,
									'VOWNER'  => $f->VAPVNO,
									'CAPPROVE' => '1',
									'ID'       => $id
								);
							}
							$id++;
						}

						$this->qoi->insert("OVRUSGFORM",$dataovu);
						$this->qoi->insert_batch("ITEMAPVLIST",$dataitm);
						$this->qoi->insert_batch("OVUFLOW",$dataflow);
					}

					}
					
				}
			
		}
		$itmlst = [ '1', '2', '3','6', '7'];
		foreach ($itmlst as  $items) {
			//$itmnoList = "'" . implode("','", $items) . "'";
			$q = "select M.* From QOI_DWGMASTER M, QOI_DWGSCHEDULE S where M.MID = S.MID and S.MON = '".$y."' and ISSUE = 'Y' and TYREQ = '4' and SUBSTR(ITMNO,1,1) = $items";
			echo "<br/>";
			$rsitm = $this->qoi->getdatasql($q);
			if(count($rsitm) > 0)
			{
				$flow = $this->create($nfrmno, $vorgno , $cyear, '02051', '02051', $rsitm[0]->REMARKOVR,'');
				if(isset($flow["message"]["runno"]))
				{
						$form  = ['NFRMNO' => $nfrmno,
						'VORGNO' => $vorgno,
						'CYEAR'  => $cyear,
						'CYEAR2' => $flow["message"]["cyear2"],
						'NRUNNO' => $flow["message"]["runno"]
						   ];
						$q = "update FLOW set CSTEPNEXTNO = '18' WHERE NFRMNO = '".$nfrmno."' and VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$flow["message"]["cyear2"]."' and NRUNNO = '".$flow["message"]["runno"]."' and CSTEPNO = '04'";
						$this->qoi->execsql($q);
						$q = "INSERT INTO FLOW SELECT NFRMNO , VORGNO , CYEAR , CYEAR2 , NRUNNO , '18' , '11' , CSTART , CSTEPST , CTYPE , VPOSNO , '09014' , '09014' ,VREALAPV , CAPVSTNO , DAPVDATE , CAPVTIME ,'06', CAPVTYPE , CREJTYPE , CAPPLYALL , VURL , VREMARK , VREMOTE  FROM FLOW  WHERE ";
						$q .= "NFRMNO = '".$nfrmno."' and VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$flow["message"]["cyear2"]."' and NRUNNO = '".$flow["message"]["runno"]."' and CSTEPNO = '26'";
						$this->qoi->execsql($q);
						//$q = "update FLOW set VAPVNO='09014' , VREPNO='09014' , CSTEPNO = '18' , CSTEPNEXTNO = '11' , VPOSNO ='' , CEXTDATA = '06' , CAPPLYALL ='0' WHERE ";
						//$q .= "NFRMNO = '".$nfrmno."' and VORGNO = '".$vorgno."' and CYEAR = '".$cyear."' and CYEAR2 = '".$flow["message"]["cyear2"]."' and NRUNNO = '".$flow["message"]["runno"]."' and CSTEPNO = '26'";
						//$this->qoi->execsql($q);
						$dataflow = [
							[ 'CSTEPNO' => '26', 'CSTEPNEXTNO' => '57'],
							[ 'CSTEPNO' => '57', 'CSTEPNEXTNO' => '58'],
							[ 'CSTEPNO' => '58', 'CSTEPNEXTNO' => '59'],
							[ 'CSTEPNO' => '59', 'CSTEPNEXTNO' => '11'],
							[ 'CSTEPNO' => '56', 'CSTEPNEXTNO' => '00']
						];
						$this->deleteFlowStep($dataflow, $nfrmno, $vorgno, $cyear, $flow["message"]["cyear2"], $flow["message"]["runno"], '', '');
						$dataflow = array();
						$q = "select distinct VAPVNO From FLOW where NFRMNO = '".$nfrmno."' AND VORGNO = '".$vorgno."' AND CYEAR = '".$cyear."' AND CYEAR2 = '".$flow["message"]["cyear2"]."' AND NRUNNO = '".$flow["message"]["runno"]."'";
						$rsflow = $this->qoi->getdatasql($q);
						if(($items == "1")||($items == "2")||($items == "3"))
						{
							$typeorder = "1";
						}else{
							$typeorder = "2";
						}

						$dataovu = array(
							'NFRMNO' => $nfrmno,
							'VORGNO' => $vorgno,
							'CYEAR'  => $cyear,
							'CYEAR2' => $flow["message"]["cyear2"],
							'NRUNNO' => $flow["message"]["runno"],
							'TYREQ'  => '4',
							'REQFOR' => '1',
							'TYPESEC' => '1',
							'OTHER'   => $this->genorder($typeorder),
							'URGENT'  => '0'
						);
						$dataitm = array();
						$id = 1;
						foreach($rsitm as $itm)
						{
							$dwg = explode(" ",$itm->DWGNO);
		
							$q = "select distinct BMHINM , PNZUBA , PARTNAME FROM DATALIBO.PNPNLVIEW WHERE PNZUBA = '".$dwg[0]."' and pnhing = '".$dwg[1]."'";
							$rsas = $this->qoi->getdataAssql($q);
							if(count($rsas) > 0)
							{
								$dataitm[] = array(
									'NFRMNO' => $nfrmno,
									'VORGNO' => $vorgno,
									'CYEAR'  => $cyear,
									'CYEAR2' => $flow["message"]["cyear2"],
									'NRUNNO' => $flow["message"]["runno"],
									'ID'     => $id,
									'PRTNAME' => substr($rsas[0]->PARTNAME,0,256),
									'DWGMATSZ' => $itm->DWGNO,
									'ITEMNO'  => substr($rsas[0]->BMHINM,0,3),
									'WHITMNO' => '',
									'CAPPROVE' =>'0',
									'RQQTY' => $itm->RQQTY,
									'CNDNO' => '4',
									'VUNIT' => 'PCs'
								);
								foreach($rsflow as $f){
									$dataflow[] = array
									(
										'NFRMNO' => $nfrmno,
										'VORGNO' => $vorgno,
										'CYEAR'  => $cyear,
										'CYEAR2' => $flow["message"]["cyear2"],
										'NRUNNO' => $flow["message"]["runno"],
										'VOWNER'  => $f->VAPVNO,
										'CAPPROVE' => '1',
										'ID'       => $id
									);
								}
								$id++;
		
							}
						
							
						}
						$this->qoi->insert("OVRUSGFORM",$dataovu);
						$this->qoi->insert_batch("ITEMAPVLIST",$dataitm);
						$this->qoi->insert_batch("OVUFLOW",$dataflow);
		
				}
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
			//$dstFile 	 = '\\\\webflow\\iscompaq24\\qa\\qoi\\file\\'.$dstfolder."\\"; //file for qa
			$dstFile = '\\\\amecnas\\AMECWEB\\file\\development\\Form\\QA\QOI\\'.$dstfolder."\\";
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
		$this->load->library('PDF');
		$pdf = new PDF("L","mm","A4");
		$pagecount = $pdf->setSourceFile($filePDF);
		for($loop=1; $loop<=$pagecount; $loop++){
			$tplidx = $pdf->importPage($loop);
			$pdf->addPage();
			$pdf->useTemplate($tplidx, 0, 0,297,210);
			$pdf->SetFont('sarabun','',12);
			$pdf->SetTextColor(216, 0, 0);
			$pdf->TextWithRotation(4,120,$stamptext." - ".date("Y/m/d"),90);
		}
		// $file=$pdf->Output('I',$filePDF);
		// $file=$pdf->Output($filePDF, 'F');
        // print_r($file);
        $tmpFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . basename($filePDF);
        $pdf->Output($tmpFile,'F' );
        // ค่อย copy ไป network share
        copy($tmpFile, $filePDF);
        @unlink($tmpFile);
        }

	private function genorder($typeorder)
	{

		// start Order
			
			if($typeorder == "1")
			{
				$preor = "ET6".date('y');
				$numrun = "536".date('y');
			}else
			{	
				$preor = "ST6".date('y');
				$numrun = "236".date('y');

			}
			$q = "select TRIM(TO_CHAR(TO_NUMBER(NVL(MAX(SUBSTR(other, 6,3)),0) , 'xxx')+1, 'XXX')) as ID From ovrUsgForm where other like '".$preor."%' ";
			$num = $this->qoi->getdatasql($q)[0]->ID;
			$preor .= str_pad($num, 3, "0", STR_PAD_LEFT);
			$tempnum = str_pad($num, 3, "0", STR_PAD_LEFT);
			$numrun .= $this->strtobit(substr($tempnum, 0, 1));
			$numrun .= $this->strtobit(substr($tempnum, 1, 1));
			$numrun .= $this->strtobit(substr($tempnum, 2, 1));
			$numrun = number_format((float)$numrun / 7, 2, '.', ''); // แบ่งแล้ว format ทศนิยม 2 ตำแหน่ง
			$scrap = substr($numrun, strpos($numrun, ".") + 1, 1);    // ดึงหลักทศนิยมตัวแรก
			$preor .= $this->scrap($scrap);		
			return $preor;
		// end Order

	}	

	private function strtobit($str)
	{
		switch (strtoupper($str)) {
			case "A": return 1;
			case "B": return 2;
			case "C": return 3;
			case "D": return 4;
			case "E": return 5;
			case "F": return 6;
			default:  return (int)$str;
		}
	}

	private function scrap($numscrap)
	{
		switch (strtoupper($numscrap)) {
			case "3": return 0;
			case "4": return 3;
			case "5": return 4;
			case "6": return 0;
			case "7": return 5;
			case "8": return 6;
			case "9": return 0;
			default:  return (int)$str;
		}

	}


}
?>