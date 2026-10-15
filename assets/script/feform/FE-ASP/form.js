import $ from 'jquery';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { host } from '../../utils';

let currentPrevFile = window.INITIAL_PREV_FILE || null;

export function getCurrentPrevFile() {
    return currentPrevFile;
}

// In-Memory Cache ป้องกันการยิง AJAX ซ้ำ
const empOrgCache = {};
const deptCache = {};
const secCache = {};
const controlFileCache = {};
const controlCache = {};

export function toggleChangeBox() {
    const selectedVal = $('input[name="REVIEW_DETAILS"]:checked').val();
    const $box = $('#change-detail-box');
    if (selectedVal === 'CHANGE') {
        $box.removeClass('hidden').show();
    } else {
        $box.addClass('hidden').hide();
    }
}

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

            // 1. จำค่า Department และ Section ปัจจุบันที่หน้าจอเลือกไว้ก่อน
            const keepDept = ($('#DeptDrp').val() || '').trim();
            const keepSec = ($('#SecDrp').val() || '00').trim();

            // ถ้าเคยดึง Control No. นี้แล้ว ดึงจาก RAM ทันที
            if (controlCache[val]) {
                applyControlData(controlCache[val], keepDept, keepSec);
                return;
            }

            try {
                await showLoader({ show: true });
                const res = await $.getJSON(
                    `${host}feform/FE-ASP/form/GetControlInfo?controlNo=${encodeURIComponent(val)}`,
                );

                if (res && res.status) {
                    controlCache[val] = res;
                    applyControlData(res, keepDept, keepSec);
                }
            } catch (e) {
                console.error('GetControlInfo error:', e);
            } finally {
                await showLoader({ show: false });
            }
        });

    function applyControlData(data, keepDept = '', keepSec = '00') {
        const ctrl = data.control || {};

        // 1. อัปเดต Division
        if (ctrl.SDIVCODE) {
            $('#DivisionTxt').val(ctrl.DIVISION_NAME || ctrl.SDIV || '');
            $('#SDIVCODEHid').val(ctrl.SDIVCODE);
        }

        // กำหนด Department ที่ต้องการเลือก: ใช้ค่าเดิมของ Emp ก่อน ถ้าไม่มีค่อยดูจาก Master
        const targetDept = keepDept || ctrl.SDEPCODE || '';

        // 2. อัปเดต Department Dropdown (คงค่าเดิมของ Emp ไว้)
        if (data.departments && data.departments.length > 0) {
            const $dept = $('#DeptDrp')
                .empty()
                .append('<option value="">-- Choose Department --</option>');
            data.departments.forEach((d) => {
                const isSel = d.SDEPCODE === targetDept ? 'selected' : '';
                const deptName = d.DEPT_NAME || d.SDEPT || d.SDEPARTMENT || '';
                $dept.append(
                    `<option value="${d.SDEPCODE}" ${isSel}>${d.SDEPCODE} : ${deptName}</option>`,
                );
            });
            if (targetDept) {
                $dept.val(targetDept);
            }
        }

        // กำหนด Section ที่ต้องการเลือก: ใช้ค่าเดิมของ Emp ก่อน ถ้าไม่มีค่อยดูจาก Master หรือตั้งเป็น '00'
        const targetSec = keepSec || ctrl.SSECCODE || '00';

        // 3. อัปเดต Section Dropdown (คงค่าเดิมของ Emp ไว้)
        if (data.sections && data.sections.length > 0) {
            const $sec = $('#SecDrp').empty();
            data.sections.forEach((s) => {
                const isSel = s.SSECCODE === targetSec ? 'selected' : '';
                const secName = s.SEC_NAME || s.SSEC || s.SSECTION || '';
                $sec.append(
                    `<option value="${s.SSECCODE}" ${isSel}>${s.SSECCODE} : ${secName}</option>`,
                );
            });
            $sec.val(targetSec);
        } else {
            // หาก data.sections ว่าง ให้คงค่าเดิมไว้โดยโหลดใหม่จาก targetDept
            if (targetDept) {
                loadSectionDropdown(targetDept, targetSec);
            } else {
                $('#SecDrp')
                    .empty()
                    .append('<option value="00">00 : No Section</option>');
            }
        }

        // 4. แสดงไฟล์ Revision เก่า
        renderPrevFile(data.prevFile);
    }

    // เมื่อเปลี่ยน Department แบบ Manual -> โหลดเฉพาะ Section
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

    toggleChangeBox();
}

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
 * ดึง Department ทั้งหมดใน Division ของ Requester มาใส่ Dropdown (พร้อม Cache)
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
 * ดึง Section ภายใต้ Department ที่เลือกมาใส่ Dropdown (พร้อม Cache)
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
 * เมื่อระบุ Request By:
 * 1. ดึงสังกัด Requester
 * 2. โหลด Department Dropdown ของ Division นั้น พร้อม Default เป็น Dept ของ Requester
 * 3. โหลด Section Dropdown พร้อม Default เป็น Sect ของ Requester
 * 4. กรอง Control No. ตาม Division ของ Requester
 */

