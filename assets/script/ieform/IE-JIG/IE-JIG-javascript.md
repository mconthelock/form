# คู่มือ JavaScript: IE-JIG

เอกสารอธิบายโค้ดใน `D:\php8.5\src\form\assets\script\ieform\IE-JIG` ครบทั้ง 9 ไฟล์ โดยอ้างอิง JavaScript และ Blade view ที่อ่านขณะจัดทำเอกสาร วันที่ 12 พฤศจิกายน 2026 ไม่ใช่ผลทดสอบการทำงานใน browser

## 1. ภาพรวมและจุดเริ่มทำงาน

โมดูลใช้ jQuery เริ่มทำงานเมื่อ document พร้อม จากนั้นใช้ DOM API ควบคุมฟอร์ม, SweetAlert2 แสดงข้อความยืนยัน และ Flatpickr สำหรับวันที่ ส่วน API ส่วนใหญ่เรียกผ่าน `@amec/webasset`

| Entry ใน `assets/script/ieform/entry.js` | Source | Bundle ที่ view โหลด | หน้าที่ |
| --- | --- | --- | --- |
| `iejig` | `main.js` | `assets/dist/js/iejig.js` | สร้าง JIG และเปิดฟอร์ม CREATE / INSPECTION เพื่อดูหรืออนุมัติ |
| `iejigDelete` | `delete.js` | `assets/dist/js/iejigDelete.js` | สร้างและอนุมัติคำขอลบ JIG |

View ที่เกี่ยวข้องอยู่ใน `D:\php8.5\src\form\application\views\ieform\IE-JIG`:

- `request_form.blade.php`: ฟอร์มข้อมูล JIG, ไฟล์อ้างอิง, NG, Recheck และปุ่มอนุมัติ
- `checkpoint_fields.blade.php`: โครงตาราง Check Points ที่ request form include
- `approve_form.blade.php`: extends request form จึงใช้โครง UI ร่วมกัน
- `delete_form.blade.php`: หน้าคำขอลบและปุ่มอนุมัติคำขอลบ

ความสัมพันธ์ของไฟล์:

```text
main.js
  ├─ data.js                 API และ URL ของไฟล์
  ├─ checkpoint.js           ประเมินผลตรวจ
  ├─ payload.js              แปลงข้อมูลฟอร์มและวันที่
  ├─ recheck.js              บันทึกผลแก้ไขและตรวจซ้ำ
  └─ workflow.js             สร้าง/บันทึก/อนุมัติฟอร์ม
       ├─ data.js
       ├─ payload.js
       └─ revision.js        คำนวณ revision เมื่อข้อมูลจุดตรวจเปลี่ยน

delete.js
  ├─ data.js
  ├─ payload.js              ใช้ displayDate
  └─ delete-workflow.js      สร้าง/อนุมัติ/ซิงก์คำขอลบ
       └─ data.js
```

## 2. Context ที่ส่งจาก view

| Element | ข้อมูล | ผู้ใช้งาน |
| --- | --- | --- |
| `.form-data` | `data-nfrmno`, `data-vorgno`, `data-cyear`, `data-cyear2`, `data-nrunno`, `data-empno`, `data-mode`, `data-cstepno`, `data-exdata` | workflow, revision และ recheck; data.js ใช้เป็นแหล่งรหัสพนักงานสำรองตอนลบไฟล์ |
| `#jig-page` | `data-mode` เป็น `create`, `edit` หรือ `view` | main.js ใช้กำหนดพฤติกรรมหน้า |
| `#jig-delete-page` | key ฟอร์ม, `data-jigno`, `data-empno`, `data-mode`, `data-page-mode`, `data-cstepno`, `data-cst`, `data-exdata` | delete.js และ delete-workflow.js |
| `meta[name="base_url"]` | URL หลักของเว็บ | data.js ใช้เรียก PHP controller สำหรับไฟล์และเริ่ม request |

**ระวังชื่อ mode:** `#jig-page.dataset.mode` คือโหมดหน้า (`create/edit/view`) แต่ `.form-data.dataset.mode` คือ context ของ Webflow ซึ่งโค้ดตรวจค่า `'2'` ก่อนเปิดการอนุมัติ สำหรับหน้าลบใช้ `dataset.pageMode` แยกจาก `dataset.mode`

Key ที่ใช้ระบุฟอร์มประกอบด้วย `NFRMNO`, `VORGNO`, `CYEAR`, `CYEAR2`, `NRUNNO` โดย workflow แปลง `NFRMNO` และ `NRUNNO` เป็นตัวเลข

