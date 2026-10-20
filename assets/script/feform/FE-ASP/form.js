import $ from 'jquery';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { host } from '../../utils';

let currentPrevFiles = Array.isArray(window.INITIAL_PREV_FILE)
    ? window.INITIAL_PREV_FILE
    : window.INITIAL_PREV_FILE
      ? [window.INITIAL_PREV_FILE]
      : [];

export function getCurrentPrevFiles() {
    return currentPrevFiles;
}

export function toggleChangeBox() {
    const selectedVal = $('input[name="REVIEW_DETAILS"]:checked').val();
    const $box = $('#change-detail-box');
    if (selectedVal === 'CHANGE') {
        $box.removeClass('hidden').show();
    } else {
        $box.addClass('hidden').hide();
    }
}

export function renderPrevFile(prevData) {
    const $zone = $('#prev-revision-zone');
    const $btnDoc = $('#btn-open-prev-doc');
    const $docNoTxt = $('#prev-doc-no');
    const $container = $('#prev-file-list').empty();

    // เช็คว่ามีข้อมูล header หรือไม่
    const header = prevData?.header;
    const files = prevData?.files || [];

    if (header) {
        const empno = (
            $('#EMPNOHid').val() ||
            $('#REQUEST_BY_EMPNO').val() ||
            ''
        ).trim();
        const fqdnSuffix = '.mitsubishielevatorasia.co.th';

        let baseHost = (host || window.location.origin + '/form/').trim();
        const isLocal = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(
            baseHost,
        );

        if (!isLocal && !baseHost.includes(fqdnSuffix)) {
            const match = baseHost.match(/^(https?:\/\/[^\/:]+)(.*)$/i);
            if (match) {
                const domainPart = match[1];
                const restPart = match[2];
                baseHost = `${domainPart}${fqdnSuffix}${restPart}`;
            }
        }

        baseHost = baseHost.replace(/\/+$/, '');
        const backPath = encodeURIComponent('/formtest/workflow/mineList.asp');

        // 1. อัปเดตลิงก์เปิดฟอร์มเอกสารล่าสุด
        const docUrl = `${baseHost}/feform/FE-ASP/form/main?no=${header.NFRMNO}&orgNo=${header.VORGNO}&y=${header.CYEAR}&y2=${header.CYEAR2}&runNo=${header.NRUNNO}&m=3&empno=${empno}&bp=${backPath}&menu=1`;
        $btnDoc.attr('href', docUrl).removeClass('hidden');
        $docNoTxt.text(header.DOC_NO || '');

        // 2. เรนเดอร์ไฟล์ หรือ แสดงข้อความถ้าไม่มีไฟล์
        if (Array.isArray(files) && files.length > 0) {
            files.forEach((file) => {
                const formattedBaseDir = (file.FILE_PATH || '').replace(
                    /\\/g,
                    '/',
                );
                $container.append(`
                    <div class="flex items-center justify-between bg-white p-2.5 rounded-lg border border-blue-100 shadow-xs">
                        <div class="flex items-center gap-2 truncate">
                            <span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>
                            <span class="text-xs font-medium text-slate-700 truncate">${file.FILE_ONAME}</span>
                        </div>
                        <button type="button" 
                                class="btn-open-prev-file bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
                                data-base-dir="${formattedBaseDir}" 
                                data-stored-name="${file.FILE_FNAME}" 
                                data-original-name="${file.FILE_ONAME}">
                            📄 Open / Download
                        </button>
                    </div>
                `);
            });
        } else {
            $container.append(`
                <div class="text-center py-2 text-xs text-slate-500 bg-white/60 rounded-lg border border-dashed border-blue-200 no-file-msg">
                    (ไม่มีไฟล์แนบในเอกสารฉบับนี้)
                </div>
            `);
        }

        // แสดงกล่อง Active Revision ออกมา
        $zone.removeClass('hidden').show();
    } else {
        $btnDoc.attr('href', '#').addClass('hidden');
        $zone.addClass('hidden').hide();
    }
}

