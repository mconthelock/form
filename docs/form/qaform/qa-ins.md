---
# layout: doc
title: "QA Form : E-Self Inspection and Authorize"
outline: deep # เปิดให้เมนูย่อยแสดงระดับที่ลึกขึ้น
---

# QA-INS : E-Self Inspection and Authorize
    เป็นโปรแกรมสำหรับทดสอบผู้ที่จะเข้าใช้งานโปรแกรม E-check sheet ว่ามีคุณสมบัติหรือไม่

## วัตถุประสงค์
โปรแกรมนี้ถูกพัฒนาขึ้นเพื่อใช้ในการทดสอบและประเมินคุณสมบัติของผู้ที่จะเข้าใช้งานระบบ **E-Check Sheet** ว่ามีความพร้อมและมีคุณสมบัติครบถ้วนตามที่กำหนดหรือไม่

## กระบวนการทำงาน

1. **การขอทดสอบโดยหัวหน้างาน (Foreman):**  
   หัวหน้างานเป็นผู้จัดทำแบบฟอร์ม (Form) เพื่อขอทดสอบพนักงานในความดูแลของตนเอง โดยระบุข้อมูลของผู้เข้าทดสอบและรายละเอียดของการทดสอบในแบบฟอร์มดังกล่าว

2. **การนัดหมายและดำเนินการทดสอบโดยฝ่าย QC:**  
   เมื่อได้รับคำขอ ฝ่าย **QC** จะเป็นผู้กำหนดและนัดหมายวันทดสอบ พร้อมดำเนินการทดสอบพนักงานตามรายการที่กำหนดในแบบฟอร์ม

3. **การประเมินผลและการให้สิทธิ์การใช้งาน:**  
   หากพนักงานผ่านการทดสอบ ระบบจะดำเนินการ **เพิ่มสิทธิ์การใช้งานในระบบ E-Check Sheet** โดยอัตโนมัติ รวมถึงสิทธิ์ในการเข้าถึง **Item** แลพ **Station** ที่พนักงานได้ผ่านการทดสอบ เพื่อให้สามารถใช้งานโปรแกรมได้ตามสิทธิ์ที่ได้รับ

## เกณฑ์การตัดเกรด  

| Grade	|Description	|% Complied                 |
| ----- | :-----------  | :----------------------   |
| A	    |Fully          |Compliance	90% and Up      |
| B	    |Predominant    |Compliance	80-89%          |
| C	    |Partial        |Compliance	79% and below   |

## ผลลัพธ์ที่คาดหวัง
- พนักงานที่ผ่านการทดสอบสามารถเข้าใช้งานโปรแกรม **E-Check Sheet** ได้ตามหน้าที่และขอบเขตงานที่ได้รับมอบหมาย  
- ช่วยให้กระบวนการอนุมัติสิทธิ์การเข้าใช้งานเป็นไปอย่างมีระบบและสามารถตรวจสอบย้อนหลังได้อย่างโปร่งใส  
- เพิ่มความมั่นใจในคุณภาพของผู้ใช้งานระบบ โดยผ่านการประเมินจากฝ่าย QC อย่างเป็นทางการ

