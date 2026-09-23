import { searchNVFForm, getCurrency, create, getData, update } from './data';
import { createTable } from '@amec/webasset/dataTable';
import { downloadOrOpenFile } from '@amec/webasset/api/file';
// import {
//     getCountries,
//     getProvinces,
//     getDistricts,
//     getSubDistricts,
//     getTermcode,
//     getVendor,
// } from '../PUR-NVF/data';
import { getCountries, getTermcode, getVendor } from '../PUR-NVF/data';
import {
    countryManager,
    paymentTermManager,
    addr1EnManager,
    addr2EnManager,
    addrThManager,
    cityEnManager,
    stateEnManager,
    countryEnManager,
    postcodeEnManager,
    attachFileManager,
    attachTypeManager,
    attachOtherManager,
} from '../PUR-NVF/formManager';
import {
    bindComplianceData,
    bindScoreData,
    concernManager,
    currencyManager,
    renderFilesByType,
} from './formManager';
import {
    filterFormData,
    getAllAttr,
    logFormData,
    requiredForm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getOrganize } from '../../finform/FIN-PCK/dataloc';
import { showLoader } from '@amec/webasset/preloader';
import { webflowSubmit } from '@amec/webasset/components/form';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { formSubmitSkeleton } from '@amec/webasset/skeleton';
import {
    getFormStatus,
    searchFlow,
    showflow,
} from '@amec/webasset/api/webform';
import { formatDate } from '@amec/webasset/dayjs';
import Swal from 'sweetalert2';
import { redirectWebflow } from '@amec/webasset/form';

var form = {};
var tableSearch, purformdata, columnPurNVF;
var provinceData, districtData, subDistrictData;
var deletefile = [];
const requiredMessage = [
    { element: $('input[name="REQBY"]'), message: 'Please input requester.' },
    {
        element: $('input[name="OPERATION"]'),
        message: 'Please input Operation.',
    },
    {
        element: $('input[name="VENDGROUP"]'),
        message: 'Please input Vendor Type.',
    },
    {
        element: $('input[name="VENDPURPOSE"]'),
        message: 'Please input 2nd digit code Purpose.',
    },
    {
        element: $('input[name="COMNAME"]'),
        message: 'Please input Vendor Name.',
    },
    {
        element: $('input[name="VENDTYPE"]'),
        message: 'Please select Local or Overseas.',
    },
    {
        element: $('input[name="ADDRESS_EN"]'),
        message: 'Please input Address (EN).',
    },
    {
        element: $('input[name="CONTACT"]'),
        message: 'Please input Contact name.',
    },
    {
        element: $('input[name="EMAIL"]'),
        message: 'Please input Email.',
    },
    {
        element: $('input[name="TELNO"]'),
        message: 'Please input Tel.no',
    },
    {
        element: $('.termcode'),
        message: 'Please input Payment Term',
    },
    {
        element: $('#stdcur'),
        message: 'Please input Currency Code',
    },
    {
        element: $('#cur'),
        message: 'Please input Currency of Capital',
    },
    {
        element: $('.chk-compliance'),
        message: 'Please input Compliance',
    },
    {
        element: $('input[name="PRODCAT"]'),
        message:
            'Please input List of Goods and Services for Trademark Registration in Thailand',
    },
    {
        element: $('input[name="CORPORATE_ID"]'),
        message: 'Please input Corporate Registration Number',
    },
    {
        element: $('#TAX_ID_NON'),
        message: 'Please input Tax ID',
    },
    {
        element: $('#TAX_ID_PRO'),
        message: 'Please input Tax ID',
    },
    {
        element: $('input[name="VENDCAT"]'),
        message: 'Please input Vendor Category',
    },
    {
        element: $('input[name="CAPITAL"]'),
        message: 'Please input Capital.',
    },
    {
        element: $('input[name="ESTABLISHED"]'),
        message: 'Please input Established',
    },
    {
        element: $('input[name="COM_TYPE"]'),
        message: 'Please input Type of Company',
    },
    {
        element: $('input[name="COM_TYPE"]'),
        message: 'Please input Type of Company',
    },
    {
        element: $('input[name="EMPDIRECT"]'),
        message: 'Please input Employee Direct',
    },
    {
        element: $('input[name="EMPINDIRECT"]'),
        message: 'Please input Employee Indirect',
    },
    {
        element: $('input[name="AVGAGE"]'),
        message: 'Please input Average Age',
    },
].filter(Boolean);

// ==========================================
// ส่วนของ Event ต่าง ๆ (ย้ายมาอยู่นอก document.ready ได้ทั้งหมดด้วย $(document).on)
// ==========================================

$(document).on('click', '#btnOpenModal', function () {
    $('#searchModal')[0].showModal();
});

$(document).on('click', '#btnCloseModal', function () {
    $('#searchModal')[0].close();
});

$(document).on('click', '#add-contact', async function () {
    const newRow = `
        <div class="flex gap-4 contact-row mt-2">
            <input type="text" placeholder="Name" class="input input-sm border border-gray-400 h-8 rounded w-[450px] px-2">
            <input type="email" placeholder="E-mail" class="input input-sm border border-gray-400 h-8 rounded w-[450px] px-2">
            <input type="text" placeholder="Username" class="input input-sm border border-gray-400 h-8 rounded w-[200px] px-2">
            <button type="button" class="btn-remove text-red-500 hover:text-red-700 font-bold px-2 flex items-center">✕</button>
        </div>
    `;
    $('#contact-list').append(newRow);
});

$(document).on('click', '#contact-list .btn-remove', function () {
    $(this).closest('.contact-row').remove();
});

$(document).on('input', '#VENDCODE', async function () {
    const keywordValue = this.value.trim();
    if (keywordValue.length === 5) {
        try {
            showLoader();
            const searchData = { VND_CODE: keywordValue, IS_DETAIL: '1' };
            const vendor = await getVendor(searchData);
            console.log(vendor);

            setVendorMstInfo(vendor[0]);
        } catch (err) {
            console.error('Error get Vendor:', err);
            showErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลคู่ค้า');
        } finally {
            showLoader({ show: false });
        }
    }
});

$(document).on('change', '.radio-opr', async function () {
    const isAnnual = $(this).val() === 'A';
    const container = $(this).closest('.vendor-form-container');
    const vendorInput = container.find('.vendor-code-input');
    const updateCheck = container.find('.update-status-check');
    if (isAnnual) {
        vendorInput.prop('disabled', false);
        updateCheck.prop('disabled', false);
        $('#stdcur').prop('disabled', true);
        $('#select-wrapper').hide();
        $('#constdcur').removeClass('hidden');
    } else {
        vendorInput.prop('disabled', true).val('');
        updateCheck.prop('disabled', true).prop('checked', false);
        $('#stdcur').prop('disabled', false);
        // $('#select-wrapper').removeClass('hidden');
        $('#select-wrapper').show();
        $('#constdcur').addClass('hidden');
    }
});

