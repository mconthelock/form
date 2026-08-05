# CONFIDENTIAL

# Program Specification Document
# A-MEC Information System

| Program Title | ตรวจนับ Inventory แบบ Cycle Count และ Variance Adjustment (Cycle Count Monthly / 6-Month / Variance / Yearly Inventory Check) |
|---|---|
| Program Number | [TBD] |
| Revision | [TBD] |

---

## 1 Revision History

| Revision | Revision History | Create By | Request No. | Date |
|---|---|---|---|---|
| 0 | Initial program | [TBD] | [TBD] | [TBD] |

---

## 2 Function Overview

โปรแกรมนี้เป็นชุดฟอร์มขออนุมัติ (Webform) สำหรับกระบวนการตรวจนับสินค้าคงคลัง (Inventory Cycle Count) ของคลังสินค้า WHI
โดยทำงานร่วมกับ **Web Flow Framework** กลาง (`@amec/webasset/api/webform`) ที่จัดการเรื่องสิทธิ์ผู้อนุมัติ (mode),
เส้นทางอนุมัติ (flow/timeline) และปุ่มอนุมัติ/ปฏิเสธ (`doaction`) ให้แล้ว ระบบแบ่งการทำงานออกเป็น 4 ฟอร์มหลัก:

1. **PS-CI (Cycle Count Inventory Sheet)** — แสดง/อนุมัติผลตรวจนับสต็อกรายเดือน แยกตาม Group คลังสินค้า
   เปรียบเทียบยอดคงเหลือในระบบ (On Hand) กับยอดตรวจนับจริง (Actual Qty) และผลสุ่มตรวจซ้ำโดยหัวหน้างาน (L/D Random Check)
2. **PS-CIH (Cycle Count Inventory Sheet 6 Months)** — โครงสร้างหน้าจอเหมือน PS-CI ทุกประการ แต่สรุปผลครอบคลุมรอบ 6 เดือน
   เมื่อได้รับอนุมัติจากตำแหน่ง **WHI SEM** ระบบจะสร้างฟอร์ม PS-VAR ให้อัตโนมัติ
3. **PS-VAR (Variance Adjustment Report / WHI Situation Report)** — สรุปสถานการณ์ Variance ของทุก Group คลังสินค้า
   ในรอบ 6 เดือนที่ยังไม่สามารถอธิบายได้ เพื่อเสนอผู้บริหารระดับสูง (PS DDEM, PS DEM, E/P DDIM, E/P DIM, President)
   อนุมัติตามลำดับ — ฟอร์มนี้ **ไม่มีหน้าจอสร้างฟอร์มเอง** ถูกสร้างโดยระบบจาก PS-CIH เท่านั้น
4. **PS-YIC (The Result of Inventory Yearly Checking)** — สรุปผลตรวจนับประจำปี (รายครึ่งปี) แยก Bulk Part/Stock Part
   เทียบผลตรวจของ WHI กับผลสุ่มตรวจอิสระของ FIN Division พร้อมรายงานย่อย "Variance Detail" แสดงรายการที่มีส่วนต่าง
   และช่องให้ฝ่ายคลัง (WHI) และฝ่ายจัดซื้อ (PUR) ตอบเหตุผลส่วนต่างเป็นรายรายการ

เป้าหมายหลักคือให้ผู้เกี่ยวข้อง (Controller/Foreman/WHI SEM/ผู้บริหาร) ตรวจสอบผลตรวจนับ แก้ไขค่าที่จำเป็นพร้อมบันทึกประวัติ
การแก้ไข แนบเอกสารประกอบ และอนุมัติฟอร์มตามลำดับสายงาน โดยฟอร์มรอบ 6 เดือน (PS-CIH) จะเชื่อมต่อไปยังฟอร์มสรุป Variance
(PS-VAR) โดยอัตโนมัติเมื่ออนุมัติสำเร็จ ส่วนฟอร์มรายปี (PS-YIC) เป็นกระบวนการตรวจสอบแยกอิสระที่ใช้ตรวจทานร่วมกับ FIN Division