export async function fetchEmpNameAndOrg(empNo) {
    empNo = (empNo || '').trim();
    if (empNo.length !== 5) return;

    try {
        await showLoader({ show: true });

        // ยิงเส้นเดียว ได้ข้อมูลครบทั้ง Org, Dropdowns, Control No. และไฟล์ Revision
        const res = await $.getJSON(
            `${host}feform/FE-ASP/form/ajaxGetEmpFullContext?empno=${encodeURIComponent(empNo)}`,
        );

        if (!res || !res.status) {
            $('#REQUEST_BY_NAME').val(res?.message || 'ไม่พบข้อมูลพนักงาน');
            return;
        }

        const emp = res.emp;

        // 1. ใส่ชื่อพนักงาน และข้อมูล Division
        $('#REQUEST_BY_NAME').val(emp.name || '');
        $('#SDIVCODEHid').val(emp.divCode || '');
        $('#DivisionTxt').val(emp.divName || '');

        // 2. เติม Department Dropdown พร้อมเลือกค่าของพนักงาน
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

        // 3. เติม Section Dropdown พร้อมเลือกค่าของพนักงาน
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

        // 4. เติม Control Number Dropdown และ Auto-select ตัวแรก
        const $ctrlDrp = $('#ControlNoDrp')
            .empty()
            .append('<option value="">-- Choose Control No. --</option>');
        if (res.controls && res.controls.length > 0) {
            res.controls.forEach((c) => {
                $ctrlDrp.append(`
                    <option value="${c.CONTROL_NO}" 
                            data-divcode="${c.SDIVCODE}" 
                            data-divname="${c.DIVISION_NAME}">
                        ${c.CONTROL_NO} : ${c.CONTROL_NAME}
                    </option>
                `);
            });

            // เลือกตัวแรกให้อัตโนมัติ
            if (res.defaultControl) {
                $ctrlDrp.val(res.defaultControl.CONTROL_NO);
            }
        }

        // 5. แสดงไฟล์ Revision ล่าสุดของ Control แรกทันที
        renderPrevFile(res.prevFile);
    } catch (e) {
        console.error('fetchEmpFullContext error:', e);
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
            .addClass('opacity-40 cursor-not-allowed pointer-events-none')
            .removeClass('cursor-pointer');
        $('#radio_changing')
            .closest('label')
            .removeClass('opacity-40 cursor-not-allowed pointer-events-none')
            .addClass('cursor-pointer');
    } else {
        $('#radio_yearly').prop('checked', true).prop('disabled', false);
        $('#radio_changing').prop('checked', false).prop('disabled', true);
        $('#radio_changing')
            .closest('label')
            .addClass('opacity-40 cursor-not-allowed pointer-events-none')
            .removeClass('cursor-pointer');
        $('#radio_yearly')
            .closest('label')
            .removeClass('opacity-40 cursor-not-allowed pointer-events-none')
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
    // 🟢 ค่าที่เลือกจาก Dropdown ส่งบันทึกลง Header
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
