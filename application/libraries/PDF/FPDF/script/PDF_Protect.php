<?php
trait PDF_Protect{
	
    /**
     * Decrypt PDF file.
     * @author  Mr.Pathanapong Sokpukeaw
     * @since   2022-11-03
     * @param   string $filename
     * @param   string $password - Sets the user or owner password to be used in decoding encrypted PDF files.
     * @return  bool
     */
	public function decryptFile($filename, $password = ''){
        if($this->_isProtection($filename)){
            return $this->unProtect($filename, $password);
        }   

        return true;
	}
	
	/**
     * Check PDF file is protection.
     * @author  Mr.Pathanapong Sokpukeaw
     * @since   2022-11-03
     * @param   string @filename
     * @return  bool
     */
    private function _isProtection($filename){
        $handle = fopen($filename, "r");
        $contents = fread($handle, filesize($filename));
        fclose($handle);
		return stristr($contents, "/Encrypt") ? true : false;
    }
	
	/**
     * Un-protect PDF file by tool gswin32c
     * @author  Mr.Pathanapong Sokpukeaw
     * @since   2022-11-03
     * @param   string $filename >> "\\\\amecnas/AMECWEB/file/filename.pdf"
     * @param   string $password >> Sets the user or owner password to be used in decoding encrypted PDF files.
     * @note    -dCompatibilityLevel=1.4 set support libraries FPDF
     */
    public function unProtect($filename, $password = ''){
        $prg = "//amecnas/AMECWEB/wwwroot/production/cdn/Application/gs/gs10.04/bin/gswin64c.exe";
        $tmp = str_replace('.pdf', '.tmp', $filename);
       
        copy($filename, $tmp);
        $msg = system('"'.$prg.'" -q -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPreserveAnnots=false -dAutoRotatePages=/None -sOutputFile="'.$filename.'" -sPDFPassword="'.$password.'" -f "'.$tmp.'"');
        @unlink($tmp);  
        
        if($msg != ''){
            return false;
        }else{
            return true;
        }
    }
}

?>