> **สถาปัตยกรรมระบบ**: repository นี้ (`form`) ทำหน้าที่เป็น **Presentation layer** เท่านั้น (CodeIgniter controller + Blade
> view + rspack JS bundle) ส่วน Business logic การอ่าน/เขียนข้อมูลจริง (query, insert, upload) เรียกผ่าน REST API ภายนอกที่
> `process.env.APP_API` (ค่าเริ่มต้นใน `.env.sample` คือ `http://localhost:3001`) ซึ่งอยู่คนละ repository จึงไม่สามารถยืนยัน
> business rule ที่อยู่ฝั่ง backend ทั้งหมดได้ ยึด endpoint/พารามิเตอร์ที่พบในโค้ด frontend เป็น contract หลัก
> โมเดล CodeIgniter ที่พบ (`psci_model.php`, `pscih_model.php`, `var_model.php`, `yic_model.php`) มีเพียง `psci_model.php`
> ที่ยังมี query ใช้งาน (ดู 4.1) ที่เหลือเป็น stub ว่างเปล่า

### แบบฟอร์มคีย์ร่วม (Form Key)

ทุกฟอร์มระบุด้วยชุดคีย์เดียวกัน ส่งผ่าน query string ของหน้า `index`:

| Query Param | ส่งเป็น | ความหมาย |
| --- | --- | --- |
| `no` | `NFRMNO` | เลขที่ฟอร์ม |
| `orgNo` | `VORGNO` | รหัสหน่วยงาน/องค์กรที่ออกฟอร์ม |
| `y` | `CYEAR` | ปีของฟอร์ม |
| `y2` | `CYEAR2` | ปีรอง (กรณีข้ามปี) |
| `runNo` | `NRUNNO` | เลขรันของฟอร์มในปีนั้น |
| `empno` | `EMPNO` | รหัสพนักงานผู้เข้าดู/อนุมัติฟอร์ม (ใช้กำหนด mode) |

---

## 3 Function Diagram

**1) PS-CI — Cycle Count Inventory Sheet (Monthly)**

```
เปิดหน้า PS-CI (index)
|
+--> โหลด mode ผู้ใช้ (getMode) + timeline การอนุมัติ (showflow)
|
+--> โหลดข้อมูลฟอร์ม + รายละเอียดตรวจนับ (POST /ps-ci/getDataForm)
|       +--> คำนวณสรุป: Total Item / Checking Item / L/D Random Check
|       |                / Diff (First Time) / Diff (After Re-check)
|       +--> แต่ละแถวแนบประวัติแก้ไข (LOG_EDIT) ถ้าเคยถูกแก้ไขมาก่อน
|
+--> โหลดไฟล์แนบ (POST /webform/file/get-file, FORM_TYPE=PS)
|
+--> mode != '2' --> แสดงตารางอย่างเดียว (read-only)
|
+--> mode == '2' (ผู้อนุมัติ/ผู้ควบคุม) --> เปิดส่วนแก้ไข/อนุมัติ
|       +--> แก้ไข Actual Qty / Random Check ต่อแถว
|       |       +--> ค่าที่แก้ไขต่างจากเดิม --> ไฮไลต์แถว (กรอบแดง) + เก็บลง editedRows
|       +--> แนบไฟล์เพิ่มเติม (Attachment) + กรอก Remark
|       +--> กด Approve / Reject
|              +--> doaction (NFRMNO...NRUNNO, ACTION, EMPNO, REMARK)
|              +--> มีไฟล์แนบ --> POST /ps-ci/uploadFile
|              +--> POST /ps-ci/insertLog (editedRows, empno) --> บันทึกประวัติการแก้ไข
|              +--> redirectWebflow()
```

**2) PS-CIH — Cycle Count Inventory Sheet (6 Months)**

