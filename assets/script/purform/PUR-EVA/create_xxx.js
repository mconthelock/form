// import select2 from 'select2';
// import { dragDropInit } from '@amec/webasset/dragdrop';
// import { handleFiles } from '@amec/webasset/dragdrop';
import { searchNVFForm, getCurrency, create, getData } from './data';
import { createTable } from '@amec/webasset/dataTable';
// import { setSelect2 } from '@amec/webasset/select2';
import { downloadOrOpenFile } from '@amec/webasset/api/file';
import {
    getCountries,
    getProvinces,
    getDistricts,
    getSubDistricts,
    getTermcode,
    getVendor,
} from '../PUR-NVF/data';
import {
    countryManager,
    provinceManager,
    districtManager,
    subDistrictManager,
    paymentTermManager,
    addrEnManager,
    addrThManager,
    provinceEnManager,
    provinceThManager,
    districtEnManager,
    districtThManager,
    subDistrictEnManager,
    subDistrictThManager,
    countryEnManager,
    countryThManager,
    postcodeEnManager,
    postcodeThManager,
    attachFileManager,
    attachTypeManager,
    attachOtherManager,
} from '../PUR-NVF/formManager';
import { concernManager, currencyManager } from './formManager';
import {
    filterFormData,
    getAllAttr,
    logFormData,
    showMessage,
} from '@amec/webasset/utils';
import { getOrganize } from '../../finform/FIN-PCK/dataloc';
import { showLoader } from '@amec/webasset/preloader';
import { webflowSubmit } from '@amec/webasset/components/form';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { formSubmitSkeleton } from '@amec/webasset/skeleton';
import { showflow } from '@amec/webasset/api/webform';

var form = {};
var tableSearch, purformdata, columnPurNVF;
var provinceData, districtData, subDistrictData;

