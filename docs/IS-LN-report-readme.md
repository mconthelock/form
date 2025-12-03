# IS-LN: LN User Registration Form - Report/View Page

## สร้างแล้ว

หน้า report/view สำหรับแสดงฟอร์ม **LN User Registration** พร้อมรายละเอียดและประวัติการอนุมัติ

## ไฟล์ที่สร้าง/แก้ไข

### 1. View Files
- **`application/views/isform/IS-LN/view.blade.php`**
  - หน้าแสดงรายละเอียดฟอร์ม LN User Registration
  - แสดงข้อมูลผู้ขอ (Input By, Request By)
  - แสดงข้อมูลพนักงาน (UserID, Name, Department, Section)
  - แสดง Program Requisition (Action, Group Code, Remark)
  - แสดง Permissions/Roles ที่ขอ
  - แสดงสถานะฟอร์มและประวัติการอนุมัติ
  - ปุ่ม Approve/Reject (สำหรับผู้อนุมัติ)
  - ปุ่ม Print และ Back

### 2. Controller Files
- **`application/controllers/isform/IS-LN/main.php`**
  - เพิ่มเมธอด `getFormViewData()` สำหรับดึงข้อมูลฟอร์มพร้อมรายละเอียด
  - เพิ่มเมธอด `submitApproval()` สำหรับการอนุมัติ/ปฏิเสธฟอร์ม
  - แก้ไขเมธอด `index()` เพื่อรองรับการแสดงหน้า view

### 3. JavaScript Files
- **`assets/script/isform/IS-LN/view.js`**
  - ใช้ jQuery และ ES6 modules (import/export)
  - Import utilities จาก `utils.js` และ `_form.js`
  - จัดการการแสดงผลหน้า view
  - จัดการการ approve/reject ฟอร์ม ผ่านเมธอด `doaction`
  - ใช้ SweetAlert2 สำหรับแสดง modal ยืนยัน
  - แสดง workflow/flow ด้วย `showFlow()`
  - ส่งข้อมูลไปยัง API สำหรับอัพเดทสถานะ

### 4. Webpack Configuration
- **`webpack.config.js`**
  - เพิ่ม entry point: `lnUserRegView` สำหรับหน้า view

### 5. Database Documentation
- **`docs/IS-LN-database.sql`**
  - โครงสร้างตารางฐานข้อมูลสำหรับ IS-LN
  - ตาราง: ISLN_FORM, ISLN_FORM_PERMISSION, ISLN_ACTION, ISLN_MODULE, ISLN_ROLE

## คุณสมบัติหลัก

### 1. แสดงข้อมูลฟอร์ม
- **Form Description**: ข้อมูลผู้กรอกและผู้ขอ พร้อมวันที่สร้าง
- **User Description**: ข้อมูลพนักงานที่ต้องการลงทะเบียน
- **Program Requisition**: แสดง Action ที่เลือก (Add, Delete, Transfer, etc.) พร้อม Group Code
- **Permissions/Roles**: แสดง Modules และ Permissions ที่ขอในรูปแบบตาราง

### 2. Approval Flow
- แสดงประวัติการอนุมัติ (Approval History)
- แสดงลำดับผู้อนุมัติ, การตัดสิน, วันเวลา และคอมเมนต์
- ปุ่ม Approve/Reject สำหรับผู้อนุมัติที่มีสิทธิ์

### 3. การจัดการสถานะ
- ระบบตรวจสอบสิทธิ์ผู้ใช้อัตโนมัติ
- แสดงปุ่ม Approve/Reject เฉพาะผู้ที่มีสิทธิ์อนุมัติ
- ใช้ modal สำหรับยืนยันการอนุมัติ/ปฏิเสธ พร้อมช่องกรอกคอมเมนต์

### 4. การแสดงผล
- Responsive Design รองรับทุกอุปกรณ์
- ใช้ DaisyUI components สำหรับ UI ที่สวยงาม
- มี Badge แสดงสถานะและ Action type
- สามารถพิมพ์ฟอร์มได้ (ซ่อนปุ่มต่างๆ เมื่อพิมพ์)

## วิธีการใช้งาน

### 1. เข้าถึงหน้า View
```
GET /isform/IS-LN/main?no={NFRMNO}&orgNo={VORGNO}&y={CYEAR}&y2={CYEAR2}&runNo={NRUNNO}
```

ตัวอย่าง:
```
https://your-domain.com/isform/IS-LN/main?no=17&orgNo=050601&y=25&y2=2025&runNo=1
```

### 2. การอนุมัติ/ปฏิเสธ
- คลิกปุ่ม "Approve" หรือ "Reject"
- กรอกคอมเมนต์ (ถ้าต้องการ)
- ยืนยันการทำรายการ
- ระบบจะอัพเดทสถานะและส่งต่อ workflow

### 3. การพิมพ์ฟอร์ม
- คลิกปุ่ม "Print"
- ระบบจะซ่อยปุ่มต่างๆ และแสดงเฉพาะข้อมูลสำหรับพิมพ์