```
เปิดหน้า PS-CIH (index)
|
+--> โครงสร้างเดียวกับ PS-CI ทุกส่วน (getMode/showflow, getDataForm, get-file,
|    การ์ดสรุป, ตารางรายละเอียด, ไฟล์แนบ, ส่วนอนุมัติ)
|
+--> mode == '2' --> กด Approve / Reject
        +--> getByPosition("050504", "30") --> หา EMPNO ตำแหน่ง WHI SEM
        +--> doaction (NFRMNO...NRUNNO, ACTION, EMPNO, REMARK)
        +--> EMPNO ผู้อนุมัติ == EMPNO ของ WHI SEM ?
        |      +--> ใช่ --> POST /ps-var/create { REQBY, INPUTBY, REPORT_ID }
        |      |           สร้างฟอร์ม PS-VAR ใหม่โดยอัตโนมัติ
        |      +--> ไม่ใช่ --> ข้ามขั้นตอนนี้ ไม่สร้าง PS-VAR
        +--> มีไฟล์แนบ --> POST /ps-cih/uploadFile
        +--> POST /ps-cih/insertLog (editedRows, empno)
        +--> redirectWebflow()
```

**3) PS-VAR — Variance Adjustment Report (WHI Situation Report)**

```
เปิดหน้า PS-VAR (index)
|
+--> โหลด mode + timeline การอนุมัติ (getMode/showflow)
|
+--> โหลดผลตรวจนับหลายรอบ/หลายกลุ่ม (POST /ps-var/getDataResult2)
|       +--> คำนวณช่วงวันที่แสดงผล (preview-date-range) จาก CHECK_PERIOD ต่ำสุด-สูงสุด
|       +--> สร้างลิงก์อ้างอิงกลับฟอร์ม PS-CIH ต้นทาง (CIH_NFRMNO...CIH_NRUNNO)
|       +--> คำนวณสรุปรวม: Total / Checking / Diff (1st time) / Variance (จำนวน + มูลค่า ฿)
|       +--> จัดกลุ่มตาม GROUP_CODE เป็น 5 คอลัมน์: A1 / A2 / A3 / (B+E) / (C+D+F+G+I)
|              --> สรุป Total Item / Sum Onhand Qty / Sum Unit Price / Sum Amount ต่อกลุ่ม + Grand Total
|
+--> mode == '2' --> แสดงส่วนอนุมัติ (Remark + ปุ่ม Approve/Reject เท่านั้น ไม่มีช่องแนบไฟล์)
|       +--> กด Approve/Reject --> doaction (ACTION, EMPNO, REMARK) --> redirectWebflow()
|
+--> [หมายเหตุ: ไม่พบหน้า "สร้างฟอร์มใหม่" ของ PS-VAR ในโค้ดปัจจุบัน — ฟอร์มถูกสร้างจากฝั่ง PS-CIH เท่านั้น (ดูข้อ 2)]
```

**4) PS-YIC — The Result of Inventory Yearly Checking**

