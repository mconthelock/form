import { webflowSubmit } from '@amec/webasset/components/form';
import { createTable } from '@amec/webasset/dataTable';
import { showMessage } from '@amec/webasset/utils';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import { getTsAdjustData } from './data';

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
