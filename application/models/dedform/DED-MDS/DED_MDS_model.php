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
        // $sql = "
        //     SET NOCOUNT ON;

        //     IF OBJECT_ID('tempdb..#CalConfig') IS NOT NULL DROP TABLE #CalConfig;

        //     SELECT TargetField, P_Type, BaseField, BaseRowType, OffsetDays
        //     INTO #CalConfig
        //     FROM [dbo].[Tb_MS_Master_DESBM_Cal]
        //     WHERE IsActive = 1;

        //     DECLARE @PeriodMode VARCHAR(10)  = ?;
        //     DECLARE @StartA2M01 VARCHAR(7)   = ?;
        //     DECLARE @EndA2M01   VARCHAR(7)   = ?;
        //     DECLARE @CurYear    VARCHAR(4)   = ?;
        //     DECLARE @NxtYear    VARCHAR(4)   = ?;
        //     DECLARE @SessionID  VARCHAR(100) = ?;

        //     -- 1. กำหนดช่วงวันที่ทำงาน (Start Date - End Date) ครอบคลุม Year ถึง Next Year
        //     -- เผื่อถอยหลัง 3 เดือน และเผื่อไปข้างหน้าอีก 6 เดือนหลังสิ้นปี Next Year เพื่อรองรับ Offset Days
        //     DECLARE @WorkStartDate DATETIME = CAST(@CurYear + '-01-01' AS DATETIME);
        //     DECLARE @WorkEndDate   DATETIME = CAST(CAST(CAST(@NxtYear AS INT) + 1 AS VARCHAR(4)) + '-06-30' AS DATETIME);

        //     -- 2. สร้าง Temp Table #WorkingDays กรองเฉพาะช่วงเวลาที่ต้องการ
        //     IF OBJECT_ID('tempdb..#WorkingDays') IS NOT NULL DROP TABLE #WorkingDays;

        //     SELECT CalDate, DateStr, WorkSeq
        //     INTO #WorkingDays
        //     FROM dbo.V_WorkingDays
        //     WHERE CalDate >= @WorkStartDate AND CalDate <= @WorkEndDate;
            
        //     CREATE CLUSTERED INDEX IX_WorkSeq ON #WorkingDays(WorkSeq);
        //     CREATE NONCLUSTERED INDEX IX_CalDate ON #WorkingDays(CalDate);
            
        //     ;WITH RawPeriodSource AS (
        //         SELECT 
        //             A.A2M01, A.A2M02, A.A2M03,
        //             CONVERT(SMALLDATETIME, CAST(A.A2M03 AS VARCHAR(8)), 112) AS MFG_BM_Date,
        //             SUBSTRING(A.A2M01, 5, 2) AS MonthPart,
        //             CASE SUBSTRING(A.A2M01, 7, 1)
        //                 WHEN '1' THEN 'X' WHEN '2' THEN 'A' WHEN '3' THEN 'Y'
        //                 WHEN '4' THEN 'B' WHEN '5' THEN 'Z' WHEN '6' THEN 'C'
        //             END AS JunCode,
        //             CASE 
        //                 -- กรณีเดือนกุมภาพันธ์ รหัส 6 (C) ให้ใช้วันสิ้นเดือนกุมภาพันธ์
        //                 WHEN SUBSTRING(A.A2M01, 5, 2) = '02' AND SUBSTRING(A.A2M01, 7, 1) = '6' THEN
        //                     CONVERT(SMALLDATETIME, SUBSTRING(A.A2M01, 1, 4) + '-02-' + 
        //                         CASE 
        //                             -- เช็คปีอธิกสุรทิน (Leap Year) ถ้าหาร 4 ลงตัวเป็น 29 ถ้าไม่เป็น 28
        //                             WHEN CAST(SUBSTRING(A.A2M01, 1, 4) AS INT) % 4 = 0 AND (CAST(SUBSTRING(A.A2M01, 1, 4) AS INT) % 100 <> 0 OR CAST(SUBSTRING(A.A2M01, 1, 4) AS INT) % 400 = 0) 
        //                             THEN '29' 
        //                             ELSE '28' 
        //                         END, 120)
        //                 ELSE
        //                     CONVERT(SMALLDATETIME, 
        //                         SUBSTRING(A.A2M01, 1, 4) + '-' + SUBSTRING(A.A2M01, 5, 2) + '-' + 
        //                         CASE SUBSTRING(A.A2M01, 7, 1)
        //                             WHEN '1' THEN '05' 
        //                             WHEN '2' THEN '10' 
        //                             WHEN '3' THEN '15'
        //                             WHEN '4' THEN '20' 
        //                             WHEN '5' THEN '25' 
        //                             WHEN '6' THEN '30'
        //                         END, 120)
        //             END AS ChangeJunTodate,
        //             MAX(A.A2M02) OVER (PARTITION BY A.A2M01) AS Max_A2M02
        //         FROM [dbo].[RTNLIBF_A002MP] A
        //         WHERE 
        //             (@PeriodMode = '04X-09C' AND A.A2M01 BETWEEN @StartA2M01 AND @EndA2M01)
        //             OR
        //             (@PeriodMode = '10X-03C' AND (
        //                 A.A2M01 BETWEEN @CurYear + '101' AND @CurYear + '126'
        //                 OR A.A2M01 BETWEEN @NxtYear + '011' AND @EndA2M01
        //             ))
        //     ),
        //     FilteredByMasterDesType AS (
        //         SELECT 
        //             R.A2M01, R.A2M02 AS P_Display, R.A2M03, R.MFG_BM_Date,
        //             R.MonthPart, R.JunCode, R.ChangeJunTodate,
        //             M.DesType, M.P_Type, M.Seq AS DesTypeSeq
        //         FROM RawPeriodSource R
        //         INNER JOIN [dbo].[Tb_MS_Master_DESBM_DesType] M 
        //             ON M.IsActive = 1
        //             AND M.DesType IN ({$desTypeInClause})
        //             AND (
        //                 (M.P_Type = 'last P' AND R.A2M02 = R.Max_A2M02 AND R.A2M02 <> 'P1')
        //                 OR
        //                 (M.P_Type <> 'last P' AND R.A2M02 = M.P_Type)
        //             )
        //     ),
        //     BaseSequence AS (
        //         SELECT 
        //             F.*,
        //             W.WorkSeq AS MFG_WorkSeq,
        //             F.MonthPart + F.JunCode + F.DesType + SUBSTRING(F.A2M01, 1, 4) AS TypeJun,
        //             SUBSTRING(F.A2M01, 1, 4) + F.MonthPart + F.JunCode + F.DesType AS PROD,
        //             SUBSTRING(F.A2M01, 3, 2) + F.MonthPart + F.JunCode + F.DesType AS FormatAs400
        //         FROM FilteredByMasterDesType F
        //         OUTER APPLY (
        //             SELECT TOP 1 WorkSeq FROM #WorkingDays WHERE CalDate <= F.MFG_BM_Date ORDER BY CalDate DESC
        //         ) W
        //     ),
        //     CalculatedStep1 AS (
        //         SELECT 
        //             B.*,
        //             B.MFG_WorkSeq + ISNULL(CFG_DES.OffsetDays, 0) AS DES_WorkSeq
        //         FROM BaseSequence B
        //         OUTER APPLY (
        //             SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'DES_BM' AND P_Type = B.P_Type
        //         ) CFG_DES
        //     ),
        //     CalculatedStep2 AS (
        //         SELECT 
        //             C1.*,
        //             P1_Ref.DES_WorkSeq AS P1_DES_WorkSeq,
        //             P1_Ref.MFG_WorkSeq AS P1_MFG_WorkSeq
        //         FROM CalculatedStep1 C1
        //         OUTER APPLY (
        //             SELECT TOP 1 DES_WorkSeq, MFG_WorkSeq 
        //             FROM CalculatedStep1 
        //             WHERE A2M01 = C1.A2M01 AND DesType = 'N'
        //         ) P1_Ref
        //     )
        //     INSERT INTO [dbo].[Tb_Master_DESBM_Detail_temp] (
        //         UserSessionID, PlanYear, PeriodCode, SeqNo, PROD, MFG_BM, P_Type,
        //         DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
        //         Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
        //         SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
        //         TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES, DateCreated
        //     )
        //     SELECT 
        //         @SessionID, @CurYear, @PeriodMode,
        //         ROW_NUMBER() OVER (ORDER BY C.A2M01, C.DesTypeSeq) AS SeqNo,
        //         C.PROD, C.MFG_BM_Date, C.P_Display,
        //         W_DES.CalDate, ABS(C.MFG_WorkSeq - C.DES_WorkSeq),
        //         W_GODES.CalDate, ABS(C.DES_WorkSeq - (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12))),
        //         CASE WHEN C.P_Type = 'P1' THEN W_CONFIRM.CalDate ELSE NULL END,
        //         CASE WHEN C.P_Type = 'P1' THEN ABS(ISNULL(CFG_MEL.OffsetDays, 4)) ELSE NULL END,
        //         CASE WHEN C.P_Type = 'P1' THEN W_MSE.CalDate ELSE NULL END,
        //         CASE WHEN C.P_Type = 'P1' THEN ABS(ISNULL(CFG_MSE.OffsetDays, 5)) ELSE NULL END,
        //         W_SW.CalDate, ABS(ISNULL(CFG_SW.OffsetDays, 5)),
        //         W_0LVL.CalDate, ABS(ISNULL(CFG_0LV.OffsetDays, -2)),
        //         C.TypeJun, C.ChangeJunTodate, C.DesType, C.FormatAs400,
        //         '2030-04-15 00:00:00', NULL, GETDATE()
        //     FROM CalculatedStep2 C
        //     OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Go_DES' AND P_Type = 'P1') CFG_GO
        //     OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Confirm_MELINA' AND P_Type = 'P1') CFG_MEL
        //     OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'MSE_to_MELINA' AND P_Type = 'P1') CFG_MSE
        //     OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'SW_Assembly' AND P_Type = 'P1') CFG_SW
        //     OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Zero_Level_Check' AND P_Type = C.P_Type) CFG_0LV
        //     LEFT JOIN #WorkingDays W_DES     ON W_DES.WorkSeq     = C.DES_WorkSeq
        //     LEFT JOIN #WorkingDays W_GODES   ON W_GODES.WorkSeq   = (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12))
        //     LEFT JOIN #WorkingDays W_CONFIRM ON W_CONFIRM.WorkSeq = (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12) + ISNULL(CFG_MEL.OffsetDays, 4))
        //     LEFT JOIN #WorkingDays W_MSE     ON W_MSE.WorkSeq     = (C.P1_DES_WorkSeq + ISNULL(CFG_MSE.OffsetDays, 5))
        //     LEFT JOIN #WorkingDays W_SW      ON W_SW.WorkSeq      = (C.P1_MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5))
        //     LEFT JOIN #WorkingDays W_0LVL    ON W_0LVL.WorkSeq    = (C.DES_WorkSeq + ISNULL(CFG_0LV.OffsetDays, -2));
        // ";

        // $sql = "
        //         SET NOCOUNT ON;

        //         IF OBJECT_ID('tempdb..#WorkingDays') IS NOT NULL DROP TABLE #WorkingDays;

        //         SELECT CalDate, DateStr, WorkSeq
        //         INTO #WorkingDays
        //         FROM dbo.V_WorkingDays;

        //         CREATE CLUSTERED INDEX IX_WorkSeq ON #WorkingDays(WorkSeq);
        //         CREATE NONCLUSTERED INDEX IX_CalDate ON #WorkingDays(CalDate);

        //         IF OBJECT_ID('tempdb..#CalConfig') IS NOT NULL DROP TABLE #CalConfig;

        //         SELECT 
        //             TargetField COLLATE DATABASE_DEFAULT AS TargetField, 
        //             P_Type      COLLATE DATABASE_DEFAULT AS P_Type, 
        //             BaseField, 
        //             BaseRowType, 
        //             OffsetDays
        //         INTO #CalConfig
        //         FROM [dbo].[Tb_MS_Master_DESBM_Cal]
        //         WHERE IsActive = 1;

        //         DECLARE @PeriodMode VARCHAR(10)  = ?;
        //         DECLARE @StartA2M01 VARCHAR(7)   = ?;
        //         DECLARE @EndA2M01   VARCHAR(7)   = ?;
        //         DECLARE @CurYear    VARCHAR(4)   = ?;
        //         DECLARE @NxtYear    VARCHAR(4)   = ?;
        //         DECLARE @SessionID  VARCHAR(100) = ?;

        //         ;WITH RawPeriodSource AS (
        //             SELECT 
        //                 -- 1. ตัดทศนิยมของ A2M01 และใส่ Collation
        //                 CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) COLLATE DATABASE_DEFAULT AS A2M01,
        //                 CAST(A.A2M02 AS VARCHAR(10)) COLLATE DATABASE_DEFAULT AS A2M02,
        //                 CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)) COLLATE DATABASE_DEFAULT AS A2M03,

        //                 -- 2. แปลง A2M03 เป็นวันที่ (ตัดทศนิยมผ่าน BIGINT ก่อน และดักกรณีค่าว่าง/0)
        //                 CASE 
        //                     WHEN A.A2M03 IS NULL OR CAST(A.A2M03 AS BIGINT) = 0 THEN NULL
        //                     ELSE CONVERT(SMALLDATETIME, CAST(CAST(A.A2M03 AS BIGINT) AS VARCHAR(8)), 112)
        //                 END AS MFG_BM_Date,

        //                 -- 3. แยกเดือน
        //                 SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) AS MonthPart,

        //                 -- 4. แปลงรหัส Jun
        //                 CASE SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1)
        //                     WHEN '1' THEN 'X'
        //                     WHEN '2' THEN 'A'
        //                     WHEN '3' THEN 'Y'
        //                     WHEN '4' THEN 'B'
        //                     WHEN '5' THEN 'Z'
        //                     WHEN '6' THEN 'C'
        //                 END AS JunCode,

        //                 -- 5. ChangeJunTodate (ดักกรณีเดือน 02 รหัส 6 เพื่อไม่ให้เกิด 30 กุมภาพันธ์)
        //                 CASE 
        //                     WHEN SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) = '02' 
        //                         AND SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1) = '6' THEN
        //                         CONVERT(SMALLDATETIME, 
        //                             SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) + '-02-' + 
        //                             CASE 
        //                                 -- ตรวจสอบปีอธิกสุรทิน (Leap Year)
        //                                 WHEN CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 4 = 0 
        //                                     AND (CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 100 <> 0 
        //                                         OR CAST(SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) AS INT) % 400 = 0) 
        //                                 THEN '29' 
        //                                 ELSE '28' 
        //                             END, 120)
        //                     ELSE
        //                         CONVERT(SMALLDATETIME, 
        //                             SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 1, 4) + '-' + 
        //                             SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 5, 2) + '-' + 
        //                             CASE SUBSTRING(CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)), 7, 1)
        //                                 WHEN '1' THEN '05'
        //                                 WHEN '2' THEN '10'
        //                                 WHEN '3' THEN '15'
        //                                 WHEN '4' THEN '20'
        //                                 WHEN '5' THEN '25'
        //                                 WHEN '6' THEN '30'
        //                             END, 120)
        //                 END AS ChangeJunTodate,

        //                 -- 6. หา Max P ของแต่ละ Jun
        //                 MAX(CAST(A.A2M02 AS VARCHAR(10))) OVER (
        //                     PARTITION BY CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7))
        //                 ) COLLATE DATABASE_DEFAULT AS Max_A2M02

        //             FROM GG..AMECMFG.A002MP A
        //             WHERE 
        //                 (@PeriodMode = '04X-09C' AND CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @StartA2M01 AND @EndA2M01)
        //                 OR
        //                 (@PeriodMode = '10X-03C' AND (
        //                     CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @CurYear + '101' AND @CurYear + '126'
        //                     OR CAST(CAST(A.A2M01 AS BIGINT) AS VARCHAR(7)) BETWEEN @NxtYear + '011' AND @EndA2M01
        //                 ))
        //         ),
        //         FilteredByMasterDesType AS (
        //             SELECT 
        //                 R.A2M01, 
        //                 R.A2M02 AS P_Display, 
        //                 R.A2M03, 
        //                 R.MFG_BM_Date,
        //                 R.MonthPart, 
        //                 R.JunCode, 
        //                 R.ChangeJunTodate,
        //                 M.DesType COLLATE DATABASE_DEFAULT AS DesType, 
        //                 M.P_Type  COLLATE DATABASE_DEFAULT AS P_Type, 
        //                 M.Seq AS DesTypeSeq
        //             FROM RawPeriodSource R
        //             INNER JOIN [dbo].[Tb_MS_Master_DESBM_DesType] M 
        //                 ON M.IsActive = 1
        //                 AND M.DesType COLLATE DATABASE_DEFAULT IN ({$desTypeInClause})
        //                 AND (
        //                     (M.P_Type COLLATE DATABASE_DEFAULT = 'last P' AND R.A2M02 = R.Max_A2M02 AND R.A2M02 <> 'P1')
        //                     OR
        //                     (M.P_Type COLLATE DATABASE_DEFAULT <> 'last P' AND R.A2M02 = M.P_Type COLLATE DATABASE_DEFAULT)
        //                 )
        //         ),
        //         BaseSequence AS (
        //             SELECT 
        //                 F.*,
        //                 W.WorkSeq AS MFG_WorkSeq,
        //                 F.MonthPart + F.JunCode + F.DesType + SUBSTRING(F.A2M01, 1, 4) AS TypeJun,
        //                 SUBSTRING(F.A2M01, 1, 4) + F.MonthPart + F.JunCode + F.DesType AS PROD,
        //                 SUBSTRING(F.A2M01, 3, 2) + F.MonthPart + F.JunCode + F.DesType AS FormatAs400
        //             FROM FilteredByMasterDesType F
        //             OUTER APPLY (
        //                 SELECT TOP 1 WorkSeq FROM #WorkingDays WHERE CalDate <= F.MFG_BM_Date ORDER BY CalDate DESC
        //             ) W
        //         ),
        //         CalculatedStep1 AS (
        //             SELECT 
        //                 B.*,
        //                 B.MFG_WorkSeq + ISNULL(CFG_DES.OffsetDays, 0) AS DES_WorkSeq
        //             FROM BaseSequence B
        //             OUTER APPLY (
        //                 SELECT TOP 1 OffsetDays 
        //                 FROM #CalConfig 
        //                 WHERE TargetField = 'DES_BM' 
        //                 AND P_Type = B.P_Type COLLATE DATABASE_DEFAULT
        //             ) CFG_DES
        //         ),
        //         CalculatedStep2 AS (
        //             SELECT 
        //                 C1.*,
        //                 P1_Ref.DES_WorkSeq AS P1_DES_WorkSeq,
        //                 P1_Ref.MFG_WorkSeq AS P1_MFG_WorkSeq
        //             FROM CalculatedStep1 C1
        //             OUTER APPLY (
        //                 SELECT TOP 1 DES_WorkSeq, MFG_WorkSeq 
        //                 FROM CalculatedStep1 
        //                 WHERE A2M01 = C1.A2M01 AND DesType = 'N'
        //             ) P1_Ref
        //         )
        //         INSERT INTO [dbo].[Tb_Master_DESBM_Detail_temp] (
        //             UserSessionID, PlanYear, PeriodCode, SeqNo, PROD, MFG_BM, P_Type,
        //             DES_BM, Time_DESBM_to_MFGBM, Go_DES, Time_GoDES_to_DESBM,
        //             Confirm_MELINA_Portion, Time_Confirm_Melina, MSE_to_MELINA, Time_MSE_to_MELINA,
        //             SW_Assembly, Time_SW_Assembly, Zero_Level_Check_Temp_DWG, Time_Zero_Level,
        //             TypeJun, ChangeJunTodate, DesType, FormatAs400, BeforeEditDesBMDate, MARIssueDES, DateCreated
        //         )
        //         SELECT 
        //             @SessionID, @CurYear, @PeriodMode,
        //             ROW_NUMBER() OVER (ORDER BY C.A2M01, C.DesTypeSeq) AS SeqNo,
        //             C.PROD, C.MFG_BM_Date, C.P_Display,
        //             W_DES.CalDate, ABS(C.MFG_WorkSeq - C.DES_WorkSeq),
        //             W_GODES.CalDate, ABS(C.DES_WorkSeq - (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12))),
        //             CASE WHEN C.P_Type = 'P1' THEN W_CONFIRM.CalDate ELSE NULL END,
        //             CASE WHEN C.P_Type = 'P1' THEN ABS(ISNULL(CFG_MEL.OffsetDays, 4)) ELSE NULL END,
        //             CASE WHEN C.P_Type = 'P1' THEN W_MSE.CalDate ELSE NULL END,
        //             CASE WHEN C.P_Type = 'P1' THEN ABS(ISNULL(CFG_MSE.OffsetDays, 5)) ELSE NULL END,
        //             W_SW.CalDate, ABS(ISNULL(CFG_SW.OffsetDays, 5)),
        //             W_0LVL.CalDate, ABS(ISNULL(CFG_0LV.OffsetDays, -2)),
        //             C.TypeJun, C.ChangeJunTodate, C.DesType, C.FormatAs400,
        //             '2030-04-15 00:00:00', NULL, GETDATE()
        //         FROM CalculatedStep2 C
        //         OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Go_DES' AND P_Type = 'P1') CFG_GO
        //         OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Confirm_MELINA' AND P_Type = 'P1') CFG_MEL
        //         OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'MSE_to_MELINA' AND P_Type = 'P1') CFG_MSE
        //         OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'SW_Assembly' AND P_Type = 'P1') CFG_SW
        //         OUTER APPLY (SELECT TOP 1 OffsetDays FROM #CalConfig WHERE TargetField = 'Zero_Level_Check' AND P_Type = C.P_Type COLLATE DATABASE_DEFAULT) CFG_0LV
        //         LEFT JOIN #WorkingDays W_DES     ON W_DES.WorkSeq     = C.DES_WorkSeq
        //         LEFT JOIN #WorkingDays W_GODES   ON W_GODES.WorkSeq   = (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12))
        //         LEFT JOIN #WorkingDays W_CONFIRM ON W_CONFIRM.WorkSeq = (C.P1_DES_WorkSeq + ISNULL(CFG_GO.OffsetDays, -12) + ISNULL(CFG_MEL.OffsetDays, 4))
        //         LEFT JOIN #WorkingDays W_MSE     ON W_MSE.WorkSeq     = (C.P1_DES_WorkSeq + ISNULL(CFG_MSE.OffsetDays, 5))
        //         LEFT JOIN #WorkingDays W_SW      ON W_SW.WorkSeq      = (C.P1_MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5))
        //         LEFT JOIN #WorkingDays W_0LVL    ON W_0LVL.WorkSeq    = (C.DES_WorkSeq + ISNULL(CFG_0LV.OffsetDays, -2));
        //     ";
        
        
        
            $sql = " 
            SET NOCOUNT ON;

            IF OBJECT_ID('tempdb..#WorkingDays') IS NOT NULL DROP TABLE #WorkingDays;

            SELECT CalDate, DateStr, WorkSeq
            INTO #WorkingDays
            FROM dbo.V_WorkingDays;

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
                    -- Go-DES: P1 = DES - 12 | last P = Same P1
                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
                        ELSE C.P1_DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)
                    END AS GODES_WorkSeq,

                    -- Confirm MELINA: P1 = Go_DES + 4
                    CASE 
                        WHEN C.P_Type = 'P1' THEN (C.DES_WorkSeq + ISNULL(CFG_GO_P1.OffsetDays, -12)) + ISNULL(CFG_MEL.OffsetDays, 4)
                        ELSE NULL 
                    END AS CONFIRM_WorkSeq,

                    -- MSE to MELINA: P1 = DES_BM + 5
                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.DES_WorkSeq + ISNULL(CFG_MSE.OffsetDays, 5)
                        ELSE NULL 
                    END AS MSE_WorkSeq,

                    -- SW Assembly: P1 = MFG_BM + 5 | last P = Same P1
                    CASE 
                        WHEN C.P_Type = 'P1' THEN C.MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
                        ELSE C.P1_MFG_WorkSeq + ISNULL(CFG_SW.OffsetDays, 5)
                    END AS SW_WorkSeq,

                    -- Zero Level: DES_BM - 2
                    C.DES_WorkSeq + ISNULL(CFG_0LV.OffsetDays, -2) AS ZEROLVL_WorkSeq,

                    -- ดึง DES_WorkSeq ของแถวก่อนหน้ามาใช้ทำ Design_working_day
                    LAG(C.DES_WorkSeq) OVER (ORDER BY C.A2M01, C.DesTypeSeq) AS Prev_DES_WorkSeq

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

                -- 1. Design_working_day = NETWORKDAYS(F4, F6) - 1
                CASE 
                    WHEN F.Prev_DES_WorkSeq IS NOT NULL THEN ABS(F.DES_WorkSeq - F.Prev_DES_WorkSeq) - 1
                    ELSE 0 
                END AS Design_working_day,

                -- 2. LeadTime = 5 + 10 + 15 + (D6 - H6) + 20 = 50 + (MFG_BM - Go_DES)
                CASE 
                    WHEN F.MFG_BM_Date IS NOT NULL AND W_GODES.CalDate IS NOT NULL 
                    THEN 50 + DATEDIFF(day, W_GODES.CalDate, F.MFG_BM_Date)
                    ELSE NULL 
                END AS LeadTime,

                -- 3. Time_DESBM_to_MFGBM_2 = D6 - F6 + 1 = (MFG_BM - DES_BM) + 1
                CASE 
                    WHEN F.MFG_BM_Date IS NOT NULL AND W_DES.CalDate IS NOT NULL 
                    THEN DATEDIFF(day, W_DES.CalDate, F.MFG_BM_Date) + 1
                    ELSE NULL 
                END AS Time_DESBM_to_MFGBM_2,
                
                F.TypeJun, F.ChangeJunTodate, F.DesType, F.FormatAs400,
                '2030-04-15 00:00:00', NULL, GETDATE()
            FROM CalculatedFinalWorkSeq F
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