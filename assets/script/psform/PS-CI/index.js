import { host } from "../../utils";
import { createTable } from "@amec/webasset/dataTable";
import { doaction, getMode, showflow } from "@amec/webasset/api/webform";
import Swal from "sweetalert2";
import "@flaticon/flaticon-uicons/css/all/all.css";
import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { showLoader } from "@amec/webasset/preloader";
import { redirectWebflow } from "@amec/webasset/form";
import { downloadOrOpenFile } from "@amec/webasset/api/file";

// ─── Constants ───────────────────────────────────────────────────────────────

const LOG_TYPE = { ACTUAL: 1, RANDOM: 2, RECHECK: 3 };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getFormData = () => {
    const { nfrmno, vorgno, cyear, cyear2, nrunno } = $(".form-data").data();
    const empno = new URLSearchParams(window.location.search).get("empno");
    return { NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: nrunno, EMPNO: empno };
};

const renderFileList = files => {
    if (!files?.length) {
        return '<li class="text-xs text-base-content/40 italic">ไม่มีไฟล์แนบ</li>';
    }
    return files.map(f => `
        <li class="flex items-center gap-2 text-sm">
            <i class="icofont-paper-clip text-info"></i>
            <span class="flex-1 truncate">${f.FILE_ONAME}</span>
            <button
                data-url="${f.FILE_PATH}"
                storedName="${f.FILE_FNAME}"
                originalName="${f.FILE_ONAME}"
                class="btn btn-ghost btn-xs gap-1 text-info download-btn">
                <i class="icofont-download"></i>
                ดาวน์โหลด
            </button>
        </li>
    `).join('');
};