export function initFormControls() {
    $('#ControlNoDrp')
        .off('change')
        .on('change', async function () {
            const val = $(this).val();
            if (!val) {
                $('#prev-revision-zone').addClass('hidden').hide();
                return;
            }

            const currentEmp = ($('#REQUEST_BY_EMPNO').val() || '').trim();
            const y2 = ($('#CYEAR2Hid').val() || '').trim();
            const runNo = ($('#NRUNNOHid').val() || '').trim();

            try {
                await showLoader({ show: true });
                const res = await $.getJSON(
                    `${host}feform/FE-ASP/form/GetControlInfo?controlNo=${encodeURIComponent(val)}&empno=${encodeURIComponent(currentEmp)}&y2=${encodeURIComponent(y2)}&runNo=${encodeURIComponent(runNo)}`,
                );

                if (res && res.status) {
                    // เฉพาะ Super Admin (13204) เท่านั้นที่อนุญาตให้เปลี่ยน Division/Department ตาม Control
                    if (res.isSuperAdmin) {
                        $('#DivisionTxt').val(res.divName || '');
                        $('#SDIVCODEHid').val(res.divCode || '');

                        if (res.departments && res.departments.length > 0) {
                            const $dept = $('#DeptDrp')
                                .empty()
                                .append(
                                    '<option value="">-- Choose Department --</option>',
                                );
                            res.departments.forEach((d) => {
                                const isSel =
                                    d.SDEPCODE === res.targetDept
                                        ? 'selected'
                                        : '';
                                const deptName =
                                    d.DEPT_NAME ||
                                    d.SDEPT ||
                                    d.SDEPARTMENT ||
                                    '';
                                $dept.append(
                                    `<option value="${d.SDEPCODE}" ${isSel}>${d.SDEPCODE} : ${deptName}</option>`,
                                );
                            });
                            if (res.targetDept) $dept.val(res.targetDept);
                        }

                        const $sec = $('#SecDrp').empty();
                        if (res.sections && res.sections.length > 0) {
                            res.sections.forEach((s) => {
                                const isSel =
                                    s.SSECCODE === res.targetSec
                                        ? 'selected'
                                        : '';
                                const secName =
                                    s.SEC_NAME || s.SSEC || s.SSECTION || '';
                                $sec.append(
                                    `<option value="${s.SSECCODE}" ${isSel}>${s.SSECCODE} : ${secName}</option>`,
                                );
                            });
                            $sec.val(res.targetSec);
                        } else {
                            $sec.append(
                                '<option value="00">00 : No Section</option>',
                            );
                        }
                    }

                    // อัปเดตเฉพาะกล่อง Active Revision PDF
                    renderPrevFile(res.prevFile);
                }
            } catch (e) {
                console.error('GetControlInfo error:', e);
            } finally {
                await showLoader({ show: false });
            }
        });

    $('#DeptDrp')
        .off('change')
        .on('change', async function () {
            const depCode = $(this).val();
            await loadSectionDropdown(depCode, '00');
        });

    $(document)
        .off('change', 'input[name="REVIEW_DETAILS"]')
        .on('change', function () {
            toggleChangeBox();
        });

    $(document)
        .off('change', 'input[name="REVIEW_PERIOD"]')
        .on('change', 'input[name="REVIEW_PERIOD"]', function () {
            toggleConfirmationTable();
        });
    toggleChangeBox();
}

let lastSearchedEmp = '';
export function bindEmpSearchEvent() {
    const $empInput = $('#REQUEST_BY_EMPNO');
    if ($empInput.length === 0 || $empInput.prop('readonly')) return;

    $empInput.off('input change blur').on('input', function () {
        const val = this.value.trim();
        if (val.length === 5) {
            if (val !== lastSearchedEmp) {
                lastSearchedEmp = val;
                fetchEmpNameAndOrg(val);
            }
        } else if (val.length < 5) {
            lastSearchedEmp = '';
            $('#REQUEST_BY_NAME').val('');
        }
    });
}

