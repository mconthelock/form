import {
    getMode,
    getExtData,
    showflow,
    doaction,
    deleteFlowandForm,
} from '@amec/webasset/api/webform';
import { redirectWebflow } from '@amec/webasset/form';
import { showLoader } from '@amec/webasset/preloader';
import { host } from '../../utils';
import { deleteDraftDoc } from './data';
// 🟢 import เฉพาะฟังก์ชันหลักจาก pdfStamper
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
    const requestBy = ($('#REQUEST_BYTxt').val() || '').trim();
    const currentEmpNo = (empno || $('#EMPNOHid').val() || '').trim();

    const isOwner =
        requestBy !== '' && currentEmpNo !== '' && requestBy === currentEmpNo;

    $(
        '#SaveDocBtn, #DeleteBtn, #ApproveBtn, #ReturnBtn, #ManualStampBtn',
    ).addClass('hidden');

    if (mode === '1') {
        $('#DocTypeDrp').prop('disabled', false);
        $('#drop-zone').removeClass('hidden');

        if (rawStatus === 'DRAFT' || rawStatus === '') {
            $('#SaveDocBtn').removeClass('hidden');
        }
    } else if (mode === '2') {
        if (isOwner) {
            $('#DocTypeDrp').prop('disabled', false);
            $('#drop-zone').removeClass('hidden');
            $('#SaveDocBtn').removeClass('hidden');
            $('#DeleteBtn').removeClass('hidden');
        } else {
            $('#DocTypeDrp').prop('disabled', true);
            $('#drop-zone').addClass('hidden');
            $('#ApproveBtn, #ReturnBtn').removeClass('hidden');
        }
    } else {
        $('#DocTypeDrp').prop('disabled', true);
        $('#drop-zone').addClass('hidden');
    }

    if (
        isOwner &&
        (rawStatus === 'DRAFT' || rawStatus === '') &&
        $('#DocHeaderIDHid').val() !== ''
    ) {
        $('#DeleteBtn').removeClass('hidden');
    }

    // 🟢 สิทธิ์พิเศษสำหรับ Admin 13204: ลบเอกสารได้ทุกสถานะ และกด Force Stamp ได้เสมอ
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
        .on('click', '#ReturnBtn', () => {
            if (confirm('ยืนยันการ Return เอกสารกลับผู้จัดทำใช่หรือไม่?')) {
                actionFlow('return', form);
            }
        });

    // ปุ่มทดสอบ / ซ่อมแซม Stamp เอกสารของรหัส 13204
    $(document)
        .off('click', '#ManualStampBtn')
        .on('click', '#ManualStampBtn', async function () {
            if (
                !confirm(
                    'ต้องการประทับตรายางลงไฟล์ PDF จากประวัติปัจจุบันทันทีใช่หรือไม่?',
                )
            )
                return;
            try {
                showLoader();
                await executeFinalStamping(form);
                alert('ประทับตราเอกสารเรียบร้อยแล้ว');
                location.reload();
            } catch (e) {
                console.error(e);
                alert('เกิดข้อผิดพลาดในการ Stamp: ' + (e?.message || ''));
            } finally {
                showLoader({ show: false });
            }
        });

    $(document)
        .off('click', '#DeleteBtn')
        .on('click', '#DeleteBtn', async function () {
            if (!confirm('ยืนยันการลบแบบฟอร์มนี้ใช่หรือไม่?')) return;

            showLoader();
            try {
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
                        alert('ลบข้อมูลและไฟล์เรียบร้อยแล้ว');
                    } else {
                        alert(
                            'ลบข้อมูลสำเร็จบางส่วน: ' + (resDel.message || ''),
                        );
                    }
                    redirectWebflow();
                } else {
                    alert('ไม่สามารถลบ Flow ได้: ' + (delFlow?.message || ''));
                }
            } catch (e) {
                console.error(e);
                alert('เกิดข้อผิดพลาด: ' + e.message);
            } finally {
                showLoader({ show: false });
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
        showLoader();
        const res = await doaction(payload);

        if (res?.status) {
            // ส่งไปปรับปรุงสถานะ Header ใน SMMT
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

            // ถ้าคนสุดท้าย Approve (statusDoc กลายเป็น 'APPROVE') ให้ Stamp รวดเดียวครบทุกวง
            if (
                cleanAction === 'approve' &&
                resActionFlow?.statusDoc === 'APPROVE'
            ) {
                await executeFinalStamping(form);
            }

            alert('ดำเนินการสำเร็จ');
            redirectWebflow();
        } else {
            alert(res?.message || 'ส่งสถานะ Flow ไม่สำเร็จ');
        }
    } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการทำ Action: ' + (e?.message || ''));
    } finally {
        showLoader({ show: false });
    }
}

/**
 * ดึง Steps/Logs แล้วส่งให้ stampFormAttachedFiles ใน pdfStamper.js ดำเนินการ
 */
export async function executeFinalStamping(form) {
    // 1. ดึงข้อมูล Steps และ Logs จากฐานข้อมูล
    const stampData = await $.ajax({
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

    if (
        !stampData?.status ||
        !stampData.steps ||
        stampData.steps.length === 0
    ) {
        throw new Error('ไม่พบข้อมูล Step สำหรับประทับตรา');
    }

    // 2. 🟢 สั่งประทับตราทุกไฟล์ผ่านฟังก์ชันกลางใน pdfStamper.js
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
        stampData.steps,
        stampData.logs,
        { hasBorder: false },
    );
}
