import { showLoader } from '@amec/webasset/preloader';
import { intVal, showDigits, showMessage } from '@amec/webasset/utils';
import {
    formHeader,
    formHeaderInfo,
    formFlowApproval,
    formApprovalBtn,
} from '../../service';
import { getItems, getForm, requestSaveTax, getCurrent } from './data';

$(document).ready(async function () {
    try {
        const itemsData = await getItems();
        const data = await getForm({
            NFRMNO: $('#NFRMNO').val(),
            VORGNO: $('#VORGNO').val(),
            CYEAR: $('#CYEAR').val(),
            CYEAR2: $('#CYEAR2').val(),
            NRUNNO: $('#NRUNNO').val(),
        });
        if (!data) throw new Error('Data not found!');

        await formHeader(data[0].form);
        await formHeaderInfo(data[0].form);
        await formFlowApproval(data[0].form);
        await formApprovalBtn();

        const currentData = await getCurrent(data[0].EMPCOD);
        await renderFormTable(itemsData);
        await fillFormValues(data[0], currentData);
        await calculateCurrentTotal();
        await calculateAndRenderTotal();
    } catch (error) {
        console.error('Error initializing tax form:', error);
    }
});

async function renderFormTable(items) {
    const gropsList = (item) => {
        let detailColHtml = `<div class="space-y-2">`;
        item.details.forEach((group) => {
            const hasTitle = Boolean(group.title);
            const containerClass = hasTitle
                ? 'bg-base-200/50 p-2.5 rounded-lg border border-base-300'
                : 'space-y-1.5';
            const titleHtml = hasTitle
                ? `<div class="text-xs font-semibold text-gray-700 mb-1.5">${group.title}</div>`
                : '';
            const gridClass = group.grid || 'space-y-1.5';

            let fieldsHtml = '';
            (group.fields || []).forEach((field) => {
                const fKey = field.key;
                const fType = field.type || 'text';
                const fClass =
                    field.class ||
                    (fType === 'radio' ? 'radio radio-sm' : 'w-full');
                const labelMinWidth = (() => {
                    const w = field.label_width;
                    if (!w) return '70px';
                    if (typeof w === 'number') return `${w}px`;
                    const str = String(w).trim();
                    const match = str.match(/\[(.*?)\]/);
                    if (match) return match[1];
                    if (/^\d+$/.test(str)) return `${str}px`;
                    return str;
                })();
                const minAttr =
                    field.min !== undefined ? `min="${field.min}"` : '';
                const maxAttr =
                    field.max !== undefined ? `max="${field.max}"` : '';
                const maxlengthAttr = field.maxlength
                    ? `maxlength="${field.maxlength}"`
                    : '';
                const placeholder = field.placeholder || '';
                const unitHtml = field.unit
                    ? `<span class="text-xs text-gray-500 whitespace-nowrap">${field.unit}</span>`
                    : '';

                if (fType === 'radio') {
                    const optionsHtml = field.options
                        .map((option, index) => {
                            const id = `${fKey}-${index}`;

                            return `
								<label for="${id}" class="inline-flex items-center gap-1.5 text-sm text-gray-700" data-field="${option.value}">
									<i class="fi fi-rr-square text-lg"></i>
									<span class="text-nowrap">${option.label}</span>
								</label>
							`;
                        })
                        .join('');

                    fieldsHtml += `
						<div class="flex flex-col gap-2" id="${fKey}">
							<span class="text-xs font-medium text-gray-600 whitespace-nowrap">${field.label}</span>
							<div class="flex flex-col gap-2">${optionsHtml}</div>
						</div>
					`;
                    return;
                }

                fieldsHtml += `
						<div class="flex items-center gap-2">
							<span class="text-sm text-gray-600 whitespace-nowrap shrink-0" style="min-width: ${labelMinWidth};">
								${field.label}
							</span>
							<input type="text" id="${fKey}" value=""
								placeholder="${placeholder}"
								class="input input-bordered input-sm bg-blue-50  ${fClass}" readonly/>
							${unitHtml}
						</div>
					`;
            });

            detailColHtml += `
					<div class="${containerClass}">
						${titleHtml}
						<div class="${gridClass}">
							${fieldsHtml}
						</div>
					</div>
				`;
        });
        return detailColHtml + `</div>`;
    };

    const personalList = (item) => {
        const detail = gropsList(item);
        return detail;
    };

    const spouseList = (item) => {
        const detail = gropsList(item);
        const list = `<div class="mt-2.5 pt-2 border-t flex items-center justify-between bg-blue-50/70 p-2.5 rounded-lg border border-blue-200">
            <div class="flex items-center gap-1.5 text-xs text-blue-900 font-semibold">
                <i class="fi fi-rr-wallet text-sm text-blue-600"></i>
                <span>ยอดเงินลดหย่อนคู่สมรส:</span>
            </div>
            <div class="flex items-center gap-1.5">
                <span class="text-sm font-black font-mono text-blue-700" id="spouse-amount-display">0.00</span>
                <span class="text-xs font-semibold text-blue-800">บาท</span>
                <input type="hidden" name="FAMCHI" id="tax3-hidden-input" value="0">
            </div>
        </div>`;
        return `${detail}${list}`;
    };

    const childList = (item) => {
        const detail = gropsList(item);
        const list = `<div class="mt-2.5 pt-2 border-t flex items-center justify-between bg-blue-50/70 p-2.5 rounded-lg border border-blue-200">
            <div class="flex items-center gap-1.5 text-xs text-blue-900 font-semibold">
                <i class="fi fi-rr-wallet text-sm text-blue-600"></i>
                <span>ยอดเงินลดหย่อนบุตรรวม:</span>
            </div>
            <div class="flex items-center gap-1.5">
                <span class="text-sm font-black font-mono text-blue-700" id="child-amount-display">0.00</span>
                <span class="text-xs font-semibold text-blue-800">บาท</span>
                <input type="hidden" name="FAMCHI" id="tax3-hidden-input" value="0">
            </div>
        </div>`;
        return `${detail}${list}`;
    };

    const parentList = (item) => {
        const detail = gropsList(item);
        const list = `<div class="mt-2.5 pt-2 border-t flex items-center justify-between bg-blue-50/70 p-2.5 rounded-lg border border-blue-200">
            <div class="flex items-center gap-1.5 text-xs text-blue-900 font-semibold">
                <i class="fi fi-rr-wallet text-sm text-blue-600"></i>
                <span>ยอดเงินลดหย่อนบิดา-มารดารวม:</span>
                <span class="text-[11px] text-slate-500 font-normal ml-1" id="parent-count-display">(0 ท่าน)</span>
            </div>
            <div class="flex items-center gap-1.5">
                <span class="text-sm font-black font-mono text-blue-700" id="parent-amount-display">0.00</span>
                <span class="text-xs font-semibold text-blue-800">บาท</span>
                <input type="hidden" name="tax4" id="tax4-hidden-input" value="0">
            </div>
        </div>`;
        return `${detail}${list}`;
    };

    const defaultInput = (id, unit = 'บาท') => {
        return `
            <div class="flex items-center gap-2">
                <input type="text" placeholder="0.00" readonly
                    class="df-input input input-bordered bg-blue-50 input-sm w-36 text-right font-mono" id="${id}" />
                <span class="text-xs text-gray-500 whitespace-nowrap">${unit}</span>
            </div>
        `;
    };

    //Start Render hear
    const $tbody = $('#tax-form-tbody');
    if (!$tbody.length) return;

    if (!items || !items.length) {
        $tbody.html(`
			<tr>
				<td colspan="4" class="text-center py-8 text-slate-400">
					ไม่พบรายการสิทธิลดหย่อน
				</td>
			</tr>
		`);
        return;
    }

    let currentGroup = null;
    let html = '';
    items.forEach((item) => {
        // หมวดหมู่รายการ (Group Header)
        if (item.group && item.group !== currentGroup) {
            currentGroup = item.group;
            html += `<tr>
                <th colspan="4" class="bg-gray-200 text-slate-800 text-sm font-bold py-2.5 px-4">${currentGroup}</th>
			</tr>`;
        }

        // คอลัมน์ที่ 1: รายการ + ลิงก์สรรพากร
        const col1 = `<th class="align-middle">
            <div class="flex gap-3 items-center">
                <span class="text-slate-800">${item.title}</span>
                <a href="https://www.rd.go.th/557.html" target="_blank" class="text-blue-600 hover:text-blue-800" title="อ่านเกณฑ์สรรพากร">
                    <i class="fi fi-rr-info"></i>
                </a>
            </div>
        </th>`;

        // คอลัมน์ที่ 2: อัตราค่าลดหย่อน
        let rateHtml = '';
        if (Array.isArray(item.rate)) {
            rateHtml = `
				<ul class="list-disc list-inside space-y-1 text-slate-600">
					${item.rate.map((r) => `<li>${r}</li>`).join('')}
				</ul>
			`;
        } else {
            rateHtml = `<span class="text-slate-600">${item.rate || ''}</span>`;
        }

        const col2 = `<td class="align-middle">${rateHtml}</td>`;
        const col3 = `<td class="align-middle text-right font-mono text-slate-700" data-tax-current="${item.id}"></td>`;
        // คอลัมน์ที่ 4: ช่องกรอกรายละเอียด / Input
        let detailColHtml = '';
        switch (item.id) {
            case 'TAX1':
                detailColHtml = personalList(item);
                break;
            case 'TAX2':
                detailColHtml = spouseList(item);
                break;
            case 'TAX3':
                detailColHtml = childList(item);
                break;
            case 'TAX4':
                detailColHtml = parentList(item);
                break;
            default:
                detailColHtml = defaultInput(item.id);
        }
        const col4 = `<td class="align-middle">${detailColHtml}</td>`;
        html += `
			<tr class="">
				${col1}
				${col2}
				${col3}
				${col4}
			</tr>
		`;
    });

    $tbody.html(html);
}

