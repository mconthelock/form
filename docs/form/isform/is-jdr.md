---
# layout: doc
title: "IS Form : JOB Result confirmation"
outline: deep # เปิดให้เมนูย่อยแสดงระดับที่ลึกขึ้น
---

# IS-JDR : JOB Result confirmation

โปรแกรมนี้ถูกพัฒนาขึ้นเพื่อใช้ในการ **สรุปผลการทำงานของ JOB ประจำเดือน** โดยมีวัตถุประสงค์เพื่อช่วยให้ผู้ดูแลระบบและผู้เกี่ยวข้องสามารถตรวจสอบและวิเคราะห์สถานะของ JOB ได้อย่างมีประสิทธิภาพ

ระบบจะรวบรวมข้อมูลการทำงานของ JOB ทั้งหมดในแต่ละเดือน และแสดงผลในรูปแบบรายงานโดยแบ่งข้อมูลออกเป็น:

- ☑️ **จำนวน JOB ที่ดำเนินการทั้งหมด**
- ✅ **จำนวน JOB ที่สำเร็จ (Completed)**
- 🔴 **จำนวน JOB ที่ไม่สำเร็จ (End Abnormal)**
- ⏭️ **จำนวน JOB ที่ถูกข้าม (Skip)**
- 🔁 **จำนวน JOB ที่มีการทำซ้ำ (Re-run)**


## 🗂 การจัดกลุ่มข้อมูล

ข้อมูลทั้งหมดจะถูกแยกตาม **แผนก (Section)** ได้แก่:

- AAS (AS/400 APPLICATIONS SECTION)
- WSD (WINDOWS SYSTEM SUPPORT AND DEVELOPMENT SECTION)


## วิธีเข้าฟอร์ม

1. เข้าลิงก์ http://webflow/form/

2. กรอกชื่อผู้ใช้และรหัสผ่าน
<img src="/image/isform/webformLogin.png" alt="form login" />

3. ฟอร์มจะปรากฎอยู่หน้า wait for approval

<img src="/image/isform/is-jdr/form.png" alt="Form" />




