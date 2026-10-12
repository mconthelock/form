import { webflowSubmit } from '@amec/webasset/components/form';
import { createTable } from '@amec/webasset/dataTable';
import { showMessage } from '@amec/webasset/utils';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import { getTsAdjustData } from './data';
let tsTableInstance = null;
const transformDataForTable = (apiData, startIndex = 0) => {
    const flatData = [];

    apiData.forEach((item, index) => {
        const no = startIndex + index + 1;

        const dwgNo = item.F01R04 ? item.F01R04.trim() : '-';
        const name = item.F01R09 ? item.F01R09.trim() : '-';
        const shop = item.F01R03 ? item.F01R03.trim() : '-';
        const qty = item.QTY || 0;

        let currentTP = 0;
        let currentTC = 0;

        // 1. คำนวณยอดรวมของ Process ทั้งหมดก่อน
        if (item.PROCESS && Array.isArray(item.PROCESS)) {
            item.PROCESS.forEach((process) => {
                currentTP += process.F02R04 || 0;
                currentTC += process.F02R05 || 0;
            });
        }

        const currentTS = currentTP + qty * currentTC;
        const afterTP = currentTP;
        const afterTC = currentTC;
        const afterTS = afterTP + qty * afterTC;
        const totalReq = afterTS - currentTS;

        // 2. สร้างแถวหลัก (Parent Row) ใส่เข้าไปก่อน
        flatData.push([
            no, // [0] No
            name, // [1] PART NAME
            shop, // [2] Shop/Section
            dwgNo, // [3] DWG No
            qty, // [4] QTY
            '', // [5]
            'K', // [6] (ตรงตำแหน่งเดียวกับชื่อ Process)
            currentTP.toFixed(4), // [7]
            currentTC.toFixed(4), // [8]
            currentTS.toFixed(4), // [9]
            afterTP.toFixed(4), // [10]
            afterTC.toFixed(4), // [11]
            afterTS.toFixed(4), // [12]
            totalReq.toFixed(4), // [13]
            '-', // [14] Date/Remarks
            'parent', // [15] ซ่อนไว้เพื่อใช้เช็คประเภทแถวตอนจัด CSS
        ]);

        // 3. วนลูปสร้างแถวย่อย (Child Row) สำหรับแต่ละ Process
        if (item.PROCESS && Array.isArray(item.PROCESS)) {
            item.PROCESS.forEach((process) => {
                const pTP = process.F02R04 || 0;
                const pTC = process.F02R05 || 0;

                // คำนวณค่าเริ่มต้น
                const pTS = pTP + qty * pTC;
                const pAfterTP = pTP;
                const pAfterTC = pTC;
                const pAfterTS = pAfterTP + qty * pAfterTC;
                const pTotalReq = pAfterTS - pTS;

                // สร้าง Input HTML (จัด Style ด้วย Tailwind)
                const inputAfterTP = `<input type="number" step="0.0001" class="w-full text-center border border-gray-300 rounded px-1 input-after-tp bg-white" value="${pAfterTP.toFixed(4)}" data-qty="${qty}" data-pts="${pTS}">`;
                const inputAfterTC = `<input type="number" step="0.0001" class="w-full text-center border border-gray-300 rounded px-1 input-after-tc bg-white" value="${pAfterTC.toFixed(4)}" data-qty="${qty}" data-pts="${pTS}">`;

                // สร้าง Span สำหรับแสดงผลลัพธ์ที่คำนวณอัตโนมัติ
                const spanAfterTS = `<span class="span-after-ts">${pAfterTS.toFixed(4)}</span>`;
                const spanTotalReq = `<span class="span-total-req ${pTotalReq !== 0 ? 'text-red-600 font-bold' : ''}">${pTotalReq.toFixed(4)}</span>`;

                flatData.push([
                    '', // [0]
                    '', // [1]
                    '', // [2]
                    '', // [3]
                    '', // [4]
                    process.F02R03 ? process.F02R03.trim() : '-', // [5] เปลี่ยน index ตรงนี้ให้ตรงกับ DataTables ของคุณ
                    '', // [6]
                    pTP.toFixed(4), // [7]
                    pTC.toFixed(4), // [8]
                    pTS.toFixed(4), // [9]
                    inputAfterTP, // [10] กลายเป็นช่องกรอก
                    inputAfterTC, // [11] กลายเป็นช่องกรอก
                    spanAfterTS, // [12] ผลลัพธ์
                    spanTotalReq, // [13] ผลลัพธ์
                    '-', // [14]
                    'child', // [15] ตัวบอกว่าเป็นแถวย่อย
                ]);
            });
        }
    });

    return flatData;
};