$(document).ready(async function () {
    const countries = await getCountries();
    const countriesData = countries.map((c) => ({
        id: c.nameen,
        value: c.nameen,
        text: c.nameen,
        nameth: c.nameth,
    }));

    const province = await getProvinces();
    provinceData = province.map((p) => ({
        id: p.id,
        value: p.nameen,
        text: p.nameen,
        nameth: p.nameth,
    }));
    const district = await getDistricts();

    districtData = district.map((d) => ({
        id: d.id,
        value: d.nameen,
        text: d.nameen,
        nameth: d.nameth,
        province_id: d.province_id,
    }));

    const subDistrict = await getSubDistricts();
    subDistrictData = subDistrict.map((s) => ({
        id: s.id,
        value: s.nameen,
        text: s.nameen,
        nameth: s.nameth,
        district_id: s.district_id,
        postcode: s.postcode,
    }));

    const term = await getTermcode();
    const termdata = term.map((t) => ({
        value: t.TERMCODE,
        text: t.TERMNAME,
    }));

    const currency = await getCurrency();
    const currencyData = currency.map((c) => ({
        value: c.CURCODE,
        text: c.CURRENCY,
    }));

    const org = await getOrganize();
    const orgdata = org.map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));
    //console.log(orgdata);

    countryManager.init(countriesData);
    provinceManager.init(provinceData);
    districtManager.init(districtData);
    subDistrictManager.init(subDistrictData);
    paymentTermManager.init(termdata);
    currencyManager.init(currencyData);
    concernManager.init(orgdata);
    const formInfo = await getAllAttr('.form-info');
    form = {
        NFRMNO: formInfo.nfrmno,
        VORGNO: formInfo.vorgno,
        CYEAR: formInfo.cyear,
        CYEAR2: formInfo.cyear2,
        NRUNNO: formInfo.nrunno,
        MODE: Number(formInfo.mode) ?? null,
        EMPNO: $('.apv-data').attr('empno'),
        RETURN: formInfo.return ?? null,
    };
    const submitbtn = webflowSubmit({
        request: true,
        draft: true,
        remark: false,
    });
    $('#form-action-container').html(submitbtn);
    setDatePicker();
    //const divattfile = await dragDropInit();
    //$('#attachFile').html(divattfile);
    columnPurNVF = [
        {
            data: 'NRUNNO',
            title: 'FORM No.',
            width: '200px',
            className: 'text-center',
            render: function (data, type, row) {
                // 1. ดึงปี 2 ตัวหลัง (เช็คเผื่อกรณีไม่มีค่าด้วย)
                let year2 = row.CYEAR2 ? String(row.CYEAR2).slice(-2) : '';

                // 2. เติม 0 ด้านหน้า NRUNNO ให้ครบ 6 หลัก
                let runNo = row.NRUNNO
                    ? String(row.NRUNNO).padStart(6, '0')
                    : '000000';
                return `<span class="font-semibold text-blue-600">PUR-NVF${year2}-${runNo}</span>`;
            },
        },
        {
            data: 'LISTS', // อ้างอิง property LISTS จาก JSON
            title: 'Vendor Name',
            className: 'text-left',
            render: function (data, type, row) {
                // เช็คว่ามีข้อมูล LISTS และ COMNAME หรือไม่
                if (row.LISTS && row.LISTS.length > 0 && row.LISTS[0].COMNAME) {
                    return row.LISTS[0].COMNAME;
                }
                return '-'; // ถ้าไม่มีให้แสดงขีด
            },
        },
    ];
    $('.field-local').removeClass('hidden');
    $('.field-oversea').addClass('hidden');

    if (form.RETURN) {
        const [flow, formeva] = await Promise.all([
            showflow({ ...form, showStep: true }),
            getData(form),
        ]);
        console.log(formeva);
        $('#directSearchInput').closest('.flex.items-center.gap-4').hide();
        $(`input[name="OPERATION"][value="${formeva.OPERATION}"]`)
            .prop('checked', true)
            .trigger('change');
        $(`input.radio-typec[value="${formeva.VENDGROUP}"]`)
            .prop('checked', true)
            .trigger('change'); // สั่ง trigger เพื่อให้โค้ดส่วนที่คุณส่งมาทำงานซ่อน/แสดง element ทันที

        if (formeva.OPERATION == 'A') {
            $('input[name="VENDORCODE"], #VENDORCODE')
                .val(formeva.VENDORCODE)
                .trigger('change');
            $('input[name="UPSTATUS"]')
                .prop('checked', formeva.UPSTATUS === 'Y')
                .trigger('change');
        }

        setVendorEvaInfo(formeva);
    }
});

function setVendorMstInfo(vendorMstData) {
    $('input[name="COMNAME"]').val(vendorMstData.VND_NAME);
    for (const address of vendorMstData.VENDOR_ADDRESS) {
        if (address.ADDR_TYPE == 'E') {
            addrEnManager.value = address.ADDR_LINE1;
            postcodeEnManager.value = address.ADDR_ZIPCODE;
            countryEnManager.value = address.ADDR_COUNTRY;
            if (address.ADDR_COUNTRY == 'THAILAND') {
                $('input[name="VENDTYPE"][value="Local"]').prop(
                    'checked',
                    true,
                );
                provinceManager.textToValue = address.ADDR_STATE;
                districtManager.textToValue = address.ADDR_CITY;
                subDistrictManager.textToValue = address.ADDR_SUB_CITY;
                countryManager.disabled(true);
            } else {
                $('input[name="VENDTYPE"][value="Oversea"]').prop(
                    'checked',
                    true,
                );
                provinceEnManager.value = address.ADDR_STATE;
                districtEnManager.value = address.ADDR_CITY;
                subDistrictEnManager.value = address.ADDR_SUB_CITY;
                countryManager.value = address.ADDR_COUNTRY;
                countryManager.disabled(false);
            }
        } else {
            addrThManager.value = address.ADDR_LINE1 || '';
            provinceThManager.value = address.ADDR_STATE;
            districtThManager.value = address.ADDR_CITY;
            subDistrictThManager.value = address.ADDR_SUB_CITY;
            postcodeThManager.value = address.ADDR_ZIPCODE;
            countryThManager.value = address.ADDR_COUNTRY;
        }
    }
    $('input[name="CONTACT"]').val(vendorMstData.VND_SALE);
    $('input[name="EMAIL"]').val(vendorMstData.EMAIL);
    $('input[name="WEBSITE"]').val(vendorMstData.ADDR_WEB);
    $('input[name="TELNO"]').val(vendorMstData.ADDR_PHONE);
    $('input[name="FAX"]').val(vendorMstData.FAX);
    $('input[name="BANKNAME"]').val(vendorMstData.BANKNAME);
    $('input[name="BRANCH"]').val(vendorMstData.BRANCH);
    $('input[name="ACCNUMBER"]').val(vendorMstData.ACCNUMBER);
    for (const VENDOR of vendorMstData.VENDOR_CODES) {
        if (VENDOR.CODE_NUM == $('#VENDORCODE').val()) {
            paymentTermManager.value = VENDOR.TERM.STERMCODE;
        }
    }
}

