<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Rgv_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->ad  = $this->load->database('AUD', TRUE);
        $this->doc = $this->load->database('DOC', TRUE);
        $this->scm = $this->load->database('SCM', TRUE);
    }

    public function get_orgpos($vorgno, $vposno)
    {
        $this->db
            ->select('*')
            ->from('ORGPOS')
            ->where('VORGNO', $vorgno)
            ->where('VPOSNO', $vposno);
        return $this->db->get()->result();
    }

    public function invoice_user()
    {
        $this->ad
            ->select('*')
            ->from('invoice..v_user_permission2')
            ->where('user_state', 'A')
            ->order_by('sect_id', 'ASC');
        return $this->ad->get()->result();
    }

    public function marketing_user()
    {
        $this->ad
            ->select('*')
            ->from('mkt..v_usergroup')
            ->where('user_state', 'A')
            ->order_by('group_id', 'ASC');
        return $this->ad->get()->result();
    }

    public function procurement_user()
    {
        $this->doc
            ->select('*')
            ->from('AUTHORIZE_INVENTORY')
            ->group_start()
            ->where('DATAMANAGER <>', 'NOT')
            ->or_where('VENDORMANAGEMENT <>', 'NOT')
            ->or_where('PRODUCT <>', 'NOT')
            ->or_where('PR <>', 'NOT')
            ->or_where('USERMANAGER <>', 'NOT')
            ->or_where('PO <>', 'NOT')
            ->or_where('REPORT <>', 'NOT')
            ->or_where('INVOICE <>', 'NOT')
            ->or_where('GROUPMASTER <>', 'NO')
            ->group_end()
            ->order_by('SDIV', 'ASC');

        return $this->doc->get()->result();
    }


    public function scm_user()
    {
        $this->scm
            ->select('*')
            ->from('AUTHORIZE_INVENTORY')
            ->where('USR_STATUS', 'Enable')
            ->where_not_in('EMPNO', ['viewer1'])
            ->order_by('GRP_NAME', 'ASC');
        return $this->scm->get()->result();
    }

    public function as400_user()
    {
        // $this->ad
        //     ->select('*')
        //     ->from('ITGC_SPECIALUSER is')
        //     ->join('AMECUSERALL a', 'is.EMPNO = a.SEMPNO')
        //     ->where('USER_TYPE2', 'Human')
        //     ->where('CATEGORY', 'APP')
        //     ->where('SERVER_NAME', 'AS400');
        // $this->ad->select('*')
        //     ->from('v_as400user');
        $sql = "SELECT *
                FROM ITGC_SPECIALUSER is2
                JOIN AMECUserLogin.dbo.TB_SQLAMECUSER ts ON is2.EMPNO = ts.SEMPNO
                WHERE is2.USER_TYPE2 = 'Human'
                AND is2.CATEGORY = 'APP'
                AND is2.SERVER_NAME = 'AS400'";
        return $this->ad->query($sql)->result();
    }

    public function is_user($section)
    {
        $this->ad
            ->select('*')
            ->from('ITGC_SPECIALUSER is')
            ->join('AMECUserLogin.dbo.TB_SQLAMECUSER a', 'is.EMPNO = a.SEMPNO', 'left')
            ->where('CATEGORY !=', 'APP')
            ->where('AUTH_OGANIZE', $section)
            ->where('ACTIVE_STATUS', '1')
            ->where('USER_TYPE2', 'Human');
        return $this->ad->get()->result();
    }

    public function get_data_user($program)
    {
        // $this->db
        //     ->select('*')
        //     ->from('AMECUSERALL')
        //     ->where('SEMPNO', $empno);
        // return $this->db->get()->result();

        $this->db
            ->select('*')
            ->from('ISRGV_MEMBER A')
            ->join('ISRGV_INCHARGE B', '(B.ORG_TYPE = 1 AND A.SSECTYPE = B.ORG_CODE) OR (B.ORG_TYPE = 2 AND A.SDEPTTYPE = B.ORG_CODE)')
            ->where('PROGRAM', $program)
            ->where('CSTATUS', '1')
            // ->where('PIC', '14198')
            ->order_by('1');
        return $this->db->get()->result();
    }

    public function getOwner($owner_code)
    {
        $code = explode('/', $owner_code);
        // print_r($code);
        $this->doc
            ->select('*')
            ->from('PROGRAM_MSTLST')
            ->where('DIVCODE', $code[0])
            ->where('PROTID', $code[1])
            ->where('PROMID', $code[2]);
        return $this->doc->get()->result();
    }

    public function getForm($no, $orgNo, $y, $y2, $runno)
    {
        $this->db
            ->select('*')
            ->from('ISRGV_FORM')
            ->where('NFRMNO', $no)
            ->where('VORGNO', $orgNo)
            ->where('CYEAR', $y)
            ->where('CYEAR2', $y2)
            ->where('NRUNNO', $runno);
        return $this->db->get()->result();
    }

    public function getEmpForm($y2, $runno)
    {
        $this->db
            ->select('*')
            ->from('ISRGV_EMP')
            ->where('CYEAR2', $y2)
            ->where('NRUNNO', $runno);
        return $this->db->get()->result_array();
    }





    public function insert($table, $data)
    {
        return $this->db->insert($table, $data);
    }

    public function update($table, $data, $where, $dateColumn = null)
    {
        if ($dateColumn) {
            $this->db->set($dateColumn, 'SYSDATE', false);
        }
        $this->db->update($table, $data, $where);
        echo $this->db->last_query();
    }

    public function getIncharge($program)
    {
        // $this->db
        //     ->select('*')
        //     ->from('ISRGV_INCHARGE');
        // $this->doc->join('PROGRAM_MSTLST', "PROGRAM_CODE = DIVCODE||'/'||PROTID||'/'||PROMID")
        //     ->where('PROGRAM', $program)
        //     ->order_by('1');

        $sql = "
            SELECT A.*, B.DATAOWNER
            FROM ISRGV_INCHARGE A
            JOIN PROGRAM_MSTLST@DOCINV B
            ON A.PROGRAM_CODE = TO_CHAR(B.DIVCODE) || '/' || TO_CHAR(B.PROTID) || '/' || TO_CHAR(B.PROMID)
            WHERE A.PROGRAM = '$program'
        ";
        return $this->db->query($sql)->result();
    }

    public function getLnauthorize()
    {
        return $this->db
            ->distinct()
            ->select('EMPNO')
            ->from('ISRGV_LN_AUTHORIZE')
            ->where('STATUS', 1)
            ->get()
            ->result();
    }


    public function getUserIncharge()
    {
        $this->db
            ->select('o.PROGRAM, o.ORG_TYPE, o.ORG_CODE, COALESCE(SDEPT, SDIV) AS ORG_NAME, o.PIC')
            ->from('ISRGV_INCHARGE o')
            ->join('AMEC.PDEPARTMENT d', 'o.ORG_CODE = d.SDEPCODE', 'left')
            ->join('AMEC.PDIVISION v', 'o.ORG_CODE = v.SDIVCODE', 'left')
            // ->where('o.PROGRAM', 'Invoice')
            ->order_by('o.ORG_TYPE, o.ORG_CODE, o.PIC');
        return $this->db->get()->result();
    }

    public function getProgram()
    {
        $this->db
            ->distinct()
            ->select('PROGRAM')
            ->from('ISRGV_INCHARGE')
            ->order_by('PROGRAM');
        return $this->db->get()->result();
    }

    public function getMember($q = null)
    {
        $this->db
            ->select('*')
            ->from('ISRGV_MEMBER')
            ->where('CSTATUS', '1');

        if (!empty($q)) {
            $this->db->where($q);
        }
        return $this->db->get()->result();
    }

    public function getMainApv($vorgno)
    {
        $this->db
            ->select('*')
            ->from('SEQUENCEORG')
            ->where('VORGNO', $vorgno)
            ->where('SPOSCODE', '10');
        return $this->db->get()->result();

    }

    public function test_data($empno)
    {
        // $sql = "SELECT LEVEL AS MENU_LEVEL,
        // LPAD(' ', LEVEL*2) || MENU_NAME_EN AS MENU_TREE,
        // ilm.MENU_ID,
        // PARENT_MENU_ID,
        // MENU_ORDER,
        // ACTIVE,
        // ila.EMPNO
        // FROM  ISRGV_LN_MST ilm
        // LEFT JOIN ISRGV_LN_AUTHORIZE ila ON ila.MENU_ID = ilm.MENU_ID AND ila.STATUS = 1
        // START WITH PARENT_MENU_ID IS NULL
        // CONNECT BY PRIOR ilm.MENU_ID = PARENT_MENU_ID
        // ORDER SIBLINGS BY MENU_ORDER, MENU_NAME_EN";

        // $sql = "SELECT LEVEL AS MENU_LEVEL,
        //             LPAD(' ', LEVEL*2) || MENU_NAME_EN AS MENU_TREE,
        //             ilm.MENU_ID,
        //             PARENT_MENU_ID,
        //             MENU_ORDER,
        //             ACTIVE,
        //             CASE WHEN ila.EMPNO = '13255' THEN ila.EMPNO END AS EMPNO
        //         FROM ISRGV_LN_MST ilm
        //         LEFT JOIN ISRGV_LN_AUTHORIZE ila
        //             ON ila.MENU_ID = ilm.MENU_ID
        //             AND ila.STATUS = 1
        //             AND ila.EMPNO = '13255'
        //         START WITH PARENT_MENU_ID IS NULL
        //         CONNECT BY PRIOR ilm.MENU_ID = PARENT_MENU_ID
        //         ORDER SIBLINGS BY MENU_ORDER, MENU_NAME_EN";

        $sql = "WITH all_chain AS (
                    SELECT DISTINCT
                        ilm.MENU_ID,
                        ilm.PARENT_MENU_ID,
                        ilm.MENU_NAME_EN,
                        ilm.MENU_ORDER,
                        ilm.ACTIVE
                    FROM ISRGV_LN_MST ilm
                    CONNECT BY PRIOR ilm.PARENT_MENU_ID = ilm.MENU_ID
                    START WITH ilm.MENU_ID IN (
                        SELECT MENU_ID
                        FROM ISRGV_LN_AUTHORIZE
                        WHERE EMPNO = '$empno'
                        AND STATUS = 1
                    )
                )
                SELECT
                    LEVEL AS MENU_LEVEL,
                    LPAD(' ', (LEVEL-1)*2) || ac.MENU_NAME_EN AS MENU_TREE,
                    ac.MENU_ID,
                    ac.PARENT_MENU_ID,
                    ac.MENU_ORDER,
                    ac.ACTIVE,
                    ila.EMPNO
                FROM all_chain ac
                LEFT JOIN ISRGV_LN_AUTHORIZE ila
                    ON ila.MENU_ID = ac.MENU_ID
                    AND ila.EMPNO = '$empno'
                    AND ila.STATUS = 1
                START WITH ac.PARENT_MENU_ID IS NULL
                CONNECT BY PRIOR ac.MENU_ID = ac.PARENT_MENU_ID
                ORDER SIBLINGS BY ac.MENU_ORDER, ac.MENU_NAME_EN";
        return $this->db->query($sql)->result();
    }

    public function getUserall($empno)
    {
        $this->db->select('*')
            ->from('AMECUSERALL')
            ->where('SEMPNO', (string) $empno);
        return $this->db->get()->result();
    }

    public function getUnmatchHistory($cyear2, $nrunno)
    {
        $sql = "
            SELECT
                e.EMPNO as SEMPNO,
                u.SNAME,
                u.SDIV,
                u.SDEPT,
                u.SSEC,
                e.RESULT,
                e.DETAIL,
                e.UPDATE_AT,
                'NOT' as DATAMANAGER,
                'NOT' as VENDORMANAGEMENT,
                'NOT' as PRODUCT,
                'NOT' as PR,
                'NOT' as USERMANAGER,
                'NOT' as PO,
                'NOT' as REPORT,
                'NOT' as INVOICE,
                'NO' as GROUPMASTER,
                NULL as CREUSRDATE,
                NULL as UPDUSRDATE,
                1 as IS_HISTORY
            FROM ISRGV_EMP e
            LEFT JOIN AMECUSERALL u ON e.EMPNO = u.SEMPNO
            WHERE e.CYEAR2 = '$cyear2'
            AND e.NRUNNO = '$nrunno'
            AND e.RESULT = '0'
            ORDER BY e.UPDATE_AT DESC
        ";
        return $this->db->query($sql)->result();
    }

    // ===== New methods: JOIN with ISRGV_EMP =====

    public function getUsersForView($cyear2, $nrunno, $program)
    {
        $program = strtoupper($program);

        switch ($program) {
            case 'INVOICE':
                return $this->getInvoiceUsersForView($cyear2, $nrunno);
            case 'MARKETING':
                return $this->getMarketingUsersForView($cyear2, $nrunno);
            case 'PROCUREMENT':
                return $this->getProcurementUsersForView($cyear2, $nrunno);
            case 'SCM':
                return $this->getScmUsersForView($cyear2, $nrunno);
            case 'AS400':
                return $this->getAs400UsersForView($cyear2, $nrunno);
            case 'WSD':
            case 'AAS':
            case 'SSA':
                return $this->getIsUsersForView($cyear2, $nrunno, $program);
            default:
                return [];
        }
    }

    public function getProcurementUsersForView($cyear2, $nrunno)
    {
        // 1. Query ISRGV_EMP ดึง EMPNO, RESULT, DETAIL
        $empData = $this->db
            ->select('EMPNO, RESULT, DETAIL')
            ->from('ISRGV_EMP')
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno)
            ->get()
            ->result();

        if (empty($empData))
            return [];

        $empnos = array_column($empData, 'EMPNO');
        $empMap = [];
        foreach ($empData as $e) {
            $empMap[$e->EMPNO] = ['RESULT' => $e->RESULT, 'DETAIL' => $e->DETAIL];
        }

        // 2. Query AUTHORIZE_INVENTORY จาก DOCINV
        $this->doc->select('*')
            ->from('AUTHORIZE_INVENTORY')
            ->where_in('SEMPNO', $empnos);
        $users = $this->doc->get()->result();

        // 3. Merge RESULT และ DETAIL และคำนวณ IS_HISTORY
        foreach ($users as $u) {
            $empno = $u->SEMPNO;
            if (isset($empMap[$empno])) {
                $u->RESULT = $empMap[$empno]['RESULT'];
                $u->DETAIL = $empMap[$empno]['DETAIL'];

                // ตรวจสอบว่าเป็น history หรือไม่
                $u->IS_HISTORY = (
                    $u->RESULT == '0' &&
                    $u->DATAMANAGER == 'NOT' &&
                    $u->VENDORMANAGEMENT == 'NOT' &&
                    $u->PRODUCT == 'NOT' &&
                    $u->PR == 'NOT' &&
                    $u->USERMANAGER == 'NOT' &&
                    $u->PO == 'NOT' &&
                    $u->REPORT == 'NOT' &&
                    $u->INVOICE == 'NOT' &&
                    $u->GROUPMASTER == 'NO'
                ) ? 1 : 0;
            }
        }

        // 4. Sort: IS_HISTORY อยู่ท้าย
        usort($users, function ($a, $b) {
            if ($a->IS_HISTORY != $b->IS_HISTORY) {
                return $a->IS_HISTORY - $b->IS_HISTORY;
            }
            return strcmp($a->SDIV ?? '', $b->SDIV ?? '');
        });

        return $users;
    }

    public function getInvoiceUsersForView($cyear2, $nrunno)
    {
        // 1. Query ISRGV_EMP
        $empData = $this->db
            ->select('EMPNO, RESULT, DETAIL')
            ->from('ISRGV_EMP')
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno)
            ->get()
            ->result();

        if (empty($empData))
            return [];

        $empnos = array_column($empData, 'EMPNO');
        $empMap = [];
        foreach ($empData as $e) {
            $empMap[$e->EMPNO] = ['RESULT' => $e->RESULT, 'DETAIL' => $e->DETAIL];
        }

        // 2. Query invoice users จาก auditDB
        $this->ad->select('*')
            ->from('invoice..v_user_permission2')
            ->where_in('user_id', $empnos)
            ->order_by('sect_id', 'ASC');
        $users = $this->ad->get()->result();

        // 3. Merge RESULT และ DETAIL
        foreach ($users as $u) {
            $empno = $u->user_id;
            if (isset($empMap[$empno])) {
                $u->RESULT = $empMap[$empno]['RESULT'];
                $u->DETAIL = $empMap[$empno]['DETAIL'];
            }
            $u->IS_HISTORY = 0;
        }

        return $users;
    }

    public function getMarketingUsersForView($cyear2, $nrunno)
    {
        // 1. Query ISRGV_EMP
        $empData = $this->db
            ->select('EMPNO, RESULT, DETAIL')
            ->from('ISRGV_EMP')
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno)
            ->get()
            ->result();

        if (empty($empData))
            return [];

        $empnos = array_column($empData, 'EMPNO');
        $empMap = [];
        foreach ($empData as $e) {
            $empMap[$e->EMPNO] = ['RESULT' => $e->RESULT, 'DETAIL' => $e->DETAIL];
        }

        // 2. Query marketing users จาก auditDB
        $this->ad->select('*')
            ->from('mkt..v_usergroup')
            ->where_in('user_id', $empnos)
            ->order_by('group_id', 'ASC');
        $users = $this->ad->get()->result();

        // 3. Merge RESULT และ DETAIL
        foreach ($users as $u) {
            $empno = $u->user_id;
            if (isset($empMap[$empno])) {
                $u->RESULT = $empMap[$empno]['RESULT'];
                $u->DETAIL = $empMap[$empno]['DETAIL'];
            }
            $u->IS_HISTORY = 0;
        }

        return $users;
    }

    public function getScmUsersForView($cyear2, $nrunno)
    {
        // 1. Query ISRGV_EMP
        $empData = $this->db
            ->select('EMPNO, RESULT, DETAIL')
            ->from('ISRGV_EMP')
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno)
            ->get()
            ->result();

        if (empty($empData))
            return [];

        $empnos = array_column($empData, 'EMPNO');
        $empMap = [];
        foreach ($empData as $e) {
            $empMap[$e->EMPNO] = ['RESULT' => $e->RESULT, 'DETAIL' => $e->DETAIL];
        }

        // 2. Query SCM users จาก SCM database
        $this->scm->select('*')
            ->from('AUTHORIZE_INVENTORY')
            ->where_in('USR_LOGIN', $empnos)
            ->order_by('GRP_NAME', 'ASC');
        $users = $this->scm->get()->result();

        // 3. Merge RESULT และ DETAIL
        foreach ($users as $u) {
            $empno = $u->USR_LOGIN;
            if (isset($empMap[$empno])) {
                $u->RESULT = $empMap[$empno]['RESULT'];
                $u->DETAIL = $empMap[$empno]['DETAIL'];
            }
            $u->IS_HISTORY = 0;
        }

        return $users;
    }

    public function getAs400UsersForView($cyear2, $nrunno)
    {
        // 1. Query ISRGV_EMP
        $empData = $this->db
            ->select('EMPNO, RESULT, DETAIL')
            ->from('ISRGV_EMP')
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno)
            ->get()
            ->result();

        if (empty($empData))
            return [];

        $empnos = array_column($empData, 'EMPNO');
        $empMap = [];
        foreach ($empData as $e) {
            $empMap[$e->EMPNO] = ['RESULT' => $e->RESULT, 'DETAIL' => $e->DETAIL];
        }

        // 2. Query AS400 users จาก auditDB
        $sql   = "SELECT is2.*, ts.SNAME, ts.SEMPNO
                FROM ITGC_SPECIALUSER is2
                JOIN AMECUserLogin.dbo.TB_SQLAMECUSER ts ON is2.EMPNO = ts.SEMPNO
                WHERE is2.USER_TYPE2 = 'Human'
                AND is2.CATEGORY = 'APP'
                AND is2.SERVER_NAME = 'AS400'
                AND is2.EMPNO IN ('" . implode("','", $empnos) . "')";
        $users = $this->ad->query($sql)->result();

        // 3. Merge RESULT และ DETAIL
        foreach ($users as $u) {
            $empno = trim($u->EMPNO);
            if (isset($empMap[$empno])) {
                $u->RESULT = $empMap[$empno]['RESULT'];
                $u->DETAIL = $empMap[$empno]['DETAIL'];
            }
            $u->IS_HISTORY = 0;
        }

        return $users;
    }

    public function getIsUsersForView($cyear2, $nrunno, $section)
    {
        // 1. Query ISRGV_EMP
        $empData = $this->db
            ->select('EMPNO, RESULT, DETAIL, USER_LOGIN')
            ->from('ISRGV_EMP')
            ->where('CYEAR2', $cyear2)
            ->where('NRUNNO', $nrunno)
            ->get()
            ->result();

        if (empty($empData))
            return [];

        $empnos         = array_column($empData, 'EMPNO');
        $empMap         = [];
        $userConditions = []; // สำหรับ WHERE clause

        foreach ($empData as $e) {
            // แยก USER_LOGIN_SERVER_NAME เป็น USER_LOGIN และ SERVER_NAME
            $parts = explode('_', $e->USER_LOGIN, 2); // แยกแค่ครั้งแรก
            if (count($parts) == 2) {
                $userLogin  = $parts[0];
                $serverName = $parts[1];

                $empMap[$e->USER_LOGIN] = [
                    'RESULT' => $e->RESULT,
                    'DETAIL' => $e->DETAIL,
                    'EMPNO'  => $e->EMPNO
                ];

                $userConditions[] = "(is2.USER_LOGIN = '{$userLogin}' AND is2.SERVER_NAME = '{$serverName}')";
            }
        }

        if (empty($userConditions))
            return [];

        // 2. Query IS users จาก auditDB โดย WHERE ด้วย USER_LOGIN และ SERVER_NAME
        $whereCondition = implode(' OR ', $userConditions);
        $sql            = "
            SELECT is2.*, a.SNAME, a.SEMPNO
            FROM ITGC_SPECIALUSER is2
            LEFT JOIN AMECUserLogin.dbo.TB_SQLAMECUSER a ON is2.EMPNO = a.SEMPNO
            WHERE is2.CATEGORY != 'APP'
            AND is2.AUTH_OGANIZE = '{$section}'
            AND is2.ACTIVE_STATUS = '1'
            AND is2.USER_TYPE2 = 'Human'
            AND ({$whereCondition})
        ";
        $users          = $this->ad->query($sql)->result();

        // 3. Merge RESULT และ DETAIL โดยใช้ USER_LOGIN_SERVER_NAME
        foreach ($users as $u) {
            $userLoginKey = $u->USER_LOGIN . '_' . $u->SERVER_NAME;

            if (isset($empMap[$userLoginKey])) {
                $u->RESULT          = $empMap[$userLoginKey]['RESULT'];
                $u->DETAIL          = $empMap[$userLoginKey]['DETAIL'];
                $u->USER_LOGIN_FULL = $userLoginKey;
            } else {
                $u->RESULT          = null;
                $u->DETAIL          = null;
                $u->USER_LOGIN_FULL = $userLoginKey;
            }
            $u->IS_HISTORY = 0;
        }

        return $users;
    }



}