$(document).ready(async function () {
    const { nfrmno, vorgno, cyear, cyear2, nrunno } = $(".form-data").data();
    const { NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO, EMPNO } = getFormData();
    const formData = { NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO };
    const flow = await showflow(formData);
    $(".flow").html(flow.html);

    const mode = await getMode({ ...formData, EMPNO });
    $(".aprv-section").toggle(mode === '2');
    console.log("mode:", mode);

    // Data
    const [data, file] = await Promise.all([
        fetchUtils({ url: process.env.APP_API + "/ps-ci/getDataForm", method: "POST", data: formData }),
        fetchUtils({ url: process.env.APP_API + "/webform/file/get-file", method: "POST", data: { ...formData, FORM_TYPE: 'PS' } }),
    ]);
    console.log("file:", file);

    $("#attachFileList").html(renderFileList(file.data));
    // const file = { data: [] };
    // if (!file.data || !file.data.length) {
    //     $("#attachFileList").empty();
    //     $("#attachFileList").append('<li class="text-xs text-base-content/40 italic">ไม่มีไฟล์แนบ</li>');
    // } else {
    //     $("#attachFileList").html(file.data.map(f => `
    //         <li class="flex items-center gap-2 text-sm">
    //             <i class="icofont-paper-clip text-info"></i>
    //             <span class="flex-1 truncate">${f.FILE_ONAME}</span>
    //             <button data-url="${f.FILE_PATH}" storedName="${f.FILE_FNAME}" originalName="${f.FILE_ONAME}" class="btn btn-ghost btn-xs gap-1 text-info download-btn">
    //                 <i class="icofont-download"></i>
    //                 ดาวน์โหลด
    //             </button>
    //         </li>
    //     `).join(''));
    // }

    $(document).on("click", ".download-btn", function () {
        downloadOrOpenFile({
            baseDir: $(this).data("url"),
            storedName: $(this).attr("storedName"),
            originalName: $(this).attr("originalName"),
            mode: "download",
        });
    });

    $(".skeleton").removeClass('skeleton');
    // console.log("getDataForm:", getDataForm);
    // const data = await $.ajax({
    //     type: "POST",
    //     url: host + "psform/PS-CI/main/getDataForm",
    //     data: {
    //         nfrmno: nfrmno,
    //         vorgno: vorgno,
    //         cyear: cyear,
    //         cyear2: cyear2,
    //         nrunno: nrunno,
    //     },
    //     dataType: "json",
    //     beforeSend: function () {
    //         const loader = `<tr><td colspan="13" class="text-center py-5">Loading data...</td></tr>`;
    //         $(".table-detail").html(loader);
    //     },
    //     success: function (res) {
    //         $(".table-detail").empty();
    //         $(".skeleton").removeClass('skeleton');
    //     }
    // });

    $(".group-name").text(data[0]?.GROUP_CODE ?? '-');
    $(".data-date").text(data[0]?.CREATED_AT ? new Date(data[0].CREATED_AT).toLocaleDateString() : '-');
    $(".check-date").text(data[0]?.CHECK_DATE ? new Date(data[0].CHECK_DATE).toLocaleDateString() : '-');
    $(".total-item").text(data.length);
    const checkingItem = data.filter(item => item.ACTUAL_QTY !== null).length;
    $(".checking-item").text(checkingItem);
    const diffItemFirstTime = data.filter(item => Number(item.RANDOM_CHECK ?? item.ACTUAL_QTY ?? item.ON_HAND) !== item.ON_HAND).length;
    $(".diff-item-first-time").text(diffItemFirstTime);
    const diffItemAfterRecheck = data.filter(item => (item.RECHECK_QTY !== null) && (item.REMARK !== null) && Number(item.RECHECK_QTY) !== Number(item.ON_HAND));
    $(".diff-item-after-recheck").text(diffItemAfterRecheck.length);
    const randomCheckItem = data.filter(item => item.RANDOM_CHECK !== null).length;
    $(".random-check").text(randomCheckItem);

    const getLogsByType = (row, type) => {
        return row.LOG_EDIT?.filter(log => log.TYPE === type) || [];
    };

    const renderHistoryRows = logs =>
        logs.map(log => `
        <tr>
            <td>${log.OLD_VALUE ?? '-'}</td>
            <td>${log.NEW_VALUE ?? '-'}</td>
            <td>${log.EDIT_BY ?? '-'}</td>
            <td>${log.EDIT_AT ?? '-'}</td>
            <td>${log.REMARK ?? '-'}</td>
        </tr>
    `).join('');

    const renderValue = (value, inputClass) =>
        mode === '2'
            ? `<input class="${inputClass}" type="text" value="${value ?? ''}" />`
            : `<span>${value ?? ''}</span>`;

    const renderHistoryDropdown = (logs) => {
        if (!logs.length) return '';

        return `
        <div class="dropdown dropdown-left dropdown-hover absolute right-2 top-1/2 -translate-y-1/2 z-99999">
            <div tabindex="0" role="button">
                <i class="fi fi-rr-info cursor-pointer"></i>
            </div>

            <div tabindex="0"
                class="dropdown-content z-99999 card bg-base-100 shadow-xl border w-125 p-2">

                <div class="font-bold mb-2">
                    Edit History (${logs.length})
                </div>

                <div class="max-h-60 overflow-auto">
                    <table class="table table-xs">
                        <thead>
                            <tr>
                                <th>OLD VALUE</th>
                                <th>NEW VALUE</th>
                                <th>User</th>
                                <th>Date</th>
                                <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderHistoryRows(logs)}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    `;
    };

    const getDiffClass = diff => {
        if (diff < 0) return 'text-red-700 font-bold';
        if (diff > 0) return 'text-green-700 font-bold';
        return '';
    };

    const columns = [
        {
            data: null,
            title: "No.",
            render: (data, type, row, meta) => meta.row + 1,
            className: "sticky-column border-r border-slate-200 text-center"
        },
        { data: "IBUYC", title: "BUYER", className: "sticky-column border-r border-slate-200" },
        { data: "IPROD", title: "ITEM CODE", className: "sticky-column border-r border-slate-200" },
        { data: "IDESC", title: "DESCRIPTION", className: "border-r border-slate-200 text-nowrap min-w-[200px]" },
        { data: "IDRAW", title: "DRAWING NO.", className: "border-r border-slate-200 text-center" },
        { data: "IABBT", title: "ADDRESS", className: "border-r border-slate-200 text-right font-semibold bg-amber-50" },
        {
            data: null,
            title: "CONTROLLER",
            render: (data, type, row) => `${row.STNAME}`,
            className: "border-r border-slate-200"
        },
        { data: "ON_HAND", title: "ON HAND", className: "border-r border-slate-200 text-right font-semibold bg-amber-50" },
        { data: "IUMS", title: "UNIT", className: "border-r border-slate-200 text-center" },
        {
            data: null,
            title: "ACTUAL QTY",
            render: (data, type, row) => {
                if (type === 'sort' || type === 'type') {
                    return Number(row.ACTUAL_QTY ?? row.ON_HAND ?? 0);
                    //                           ^^                ^^
                    // แก้ด้วย: ใช้ ?? แทน || เพื่อให้ fallback ไป ON_HAND ได้ถูกต้อง
                }
                const borderClass = row.IS_ACTUAL_EDITED
                    ? 'border-red-500 border-2'
                    : '';

                const logs = getLogsByType(row, 1);
                const value = row.ACTUAL_QTY ?? row.ON_HAND;

                return `
                    <div class="relative">
                        ${mode === '2'
                        ? `<input class="input input-sm actual-qty ${borderClass} pr-8"
                                    type="text"
                                    value="${value}" />`
                        : `<span class="inline-block min-w-20 pr-8">${value}</span>`
                    }

                        ${renderHistoryDropdown(logs)}
                    </div>
                `;
                // return `<input class="input input-sm actual-qty ${borderClass}" type="text" value="${row.ACTUAL_QTY ?? row.ON_HAND}" />`;
            },
            className: "border-r border-slate-200",
            createdCell: (td, cellData, rowData, row, col) => {
                $(td).addClass("border-r border-slate-200 text-right font-semibold");
                if (rowData.ACTUAL_QTY) {
                    $(td).addClass('bg-amber-50');
                }
            }
        },
        {
            data: "RANDOM_CHECK",
            title: "L/D RANDOM CHECK",
            className: "border-r border-slate-200 text-center",
            render: (data, type, row) => {
                if (type === 'sort') {
                    return Number(row.RANDOM_CHECK || 0);
                }
                // if (!row.RANDOM_CHECK) return '';
                const borderClass = row.IS_RANDOM_EDITED
                    ? 'border-red-500 border-2'
                    : '';

                const logs = getLogsByType(row, 2);
                const value = row.RANDOM_CHECK ?? '';

                if (row.LOG_EDIT?.filter(log => log.TYPE == '2').length == 0) {
                    return `
                        <div class="tooltip cursor-help" data-tip="${row.LEADER_NAME ? `Checked By: ${row.LEADER_NAME}` : ''}">
                            ${mode == '2'
                            ? `<input class="input input-sm random-check ${borderClass}" type="text" value="${row.RANDOM_CHECK ?? ''}" />`
                            : `<span>${row.RANDOM_CHECK ?? ''}</span>`
                        }
                        </div>
                    `;
                } else {
                    return `
                        <div class="relative">
                            ${mode === '2'
                            ? `<input class="input input-sm random-check ${borderClass} pr-8"
                                        type="text"
                                        value="${value}" />`
                            : `<span class="inline-block min-w-20 pr-8">${value}</span>`
                        }

                            ${renderHistoryDropdown(logs)}
                        </div>
                    `;
                }
            }
        },
        // { data: "RANDOM_CHECK", title: "L/D RANDOM CHECK", className: "border-r border-slate-200" },
        {
            data: null,
            title: "DIFF (FIRST TIME)",
            className: "border-r border-slate-200 text-center",
            render: (data, type, row) => {
                const diff = (row.RANDOM_CHECK ?? (row.ACTUAL_QTY ?? row.ON_HAND)) - row.ON_HAND;
                let cls = '';
                if (diff < 0) {
                    cls = 'text-red-700  font-bold';
                } else if (diff > 0) {
                    cls = 'text-green-700  font-bold';
                }
                return `<span class="${cls}">
                        ${diff === 0 ? '-' : diff}
                    </span>`;
            },
            // createdCell: (td, cellData, rowData, row, col) => {
            //     const ACTUAL_QTY = rowData.ACTUAL_QTY ?? rowData.ON_HAND;
            //     const DIFF = ACTUAL_QTY - rowData.ON_HAND;
            //     $(td).addClass("border-r border-slate-200 text-right font-bold");
            //     if (DIFF < 0) {
            //         $(td).addClass('text-red-700 bg-red-50');
            //     } else if (DIFF > 0) {
            //         $(td).addClass('text-green-700 bg-green-50');
            //     }
            // }
        },
        {
            data: null,
            title: "RE-CHECK QTY",
            className: "border-r border-slate-200 text-center",
            render: (data, type, row) => {
                // if (!row.RANDOM_CHECK) return '';
                const borderClass = row.IS_RECHECK_EDITED
                    ? 'border-red-500 border-2'
                    : '';

                const logs = getLogsByType(row, 3);
                const value = row.RECHECK_QTY ?? row.RANDOM_CHECK ?? '';

                if (row.LOG_EDIT?.filter(log => log.TYPE == '3').length == 0) {
                    return `
                        ${mode == '2'
                            ? `<input class="input input-sm recheck-qty ${borderClass}" type="text" value="${value}" />`
                            : `<span>${value}</span>`
                        }
                    `;
                } else {
                    return `
                        <div class="relative">
                            ${mode === '2'
                            ? `<input class="input input-sm recheck-qty ${borderClass} pr-8"
                                        type="text"
                                        value="${value}" />`
                            : `<span class="inline-block min-w-20 pr-8">${value}</span>`
                        }

                            ${renderHistoryDropdown(logs)}
                        </div>
                    `;
                }
            }
        },
        {
            data: null,
            title: "DIFF (AFTER RE-CHECK)",
            className: "border-r border-slate-200 text-center",
            render: (data, type, row) => {
                const ACTUAL_QTY = row.RECHECK_QTY ?? row.ON_HAND;
                const DIFF = ACTUAL_QTY - row.ON_HAND;
                if (row.RECHECK_QTY !== null) {
                    return DIFF === 0 ? '0' : DIFF;
                } else {
                    return '-';
                }
            },
            createdCell: (td, cellData, rowData, row, col) => {
                const ACTUAL_QTY = rowData.RECHECK_QTY ?? rowData.ON_HAND;
                const DIFF = ACTUAL_QTY - rowData.ON_HAND;
                $(td).addClass("border-r border-slate-200 text-right font-bold");
                if (rowData.RECHECK_QTY !== null) {
                    if (DIFF < 0) {
                        $(td).addClass('text-red-700 bg-red-50');
                    } else if (DIFF > 0) {
                        $(td).addClass('text-green-700 bg-green-50');
                    }
                } else {
                    $(td).addClass('text-slate-400');
                }
            }
        },
        {
            data: "REMARK",
            title: "REMARK",
            defaultContent: "",
            className: "border-r border-slate-200 text-center min-w-[200px]",
            render: (data, type, row) => {
                return mode == '2'
                    ? `<input class="input input-sm remark" type="text" value="${row.LEADER_REMARK ?? row.REMARK ?? ''}" />`
                    : `<span>${row.LEADER_REMARK ?? row.REMARK ?? ''}</span>`;
            }
        },
        {
            data: null,
            title: "CORRECTIVE ACTION",
            render: (data, type, row) => {
                return mode == '2'
                    ? `<input class="input input-sm recheck-remark" type="text" value="${row.RECHECK_REMARK ?? ''}" />`
                    : `<span>${row.RECHECK_REMARK ?? ''}</span>`;
            },
            className: "text-center min-w-[200px]"
        }
    ];

    const table = await createTable({
        data: data,
        columns: columns,
        responsive: false,
        // createdRow: function (row, data, dataIndex) {
        //     $(row).addClass('hover:bg-slate-50 border-b border-slate-200');
        // }
        dom: `<"table-top domTop"
                <"top-menu"
                    <"left-menu join"
                        l
                        <"#filterBtnDt.filterBtnDt items-center">
                    >
                    <"middle-menu">
                    <"right-menu table-option join"f>
                >
                <"top-menu-row2">
            >
            <"table-body"rt>
            <"table-bottom"
                <"table-info" i>
                <"table-paging"p>
            >`
    }, {
        id: "#table",
        domScroll: { status: true, maxHeight: "100vh" }
        // dataTableSm: { status: false },
        // dataTableCss: false
    });

    $('#table').on('blur', '.actual-qty', function () {

        const input = $(this);
        const td = input.closest('td');

        const row = table.row(td.closest('tr'));
        const rowData = row.data();

        const rawValue = input.val();
        const value = rawValue === '' ? null : Number(rawValue);

        // baseline: ถ้าเคยแก้มาก่อนแล้ว ใช้ OLD_ACTUAL_QTY, ถ้ายังไม่เคย ใช้ ACTUAL_QTY ?? ON_HAND
        const baseline = rowData.OLD_ACTUAL_QTY !== undefined
            ? rowData.OLD_ACTUAL_QTY
            : Number(rowData.ACTUAL_QTY ?? rowData.ON_HAND);

        if (value !== baseline) {
            rowData.IS_EDITED = true;
            rowData.IS_ACTUAL_EDITED = true;

            if (rowData.OLD_ACTUAL_QTY === undefined) {
                rowData.OLD_ACTUAL_QTY = Number(rowData.ACTUAL_QTY ?? rowData.ON_HAND);
            }

        } else {
            rowData.IS_ACTUAL_EDITED = null;
        }

        rowData.ACTUAL_QTY = value;

        row.data(rowData).invalidate();
        table.draw(false);
    });

    $('#table').on('blur', '.random-check', function () {

        const input = $(this);
        const td = input.closest('td');

        const row = table.row(td.closest('tr'));
        const rowData = row.data();

        const value = input.val();

        // baseline: ถ้าเคยแก้มาก่อนแล้ว ใช้ OLD_RANDOM_CHECK, ถ้ายังไม่เคย ใช้ RANDOM_CHECK ปัจจุบัน
        const baseline = rowData.OLD_RANDOM_CHECK !== undefined
            ? rowData.OLD_RANDOM_CHECK
            : rowData.RANDOM_CHECK;

        const baselineValue = baseline ?? '';

        if (value != baselineValue) {
            rowData.IS_EDITED = true;
            rowData.IS_RANDOM_EDITED = true;

            if (rowData.OLD_RANDOM_CHECK === undefined) {
                rowData.OLD_RANDOM_CHECK = rowData.RANDOM_CHECK;
            }

        } else {
            rowData.IS_RANDOM_EDITED = null;
        }

        rowData.RANDOM_CHECK = value === '' ? null : value;

        row.data(rowData).invalidate();
        table.draw(false);
    });

    $('#table').on('blur', '.recheck-qty', function () {
        const input = $(this);
        const td = input.closest('td');

        const row = table.row(td.closest('tr'));
        const rowData = row.data();

        const value = input.val();

        // ใช้ OLD_RECHECK_QTY เป็น baseline ถ้ามีอยู่แล้ว (เคยแก้มาก่อน)
        // ถ้ายังไม่มี แสดงว่านี่คือการแก้ครั้งแรก ใช้ RECHECK_QTY ปัจจุบันเป็น baseline
        const baseline = rowData.OLD_RECHECK_QTY !== undefined
            ? rowData.OLD_RECHECK_QTY
            : rowData.RECHECK_QTY;

        const baselineValue = baseline ?? '';

        if (value != baselineValue) {
            rowData.IS_EDITED = true;
            rowData.IS_RECHECK_EDITED = true;

            if (rowData.OLD_RECHECK_QTY === undefined) {
                rowData.OLD_RECHECK_QTY = rowData.RECHECK_QTY;
            }
        } else {
            // ค่ากลับมาเท่ากับ original แล้ว ถือว่าไม่ edited
            rowData.IS_RECHECK_EDITED = null;
        }

        rowData.RECHECK_QTY = value === '' ? null : value;

        row.data(rowData).invalidate();
        table.draw(false);
    });


    $('#table').on('blur', '.remark', function () {

        const input = $(this);
        const td = input.closest('td');

        const row = table.row(td.closest('tr'));
        const rowData = row.data();

        rowData.LEADER_REMARK = input.val().trim();

        row.data(rowData);
    });

    $('#table').on('blur', '.recheck-remark', function () {

        const input = $(this);
        const td = input.closest('td');

        const row = table.row(td.closest('tr'));
        const rowData = row.data();

        rowData.RECHECK_REMARK = input.val().trim();

        row.data(rowData);
    });

    $(".btn-approve").on("click", async function () {
        const action = $(this).data("action");
        console.log(action);
        if (action === 'approve') {
            const editedRows = table
                .rows()
                .data()
                .toArray()
                .filter(row => row.IS_EDITED);

            const invalidRows = editedRows.filter(row =>
                (row.IS_ACTUAL_EDITED || row.IS_RANDOM_EDITED) && (!row.LEADER_REMARK || row.LEADER_REMARK.trim() === '')
            );

            const invalidRecheckRows = editedRows.filter(row =>
                (row.RECHECK_QTY !== null) && (!row.RECHECK_REMARK || row.RECHECK_REMARK.trim() === '')
            );

            if (invalidRows.length > 0) {

                Swal.fire({
                    icon: 'warning',
                    title: 'กรุณาระบุ Remark',
                    text: `${invalidRows.length} รายการ`
                });

                return;
            }

            if (invalidRecheckRows.length > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'กรุณาระบุ Corrective Action',
                    text: `${invalidRecheckRows.length} รายการ`
                });
                return;
            }

            try {

                showLoader();
                console.log("editedRows", editedRows);
                await doaction({
                    NFRMNO: nfrmno,
                    VORGNO: vorgno,
                    CYEAR: cyear,
                    CYEAR2: cyear2,
                    NRUNNO: nrunno,
                    ACTION: 'approve',
                    EMPNO: empno,
                    REMARK: $('#remark').val().trim() // optional
                })

                $(".attach-file").each(async function (index, element) {
                    const fileInput = $(element)[0];
                    const file = fileInput.files[0];
                    if (file) {
                        const formData = new FormData();
                        formData.append('NFRMNO', nfrmno);
                        formData.append('VORGNO', vorgno);
                        formData.append('CYEAR', cyear);
                        formData.append('CYEAR2', cyear2);
                        formData.append('NRUNNO', nrunno);
                        formData.append('FORM_TYPE', 'PS');
                        // formData.append('FILE_CODE', '2');
                        formData.append('CREATEBY', empno);
                        formData.append('file', file);
                        await fetchUtils({
                            url: process.env.APP_API + "/ps-ci/uploadFile",
                            method: "POST",
                            data: formData,
                        });
                    }
                });

                // // console.log("editedRows", editedRows);
                await fetchUtils({
                    url: process.env.APP_API + "/ps-ci/insertLog",
                    method: "POST",
                    data: {
                        editedRows,
                        empno: EMPNO
                    },
                });

                showLoader({ show: false });
                redirectWebflow();
            } catch (error) {
                showLoader({ show: false });
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: error.message || 'ไม่สามารถดำเนินการได้ในขณะนี้'
                });
            }
            // $.ajax({
            //     type: "POST",
            //     url: process.env.APP_API + "/ps-ci/updateCheckResult",
            //     data: {
            //         data: JSON.stringify(editedRows),
            //         empno
            //     },
            //     dataType: "json",
            //     success: function (response) {
            //         console.log(response);
            //     }
            // });

            console.log(editedRows);
        }
    });

    console.log(data);
});