function setVendorInfo(vendorData) {
    console.log(vendorData);

    $('input[name="COMNAME"]').val(vendorData.LISTS[0].COMNAME);
    $(
        'input[name="VENDTYPE"][value="' + vendorData.LISTS[0].VENDTYPE + '"]',
    ).prop('checked', true);

    for (const address of vendorData.ADDRESSES) {
        if (address.ADDRTYPE === 'E') {
            if (vendorData.LISTS[0].VENDTYPE === 'Local') {
                addrEnManager.value = address.ADDR || '';
                //provinceManager.value = address.PROVINCE;
                provinceManager.textToValue = address.PROVINCE;
                districtManager.textToValue = address.DISTRICT;
                subDistrictManager.textToValue = address.SUBDISTRICT;
                countryManager.disabled(true);
            } else {
                addrEnManager.value = address.ADDR || '';
                provinceEnManager.value = address.PROVINCE;
                districtEnManager.value = address.DISTRICT;
                subDistrictEnManager.value = address.SUBDISTRICT;
                countryManager.value = address.COUNTRY;
                countryManager.disabled(false);
            }
            postcodeEnManager.value = address.POSTCODE;
            countryEnManager.value = address.COUNTRY;
        } else {
            addrThManager.value = address.ADDR || '';
            provinceThManager.value = address.PROVINCE;
            districtThManager.value = address.DISTRICT;
            subDistrictThManager.value = address.SUBDISTRICT;
            postcodeThManager.value = address.POSTCODE;
            countryThManager.value = address.COUNTRY;
        }
    }
    $('input[name="CONTACT"]').val(vendorData.LISTS[0].CONTACT);
    $('input[name="EMAIL"]').val(vendorData.LISTS[0].EMAIL);
    $('input[name="WEBSITE"]').val(vendorData.LISTS[0].WEBSITE);
    $('input[name="TELNO"]').val(vendorData.LISTS[0].TELNO);
    $('input[name="FAX"]').val(vendorData.LISTS[0].FAX);
    $('input[name="BANKNAME"]').val(vendorData.LISTS[0].BANKNAME);
    $('input[name="BRANCH"]').val(vendorData.LISTS[0].BRANCH);
    $('input[name="ACCNUMBER"]').val(vendorData.LISTS[0].ACCNUMBER);
    paymentTermManager.value = vendorData.LISTS[0].TERMCODE;
    const divfile = attachFileManager.setFiles(vendorData.FILES || [], true);
    //attachFileManager.container = divfile + dragDropInit();
    //attachTypeManager.reset();
    //if (vendorData.ATTACH_TYPE) {
    // Attach Type
    //  attachTypeManager.checked = vendorData.ATTACH_TYPE.split('|');
    // if (vendorData.ATTACH_OTHER) {
    //    attachTypeManager.checked = 'Other';
    //   $('#ATTACH_OTHER').val(vendorData.ATTACH_OTHER || '');
    //}
    //}
}

