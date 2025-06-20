<?php
defined('BASEPATH') or exit('No direct script access allowed');

trait _Form{

    /**
    * @param number $no e.g. 5
    * @param string $orgNo e.g. 050601
    * @param string $y e.g. 20
    * @param string $y2 e.g. 2020
    * @param number $runNo  e.g. 2
    */
	public function toFormNumber($no, $orgNo, $y, $y2, $runNo)
	{
		$this->load->model('form_model', 'frm');
		$frmname = $this->frm->getFormName($no, $orgNo, $y); // ST-INP
		return $frmname[0]->VANAME.substr($y2,2,2)."-".str_pad($runNo, 6, "0", STR_PAD_LEFT); // ST-INP24-000001
	}


    public function getExtdata($no, $orgNo, $y, $y2, $runNo, $apv)
	{
		$this->load->model('form_model', 'frm');
		$extdata = $this->frm->getExtdata(array('NFRMNO' => $no , 'VORGNO' => $orgNo , 'CYEAR' => $y , 'CYEAR2' =>$y2 , 'NRUNNO' => $runNo), $apv);
		if(count($extdata) > 0){
			if(is_null($extdata[0]->CEXTDATA))
			{
				$ext = 0;
			}else{
				$ext = $extdata[0]->CEXTDATA;
			}
		}else{
			$ext = 0;
		}
		return $ext;
	}

    public function getMode($no, $orgNo, $y, $y2, $runNo, $apv)
    {
        $mode_add = "1";
        $mode_edit = "2";
        $mode_view = "3";
        $step_ready = "3";
        $this->load->model('form_model', 'frm');
        $rsf = $this->frm->customSelect("FLOW", array('NFRMNO' => $no, 'VORGNO' => $orgNo, 'CYEAR' => $y, 'CYEAR2' => $y2, 'NRUNNO' => $runNo));
        if(count($rsf) == 0)
        {
            return $mode_add;
        }else
        {
            $q = "select * From FLOW where NFRMNO = '".$no."' and VORGNO = '".$orgNo."' and CYEAR = '".$y."' and CYEAR2 = '".$y2."' and NRUNNO = '".$runNo."' and CSTEPST = '". $step_ready."' and (VAPVNO = '".$apv."' or VREPNO = '".$apv."')";
            $rsf = $this->db->query($q)->result();
            if(count($rsf) == 0)
            {
                return $mode_view;
            }else
            {
                return $mode_edit;
            }
        }
    }

