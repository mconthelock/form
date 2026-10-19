import { webflowSubmit } from '@amec/webasset/components/form';
import { createTable } from '@amec/webasset/dataTable';
import {
    showConfirm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import { getTsAdjustData } from './data';
import { showLoader } from '@amec/webasset/preloader';

let tsTableInstance = null;

// 💡 สร้าง HTML ปุ่มลบเตรียมไว้ (ไอคอนถังขยะ)
const btnDeleteHTML = `<button type="button" class="btn-delete text-red-500 hover:text-red-700 transition" title="Delete">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
</button>`;

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
            btnDeleteHTML, // [14] 💡 คอลัมน์ Action
            'parent', // [15] 💡 ซ่อนไว้เพื่อใช้เช็คประเภทแถวตอนจัด CSS
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
                const inputAfterTP = `<input type="number" step="0.0001"
    class="w-[85px] block mx-auto text-center py-1 px-2 text-amber-950 font-medium bg-white border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 hover:border-amber-400 input-after-tp"
    value="${pAfterTP.toFixed(4)}" data-qty="${qty}" data-pts="${pTS}">`;

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
                    process.F02R03 ? process.F02R03.trim() : '-', // [5]
                    pTP.toFixed(4), // [6]
                    pTC.toFixed(4), // [7]
                    pTS.toFixed(4), // [8]
                    inputAfterTP, // [9]
                    inputAfterTC, // [10]
                    spanAfterTS, // [11]
                    spanTotalReq, // [12]
                    '-', // [13]
                    '', // [14] 💡 ว่างไว้สำหรับแถว Child
                    'child', // [15] 💡 ตัวบอกว่าเป็นแถวย่อย
                ]);
            });
        }
    });

    return flatData;
};

