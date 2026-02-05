const { setSelect2 } = require("@amec/webasset/select2");
import { getDepartment } from "@amec/webasset/api/amec";
import { showLoader } from "@amec/webasset/preloader";
import {
    filterFormData,
    intVal,
    logFormData,
    setRound,
    showErrorMessage,
    showMessage,
} from "@amec/webasset/utils";
import select2 from "select2";
import { getReport } from "./data";
import { createTable } from "@amec/webasset/dataTable";
import { formatDate } from "@amec/webasset/dayjs";
import "@amec/webasset/tooltip";
import { defaultExcel, exportExcel } from "@amec/webasset/excel";

select2();

var table;
$(async function () {
    setPage();
});

$(document).on("click", "#reload", function () {
    setPage();
});

$(document).on("input", ".txt-upper", function () {
    this.value = this.value.toUpperCase();
});

$(document).on("click", "#search", async function () {
    try {
        showLoader();
        const form = filterFormData(new FormData($("#form")[0]));
        logFormData(form);

        const data = await getReport(form);
        if (data.length === 0) {
            showMessage("No data found", "warning");
            return;
        }

        table = await createTable(
            {
                responsive: false,
                data: data,
                columns: columns,
            },
            {
                join: true,
            },
        );
        $("#box-search").addClass("hidden");
        $("#box-table").removeClass("hidden");
    } catch (error) {
        $("#box-search").removeClass("hidden");
        $("#box-table").addClass("hidden");
        console.error("Search error", error);
        showErrorMessage(error.message);
    } finally {
        showLoader({ show: false });
    }
});

$(document).on("click", "#back", function () {
    $("#box-search").removeClass("hidden");
    $("#box-table").addClass("hidden");
});

$(document).on("click", "#export", async function () {
    try {
        showLoader();
        const data = table.rows({ search: "applied" }).data().toArray();
        if (data.length === 0) {
            showErrorMessage("No data to export");
            return;
        }
        const excel = await defaultExcel({
            data: data,
            column: columns
                .filter((col) => col.data !== "prpo")
                .map((col) => {
                    if (
                        col.render !== undefined &&
                        col.render.toString().includes("formatDate")
                    ) {
                        if (col.render.toString().includes("HH:mm:ss")) {
                            return {
                                header: col.title,
                                key: col.data,
                                numFmt: "dd-mmm-yy hh:mm:ss",
                                type: "date",
                            };
                        } else {
                            return {
                                header: col.title,
                                key: col.data,
                                numFmt: "dd-mmm-yy",
                                type: "date",
                            };
                        }
                    }

                    return {
                        header: col.title,
                        key: col.data,
                    };
                }),
        });
        exportExcel(excel, "Budget Requisition Report");
    } catch (error) {
        console.error("Export error", error);
        showErrorMessage(error.message);
    } finally {
        showLoader({ show: false });
    }
});

