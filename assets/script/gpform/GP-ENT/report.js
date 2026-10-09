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
    const setHeaderStyle = (row) => {
      for (let i = 1; i <= row.cellCount; i++) {
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

    const addDataRow = (sheet, values) => {
      const row = sheet.addRow(values);
      row.eachCell((cell) => (cell.alignment = { vertical: "middle", wrapText: true }));
      setBorder(row);
    };

    const sheet = workbook.addWorksheet("Entertainment & Clearance");
    sheet.addRow([
      "Requester ENT", "Section", "Form no. ENT", "Entertainment Date", "Time/Location", "Purpose", "Details of guest" , "Quantity of guest & จำนวน",
      "ฝ่าย GUEST","ฝ่าย AMEC", "Main Approver", "Status Form",
      "วันที่ CLEAR", "Requester CLEAR", "Section CLEAR", "Form no. CLEAR",
      "Clearance Date", "Receipt no","Actual Cost", "Remain",
      "Main Approver",
    ]);
    setHeaderStyle(sheet.getRow(1));

    data.forEach((item) => {
      const guests = Array.isArray(item.guest) ? item.guest : [];
      const detailGuests = (item.detail_guest || [])
        .map((guest) => `${guest.COMPANY_NAME || ""} (${guest.COMPANY_TYPE === "1" ? "Non-Government" : "Government"})`)
        .join(",\r\n");
      const estimateCost = (item.estimate_cost || [])
        .map((cost) => `${cost.DETAILS || ""} (${cost.QTY || 0} x ${cost.UNIT_COST || 0}/person = ${cost.TOTAL_COST || 0})`)
        .join(",\r\n");
      const guestNames = guests
        .filter((guest) => guest.TYPE === "guest")
        .map((guest, index) => `${index + 1}. ${guest.NAME || ""}`)
        .join("\r\n");
      const amecGuests = guests
        .filter((guest) => guest.TYPE === "amec")
        .map((guest, index) => `${index + 1}. ${guest.STNAME || guest.SNAME || ""}`)
        .join("\r\n");
      const amecRequester = guests.find((guest) => guest.TYPE === "amec");
      const receipts = Array.isArray(item.RECEIPT) ? item.RECEIPT : [];
      const receiptList = receipts.map((receipt) => `${receipt.RECEIPT || ""} / ${receipt.COST ?? 0}฿`).join("\r\n");
      const receiptTotal = receipts.reduce((sum, receipt) => sum + (Number(receipt.COST) || 0), 0);
      const actualCost = Number(item.ACTUAL_COST);
      const totalAmount = Number(item.TOTAL_AMOUNT);
      const hasClearance = Boolean(item.FORM_NUMBER_CLEAR || item.ACTUAL_COST != null || receipts.length > 0);

      addDataRow(sheet, [
        item.SNAME ?? "",
        item?.SSEC ?? "",
        item.FORM_NUMBER_ENT ?? "",
        item.ENTERTAINMENT_DATE ?? "",
        item.TYPE_TIME ?? "" + " / " + (item.LOCATION_TYPE ?? ""),
        item.PURPOSE ?? "",
        detailGuests,
        estimateCost,
        guestNames,
        amecGuests,
        item.ENT_APV,
        item.ENT_STATUS === '1' ? "Pending" : "Success",
        hasClearance ? item.CLEARANCE_DATE ?? "" : "",
        hasClearance ? item.SNAME ?? "" : "",
        hasClearance ? item.SSEC ?? "" : "",
        hasClearance ? item.FORM_NUMBER_CLEAR ?? "" : "",
        hasClearance ? item.PAYDATE ?? "" : "",
        hasClearance ? receiptList : "",
        hasClearance ? item.ACTUAL_COST ?? "" : "",
        hasClearance && item.ACTUAL_COST != null && item.ACTUAL_COST !== "" && Number.isFinite(totalAmount) && Number.isFinite(actualCost)
          ? totalAmount - actualCost
          : "",
        hasClearance ? item.CLR_APV : "", 
      ]);
    });

    [12, 22, 16, 22, 16, 16, 24, 25, 20, 34, 28, 24, 12, 22, 16, 22, 16, 22, 12, 26, 14, 12, 20, 38]
      .forEach((width, index) => (sheet.getColumn(index + 1).width = width));

    // Download section
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Entertainment_Clearance_Report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  $("#search_btn").on("click", function (e) {
    e.preventDefault();

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
        if (!Array.isArray(response) || response.length === 0) {
          alert("ไม่พบข้อมูล");
          return;
        }
        exportEntertainmentReport(response);
      },
      error: function (xhr, status, error) {
        console.error("Failed to load report:", status, error, xhr.responseText);
        alert("ดึงข้อมูลรายงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
