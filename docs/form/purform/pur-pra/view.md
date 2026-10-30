# คู่มือการดูฟอร์ม Price Approval (PRO-PRA)

หน้า **View** ใช้แสดงข้อมูล Price Approval ที่บันทึกไว้เพื่อให้ผู้เกี่ยวข้องตรวจสอบ โดยข้อมูลในหน้านี้เป็นแบบอ่านอย่างเดียว ไม่สามารถแก้ไขจากหน้านี้ได้ ส่วนปุ่มดำเนินการท้ายหน้าอาจแตกต่างกันตามสถานะฟอร์มและสิทธิ์ของผู้ใช้

ฟอร์มแบ่งเป็น 6 ส่วนหลัก และอาจมีตาราง **Flow** แสดงประวัติการดำเนินการอนุมัติอยู่ด้านล่าง

## 1. ข้อมูลเอกสารและ Price Comparison

<FancyLightboxImage src="/image/purform/pur-pra/view/detail1.png"/>

- **Request form no.** — เลขที่เอกสาร Price Approval ใช้อ้างอิงฟอร์ม
- **Inputer** — ผู้กรอกหรือบันทึกข้อมูลในฟอร์ม
- **Requester** — ผู้ร้องขอให้ดำเนินการ
- **Refer Price compare** — ข้อมูลต้นทางที่ใช้อ้างอิงราคา โดยแสดงตามรูปแบบที่ใช้สร้างฟอร์ม:
  - หากเลือก Auto input จะแสดงตารางรายการเปรียบเทียบราคา
  - หากกรอกข้อมูลเอง จะแสดงตัวอย่างไฟล์ Price Comparison PDF

ตาราง Price Comparison สามารถค้นหาและเลื่อนดูรายการได้ หากมีปุ่ม **Price Compare Export** ผู้ใช้สามารถส่งออกรายการเปรียบเทียบเป็นไฟล์ Excel ได้

<FancyLightboxImage src="/image/purform/pur-pra/view/detail2.png"/>

กรณีแนบไฟล์ Price Comparison ระบบจะแสดง PDF ในตัวอ่านเอกสาร สามารถเลื่อนดูหน้าและตรวจสอบเนื้อหาในไฟล์ได้

## 2. รายละเอียดสินค้า (New Item)

<FancyLightboxImage src="/image/purform/pur-pra/view/item.png"/>

ส่วนนี้แสดงข้อมูล Vendor และรายการสินค้า ได้แก่:

- **Vendor Code / Vendor Name** — รหัสและชื่อผู้ขาย
- **Planner Code** — รหัส Planner
- **Material Code** — รหัส Material
- **Maker (Business route)** — ผู้ผลิตหรือข้อมูลเส้นทางธุรกิจ
- **Part Name / Model Name / Job Item** — รายละเอียดชื่อชิ้นส่วน รุ่น และ Job Item
- **PCS Committee** — คณะกรรมการที่เกี่ยวข้อง
- **Group** — กลุ่มงานที่เลือก

## 3. ข้อมูลราคา

<FancyLightboxImage src="/image/purform/pur-pra/view/price.png"/>

- **Present Total Price** — ยอดราคารวมปัจจุบัน หน่วย KB/YEAR
- **New Total Price** — ยอดราคารวมใหม่ หน่วย KB/YEAR
- **Cost Down (-) / Cost Up (+) Amount** — จำนวนเงินที่ลดลงหรือเพิ่มขึ้น หน่วย KB/YEAR
- **Cost Down (-) / Cost Up (+) Ratio %** — สัดส่วนการลดลงหรือเพิ่มขึ้นเป็นเปอร์เซ็นต์
- **Effective Month** — ช่วงเดือนที่ราคาใหม่มีผล
- **Effective Type** — เงื่อนไขวันที่มีผล เช่น PO issue basis, Delivery basis หรือ Others; หากเลือก Others จะแสดงรายละเอียดที่ระบุเพิ่ม

## 4. เหตุผลการเปลี่ยนแปลง (Reason Change - update)

<FancyLightboxImage src="/image/purform/pur-pra/view/reason1.png"/>

แสดงเหตุผลที่เลือกไว้ แบ่งเป็น **Cost Down**, **Cost Up**, **Basic condition revise** และ **Estimate price** หากเหตุผลมีตัวเลือกย่อยหรือรายละเอียดเพิ่มเติม ระบบจะแสดงค่าที่บันทึกไว้ใต้รายการนั้น

<FancyLightboxImage src="/image/purform/pur-pra/view/reason2.png"/>

ส่วน **Detail contents** แสดงคำอธิบายเพิ่มเติมของผู้ขอ และรูปภาพประกอบที่แนบไว้ ใช้ดูบริบทของการเปลี่ยนแปลง เช่น ราคา Lead time และจำนวนหรือเดือนของ Stock ก่อนและหลัง

## 5. ไฟล์แนบ (Attach file)

<FancyLightboxImage src="/image/purform/pur-pra/view/attachment.png"/>

- **Quotation price (E-Stamp)** — รายการไฟล์ Quotation ที่แนบกับฟอร์ม
- **Additional document** — เอกสารประกอบเพิ่มเติม

ไฟล์จะแสดงเป็นรายการชื่อเอกสาร ผู้ใช้สามารถคลิกชื่อไฟล์เพื่อเปิดหรือดาวน์โหลดมาตรวจสอบได้

## 6. หมายเหตุ (Remark)

กรอบ Remark เป็นคำแนะนำประกอบการกรอก ไม่ใช่หมายเหตุที่ผู้อนุมัติระบุในแต่ละรายการ โดยเน้นให้:

- อธิบายราคา, Lead time และจำนวน/เดือนของ Stock ก่อนและหลัง สำหรับ Localization
- อธิบายเงื่อนไขเดิมและเงื่อนไขใหม่ สำหรับ Basic condition revise
- พิจารณาเงื่อนไขการอนุมัติตาม BP-QP-B005

สำหรับรายละเอียดวิธีสร้างหรือแก้ไขฟอร์ม ดู [คู่มือสร้างฟอร์ม](./create.md) และ [คู่มือหน้า Return](./return.md)