```
เปิดหน้า PS-YIC (index — สรุปผล)
|
+--> โหลด mode + timeline การอนุมัติ (getMode/showflow)
|
+--> โหลดข้อมูลฟอร์ม (POST /ps-yic/get-form-data)
|       +--> ผลลัพธ์[0]: ASSIGN(YEAR,PERIOD), CUTOFF_DATE, CHECK_DATE, FIN_DATE,
|                        RESULT[] (TYPE '1'=Bulk / 'A'=Stock, ON_HAND, ACTUAL_QTY, PRICE),
|                        BULK_ITEM/AMOUNT, STOCK_ITEM/AMOUNT (FIN Div. sampling ที่กรอกแยก),
|                        VARIANCE_BULK_ITEM/AMOUNT, VARIANCE_STOCK_ITEM/AMOUNT
|
+--> โหลดไฟล์แนบทั่วไป (get-file, FORM_TYPE=PS) + ไฟล์ Variance error (FILE_CODE=VARIANCE_FILE)
|       +--> มีไฟล์ Variance error อยู่แล้ว --> แสดงลิงก์ดาวน์โหลด + ซ่อนช่องอัปโหลด
|       +--> ยังไม่มี --> แสดงช่องอัปโหลด
|
+--> คำนวณสรุป Bulk/Stock: Total Item / Checking by WHI Sec. / Sampling by FIN Div. / Variance Item
+--> แสดง Comment สรุปผลเป็นข้อความอัตโนมัติ
|
+--> VARIANCE_*_ITEM/AMOUNT เป็น null --> แสดง input ให้กรอกเอง (ค่าเริ่มต้น 0)
|                                มีค่าแล้ว --> แสดงเป็นตัวเลข read-only
|
+--> ปุ่ม "View Report : Variance Detail »" --> เปิดหน้า PS-YIC/detail
|
+--> mode == '2' --> ส่วนอนุมัติ
        +--> กรอก Variance Item/Amount (ถ้ายังไม่มี) + แนบไฟล์ Variance error + Remark
        +--> กด Approve/Reject
               +--> มีไฟล์ Variance error --> POST /webform/file (FILE_CODE=VARIANCE_FILE)
               +--> มีการกรอก Variance data --> PATCH /ps-yic/update-variance
               +--> doaction (ACTION, EMPNO, REMARK) --> redirectWebflow()

เปิดหน้า PS-YIC (detail — Variance Detail Report)
|
+--> โหลด mode (getMode) + ข้อมูลฟอร์มเดียวกัน (POST /ps-yic/get-form-data)
|
+--> กรองเฉพาะรายการที่ ON_HAND != ACTUAL_QTY --> แยกตาราง Bulk (#tbl-variance) / Stock (#tbl-variance2)
|       +--> เติมแถวว่างให้ครบขั้นต่ำ 15 แถวต่อตาราง (สำหรับพิมพ์เอกสาร)
|       +--> คำนวณมูลค่าส่วนต่าง (|ACTUAL_QTY - ON_HAND| x PRICE) ต่อรายการและผลรวมทั้งหมด
|
+--> mode == '2' --> เปิดช่องกรอก WHI Reply / PUR Reply ต่อแถว (ชี้แจงเหตุผลส่วนต่างจากฝั่งคลัง/ฝั่งจัดซื้อ)
|       +--> ออกจากช่องกรอก (blur) --> PATCH /ps-yic/updateYearlyResult ทันที (auto-save รายแถว)
|       +--> [หมายเหตุ: endpoint นี้มี comment ในซอร์สโค้ดว่า "replace with the actual endpoint"
|                       แสดงว่ายังไม่ยืนยัน contract จริงกับฝั่ง backend]
|
+--> [หมายเหตุ: มี view สำรอง detail2.blade.php (คาดว่าเดิมตั้งใจทำ "FIN Div. Sampling Detail")
|               แต่ไม่มี JS bundle ผูกใช้งานใน entry.js จึงถือเป็น placeholder ที่ยังไม่ทำงานจริง]
```

---

## 4 Feature Detail

### 4.1 PS-CI (Cycle Count Inventory Sheet)

1. โหลดข้อมูลฟอร์มและรายการตรวจนับผ่าน `POST /ps-ci/getDataForm` โดยส่งคีย์ฟอร์ม (NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO)
2. แสดงการ์ดสรุป 5 รายการคำนวณฝั่ง client: Total Item (`data.length`), Checking Item (`ACTUAL_QTY != null`),
   L/D Random Check (`RANDOM_CHECK != null`), Diff (First Time) (`RANDOM_CHECK ?? ACTUAL_QTY ?? ON_HAND` ≠ `ON_HAND`),
   Diff (After Re-check) (`RECHECK_QTY ?? RANDOM_CHECK ?? ACTUAL_QTY ?? ON_HAND` ≠ `ON_HAND`)
3. ตารางรายละเอียดแสดงคอลัมน์: Buyer, Item Code, Description, Drawing No., Address/Location, Controller, On Hand, Unit,
   Actual Qty (แก้ไขได้เมื่อ mode = 2), Diff, L/D Random Check, Reason/Remark
4. แถวที่เคยถูกแก้ไข (`IS_ACTUAL_EDITED`) จะไฮไลต์กรอบแดง พร้อมไอคอน dropdown แสดงประวัติการแก้ไข
   (OLD_VALUE, NEW_VALUE, ผู้แก้ไข, วันที่, Remark) จากฟิลด์ `LOG_EDIT` ต่อแถว