function fillFormValues(data, currentData) {
    const cardID = (val) => {
        if (val == null) return '';
        return val.replace(
            /^(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})$/,
            '$1-$2-$3-$4-$5',
        );
    };

    for (const [key, value] of Object.entries(data)) {
        const obj = $(`input#${key}`);
        if (obj.hasClass('df-input')) {
            obj.val(value > 0 ? showDigits(value, 2) : '');
            continue;
        }

        if (obj.hasClass('cardid')) {
            obj.val(cardID(value));
            continue;
        }
        obj.val(value == null ? '' : value);
    }

    $('#MARSTE')
        .find('label')
        .map((i, el) => {
            const val = $(el).data('field');
            if (val == data.MARSTE) {
                $(el)
                    .find('i')
                    .removeClass('fi-rr-square')
                    .addClass('fi-rr-checkbox');
            }
        });

    $('[data-tax-current]').each(function () {
        const id = $(this).data('tax-current');
        const curr = currentData[id];
        $(this).text(curr > 0 ? showDigits(curr, 2) : '-');
    });
}

function calculateCurrentTotal() {
    let total = 0;
    $('[data-tax-current]').each(function () {
        if (isNaN(intVal($(this).text())) === false) {
            total += intVal($(this).text());
        }
    });
    $('#table-tax-total').text(showDigits(total, 2));
    return total;
}

