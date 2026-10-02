# Maintenance / Cleanup review

[กลับคู่มือหลัก](README.md) · [Function reference](FUNCTION_REFERENCE.md)

## 1. ต้องแก้ไฟล์ใด

| งาน | จุดเริ่มต้น |
|---|---|
| เพิ่ม/เปลี่ยน field | request_form.blade.php + main.js hydrate + payload.js + DTO/API ที่เกี่ยวข้อง |
| เปลี่ยน dropdown | data.js endpoint + main.js loadMaster/loadSelect |
| แก้ rule Check Point | checkpoint.js + main.js events/validate; ตรวจ backend validation ให้ตรง |
| เปลี่ยน REV | revision.js + workflow.js persist + API save/finish; รักษา REV_OLD |
| เปลี่ยน Approve/Return/step | workflow.js act + controller currentJigStep + requester-flow API |
| เปลี่ยน Delete approval/status | delete-workflow.js + backend Delete completion |
| เปลี่ยนชื่อ/ที่เก็บไฟล์ | jig.php file helpers; metadata ต้องใช้ชื่อ/path หลัง sanitize |
| เปลี่ยน PDF | Node API jig-ng-tag.service.ts; frontend มีหน้าที่เปิด URL |
| แก้สี/ขนาด/readonly | Blade CSS และ main.js hydrate; ตรวจ Create/Requester/View |

## 2. ผลตรวจสิ่งที่อาจไม่ได้ใช้งาน

เป็น static review ณ วันที่ใน README ไม่ได้ลบ code ใด ๆ ในงานเอกสารนี้ การไม่พบ caller ไม่เท่ากับพิสูจน์ว่าไม่มีระบบภายนอกใช้

| รายการ | หลักฐาน/สถานะ | สิ่งที่ทำได้ต่อ |
|---|---|---|
| `width` ใน helper `field` ของ JIG.addRow | ประกาศ parameter และส่ง w-52/w-32/w-16 แต่ template ใช้ w-full โดยไม่อ่าน width | cleanup candidate ที่ชัดเจน: เอา parameter/arguments ส่วนนี้ออกพร้อมกัน; ตัว addRow ยังใช้งาน |
| `calendarDate(value, firstDay)` branch firstDay=true | caller ปัจจุบันใน JIG ใช้ argument เดียว | candidate ลด option ที่ยังไม่มี caller หลังตรวจ imports ทั้ง repo; ตัว calendarDate ยังใช้หลายจุด |
| `main.blade.php` ใน IE-JIG | controller ปัจจุบันเลือก request_form/approve_form/delete_form; main มี context ว่าง ไม่มี script | ตรวจ route/master/การเรียก view แบบ dynamic ก่อนลบ |
| return `{synchronize}` ของ initializeDeleteApproval | caller ใน delete.js เรียก initializer แต่ไม่เก็บ return; synchronize ยังถูกใช้ภายใน complete | อาจเอา public return ที่ไม่ได้ใช้ออกได้; **ห้ามลบ synchronize function** |
| `path` import ใน assets/script/ieform/entry.js | มี require(path) แต่ entry object ไม่ใช้ตัวแปรนี้ | candidate unused import; entry นี้ใช้ร่วมกับ IE forms อื่น จึงเป็นงาน cleanup แยก |
| service `applyFormToMaster` ใน API | พบ method wrapper; controller finish ใช้ finishForm; repository.applyFormToMaster มี tests เรียก | ตรวจ backend call graph เพิ่มก่อนลบ wrapper; อย่าลบ repository method ตามไปด้วย |
| commented upload_path/test code | ไม่ execute แต่มีไว้เป็นตัวอย่าง debug | ย้ายความรู้เข้า docs แล้วพิจารณาลบ comment ที่ไม่จำเป็น |

**ยังไม่ควรสรุปว่า unused:** show_jig_form/open_from_asp/index เป็น public routes, preview/download เป็น URL handlers, event callbacks ถูกเรียกผ่าน browser, exports ใน data.js ถูกใช้ข้าม module, nextRevision ถูกเรียกภายใน tracker, API auto-inspection/PDF/Dashboard อาจถูก Job หรืออีกโปรเจกต์เรียก

## 3. ข้อสังเกตที่ควรตรวจเมื่อพัฒนาต่อ

1. **PIC มี * แต่ไม่มี required ใน Blade**: validate หลักอาศัย required/browser validity จึงไม่ควรถือว่า PIC ถูกบังคับจากเครื่องหมาย * เพียงอย่างเดียว ต้องตกลง requirement และตรวจ API constraint ก่อนแก้
2. **REV เพิ่มแล้วไม่ลดใน session นั้น**: tracker เป็น one-way increment; ผู้ใช้แก้แล้ว undo กลับค่าเดิมจะยังเห็น REV ที่เพิ่ม เป็นพฤติกรรมจริงที่ควรตกลงก่อนเปลี่ยน
3. **Numeric normalization**: 0.10 กับ 0.1 เป็นค่าเดียวกันสำหรับ REV; ถ้าต้องการจับการเปลี่ยน formatting ต้องออกแบบเพิ่ม แต่ database NUMBER เองไม่ได้เก็บรูปแบบทศนิยมเดิม
4. **Requester upload permissions**: uploadfile มีเงื่อนไข getMode/inputer และแยก Delete; อย่าเขียนเอกสารหรือ reuse โดยสมมติว่า upload จำกัดเฉพาะ requester step ทุกกรณี ส่วน deletefile ตรวจ requester ชัดเจน ต้องตรวจ implementation ทั้งสองก่อนปรับสิทธิ์
5. **หลายระบบ ไม่ใช่ transaction เดียว**: createForm สำเร็จแต่ JIG insert/upload ล้มเหลวได้; sessionStorage ช่วย recovery ใน browser session นั้น ไม่ใช่ idempotency กลางถาวร
6. **Delete แสดง Master ปัจจุบัน**: ถ้าต้องการดูอดีตให้เหมือนวันที่ยื่นลบ ต้องออกแบบ snapshot เพิ่ม ไม่ใช่เปลี่ยนเฉพาะการ render
7. **Frontend readonly ไม่ใช่ authorization**: API/PHP ต้องตรวจผู้ทำรายการ/สถานะด้วย ไม่ใช้ disabled input เป็นสิทธิ์ระดับระบบ

