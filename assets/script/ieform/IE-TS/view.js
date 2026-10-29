import { createTable } from '@amec/webasset/dataTable';
import {
    getExtData,
    getFormStatus,
    showflow,
} from '@amec/webasset/api/webform';
import { getformDetail } from '@amec/webasset/components/form';
import {
    getAllAttr,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { approve, getData } from './data';
import { formSubmitSkeleton } from '@amec/webasset/skeleton';
import { webflowSubmit } from '@amec/webasset/components/form';
import { showLoader } from '@amec/webasset/preloader';
import { redirectWebflow } from '@amec/webasset/form';

var form = {};
let cextdata;
let datatable = [];
const transformDataForTable = (
    apiData,
    startIndex = 0,
    isIeEditable = false,
) => {
    const flatData = [];

    apiData.forEach((item, index) => {
        const no = startIndex + index + 1;

        const dwgNo = item.F01R04 ? item.F01R04.trim() : '';
        const name = item.F01R09 ? item.F01R09.trim() : '';
        const shop = item.F01R03 ? item.F01R03.trim() : '';
        const qty = item.QTY || 0;

        let currentTP = 0,
            currentTC = 0;
        let afterTP = 0,
            afterTC = 0;
        let ieTP = null,
            ieTC = null,
            ieAccept = null;

        if (item.PROCESS && Array.isArray(item.PROCESS)) {
            item.PROCESS.forEach((process) => {
                const pTP = process.F02R04 || 0;
                const pTC = process.F02R05 || 0;

                currentTP += pTP;
                currentTC += pTC;

                const pAfterTP = process.AF_TP != null ? process.AF_TP : pTP;
                const pAfterTC = process.AF_TC != null ? process.AF_TC : pTC;

                afterTP += pAfterTP;
                afterTC += pAfterTC;

                if (isIeEditable) {
                    const valTP =
                        process.IE_TP != null ? process.IE_TP : pAfterTP;
                    const valTC =
                        process.IE_TC != null ? process.IE_TC : pAfterTC;

                    ieTP = (ieTP || 0) + valTP;
                    ieTC = (ieTC || 0) + valTC;

                    // คำนวณ Accept ของ process นี้เพื่อบวกเข้ายอดรวมของ Header
                    const pTS = pTP + qty * pTC;
                    const inputTS = valTP + qty * valTC;
                    const pIeAccept = inputTS - pTS;

                    ieAccept = (ieAccept || 0) + pIeAccept;
                } else {
                    // 💡 2. เก็บผลรวม IE ต่อเมื่อมีค่าส่งมาจาก DB เท่านั้น
                    if (process.IE_TP != null)
                        ieTP = (ieTP || 0) + process.IE_TP;
                    if (process.IE_TC != null)
                        ieTC = (ieTC || 0) + process.IE_TC;

                    // 💡 3. คำนวณ Accept สำหรับยอดรวม Parent ในโหมด View
                    if (process.IE_TP != null && process.IE_TC != null) {
                        const pTP = process.F02R04 || 0;
                        const pTC = process.F02R05 || 0;
                        const pTS = pTP + qty * pTC;
                        const viewTS = process.IE_TP + qty * process.IE_TC;
                        const pIeAccept = viewTS - pTS;

                        ieAccept = (ieAccept || 0) + pIeAccept;
                    }
                }
            });
        }

        const currentTS = currentTP + qty * currentTC;
        const afterTS = afterTP + qty * afterTC;
        const totalReq = afterTS - currentTS;

        // 💡 3. คำนวณ TS ถ้ามีค่า IE ตัวใดตัวหนึ่งอยู่
        const ieTS =
            ieTP != null || ieTC != null
                ? (ieTP || 0) + qty * (ieTC || 0)
                : null;

        flatData.push([
            no,
            name,
            shop,
            dwgNo,
            qty,
            '',
            currentTP.toFixed(4),
            currentTC.toFixed(4),
            currentTS.toFixed(4),
            afterTP.toFixed(4),
            afterTC.toFixed(4),
            afterTS.toFixed(4),
            totalReq.toFixed(4),

            // 💡 4. ถ้าไม่มีข้อมูลเลย (เป็น null) ให้โชว์ช่องว่าง ('')
            ieTP != null ? ieTP.toFixed(4) : '',
            ieTC != null ? ieTC.toFixed(4) : '',
            ieTS != null ? ieTS.toFixed(4) : '',
            ieAccept != null ? ieAccept.toFixed(4) : '',

            '',
            'parent',
        ]);

        if (item.PROCESS && Array.isArray(item.PROCESS)) {
            item.PROCESS.forEach((process) => {
                const pTP = process.F02R04 || 0;
                const pTC = process.F02R05 || 0;

                const pAfterTP = process.AF_TP != null ? process.AF_TP : pTP;
                const pAfterTC = process.AF_TC != null ? process.AF_TC : pTC;

                const hasIeTP = process.IE_TP != null;
                const hasIeTC = process.IE_TC != null;

                const pTS = pTP + qty * pTC;
                const pAfterTS = pAfterTP + qty * pAfterTC;
                const pTotalReq = pAfterTS - pTS;

                const spanAfterTP = `<span class="text-amber-900 font-medium">${pAfterTP.toFixed(4)}</span>`;
                const spanAfterTC = `<span class="text-amber-900 font-medium">${pAfterTC.toFixed(4)}</span>`;
                const spanAfterTS = `<span class="span-after-ts text-amber-950">${pAfterTS.toFixed(4)}</span>`;
                const spanTotalReq = `<span class="span-total-req ${pTotalReq !== 0 ? 'text-red-600 font-bold' : ''}">${pTotalReq.toFixed(4)}</span>`;

                let ieTpHtml, ieTcHtml, ieAcceptHtml;
                let spanIeTS;
                let pIeAccept = null; // 💡 1. ประกาศตัวแปรไว้ด้านนอก

                if (isIeEditable) {
                    const inputTP = hasIeTP ? process.IE_TP : pAfterTP;
                    const inputTC = hasIeTC ? process.IE_TC : pAfterTC;
                    const inputTS = inputTP + qty * inputTC;

                    pIeAccept = inputTS - pTS; // 💡 2. เอา const ออก

                    spanIeTS = `<span class="span-ie-ts text-slate-600">${inputTS.toFixed(4)}</span>`;

                    ieTpHtml = `<input type="number" step="0.0001" class="w-[85px] block mx-auto text-center py-1 px-2 text-green-900 font-medium bg-white border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 input-ie-tp" data-id="${process.ID}" value="${inputTP.toFixed(4)}" data-pts="${pTS.toFixed(4)}" data-qty="${qty}">`;

                    ieTcHtml = `<input type="number" step="0.0001" class="w-[85px] block mx-auto text-center py-1 px-2 text-green-900 font-medium bg-white border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 input-ie-tc" data-id="${process.ID}" value="${inputTC.toFixed(4)}" data-pts="${pTS.toFixed(4)}" data-qty="${qty}">`;
                    ieAcceptHtml = `<span class="input-ie-accept text-green-900">${pIeAccept.toFixed(4)}</span>`;
                } else {
                    // 💡 โหมดแสดงผลปกติ
                    const viewTS =
                        hasIeTP && hasIeTC
                            ? process.IE_TP + qty * process.IE_TC
                            : null;

                    // 💡 3. คำนวณ pIeAccept กรณีแสดงผลปกติเพื่อให้ ieAcceptHtml มีค่า
                    if (viewTS != null) {
                        pIeAccept = viewTS - pTS;
                    }

                    spanIeTS =
                        viewTS != null
                            ? `<span class="span-ie-ts text-slate-600">${viewTS.toFixed(4)}</span>`
                            : ``;

                    ieTpHtml = hasIeTP
                        ? `<span class="text-slate-600 font-medium">${process.IE_TP.toFixed(4)}</span>`
                        : ``;

                    ieTcHtml = hasIeTC
                        ? `<span class="text-slate-600 font-medium">${process.IE_TC.toFixed(4)}</span>`
                        : ``;

                    ieAcceptHtml =
                        pIeAccept != null
                            ? `<span class="text-green-700 font-semibold">${pIeAccept.toFixed(4)}</span>`
                            : ``;
                }

                flatData.push([
                    '',
                    '',
                    '',
                    '',
                    '',
                    process.F02R03 ? process.F02R03.trim() : '',
                    pTP.toFixed(4),
                    pTC.toFixed(4),
                    pTS.toFixed(4),
                    spanAfterTP,
                    spanAfterTC,
                    spanAfterTS,
                    spanTotalReq,
                    ieTpHtml,
                    ieTcHtml,
                    spanIeTS,
                    ieAcceptHtml,
                    '',
                    'child',
                ]);
            });
        }
    });

    return flatData;
};
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
    };
    //view
    if (form.MODE == 3) {
        $('#remark-section').addClass('hidden');
    }
    cextdata = await getExtData({ ...form });
    const cst = await getFormStatus(form);
    const [formDetail, apvno, flow, ietsfrm] = await Promise.all([
        getformDetail(form),
        $('.apv-data').attr('empno'),
        showflow({ ...form, showStep: true }),
        getData(form),
    ]);

    // const reqflow = ietsfrm.FORM.flow.find(
    //     (item) =>
    //         item.CSTEPST === '3' &&
    //         (item.VAPVNO === apvno || item.VREPNO === apvno),
    // );
    // if (reqflow) {
    //     $('textarea[name="txtRemark"]').val(reqflow.VREMARK);
    // }

    if (ietsfrm && ietsfrm.LISTS) {
        const grouped = {};
        let listToProcess = ietsfrm.LISTS;

        // 💡 เช็คว่าถ้า EXTDATA เท่ากับ 2 ถึงจะทำการกรองข้อมูล
        if (cextdata == 2) {
            listToProcess = ietsfrm.LISTS.filter((item) => {
                // ปรับแก้ property ตามโครงสร้างข้อมูล (item.SEMPNO หรือ item.PICMST?.SEMPNO)
                return (
                    item.PICMST.SEMPNO === apvno ||
                    item.PICMST.SEMPNO2 === apvno
                );
            });
        }

        listToProcess.forEach((item) => {
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
                ID: item.ID,
                F02R03: item.PROCESS,
                F02R04: item.CUR_TP,
                F02R05: item.CUR_TC,
                // 💡 ส่งค่า After จาก DB เข้าไปด้วย
                AF_TP: item.AF_TP,
                AF_TC: item.AF_TC,
                IE_TP: item.IE_TP,
                IE_TC: item.IE_TC,
            });
        });

        const formattedList = Object.values(grouped);
        let isedit = false;
        if (form.MODE == 2 && cextdata == 2) {
            isedit = true;
        }

        datatable = transformDataForTable(formattedList, 0, isedit);
        await initMyTable(datatable);
    }

    console.log(formDetail);
    console.log(ietsfrm);
    const sec = ietsfrm?.ORG?.VNAME;
    const jung = ietsfrm?.JUNG;

    // 1. สร้าง DOM จำลองเพื่อดึงข้อมูล
    const temp = $('<div>').html(formDetail);

    // 2. โครงสร้างแบบโปร่ง ไม่มีพื้นหลังทึบ เว้นระยะห่างให้ดูสบายตา
    let displayHtml = '<div class="flex flex-col gap-4 p-2">';

    temp.find('tr').each(function () {
        const $tds = $(this).find('td');
        if ($tds.length >= 2) {
            let label = $($tds[0]).text().replace(':', '').trim();
            let valueText = $($tds[1]).text().trim();

            // ตรวจสอบว่าเป็น Form no หรือไม่ เพื่อเน้นสีและตัวหนา
            let valueClass = label.toLowerCase().includes('form no')
                ? 'text-sm font-bold text-[#2CA9E1]'
                : 'text-sm font-medium text-slate-700';

            displayHtml += `
                <div class="flex items-start">
                    <!-- หัวข้อ: ใช้สีเทาอ่อนและตัวบาง -->
                    <span class="w-40 shrink-0 text-sm text-slate-400 font-normal">${label}</span>
                    <!-- ข้อมูล: สีเข้มขึ้น และไฮไลต์ถ้าเป็น Form no -->
                    <span class="${valueClass}">${valueText || '-'}</span>
                </div>
            `;
        }
    });
    displayHtml += `
                <div class="flex items-start">
                    <span class="w-40 shrink-0 text-sm text-slate-400">Section</span>
                    <span class="text-sm text-slate-600 font-medium">${sec || ''}</span>
                </div>
            `;
    displayHtml += `
                <div class="flex items-start">
                    <span class="w-40 shrink-0 text-sm text-slate-400">Production (JUNG)</span>
                    <span class="text-sm text-slate-600 font-medium">${jung || ''}</span>
                </div>
            `;

    displayHtml += '</div>';

    // 3. แสดงผลในฟอร์ม
    $('#form-detail').html(displayHtml);
    console.log('cst', cst);

    if (cst != '0') {
        formSubmitSkeleton({
            count: form.RETURN ? 3 : 4,
            element: '#form-action-container',
            mode: form.MODE === 2 ? 'edit' : 'view',
        });

        $('#form-action-container').html(
            webflowSubmit({
                flow: true,
                flowhtml: flow.html,
                approve: form.MODE == 2 ? true : false,
                reject: cextdata == 1 && form.MODE == 2 ? true : false,
                remark: false,
                back: form.MODE == 2 ? true : false,
                return: cextdata == 1 && form.MODE == 2 ? true : false,
            }),
        );
    }

    async function initMyTable(data) {
        const tableOption = {
            data: data,
            searching: false,
            paging: false,
            ordering: false,
            info: false,

            // 💡 เพิ่ม 3 บรรทัดนี้เพื่อแก้ปัญหาตารางตก/มีลูกศร
            responsive: false, // ปิดการซ่อนคอลัมน์อัตโนมัติ
            autoWidth: false, // ให้ตารางคำนวณความกว้างตามเนื้อหาจริง

            columns: Array(18).fill({ defaultContent: '-' }),
            columnDefs: [
                {
                    targets: 'col-no',
                    className:
                        'sticky-column sticky z-10 bg-white border-r border-slate-200 text-center',
                },
                {
                    targets: 'col-part',
                    className:
                        'sticky-column sticky z-10 bg-white border-r border-slate-200',
                },
                {
                    targets: 'col-cur-ts',
                    className: 'bg-[#d9d9d9] text-center border-r',
                },
                {
                    targets: ['col-after-tp', 'col-after-tc'],
                    className: 'bg-[#ffffe6] text-center',
                },
                {
                    targets: 'col-after-ts',
                    className: 'bg-[#ffff99] text-center border-r',
                },
                {
                    targets: 'col-total-req',
                    className:
                        'bg-[#ffe6e6] text-red-600 font-bold text-center border-r',
                },
                {
                    targets: ['col-ie-tp', 'col-ie-tc'],
                    className: 'bg-green-50/30 text-center',
                },
                {
                    targets: 'col-ie-ts',
                    className: 'bg-green-50/70 text-center border-r',
                },
                {
                    targets: 'col-accept',
                    className:
                        'bg-green-100 text-green-900  text-center border-r font-bold',
                },
                {
                    targets: ['col-qty', 'col-process', 'col-history'],
                    className: 'text-center',
                },
            ],
            drawCallback: function (settings) {
                const api = this.api();
                const allData = api.rows({ page: 'current' }).data().toArray();

                const parentRows = allData.filter(
                    (row) => row[18] === 'parent',
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

                const sumIeTS = parentRows.reduce(
                    (sum, row) => sum + parseFloat(row[15] || 0),
                    0,
                );
                const sumIeAccept = parentRows.reduce((sum, row) => {
                    const val = parseFloat(row[16]);
                    return sum + (isNaN(val) ? 0 : val);
                }, 0);

                document.getElementById('sum-current-ts').innerHTML =
                    sumCurrentTS.toFixed(4);
                document.getElementById('sum-after-ts').innerHTML =
                    sumAfterTS.toFixed(4);

                const totalPrefix =
                    sumTotal > 0 ? '+ ' : sumTotal < 0 ? '- ' : '';
                document.getElementById('sum-total').innerHTML =
                    totalPrefix + Math.abs(sumTotal).toFixed(4);

                // 💡 แสดงช่องว่างถ้าผลรวมของตาราง IE ยังเป็น 0 หรือว่างเปล่า
                document.getElementById('sum-ie-ts').innerHTML =
                    sumIeTS > 0 ? sumIeTS.toFixed(4) : '';
                document.getElementById('sum-ie-accept').innerHTML =
                    sumIeAccept > 0 ? '+ ' + sumIeAccept.toFixed(4) : '';
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
        if (cextdata == 1) {
            console.log('iffffffffffffff');
            myTable
                .columns('.col-ie-tp, .col-ie-tc, .col-ie-ts, .col-accept')
                .visible(false);
        }
        return myTable;
    }
});

$(document).on('click', '.btn', async function () {
    const act = $(this).val();
    const txtRemark = $('textarea[name="txtRemark"]').val();
    if ((act == 'return' || act == 'reject') && txtRemark == '') {
        showMessage('Please input Reason & Remark', 'warning');
        return false;
    }
    const payload = {
        ACTION: act,
        NFRMNO: form.NFRMNO,
        VORGNO: form.VORGNO,
        CYEAR: form.CYEAR,
        CYEAR2: form.CYEAR2,
        NRUNNO: form.NRUNNO,
        EMPNO: $('.apv-data').attr('empno'),
        EXTDATA: cextdata,
        REMARK: $('textarea[name="txtRemark"]').val(),
    };
    if (cextdata == 2) {
        const dwgListArray = [];
        $('#TsTable .input-ie-tp').each(function () {
            const $tpInput = $(this);
            const $tcInput = $tpInput.closest('tr').find('.input-ie-tc');
            dwgListArray.push({
                NFRMNO: form.NFRMNO,
                VORGNO: form.VORGNO,
                CYEAR: form.CYEAR,
                CYEAR2: form.CYEAR2,
                NRUNNO: form.NRUNNO,
                ID: $tpInput.data('id'),
                IE_TP: $tpInput.val() || null,
                IE_TC: $tcInput.val() || null,
            });
        });
        payload.DWGLIST = dwgListArray;
    }
    try {
        showLoader({ show: true });
        const res = await approve(payload);
        if (res.status) {
            showMessage(res.message, 'success');
            redirectWebflow();
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error);
    } finally {
        showLoader({ show: false });
    }
});

$(document).on('input', '.input-ie-tp, .input-ie-tc', function () {
    const $row = $(this).closest('tr');

    // ดึงค่าคงที่ (qty และ pTS ของ DB) จาก data-attributes ที่ฝังไว้
    const qty = parseFloat($(this).data('qty')) || 0;
    const pTS = parseFloat($(this).data('pts')) || 0;

    // ดึงค่าที่ผู้ใช้กำลังพิมพ์ปัจจุบัน
    const tp = parseFloat($row.find('.input-ie-tp').val()) || 0;
    const tc = parseFloat($row.find('.input-ie-tc').val()) || 0;

    // 1. คำนวณและอัปเดตบรรทัดลูก (Child Row)
    const inputTS = tp + qty * tc;
    const pIeAccept = inputTS - pTS;

    $row.find('.span-ie-ts').text(inputTS.toFixed(4));
    $row.find('.input-ie-accept').text(pIeAccept.toFixed(4));

    // 2. ค้นหาบรรทัดแม่ (Parent Row) ของกลุ่มนี้
    // (ดูจากคอลัมน์แรกที่มีตัวเลขลำดับ Item)
    const $parentRow = $row
        .prevAll()
        .filter(function () {
            return $(this).find('td').eq(0).text().trim() !== '';
        })
        .first();

    if ($parentRow.length) {
        // 3. วนลูปหาผลรวมของ Child Row ทั้งหมดภายใต้ Parent กลุ่มนี้
        let groupIeTS = 0;
        let groupIeAccept = 0;

        $parentRow
            .nextUntil(function () {
                return $(this).find('td').eq(0).text().trim() !== ''; // หยุดหาเมื่อเจอ Parent ตัวถัดไป
            })
            .each(function () {
                const childTS =
                    parseFloat($(this).find('.span-ie-ts').text()) || 0;
                const childAccept =
                    parseFloat($(this).find('.input-ie-accept').text()) || 0;

                groupIeTS += childTS;
                groupIeAccept += childAccept;
            });

        // อัปเดตผลรวมกลับไปที่ Parent Row (คอลัมน์ที่ 15 = ieTS, คอลัมน์ที่ 16 = ieAccept)
        $parentRow.find('td').eq(15).text(groupIeTS.toFixed(4));
        $parentRow.find('td').eq(16).text(groupIeAccept.toFixed(4));
    }

    // 4. คำนวณ Footer ผลรวมของทั้งตารางใหม่ทันที
    let totalIeTS = 0;
    let totalIeAccept = 0;

    // ดึง Parent Row ทั้งหมดในตารางมารวมกัน
    $('#TsTable tbody tr')
        .filter(function () {
            return $(this).find('td').eq(0).text().trim() !== '';
        })
        .each(function () {
            totalIeTS += parseFloat($(this).find('td').eq(15).text()) || 0;
            totalIeAccept += parseFloat($(this).find('td').eq(16).text()) || 0;
        });

    // อัปเดตที่ id ของ Footer (แสดง 0, บวก, ลบ เสมอ)
    $('#sum-ie-ts').text(totalIeTS.toFixed(4));

    // ถ้า Accept รวมเป็นบวก ใส่ + นำหน้า นอกนั้น (0 หรือติดลบ) โชว์ตัวเลขปกติ
    $('#sum-ie-accept').text(
        totalIeAccept > 0
            ? '+ ' + totalIeAccept.toFixed(4)
            : totalIeAccept.toFixed(4),
    );
});
