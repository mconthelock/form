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
    public function DeleteDraftDesBM($planYear = null, $periodCode = null, $planHeaderID = null)
    {
        $db = $this->load->database($this->DDS, TRUE);
        
        // ตั้ง Lock Timeout 5 วินาที เพื่อไม่ให้ PHP ค้าง
        $db->query("SET LOCK_TIMEOUT 5000;");
        $db->trans_begin();

        try {
            if (!empty($planHeaderID)) {
                // 1. กรณีลบเฉพาะ ID ที่ระบุ (ต้องเป็นสถานะ DRAFT)
                $header = $db->select('PlanHeaderID')
                            ->where('PlanHeaderID', (int)$planHeaderID)
                            ->where('UPPER(Status)', 'DRAFT')
                            ->get('Tb_Master_DESBM_Header')
                            ->row();

                if ($header) {
                    $db->where('PlanHeaderID', (int)$header->PlanHeaderID)->delete('Tb_Master_DESBM_Detail');
                    $db->where('PlanHeaderID', (int)$header->PlanHeaderID)->delete('Tb_Master_DESBM_Header');
                }
            } elseif (!empty($planYear) && !empty($periodCode)) {
                // 2. กรณีลบ Draft ทั้งหมดตาม Year + Period (ใช้ $db->get ตัวเดิม ไม่ใช้ QuerySetBase)
                $oldDrafts = $db->select('PlanHeaderID')
                                ->where('PlanYear', (string)$planYear)
                                ->where('PeriodCode', (string)$periodCode)
                                ->where('UPPER(Status)', 'DRAFT')
                                ->get('Tb_Master_DESBM_Header')
                                ->result();

                if (!empty($oldDrafts)) {
                    $headerIDs = array_column($oldDrafts, 'PlanHeaderID');

                    // ลบแบบ Where In รวดเดียว ไม่ต้องวน Loop
                    $db->where_in('PlanHeaderID', $headerIDs)->delete('Tb_Master_DESBM_Detail');
                    $db->where_in('PlanHeaderID', $headerIDs)->delete('Tb_Master_DESBM_Header');
                }
            }

            if ($db->trans_status() === FALSE) {
                $db->trans_rollback();
                return false;
            }

            $db->trans_commit();
            return true;

        } catch (\Throwable $e) {
            $db->trans_rollback();
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

    // ประมวลผล Plan ผ่าน Caching Working Days & Temp Table
    public function processPlanMaster($year, $period, $desTypes, $userSession)
    {
        $db = $this->load->database($this->DDS, TRUE);

        // ป้องกันช่องว่างและ format ปี
        $year = trim((string)$year);
        $period = trim((string)$period);
        $nextYear = (string)((int)$year + 1);

        // 1. ล้างข้อมูล Temp เก่าของ User Session นี้
        $db->where('UserSessionID', $userSession)->delete('Tb_Master_DESBM_Detail_temp');

        // 2. จัดการเงื่อนไข DesType Filter
        if (empty($desTypes) || !is_array($desTypes)) {
            $desTypes = ['N', 'T'];
        }
        $escapedDesTypes = array_map(function($item) use ($db) {
            return $db->escape(trim($item));
        }, $desTypes);
        $desTypeInClause = implode(',', $escapedDesTypes);

        // 3. คำนวณช่วงรหัส A2M01
        if ($period === '04X-09C') {
            $startA2M01 = $year . '041';
            $endA2M01   = $year . '096';
        } else {
            $startA2M01 = $year . '101';
            $endA2M01   = $nextYear . '036';
        }

        // 4. Query คำนวณ (ใส่ SET NOCOUNT ON;)  SQL
        
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

                DECLARE @PeriodMode VARCHAR(10)  = ?;
                DECLARE @StartA2M01 VARCHAR(7)   = ?;
                DECLARE @EndA2M01   VARCHAR(7)   = ?;
                DECLARE @CurYear    VARCHAR(4)   = ?;
                DECLARE @NxtYear    VARCHAR(4)   = ?;
                DECLARE @SessionID  VARCHAR(100) = ?;

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
                        -- Go-DES
                        CASE 
                            WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
                            ELSE C.P1_DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
                        END AS GODES_WorkSeq,

                        -- Confirm MELINA
                        CASE 
                            WHEN C.P_Type = 'P1' THEN (C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)) + ISNULL(CFG_MEL.OffsetDays, 4)
                            ELSE NULL 
                        END AS CONFIRM_WorkSeq,

                        -- MSE to MELINA
                        CASE 
                            WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_MSE.OffsetDays, 5)
                            ELSE NULL 
                        END AS MSE_WorkSeq,

                        -- SW Assembly
                        CASE 
                            WHEN C.P_Type = 'P1' THEN C.MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
                            ELSE C.P1_MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
                        END AS SW_WorkSeq,

                        -- Zero Level
                        C.DES_WorkSeq + ISNULL(CFG_0LV.OffsetDays, -2) AS ZEROLVL_WorkSeq,

                        -- 🟢 คำนวณเฉพาะภายในกลุ่ม DesType เดียวกัน
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
                INSERT INTO [dbo].[Tb_Master_DESBM_Detail_temp] (
                    UserSessionID, PlanYear, PeriodCode, SeqNo, PROD, MFG_BM, P_Type,
                    DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                    Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                    SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                    Design_working_day, LeadTime, Time_DESBM_to_MFGBM_2,
                    TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES, DateCreated
                )
                SELECT 
                    @SessionID, @CurYear, @PeriodMode,
                    ROW_NUMBER() OVER (ORDER BY F.A2M01, F.DesTypeSeq) AS SeqNo,
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

                    -- 🟢 Design_working_day ของ DesType เดียวกัน
                    CASE 
                        WHEN F.Prev_DES_WorkSeq IS NOT NULL THEN ABS(F.DES_WorkSeq - F.Prev_DES_WorkSeq) + ISNULL(CFG_DWD.OffsetDays, -1)
                        ELSE NULL 
                    END AS Design_working_day,

                    -- LeadTime
                    CASE 
                        WHEN F.MFG_BM_Date IS NOT NULL AND W_GODES.CalDate IS NOT NULL 
                        THEN ISNULL(CFG_LT.OffsetDays, 50) + DATEDIFF(day, W_GODES.CalDate, F.MFG_BM_Date)
                        ELSE NULL 
                    END AS LeadTime,

                    -- Time_DESBM_to_MFGBM_2
                    CASE 
                        WHEN F.MFG_BM_Date IS NOT NULL AND W_DES.CalDate IS NOT NULL 
                        THEN DATEDIFF(day, W_DES.CalDate, F.MFG_BM_Date) + ISNULL(CFG_DES2.OffsetDays, 1)
                        ELSE NULL 
                    END AS Time_DESBM_to_MFGBM_2,
                    
                    F.TypeJun, F.ChangeJunTodate, F.DesType, F.FormatAs400,
                    '2030-04-15 00:00:00', NULL, GETDATE()
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
            $userSession
        ];

        return $this->QuerySetBase($sql, $this->DDS, $binds);
    }

   
}