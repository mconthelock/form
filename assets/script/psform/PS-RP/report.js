import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { createTable } from "@amec/webasset/dataTable";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { getUrlParams, showMessage } from "@amec/webasset/utils";
import { data } from "jquery";
import { getEmpData, getFormData } from "./data";
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
        { title: "Request By" },
        { title: "Issue Card No" },
        { title: "Item PUR" },
        { title: "Item" },
        { title: "Order No." },
        { title: "Production" },
        { title: "Q'ty" },
        { title: "Shop" },
        { title: "Remark" },
        { title: "Approve Date" },
        // { title: "Seq" },
        // { title: "Description" },
        // { title: "Drawing No" },
        
        // { title: "Address" },
        // { title: "Return To" },
        
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
    const reqNos = [...new Set(report.map((row) => row.VREQNO).filter(Boolean))];
    const reqDatas = await Promise.all(reqNos.map((empno) => getEmpData(empno)));
    const reqMap = reqNos.reduce((acc, empno, index) => {
      acc[empno] = reqDatas[index]?.SNAME || "";
      return acc;
    }, {});
    const reportWithFormNo = report.map((row) => ({
      ...row,
      formNo: `${row.VANAME}${row.list_CYEAR2.slice(-2)}-${("000000" + row.list_NRUNNO).slice(-6)}`,
      reqBy: row.VREQNO ? `${row.VREQNO}_${reqMap[row.VREQNO] || ""}` : "",
    }));
    reportTable = await createTable(
      {
        responsive: false,
        data: reportWithFormNo,
        columns: [
          { data: "formNo", title: "FORM NO.", className: "text-nowrap" },
          { data: "reqBy", title: "Request By", className: "text-nowrap" },
          { data: "list_ISSUECARD", title: "Issue Card No" },
          { data: "list_PURCODE", title: "Item PUR" },
          { data: "list_ITEMNO", title: "Item" },
          // { data: "list_ISSUESEQ", title: "Seq" },
          // {
          //   data: "list_DESCRIPTION",
          //   title: "Description",
          //   className: "text-nowrap",
          // },
          // {
          //   data: "list_DRAWING",
          //   title: "Drawing No",
          //   className: "text-nowrap",
          // },
          { data: "list_ORDERNO", title: "Order No." },
          { data: "list_PRODUCTION", title: "Production" },
          { data: "list_QTY", title: "Q'ty" },
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
          // { data: "list_ADDREESS", title: "Address" },
          // { data: "list_RETURNTO", title: "Return To" },
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
    if (!reportTable) {
      return showMessage("Cannot export data because the data table is empty");
    }
    const exportData = reportTable.rows({ search: "applied" }).data().toArray();

    if (exportData.length === 0) {
      return showMessage("Cannot export data because the data table is empty");
    }


    const excel = await defaultExcel({
      data: exportData,
      column: [
        { key: "formNo", header: "FORM NO." },
        { key: "reqBy", header: "Request By" },
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

    exportExcel(excel, "Revise_Return WHI Report");
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
