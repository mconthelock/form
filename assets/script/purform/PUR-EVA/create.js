import { dragDropInit } from '@amec/webasset/dragdrop';
import { searchNVFForm } from './data';
import { createTable } from '@amec/webasset/dataTable';
var tableSearch, purformdata, columnPurNVF;
$(document).ready(async function () {
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
    $('.field-local').addClass('hidden');
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
        } else {
            $('#nonpro').addClass('hidden');
        }
    });

    $(document).on('change', '.radio-type', async function () {
        let val = $(this).val();
        if (val === 'Local') {
            $('.field-local').removeClass('hidden');
            $('.field-oversea').addClass('hidden');
        } else {
            $('.field-local').addClass('hidden');
            $('.field-oversea').removeClass('hidden');
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
        $('input[name="COMNAME"]').val(rowData.LISTS[0].COMNAME);

        $('#searchModal')[0].close();
    });
});

function setVendorInfo(vendorData) {}