export async function fetchEmpNameAndOrg(empNo) {
    empNo = (empNo || '').trim();
    if (empNo.length !== 5) return;
    const y2 = ($('#CYEAR2Hid').val() || '').trim();
    const runNo = ($('#NRUNNOHid').val() || '').trim();
    const controlNo = ($('#ControlNoDrp').val() || '').trim();
    try {
        await showLoader({ show: true });

        const res = await $.getJSON(
            `${host}feform/FE-ASP/form/ajaxGetEmpFullContext?empno=${encodeURIComponent(empNo)}&controlNo=${encodeURIComponent(controlNo)}&y2=${encodeURIComponent(y2)}&runNo=${encodeURIComponent(runNo)}`,
        );

        if (!res || !res.status) {
            $('#REQUEST_BY_NAME').val(res?.message || 'ไม่พบข้อมูลพนักงาน');
            return;
        }

        const emp = res.emp;

        $('#REQUEST_BY_NAME').val(emp.name || '');
        $('#SDIVCODEHid').val(emp.divCode || '');
        $('#DivisionTxt').val(emp.divName || '');

        // Department
        const $dept = $('#DeptDrp')
            .empty()
            .append('<option value="">-- Choose Department --</option>');
        if (res.departments && res.departments.length > 0) {
            res.departments.forEach((d) => {
                const isSel = d.SDEPCODE === emp.depCode ? 'selected' : '';
                const deptName = d.DEPT_NAME || d.SDEPT || d.SDEPARTMENT || '';
                $dept.append(
                    `<option value="${d.SDEPCODE}" ${isSel}>${d.SDEPCODE} : ${deptName}</option>`,
                );
            });
            $dept.val(emp.depCode);
        }

        // Section ทั้งหมดภายใต้แผนก
        const $sec = $('#SecDrp').empty();
        if (res.sections && res.sections.length > 0) {
            res.sections.forEach((s) => {
                const isSel = s.SSECCODE === emp.secCode ? 'selected' : '';
                const secName = s.SEC_NAME || s.SSEC || s.SSECTION || '';
                $sec.append(
                    `<option value="${s.SSECCODE}" ${isSel}>${s.SSECCODE} : ${secName}</option>`,
                );
            });
            $sec.val(emp.secCode);
        } else {
            $sec.append('<option value="00">00 : No Section</option>');
        }

        // Control No. Dropdown
        const $ctrlDrp = $('#ControlNoDrp')
            .empty()
            .append('<option value="">-- Choose Control No. --</option>');
        if (res.controls && res.controls.length > 0) {
            res.controls.forEach((c) => {
                $ctrlDrp.append(`
                    <option value="${c.CONTROL_NO}" 
                            data-divcode="${c.SDIVCODE}" 
                            data-depcode="${c.SDEPCODE || ''}"
                            data-seccode="${c.SSECCODE || '00'}"
                            data-divname="${c.DIVISION_NAME}">
                        ${c.CONTROL_NO} : ${c.CONTROL_NAME}
                    </option>
                `);
            });

            if (res.defaultControl) {
                $ctrlDrp.val(res.defaultControl.CONTROL_NO);
            }
        }

        renderPrevFile(res.prevFile);
    } catch (e) {
        console.error('fetchEmpFullContext error:', e);
    } finally {
        await showLoader({ show: false });
    }
}

export async function loadSectionDropdown(depCode, selectedSec = '00') {
    try {
        let secs = [];
        if (depCode && depCode !== '00') {
            const res = await $.getJSON(
                `${host}feform/FE-ASP/form/ajaxGetSections?depCode=${encodeURIComponent(depCode)}`,
            );
            if (res?.status && res.data) {
                secs = res.data;
            }
        }

        const $sec = $('#SecDrp').empty();
        if (secs && secs.length > 0) {
            secs.forEach((s) => {
                const isSel = s.SSECCODE === selectedSec ? 'selected' : '';
                const secName = s.SEC_NAME || s.SSEC || s.SSECTION || '';
                $sec.append(
                    `<option value="${s.SSECCODE}" ${isSel}>${s.SSECCODE} : ${secName}</option>`,
                );
            });
        } else {
            $sec.append('<option value="00">00 : No Section</option>');
        }

        if (selectedSec) {
            $sec.val(selectedSec);
        }
    } catch (e) {
        console.error('Load Sections Error:', e);
    }
}

