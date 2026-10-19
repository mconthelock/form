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
import { stampFormAttachedFiles } from '../FE-DOC/pdfStamper';
import { applyReviewPeriodRules } from './form';

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

    bindFlowButtons(form);
}

export function applyButtonPermissions(mode, extData, status = '', empno = '') {
    const rawStatus = (status || '').toUpperCase().trim();
    const requestBy = ($('#REQUEST_BY_EMPNO').val() || '').trim();
    const currentEmpNo = (empno || $('#EMPNOHid').val() || '').trim();
    const isOwner =
        requestBy !== '' && currentEmpNo !== '' && requestBy === currentEmpNo;
    const isAutoJob = ($('#IS_AUTO_JOBHid').val() || 'N') === 'Y';
    const isSuperAdmin = currentEmpNo === '13204';

    // ตรวจสอบว่า Step 1 Approve แล้วหรือไม่
    const isFirstStepApproved = Boolean(window.IS_FIRST_STEP_APPROVED);

    $(
        '#btnSaveDraft, #SaveDocBtn, #ApproveBtn, #ReturnBtn, #RejectBtn, #DeleteBtn, #ManualStampBtn',
    ).addClass('hidden');

    const setFormEditable = (editable) => {
        $('#ControlNoDrp, #DeptDrp, #SecDrp').prop('disabled', !editable);
        $('input[name="REVIEW_DETAILS"]').prop('disabled', !editable);
        $('#DetailChangeTxt').prop('readonly', !editable);
        $('input[name="EFFECT_STATUS"]').prop('disabled', !editable);
        $('#confirmation-table-zone input[type="radio"]').prop(
            'disabled',
            !editable,
        );
        $('.topic-detail-in').prop('readonly', !editable);

        if (editable) {
            applyReviewPeriodRules();
            $('#drop-zone').removeClass('hidden');
            $('.btn-delete-file').show();
        } else {
            $('input[name="REVIEW_PERIOD"]').prop('disabled', true);
            $('#drop-zone').addClass('hidden');
            $('.btn-delete-file').hide();
        }
    };

    // ล็อกช่อง Request By ถ้าไม่ใช่การสร้างใหม่ครั้งแรก
    if (mode === '1' && rawStatus === '' && !$('#DocHeaderIDHid').val()) {
        $('#REQUEST_BY_EMPNO')
            .prop('readonly', false)
            .removeClass('bg-slate-100 cursor-not-allowed text-slate-600')
            .addClass('bg-white text-slate-800');
    } else {
        $('#REQUEST_BY_EMPNO')
            .prop('readonly', true)
            .addClass('bg-slate-100 cursor-not-allowed text-slate-600')
            .removeClass('bg-white text-slate-800');
    }

    if (mode === '1') {
        if (isFirstStepApproved) {
            setFormEditable(false);
        } else {
            setFormEditable(true);
            if (rawStatus === 'DRAFT' || rawStatus === '') {
                $('#btnSaveDraft, #SaveDocBtn').removeClass('hidden');
            }
        }
    } else if (mode === '2') {
        if (isOwner) {
            // เมื่อเอกสารถูก Return กลับมาหา Requester (สถานะจะกลับมาเป็น DRAFT และ Step ยังไม่สมบูรณ์)
            setFormEditable(true);
            $('#btnSaveDraft, #SaveDocBtn').removeClass('hidden');
            if (!isAutoJob) $('#DeleteBtn').removeClass('hidden');
        } else {
            // ผู้อนุมัติในสาย (Approver)
            setFormEditable(false);
            $('#ApproveBtn, #ReturnBtn').removeClass('hidden');
            if (!isAutoJob) $('#RejectBtn').removeClass('hidden');
        }
    } else {
        // Mode 3: View Mode
        setFormEditable(false);
    }

    // ปุ่มฟังก์ชันเฉพาะของ 13204
    if (isSuperAdmin && !isAutoJob) {
        $('#ManualStampBtn, #DeleteBtn').removeClass('hidden');
    }
}