## 3. main.js — ตัวควบคุมหน้าฟอร์ม JIG

เป็น entry หลักของหน้า request/approve ภายใน `$(document).ready()` สร้าง object `JIG` เพื่อดูแลสถานะหน้า, dropdown, ผู้ร้องขอ, จุดตรวจ, NG และไฟล์แนบ แล้วส่ง editor interface ให้ workflow และ recheck

### ฟังก์ชันหลัก

| กลุ่มฟังก์ชัน | หน้าที่ |
| --- | --- |
| `init()` | ตรวจว่ามีฟอร์ม ปิด loading แล้วเริ่มส่วนต่าง ๆ รวมถึงเพิ่ม Check Point แรก |
| `initHeader()` | อ่านโหมดหน้า ตั้ง Start Use เป็นวันที่ 1 ของเดือนปัจจุบันตาม Asia/Bangkok และตั้ง date picker ของ Plan Date |
| `loadMaster()`, `loadSelect()` | โหลด PIC, process และ location; เรียงตัวเลือกและแจ้งข้อผิดพลาดเมื่อโหลดไม่สำเร็จ |
| `initInputBy()`, `initRequester()` | แสดงชื่อผู้กรอก และตรวจ Requested By เป็นพนักงาน active; รับรหัสตัวเลขไม่เกิน 5 หลักและกันผลค้นหาเก่าทับผลล่าสุด |
| `bindCheckpointEvents()`, `addRow()` | เพิ่ม/ลบแถว และประเมินผลเมื่อแก้ค่าที่วัด; ถ้าแก้ MIN/MAX จะล้าง Measured |
| `renderResult()`, `summarize()` | แสดง OK/NG, สีแถว, ลำดับแถว, จำนวนจุดตรวจ และเปิด/ปิดส่วน NG |
| `initNgActions()`, `validateNgActions()` | ตรวจการเลือก Adjust/Modify/Replace และกันเปิด NG Tag ก่อนมี key ที่บันทึกแล้ว |
| `initFiles()`, `bindFileEvents()`, `addFiles()`, `renderFiles()` | รับไฟล์ผ่าน file picker/ลากวาง, กันไฟล์ซ้ำ, แสดงลิงก์ไฟล์เดิมและปุ่มลบ |
| `bindPriceEvents()` | ตรวจราคาเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป |
| `validate()` | รวมข้อผิดพลาดก่อนบันทึก: ช่องบังคับ, Requested By ที่ตรวจแล้ว, จุดตรวจอย่างน้อย 1 แถว, ไฟล์อ้างอิงอย่างน้อย 1 ไฟล์ และ NG Detail เมื่อมี NG |
| `hydrate()` | นำ snapshot/API กลับมาใส่ฟอร์ม แสดงเลขฟอร์มและชนิดฟอร์ม เติมตาราง/ไฟล์/NG และกำหนดสิทธิ์แก้ไขตาม pageMode |
| `initWorkflow()` | ส่ง `validate`, `hydrate`, สถานะไฟล์, readiness ของ dropdown และ recheck ให้ workflow.js |

### Element ที่เกี่ยวข้อง

