<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';
class vms_model extends my_model 
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        
        
    }

    public function generate_attfile_id($cyear2,$nrunno)
    {
        $this->db->select('NVL(MAX(ITEMNO),0) AS ITEMNO')
        ->from('VMS_ATTFILE')
        ->where('CYEAR2', $cyear2)
        ->where('NRUNNO', $nrunno);
        return $this->db->get()->result()[0]->ITEMNO+1;
    }

    public function get_salecompany()
    {
        $this->db
        ->select('*')
        ->from('TMAINTAINAGENT_ELE')
        ->where('STATUS', 'YES')
        ->order_by('ABBREVIATION', 'asc');
    return $this->db->get()->result();
    }

    public function get_participants($con  = '')
    {
        if($con != ''){
            foreach($con as $key => $val) {
            $this->set_where($key, $val);
            }
        }
        $this->db
        ->select('SEMPNO , SNAME , SSEC , SDEPT , SDIV , SPOSNAME')
        ->from('AMECUSERALL')
        ->where('CSTATUS', '1')
        ->group_start()               // เริ่มวงเล็บสำหรับเงื่อนไข OR
        ->where('SPOSCODE <=', 40)
        ->or_where('SPOSCODE', 49)
        ->or_where('SPOSCODE', 50)
        ->group_end() 
        ->order_by('SNAME', 'asc');
    return $this->db->get()->result();

    }

    public function get_stakeholders($con)
    {
        if($con != ''){
            foreach($con as $key => $val) {
            $this->set_where($key, $val);
            }
        }
        $this->db
        ->select('V.* ,GNAME , GDETAIL')
        ->from('VMS_STAKEHOLDERS V')
        ->join('VMS_GROUP G', 'V.GID = G.GID')
        ->order_by('V.SEQ', 'asc');
        return $this->db->get()->result();

    }

    
    public function get_guest_type()
    {
        $this->db
            ->select('*')
            ->from('GPENT_GUEST_TYPE')
            ->where('STATUS', '1')
            ->order_by('GT_ID', 'asc');
        return $this->db->get()->result();
    }

    public function get_purpose_visit()
    {
        $this->db
            ->select('*')
            ->from('VMS_PURPOSE_VISIT')
            ->order_by('PVID', 'asc');
        return $this->db->get()->result();
    }

    public function get_visit_type()
    {
        $this->db
            ->select('*')
            ->from('VMS_VISIT_TYPE')
            ->order_by('VTID', 'asc');
        return $this->db->get()->result();
    }

    public function getAttfile($cond = '')
    {
        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db->from('VMS_ATTFILE')
                 ->order_by('ID', 'ASC');
        return $this->db->get()->result();
    }

    public function get_activity()
    {
        $this->db
            ->select('*')
            ->from('VMS_ACTIVITY');
        return $this->db->get()->result();
    }

    public function get_schedule($cond = '')
    {

        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db
        ->select('S.* , TO_CHAR(SCHSTIME, \'HH:MI AM\') AS SCHSTIME_FORMAT ,  TO_CHAR(SCHETIME, \'HH:MI AM\') AS SCHETIME_FORMAT')
        ->from('VMS_SCHEDULE S')
        ->order_by('ID', 'ASC');
          return $this->db->get()->result();
    }

    public function get_formversion()
    {
        $this->db
            ->select('VERSION_NO')
            ->from('VMS_FORM_VERSION');
        return $this->db->get()->result()[0]->VERSION_NO;
    }

    public function get_room($cond = '')
    {
        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db
        ->select('*')
        ->from('VMS_ROOM')
        ->order_by('ROOMNAME', 'ASC');
          return $this->db->get()->result();
    }

    
    public function get_group($cond = '')
    {
        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db
        ->select('ROW_NUMBER() OVER (ORDER BY GNAME ASC) AS NO , VMS_GROUP.*')
        ->from('VMS_GROUP')
        ->order_by('SEQ , GID', 'ASC');
          return $this->db->get()->result();
    }

    public function get_dietary($cond = '')
    {
        if($cond != ''){
            foreach($cond as $key => $val) {
            $this->set_where($key, $val);
        }
        }
        $this->db
        ->select('*')
        ->from('VMS_DIETARY')
        ->order_by('DID', 'ASC');
          return $this->db->get()->result();
    }

    public function get_vms_ent($cond = '')
    {
        if($cond != ''){
            foreach($cond as $key => $val) {
                $this->set_where($key, $val);
            }
        }
        $this->db
        ->select("'GP-ENT'|| SUBSTR(ENTCYEAR2, 3, 2) ||'-'|| LPAD(ENTNRUNNO, 6, '0') AS REQENT", FALSE)
        ->select('ENTCYEAR2 , ENTNRUNNO', FALSE)
        ->from('VMS_GPENT V');
        return $this->db->get()->result();
    }

    public function getRcp($cyear2,$nrunno,$typeemp)
    {

        $this->db
        ->select("
        VS.CYEAR2,
        VS.NRUNNO,  TO_CHAR(
        RTRIM(
            XMLAGG(
                XMLELEMENT(e, VG.GDETAIL || ',').EXTRACT('//text()')
                ORDER BY VS.SEQ
            ).GetClobVal(),
            ','
        )) AS RCP
    ", FALSE)
        ->from('VMS_STAKEHOLDERS VS')
        ->join('VMS_GROUP VG', 'VS.GID = VG.GID')
        ->where('VS.CYEAR2', $cyear2)
        ->where('VS.NRUNNO', $nrunno)
        ->where('VS.TYPEEMP', $typeemp)
        ->group_by('VS.CYEAR2, VS.NRUNNO');
        return $this->db->get()->result();

    }

    public function getRcpMail($cyear2,$nrunno,$typeno)
    {
       /* $this->db->distinct();
        $this->db->select('SRECMAIL');
        $this->db->from('VMS_STAKEHOLDERS S');
        $this->db->join('VMS_GROUP_EMPNO G', 'S.GID = G.GID');
        $this->db->join('AMECUSERALL A', 'G.SEMPNO = A.SEMPNO');
        $this->db->where('S.CYEAR2', $cyear2);
        $this->db->where('S.NRUNNO', $nrunno);
        $this->db->where('S.TYPEEMP', $typeno);
        $this->db->where('A.CSTATUS', '1');
        $query = $this->db->get();
        $result = $query->result_array(); 
        $emails = array_column($result, 'SRECMAIL');
        return  $emails;*/
       $this->db->distinct();
        $this->db->select('EMAIL as SRECMAIL');
        $this->db->from('VMS_STAKEHOLDERS S');
        $this->db->join('VMS_GROUP_EMAIL G', 'S.GID = G.GID');
        $this->db->where('S.CYEAR2', $cyear2);
        $this->db->where('S.NRUNNO', $nrunno);
        $this->db->where('S.TYPEEMP', $typeno);
        $query = $this->db->get();
        $result = $query->result_array(); 
        $emails = array_column($result, 'SRECMAIL');
        return  $emails;
    }

    public function getHeadVisit($nfrmno,$vorgno,$cyear,$cyear2,$nrunno)
    {
        $sql = "
        SELECT FORMVER,
            'MAR-' || f.CYEAR2 || LPAD(f.NRUNNO, 3, '0') || '-' || v.SALECOM AS REFNO,
            CASE WHEN f.CST = 0 THEN TO_CHAR(TRUNC(SYSDATE), 'DD-Mon-YY')
                ELSE TO_CHAR(fl.DAPVDATE, 'DD-Mon-YY')
            END AS ISSUEDATE,
            SEMPPRE || ' ' || a.SNAME AS ISSUEBY, a.SRECMAIL ,
            TO_CHAR(v.VISITDATE, 'DD-Mon-YY') AS VISITDATE,
            v.RECEPTROOM,
            (SELECT COUNT(*) 
            FROM VMS_VISITINF vi
            WHERE vi.CYEAR2 = v.CYEAR2
            AND vi.NRUNNO = v.NRUNNO) AS VISITOR_COUNT,
            vt.VTYPE,
            v.PURPOSEDETAIL
        FROM VMS_VISIT v
        JOIN FORM f 
        ON v.CYEAR2 = f.CYEAR2 
        AND v.NRUNNO = f.NRUNNO
        JOIN FLOW fl 
        ON f.NFRMNO = fl.NFRMNO 
        AND f.VORGNO = fl.VORGNO 
        AND f.CYEAR  = fl.CYEAR 
        AND f.CYEAR2 = fl.CYEAR2 
        AND f.NRUNNO = fl.NRUNNO
        JOIN AMECUSERALL a 
        ON f.VREQNO = a.SEMPNO
        LEFT JOIN VMS_VISIT_TYPE vt 
        ON v.VISITTYPE = vt.VTID
        WHERE f.NFRMNO  = '{$nfrmno}'
        AND f.VORGNO  = '{$vorgno}'
        AND f.CYEAR   = '{$cyear}'
        AND f.CYEAR2  = '{$cyear2}'
        AND f.NRUNNO  = '{$nrunno}'
        AND fl.CSTEPNO = '--'
        ";
        return $this->db->query($sql)->result();

    }

    public function getItemReq($cyear2,$nrunno)
    {
        $this->db
        ->select("
            V.BOARD,
            CASE 
                WHEN V.LUNCH = 'Y' AND V.LUNCH_LOC = 'I' THEN V.LUNCH_PLACE
                ELSE ''
            END AS ROOMLUNCH,
            COUNT(DISTINCT VI.ID) AS VISITORS,
            COUNT(DISTINCT MA.SEMPNO) AS AMEC,
            V.HOTELNAME,
            V.SHOPTOUR,
            V.FORMC1_1,
            V.CARHOTEL,
            V.CARHOTELNOTE,
            AF.SFILE  -- ชื่อไฟล์ประเภท B
        ", FALSE)
        ->from('VMS_VISIT V')
        ->join('VMS_VISITINF VI', 'VI.CYEAR2 = V.CYEAR2 AND VI.NRUNNO = V.NRUNNO AND VI.LUNCH = \'Y\'', 'left')
        ->join('VMS_AMEC_MEAL MA', 'MA.CYEAR2 = V.CYEAR2 AND MA.NRUNNO = V.NRUNNO AND MA.LUNCH = \'Y\'', 'left')
        ->join('VMS_ATTFILE AF', "AF.CYEAR2 = V.CYEAR2 AND AF.NRUNNO = V.NRUNNO AND AF.TYPENO = 'B'", 'left') // LEFT JOIN + เงื่อนไข TYPENO
        ->where('V.CYEAR2', $cyear2)
        ->where('V.NRUNNO', $nrunno)
        ->group_by('
            V.BOARD,
            V.LUNCH,
            V.LUNCH_LOC,
            V.LUNCH_PLACE,
            V.HOTELNAME,
            V.SHOPTOUR,
            V.FORMC1_1,
            V.CARHOTEL,
            V.CARHOTELNOTE,
            AF.SFILE
        ');
    return $this->db->get()->result();
    }

    public function get_dietary_item($cyear2,$nrunno)
    {
            $this->db
            ->select('COUNT(*) AS CNT, DIETREQ')
            ->from("( 
                SELECT DIETREQ 
                FROM VMS_VISITINF 
                WHERE LUNCH = 'Y' AND CYEAR2 = '{$cyear2}' AND NRUNNO = '{$nrunno}'
                UNION ALL
                SELECT DIETREQ 
                FROM VMS_AMEC_MEAL 
                WHERE LUNCH = 'Y' AND CYEAR2 = '{$cyear2}' AND NRUNNO = '{$nrunno}'
            )", FALSE)  // FALSE เพื่อไม่ให้ CI escape SQL
            ->group_by('DIETREQ');

            return $this->db->get()->result();
    }

    public function get_visitor_raw_data_report($date_mode, $start_date, $end_date)
    {
        $where = [];
        $params = []; 
    
        if($start_date && $end_date){
            $params[] = $start_date;
            $params[] = $end_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') BETWEEN TO_DATE(?, 'YYYY-MM') AND TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) BETWEEN ? AND ?";
            }
        
        } elseif($start_date && !$end_date) {
            $params[] = $start_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE >= TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') >= TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) >= ?";
            }
        
        } elseif(!$start_date && $end_date) {
            $params[] = $end_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE <= TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') <= TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) <= ?";
            }
        }    
        $where_sql = '';
        if(count($where) > 0){
            $where_sql = 'WHERE ' . implode(' AND ', $where);
        }
        
        $sql = "
            SELECT
                VI1.NAME,
                VT1.VISITDATE,
                VI1.COUNTRY,
                VI1.COMPANY,
                VI1.POSITION,
                CASE VI1.VISITEXP WHEN 'Y' THEN 'Yes' ELSE 'No' END as VISITEXP,
                DENSE_RANK() OVER (
                    PARTITION BY UPPER(REPLACE(VI1.NAME, ' ', ''))
                    ORDER BY VT1.VISITDATE
                ) AS VISIT_NO
            FROM VMS_VISIT VT1
            JOIN VMS_VISITINF VI1
              ON VT1.CYEAR2 = VI1.CYEAR2
             AND VT1.NRUNNO = VI1.NRUNNO
            $where_sql
            ORDER BY VI1.NAME, VT1.VISITDATE
        ";
        
        $query = $this->db->query($sql, $params);
        return $query->result_array();
    }

    public function get_visitor_overview_report($date_mode, $start_date, $end_date)
    {
        $where = [];
        $params = []; 
        if($start_date && $end_date){
            $params[] = $start_date;
            $params[] = $end_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') BETWEEN TO_DATE(?, 'YYYY-MM') AND TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) BETWEEN ? AND ?";
            }
        
        } elseif($start_date && !$end_date) {
            $params[] = $start_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE >= TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') >= TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) >= ?";
            }
        
        } elseif(!$start_date && $end_date) {
            $params[] = $end_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE <= TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') <= TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) <= ?";
            }
        }    
        $where_sql = '';
        if(count($where) > 0){
            $where_sql = 'WHERE ' . implode(' AND ', $where);
        }
        $sql = "
            SELECT
                COUNT(DISTINCT VT1.VISITDATE) AS TOTAL_VISITS,
                COUNT(VI1.NAME) AS TOTAL_VISITORS,
                COUNT(DISTINCT VI1.COMPANY) AS UNIQUE_COMPANIES,
                COUNT(DISTINCT VI1.COUNTRY) AS UNIQUE_COUNTRIES
            FROM VMS_VISIT VT1
            JOIN VMS_VISITINF VI1
              ON VT1.CYEAR2 = VI1.CYEAR2
             AND VT1.NRUNNO = VI1.NRUNNO
            $where_sql
        ";
        $query = $this->db->query($sql, $params);
        return $query->result_array();
    }
    
    public function get_visitor_Frequency_report($date_mode, $start_date, $end_date)
    {
        $where = [];
        $params = []; 
        if($start_date && $end_date){
            $params[] = $start_date;
            $params[] = $end_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') BETWEEN TO_DATE(?, 'YYYY-MM') AND TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) BETWEEN ? AND ?";
            }
        
        } elseif($start_date && !$end_date) {
            $params[] = $start_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE >= TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') >= TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) >= ?";
            }
        
        } elseif(!$start_date && $end_date) {
            $params[] = $end_date;
        
            if($date_mode == 'date'){
                $where[] = "VT1.VISITDATE <= TO_DATE(?, 'YYYY-MM-DD')";
            }
        
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(VT1.VISITDATE,'YYYY-MM'),'YYYY-MM') <= TO_DATE(?, 'YYYY-MM')";
            }
        
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM VT1.VISITDATE) <= ?";
            }
        }    
        $where_sql = '';
        if(count($where) > 0){
            $where_sql = 'WHERE ' . implode(' AND ', $where);
        }
        $sql = "
            SELECT
                COUNTRY,
                COMPANY,
                COUNT(DISTINCT VT1.VISITDATE) AS TOTAL_VISITS,
                COUNT(VI1.NAME) AS TOTAL_VISITORS
            FROM VMS_VISIT VT1
            JOIN VMS_VISITINF VI1
              ON VT1.CYEAR2 = VI1.CYEAR2
             AND VT1.NRUNNO = VI1.NRUNNO
            $where_sql
            GROUP BY
            COUNTRY,
            COMPANY
        ";
        $query = $this->db->query($sql, $params);
        return $query->result_array();
    }
    
    public function get_activity_duration_report($date_mode, $start_date, $end_date)
    {
        $where = [];
        $params = []; 

        if($start_date && $end_date){
            $params[] = $start_date;
            $params[] = $end_date;

            if($date_mode == 'date'){
                $where[] = "S.SCHSTIME BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')";
            }

            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(S.SCHSTIME,'YYYY-MM'),'YYYY-MM') BETWEEN TO_DATE(?, 'YYYY-MM') AND TO_DATE(?, 'YYYY-MM')";
            }

            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM S.SCHSTIME) BETWEEN ? AND ?";
            }

        } elseif($start_date && !$end_date) {
            $params[] = $start_date;

            if($date_mode == 'date'){
                $where[] = "S.SCHSTIME >= TO_DATE(?, 'YYYY-MM-DD')";
            }
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(S.SCHSTIME,'YYYY-MM'),'YYYY-MM') >= TO_DATE(?, 'YYYY-MM')";
            }
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM S.SCHSTIME) >= ?";
            }

        } elseif(!$start_date && $end_date) {
            $params[] = $end_date;

            if($date_mode == 'date'){
                $where[] = "S.SCHSTIME <= TO_DATE(?, 'YYYY-MM-DD')";
            }
            if($date_mode == 'month'){
                $where[] = "TO_DATE(TO_CHAR(S.SCHSTIME,'YYYY-MM'),'YYYY-MM') <= TO_DATE(?, 'YYYY-MM')";
            }
            if($date_mode == 'year'){
                $where[] = "EXTRACT(YEAR FROM S.SCHSTIME) <= ?";
            }
        }

        $where_sql = '';
        if(count($where) > 0){
            $where_sql = 'WHERE ' . implode(' AND ', $where);
        }
        $sql = "
        WITH schedule_calc AS (
            SELECT
                A.AID,
                A.ACTIVITY,
                ROUND((CAST(S.SCHETIME AS DATE) - CAST(S.SCHSTIME AS DATE)) * 24, 2) AS TIMESPENT
            FROM VMS_SCHEDULE S
            JOIN VMS_ACTIVITY A ON S.AID = A.AID
            $where_sql
        )
        SELECT
            AID,
            ACTIVITY,
            TIMESPENT,
            ROUND(SUM(TIMESPENT), 2) AS TOTAL_HOURS,
            COUNT(*) AS TOTAL_COUNT
        FROM schedule_calc
        GROUP BY AID, ACTIVITY, TIMESPENT
        ORDER BY AID, TIMESPENT
        ";

        $query = $this->db->query($sql, $params);
        $data =  $query->result_array();
        $sum_hours = array_sum(array_column($data, 'TOTAL_HOURS'));
        $data[] = [
            "ACTIVITY" => "Total",
            "TIMESPENT" => "",
            "TOTAL_COUNT" => "",
            "TOTAL_HOURS" => $sum_hours
        ];
        return $data;
    }

