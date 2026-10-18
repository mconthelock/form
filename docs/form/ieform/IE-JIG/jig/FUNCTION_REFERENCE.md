# Function reference — JIG Form

[กลับคู่มือหลัก](README.md)

รายการนี้ครอบคลุม named functions/methods ใน controller และ JS ของหน้า Form ส่วน anonymous event callbacks อธิบายรวมกับฟังก์ชันที่ลงทะเบียน event ผลลัพธ์บางฟังก์ชันคือการเปลี่ยน DOM/สถานะ ไม่ใช่ return value

## main.js — object JIG

| Function | หน้าที่ / input / เงื่อนไข / ผลลัพธ์ |
|---|---|
| init | เริ่ม header, dropdown, employee, events, files และ workflow เมื่อ DOM พร้อม |
| initHeader | ตั้งค่าเริ่มต้น Revision/Start Use และ datepicker ของ NG Plan Date |
| initNgActions | เตรียม NG controls และ custom validity ของ checkbox group |
| bindFormEvents | ผูก submit ให้เรียก workflow.save ไม่ submit HTML ตรง |
| bindCheckpointEvents | event delegation ของเพิ่ม/ลบ/input จุดตรวจ; เปลี่ยน bounds ล้าง Measured และประเมินผลใหม่ |
| bindFileEvents | input file/drag-drop เรียก addFiles และจัดสถานะ dropzone |
| bindPriceEvents | จัดการ input ราคาให้สอดคล้องจำนวนเต็ม |
| loadMaster | เริ่มโหลด PIC/Process/Location; เก็บ Promise สำหรับรอก่อน hydrate/save |
| loadSelect(name, loader, mapOptions) | โหลดข้อมูล → map options → เติม select; แสดง error เมื่อโหลดไม่ได้ ไม่ถือเป็น dropdown ว่างปกติ |
| initInputBy | ค้น employee ของ Input By เพื่อแสดงชื่อ |
| initRequester | lookup เมื่อกรอก Requested By ครบ; รับเฉพาะ active user, เก็บ verified value และแจ้งเมื่อไม่พบ/โหลดผิดพลาด |
| validateNgActions | ตั้ง custom validity เมื่อไม่มี ACTION ที่เลือก |
| validate | async boolean; ตรวจ required, browser validity, maxlength, verified requester, ≥1 checkpoint, ≥1 attachment, bounds/result และ NG; ผิดแสดง Swal |
| summarize | เรียงเลขแถว นับ OK/NG เปิด/ปิด NG section และ disabled NG fieldset ตามผล |
| renderResult(row, result) | เขียน badge, เปลี่ยนสีแถว และ summarize |
| addRow | สร้าง tr พร้อม data-field ทั้งหก; คืน row; ไม่มีเพดาน 20 แถว |
| warnBounds(row, state) | Swal แจ้ง missing/invalid bounds และ focus MIN; กัน popup ซ้อน |
| initFiles | ตั้งค่า file input/dropzone และรายการไฟล์ใหม่ |
| highlight | เปลี่ยน styling ระหว่างลากไฟล์ |
| renderFiles | สร้างรายการไฟล์ใหม่/เดิม, preview/download และ callback ลบพร้อม confirm |
| addFiles | ตรวจชนิด/ขนาด/จำนวนและรายการซ้ำ เพิ่ม File objects แล้ว render |
| hydrate(snapshot, ...) | เติม header, checkpoint, NG, files และ readonly state จาก API; ใช้ค่าทศนิยมตรง ไม่ parseInt |
| initWorkflow | สร้าง editor adapter ให้ workflow: validate, hydrate, readiness และไฟล์ที่เลือก |

Helper `field` ภายใน addRow สร้าง HTML input; parameter `width` ไม่ถูกนำไปใช้จริง ดูรายการ cleanup

## workflow.js — ลำดับบันทึก JIG