## วิธีเข้าสู่หน้าฟอร์ม E-Self Inspection and Authorize
1. [เข้าสู่ระบบ](http://webflow/form/) 
2. เลือกเมนู ELECTRONIC FORMS
3. เลือกเมนู Create
4. เลือกเมนู QA Forms
5. เลือกเมนู E-Self Inspection and Authorize
   
## การขอทดสอบโดยหัวหน้างาน (Foreman)

<FancyLightboxImage src="/image/qaform/qa-ins/req.png"/>

### วิธีการใช้งาน

#### Step 1 : Request by
กรอกรหัสพนักงาน - `24008`
   
#### Step 2 : Item
เลือก Item ที่ต้องการทดสอบ `121-03`

#### Step 3 : QC Section In-charge
เลือกแผนกและผู้รับผิดชอบตามแผนก `QC1 SEC.` `SARAWUT SUESATWATTANAKUL (04014)`
::: tip
บางแผนกมีการตั้ง default ผู้รับผิดชอบอยู่แล้ว แต่สามารถเปลี่ยนได้ 
:::

#### Step 4 : Attach file (ไม่บังคับ)
สำหรับแนบไฟล์ 
<FancyLightboxImage src="/image/qaform/qa-ins/req-attach.png"/>
::: tip
- สามารถคลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวางในช่อง Drag & Drop ได้
- สามารถเพิ่มไฟล์ได้หลายไฟล์
- สามารถลบไฟล์ได้
- หากเป็น**รูปภาพ**สามารถ **preview** ดูได้ด้วยการคลิกที่ **Icon**
:::

#### Step 5 : ID Operator
เลือกผู้ทดสอบตามแผนก  
<FancyLightboxImage src="/image/qaform/qa-ins/req-operator.png"/>

1. เลือก Devision `E/P DIV.`
2. เลือก Department `IS DEPT.`
3. เลือก Section `WSD Sec.`
4. กดปุ่มค้นหาข้อมูล
5. ใช้ฟีเจอร์การกรองข้อมูลเพื่อค้นหาตามชื่อหรือรหัสพนักงาน `24008`
6. เลือกพนักงานทั้งหมดตามรายการที่แสดงโดยระบบ
7. เลือกพนักงานเป็นรายบุคคล
  
::: warning ข้อกำหนดการใช้งาน 
ผู้ใช้จำเป็นต้องระบุข้อมูลในขั้นตอนที่ 1-3 ให้ครบถ้วนก่อนการดำเนินการค้นหาข้อมูล
:::
>**หมายเหตุ: หากไม่พบข้อมูลในระบบ จะไม่มีการแสดงรายชื่อผู้ทดสอบ**

## การนัดหมายและดำเนินการทดสอบโดยฝ่าย QC
<!-- <FancyLightboxImage :images="[{src:'/image/qaform/qa-ins/qc-detail.png'}, {src:'/image/qaform/qa-ins/qc-incharge.png'}]"  hero-height="420px" 
  :autoplay-ms="3500"   
  :pause-on-hover="true"/> -->
<FancyLightboxImage src="/image/qaform/qa-ins/qc-detail.png"/>
<FancyLightboxImage src="/image/qaform/qa-ins/qc-incharge.png"/>

### วิธีการใช้งาน
#### 1 : Form Information
แสดงข้อมูลผู้เขียนฟอร์ม
- Form no `QA-INS25-000001`
- Input by `SUTTHIPONG TANGMONKHONCHAROEN(24008)`
- Requested by `SUTTHIPONG TANGMONKHONCHAROEN(24008)`

#### 2 : Requester Details
แสดงรายละเอียดการขอเข้าทดสอบ
- Item `Item ที่ต้องการทดสอบ`
- ID Operator `(ผู้เข้าทดสอบ)`
- Attach file `(ไฟล์แนบ)`
- QC Section Incharge `(ผู้รับผิดชอบ)`

#### 3 : Attach file
Attach file สามารถคลิกเพื่อดาวน์โหลดไฟล์ที่ต้องการได้

#### 4 : Traning Date
สามารถเลือกวันที่และเวลา `07-Oct-2025 12:00`

#### 5 : OJT Date 
สามารถเลือกวันที่และเวลา `08-Oct-2025 12:00`

#### 6 : QC Foreman
เลือก QC Foreman เจ้าของ Item

#### 7 : Revision
เลือก Revision ของเอกสารที่ใช้ทดสอบ โดยค่าเริ่มต้นจะเป็น revision ล่าสุด `*` `A` `B`

#### 8 : QC Auditor
เลือกรายชื่อผู้ตรวจสอบที่จะลงไปทดสอบผู้เข้าทดสอบ

## การประเมินผล
<FancyLightboxImage src="/image/qaform/qa-ins/qc-audit.png"/>

### วิธีการใช้งาน
#### 1 : Qc Auditor
แสดงข้อมูลผู้ตรวจสอบ
- Auditor `SARAWUT S. (STAFF QC1), KANCHAI S. (FOREMAN QC1), SUPACHAI J. (SEM QC1)`
- Training Date `07-Oct-2025 12:00`
- OJT Date `08-Oct-2025 12:00`

#### 2 : Result
แสดงผลการทดสอบเมื่อทำการทำสอบแล้ว `PASS` `NOT PASS`

#### 3 : Grade
แสดงเกรด `A` `B` `C`

#### 4 : Status
แสดงสถานะการทดสอบ
- Not Audited ยังไม่ได้ทดสอบ
- Audited ทดสอบแล้ว
- Save draft บันทึกฉบับร่าง

#### 5 : Audit
คลิกเพื่อทดสอบ

<FancyLightboxImage src="/image/qaform/qa-ins/qc-audit-head.png"/>
<FancyLightboxImage src="/image/qaform/qa-ins/qc-audit-score.png"/>
<FancyLightboxImage src="/image/qaform/qa-ins/qc-audit-comment.png"/>
<FancyLightboxImage src="/image/qaform/qa-ins/qc-audit-result.png"/>
<!-- <FancyLightboxImage :images="[
    {src:'/image/qaform/qa-ins/qc-audit-head.png'},
    {src:'/image/qaform/qa-ins/qc-audit-score.png'},
    {src:'/image/qaform/qa-ins/qc-audit-comment.png'},
    {src:'/image/qaform/qa-ins/qc-audit-result.png'}]"  
    hero-height="420px"
  :autoplay-ms="3500"   
  :pause-on-hover="true"/> -->