| Selector / name | การใช้งาน |
| --- | --- |
| `#jig-form` | ฟอร์มหลัก; ดัก submit และเรียก workflow.save เฉพาะหน้า create |
| `#loading-box` | ปิดสถานะ loading เมื่อเริ่มหน้า |
| `#jig-fields`, `#checkpoint-fields` | fieldset ที่ปิดการแก้ไขหลัง hydrate ถ้าไม่ใช่ edit |
| `#jig-form-type` | badge CREATE / INSPECTION และ `data-type` สำหรับ style |
| `#jig-load-status` | ซ่อนเมื่อโหลดสำเร็จ; workflow แสดง error ที่นี่เมื่อโหลดล้มเหลว |
| `[name="input_by"]`, `#input-by-name` | รหัสและชื่อผู้กรอก |
| `[name="requested_by"]`, `#requested-by-name` | ค้นหาและแสดงผู้ร้องขอ; เก็บรหัสที่ยืนยันใน `data-verified` |
| `[name="pic_empno"]` | dropdown IE PIC |
| `[name="process_code"]` | dropdown MFG Process Code |
| `[name="location"]` | dropdown location; option เก็บ `data-piccode` เพื่อใช้กำหนด flow |
| `[name="start_use_date"]`, `[name="start_use_display"]` | ค่าวันที่ส่ง API และวันที่แสดง |
| `[name="price"]` | ตรวจจำนวนเต็มไม่ติดลบ |
| `[name="form_no"]`, `[name="jig_no"]` | แสดงเลขอ้างอิงจาก API |
| `[aria-label="Revision"]`, `[name="revision"]` | ค่า revision ที่แสดงและค่าจริง; `0` แสดงเป็น `*` |
| `#checkpoint-rows`, `#add-checkpoint` | container ของแถวและปุ่มเพิ่มจุดตรวจ |
| `.remove-row`, `.row-number`, `.result` ภายในแถว | ปุ่มลบ, ลำดับ และ badge ผลตรวจที่ JS สร้าง |
| `[data-field="point/tool/min/max/measured/unit"]` | สัญกรณ์ย่อในเอกสารนี้: หมายถึง data-field แยก 6 ค่าใน input ที่ JS สร้าง ไม่ใช่ selector เดียวในโค้ด |
| `#checkpoint-summary` | จำนวนจุดตรวจและจำนวน OK/NG |
| `#ng-detail`, `#ng-fields` | เปิดแสดงและเปิด fieldset เมื่อพบ NG |
| `[name="ng_action[]"]` | checkbox Adjust, Modify, Replace |
| `[name="ng_defect_detail"]`, `[name="ng_corrective_action"]`, `[name="ng_plan_date"]` | รายละเอียด NG, วิธีแก้ไขและกำหนดเสร็จ |
| `#generate-ng-pdf` | ลิงก์ NG Tag PDF จากข้อมูลที่บันทึกแล้ว |
| `#jig-files`, `#jig-file-dropzone`, `#file-list` | เลือก/ลากวาง/แสดงไฟล์อ้างอิง |
| `#validate-jig` | ปุ่ม submit สำหรับหน้า create; ซ่อนใน view |

ไฟล์อ้างอิงรับ JPG/JPEG/PNG/PDF รวมไฟล์เดิมและไฟล์ใหม่สูงสุด 5 ไฟล์ ไฟล์ละไม่เกิน 10 MB; ตรวจไฟล์ซ้ำด้วยชื่อ ขนาด และ lastModified ส่วนการลบไฟล์เดิมจะแสดงปุ่มในหน้า edit และเรียก API จริงหลังยืนยัน

## 4. workflow.js — สร้าง บันทึก และอนุมัติฟอร์มหลัก

Export `initializeJigWorkflow(editor)` ใช้ interface จาก main.js และคืน `{ save }` ให้ผู้เรียก

| ฟังก์ชันภายใน | หน้าที่ |
| --- | --- |
| `keyOf()`, `checkResponse()` | จัดรูป key และตรวจ response ที่ระบุ status=false |
| `withBusy()` | กันทำรายการซ้ำ ปิด controls ระหว่างทำงานและคืนสถานะเดิมหลังจบ |
| `persist()` | รอ dropdown/ตรวจฟอร์ม, อัปเดต revision, รวม payload, อัปโหลดไฟล์ แล้วสร้างหรือ PATCH snapshot |
| `completeCreate()` | ยืนยันว่ามี JIG_NO ล้าง recovery state และกลับ URL สำหรับสร้างรายการใหม่ |
| `load()` | โหลด snapshot, Webform detail และ flow พร้อมกัน แล้วเรียก editor.hydrate และติดตาม revision |
| `act()` | ยืนยันการอนุมัติ บันทึกข้อมูลที่จำเป็น เรียก doaction แล้ว finish JIG เมื่อ Webform มี CST='2' |

Element ที่ควบคุมโดยตรง:

| Element | พฤติกรรม |
| --- | --- |
| `.form-data` | key, actor, mode, step และ exdata |
| `#jig-approval` | แสดงเมื่อ context.mode='2'; ซ่อนหลังทำ action สำเร็จ |
| `#jig-approve` | คลิกแล้วเรียก act('approve') |
| `#jig-return` | คลิกแล้วเรียก act('returnb'); ซ่อนเมื่อ requester step หรือ step 07 |
| `#jig-remark` | ส่งเป็น REMARK; มี listener ล้าง aria-invalid เมื่อเริ่มพิมพ์ |
| `.flow` | ใส่ HTML ของ flow จาก showflow |
| `#jig-load-status` | ข้อความเมื่อโหลดข้อมูลล้มเหลว |
| `#jig-page` | เพิ่มปุ่ม retry อัปเดต JIG_MASTER แบบ dynamic ถ้า flow สำเร็จแต่ finish callback มีปัญหา |
| `#jig-form` และ controls ใน `#jig-approval` | ปิด controls ชั่วคราวระหว่างทำรายการ |