| Function | หน้าที่และเงื่อนไข |
|---|---|
| keyOf | เลือก/จัดรูปห้า Key จาก context หรือ createForm response |
| checkResponse | ตรวจ response ล้มเหลวและ throw เพื่อเข้าทางแสดง error |
| initializeJigWorkflow(editor) | สร้าง state ของ key/actor/mode/requester/busy, ผูกปุ่มและ load; คืน object ที่มี save |
| completeCreate | ตรวจเลข JIG_NO จากผลบันทึก/โหลดกลับ, ล้าง pending marker, แจ้งเลขจริงและ reset URL Create |
| withBusy | ห่อ async operation ป้องกันกดซ้ำ จัด lock/UI และแสดงข้อผิดพลาด |
| persist | validate → คำนวณ REV → collect payload → createForm/upload/insert หรือ upload/PATCH; คืน boolean สำเร็จ |
| load | โหลด snapshot + Webform + approval flow สำหรับฟอร์มเดิม, hydrate และเริ่ม tracker REV |
| act(action) | guard mode/requester, ตรวจ Remark/ข้อมูล, confirm, persist requester, requester-flow/start_request/doaction, finish เมื่อ CST=2 |
| navigateAfterAction | callback ใน act: Approve step07 reload; อื่น redirectWebflow |
| save | callback ที่คืนให้ main.js; persist ผ่าน withBusy; edit สำเร็จแจ้งและ redirect |

ตัวอย่าง: `act('returnb')` เมื่อ Remark ว่าง → Swal แล้วจบก่อน doaction; `act('approve')` ของ Requester ที่มี NG → บันทึกข้อมูลล่าสุดก่อนส่ง PICCODE ไป requester-flow

การ retry finish ใน act ทำเฉพาะตรวจ CST/finish ไม่เดิน approval ซ้ำ sessionStorage ของการ Create เก็บ key เมื่อทราบเลข หรือ uncertain marker เมื่อยังไม่ยืนยันผล ห้ามล้าง marker เพื่อสร้างซ้ำโดยไม่ตรวจ FORM ก่อน

## checkpoint.js / payload.js / revision.js

| Function | Input → ผลลัพธ์ |
|---|---|
| evaluateCheckpoint | `('-0.1','0.1','0.05')` → OK; measured 0.15 → NG; bounds ว่าง → missing; min>max → invalid; measured ว่างเมื่อ bounds ถูก → empty string |
| calendarDate(value, firstDay=false) | วันที่ ISO/dd/mm/yyyy หรือค่าที่ Date รองรับ → YYYY-MM-DD; empty/invalid Date → ''; firstDay=true เปลี่ยนวันเป็น 01 |
| displayDate | ใช้ calendarDate แล้วกลับเป็น dd/mm/yyyy |
| parseActions | comma string → array เฉพาะ Adjust/Modify/Replace; ค่าที่ไม่รู้จักถูกตัด |
| collectJigPayload(form, rows, files, hasNg) | DOM → header/DETAILS/FILES/NG; number fields ใช้ Number, empty header เป็น null, seq เรียงใหม่; hasNg เพิ่ม PICCODE ระดับบน |
| normalize | helper REV: null/empty → ''; numeric fields normalize ด้วย Number; text คง string |
| nextRevision | `'0'`→A, A→B, Z→AA; รูปแบบอื่นที่ไม่ใช่ตัวอักษรใหญ่ throw |
| trackInspectionRevision | รับ form/rows/snapshot; ผูก input/MutationObserver; คืน update() เรียกก่อนบันทึก; active เฉพาะ Inspection Requester |
| update (closure) | เทียบ baseline หก fields; เปลี่ยนเมื่อ current=original เท่านั้น; เขียน hidden REV และ display |

calendarDate เป็น conversion helper ไม่ใช่ strict calendar validator ของทุก string format; validate ก่อน collectJigPayload เพราะ Number('') ให้ 0 การ parse วันที่ที่ผิดรูปแบบควรจัดการใน input/API ด้วย

## data.js — adapter

ชื่อ function เป็นจุดค้นหา contract ที่แน่นอน; API base ใช้ config ไม่ hardcode hostname

