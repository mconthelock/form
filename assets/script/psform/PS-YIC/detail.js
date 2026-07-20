import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getMode } from "@amec/webasset/api/webform";
import dayjs from "dayjs";


$(document).ready(async function () {
    const params = new URLSearchParams(window.location.search);
    const nfrmno = params.get("no");
    const vorgno = params.get("orgNo");
    const cyear = params.get("y");
    const runno = params.get("runNo");
    const cyear2 = params.get("y2");
    const empno = params.get("empno");

    const formKey = {
        NFRMNO: nfrmno,
        VORGNO: vorgno,
        CYEAR: cyear,
        CYEAR2: cyear2,
        NRUNNO: runno,
    };

    const mode = await getMode({ ...formKey, EMPNO: empno });

    const formatNumber = (value, digits = 0) =>
        Number(value || 0).toLocaleString("en-US", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });

    const partLabel = (type) => (type === "1" ? "Bulk" : "Stock");

    const data = await fetchUtils({
        url: `${process.env.APP_API}/ps-yic/get-form-data`,
        data: formKey, // no PART filter — endpoint returns both Bulk (TYPE=1) and Stock (TYPE=A)
    });

    const detail = data[0]; // single form detail object
    console.log("YIC Detail Data:", detail);

    // ---- Fill condition info ----
    $(".cutoff-date").text(
        `${dayjs(detail.CUTOFF_DATE).format("DD MMMM YYYY")} (Time. ${dayjs(detail.CUTOFF_DATE).format("HH:mm A")})`
    );
    $(".whi-date").text(dayjs(detail.CHECK_DATE).format("DD-MMM-YYYY"));
    $(".period").text(`${detail.ASSIGN?.YEAR ?? ""} half #${detail.ASSIGN?.PERIOD === "1" ? "1st" : "2nd"}`);

    // ---- Fill Bulk / Stock summary boxes ----
    $(".total-items-bulk").text(formatNumber(detail.RESULT?.filter((row) => row.TYPE === "1").length));
    $(".checking-items-bulk").text(formatNumber(detail.BULK_ITEM));
    $(".diff-items-bulk").text(formatNumber(detail.RESULT?.filter((row) => row.TYPE === "1" && Number(row.ON_HAND) !== Number(row.ACTUAL_QTY)).length));
    $(".variance-items-bulk").text(formatNumber(detail.RESULT?.filter((row) => row.TYPE === "1" && Number(row.ON_HAND) !== Number(row.ACTUAL_QTY)).length));

    $(".total-items-stock").text(formatNumber(detail.RESULT?.filter((row) => row.TYPE === "A").length));
    $(".checking-items-stock").text(formatNumber(detail.STOCK_ITEM));
    $(".diff-items-stock").text(formatNumber(detail.RESULT?.filter((row) => row.TYPE === "A" && Number(row.ON_HAND) !== Number(row.ACTUAL_QTY)).length));
    $(".variance-items-stock").text(formatNumber(detail.RESULT?.filter((row) => row.TYPE === "A" && Number(row.ON_HAND) !== Number(row.ACTUAL_QTY)).length));


    // ---- Render variance detail table (Bulk + Stock combined) ----
    const rows = detail.RESULT.filter((row) => Number(row.ON_HAND) != Number(row.ACTUAL_QTY)) ?? []; // each row has TYPE: "1" (Bulk) or "A" (Stock)
    const $tbody = $("#tbl-variance tbody");
    const $tbody2 = $("#tbl-variance2 tbody");
    $tbody.empty();
    $tbody2.empty();

    let totalAmount = 0;

    const minRows = 15;

    rows.forEach((row, idx) => {
        const diffAmount = Math.abs((Number(row.ACTUAL_QTY) - Number(row.ON_HAND)) * Number(row.PRICE));
        totalAmount += diffAmount;

        const whiInput = mode === '2' ? `<input class="input input-xs whi-reply" data-id="${row.ID ?? ""}" value="${row.WHI_REPLY ?? ""}">` : row.WHI_REPLY ?? "";
        const purInput = mode === '2' ? `<input class="input input-xs pur-reply" data-id="${row.ID ?? ""}" value="${row.PUR_REPLY ?? ""}">` : row.PUR_REPLY ?? "";

        $tbody.append(`
            <tr>
                <td class="border border-gray-400 px-2 py-1 text-center h-8">${idx + 1}</td>
                <td class="border border-gray-400 px-2 py-1 text-center">${row.TAG_NO ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1">${row.ITEM_CODE ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1">${row.ITEM.IDRAW ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1">${row.DESC ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1">${formatNumber(row.ON_HAND) ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1 text-right">${formatNumber(row.ACTUAL_QTY)}</td>
                <td class="border border-gray-400 px-2 py-1 text-right">${formatNumber(Number(row.ACTUAL_QTY) - Number(row.ON_HAND))}</td>
                <td class="border border-gray-400 px-2 py-1 text-right font-medium">${row.ITEM.IUMS}</td>
                <td class="border border-gray-400 px-2 py-1 text-right">${formatNumber(Math.abs((Number(row.ACTUAL_QTY) - Number(row.ON_HAND)) * Number(row.PRICE)))}</td>
                <td class="border border-gray-400 px-2 py-1 text-right font-medium">${whiInput}</td>
                <td class="border border-gray-400 px-2 py-1 text-right font-medium">${purInput}</td>
            </tr>
        `);

        $tbody2.append(`
            <tr>
                <td class="border border-gray-400 px-2 py-1 text-center h-8">${idx + 1}</td>
                <td class="border border-gray-400 px-2 py-1 text-center">${row.TAG_NO ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1">${row.ITEM_CODE ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1">${row.ITEM.DESC ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1 text-right">${formatNumber(row.USER_ID) ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1">${formatNumber(row.ON_HAND) ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1">${formatNumber(row.ACTUAL_QTY) ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1 text-right">${formatNumber(Number(row.ACTUAL_QTY) - Number(row.ON_HAND)) ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1 text-right">${formatNumber(Number(row.PRICE)) ?? ""}</td>
                <td class="border border-gray-400 px-2 py-1 text-right">${formatNumber(Math.abs((Number(row.ACTUAL_QTY) - Number(row.ON_HAND)) * Number(row.PRICE)))}</td>
            </tr>
        `);
    });

    const emptyRows = Math.max(0, minRows - rows.length);

    for (let i = 0; i < emptyRows; i++) {
        $tbody.append(`
            <tr>
                <td class="border border-gray-400 px-2 py-1 text-center h-8">${rows.length + i + 1}</td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
            </tr>
        `);

        $tbody2.append(`
            <tr>
                <td class="border border-gray-400 px-2 py-1 text-center h-8">${rows.length + i + 1}</td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
                <td class="border border-gray-400 px-2 py-1 h-8"></td>
            </tr>
        `);
    }

    $(".total-amount").text(formatNumber(totalAmount, 2));

    // ---- Toggle "Variance=0" watermark when no rows at all ----
    if (rows.length === 0) {
        $(".variance-empty").removeClass("hidden");
    } else {
        $(".variance-empty").addClass("hidden");
    }

    $(document).on("blur", ".whi-reply", async function () {
        const id = $(this).data("id");
        const value = $(this).val();

        const payload = {
            where: { ID: id },
            data: { WHI_REPLY: value, WHI_USER: empno },
        };

        await fetchUtils({
            url: `${process.env.APP_API}/ps-yic/updateYearlyResult`, // replace with the actual endpoint
            method: "PATCH",
            data: payload,
        });
    });

    $(document).on("blur", ".pur-reply", async function () {
        const id = $(this).data("id");
        const value = $(this).val();

        const payload = {
            where: { ID: id },
            data: { PUR_REPLY: value, PUR_USER: empno },
        };

        await fetchUtils({
            url: `${process.env.APP_API}/ps-yic/updateYearlyResult`, // replace with the actual endpoint
            method: "PATCH",
            data: payload,
        });
    });
});