## 4. Troubleshooting

| อาการ | ตรวจตรงไหน |
|---|---|
| ORA-12170 ก่อนเห็นหน้า | stack MY_Controller/Oracle connection จาก PHP runtime; JS ยังไม่เริ่มทำงาน ไม่ควรถอด parent constructor เพื่อกลบสาเหตุ |
| MIN/MAX/Measured กลายเป็น 0 | ดู Network response ก่อน: ถ้า JSON เป็น0แล้วตรวจ Oracle TypeORM entity numeric mapping; ถ้า JSON มีทศนิยมตรวจ hydrate/formatter ห้าม parseInt |
| `.trim()` ของ undefined | input name ใน Blade ไม่ตรง payload/headerFields หรือ field ถูกลบ เช่น itemno/desc |
| ORA-00904 | field/column ไม่ตรง schema เช่น NG.LOCATION ที่เอาออกแล้ว หรือชื่อ Header field; ตรวจ payload→DTO→entity→DB |
| Location โหลดไม่สำเร็จ | endpoint/network/response shape และ loadSelect; อย่าอ้าง ng_location ที่ลบออกแล้ว |
| Only requester can edit attachments | actor/session/getMode/current step/CST และ FORMMST ของ Create/Edit; แยกสิทธิ์ upload กับ delete |
| cURL56 ตอนลบไฟล์ | PHP→API transport/TLS/connection; ตรวจ log และสถานะ metadata ก่อน retry อย่าปิด TLS verification เป็นวิธีแก้ถาวร |
| Delete Approve404 | VFORMPAGE ต้องชี้ controller/method จริงพร้อมห้า Key; /IE-DELJIG/jig ไม่ใช่ controller ในชุดนี้ |
| Flow ผ่านแต่ Master ยังไม่เปลี่ยน | อ่าน CST และผล finish; retry completion ไม่ doaction ซ้ำ |
| Source เปลี่ยนแต่หน้าเหมือนเดิม | browser ใช้ dist bundle; ตรวจ entry/build/cache |
| ORA-02014 | SQL FOR UPDATE ฝั่ง backend; ตรวจ query/transaction ไม่ใช่สรุปว่า doaction import ผิดจากข้อความนี้อย่างเดียว |

## 5. การตรวจและ build หลังแก้ code

งานเอกสารครั้งนี้ไม่รัน approval, ไม่สร้างข้อมูล, ไม่ build และไม่แก้ API

เมื่อแก้ source จริง ให้ใช้ workflow build ของโปรเจกต์ ตรวจ `assets/script/ieform/entry.js` ว่า `iejig` และ `iejigDelete` ชี้ไฟล์ถูก ห้ามแก้เฉพาะ dist เพราะ build ครั้งต่อไปจะทับ และระวัง `rspack.config.js` ตั้ง `output.clean: true` ถ้าทำ build เฉพาะ entry ต้องไม่ลบ bundle โปรแกรมอื่น

รายการตรวจด้วยมือที่มีความหมายหลังเปลี่ยน logic:

- Create ไม่มี checkpoint/ไม่มีไฟล์/Requested By ไม่ active ต้องถูกปฏิเสธ
- ทศนิยมลบและค่าขอบ MIN/MAX ให้ผลถูก; เปลี่ยน bounds ล้าง Measured
- Requester Inspection เปลี่ยน Measured → REV เพิ่มครั้งเดียว; Return แก้อีกไม่เพิ่มซ้ำ
- NG→ไม่มี NG และย้อนกลับ: requester-flow ต้องจัด step07 ตามข้อมูลใหม่
- Approver แก้ข้อมูลไม่ได้, Return Remark ว่างถูกเตือน, view only ไม่เห็นปุ่ม
- Step07 Approve reload; finish failure retry ต้องไม่อนุมัติซ้ำ
- Delete Create→PENDING_DELETE, จบ approve→DELETED, Reject→ACTIVE
- ชื่อไฟล์มี space ถูก sanitize สอดคล้อง metadata, preview/download/lบทำงานทั้งสอง prefix

ก่อนลบ candidate ให้ค้นทั้ง definition/import/call, dynamic routes และ configuration ภายนอก แล้วแยก commit cleanup ออกจากการเปลี่ยน business rule เพื่อย้อนกลับได้ง่าย
