import { showLoader } from "@amec/webasset/preloader";
import { logFormData, requiredForm, showMessage } from "@amec/webasset/utils";
import { createTable, newRow } from "@amec/webasset/dataTable";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { webflowSubmit } from "@amec/webasset/components/form";
import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { redirectWebflow } from "@amec/webasset/form";

/*--------------------READY FUNCTION--------------------*/

$(async function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const empno = urlParams.get("empno");
  const getsec = await getData(empno);
  let prefix = "";
  try {
    prefix = getsec.SSECCODE;
  } catch (error) {
    console.log("Error extracting SSECCODE:", error);
  }

  console.log("Prefix ที่ได้คือ:", prefix);
  $("#INPUTBY").val(empno);
  setDatePicker({
    element: "#EffDate",
  });
  setDatePicker({
    element: "#RetDate",
  });
  $("#RetDate").prop("disabled", true);
  const action = webflowSubmit({ request: true });

  console.log(action);
  $("#actionform").html(action);
  createTableStamp();
});

/*--------------------Change FUNCTION--------------------*/
$(document).on("change", "#REQBY", async function () {
  const empnum = $(this).val();
  if (!empnum) return;
  try {
    const getsec = await getData(empnum);
    console.log("ข้อมูลที่ได้จาก API:", getsec);

    if (getsec && getsec.SSECCODE === "040402") {
      console.log("เป็น FIN staff:", getsec.SSECCODE);
      $("#Pos").text("FIN Staff");
      $("#OPT").removeClass("hidden");
    } else {
      console.log("ไม่ใช่ FIN staff:", getsec?.SSECCODE);
      $("#Pos").text("Employee");
      $("#OPT").addClass("hidden");
    }
    $("#FULLDP").val(getsec.SDIV + "/" + getsec.SDEPT + "/" + getsec.SSEC);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดตอนเรียก API:", error);
    $("#Pos").text("Error");
  }
});
export async function getData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}