5. เมื่อผู้อนุมัติแก้ไขค่า Actual Qty หรือ Random Check และค่าต่างจากเดิม ระบบจะรวบรวมเป็น `editedRows` แล้วส่งไปบันทึกที่
   `POST /ps-ci/insertLog` พร้อม `empno` ผู้แก้ไข (แยกประเภท log: TYPE 1 = แก้ไข Actual Qty, TYPE 2 = แก้ไข Random Check)
6. รองรับแนบไฟล์เพิ่มเติมพร้อมการอนุมัติ ผ่าน `POST /ps-ci/uploadFile` (ไฟล์ทั้งหมดเก็บภายใต้ `FORM_TYPE = 'PS'`)
7. [หมายเหตุ: `application/models/psform/PS-CI/psci_model.php` มี query สำหรับตาราง `PSCI_FORM`, `SKIDCNTRL.INV_CHECK_RESULT`,
   `SKIDCNTRL.IMM_ITEMMST`, `AMECUSERALL`, `INV_CHECK_LOG` และ method `getDataForm/insertLogEdit` ใน controller
   แต่หน้าเว็บจริง (`index.js`) เรียกข้อมูลผ่าน REST API ภายนอก (`APP_API`) เป็นหลัก ยังไม่ยืนยันว่า logic ทั้งสองฝั่งตรงกัน
   100% หรือฝั่ง CI เป็นโค้ดค้าง (legacy) — ควรตรวจสอบกับทีม Backend ก่อนใช้ query นี้เป็น contract]

### 4.2 PS-CIH (Cycle Count Inventory Sheet 6 Months)

1. หน้าจอ/ฟิลด์/สูตรคำนวณเหมือน PS-CI ทุกประการ ต่างกันที่ scope ข้อมูลครอบคลุมรอบ 6 เดือน และ endpoint ขึ้นต้นด้วย
   `/ps-cih/*` แทน `/ps-ci/*` (`getDataForm`, `uploadFile`, `insertLog`)
2. เมื่อผู้ใช้กด Approve/Reject ระบบจะค้นหา EMPNO ของตำแหน่ง **WHI SEM** ด้วย `getByPosition("050504", "30")`
   (`@amec/webasset/api/sequence-org`) ก่อนเสมอ ไม่ว่าใครจะเป็นผู้กดปุ่ม
3. หากรหัสพนักงานผู้กดอนุมัติ (`EMPNO` จาก query string) ตรงกับ EMPNO ของ WHI SEM ที่ค้นพบ ระบบจะเรียก
   `POST /ps-var/create` ทันทีเพื่อสร้างฟอร์ม **PS-VAR** ใหม่ โดยส่ง `REQBY`/`INPUTBY` เป็น EMPNO ผู้อนุมัติ และ
   `REPORT_ID` จากแถวแรกของผลลัพธ์ `getDataForm` ของฟอร์ม PS-CIH นี้เอง
4. หากผู้อนุมัติไม่ใช่ WHI SEM จะข้ามขั้นตอนสร้าง PS-VAR ไปเลย (ฟังก์ชันนี้ทำงานเฉพาะขั้นตอนอนุมัติของ WHI SEM เท่านั้น)
5. `application/models/psform/PS-CIH/pscih_model.php` เป็นคลาสว่าง ไม่มี custom query — ข้อมูลทั้งหมดพึ่งพา REST API
   ภายนอกเต็มรูปแบบ (ต่างจาก PS-CI ที่ยังมี legacy model หลงเหลืออยู่)
6. [หมายเหตุ: ไม่พบการตรวจสอบซ้ำว่า PS-VAR เคยถูกสร้างจากฟอร์ม PS-CIH นี้ไปแล้วหรือยัง (idempotency) หากกดอนุมัติซ้ำ
   หรือมีการเรียก doaction มากกว่า 1 ครั้งโดย WHI SEM อาจมีความเสี่ยงสร้าง PS-VAR ซ้ำซ้อน — ควรตรวจสอบฝั่ง backend]

### 4.3 PS-VAR (Variance Adjustment Report / WHI Situation Report)

1. ฟอร์มนี้ **ไม่มีหน้าจอสร้างฟอร์มเอง** — ถูกสร้างขึ้นโดยระบบอัตโนมัติจากขั้นตอนอนุมัติของฟอร์ม PS-CIH เท่านั้น
   (ดูข้อ 4.2.3) หน้า `index.blade.php` ทำหน้าที่เป็นหน้าแสดงผล/อนุมัติเท่านั้น
