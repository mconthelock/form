import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { getAllInfo } from "@amec/webasset/indexDB";
import {
  getLine,
  getStop,
  getRoute,
  getPassengerAllDetail,
  insertPassenger,
  updatePassenger,
  deletePassenger,
} from "./data.js";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";

let tableLine;
let tablePassenger;
let selectedBusId = null;
let empMode = "add"; // add | edit
let editingKey = null; // { STOP_ID, STATENO, SEMPNO }
let login_empno = null;

let BUS_LINES = [];
let BUS_STOPS = [];
let BUS_ROUTES = [];
let BUS_STOPS_BY_LINE = [];


$(document).ready(async function () {
  await initApp({ submenu: ".nav-bus" });
  await showLoader({ show: true });

  try {
    const LOGIN_USER = await getAllInfo();   // 👈 ดึงจาก IndexedDB
    console.log("Login user:", LOGIN_USER);
    console.log("EMPNO:", LOGIN_USER[0].data.SEMPNO);
    login_empno = LOGIN_USER[0].data.SEMPNO;

    const [lines, stops, routes] = await Promise.all([
      getLine(),
      getStop(),
      getRoute()
    ]);
  
    BUS_LINES = lines.filter(l => l.BUSSTATUS === "1");
    BUS_STOPS = stops;
    BUS_ROUTES = routes;
    await renderLineTable();

    if (BUS_LINES.length > 0) {
      selectedBusId = BUS_LINES[0].BUSID;
      const firstRow = tableLine.row(0);
      $(firstRow.node()).addClass("line-selected");
      showPassenger(selectedBusId);
    }
  } catch (err) {
    console.error(err);
    showMessage("โหลดข้อมูลไม่สำเร็จ", "error");
  }

  await showLoader({ show: false });
});

async function renderLineTable() {
  const opt = { ...tableOption };
  opt.data = BUS_LINES;
  opt.columns = [
    { data: "BUSNAME", title: "สายรถ" },
    {
      data: "BUSTYPE",
      title: "ประเภทรถ",
      className: "text-center",
      render: function (data) {
        if (data === "1")
          return `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-900 rounded-full">Bus</span>`;
        if (data === "2")
          return `<span class="px-2 py-1 text-xs bg-orange-100 text-purple-900 rounded-full">Van</span>`;
        return "-";
      },
    },
    { data: "BUSSEAT", title: "จำนวนที่นั่ง", className: "text-center" },
    {
      data: "IS_CHONBURI",
      title: "เส้นทางในชลบุรี",
      className: "text-center",
      render: function (data) {
        return data === "1"
          ? `<span class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Yes</span>`
          : `<span class="px-2 py-1 text-xs bg-red-100 text-pink-600 rounded-full">No</span>`;
      },
    }
  ];

  opt.createdRow = function (row, data) {
    $(row).addClass("line-row cursor-pointer hover:bg-gray-100");
  };

  tableLine = await createTable(opt, { id: "#line_emp_table" });
  
}

$(document).on("click", ".line-row", function () {
  const data = tableLine.row($(this)).data();
  selectedBusId = data.BUSID;

  $(".line-row").removeClass("line-selected");
  $(this).addClass("line-selected");
  showPassenger(selectedBusId);
});