ลำดับสำคัญ:

1. **สร้าง:** validate → createForm → ตรวจผู้กรอก/ผู้ร้องขอกับ Webform → upload ไฟล์ → insertJigForm ด้วย FORM_TYPE='CREATE' → ยืนยัน JIG_NO → กลับหน้าสร้าง
2. **อนุมัติ requester (`--`):** validate/persist → configureJigRequesterFlow → startJigForm → doaction
3. **อนุมัติ recheck (`19`):** ตรวจและบันทึก editor.recheck ก่อน doaction
4. **หลัง doaction:** ถ้า CST='2' เรียก finishJigForm; approve ที่ step 07 จะ reload หน้า ส่วนกรณีอื่น redirectWebflow

ใช้ sessionStorage ชื่อ `jig-pending:...` เก็บ key หรือสถานะ uncertain ของการสร้าง ป้องกันสร้างเลขฟอร์มซ้ำเมื่อผล request ก่อนหน้าไม่แน่นอน การ retry หลัง finish ล้มเหลวเรียก callback โดยไม่ส่ง doaction ซ้ำ

**รายละเอียดตาม source ปัจจุบัน:** ภายใน act มีเงื่อนไขตรวจ `action === 'return'` สำหรับบังคับ Remark และ guard บางส่วน แต่ปุ่มจริงส่ง `'returnb'` ดังนั้นไม่ควรอ่านเอกสารนี้ว่า Remark ถูกบังคับแน่นอนเมื่อกด Return ของฟอร์มหลัก นี่เป็นข้อสังเกตจากการอ่านโค้ด ไม่ได้แก้พฤติกรรมในงานเอกสารนี้

## 5. recheck.js — ผลแก้ไขและการตรวจยืนยัน

Export `initializeRecheck(form)` คืน `setNg`, `validate`, `hydrate`, `persist` ให้ main/workflow ใช้ แก้ไขได้เฉพาะ `.form-data` ที่ mode='2' และ cstepno='19'

| Element | การใช้งาน |
| --- | --- |
| `#jig-recheck` | แสดงเมื่อมี NG และผู้ใช้แก้ไขได้ หรือมีข้อมูลวันที่แก้ไขเสร็จเดิมให้ดู |
| `#recheck-fields` | เปิดแก้ไขเฉพาะ step 19 และมี NG |
| `[name="actual_finnish_date"]` | วันที่แก้ไขเสร็จ; ใช้ชื่อ finnish ตาม source/API จริง |
| `[name="summary_detail"]` | สรุปการดำเนินงาน ไม่เกิน 2,000 ตัวอักษร |
| `[data-recheck-upload]` | พื้นที่อัปโหลด/ลากวาง ซ่อนเมื่อแก้ไขไม่ได้ |
| `[data-recheck-input="BEFORE"]`, `[data-recheck-input="AFTER"]` | เลือกรูปก่อนและหลังแก้ไข |
| `[data-recheck-list="BEFORE"]`, `[data-recheck-list="AFTER"]` | แสดงไฟล์เดิม/ใหม่พร้อมปุ่มลบที่ JS สร้าง |
| `#confirmation-rows` | JS สร้างตารางผลเดิมและช่อง Confirm Measured ของจุดที่เดิมเป็น NG |
| `#jig-approval button` | ปิดชั่วคราวระหว่างลบไฟล์เดิม |

แต่ละกลุ่ม BEFORE/AFTER ต้องมีรูปอย่างน้อย 1 ไฟล์ รับ JPG/JPEG/PNG สูงสุดกลุ่มละ 5 ไฟล์ ไฟล์ละไม่เกิน 10 MB การ validate ตรวจรูปแบบวันที่ สรุป รูปทั้งสองกลุ่ม และ Confirm Measured ของจุด NG ต้องกรอกเป็นตัวเลข

`persist()` อัปโหลดแต่ละกลุ่มแล้วเก็บ metadata ที่สำเร็จไว้ ก่อน PATCH `saveJigRecheck` ด้วย `ACTUAL_FINNISH_DATE`, `SUMMARY_DETAIL`, `CONFIRMS`, `FILES`, `UPDATE_BY` เพื่อไม่อัปโหลดชุดที่สำเร็จซ้ำเมื่อขั้นตอนถัดไปล้มเหลว

ผลยืนยันคำนวณใหม่ตาม MIN/MAX; ฝั่ง JavaScript นี้ไม่ได้บังคับว่าค่า Confirm ต้องได้ OK ทุกจุดก่อนส่ง