// 2. ฟังก์ชันอัปเดตหรือสร้างตาราง
async function updateOrCreateTable(rawData) {
    if (tsTableInstance) {
        // --- กรณีที่ 1: มีตารางอยู่แล้ว (กด Add ตัวที่ 2, 3...) ---
        // นับจำนวนแถวเดิมก่อน เพื่อส่งไปให้ฟังก์ชันแปลงข้อมูลรันเลข No. ต่อ
        const currentRowCount = tsTableInstance.rows().count();
        const tableData = transformDataForTable(rawData, currentRowCount);

        // เอาข้อมูลใหม่ต่อท้าย แล้วสั่งวาดตารางใหม่ (ยอดรวมด้านบนจะอัปเดตเองอัตโนมัติ)
        tsTableInstance.rows.add(tableData).draw(false);
    } else {
        // --- กรณีที่ 2: เพิ่งกด Add ครั้งแรก (ยังไม่มีตาราง) ---
        const tableData = transformDataForTable(rawData, 0);

        const tableOption = {
            data: tableData,
            searching: false,
            paging: false,
            ordering: false,
            info: false,
            createdRow: function (row, data, dataIndex) {
                // เช็คจากคอลัมน์ที่ 15 ที่เราแอบใส่คำว่า parent/child ไว้
                if (data[15] === 'child') {
                    // ถ้าเป็นแถว Process: ลบเส้นขอบบน, เปลี่ยนสีตัวหนังสือให้ดูจางลง
                    $(row).addClass('text-gray-500 border-t-0 bg-transparent');
                    // จัดตัวหนังสือคอลัมน์ Process Name ให้อยู่ชิดขวาหรือรูปแบบตามต้องการ
                    $('td:eq(6)', row).addClass('text-right text-xs');
                } else {
                    // ถ้าเป็นแถวหลัก: ทำตัวหนา
                    $(row).addClass(
                        'font-bold bg-white border-b-2 border-gray-200',
                    );
                }
            },
            columns: Array(15).fill({ defaultContent: '-' }),
            columnDefs: [
                { targets: 9, className: 'bg-[#d9d9d9] text-center border-r' },
                { targets: [10, 11], className: 'bg-[#ffffe6] text-center' },
                { targets: 12, className: 'bg-[#ffff99] text-center border-r' },
                {
                    targets: 13,
                    className:
                        'bg-[#ffe6e6] text-red-600 font-bold text-center border-r',
                },
                { targets: [0, 4, 5, 6, 14], className: 'text-center' },
            ],
            drawCallback: function (settings) {
                const api = this.api();
                const allData = api.rows({ page: 'current' }).data().toArray();

                // กรองเอาเฉพาะ "แถวหลัก" มาบวกเลข (ป้องกันยอดเบิ้ล)
                const parentRows = allData.filter(
                    (row) => row[15] === 'parent',
                );

                const sumCurrentTS = parentRows.reduce(
                    (sum, row) => sum + parseFloat(row[9] || 0),
                    0,
                );
                const sumAfterTS = parentRows.reduce(
                    (sum, row) => sum + parseFloat(row[12] || 0),
                    0,
                );
                const sumTotal = parentRows.reduce(
                    (sum, row) => sum + parseFloat(row[13] || 0),
                    0,
                );

                document.getElementById('sum-current-ts').innerHTML =
                    sumCurrentTS.toFixed(4);
                document.getElementById('sum-after-ts').innerHTML =
                    sumAfterTS.toFixed(4);

                const totalPrefix =
                    sumTotal > 0 ? '+ ' : sumTotal < 0 ? '- ' : '';
                document.getElementById('sum-total').innerHTML =
                    totalPrefix + Math.abs(sumTotal).toFixed(4);
            },
        };

        const setupOpt = {
            id: 'TsTable', // ต้องตรงกับ ID ของ <table id="TsTable"> ใน HTML
            domScroll: { status: true, type: 'default', maxHeight: '400px' },
            headerSticky: { status: true },
        };

        // สร้างตารางและเก็บ instance ไว้
        tsTableInstance = await createTable(tableOption, setupOpt);
    }
}
$(document).ready(async function () {
    flatpickr('#jun', {
        dateFormat: 'm/Y',
        defaultDate: $('#jun').val() || 'today',
        minDate: 'today',
        plugins: [
            new monthSelectPlugin({
                shorthand: true, // ใช้ชื่อเดือนย่อ (Jan, Feb)
                dateFormat: 'Y/m',
                altFormat: 'Y/m',
            }),
        ],
    });
    await initMyTable();
});

