import { createTable } from '@amec/webasset/dataTable';
import {
    getAllAttr,
    showConfirm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import { create, getData, getOrgMfg, getTsAdjustData, update } from './data';
import { showLoader } from '@amec/webasset/preloader';
import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';
import { getUser } from '@amec/webasset/api/amec';
import { redirectWebflow } from '@amec/webasset/form';

select2();
let form = {};
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
        const history = item.HISTORY || '-';

        let currentTP = 0;
        let currentTC = 0;
        let afterTP = 0;
        let afterTC = 0;

        if (item.PROCESS && Array.isArray(item.PROCESS)) {
            item.PROCESS.forEach((process) => {
                currentTP += process.F02R04 || 0;
                currentTC += process.F02R05 || 0;

                // 💡 รวมยอด After โดยเช็คว่ามีค่าส่งมาหรือไม่
                afterTP +=
                    process.AF_TP !== undefined
                        ? process.AF_TP
                        : process.F02R04 || 0;
                afterTC +=
                    process.AF_TC !== undefined
                        ? process.AF_TC
                        : process.F02R05 || 0;
            });
        }

        const currentTS = currentTP + qty * currentTC;
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
            history, // [13] Date/Remarks
            btnDeleteHTML, // [14] 💡 คอลัมน์ Action
            'parent', // [15] 💡 ซ่อนไว้เพื่อใช้เช็คประเภทแถวตอนจัด CSS
        ]);

        // 3. วนลูปสร้างแถวย่อย (Child Row) สำหรับแต่ละ Process
        if (item.PROCESS && Array.isArray(item.PROCESS)) {
            item.PROCESS.forEach((process) => {
                const pTP = process.F02R04 || 0;
                const pTC = process.F02R05 || 0;

                const pAfterTP =
                    process.AF_TP !== undefined ? process.AF_TP : pTP;
                const pAfterTC =
                    process.AF_TC !== undefined ? process.AF_TC : pTC;

                // คำนวณค่าเริ่มต้น
                const pTS = pTP + qty * pTC;
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
                    '', // [13]
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
function packDataForSave(actionValue) {
    if (!tsTableInstance) {
        showMessage('Not have Data', 'warning');
        return [];
    }

    const dataToSave = [];

    // ตัวแปรสำหรับพักข้อมูล
    let currentParentData = {};
    let tempChildren = []; // กระเป๋าสำรองเก็บ Child ทุกตัวของ Parent ปัจจุบัน
    let hasChanges = false; // แฟล็กเช็คว่าในกลุ่ม Parent ปัจจุบันมี Child เปลี่ยนแปลงไหม

    // ฟังก์ชันช่วยสำหรับเทข้อมูลจากกระเป๋าสำรองลงตะกร้าจริง
    const flushBuffer = () => {
        // ถ้ามี Child อย่างน้อย 1 ตัวที่มีการเปลี่ยนแปลง ให้เอา Child ทุกตัวที่พักไว้เข้า dataToSave
        if (hasChanges && tempChildren.length > 0) {
            dataToSave.push(...tempChildren);
        }
        // รีเซ็ตกระเป๋าและสถานะ เพื่อเตรียมรับ Parent กรุ๊ปต่อไป
        tempChildren = [];
        hasChanges = false;
    };

    tsTableInstance.rows().every(function () {
        const data = this.data();
        const node = this.node();

        if (data[15] === 'parent') {
            // 1. ก่อนจะเริ่ม Parent ใหม่ ต้องเคลียร์ข้อมูล Parent เก่าที่พักไว้ก่อน
            flushBuffer();

            // 2. เก็บข้อมูล Parent ใหม่
            currentParentData = {
                partName: data[1],
                item: data[2],
                dwg: data[3],
                qty: data[4],
            };
        } else if (data[15] === 'child') {
            let tpAfter =
                $(node).find('td:eq(9) input').val() ||
                $(node).find('td:eq(9)').text().trim() ||
                data[9];
            let tcAfter =
                $(node).find('td:eq(10) input').val() ||
                $(node).find('td:eq(10)').text().trim() ||
                data[10];

            // เช็คว่า Child "ตัวนี้" มีการเปลี่ยนแปลงหรือไม่
            if (data[6] != tpAfter || data[7] != tcAfter) {
                hasChanges = true; // พบการเปลี่ยนแปลง เปลี่ยนสถานะเป็น true
            }

            // เก็บ Child "ทุกตัว" (ไม่ว่าจะเปลี่ยนหรือไม่เปลี่ยน) ลงกระเป๋าสำรองไว้ก่อน
            const rowData = {
                PRTNAME: currentParentData.partName,
                ITMNO: currentParentData.item,
                DWGNO: currentParentData.dwg,
                QTY: Number(currentParentData.qty),
                PROCESS: data[5],
                CUR_TP: Number(data[6]),
                CUR_TC: Number(data[7]),
                AF_TP: Number(tpAfter),
                AF_TC: Number(tcAfter),
            };
            tempChildren.push(rowData);
        }
    });

    // 💡 สำคัญมาก: เมื่อวนลูปจบทุกบรรทัดแล้ว ต้องเรียกเคลียร์ข้อมูล Parent กลุ่มสุดท้ายด้วย
    flushBuffer();

    console.log('Final Data to save:', dataToSave);
    return dataToSave;
}

$(document).ready(async function () {
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

    const empno = $('.apv-data').attr('empno');
    console.log(empno);

    const info = await getUser(empno);
    const orgmfg = await getOrgMfg();
    const orgmfgdata = orgmfg.map((t) => ({
        value: t.VORGNO,
        text: t.VNAME,
    }));
    flatpickr('#jung', {
        dateFormat: 'm/Y',
        defaultDate: $('#jung').val() || 'today',
        minDate: 'today',
        plugins: [
            new monthSelectPlugin({
                shorthand: true,
                dateFormat: 'Y/m',
                altFormat: 'Y/m',
            }),
        ],
    });
    await setSelect2({
        id: '#TSORGNO',
        data: orgmfgdata,
        size: 'sm',
        placeholder: '-- Select --',
        search: true,
        clear: true,
        emptyValue: true,
    });
    let datatable = [];
    if (form.RETURN) {
        const datafrmts = await getData(form);
        $(`#TSORGNO`).val(datafrmts?.TSORGNO).trigger('change');
        $('input[name="REQBY"]').val(datafrmts.FORM.VREQNO);

        if (datafrmts && datafrmts.LISTS) {
            const grouped = {};
            datafrmts.LISTS.forEach((item) => {
                const key = item.DWGNO;
                if (!grouped[key]) {
                    grouped[key] = {
                        F01R04: item.DWGNO,
                        F01R09: item.PRTNAME,
                        F01R03: item.ITMNO,
                        QTY: item.QTY,
                        PROCESS: [],
                    };
                }
                grouped[key].PROCESS.push({
                    F02R03: item.PROCESS,
                    F02R04: item.CUR_TP,
                    F02R05: item.CUR_TC,
                    // 💡 ส่งค่า After จาก DB เข้าไปด้วย
                    AF_TP: item.AF_TP,
                    AF_TC: item.AF_TC,
                });
            });

            const formattedList = Object.values(grouped);
            // 💡 นำข้อมูลที่จัดกลุ่มแล้วเข้าฟังก์ชันเตรียมข้อมูลตาราง
            datatable = transformDataForTable(formattedList, 0);
        }
        const reqflow = datafrmts.FORM.flow.find(
            (item) =>
                item.CSTEPST === '3' &&
                (item.VAPVNO === empno || item.VREPNO === empno),
        );
        if (reqflow) {
            $('textarea[name="txtRemark"]').val(reqflow.VREMARK);
        }

        console.log('return');
        console.log(datafrmts);
    } else {
        console.log('create');
        $(`#TSORGNO`).val(info.SSECCODE).trigger('change');
        $('input[name="REQBY"]').val(empno);
    }
    tsTableInstance = await initMyTable(datatable);
});

async function initMyTable(data) {
    const tableOption = {
        data: data,
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
            const allData = api.rows({ page: 'current' }).data().toArray();

            // 1. กรองเอาเฉพาะแถวหลัก (parent) เพื่อไม่ให้เอา HTML ในแถว child มาคำนวณ
            const parentRows = allData.filter((row) => row[15] === 'parent');

            // 2. ใช้ parseFloat แปลงค่าแล้วนำมาบวกกัน
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

            // 3. แสดงผลลงในหน้าจอ
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
    const formInfo = await getAllAttr('.form-info');
    //console.log('formreturn =', formInfo.return);

    //return false;
    //console.log(act);
    const dwgData = await packDataForSave();
    //console.log(dwgData);
    const payload = {
        ...(!formInfo.return && act === 'draft' && { DRAFT: 0 }),
        ACTION: act,
        NFRMNO: formInfo.nfrmno,
        VORGNO: formInfo.vorgno,
        CYEAR: formInfo.cyear,
        CYEAR2: formInfo.cyear2,
        NRUNNO: formInfo.nrunno,
        JUNG: $('input[name="jung"]').val(),
        TSORGNO: $('#TSORGNO').val(),
        INPUTBY: $('input[name="INPUTBY"]').val(),
        REQBY: $('input[name="REQBY"]').val(),
        MODE: Number(formInfo.mode) ?? null,
        EMPNO: $('.apv-data').attr('empno'),
        RETURN: formInfo.return ?? null,
        DWGLIST: dwgData,
        REMARK: $('textarea[name="txtRemark"]').val(),
    };
    console.log(payload);
    try {
        showLoader();
        let res;
        if (!formInfo.return) {
            res = await create(payload);
        } else {
            res = await update(payload);
        }

        if (res.status) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            showMessage(res.message, 'warning');
        }
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
    } finally {
        showLoader({ show: false });
    }
});

$(document).on('click', '#btnAdd', async function () {
    //console.log('ADD');
    try {
        showLoader({ show: true });
        let rawMonth = $('#jung').val();
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
        console.log('============');
        console.log(res);
        console.log('============');

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

$(document).on('input', '.auto-tab', function () {
    // เช็คความยาวข้อความกับ maxlength
    if (this.value.length == this.maxLength) {
        // ค้นหาช่อง input ที่มีคลาส .auto-tab ทั้งหมดในหน้า ณ ปัจจุบัน
        var $inputs = $('.auto-tab');

        // หาตำแหน่ง (index) ถัดไป
        var nextIndex = $inputs.index(this) + 1;

        // ถ้ามีช่องถัดไป ให้เลื่อน focus ไป
        if (nextIndex < $inputs.length) {
            $inputs.eq(nextIndex).focus();
        }
    }
});