## 6. checkpoint.js — ฟังก์ชันประเมินผลตรวจ

ไม่มีการอ่านหรือแก้ DOM โดยตรง เป็น logic ร่วมที่ main.js และ recheck.js เรียก

| Export | หน้าที่ / ผลลัพธ์ |
| --- | --- |
| `evaluateCheckpoint(min,max,measured)` | ขาด MIN/MAX → 'missing'; ช่วงไม่ถูกต้อง/ตัวเลขไม่ finite → 'invalid'; ยังไม่มี Measured → ''; อยู่ในช่วงรวมขอบเขต → 'OK'; นอกช่วง → 'NG' |
| `evaluateConfirmation(min,max,confirmValue)` | ใช้กฎเดียวกับ evaluateCheckpoint สำหรับค่าตรวจซ้ำ |
| `buildConfirmPayload(details)` | เลือกเฉพาะ RESULT='NG', บังคับ CONFIRM_VALUE ไม่ว่างและเป็นเลข finite แล้วคืน `{ CHECK_SEQ, CONFIRM_VALUE }[]` |

Element ที่เกี่ยวข้องทางอ้อม: input MIN/MAX/Measured และ `.result` ใน `#checkpoint-rows`; ช่อง Confirm Measured และ badge ใน `#confirmation-rows`

## 7. revision.js — ติดตาม revision ของ INSPECTION

| Export | หน้าที่ |
| --- | --- |
| `nextRevision(value)` | เพิ่ม revision เช่น 0→A, A→B, Z→AA; ปฏิเสธรูปแบบที่ไม่ใช่ 0 หรืออักษร A–Z ตัวใหญ่ |
| `trackInspectionRevision(form,rows,snapshot)` | เทียบรายละเอียดจุดตรวจกับ baseline และคืนฟังก์ชัน update ให้ workflow เรียกก่อนบันทึก |

ทำงานเฉพาะ FORM_TYPE='INSPECTION', mode='2', cstepno='--' เทียบ 6 ค่า: point/tool/min/max/measured/unit โดย normalize ช่องตัวเลขก่อนเทียบ ติด input listener ที่ rows และ MutationObserver สำหรับเพิ่ม/ลบแถว

Element ที่ใช้: `.form-data`, `#checkpoint-rows` ผ่าน argument rows, `[data-field]` ทั้ง 6 ค่า, `[name="revision"]` และ `[aria-label="Revision"]`

เมื่อข้อมูลเปลี่ยนและ REV ยังเท่ากับ REV_OLD จะเพิ่มครั้งเดียวภายในฟอร์มนั้น หลังเพิ่มแล้วแก้ข้อมูลหรือย้อนกลับเป็นค่าเดิมก็ไม่ลด/เพิ่มซ้ำจาก logic นี้

## 8. payload.js — แปลง DOM เป็นข้อมูลส่ง API

Export `headerFields`, `calendarDate`, `displayDate`, `actionValues`, `parseActions`, `collectJigPayload` ใช้ร่วมกันใน main/workflow/delete/recheck

### Mapping ช่อง header

| name ใน `#jig-form` | Field API |
| --- | --- |
| jig_name | JIG_NAME |
| drawing_no | DWG |
| revision | REV |
| qty | JIG_QTY |
| price | PRICE |
| maker | MAKER |
| start_use_date | START_USE_DATE |
| itemno | ITEMNO |
| desc | JIG_DESC |
| process_code | PROCESS_CODE |
| location | LOCATION |
| pic_empno | PIC_EMPNO |
| period | INSPEC_PERIOD |

`collectJigPayload(form,rows,files,hasNg)` อ่าน header ด้วย form.elements.namedItem, trim ค่า, เปลี่ยนช่องว่างเป็น null และแปลง qty/price/period เป็น Number จากนั้น:

- อ่าน point/tool/min/max/measured/unit จากแต่ละแถวเป็น DETAILS พร้อม CHECK_SEQ ใหม่ตามลำดับ
- แปลง metadata ไฟล์เป็น FILES ไม่อ่าน file input เอง
- ถ้ามี NG อ่าน ng_defect_detail, ng_action[], ng_corrective_action, ng_plan_date เป็น NG และอ่าน `data-piccode` จาก option ของ location เป็น PICCODE
- ถ้าไม่มี NG ส่ง NG=null