export function applyReviewPeriodRules() {
    const createMode = ($('#CREATE_MODEHid').val() || 'MANUAL')
        .toUpperCase()
        .trim();
    const isManual = createMode === 'MANUAL';
    const isAdmin = Boolean(window.IS_ADMIN || window.IS_SUPER_ADMIN);

    const $radioYearly = $('#radio_yearly');
    const $radioChanging = $('#radio_changing');

    if (isManual) {
        if (isAdmin) {
            // กรณีเป็น Admin ในโหมด Manual: เปิดให้คลิกเลือกได้ทั้ง 2 ตัวเลือก
            $radioChanging.prop('disabled', false);
            $radioYearly.prop('disabled', false);

            $radioChanging
                .closest('label')
                .removeClass(
                    'opacity-40 cursor-not-allowed pointer-events-none',
                )
                .addClass('cursor-pointer');
            $radioYearly
                .closest('label')
                .removeClass(
                    'opacity-40 cursor-not-allowed pointer-events-none',
                )
                .addClass('cursor-pointer');

            // ถ้ายังไม่มีการเลือกค่า ให้ตั้ง Default เป็น CHANGING
            if (!$('input[name="REVIEW_PERIOD"]:checked').val()) {
                $radioChanging.prop('checked', true);
            }
        } else {
            // พนักงานทั่วไปในโหมด Manual: บังคับเลือก CHANGING และล็อก YEARLY
            $radioChanging.prop('checked', true).prop('disabled', false);
            $radioYearly.prop('checked', false).prop('disabled', true);

            $radioYearly
                .closest('label')
                .addClass('opacity-40 cursor-not-allowed pointer-events-none')
                .removeClass('cursor-pointer');
            $radioChanging
                .closest('label')
                .removeClass(
                    'opacity-40 cursor-not-allowed pointer-events-none',
                )
                .addClass('cursor-pointer');
        }
    } else {
        // โหมด AUTO (Yearly Job): บังคับเลือก YEARLY เสมอ
        $radioYearly.prop('checked', true).prop('disabled', false);
        $radioChanging.prop('checked', false).prop('disabled', true);

        $radioChanging
            .closest('label')
            .addClass('opacity-40 cursor-not-allowed pointer-events-none')
            .removeClass('cursor-pointer');
        $radioYearly
            .closest('label')
            .removeClass('opacity-40 cursor-not-allowed pointer-events-none')
            .addClass('cursor-pointer');
    }

    // สั่ง Toggle ซ่อน/แสดงตาราง Confirmation ให้สอดคล้องกับค่าที่เลือก
    toggleConfirmationTable();

    $('input[name="REVIEW_PERIOD"]:checked').trigger('change');
}
/**
 * ซ่อน/แสดงตาราง Confirmation:
 * แสดงเฉพาะกรณี YEARLY (Auto Job) เท่านั้น
 */
export function toggleConfirmationTable() {
    const period = $('input[name="REVIEW_PERIOD"]:checked').val();
    const $tableZone = $('#confirmation-table-zone');

    if (period === 'YEARLY') {
        $tableZone.removeClass('hidden').show();
    } else {
        $tableZone.addClass('hidden').hide();
    }
}

export function populateSavedDetails(savedDetails = []) {
    if (Array.isArray(savedDetails) && savedDetails.length > 0) {
        savedDetails.forEach((d) => {
            $(
                `input[name="cond_${d.TOPIC_ID}"][value="${d.CONDITION_VAL}"]`,
            ).prop('checked', true);
            $(
                `input[name="change_${d.TOPIC_ID}"][value="${d.CHANGE_VAL}"]`,
            ).prop('checked', true);
            $(`tr[data-topic-id="${d.TOPIC_ID}"] .topic-detail-in`).val(
                d.DETAILS || '',
            );
        });
    }
}

// export function buildSavePayload(form, isDraft = false, empno = '') {
//     const controlNo = $('#ControlNoDrp').val();
//     if (!controlNo) {
//         showMessage('กรุณาเลือก Control No.', 'warning');
//         $('#ControlNoDrp').focus();
//         return null;
//     }

//     const userReq = ($('#REQUEST_BY_EMPNO').val() || '').trim();
//     if (!userReq || userReq.length !== 5) {
//         showMessage(
//             'รหัสผู้จัดทำ (Request By) ต้องมีความยาว 5 หลัก',
//             'warning',
//         );
//         $('#REQUEST_BY_EMPNO').focus();
//         return null;
//     }

//     const topicsData = [];
//     $('#topics-tbody tr').each(function () {
//         const topicId = $(this).data('topic-id');
//         topicsData.push({
//             TOPIC_ID: topicId,
//             CONDITION_VAL:
//                 $(`input[name="cond_${topicId}"]:checked`).val() || null,
//             CHANGE_VAL:
//                 $(`input[name="change_${topicId}"]:checked`).val() || null,
//             DETAILS: $(this).find('.topic-detail-in').val() || '',
//         });
//     });

