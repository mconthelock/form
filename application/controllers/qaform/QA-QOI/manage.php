<?php
use GuzzleHttp\Client;
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH.'controllers/_form.php';
require_once APPPATH . 'controllers/_file.php';
class manage extends MY_Controller{
    use _Form, _File;

    protected $client;
    function __construct(){
		parent::__construct();
        $this->load->model('qaform/QA-QOI/qoi_model', 'qoi');
        $this->client = new Client(['verify' => false]);
        $this->upload_path = "//amecnas/AMECWEB/File/" .($this->_servername()=='amecweb' ? 'production' : 'development') ."/Form/QA/QOI/";
    }

    public function main($year=''){
        $year = $year != ''? $year : date('Y');
        $data['year'] = $year;
        $this->views('qaform/QA-QOI/manage',$data);
    }

    public function get_qoi_schedule(){
        $year = $this->input->post('year');
        // echo $start.' '.$end;
        // $data = $this->che->getFormData(["TO_CHAR(CREATE_DATE, 'YYYY') =" => $fyear]);
       // $data = $this->qoi->get_qoi_schedule($year);
       echo json_encode($this->qoi->get_qoi_schedule($year));
        //echo json_encode(array('data'=>$data));
    }

    public function save()
    {
        try {
                $path =   $this->upload_path."master/";
                $status = false;
                $message = '';
                $y = $_POST["FYEAR"];
                $act = ($_POST["MID"] == "") ? "add" : "edit";
                $mid = ($_POST["MID"] == "") ? $this->qoi->generate_dwg_id() : $_POST["MID"];
                $fid = $this->qoi->generate_file_id($mid);
                $key = array();
                $datadwg = array();
                $datadwgfile = array();
                if($act == "add")
                {
                    $datadwg = array(
                        'MID'       => $mid,
                        'ITMNO'     => $_POST["ITMNO"],
                        'DWGNO'     => $_POST["DWGNO"],
                        'SPEC'      => $_POST["SPEC"],
                        'PARTNAME'  => $_POST["PARTNAME"],
                        'SUBCONNAME' => $_POST["SUBCONNAME"],
                       // 'PATHDWG'   => $_POST["PATHDWG"],
                        'PATHSPEC'   => $_POST["PATHSPEC"],
                        'REMARK'   => $_POST["REMARK"],
                    );
                }else
                {
                    $key = array('MID' => $mid);
                    $datadwg = array(
                        'ITMNO'     => $_POST["ITMNO"],
                        'DWGNO'     => $_POST["DWGNO"],
                        'SPEC'      => $_POST["SPEC"],
                        'PARTNAME'  => $_POST["PARTNAME"],
                        'SUBCONNAME' => $_POST["SUBCONNAME"],
                       // 'PATHDWG'   => $_POST["PATHDWG"],
                        'PATHSPEC'   => $_POST["PATHSPEC"],
                        'REMARK'   => $_POST["REMARK"],
                    );

                }

               $upfile =  $this->uploadMultiFile($_FILES, ['DWGFILE','SPECFILE'], $path);
           
               foreach ($upfile["files"] as $fileType => $fileArray) {
                foreach ($fileArray as $file) {
                    $datadwgfile[] = array
                    (
                        'MID'   => $mid,
                        'FID'   => $fid,
                        'FTYPE' => substr($fileType,0,1),
                        'SFILE' => $file['file_name'],
                        'UFILE' => $file['file_origin_name']
                    );
                    $fid++;
                }
                }
                $datasch = array();
                if(isset($_POST["sch"]))
                {
                    $next = $y+1;
                    $sch = $_POST['sch']; 
                    foreach ($sch as $s) {
                        $datasch[] = array(
                            'MON' => ($s < 04 ? $next.$s : $y.$s) ,
                            'MID' => $mid
                        ); 
                    }

                }
               
                $this->qoi->trans_start();
                if($act == "add")
                {
                    $this->qoi->insert("QOI_DWGMASTER",$datadwg);
                }else
                {
                    $this->qoi->update("QOI_DWGMASTER", $datadwg, $key);
                }
                if(count($datadwgfile) > 0)
                {
                    $this->qoi->insert_batch("QOI_ATTFILE",$datadwgfile);
                }
                if(count($datasch) > 0)
                {
                    if($act == "edit")
                    {
                        $next = $y+1;
                        $this->qoi->delete("QOI_DWGSCHEDULE", "MID = '".$mid."' and (MON like '".$y."%' or MON = '".$next."01' or MON = '".$next."02' or MON = '".$next."03')");
                    }
                    $this->qoi->insert_batch("QOI_DWGSCHEDULE", $datasch);
                }
                $this->qoi->trans_complete();
                $status = $this->qoi->trans_status() === FALSE  ? false : true;

      }catch ( Exception $e) {
        $status = false;
        $message = "Failed to save data.";
    } finally {
        $res = [
            'status' => $status,
            'message' => $message
        ];
        echo json_encode($res);
    }
}

public function del(){
    $mid = $_POST['mid'];
    $mon = $_POST['mon'];
    $this->qoi->trans_start();
    $delsch = $this->qoi->deletesch("MID = ".$mid." and MON = '".$mon."'");
    $this->qoi->trans_complete();
    $res = [
        'status' => $delsch,
        'message' => ""
    ];
    echo json_encode($res);
}

public function delfile()
{
    $path = $this->upload_path."master/";
    $fid = $_POST['fid'];
    $nfile = $_POST['nfile'];
    $this->deleteFile($nfile,$path);
    $this->qoi->trans_start();
    $delfn = $this->qoi->delete("QOI_ATTFILE","FID = '".$fid."' AND SFILE = '".$nfile."'");
    $this->qoi->trans_complete();
    $res = [
        'status' => $delfn,
        'message' => ""
    ];
    echo json_encode($res);
}

public function mdownload($file,$ofile)
{
    $path = $this->upload_path."master";
    $this->downloadFile($ofile,$file,$path);

}

}