    private function create($NNO, $VORGNO, $CYEAR, $req, $key, $remark='', $draft=''){
        try{
            $response = $this->client->post("http://localhost/webservice/webflow/form/create", [
                'json' => [
                    "nfrmno" => $NNO,
                    "vorgno" => $VORGNO,
                    "cyear"  => $CYEAR,
                    "empno"  => $req,
                    "inputempno" => $key,
                    "remark" => $remark,
                    "draft"  => $draft,
                ]
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(Exception $e){
            return array('status' => false, 'message' => 'Failed to create form', 'e' => $e);
        }
    }

    private function deleteForm($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO){
        try{
            $response = $this->client->post("http://localhost/webservice/webflow/form/deleteForm", [
                'json' => [
                    "nfrmno" => $NFRMNO,
                    "vorgno" => $VORGNO,
                    "cyear"  => $CYEAR,
                    "cyear2" => $CYEAR2,
                    "runno"  => $NRUNNO,
                ]
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(Exception $e){
            return array('status' => false, 'message' => 'Failed to delete form');
        }
    }

     /**
     * delete flow step
     * ส่งแบบ array ที่เดียวหลายค่าหลาย step
     * @param array $stepDel e.g    [ 'CSTEPNO' => '19', 'CSTEPNEXTNO' => '28'],
     *                              [ 'CSTEPNO' => '08', 'CSTEPNEXTNO' => '04'],
     *                              [ 'CSTEPNO' => '04', 'CSTEPNEXTNO' => '00'],
     * @param string $frmNo e.g. 17
     * @param string $orgNo e.g. 050601
     * @param string $y e.g. 16
     * @param string $y2 e.g. 2025
     * @param string $runNo e.g. 1
     * 
     * ส่งแบบอัปเดต step เดียว
     * @param string $frmNo e.g. 17
     * @param string $orgNo e.g. 050601
     * @param string $y e.g. 16
     * @param string $y2 e.g. 2025
     * @param string $runNo e.g. 1
     * @param string $step e.g. 06
     * @param string $stepNext e.g. 19
     */
    private function deleteFlowStep($stepDel='', $frmNo='', $orgNo='', $y='', $y2='', $runNo='', $step='', $stepNext=''){
        try{
            $response = $this->client->post("http://localhost/webservice/webflow/flow/deleteFlowStep", [
                'json' => [
                    'stepDel' => $stepDel,
                    'frmNo' => $frmNo,
                    'orgNo' => $orgNo,
                    'y'     => $y,
                    'y2'    => $y2,
                    'runNo' => $runNo,
                    'step'  => $step,
                    'stepNext'=> $stepNext
                ]
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(Exception $e){
            return array('status' => false, 'message' => 'Failed to delete flow step');
        }
    }

    /**
     * Delete flow step
     * @param array $form is form detail 
     * @param array $step is step to delete e.g. [['CSTEPNO' => '19', 'CSTEPNEXTNO' => '28']]
     */
    private function sendDeleteFlowStep($form, $step){
        $res = [];
        foreach ($step as $key => $s) {
            $res[$key] = new StdClass();
            $res[$key]->DELETE_STATUS = $this->deleteFlowStep($form['NFRMNO'], $form['VORGNO'], $form['CYEAR'], $form['CYEAR2'], $form['NRUNNO'], $s['CSTEPNO'], $s['CSTEPNEXTNO']);
            $res[$key]->STEP = $s; 
        }
        $res['FORM'] = (object)$form; 
        return $res;
    }

     /**
     * update approve by stepno
     * ส่งแบบ array ที่เดียวหลายค่าหลาย step
     * @param array $form e.g.  ['NFRMNO' => 17,
     *                           'VORGNO' => 050601,
     *                           'CYEAR'  => 16,
     *                           'CYEAR2' => 2025,
     *                           'NRUNNO' => 1]
     * @param array $apr e.g    ['CSTEPNO' => '06', 'CSTEPNEXTNO' => '19', 'apv' => 02035]
     *                          ['CSTEPNO' => '19', 'CSTEPNEXTNO' => '28', 'apv' => 96321]
     * ส่งแบบอัปเดต step เดียว
     * @param string $frmNo e.g. 17
     * @param string $orgNo e.g. 050601
     * @param string $y e.g. 16
     * @param string $y2 e.g. 2025
     * @param string $runNo e.g. 1
     * @param string $step e.g. 06
     * @param string $stepNext e.g. 19
     * @param string $apv e.g. 02035
     */
    private function updateFlowApv($form="", $apv="", $frmNo="", $orgNo="", $y="", $y2="", $runNo="", $step="", $stepNext=""){
        try{
            $response = $this->client->post("http://localhost/webservice/webflow/flow/updateFlowApv", [
                'json' => [
                    'form' => $form,
                    'apv'  => $apv,
                    'frmNo' => $frmNo,
                    'orgNo' => $orgNo,
                    'y'     => $y,
                    'y2'    => $y2,
                    'runNo' => $runNo,
                    'step'  => $step,
                    'stepNext'=> $stepNext,
                ]
            ]);
            $result = json_decode($response->getBody(), true);
            return $result;
        }catch(Exception $e){
            return array('status' => false, 'message' => 'Failed to update flow step', 'error' => $e->getMessage());
        }
    }
    // private function updateFlowApv($frmNo, $orgNo, $y, $y2, $runNo, $step, $stepNext, $apv){
    //     try{
    //         $response = $this->client->post("http://localhost/webservice/webflow/flow/updateFlowApv", [
    //             'json' => [
    //                 'frmNo' => $frmNo,
    //                 'orgNo' => $orgNo,
    //                 'y'     => $y,
    //                 'y2'    => $y2,
    //                 'runNo' => $runNo,
    //                 'step'  => $step,
    //                 'stepNext'=> $stepNext,
    //                 'apv'   => $apv
    //             ]
    //         ]);
    //         $result = json_decode($response->getBody(), true);
    //         return $result;
    //     }catch(Exception $e){
    //         return array('status' => false, 'message' => 'Failed to delete flow step');
    //     }
    // }
    
    /**
     * Crack request number to get form data
     * @param string $reqNo e.g. ST-INP24-000001
     * @return array
     */
    private function crackRequestNo($reqNo){
        $this->load->model('form_model', 'frm');
        $reqNo   = explode('-', $reqNo);
        $VANAME  = $reqNo[0].'-'.preg_replace('/[0-9]/', '', $reqNo[1]);
        $formMst = $this->frm->getFormMaster($VANAME);
        $res = [];
        if(!empty($formMst)){
            foreach($formMst as $key => $f){
                $res[] = [
                    'NFRMNO' => $f->NNO,
                    'VORGNO' => $f->VORGNO,
                    'CYEAR'  => $f->CYEAR,
                    'CYEAR2' => '20'.preg_replace('/[a-zA-Z]/', '', $reqNo[1]),
                    'NRUNNO' => (int)$reqNo[2],
                ];
            }
        }
        // print_r($res);
        return $res;
    }

    /**
     * Create link to form page
     * @param string $NFRMNO e.g. ST-INP
     * @param string $VORGNO e.g. ORG-001
     * @param string $CYEAR e.g. 2023
     * @param string $CYEAR2 e.g. 2024
     * @param int $NRUNNO e.g. 1
     * @return string
     */
    private function createLink($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO){
        $this->load->model('form_model', 'frm');
        $webflow = $_ENV['APP_WEBFLOW'];
        $formMst = $this->frm->getFormMasterByNo($NFRMNO, $VORGNO, $CYEAR);
        $link = '';
        if(!empty($formMst)){
            foreach($formMst as $key => $f){
                $link = strpos($f->VFORMPAGE,'amecweb') !== false ? $f->VFORMPAGE : $webflow.'/'.$f->VFORMPAGE;
                $link .= '?no='.$NFRMNO.'&orgNo='.$VORGNO.'&y='.$CYEAR.'&y2='.$CYEAR2.'&runNo='.$NRUNNO.'&empno=';
            }
        }
        return $link;
    }

    /**
     * Get request number from form data
     * @param string $reqNo e.g. ST-INP24-000001
     */
    public function getRequestNo($reqNo = null){
        $this->load->model('form_model', 'frm');
        $reqNo = $this->isAjaxRequest() ? $this->input->post('reqNo') : $reqNo;
        $form = $this->crackRequestNo($reqNo);
        $res = ['status' => 0, 'form' => null];
        if (!empty($form)) {
            foreach($form as $key => $f){
                $f = (object)$f;
                $data = $this->frm->getForm($f->NFRMNO, $f->VORGNO, $f->CYEAR, $f->CYEAR2, $f->NRUNNO);
                if(!empty($data)) { 
                    $data[0]->LINK = $this->createLink($f->NFRMNO, $f->VORGNO, $f->CYEAR, $f->CYEAR2, $f->NRUNNO);
                    $res['status'] = 1;
                    $res['form'][] = $data[0];
                    // print_r($res);
                }  
            }
        }
        if( $this->isAjaxRequest() ){
            echo json_encode($res);
        }else{
            return $res;
        }
    }

    public function getFormDetail($NFRMNO = '', $VORGNO = '', $CYEAR = '', $CYEAR2 = '', $NRUNNO = ''){
        $this->load->model('form_model', 'frm');
        if( $this->isAjaxRequest() ){
            $NFRMNO = $this->input->post('NFRMNO');
            $VORGNO = $this->input->post('VORGNO');
            $CYEAR = $this->input->post('CYEAR');
            $CYEAR2 = $this->input->post('CYEAR2');
            $NRUNNO = $this->input->post('NRUNNO');
            $data = $this->frm->getForm($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO);
            if(!empty($data)){
                $data = $data[0];
                $data->LINK = $this->createLink($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO);
            }
            echo json_encode($data);
        }else{
            $data = $this->frm->getForm($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO);
            if(!empty($data)){
                $data = $data[0];
                $data->LINK = $this->createLink($NFRMNO, $VORGNO, $CYEAR, $CYEAR2, $NRUNNO);

            }
            return $data;
        }
    }



}