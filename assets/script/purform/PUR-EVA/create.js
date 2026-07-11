import select2 from 'select2';
import { dragDropInit } from '@amec/webasset/dragdrop';
import { searchNVFForm } from './data';
import { createTable } from '@amec/webasset/dataTable';
import { setSelect2 } from '@amec/webasset/select2';
import { downloadOrOpenFile } from '@amec/webasset/api/file';
import {
    getCountries,
    getProvinces,
    getDistricts,
    getSubDistricts,
    getTermcode,
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
select2();
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
    countryManager.init(countriesData);
    provinceManager.init(provinceData);
    districtManager.init(districtData);
    subDistrictManager.init(subDistrictData);
    paymentTermManager.init(termdata);

    dragDropInit();
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
    // 1. เปิด Modal
    $('#btnOpenModal').on('click', function () {
        $('#searchModal')[0].showModal(); // เรียกใช้คำสั่งของ HTML dialog
    });

    // 2. ปิด Modal (เมื่อกดปุ่มปิด)
    $('#btnCloseModal').on('click', function () {
        $('#searchModal')[0].close();
    });

    $(document).on('click', '#add-contact', async function () {
        const newRow = `
                <div class="flex gap-4 contact-row mt-2">
                    <input type="text" placeholder="Name" class="input input-sm border border-gray-400 h-8 rounded w-[450px] px-2">
                    <input type="email" placeholder="E-mail" class="input input-sm border border-gray-400 h-8 rounded w-[450px] px-2">'
                    <input type="text" placeholder="Username" class="input input-sm border border-gray-400 h-8 rounded w-[200px]  px-2">
                    <button type="button" class="btn-remove text-red-500 hover:text-red-700 font-bold px-2 flex items-center">
                        ✕
                    </button>
                </div>
            `;
        $('#contact-list').append(newRow);
    });

    // จัดการปุ่มลบแถว (ใช้ .on() เพื่อรองรับ HTML ที่เพิ่งถูกสร้างใหม่)
    $('#contact-list').on('click', '.btn-remove', function () {
        $(this).closest('.contact-row').remove();
    });

    $(document).on('change', '.radio-typec', async function () {
        let val = $(this).val().split(':')[0];
        if (val === '6') {
            $('#nonpro').removeClass('hidden');
            $('#attach-ie').addClass('hidden');
            $('#attach-qa').addClass('hidden');
        } else {
            $('#nonpro').addClass('hidden');
            $('#attach-ie').removeClass('hidden');
            $('#attach-qa').removeClass('hidden');
        }
    });

    $(document).on('change', '.radio-type', async function () {
        let val = $(this).val();
        if (val === 'Local') {
            $('.field-local').removeClass('hidden');
            $('.field-oversea').addClass('hidden');
            countryManager.disabled(true);
            countryEnManager.value = 'Thailand';
            countryThManager.value = 'ไทย';
        } else {
            $('.field-local').addClass('hidden');
            $('.field-oversea').removeClass('hidden');
            countryManager.disabled(false);
            countryEnManager.value = '';
            countryThManager.value = '';
        }
    });

    $(document).on('input', '#total_amount', async function () {
        let rawValue = $(this).val().replace(/,/g, '');
        let amount = parseFloat(rawValue);
        if (isNaN(amount)) {
            $('input[name="purchase_level"]').prop('checked', false);
            return;
        }
        if (amount >= 1000000) {
            $('input[name="purchase_level"][value="A"]').prop('checked', true);
        } else if (amount >= 100000) {
            // ถ้าน้อยกว่า 1 ล้าน และมากกว่าเท่ากับ 1 แสน
            $('input[name="purchase_level"][value="B"]').prop('checked', true);
        } else if (amount >= 10000) {
            // ถ้าน้อยกว่า 1 แสน และมากกว่าเท่ากับ 1 หมื่น
            $('input[name="purchase_level"][value="C"]').prop('checked', true);
        } else {
            // ถ้าน้อยกว่า 1 หมื่น
            $('input[name="purchase_level"][value="D"]').prop('checked', true);
        }
    });

    $(document).on('keydown', '#modalSearch', async function (e) {
        if (e.which === 13 || e.key === 'Enter') {
            e.preventDefault();
            let keyword = $(this).val().trim();
            if (keyword === '') return;

            try {
                // 1. เรียก API
                const results = await searchNVFForm(keyword);

                // ตรวจสอบว่าได้ข้อมูลมาเป็น Array หรือไม่ (ปรับให้เข้ากับโครงสร้างของคุณ)
                const data = Array.isArray(results)
                    ? results
                    : results.data || [];

                // 2. ทุบตารางเก่าทิ้ง แล้วใส่ <table> ใหม่เข้าไปใน #tableContainer
                $('#tableContainer')
                    .empty()
                    .html(
                        '<table id="tableSearch" class="w-full text-sm text-gray-600"></table>',
                    );

                // 3. สร้างตารางใหม่ด้วย DataTables
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

    // ดักจับการคลิกที่แถวในตาราง #tableSearch
    $('#tableContainer').on('click', '#tableSearch tbody tr', function () {
        // 1. ดึงข้อมูล DataTables ของแถวนี้
        const table = $('#tableSearch').DataTable();
        const rowData = table.row(this).data();
        setVendorInfo(rowData); // เรียกใช้ฟังก์ชัน setVendorInfo เพื่อใส่ข้อมูลลงในฟอร์ม
        $('#searchModal')[0].close();
    });
});

function setVendorInfo(vendorData) {
    console.log(vendorData);

    $('input[name="COMNAME"]').val(vendorData.LISTS[0].COMNAME);
    $(
        'input[name="vendor_type"][value="' +
            vendorData.LISTS[0].VENDTYPE +
            '"]',
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
    attachFileManager.container = divfile + dragDropInit();
    if (vendorData.ATTACH_TYPE) {
        // Attach Type
        attachTypeManager.checked = vendorData.ATTACH_TYPE.split('|');

        // Attach Other
        //attachTypeManager.show(['other']);
        attachOtherManager.text = vendorData.ATTACH_OTHER || '';

        //attachOtherManager.value = vendorData.ATTACH_OTHER || '';

        // attachTypeManager.checkbox.each(function () {
        //     const value = $(this).val();
        //     const type = $(this).attr('a-type');
        //     if (vendorData.ATTACH_TYPE.includes(value)) {
        //         // console.log("-------------"+value);
        //         $(this).prop('checked', true);
        //         if (type == 'other') {
        //             // Attach Other
        //             attachOtherManager.text = vendorData.ATTACH_OTHER || '-';
        //         }
        //     }
        // });
    }
}

$(document).on('select2:select', '.country', async function (e) {
    countryManager.change(e);
});

$(document).on('select2:select', '.province', async function (e) {
    provinceManager.change(e);
    const selectedProvinceId = provinceManager.getValue('PROVINCE_SELECT');
    const filteredDistricts = districtData.filter(
        (d) => d.province_id == selectedProvinceId,
    );

    const districtOptions = filteredDistricts.map((d) => ({
        id: d.id,
        value: d.value,
        text: d.text,
        nameth: d.nameth,
    }));

    districtOptions.unshift({
        id: '',
        value: '',
        text: '-- Select District --', // หรือใส่เป็นค่าว่าง "" ก็ได้
        nameth: '',
    });

    districtManager.select.empty().trigger('change');
    await districtManager.init(districtOptions);
});

$(document).on('select2:select', '.district', async function (e) {
    districtManager.change(e);
    const selectedDistrictId = districtManager.getValue('DISTRICT_SELECT');
    const filteredSubDistricts = subDistrictData.filter(
        (s) => s.district_id == selectedDistrictId,
    );
    const subDistrictOptions = filteredSubDistricts.map((s) => ({
        id: s.id,
        value: s.value,
        text: s.text,
        nameth: s.nameth,
        district_id: s.district_id,
        postcode: s.postcode,
    }));
    // console.log(subDistrictOptions);
    subDistrictOptions.unshift({
        id: '',
        value: '',
        text: '-- Select Sub-district --', // หรือใส่เป็นค่าว่าง "" ก็ได้
        nameth: '',
        district_id: '',
        postcode: '',
    });

    subDistrictManager.select.empty().trigger('change');
    await subDistrictManager.init(subDistrictOptions);
});

$(document).on('select2:select', '.sub-district', async function (e) {
    subDistrictManager.change(e);
});
