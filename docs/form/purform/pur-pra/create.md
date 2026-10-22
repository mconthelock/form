# คู่มือการสร้างฟอร์ม Price Approval (PUR-PRA)

ฟอร์ม Price Approval มี 2 โหมดสำหรับระบุข้อมูล Price Comparison:

| โหมด | วิธีระบุ Price Comparison | การกรอกข้อมูลราคา |
| --- | --- | --- |
| **Auto input (จาก Price Comparison)** | เลือกฟอร์ม Price Comparison ที่ระบบแสดงให้ | ระบบเติม Vendor, Planner และยอดราคาให้อัตโนมัติ |
| **กรอกข้อมูลเอง (แนบไฟล์ Price Comparison)** | แนบไฟล์ Price Comparison รูปแบบ PDF | กรอกข้อมูล Vendor, Planner และยอดราคาในฟอร์ม |

## ขั้นตอนที่ 1: เลือกโหมดและระบุ Price Comparison

เลือกรูปแบบการกรอกก่อนเริ่มกรอกข้อมูลส่วนอื่น เพราะเมื่อเปลี่ยนโหมด ระบบจะล้างตารางเปรียบเทียบราคา และการเปลี่ยนไปใช้ Auto input จะล้างไฟล์ Price Comparison ที่แนบไว้

### Auto input (จาก Price Comparison)

<FancyLightboxImage src="/image/purform/pur-pra/create/detail.png"/>

1. กรอกรหัส **Requester** ก่อน ระบบใช้รหัสนี้ค้นหารายการ Price Comparison ที่เลือกได้
2. กด **View record** แล้วเลือกรายการ Price Comparison ที่ต้องการ
3. กด **Select** เพื่อยืนยันรายการ
4. ระบบแสดงตารางเปรียบเทียบราคา และเติมข้อมูล Vendor, Vendor Name, Planner, Present Total Price, New Total Price, Cost Down / Cost Up Amount และ Ratio ให้อัตโนมัติ

ระบบจะแสดงเฉพาะรายการ Price Comparison ที่ใช้สร้าง Price Approval ได้และสัมพันธ์กับ Requester ที่กรอก หากไม่พบรายการ ให้ตรวจสอบรหัส Requester หรือติดต่อผู้จัดทำ Price Comparison

### กรอกข้อมูลเอง (แนบไฟล์ Price Comparison)

1. เลือก **กรอกข้อมูลเอง (แนบไฟล์ Price Comparison)**
2. แนบไฟล์ Price Comparison ในช่อง **Refer Price compare file.** โดยเลือกไฟล์ PDF หรือลากไฟล์มาวาง ระบบจะแสดงตัวอย่าง PDF
3. กรอก **Vendor Code** และ **Planner Code** ระบบตรวจสอบรหัส Vendor และเติม Vendor Name ให้
4. กรอก **Present Total Price**, **New Total Price**, **Cost Down / Cost Up Amount** และ **Ratio** ด้วยตนเอง
5. ตรวจสอบข้อมูลและตัวอย่างไฟล์ก่อนส่งคำขอ

## ขั้นตอนที่ 2: กรอกข้อมูลเอกสารและสินค้า

<FancyLightboxImage src="/image/purform/pur-pra/create/item-detail.png"/>

กรอกข้อมูลที่จำเป็นในแต่ละช่อง ได้แก่ **Requester**, **Material Code**, **Maker (Business route)**, **Part Name**, **Model Name** และ **Job Item** จากนั้นเลือก **PCS Committee** และ **Group** ให้ตรงกับรายการ

หากเลือก Auto input ข้อมูล Vendor, Planner และราคาอ้างอิงจาก Price Comparison ที่เลือก ส่วนโหมดกรอกข้อมูลเองจะให้ระบุข้อมูลเหล่านี้ในฟอร์ม

## ขั้นตอนที่ 3: ระบุราคาและช่วงเวลาที่มีผล

<FancyLightboxImage src="/image/purform/pur-pra/create/price.png"/>

1. ตรวจสอบ Present Total Price, New Total Price, Cost Down / Cost Up Amount และ Ratio
2. เลือก **Effective Month** โดยระบุเดือนเริ่มต้นและเดือนสิ้นสุด
3. เลือก **Effective Type**: PO issue basis, Delivery basis หรือ Others
4. หากเลือก **Others** ให้กรอกรายละเอียดเพิ่มเติมในช่องที่แสดง

