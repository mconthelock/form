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

    // ประมวลผล Plan ผ่าน Caching Working Days & Temp Table
    public function processPlanMaster($year, $period, $desTypes, $userSession)
    {
        $db = $this->load->database($this->DDS, TRUE);

        // 1. ล้างข้อมูล Temp เก่าของ User Session นี้
        $db->where('UserSessionID', $userSession)->delete('Tb_Master_DESBM_Detail_temp');

        // 2. จัดการเงื่อนไข DesType Filter (ถ้าไม่เลือกให้ Default เป็น N, T)
        if (empty($desTypes) || !is_array($desTypes)) {
            $desTypes = ['N', 'T'];
        }
        // แปลง Array ของ DesType เป็น SQL IN Statement ที่ปลอดภัย เช่น ('N', 'T')
        $escapedDesTypes = array_map(function($item) use ($db) {
            return $db->escape($item);
        }, $desTypes);
        $desTypeInClause = implode(',', $escapedDesTypes);

        // 3. คำนวณช่วงรหัส A2M01 ล่วงหน้าฝั่ง PHP เพื่อลด Placeholder ซ้ำซ้อน
        $nextYear = (string)((int)$year + 1);
        if ($period === '04X-09C') {
            $startA2M01 = $year . '041';
            $endA2M01   = $year . '096';
        } else {
            $startA2M01 = $year . '101';
            $endA2M01   = $nextYear . '036';
        }

        // 4. Query สำหรับคำนวณและ Insert ข้อมูลลง Temp Table
        $sql = "
            IF OBJECT_ID('tempdb..#WorkingDays') IS NOT NULL DROP TABLE #WorkingDays;

            SELECT CalDate, DateStr, WorkSeq
            INTO #WorkingDays
            FROM dbo.V_WorkingDays;

            CREATE CLUSTERED INDEX IX_WorkSeq ON #WorkingDays(WorkSeq);
            CREATE NONCLUSTERED INDEX IX_CalDate ON #WorkingDays(CalDate);

            IF OBJECT_ID('tempdb..#CalConfig') IS NOT NULL DROP TABLE #CalConfig;

            SELECT TargetField, P_Type, BaseField, BaseRowType, OffsetDays
            INTO #CalConfig
            FROM [dbo].[Tb_MS_Master_DESBM_Cal]
            WHERE IsActive = 1;

            DECLARE @PeriodMode VARCHAR(10) = ?;
            DECLARE @StartA2M01 VARCHAR(7)  = ?;
            DECLARE @EndA2M01   VARCHAR(7)  = ?;
            DECLARE @CurYear    VARCHAR(4)  = ?;
            DECLARE @NxtYear    VARCHAR(4)  = ?;
            DECLARE @SessionID  VARCHAR(100)= ?;

            ;WITH RawPeriodSource AS (
                SELECT 
                    A.A2M01, A.A2M02, A.A2M03,
                    CONVERT(SMALLDATETIME, CAST(A.A2M03 AS VARCHAR(8)), 112) AS MFG_BM_Date,
                    SUBSTRING(A.A2M01, 5, 2) AS MonthPart,
                    CASE SUBSTRING(A.A2M01, 7, 1)
                        WHEN '1' THEN 'X' WHEN '2' THEN 'A' WHEN '3' THEN 'Y'
                        WHEN '4' THEN 'B' WHEN '5' THEN 'Z' WHEN '6' THEN 'C'
                    END AS JunCode,
                    CONVERT(SMALLDATETIME, 
                        SUBSTRING(A.A2M01, 1, 4) + '-' + SUBSTRING(A.A2M01, 5, 2) + '-' + 
                        CASE SUBSTRING(A.A2M01, 7, 1)
                            WHEN '1' THEN '05' WHEN '2' THEN '10' WHEN '3' THEN '15'
                            WHEN '4' THEN '20' WHEN '5' THEN '25' WHEN '6' THEN '30'
                        END, 120) AS ChangeJunTodate,
                    MAX(A.A2M02) OVER (PARTITION BY A.A2M01) AS Max_A2M02
                FROM [dbo].[RTNLIBF_A002MP] A
                WHERE 
                    (@PeriodMode = '04X-09C' AND A.A2M01 BETWEEN @StartA2M01 AND @EndA2M01)
                    OR
                    (@PeriodMode = '10X-03C' AND (
                        A.A2M01 BETWEEN @CurYear + '101' AND @CurYear + '126'
                        OR A.A2M01 BETWEEN @NxtYear + '011' AND @EndA2M01
                    ))
            ),
            FilteredByMasterDesType AS (
                SELECT 
                    R.A2M01, R.A2M02 AS P_Display, R.A2M03, R.MFG_BM_Date,
                    R.MonthPart, R.JunCode, R.ChangeJunTodate,
                    M.DesType, M.P_Type, M.Seq AS DesTypeSeq
                FROM RawPeriodSource R
                INNER JOIN [dbo].[Tb_MS_Master_DESBM_DesType] M 
                    ON M.IsActive = 1
                    AND M.DesType IN ({$desTypeInClause})
                    AND (
                        (M.P_Type = 'last P' AND R.A2M02 = R.Max_A2M02 AND R.A2M02 <> 'P1')
                        OR
                        (M.P_Type <> 'last P' AND R.A2M02 = M.P_Type)
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
                    SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'DES_BM' AND P_Type = B.P_Type
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
            )
            INSERT INTO [dbo].[Tb_Master_DESBM_Detail_temp] (
                UserSessionID, PlanYear, PeriodCode, SeqNo, PROD, MFG_BM, P_Type,
                DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
                Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
                SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
                TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES, DateCreated
            )
            SELECT 
                @SessionID, @CurYear, @PeriodMode,
                ROW_NUMBER() OVER (ORDER BY C.A2M01, C.DesTypeSeq) AS SeqNo,
                C.PROD, C.MFG_BM_Date, C.P_Display,
                W_DES.CalDate, ABS(C.MFG_WorkSeq - C.DES_WorkSeq),
                W_GODES.CalDate, ABS(C.DES_WorkSeq - (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12))),
                CASE WHEN C.P_Type = 'P1' THEN W_CONFIRM.CalDate ELSE NULL END,
                CASE WHEN C.P_Type = 'P1' THEN ABS(ISNULL(CFG_MEL.OffsetDays, 4)) ELSE NULL END,
                CASE WHEN C.P_Type = 'P1' THEN W_MSE.CalDate ELSE NULL END,
                CASE WHEN C.P_Type = 'P1' THEN ABS(ISNULL(CFG_MSE.OffsetDays, 5)) ELSE NULL END,
                W_SW.CalDate, ABS(ISNULL(CFG_SW.OffsetDays, 5)),
                W_0LVL.CalDate, ABS(ISNULL(CFG_0LV.OffsetDays, -2)),
                C.TypeJun, C.ChangeJunTodate, C.DesType, C.FormatAs400,
                '2030-04-15 00:00:00', NULL, GETDATE()
            FROM CalculatedStep2 C
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Go_DES' AND P_Type = 'P1') CFG_GO
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Confirm_MELINA' AND P_Type = 'P1') CFG_MEL
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'MSE_to_MELINA' AND P_Type = 'P1') CFG_MSE
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'SW_Assembly' AND P_Type = 'P1') CFG_SW
            OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Zero_Level_Check' AND P_Type = C.P_Type) CFG_0LV
            LEFT JOIN #WorkingDays W_DES     ON W_DES.WorkSeq     = C.DES_WorkSeq
            LEFT JOIN #WorkingDays W_GODES   ON W_GODES.WorkSeq   = (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12))
            LEFT JOIN #WorkingDays W_CONFIRM ON W_CONFIRM.WorkSeq = (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12) + ISNULL(CFG_MEL.OffsetDays, 4))
            LEFT JOIN #WorkingDays W_MSE     ON W_MSE.WorkSeq     = (C.P1_DES_WorkSeq + ISNULL(CFG_MSE.OffsetDays, 5))
            LEFT JOIN #WorkingDays W_SW      ON W_SW.WorkSeq      = (C.P1_MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5))
            LEFT JOIN #WorkingDays W_0LVL    ON W_0LVL.WorkSeq    = (C.DES_WorkSeq + ISNULL(CFG_0LV.OffsetDays, -2));
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