/**
 * คำนวณยอดรวมค่าลดหย่อนสดแบบเรียลไทม์จาก input ทั้งหมดในฟอร์ม
 */
function calSpouse() {
    // 1. ค่าลดหย่อนคู่สมรส
    if (validateThaiID($('#FAMSTX').val().trim())) {
        $('#spouse-amount-display').text(showDigits(60000, 2));
        return 60000;
    } else {
        $('#spouse-amount-display').text(showDigits(0, 2));
        return 0;
    }
}

function calChild() {
    // 2. คำนวณค่าลดหย่อนบุตร (ข้อ 3)
    const c1e = parseInt($('#C1IED').val(), 10) || 0;
    const c1n = parseInt($('#C1NED').val(), 10) || 0;
    const c2e = parseInt($('#C2IED').val(), 10) || 0;
    const c2n = parseInt($('#C2NED').val(), 10) || 0;
    let childSum = c1e * 30000 + c1n * 30000 + c2e * 60000 + c2n * 60000;
    $('#child-amount-display').text(showDigits(childSum, 2));
    return childSum;
}

function calParent() {
    let parentCount = 0;
    if (validateThaiID($('#TAXEMF').val())) parentCount++;
    if (validateThaiID($('#TAXEMM').val())) parentCount++;
    if (validateThaiID($('#TAXSFT').val())) parentCount++;
    if (validateThaiID($('#TAXSPM').val())) parentCount++;
    let parentSum = parentCount * 30000;

    $('#parent-amount-display').text(showDigits(parentSum, 2));
    $('#parent-count-display').text(`(${parentCount} ท่าน)`);
    return parentSum;
}

