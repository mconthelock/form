import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { doaction, getMode, showflow } from "@amec/webasset/api/webform";
import { redirectWebflow } from "@amec/webasset/form";
import { showMessage } from "@amec/webasset/utils";
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
        NRUNNO: runno
    }
    const formDetail = await fetchUtils({
        url: `${process.env.APP_API}/ps-yic/get-form-data`,
        data: formKey
    });

    const mode = await getMode({ ...formKey, EMPNO: empno });
    const flow = await showflow(formKey);
    const file = await fetchUtils({
        url: process.env.APP_API + "/webform/file/get-file",
        method: "POST",
        data: { ...formKey, FORM_TYPE: 'PS' }
    });
    $("#uploaded-files-list").html(file?.data?.length ? file.data.map((f, index) => `<tr>
            <td class="border border-gray-400 px-2 py-1 text-center font-medium">${index + 1}</td>
            <td class="border border-gray-400 px-2 py-1 text-center font-medium">${f.FILE_ONAME}</td>
            <td class="border border-gray-400 px-2 py-1 text-center font-medium">
                <a data-url="${f.FILE_PATH}" storedName="${f.FILE_FNAME}" originalName="${f.FILE_ONAME}" target="_blank" class="text-blue-500 underline cursor-pointer download-file">
                Download
                </a>
            </td>
        </tr>`).join('') : '');

    $(document).on("click", ".download-file", function () {
        downloadOrOpenFile({
            baseDir: $(this).data("url"),
            storedName: $(this).attr("storedName"),
            originalName: $(this).attr("originalName"),
            mode: "download",
        });
    });

    console.log("mode", mode);
    $(".flow").html(flow.html);
    $(".aprv-section").toggleClass("hidden", mode != "2");

    const data = formDetail[0];
    const result = data.RESULT;

    const formatNumber = (value, digits = 0) =>
        Number(value || 0).toLocaleString('en-US', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });

    const periodText = data.ASSIGN.PERIOD === "1" ? "1st" : data.ASSIGN.PERIOD === "2" ? "2nd" : "";

    $(".cutoff-date").text(`${dayjs(data.CUTOFF_DATE).format("DD MMMM YYYY")} (Time. ${dayjs(data.CUTOFF_DATE).format("HH:mm A")})`);
    $(".whi-date").text(dayjs(data.CHECK_DATE).format("DD MMMM YYYY"));
    $(".fin-date").text(dayjs(data.FIN_DATE).format("DD MMMM YYYY"));
    $(".period").text(`${data.ASSIGN.YEAR} ${periodText}`);

    const calculateStats = (items, type) => {
        return items.reduce((acc, item) => {
            if (item.TYPE !== type) return acc;

            const price = parseFloat(item.PRICE) || 0;
            const onHand = Number(item.ON_HAND) || 0;
            const actual = item.ACTUAL_QTY != null ? Number(item.ACTUAL_QTY) : null;

            acc.totalItems += 1;
            acc.totalAmount += price * onHand;

            if (actual !== null) {
                acc.whiItems += 1;
                acc.whiAmount += price * actual;

                if (actual !== onHand) {
                    acc.diffItems += 1;
                    acc.diffAmount += price * (actual - onHand);
                }
            }

            return acc;
        }, {
            totalItems: 0,
            totalAmount: 0,
            whiItems: 0,
            whiAmount: 0,
            diffItems: 0,
            diffAmount: 0
        });
    };

    const bulkStats = calculateStats(result, "1");
    const stockStats = calculateStats(result, "A");

    const finBulkItems = Number(data.BULK_ITEM) || 0;
    const finBulkAmount = Number(data.BULK_AMOUNT) || 0;
    const finStockItems = Number(data.STOCK_ITEM) || 0;
    const finStockAmount = Number(data.STOCK_AMOUNT) || 0;

    $(".total-bulk-items").text(formatNumber(bulkStats.totalItems));
    $(".total-bulk-amount").text(formatNumber(bulkStats.totalAmount, 2));
    $(".whi-bulk-items").text(formatNumber(bulkStats.whiItems));
    $(".whi-bulk-amount").text(formatNumber(bulkStats.whiAmount, 2));
    $(".fin-bulk-items").text(formatNumber(finBulkItems));
    $(".fin-bulk-amount").text(formatNumber(finBulkAmount, 2));
    $(".diff-bulk-items").text(formatNumber(bulkStats.diffItems));
    $(".diff-bulk-amount").text(formatNumber(Math.abs(bulkStats.diffAmount), 2));

    $(".total-stock-items").text(formatNumber(stockStats.totalItems));
    $(".total-stock-amount").text(formatNumber(stockStats.totalAmount, 2));
    $(".whi-stock-items").text(formatNumber(stockStats.whiItems));
    $(".whi-stock-amount").text(formatNumber(stockStats.whiAmount, 2));
    $(".fin-stock-items").text(formatNumber(finStockItems));
    $(".fin-stock-amount").text(formatNumber(finStockAmount, 2));
    $(".diff-stock-items").text(formatNumber(stockStats.diffItems));
    $(".diff-stock-amount").text(formatNumber(Math.abs(stockStats.diffAmount), 2));

    const totalSummaryItems = bulkStats.totalItems + stockStats.totalItems;
    const totalSummaryAmount = bulkStats.whiAmount + stockStats.whiAmount;
    const finSummaryItems = finBulkItems + finStockItems;
    const finSummaryAmount = finBulkAmount + finStockAmount;

    $(".comment").html(`
        <h2 class="font-bold underline text-blue-800 mb-2">COMMENT:</h2>
        <p class="text-sm leading-relaxed">
            The result of inventory checking &nbsp;${periodText} &nbsp;FY-${data.ASSIGN.YEAR}, Date checking <span class="font-bold underline">${dayjs(data.CHECK_DATE).format("DD MMMM YYYY")}</span> Bulk Part &nbsp;Total ${formatNumber(bulkStats.totalItems)} item,
            and Stock part Total &nbsp;${stockStats.totalItems} item. Summary &nbsp;Total ${formatNumber(totalSummaryItems)} &nbsp;item. COST TOTAL <span class="font-bold">${formatNumber(totalSummaryAmount, 2)}</span> baht
        </p>
        <p class="text-sm leading-relaxed text-red-600 mt-1">
            FIN Div. Random check total ${formatNumber(finSummaryItems)} &nbsp;item, &nbsp;cost total ${formatNumber(finSummaryAmount, 2)} &nbsp;baht &nbsp;Actual onhand &nbsp;difference &nbsp;&nbsp;0 &nbsp;&nbsp;item
        </p>
    `);

    $(".btn-approve").on("click", async function () {
        try {
            const action = $(this).data("action");
            $(".attach-file").each(async function (index, element) {
                const fileInput = $(element)[0];
                const file = fileInput.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('NFRMNO', nfrmno);
                    formData.append('VORGNO', vorgno);
                    formData.append('CYEAR', cyear);
                    formData.append('CYEAR2', cyear2);
                    formData.append('NRUNNO', runno);
                    formData.append('FORM_TYPE', 'PS');
                    // formData.append('FILE_CODE', '2');
                    formData.append('CREATEBY', empno);
                    formData.append('file', file);
                    await fetchUtils({
                        url: process.env.APP_API + "/webform/file",
                        method: "POST",
                        data: formData,
                    });
                }
            });
            console.log(action);
            await doaction({
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR: cyear,
                CYEAR2: cyear2,
                NRUNNO: runno,
                ACTION: action,
                EMPNO: empno,
                REMARK: $('#remark').val().trim() // optional
            });
            redirectWebflow();
        } catch (error) {
            showMessage(error.message, "error");
        }
    });
});