function bindFlowButtons(form) {
    $(document)
        .off('click', '#ApproveBtn')
        .on('click', '#ApproveBtn', () => actionFlow('approve', form));

    $(document)
        .off('click', '#ReturnBtn')
        .on('click', '#ReturnBtn', async function () {
            const remark = ($('#RemarkTxt').val() || '').trim();
            if (!remark) {
                showMessage('กรุณากรอก Remark สำหรับ Return', 'warning');
                $('#RemarkTxt').focus();
                return;
            }

            const isConfirm = await showConfirm({
                title: 'ยืนยันการ Return',
                message: 'ต้องการส่งเอกสารกลับผู้จัดทำ ใช่หรือไม่?',
                acceptText: 'ยืนยัน',
                cancelText: 'ยกเลิก',
            });
            if (isConfirm) actionFlow('returnp', form);
        });

    $(document)
        .off('click', '#RejectBtn')
        .on('click', '#RejectBtn', async function () {
            const remark = ($('#RemarkTxt').val() || '').trim();
            if (!remark) {
                showMessage('กรุณากรอก Remark สำหรับ Reject', 'warning');
                $('#RemarkTxt').focus();
                return;
            }

            const isConfirm = await showConfirm({
                title: 'ยืนยันการ Reject',
                message: 'ต้องการปฏิเสธเอกสารนี้ ใช่หรือไม่?',
                acceptText: 'ยืนยัน Reject',
                cancelText: 'ยกเลิก',
            });
            if (isConfirm) actionFlow('reject', form);
        });

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
                showMessage('ประทับตราเรียบร้อยแล้ว', 'success');
                setTimeout(() => location.reload(), 1000);
            } catch (e) {
                console.error(e);
                showErrorMessage('Stamp ล้มเหลว: ' + (e?.message || ''));
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
                if (delFlow?.status) {
                    await deleteDraftDoc({
                        DOC_HEADER_ID: $('#DocHeaderIDHid').val(),
                        NFRMNO: form.NFRMNO,
                        VORGNO: form.VORGNO,
                        CYEAR: form.CYEAR,
                        CYEAR2: form.CYEAR2,
                        NRUNNO: form.NRUNNO,
                    });
                    showMessage('ลบแบบฟอร์มเรียบร้อยแล้ว', 'success');
                    setTimeout(() => redirectWebflow(), 1200);
                } else {
                    showErrorMessage(
                        'ลบไม่สำเร็จ: ' + (delFlow?.message || ''),
                    );
                }
            } catch (e) {
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
                url: host + 'feform/FE-ASP/form/ActionFlow',
                type: 'POST',
                data: {
                    ...payload,
                    ACTION: cleanAction.toUpperCase(),
                    DOC_HEADER_ID: $('#DocHeaderIDHid').val(),
                },
                dataType: 'json',
            });

            // ตรวจสอบ Final Approve สำหรับประทับตรายาง (เฉพาะกรณี CHANGE)
            if (
                cleanAction === 'approve' &&
                resActionFlow?.statusDoc === 'APPROVE'
            ) {
                const reviewDetails = $(
                    'input[name="REVIEW_DETAILS"]:checked',
                ).val();
                if (reviewDetails === 'CHANGE') {
                    await executeFinalStamping(form);
                }
            }

            showMessage('ดำเนินการสำเร็จ', 'success');
            setTimeout(() => redirectWebflow(), 1200);
        } else {
            showErrorMessage(res?.message || 'ส่งสถานะ Flow ไม่สำเร็จ');
        }
    } catch (e) {
        showErrorMessage('เกิดข้อผิดพลาด: ' + (e?.message || ''));
    } finally {
        await showLoader({ show: false });
    }
}

export async function executeFinalStamping(form) {
    const res = await $.ajax({
        url: host + 'feform/FE-ASP/form/GetStampData',
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
