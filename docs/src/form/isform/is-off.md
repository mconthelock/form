---
# layout: doc
title: "IS Form : Varied off AS400 display"
outline: deep # เปิดให้เมนูย่อยแสดงระดับที่ลึกขึ้น
---

# IS-OFF : Varied off AS400 display

โปรแกรมนี้ถูกออกแบบมาเพื่อใช้ในการรายงานกรณีการเข้าใช้งานไม่สำเร็จ (Login Failed) ของแต่ละแผนก (Section) โดยระบบจะทำการสร้างฟอร์มรายงานขึ้นในทุกวันพุธของแต่ละสัปดาห์โดยอัตโนมัติ เพื่อให้สามารถติดตามและตรวจสอบปัญหาการเข้าใช้งานได้อย่างมีประสิทธิภาพ

## วิธีเข้าฟอร์ม

1. เข้าลิงก์ http://webflow/form/

2. กรอกชื่อผู้ใช้และรหัสผ่าน
<img src="/image/isform/webformLogin.png" alt="form login" />

3. ฟอร์มจะปรากฎอยู่หน้า wait for approval

<img src="/image/isform/is-off/form.png" alt="Form" />

::: tip 💡 Tip :
* สามารถนำเมาส์ชี้ที่รูปบุคคลเพื่อแสดงชื่อและรหัสพนักงาน
:::