| Function | ปลายทาง / ผลลัพธ์ที่ผู้เรียกใช้ |
|---|---|
| getJigProcesses | GET mfg-processes → array PROCESS |
| getJigLocations | GET locations → SHOPCODE/SHOPDESC/PICCODE |
| getJigEmployee(empno) | searchUser SEMPNO+CSTATUS=1 แล้วตรวจซ้ำ → user หรือ null |
| getJigPics | GET ie-pics → eligible employees; UI จัดลำดับ SNAME |
| getJigMaster(jigNo) | GET Master |
| getJigMasterCheckpoints(jigNo) | GET Master checkpoints |
| getJigMasterDefect(jigNo) | GET defect-ng; NG อาจเป็น null |
| formPath(key) | encode ห้า Key แล้ว join ด้วย slash |
| insertJigForm(data) | POST base JIG |
| loadJigForm(key, allowMissing=false) | GET snapshot; allowMissing และ HTTP404 → null; อื่น throw |
| saveJigForm(key,data) | PATCH snapshot |
| configureJigRequesterFlow(key,picCode) | POST requester-flow พร้อม PICCODE ถ้ามี ไม่มีก็ {} |
| finishJigForm(key,actor) | POST finish พร้อม UPDATE_BY |
| jigNgTagPdfUrl(key) | คืน URL PDF ไม่ได้สร้าง PDF ใน browser |
| createJigDeleteForm(data) | POST delete-forms |
| loadJigDeleteForm(key,allowMissing=false) | GET Delete snapshot, optional404→null |
| saveJigDeleteForm(key,data) | PATCH Delete snapshot |
| finishJigDeleteForm(key) | POST Delete finish |
| rejectJigDeleteForm(key) | POST Delete reject |
| localBase | อ่าน meta base_url ของ PHP |
| startJigForm(key,actor) | FormData POST PHP start_request |
| uploadJigFiles(key,actor,files) | ไม่มีไฟล์→[]; POST PHP files[]; ตรวจ status แล้วคืน metadata |
| deleteJigFile(key,seq,actor) | POST PHP deletefile; actor fallback จาก page context; คืนผลรวม warning ที่อาจมี |
| jigFileUrl(key,file,options) | สร้าง PHP preview/download URL จาก basename และห้า Key |

## delete.js — object VIEW

| Function | หน้าที่ |
|---|---|
| loadRequesterNames | Create ใช้ empno ใน page context; ค้น active user เพื่อแสดงชื่อ Input/Requested By |
| load | โหลด Delete snapshot/Webform/Flow เมื่อมี key, หรือ Master สำหรับ Create; ตั้ง editable และเริ่ม workflow |
| loadCheckpoints | โหลด checkpoints ของ Master พร้อมสถานะกำลังโหลด/error/retry |
| loadDefect | โหลด defect-ng; แยก NG=null ออกจาก request failure |
| renderDefect | แสดง Defect, ACTION, CORRECTIVE, Plan Date ของ Master |
| renderFiles | รายการไฟล์เดิม/ใหม่; ยืนยันก่อนลบไฟล์เดิม; ใช้ busy/editable guard |
| validate | ต้องโหลดพร้อม/แก้ได้/ไม่ fileBusy; reason/detail required และ maxlength1000; Delete ไม่บังคับแนบอย่างน้อยหนึ่งไฟล์ |
| payload | upload ไฟล์ใหม่; เริ่ม FILE_SEQ ถัดจาก max ของเดิมและเก็บ seq เดิม; คืนเหตุผล/รายละเอียด/metadata |
| persist | PATCH Delete request พร้อม UPDATE_BY; อัปเดตรายการไฟล์หลังสำเร็จ |
| persistCreation | POST Delete request พร้อม key/JIG_NO และ payload |
| addFiles | ตรวจชนิด/ขนาด/จำนวนและ deduplicate ไฟล์ใหม่ |

