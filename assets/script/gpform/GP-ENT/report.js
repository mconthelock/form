import Litepicker from "litepicker";
import select2 from "select2";
// import "select2/dist/css/select2.min.css";
import ExcelJS from "exceljs";
import { host } from "../../utils.js";
import { s2disableSearch, s2opt, setSelect2 } from "@amec/webasset/select2";

select2();
const daterangeInput = $("#daterange")[0];

new Litepicker({
  element: daterangeInput,
  singleMode: false,
  numberOfMonths: 2,
  numberOfColumns: 2,
  format: "DD/MM/YYYY",
});

$(function () {
  $(".select2").select2({
    theme: "default",
  });

  async function exportEntertainmentReport(data) {
    const workbook = new ExcelJS.Workbook();
    let file_name = "";
    const setHeaderStyle = (row) => {
      for (let i = 1; i <= 12; i++) {
        const cell = row.getCell(i);
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF00" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    };

    // ใส่ border ให้ทุก cell ในแถว
    function setBorder(row) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }

    if (data[0].ENTERTAIN_TYPE === "type1") {
      file_name = "Entertainment";
      const sheet = workbook.addWorksheet("Requesting Approval");
      sheet.addRow(["วันที่ส่ง", "Requester", "แผนก", "Form no.", "Entertainment Date", "Time/Location", "Purpose", "Details of guest", "Guest type & Type of Guest", "Estimate cost (Detail:Amount/Cost per Person)", "Quantity of guest & จำนวน", "ฝ่าย AMEC"]);
      setHeaderStyle(sheet.getRow(1));

      data.forEach((item) => {
        const detailGuests = (item.detail_guest || []).map((d) => `${d.COMPANY_NAME} (${d.COMPANY_TYPE === "1" ? "Non-Government" : "Government"})`).join(",\r\n");
        const estimateCost = (item.estimate_cost || []).map((d) => `${d.DETAILS} (${d.UNIT_COST}/person)`).join(",\r\n");
        let guestCount = 0,
          amecCount = 0;
        const guest = (item.guest || [])
          .filter((g) => g.TYPE === "guest")
          .map((g) => `${++guestCount}. ${g.NAME}`)
          .join("\r\n");
        const amec = (item.guest || [])
          .filter((g) => g.TYPE === "amec")
          .map((g) => `${++amecCount}. ${g.STNAME}`)
          .join("\r\n");

        const newRow = sheet.addRow([item.ENTERTAINMENT_DATE, item.STNAME, item.SDEPT, item.FORM_NUMBER, item.ENTERTAINMENT_DATE, item.LOCATION_TYPE, item.PURPOSE, detailGuests, item.TYPE_NAME, estimateCost, guest, amec]);
        newRow.eachCell((cell) => (cell.alignment = { vertical: "middle", wrapText: true }));
        setBorder(newRow);
      });

      // Set column widths
      [12, 22, 12, 18, 11, 16, 20, 20, 18, 25, 18, 24].forEach((w, i) => (sheet.getColumn(i + 1).width = w));
    } else if (data[0].ENTERTAIN_TYPE === "type2") {
      file_name = "clearance";
      const sheet = workbook.addWorksheet("Clearance Expense");
      sheet.addRow(["วันที่", "Requester", "Section", "Form no.", "Clearance Date", "Receipt no", "Cost", "President (Join / Not Join)", "Actual Cost", "Remain", "Remark", "Status (Return cash to company / Reimbursement to Employee)"]);
      setHeaderStyle(sheet.getRow(1));

      data.forEach((item) => {
        const receiptList = (item.RECEIPT || []).map((r) => `${r.RECEIPT} / ${r.COST}฿`).join("\r\n");
        const sum = (item.RECEIPT || []).reduce((s, r) => s + Number(r.COST), 0);

        const newRow = sheet.addRow([item.DREQDATE, item.STNAME, item.SSEC, item.FORM_NUMBER, item.DREQDATE, receiptList, sum, item.PRESIDENT_JOIN === "1" ? "join" : "NotJoin", item.ACTUAL_COST ?? "", item.REMAIN_BUDGET ?? "", item.REMARK ?? "", ""]);
        newRow.eachCell((cell) => (cell.alignment = { vertical: "middle", wrapText: true }));
        setBorder(newRow);
      });

      [12, 15, 12, 19, 16, 19, 10, 20, 12, 10, 16, 32].forEach((w, i) => (sheet.getColumn(i + 1).width = w));
    }

    // Download section
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file_name + "_Report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  $("#search_btn").on("click", function (e) {
    e.preventDefault();

    const entertainType = $("#entertain_type").val();
    if (!entertainType) {
      // $(".alert-error").removeClass("hidden");
      // $(".alert-error").fadeIn().delay(3000).fadeOut();
      $(".alert-error").fadeIn().delay(3000).fadeOut();
      return;
    }
    const empCode = $("#emp_code").val();
    const section = $("#section").val();
    const department = $("#department").val();
    const division = $("#division").val();
    const daterange = $("#daterange").val(); // ตัวอย่าง "01/07/2024 - 31/07/2024"

    console.log(daterange);
    // แยก start/end date จาก daterange
    let startDate = "";
    let endDate = "";
    if (daterange && daterange.includes("-")) {
      [startDate, endDate] = daterange.split("-").map((v) => {
        const [day, month, year] = v.trim().split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      });
    }

    // console.log(startDate, endDate);

    const formData = new FormData();
    formData.append("type", entertainType);
    formData.append("SEMPNO", empCode);
    formData.append("SSECCODE", section);
    formData.append("SDEPCODE", department);
    formData.append("SDIVCODE", division);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);

    $.ajax({
      type: "POST",
      url: host + "gpform/GP-ENT/report/get_report",
      data: formData,
      dataType: "json",
      processData: false, // <== สำคัญ
      contentType: false,
      beforeSend: function () {
        $("#loading-overlay").removeClass("hidden"); // <<== show loading
      },
      success: function (response) {
        if (response.length == 0) {
          alert("ไม่พบข้อมูล");
          return;
        } else {
          const data = response.map((item) => ({
            ...item,
            ENTERTAIN_TYPE: entertainType,
          }));
          console.log(data);
          exportEntertainmentReport(data);
        }
      },
      complete: function () {
        $("#loading-overlay").addClass("hidden"); // <<== hide loading ไม่ว่าจะ success หรือ error
      },
    });

    // exportEntertainmentReport({
    //   entertainType,
    //   empCode,
    //   section,
    //   department,
    //   division,
    //   startDate,
    //   endDate,
    // });
  });
});
