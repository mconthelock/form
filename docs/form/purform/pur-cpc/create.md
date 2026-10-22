# การสร้างฟอร์ม Price Comparison (PRO-CPC)

คู่มือการสร้างฟอร์มเปรียบเทียบราคา (Price Comparison) ประกอบด้วย 5 ขั้นตอนหลัก ดังแถบ Step ด้านบนของหน้าจอ

1. **New or Continue** — เลือกสร้างฟอร์มใหม่ หรือทำฟอร์ม Draft ต่อ
2. **Choose Pending Items** — เลือกรายการ Draft ที่ค้างอยู่ (เฉพาะโหมด Draft)
3. **Input Data** — กรอกข้อมูล Requester และเลือก Function
4. **Select Item Code** — เลือก Vendor, Mode และรายการ Item
5. **Upload File** — นำเข้าไฟล์ Excel และบันทึก/ส่งอนุมัติ


## ขั้นตอนที่ 1 : New or Continue

<FancyLightboxImage src="/image/purform/pur-cpc/create/step1.png"/>

เลือกวิธีการสร้างฟอร์ม โดยกดปุ่มใดปุ่มหนึ่ง

1. **New** — สร้างฟอร์มใหม่ (ระบบจะข้ามขั้นตอน Choose Pending Items ไปยังขั้นตอน Input Data ทันที)
2. **Draft** — ทำฟอร์มที่บันทึกเป็น Draft ไว้ต่อ (ระบบจะพาไปยังขั้นตอน Choose Pending Items)

::: tip
การ์ดด้านซ้ายจะแสดงข้อมูล **Inputer** (ผู้กรอกฟอร์ม) เมื่อเลือกโหมดแล้วจะมีการ์ดสีส้มแสดง MODE ที่เลือก (NEW / DRAFT) เพิ่มเข้ามา
:::


## ขั้นตอนที่ 2 : Choose Pending Items (เฉพาะโหมด Draft)

<FancyLightboxImage src="/image/purform/pur-cpc/create/step3-draft.png"/>

> ขั้นตอนนี้จะแสดงเฉพาะเมื่อเลือก **Draft** ในขั้นตอนที่ 1

1. ระบบแสดงตารางรายการฟอร์ม Draft ที่ยังไม่ได้ส่งอนุมัติ ประกอบด้วยข้อมูล Price Comparison no., Input by, Request by, Function, Planner, Mode, Vender Code, ยอดเงิน Present price / New price / Difference ฯลฯ
2. ใช้ช่องค้นหา (**ค้นหา**) หรือเลือกจำนวนแถวที่แสดง (dropdown ตัวเลข) เพื่อค้นหาฟอร์มที่ต้องการ
3. กด **ปุ่มวงกลม (radio)** หน้ารายการที่ต้องการทำต่อ (เลือกได้ครั้งละ 1 รายการ) — สามารถกดที่เลข Price Comparison no. เพื่อดูรายละเอียดได้
4. กดปุ่ม **Next** เพื่อไปขั้นตอนถัดไป หรือกด **Back** เพื่อย้อนกลับ


## ขั้นตอนที่ 3 : Input Data

<FancyLightboxImage src="/image/purform/pur-cpc/create/step2-new.png"/>

กรอกข้อมูลพื้นฐานของฟอร์ม

1. **Requester** — กรอกรหัสพนักงานของผู้ขอ (Requester) สูงสุด 5 หลัก
2. **Function** — เลือกสูตรการคำนวณเปรียบเทียบราคา 1 ข้อ จาก 6 ข้อ ดังนี้
   - 1. (Current Base Price x Exchange rate Policy x Usage) - (New Base Price x Exchange rate Policy x Usage)
   - 2. (Current CIF Price x Usage) - (New CIF Price x Usage)
   - 3. (Current ETA price x Usage) - (New ETA price x Usage)
   - 4. (Current CIF price x Ex-change policy x Usage) - (New CIF price x Ex-change policy x Usage)
   - 5. (Current CIF price x Ex-change policy x Usage) - (New CIF price x Ex-change policy x Usage)
   - 6. (Current Price ETA AMEC x Usage) - (New Price ETA AMEC x Usage)
3. กดปุ่ม **Next** เพื่อไปขั้นตอนถัดไป (ปุ่มจะใช้งานได้เมื่อกรอกข้อมูลครบ) หรือกด **Back** เพื่อย้อนกลับ

::: warning
ต้องกรอก Requester และเลือก Function ก่อน จึงจะกด Next ได้ หากยังไม่ครบระบบจะแจ้งเตือน
:::


## ขั้นตอนที่ 4 : Select Item Code

<FancyLightboxImage src="/image/purform/pur-cpc/create/step4.png"/>

เลือกรายการสินค้า (Item) ที่ต้องการเปรียบเทียบราคา

1. **Vendor** — เลือก Vendor จาก dropdown (เช่น MITSUBISHI ELECTRIC TRADING CO (10003))
2. **Mode** — เลือกโหมดการเปรียบเทียบ
   - **Add** — เพิ่มรายการเปรียบเทียบราคาใหม่
   - **Edit** — แก้ไขรายการเปรียบเทียบราคาที่มีอยู่