const generateMockData = () => {
    return Array.from({ length: 30 }, (_, i) => {
        const no = i + 1;

        // จำลองรหัส DWG ให้ครบ 19 ตัวอักษร (เช่น DWG-000000000000001)
        // "DWG-" มี 4 ตัวอักษร + ตัวเลขอีก 15 ตัว = 19 ตัวอักษร
        const dwgNo = `DWG-${String(no).padStart(15, '0')}`;

        const currentTS = (0.3 + i * 0.01).toFixed(4);
        const afterTS = (0.35 + i * 0.01).toFixed(4);
        const totalReq = (parseFloat(afterTS) - parseFloat(currentTS)).toFixed(
            4,
        );

        return [
            no,
            `PART NAME TEST EXAM ${no}`,
            'XXX',
            dwgNo, // <--- ใส่รหัส DWG 19 ตัวอักษรตรงนี้
            'X',
            'K',
            '-',
            '0.0500',
            '0.2500',
            currentTS,
            '0.0500',
            '0.3000',
            afterTS,
            totalReq,
            no === 3 ? '20-Feb-26' : '-',
        ];
    });
};

async function initMyTable() {
    const mockData = generateMockData();
    console.log(mockData);

    // 1. กำหนด Option ของ DataTables
    const tableOption = {
        // ตัวอย่างโครงสร้างข้อมูล (คุณสามารถเปลี่ยนไปใช้ ajax ได้)
        //data: mockData,
        data: [],
        searching: false,
        paging: false, // ปิดแบ่งหน้าเพื่อเน้น scroll
        ordering: false, // ปิดการเรียงลำดับ
        info: false,
        columns: Array(15).fill({ defaultContent: '-' }),
        // กำหนดสีพื้นหลังให้แต่ละคอลัมน์ด้วย Tailwind CSS
        columnDefs: [
            // Current TS (คอลัมน์ที่ 10 - index 9)
            { targets: 9, className: 'bg-[#d9d9d9] text-center border-r' },

            // After TP, TC (คอลัมน์ที่ 11, 12 - index 10, 11)
            { targets: [10, 11], className: 'bg-[#ffffe6] text-center' },

            // After TS (คอลัมน์ที่ 13 - index 12)
            { targets: 12, className: 'bg-[#ffff99] text-center border-r' },

            // Total Request (คอลัมน์ที่ 14 - index 13)
            {
                targets: 13,
                className:
                    'bg-[#ffe6e6] text-red-600 font-bold text-center border-r',
            },

            // จัดกึ่งกลางคอลัมน์อื่นๆ ที่ต้องการ
            { targets: [0, 4, 5, 6, 14], className: 'text-center' },
        ],
        // คำนวณยอดรวมทุกครั้งที่มีการวาดตาราง (เช่น โหลดครั้งแรก หรือค้นหาข้อมูล)
        drawCallback: function (settings) {
            const api = this.api();
            const intVal = function (i) {
                return typeof i === 'string'
                    ? i.replace(/[\$,]/g, '') * 1
                    : typeof i === 'number'
                      ? i
                      : 0;
            };

            const sumCurrentTS = api
                .column(9, { page: 'current' })
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);
            const sumAfterTS = api
                .column(12, { page: 'current' })
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);
            const sumTotal = api
                .column(13, { page: 'current' })
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);

            // เปลี่ยนจาก .toFixed(2) เป็น .toFixed(4)
            document.getElementById('sum-current-ts').innerHTML =
                sumCurrentTS.toFixed(4);
            document.getElementById('sum-after-ts').innerHTML =
                sumAfterTS.toFixed(4);

            const totalPrefix = sumTotal > 0 ? '+ ' : sumTotal < 0 ? '- ' : '';
            document.getElementById('sum-total').innerHTML =
                totalPrefix + Math.abs(sumTotal).toFixed(4);
        },
    };

    // 2. กำหนด Setup Option สำหรับฟังก์ชัน createTable ของคุณ
    const setupOpt = {
        id: 'TsTable', // ตรงกับ ID ใน HTML

        // เปิดใช้งาน Scroll แนวตั้ง
        domScroll: {
            status: true,
            type: 'default', // หรือ 'tailwind4' ตามที่คุณเซ็ตไว้
            maxHeight: '400px', // ปรับความสูงได้ตามต้องการ
        },

        // เปิดใช้งาน Sticky Header (แถว Sum จะติดไปด้วยเพราะอยู่ใน <thead>)
        headerSticky: {
            status: true,
        },
    };

    // 3. เรียกสร้างตาราง
    const myTable = await createTable(tableOption, setupOpt);
    return myTable;
}

