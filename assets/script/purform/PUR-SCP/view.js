import { host } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { exportExcel, defaultExcel, border, fill, alignment } from "@amec/webasset/excel";
import { showflow, getMode, doaction, searchFlow } from "@amec/webasset/api/webform";
import { generatePdf } from "@amec/webasset/api/pdf";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { buildScrapPdfHtml } from "./template_pdf.js";
import { webflowSubmit } from "@amec/webasset/components/form";
import { redirectWebflow } from "@amec/webasset/form";
import { showLoader } from "@amec/webasset/preloader";

$(async function () {
    // showLoader({ show: true });
    const params = new URLSearchParams(window.location.search);
    const nfrmno = params.get('no');
    const vorgno = params.get('orgNo');
    const cyear = params.get('y');
    const runno = params.get('runNo');
    const cyear2 = params.get('y2');
    const empno = params.get('empno');

    const $loadingSkeleton = $("#loadingSkeleton");
    const $tableWrapper = $("#tableWrapper");
    const $emptyState = $("#emptyState");

    const setLoadingState = (isLoading) => {
        $loadingSkeleton.toggleClass("hidden", !isLoading);
        $tableWrapper.toggleClass("hidden", isLoading);
    };

    const mode = await getMode({ NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: runno, EMPNO: empno });
    console.log(mode);
    if (mode == '2') {
        $(".Apv-btn").html(await webflowSubmit({ approve: true, reject: true }));
    }

    setLoadingState(true);

    let data = [];
    let flow = { html: "" };
    let bankGuarantees = [];

    const searchFlowResult = await searchFlow({ NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: runno, CSTEPST: "5" });
    console.log("Search Flow Result:", searchFlowResult);

    const targetSteps = ['02', '81', '93', '84', '59'];

    const approvedStepNos = [...new Set(
        (searchFlowResult || [])
            .filter(i => targetSteps.includes(String(i.CSTEPNO).padStart(2, '0')))
            .map(i => String(i.CSTEPNO).padStart(2, '0'))
    )];

    console.log(approvedStepNos);

    try {
        [data, flow, bankGuarantees] = await Promise.all([
            $.ajax({
                type: "GET",
                url: `${host}/purform/PUR-SCP/main/getDataPriceByRunNo`,
                data: { nfrmno: nfrmno, vorgno: vorgno, cyear: cyear, cyear2: cyear2, runNo: runno },
                dataType: "json",
            }),
            showflow({
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR: cyear,
                CYEAR2: cyear2,
                NRUNNO: runno,
                showStep: false,
            }),
            $.ajax({
                type: "GET",
                url: `${host}/purform/PUR-SCP/main/getBankGuarantees`,
                data: { nfrmno: nfrmno, vorgno: vorgno, cyear: cyear, cyear2: cyear2, runNo: runno },
                dataType: "json",
            }),
        ]);
    } catch (error) {
        console.error("Failed to load PUR-SCP view data", error);
        $emptyState.removeClass("hidden");
        setLoadingState(false);
        return;
    }

    $(".flow").html(flow.html);

    // Show only items actually updated in this run (carry-over rows have null NEW_PRICE + NEW_VENDOR)
    data = data.filter(r => r.NEW_PRICE != null || r.NEW_VENDOR != null);

    let newYear = null, newPeriod = null, dateRange = "", oldPricePeriod = "", newPricePeriod = "";

    if (data.length > 0) {
        const { FYEAR, PERIOD, NEW_FYEAR, NEW_PERIOD } = data[0];
        newYear = parseInt(NEW_FYEAR);
        newPeriod = parseInt(NEW_PERIOD);
        dateRange = newPeriod === 1
            ? `1 Jan'${newYear} - 30 Jun'${newYear}`
            : `1 Jul'${newYear} - 31 Dec'${newYear}`;
        oldPricePeriod = FYEAR && PERIOD ? `Y${FYEAR}/${PERIOD}F` : "";
        newPricePeriod = `Y${newYear}/${newPeriod}F`;

        $(".old-price-period").text(oldPricePeriod);
        $(".fyear").text(`AMEC Scrap Master (Y${newYear}/${newPeriod}F) ${dateRange}`);
        $(".new-price-period").text(newPricePeriod);
        $(".new-period").text(`FY${newYear}/${newPeriod}F`);
        $emptyState.addClass("hidden");
    } else {
        $(".old-price-period").text("");
        $emptyState.removeClass("hidden");
    }

    $('[name="btnAction"]').on('click', async function () {
        const action = $(this).val();
        const remark = $("#remark").val();
        showLoader({ show: true });
        await doaction({
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: runno,
            ACTION: action,
            EMPNO: empno,
            REMARK: remark // optional
        });
        showLoader({ show: false });
        redirectWebflow();
    });

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
            // {
            //     text: '<i class="icofont-eye-alt"></i> Preview PDF',
            //     attr: { class: "btn btn-info btn-sm" },
            //     action: () => {
            //         if (!data.length) return;
            //         const html = buildScrapPdfHtml({ data, newYear, newPeriod, oldPricePeriod, newPricePeriod, dateRange, bankGuarantees });
            //         const win = window.open("", "_blank", "width=900,height=700,scrollbars=yes");
            //         win.document.open();
            //         win.document.write(html);
            //         win.document.close();
            //     },
            // },
            {
                text: '<i class="icofont-file-pdf"></i> Export PDF',
                attr: { class: "btn btn-error btn-sm" },
                action: async (e, dt, node) => {
                    if (!data.length) return;
                    const btn = node[0];
                    btn.disabled = true;
                    btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Generating...';
                    try {
                        const html = buildScrapPdfHtml({ data, newYear, newPeriod, oldPricePeriod, newPricePeriod, dateRange, flow: flow.html, bankGuarantees });
                        const pdfPath = "//amecnas/AMECWEB/File/development/Form/PUR/PUR-SCP/";
                        const fileName = `ScrapMaster_Y${newYear}_${newPeriod}F_run${runno}.pdf`;
                        await generatePdf({
                            html,
                            options: {
                                path: pdfPath + fileName,
                                printBackground: true,
                                landscape: false,
                                format: "A4",
                                margin: { top: "12mm", right: "10mm", bottom: "15mm", left: "10mm" },
                            },
                        });
                        await downloadOrOpenFile({
                            baseDir: pdfPath,
                            storedName: fileName,
                            originalName: fileName,
                            mode: "download",
                        });
                    } finally {
                        btn.disabled = false;
                        btn.innerHTML = '<i class="icofont-file-pdf"></i> Export PDF';
                    }
                },
            },
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

    setLoadingState(false);

    // ---- Bank Guarantee Section ----
    (function renderBankGuaranteeView() {
        const $headerRow = $("#bgVendorHeaderRow");
        const $amountRow = $("#bgAmountRow");

        if (!bankGuarantees.length) {
            $("#bgEmptyMsg").removeClass("hidden");
            return;
        }
        $("#bgEmptyMsg").addClass("hidden");

        bankGuarantees.forEach(bg => {
            $headerRow.append(
                `<th class="text-center bg-primary/15 text-primary whitespace-nowrap">${bg.VENDOR}</th>`
            );
            $amountRow.append(
                `<td class="text-center font-semibold">${bg.AMOUNT != null && bg.AMOUNT !== '' ? Number(bg.AMOUNT).toLocaleString() : '-'}</td>`
            );
        });
    })();
});