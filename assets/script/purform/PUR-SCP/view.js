import { host } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { exportExcel, defaultExcel, border, fill, alignment } from "@amec/webasset/excel";
import { showflow } from "@amec/webasset/api/webform";

$(async function () {
    const params = new URLSearchParams(window.location.search);
    const nfrmno = params.get('no');
    const vorgno = params.get('orgNo');
    const cyear = params.get('y');
    const runno = params.get('runNo');
    const cyear2 = params.get('y2');

    const [data, flow] = await Promise.all([
        $.ajax({
            type: "GET",
            url: `${host}/purform/PUR-SCP/main/getDataPriceByRunNo`,
            data: { runNo: runno, y2: cyear2 },
            dataType: "json",
        }),
        showflow({
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: runno,
            showStep: true,
        }),
    ]);

    $(".flow").html(flow.html);

    if (data.length > 0) {
        const { FYEAR, PERIOD, NEW_FYEAR, NEW_PERIOD } = data[0];
        const newYear = parseInt(NEW_FYEAR);
        const newPeriod = parseInt(NEW_PERIOD);
        const dateRange = newPeriod === 1
            ? `1 Jan'${newYear} - 30 Jun'${newYear}`
            : `1 Jul'${newYear} - 31 Dec'${newYear}`;

        $(".old-price-period").text(FYEAR && PERIOD ? `Y${FYEAR}/${PERIOD}F` : "");
        $(".fyear").text(`AMEC Scrap Master (Y${newYear}/${newPeriod}F) ${dateRange}`);
        $(".new-price-period").text(`Y${newYear}/${newPeriod}F`);
        $(".new-period").text(`FY${newYear}/${newPeriod}F`);
        $("#emptyState").addClass("hidden");
    } else {
        $(".old-price-period").text("");
        $("#emptyState").removeClass("hidden");
    }

    const WINNER_COLS = [6, 7, 10];

    const TABLE_COLUMNS = [
        { data: "SCRAP_ID" },
        { data: "SCRAP_NAME" },
        { data: "QUOTATION", className: "text-center" },
        { data: "VENDOR" },
        { data: "PRICE" },
        { data: null, className: "bg-amber-100", render: (_, __, row) => row.NEW_VENDOR ?? "" },
        { data: null, className: "bg-amber-100", render: (_, __, row) => row.NEW_PRICE ?? "" },
        { data: "UNIT" },
        { data: "BOI", render: (data) => data === "1" ? "BOI" : "Non-BOI" },
        { data: null, className: "bg-amber-100", render: (_, __, row) => row.EFFECTIVE_DATE ?? "" },
        { data: "B_GUARANTEE", render: (data) => data === "1" ? "Yes" : "No" },
    ];

    const EXCEL_COLUMNS = [
        { key: "SCRAP_ID", header: "Scrap ID" },
        { key: "SCRAP_NAME", header: "Scrap Name" },
        { key: "QUOTATION", header: "Quotation" },
        { key: "VENDOR", header: "Old Vendor" },
        { key: "PRICE", header: "Price" },
        { key: "NEW_VENDOR", header: "New Vendor" },
        { key: "NEW_PRICE", header: "New Price", type: "number" },
        { key: "UNIT", header: "Unit" },
        { key: "BOI", header: "BOI" },
        { key: "EFFECTIVE_DATE", header: "Effective Date", type: "date" },
        { key: "B_GUARANTEE", header: "Guarantee" },
    ];

    await createTable({
        data,
        columns: TABLE_COLUMNS,
        dom: '<"flex mb-3 items-center gap-2"<"flex items-center gap-2"fB><"ml-auto"l>><"bg-white border border-slate-700 rounded-2xl overflow-hidden my-5"t><"flex mt-5"<"flex-1"p><"flex-none"i>>',
        buttons: [
            {
                text: '<i class="icofont-file-excel"></i> Export Excel',
                attr: { class: "btn btn-success btn-sm" },
                action: async (e, dt) => {
                    const rows = dt.rows({ search: "applied" }).data().toArray();
                    const exportData = rows.map((row) => ({
                        ...row,
                        BOI: row.BOI === "1" ? "BOI" : "Non-BOI",
                        B_GUARANTEE: row.B_GUARANTEE === "1" ? "Yes" : "No",
                    }));

                    const workbook = await defaultExcel({
                        data: exportData,
                        sheetName: "Price Data",
                        column: EXCEL_COLUMNS,
                        manual: true,
                        manualActions: (sheet) => {
                            sheet.eachRow((row, rowNum) => {
                                row.eachCell({ includeEmpty: true }, (cell, colNum) => {
                                    const isWinner = WINNER_COLS.includes(colNum);
                                    cell.border = border("thin");
                                    if (rowNum === 1) {
                                        cell.fill = fill(isWinner ? "FFFFFF00" : "FF1F497D");
                                        cell.font = { bold: true, color: { argb: isWinner ? "FF000000" : "FFFFFFFF" } };
                                        cell.alignment = alignment("center", "middle");
                                    } else if (isWinner) {
                                        cell.fill = fill("FFFFFF00");
                                    }
                                });
                            });
                        },
                    });

                    exportExcel(workbook, "PriceData");
                },
            },
        ],
    }, { id: "price_table" });
});