function validateThaiID(id) {
    if (id == '') return false;
    id = id.replace(/\D/g, '');
    if (id.length !== 13) return false;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(id.charAt(i)) * (13 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(id.charAt(12));
}

function calculateAndRenderTotal() {
    let total = 60000;
    total += calSpouse();
    total += calChild();
    total += calParent();

    $('.df-input').map(function () {
        const val = intVal($(this).val()) || 0;
        total += val;
    });
    $('#input-tax-total').text(showDigits(total, 2));
}

/**
 * ดักจับ Event เมื่อมีการเปลี่ยนแปลงค่าในช่องกรอก เพื่อคำนวณยอดรวมอัตโนมัติ
 */
function bindFormEvents() {
    $(document).on(
        'input change keyup paste',
        "input[type='number'], input[type='text']",
        function () {
            calculateAndRenderTotal();
        },
    );

    $(document).on('change', '.df-input', function () {
        try {
            const val = $(this).val();
            if (intVal(val) > 0) {
                $(this).val(showDigits(intVal(val), 2));
            } else {
                $(this).val('');
            }
        } catch (e) {
            console.error(e);
            showMessage('เกิดข้อผิดพลาดในการประมวลผลค่า');
        }
    });

    $(document).on('change', '.cardid', function () {
        const id = validateThaiID($(this).val());
        if (id) {
            const val = $(this)
                .val()
                .replace(
                    /^(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})$/,
                    '$1-$2-$3-$4-$5',
                );
            $(this).val(val);
        } else {
            $(this).val('');
        }
    });

    $(document).on('click', '.save-data', async function () {
        try {
            const payload = {};
            const isDraft = $(this).hasClass('btn-draft');
            $('input[type="text"], input[type="number"]').each(function () {
                const name = $(this).attr('name');
                if (!name) return;

                let value = $(this).val().toString().trim();

                if ($(this).hasClass('cardid') && value != '') {
                    payload[name] = value.replaceAll('-', '');
                } else if ($(this).hasClass('df-input') && value != '') {
                    payload[name] = intVal(value) || 0;
                } else if ($(this).attr('type') == 'number') {
                    if (intVal(value) > 0) payload[name] = intVal(value);
                } else if (value != '') {
                    payload[name] = value;
                }
            });

            const state = $('input[name="MARSTE"]:checked');
            payload['MARSTE'] = state.val();
            payload['MARSTT'] = state.siblings().text();

            showLoader();
            const res = await requestSaveTax(payload);
            window.location.href = `${process.env.APP_ENV}/tax`;
        } catch (e) {
            console.error(e);
            showMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    });
}