async function showPassenger(busId) {
  if (!busId) {
    renderPassengerTable([]);
    return;
  }

  try {
    await showLoader({ show: true });
    const data = await getPassengerAllDetail({
      BUSLINE: Number(busId),
    });

    console.log("Passenger From API:", data);

    const result = data
      .filter(row => Number(row.stop?.routed?.BUSLINE) === Number(busId))
      .filter(row => row.stop?.STOP_STATUS === "1")
      .filter(row => row.Amecuserall?.CSTATUS === "1")
      .sort((a, b) =>
        parseInt(a.stop?.WORKDAY_TIMEIN || "9999") -
        parseInt(b.stop?.WORKDAY_TIMEIN || "9999")
      )
      .map(row => ({
        STOP_ID: row.stop?.STOP_ID,
        STOP_NAME: row.stop?.STOP_NAME,
        WORKDAY_TIMEIN: row.stop?.WORKDAY_TIMEIN,
        SEMPNO: row.Amecuserall?.SEMPNO,
        STNAME: row.Amecuserall?.STNAME,
        STATENO: row.STATENO
      }));

    BUS_STOPS_BY_LINE = getStopsByLine(busId, 1);
    loadStopDropdown();
    renderPassengerTable(result);
  } catch (err) {
    console.error(err);
    showMessage("โหลดข้อมูลพนักงานไม่สำเร็จ", "error");
    renderPassengerTable([]);
  } finally {
    await showLoader({ show: false });
  }
}


async function renderPassengerTable(data) {
  if (tablePassenger) {
    tablePassenger.destroy();
    $("#passenger_table").empty();
  }

  const opt = { ...tableOption };
  opt.data = data;
  opt.ordering = false;
  opt.columns = [
    {
      data: "WORKDAY_TIMEIN",
      title: "เวลา",className: "text-center",
      render: (data) => {
        if (!data) return "-";
        const str = data.toString().padStart(4, "0");
        return str.slice(0, 2) + ":" + str.slice(2, 4);
      }
    },
    { data: "STOP_NAME", title: "จุดจอด" },
    { data: "SEMPNO",className: "text-center", title: "รหัสพนักงาน" },
    { data: "STNAME", title: "ชื่อ" },
    {
      data: null, title: "จัดการ", className: "text-center",
      orderable: false,
      render: function (data, type, row) {
        return `
                    <div class="flex justify-center gap-2">
                        <button 
                            class="btn-edit-emp px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 cursor-pointer"
                            data-stop="${row.STOP_ID}" data-state="${row.STATENO}" data-empno="${row.SEMPNO}"> ✏️
                        </button>
                        <button 
                            class="btn-delete-emp px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
                             data-stop="${row.STOP_ID}" data-state="${row.STATENO}" data-empno="${row.SEMPNO}"> 🗑
                        </button>
                    </div>
                `;
      },
    },
  ];
  tablePassenger = await createTable(opt, { id: "#passenger_table" });
}


//Add Button
$(document).on("click", "#btnAddEmp", function () {
    if (!selectedBusId) {
      showMessage("กรุณาเลือกสายรถก่อน", "warning");
      return;
    }

    empMode = "add";
    editingKey = null;
    loadStopDropdown();

    $("#txtEmpno").val("");
    $("input[name='empType'][value='1']").prop("checked", true);
    $("#hdBusId").val(selectedBusId);

    BUS_STOPS_BY_LINE = getStopsByLine(selectedBusId, 1);
    loadStopDropdown();

    $("#txtEmpno").val("");
    $("#hdBusId").val(selectedBusId);

    const line = BUS_LINES.find(l => Number(l.BUSID) === Number(selectedBusId));
    $("#lblBusName").text(line?.BUSNAME || "-");
    $("#emp_modal h3").text("เพิ่มพนักงาน");
    document.getElementById("emp_modal").showModal();
});

$(document).on("change", "input[name='empType']", function () {
  const stateNo = Number($(this).val());
  BUS_STOPS_BY_LINE = getStopsByLine(selectedBusId, stateNo);
  loadStopDropdown();
});