2. แสดงเงื่อนไข/ขั้นตอนการทำงานเป็นข้อความคงที่ (Conditions): WHI ตรวจนับทุกคลังสินค้า → WHI Office พิมพ์รายการแจก
   หัวหน้างาน/ผู้ควบคุม → เจ้าหน้าที่ WHI ตรวจนับ → หัวหน้างานสรุปส่ง WHI SEM อนุมัติ → ส่งต่อ PS DDEM, PS DEM, E/P DDIM,
   E/P DIM, President อนุมัติตามลำดับ
3. โหลดผลตรวจนับทุกกลุ่ม/รอบที่เกี่ยวข้องผ่าน `POST /ps-var/getDataResult2` แล้วคำนวณสรุปฝั่ง client:
   Total items, Diff (1st time), Variance items (ส่วนต่างที่เหลือหลังทุกขั้นตอนตรวจซ้ำ: ลำดับ fallback
   `FINAL_QTY → RECHECK_QTY → RANDOM_CHECK → ACTUAL_QTY → ON_HAND`) พร้อมมูลค่ารวม (Sum Amount ฿) ของแต่ละหมวด
4. จัดกลุ่มผลลัพธ์ตาม `GROUP_CODE` เป็น 5 คอลัมน์สรุป: A1, A2, A3, B+E (รวม), C+D+F+G+I (รวม) แสดง Total Item,
   Sum Onhand Qty, Sum Unit Price, Sum Amount ต่อกลุ่ม พร้อมคอลัมน์ Grand Total
5. ปุ่ม "Form Cycle Count Inventory Checking (6 Month)" ลิงก์กลับไปฟอร์ม PS-CIH ต้นทางของแต่ละแถวผลลัพธ์ (ประกอบ URL จาก
   `CIH_NFRMNO, CIH_VORGNO, CIH_CYEAR, CIH_CYEAR2, CIH_NRUNNO`)
6. ส่วนอนุมัติมีเฉพาะ Remark + ปุ่ม Approve/Reject **ไม่มีช่องแนบไฟล์** ต่างจาก PS-CI/PS-CIH/PS-YIC
7. `application/models/psform/PS-VAR/var_model.php` เป็นคลาสว่าง (stub) ไม่มี query ใช้งานจริง

### 4.4 PS-YIC (The Result of Inventory Yearly Checking)

1. มี 3 action ใน controller: `index()` (สรุปผลหลัก), `detail()` (Variance Detail), `detail2()` (สำรอง/placeholder
   ที่ยังไม่มี JS bundle ผูกใช้งาน — ปุ่มลิงก์ไปหน้านี้ถูก comment ไว้ในหน้า index)
2. หน้า index แยกผลตรวจเป็น Bulk Part (`TYPE='1'`) และ Stock Part (`TYPE='A'`) โดยแต่ละส่วนคำนวณ Total Item,
   Checking by WHI Sec. (เฉพาะแถวที่ `ACTUAL_QTY != null`), Sampling Checking by FIN Div. (มาจากฟิลด์สรุปที่กรอกแยก
   ไม่ใช่คำนวณจากรายการจริง — `BULK_ITEM/AMOUNT`, `STOCK_ITEM/AMOUNT`), และ Variance Item (แถวที่ `ACTUAL_QTY != ON_HAND`)
3. ส่วน "Variance Error Calculation" ให้ผู้อนุมัติกรอกจำนวน/มูลค่าส่วนต่างที่หาสาเหตุไม่ได้เอง (`VARIANCE_BULK_ITEM/AMOUNT`,
   `VARIANCE_STOCK_ITEM/AMOUNT`) หากยังไม่เคยกรอก (ค่าเป็น `null`) ระบบจะแสดงเป็นช่อง input แทนตัวเลข read-only
   และบันทึกผ่าน `PATCH /ps-yic/update-variance` เมื่อกด Approve/Reject