// เรียกใช้งานเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    initMyTable();
});

$(document).on('click', '#btnAdd', async function () {
    console.log('ADD');
    let rawMonth = $('#jun').val();
    let month = rawMonth ? rawMonth.replace('/', '') : '';

    let baseDwg = $('#dwgNo').val().trim();
    let gNo = $('#gNo').val().trim();
    let l1Str = $('#l1No').val().trim();
    let l2Str = $('#l2No').val().trim();

    if (!baseDwg) {
        showMessage('Please enter Drawing No.', 'warning');
        return;
    }
    let dwgList = [];
    let baseString = baseDwg;
    if (gNo) {
        baseString += ` ${gNo}`;
    }
    if (l1Str) {
        // ดึงเฉพาะตัวเลขออกมา
        let startL = parseInt(l1Str.replace(/\D/g, ''));
        let endL = l2Str ? parseInt(l2Str.replace(/\D/g, '')) : null;

        if (endL && endL >= startL) {
            // กรณีมี L1 ถึง L2 (เช่น L2 - L5)
            for (let i = startL; i <= endL; i++) {
                dwgList.push(`${baseString} L${i}`);
            }
        } else if (!isNaN(startL)) {
            // กรณีมีแค่ L1 ตัวเดียว
            dwgList.push(`${baseString} L${startL}`);
        } else {
            // เผื่อกรณีพิมพ์ L1 แปลกๆ
            dwgList.push(`${baseString} ${l1Str}`);
        }
    } else {
        // *** กรณีไม่มีการกรอก L เลย ระบบจะส่งคำค้นหาเท่าที่มีเข้า Array ทันที ***
        dwgList.push(baseString);
    }
    const res = await getTsAdjustData({
        month: month,
        dwgNo: dwgList,
    });
    if (res && res.length > 0) {
        await updateOrCreateTable(res);
    } else {
        showMessage('Can not this DWG No.', 'warning');
    }
    console.log(res);
});

// ดักจับเหตุการณ์เมื่อมีการ Paste (วางข้อความ) ในช่อง Dwg No.
$(document).on('paste', '#dwgNo', function (e) {
    // 1. หยุดการวางข้อความแบบปกติ (เพื่อไม่ให้มันไปกระจุกอยู่ในช่องแรกช่องเดียว)
    e.preventDefault();

    // 2. ดึงข้อความที่ผู้ใช้ Copy มา (เช่น "BA178A612 G03 L51")
    let pastedText = (e.originalEvent || e).clipboardData
        .getData('text/plain')
        .trim();

    // 3. แยกข้อความด้วยช่องว่าง (Space)
    // ผลลัพธ์จะได้เป็น Array: ["BA178A612", "G03", "L51"]
    let parts = pastedText.split(/\s+/);

    // 4. นำค่าที่แยกได้ไปใส่ตามช่องต่างๆ อัตโนมัติ
    if (parts.length > 0) {
        $(this).val(parts[0]); // ใส่ช่อง Dwg No. (เช่น BA178A612)
    }

    if (parts.length > 1) {
        $('#gNo').val(parts[1]); // ใส่ช่อง G no. (เช่น G03)
    }

    if (parts.length > 2) {
        // ถ้าข้อความที่ Copy มามีช่อง L ด้วย ก็ให้เอามาใส่ช่อง L1
        $('#l1No').val(parts[2]); // ใส่ช่อง L no. เริ่มต้น (เช่น L51)

        // เคลียร์ค่าช่อง L2 เผื่อไว้ (กรณีผู้ใช้เคยวางอันอื่นไว้ก่อนหน้า)
        $('#l2No').val('');
    }
});
