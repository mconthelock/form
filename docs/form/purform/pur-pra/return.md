# คู่มือการแก้ไขฟอร์ม Price Approval ที่ถูก Return (PRO-PRA)

เมื่อผู้อนุมัติส่งฟอร์มกลับมา (Return) ผู้ขอหรือผู้กรอกฟอร์มสามารถตรวจสอบและแก้ไขข้อมูลเดิมได้ ระบบจะโหลดข้อมูล Price Approval, เหตุผล และไฟล์แนบเดิมกลับมาให้แก้ไข

ฟอร์มที่ถูก Return มี 2 รูปแบบตามวิธีระบุ Price Comparison:

| รูปแบบ | สิ่งที่แสดงในฟอร์ม Return | วิธีแก้ Price Comparison |
| --- | --- | --- |
| **Auto input (จาก Price Comparison)** | เลขที่ Price Comparison และตารางเปรียบเทียบราคา | กด **Edit Price Comparison** เพื่อแก้ฟอร์ม Price Comparison ที่เชื่อมอยู่ |
| **กรอกข้อมูลเอง (แนบไฟล์ Price Comparison)** | ไฟล์ Price Comparison PDF เดิมและตัวอย่างไฟล์ | เลือกไฟล์ PDF ใหม่เพื่อแทนไฟล์เดิม หากมีการแก้ไข |

รูปแบบที่แสดงจะอ้างอิงจากข้อมูลเดิมของฟอร์ม โดยส่วนข้อมูลอื่น ๆ เช่น รายละเอียดสินค้า ราคา เหตุผล และไฟล์แนบ ใช้วิธีแก้ไขเช่นเดียวกับหน้า Create ดูรายละเอียดการกรอกแต่ละช่องได้ที่ [คู่มือสร้างฟอร์ม](./create.md)

## 1. ตรวจสอบข้อมูลที่ถูก Return

<FancyLightboxImage src="/image/purform/pur-pra/return/detail.png"/>

ตรวจสอบ Request no., Inputer, Requester และข้อมูลในฟอร์มที่ระบบโหลดกลับมา จากนั้นแก้เฉพาะส่วนที่ต้องการให้ถูกต้องตาม Remark หรือข้อเสนอแนะจากผู้อนุมัติ

## 2. แก้ไข Price Comparison

### กรณี Auto input

<FancyLightboxImage src="/image/purform/pur-pra/return/edit-price-comp.png"/>

1. กด **Edit Price Comparison** ระบบจะเปิดฟอร์ม Price Comparison ที่เชื่อมกับ Price Approval ในแท็บใหม่
2. หน้าแก้ไขจะเริ่มที่ขั้นตอน **Select Item Code** โดยขั้นตอน New or Continue, Choose Pending Items และ Input Data ถูกล็อกไว้ จึงไม่สามารถเปลี่ยน **Function** ได้
3. ตรวจสอบและแก้ไข Vendor, โหมดเปรียบเทียบ **Add / Edit** และรายการ Item ที่ต้องการ
4. ไปยังขั้นตอน Upload File และกด **Save** เพื่อบันทึก Price Comparison
5. เมื่อบันทึกสำเร็จ แท็บ Price Comparison จะปิด และข้อมูล Vendor, Planner, ยอดราคา, Ratio รวมถึงตารางเปรียบเทียบจะ Sync กลับมาแสดงในฟอร์ม Price Approval อัตโนมัติ

> **ข้อจำกัด:** ในการแก้ Price Comparison ที่มาจากการ Return ให้แก้ได้เฉพาะ Vendor, โหมด Add / Edit และรายการ Item ที่เกี่ยวข้อง ไม่สามารถเปลี่ยน Function ได้

### กรณีกรอกข้อมูลเองและแนบไฟล์

<FancyLightboxImage src="/image/purform/pur-pra/return/edit-pdf.png"/>

ระบบจะแสดงไฟล์ Price Comparison เดิมและตัวอย่าง PDF ในฟอร์ม หากต้องการแก้เอกสาร ให้เลือกไฟล์ PDF ฉบับใหม่ในช่อง **Refer Price compare file.** และตรวจสอบตัวอย่างไฟล์ก่อนบันทึกหรือส่งกลับเข้าสู่การอนุมัติ

## 3. ตรวจสอบและแก้ไขข้อมูลส่วนอื่น

### รายละเอียดสินค้า

<FancyLightboxImage src="/image/purform/pur-pra/return/item-detail.png"/>

ตรวจสอบ Vendor, Planner, Material Code, Maker, Part Name, Model Name, Job Item, PCS Committee และ Group ให้ตรงกับข้อมูลที่แก้ไขใน Price Comparison และเอกสารประกอบ

### ราคาและช่วงเวลาที่มีผล

<FancyLightboxImage src="/image/purform/pur-pra/return/price.png"/>

ตรวจสอบ Present Total Price, New Total Price, Cost Down / Cost Up Amount, Ratio, Effective Month และ Effective Type หากเลือก Others ให้ตรวจสอบรายละเอียดที่ระบุไว้ด้วย

### เหตุผลการเปลี่ยนแปลง

<FancyLightboxImage src="/image/purform/pur-pra/return/reason1.png"/>

<FancyLightboxImage src="/image/purform/pur-pra/return/reason2.png"/>

ตรวจสอบเหตุผลในกลุ่ม Cost Down, Cost Up, Basic condition revise และ Estimate price ให้สอดคล้องกับข้อมูลที่แก้ไข หากเลือกเหตุผลที่มีตัวเลือกย่อยหรือช่องกรอกรายละเอียด ให้ตรวจสอบข้อมูลเหล่านั้นด้วย

ตรวจสอบ **Detail contents** และรูปภาพประกอบ โดยระบุรายละเอียดก่อนและหลังการเปลี่ยนแปลงให้ชัดเจน

### ไฟล์แนบ

<FancyLightboxImage src="/image/purform/pur-pra/return/attachment.png"/>

ตรวจสอบ Quotation price (E-Stamp), Additional document และไฟล์ภาพประกอบ ลบไฟล์ที่ไม่ถูกต้องหรือแนบไฟล์ฉบับแก้ไขตามความจำเป็น ไฟล์ในส่วน Attach file รองรับขนาดไม่เกิน **10 MB ต่อไฟล์** และ Quotation ยังคงเป็นไฟล์ที่ต้องมี เว้นแต่เข้าเงื่อนไขยกเว้นตามเหตุผลที่เลือกหรือมีไฟล์เดิมอยู่แล้ว

## 4. บันทึกและส่งกลับเข้าสู่การอนุมัติ

<FancyLightboxImage src="/image/purform/pur-pra/return/action.png"/>

- **Save** — บันทึกการแก้ไขในฟอร์ม Return โดยยังไม่ส่งกลับเข้าสู่ขั้นอนุมัติ
- **Approve** — ยืนยันและส่งฟอร์มที่แก้ไขแล้วเข้าสู่กระบวนการอนุมัติ
- **Reject** — ปฏิเสธฟอร์มตามกระบวนการ
- **Back** — กลับออกจากหน้าปัจจุบัน

> **สำคัญ:** เมื่อแก้ไขฟอร์มที่ถูก Return แล้วกด Approve ระบบจะเริ่ม Flow การอนุมัติใหม่ตั้งแต่ต้น เนื่องจากมีการเปลี่ยนแปลงข้อมูล ผู้อนุมัติทุกคนต้องตรวจสอบและอนุมัติใหม่ทั้งหมด สถานะอนุมัติก่อน Return จะไม่ถือว่าเป็นการอนุมัติของข้อมูลฉบับแก้ไข