async function getStamp() {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds`,
    method: "GET",
  });
}
var table, mapColumns;
var dutyStampList = [];

function numberValue(value) {
  if (typeof value === "string") {
    return Number(value.replace(/[\$,]/g, "")) || 0;
  }

  return Number(value) || 0;
}

async function createTableStamp(data = []) {
  mapColumns = [...columns];

  const stamp = await getStamp();
  console.log(stamp);
  dutyStampList = stamp;
  console.log(dutyStampList);
  const length = stamp.length * 2;
  console.log(length);

  let html = `<thead>
    <tr>
        <th rowspan="3">No.</th>
        <th rowspan="3">Reason for requisition</th>
        <th colspan="${length}">Duty stamp</th>
    </tr><tr>`;

  const s = stamp
    .map((a) => {
      return `<th colspan="2">${a.DUTY_VALUE}</th>`;
    })
    .join("");
  html += s + "</tr><tr>";
  const subHeader = ["QTY", "AMT"];
  for (let i = 0; i < length / 2; i++) {
    html += `<th>${subHeader[0]}</th><th>${subHeader[1]}</th>`;
    mapColumns.push({ data: `DUTY_QTY${i + 1}` });
    mapColumns.push({ data: `DUTY_AMT${i + 1}` });
  }

  html += "</tr></thead>";
  html += `<tfoot><tr>`;
  html += `<th colspan="2" style="text-align:right;">Total:</th>`; // ควบ No. และ Reason เป็นช่องเดียว
  for (let i = 0; i < length; i++) {
    html += `<th>0</th>`; // สร้าง <th> เปล่าๆ รอรับค่า Total ตามจำนวนคอลัมน์ QTY และ AMT
  }
  html += `</tr></tfoot>`;
  $("#stampTable").html(html);

  table = await createTable(
    {
      data: data,
      columns: mapColumns,
      footerCallback: function (row, data, start, end, display) {
        let api = this.api();

        // Helper function สำหรับแปลงค่าเป็นตัวเลข (กัน error กรณีเป็น string หรือค่าว่าง)
        let intVal = function (i) {
          return typeof i === "string"
            ? i.replace(/[\$,]/g, "") * 1
            : typeof i === "number"
              ? i
              : 0;
        };

        // ลูปหาผลรวมของแต่ละคอลัมน์ เริ่มจาก index 2 (คอลัมน์ QTY แรก) ข้าม 0 (No) และ 1 (Reason)
        for (let i = 2; i < mapColumns.length; i++) {
          let total = api
            .column(i)
            .data()
            .reduce(function (a, b) {
              return intVal(a) + intVal(b);
            }, 0);

          // อัปเดตค่าลงใน <tfoot> ของคอลัมน์นั้นๆ
          $(api.column(i).footer()).html(total);
        }
      },
    },
    {
      id: "stampTable",
      inlineEdit: {
        status: true,
        disabledColumns: [0],
        matchers: [
          {
            match: { startsWith: "DUTY_QTY" },
            validate: ({ value }) => {
              console.log(typeof +value, Number.isNaN(+value));

              if (isNaN(value) || value < 0 || Number.isNaN(+value)) {
                return "Please enter a valid non-negative number";
              }
              return true;
            },
            async onSuccess({ value, table, cell, rowData }) {
              console.log(value);
              const cellIndex = cell.index();
              const columnName = table.column(cellIndex.column).dataSrc();
              const index = columnName.replace("DUTY_QTY", "");
              const amtColumn = `DUTY_AMT${index}`;
              const dutyValue = stamp[Number(index) - 1].DUTY_VALUE;
              const qty = Number(value);
              const calculatedAmt = qty * dutyValue;
              rowData[columnName] = qty;
              rowData[amtColumn] = calculatedAmt;
              table.row(cell.index().row).data(rowData).draw(false);
            },
          },
          {
            match: { startsWith: "DUTY_AMT" },
            disabled: true,
          },
        ],
        onError: ({ error, table, cell }) => {
          console.error(error);
          showMessage(error.message, "warning");
        },
      },
    },
  );
  console.log(table);
}

const columns = [{ data: "LINEID" }, { data: "REASON" }];

$(document).on("click", "#addStampRow", async function () {
  console.log(table.rows().data().toArray());
  const data = table.rows().data().toArray();
  const newLineId = data.length + 1;
  let emptyData = {};
  mapColumns.forEach((col) => {
    if (col.data === "LINEID") {
      emptyData[col.data] = newLineId;
    } else {
      emptyData[col.data] = "";
    }
  });
  newRow(table, emptyData);
});
/*--------------------Check Before Submit--------------------*/

$(document).on("click", "#btnRequest", async function (e) {
  e.preventDefault();

  try {
    const requiredMessage = [
      { element: $("#REQBY"), message: "Please enter your Emp code." },
      { element: $("#FULLDP"), message: "Please enter your Emp code" },
      { element: $("#EffDate"), message: "Please Choose Date" },
      { element: $("#location"), message: "Please enter Collection Location" },
    ];

    if (!(await requiredForm("#form", requiredMessage))) return;

    const rows = table.rows().data().toArray();

    const dataList = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.REASON || row.REASON.toString().trim() === "") {
        showMessage(
          `Please enter Reason for requisition in row ${i + 1}`,
          "warning",
        );
        return;
      }

      let hasQty = false;

      dutyStampList.forEach((stampItem, stampIndex) => {
        const index = stampIndex + 1;
        const qty = numberValue(row[`DUTY_QTY${index}`]);

        if (qty > 0) {
          hasQty = true;

          const dutyValue = stampItem?.DUTY_VALUE;

          if (
            dutyValue === undefined ||
            dutyValue === null ||
            dutyValue === ""
          ) {
            throw new Error(`Duty value not found in row ${i + 1}`);
          }

          dataList.push({
            LINE_ID: row.LINEID,
            REASON: row.REASON,
            DUTY_VALUE: dutyValue,
            QTY: qty,
            AMT:
              numberValue(row[`DUTY_AMT${index}`]) ||
              qty * numberValue(dutyValue),
          });
        }
      });

      if (!hasQty) {
        showMessage(
          `Please enter at least one Duty Stamp QTY in row ${i + 1}`,
          "warning",
        );
        return;
      }
    }

    const formData = new FormData();

    formData.set("INPUTBY", $("#INPUTBY").val() || "");
    formData.set("REQBY", $("#REQBY").val() || "");
    formData.set("REMARK", $("#REMARK").val() || "");
    formData.set(
      "OPTION_CODE",
      String($("input[name='OPTION_CODE']:checked").val() || "0"),
    );
    formData.set("EFFECTIVE_DATE", $("#EffDate").val() || "");
    formData.set("LOCATION", $("#location").val() || "");

    formData.set("DATA", JSON.stringify(dataList));

    const files = $("#attachfile")[0]?.files || [];

    for (const file of files) {
      formData.append("attachfile", file);
    }

    logFormData(formData);

    const res = await createForm(formData);
    console.log(res);

    if (res?.status === false) {
      throw new Error(res?.message || "Cannot submit request");
    }

    showMessage(res?.message || "Request submitted successfully", "success");
    redirectWebflow();
  } catch (error) {
    console.error(error);
    showMessage(error.message, "error");
  }
});

export async function createForm(formData) {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds`,
    method: "POST",
    data: formData,
  });
}
