<?php

/**
 * http://www.fpdf.org/en/script/script51.php
 */ 
trait PDF_ViewPref{
	protected $DisplayPreferences = '';

	function DisplayPreferences($preferences){
		$this->DisplayPreferences = $preferences;
	}

	function _putcatalog(){
		parent::_putcatalog();
		if(is_int(strpos($this->DisplayPreferences,'FullScreen')))
			$this->_put('/PageMode /FullScreen');
		if($this->DisplayPreferences) {
			$this->_put('/ViewerPreferences<<');
			if(is_int(strpos($this->DisplayPreferences,'HideMenubar')))
				$this->_put('/HideMenubar true');
			if(is_int(strpos($this->DisplayPreferences,'HideToolbar')))
				$this->_put('/HideToolbar true');
			if(is_int(strpos($this->DisplayPreferences,'HideWindowUI')))
				$this->_put('/HideWindowUI true');
			if(is_int(strpos($this->DisplayPreferences,'DisplayDocTitle')))
				$this->_put('/DisplayDocTitle true');
			if(is_int(strpos($this->DisplayPreferences,'CenterWindow')))
				$this->_put('/CenterWindow true');
			if(is_int(strpos($this->DisplayPreferences,'FitWindow')))
				$this->_put('/FitWindow true');
			$this->_put('>>');
		}
	}
}

?>