3. ตารางจะแสดงรายการ Item ของ Vendor ที่เลือก ประกอบด้วย Planner Code, Item, Drawing, Part Name, Spec, Vendor, Vendor Name
4. ติ๊กถูกที่ **checkbox** หน้ารายการ Item ที่ต้องการ (ติ๊กที่หัวตารางเพื่อเลือกทั้งหมดในหน้านั้น) — ใช้ช่องค้นหาหรือเลื่อนหน้า (pagination) เพื่อหา Item
5. กดปุ่ม **Price Compare Export** เพื่อ Export รายการ Item ที่ติ๊กเลือกไว้ออกเป็นไฟล์ Excel template (`Price Compare Upload Template - [Function] [วันที่].xlsx`) โดยไฟล์จะมีข้อมูล Item ที่เลือกใส่มาให้แล้ว (เช่น Function, Vendor, Mode, Item Code, Drawing) เหลือเพียงกรอกข้อมูลราคา (Price), จำนวน (Qty), สกุลเงิน และ Quotation No. ลงในไฟล์ จากนั้นนำไฟล์นี้ไป Import ในขั้นตอนที่ 5 (Upload File) เพื่อใช้เปรียบเทียบราคา

::: warning
ต้องเลือก **Mode** (Add/Edit) และติ๊กเลือก Item อย่างน้อย 1 รายการก่อนกด Export มิเช่นนั้นระบบจะแจ้งเตือน
:::

6. กดปุ่ม **Next** เพื่อไปขั้นตอนถัดไป หรือกด **Back** เพื่อย้อนกลับ

::: tip
การ์ดสีส้มด้านซ้ายจะแสดง **Price Comparison No.** (เลขที่ฟอร์ม เช่น PRO-CPC26-000004), MODE และ FUNCTION ที่เลือกไว้
:::


## ขั้นตอนที่ 5 : Upload File

<FancyLightboxImage src="/image/purform/pur-cpc/create/step5.png"/>

นำเข้าข้อมูลราคาจากไฟล์ Excel และบันทึกฟอร์ม

1. กดปุ่ม **Choose File** เพื่อเลือกไฟล์ Excel จากเครื่อง (รองรับเฉพาะไฟล์ `.xlsx` และ `.xls` เท่านั้น) โดยควรใช้ไฟล์ template ที่ Export มาจากขั้นตอนที่ 4
2. กดปุ่ม **Import & Map** เพื่อนำเข้าข้อมูลจากไฟล์เข้าสู่ตาราง

::: warning การตรวจสอบไฟล์ก่อน Import
เมื่อเลือกไฟล์ ระบบจะตรวจสอบข้อมูลในไฟล์อัตโนมัติ หากไม่ผ่านจะแจ้งเตือนและไม่อนุญาตให้ใช้ไฟล์นั้น โดยตรวจสอบดังนี้

1. ไฟล์ต้องไม่ว่างเปล่า (ต้องมีข้อมูลอย่างน้อย 1 แถว)
2. ทุกแถวต้องมีข้อมูล **Function** และต้องตรงกับ Function ที่เลือกไว้ในขั้นตอน Input Data
3. **Vendor** ในไฟล์ต้องตรงกับ Vendor ที่เลือกไว้ในขั้นตอน Select Item Code
4. **Mode** ในไฟล์ต้องตรงกับ Mode ที่เลือกไว้ (Add/Edit)
5. **New Vendor** (ถ้ามี) ต้องมีอยู่ในระบบ
6. โหมด **Edit** — ห้ามกรอกคอลัมน์ Old Item Compare
7. โหมด **Add** — หากกรอกคอลัมน์ Old Item Compare ต้องกรอกให้ครบทุกแถว และ Item ดังกล่าวต้องมีอยู่ในฐานข้อมูล (IIM)
:::

3. ตรวจสอบข้อมูลในตาราง ได้แก่ Job Item No., Part Name, Drawing No., Item Code, Spec., Material Code, Quantity/year, Vendor Name, Maker Name, Base Price, Price และ Price ETA ฯลฯ (ช่องสีเหลือง/เขียวคือข้อมูลราคา)
4. (ไม่บังคับ) กดปุ่ม **Price Compare Export** เพื่อ Export ข้อมูลออกเป็นไฟล์
5. เมื่อข้อมูลถูกต้อง ให้เลือกการดำเนินการ
   - **Save** — บันทึกฟอร์มเป็น Draft ไว้ทำต่อภายหลัง
   - **Request** — ส่งฟอร์มเพื่อขออนุมัติ (ระบบจะแสดงหน้าต่างยืนยันก่อนส่ง)
6. หากต้องการแก้ไขข้อมูล กดปุ่ม **Back** เพื่อย้อนกลับไปขั้นตอนก่อนหน้า

::: warning
ต้องมีข้อมูลในตารางอย่างน้อย 1 รายการ จึงจะสามารถ Save หรือ Request ได้
:::