function setVendorEvaInfo(vendorEvaData) {
    const adaptedData = {
        ...vendorEvaData,
        LISTS: [
            {
                COMNAME: vendorEvaData.COMNAME,
                VENDTYPE: vendorEvaData.VENDTYPE,
                CONTACT: vendorEvaData.CONTACT,
                EMAIL: vendorEvaData.EMAIL,
                WEBSITE: vendorEvaData.WEBSITE,
                TELNO: vendorEvaData.TELNO,
                FAX: vendorEvaData.FAX,
                BANKNAME: vendorEvaData.BANKNAME,
                BRANCH: vendorEvaData.BRANCH,
                ACCNUMBER: vendorEvaData.ACCNUMBER,
                TERMCODE: vendorEvaData.TERMCODE,
            },
        ],
    };
    setVendorInfo(adaptedData);
}

function clearVendorInfo() {
    // 1. Reset input ธรรมดา
    $('input[name="COMNAME"]').val('');
    $('input[name="CONTACT"]').val('');
    $('input[name="EMAIL"]').val('');
    $('input[name="WEBSITE"]').val('');
    $('input[name="TELNO"]').val('');
    $('input[name="FAX"]').val('');
    $('input[name="BANKNAME"]').val('');
    $('input[name="BRANCH"]').val('');
    $('input[name="ACCNUMBER"]').val('');
    $('#ATTACH_OTHER').val('');

    // 2. Reset Radio/Checkbox
    $('input[name="VENDTYPE"]').prop('checked', false);

    // 3. Reset Managers (อ้างอิงจากโค้ดของคุณ)
    addrEnManager.value = '';
    addrThManager.value = '';

    // ฟังก์ชันย่อยสำหรับรีเซ็ต Manager ที่ใช้ Select2
    const resetManager = (manager) => {
        if (manager && manager.list) {
            manager.list.forEach((id) => {
                $(`#${id}`).val(null).trigger('change.select2');
            });
        }
    };

    // 1. เรียกใช้กับ Manager ที่เป็น Select2
    resetManager(provinceManager);
    resetManager(districtManager);
    resetManager(subDistrictManager);

    // รีเซ็ตค่า Manager ต่างๆ ให้เป็นค่าว่างหรือค่าเริ่มต้น
    [
        provinceManager,
        districtManager,
        subDistrictManager,
        countryManager,
    ].forEach((m) => {
        if (typeof m.value !== 'undefined') m.value = '';
        if (typeof m.textToValue !== 'undefined') m.textToValue = '';
    });

    provinceEnManager.value = '';
    districtEnManager.value = '';
    subDistrictEnManager.value = '';
    postcodeEnManager.value = '';
    countryEnManager.value = '';

    provinceThManager.value = '';
    districtThManager.value = '';
    subDistrictThManager.value = '';
    postcodeThManager.value = '';
    countryThManager.value = '';

    paymentTermManager.value = '';

    // 4. Reset ไฟล์และ Attach Type
    attachFileManager.setFiles([], true); // ล้างรายการไฟล์
    attachTypeManager.reset();
}

