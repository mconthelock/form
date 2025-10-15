---
# layout: doc
title: "IS Form : Production Environment ID temporary use request"
outline: deep # เปิดให้เมนูย่อยแสดงระดับที่ลึกขึ้น
---

<script setup>
    const baseImg = "/form/docs/image/isform/is-tid/";
    // const baseImg = "/image/isform/is-tid/";
    const flexCenter = "display:flex; justify-content: center;"
</script>

# IS-TID : Production Environment ID temporary use request

เป็นโปรแกรมใช้สำหรับการขออนุญาตใช้งานระบบ ชั่วคราวในช่วงเวลาที่กำหนด โดยผู้ใช้จะต้องระบุรายละเอียดผู้ขอใช้งาน, เวลาที่ต้องการใช้งาน, ระบบที่ต้องการเข้าใช้ และเหตุผลในการขอใช้งาน 

## วิธีเข้าฟอร์ม

1. เข้าลิงก์ http://webflow/form/

2. กรอกชื่อผู้ใช้และรหัสผ่าน
<!-- ![](/image/isform/is-tid/webformLogin.png) -->
<img src="/image/isform/webformLogin.png" alt="form login" />
<!-- <img :src="baseImg + 'webformLogin.png'" alt="form login" /> -->

3. เข้าสู่เมนู
<div :style="flexCenter + 'gap: 1rem; margin: 1rem 0;'" >
    <img src="/image/isform/is-tid/menuCreate.png" alt="Menu create"/>
    ->
    <img src="/image/isform/is-tid/menuIsform.png" alt="Menu is form"/>
    ->
    <img src="/image/isform/is-tid/menuTid.png" alt="Menu IS-TID"/>
</div>

<img src="/image/isform/is-tid/form.png" alt="Requester" />
 
## การกรอกข้อมูล
### 1. กรอกรหัสพนักงาน (Requester)
<img src="/image/isform/is-tid/requester.png" alt="Requester" />

::: warning ⚠️ warning : 
* เมื่อมีการกดปุ่ม Enter หรือ คลิกภายนอกช่อง ระบบจะทำการตรวจสอบหากไม่พบรหัสพนักงานในระบบ ระบบจะทำการลบรหัสพนักงานออกจากช่อง และแจ้งเตือนที่ด้านล่างขวาของหน้าจอ
<img src="/image/isform/is-tid/warningReq.png" alt="Alert" />
:::

### 2. เลือกวันที่ (Requester date)
<!-- <div :style="flexCenter"> -->

<img src="/image/isform/is-tid/date.png" alt="Date"/>
<!-- </div> -->

::: tip 💡 Tip : สีแดงคือวันหยุดของบริษัท ไม่สามารถเลือกได้
::: 

### 3. เลือกเวลา (Usage period)
<!-- <div :style="flexCenter"> -->
<img src="/image/isform/is-tid/time.png" alt="Time"/>
<!-- </div> -->

### 4. เลือกประเภทของฟอร์ม
<!-- <div :style="flexCenter"> -->
<img src="/image/isform/is-tid/formType.png" alt="Form type"/>
<!-- </div> -->

- without controller 
<img src="/image/isform/is-tid/withoutControl.png" alt="Without controller"/>

- with controller 

    คือ ฟอร์มที่ต้องมี controller คอยปิด
    <img src="/image/isform/is-tid/withControl.png" alt="With controller"/>

    ::: tip 💡 Tip :  
    * หากคลิกเลือก <ins>**chang data**</ins> ระบบจะทำการสร้างฟอร์ม Confirm sheet ตามจำนวนหมายเลข webflow request no.
    * เมื่อเลือกฟอร์มประเภทนี้ระบบจะสร้างฟอร์มขึ้นมา 2 ฟอร์ม คือของผู้ Request และ Controller ที่เลือก
    :::

### 5. กรอกหมายเลข Webflow request no. ของฟอร์ม IS-DEV
<img src="/image/isform/is-tid/webflowReqNo.png" alt="Webflow request no."/>