## API Endpoints

### 1. Get Form Data (GET)
```php
/isform/IS-LN/main?no={NFRMNO}&orgNo={VORGNO}&y={CYEAR}&y2={CYEAR2}&runNo={NRUNNO}
```

### 2. Submit Approval (POST)
```php
/isform/IS-LN/main/submitApproval
```

Request Body:
```json
{
  "nfrmno": "17",
  "vorgno": "050601",
  "cyear": "25",
  "cyear2": "2025",
  "nrunno": 1,
  "action": "approve",
  "comment": "Approved"
}
```

Response:
```json
{
  "success": true,
  "message": "Form approved successfully"
}
```

## ขั้นตอนการติดตั้ง

### 1. Build JavaScript
```bash
npm run build
```

หรือสำหรับ development:
```bash
npm run dev
```

### 2. สร้างตารางฐานข้อมูล
รันคำสั่ง SQL ใน `docs/IS-LN-database.sql`

### 3. ตรวจสอบการตั้งค่า
- ตรวจสอบว่า `FORMMST` มีข้อมูล IS-LN แล้ว
- ตรวจสอบว่ามี Workflow ที่เหมาะสม
- ตรวจสอบสิทธิ์การเข้าถึงของผู้ใช้

## การปรับแต่ง

### 1. เปลี่ยนสีและสไตล์
แก้ไขไฟล์ `application/views/isform/IS-LN/view.blade.php`:
```php
<!-- เปลี่ยนสี badge -->
<span class="badge badge-success">...</span>

<!-- เปลี่ยนสี alert -->
<div class="alert alert-warning">...</div>
```

### 2. เพิ่มฟิลด์ข้อมูล
1. เพิ่มฟิลด์ในตาราง `ISLN_FORM`
2. อัพเดทเมธอด `getFormViewData()` ใน controller
3. แก้ไข view เพื่อแสดงฟิลด์ใหม่

### 3. ปรับแต่ง Approval Flow
แก้ไขเมธอด `submitApproval()` ใน controller:
```php
public function submitApproval() {
    // Custom validation
    // Custom business logic
    // Call doaction method
}
```

## การแก้ไขปัญหา

### 1. ไม่พบข้อมูลฟอร์ม
- ตรวจสอบพารามิเตอร์ URL ว่าถูกต้อง
- ตรวจสอบว่ามีข้อมูลในตาราง `ISLN_FORM`

### 2. ปุ่ม Approve/Reject ไม่แสดง
- ตรวจสอบสถานะฟอร์ม (ต้องเป็น status = '1')
- ตรวจสอบว่าผู้ใช้เป็นผู้อนุมัติในลำดับปัจจุบัน
- ตรวจสอบ session ว่ามี empno

### 3. JavaScript ไม่ทำงาน
- ตรวจสอบว่า build webpack สำเร็จ
- ตรวจสอบ console เพื่อดู error
- ตรวจสอบว่า SweetAlert2 โหลดสำเร็จ

## ตัวอย่างการใช้งาน

### ตัวอย่าง 1: ดูรายละเอียดฟอร์ม
```
URL: /isform/IS-LN/main?no=17&orgNo=050601&y=25&y2=2025&runNo=1
```
ผู้ใช้จะเห็นรายละเอียดฟอร์ม LN User Registration พร้อมข้อมูลทั้งหมด

### ตัวอย่าง 2: อนุมัติฟอร์ม
1. เข้าหน้า view
2. คลิกปุ่ม "Approve"
3. กรอกคอมเมนต์: "อนุมัติตามที่ขอ"
4. กดยืนยัน
5. ระบบจะอัพเดทสถานะและส่งต่อให้ผู้อนุมัติคนถัดไป

### ตัวอย่าง 3: ปฏิเสธฟอร์ม
1. เข้าหน้า view
2. คลิกปุ่ม "Reject"
3. กรอกคอมเมนต์: "ข้อมูลไม่ครบถ้วน"
4. กดยืนยัน
5. ระบบจะอัพเดทสถานะเป็น Rejected และแจ้งเตือนผู้ที่เกี่ยวข้อง

## หมายเหตุ

- ระบบใช้ trait `_Form` สำหรับจัดการ workflow
- การอนุมัติใช้เมธอด `doaction()` จาก trait
- รองรับการแสดงผลแบบ responsive
- มีการตรวจสอบสิทธิ์อัตโนมัติ

## การพัฒนาต่อ

### แนวทางที่แนะนำ:
1. เพิ่มการส่งอีเมลแจ้งเตือนเมื่อมีการอนุมัติ/ปฏิเสธ
2. เพิ่มการแนบไฟล์เอกสารประกอบ
3. เพิ่มการแสดงผลแบบ timeline สำหรับ approval history
4. เพิ่มการ export เป็น PDF
5. เพิ่มการค้นหาและกรองฟอร์ม

---

**สร้างเมื่อ:** 5 พฤศจิกายน 2025  
**เวอร์ชัน:** 1.0.0  
**ผู้พัฒนา:** GitHub Copilot
