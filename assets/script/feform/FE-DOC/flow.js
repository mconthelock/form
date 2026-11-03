import $ from 'jquery';
import {
    getMode,
    getExtData,
    showflow,
    doaction,
    deleteFlowandForm,
} from '@amec/webasset/api/webform';
import { redirectWebflow } from '@amec/webasset/form';
import { showLoader } from '@amec/webasset/preloader';
import {
    showMessage,
    showErrorMessage,
    showConfirm,
} from '@amec/webasset/utils';
import { host } from '../../utils';
import { deleteDraftDoc } from './data';
import { stampFormAttachedFiles } from './pdfStamper';

export async function initFlow(form, status) {
    if (!form.NRUNNO) {
        $('#MODEHid').val('1');
        $('#EXTDATAHid').val('');
        applyButtonPermissions('1', '', '', form.EMPNO);
    } else {
        const currentMode = String(await getMode(form));
        const currentExtData = String(await getExtData(form));

        $('#MODEHid').val(currentMode);
        $('#EXTDATAHid').val(currentExtData);

        applyButtonPermissions(currentMode, currentExtData, status, form.EMPNO);

        const flow = await showflow(form);
        $('.flow').html(flow.html);
    }

    bindFlowEvents(form);
}

export function applyButtonPermissions(mode, extData, status = '', empno = '') {
    const rawStatus = (status || '').toUpperCase().trim();
    // ดึงรหัสพนักงานจาก ID ใหม่ (#REQUEST_BY_EMPNO)
    const requestBy = ($('#REQUEST_BY_EMPNO').val() || '').trim();
    const currentEmpNo = (empno || $('#EMPNOHid').val() || '').trim();

    const isOwner =
        requestBy !== '' && currentEmpNo !== '' && requestBy === currentEmpNo;

    $(
        '#SaveDocBtn, #DeleteBtn, #ApproveBtn, #ReturnBtn, #ManualStampBtn',
    ).addClass('hidden');

    if (mode === '1') {
        $('#DocTypeDrp').prop('disabled', false);
        $('#DOC_SUBJECTTxt')
            .prop('readonly', false)
            .removeClass('bg-slate-100 cursor-not-allowed text-slate-600')
            .addClass('bg-white text-slate-800');
        $('#drop-zone').removeClass('hidden');

        // แก้ไข Request By ได้เฉพาะตอนสร้างเอกสารใหม่ครั้งแรกสุดเท่านั้น
        if (rawStatus === '' && !$('#DocHeaderIDHid').val()) {
            $('#REQUEST_BY_EMPNO')
                .prop('readonly', false)
                .removeClass('bg-slate-100 cursor-not-allowed text-slate-600')
                .addClass('bg-white text-slate-800');
        } else {
            // ถ้าเคยบันทึกแล้ว/มี ID แล้ว -> ล็อกห้ามแก้ไข
            $('#REQUEST_BY_EMPNO')
                .prop('readonly', true)
                .addClass('bg-slate-100 cursor-not-allowed text-slate-600')
                .removeClass('bg-white text-slate-800');
        }

        if (rawStatus === 'DRAFT' || rawStatus === '') {
            $('#SaveDocBtn').removeClass('hidden');
        }
    } else if (mode === '2') {
        // ล็อก Request By ให้เป็น Readonly เสมอ (รวมถึงกรณี Return กลับมาหา Owner ด้วย)
        $('#REQUEST_BY_EMPNO')
            .prop('readonly', true)
            .addClass('bg-slate-100 cursor-not-allowed text-slate-600')
            .removeClass('bg-white text-slate-800');

        $('#DocTypeDrp').prop('disabled', true);
        if (isOwner) {
            // เมื่อเอกสารถูก Return กลับมาหา Requester สามารถแก้ไข Subject และไฟล์ได้
            $('#DOC_SUBJECTTxt')
                .prop('readonly', false)
                .removeClass('bg-slate-100 cursor-not-allowed text-slate-600')
                .addClass('bg-white text-slate-800');

            $('#drop-zone').removeClass('hidden');
            $('#SaveDocBtn').removeClass('hidden');
            $('#DeleteBtn').removeClass('hidden');
        } else {
            $('#drop-zone').addClass('hidden');
            $('#ApproveBtn, #ReturnBtn').removeClass('hidden');
        }
    } else {
        // Mode 3 (View Mode): ล็อกทั้งหมด
        $('#REQUEST_BY_EMPNO')
            .prop('readonly', true)
            .addClass('bg-slate-100 cursor-not-allowed text-slate-600')
            .removeClass('bg-white text-slate-800');

        $('#DocTypeDrp').prop('disabled', true);
        $('#DOC_SUBJECTTxt')
            .prop('readonly', true)
            .addClass('bg-slate-100 cursor-not-allowed text-slate-600')
            .removeClass('bg-white text-slate-800');
        $('#drop-zone').addClass('hidden');
    }

    if (
        isOwner &&
        (rawStatus === 'DRAFT' || rawStatus === '') &&
        $('#DocHeaderIDHid').val() !== ''
    ) {
        $('#DeleteBtn').removeClass('hidden');
    }

    if (currentEmpNo === '13204') {
        $('#DeleteBtn').removeClass('hidden');
        $('#ManualStampBtn').removeClass('hidden');
    }
}