//     const payload = new FormData();
//     payload.append('DOC_HEADER_ID', $('#DocHeaderIDHid').val() || '');
//     payload.append('CONTROL_NO', controlNo);
//     payload.append('SDIVCODE', $('#SDIVCODEHid').val() || '');
//     payload.append('SDEPCODE', $('#DeptDrp').val() || '');
//     payload.append('SSECCODE', $('#SecDrp').val() || '00');
//     payload.append(
//         'REVIEW_PERIOD',
//         $('input[name="REVIEW_PERIOD"]:checked').val(),
//     );
//     payload.append(
//         'REVIEW_DETAILS',
//         $('input[name="REVIEW_DETAILS"]:checked').val(),
//     );
//     payload.append('DETAIL_OF_CHANGE', $('#DetailChangeTxt').val() || '');
//     payload.append(
//         'EFFECT_STATUS',
//         $('input[name="EFFECT_STATUS"]:checked').val() || 'NO_EFFECT',
//     );
//     payload.append('TOPICS_JSON', JSON.stringify(topicsData));
//     payload.append('REMARK', $('#RemarkTxt').val() || '');
//     payload.append('REQBY', userReq);
//     payload.append('EMPNO', empno);
//     payload.append('IS_DRAFT', isDraft ? '1' : '0');

//     payload.append('NFRMNO', form.NFRMNO || '');
//     payload.append('VORGNO', form.VORGNO || '');
//     payload.append('CYEAR', form.CYEAR || '');
//     payload.append('CYEAR2', form.CYEAR2 || '');
//     payload.append('NRUNNO', form.NRUNNO || '');

//     return payload;
// }

export function buildSavePayload(form, isDraft = false, empno = '') {
    const controlNo = $('#ControlNoDrp').val();
    if (!controlNo) {
        showMessage('กรุณาเลือก Control No.', 'warning');
        $('#ControlNoDrp').focus();
        return null;
    }

    const userReq = ($('#REQUEST_BY_EMPNO').val() || '').trim();
    if (!userReq || userReq.length !== 5) {
        showMessage(
            'รหัสผู้จัดทำ (Request By) ต้องมีความยาว 5 หลัก',
            'warning',
        );
        $('#REQUEST_BY_EMPNO').focus();
        return null;
    }

    const reviewPeriod =
        $('input[name="REVIEW_PERIOD"]:checked').val() || 'CHANGING';

    // ดึงข้อมูลตาราง Confirmation เฉพาะกรณีที่เป็น YEARLY เท่านั้น
    const topicsData = [];
    if (reviewPeriod === 'YEARLY') {
        $('#topics-tbody tr').each(function () {
            const topicId = $(this).data('topic-id');
            topicsData.push({
                TOPIC_ID: topicId,
                CONDITION_VAL:
                    $(`input[name="cond_${topicId}"]:checked`).val() || null,
                CHANGE_VAL:
                    $(`input[name="change_${topicId}"]:checked`).val() || null,
                DETAILS: $(this).find('.topic-detail-in').val() || '',
            });
        });
    }

    const payload = new FormData();
    payload.append('DOC_HEADER_ID', $('#DocHeaderIDHid').val() || '');
    payload.append('CONTROL_NO', controlNo);
    payload.append('SDIVCODE', $('#SDIVCODEHid').val() || '');
    payload.append('SDEPCODE', $('#DeptDrp').val() || '');
    payload.append('SSECCODE', $('#SecDrp').val() || '00');
    payload.append('REVIEW_PERIOD', reviewPeriod);
    payload.append(
        'REVIEW_DETAILS',
        $('input[name="REVIEW_DETAILS"]:checked').val() || 'NO_CHANGE',
    );
    payload.append('DETAIL_OF_CHANGE', $('#DetailChangeTxt').val() || '');
    payload.append(
        'EFFECT_STATUS',
        $('input[name="EFFECT_STATUS"]:checked').val() || 'NO_EFFECT',
    );

    // ส่งค่า JSON เฉพาะเมื่อมีข้อมูลในตาราง
    payload.append(
        'TOPICS_JSON',
        topicsData.length > 0 ? JSON.stringify(topicsData) : '',
    );

    payload.append('REMARK', $('#RemarkTxt').val() || '');
    payload.append('REQBY', userReq);
    payload.append('EMPNO', empno);
    payload.append('IS_DRAFT', isDraft ? '1' : '0');

    payload.append('NFRMNO', form.NFRMNO || '');
    payload.append('VORGNO', form.VORGNO || '');
    payload.append('CYEAR', form.CYEAR || '');
    payload.append('CYEAR2', form.CYEAR2 || '');
    payload.append('NRUNNO', form.NRUNNO || '');

    return payload;
}
