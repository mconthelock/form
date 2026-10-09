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
    const currentEmpNo = (empno || '').trim();

    const isOwner =
        requestBy !== '' && currentEmpNo !== '' && requestBy === currentEmpNo;

    $('#SaveDocBtn, #DeleteBtn, #ApproveBtn, #ReturnBtn').addClass('hidden');

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

    // alert($('#EMPNOHid').val());
    if ($('#EMPNOHid').val() == '13204') {
        $('#DeleteBtn').removeClass('hidden');
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
    const payload = {
        NFRMNO: Number(form.NFRMNO || 0),
        VORGNO: String(form.VORGNO || ''),
        CYEAR: String(form.CYEAR || ''),
        CYEAR2: String(form.CYEAR2 || ''),
        NRUNNO: Number(form.NRUNNO || 0),
        ACTION: actionType,
        EXTDATA: extData,
        EMPNO: form.EMPNO,
        REMARK: $('#RemarkTxt').val() || '',
    };

    try {
        showLoader();
        const res = await doaction(payload);
        alert(
            res?.status
                ? 'ดำเนินการสำเร็จ'
                : res?.message || 'ดำเนินการไม่สำเร็จ',
        );
        if (res?.status) {
            // Trigger Stamp ลงไฟล์จริงที่เซิร์ฟเวอร์
            await $.ajax({
                url: host + 'feform/FE-DOC/form/ActionFlow',
                type: 'POST',
                data: {
                    ...payload,
                    DOC_HEADER_ID: $('#DocHeaderIDHid').val(),
                },
                dataType: 'json',
            });
            redirectWebflow();
        } else {
            alert(res?.message || 'ส่งสถานะ Flow ไม่สำเร็จ');
        }
    } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการทำ Action');
    } finally {
        showLoader({ show: false });
    }
}