Formatting helpers/callbacks ในไฟล์นี้จัด display ข้อมูลว่าง, label, ปุ่ม retry, submit และ onIdle; ไม่มี responsibility เดินสถานะ Master เอง

## delete-workflow.js

| Function | หน้าที่ / ผลลัพธ์ |
|---|---|
| deleteFormKey | สร้างห้า Key จาก context/response |
| checkDeleteResponse | แปลง failure response เป็น exception |
| initializeDeleteCreation(editor) | คืน async Send Form handler; guard/validate/confirm/createForm/recovery/persistCreation; สำเร็จเปิดฟอร์มเดิมด้วย y2/runNo |
| initializeDeleteApproval(editor) | ผูก Approve/Return/Reject ตาม mode/step และ recovery state; คืน {synchronize} |
| pending | แจ้ง action ที่ทำแล้วแต่ยังมีงาน sync/ความไม่แน่นอน และเตรียม retry |
| synchronize | อ่าน CST จริง; 2→finishDeleteForm, 3→rejectJigDeleteForm |
| complete | synchronize → ล้าง recovery → แจ้งผล/redirect; fail เสนอ retry |
| act | Requester validate/persist ก่อน approve, Remark บังคับ Return/Reject, doaction และ callback; guard การกดซ้ำ |

Delete แยก uncertain action marker ออกจาก callback marker เพื่อไม่ยิง doaction ซ้ำเมื่อไม่ทราบผล network; ต้องตรวจสถานะปัจจุบันก่อน recovery

## jig.php — controller

| Method | หน้าที่ / เงื่อนไข / ผลลัพธ์ |
|---|---|
| __construct | เรียก MY_Controller โหลด form/user model และกำหนด upload_path ตาม environment |
| index | ส่งเข้า show_create_jig_form |
| show_jig_form | รับ reference year/run จาก query, ตรวจครบ, map query แล้วเปิด JIG |
| open_from_asp | รับ 6 route arguments, encode query และ redirect302 เข้า show_create_jig_form |
| show_create_jig_form | validate parameters, getMode, อ่าน FORM เมื่อมี run, หา current step, เลือก request_form/approve_form และส่ง context |
| fileKey(method='post') | อ่าน/ตรวจห้า Key สำหรับ file operation |
| currentJigStep | ค้น active Flow step จาก actor ใน VAPVNO แล้ว VREPNO; ใช้ CSTEPST=3 |
| jigFileDirectory | ตรวจ FORMMST.VANAME, CYEAR2/run แล้วสร้าง IE-JIG หรือ IE-DELJIG + YY-run6 |
| jigAttachmentPath | ตรวจ filename/directory และ boundary ของ root, symlink/legacy path; สร้าง directory เมื่อร้องขอ |
| jigStoredFilename | sanitize basename/extension, กัน reserved filename และความยาวเกิน; คืนชื่อที่จะบันทึกจริง |
| uploadfile | ตรวจ context/สิทธิ์, MIME/size/filename, บันทึกไฟล์จริง; คืน status+files metadata ไม่ insert JIG_FORM_FILE เอง |
| start_request | ตรวจ actor, mode2 และ requester step; คืน status; ปัจจุบันไม่ได้ UPDATE CST |
| deletefile | ตรวจ requester/seq, อ่าน snapshot, เลือก API JIG/Delete, ลบ metadata แล้ว unlink; คืน warning เมื่อ physical deletion ไม่สำเร็จ |
| preview_file | wrapper เรียก sendJigAttachment แบบ inline |
| download_file | wrapper เรียก sendJigAttachment แบบ download |
| sendJigAttachment | อ่าน key/form/path, ส่ง content/header ของไฟล์; ไม่พบ/ไม่ผ่านตรวจส่ง404 |
| show_create_delete_form | ตรวจ query, สร้าง context ของ Create หรือฟอร์มเดิม, current step และเลือก delete_form |

Public controller methods อาจถูกเรียกผ่าน URL โดยไม่มี string caller ใน repository; ไม่จัดเป็น dead code จากการค้นภายในเพียงอย่างเดียว