## ขั้นตอนที่ 4: เลือกเหตุผลการเปลี่ยนแปลง (Reason Change)

<FancyLightboxImage src="/image/purform/pur-pra/create/reason1.png"/>

<FancyLightboxImage src="/image/purform/pur-pra/create/reason2.png"/>

เหตุผลแบ่งเป็น 4 กลุ่ม ให้เลือกรายการที่อธิบายการเปลี่ยนแปลงได้ตรงที่สุด:

- **Cost Down** — เหตุผลกรณีต้นทุนลดลง
- **Cost Up** — เหตุผลกรณีต้นทุนเพิ่มขึ้น
- **Basic condition revise** — เหตุผลการปรับเงื่อนไขพื้นฐาน
- **Estimate price** — เหตุผลเกี่ยวกับราคา Estimate

รายการเหตุผลโหลดจากระบบ และอาจมีตัวเลือกย่อยหรือช่องกรอกรายละเอียดเพิ่มเติม:

- เลือก checkbox หรือ radio ตามรูปแบบที่แสดงบนหน้าจอ
- เมื่อเลือกรายการที่มีตัวเลือกย่อย ให้เลือกตัวเลือกย่อยที่เกี่ยวข้อง
- หากมีช่องข้อความ ตัวเลข หรือช่อง From / To ปรากฏขึ้น ให้กรอกข้อมูลที่จำเป็นก่อนส่งคำขอ
- เมื่อเปลี่ยนตัวเลือก radio ระบบจะซ่อนและล้างข้อมูลย่อยของตัวเลือกที่ไม่ได้เลือก

ในกลุ่ม **Estimate price** หากเลือก **PO issue with temporary price** (รายการลำดับที่ 1) ระบบจะไม่บังคับแนบ Quotation price เพิ่มเติม ส่วนเหตุผลอื่นต้องแนบ Quotation ตามเงื่อนไขของฟอร์ม

กรอก **Detail contents** เพื่ออธิบายข้อมูลประกอบ เช่น ราคา, Lead time และจำนวน/เดือนของ Stock ก่อนและหลังการเปลี่ยนแปลง สามารถแนบภาพประกอบในช่องใต้ Detail contents ได้

## ขั้นตอนที่ 5: แนบเอกสาร

<FancyLightboxImage src="/image/purform/pur-pra/create/attachment.png"/>

- **Quotation price (E-Stamp)** — แนบไฟล์ PDF โดยปกติเป็นไฟล์ที่ต้องมี ยกเว้นเมื่อเลือก Estimate price ลำดับที่ 1 ตามเงื่อนไขข้างต้น หรือเป็นฟอร์มที่ถูกส่งกลับและมีไฟล์ Quotation เดิมอยู่แล้ว
- **Additional document** — แนบเอกสารเพิ่มเติม (ไม่บังคับ)
- **Detail contents image** — แนบรูปภาพประกอบในส่วน Detail contents (ไม่บังคับ)

ไฟล์ในส่วน Attach file รองรับขนาดไม่เกิน **10 MB ต่อไฟล์** เลือกไฟล์จากเครื่องหรือลากไฟล์มาวางในช่องแนบ

> **หมายเหตุ:** ไฟล์ Price Comparison ในโหมดกรอกข้อมูลเองเป็นคนละช่องกับ Quotation price และ Additional document

## ขั้นตอนที่ 6: บันทึกหรือส่งคำขอ

<FancyLightboxImage src="/image/purform/pur-pra/create/request.png"/>

- กด **Draft** เพื่อบันทึกแบบร่าง โดยต้องระบุ Requester
- ตรวจสอบช่องที่มีเครื่องหมายจำเป็นและไฟล์แนบตามเงื่อนไขให้ครบ แล้วกด **Request** เพื่อส่งคำขอ
- หากต้องการกลับหน้าก่อนหน้า ให้กด **Back**

ก่อนส่งคำขอ ให้ตรวจสอบว่าเลือกโหมดถูกต้อง รายการ Price Comparison หรือไฟล์ PDF ตรงกับคำขอ เหตุผลสอดคล้องกับข้อมูลราคา และไฟล์แนบครบถ้วน