function calculateScore(containerSelector) {
    let totalScore = 0;
    let isAnyChecked = false;
    const container = $(containerSelector);
    let colorClass = 'text-gray-500';

    // หา radio ทั้งหมดที่ถูกเลือก ในกล่องที่เราระบุ
    container.find('input[type="radio"]:checked').each(function () {
        isAnyChecked = true;

        // ดึงค่าจาก value แล้วแปลงเป็นตัวเลขได้เลย!
        let score = parseInt($(this).val(), 10);

        if (!isNaN(score)) {
            totalScore += score;
        }
    });

    // แสดงผลรวมคะแนน โดยหาจาก class .total-score
    container.find('.total-score').text(totalScore);

    // คำนวณเกณฑ์ประเมิน
    let judgement = '-';
    if (isAnyChecked) {
        console.log(totalScore);

        if (totalScore >= 80) {
            judgement = 'EXCELLENT (80 UP)';
            colorClass = 'text-green-600';
        } else if (totalScore >= 70) {
            judgement = 'GOOD (70 UP)';
            colorClass = 'text-blue-600';
        } else if (totalScore >= 60) {
            judgement = 'FAIR (60 UP)';
            colorClass = 'text-orange-500';
        } else if (totalScore >= 40) {
            judgement = 'POOR (40 UP)';
            colorClass = 'text-orange-500';
        } else {
            judgement = 'NOT APPRICABLE (LESSTHAN 40)';
            colorClass = 'text-red-600';
        }
    }

    // แสดงผลข้อความประเมิน โดยหาจาก class .judgement-result
    container
        .find('.judgement-result')
        .text(judgement)
        .removeClass()
        .addClass(
            `judgement-result uppercase italic ml-2 font-bold ${colorClass}`,
        );
}

function renderNewFilesUI(inputId, dataTransfer, container) {
    // หากล่องสำหรับแสดงไฟล์ใหม่
    let newFilesDiv = container.find('.new-selected-files');
    if (newFilesDiv.length === 0) {
        container.append('<div class="new-selected-files mt-1"></div>');
        newFilesDiv = container.find('.new-selected-files');
    }

    // เคลียร์รายการเก่าเพื่อวาดใหม่ให้ตรงกับ DataTransfer ปัจจุบัน
    newFilesDiv.empty();

    // สร้างรายการตามไฟล์ที่มีในระบบ
    $.each(dataTransfer.files, function (index, file) {
        let fileItemHtml = `
                <div class="flex items-center gap-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                         class="cursor-pointer remove-new-file shrink-0" 
                         data-id="${inputId}" data-index="${index}" title="Remove file">
                        <circle cx="12" cy="12" r="10" fill="#dc2626"></circle>
                        <line x1="7" y1="12" x2="17" y2="12" stroke="white" stroke-width="3" stroke-linecap="round"></line>
                    </svg>
                    <span class="text-sm text-gray-700">${file.name}</span>
                </div>
            `;
        newFilesDiv.append(fileItemHtml);
    });
}