$(document).on('change', '.radio-typec', async function () {
    console.log('event change');
    let val = $(this).val().split(':')[0];

    if (val === '6') {
        console.log('disable pro');

        // --- กรณีเลือก Non-Production (แสดง #nonpro / ซ่อน #pro) ---

        // 1. ซ่อนและสั่ง disable ก้อน #pro ก่อนทันที
        $('#pro').addClass('hidden');
        // $('#pro').find('input, select, textarea').attr('disabled', true);
        $('#pro').find('input, select, textarea').attr('disabled', 'disabled');

        // 2. ปลดล็อกและแสดงก้อน #nonpro
        $('#nonpro').removeClass('hidden');
        $('#nonpro').find('input, select, textarea').removeAttr('disabled');

        // จัดการส่วนอื่นๆ
        $('#attach-vat').removeClass('hidden');
        $('#attach-ie').addClass('hidden');
        $('#attach-qa').addClass('hidden');
        $('.pro').addClass('hidden');
        $('input[name="VENDPURPOSE"]').removeClass('req');
    } else {
        // --- กรณีเลือก Production (แสดง #pro / ซ่อน #nonpro) ---

        // 1. ซ่อนและสั่ง disable ก้อน #nonpro ก่อนทันที
        $('#nonpro').addClass('hidden');
        $('#nonpro')
            .find('input, select, textarea')
            .attr('disabled', 'disabled');

        // 2. ปลดล็อกและแสดงก้อน #pro
        $('#pro').removeClass('hidden');
        $('#pro').find('input, select, textarea').removeAttr('disabled');

        // จัดการส่วนอื่นๆ
        $('.pro').removeClass('hidden');
        $('#attach-ie').removeClass('hidden');
        $('#attach-qa').removeClass('hidden');
        $('#attach-vat').addClass('hidden');
        $('input[name="VENDPURPOSE"]').addClass('req');
    }

    if ($('.radio-type:checked').length > 0) {
        $('.radio-type:checked').trigger('change');
    }
});

$(document).on('change', '.radio-type', async function () {
    let typec = $('.radio-typec:checked').val()?.split(':')[0];
    let val = $(this).val();
    if (val === 'Local') {
        $('.field-local').removeClass('hidden');
        $('.field-oversea').addClass('hidden');
        if (typec === '6') {
            $('.field-local-nonpro').removeClass('hidden');
            $('.field-oversea-nonpro').addClass('hidden');
            $('input[name="PRODCAT"]').addClass('req');
        } else {
            $('.field-local-nonpro').addClass('hidden');
            $('.field-oversea-nonpro').addClass('hidden');
            $('input[name="PRODCAT"]').removeClass('req');
        }
        countryManager.disabled(true);
        countryEnManager.value = 'Thailand';
        $('input[name="CHKCOMPLIANCE"]').removeClass('req');
    } else {
        $('.field-local').addClass('hidden');
        $('.field-oversea').removeClass('hidden');
        if (typec === '6') {
            $('.field-oversea-nonpro').removeClass('hidden');
            $('.field-local-nonpro').addClass('hidden');
            $('input[name="CHKCOMPLIANCE"]').addClass('req');
        } else {
            $('.field-local-nonpro').addClass('hidden');
            $('.field-oversea-nonpro').addClass('hidden');
            $('input[name="CHKCOMPLIANCE"]').removeClass('req');
        }
        $('input[name="PRODCAT"]').removeClass('req');
        countryManager.disabled(false);
        countryEnManager.value = '';
    }
    paymentTermManager.filterByRadio(val);
});

$(document).on('input', '#AMOUNT', async function () {
    let rawValue = $(this).val().replace(/,/g, '');
    let amount = parseFloat(rawValue);
    if (isNaN(amount)) {
        $('input[name="PUR_LEVEL"]').prop('checked', false);
        return;
    }
    if (amount >= 1000000) {
        $('input[name="PUR_LEVEL"][value="A"]').prop('checked', true);
    } else if (amount >= 100000) {
        $('input[name="PUR_LEVEL"][value="B"]').prop('checked', true);
    } else if (amount >= 10000) {
        $('input[name="PUR_LEVEL"][value="C"]').prop('checked', true);
    } else {
        $('input[name="PUR_LEVEL"][value="D"]').prop('checked', true);
    }
});

$(document).on('input', '.input-decimal', async function () {
    let value = $(this).val();
    value = value.replace(/[^0-9.]/g, '');
    value = value.replace(/(\..*)\./g, '$1');
    value = value.replace(/(\.\d{2})\d+/g, '$1');
    let parts = value.split('.');
    if (parts[0]) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    $(this).val(parts.join('.'));
});