4. รองรับไฟล์แนบ 2 ประเภท: ไฟล์แนบทั่วไป (`FORM_TYPE='PS'`, กรอง `FILE_TYPE === null`) และไฟล์ประกอบ Variance
   (`FILE_CODE='VARIANCE_FILE'`) ซึ่งเมื่อมีไฟล์แล้วจะซ่อนช่องอัปโหลดและแสดงลิงก์ดาวน์โหลดแทนโดยอัตโนมัติ
5. หน้า Comment สรุปข้อความอัตโนมัติ (จำนวน Bulk/Stock item, มูลค่ารวมที่ WHI ตรวจพบ, ผลสุ่มตรวจของ FIN Div.)
6. หน้า `detail` (Variance Detail Report) กรองเฉพาะรายการที่มีส่วนต่าง แยกตาราง Bulk/Stock พร้อมเติมแถวว่างขั้นต่ำ 15
   แถวต่อ ตาราง (สำหรับพิมพ์เอกสารรายงาน) และคำนวณมูลค่าส่วนต่างรวม
7. ในหน้า `detail` เมื่อ mode = 2 ผู้ใช้สามารถกรอกช่อง **WHI Reply** และ **PUR Reply** ต่อแถว เพื่อชี้แจงเหตุผลส่วนต่าง
   จากฝั่งคลังสินค้าและฝั่งจัดซื้อ โดยระบบจะบันทึกทันทีเมื่อออกจากช่องกรอก (`blur`) ผ่าน `PATCH /ps-yic/updateYearlyResult`
   (auto-save รายแถว ไม่ต้องกดปุ่มบันทึกรวม)
8. [หมายเหตุ: endpoint `/ps-yic/updateYearlyResult` มี comment ในซอร์สโค้ดต้นฉบับว่า "replace with the actual endpoint"
   ทั้งสองจุดที่เรียกใช้ (WHI Reply, PUR Reply) แสดงว่ายังอยู่ระหว่างพัฒนา ควรตรวจสอบ contract กับทีม Backend ก่อนใช้งานจริง]
9. [หมายเหตุ: `application/models/psform/PS-YIC/yic_model.php` เป็นคลาสว่าง (stub) ไม่มี query ใช้งานจริง และไม่พบ
   auto-create เชื่อมโยงไป/มาจาก PS-CI, PS-CIH หรือ PS-VAR ในซอร์สโค้ดปัจจุบัน — ถือเป็นกระบวนการตรวจนับประจำปีที่แยกอิสระ]

---

## 5 Screen Layout

> [หมายเหตุ: ไม่มี screenshot หน้าจอจริงแนบมาในเอกสารนี้ (ยังไม่ได้ deploy/capture) จึงสรุปโครงหน้าจอจากไฟล์
> Blade view และ JS ที่พบในซอร์สโค้ดเท่านั้น]

- หน้าที่เกี่ยวข้อง (ทุกหน้าใช้ Layout กลาง `layouts/webflowTemplate`)
  1. PS-CI — `/psform/PS-CI/main` → view `psform/PS-CI/index.blade.php`
  2. PS-CIH — `/psform/PS-CIH/main` → view `psform/PS-CIH/index.blade.php`
  3. PS-VAR — `/psform/PS-VAR/main` → view `psform/PS-VAR/index.blade.php`
  4. PS-YIC (สรุปผล) — `/psform/PS-YIC/main` → view `psform/PS-YIC/index.blade.php`
  5. PS-YIC (Variance Detail) — `/psform/PS-YIC/main/detail` → view `psform/PS-YIC/detail.blade.php`
  6. PS-YIC (สำรอง/ยังไม่ใช้งาน) — `/psform/PS-YIC/main/detail2` → view `psform/PS-YIC/detail2.blade.php`