`calendarDate()` คืน YYYY-MM-DD; รับวันที่แบบ ISO date-only, dd/mm/yyyy หรือ timestamp ที่แปลงตาม Asia/Bangkok ส่วน `displayDate()` คืน dd/mm/yyyy และ `parseActions()` รับเฉพาะ Adjust/Modify/Replace

## 9. data.js — API และ URL ที่ใช้ร่วมกัน

ส่วนใหญ่เป็น data access ไม่มี event handler ของหน้า ใช้ `getConfig().APP_API` เป็นฐาน Backend API และ base_url จาก meta สำหรับ PHP controller

### Backend API (ฐาน APP_API)

ในตาราง `{key}` คือ path ที่ `formPath()` รวม 5 ส่วน: NFRMNO/VORGNO/CYEAR/CYEAR2/NRUNNO โดย encodeURIComponent แต่ละส่วน

| Export | Method / path | ผู้ใช้หลัก |
| --- | --- | --- |
| getJigProcesses | GET /iedoc/jig/mfg-processes | main: process_code |
| getJigLocations | GET /iedoc/jig/locations | main: location; delete: ชื่อ location |
| getJigPics | GET /iedoc/jig/ie-pics | main: pic_empno |
| getJigMaster | GET /iedoc/jig/{jigNo} | delete: data-master |
| getJigMasterCheckpoints | GET /iedoc/jig/{jigNo}/checkpoints | delete: ตาราง checkpoint |
| getJigMasterDefect | GET /iedoc/jig/{jigNo}/defect-ng | delete: รายละเอียด NG |
| insertJigForm | POST /iedoc/jig | workflow: สร้าง snapshot |
| loadJigForm | GET /iedoc/jig/forms/{key} | workflow: โหลด snapshot |
| saveJigForm | PATCH /iedoc/jig/forms/{key} | workflow: บันทึก snapshot |
| saveJigRecheck | PATCH /iedoc/jig/forms/{key}/recheck | recheck: ผลแก้ไข |
| configureJigRequesterFlow | POST /iedoc/jig/forms/{key}/requester-flow | workflow: ตั้ง flow พร้อม PICCODE เมื่อมี |
| finishJigForm | POST /iedoc/jig/forms/{key}/finish | workflow: finish callback พร้อม UPDATE_BY |
| jigNgTagPdfUrl | สร้าง URL /iedoc/jig/forms/{key}/ng-tag.pdf | main: generate-ng-pdf |
| createJigDeleteForm | POST /iedoc/jig/delete-forms | delete: สร้างคำขอลบ |
| loadJigDeleteForm | GET /iedoc/jig/delete-forms/{key} | delete: โหลดคำขอ |
| saveJigDeleteForm | PATCH /iedoc/jig/delete-forms/{key} | delete: บันทึกคำขอ |
| finishJigDeleteForm | POST /iedoc/jig/delete-forms/{key}/finish | delete-workflow: finish callback |
| rejectJigDeleteForm | POST /iedoc/jig/delete-forms/{key}/reject | delete-workflow: reject callback |

`getJigEmployee(empno)` ใช้ searchUser ของ @amec/webasset/api/amec โดย SEMPNO และ CSTATUS='1' แล้วเลือกพนักงานรหัสตรงกันที่ active

`loadJigForm` และ `loadJigDeleteForm` ใช้ native fetch โดยตรงและคืน null เมื่อ allowMissing=true และ API ตอบ 404; ส่วน call ส่วนใหญ่ใช้ fetchUtils

### PHP controller (ฐาน base_url)

| Export | Route | หน้าที่ |
| --- | --- | --- |
| startJigForm | POST ieform/IE-JIG/jig/start_request | ส่ง key และ EMPNO เพื่อเริ่ม request |
| uploadJigFiles | POST ieform/IE-JIG/jig/uploadfile | ส่ง FormData: key, EMPNO, FILE_GROUP และ files[]; default group=REFERENCE |
| deleteJigFile | POST ieform/IE-JIG/jig/deletefile | ส่ง key, EMPNO และ FILE_SEQ; ถ้าไม่ส่ง actor อ่านจาก .form-data หรือ #jig-delete-page |
| jigFileUrl | ieform/IE-JIG/jig/preview_file หรือ download_file | สร้าง URL พร้อม key, group และชื่อไฟล์จาก FILE_PATH |

Element ที่ data.js อ่านตรง ๆ คือ meta base_url และ dataset.empno ของ root; element อื่นใช้ data.js ทางอ้อมผ่านผู้เรียก

## 10. delete.js — หน้า Request Delete JIG