$(document).on('input', '.input-integer', function () {
    let value = $(this).val();
    value = value.replace(/[^0-9]/g, '');
    if (value) {
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    $(this).val(value);
});

$(document).on('input', '.input-year', function () {
    let value = $(this).val();
    value = value.replace(/[^0-9]/g, '');
    $(this).val(value);
});

$(document).on('keydown', '#modalSearch', async function (e) {
    if (e.which === 13 || e.key === 'Enter') {
        e.preventDefault();
        let keyword = $(this).val().trim();
        if (keyword === '') return;

        try {
            const results = await searchNVFForm(keyword);
            const data = Array.isArray(results) ? results : results.data || [];
            $('#tableContainer')
                .empty()
                .html(
                    '<table id="tableSearch" class="w-full text-sm text-gray-600"></table>',
                );
            tableSearch = await createTable(
                {
                    data: data,
                    columns: columnPurNVF,
                    searching: false,
                    lengthChange: false,
                    info: false,
                    createdRow: function (row, data, dataIndex) {
                        $(row).addClass(
                            'hover:bg-blue-50 cursor-pointer transition-colors',
                        );
                    },
                },
                {
                    id: '#tableSearch',
                    columnSelect: { status: false },
                    domScroll: {
                        status: true,
                        maxHeight: '21rem',
                        type: 'tailwind4',
                    },
                    join: true,
                },
            );
        } catch (error) {
            console.error('Error searching NVF form:', error);
            $('#tableContainer').html(
                '<p class="text-red-500 text-center py-4">เกิดข้อผิดพลาดในการค้นหา</p>',
            );
        }
    }
});

$(document).on('click', '#tableContainer #tableSearch tbody tr', function () {
    const table = $('#tableSearch').DataTable();
    const rowData = table.row(this).data();
    const nvfno =
        'PUR-NVF' +
        rowData.CYEAR2.slice(-2) +
        '-' +
        String(rowData.NRUNNO).padStart(6, '0');
    $('#directSearchInput').val(nvfno);
    setVendorInfo(rowData);
    $('#searchModal')[0].close();
});

$(document).on('select2:select', '.country', async function (e) {
    countryManager.change(e);
});

// $(document).on('select2:select', '.province', async function (e) {
//     provinceManager.change(e);
//     const selectedProvinceId = provinceManager.getValue('PROVINCE_SELECT');
//     const filteredDistricts = districtData.filter(
//         (d) => d.province_id == selectedProvinceId,
//     );
//     const districtOptions = filteredDistricts.map((d) => ({
//         id: d.id,
//         value: d.value,
//         text: d.text,
//         nameth: d.nameth,
//     }));
//     districtOptions.unshift({
//         id: '',
//         value: '',
//         text: '-- Select District --',
//         nameth: '',
//     });
//     districtManager.select.empty().trigger('change');
//     await districtManager.init(districtOptions);
// });

// $(document).on('select2:select', '.district', async function (e) {
//     districtManager.change(e);
//     const selectedDistrictId = districtManager.getValue('DISTRICT_SELECT');
//     const filteredSubDistricts = subDistrictData.filter(
//         (s) => s.district_id == selectedDistrictId,
//     );
//     const subDistrictOptions = filteredSubDistricts.map((s) => ({
//         id: s.id,
//         value: s.value,
//         text: s.text,
//         nameth: s.nameth,
//         district_id: s.district_id,
//         postcode: s.postcode,
//     }));
//     subDistrictOptions.unshift({
//         id: '',
//         value: '',
//         text: '-- Select Sub-district --',
//         nameth: '',
//         district_id: '',
//         postcode: '',
//     });
//     subDistrictManager.select.empty().trigger('change');
//     await subDistrictManager.init(subDistrictOptions);
// });

// $(document).on('select2:select', '.sub-district', async function (e) {
//     subDistrictManager.change(e);
// });

$(document).on('input', '#directSearchInput', async function () {
    const keyword = $(this).val();
    if (keyword.length == '16') {
        const results = await searchNVFForm(keyword);
        if (results && Array.isArray(results) && results.length > 0) {
            const data = results[0];
            if (data.LISTS && data.LISTS.length > 0) {
                setVendorInfo(data);
            } else {
                clearVendorInfo();
                showMessage('This form no. not found', 'warning');
            }
        } else {
            clearVendorInfo();
            showMessage('This form no. not found', 'warning');
        }
    }
});

$(document).on('change', '.legal_status', async function () {
    console.log('click legal status');
    const legal = $(this).val();
    if (legal == 'นิติบุคคล') {
        $('input[name="CORPORATE_ID"]').addClass('req');
        $('input[name="TAX_ID"]').addClass('req');
    } else {
        $('input[name="CORPORATE_ID"]').removeClass('req');
    }
});

$(document).on('click', '.procat', async function () {
    const procat = $(this).val();
    if (procat == 'อื่นๆ') {
        $('input[name="PRODCAT_OTHER"]').addClass('req');
    } else {
        $('input[name="PRODCAT_OTHER"]').removeClass('req');
    }
});

$(document).on('click', '.add-row-btn', function () {
    const tableId = $(this).data('table');
    const tbody = $('#' + tableId + ' tbody');
    const newRow = tbody.find('.row-template').first().clone();
    newRow.removeClass('row-template');
    newRow.find('input').val('');
    newRow
        .find('td:last-child')
        .html(
            '<button type="button" class="remove-row w-7 h-7 rounded border border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center font-bold text-lg mx-auto transition-colors">×</button>',
        );
    tbody.append(newRow);
});

$(document).on('click', '.remove-row', function () {
    $(this).closest('tr').remove();
});

$(document).on(
    'change',
    '#section-eva-non input[type="radio"], #section-eva-pro input[type="radio"]',
    function (e) {
        const containerId =
            '#' + $(this).closest('div[id^="section-eva"]').attr('id');
        calculateScore(containerId);
    },
);

const selectedFilesCache = {};
$(document).on('change', 'input[type="file"]', async function () {
    let inputId = $(this).attr('id');
    let wrapper = $(this).closest('.flex-col');
    let showFileContainer = wrapper.find('.show-file');

    if (!selectedFilesCache[inputId]) {
        selectedFilesCache[inputId] = new DataTransfer();
    }
    let dataTransfer = selectedFilesCache[inputId];

    if (this.files && this.files.length > 0) {
        $.each(this.files, function (index, file) {
            let isDuplicate = false;
            for (let i = 0; i < dataTransfer.files.length; i++) {
                if (dataTransfer.files[i].name === file.name) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                dataTransfer.items.add(file);
            }
        });
    }
    this.files = dataTransfer.files;
    renderNewFilesUI(inputId, dataTransfer, showFileContainer);
});

$(document).on('click', '.remove-new-file', function () {
    let inputId = $(this).data('id');
    let indexToRemove = $(this).data('index');
    let dataTransfer = selectedFilesCache[inputId];
    let inputElement = $('#' + inputId)[0];
    let showFileContainer = $(this).closest('.show-file');

    if (dataTransfer) {
        dataTransfer.items.remove(indexToRemove);
        inputElement.files = dataTransfer.files;
        renderNewFilesUI(inputId, dataTransfer, showFileContainer);
    }
});

$(document).on('click', '.remove-file', async function (e) {
    e.preventDefault();
    e.stopPropagation();
    const id = $(this).attr('file-id');
    const tagA = $(this).closest('a');
    Swal.fire({
        title: 'Are you sure you want to delete this file?',
        icon: 'warning',
        showCancelButton: true,
    }).then((result) => {
        if (result.isConfirmed) {
            tagA.remove();
            deletefile.push(id);
        }
    });
});

$(document).on('click', '#btnDraft, #btnRequest', async function () {
    if (this.id === 'btnRequest') {
        let activeFields = requiredMessage.filter(
            (f) => !f.element.prop('disabled'),
        );
        console.log('active');

        console.log(activeFields);
        console.log('end active');

        // วนลูปเช็คทุก element ที่มีคลาส .req
        $('.req').each(function () {
            const $el = $(this);
            const type = $el.attr('type');
            let hasValue = false;

            // เช็คตามประเภทของ input
            if (type === 'radio' || type === 'checkbox') {
                // สำหรับ radio/checkbox ให้ดูว่ามีตัวไหนในกลุ่มถูกเลือกไหม
                const name = $el.attr('name');
                hasValue = $(`input[name="${name}"]:checked`).length > 0;
            } else {
                // สำหรับ text, select, textarea ทั่วไป เช็คว่ามีค่าว่างหรือไม่
                hasValue = $el.val() && $el.val().trim() !== '';
            }

            // แสดงผลลัพธ์ใน Console เพื่อดูสถานะ
            console.log(
                `Element Name/ID: ${$el.attr('name') || $el.attr('id')} | มีการกรอกข้อมูลไหม:`,
                hasValue,
            );
        });
        const selectedVendGroup =
            $('input[name="VENDGROUP"]:checked').val() || '';
        const isNonProd = selectedVendGroup.includes('6:Non-Production');

        if (!isNonProd) {
            if (
                !validateTablePair(
                    'share-name',
                    'share-per',
                    'Please fill in complete Shareholder information',
                )
            ) {
                return false;
            }

            // 2. เช็คตารางที่ 2 (เช่น Customer) ถ้าไม่กรอก ให้ alert และหยุดทันที
            if (
                !validateTablePair(
                    'cus-name',
                    'cus-per',
                    'Please fill in complete Main Customer information',
                )
            ) {
                return false;
            }

            // 3. เช็คตารางที่ 3 (เช่น Supplier) ถ้าไม่กรอก ให้ alert และหยุดทันที
            if (
                !validateTablePair(
                    'sup-name',
                    'sup-per',
                    'Please fill in complete Supplier of Main Material information',
                )
            ) {
                return false;
            }
            if (
                !validateTablePair(
                    'pro-name',
                    'pro-per',
                    'Please fill in complete Main Product information',
                )
            ) {
                return false;
            }
        }

        if (!(await requiredForm('#frmmain', activeFields))) return;
        if (!checkAttFile()) {
            return false;
        }
        if (!checkEvaluationCompleted()) {
            return false;
        }
    } else {
        console.log($('input[name="OPERATION"]:checked').val());
        if (!$('input[name="OPERATION"]:checked').val()) {
            showMessage('Please Input Operation', 'warning');
            return false;
        }
        if (!$('input[name="VENDGROUP"]:checked').val()) {
            showMessage('Please Input Vendor Type', 'warning');
            return false;
        }
        if ($('input[name="COMNAME"]').val() == '') {
            showMessage('Please Input Vendor Name', 'warning');
            return false;
        }
    }

    $('input[name="ACTION"]').val('save');
    const formElement = $('#frmmain')[0];
    const filteredFormData = await packPurevaFormData(formElement);
    console.log('ddddddddddddddddd');
    logFormData(filteredFormData);
    //console.log(filteredFormData);
    //console.log('ddddddddddddddddd');

    if (this.id === 'btnDraft') {
        filteredFormData.append('DRAFT', '0');
    }
    try {
        showLoader();
        const res = await create(filteredFormData);
        if (res.status == true) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
    } finally {
        showLoader({ show: false });
    }
});

$(document).on('click', 'button[name="btnAction"]', async function () {
    const act = $(this).val();
    const selectedVendGroup = $('input[name="VENDGROUP"]:checked').val() || '';
    const isNonProd = selectedVendGroup.includes('6:Non-Production');
    $('input[name="ACTION"]').val(act);
    if (act == 'approve') {
        if (!isNonProd) {
            if (
                !validateTablePair(
                    'share-name',
                    'share-per',
                    'Please fill in complete Shareholder information',
                )
            ) {
                return false;
            }

            // 2. เช็คตารางที่ 2 (เช่น Customer) ถ้าไม่กรอก ให้ alert และหยุดทันที
            if (
                !validateTablePair(
                    'cus-name',
                    'cus-per',
                    'Please fill in complete Main Customer information',
                )
            ) {
                return false;
            }

            // 3. เช็คตารางที่ 3 (เช่น Supplier) ถ้าไม่กรอก ให้ alert และหยุดทันที
            if (
                !validateTablePair(
                    'sup-name',
                    'sup-per',
                    'Please fill in complete Supplier of Main Material information',
                )
            ) {
                return false;
            }
            if (
                !validateTablePair(
                    'pro-name',
                    'pro-per',
                    'Please fill in complete Main Product information',
                )
            ) {
                return false;
            }
        }

        let activeFields = requiredMessage.filter(
            (f) => !f.element.prop('disabled'),
        );

        // console.log('============');
        // console.log(activeFields);
        // console.log('============');
        $('#frmmain')
            .find('input, select, textarea')
            .each(function () {
                if ($(this).hasClass('req')) {
                    console.log(
                        $(this).attr('name'),
                        $(this).attr('id'),
                        $(this).val(),
                    );
                }
            });
        // console.log('before require');
        if (!(await requiredForm('#frmmain', activeFields))) return;
        // console.log('after require');
        if (!checkAttFile()) {
            return false;
        }
        if (!checkEvaluationCompleted()) {
            return false;
        }
    }
    try {
        showLoader();
        const formElement = $('#frmmain')[0];
        const filteredFormData = await packPurevaFormData(formElement);
        logFormData(filteredFormData);
        const res = await update(filteredFormData);
        if (res.status == true) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
    } finally {
        showLoader({ show: false });
    }
});
$(document).on('input', '.empnum', function () {
    const directValue =
        Number($('input[name="EMPDIRECT"]').val().replace(/,/g, '')) || 0;
    const indirectValue =
        Number($('input[name="EMPINDIRECT"]').val().replace(/,/g, '')) || 0;
    const total = directValue + indirectValue;
    $('.totemp').val(total).trigger('input');
});

$(document).on('change', 'input[name="VENDGROUP"]', function () {
    const selectedValue = $(this).val();
    const blockCer = $('#file-cer').closest('.flex-col.gap-2.border');
    const blockIe = $('#file-ie').closest('.flex-col.gap-2.border');
    const blockQa = $('#file-qa').closest('.flex-col.gap-2.border');
    if (selectedValue) {
        if (selectedValue.includes('6:Non-Production')) {
            blockIe.hide();
            blockQa.hide();
            blockCer.show();
            $('#file-ie, #file-qa').val('');
            $('#file-ie, #file-qa')
                .closest('.flex-col')
                .find('.show-file')
                .empty();
            $('input[name="TAX_ID"]').removeClass('req');
        } else {
            blockIe.show();
            blockQa.show();
            blockCer.show();
            // $('#file-cer').val('');
            // $('#file-cer').closest('.flex-col').find('.show-file').empty();
            $('input[name="TAX_ID"]').addClass('req');
        }
    } else {
        blockIe.hide();
        blockQa.hide();
        blockCer.hide();
    }
});

// ==========================================
// ส่วนเริ่มต้นการทำงานหลัก (document.ready)
// ==========================================

$(document).ready(async function () {
    const countries = await getCountries();
    countries.sort((a, b) => a.name_en.localeCompare(b.name_en));
    const countriesData = countries.map((c) => ({
        id: c.name_en,
        value: c.name_en,
        text: c.name_en,
        nameth: c.name_th,
    }));

    // const province = await getProvinces();
    // provinceData = province.map((p) => ({
    //     id: p.id,
    //     value: p.nameen,
    //     text: p.nameen,
    //     nameth: p.nameth,
    // }));
    // const district = await getDistricts();

    // districtData = district.map((d) => ({
    //     id: d.id,
    //     value: d.nameen,
    //     text: d.nameen,
    //     nameth: d.nameth,
    //     province_id: d.province_id,
    // }));

    // const subDistrict = await getSubDistricts();
    // subDistrictData = subDistrict.map((s) => ({
    //     id: s.id,
    //     value: s.nameen,
    //     text: s.nameen,
    //     nameth: s.nameth,
    //     district_id: s.district_id,
    //     postcode: s.postcode,
    // }));

    const term = await getTermcode();
    console.log(term);

    const termdata = term.map((t) => ({
        value: t.STERMCODE,
        text: t.STERMDESC,
    }));

    const currency = await getCurrency();
    const currencyData = currency.map((c) => ({
        value: c.CURR_CODE,
        text: c.CURR_NAME,
    }));

    const org = await getOrganize();
    const orgdata = org.map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));

    countryManager.init(countriesData);
    // provinceManager.init(provinceData);
    // districtManager.init(districtData);
    // subDistrictManager.init(subDistrictData);
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

    setDatePicker();

    columnPurNVF = [
        {
            data: 'NRUNNO',
            title: 'FORM No.',
            width: '200px',
            className: 'text-center',
            render: function (data, type, row) {
                let year2 = row.CYEAR2 ? String(row.CYEAR2).slice(-2) : '';
                let runNo = row.NRUNNO
                    ? String(row.NRUNNO).padStart(6, '0')
                    : '000000';
                return `<span class="font-semibold text-blue-600">PUR-NVF${year2}-${runNo}</span>`;
            },
        },
        {
            data: 'LISTS',
            title: 'Vendor Name',
            className: 'text-left',
            render: function (data, type, row) {
                if (row.LISTS && row.LISTS.length > 0 && row.LISTS[0].COMNAME) {
                    return row.LISTS[0].COMNAME;
                }
                return '-';
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
        //console.log(formeva);
        $('#directSearchInput').closest('.flex.items-center.gap-4').hide();
        await setVendorEvaInfo(formeva);
        const cst = await getFormStatus(form);
        if (cst == '1') {
            $('#form-action-container').html(
                webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: true,
                    save: true,
                    remark: false,
                }),
            );
        } else {
            $('#form-action-container').html(
                webflowSubmit({
                    approve: true,
                    save: true,
                    remark: false,
                }),
            );
        }
    } else {
        $('#form-action-container').html(
            webflowSubmit({
                request: true,
                draft: true,
                remark: false,
            }),
        );
    }
});