//Edit Button
$(document).on("click", ".btn-edit-emp", function () {
    const STOP_ID = Number($(this).data("stop"));
    const STATENO = Number($(this).data("state"));
    const SEMPNO = $(this).data("empno");
    empMode = "edit";
    editingKey = { STOP_ID, STATENO, SEMPNO };

    // set radio ตาม state
    $("input[name='empType'][value='" + STATENO + "']").prop("checked", true);

    BUS_STOPS_BY_LINE = getStopsByLine(selectedBusId, STATENO);
    loadStopDropdown(STOP_ID);

    $("#txtEmpno").val(SEMPNO);
    $("#hdBusId").val(selectedBusId);

    const line = BUS_LINES.find(l => Number(l.BUSID) === Number(selectedBusId));
    $("#lblBusName").text(line?.BUSNAME || "-");

    $("#emp_modal h3").text("แก้ไขพนักงาน");
    document.getElementById("emp_modal").showModal();
});

//Delete Button
$(document).on("click", ".btn-delete-emp", async function () {
    const STOP_ID = Number($(this).data("stop"));
    const STATENO = Number($(this).data("state"));
    const SEMPNO = $(this).data("empno");
    const confirm = await showConfirm({
      title: "ยืนยันการลบ",
      message: "ต้องการลบจุดรถนี้หรือไม่?",
      acceptText: "ยืนยัน",
      cancelText: "ยกเลิก",
    });
    if (!confirm) return;
    try {
      
      await deletePassenger({
        EMPNO: String(SEMPNO),
        STATENO: Number(STATENO)
      });

      showMessage("ลบข้อมูลสำเร็จ", "success");
      showPassenger(selectedBusId);
    } catch (err) {
      console.error(err);
      showMessage("ลบข้อมูลไม่สำเร็จ", "error");
    } finally {
    }
});




function getStopsByLine(busId, stateNo) {
  const stopIds = BUS_ROUTES
    .filter(r =>
      Number(r.BUSLINE) === Number(busId) &&
      Number(r.STATENO) === Number(stateNo)
    )
    .map(r => Number(r.STOPNO));
  return BUS_STOPS
    .filter(s =>
      stopIds.includes(Number(s.STOP_ID)) &&
      s.STOP_STATUS === "1"
    )
    .sort((a, b) =>
      parseInt(a.WORKDAY_TIMEIN ?? 9999) -
      parseInt(b.WORKDAY_TIMEIN ?? 9999)
    );
}

function loadStopDropdown(selectedStopId = null) {
  const ddl = $("#ddlStop");
  ddl.empty();
  ddl.append(`<option value="">-- เลือกจุดจอด --</option>`);
  BUS_STOPS_BY_LINE.forEach(stop => {
    const time = stop.WORKDAY_TIMEIN
      ? stop.WORKDAY_TIMEIN.toString().padStart(4, "0")
      : "-";

    const label = `${time.slice(0,2)}:${time.slice(2,4)} : ${stop.STOP_NAME}`;
    ddl.append(`<option value="${stop.STOP_ID}">${label}</option>`);
  });

  if (selectedStopId) {  ddl.val(selectedStopId);  }
}


$(document).on("click", "#btnSaveEmp", async function () {
    const empno = $("#txtEmpno").val().trim();
    const stopId = Number($("#ddlStop").val());
    const stateNo = Number($("input[name='empType']:checked").val());
    if (!empno || !stopId) {
      showMessage("กรุณากรอกข้อมูลให้ครบ", "warning");
      return;
    }

    try {
      await showLoader({ show: true });
        const payload_passenger = {
          EMPNO: empno,
          BUSSTOP: Number(stopId),
          STATENO: Number(stateNo),
          UPDATE_BY: login_empno,
        };
        console.log(payload_passenger);
      if (empMode === "add") {
        await insertPassenger(payload_passenger);
        showMessage("บันทึกข้อมูลสำเร็จ", "success");
      } else {
        await updatePassenger(payload_passenger);
        showMessage("แก้ไขข้อมูลสำเร็จ", "success");
      }

      document.getElementById("emp_modal").close();
      showPassenger(selectedBusId);
    } catch (err) {
      console.error(err);
      showMessage("บันทึกข้อมูลไม่สำเร็จ", "error");
    } finally {
      await showLoader({ show: false });
    }
});
