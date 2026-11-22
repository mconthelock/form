import '@flaticon/flaticon-uicons/css/all/all.css';
import dayjs from 'dayjs';
import { displayEmpInfo } from '@amec/webasset/indexDB';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { showMessage, intVal } from '@amec/webasset/utils';
import { redirectWebflow } from '@amec/webasset/form';
import {
    setParticipants,
    renderEmployeeCard,
    getFormIsUat,
    createFormIsUat,
    updateFormIsUat,
} from './data.js';

$(document).ready(async function () {
    const mode = $('#MODE').val();
    const nrunno = intVal($('#NRUNNO').val());

    await setParticipants();
    await setDatePicker({
        altInput: true,
        altFormat: 'd-M-Y',
        dateFormat: 'Y-m-d',
    });
    $('.flatpickr-input').removeClass('input');

    if (mode == '2' || nrunno > 0) {
        await initEditForm();
    } else {
        addTestCaseRow();
    }
});

// Tester Employee Lookup
$(document).on('change', '#tester-by-input', async function (e) {
    e.preventDefault();
    const inputUser = $(this).val().trim();
    const user = await renderEmployeeCard('tester-by', inputUser);
    if (!user) {
        await showMessage('ไม่พบข้อมูลพนักงาน / Employee not found.');
        $(this).val('').focus();
        return;
    }
    $(this).val(user.SEMPNO).addClass('hidden');
});

$(document).on('click', '#change-tester-employee', function (e) {
    e.preventDefault();
    $('#tester-by-input').removeClass('hidden').focus().select();
    $('#tester-by-info').addClass('hidden');
});

// Objective character counter
$(document).on('input', '.text-comment', function () {
    $(this).removeClass('border-red-500');
    const elErr = $(this).closest('.fieldset').find('.text-comment-err');
    const elCnt = $(this)
        .closest('.fieldset')
        .find('.text-count .text-count-no');
    elErr.html('');
    elCnt.removeClass('text-red-500');

    const txt = $(this)
        .val()
        .replace(/(\r\n|\n|\r)/gm, '');
    const cnt = txt.length;
    if (cnt > 1000) {
        elCnt.addClass('text-red-500');
    }
    elCnt.html(cnt);
});

// Attachments
$(document).on('click', '#add-file', function (e) {
    e.preventDefault();
    const wrap = $('.file-input-wrap');
    const newRow = $(`
        <div class="flex items-center gap-2 file-row">
            <input type="file" class="file-input file-input-sm w-full attachments" name="attachments[]" />
            <button type="button" class="btn btn-ghost btn-sm btn-circle text-error remove-file" title="ลบไฟล์">
                <i class="fi fi-rr-trash"></i>
            </button>
        </div>
    `);
    wrap.append(newRow);
});

$(document).on('click', '.remove-file', function () {
    $(this).closest('.file-row').remove();
});

// Test Case Table Management
function escapeHtml(str) {
    return $('<div>')
        .text(str ?? '')
        .html();
}

function updateTestCaseNumbers() {
    const rows = $('#table-testcases tbody tr');
    rows.each(function (idx) {
        const num = String(idx + 1).padStart(2, '0');
        $(this).find('.tc-no').text(`TC-${num}`);
    });
    $('#testcase-count-badge').text(`${rows.length} รายการ`);
}

function addTestCaseRow(data = null) {
    const tcId = data?.TC_ID ?? data?.ID ?? '';
    const moduleName = data?.MODULE ?? '';
    const scenario = data?.SCENARIO ?? data?.TEST_CASE ?? '';
    const steps = data?.TEST_STEPS ?? '';
    const expected = data?.EXPECTED_RESULT ?? '';

    const row = $(`
        <tr data-tc-id="${escapeHtml(tcId)}">
            <td class="text-center font-semibold text-primary pt-3">
                <span class="tc-no">TC-01</span>
            </td>
            <td>
                <input type="text" class="input input-bordered input-sm w-full tc-module"
                    placeholder="เช่น Login / Report" value="${escapeHtml(moduleName)}" />
            </td>
            <td>
                <textarea class="textarea textarea-bordered textarea-sm w-full tc-scenario tc-req" rows="2"
                    placeholder="ระบุหัวข้อหรือกรณีที่ต้องการทดสอบ">${escapeHtml(scenario)}</textarea>
            </td>
            <td>
                <textarea class="textarea textarea-bordered textarea-sm w-full tc-steps" rows="2"
                    placeholder="1. เข้าหน้า...\n2. กรอกข้อมูล...\n3. กดปุ่ม...">${escapeHtml(steps)}</textarea>
            </td>
            <td>
                <textarea class="textarea textarea-bordered textarea-sm w-full tc-expected tc-req" rows="2"
                    placeholder="ระบบบันทึกสำเร็จและแสดงข้อความ...">${escapeHtml(expected)}</textarea>
            </td>
            <td class="text-center pt-2">
                <button type="button" class="btn btn-sm btn-error btn-outline remove-testcase-row" title="ลบแถว">
                    <i class="fi fi-rr-trash"></i>
                </button>
            </td>
        </tr>
    `);

    $('#table-testcases tbody').append(row);
    updateTestCaseNumbers();
}