### การใช้งานหน้าทดสอบ
#### ข้อมูลการทดสอบ
หมายเลข `2` แสดงรายละเอียดของผู้เข้าทดสอบ  
**หาก Item ประกอบด้วย station ระบบจะแสดง Station ให้ผู้ตรวจสอบพิจารณาเลือก Station ที่จะดำเนินการประเมินดังรูปด้านล่าง**
<FancyLightboxImage src="/image/qaform/qa-ins/qc-audit-station.png"/>

#### ข้อมูล Revision ของเอกสาร
หมายเลข `3` เป็น Revision ทั้งหมดของเอกสารการทดสอบสามารถคลิดดูรายละเอียดแต่ละ revision ได้ที่หมายเลข `4`

#### การประเมิน
- คะแนนทั้งหมด หมายเลข `1` = ผลรวมหมายเลข `7` 
- ผู้ตรวจสอบสามารถให้คะแนน โดยการคลิกเครื่องหมาย `+` `-` หรือพิมพ์คะแนนที่หมายเลข `6` โดยระบบจะมีคะแนนสูงสุดที่สามารถให้ได้ตามแต่ละ Revision ของเอกสาร
- หมายเลข `7` = หมายเลข `5` * หมายเลข `6`
- หมายเลข `8` เลือกระหว่าง `S` `C` อย่างใดอย่างหนึ่ง **(ไม่บังคับ)**
- หมายเลข `9` และ `10` สามารถกรอกข้อความสำหรับ comment ได้
- หมายเลข `11` สำหรับแนบไฟล์รูปภาพ
- หมายเลข `12` แสดงข้อมูลผลลัพธ์ ตัดเกรด
> สามารถลากรูปมาวางในช่อง Drag & Drop ได้หรือคลิกเพื่อเพิ่มรูปได้
> <FancyLightboxImage src="/image/qaform/qa-ins/qc-audit-pic.png"/>


::: tip
เมื่อทำการทดสอบเสร็จแล้วยังสามารถคลิกดูข้อมูลได้
:::

<!-- ## การให้สิทธิ์การใช้งาน -->