function bindFlowEvents(form) {
    $(document)
        .off('click', '#ApproveBtn')
        .on('click', '#ApproveBtn', () => actionFlow('approve', form));

    $(document)
        .off('click', '#ReturnBtn')
        .on('click', '#ReturnBtn', async function () {
            const Remark = ($('#RemarkTxt').val() || '').trim();

            if (!Remark) {
                showMessage('กรุณากรอก Remark', 'warning');
                $('#RemarkTxt').focus();
                return;
            }
            const isConfirm = await showConfirm({
                title: 'ยืนยันการ Return',
                message: 'ต้องการ Return เอกสารกลับผู้จัดทำ ใช่หรือไม่?',
                acceptText: 'ยืนยัน',
                cancelText: 'ยกเลิก',
            });

            if (isConfirm) {
                actionFlow('returnp', form);
            }
        });

    // ปุ่มทดสอบ / ซ่อมแซม Stamp เอกสารของรหัส 13204
    $(document)
        .off('click', '#ManualStampBtn')
        .on('click', '#ManualStampBtn', async function () {
            const isConfirm = await showConfirm({
                title: 'ยืนยันการประทับตรา',
                message:
                    'ต้องการประทับตรายางลงไฟล์ PDF จากประวัติปัจจุบันทันที ใช่หรือไม่?',
                acceptText: 'ยืนยัน',
                cancelText: 'ยกเลิก',
            });

            if (!isConfirm) return;

            try {
                await showLoader({ show: true });
                await executeFinalStamping(form);
                showMessage('ประทับตราเอกสารเรียบร้อยแล้ว', 'success');
                setTimeout(() => location.reload(), 1000);
            } catch (e) {
                console.error(e);
                showErrorMessage(
                    'เกิดข้อผิดพลาดในการ Stamp: ' + (e?.message || ''),
                );
            } finally {
                await showLoader({ show: false });
            }
        });

    $(document)
        .off('click', '#DeleteBtn')
        .on('click', '#DeleteBtn', async function () {
            const isConfirm = await showConfirm({
                title: 'ยืนยันการลบแบบฟอร์ม',
                message: 'ต้องการลบแบบฟอร์มนี้ ใช่หรือไม่?',
                acceptText: 'ยืนยัน',
                cancelText: 'ยกเลิก',
            });

            if (!isConfirm) return;

            try {
                await showLoader({ show: true });
                const delFlow = await deleteFlowandForm(form);
                if (delFlow && delFlow.status) {
                    const resDel = await deleteDraftDoc({
                        DOC_HEADER_ID: $('#DocHeaderIDHid').val(),
                        NFRMNO: form.NFRMNO,
                        VORGNO: form.VORGNO,
                        CYEAR: form.CYEAR,
                        CYEAR2: form.CYEAR2,
                        NRUNNO: form.NRUNNO,
                    });

                    if (resDel.status) {
                        showMessage('ลบข้อมูลและไฟล์เรียบร้อยแล้ว', 'success');
                    } else {
                        showMessage(
                            'ลบข้อมูลสำเร็จบางส่วน: ' + (resDel.message || ''),
                            'warning',
                        );
                    }
                    setTimeout(() => redirectWebflow(), 1200);
                } else {
                    showErrorMessage(
                        'ไม่สามารถลบ Flow ได้: ' + (delFlow?.message || ''),
                    );
                }
            } catch (e) {
                console.error(e);
                showErrorMessage('เกิดข้อผิดพลาด: ' + e.message);
            } finally {
                await showLoader({ show: false });
            }
        });
}

export async function actionFlow(actionType, form) {
    const extData = $('#EXTDATAHid').val() || '';
    const cleanAction = String(actionType).toLowerCase().trim();

    const payload = {
        NFRMNO: Number(form.NFRMNO || 0),
        VORGNO: String(form.VORGNO || ''),
        CYEAR: String(form.CYEAR || ''),
        CYEAR2: String(form.CYEAR2 || ''),
        NRUNNO: Number(form.NRUNNO || 0),
        ACTION: cleanAction,
        EXTDATA: extData,
        EMPNO: form.EMPNO,
        REMARK: $('#RemarkTxt').val() || '',
    };

    try {
        await showLoader({ show: true });
        const res = await doaction(payload);

        if (res?.status) {
            const resActionFlow = await $.ajax({
                url: host + 'feform/FE-DOC/form/ActionFlow',
                type: 'POST',
                data: {
                    ...payload,
                    ACTION: cleanAction.toUpperCase(),
                    DOC_HEADER_ID: $('#DocHeaderIDHid').val(),
                },
                dataType: 'json',
            });

            if (
                cleanAction === 'approve' &&
                resActionFlow?.statusDoc === 'APPROVE'
            ) {
                await executeFinalStamping(form);
            }

            showMessage('ดำเนินการสำเร็จ', 'success');
            setTimeout(() => redirectWebflow(), 1200);
        } else {
            showErrorMessage(res?.message || 'ส่งสถานะ Flow ไม่สำเร็จ');
        }
    } catch (e) {
        console.error(e);
        showErrorMessage('เกิดข้อผิดพลาดในการทำ Action: ' + (e?.message || ''));
    } finally {
        await showLoader({ show: false });
    }
}

export async function executeFinalStamping(form) {
    const res = await $.ajax({
        url: host + 'feform/FE-DOC/form/GetStampData',
        type: 'POST',
        data: {
            no: form.NFRMNO,
            orgNo: form.VORGNO,
            y: form.CYEAR,
            y2: form.CYEAR2,
            runNo: form.NRUNNO,
        },
        dataType: 'json',
    });

    if (!res?.status || !res.logs || res.logs.length === 0) {
        throw new Error('ไม่พบประวัติการอนุมัติในระบบ');
    }

    await stampFormAttachedFiles(
        {
            NFRMNO: form.NFRMNO,
            VORGNO: form.VORGNO,
            CYEAR: form.CYEAR,
            CYEAR2: form.CYEAR2,
            NRUNNO: form.NRUNNO,
            EMPNO: form.EMPNO,
            FORM_TYPE: 'FE',
        },
        res.logs,
        { hasBorder: false },
    );
}
