import { createTable } from "@amec/webasset/dataTable";
import { showLoader } from "@amec/webasset/preloader";
import { showErrorMessage, showMessage } from "@amec/webasset/utils";

let reportTable = null;

const columns = [
    { title: "FORM NO.", data: "FORM_NO", defaultContent: "", render: renderText },
    { title: "REQUESTER", data: "REQUESTER", defaultContent: "", render: renderText },
    { title: "CLAIM SLIP / SCL NO.", data: "CLAIM_SLIP_SCL_NO", defaultContent: "", render: renderText },
    { title: "ORIGINAL ORDER", data: "ORIGINAL_ORDER", defaultContent: "", render: renderText },
    { title: "NEW ORDER", data: "NEW_ORDER", defaultContent: "", render: renderText },
    { title: "PRODUCTION / P", data: "PRODUCTION_P", defaultContent: "", render: renderText },
    { title: "ITEM NO", data: "ITEM_NO", defaultContent: "", render: renderText },
    { title: "SEQ", data: "SEQ", defaultContent: "", render: renderText },
    { title: "Drawing No", data: "DRAWING_NO", defaultContent: "", render: renderText },
    { title: "Description", data: "DESCRIPTION", defaultContent: "", render: renderText },
    { title: "Q'TY", data: "QTY", defaultContent: "", render: renderText },
    { title: "ISSUE TO", data: "ISSUE_TO", defaultContent: "", render: renderText },
    { title: "NEXT PROCESS", data: "NEXT_PROCESS", defaultContent: "", render: renderText },
    { title: "#VEN / #SUB", data: "VEN_SUB", defaultContent: "", render: renderText },
];

$(document).ready(function () {
    $("#form").on("submit", async function (e) {
        e.preventDefault();
        await loadReport(this);
    });

    $("#exportReport").on("click", function () {
        if (!reportTable) {
            showMessage("Please load report before export.", "warning");
            return;
        }
        reportTable.button(".buttons-excel").trigger();
    });

    $("#resetReport").on("click", function () {
        this.form.reset();
        destroyTable();
        $("#result").addClass("hidden");
        $("#reportSummary").text("");
    });
});

async function loadReport(form) {
    try {
        const params = buildParams(form);
        showLoader();
        const res = await fetch(reportUrl(params), {
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        });
        const report = await res.json().catch(() => ({}));

        if (!res.ok || !report.status) throw new Error(report.message || "Failed to load report");

        const rows = Array.isArray(report.datareport) ? report.datareport : [];
        destroyTable();
        $("#result").removeClass("hidden");
        $("#reportSummary").text(`${rows.length} row${rows.length === 1 ? "" : "s"} found`);
        reportTable = await createTable(
            {
                data: rows,
                columns,
                responsive: false,
                scrollX: true,
                ordering: false,
                searching: false,
                pageLength: 25,
                buttons: [
                    {
                        extend: "excelHtml5",
                        title: "PS_CLM_Report",
                    },
                ],
            },
            { id: "#reportTable" },
        );

        if (!rows.length) showMessage("No data found", "warning");
    } catch (error) {
        showErrorMessage(error.message || error);
    } finally {
        showLoader({ show: false });
    }
}

function buildParams(form) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form).entries()) {
        const text = String(value || "").trim();
        if (key !== "YEAR" && text) params.append(key, text);
    }
    return params;
}

function reportUrl(params) {
    const basePath = location.pathname.replace(/\/\d{4}\/?$/, "").replace(/\/$/, "");
    const url = new URL(basePath, location.origin);
    url.search = params.toString();
    return url;
}

function destroyTable() {
    if ($.fn.DataTable.isDataTable("#reportTable")) {
        $("#reportTable").DataTable().clear().destroy();
        $("#reportTable").empty();
    }
    reportTable = null;
}

function renderText(data, type) {
    return type === "display" ? escapeHtml(data ?? "") : data ?? "";
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
