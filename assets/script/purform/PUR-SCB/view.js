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
import { getEmployee } from "@amec/webasset/api/amec";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TARGET_STEPS = ["02", "81", "93", "84", "59"];
const WINNER_COLS = [6, 7, 10];
const PDF_BASE_DIR = "//amecnas/AMECWEB/File/development/Form/PUR/PUR-SCB/";

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

function formatApprovalDate(isoDate) {
    const d = new Date(isoDate);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

function buildDateRange(year, period) {
    return period === 1
        ? `1 Jan'${year} - 30 Jun'${year}`
        : `1 Jul'${year} - 31 Dec'${year}`;
}

async function loadApprovedSteps(flowResult) {
    return Promise.all(
        (flowResult ?? [])
            .filter(i => TARGET_STEPS.includes(String(i.CSTEPNO).padStart(2, "0")))
            .map(async i => ({
                step: String(i.CSTEPNO).padStart(2, "0"),
                dateApv: i.DAPVDATE ? formatApprovalDate(i.DAPVDATE) : "",
                emp: await getEmployee(i.VREALAPV),
            }))
    );
}

function renderBankGuarantees(bankGuarantees) {
    const $headerRow = $("#bgVendorHeaderRow");
    const $amountRow = $("#bgAmountRow");

    if (!bankGuarantees.length) {
        $("#bgEmptyMsg").removeClass("hidden");
        return;
    }

    $("#bgEmptyMsg").addClass("hidden");

    bankGuarantees.forEach(({ VENDOR, AMOUNT }) => {
        $headerRow.append(
            `<th class="text-center bg-primary/15 text-primary whitespace-nowrap">${VENDOR}</th>`
        );
        $amountRow.append(
            `<td class="text-center font-semibold">${AMOUNT != null && AMOUNT !== "" ? Number(AMOUNT).toLocaleString() : "-"}</td>`
        );
    });
}

$(async function () {
    const params = new URLSearchParams(window.location.search);
    const nfrmno  = params.get("no");
    const vorgno  = params.get("orgNo");
    const cyear   = params.get("y");
    const runno   = params.get("runNo");
    const cyear2  = params.get("y2");
    const empno   = params.get("empno");

    const $loadingSkeleton = $("#loadingSkeleton");
    const $tableWrapper    = $("#tableWrapper");
    const $emptyState      = $("#emptyState");

    const setLoadingState = (isLoading) => {
        $loadingSkeleton.toggleClass("hidden", !isLoading);
        $tableWrapper.toggleClass("hidden", isLoading);
    };

    const sharedParams = { NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: runno };

    const mode = await getMode({ ...sharedParams, EMPNO: empno });
    if (mode === "2") {
        $(".Apv-btn").html(await webflowSubmit({ approve: true, reject: true }));
    }

    setLoadingState(true);

    const searchFlowResult = await searchFlow({ ...sharedParams, CSTEPST: "5" });
    const approved = await loadApprovedSteps(searchFlowResult);

    let data, flow, bankGuarantees, purscpForm;

    try {
        [data, flow, bankGuarantees, purscpForm] = await Promise.all([
            $.ajax({
                type: "GET",
                url: `${host}/purform/PUR-SCB/main/getDataPriceByRunNo`,
                data: { nfrmno, vorgno, cyear, cyear2, runNo: runno },
                dataType: "json",
            }),
            showflow({ ...sharedParams, showStep: false }),
            $.ajax({
                type: "GET",
                url: `${host}/purform/PUR-SCB/main/getBankGuarantees`,
                data: { nfrmno, vorgno, cyear, cyear2, runNo: runno },
                dataType: "json",
            }),
            $.ajax({
                type: "GET",
                url: `${host}/purform/PUR-SCB/main/getPurscpForm`,
                data: { nfrmno, vorgno, cyear, cyear2, runNo: runno },
                dataType: "json",
            }),
        ]);
    } catch (error) {
        console.error("Failed to load PUR-SCB view data", error);
        $emptyState.removeClass("hidden");
        setLoadingState(false);
        return;
    }

    $(".flow").html(flow.html);

    data = data.filter(r => r.NEW_PRICE != null || r.NEW_VENDOR != null);

    let newYear, newPeriod, dateRange, oldPricePeriod, newPricePeriod;

    if (data.length) {
        const { FYEAR, PERIOD, NEW_FYEAR, NEW_PERIOD } = data[0];
        const isFullYear = purscpForm?.IS_FULL_YEAR == 1;
        newYear        = parseInt(NEW_FYEAR);
        newPeriod      = parseInt(NEW_PERIOD);
        dateRange      = isFullYear
            ? `1 Jan'${newYear} - 31 Dec'${newYear}`
            : buildDateRange(newYear, newPeriod);
        const periodLabel  = isFullYear ? '/1-2F' : `/${newPeriod}F`;
        oldPricePeriod = FYEAR && PERIOD ? `Y${FYEAR}/${PERIOD}F` : "";
        newPricePeriod = `Y${newYear}${periodLabel}`;

        $(".old-price-period").text(oldPricePeriod);
        $(".fyear").text(`AMEC Scrap Master (Y${newYear}${periodLabel}) ${dateRange}`);
        $(".new-price-period").text(newPricePeriod);
        $(".new-period").text(`FY${newYear}${periodLabel}`);
        $emptyState.addClass("hidden");
    } else {
        $(".old-price-period").text("");
        $emptyState.removeClass("hidden");
    }

    $('[name="btnAction"]').on("click", async function () {
        const action = $(this).val();
        const remark = $("#remark").val();
        showLoader({ show: true });
        await doaction({ ...sharedParams, ACTION: action, EMPNO: empno, REMARK: remark });
        showLoader({ show: false });
        redirectWebflow();
    });

    await createTable({
        data,
        columns: TABLE_COLUMNS,
        dom: '<"flex mb-3 items-center gap-2"<"flex items-center gap-2"fB><"ml-auto"l>><"bg-white border border-slate-700 rounded-2xl overflow-hidden my-5"t><"flex mt-5"<"flex-1"p><"flex-none"i>>',
        buttons: [
            {
                text: '<i class="icofont-file-pdf"></i> Export PDF',
                attr: { class: "btn btn-error btn-sm" },
                action: async (e, dt, node) => {
                    if (!data.length) return;
                    const btn = node[0];
                    btn.disabled = true;
                    btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Generating...';
                    try {
                        const html = buildScrapPdfHtml({ data, newYear, newPeriod, oldPricePeriod, newPricePeriod, dateRange, flow: flow.html, bankGuarantees, approved, remark: purscpForm?.REMARK ?? "" });
                        const fileName = `ScrapMaster_Y${newYear}_${newPeriod}F_run${runno}.pdf`;
                        await generatePdf({
                            html,
                            options: {
                                path: PDF_BASE_DIR + fileName,
                                printBackground: true,
                                landscape: false,
                                format: "A4",
                                margin: { top: "12mm", right: "10mm", bottom: "15mm", left: "10mm" },
                            },
                        });
                        await downloadOrOpenFile({
                            baseDir: PDF_BASE_DIR,
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
                    const exportData = rows.map(row => ({
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

    renderBankGuarantees(bankGuarantees);

    // ---- Remark ----
    const remark = purscpForm?.REMARK ?? "";
    if (remark) {
        $("#remarkText").text(remark);
        $("#remarkEmpty").addClass("hidden");
    } else {
        $("#remarkText").text("");
        $("#remarkEmpty").removeClass("hidden");
    }

    // ---- Attached Files ----
    try {
        const scrapFiles = await $.ajax({
            type: "GET",
            url: `${host}/purform/PUR-SCB/main/getScrapFiles`,
            data: { nfrmno, vorgno, cyear, cyear2, runNo: runno },
            dataType: "json",
        });

        const $list = $("#attachFileList");
        $list.empty();

        if (!scrapFiles.length) {
            $list.append('<li class="text-xs text-base-content/40 italic">ไม่มีไฟล์แนบ</li>');
        } else {
            scrapFiles.forEach(file => {
                const downloadUrl = `${host}/purform/PUR-SCB/main/downloadScrapFile?path=${encodeURIComponent(file.file_path)}`;
                $list.append(`
                    <li class="flex items-center gap-2 text-sm">
                        <i class="icofont-paper-clip text-info"></i>
                        <span class="flex-1 truncate">${file.orig_name}</span>
                        <a href="${downloadUrl}" class="btn btn-ghost btn-xs gap-1 text-info" download>
                            <i class="icofont-download"></i>
                            ดาวน์โหลด
                        </a>
                    </li>
                `);
            });
        }
    } catch (e) {
        console.error("Failed to load attached files", e);
    }
});