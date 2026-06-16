import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { createTable } from "@amec/webasset/dataTable";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { getUrlParams, showMessage } from "@amec/webasset/utils";
import { data } from "jquery";
import { getFormData } from "./data";
import { defaultExcel, exportExcel } from "@amec/webasset/excel";
import { formatDate } from "@amec/webasset/dayjs";

var mockupreportTable,
  reportTable = null;
$(async function () {
  setDatePicker({
    element: "#fromDate",
  });
  setDatePicker({
    element: "#toDate",
  });

  mockupreportTable = await createTable(
    {
      responsive: false,
      columns: [
        { title: "FORM NO." },
        { title: "Item PUR" },
        { title: "Seq" },
        { title: "Description" },
        { title: "Drawing No" },
        { title: "Order No." },
        { title: "Item" },
        { title: "Address" },
        { title: "Return To" },
        { title: "Q'ty" },
        { title: "Issue Card No" },
        { title: "Production" },
        { title: "Shop" },
        { title: "Remark" },
        { title: "Approve Date" },
      ],
    },
    {
      id: "#reportTable",
      domScroll: {
        status: true,
      },
    },
  );
});

$(document).on("click", "#btnSearch", async function () {
  try {
    const searchReport = {
      fromDate: $("#fromDate").val() || null,
      toDate: $("#toDate").val() || null,
      pItem: $("#pItem").val() || null,
      issueNo: $("#issueNo").val() || null,
      issueTo: $("#issueTo").val() || null,
      fromSch: $("#fromSch").val() || null,
      toSch: $("#toSch").val() || null,
    };

    const hasSearchReport = Object.values(searchReport).some(
      (value) => value !== null,
    );

    if (!hasSearchReport) {
      return;
    }

    const report = await getReport(searchReport);
    const reportWithFormNo = report.map((row) => ({
      ...row,
      formNo: `${row.VANAME}${row.list_CYEAR2.slice(-2)}-${("000000" + row.list_NRUNNO).slice(-6)}`,
    }));
    reportTable = await createTable(
      {
        responsive: false,
        data: reportWithFormNo,
        columns: [
          { data: "formNo", title: "FORM NO.", className: "text-nowrap" },
          { data: "list_PURCODE", title: "Item PUR" },
          { data: "list_ISSUESEQ", title: "Seq" },
          {
            data: "list_DESCRIPTION",
            title: "Description",
            className: "text-nowrap",
          },
          {
            data: "list_DRAWING",
            title: "Drawing No",
            className: "text-nowrap",
          },
          { data: "list_ORDERNO", title: "Order No." },
          { data: "list_ITEMNO", title: "Item" },
          { data: "list_ADDREESS", title: "Address" },
          { data: "list_RETURNTO", title: "Return To" },
          { data: "list_QTY", title: "Q'ty" },
          { data: "list_ISSUECARD", title: "Issue Card No" },
          { data: "list_PRODUCTION", title: "Production" },
          { data: "list_ISSUETO", title: "Shop" },
          { data: "list_REMARK", title: "Remark", className: "text-nowrap" },
          {
            data: "DAPVDATE",
            title: "Approve Date",
            className: "text-nowrap",
            render: function (data) {
              return data ? formatDate(data, "DD-MM-YYYY") : "";
            },
          },
        ],
      },
      {
        id: "#reportTable",
        domScroll: { status: true },
      },
    );
    console.log(report);
  } catch (error) {
    console.log(error);
  }
});

$(document).on("click", "#btnReset", async function () {
  try {
    $("#fromDate").val("");
    $("#toDate").val("");
    $("#fromSch").val("");
    $("#toSch").val("");
    $("#pItem").val("");
    $("#issueNo").val("");
    $("#issueTo").val("");
    if (reportTable) {
      reportTable.clear().draw();
    }
  } catch (error) {
    console.log(error);
  }
});

$(document).on("click", "#btnExport", async function () {
  try {
    const exportData = reportTable.rows({ search: "applied" }).data().toArray();

    const excel = await defaultExcel({
      data: exportData,
      column: [
        { key: "formNo", header: "FORM NO." },
        { key: "list_PURCODE", header: "Item PUR" },
        { key: "list_ISSUESEQ", header: "Seq" },
        { key: "list_DESCRIPTION", header: "Description" },
        { key: "list_DRAWING", header: "Drawing No" },
        { key: "list_ORDERNO", header: "Order No." },
        { key: "list_ITEMNO", header: "Item" },
        { key: "list_ADDREESS", header: "Address" },
        { key: "list_RETURNTO", header: "Return To" },
        { key: "list_QTY", header: "Q'ty" },
        { key: "list_ISSUECARD", header: "Issue Card No" },
        { key: "list_PRODUCTION", header: "Production" },
        { key: "list_ISSUETO", header: "Shop" },
        { key: "list_REMARK", header: "Remark" },
        {
          key: "DAPVDATE",
          header: "Approve Date",
          type: "date",
          numFmt: "dd-mm-yyyy",
        },
      ],
      sheetName: "PS-RP Report",
    });

    exportExcel(excel, "Revise/Return Report");
  } catch (error) {
    console.log(error);
  }
});

async function getReport(data) {
  return await fetchUtils({
    url: `${process.env.APP_API}/psform/ps-rp/getReport`,
    method: "POST",
    data,
  });
}