public function get_gpent_report($date_mode, $start_date, $end_date)
{
    $where = [];
    $params = [];

    // เงื่อนไขวันที่
    if ($start_date && $end_date) {
        $params[] = $start_date;
        $params[] = $end_date;

        if ($date_mode == 'date') {
            $where[] = "V.VISITDATE BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')";
        }
        if ($date_mode == 'month') {
            $where[] = "TO_DATE(TO_CHAR(V.VISITDATE,'YYYY-MM'),'YYYY-MM') BETWEEN TO_DATE(?, 'YYYY-MM') AND TO_DATE(?, 'YYYY-MM')";
        }
        if ($date_mode == 'year') {
            $where[] = "EXTRACT(YEAR FROM V.VISITDATE) BETWEEN ? AND ?";
        }
    } elseif ($start_date && !$end_date) {
        $params[] = $start_date;
        if ($date_mode == 'date') $where[] = "V.VISITDATE >= TO_DATE(?, 'YYYY-MM-DD')";
        if ($date_mode == 'month') $where[] = "TO_DATE(TO_CHAR(V.VISITDATE,'YYYY-MM'),'YYYY-MM') >= TO_DATE(?, 'YYYY-MM')";
        if ($date_mode == 'year') $where[] = "EXTRACT(YEAR FROM V.VISITDATE) >= ?";
    } elseif (!$start_date && $end_date) {
        $params[] = $end_date;
        if ($date_mode == 'date') $where[] = "V.VISITDATE <= TO_DATE(?, 'YYYY-MM-DD')";
        if ($date_mode == 'month') $where[] = "TO_DATE(TO_CHAR(V.VISITDATE,'YYYY-MM'),'YYYY-MM') <= TO_DATE(?, 'YYYY-MM')";
        if ($date_mode == 'year') $where[] = "EXTRACT(YEAR FROM V.VISITDATE) <= ?";
    }

    $where_sql = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

    // copy params สำหรับ UNION ALL
    $params_for_query = array_merge($params, $params);

    $sql = "SELECT * FROM (
        SELECT
            TYPE_TIME||' '||LOCATION_TYPE||': '||LOCATION AS ITEM,
            TYPE_NAME AS DETAILS,
            TYPE_TIME,
            LOCATION_TYPE,
            LOCATION,
            UNIT_COST,
            QTY,
            TOTAL_COST,
            ACTUAL_COST
        FROM VMS_VISIT V
        JOIN VMS_GPENT EN ON V.CYEAR2 = EN.VMSCYEAR2 AND V.NRUNNO = EN.VMSNRUNNO
        JOIN GPENT_GUEST_TYPE GT ON V.GUESTTYPE  = GT.GT_ID 
        JOIN GPENT_FORM EF ON EN.ENTCYEAR2 = EF.CYEAR2 AND EN.ENTNRUNNO = EF.NRUNNO
        JOIN GPENT_ESTIMATE E ON EF.CYEAR2 = E.CYEAR2 AND EF.NRUNNO = E.NRUNNO
        LEFT JOIN GPCLER_FORM C ON C.FORM_ENT = 'GP-ENT'||SUBSTR(EF.CYEAR2, -2)||'-'||LPAD(EF.NRUNNO , 6, '0')
        $where_sql
        
        UNION ALL
        
        SELECT
            'Total ' AS ITEM,
            NULL AS DETAILS,
            TYPE_TIME,
            NULL AS LOCATION_TYPE,
            NULL AS LOCATION,
            NULL AS UNIT_COST,
            NULL AS QTY,
            SUM(TOTAL_COST),
            SUM(ACTUAL_COST)
        FROM VMS_VISIT V
        JOIN VMS_GPENT EN ON V.CYEAR2 = EN.VMSCYEAR2 AND V.NRUNNO = EN.VMSNRUNNO
        JOIN GPENT_FORM EF ON EN.ENTCYEAR2 = EF.CYEAR2 AND EN.ENTNRUNNO = EF.NRUNNO
        JOIN GPENT_ESTIMATE E ON EF.CYEAR2 = E.CYEAR2 AND EF.NRUNNO = E.NRUNNO
        LEFT JOIN GPCLER_FORM C ON C.FORM_ENT = 'GP-ENT'||SUBSTR(EF.CYEAR2, -2)||'-'||LPAD(EF.NRUNNO , 6, '0')
        $where_sql
        GROUP BY TYPE_TIME
    )
    ORDER BY TYPE_TIME, DETAILS, LOCATION";

    $query = $this->db->query($sql, $params_for_query);
    return $query->result_array();
}

public function get_time_lunch($cyear2, $nrunno)
{
    $sql = "SELECT   TO_CHAR(SCHSTIME, 'HH:MI AM') || ' - ' || TO_CHAR(SCHETIME,   'HH:MI AM') AS LUNCH_TIME FROM VMS_SCHEDULE WHERE UPPER(CONTENT) LIKE '%LUNCH%' AND CYEAR2 = '{$cyear2}' AND NRUNNO = '{$nrunno}'";
    return $this->db->query($sql)->result();

}

    public function execsql($q)
	{
		return $this->db->query($q);
	}

    public function getdatasql($q)
	{
		return $this->db->query($q)->result();
	}



}