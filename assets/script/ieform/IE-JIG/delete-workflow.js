import Swal from 'sweetalert2';
import { createForm, doaction, getFormDetail } from '@amec/webasset/api/webform';
import { redirectWebflow } from '@amec/webasset/form';
import { finishJigDeleteForm, rejectJigDeleteForm, loadJigDeleteForm } from './data';

export const deleteFormKey = (data) => Object.fromEntries(
    ['NFRMNO', 'VORGNO', 'CYEAR', 'CYEAR2', 'NRUNNO'].map((name) => [
        name, ['NFRMNO', 'NRUNNO'].includes(name) ? Number(data[name]) : String(data[name] ?? ''),
    ]),
);

export function checkDeleteResponse(result) {
    if (!result || result.status === false)
        throw new Error(result?.message || 'ดำเนินการไม่สำเร็จ');
    return result;
}

export function initializeDeleteCreation(editor) {
    const { context, page } = editor;
    const recoveryId = `jig-delete-pending:${context.nfrmno}:${context.vorgno}:${context.cyear}:${context.empno}:${context.jigno}`;
    let busy = false;
    let completed = false;
    return async function send() {
        if (busy || completed || context.pageMode !== 'create') return;
        busy = true;
        const controls = [...page.querySelectorAll('button,input,textarea')];
        const disabled = controls.map((control) => control.disabled);
        try {
            if (!(await editor.validate())) return;
            const confirmation = await Swal.fire({ icon: 'question', title: 'ยืนยันส่งคำขอลบ JIG?',
                showCancelButton: true, confirmButtonText: 'ส่งคำขอ', cancelButtonText: 'ยกเลิก' });
            if (!confirmation.isConfirmed) return;
            controls.forEach((control) => { control.disabled = true; });
            let pending = JSON.parse(sessionStorage.getItem(recoveryId) || 'null');
            if (pending?.uncertain)
                throw new Error('ยังยืนยันผลสร้างเลข Form ครั้งก่อนไม่ได้ กรุณาตรวจรายการ Webflow ก่อนสร้างซ้ำ');
            if (!pending?.key) {
                sessionStorage.setItem(recoveryId, JSON.stringify({ uncertain: true }));
                const result = checkDeleteResponse(await createForm({
                    NFRMNO: Number(context.nfrmno), VORGNO: context.vorgno, CYEAR: context.cyear,
                    INPUTBY: context.empno, REQBY: context.empno, REMARK: '',
                }));
                if (!result.data?.NRUNNO || !result.data?.CYEAR2)
                    throw new Error('API ไม่คืนเลข Form กรุณาตรวจรายการ Webflow ก่อนสร้างซ้ำ');
                pending = { key: deleteFormKey(result.data) };
                sessionStorage.setItem(recoveryId, JSON.stringify(pending));
            }
            const key = deleteFormKey(pending.key);
            const webform = await getFormDetail(key);
            if (String(webform.VINPUTER).trim() !== context.empno || String(webform.VREQNO).trim() !== context.empno)
                throw new Error('ผู้ร้องขอไม่ตรงกับ Form ที่สร้างไว้ก่อนหน้า');
            const existing = await loadJigDeleteForm(key, true);
            if (existing && existing.JIG_NO !== context.jigno)
                throw new Error('Form ที่สร้างไว้เป็นคำขอลบของ JIG อื่น');
            if (!existing) await editor.persistCreation(key);
            completed = true;
            sessionStorage.removeItem(recoveryId);
            await Swal.fire({ icon: 'success', title: 'ส่งคำขอลบเรียบร้อย',
                text: `บันทึกคำขอลบ JIG : ${context.jigno} เรียบร้อย`, confirmButtonText: 'ตกลง' });
            const url = new URL(window.location.href);
            Object.entries({ no: key.NFRMNO, orgNo: key.VORGNO, y: key.CYEAR, y2: key.CYEAR2,
                runNo: key.NRUNNO, empno: context.empno }).forEach(([name, value]) => url.searchParams.set(name, value));
            url.searchParams.delete('jigno');
            window.location.replace(url.href);
        } catch (error) {
            await Swal.fire({ icon: 'error', title: 'ส่งคำขอไม่สำเร็จ', text: error.message || 'กรุณาลองใหม่' });
        } finally {
            controls.forEach((control, i) => { control.disabled = completed || disabled[i]; });
            busy = false;
        }
    };
}

