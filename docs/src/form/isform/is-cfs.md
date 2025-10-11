---
# layout: doc
title: "IS Form : Confirm Sheet Form"
outline: deep # เปิดให้เมนูย่อยแสดงระดับที่ลึกขึ้น
---
# IS-CFS : Confirm Sheet Form 
เอกสารยืนยันการปฎิบัติงานของ user ที่เกี่ยวข้องกับระบบ itgc

## วิธีเข้าฟอร์ม

1. เข้าลิงก์ http://webflow/form/

2. กรอกชื่อผู้ใช้และรหัสผ่าน
<img src="/image/isform/webformLogin.png" alt="Form login" />

3. ฟอร์มจะปรากฎอยู่หน้า wait for approval

ระบบจะทำการสร้างฟอร์มให้อัตโนมัติเมื่อมีการสร้างฟอร์ม Production Environment ID temporary use request ที่มีการ <ins>**change data**</ins> เท่านั้น

<img src="/image/isform/is-cfs/form.png" alt="Form" />


## การกรอกข้อมูล
### 1. เลือก System code 

<img src="/image/isform/is-cfs/systemCode.png" alt="System code" />

* หากไม่พบ ให้คลิก **+New** เพื่อเพิ่มโปรแกรมลิสต์
<img src="/image/isform/is-cfs/btnNew.png" alt="button new program" />

* เมื่อเลือกแล้วระบบจะทำการเติม System name ให้อัติโนมัติ
<img src="/image/isform/is-cfs/systemName.png" alt="System name" />


::: tip 💡 Tip :
* สามารถคลิกเลขฟอร์ม เพื่อดูรายละเอียดของฟอร์มได้ 
<img src="/image/isform/is-cfs/openForm.png" alt="Open form" />
:::

### 2. กรอก Work content
<img src="/image/isform/is-cfs/workCont.png" alt="Work content" />

### 3. เพิ่มรูปภาพ 

<img src="/image/isform/is-cfs/addImage.png" alt="Add image" />

::: tip 💡 Tip :
* สามารถลากไฟล์มาวางในช่อง Drag & Drop ได้
* สามารถเพิ่มไฟล์ได้หลายไฟล์
* สามารถลบรูปภาพได้
* สามารถคลิก reset รูปภาพได้
* สามารถ preview ดูรูปภาพที่เพิ่มมาได้
:::

::: warning ⚠️ warning :
* เฉพาะไฟล์รูปภาพที่มีนามสกุล .jpg, .jpeg, .png, .gif เท่านั้น
:::

## การเพิ่มโปรแกรมลิสต์

<img src="/image/isform/is-cfs/newProgram.png" alt="New program list" />

::: tip 💡 Tip :
* หากเลือก New program ระบบจะทำการเปลี่ยนช่องกรอกให้สามารถกรอกได้
* หากเลือก Old program ระบบจะทำการเปลี่ยนเป็นตัวเลือกให้สามารถเลือกโปรแกรมเดิมที่มีได้
* หากไม่มีข้อมูลในระบบจะไม่สามารถเลือก Old program ได้