$(document).on('click', '#add-testcase-row', function (e) {
    e.preventDefault();
    addTestCaseRow();
});

$(document).on('click', '.remove-testcase-row', async function () {
    const rowCount = $('#table-testcases tbody tr').length;
    if (rowCount <= 1) {
        await showMessage('ต้องมีรายการ Test Case อย่างน้อย 1 รายการ');
        return;
    }
    $(this).closest('tr').remove();
    updateTestCaseNumbers();
});

// Edit / Draft Initialization
async function initEditForm() {
    try {
        const data = await getFormIsUat({
            NFRMNO: $('#NFRMNO').val(),
            VORGNO: $('#VORGNO').val(),
            CYEAR: $('#CYEAR').val(),
            CYEAR2: $('#CYEAR2').val(),
            NRUNNO: $('#NRUNNO').val(),
            EMPNO: $('#EMPNO').val(),
        });

        if (!data || !data[0]) {
            addTestCaseRow();
            return;
        }

        const res = data[0];

        // Map simple inputs
        $('#form-is-uat')
            .find('input[data-map], textarea[data-map], select[data-map]')
            .each(function () {
                const map = $(this).data('map');
                if (
                    !map ||
                    ['NFRMNO', 'VORGNO', 'CYEAR', 'INPUTBY', 'STATUS'].includes(
                        map,
                    )
                ) {
                    return;
                }
                if (res[map] !== undefined && res[map] !== null) {
                    if ($(this).hasClass('fdate') && this._flatpickr) {
                        this._flatpickr.setDate(res[map], true);
                    } else {
                        $(this).val(res[map]);
                    }
                }
            });

        // Environment radio
        if (res.ENVIRONMENT) {
            $(`.uat-env[value="${res.ENVIRONMENT}"]`).prop('checked', true);
        }

        // Tester card
        if (res.TESTER) {
            $('#tester-by-input').val(res.TESTER).addClass('hidden');
            await renderEmployeeCard('tester-by', res.TESTER);
        }

        // Trigger character count update
        $('#uat-objective').trigger('input');

        // Existing attachments
        const files = res.files || res.attachments || [];
        if (Array.isArray(files) && files.length > 0) {
            const list = $('#existing-attachments-list').empty();
            files.forEach((f) => {
                const name = f.FILE_NAME || f.FILENAME || f.name || 'Attachment';
                const url = f.FILE_URL || f.URL || f.url || '#';
                list.append(
                    `<li><a href="${escapeHtml(url)}" target="_blank" class="link link-primary">${escapeHtml(name)}</a></li>`,
                );
            });
            $('#existing-attachments').removeClass('hidden');
        }

        // Test cases
        const testcases = res.testcases || res.TESTCASES || res.items || [];
        $('#table-testcases tbody').empty();
        if (Array.isArray(testcases) && testcases.length > 0) {
            testcases.forEach((tc) => addTestCaseRow(tc));
        } else {
            addTestCaseRow();
        }
    } catch (err) {
        console.error('Failed to load UAT draft:', err);
        addTestCaseRow();
    }
}

// Validation
async function verifyForm(form) {
    let valid = true;

    $(form)
        .find('.req-1')
        .each(function () {
            $(this).removeClass('border-red-500');
            if (!String($(this).val() ?? '').trim()) {
                $(this).addClass('border-red-500');
                valid = false;
            }
        });

    if (!valid) {
        await showMessage(
            'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน / Please fill in all required fields.',
        );
        return false;
    }

    const start = $('#uat-start').val();
    const end = $('#uat-end').val();
    if (start && end && dayjs(end).isBefore(dayjs(start))) {
        $('#uat-end').addClass('border-red-500');
        await showMessage(
            'วันที่สิ้นสุดการทดสอบต้องไม่น้อยกว่าวันที่เริ่มทดสอบ / UAT End Date must be on or after Start Date.',
        );
        return false;
    }

    // Validate test cases
    const tcRows = $('#table-testcases tbody tr');
    if (tcRows.length === 0) {
        await showMessage('กรุณาเพิ่มรายการ Test Case อย่างน้อย 1 รายการ');
        return false;
    }

    let tcValid = true;
    tcRows.each(function () {
        $(this)
            .find('.tc-req')
            .each(function () {
                $(this).removeClass('border-red-500');
                if (!String($(this).val() ?? '').trim()) {
                    $(this).addClass('border-red-500');
                    tcValid = false;
                }
            });
    });

    if (!tcValid) {
        await showMessage(
            'กรุณากรอก Test Case / Scenario และ Expected Result ให้ครบทุกแถว',
        );
        return false;
    }

    return true;
}