// ฟังก์ชันช่วยเหลือต่าง ๆ
function setVendorMstInfo(vendorMstData) {
    console.log(vendorMstData);
    // return false;
    $('input[name="COMNAME"]').val(vendorMstData.VND_NAME);
    $('input[name="CONTACT"]').val(vendorMstData.VND_CONTACTNAME);
    $('input[name="TELNO"]').val(vendorMstData.VND_PHONE);
    $('input[name="FAX"]').val(vendorMstData.VND_FAX);
    paymentTermManager.value = vendorMstData.VND_TERM;
    currencyManager.value = vendorMstData.CURRENCY;
    if (vendorMstData.STDCUR) {
        $('#constdcur').text(vendorMstData.STDCUR.CURR_NAME);
    }

    const vendorfilter = vendorMstData.PURVMM.filter(
        (item) => item.FORM.CST == '2',
    );
    // console.log(vendorfilter);
    const latestVendor = vendorfilter.sort((a, b) => {
        // เรียง CYEAR2 จากมากไปน้อย (ปีใหม่กว่าขึ้นก่อน)
        if (b.CYEAR2 !== a.CYEAR2) {
            return b.CYEAR2.localeCompare(a.CYEAR2);
        }
        // ถ้าปีเท่ากัน เรียง NRUNNO จากมากไปน้อย
        return b.NRUNNO - a.NRUNNO;
    })[0];
    if (latestVendor) {
        $('input[name="EMAIL"]').val(latestVendor.EMAIL);
        $('input[name="WEBSITE"]').val(latestVendor.WEBSITE);
        $('input[name="BANKNAME"]').val(latestVendor.BANKNAME);
        $('input[name="BRANCH"]').val(latestVendor.BRANCH);
        $('input[name="ACCNUMBER"]').val(latestVendor.ACCNUMBER);
        for (const address of latestVendor.ADDRESSES) {
            if (address.ADDRTYPE == 'E') {
                addr1EnManager.value = address.ADDR1;
                addr2EnManager.value = address.ADDR2;
                stateEnManager.value = address.STATE;
                cityEnManager.value = address.CITY;
                countryManager.value = address.COUNTRY;
                postcodeEnManager.value = address.POSTCODE;
                countryEnManager.value = address.COUNTRY;
                if (address.COUNTRY.toUpperCase() == 'THAILAND') {
                    $('input[name="VENDTYPE"][value="Local"]').prop(
                        'checked',
                        true,
                    );
                    countryManager.disabled(true);
                } else {
                    $('input[name="VENDTYPE"][value="Oversea"]').prop(
                        'checked',
                        true,
                    );
                    countryManager.disabled(false);
                }
            } else {
                const addrLine =
                    `${address.ADDR1 || ''} ${address.ADDR2 || ''}`.trim();
                const fullAddress = [
                    addrLine,
                    address.CITY,
                    address.STATE,
                    address.POSTCODE,
                    address.COUNTRY,
                ]
                    .filter(Boolean) // กรองค่า null, undefined, ค่าว่าง ออก
                    .join(',');
                addrThManager.value = fullAddress;
            }
        }
    }
    if (vendorMstData.PUREVA) {
        const evafilter = vendorMstData.PUREVA.filter(
            (item) => item.FORM.CST == '2',
        );
        // console.log(vendorfilter);
        const latesteva = evafilter.sort((a, b) => {
            // เรียง CYEAR2 จากมากไปน้อย (ปีใหม่กว่าขึ้นก่อน)
            if (b.CYEAR2 !== a.CYEAR2) {
                return b.CYEAR2.localeCompare(a.CYEAR2);
            }
            // ถ้าปีเท่ากัน เรียง NRUNNO จากมากไปน้อย
            return b.NRUNNO - a.NRUNNO;
        })[0];

        if (latesteva) {
            if (latesteva.VENDGROUP) {
                $(`input.radio-typec[value="${latesteva.VENDGROUP}"]`)
                    .prop('checked', true)
                    .trigger('change');
            }
            if (latesteva.VENDPURPOSE) {
                $(`input[name="VENDPURPOSE"][value="${latesteva.VENDPURPOSE}"]`)
                    .prop('checked', true)
                    .trigger('change');
            }

            $('input[name="CORPORATE_ID"]').val(latesteva.CORPORATE_ID || '');
            $('input[name="TAX_ID"]').val(latesteva.TAX_ID || '');
            if (latesteva.LEGAL_STATUS) {
                $(
                    `input[name="LEGAL_STATUS"][value="${latesteva.LEGAL_STATUS}"]`,
                )
                    .prop('checked', true)
                    .trigger('change');
            }
        }
    }

    // for (const address of vendorMstData.VENDOR_ADDRESS) {
    //     if (address.ADDR_TYPE == 'E') {
    //         addr1EnManager.value = address.ADDR_LINE1;
    //         addr2EnManager.value = address.ADDR_LINE2;
    //         postcodeEnManager.value = address.ADDR_ZIPCODE;
    //         countryEnManager.value = address.ADDR_COUNTRY;
    //         if (address.ADDR_COUNTRY.toUpperCase() == 'THAILAND') {
    //             $('input[name="VENDTYPE"][value="Local"]').prop(
    //                 'checked',
    //                 true,
    //             );
    //             provinceManager.textToValue = address.ADDR_STATE;
    //             districtManager.textToValue = address.ADDR_CITY;
    //             subDistrictManager.textToValue = address.ADDR_SUB_CITY;
    //             countryManager.disabled(true);
    //         } else {
    //             $('input[name="VENDTYPE"][value="Oversea"]').prop(
    //                 'checked',
    //                 true,
    //             );
    //             stateEnManager.value = address.ADDR_STATE;
    //             cityEnManager.value = address.ADDR_CITY;
    //             countryManager.value = address.ADDR_COUNTRY;
    //             countryManager.disabled(false);
    //         }
    //     } else {
    //         addrThManager.value = address.ADDR_LINE1 || '';
    //     }
    // }

    // console.log(vendorMstData.VND_CODE);

    // for (const VENDOR of vendorMstData.VND_CODE) {
    //     console.log(VENDOR.CODE_NUM);
    //     console.log($('#VENDCODE').val());

    //     if (VENDOR.CODE_NUM == $('#VENDCODE').val()) {
    //         paymentTermManager.value = VENDOR.TERM.STERMCODE;
    //         currencyManager.value = VENDOR.STDCUR.CURR_CODE;
    //         console.log(VENDOR.STDCUR.CURR_NAME);

    //         $('#constdcur').text(VENDOR.STDCUR.CURR_NAME);
    //     } else {
    //         console.log('else');
    //     }
    // }
}

