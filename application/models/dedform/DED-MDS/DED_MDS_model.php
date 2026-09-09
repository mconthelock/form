<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once APPPATH . 'models/my_model.php';

class DED_MDS_model extends my_model 
{
    public $DDS;

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->DDS = 'DDS';
    }

    public function QuerySetBase($q, $base = 'DDS', $bindData = array())
    {
        if (empty($base)) {
            $base = $this->DDS;
        }
        if (!is_array($bindData)) {
            $bindData = array($bindData);
        }
        $conf = $this->load->database($base, TRUE); 
        return $conf->query($q, $bindData);
    }

    public function deleteData($base = 'DDS', $tb = '', $w = array())
    {
        if (empty($base)) {
            $base = $this->DDS;
        }
        $db = $this->load->database($base, TRUE);
        if (!empty($w) && !empty($tb)) {
            $db->where($w);
            return $db->delete($tb);
        }
        return false;
    }

     /**
     * ลบข้อมูล Draft Plan ทั้ง Header และ Detail
     * @param string|null $planYear
     * @param string|null $periodCode
     * @param int|null $planHeaderID
     * @return bool
     */
    public function DeleteDraftDesBM($planYear = null, $periodCode = null, $planHeaderID = null, &$db = null)
    {
        $isInternalTx = false;
        if ($db === null) {
            $db = $this->load->database($this->DDS, TRUE);
            $db->query("SET LOCK_TIMEOUT 5000;");
            $db->trans_begin();
            $isInternalTx = true;
        }

        try {
            $allowedStatuses = ['DRAFT', 'PROCESS'];
            if (!empty($planHeaderID)) {
                $header = $db->select('PlanHeaderID')
                            ->where('PlanHeaderID', (string)$planHeaderID)
                            ->where_in('Status', $allowedStatuses)
                            ->get('Tb_Master_DESBM_Header')
                            ->row();

                if ($header) {
                    $db->where('PlanHeaderID', (string)$header->PlanHeaderID)->delete('Tb_Master_DESBM_Detail');
                    $db->where('PlanHeaderID', (string)$header->PlanHeaderID)->delete('Tb_Master_DESBM_Header');
                }
            } elseif (!empty($planYear) && !empty($periodCode)) {
                $oldDrafts = $db->select('PlanHeaderID')
                                ->where('PlanYear', (string)$planYear)
                                ->where('PeriodCode', (string)$periodCode)
                                ->where_in('Status', $allowedStatuses)
                                ->get('Tb_Master_DESBM_Header')
                                ->result();

                if (!empty($oldDrafts)) {
                    $headerIDs = array_column($oldDrafts, 'PlanHeaderID');
                    $db->where_in('PlanHeaderID', $headerIDs)->delete('Tb_Master_DESBM_Detail');
                    $db->where_in('PlanHeaderID', $headerIDs)->delete('Tb_Master_DESBM_Header');
                }
            }

            if ($isInternalTx) {
                if ($db->trans_status() === FALSE) {
                    $db->trans_rollback();
                    return false;
                }
                $db->trans_commit();
            }
            return true;

        } catch (\Throwable $e) {
            if ($isInternalTx) {
                $db->trans_rollback();
            }
            log_message('error', 'DeleteDraftDesBM Error: ' . $e->getMessage());
            return false;
        }
    }


    public function InsertDraftDesBM($headerData, $nextRevision, $userSession)
    {
        // ใช้ Connection ก้อนเดียวตลอดการทำงาน
        $db = $this->load->database($this->DDS, TRUE);
        $db->trans_begin();

        try {
            // 1. บันทึก Header ใหม่
            $db->insert('Tb_Master_DESBM_Header', $headerData);
            $newPlanHeaderID = $db->insert_id();

            if (empty($newPlanHeaderID)) {
                throw new Exception("ไม่สามารถ Insert Header ได้");
            }

            // 2. โอนย้ายข้อมูลจาก Temp เข้าสู่ Detail จริงผ่าน Object $db ตัวเดิม
            $sqlTransfer = "
                INSERT INTO [dbo].[Tb_Master_DESBM_Detail] (
                    PlanHeaderID, SeqNo, Rev, PROD, MFG_BM, P_Type,
                    DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                    Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                    SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                    Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
                    TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES,
                    UserAction, ComputerAction, DateAction
                )
                SELECT 
                    ?, SeqNo, ?, PROD, MFG_BM, P_Type,
                    DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                    Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                    SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                    Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
                    TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES,
                    ?, ?, GETDATE()
                FROM [dbo].[Tb_Master_DESBM_Detail_temp] WITH (NOLOCK)
                WHERE UserSessionID = ?;
            ";

            $db->query($sqlTransfer, [
                $newPlanHeaderID, 
                $nextRevision,
                $headerData['UserAction'] ?? 'SYSTEM', 
                $headerData['ComputerAction'] ?? (string)gethostbyaddr($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'), 
                $userSession
            ]);

            if ($db->trans_status() === FALSE) {
                $db->trans_rollback();
                return null;
            }

            $db->trans_commit();
            return $newPlanHeaderID;

        } catch (\Throwable $e) {
            $db->trans_rollback();
            log_message('error', 'InsertDraftDesBM Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * อัปเดตข้อมูล Ticket Webflow ลงตาราง Header และ Detail
     * @param int $planHeaderID
     * @param array $headerUpdate
     * @return bool
     * @throws Exception
     */
    public function SavePlanTicket($planHeaderID, $headerUpdate)
    {
        $db = $this->load->database($this->DDS, TRUE);
        $db->trans_begin();

        try {
            // 1. อัปเดต Tb_Master_DESBM_Header
            $db->where('PlanHeaderID', (int)$planHeaderID)
            ->update('Tb_Master_DESBM_Header', $headerUpdate);


            if ($db->trans_status() === FALSE) {
                $db->trans_rollback();
                throw new Exception("เกิดข้อผิดพลาดในการบันทึกฐานข้อมูล Plan Master");
            }

            $db->trans_commit();
            return true;

        } catch (\Throwable $e) {
            $db->trans_rollback();
            throw $e;
        }
    }
    /**
     * อัปเดตข้อมูลสถานะ Header ตามเงื่อนไข Form ID ของ Webflow
     * @param array $formID
     * @param array $data
     * @return bool
     */
    public function UpdateHeader($formID, $data)
    {
        $db = $this->load->database($this->DDS, TRUE);

        $db->where('NFRMNO', (int)$formID['NFRMNO'])
        ->where('VORGNO', (string)$formID['VORGNO'])
        ->where('CYEAR2', (string)$formID['CYEAR2'])
        ->where('NRUNNO', (int)$formID['NRUNNO'])
        ->update('Tb_Master_DESBM_Header', $data);

        return true;
    }

    /**
     * ดึง PIC จาก Tb_MS_Master_DESBM_PIC และอัปเดตผู้อนุมัติลงตาราง FLOW
     * @param array $flowID [NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO]
     * @return bool
     * @throws Exception
     */
    public function updateWebflowApprover($flowID)
    {
        $db = $this->load->database($this->DDS, TRUE);
        $requiredKeys = ['NFRMNO', 'VORGNO', 'CYEAR', 'CYEAR2', 'NRUNNO'];
        foreach ($requiredKeys as $key) {
            if (!isset($flowID[$key]) || $flowID[$key] === null || trim((string)$flowID[$key]) === '') {
                throw new Exception("ข้อมูลสำหรับอ้างอิง Flow ไม่ถูกต้อง: คีย์ {$key} ห้ามเป็นค่าว่าง");
            }
        }
        // 1. ดึง USERID ผู้อนุมัติจาก Tb_MS_Master_DESBM_PIC
        $picRow = $db->select('USERID')
                     ->where('STATUS', 'DED-MDS_PIC')
                     ->limit(1)
                     ->get('Tb_MS_Master_DESBM_PIC')
                     ->row();

        if (!$picRow || empty($picRow->USERID)) {
            throw new Exception("ไม่พบรายชื่อผู้อนุมัติ (DED-MDS_PIC) ในระบบ");
        }

        $approverUserId = $picRow->USERID?trim($picRow->USERID):'13204';

        $db = $this->load->database('DEFAULT', TRUE);
        // 2. อัปเดตผู้อนุมัติลงตาราง FLOW ของ Webflow
        // หมายเหตุ: หากตาราง FLOW อยู่ใน Database อื่น ให้เปลี่ยน $db เป็น connection ของ Webflow
        $db->where('NFRMNO', $flowID['NFRMNO'])
           ->where('VORGNO', $flowID['VORGNO'])
           ->where('CYEAR',  $flowID['CYEAR'])
           ->where('CYEAR2', $flowID['CYEAR2'])
           ->where('NRUNNO', $flowID['NRUNNO'])
           ->where('CEXTDATA', $flowID['CEXTDATA'])
           ->update('FLOW', [
               'VAPVNO' => $approverUserId,
               'VREPNO' => $approverUserId
           ]);

        return true;
    }

    public function processPlanMasterDirect0($planHeaderID, $year, $period, $desTypes, $revision, $empno, &$db = null)
    {
        if ($db === null) {
            $db = $this->load->database($this->DDS, TRUE);
        }

        $year = trim((string)$year);
        $period = trim((string)$period);
        $nextYear = (string)((int)$year + 1);

        if (empty($desTypes) || !is_array($desTypes)) {
            $desTypes = ['N', 'T'];
        }
        $escapedDesTypes = array_map(function($item) use ($db) {
            return $db->escape(trim($item));
        }, $desTypes);
        $desTypeInClause = implode(',', $escapedDesTypes);

        if ($period === '04X-09C') {
            $startA2M01 = $year . '041';
            $endA2M01   = $year . '096';
        } else {
            $startA2M01 = $year . '101';
            $endA2M01   = $nextYear . '036';
        }

        $sql = " 
            SET NOCOUNT ON;

            IF OBJECT_ID('tempdb..#WorkingDays') IS NOT NULL DROP TABLE #WorkingDays;

            SELECT CalDate, DateStr, WorkSeq
            INTO #WorkingDays
            FROM V_WorkingDays;

            CREATE CLUSTERED INDEX IX_WorkSeq ON #WorkingDays(WorkSeq);
            CREATE NONCLUSTERED INDEX IX_CalDate ON #WorkingDays(CalDate);

            IF OBJECT_ID('tempdb..#CalConfig') IS NOT NULL DROP TABLE #CalConfig;

            SELECT 
                TargetField COLLATE DATABASE_DEFAULT AS TargetField, 
                P_Type      COLLATE DATABASE_DEFAULT AS P_Type, 
                BaseField, 
                BaseRowType, 
                OffsetDays
            INTO #CalConfig
            FROM [dbo].[Tb_MS_Master_DESBM_Cal]
            WHERE IsActive = 1;

            DECLARE @PeriodMode    VARCHAR(10)  = ?;
            DECLARE @StartA2M01    VARCHAR(7)   = ?;
            DECLARE @EndA2M01      VARCHAR(7)   = ?;
            DECLARE @CurYear       VARCHAR(4)   = ?;
            DECLARE @NxtYear       VARCHAR(4)   = ?;
            DECLARE @PlanHeaderID  NVARCHAR(20) = ?;
            DECLARE @Revision      VARCHAR(10)  = ?;
            DECLARE @UserAction    VARCHAR(50)  = ?;

            ;WITH RawPeriodSource AS (
                SELECT 
                    CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) COLLATE DATABASE_DEFAULT AS A2M01,
                    CAST(A.A2M02 AS VARCHAR(10)) COLLATE DATABASE_DEFAULT AS A2M02,
                    CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)) COLLATE DATABASE_DEFAULT AS A2M03,

                    CASE 
                        WHEN A.A2M03 IS NULL OR CAST(A.A2M03 AS BIGINT) = 0 THEN NULL
                        ELSE CONVERT(SMALLDATETIME, CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)), 112)
                    END AS MFG_BM_Date,

                    SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) AS MonthPart,

                    CASE SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1)
                        WHEN '1' THEN 'X' WHEN '2' THEN 'A' WHEN '3' THEN 'Y'
                        WHEN '4' THEN 'B' WHEN '5' THEN 'Z' WHEN '6' THEN 'C'
                    END AS JunCode,

                    CASE 
                        WHEN SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) = '02' 
                            AND SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1) = '6' THEN
                            CONVERT(SMALLDATETIME, 
                                SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) + '-02-' + 
                                CASE 
                                    WHEN CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 4 = 0 
                                        AND (CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 100 <> 0 
                                            OR CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 400 = 0) 
                                    THEN '29' 
                                    ELSE '28' 
                                END, 120)
                        ELSE
                            CONVERT(SMALLDATETIME, 
                                SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) + '-' + 
                                SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) + '-' + 
                                CASE SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1)
                                    WHEN '1' THEN '05'
                                    WHEN '2' THEN '10'
                                    WHEN '3' THEN '15'
                                    WHEN '4' THEN '20'
                                    WHEN '5' THEN '25'
                                    WHEN '6' THEN '30'
                                END, 120)
                    END AS ChangeJunTodate,

                    MAX(CAST(A.A2M02 AS VARCHAR(10))) OVER (
                        PARTITION BY CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7))
                    ) COLLATE DATABASE_DEFAULT AS Max_A2M02

                FROM GG..AMECMFG.A002MP A
                WHERE 
                    (@PeriodMode = '04X-09C' AND CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @StartA2M01 AND @EndA2M01)
                    OR
                    (@PeriodMode = '10X-03C' AND (
                        CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @CurYear + '101' AND @CurYear + '126'
                        OR CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @NxtYear + '011' AND @EndA2M01
                    ))
            ),
            FilteredByMasterDesType AS (
                SELECT 
                    R.A2M01, 
                    R.A2M02 AS P_Display, 
                    R.A2M03, 
                    R.MFG_BM_Date,
                    R.MonthPart, 
                    R.JunCode, 
                    R.ChangeJunTodate,
                    M.DesType COLLATE DATABASE_DEFAULT AS DesType, 
                    M.P_Type  COLLATE DATABASE_DEFAULT AS P_Type, 
                    M.Seq AS DesTypeSeq
                FROM RawPeriodSource R
                INNER JOIN [dbo].[Tb_MS_Master_DESBM_DesType] M 
                    ON M.IsActive = 1
                    AND M.DesType COLLATE DATABASE_DEFAULT IN ({$desTypeInClause})
                    AND (
                        (M.P_Type COLLATE DATABASE_DEFAULT = 'last P' AND R.A2M02 = R.Max_A2M02 AND R.A2M02 <> 'P1')
                        OR
                        (M.P_Type COLLATE DATABASE_DEFAULT <> 'last P' AND R.A2M02 = M.P_Type COLLATE DATABASE_DEFAULT)
                    )
            ),
            BaseSequence AS (
                SELECT 
                    F.*,
                    W.WorkSeq AS MFG_WorkSeq,
                    F.MonthPart + F.JunCode + F.DesType + SUBSTRING(F.A2M01, 1, 4) AS TypeJun,
                    SUBSTRING(F.A2M01, 1, 4) + F.MonthPart + F.JunCode + F.DesType AS PROD,
                    SUBSTRING(F.A2M01, 3, 2) + F.MonthPart + F.JunCode + F.DesType AS FormatAs400
                FROM FilteredByMasterDesType F
                OUTER APPLY (
                    SELECT TOP 1 WorkSeq FROM #WorkingDays WHERE CalDate <= F.MFG_BM_Date ORDER BY CalDate DESC
                ) W
            ),
            CalculatedStep1 AS (
                SELECT 
                    B.*,
                    B.MFG_WorkSeq + ISNULL(CFG_DES.OffsetDays, 0) AS DES_WorkSeq
                FROM BaseSequence B
                OUTER APPLY (
                    SELECT TOP 1 OffsetDays 
                    FROM #CalConfig 
                    WHERE TargetField = 'DES_BM' 
                    AND P_Type = B.P_Type COLLATE DATABASE_DEFAULT
                ) CFG_DES
            ),
            CalculatedStep2 AS (
                SELECT 
                    C1.*,
                    P1_Ref.DES_WorkSeq AS P1_DES_WorkSeq,
                    P1_Ref.MFG_WorkSeq AS P1_MFG_WorkSeq
                FROM CalculatedStep1 C1
                OUTER APPLY (
                    SELECT TOP 1 DES_WorkSeq, MFG_WorkSeq 
                    FROM CalculatedStep1 
                    WHERE A2M01 = C1.A2M01 AND DesType = 'N'
                ) P1_Ref
            ),
            CalculatedFinalWorkSeq AS (
                SELECT 
                    C.*,
                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
                        ELSE C.P1_DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
                    END AS GODES_WorkSeq,

                    CASE 
                        WHEN C.P_Type = 'P1' THEN (C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)) + ISNULL(CFG_MEL.OffsetDays, 4)
                        ELSE NULL 
                    END AS CONFIRM_WorkSeq,

                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_MSE.OffsetDays, 5)
                        ELSE NULL 
                    END AS MSE_WorkSeq,

                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
                        ELSE C.P1_MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
                    END AS SW_WorkSeq,

                    C.DES_WorkSeq + ISNULL(CFG_0LV.OffsetDays, -2) AS ZEROLVL_WorkSeq,

                    LAG(C.DES_WorkSeq) OVER (
                        PARTITION BY C.DesType 
                        ORDER BY C.A2M01, C.DesTypeSeq
                    ) AS Prev_DES_WorkSeq

                FROM CalculatedStep2 C
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Go_DES' AND P_Type = 'P1') CFG_GO_P1
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Confirm_MELINA' AND P_Type = 'P1') CFG_MEL
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'MSE_to_MELINA' AND P_Type = 'P1') CFG_MSE
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'SW_Assembly' AND P_Type = 'P1') CFG_SW
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Zero_Level_Check' AND P_Type = C.P_Type COLLATE DATABASE_DEFAULT) CFG_0LV
            )
            INSERT INTO [dbo].[Tb_Master_DESBM_Detail] (
                DetailID, PlanHeaderID, Rev, SeqNo, A2M01, PROD, MFG_BM, P_Type,
                DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
                TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES, 
                UserAction, DateAction
            )
            SELECT 
                ROW_NUMBER() OVER (ORDER BY F.A2M01, F.DesTypeSeq) AS DetailID,
                @PlanHeaderID, 
                @Revision,
                ROW_NUMBER() OVER (ORDER BY F.A2M01, F.DesTypeSeq) AS SeqNo,
                F.A2M01, 
                F.PROD, F.MFG_BM_Date, F.P_Display,
                
                W_DES.CalDate, 
                ABS(F.MFG_WorkSeq - F.DES_WorkSeq),
                
                W_GODES.CalDate, 
                ABS(F.DES_WorkSeq - F.GODES_WorkSeq),
                
                W_CONFIRM.CalDate, 
                CASE WHEN F.P_Type = 'P1' THEN ABS(F.CONFIRM_WorkSeq - F.GODES_WorkSeq) ELSE NULL END,
                
                W_MSE.CalDate, 
                CASE WHEN F.P_Type = 'P1' THEN ABS(F.MSE_WorkSeq - F.DES_WorkSeq) ELSE NULL END,
                
                W_SW.CalDate, 
                ABS(F.MFG_WorkSeq - F.SW_WorkSeq),
                
                W_0LVL.CalDate, 
                ABS(F.DES_WorkSeq - F.ZEROLVL_WorkSeq),

                CASE 
                    WHEN F.Prev_DES_WorkSeq IS NOT NULL THEN ABS(F.DES_WorkSeq - F.Prev_DES_WorkSeq) + ISNULL(CFG_DWD.OffsetDays, -1)
                    ELSE NULL 
                END AS Design_working_day,

                CASE 
                    WHEN F.MFG_BM_Date IS NOT NULL AND W_GODES.CalDate IS NOT NULL 
                    THEN ISNULL(CFG_LT.OffsetDays, 50) + DATEDIFF(day, W_GODES.CalDate, F.MFG_BM_Date)
                    ELSE NULL 
                END AS LeadTime,

                CASE 
                    WHEN F.MFG_BM_Date IS NOT NULL AND W_DES.CalDate IS NOT NULL 
                    THEN DATEDIFF(day, W_DES.CalDate, F.MFG_BM_Date) + ISNULL(CFG_DES2.OffsetDays, 1)
                    ELSE NULL 
                END AS Time_DESBM_to_MFGBM_2,
                
                F.TypeJun, F.ChangeJunTodate, F.DesType, F.FormatAs400,
                '2030-04-15 00:00:00', NULL,
                'SYSTEM', GETDATE()
            FROM CalculatedFinalWorkSeq F
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Design_working_day') CFG_DWD
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'LeadTime') CFG_LT
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Time_DESBM_to_MFGBM_2') CFG_DES2
            LEFT JOIN #WorkingDays W_DES     ON W_DES.WorkSeq     = F.DES_WorkSeq
            LEFT JOIN #WorkingDays W_GODES   ON W_GODES.WorkSeq   = F.GODES_WorkSeq
            LEFT JOIN #WorkingDays W_CONFIRM ON W_CONFIRM.WorkSeq = F.CONFIRM_WorkSeq
            LEFT JOIN #WorkingDays W_MSE     ON W_MSE.WorkSeq     = F.MSE_WorkSeq
            LEFT JOIN #WorkingDays W_SW      ON W_SW.WorkSeq      = F.SW_WorkSeq
            LEFT JOIN #WorkingDays W_0LVL    ON W_0LVL.WorkSeq    = F.ZEROLVL_WorkSeq;
        ";

        $binds = [
            $period,
            $startA2M01,
            $endA2M01,
            $year,
            $nextYear,
            (string)$planHeaderID,
            $revision,
            $empno
        ];

        $db->query($sql, $binds);
        return $this->insertMissingJuns($planHeaderID, $year, $period, $desTypes, $revision, $db);
    }
    public function processPlanMasterDirect($planHeaderID, $year, $period, $desTypes, $revision, $empno, &$db = null)
    {
        if ($db === null) {
            $db = $this->load->database($this->DDS, TRUE);
        }

        $year = trim((string)$year);
        $period = trim((string)$period);
        $nextYear = (string)((int)$year + 1);

        if (empty($desTypes) || !is_array($desTypes)) {
            $desTypes = ['N', 'T'];
        }
        $escapedDesTypes = array_map(function($item) use ($db) {
            return $db->escape(trim($item));
        }, $desTypes);
        $desTypeInClause = implode(',', $escapedDesTypes);

        if ($period === '04X-09C') {
            $startA2M01 = $year . '041';
            $endA2M01   = $year . '096';
        } else {
            $startA2M01 = $year . '101';
            $endA2M01   = $nextYear . '036';
        }

        $sql = " 
            SET NOCOUNT ON;

            IF OBJECT_ID('tempdb..#WorkingDays') IS NOT NULL DROP TABLE #WorkingDays;

            SELECT CalDate, DateStr, WorkSeq
            INTO #WorkingDays
            FROM V_WorkingDays;

            CREATE CLUSTERED INDEX IX_WorkSeq ON #WorkingDays(WorkSeq);
            CREATE NONCLUSTERED INDEX IX_CalDate ON #WorkingDays(CalDate);

            IF OBJECT_ID('tempdb..#CalConfig') IS NOT NULL DROP TABLE #CalConfig;

            SELECT 
                TargetField COLLATE DATABASE_DEFAULT AS TargetField, 
                P_Type      COLLATE DATABASE_DEFAULT AS P_Type, 
                BaseField, 
                BaseRowType, 
                OffsetDays
            INTO #CalConfig
            FROM [dbo].[Tb_MS_Master_DESBM_Cal]
            WHERE IsActive = 1;

            DECLARE @PeriodMode    VARCHAR(10)  = ?;
            DECLARE @StartA2M01    VARCHAR(7)   = ?;
            DECLARE @EndA2M01      VARCHAR(7)   = ?;
            DECLARE @CurYear       VARCHAR(4)   = ?;
            DECLARE @NxtYear       VARCHAR(4)   = ?;
            DECLARE @PlanHeaderID  NVARCHAR(20) = ?;
            DECLARE @Revision      VARCHAR(10)  = ?;
            DECLARE @UserAction    VARCHAR(50)  = ?;

            -- 🟢 1. ดึง 2 Records ล่าสุดของแต่ละ DesType จากงวดก่อนหน้ามาเป็น Fallback
            ;WITH LastPrevPeriodPerDesType AS (
                SELECT 
                    d.DesType,
                    d.DES_BM,
                    ROW_NUMBER() OVER (PARTITION BY d.DesType ORDER BY d.A2M01 DESC, d.SeqNo DESC) AS rn
                FROM [dbo].[Tb_Master_DESBM_Detail] d WITH (NOLOCK)
                WHERE d.A2M01 < @StartA2M01
                  AND d.PlanHeaderID != @PlanHeaderID
                  AND d.DES_BM IS NOT NULL
            ),
            FallbackBaseSeq AS (
                SELECT 
                    p.DesType,
                    p.DES_BM,
                    w.WorkSeq AS Fallback_DES_WorkSeq
                FROM LastPrevPeriodPerDesType p
                OUTER APPLY (
                    SELECT TOP 1 WorkSeq 
                    FROM #WorkingDays 
                    WHERE CalDate <= p.DES_BM 
                    ORDER BY CalDate DESC
                ) w
                WHERE p.rn = 1
            ),
            RawPeriodSource AS (
                SELECT 
                    CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) COLLATE DATABASE_DEFAULT AS A2M01,
                    CAST(A.A2M02 AS VARCHAR(10)) COLLATE DATABASE_DEFAULT AS A2M02,
                    CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)) COLLATE DATABASE_DEFAULT AS A2M03,

                    CASE 
                        WHEN A.A2M03 IS NULL OR CAST(A.A2M03 AS BIGINT) = 0 THEN NULL
                        ELSE CONVERT(SMALLDATETIME, CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)), 112)
                    END AS MFG_BM_Date,

                    SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) AS MonthPart,

                    CASE SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1)
                        WHEN '1' THEN 'X' WHEN '2' THEN 'A' WHEN '3' THEN 'Y'
                        WHEN '4' THEN 'B' WHEN '5' THEN 'Z' WHEN '6' THEN 'C'
                    END AS JunCode,

                    CASE 
                        WHEN SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) = '02' 
                            AND SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1) = '6' THEN
                            CONVERT(SMALLDATETIME, 
                                SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) + '-02-' + 
                                CASE 
                                    WHEN CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 4 = 0 
                                        AND (CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 100 <> 0 
                                            OR CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 400 = 0) 
                                    THEN '29' 
                                    ELSE '28' 
                                END, 120)
                        ELSE
                            CONVERT(SMALLDATETIME, 
                                SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) + '-' + 
                                SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) + '-' + 
                                CASE SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1)
                                    WHEN '1' THEN '05'
                                    WHEN '2' THEN '10'
                                    WHEN '3' THEN '15'
                                    WHEN '4' THEN '20'
                                    WHEN '5' THEN '25'
                                    WHEN '6' THEN '30'
                                END, 120)
                    END AS ChangeJunTodate,

                    MAX(CAST(A.A2M02 AS VARCHAR(10))) OVER (
                        PARTITION BY CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7))
                    ) COLLATE DATABASE_DEFAULT AS Max_A2M02

                FROM GG..AMECMFG.A002MP A
                WHERE 
                    (@PeriodMode = '04X-09C' AND CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @StartA2M01 AND @EndA2M01)
                    OR
                    (@PeriodMode = '10X-03C' AND (
                        CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @CurYear + '101' AND @CurYear + '126'
                        OR CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @NxtYear + '011' AND @EndA2M01
                    ))
            ),
            FilteredByMasterDesType AS (
                SELECT 
                    R.A2M01, 
                    R.A2M02 AS P_Display, 
                    R.A2M03, 
                    R.MFG_BM_Date,
                    R.MonthPart, 
                    R.JunCode, 
                    R.ChangeJunTodate,
                    M.DesType COLLATE DATABASE_DEFAULT AS DesType, 
                    M.P_Type  COLLATE DATABASE_DEFAULT AS P_Type, 
                    M.Seq AS DesTypeSeq
                FROM RawPeriodSource R
                INNER JOIN [dbo].[Tb_MS_Master_DESBM_DesType] M 
                    ON M.IsActive = 1
                    AND M.DesType COLLATE DATABASE_DEFAULT IN ({$desTypeInClause})
                    AND (
                        (M.P_Type COLLATE DATABASE_DEFAULT = 'last P' AND R.A2M02 = R.Max_A2M02 AND R.A2M02 <> 'P1')
                        OR
                        (M.P_Type COLLATE DATABASE_DEFAULT <> 'last P' AND R.A2M02 = M.P_Type COLLATE DATABASE_DEFAULT)
                    )
            ),
            BaseSequence AS (
                SELECT 
                    F.*,
                    W.WorkSeq AS MFG_WorkSeq,
                    F.MonthPart + F.JunCode + F.DesType + SUBSTRING(F.A2M01, 1, 4) AS TypeJun,
                    SUBSTRING(F.A2M01, 1, 4) + F.MonthPart + F.JunCode + F.DesType AS PROD,
                    SUBSTRING(F.A2M01, 3, 2) + F.MonthPart + F.JunCode + F.DesType AS FormatAs400
                FROM FilteredByMasterDesType F
                OUTER APPLY (
                    SELECT TOP 1 WorkSeq FROM #WorkingDays WHERE CalDate <= F.MFG_BM_Date ORDER BY CalDate DESC
                ) W
            ),
            CalculatedStep1 AS (
                SELECT 
                    B.*,
                    B.MFG_WorkSeq + ISNULL(CFG_DES.OffsetDays, 0) AS DES_WorkSeq
                FROM BaseSequence B
                OUTER APPLY (
                    SELECT TOP 1 OffsetDays 
                    FROM #CalConfig 
                    WHERE TargetField = 'DES_BM' 
                    AND P_Type = B.P_Type COLLATE DATABASE_DEFAULT
                ) CFG_DES
            ),
            CalculatedStep2 AS (
                SELECT 
                    C1.*,
                    P1_Ref.DES_WorkSeq AS P1_DES_WorkSeq,
                    P1_Ref.MFG_WorkSeq AS P1_MFG_WorkSeq
                FROM CalculatedStep1 C1
                OUTER APPLY (
                    SELECT TOP 1 DES_WorkSeq, MFG_WorkSeq 
                    FROM CalculatedStep1 
                    WHERE A2M01 = C1.A2M01 AND DesType = 'N'
                ) P1_Ref
            ),
            CalculatedFinalWorkSeq AS (
                SELECT 
                    C.*,
                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
                        ELSE C.P1_DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
                    END AS GODES_WorkSeq,

                    CASE 
                        WHEN C.P_Type = 'P1' THEN (C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)) + ISNULL(CFG_MEL.OffsetDays, 4)
                        ELSE NULL 
                    END AS CONFIRM_WorkSeq,

                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_MSE.OffsetDays, 5)
                        ELSE NULL 
                    END AS MSE_WorkSeq,

                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
                        ELSE C.P1_MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
                    END AS SW_WorkSeq,

                    C.DES_WorkSeq + ISNULL(CFG_0LV.OffsetDays, -2) AS ZEROLVL_WorkSeq,

                    -- 🟢 2. ถ้า LAG() ในตารางงวดนี้เป็น NULL (คือ 2 แถวแรกของ Period) ให้นำ Fallback_DES_WorkSeq ของงวดก่อนมาใช้แทนทันที
                    COALESCE(
                        LAG(C.DES_WorkSeq) OVER (
                            PARTITION BY C.DesType 
                            ORDER BY C.A2M01, C.DesTypeSeq
                        ),
                        FB.Fallback_DES_WorkSeq
                    ) AS Prev_DES_WorkSeq

                FROM CalculatedStep2 C
                LEFT JOIN FallbackBaseSeq FB 
                    ON FB.DesType = C.DesType
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Go_DES' AND P_Type = 'P1') CFG_GO_P1
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Confirm_MELINA' AND P_Type = 'P1') CFG_MEL
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'MSE_to_MELINA' AND P_Type = 'P1') CFG_MSE
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'SW_Assembly' AND P_Type = 'P1') CFG_SW
                OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Zero_Level_Check' AND P_Type = C.P_Type COLLATE DATABASE_DEFAULT) CFG_0LV
            )
            INSERT INTO [dbo].[Tb_Master_DESBM_Detail] (
                DetailID, PlanHeaderID, Rev, SeqNo, A2M01, PROD, MFG_BM, P_Type,
                DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
                TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES, 
                UserAction, DateAction
            )
            SELECT 
                ROW_NUMBER() OVER (ORDER BY F.A2M01, F.DesTypeSeq) AS DetailID,
                @PlanHeaderID, 
                @Revision,
                ROW_NUMBER() OVER (ORDER BY F.A2M01, F.DesTypeSeq) AS SeqNo,
                F.A2M01, 
                F.PROD, F.MFG_BM_Date, F.P_Display,
                
                W_DES.CalDate, 
                ABS(F.MFG_WorkSeq - F.DES_WorkSeq),
                
                W_GODES.CalDate, 
                ABS(F.DES_WorkSeq - F.GODES_WorkSeq),
                
                W_CONFIRM.CalDate, 
                CASE WHEN F.P_Type = 'P1' THEN ABS(F.CONFIRM_WorkSeq - F.GODES_WorkSeq) ELSE NULL END,
                
                W_MSE.CalDate, 
                CASE WHEN F.P_Type = 'P1' THEN ABS(F.MSE_WorkSeq - F.DES_WorkSeq) ELSE NULL END,
                
                W_SW.CalDate, 
                ABS(F.MFG_WorkSeq - F.SW_WorkSeq),
                
                W_0LVL.CalDate, 
                ABS(F.DES_WorkSeq - F.ZEROLVL_WorkSeq),

                -- 🟢 3. เมื่อ Prev_DES_WorkSeq มีค่าครบแล้ว Design_working_day จะถูกคำนวณตั้งแต่แถวที่ 1 และ 2 ทันที
                CASE 
                    WHEN F.Prev_DES_WorkSeq IS NOT NULL THEN ABS(F.DES_WorkSeq - F.Prev_DES_WorkSeq) + ISNULL(CFG_DWD.OffsetDays, -1)
                    ELSE NULL 
                END AS Design_working_day,

                CASE 
                    WHEN F.MFG_BM_Date IS NOT NULL AND W_GODES.CalDate IS NOT NULL 
                    THEN ISNULL(CFG_LT.OffsetDays, 50) + DATEDIFF(day, W_GODES.CalDate, F.MFG_BM_Date)
                    ELSE NULL 
                END AS LeadTime,

                CASE 
                    WHEN F.MFG_BM_Date IS NOT NULL AND W_DES.CalDate IS NOT NULL 
                    THEN DATEDIFF(day, W_DES.CalDate, F.MFG_BM_Date) + ISNULL(CFG_DES2.OffsetDays, 1)
                    ELSE NULL 
                END AS Time_DESBM_to_MFGBM_2,
                
                F.TypeJun, F.ChangeJunTodate, F.DesType, F.FormatAs400,
                '2030-04-15 00:00:00', NULL,
                'SYSTEM', GETDATE()
            FROM CalculatedFinalWorkSeq F
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Design_working_day') CFG_DWD
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'LeadTime') CFG_LT
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Time_DESBM_to_MFGBM_2') CFG_DES2
            LEFT JOIN #WorkingDays W_DES     ON W_DES.WorkSeq     = F.DES_WorkSeq
            LEFT JOIN #WorkingDays W_GODES   ON W_GODES.WorkSeq   = F.GODES_WorkSeq
            LEFT JOIN #WorkingDays W_CONFIRM ON W_CONFIRM.WorkSeq = F.CONFIRM_WorkSeq
            LEFT JOIN #WorkingDays W_MSE     ON W_MSE.WorkSeq     = F.MSE_WorkSeq
            LEFT JOIN #WorkingDays W_SW      ON W_SW.WorkSeq      = F.SW_WorkSeq
            LEFT JOIN #WorkingDays W_0LVL    ON W_0LVL.WorkSeq    = F.ZEROLVL_WorkSeq;
        ";

        $binds = [
            $period,
            $startA2M01,
            $endA2M01,
            $year,
            $nextYear,
            (string)$planHeaderID,
            $revision,
            $empno
        ];

        $db->query($sql, $binds);
        return $this->insertMissingJuns($planHeaderID, $year, $period, $desTypes, $revision, $db);
    }
    
    /**
     * เติม Missing Jun พร้อม Re-index DetailID และ SeqNo 1..N
     */
    public function insertMissingJuns($planHeaderID, $year, $period, $desTypes, $revision, &$db = null)
    {
        if ($db === null) {
            $db = $this->load->database($this->DDS, TRUE);
        }

        $year = trim((string)$year);
        $period = trim((string)$period);
        $nextYear = (string)((int)$year + 1);

        if (empty($desTypes) || !is_array($desTypes)) {
            $desTypes = ['N', 'T'];
        }
        $escapedDesTypes = array_map(function($item) use ($db) {
            return $db->escape(trim($item));
        }, $desTypes);
        $desTypeInClause = implode(',', $escapedDesTypes);

        $sql = "
            SET NOCOUNT ON;

            DECLARE @PeriodMode   VARCHAR(10)  = ?;
            DECLARE @CurYear      VARCHAR(4)   = ?;
            DECLARE @NxtYear      VARCHAR(4)   = ?;
            DECLARE @PlanHeaderID NVARCHAR(20) = ?;
            DECLARE @Revision     VARCHAR(10)  = ?;

            ;WITH MonthList AS (
                SELECT 
                    CASE WHEN @PeriodMode = '04X-09C' THEN @CurYear ELSE CASE WHEN M.Seq <= 3 THEN @CurYear ELSE @NxtYear END END AS TargetYear,
                    M.MonthCode
                FROM (
                    VALUES 
                        (1, CASE WHEN @PeriodMode = '04X-09C' THEN '04' ELSE '10' END),
                        (2, CASE WHEN @PeriodMode = '04X-09C' THEN '05' ELSE '11' END),
                        (3, CASE WHEN @PeriodMode = '04X-09C' THEN '06' ELSE '12' END),
                        (4, CASE WHEN @PeriodMode = '04X-09C' THEN '07' ELSE '01' END),
                        (5, CASE WHEN @PeriodMode = '04X-09C' THEN '08' ELSE '02' END),
                        (6, CASE WHEN @PeriodMode = '04X-09C' THEN '09' ELSE '03' END)
                ) M(Seq, MonthCode)
            ),
            JunMatrix AS (
                SELECT 
                    ML.TargetYear,
                    ML.MonthCode,
                    J.JunNum,
                    J.JunLetter,
                    J.JunDay,
                    ML.TargetYear + ML.MonthCode + J.JunNum AS GenA2M01
                FROM MonthList ML
                CROSS JOIN (
                    VALUES 
                        ('1', 'X', '05'),
                        ('2', 'A', '10'),
                        ('3', 'Y', '15'),
                        ('4', 'B', '20'),
                        ('5', 'Z', '25'),
                        ('6', 'C', '30')
                ) J(JunNum, JunLetter, JunDay)
            ),
            FullJunCalendar AS (
                SELECT 
                    JM.GenA2M01,
                    JM.TargetYear,
                    JM.MonthCode,
                    JM.JunLetter,
                    CASE 
                        WHEN JM.MonthCode = '02' AND JM.JunNum = '6' THEN
                            CONVERT(SMALLDATETIME, 
                                JM.TargetYear + '-02-' + 
                                CASE 
                                    WHEN CAST(JM.TargetYear AS INT) % 4 = 0 
                                         AND (CAST(JM.TargetYear AS INT) % 100 <> 0 OR CAST(JM.TargetYear AS INT) % 400 = 0) 
                                    THEN '29' ELSE '28' 
                                END, 120)
                        ELSE
                            CONVERT(SMALLDATETIME, JM.TargetYear + '-' + JM.MonthCode + '-' + JM.JunDay, 120)
                    END AS ChangeJunTodate
                FROM JunMatrix JM
            ),
            ExpectedRows AS (
                SELECT 
                    JC.GenA2M01,
                    JC.TargetYear + JC.MonthCode + JC.JunLetter + M.DesType AS PROD,
                    JC.MonthCode + JC.JunLetter + M.DesType + JC.TargetYear AS TypeJun,
                    SUBSTRING(JC.TargetYear, 3, 2) + JC.MonthCode + JC.JunLetter + M.DesType AS FormatAs400,
                    JC.ChangeJunTodate,
                    M.DesType COLLATE DATABASE_DEFAULT AS DesType,
                    COALESCE(
                        NULLIF(
                            CASE 
                                WHEN LOWER(LTRIM(RTRIM(M.P_Type))) = 'last p' THEN 'P2' 
                                ELSE LTRIM(RTRIM(M.P_Type)) 
                            END, ''
                        ), 
                        'P1'
                    ) AS P_Type,
                    M.Seq AS DesTypeSeq
                FROM FullJunCalendar JC
                CROSS JOIN [dbo].[Tb_MS_Master_DESBM_DesType] M WITH (NOLOCK)
                WHERE M.IsActive = 1
                  AND M.DesType COLLATE DATABASE_DEFAULT IN ({$desTypeInClause})
            )
            INSERT INTO [dbo].[Tb_Master_DESBM_Detail] (
                DetailID, PlanHeaderID, Rev, SeqNo, A2M01, PROD, MFG_BM, P_Type,
                DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
                TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES, 
                UserAction, DateAction
            )
            SELECT 
                -- ใส่ค่าชั่วคราวที่ไม่ชนกับคีย์หลักเดิม
                (SELECT ISNULL(MAX(DetailID), 0) FROM [dbo].[Tb_Master_DESBM_Detail] WHERE PlanHeaderID = @PlanHeaderID) + 
                ROW_NUMBER() OVER (ORDER BY E.GenA2M01, E.DesTypeSeq) AS DetailID,
                @PlanHeaderID, 
                @Revision,
                9999,
                E.GenA2M01,
                E.PROD, NULL, 
                E.P_Type,
                NULL, NULL, NULL, NULL,
                NULL, NULL, NULL, NULL,
                NULL, NULL, NULL, NULL,
                NULL, NULL, NULL,
                E.TypeJun, E.ChangeJunTodate, E.DesType, E.FormatAs400,
                '2030-04-15 00:00:00', NULL,
                'SYSTEM', GETDATE()
            FROM ExpectedRows E
            WHERE NOT EXISTS (
                SELECT 1 
                FROM [dbo].[Tb_Master_DESBM_Detail] d WITH (NOLOCK)
                WHERE d.PlanHeaderID = @PlanHeaderID
                  AND d.PROD = E.PROD
                  AND d.DesType = E.DesType
            );

            -- จัดลำดับ DetailID และ SeqNo 1..N ตามปฏิทินจริง
            ;WITH CTE AS (
                SELECT 
                    DetailID, 
                    SeqNo, 
                    ROW_NUMBER() OVER (ORDER BY ChangeJunTodate ASC, PROD ASC, P_Type ASC) AS NewSeq
                FROM [dbo].[Tb_Master_DESBM_Detail]
                WHERE PlanHeaderID = @PlanHeaderID
            )
            UPDATE CTE 
            SET 
                DetailID = NewSeq,
                SeqNo    = NewSeq;
        ";

        $binds = [
            $period,
            $year,
            $nextYear,
            (string)$planHeaderID,
            $revision
        ];

        return $db->query($sql, $binds);
    }

    /**
     * Copy Revision ก่อนหน้าพร้อม Re-sequence DetailID
     */
    public function copyPreviousApprovedRevision($newPlanHeaderID, $year, $period, $desTypes, $newRevision, &$db = null)
    {
        if ($db === null) {
            $db = $this->load->database($this->DDS, TRUE);
        }

        $year = trim((string)$year);
        $period = trim((string)$period);
        $nextYear = (string)((int)$year + 1);

        if (empty($desTypes) || !is_array($desTypes)) {
            $desTypes = ['N', 'T'];
        }

        // 1. หา PlanHeaderID ล่าสุดที่ APPROVE
        $sqlPrev = "SELECT TOP 1 PlanHeaderID 
                    FROM Tb_Master_DESBM_Header WITH (NOLOCK)
                    WHERE PlanYear = ? AND PeriodCode = ? AND Status = 'APPROVE'
                    ORDER BY PlanHeaderID DESC";
        $queryPrev = $db->query($sqlPrev, [$year, $period]);
        $prevHeader = ($queryPrev && $queryPrev->num_rows() > 0) ? $queryPrev->row() : null;

        if (!$prevHeader) {
            return $this->processPlanMasterDirect($newPlanHeaderID, $year, $period, $desTypes, $newRevision, 'SYSTEM', $db);
        }

        // 2. ตรวจสอบ DesType
        $sqlExistingDes = "SELECT DISTINCT DesType 
                           FROM Tb_Master_DESBM_Detail WITH (NOLOCK)
                           WHERE PlanHeaderID = ?";
        $queryExisting = $db->query($sqlExistingDes, [(string)$prevHeader->PlanHeaderID]);
        $existingRows = $queryExisting ? $queryExisting->result_array() : [];
        $existingDesTypes = array_column($existingRows, 'DesType');

        $toCopyTypes = array_intersect($desTypes, $existingDesTypes);
        $toCalcTypes = array_diff($desTypes, $existingDesTypes);

        // 3. Copy ข้อมูล
        if (!empty($toCopyTypes)) {
            $escapedCopy = array_map(function($item) use ($db) {
                return $db->escape(trim($item));
            }, $toCopyTypes);
            $copyInClause = implode(',', $escapedCopy);

            $sqlCopy = "INSERT INTO Tb_Master_DESBM_Detail (
                            DetailID, PlanHeaderID, Rev, SeqNo, A2M01, PROD, MFG_BM, P_Type,
                            DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                            Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                            SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                            Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
                            TypeJun, ChangeJunTodate, DesType, FormatAs400,
                            BeforeEditDesBMDate, MARIssueDES,
                            UserAction, DateAction
                        )
                        SELECT 
                            ROW_NUMBER() OVER (ORDER BY SeqNo ASC) AS DetailID,
                            ?, ?, SeqNo, A2M01, PROD, MFG_BM, P_Type,
                            DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                            Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                            SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                            Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
                            TypeJun, ChangeJunTodate, DesType, FormatAs400,
                            BeforeEditDesBMDate, MARIssueDES,
                            'SYSTEM', GETDATE()
                        FROM Tb_Master_DESBM_Detail WITH (NOLOCK)
                        WHERE PlanHeaderID = ?
                          AND DesType IN ({$copyInClause})
                        ORDER BY SeqNo ASC";

            $db->query($sqlCopy, [(string)$newPlanHeaderID, $newRevision, (string)$prevHeader->PlanHeaderID]);

            // อัปเดต MFG_BM ล่าสุดจาก AS400
            if ($period === '04X-09C') {
                $startA2M01 = $year . '041';
                $endA2M01   = $year . '096';
            } else {
                $startA2M01 = $year . '101';
                $endA2M01   = $nextYear . '036';
            }

            $sqlUpdateMfg = "
                SET NOCOUNT ON;

                IF OBJECT_ID('tempdb..#TmpA002MP') IS NOT NULL DROP TABLE #TmpA002MP;

                ;WITH RawPeriodSource AS (
                    SELECT 
                        CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) COLLATE DATABASE_DEFAULT AS A2M01,
                        CAST(A.A2M02 AS VARCHAR(10)) COLLATE DATABASE_DEFAULT AS P_Type,
                        CASE 
                            WHEN A.A2M03 IS NULL OR CAST(A.A2M03 AS BIGINT) = 0 THEN NULL
                            ELSE CONVERT(SMALLDATETIME, CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)), 112)
                        END AS MFG_BM_Date,
                        ROW_NUMBER() OVER (
                            PARTITION BY CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) 
                            ORDER BY A.A2M02 ASC
                        ) AS rn
                    FROM GG..AMECMFG.A002MP A WITH (NOLOCK)
                    WHERE 
                        (? = '04X-09C' AND CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN ? AND ?)
                        OR
                        (? = '10X-03C' AND (
                            CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN ? + '101' AND ? + '126'
                            OR CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN ? + '011' AND ?
                        ))
                )
                SELECT A2M01, P_Type, MFG_BM_Date
                INTO #TmpA002MP
                FROM RawPeriodSource
                WHERE rn = 1;

                CREATE UNIQUE CLUSTERED INDEX IX_TmpA002MP ON #TmpA002MP(A2M01);

                -- 🟢 Update ทั้ง MFG_BM และ P_Type โดยเชื่อมด้วย A2M01
                UPDATE d
                SET 
                    d.MFG_BM = t.MFG_BM_Date,
                    d.P_Type = ISNULL(t.P_Type, d.P_Type)
                FROM Tb_Master_DESBM_Detail d
                INNER JOIN #TmpA002MP t
                    ON d.A2M01 = t.A2M01
                WHERE d.PlanHeaderID = ?;

                IF OBJECT_ID('tempdb..#TmpA002MP') IS NOT NULL DROP TABLE #TmpA002MP;
            ";

            $bindsUpdate = [
                $period, $startA2M01, $endA2M01,
                $period, $year, $year, $nextYear, $endA2M01,
                (string)$newPlanHeaderID
            ];

            $db->query($sqlUpdateMfg, $bindsUpdate);
        }

        // 4. คำนวณ DesType ที่งอกใหม่
        if (!empty($toCalcTypes)) {
            $this->processPlanMasterDirect($newPlanHeaderID, $year, $period, array_values($toCalcTypes), $newRevision, 'SYSTEM', $db);
        }

        // 5. เติม Missing Jun
        $this->insertMissingJuns($newPlanHeaderID, $year, $period, $desTypes, $newRevision, $db);

        // 6. Re-index DetailID และ SeqNo ให้เรียง 1..N สมบูรณ์
        $sqlReOrderSeq = ";WITH CTE AS (
                            SELECT 
                                DetailID, 
                                SeqNo, 
                                ROW_NUMBER() OVER (ORDER BY ChangeJunTodate ASC, PROD ASC, P_Type ASC) AS NewSeq
                            FROM Tb_Master_DESBM_Detail
                            WHERE PlanHeaderID = ?
                        )
                        UPDATE CTE 
                        SET 
                            DetailID = NewSeq,
                            SeqNo    = NewSeq;";
        $db->query($sqlReOrderSeq, [(string)$newPlanHeaderID]);

        return true;
    }

    /**
     * ดึงข้อมูล Detail พร้อม Flag ตรวจสอบการแก้ไข (Diff กับ Revision ก่อนหน้า)
     */
    public function getPlanDetailWithDiff($planHeaderID, $year, $period, $currentRevision)
    {
        $db = $this->load->database($this->DDS, TRUE);
        $planHeaderID = (string)$planHeaderID;

        $sqlPrev = "SELECT TOP 1 PlanHeaderID 
                    FROM Tb_Master_DESBM_Header WITH (NOLOCK)
                    WHERE PlanYear = ? 
                      AND PeriodCode = ? 
                      AND PlanHeaderID < ? 
                      AND Status = 'APPROVE'
                    ORDER BY PlanHeaderID DESC";
                    
        $queryPrev = $db->query($sqlPrev, [(string)$year, (string)$period, $planHeaderID]);
        $prevHeader = ($queryPrev && $queryPrev->num_rows() > 0) ? $queryPrev->row() : null;
        $prevHeaderID = $prevHeader ? (string)$prevHeader->PlanHeaderID : '';

        $sql = "SELECT 
                    cur.*,
                    CASE 
                        WHEN UPPER(LTRIM(RTRIM(ISNULL(cur.UserAction, 'SYSTEM')))) <> 'SYSTEM' THEN 1 
                        ELSE 0 
                    END AS IsUserEdited,
                    
                    CASE 
                        WHEN ? = '' THEN 0 
                        WHEN prev.DetailID IS NULL THEN 1 
                        ELSE 0 
                    END AS IsNewRow,

                    CASE 
                        WHEN prev.DetailID IS NOT NULL AND (
                            (cur.DES_BM IS NOT NULL AND prev.DES_BM IS NULL) OR
                            (cur.DES_BM IS NULL AND prev.DES_BM IS NOT NULL) OR
                            (cur.DES_BM <> prev.DES_BM)
                        ) THEN 1 
                        ELSE 0 
                    END AS Diff_DES_BM,

                    CASE 
                        WHEN prev.DetailID IS NOT NULL AND (
                            (cur.Go_DES IS NOT NULL AND prev.Go_DES IS NULL) OR
                            (cur.Go_DES IS NULL AND prev.Go_DES IS NOT NULL) OR
                            (cur.Go_DES <> prev.Go_DES)
                        ) THEN 1 
                        ELSE 0 
                    END AS Diff_Go_DES,

                    CASE 
                        WHEN prev.DetailID IS NOT NULL AND (
                            (cur.MFG_BM IS NOT NULL AND prev.MFG_BM IS NULL) OR
                            (cur.MFG_BM IS NULL AND prev.MFG_BM IS NOT NULL) OR
                            (cur.MFG_BM <> prev.MFG_BM)
                        ) THEN 1 
                        ELSE 0 
                    END AS Diff_MFG_BM

                FROM Tb_Master_DESBM_Detail cur WITH (NOLOCK)
                LEFT JOIN Tb_Master_DESBM_Detail prev WITH (NOLOCK)
                    ON prev.PlanHeaderID = ? 
                   AND prev.PROD = cur.PROD 
                   AND prev.P_Type = cur.P_Type
                   AND prev.DesType = cur.DesType
                WHERE cur.PlanHeaderID = ?
                ORDER BY cur.SeqNo ASC";

        $query = $db->query($sql, [$prevHeaderID, $prevHeaderID, $planHeaderID]);

        if (!$query) {
            return [];
        }

        return $query->result();
    }

    /**
     * สุ่มสร้าง PlanHeaderID: YYYY + PeriodCode(01/02) + Running(001)
     * เช่น 2026 + 01 + 001 = 202601001
     */
    public function generatePlanHeaderID($year, $period, &$db = null)
    {
        if ($db === null) {
            $db = $this->load->database($this->DDS, TRUE);
        }

        $year = trim((string)$year);
        $pCode = ($period === '04X-09C') ? '01' : '02';
        $prefix = $year . $pCode;

        $sql = "SELECT TOP 1 PlanHeaderID 
                FROM Tb_Master_DESBM_Header WITH (UPDLOCK, HOLDLOCK)
                WHERE PlanHeaderID LIKE ? 
                ORDER BY PlanHeaderID DESC";
        $query = $db->query($sql, [$prefix . '%']);
        $lastRow = ($query && $query->num_rows() > 0) ? $query->row() : null;

        if ($lastRow && !empty($lastRow->PlanHeaderID)) {
            $lastRun = (int)substr($lastRow->PlanHeaderID, -3);
            $nextRun = str_pad($lastRun + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $nextRun = '001';
        }

        return $prefix . $nextRun;
    }


    // ประมวลผล Plan ผ่าน Caching Working Days & Temp Table
    // public function processPlanMaster($year, $period, $desTypes, $userSession)
    // {
    //     $db = $this->load->database($this->DDS, TRUE);

    //     // ป้องกันช่องว่างและ format ปี
    //     $year = trim((string)$year);
    //     $period = trim((string)$period);
    //     $nextYear = (string)((int)$year + 1);

    //     // 1. ล้างข้อมูล Temp เก่าของ User Session นี้
    //     $db->where('UserSessionID', $userSession)->delete('Tb_Master_DESBM_Detail_temp');

    //     // 2. จัดการเงื่อนไข DesType Filter
    //     if (empty($desTypes) || !is_array($desTypes)) {
    //         $desTypes = ['N', 'T'];
    //     }
    //     $escapedDesTypes = array_map(function($item) use ($db) {
    //         return $db->escape(trim($item));
    //     }, $desTypes);
    //     $desTypeInClause = implode(',', $escapedDesTypes);

    //     // 3. คำนวณช่วงรหัส A2M01
    //     if ($period === '04X-09C') {
    //         $startA2M01 = $year . '041';
    //         $endA2M01   = $year . '096';
    //     } else {
    //         $startA2M01 = $year . '101';
    //         $endA2M01   = $nextYear . '036';
    //     }

    //     // 4. Query คำนวณ (ใส่ SET NOCOUNT ON;)  SQL
        
    //         $sql = " 
    //         SET NOCOUNT ON;

    //             IF OBJECT_ID('tempdb..#WorkingDays') IS NOT NULL DROP TABLE #WorkingDays;

    //             SELECT CalDate, DateStr, WorkSeq
    //             INTO #WorkingDays
    //             FROM V_WorkingDays;

    //             CREATE CLUSTERED INDEX IX_WorkSeq ON #WorkingDays(WorkSeq);
    //             CREATE NONCLUSTERED INDEX IX_CalDate ON #WorkingDays(CalDate);

    //             IF OBJECT_ID('tempdb..#CalConfig') IS NOT NULL DROP TABLE #CalConfig;

    //             SELECT 
    //                 TargetField COLLATE DATABASE_DEFAULT AS TargetField, 
    //                 P_Type      COLLATE DATABASE_DEFAULT AS P_Type, 
    //                 BaseField, 
    //                 BaseRowType, 
    //                 OffsetDays
    //             INTO #CalConfig
    //             FROM [dbo].[Tb_MS_Master_DESBM_Cal]
    //             WHERE IsActive = 1;

    //             DECLARE @PeriodMode VARCHAR(10)  = ?;
    //             DECLARE @StartA2M01 VARCHAR(7)   = ?;
    //             DECLARE @EndA2M01   VARCHAR(7)   = ?;
    //             DECLARE @CurYear    VARCHAR(4)   = ?;
    //             DECLARE @NxtYear    VARCHAR(4)   = ?;
    //             DECLARE @SessionID  VARCHAR(100) = ?;

    //             ;WITH RawPeriodSource AS (
    //                 SELECT 
    //                     CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) COLLATE DATABASE_DEFAULT AS A2M01,
    //                     CAST(A.A2M02 AS VARCHAR(10)) COLLATE DATABASE_DEFAULT AS A2M02,
    //                     CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)) COLLATE DATABASE_DEFAULT AS A2M03,

    //                     CASE 
    //                         WHEN A.A2M03 IS NULL OR CAST(A.A2M03 AS BIGINT) = 0 THEN NULL
    //                         ELSE CONVERT(SMALLDATETIME, CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)), 112)
    //                     END AS MFG_BM_Date,

    //                     SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) AS MonthPart,

    //                     CASE SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1)
    //                         WHEN '1' THEN 'X' WHEN '2' THEN 'A' WHEN '3' THEN 'Y'
    //                         WHEN '4' THEN 'B' WHEN '5' THEN 'Z' WHEN '6' THEN 'C'
    //                     END AS JunCode,

    //                     CASE 
    //                         WHEN SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) = '02' 
    //                             AND SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1) = '6' THEN
    //                             CONVERT(SMALLDATETIME, 
    //                                 SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) + '-02-' + 
    //                                 CASE 
    //                                     WHEN CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 4 = 0 
    //                                         AND (CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 100 <> 0 
    //                                             OR CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 400 = 0) 
    //                                     THEN '29' 
    //                                     ELSE '28' 
    //                                 END, 120)
    //                         ELSE
    //                             CONVERT(SMALLDATETIME, 
    //                                 SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) + '-' + 
    //                                 SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) + '-' + 
    //                                 CASE SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1)
    //                                     WHEN '1' THEN '05'
    //                                     WHEN '2' THEN '10'
    //                                     WHEN '3' THEN '15'
    //                                     WHEN '4' THEN '20'
    //                                     WHEN '5' THEN '25'
    //                                     WHEN '6' THEN '30'
    //                                 END, 120)
    //                     END AS ChangeJunTodate,

    //                     MAX(CAST(A.A2M02 AS VARCHAR(10))) OVER (
    //                         PARTITION BY CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7))
    //                     ) COLLATE DATABASE_DEFAULT AS Max_A2M02

    //                 FROM GG..AMECMFG.A002MP A
    //                 WHERE 
    //                     (@PeriodMode = '04X-09C' AND CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @StartA2M01 AND @EndA2M01)
    //                     OR
    //                     (@PeriodMode = '10X-03C' AND (
    //                         CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @CurYear + '101' AND @CurYear + '126'
    //                         OR CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @NxtYear + '011' AND @EndA2M01
    //                     ))
    //             ),
    //             FilteredByMasterDesType AS (
    //                 SELECT 
    //                     R.A2M01, 
    //                     R.A2M02 AS P_Display, 
    //                     R.A2M03, 
    //                     R.MFG_BM_Date,
    //                     R.MonthPart, 
    //                     R.JunCode, 
    //                     R.ChangeJunTodate,
    //                     M.DesType COLLATE DATABASE_DEFAULT AS DesType, 
    //                     M.P_Type  COLLATE DATABASE_DEFAULT AS P_Type, 
    //                     M.Seq AS DesTypeSeq
    //                 FROM RawPeriodSource R
    //                 INNER JOIN [dbo].[Tb_MS_Master_DESBM_DesType] M 
    //                     ON M.IsActive = 1
    //                     AND M.DesType COLLATE DATABASE_DEFAULT IN ({$desTypeInClause})
    //                     AND (
    //                         (M.P_Type COLLATE DATABASE_DEFAULT = 'last P' AND R.A2M02 = R.Max_A2M02 AND R.A2M02 <> 'P1')
    //                         OR
    //                         (M.P_Type COLLATE DATABASE_DEFAULT <> 'last P' AND R.A2M02 = M.P_Type COLLATE DATABASE_DEFAULT)
    //                     )
    //             ),
    //             BaseSequence AS (
    //                 SELECT 
    //                     F.*,
    //                     W.WorkSeq AS MFG_WorkSeq,
    //                     F.MonthPart + F.JunCode + F.DesType + SUBSTRING(F.A2M01, 1, 4) AS TypeJun,
    //                     SUBSTRING(F.A2M01, 1, 4) + F.MonthPart + F.JunCode + F.DesType AS PROD,
    //                     SUBSTRING(F.A2M01, 3, 2) + F.MonthPart + F.JunCode + F.DesType AS FormatAs400
    //                 FROM FilteredByMasterDesType F
    //                 OUTER APPLY (
    //                     SELECT TOP 1 WorkSeq FROM #WorkingDays WHERE CalDate <= F.MFG_BM_Date ORDER BY CalDate DESC
    //                 ) W
    //             ),
    //             CalculatedStep1 AS (
    //                 SELECT 
    //                     B.*,
    //                     B.MFG_WorkSeq + ISNULL(CFG_DES.OffsetDays, 0) AS DES_WorkSeq
    //                 FROM BaseSequence B
    //                 OUTER APPLY (
    //                     SELECT TOP 1 OffsetDays 
    //                     FROM #CalConfig 
    //                     WHERE TargetField = 'DES_BM' 
    //                     AND P_Type = B.P_Type COLLATE DATABASE_DEFAULT
    //                 ) CFG_DES
    //             ),
    //             CalculatedStep2 AS (
    //                 SELECT 
    //                     C1.*,
    //                     P1_Ref.DES_WorkSeq AS P1_DES_WorkSeq,
    //                     P1_Ref.MFG_WorkSeq AS P1_MFG_WorkSeq
    //                 FROM CalculatedStep1 C1
    //                 OUTER APPLY (
    //                     SELECT TOP 1 DES_WorkSeq, MFG_WorkSeq 
    //                     FROM CalculatedStep1 
    //                     WHERE A2M01 = C1.A2M01 AND DesType = 'N'
    //                 ) P1_Ref
    //             ),
    //             CalculatedFinalWorkSeq AS (
    //                 SELECT 
    //                     C.*,
    //                     -- Go-DES
    //                     CASE 
    //                         WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
    //                         ELSE C.P1_DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
    //                     END AS GODES_WorkSeq,

    //                     -- Confirm MELINA
    //                     CASE 
    //                         WHEN C.P_Type = 'P1' THEN (C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)) + ISNULL(CFG_MEL.OffsetDays, 4)
    //                         ELSE NULL 
    //                     END AS CONFIRM_WorkSeq,

    //                     -- MSE to MELINA
    //                     CASE 
    //                         WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_MSE.OffsetDays, 5)
    //                         ELSE NULL 
    //                     END AS MSE_WorkSeq,

    //                     -- SW Assembly
    //                     CASE 
    //                         WHEN C.P_Type = 'P1' THEN C.MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
    //                         ELSE C.P1_MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
    //                     END AS SW_WorkSeq,

    //                     -- Zero Level
    //                     C.DES_WorkSeq + ISNULL(CFG_0LV.OffsetDays, -2) AS ZEROLVL_WorkSeq,

    //                     -- 🟢 คำนวณเฉพาะภายในกลุ่ม DesType เดียวกัน
    //                     LAG(C.DES_WorkSeq) OVER (
    //                         PARTITION BY C.DesType 
    //                         ORDER BY C.A2M01, C.DesTypeSeq
    //                     ) AS Prev_DES_WorkSeq

    //                 FROM CalculatedStep2 C
    //                 OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Go_DES' AND P_Type = 'P1') CFG_GO_P1
    //                 OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Confirm_MELINA' AND P_Type = 'P1') CFG_MEL
    //                 OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'MSE_to_MELINA' AND P_Type = 'P1') CFG_MSE
    //                 OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'SW_Assembly' AND P_Type = 'P1') CFG_SW
    //                 OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Zero_Level_Check' AND P_Type = C.P_Type COLLATE DATABASE_DEFAULT) CFG_0LV
    //             )
    //             INSERT INTO [dbo].[Tb_Master_DESBM_Detail_temp] (
    //                 UserSessionID, PlanYear, PeriodCode, SeqNo, PROD, MFG_BM, P_Type,
    //                 DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
    //                 Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
    //                 SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
    //                 Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
    //                 TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES, DateCreated
    //             )
    //             SELECT 
    //                 @SessionID, @CurYear, @PeriodMode,
    //                 ROW_NUMBER() OVER (ORDER BY F.A2M01, F.DesTypeSeq) AS SeqNo,
    //                 F.PROD, F.MFG_BM_Date, F.P_Display,
                    
    //                 W_DES.CalDate, 
    //                 ABS(F.MFG_WorkSeq - F.DES_WorkSeq),
                    
    //                 W_GODES.CalDate, 
    //                 ABS(F.DES_WorkSeq - F.GODES_WorkSeq),
                    
    //                 W_CONFIRM.CalDate, 
    //                 CASE WHEN F.P_Type = 'P1' THEN ABS(F.CONFIRM_WorkSeq - F.GODES_WorkSeq) ELSE NULL END,
                    
    //                 W_MSE.CalDate, 
    //                 CASE WHEN F.P_Type = 'P1' THEN ABS(F.MSE_WorkSeq - F.DES_WorkSeq) ELSE NULL END,
                    
    //                 W_SW.CalDate, 
    //                 ABS(F.MFG_WorkSeq - F.SW_WorkSeq),
                    
    //                 W_0LVL.CalDate, 
    //                 ABS(F.DES_WorkSeq - F.ZEROLVL_WorkSeq),

    //                 -- 🟢 Design_working_day ของ DesType เดียวกัน
    //                 CASE 
    //                     WHEN F.Prev_DES_WorkSeq IS NOT NULL THEN ABS(F.DES_WorkSeq - F.Prev_DES_WorkSeq) + ISNULL(CFG_DWD.OffsetDays, -1)
    //                     ELSE NULL 
    //                 END AS Design_working_day,

    //                 -- LeadTime
    //                 CASE 
    //                     WHEN F.MFG_BM_Date IS NOT NULL AND W_GODES.CalDate IS NOT NULL 
    //                     THEN ISNULL(CFG_LT.OffsetDays, 50) + DATEDIFF(day, W_GODES.CalDate, F.MFG_BM_Date)
    //                     ELSE NULL 
    //                 END AS LeadTime,

    //                 -- Time_DESBM_to_MFGBM_2
    //                 CASE 
    //                     WHEN F.MFG_BM_Date IS NOT NULL AND W_DES.CalDate IS NOT NULL 
    //                     THEN DATEDIFF(day, W_DES.CalDate, F.MFG_BM_Date) + ISNULL(CFG_DES2.OffsetDays, 1)
    //                     ELSE NULL 
    //                 END AS Time_DESBM_to_MFGBM_2,
                    
    //                 F.TypeJun, F.ChangeJunTodate, F.DesType, F.FormatAs400,
    //                 '2030-04-15 00:00:00', NULL, GETDATE()
    //             FROM CalculatedFinalWorkSeq F
    //             OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Design_working_day') CFG_DWD
    //             OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'LeadTime') CFG_LT
    //             OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Time_DESBM_to_MFGBM_2') CFG_DES2
    //             LEFT JOIN #WorkingDays W_DES     ON W_DES.WorkSeq     = F.DES_WorkSeq
    //             LEFT JOIN #WorkingDays W_GODES   ON W_GODES.WorkSeq   = F.GODES_WorkSeq
    //             LEFT JOIN #WorkingDays W_CONFIRM ON W_CONFIRM.WorkSeq = F.CONFIRM_WorkSeq
    //             LEFT JOIN #WorkingDays W_MSE     ON W_MSE.WorkSeq     = F.MSE_WorkSeq
    //             LEFT JOIN #WorkingDays W_SW      ON W_SW.WorkSeq      = F.SW_WorkSeq
    //             LEFT JOIN #WorkingDays W_0LVL    ON W_0LVL.WorkSeq    = F.ZEROLVL_WorkSeq;
    //         ";

    //         $binds = [
    //         $period,
    //         $startA2M01,
    //         $endA2M01,
    //         $year,
    //         $nextYear,
    //         $userSession
    //     ];

    //     return $this->QuerySetBase($sql, $this->DDS, $binds);
    // }

   
}