// Build FormData
async function buildFormData() {
    const fd = new FormData();
    $('#form-is-uat')
        .find('input[data-map], textarea[data-map], select[data-map]')
        .each(function () {
            const map = $(this).data('map');
            const val = $(this).val();
            if (map) {
                fd.append(map, val ?? '');
            }
        });

    if ($('#MODE').val() == '2' || intVal($('#NRUNNO').val()) > 0) {
        fd.append('CYEAR2', $('#CYEAR2').val());
        fd.append('NRUNNO', $('#NRUNNO').val());
    }

    fd.append('ENVIRONMENT', $('.uat-env:checked').val() || 'UAT');

    const tester =
        $('#tester-by-input').val() ||
        $('#tester-by-id').text().trim() ||
        $('#EMPNO').val();
    fd.set('TESTER', tester);

    const testerInfo = await displayEmpInfo(tester);
    if (testerInfo) {
        const org =
            testerInfo.SSECCODE != '00'
                ? testerInfo.SSECCODE
                : testerInfo.SDEPCODE != '00'
                  ? testerInfo.SDEPCODE
                  : testerInfo.SDIVCODE;
        fd.append('TESTER_ORG', org || '');
    }

    fd.append('REQ_DATE', dayjs().format('YYYY-MM-DD'));

    // Test cases
    $('#table-testcases tbody tr').each(function (i) {
        const tcId = $(this).attr('data-tc-id') || '';
        if (tcId) fd.append(`testcases[${i}][TC_ID]`, tcId);
        fd.append(`testcases[${i}][SEQ]`, i + 1);
        fd.append(`testcases[${i}][TC_NO]`, $(this).find('.tc-no').text().trim());
        fd.append(
            `testcases[${i}][MODULE]`,
            $(this).find('.tc-module').val().trim(),
        );
        fd.append(
            `testcases[${i}][SCENARIO]`,
            $(this).find('.tc-scenario').val().trim(),
        );
        fd.append(
            `testcases[${i}][TEST_STEPS]`,
            $(this).find('.tc-steps').val().trim(),
        );
        fd.append(
            `testcases[${i}][EXPECTED_RESULT]`,
            $(this).find('.tc-expected').val().trim(),
        );
    });

    // Attachments
    $('.attachments').each(function () {
        if (this.files && this.files.length > 0) {
            for (const file of this.files) {
                fd.append('files[]', file);
            }
        }
    });

    return fd;
}

async function submitUatForm(isDraft) {
    const btn = isDraft ? $('#save-draft-form') : $('#confirm-form');
    const originalHtml = btn.html();
    btn.prop('disabled', true).html(
        '<span class="loading loading-spinner loading-xs"></span> กำลังบันทึก...',
    );

    try {
        $('#STATUS').val(isDraft ? '0' : '1');
        const fd = await buildFormData();
        const isEdit = $('#MODE').val() == '2' || intVal($('#NRUNNO').val()) > 0;
        const response = isEdit
            ? await updateFormIsUat(fd)
            : await createFormIsUat(fd);

        if (response && response.status === false) {
            await showMessage(
                response.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
            );
            return;
        }

        await showMessage(
            isDraft
                ? 'บันทึกร่าง (Draft) เรียบร้อยแล้ว'
                : 'ส่งแบบฟอร์ม UAT เรียบร้อยแล้ว',
            'success',
        );
        if (!isDraft) {
            redirectWebflow();
        }
    } catch (err) {
        console.error('Submit UAT error:', err);
        await showMessage(
            'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง / Failed to save UAT form.',
        );
    } finally {
        btn.prop('disabled', false).html(originalHtml);
    }
}

// Save Draft
$(document).on('click', '#save-draft-form', async function (e) {
    e.preventDefault();
    await submitUatForm(true);
});

// Submit UAT
$(document).on('click', '#confirm-form', async function (e) {
    e.preventDefault();
    const form = $('#form-is-uat')[0];
    const isValid = await verifyForm(form);
    if (!isValid) return;
    await submitUatForm(false);
});