function setVendorInfo(vendorData) {
    console.log(vendorData);

    $('input[name="COMNAME"]').val(vendorData.LISTS[0].COMNAME);
    $('input[name="VENDTYPE"][value="' + vendorData.LISTS[0].VENDTYPE + '"]')
        .prop('checked', true)
        .trigger('change');

    for (const address of vendorData.ADDRESSES) {
        if (address.ADDRTYPE === 'E') {
            addr1EnManager.value = address.ADDR1 || '';
            addr2EnManager.value = address.ADDR2 || '';
            cityEnManager.value = address.CITY;
            stateEnManager.value = address.STATE;
            countryManager.value = address.COUNTRY;
            countryManager.disabled(false);
            postcodeEnManager.value = address.POSTCODE;
            countryEnManager.value = address.COUNTRY;
        } else {
            addrThManager.value = address.ADDR1 || '';
            // provinceThManager.value = address.PROVINCE;
            // districtThManager.value = address.DISTRICT;
            // subDistrictThManager.value = address.SUBDISTRICT;
            // postcodeThManager.value = address.POSTCODE;
            // countryThManager.value = address.COUNTRY;
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
    attachFileManager.setFiles(vendorData.FILES || [], true);
}

async function setVendorEvaInfo(formeva) {
    var flow = await searchFlow({
        NFRMNO: formeva.NFRMNO,
        VORGNO: formeva.VORGNO,
        CYEAR: formeva.CYEAR,
        CYEAR2: formeva.CYEAR2,
        NRUNNO: formeva.NRUNNO,
        CSTEPST: '3',
    });
    $('.txtRemark').val(flow[0].VREMARK || '');
    const adaptedData = {
        ...formeva,
        LISTS: [
            {
                COMNAME: formeva.COMNAME,
                VENDTYPE: formeva.VENDTYPE,
                CONTACT: formeva.CONTACT,
                EMAIL: formeva.EMAIL,
                WEBSITE: formeva.WEBSITE,
                TELNO: formeva.TELNO,
                FAX: formeva.FAX,
                BANKNAME: formeva.BANKNAME,
                BRANCH: formeva.BRANCH,
                ACCNUMBER: formeva.ACCNUMBER,
                TERMCODE: formeva.TERMCODE,
            },
        ],
    };
    $(`input[name="OPERATION"][value="${formeva.OPERATION}"]`)
        .prop('checked', true)
        .trigger('change');

    $(`input.radio-typec[value="${formeva.VENDGROUP}"]`)
        .prop('checked', true)
        .trigger('change');

    $(`input[name="VENDPURPOSE"][value="${formeva.VENDPURPOSE}"]`)
        .prop('checked', true)
        .trigger('change');

    if (formeva.OPERATION == 'A') {
        $('input[name="VENDCODE"], #VENDCODE')
            .val(formeva.VENDCODE)
            .trigger('change');
        $('input[name="UPSTATUS"]')
            .prop('checked', formeva.UPSTATUS === 'Y')
            .trigger('change');
    }
    $('#BANKADDR').val(formeva.BANKADDR || '');
    $('#stdcur')
        .val(formeva.CURCODE || '')
        .trigger('change');

    setVendorInfo(adaptedData);
    formeva.ATTACH_OTHER && $('#ATTACH_OTHER').val(formeva.ATTACH_OTHER);
    const attachedFiles = formeva.FILES || [];
    renderFilesByType(attachedFiles, 11, 'file-type-11', true);
    renderFilesByType(attachedFiles, 12, 'file-type-12', true);
    renderFilesByType(attachedFiles, 13, 'file-type-13', true);
    renderFilesByType(attachedFiles, 2, 'file-type-2', true);
    bindComplianceData(formeva.COMPLIANCE, formeva.COMPLIANCE_OTHER);
    $('input[name="PRODCAT"][value="' + formeva.PRODCAT + '"]')
        .prop('checked', true)
        .trigger('change');

    $('input[name="PRODCAT_OTHER"]').val(formeva.PRODCAT_OTHER);
    $('input[name="BUSTYPE_REG"]').val(formeva.BUSTYPE_REG);
    $('input[name="BUSTYPE_SUB"]').val(formeva.BUSTYPE_SUB);

    bindProfitTurnoverTables(formeva.PROFIT_TURNOVERS);

    $(`input[name="LEGAL_STATUS"][value="${formeva.LEGAL_STATUS}"]`)
        .prop('checked', true)
        .trigger('change');
    $('input[name="CORPORATE_ID"]').val(formeva.CORPORATE_ID);
    $('input[name="TAX_ID"]').val(formeva.TAX_ID);
    $('#CONCERNEDORG').val(formeva.CONCERNEDORG).trigger('change');
    $('input[name="FY_AMOUNT"]').val(formeva.FY_AMOUNT);
    $('input[name="AMOUNT"]').val(formeva.AMOUNT).trigger('input');
    $(`input[name="PUR_STATUS"][value="${formeva.PUR_STATUS}"]`)
        .prop('checked', true)
        .trigger('change');

    $('input[name="VENDCAT"]').val(formeva.VENDCAT);
    $('input[name="CAPITAL"]').val(formeva.CAPITAL);
    $('#cur').val(formeva.CAPITAL_CUR).trigger('change');
    bindScoreData(formeva.SCORES);
    $('input[name="ESTABLISHED"]').val(formeva.ESTABLISHED);
    $(`input[name="COM_TYPE"][value="${formeva.COM_TYPE}"]`)
        .prop('checked', true)
        .trigger('change');
    $('input[name="COM_OTHER"]').val(formeva.COM_OTHER);
    $('input[name="EMPDIRECT"]').val(formeva.EMPDIRECT);
    $('input[name="EMPINDIRECT"]').val(formeva.EMPINDIRECT);
    $('.totemp').val(Number(formeva.EMPDIRECT) + Number(formeva.EMPINDIRECT));
    $('input[name="AVGAGE"]').val(formeva.AVGAGE);
    $('input[name="LAND"]').val(formeva.LAND);
    $('input[name="FACTORY"]').val(formeva.FACTORY);

    $(`input[name="QM_STATUS"][value="${formeva.QM_STATUS}"]`)
        .prop('checked', true)
        .trigger('change');
    $('input[name="QM_REASON"]').val(formeva.QM_REASON);
    $(`input[name="CSR_STATUS"][value="${formeva.CSR_STATUS}"]`)
        .prop('checked', true)
        .trigger('change');
    $('input[name="CSR_REASON"]').val(formeva.CSR_REASON);
    $(`input[name="ENV_STATUS"][value="${formeva.ENV_STATUS}"]`)
        .prop('checked', true)
        .trigger('change');
    $('input[name="ENV_REASON"]').val(formeva.ENV_REASON);
    $(`input[name="LABOR_STATUS"][value="${formeva.LABOR_STATUS}"]`)
        .prop('checked', true)
        .trigger('change');

    $('input[name="LABOR_ESTABLISH_DATE"]').val(
        formatDate(formeva.LABOR_ESTABLISH_DATE, 'DD/MM/YYYY'),
    );
    $('input[name="JUDGEMENT"]').val(formeva.JUDGEMENT);

    bindEntityTables(formeva.RELATIONS);
}

function clearVendorInfo() {
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

    $('input[name="VENDTYPE"]').prop('checked', false);

    addr1EnManager.value = '';
    addr2EnManager.value = '';
    addrThManager.value = '';

    const resetManager = (manager) => {
        if (manager && manager.list) {
            manager.list.forEach((id) => {
                $(`#${id}`).val(null).trigger('change.select2');
            });
        }
    };

    resetManager(provinceManager);
    resetManager(districtManager);
    resetManager(subDistrictManager);

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

    paymentTermManager.value = '';

    attachFileManager.setFiles([], true);
    attachTypeManager.reset();
}

function calculateScore(containerSelector) {
    let totalScore = 0;
    let isAnyChecked = false;
    const container = $(containerSelector);
    let colorClass = 'text-gray-500';

    container.find('input[type="radio"]:checked').each(function () {
        isAnyChecked = true;
        let score = parseInt($(this).val(), 10);
        if (!isNaN(score)) {
            totalScore += score;
        }
    });

    container.find('.total-score').text(totalScore);

    let judgement = '-';
    let judlevel = '';
    if (isAnyChecked) {
        if (totalScore >= 80) {
            judgement = 'A: EXCELLENT (80 UP)';
            colorClass = 'text-green-600';
            judlevel = 'A';
        } else if (totalScore >= 70) {
            judgement = 'B: GOOD (70 UP)';
            colorClass = 'text-blue-600';
            judlevel = 'B';
        } else if (totalScore >= 60) {
            judgement = 'C: FAIR (60 UP)';
            colorClass = 'text-orange-500';
            judlevel = 'C';
        } else if (totalScore >= 40) {
            judgement = 'D: POOR (40 UP)';
            colorClass = 'text-orange-500';
            judlevel = 'D';
        } else {
            judgement = 'E: NOT APPRICABLE (LESSTHAN 40)';
            colorClass = 'text-red-600';
            judlevel = 'E';
        }
    }
    $('[name="JUDGEMENT"]').val(judlevel);
    container
        .find('.judgement-result')
        .text(judgement)
        .removeClass()
        .addClass(
            `judgement-result uppercase italic ml-2 font-bold ${colorClass}`,
        );
}

function renderNewFilesUI(inputId, dataTransfer, container) {
    let newFilesDiv = container.find('.new-selected-files');
    if (newFilesDiv.length === 0) {
        container.append('<div class="new-selected-files mt-1"></div>');
        newFilesDiv = container.find('.new-selected-files');
    }

    newFilesDiv.empty();

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
    $('.input-decimal, .input-integer').each(function () {
        let name = $(this).attr('name'); // ดึงชื่อ name ของช่องนั้นๆ
        let valueWithComma = $(this).val();

        // ถ้าช่องนี้มีการตั้งค่า name ไว้
        if (name) {
            // ลบจุลภาคออก
            let cleanValue = valueWithComma.replace(/,/g, '');

            // อัปเดตทับค่าเดิมใน FormData ด้วย .set()
            fd.set(name, cleanValue);
        }
    });
    const getAll = (key) => fd.getAll(key);
    const getStr = (key) => fd.get(key) || '';

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

    const isNonProd = getStr('VENDGROUP').includes('6:Non-Production');
    const recordType = isNonProd ? 'P' : 'T';
    const remark = getStr(isNonProd ? 'nonremark' : 'proremark');

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
        .filter(Boolean);

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

    const SCORES = $(formElement)
        .find('input[data-topic]:checked')
        .map((_, el) => ({
            TOPIC: $(el).data('topic'),
            TOPIC_DESC: $(el).data('topicdesc'),
            SCORE: Number($(el).val()),
            SLEVEL: $(el).data('level'),
        }))
        .get();

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

    const compliances = getAll('CHKCOMPLIANCE');
    if (compliances.length) fd.append('COMPLIANCE', compliances.join(', '));
    fd.delete('CHKCOMPLIANCE');
    fd.append('REMARK', remark);

    const formInfo = await getAllAttr('.form-info');
    fd.append('NFRMNO', formInfo.nfrmno);
    fd.append('VORGNO', formInfo.vorgno);
    fd.append('CYEAR', formInfo.cyear);
    fd.append('CYEAR2', formInfo.cyear2);
    fd.append('NRUNNO', formInfo.nrunno);
    const apvno = $('.apv-data').attr('empno');
    // fd.append('ACTION', 'save');
    fd.append('EMPNO', apvno);
    deletefile.forEach((fileId) => {
        fd.append('DELETE_FILES[]', String(fileId));
    });
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
    const hasCer =
        $('#file-cer')[0].files.length > 0 ||
        $('#file-type-11').find('a').length > 0;
    const hasIe =
        $('#file-ie')[0].files.length > 0 ||
        $('#file-type-12').find('a').length > 0;
    const hasQa =
        $('#file-qa')[0].files.length > 0 ||
        $('#file-type-13').find('a').length > 0;
    const hasQth =
        $('#file-other')[0].files.length > 0 ||
        $('#file-type-2').find('a').length > 0;
    if (selectedGroup && selectedGroup.includes('6:Non-Production')) {
        if (!hasCer) {
            showMessage(
                'Please Attached Company Certificate / Vat Register / Company Profile',
                'warning',
            );
            return false;
        }
    } else {
        if (!hasIe && !hasQa && !hasCer && !hasQth) {
            showMessage('Please Attached file', 'warning');
            return false;
        }
    }
    return true;
}

function checkEvaluationCompleted() {
    const selectedGroup = $('input[name="VENDGROUP"]:checked').val();
    let containerId = '';
    if (selectedGroup && selectedGroup.includes('6:Non-Production')) {
        containerId = 'section-eva-non';
    } else {
        containerId = 'section-eva-pro';
    }
    let radioGroups = {};
    $(`#${containerId} input[type="radio"]`).each(function () {
        let groupName = $(this.getAttribute('name'));
        radioGroups[$(this).attr('name')] = true;
    });

    let allSelected = true;
    let unselectedTopics = [];

    for (let groupName in radioGroups) {
        let isChecked =
            $(`#${containerId} input[name="${groupName}"]:checked`).length > 0;

        if (!isChecked) {
            allSelected = false;
            let firstRadioInGroup = $(
                `#${containerId} input[name="${groupName}"]`,
            ).first();
            let topicName = firstRadioInGroup.data('topic') || groupName;
            unselectedTopics.push(topicName);
        }
    }
    if (!allSelected) {
        showMessage('Please select a rating for all topics', 'warning');
    }
    return allSelected;
}

function bindEntityTables(data) {
    const tableConfig = {
        N: {
            tableId: '#shareholder-table',
            nameInput: 'SHARENAME[]',
            perInput: 'SHAREPER[]',
        },
        C: {
            tableId: '#customer-table',
            nameInput: 'CUSNAME[]',
            perInput: 'CUSPER[]',
        },
        S: {
            tableId: '#supplier-table',
            nameInput: 'SUPNAME[]',
            perInput: 'SUPPER[]',
        },
        P: {
            tableId: '#product-table',
            nameInput: 'PRONAME[]',
            perInput: 'PROPER[]',
        },
    };

    if (!Array.isArray(data)) return;

    $.each(tableConfig, function (type, config) {
        var $table = $(config.tableId);
        var $tbody = $table.find('tbody');
        if ($tbody.length === 0) {
            $tbody = $table;
        }

        var $template = $tbody.find('.row-template').first();

        // กรองและเรียงลำดับ ID จากน้อย -> มาก
        var filteredData = data
            .filter((item) => item.ENTITY_TYPE === type)
            .sort((a, b) => a.ID - b.ID);

        // 1. เคลียร์แถวทั้งหมดในตารางทิ้งก่อน
        $tbody.empty();

        if (filteredData.length === 0) {
            // ถ้าไม่มีข้อมูล ให้คง row-template เปล่าๆ ไว้ 1 แถว (และช่อง Action จะว่างไม่มีปุ่ม)
            $template.find('td').last().empty();
            $tbody.append($template);
            return;
        }

        filteredData.forEach((item, index) => {
            var $newRow = $template.clone();

            // จัดการเรื่องคลาส row-template
            if (index === 0) {
                // ถ้าเป็นแถวแรก ให้คงคลาส row-template ไว้ตามเดิม
                $newRow.addClass('row-template');
                // แถวแรกไม่มีปุ่มลบ ปล่อยช่อง Action ให้ว่าง
                $newRow.find('td').last().empty();
            } else {
                // ถ้าเป็นแถวที่ 2 เป็นต้นไป ให้เอาคลาส row-template ออก
                $newRow.removeClass('row-template');
                // ใส่ปุ่มลบ (×)
                $newRow.find('td').last().html(`
                    <button type="button" class="remove-row w-7 h-7 rounded border border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center font-bold text-lg mx-auto transition-colors">×</button>
                `);
            }

            // ใส่ค่า Name และ Percent ปกติ
            $newRow
                .find(`input[name="${config.nameInput}"]`)
                .val(item.ENTITY_NAME ? item.ENTITY_NAME.trim() : '');
            $newRow.find(`input[name="${config.perInput}"]`).val(item.PERCENT);

            $tbody.append($newRow);
        });
    });
}

/**
 * ฟังก์ชันกระจายข้อมูล Profit / Turnover ลงตารางอัตโนมัติ
 * @param {Array} turnovers - ข้อมูลอาเรย์ทั้งหมดของ PROFIT_TURNOVERS
 */
function bindProfitTurnoverTables(turnovers) {
    if (!Array.isArray(turnovers)) return;

    // 1. กำหนดค่าคอนฟิกของแต่ละประเภท (RECORD_TYPE)
    const config = {
        P: {
            tableId: '#profit-table',
            yearInput: 'FY[]',
            profitInput: 'FY_PROFIT[]',
        },
        T: {
            tableId: '#turnover-table',
            yearInput: 'FYT[]',
            profitInput: 'FYT_PROFIT[]',
        },
    };

    // 2. เรียงลำดับข้อมูลทั้งหมดตาม ID จากน้อยไปมาก
    var sortedData = [...turnovers].sort((a, b) => a.ID - b.ID);

    // 3. วนลูปตามประเภทใน config อัตโนมัติ
    $.each(config, function (type, cfg) {
        // กรองข้อมูลเฉพาะประเภทนั้น (เช่น 'P' หรือ 'T')
        var filteredData = sortedData.filter(
            (item) => item.RECORD_TYPE === type,
        );

        // นำข้อมูลไปหยอดลง input ของตารางนั้นๆ ตามลำดับแถว
        $.each(filteredData, function (index, item) {
            var $row = $(cfg.tableId + ' tbody tr').eq(index);
            if ($row.length > 0) {
                $row.find(`input[name="${cfg.yearInput}"]`).val(item.MYEAR);
                $row.find(`input[name="${cfg.profitInput}"]`).val(item.AMOUNT);
            }
        });
    });
}

function formatText(inputString) {
    if (!inputString) return '';

    // ตัดช่องว่างทั้งหมดออก
    let noSpace = inputString.replace(/\s+/g, '');

    if (noSpace.length === 0) return '';

    // ตัวแรกตัวใหญ่ นอกนั้นตัวเล็กทั้งหมด
    return noSpace.charAt(0).toUpperCase() + noSpace.slice(1).toLowerCase();
}

function validateTablePair(nameClass, perClass, message) {
    let hasValidRow = false;

    const names = document.querySelectorAll(`.${nameClass}`);
    const pers = document.querySelectorAll(`.${perClass}`);

    for (let i = 0; i < names.length; i++) {
        let nameVal = names[i].value.trim();
        let perVal = pers[i].value.trim();

        // เช็คว่าช่องคู่ไหนกรอกครบถ้วนบ้าง
        if (nameVal !== '' && perVal !== '') {
            hasValidRow = true;
            break;
        }
    }

    // ถ้าตรวจสอบแล้ว "ไม่มี" แถวไหนกรอกครบเลยแม้แต่แถวเดียว
    if (!hasValidRow) {
        // แจ้งเตือนด้วยฟังก์ชันกลาง (หรือ alert ตามระบบของคุณ)
        showMessage(message, 'warning');
        return false; // สั่งหยุดการทำงานทันที ไม่ไปต่อ
    }

    return true; // ผ่าน ไปทำงานต่อได้
}

$(document).on('click', '.file-link', async function (e) {
    console.log('xxxx');

    e.preventDefault();
    const filePath = $(this).attr('href');
    const filename = $(this).attr('originalName');
    const storedName = $(this).attr('storedName');
    const ext = filename.split('.').pop();

    await downloadOrOpenFile({
        baseDir: filePath,
        storedName: storedName,
        originalName: filename,
        mode: ext == 'pdf' ? 'open' : 'download',
    });
});