const columns = [
    {
        title: "Form no.",
        data: "FORMNO",
        className: "text-nowrap sticky-column",
    },
    {
        title: "Issue Date",
        data: "ISSUE_DATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY");
        },
    },
    {
        title: "PR and PO",
        data: "prpo",
        className: "text-center",
        render: function (data, type, row, meta) {
            if (data.length === 0) return "";
            let html = `<div class='overflow-auto max-h-48'>
            <table class='table'> 
            <thead class='bg-primary text-white sticky top-0'>
                <tr>
                    <th>PR No.</th>
                    <th>PO No.</th>
                </tr>
            </thead>
            <tbody class='bg-white text-black'>`;
            data.forEach((p) => {
                html += `<tr>
                <td class='text-start align-top'>${p.SPRNO}</td>`;
                if (p.SPONO.length === 0) {
                    html += `<td class='text-start'>-</td>`;
                } else {
                    html += `<td class='text-start'>`;
                    p.SPONO.forEach((po, index) => {
                        html += `<p>${po}</p>`;
                    });
                    html += `</td>`;
                }

                html += `</tr>`;
            });
            html += `</tbody>
            </table>
            </div>`;
            return `<button type="button" class="btn btn-ghost btn-circle btn-sm tooltip" data-html="${html}" data-hold="true">
                <i class="icofont-eye-alt text-2xl"></i>
            </button>`;
        },
    },
    {
        title: "Responsible Person",
        data: "RESPONSIBLE_PERSON",
        className: "text-nowrap",
    },
    { title: "Dept.", data: "DEPT", className: "text-nowrap" },
    { title: "Budget Year", data: "BUDGET_YEAR" },
    { title: "Investment S/N", data: "INVESTMENT_SN" },
    {
        title: "RECEIVED BUDGET",
        data: "RECIVED_BUDGET",
        render: function (data, type, row, meta) {
            return setRound(data);
        },
    },
    {
        title: "Request Amount",
        data: "REQUEST_AMOUT",
        render: function (data, type, row, meta) {
            return setRound(data);
        },
    },
    {
        title: "Plan Finished Date",
        data: "FINDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY");
        },
    },
    {
        title: "ITEM NAME",
        data: "ITMNAME",
        className: "",
        width: "200px",
        render: function (data, type, row, meta) {
            if (!data) return "";
            // สร้าง div ชั่วคราวเพื่อวัดขนาด
            const temp = document.createElement("div");
            temp.style.position = "absolute";
            temp.style.visibility = "hidden";
            temp.style.whiteSpace = "nowrap";
            temp.style.maxWidth = "16rem"; // max-w-64
            temp.textContent = data;
            document.body.appendChild(temp);
            const isOverflow = temp.scrollWidth > temp.clientWidth;
            document.body.removeChild(temp);
            if (isOverflow) {
                return `<div class="tooltip overflow-hidden text-ellipsis text-nowrap max-w-64" data-html="<div class='max-w-96'>${data}</div>">${data}</div>`;
            }
            return `<div class="overflow-hidden text-ellipsis text-nowrap max-w-64">${data}</div>`;
        },
    },
    {
        title: "Present President Date",
        data: "PPRESDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY");
        },
    },
    {
        title: "Selection & Price Consideration",
        data: "GPBID",
    },
    {
        title: "Request_SEM_Aprv Date",
        data: "REQ_SEM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "Request_DEM_Aprv Date",
        data: "REQ_DEM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "Request_DDIM_Aprv Date",
        data: "REQ_DDIM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "Request_DIM_Aprv Date",
        data: "REQ_DIM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "IE Checker_IE DEM_Aprv Date",
        data: "IE_DEM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "E/P DDIM_Aprv Date",
        data: "EP_DDIM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "E/P DDIM_Aprv Date 2",
        data: "EP_DDIM_APPDATE2",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "E/P DIM_Aprv Date",
        data: "EP_DIM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "GM.FAC_Aprv Date",
        data: "GMFAC_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "CAT DEM_Aprv Date",
        data: "CAT_DEM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "RAF DIM_Aprv Date",
        data: "RAF_DIM_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "P_Aprv Date",
        data: "P_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
    {
        title: "Admin_Aprv Date",
        data: "ADMIN_APPDATE",
        render: function (data, type, row, meta) {
            return formatDate(data, "DD-MMM-YY HH:mm:ss");
        },
    },
];

async function setPage() {
    try {
        const department = await getDepartment();
        setSelect2({
            id: "DEPT",
            data: department
                .map((dep) => ({ value: dep.SDEPT, text: dep.SDEPT }))
                .sort((a, b) => a.text.localeCompare(b.text)),
        });
        setSelect2({
            id: "FORM_STATUS",
            disableSearch: true,
        });
        $("#search").prop("disabled", false);
        $("#reload").addClass("hidden");
    } catch (error) {
        console.error("Error loading departments:", error);
        showErrorMessage(error.message);
        $("#search").prop("disabled", true);
        $("#reload").removeClass("hidden");
    }
}
