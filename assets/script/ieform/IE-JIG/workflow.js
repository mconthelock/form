import Swal from 'sweetalert2';
import { redirectWebflow } from '@amec/webasset/form';
import {
    createForm,
    getFormDetail,
    showflow,
    doaction,
} from '@amec/webasset/api/webform';
import {
    insertJigForm,
    saveJigForm,
    loadJigForm,
    uploadJigFiles,
    finishJigForm,
    startJigForm,
    configureJigRequesterFlow,
} from './data';
import { collectJigPayload } from './payload';
import { trackInspectionRevision } from './revision';

const keyNames = ['NFRMNO', 'VORGNO', 'CYEAR', 'CYEAR2', 'NRUNNO'];
const keyOf = (data) =>
    Object.fromEntries(
        keyNames.map((name) => [
            name,
            ['NFRMNO', 'NRUNNO'].includes(name)
                ? Number(data[name])
                : String(data[name] ?? ''),
        ]),
    );
const checkResponse = (result) => {
    if (result?.status === false)
        throw new Error(
            typeof result.message === 'string'
                ? result.message
                : 'ดำเนินการไม่สำเร็จ',
        );
    return result;
};
const traceCreate = (step, message, value) => {
    const label = `[JIG CREATE][STEP ${step}] ${message}`;
    if (value === undefined) console.info(label);
    else console.info(label, value);
};
const traceCreateError = (step, message, error) =>
    console.error(`[JIG CREATE][STEP ${step}][ERROR] ${message}`, error);