async function packPurevaFormData(formElement) {
    const fd = new FormData(formElement);
    const getAll = (key) => fd.getAll(key); // Helper สำหรับดึงค่า Array
    const getStr = (key) => fd.get(key) || '';

    // 1. แปลงฟิลด์ตัวเลขเดี่ยว (แทนที่ if-else chain เดิม)
    const numberFields = [
        'AMOUNT',
        'CAPITAL',
        'EMPDIRECT',
        'EMPINDIRECT',
        'LAND',
        'FACTORY',
    ];
    numberFields.forEach((key) => {
        if (fd.has(key) && fd.get(key)) fd.set(key, Number(fd.get(key)));
    });

    // 2. จัดการ Record Type & Remark
    const isNonProd = getStr('VENDGROUP').includes('6:Non-Production');
    const recordType = isNonProd ? 'P' : 'T';
    const remark = getStr(isNonProd ? 'nonremark' : 'proremark');

    // 3. จัดการ PROFIT_TURNOVERS (ยุบลูป for 2 ชุดเหลือชุดเดียว)
    const years = getAll(isNonProd ? 'FY[]' : 'FYT[]');
    const profits = getAll(isNonProd ? 'FY_PROFIT[]' : 'FYT_PROFIT[]');

    const PROFIT_TURNOVERS = years
        .map((year, i) =>
            year
                ? {
                      RECORD_TYPE: recordType,
                      MYEAR: Number(year),
                      AMOUNT: Number(profits[i]) || 0,
                  }
                : null,
        )
        .filter(Boolean); // ลบค่าที่เป็น null ทิ้ง

    // 4. จัดการ RELATIONS (ใช้ Helper function ยุบลูป for 4 ชุด)
    const buildRels = (nameKey, perKey, type) =>
        getAll(nameKey)
            .map((name, i) =>
                name
                    ? {
                          ENTITY_TYPE: type,
                          ENTITY_NAME: name,
                          PERCENT: Number(getAll(perKey)[i]) || 0,
                      }
                    : null,
            )
            .filter(Boolean);

    const RELATIONS = [
        ...buildRels('SHARENAME[]', 'SHAREPER[]', 'N'),
        ...buildRels('CUSNAME[]', 'CUSPER[]', 'C'),
        ...buildRels('SUPNAME[]', 'SUPPER[]', 'S'),
        ...buildRels('PRONAME[]', 'PROPER[]', 'P'),
    ];

    // 5. จัดการ SCORES (ใช้ jQuery .map() ดึงรวดเดียว)
    const SCORES = $(formElement)
        .find('input[data-topic]:checked')
        .map((_, el) => ({
            TOPIC: $(el).data('topic'),
            TOPIC_DESC: $(el).data('topicdesc'),
            SCORE: Number($(el).val()),
            SLEVEL: $(el).data('level'),
        }))
        .get();

    // 6. ลบฟิลด์ดิบที่ไม่ได้ใช้แล้ว
    const rawFieldsToDelete = [
        'FY[]',
        'FY_PROFIT[]',
        'FYT[]',
        'FYT_PROFIT[]',
        'FIN_LEVEL',
        'QA_LEVEL',
        'ENV_LEVEL',
        'VERIFYING',
        'SHARENAME[]',
        'SHAREPER[]',
        'CUSNAME[]',
        'CUSPER[]',
        'SUPNAME[]',
        'SUPPER[]',
        'PRONAME[]',
        'PROPER[]',
    ];
    rawFieldsToDelete.forEach((field) => fd.delete(field));

    // 7. ประกอบร่าง FormData กลับเข้าไป
    const compliances = getAll('CHKCOMPLIANCE');
    if (compliances.length) fd.append('COMPLIANCE', compliances.join(', '));
    fd.delete('CHKCOMPLIANCE');
    fd.append('REMARK', remark);

    const formInfo = await getAllAttr('.form-info');
    fd.append('NFRMNO', formInfo.nfrmno);
    fd.append('VORGNO', formInfo.vorgno);
    fd.append('CYEAR', formInfo.cyear);

    // Helper สำหรับ Append Array ของ Object เข้า FormData (ยุบโค้ดบรรทัดยาวๆ)
    const appendObjArray = (key, arr) =>
        arr.forEach((obj, i) =>
            Object.entries(obj).forEach(([prop, val]) => {
                if (val !== undefined) fd.append(`${key}[${i}][${prop}]`, val);
            }),
        );

    appendObjArray('SCORES', SCORES);
    appendObjArray('PROFIT_TURNOVERS', PROFIT_TURNOVERS);
    appendObjArray('RELATIONS', RELATIONS);

    return filterFormData(fd);
}

function checkAttFile() {
    const selectedGroup = $('input[name="VENDGROUP"]:checked').val();
    const hasCer = $('#file-cer')[0].files.length > 0; // Company Certificate
    const hasIe = $('#file-ie')[0].files.length > 0; // IE's evaluation
    const hasQa = $('#file-qa')[0].files.length > 0; // QA's evaluation
    if (selectedGroup.includes('6:Non-Production')) {
        if (!hasCer) {
            showMessage(
                'Please Attached Company Certificate / Vat Register / Company Profile',
                'warning',
            );
            return false;
        }
    } else {
        if (!hasIe || !hasQa) {
            showMessage(
                "Please Attached IE's evaluation Document and QA's evaluation Document",
                'warning',
            );
            return false;
        }
    }
    return true;
}