::: tip 💡 Tip : 
สามารถเพิ่มและลบเลขฟอร์มได้โดยคลิกเครื่องหมาย **+**
:::

::: warning ⚠️ warning :
* เมื่อมีการกดปุ่ม Enter หรือ คลิกภายนอกช่อง ระบบจะทำการตรวจสอบหากไม่พบเลขฟอร์มในระบบ ระบบจะทำการลบเลขฟอร์มออกจากช่อง และแจ้งเตือนที่ด้านล่างขวาของหน้าจอ
<img src="/image/isform/is-tid/warningWebReq.png" alt="Alert"/>
:::

### 6. เลือก User และ controller
- เลือก Server name ที่ต้องการ ระบบจะทำการ filter user ที่มี user ใน server ที่เลือกให้

    <div style="display:flex; gap: 1rem; margin: 1rem 0; " >
    <img src="/image/isform/is-tid/server.png" alt="Server name"/>
    <img src="/image/isform/is-tid/userLogin.png" alt="User login" style="height:fit-content"/>
    </div>
- ระบบจะทำการ filter controller ที่มี controller ใน server ที่เลือกให้
    
    ** เฉพาะฟอร์มที่ต้องเลือก controller เท่านั้น

    <img src="/image/isform/is-tid/controller.png" alt="Controller"/>

### 7. กรอกรายละเอียดและเหตุผล
<img src="/image/isform/is-tid/workCont.png" alt="Work content"/>

## การตอบฟอร์ม
การตอบฟอร์มจะแบ่งเป็นสองลักษณะตามประเภทฟอร์ม

<img src="/image/isform/is-tid/webflow.png" alt="Webflow"/>

### 1. ฟอร์มที่มี controller
flow step
>1.  requester 
>2.  sem 
>3.  controller 
>4.  requester 
>5.  sem 
>6.  controller 
>7.  dem

### 2. ฟอร์มที่ไม่มี controller
flow step
>1.   requester   
>2.   sem    
>3.   requester   
>4.   sem

โดยเมื่อ flow มาถึงลำดับที่ 4 และ 3 คือ requester ของแต่ละฟอร์ม ผู้ใช้จำเป้นต้องเลือกวัน completed date และ completed time

<img src="/image/isform/is-tid/completed.png" alt="Completed date/time"/>

และเมื่อ flow มาถึงลำดับที่ 6 คือ controller ต้องกรอกวันเวลาที่ disable 

<img src="/image/isform/is-tid/compCtrl.png" alt="Disable"/>

::: tip 💡 Tip :
* ผู้ใช้งานสามารถคลิกเลขฟอร์ม เพื่อเปิดดูฟอร์มได้ เช่น  <ins>IS-DEV21-000007</ins>
<img src="/image/isform/is-tid/openForm.png" alt="Open form"/>
:::


<!-- ::: danger build error
เราสามารถแก้ไขได้โดยการ Copy package ที่โปรแกรมต้องการโฟล์เดอร์ node_modules ที่นอกโฟล์เดอร์ docs มาวางใน node_modules ภายในโฟล์เดอร์ docs
:::

::: warning Search Function
Search function จะยังไม่รองรับภาษาไทย ทำให้ไม่สามารถค้นหาเนื้อหาทั้งหมดได้ หากต้องการให้สามารถค้นหาภาษาไทยได้จะต้องเลือก provide เป็น Algolia Search เป็น Build in ที่ติดมากับ VitePress แต่ข้อเสียคือจะมีค่าใช้จ่ายในบางกรณี
:::

::: tip แนะนำศึกษาวิธีการเขียน Markdown
https://www.markdownguide.org/basic-syntax/
:::

| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |

> #### The quarterly results look great!
>
> - Revenue was off the chart.
> - Profits were higher than ever.
>
>  *Everything* is going according to **plan**. -->

