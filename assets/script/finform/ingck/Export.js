async function exportStampReport(response) {
  const data = response.datareport;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Stamp Report");

  // ✅ Title
  sheet.mergeCells("A1:AA1");
  sheet.getCell("A1").value = `Control Duty Stamp Report of FY${data[0].FYEAR}`;
  sheet.getCell("A1").font = { bold: true, size: 14 };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  // ✅ Header
  sheet.mergeCells("A2:A4");
  sheet.getCell("A2").value = "D/M/Y";

  sheet.mergeCells("B2:B4");
  sheet.getCell("B2").value = "Detail";

  sheet.mergeCells("C2:J2");
  sheet.getCell("C2").value = "Quality of duty stamp (Buy)";

  sheet.mergeCells("K2:R2");
  sheet.getCell("K2").value = "Quality of duty stamp (Withdraw)";

  sheet.mergeCells("S2:Z2");
  sheet.getCell("S2").value = "Remaining";

  sheet.mergeCells("AA2:AA4");
  sheet.getCell("AA2").value = "Balance Q'ty";

  const sizes = [1, 5, 10, 20];

  let col = 3;

  // ✅ Header Level 2 + 3
  ["BUY", "WD", "RM"].forEach((section) => {
    sizes.forEach((size) => {
      // Row 2
      sheet.mergeCells(2, col, 2, col + 1);
      sheet.getCell(2, col).value = size;

      // Row 3
      sheet.getCell(3, col).value = "Qty";
      sheet.getCell(3, col + 1).value = "Amt";

      col += 2;
    });
  });

  // ✅ Function format date
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getDate()}-${d.toLocaleString("en", { month: "short" })}-${d.getFullYear().toString().slice(2)}`;
  }

  // ✅ Running Balance
  let balance = {
    1: 0,
    5: 0,
    10: 0,
    20: 0,
  };

  let rowIndex = 5;

  data.forEach((item) => {
    const row = sheet.getRow(rowIndex);

    row.getCell(1).value = formatDate(item.DATE_RECEIVE);
    row.getCell(2).value = item.REASON || "รายการ";

    let colIndex = 3;

    // ✅ BUY
    sizes.forEach((s) => {
      const qty = item[`BUY_${s}_QTY`] || 0;
      const amt = item[`BUY_${s}_AMT`] || 0;

      row.getCell(colIndex).value = qty;
      row.getCell(colIndex + 1).value = amt;

      balance[s] += qty;

      colIndex += 2;
    });

    // ✅ WITHDRAW
    sizes.forEach((s) => {
      const qty = item[`WD_${s}_QTY`] || 0;
      const amt = item[`WD_${s}_AMT`] || 0;

      row.getCell(colIndex).value = qty;
      row.getCell(colIndex + 1).value = amt;

      balance[s] -= qty;

      colIndex += 2;
    });

    // ✅ REMAINING
    sizes.forEach((s) => {
      row.getCell(colIndex).value = balance[s];
      colIndex += 2;
    });

    // ✅ Balance Qty (sum)
    row.getCell(27).value =
      balance[1] + balance[5] + balance[10] + balance[20];

    rowIndex++;
  });

  // ✅ border
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  });

  // ✅ Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Stamp_Report.xlsx";
  link.click();
}