- **PS-CI / PS-CIH (โครงหน้าจอเหมือนกันทุกประการ)**
  - Header: ชื่อบริษัท + หน่วยงาน (PS/WHI), ชื่อฟอร์ม ("Cycle Count Inventory Sheet" / "...(6 Months)"), ชื่อ Group,
    badge Data Date / Check Date / Check By
  - การ์ดสรุป 5 รายการ: Total Item, Checking Item, L/D Random Check, Diff. (First Time), Diff. (After Re-check)
  - ตาราง "Inventory Detail": No., Buyer, Item Code, Description, Drawing No., Address, Controller, On Hand, Unit,
    Actual Qty (editable เมื่อ mode=2, มี dropdown ประวัติแก้ไข), Diff, L/D Random Check, Reason/Remark
  - การ์ด "ไฟล์แนบเพิ่มเติม": รายการไฟล์ + ปุ่มดาวน์โหลด
  - ส่วนอนุมัติ (แสดงเมื่อ mode=2): ช่องแนบไฟล์ (Attachment), ช่อง Remark, ปุ่ม Approve (เขียว) / Reject (แดง)
  - Timeline การอนุมัติ (flow) ด้านล่างสุดของหน้า

- **PS-VAR**
  - Header: badge "Variance Adjustment Report", หัวข้อ "WHI Situation Report", From: WHI SEM, Date, ช่วงวันที่ข้อมูล
  - การ์ด "Conditions": รายการขั้นตอนธุรกิจ 5 ข้อ (เช็คถูกสีเขียว)
  - การ์ด "Remarks": ข้อความสรุป Variance แบบ dynamic (จำนวนเงิน/รายการ)
  - การ์ด "Result": สถิติ 3 กล่อง (Total items, Diff. 1st time, Variance items) + ตารางสรุป Total/Checking/Diff/Variance
    (จำนวน + มูลค่า ฿) + ปุ่มลิงก์ "Form Cycle Count Inventory Checking (6 Month)"
  - การ์ด "Monthly summary": ตาราง pin คอลัมน์ตามกลุ่ม A1/A2/A3/B+E/C+D+F+G+I x 4 แถว (Total Item, Sum Onhand Qty,
    SumUnitPrice, SumAmount) + Grand Total
  - ส่วนอนุมัติ: Remark + ปุ่ม Approve/Reject (ไม่มีช่องแนบไฟล์)
  - Timeline การอนุมัติ (flow)

- **PS-YIC (index — สรุปผล)**
  - Header: "THE RESULT OF INVENTORY YEARLY CHECKING FY{year} (BULK PART & STOCK PART)"
  - การ์ด "Condition Information": Cut Off Data Date, WHI Check Date, RAF Div. Random Check Date, Checking area
  - การ์ด "Result": ตารางคู่ Bulk Part / Stock Part (Total Item, Checking by WHI Sec., Sampling Checking by FIN Div.,
    Variance Item — พร้อมจำนวน+มูลค่า)
  - ปุ่มลิงก์ "View Report : Variance Detail »"
  - การ์ด "Variance Error Calculation": ตารางคู่ Bulk/Stock ให้กรอก/แสดงจำนวน-มูลค่า Variance ที่หาสาเหตุไม่ได้
  - การ์ด "Comment": ข้อความสรุปอัตโนมัติ
  - การ์ดไฟล์แนบ: ไฟล์แนบทั่วไป + ไฟล์ Variance error (พร้อม badge ลิงก์ดาวน์โหลดถ้ามีไฟล์แล้ว)
  - ส่วนอนุมัติ: ช่องกรอก Variance (ถ้ายังไม่มี), แนบไฟล์ Variance error, Remark, ปุ่ม Approve/Reject
  - Timeline การอนุมัติ (flow)

- **PS-YIC (detail — Variance Detail Report)**
  - Header: หัวข้อรายงาน + Condition Information (เหมือนหน้า index)
  - ตารางคู่ Bulk (`#tbl-variance`) / Stock (`#tbl-variance2`): No., Tag No., Item Code, Drawing/Description, On Hand,
    Actual Qty, Diff, Unit, Diff Amount, WHI Reply (input เมื่อ mode=2), PUR Reply (input เมื่อ mode=2)
  - แถวว่างเติมอัตโนมัติให้ครบขั้นต่ำ 15 แถวต่อ ตาราง + แสดง watermark "Variance = 0" เมื่อไม่มีรายการส่วนต่างเลย
  - แถวสรุปมูลค่าส่วนต่างรวม (Total Amount) ท้ายตารางทั้งสองฝั่ง
