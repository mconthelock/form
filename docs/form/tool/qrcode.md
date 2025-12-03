# คู่มือการใช้งาน QR Code API

Base URL: `https://amecweb.mitsubishielevatorasia.co.th/api/qrcode`

## สร้าง QR Code จากข้อความ (Data URL)

สร้าง QR Code จากข้อความทั่วไปและส่งกลับมาเป็น Data URL (Base64)

- **Endpoint:** `POST /qrcode/generate`
- **Body (JSON):**
  ```json
  {
    "text": "ข้อความที่ต้องการสร้าง QR Code",
    "options": {
      "width": 300,
      "margin": 2,
      "color": {
        "dark": "#000000",
        "light": "#FFFFFF"
      }
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "qrCode": "data:image/png;base64,iVBORw0KGgo...",
      "text": "ข้อความที่ต้องการสร้าง QR Code"
    }
  }
  ```

---

## สร้าง QR Code สำหรับ URL

สร้าง QR Code ที่เมื่อสแกนแล้วจะเปิดลิงก์ URL

- **Endpoint:** `POST /qrcode/url`
- **Body (JSON):**
  ```json
  {
    "url": "https://www.example.com",
    "options": {
      "width": 300
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "qrCode": "data:image/png;base64,iVBORw0KGgo...",
      "url": "https://www.example.com"
    }
  }
  ```

---

## สร้าง QR Code สำหรับ Email

สร้าง QR Code ที่เมื่อสแกนแล้วจะเปิดแอปอีเมลพร้อมกรอกข้อมูลเบื้องต้น

- **Endpoint:** `POST /qrcode/email`
- **Body (JSON):**
  ```json
  {
    "email": "example@test.com",
    "subject": "หัวข้ออีเมล",
    "body": "เนื้อหาอีเมล",
    "options": {
      "width": 300
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "qrCode": "data:image/png;base64,iVBORw0KGgo...",
      "email": "example@test.com",
      "subject": "หัวข้ออีเมล",
      "body": "เนื้อหาอีเมล"
    }
  }
  ```

---

## สร้าง QR Code สำหรับ WiFi

สร้าง QR Code สำหรับเชื่อมต่อ WiFi อัตโนมัติ

- **Endpoint:** `POST /qrcode/wifi`
- **Body (JSON):**

  ```json
  {
    "ssid": "ชื่อ WiFi",
    "password": "รหัสผ่าน",
    "security": "WPA",
    "hidden": false,
    "options": {
      "width": 300
    }
  }
  ```

  _หมายเหตุ: `security` รองรับ 'WPA', 'WEP', 'nopass'_

- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "qrCode": "data:image/png;base64,iVBORw0KGgo...",
      "ssid": "ชื่อ WiFi",
      "security": "WPA",
      "hidden": false
    }
  }
  ```

---

## สร้าง QR Code เป็น SVG String

สร้าง QR Code และส่งกลับมาเป็นโค้ด SVG (เหมาะสำหรับนำไปฝังใน HTML)

- **Endpoint:** `POST /qrcode/svg`
- **Body (JSON):**
  ```json
  {
    "text": "Hello World",
    "options": {
      "width": 300
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ... </svg>",
      "text": "Hello World"
    }
  }
  ```

---

## สร้าง QR Code เป็นไฟล์รูปภาพ (PNG)

เรียกผ่าน URL โดยตรงเพื่อแสดงผลเป็นรูปภาพ PNG

- **Endpoint:** `GET /qrcode/image`
- **Query Parameters:**

  - `text` (จำเป็น): ข้อความที่ต้องการสร้าง
  - `width`: ความกว้าง (default: 256)
  - `margin`: ขอบ (default: 2)
  - `dark`: สี QR Code (Hex code, default: #000000)
  - `light`: สีพื้นหลัง (Hex code, default: #FFFFFF)

- **ตัวอย่างการเรียกใช้:**
  `/qrcode/image?text=Hello&width=300&dark=%23FF0000`

- **Response:** ไฟล์รูปภาพ PNG

---

## สร้าง QR Code เป็นไฟล์รูปภาพ (SVG)

เรียกผ่าน URL โดยตรงเพื่อแสดงผลเป็นรูปภาพ SVG

- **Endpoint:** `GET /qrcode/svg-image`
- **Query Parameters:**

  - `text` (จำเป็น): ข้อความที่ต้องการสร้าง
  - `width`: ความกว้าง (default: 256)
  - `margin`: ขอบ (default: 2)
  - `dark`: สี QR Code (Hex code, default: #000000)
  - `light`: สีพื้นหลัง (Hex code, default: #FFFFFF)

- **ตัวอย่างการเรียกใช้:**
  `/qrcode/svg-image?text=Hello&width=300`

- **Response:** ไฟล์รูปภาพ SVG
