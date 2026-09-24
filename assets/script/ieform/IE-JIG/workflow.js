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
    let updateRevision = () => {};
    let inspection = false;
    remarkInput.addEventListener('input', () => {
        remarkInput.removeAttribute('aria-invalid');
    });
    async function completeCreate(saved) {
        const record = saved?.JIG_NO ? saved : await loadJigForm(key);
        if (!record?.JIG_NO)
            throw new Error(
                'บันทึกแล้ว แต่ยังไม่พบ JIGNO จาก API กรุณาลองอีกครั้งเพื่อยืนยันผล',
            );
        loaded = false;
        sessionStorage.removeItem(recoveryId);
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
        await editor.ready;
        if (!(await editor.validate())) return false;
        updateRevision();
        const files = editor.files();
        const hasNg = Array.from(rows.querySelectorAll('.result')).some(
            (el) => el.textContent === 'NG',
        );
        const payload = collectJigPayload(form, rows, files.stored, hasNg);
        const reqby = form.elements.requested_by.value;
        const inputby = form.elements.input_by.value;
        lock();
        if (pageMode === 'create') {
            const pending = JSON.parse(
                sessionStorage.getItem(recoveryId) || 'null',
            );
            if (pending?.uncertain)
                throw new Error(
                    'ยังยืนยันผลสร้างเลข Form ครั้งก่อนไม่ได้ กรุณาตรวจรายการ Webflow ก่อนสร้างซ้ำ',
                );
            if (pending?.key) {
                key = keyOf(pending.key);
                const existing = await loadJigForm(key, true);
                if (existing) {
                    await completeCreate(existing);
                    return true;
                }
            } else {
                sessionStorage.setItem(
                    recoveryId,
                    JSON.stringify({ uncertain: true }),
                );
                const result = checkResponse(
                    await createForm({
                        NFRMNO: key.NFRMNO,
                        VORGNO: key.VORGNO,
                        CYEAR: key.CYEAR,
                        REQBY: reqby,
                        INPUTBY: inputby,
                        DRAFT: '1',
                        REMARK: '',
                    }),
                );
                if (!result?.data?.NRUNNO)
                    throw new Error(
                        'API ไม่คืนเลข Form กรุณาตรวจรายการ Webflow ก่อนสร้างซ้ำ',
                    );
                key = keyOf(result.data);
                sessionStorage.setItem(recoveryId, JSON.stringify({ key }));
            }
            const webform = await getFormDetail(key);
            if (
                String(webform.VINPUTER).trim() !== inputby ||
                String(webform.VREQNO).trim() !== reqby
            )
                throw new Error(
                    'Requested By ไม่ตรงกับ Form ที่สร้างไว้ก่อนหน้า กรุณาใช้ผู้ร้องขอเดิม',
                );
            payload.FILES = [
                ...files.stored,
                ...(await uploadJigFiles(key, actor, files.incoming)),
            ].map((file, i) => ({ ...file, FILE_SEQ: i + 1 }));
            const saved = checkResponse(
                await insertJigForm({
                    ...payload,
                    ...key,
                    FORM_TYPE: 'CREATE',
                    CREATE_BY: actor,
                }),
            );
            await completeCreate(saved);
        } else {
            payload.FILES = [
                ...payload.FILES,
                ...(await uploadJigFiles(key, actor, files.incoming)),
            ].map((file, i) => ({ ...file, FILE_SEQ: i + 1 }));
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
            returnButton.hidden = requesterStep;
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
        return withBusy(async (lock) => {
            if (context.mode !== '2' || approved) return false;
            if (action === 'returnb' && requesterStep) return false;
            if (action === 'approve' && requesterStep) {
                await editor.ready;
                if (!(await editor.validate())) return false;
            }
            const remark = remarkInput.value.trim();
            if (action === 'returnb' && !remark) {
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
                title:
                    action === 'approve' ? 'ยืนยัน Approve?' : 'ยืนยัน Return?',
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
                            redirectWebflow();
                        } finally {
                            retry.disabled = false;
                        }
                    });
                document.querySelector('#jig-page').append(retry);
                return false;
            }
            redirectWebflow();
            return true;
        });
    }
    document.querySelector('#jig-approve').onclick = () => void act('approve');
    returnButton.onclick = () => void act('returnb');
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
