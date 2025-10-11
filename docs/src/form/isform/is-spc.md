---
# layout: doc
title: "IS Form : Special Authorization ID application form"
outline: deep
---

<script setup>
    const radius = "border-radius: 5px";
</script>

# IS-SPC : Special Authorization ID Application Form

> แบบฟอร์มสำหรับขอสิทธิ์เข้าใช้งานระบบ Server

---

## 🚀 วิธีการเข้าใช้งาน

1. เข้าสู่ระบบที่ [http://webflow/form/index.asp](http://webflow/form/index.asp)  
   จากนั้นเลือกเมนู `Create -> IS Forms`

   <img src="/image/isform/is-spc/Picture2.png" alt="Menu create" :style="radius" width="350"/>

2. เลือกเมนู `Special Authorization ID application form`

   <img src="/image/isform/is-spc/Picture3.png" alt="เลือกฟอร์ม Special Authorization ID" :style="radius" width="350"/>
   <br/>
   <img src="/image/isform/is-spc/Picture4.png" alt="หน้าจอกรอกข้อมูล" :style="radius" width="600"/>

---

## 📝 การกรอกแบบฟอร์ม

### - ส่วนที่ 1: ข้อมูลผู้ขอ (Requester)

<img src="/image/isform/is-spc/cropped/requester_section.png" :style="radius" alt="form section" />

- **Request Date**: วันที่ทำรายการ (ระบบกำหนดอัตโนมัติ)
- **Requester**: ระบุรหัสพนักงาน เช่น `24012`

---

### - ส่วนที่ 2: ประเภทคำขอ (Action)

<img src="/image/isform/is-spc/cropped/action_section.png" :style="radius" alt="form section" />

- เลือกประเภทการดำเนินการ:
  - `ADD` – ขอสิทธิ์เข้าใช้งานระบบ
  - `DELETE` – ลบสิทธิ์ของผู้ใช้งานเดิม

---

> ####  กรณีเลือก `ADD` (ขอสิทธิ์เข้าใช้งาน)


<img src="/image/isform/is-spc/cropped/form_detail_1.png" :style="radius" alt="form section" />

- **Platform**: เลือกระบบ เช่น `AS400` , `SCMWEB`
- **Class**: เลือกระดับการเข้าถึง เช่น `General`, `Almighty`
- **Category**: เลือกหมวดระบบ เช่น `DB`, `OS`, `APP`
- **Role**: หน้าที่ของผู้ใช้งาน เช่น `Administrator`, `User`
- **Duration Type**: ระยะเวลาการใช้งาน เช่น `Temporary`, `Permanent`
- **User Type**: ประเภทผู้ใช้งาน เช่น `System`, `Human`
- **Organizer**: หน่วยงานที่รับผิดชอบ เช่น `WSD`, `AAD`, `SSA`
- **Admin**: ผู้ดูแลระบบที่จะอนุมัติคำขอ (อ้างอิงจาก Platform ที่เลือก)
- **Owner**: เจ้าของบัญชีสิทธิ์
- **Reason**: เหตุผลในการขอใช้งาน


<!-- | รายการ         | คำอธิบาย |
|----------------|----------|
| **Platform**   | เลือกระบบที่ต้องการขอสิทธิ์ เช่น AS400, SAP *(จำเป็น)* |
| **Class**      | ระดับของสิทธิ์ เช่น Read-only, Full Access |
| **Category**   | หมวดหมู่ระบบ เช่น Finance, IT |
| **Role**       | หน้าที่ในระบบ เช่น Approver, Checker |
| **Duration Type** | ประเภทระยะเวลา เช่น Temporary, Permanent |
| **User Type**  | ประเภทผู้ใช้ เช่น Internal, External |
| **Organizer**  | ผู้ประสานงานระบบ |
| **Admin**      | ผู้ดูแลระบบที่จะอนุมัติคำขอ |
| **Owner**      | แสดงชื่อเจ้าของระบบ (ดึงอัตโนมัติ ไม่ต้องกรอก) |
| **Reason**     | ระบุเหตุผลในการขอสิทธิ์ เช่น “เข้าดูรายงานระบบบัญชี” *(จำเป็น)* -->

---

> ####  กรณีเลือก `DELETE` (ลบสิทธิ์ผู้ใช้งาน)

<img src="/image/isform/is-spc/cropped/delete_user_section.png" :style="radius" alt="form section" />

- **Platform**: ระบบที่ต้องการลบสิทธิ์
- **User For Delete**: ผู้ใช้งานที่ต้องการลบ
- **Admin**: ผู้ดูแลระบบที่จะอนุมัติคำขอ
- **Reason**: เหตุผลที่ขอลบสิทธิ์




