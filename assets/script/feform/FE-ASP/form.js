import $ from 'jquery';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { host } from '../../utils';

export let currentPrevFile = window.INITIAL_PREV_FILE || null;

// Cache ฝั่ง Frontend ป้องกันการยิง AJAX ซ้ำ
const empOrgCache = {};
const deptCache = {};
const secCache = {};

/**
 * กำหนด Event ควบคุม Control Dropdown และ Review Details Toggle
 */
const controlFileCache = {};

export function initFormControls() {
    $('#ControlNoDrp')
        .off('change')
        .on('change', async function () {
            const val = $(this).val();
            if (!val) {
                $('#prev-revision-zone').addClass('hidden');
                currentPrevFile = null;
                return;
            }

            const selectedOpt = $(this).find('option:selected');
            const newDivCode = selectedOpt.data('divcode') || '';
            const newDivName = selectedOpt.data('divname') || '';

            if (newDivCode) {
                $('#DivisionTxt').val(newDivName);
                $('#SDIVCODEHid').val(newDivCode);
            }

            // 🟢 1. ตรวจสอบ Cache ก่อนเสมอ ถ้าเคยดึงแล้ว ไม่ต้องยิง AJAX
            if (controlFileCache[val] !== undefined) {
                renderPrevFile(controlFileCache[val]);
                return;
            }

            // 🟢 2. ยิงเฉพาะครั้งแรกที่ยังไม่เคยเรียก Control No. นี้
            try {
                await showLoader({ show: true });
                const res = await $.getJSON(
                    `${host}feform/FE-ASP/form/GetControlInfo?controlNo=${encodeURIComponent(val)}`,
                );

                const prevFile =
                    res && res.status && res.prevFile ? res.prevFile : null;

                // เก็บลง Cache ไว้
                controlFileCache[val] = prevFile;
                renderPrevFile(prevFile);
            } catch (e) {
                console.error('GetControlInfo error:', e);
                renderPrevFile(null);
            } finally {
                await showLoader({ show: false });
            }
        });

    // ... Event อื่นๆ ตามเดิม
}

// ฟังก์ชันสำหรับเปิด/ปิดกล่องแสดงไฟล์ Revision เก่า
function renderPrevFile(file) {
    if (file) {
        currentPrevFile = file;
        $('#prev-file-name').text(file.FILE_ONAME);
        $('#prev-revision-zone').removeClass('hidden');
    } else {
        currentPrevFile = null;
        $('#prev-revision-zone').addClass('hidden');
    }
}

/**
 * โหลด Department ตาม Division Code (มี In-Memory Cache)
 */
export async function loadDepartmentDropdown(divCode, selectedDep = '') {
    if (!divCode) return;
    try {
        let depts = deptCache[divCode];
        if (!depts) {
            const res = await $.getJSON(
                `${host}feform/FE-ASP/form/ajaxGetDepartments?divCode=${encodeURIComponent(divCode)}`,
            );
            if (res && res.status && res.data) {
                depts = res.data;
                deptCache[divCode] = depts;
            }
        }

        const $dept = $('#DeptDrp');
        $dept
            .empty()
            .append('<option value="">-- Choose Department --</option>');

        if (depts && depts.length > 0) {
            depts.forEach((d) => {
                const isSel = d.SDEPCODE === selectedDep ? 'selected' : '';
                $dept.append(
                    `<option value="${d.SDEPCODE}" ${isSel}>${d.SDEPCODE} : ${d.SDEPT || d.SDEPARTMENT}</option>`,
                );
            });
        }

        if (selectedDep) {
            $dept.val(selectedDep);
        }
    } catch (e) {
        console.error('Load Departments Error:', e);
    }
}

/**
 * โหลด Section ตาม Department Code (มี In-Memory Cache)
 */