เป็น entry ของหน้าลบ ทำงานเมื่อมี `#jig-delete-page` สร้าง object `VIEW` โหลด JIG master ปัจจุบัน แสดง checkpoints/NG และดูแลรายละเอียดคำขอลบกับไฟล์แนบ ส่วน Webflow ส่งต่อให้ delete-workflow.js

| กลุ่มฟังก์ชัน | หน้าที่ |
| --- | --- |
| `loadRequesterNames()` | ตอนสร้างคำขอ แสดงพนักงานเดียวกันเป็น Input By และ Requested By |
| `load()` | โหลด snapshot คำขอเดิม/Webform/flow ถ้าไม่ใช่ create แล้วโหลด master ตาม JIG_NO; เปิด fieldset เมื่อพร้อม |
| `loadCheckpoints()` | โหลดตารางจุดตรวจจาก master endpoint พร้อมสถานะ จำนวนรายการและ retry |
| `loadDefect()`, `renderDefect()` | โหลด response `{ NG: object หรือ null }`; ซ่อน section เมื่อไม่มี NG และแสดงรายละเอียดเมื่อมี |
| `renderFiles()` | แสดงไฟล์เดิมพร้อม preview/download และไฟล์ใหม่พร้อม preview รูป; คืน object URL เมื่อ render ใหม่หรือออกหน้า |
| `addFiles()` | รับไฟล์จาก input/ลากวาง กันซ้ำและตรวจชนิด ขนาด จำนวน รวมถึงไฟล์ต้องไม่ว่าง |
| `validate()` | บังคับเหตุผลและรายละเอียดไม่ว่าง แต่ละช่องไม่เกิน 1,000 ตัวอักษร; ไม่บังคับว่าต้องแนบไฟล์ |
| `payload()` | upload ไฟล์และรวม REASON, DETAIL, FILES โดยจัด FILE_SEQ ต่อจากไฟล์เดิม |
| `persist()`, `persistCreation()` | บันทึกคำขอเดิม หรือสร้าง snapshot คำขอลบพร้อม JIG_NO |

### Element ที่เกี่ยวข้อง

| Element | การใช้งาน |
| --- | --- |
| `#jig-delete-page` | root และ context ทั้งหน้า |
| `#loading-box` | ปิด loading เมื่อเริ่มหน้า |
| `#jig-delete-form` | submit ส่งต่อไปยัง initializeDeleteCreation เฉพาะ create เมื่อโหลดพร้อม |
| `#delete-fields` | เปิดแก้ไขตอน create หรือ mode='2' และ step='--'; ปิดเมื่อสถานะ Webform เป็น 2/3 |
| `#delete-load-status`, `#delete-retry` | สถานะโหลดและปุ่มโหลดหน้าอีกครั้ง |
| `#delete-formno`, `#delete-input-by`, `#delete-requested-by` | แสดงข้อมูล Webform/พนักงาน |
| `[data-master]` | เติมค่าจาก JIG master ตามชื่อ column ใน attribute |
| `#delete-checkpoint-status`, `#delete-checkpoint-retry` | สถานะโหลดและ retry ตาราง |
| `#delete-checkpoint-table`, `#delete-checkpoint-rows`, `#delete-checkpoint-count` | container, แถว และจำนวน checkpoints |
| `#delete-defect-section`, `#delete-defect-list`, `#delete-defect-count` | section, card ที่ JS สร้าง และสถานะพบ NG |
| `#delete-defect-status`, `#delete-defect-retry` | สถานะโหลดและ retry รายละเอียด NG |
| `[name="delete_reason"]`, `[name="delete_detail"]` | เหตุผลและรายละเอียดคำขอ |
| `#delete-files`, `#delete-dropzone`, `#delete-file-list` | รับและแสดงไฟล์; drag/drop สลับ class dragging |
| `#delete-send` | ปุ่ม submit; view แสดงเฉพาะ create |
| `#delete-flow` | HTML flow สำหรับคำขอเดิม |

`[data-master]` ใน view มี JIG_NO, JIG_NAME, REV, DWG, PROCESS_CODE, ITEMNO, LOCATION, PIC_EMPNO, JIG_DESC, MAKER, START_USE_DATE, JIG_QTY, PRICE, INSPEC_PERIOD โดย JS แสดง REV=0 เป็น *, เติมชื่อ PIC/location, จัดวันที่และตัวเลขให้อ่านง่าย

