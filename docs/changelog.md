---
title: Change Log
roles:
  - "*"
---

# Change Log

บันทึกประวัติการเปลี่ยนแปลงสำคัญของระบบ **New Webflow (Form System)** และคู่มือการใช้งาน โดยยึดรูปแบบตามมาตรฐาน [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

---

## [0.2.0] - 2026-11-22

### Added
- **Documentation Role-Based Access Control**: เพิ่มระบบแยกสิทธิ์เอกสารตาม User Role (`ADMIN`, `REQUESTER`, `APPROVER`, `MANAGER`, `HR`, `GUEST`) เชื่อมต่อกับ Cookie และ IndexedDB (`userAuth`) ของ `@amec/webasset` พร้อม fallback `directlogin` API
- **Sidebar & Route Guard**: กรองเมนู Sidebar อัตโนมัติตามบทบาท, แสดงป้าย Role บน Navbar (`RoleBadge`), แถบสิทธิ์บนหัวเอกสาร และหน้าแจ้งเตือน **Access Restricted** เมื่อเข้าถึง URL ที่ไม่มีสิทธิ์
- **3D Interactive Home Background**: เพิ่มฉาก 3D ด้วย Three.js (`FormScene`) ในธีม Smart Office, เส้นทางอนุมัติเอกสารดิจิทัล และ Eco Zone ที่ปรับแสงตามเวลาจริงใน Light Mode และสลับเป็นโทนกลางคืนสว่างใน Dark Mode
- **Quick Start & Change Log**: เพิ่มหน้าภาพรวมระบบ (`/quick-start`) และหน้าบันทึกประวัติการเปลี่ยนแปลง (`/changelog`)
- **Purchase Order Approval**: เพิ่มหน้าจอและสคริปต์สำหรับกระบวนการอนุมัติใบสั่งซื้อ (Purchase Order Approval view)

### Changed
- **Report Module**: ปรับโฉมหน้าหน้ารายงาน (Report Index & Detail) ด้วยเลย์เอาต์และสไตล์ใหม่ให้อ่านง่ายขึ้น

---

## [0.1.1] - 2026-10-26

### Added
- **IS-DEV Form & E2E Testing**: เพิ่มความสามารถของแบบฟอร์ม `IS-DEV` และเพิ่มชุดทดสอบอัตโนมัติด้วย Playwright (`tests/e2e`)
- **Computer Name Lookup**: เพิ่ม `computer-list.js` สำหรับดึงชื่อเครื่องคอมพิวเตอร์จาก UID
- **PS-JUN Form**: เพิ่มฟังก์ชันการสร้างและแสดงผลแบบฟอร์ม `PS-JUN` พร้อมปรับปรุงการจัดการข้อมูล

### Changed
- **Form Submission & Validation**: ปรับปรุงการส่งข้อมูลหมวดหมู่ (category), ปีแผนงาน (plan year), ตัวเลือกวันที่ (date picker) และตรรกะการตรวจสอบความถูกต้องของฟอร์ม
- **PHP & Session Compatibility**: อัปเดต Session library, Blade Engine และปรับการจัดการ Exception ให้รองรับ PHP 8.4+ (ลบ constant `E_STRICT` ที่เลิกใช้)

### Fixed
- แก้ไข key ของประเภทผลประโยชน์ (`benefit type`) ในข้อมูลแบบฟอร์มและปรับปรุงการจัดการแถวการลงทุนในชุดทดสอบ
- แก้ไขชื่อฟอร์ม `IS-DEV` ใน `Form.php` และการจัดการข้อมูลใน `index.js`
- แก้ไขการแสดงชื่อเครื่องคอมพิวเตอร์ให้ใช้ `PC_NAME` แทน `NET_NAME`

---

## [0.1.0] - 2026-10-09

### Added
- **Excel to PDF & Stamp Workflow**: เพิ่มการแปลงไฟล์ Excel เป็น PDF, อัปโหลดไฟล์ PDF และการประทับตรา (stamp) ในขั้นตอนสุดท้ายของสายอนุมัติ
- **PUR-EVA & GP-TPH**: เพิ่มแบบฟอร์ม `PUR-EVA` และเงื่อนไขการตรวจสอบสิทธิ์ภาพถ่ายในแบบฟอร์ม `GP-TPH`

### Changed
- **PS-UPI Form**: ปรับปรุงการแสดงผลปุ่ม View Report ในแบบฟอร์ม `PS-UPI`

---

<RoleOnly :roles="['ADMIN']">

::: tip Template สำหรับทีมพัฒนา (Admin Only)
คัดลอกโครงสร้างด้านล่างไปวางต่อด้านบนของไฟล์ `docs/changelog.md` ทุกครั้งที่มีการ Release เวอร์ชันใหม่:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ระบุฟีเจอร์หรือแบบฟอร์มใหม่ที่เพิ่มเข้ามา

### Changed
- ระบุการปรับปรุงการทำงาน UI หรือประสิทธิภาพของส่วนที่มีอยู่เดิม

### Fixed
- ระบุบั๊กหรือข้อผิดพลาดที่ได้รับการแก้ไข
```
:::

</RoleOnly>