export async function loadSectionDropdown(depCode, selectedSec = '00') {
    try {
        let secs = secCache[depCode];
        if (!secs && depCode && depCode !== '00') {
            const res = await $.getJSON(
                `${host}feform/FE-ASP/form/ajaxGetSections?depCode=${encodeURIComponent(depCode)}`,
            );
            if (res && res.status && res.data) {
                secs = res.data;
                secCache[depCode] = secs;
            }
        }

        const $sec = $('#SecDrp');
        $sec.empty();

        if (secs && secs.length > 0) {
            secs.forEach((s) => {
                const isSel = s.SSECCODE === selectedSec ? 'selected' : '';
                $sec.append(
                    `<option value="${s.SSECCODE}" ${isSel}>${s.SSECCODE} : ${s.SSEC || s.SSECTION}</option>`,
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

/**
 * ผูก Event ค้นหาพนักงานเฉพาะตอน blur หรือพิมพ์ครบ 5 ตัว (ไม่ยิงซ้ำ)
 */
let lastSearchedEmp = '';
export function bindEmpSearchEvent() {
    const $empInput = $('#REQUEST_BY_EMPNO');
    if ($empInput.length === 0 || $empInput.prop('readonly')) return;

    $empInput
        .off('input change blur')
        .on('input', function () {
            const val = this.value.trim();
            if (val.length === 5 && val !== lastSearchedEmp) {
                lastSearchedEmp = val;
                fetchEmpNameAndOrg(val);
            } else if (val.length < 5) {
                lastSearchedEmp = '';
                $('#REQUEST_BY_NAME').val('');
            }
        })
        .on('blur', function () {
            const val = this.value.trim();
            if (val.length === 5 && val !== lastSearchedEmp) {
                lastSearchedEmp = val;
                fetchEmpNameAndOrg(val);
            }
        });
}

/**
 * ดึงสังกัดพนักงาน และเซ็ต Default Dept/Sect ตามรหัสพนักงานครั้งเดียว
 */
export async function fetchEmpNameAndOrg(empNo) {
    empNo = (empNo || '').trim();
    if (empNo.length !== 5) return;

    try {
        await showLoader({ show: true });

        // 1. ดึงข้อมูลพนักงาน (ใช้ Cache ถ้ามี)
        let org = empOrgCache[empNo];
        if (!org) {
            const resOrg = await $.getJSON(
                `${host}feform/FE-ASP/form/ajaxGetUserOrg?empno=${encodeURIComponent(empNo)}`,
            );
            if (resOrg && resOrg.status && resOrg.org) {
                org = resOrg.org;
                empOrgCache[empNo] = org;
            }
        }

        if (org) {
            $('#REQUEST_BY_NAME').val(org.SNAME || '');

            const divCode = (org.SDIVCODE || '').trim();
            const depCode = (org.SDEPCODE || '').trim();
            const secCode = (org.SSECCODE || '00').trim();

            $('#SDIVCODEHid').val(divCode);
            $('#DivisionTxt').val(org.SDIV || '');

            // 🟢 Default เลือก Dept & Sect ค้างไว้ตามพนักงาน Request By
            await loadDepartmentDropdown(divCode, depCode);
            if (depCode) {
                await loadSectionDropdown(depCode, secCode);
            } else {
                $('#SecDrp')
                    .empty()
                    .append('<option value="00">00 : No Section</option>');
            }

            // 2. ดึงรายการ Control No. ตาม Division ของผู้จัดทำ
            const resCtrl = await $.getJSON(
                `${host}feform/FE-ASP/form/ajaxGetControlsByEmp?empno=${encodeURIComponent(empNo)}`,
            );
            const $ctrlDrp = $('#ControlNoDrp');
            $ctrlDrp
                .empty()
                .append('<option value="">-- Choose Control No. --</option>');

            if (resCtrl && resCtrl.status && resCtrl.controls) {
                resCtrl.controls.forEach((c) => {
                    $ctrlDrp.append(`
                        <option value="${c.CONTROL_NO}" 
                                data-divcode="${c.SDIVCODE}" 
                                data-divname="${c.DIVISION_NAME}">
                            ${c.CONTROL_NO} : ${c.CONTROL_NAME}
                        </option>
                    `);
                });
            }
        } else {
            $('#REQUEST_BY_NAME').val('ไม่พบข้อมูลพนักงาน');
        }
    } catch (e) {
        console.error('fetchEmpNameAndOrg error:', e);
    } finally {
        await showLoader({ show: false });
    }
}

export function applyReviewPeriodRules() {
    const createMode = ($('#CREATE_MODEHid').val() || 'MANUAL')
        .toUpperCase()
        .trim();
    const isManual = createMode === 'MANUAL';

    if (isManual) {
        $('#radio_changing').prop('checked', true).prop('disabled', false);
        $('#radio_yearly').prop('checked', false).prop('disabled', true);
        $('#radio_yearly')
            .closest('label')
            .addClass('opacity-40 cursor-not-allowed')
            .removeClass('cursor-pointer');
        $('#radio_changing')
            .closest('label')
            .removeClass('opacity-40 cursor-not-allowed')
            .addClass('cursor-pointer');
    } else {
        $('#radio_yearly').prop('checked', true).prop('disabled', false);
        $('#radio_changing').prop('checked', false).prop('disabled', true);
        $('#radio_changing')
            .closest('label')
            .addClass('opacity-40 cursor-not-allowed')
            .removeClass('cursor-pointer');
        $('#radio_yearly')
            .closest('label')
            .removeClass('opacity-40 cursor-not-allowed')
            .addClass('cursor-pointer');
    }

    $('input[name="REVIEW_PERIOD"]:checked').trigger('change');
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

    const topicsData = [];
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

    const payload = new FormData();
    payload.append('DOC_HEADER_ID', $('#DocHeaderIDHid').val() || '');
    payload.append('CONTROL_NO', controlNo);
    payload.append('SDIVCODE', $('#SDIVCODEHid').val() || '');
    payload.append('SDEPCODE', $('#DeptDrp').val() || '');
    payload.append('SSECCODE', $('#SecDrp').val() || '00');
    payload.append(
        'REVIEW_PERIOD',
        $('input[name="REVIEW_PERIOD"]:checked').val(),
    );
    payload.append(
        'REVIEW_DETAILS',
        $('input[name="REVIEW_DETAILS"]:checked').val(),
    );
    payload.append('DETAIL_OF_CHANGE', $('#DetailChangeTxt').val() || '');
    payload.append(
        'EFFECT_STATUS',
        $('input[name="EFFECT_STATUS"]:checked').val() || 'NO_EFFECT',
    );
    payload.append('TOPICS_JSON', JSON.stringify(topicsData));
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