หน้าลบแสดงข้อมูล JIG/checkpoints/NG ผ่าน master endpoints ขณะที่เหตุผล รายละเอียด และไฟล์คำขอเดิมมาจาก delete-form snapshot จึงควรแยกแหล่งข้อมูลสองส่วนนี้เมื่อไล่ปัญหา

ไฟล์รับ JPG/JPEG/PNG/PDF รวมสูงสุด 5 ไฟล์ ไฟล์ละไม่เกิน 10 MB และไม่รับไฟล์ขนาด 0 byte

## 11. delete-workflow.js — สร้างและอนุมัติคำขอลบ

| Export | หน้าที่ |
| --- | --- |
| `deleteFormKey()` | จัดรูป key ฟอร์ม 5 ค่า |
| `checkDeleteResponse()` | throw เมื่อไม่มี response หรือ status=false |
| `initializeDeleteCreation(editor)` | คืนฟังก์ชัน send ที่ validate/ยืนยัน → createForm → ตรวจผู้ร้องขอและ JIG_NO → persistCreation → เปิด URL คำขอที่สร้างแล้ว |
| `initializeDeleteApproval(editor)` | ผูกปุ่มอนุมัติ/ปฏิเสธ และจัดการ recovery/ซิงก์สถานะหลัง Webflow สำเร็จ |

| Element | การใช้งาน |
| --- | --- |
| `#delete-approval` | กลุ่มอนุมัติ แสดงเฉพาะ mode='2' และสถานะยังไม่จบ |
| `#delete-remark` | ความเห็น ส่งเป็น REMARK; บังคับเมื่อ action ไม่ใช่ approve |
| `#delete-approve` | เรียก act('approve'); requester จะ validate และ persist ก่อนอนุมัติ |
| `#delete-reject` | เรียก act('reject'); ซ่อนใน requester step |
| `#delete-return` | โค้ดรองรับแบบ optional แต่ delete_form.blade.php ปัจจุบันไม่มีปุ่มนี้ |
| `#delete-sync-status`, `#delete-sync-message` | แสดงเมื่อ flow สำเร็จแต่ callback ยังไม่สำเร็จ หรือผล action ยังไม่แน่นอน |
| `#delete-sync-retry` | retry callback หรือ reload เพื่อตรวจสอบ flow ตาม recovery state |
| `button,input,textarea` ภายใน page | ล็อกระหว่างทำรายการและคืนสถานะหลังจบ |

ขั้นอนุมัติทำ doaction ก่อน แล้ว `synchronize()` อ่าน CST ล่าสุด: ถ้า '2' เรียก finishJigDeleteForm ถ้า '3' เรียก rejectJigDeleteForm การ retry ส่วนนี้ไม่ส่ง doaction ซ้ำ

ใช้ sessionStorage สองกลุ่ม:

- `jig-delete-pending:...`: key/uncertain ระหว่างสร้างฟอร์ม ป้องกันสร้างซ้ำและตรวจว่า key เดิมเป็นคำขอของ JIG เดียวกัน
- `jig-delete-action:...`: uncertain พร้อม step หรือ callback เพื่อกู้สถานะหลัง reload และตัดสินใจให้ตรวจ flow หรือ retry การซิงก์

## 12. ค้นไฟล์จากอาการหรือ element

| ต้องการตรวจเรื่อง | เริ่มอ่าน |
| --- | --- |
| dropdown / ชื่อพนักงาน / Start Use | main.js → data.js |
| เพิ่มลบ Check Point / เปลี่ยน MIN/MAX แล้วผลเปลี่ยน | main.js → checkpoint.js |
| payload header / DETAILS / NG ไม่ตรง | payload.js → workflow.js |
| revision เปลี่ยนหลังแก้จุดตรวจ | revision.js → workflow.js |
| Approve/Return หรือบันทึกฟอร์มหลัก | workflow.js |
| รูป BEFORE/AFTER / Confirm Measured / วันที่แก้ไขเสร็จ | recheck.js → checkpoint.js → data.js |
| แนบไฟล์อ้างอิง / NG Tag PDF | main.js → data.js |
| ตารางข้อมูล JIG หรือ NG ในหน้าขอลบ | delete.js → data.js |
| Send Form / Approve / Reject ของคำขอลบ | delete-workflow.js → delete.js → data.js |
| flow สำเร็จแต่สถานะ JIG ยังไม่อัปเดต | workflow.js หรือ delete-workflow.js ตามประเภทฟอร์ม |

เอกสารนี้เพิ่มคำอธิบายเท่านั้น ไม่ได้เปลี่ยน JavaScript, Blade, API หรือทดสอบ workflow กับข้อมูลจริง