// 2. ฟังก์ชันอัปเดตหรือสร้างตาราง
async function updateOrCreateTable(rawData) {
    if (tsTableInstance) {
        const allCurrentData = tsTableInstance.rows().data().toArray();
        const parentRowsCount = allCurrentData.filter(
            (row) => row[15] === 'parent', // 💡 แก้เป็น 15
        ).length;
        const tableData = transformDataForTable(rawData, parentRowsCount);

        tsTableInstance.rows.add(tableData).draw(false);
    } else {
        const tableData = transformDataForTable(rawData, 0);

        const tableOption = {
            data: tableData,
            searching: false,
            paging: false,
            ordering: false,
            info: false,
            createdRow: function (row, data, dataIndex) {
                if (data[15] === 'child') {
                    // 💡 แก้เป็น 15
                    $(row).addClass('text-gray-500 border-t-0 bg-transparent');
                    $('td:eq(5)', row).addClass('text-right text-xs');
                } else {
                    $(row).addClass(
                        'font-bold bg-white border-b-2 border-gray-200',
                    );
                }
            },
            columns: Array(15).fill({ defaultContent: '-' }), // 💡 เปลี่ยนเป็น 15
            columnDefs: [
                { targets: 8, className: 'bg-[#d9d9d9] text-center border-r' },
                { targets: [9, 10], className: 'bg-[#ffffe6] text-center' },
                { targets: 11, className: 'bg-[#ffff99] text-center border-r' },
                {
                    targets: 12,
                    className:
                        'bg-[#ffe6e6] text-red-600 font-bold text-center border-r',
                },
                // 💡 เพิ่ม 14 ลงไปเพื่อให้ปุ่มจัดกึ่งกลาง
                { targets: [0, 4, 5, 13, 14], className: 'text-center' },
            ],
            drawCallback: function (settings) {
                const api = this.api();
                const allData = api.rows({ page: 'current' }).data().toArray();

                const parentRows = allData.filter(
                    (row) => row[15] === 'parent', // 💡 แก้เป็น 15
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
            id: 'TsTable',
            domScroll: { status: true, type: 'default', maxHeight: '400px' },
            headerSticky: { status: true },
        };

        tsTableInstance = await createTable(tableOption, setupOpt);
    }
}

function packDataForSave() {
    if (!tsTableInstance) {
        showMessage('Not have Data', 'warning');
        return;
    }

    const dataToSave = [];
    let currentParentData = {};

    tsTableInstance.rows().every(function () {
        const data = this.data();
        const node = this.node();

        if (data[15] === 'parent') {
            // 💡 แก้เป็น 15
            currentParentData = {
                partName: data[1],
                item: data[2],
                dwg: data[3],
                qty: data[4],
            };
        } else if (data[15] === 'child') {
            // 💡 แก้เป็น 15
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
                shorthand: true,
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
            '0.0500', // [6]
            '0.2500', // [7]
            currentTS, // [8]
            '0.0500', // [9]
            '0.3000', // [10]
            afterTS, // [11]
            totalReq, // [12]
            no === 3 ? '20-Feb-26' : '-', // [13]
            btnDeleteHTML, // [14] 💡 เพิ่ม Action ลบ
            'parent', // [15] 💡 เลื่อน flag มาที่ 15
        ];
    });
};

async function initMyTable() {
    const mockData = generateMockData();
    console.log(mockData);

    const tableOption = {
        //data: mockData,
        data: [],
        searching: false,
        paging: false,
        ordering: false,
        info: false,
        columns: Array(15).fill({ defaultContent: '-' }), // 💡 เปลี่ยนเป็น 15
        columnDefs: [
            { targets: 8, className: 'bg-[#d9d9d9] text-center border-r' },
            { targets: [9, 10], className: 'bg-[#ffffe6] text-center' },
            { targets: 11, className: 'bg-[#ffff99] text-center border-r' },
            {
                targets: 12,
                className:
                    'bg-[#ffe6e6] text-red-600 font-bold text-center border-r',
            },
            // 💡 เพิ่ม 14 จัดปุ่มกึ่งกลาง
            { targets: [0, 4, 5, 13, 14], className: 'text-center' },
        ],
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

            document.getElementById('sum-current-ts').innerHTML =
                sumCurrentTS.toFixed(4);
            document.getElementById('sum-after-ts').innerHTML =
                sumAfterTS.toFixed(4);

            const totalPrefix = sumTotal > 0 ? '+ ' : sumTotal < 0 ? '- ' : '';
            document.getElementById('sum-total').innerHTML =
                totalPrefix + Math.abs(sumTotal).toFixed(4);
        },
    };

    const setupOpt = {
        id: 'TsTable',
        domScroll: {
            status: true,
            type: 'default',
            maxHeight: '400px',
        },
        headerSticky: {
            status: true,
        },
    };

    const myTable = await createTable(tableOption, setupOpt);
    return myTable;
}

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
            let startL = parseInt(l1Str.replace(/\D/g, ''));
            let endL = l2Str ? parseInt(l2Str.replace(/\D/g, '')) : null;

            if (endL && endL >= startL) {
                for (let i = startL; i <= endL; i++) {
                    let paddedI = String(i).padStart(2, '0');
                    dwgList.push(`${baseString} L${paddedI}`);
                }
            } else if (!isNaN(startL)) {
                let paddedStartL = String(startL).padStart(2, '0');
                dwgList.push(`${baseString} L${paddedStartL}`);
            } else {
                dwgList.push(`${baseString} ${l1Str}`);
            }
        } else {
            dwgList.push(baseString);
        }
        let res = await getTsAdjustData({
            month: month,
            dwgNo: dwgList,
        });
        if (res && res.length > 0) {
            if (tsTableInstance) {
                const allData = tsTableInstance.rows().data().toArray();

                const existingDwgs = allData
                    .filter((row) => row[15] === 'parent') // 💡 แก้เป็น 15
                    .map((row) => (row[3] ? row[3].trim() : ''));

                const newRecords = res.filter((item) => {
                    const itemDwg = item.F01R04 ? item.F01R04.trim() : '';
                    return !existingDwgs.includes(itemDwg);
                });

                if (newRecords.length === 0) {
                    showMessage(
                        'This DWG No. is already in the table.',
                        'warning',
                    );
                    return;
                } else if (newRecords.length < res.length) {
                    showMessage(
                        'Some DWG Nos. already exist. Only new items will be added.',
                        'warning',
                    );
                }

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

$(document).on('paste', '#dwgNo', function (e) {
    e.preventDefault();

    let pastedText = (e.originalEvent || e).clipboardData
        .getData('text/plain')
        .trim();

    let parts = pastedText.split(/\s+/);

    if (parts.length > 0) {
        $(this).val(parts[0]);
    }

    if (parts.length > 1) {
        $('#gNo').val(parts[1]);
    }

    if (parts.length > 2) {
        $('#l1No').val(parts[2]);
        $('#l2No').val('');
    }
});

$(document).on('input', '.input-after-tp, .input-after-tc', function () {
    const childTr = $(this).closest('tr');

    const qty = parseFloat($(this).data('qty')) || 0;
    const pts = parseFloat($(this).data('pts')) || 0;

    const newTP = parseFloat(childTr.find('.input-after-tp').val()) || 0;
    const newTC = parseFloat(childTr.find('.input-after-tc').val()) || 0;

    const newAfterTS = newTP + qty * newTC;
    const newTotalReq = newAfterTS - pts;

    childTr.find('.span-after-ts').text(newAfterTS.toFixed(4));

    const spanReq = childTr.find('.span-total-req');
    spanReq.text(newTotalReq.toFixed(4));
    if (newTotalReq !== 0) {
        spanReq.addClass('text-red-600 font-bold');
    } else {
        spanReq.removeClass('text-red-600 font-bold');
    }

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

        const parentQty = parseFloat(parentData[4]) || 0;
        const parentCurrentTS = parseFloat(parentData[8]) || 0;

        const parentAfterTS = sumTP + parentQty * sumTC;
        const parentTotalReq = parentAfterTS - parentCurrentTS;

        parentTr.find('td:eq(9)').text(sumTP.toFixed(4));
        parentTr.find('td:eq(10)').text(sumTC.toFixed(4));
        parentTr.find('td:eq(11)').text(parentAfterTS.toFixed(4));
        parentTr.find('td:eq(12)').text(parentTotalReq.toFixed(4));

        parentData[9] = sumTP.toFixed(4);
        parentData[10] = sumTC.toFixed(4);
        parentData[11] = parentAfterTS.toFixed(4);
        parentData[12] = parentTotalReq.toFixed(4);
    }

    let sumGrandAfterTS = 0;
    let sumGrandTotalReq = 0;

    if (tsTableInstance) {
        const allData = tsTableInstance.rows().data().toArray();
        allData.forEach((row) => {
            if (row[15] === 'parent') {
                // 💡 แก้เป็น 15
                sumGrandAfterTS += parseFloat(row[11] || 0);
                sumGrandTotalReq += parseFloat(row[12] || 0);
            }
        });
    }

    document.getElementById('sum-after-ts').innerHTML =
        sumGrandAfterTS.toFixed(4);

    const totalPrefix =
        sumGrandTotalReq > 0 ? '+ ' : sumGrandTotalReq < 0 ? '- ' : '';
    document.getElementById('sum-total').innerHTML =
        totalPrefix + Math.abs(sumGrandTotalReq).toFixed(4);
});

// 💡 --------------------------------------------------------
// 💡 เพิ่ม Event สำหรับดักจับการกดปุ่ม "ลบ" (ถังขยะ)
// 💡 --------------------------------------------------------
$(document).on('click', '.btn-delete', async function () {
    if (!tsTableInstance) return;

    const tr = $(this).closest('tr');
    const row = tsTableInstance.row(tr);
    const rowIndex = row.index();
    const allData = tsTableInstance.rows().data();

    // 1. หาแถวแม่ และแถวลูกที่อยู่ข้างใต้เพื่อเตรียมลบออกพร้อมกัน
    const rowsToDelete = [rowIndex];
    for (let i = rowIndex + 1; i < allData.length; i++) {
        if (allData[i][15] === 'child') {
            // เช็คว่าเป็นลูกหรือไม่
            rowsToDelete.push(i);
        } else {
            break; // ถ้าเจอ Parent ตัวถัดไปให้หยุด
        }
    }
    const opt = {
        title: 'Are you sure?',
        message: 'you want to remove this item!', // เปลี่ยนจาก text เป็น message ให้ตรงกับที่เรียกใช้
        acceptText: 'Yes',
        cancelText: 'No',
    };
    const isConfirmed = await showConfirm(opt);
    if (isConfirmed) {
        // ลบแถวออกจาก DataTables
        tsTableInstance.rows(rowsToDelete).remove();

        // 2. รันลำดับเลข No. (คอลัมน์แรก) ใหม่ทั้งหมด
        let currentNo = 1;
        tsTableInstance.rows().every(function () {
            const data = this.data();
            if (data[15] === 'parent') {
                // อัปเดตข้อมูลช่อง index 0 เป็นเลขลำดับใหม่
                tsTableInstance.cell(this.index(), 0).data(currentNo++);
            }
        });

        // 3. วาดตารางใหม่ (ยอดรวม Grand Total ด้านบนจะอัปเดตอัตโนมัติ)
        tsTableInstance.draw(false);
    }
});