export function initializeJigWorkflow(editor) {
    const { form, rows, pageMode } = editor;
    const context = document.querySelector('.form-data').dataset;
    let key = keyOf(
        Object.fromEntries(
            keyNames.map((name) => [name, context[name.toLowerCase()]]),
        ),
    );
    const actor = context.empno;
    const recoveryId = `jig-pending:${key.NFRMNO}:${key.VORGNO}:${key.CYEAR}:${actor}`;
    let busy = false,
        loaded = pageMode === 'create',
        approved = false;
    const approval = document.querySelector('#jig-approval');
    const remarkInput = document.querySelector('#jig-remark');
    const returnButton = document.querySelector('#jig-return');
    const requesterStep = context.cstepno === '--';
    const recheckStep = context.cstepno === '19';
    const hideReturn = requesterStep || context.cstepno === '07';
    let updateRevision = () => {};
    let inspection = false;
    remarkInput.addEventListener('input', () => {
        remarkInput.removeAttribute('aria-invalid');
    });
    async function completeCreate(saved) {
        traceCreate('12', 'ตรวจสอบ JIG_NO หลังบันทึก', {
            key,
            responseJigNo: saved?.JIG_NO ?? null,
        });
        const record = saved?.JIG_NO ? saved : await loadJigForm(key);
        traceCreate('13', 'พบข้อมูล JIG ที่บันทึกแล้ว', record);
        if (!record?.JIG_NO)
            throw new Error(
                'บันทึกแล้ว แต่ยังไม่พบ JIGNO จาก API กรุณาลองอีกครั้งเพื่อยืนยันผล',
            );
        loaded = false;
        sessionStorage.removeItem(recoveryId);
        traceCreate('14', 'ล้าง recovery state และจบ Create สำเร็จ', {
            recoveryId,
            JIG_NO: record.JIG_NO,
        });
        await Swal.fire({
            icon: 'success',
            title: 'บันทึกเรียบร้อย',
            text: `บันทึกข้อมูล JIGNO : ${record.JIG_NO} เรียบร้อย`,
            confirmButtonText: 'ตกลง',
        });
        const url = new URL(window.location.href);
        for (const [field, param] of Object.entries({
            NFRMNO: 'no',
            VORGNO: 'orgNo',
            CYEAR: 'y',
        }))
            url.searchParams.set(param, key[field]);
        for (const param of ['y2', 'runNo', 'mode'])
            url.searchParams.delete(param);
        url.searchParams.set('empno', actor);
        window.location.replace(url.href);
    }
    async function withBusy(action) {
        if (busy || !loaded) return;
        busy = true;
        const controls = Array.from(
            document.querySelectorAll(
                '#jig-form input,#jig-form select,#jig-form textarea,#jig-form button,#jig-approval button,#jig-approval textarea',
            ),
        );
        const disabled = controls.map((el) => el.disabled);
        try {
            return await action(() =>
                controls.forEach((el) => {
                    el.disabled = true;
                }),
            );
        } catch (error) {
            if (pageMode === 'create')
                traceCreateError('FAILED', 'Create JIG Form ไม่สำเร็จ', error);
            await Swal.fire({
                icon: 'error',
                title: 'ดำเนินการไม่สำเร็จ',
                text: error.message || 'กรุณาลองใหม่',
            });
            return false;
        } finally {
            controls.forEach((el, i) => {
                el.disabled = disabled[i];
            });
            busy = false;
        }
    }
    async function persist(lock) {
        if (pageMode === 'view') return false;
        if (pageMode === 'create')
            traceCreate('01', 'เริ่ม Create JIG Form', {
                origin: window.location.origin,
                key,
                recoveryId,
            });
        await editor.ready;
        if (pageMode === 'create') traceCreate('02', 'Editor พร้อมใช้งาน');
        const valid = await editor.validate();
        if (!valid) {
            if (pageMode === 'create')
                traceCreateError('03', 'Validation หน้า Create ไม่ผ่าน');
            return false;
        }
        if (pageMode === 'create') traceCreate('03', 'Validation ผ่าน');
        updateRevision();
        const files = editor.files();
        const hasNg = Array.from(rows.querySelectorAll('.result')).some(
            (el) => el.textContent === 'NG',
        );
        const payload = collectJigPayload(form, rows, files.stored, hasNg);
        const reqby = form.elements.requested_by.value;
        const inputby = form.elements.input_by.value;
        if (pageMode === 'create')
            traceCreate('04', 'รวบรวมข้อมูลสำหรับบันทึก', {
                inputby,
                reqby,
                hasNg,
                checkpointCount: payload.DETAILS?.length ?? 0,
                storedFileCount: files.stored.length,
                incomingFileCount: files.incoming.length,
                location: payload.LOCATION,
                picEmpno: payload.PIC_EMPNO,
            });
        lock();
        if (pageMode === 'create') {
            const recoveryValue = sessionStorage.getItem(recoveryId);
            const pending = JSON.parse(recoveryValue || 'null');
            traceCreate('05', 'ตรวจสอบ recovery state', {
                recoveryId,
                recoveryValue,
                pending,
            });
            if (pending?.uncertain) {
                traceCreateError(
                    '05',
                    'พบ uncertain state จากการสร้าง Webflow ครั้งก่อน',
                    pending,
                );
                throw new Error(
                    'ยังยืนยันผลสร้างเลข Form ครั้งก่อนไม่ได้ กรุณาตรวจรายการ Webflow ก่อนสร้างซ้ำ',
                );
            }
            if (pending?.key) {
                key = keyOf(pending.key);
                traceCreate('06', 'พบ Form key เดิม กำลังตรวจ JIG_FORM', key);
                const existing = await loadJigForm(key, true);
                traceCreate('06', 'ผลตรวจ JIG_FORM เดิม', existing);
                if (existing) {
                    // The JIG snapshot may be saved even if the separate WEBFORM transaction failed.
                    const picCode = form.elements
                        .namedItem('location')
                        .selectedOptions[0]?.dataset.piccode?.trim();
                    traceCreate('11', 'เรียก requester-flow สำหรับข้อมูลเดิม', {
                        key,
                        picCode,
                    });
                    const flowResult = checkResponse(
                        await configureJigRequesterFlow(key, picCode),
                    );
                    traceCreate('11', 'requester-flow สำเร็จ', flowResult);
                    await completeCreate(existing);
                    return true;
                }
            } else {
                sessionStorage.setItem(
                    recoveryId,
                    JSON.stringify({ uncertain: true }),
                );
                traceCreate('06', 'ตั้ง uncertain state ก่อนเรียก createForm', {
                    recoveryId,
                });
                const createParams = {
                    NFRMNO: key.NFRMNO,
                    VORGNO: key.VORGNO,
                    CYEAR: key.CYEAR,
                    REQBY: reqby,
                    INPUTBY: inputby,
                    REMARK: '',
                };
                traceCreate('07', 'เรียก Webflow createForm', createParams);
                let result;
                try {
                    result = checkResponse(await createForm(createParams));
                    traceCreate('07', 'Webflow createForm ตอบกลับ', result);
                } catch (error) {
                    traceCreateError('07', 'Webflow createForm ล้มเหลว', error);
                    throw error;
                }
                if (!result?.data?.NRUNNO) {
                    traceCreateError(
                        '08',
                        'Webflow response ไม่มี data.NRUNNO',
                        result,
                    );
                    throw new Error(
                        'API ไม่คืนเลข Form กรุณาตรวจรายการ Webflow ก่อนสร้างซ้ำ',
                    );
                }
                key = keyOf(result.data);
                sessionStorage.setItem(recoveryId, JSON.stringify({ key }));
                traceCreate('08', 'ได้รับ Form key และบันทึก recovery key', {
                    key,
                    recoveryId,
                });
            }
            traceCreate('09', 'เรียก getFormDetail', key);
            const webform = await getFormDetail(key);
            traceCreate('09', 'getFormDetail ตอบกลับ', webform);
            if (
                String(webform.VINPUTER).trim() !== inputby ||
                String(webform.VREQNO).trim() !== reqby
            ) {
                traceCreateError('09', 'VINPUTER หรือ VREQNO ไม่ตรงกับค่าที่ส่ง', {
                    expected: { inputby, reqby },
                    actual: {
                        VINPUTER: webform.VINPUTER,
                        VREQNO: webform.VREQNO,
                    },
                });
                throw new Error(
                    'Requested By ไม่ตรงกับ Form ที่สร้างไว้ก่อนหน้า กรุณาใช้ผู้ร้องขอเดิม',
                );
            }
            traceCreate('10', 'เริ่ม upload ไฟล์', {
                storedFileCount: files.stored.length,
                incomingFileCount: files.incoming.length,
            });
            const uploadedFiles = await uploadJigFiles(
                key,
                actor,
                files.incoming,
            );
            traceCreate('10', 'upload ไฟล์สำเร็จ', uploadedFiles);
            payload.FILES = [...files.stored, ...uploadedFiles].map(
                (file, i) => ({ ...file, FILE_SEQ: i + 1 }),
            );
            const jigRequest = {
                ...payload,
                ...key,
                FORM_TYPE: 'CREATE',
                CREATE_BY: actor,
            };
            traceCreate('11', 'เรียก API บันทึก JIG_FORM', {
                ...jigRequest,
                FILES: jigRequest.FILES.map((file) => ({
                    FILE_SEQ: file.FILE_SEQ,
                    FILE_NAME: file.FILE_NAME,
                    FILE_PATH: file.FILE_PATH,
                    FILE_GROUP: file.FILE_GROUP,
                })),
            });
            let saved;
            try {
                saved = checkResponse(await insertJigForm(jigRequest));
                traceCreate('11', 'API บันทึก JIG_FORM ตอบกลับ', saved);
            } catch (error) {
                traceCreateError('11', 'API บันทึก JIG_FORM ล้มเหลว', error);
                throw error;
            }
            await completeCreate(saved);
        } else {
            const uploaded = await uploadJigFiles(key, actor, files.incoming);
            payload.FILES = [
                ...files.stored.map(
                    ({
                        FILE_SEQ,
                        FILE_NAME,
                        FILE_PATH,
                        FILE_TYPE,
                        FILE_SIZE,
                    }) => ({
                        FILE_SEQ,
                        FILE_NAME,
                        FILE_PATH,
                        FILE_TYPE,
                        FILE_SIZE,
                        FILE_GROUP: 'REFERENCE',
                    }),
                ),
                ...uploaded.map((file, i) => ({
                    ...file,
                    FILE_SEQ: files.nextSeq + i,
                    FILE_GROUP: 'REFERENCE',
                })),
            ];
            editor.filesSaved(payload.FILES);
            if (!inspection || !requesterStep) delete payload.REV;
            delete payload.START_USE_DATE;
            checkResponse(
                await saveJigForm(key, {
                    ...payload,
                    UPDATE_BY: actor,
                    REPLACE_DETAILS: true,
                    REPLACE_FILES: true,
                }),
            );
        }
        return true;
    }
    async function load() {
        if (pageMode === 'create') return;
        try {
            const [snapshot, webform, flow] = await Promise.all([
                loadJigForm(key),
                getFormDetail(key),
                showflow(key),
            ]);
            await editor.hydrate(snapshot, webform, key);
            inspection = String(snapshot.FORM_TYPE).trim() === 'INSPECTION';
            updateRevision = trackInspectionRevision(form, rows, snapshot);
            document.querySelector('.flow').innerHTML = flow.html || '';
            returnButton.hidden = hideReturn;
            approval.hidden = context.mode !== '2';
            loaded = true;
        } catch (error) {
            document.querySelector('#jig-load-status').textContent =
                'โหลดข้อมูลไม่สำเร็จ: ' + error.message;
            await Swal.fire({
                icon: 'error',
                title: 'โหลดข้อมูลไม่สำเร็จ',
                text: error.message,
            });
        }
    }
    async function act(action) {
        const navigateAfterAction = () => {
            if (action === 'approve' && context.cstepno?.trim() === '07') {
                window.location.reload();
            } else {
                redirectWebflow();
            }
        };
        return withBusy(async (lock) => {
            if (context.mode !== '2' || approved) return false;
            if (action === 'return' && hideReturn) return false;
            if (action === 'approve' && requesterStep) {
                await editor.ready;
                if (!(await editor.validate())) return false;
            }
            if (
                action === 'approve' &&
                recheckStep &&
                !(await editor.recheck.validate())
            )
                return false;
            const remark = remarkInput.value.trim();
            if (action === 'return' && !remark) {
                remarkInput.setAttribute('aria-invalid', 'true');
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Remark',
                    text: 'กรุณากรอก Remark ก่อน Return',
                    confirmButtonText: 'ตกลง',
                });
                remarkInput.focus();
                return false;
            }
            remarkInput.removeAttribute('aria-invalid');
            const result = await Swal.fire({
                title: action === 'approve' ? 'ยืนยัน Approve?' : 'ยืนยัน Return?',
                showCancelButton: true,
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'ยกเลิก',
            });
            if (!result.isConfirmed) return false;
            if (action === 'approve' && requesterStep) {
                if (!(await persist(lock))) return false;
                const hasNg = Array.from(rows.querySelectorAll('.result')).some(
                    (element) => element.textContent === 'NG',
                );
                const picCode = hasNg
                    ? form.elements
                          .namedItem('location')
                          .selectedOptions[0]?.dataset.piccode?.trim()
                    : undefined;
                checkResponse(await configureJigRequesterFlow(key, picCode));
                checkResponse(await startJigForm(key, actor));
            }
            if (action === 'approve' && recheckStep) {
                lock();
                if (!(await editor.recheck.persist())) return false;
            }
            lock();
            checkResponse(
                await doaction({
                    ...key,
                    ACTION: action,
                    EMPNO: actor,
                    REMARK: remark,
                    CEXTDATA: context.exdata || '',
                }),
            );
            approved = true;
            approval.hidden = true;
            try {
                const webform = await getFormDetail(key);
                if (String(webform.CST) === '2')
                    checkResponse(await finishJigForm(key, actor));
            } catch (error) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'บันทึก Flow แล้ว',
                    text:
                        'ยังยืนยันการอัปเดต JIG_MASTER ไม่ได้: ' +
                        error.message +
                        ' กรุณาตรวจสอบก่อนอนุมัติซ้ำ',
                });
                const retry = document.createElement('button');
                retry.type = 'button';
                retry.className = 'btn mt-4';
                retry.textContent = 'ลองอัปเดต JIG_MASTER อีกครั้ง';
                retry.onclick = () =>
                    void withBusy(async (lock) => {
                        lock();
                        retry.disabled = true;
                        try {
                            const current = await getFormDetail(key);
                            if (String(current.CST) === '2')
                                checkResponse(await finishJigForm(key, actor));
                            navigateAfterAction();
                        } finally {
                            retry.disabled = false;
                        }
                    });
                document.querySelector('#jig-page').append(retry);
                return false;
            }
            navigateAfterAction();
            return true;
        });
    }
    document.querySelector('#jig-approve').onclick = () => void act('approve');
    document.querySelector('#jig-return').onclick = () => void act('returnb');
    void load();
    return {
        save: () =>
            withBusy(async (lock) => {
                if ((await persist(lock)) && pageMode === 'edit') {
                    await Swal.fire({
                        icon: 'success',
                        title: 'บันทึกเรียบร้อย',
                    });
                    redirectWebflow();
                }
            }),
    };
}