// Workflow approval and the master-status callback are separate operations.
// Once doaction has succeeded, retry only the callback, never the approval.
export function initializeDeleteApproval(editor) {
    const { context, key, page } = editor;
    const approval = page.querySelector('#delete-approval');
    const remark = page.querySelector('#delete-remark');
    const syncStatus = page.querySelector('#delete-sync-status');
    const syncMessage = page.querySelector('#delete-sync-message');
    const syncRetry = page.querySelector('#delete-sync-retry');
    const requester = context.cstepno?.trim() === '--';
    let busy = false;
    let acted = false;
    const recoveryId = `jig-delete-action:${Object.values(key).join(':')}:${context.empno}`;

    function pending(message) {
        approval.hidden = true;
        syncStatus.hidden = false;
        syncMessage.textContent = message;
    }

    async function synchronize() {
        const current = await getFormDetail(key);
        const status = String(current.CST).trim();
        if (status === '2') checkDeleteResponse(await finishJigDeleteForm(key));
        else if (status === '3') checkDeleteResponse(await rejectJigDeleteForm(key));
        return status;
    }

    async function complete() {
        try {
            await synchronize();
            sessionStorage.removeItem(recoveryId);
            await Swal.fire({ icon: 'success', title: 'ดำเนินการเรียบร้อย', confirmButtonText: 'ตกลง' });
            redirectWebflow();
        } catch (error) {
            pending('บันทึก Flow แล้ว แต่ยังยืนยันสถานะ JIG ไม่ได้: ' + error.message);
            await Swal.fire({ icon: 'warning', title: 'กรุณาอัปเดตสถานะ JIG อีกครั้ง', text: syncMessage.textContent });
        }
    }

    async function act(action) {
        if (busy || acted || context.mode !== '2') return;
        if (requester && action !== 'approve') return;
        busy = true;
        const controls = [...page.querySelectorAll('button,input,textarea')];
        const disabled = controls.map((control) => control.disabled);
        try {
            if (action === 'approve' && requester && !(await editor.validate())) return;
            const text = remark.value.trim();
            if (action !== 'approve' && !text) {
                await Swal.fire({ icon: 'warning', title: 'กรุณากรอก Remark', text: 'กรุณากรอก Remark ก่อน Return / Reject' });
                remark.focus();
                return;
            }
            const label = { approve: 'Approve', returnb: 'Return', reject: 'Reject' }[action];
            const confirmation = await Swal.fire({
                icon: 'question', title: `ยืนยัน ${label}?`, showCancelButton: true,
                confirmButtonText: 'ยืนยัน', cancelButtonText: 'ยกเลิก',
            });
            if (!confirmation.isConfirmed) return;
            controls.forEach((control) => { control.disabled = true; });
            if (action === 'approve' && requester) await editor.persist();
            // Preserve an uncertain request across reloads to prevent double approval.
            sessionStorage.setItem(recoveryId, JSON.stringify({ state: 'uncertain', step: context.cstepno }));
            let result;
            try {
                result = await doaction({ ...key, ACTION: action, EMPNO: context.empno,
                    REMARK: text, CEXTDATA: context.exdata || '' });
            } catch (error) {
                acted = true;
                pending('ยังยืนยันผลทำรายการไม่ได้ กรุณาโหลดหน้าใหม่เพื่อตรวจสอบ Flow ก่อนทำรายการซ้ำ');
                syncRetry.hidden = false;
                syncRetry.textContent = 'โหลดหน้าใหม่เพื่อตรวจสอบ Flow';
                syncRetry.onclick = () => window.location.reload();
                throw error;
            }
            sessionStorage.removeItem(recoveryId);
            checkDeleteResponse(result);
            acted = true;
            sessionStorage.setItem(recoveryId, 'callback');
            approval.hidden = true;
            await complete();
        } catch (error) {
            await Swal.fire({ icon: 'error', title: 'ดำเนินการไม่สำเร็จ', text: error.message || 'กรุณาลองใหม่' });
        } finally {
            controls.forEach((control, i) => { control.disabled = disabled[i]; });
            busy = false;
            editor.onIdle?.(acted);
        }
    }

    page.querySelector('#delete-approve').onclick = () => void act('approve');
    page.querySelector('#delete-return').onclick = () => void act('returnb');
    page.querySelector('#delete-reject').onclick = () => void act('reject');
    page.querySelector('#delete-return').hidden = requester;
    page.querySelector('#delete-reject').hidden = requester;
    approval.hidden = context.mode !== '2' || ['2', '3'].includes(String(editor.webform.CST).trim());
    syncRetry.onclick = async () => {
        if (busy) return;
        busy = true;
        syncRetry.disabled = true;
        try { await complete(); }
        finally { busy = false; syncRetry.disabled = false; }
    };

    const recovery = sessionStorage.getItem(recoveryId);
    let uncertainStep;
    if (recovery?.startsWith('{')) uncertainStep = JSON.parse(recovery).step;
    if (recovery === 'callback') {
        acted = true;
        pending('บันทึก Flow แล้ว กรุณายืนยันการอัปเดตสถานะ JIG');
    } else if (recovery === 'uncertain' || uncertainStep !== undefined) {
        acted = true;
        if (['2', '3'].includes(String(editor.webform.CST).trim()) || context.mode !== '2' ||
            (uncertainStep !== undefined && uncertainStep !== context.cstepno)) {
            pending('Flow เปลี่ยนขั้นตอนแล้ว กรุณายืนยันการอัปเดตสถานะ JIG');
        } else {
            pending('รายการก่อนหน้ายังไม่ยืนยันผล กรุณาตรวจสอบ Flow ก่อนทำรายการซ้ำ');
            syncRetry.textContent = 'โหลดหน้าใหม่เพื่อตรวจสอบ Flow';
            syncRetry.onclick = () => window.location.reload();
        }
    }
    if (acted) editor.onIdle?.(true);
    return { synchronize };
}
