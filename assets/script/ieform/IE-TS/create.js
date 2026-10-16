import { webflowSubmit } from '@amec/webasset/components/form';
import { createTable } from '@amec/webasset/dataTable';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import { getTsAdjustData } from './data';
import { showLoader } from '@amec/webasset/preloader';

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
            currentTP.toFixed(4), // [6]
            currentTC.toFixed(4), // [7]
            currentTS.toFixed(4), // [8]
            afterTP.toFixed(4), // [9]
            afterTC.toFixed(4), // [10]
            afterTS.toFixed(4), // [11]
            totalReq.toFixed(4), // [12]
            '-', // [13] Date/Remarks
            'parent', // [14] ซ่อนไว้เพื่อใช้เช็คประเภทแถวตอนจัด CSS
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
                // 💡 แก้ไข inputAfterTP
                const inputAfterTP = `<input type="number" step="0.0001"
    class="w-[85px] block mx-auto text-center py-1 px-2 text-amber-950 font-medium bg-white border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 hover:border-amber-400 input-after-tp"
    value="${pAfterTP.toFixed(4)}" data-qty="${qty}" data-pts="${pTS}">`;

                // 💡 แก้ไข inputAfterTC
                const inputAfterTC = `<input type="number" step="0.0001"
    class="w-[85px] block mx-auto text-center py-1 px-2 text-amber-950 font-medium bg-white border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 hover:border-amber-400 input-after-tc"
    value="${pAfterTC.toFixed(4)}" data-qty="${qty}" data-pts="${pTS}">`;

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
                    pTP.toFixed(4), // [6]
                    pTC.toFixed(4), // [7]
                    pTS.toFixed(4), // [8]
                    inputAfterTP, // [9] กลายเป็นช่องกรอก
                    inputAfterTC, // [10] กลายเป็นช่องกรอก
                    spanAfterTS, // [11] ผลลัพธ์
                    spanTotalReq, // [12] ผลลัพธ์
                    '-', // [13]
                    'child', // [14] ตัวบอกว่าเป็นแถวย่อย
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
        // const currentRowCount = tsTableInstance.rows().count();
        // const tableData = transformDataForTable(rawData, currentRowCount);
        const allCurrentData = tsTableInstance.rows().data().toArray();
        const parentRowsCount = allCurrentData.filter(
            (row) => row[14] === 'parent',
        ).length;
        const tableData = transformDataForTable(rawData, parentRowsCount);

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
                if (data[14] === 'child') {
                    // <--- เปลี่ยนจาก 15 เป็น 14
                    $(row).addClass('text-gray-500 border-t-0 bg-transparent');
                    $('td:eq(5)', row).addClass('text-right text-xs'); // <--- เปลี่ยนจาก 6 เป็น 5
                } else {
                    $(row).addClass(
                        'font-bold bg-white border-b-2 border-gray-200',
                    );
                }
            },
            columns: Array(14).fill({ defaultContent: '-' }),
            columnDefs: [
                { targets: 8, className: 'bg-[#d9d9d9] text-center border-r' }, // จาก 9 เป็น 8
                { targets: [9, 10], className: 'bg-[#ffffe6] text-center' }, // จาก 10,11 เป็น 9,10
                { targets: 11, className: 'bg-[#ffff99] text-center border-r' }, // จาก 12 เป็น 11
                {
                    targets: 12, // จาก 13 เป็น 12
                    className:
                        'bg-[#ffe6e6] text-red-600 font-bold text-center border-r',
                },
                { targets: [0, 4, 5, 13], className: 'text-center' }, // จาก [0,4,5,6,14] เป็น [0,4,5,13]
            ],
            drawCallback: function (settings) {
                const api = this.api();
                const allData = api.rows({ page: 'current' }).data().toArray();

                const parentRows = allData.filter(
                    (row) => row[14] === 'parent',
                );

                const sumCurrentTS = parentRows.reduce(
                    (sum, row) => sum + parseFloat(row[8] || 0),
                    0,
                );
                const sumAfterTS = parentRows.reduce(
                    (sum, row) => sum + parseFloat(row[11] || 0),
                    0,
                );
                const sumTotal = parentRows.reduce(
                    (sum, row) => sum + parseFloat(row[12] || 0),
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

function packDataForSave() {
    if (!tsTableInstance) {
        showMessage('Not have Data', 'warning');
        return;
    }

    const dataToSave = [];

    // ตัวแปรสำหรับจดจำข้อมูลของแถวหลัก (Parent) เพื่อเอาไปแปะให้แถวย่อย (Child)
    let currentParentData = {};

    // วนลูปทุกแถวจากบนลงล่าง
    tsTableInstance.rows().every(function () {
        const data = this.data();
        const node = this.node();

        // 1. ถ้าเจอแถว 'parent' ให้จดจำข้อมูลหลักไว้
        if (data[14] === 'parent') {
            currentParentData = {
                partName: data[1], // Part Name
                item: data[2], // ITEM
                dwg: data[3], // DWG
                qty: data[4], // QTY
            };
        }
        // 2. ถ้าเจอแถว 'child' ให้ดึงข้อมูล process และ textbox มารวมกับ parent
        else if (data[14] === 'child') {
            let tpAfter =
                $(node).find('td:eq(9) input').val() ||
                $(node).find('td:eq(9)').text().trim() ||
                data[9];
            let tcAfter =
                $(node).find('td:eq(10) input').val() ||
                $(node).find('td:eq(10)').text().trim() ||
                data[10];
            if (data[6] != tpAfter || data[7] != tcAfter) {
                const rowData = {
                    // ดึงข้อมูลหลักจากตัวแปร currentParentData ที่จำไว้
                    partName: currentParentData.partName,
                    item: currentParentData.item,
                    dwg: currentParentData.dwg,
                    qty: currentParentData.qty,
                    process: data[5],
                    tpBefore: data[6],
                    tcBefore: data[7],
                    tpAfter: tpAfter,
                    tcAfter: tcAfter,
                };

                dataToSave.push(rowData);
            }
        }
    });

    console.log('Data to save:', dataToSave);
    return dataToSave;
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
            no, // [0]
            `PART NAME TEST EXAM ${no}`, // [1]
            'XXX', // [2]
            dwgNo, // [3]
            'X', // [4]
            'K', // [5]
            // '-', <--- ลบบรรทัดนี้ออก (Rev)
            '0.0500', // [6]
            '0.2500', // [7]
            currentTS, // [8]
            '0.0500', // [9]
            '0.3000', // [10]
            afterTS, // [11]
            totalReq, // [12]
            no === 3 ? '20-Feb-26' : '-', // [13]
            'parent', // [14] (แนะนำให้ใส่ flag เข้าไปด้วยเพื่อให้ drawCallback ใน init ทำงานถูกถ้าใช้ filter)
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
        columns: Array(14).fill({ defaultContent: '-' }),
        // กำหนดสีพื้นหลังให้แต่ละคอลัมน์ด้วย Tailwind CSS
        columnDefs: [
            { targets: 8, className: 'bg-[#d9d9d9] text-center border-r' }, // จาก 9 เป็น 8
            { targets: [9, 10], className: 'bg-[#ffffe6] text-center' }, // จาก 10,11 เป็น 9,10
            { targets: 11, className: 'bg-[#ffff99] text-center border-r' }, // จาก 12 เป็น 11
            {
                targets: 12,
                className:
                    'bg-[#ffe6e6] text-red-600 font-bold text-center border-r',
            }, // จาก 13 เป็น 12
            { targets: [0, 4, 5, 13], className: 'text-center' }, // จาก [0,4,5,6,14] เป็น [0,4,5,13]
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
                .column(8, { page: 'current' })
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);
            const sumAfterTS = api
                .column(11, { page: 'current' })
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);
            const sumTotal = api
                .column(12, { page: 'current' })
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
$(document).on('click', '.btnact', async function () {
    const act = $(this).val();
    console.log(act);
    const dwgData = await packDataForSave();
    console.log(dwgData);
});

$(document).on('click', '#btnAdd', async function () {
    console.log('ADD');
    try {
        showLoader({ show: true });
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
                    let paddedI = String(i).padStart(2, '0');
                    dwgList.push(`${baseString} L${paddedI}`);
                }
            } else if (!isNaN(startL)) {
                // กรณีมีแค่ L1 ตัวเดียว
                let paddedStartL = String(startL).padStart(2, '0');
                dwgList.push(`${baseString} L${paddedStartL}`);
            } else {
                // เผื่อกรณีพิมพ์ L1 แปลกๆ
                dwgList.push(`${baseString} ${l1Str}`);
            }
        } else {
            // *** กรณีไม่มีการกรอก L เลย ระบบจะส่งคำค้นหาเท่าที่มีเข้า Array ทันที ***
            dwgList.push(baseString);
        }
        let res = await getTsAdjustData({
            month: month,
            dwgNo: dwgList,
        });
        if (res && res.length > 0) {
            // 💡 --- เริ่มส่วนตรวจสอบข้อมูลซ้ำ ---
            if (tsTableInstance) {
                // 1. ดึงข้อมูลทั้งหมดในตารางปัจจุบัน
                const allData = tsTableInstance.rows().data().toArray();

                // 2. ดึงเฉพาะชื่อ DWG ที่มีอยู่แล้ว (คอลัมน์ที่ 4 -> Index 3 ของแถว parent)
                const existingDwgs = allData
                    .filter((row) => row[14] === 'parent')
                    .map((row) => (row[3] ? row[3].trim() : ''));

                // 3. กรองเอาเฉพาะข้อมูลจาก API ที่ยังไม่มีในตาราง
                const newRecords = res.filter((item) => {
                    const itemDwg = item.F01R04 ? item.F01R04.trim() : '';
                    return !existingDwgs.includes(itemDwg);
                });

                // 4. เช็คผลลัพธ์หลังกรอง
                if (newRecords.length === 0) {
                    showMessage(
                        'This DWG No. is already in the table.',
                        'warning',
                    );
                    return; // หยุดการทำงาน ไม่เพิ่มลงตาราง
                } else if (newRecords.length < res.length) {
                    // ถ้ารายการมีทั้งตัวเก่าและตัวใหม่ปนกัน
                    showMessage(
                        'Some DWG Nos. already exist. Only new items will be added.',
                        'warning',
                    );
                }

                // 5. เอาเฉพาะรายการใหม่ไปอัปเดตตาราง
                res = newRecords;
            }
            await updateOrCreateTable(res);
            $('#dwgNo').val('');
            $('#gNo').val('');
            $('#l1No').val('');
            $('#l2No').val('');
        } else {
            showMessage('Dwg No. not found.', 'warning');
        }
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
    } finally {
        showLoader({ show: false });
    }
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

// ดักจับ Event เมื่อมีการพิมพ์หรือเปลี่ยนตัวเลขในช่อง TP หรือ TC
$(document).on('input', '.input-after-tp, .input-after-tc', function () {
    // 1. หาแถวลูก (Child Row) ปัจจุบันที่กำลังพิมพ์อยู่
    const childTr = $(this).closest('tr');

    // ดึงค่า QTY และ PTS เดิมของบรรทัดนี้ (ที่ฝังไว้ใน data-attribute ตอนสร้าง Input)
    const qty = parseFloat($(this).data('qty')) || 0;
    const pts = parseFloat($(this).data('pts')) || 0;

    // ดึงตัวเลขล่าสุดที่ผู้ใช้กำลังพิมพ์อยู่
    const newTP = parseFloat(childTr.find('.input-after-tp').val()) || 0;
    const newTC = parseFloat(childTr.find('.input-after-tc').val()) || 0;

    // คำนวณ TS และ Total Request ของแถวลูกใหม่ ( TS = TP + (QTY * TC) )
    const newAfterTS = newTP + qty * newTC;
    const newTotalReq = newAfterTS - pts;

    // 2. อัปเดตตัวเลขหน้าจอในแถวลูกทันที
    childTr.find('.span-after-ts').text(newAfterTS.toFixed(4));

    const spanReq = childTr.find('.span-total-req');
    spanReq.text(newTotalReq.toFixed(4));
    // ถ้า Total Request ไม่เป็น 0 ให้ทำตัวหนาสีแดง
    if (newTotalReq !== 0) {
        spanReq.addClass('text-red-600 font-bold');
    } else {
        spanReq.removeClass('text-red-600 font-bold');
    }

    // 3. หาแถวหลัก (Parent Row) ของกลุ่ม Process นี้ เพื่ออัปเดตยอดรวมระดับ Item
    // โดยถอยกลับไปเรื่อยๆ จนกว่าจะเจอแถวที่คอลัมน์แรก (NO.) ไม่เป็นค่าว่าง
    let parentTr = childTr.prev();
    while (
        parentTr.length > 0 &&
        parentTr.find('td:eq(0)').text().trim() === ''
    ) {
        parentTr = parentTr.prev();
    }

    if (parentTr.length > 0 && tsTableInstance) {
        const parentRow = tsTableInstance.row(parentTr);
        const parentData = parentRow.data();

        // วนลูปบวกผลรวม TP, TC จากแถวลูกทุกๆ แถวที่อยู่ใต้ Parent นี้
        let sumTP = 0,
            sumTC = 0;
        let nextTr = parentTr.next();

        while (
            nextTr.length > 0 &&
            nextTr.find('td:eq(0)').text().trim() === ''
        ) {
            sumTP += parseFloat(nextTr.find('.input-after-tp').val()) || 0;
            sumTC += parseFloat(nextTr.find('.input-after-tc').val()) || 0;
            nextTr = nextTr.next();
        }

        const parentQty = parseFloat(parentData[4]) || 0; // Index 4 คือ Q'ty
        const parentCurrentTS = parseFloat(parentData[8]) || 0; // Index 8 คือ Current TS

        // คำนวณยอด Parent TS แบบใหม่
        const parentAfterTS = sumTP + parentQty * sumTC;
        const parentTotalReq = parentAfterTS - parentCurrentTS;

        // อัปเดตตัวเลขขึ้นบนจอของแถว Parent (Index 9, 10, 11, 12)
        parentTr.find('td:eq(9)').text(sumTP.toFixed(4));
        parentTr.find('td:eq(10)').text(sumTC.toFixed(4));
        parentTr.find('td:eq(11)').text(parentAfterTS.toFixed(4));
        parentTr.find('td:eq(12)').text(parentTotalReq.toFixed(4));

        // สำคัญ: อัปเดตข้อมูลเบื้องหลัง (Array) ของ DataTables
        // เพื่อให้ฟังก์ชัน drawCallback มีข้อมูลล่าสุดไว้ใช้คำนวณ Grand Total รวมด้านบนสุด
        parentData[9] = sumTP.toFixed(4);
        parentData[10] = sumTC.toFixed(4);
        parentData[11] = parentAfterTS.toFixed(4);
        parentData[12] = parentTotalReq.toFixed(4);
    }

    // 4. คำนวณ Grand Total (แถว Sum ด้านบนสุดของตาราง) ใหม่ทันที
    let sumGrandAfterTS = 0;
    let sumGrandTotalReq = 0;

    // วนลูปเฉพาะข้อมูลที่เป็น 'parent' เพื่อหายอดรวมทั้งหมด
    if (tsTableInstance) {
        const allData = tsTableInstance.rows().data().toArray();
        allData.forEach((row) => {
            if (row[14] === 'parent') {
                // Index 14 คือตัวเช็ค flag
                sumGrandAfterTS += parseFloat(row[11] || 0); // Index 11 คือ After TS
                sumGrandTotalReq += parseFloat(row[12] || 0); // Index 12 คือ Total Req
            }
        });
    }

    // อัปเดตยอดรวมสูงสุด (ช่อง Badge สีเหลืองและสีแดง)
    document.getElementById('sum-after-ts').innerHTML =
        sumGrandAfterTS.toFixed(4);

    const totalPrefix =
        sumGrandTotalReq > 0 ? '+ ' : sumGrandTotalReq < 0 ? '- ' : '';
    document.getElementById('sum-total').innerHTML =
        totalPrefix + Math.abs(sumGrandTotalReq).toFixed(4);
});
