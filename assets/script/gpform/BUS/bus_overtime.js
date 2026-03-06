import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";
import {
  dispatchGetDispatch,
  dispatchSaveOverwrite,
  getLine,
  getStop,
} from "./data.js";

const dom = {
  workdate: "#dd_workdate",
  type: "#dd_type",
  sumLines: "#sumLines",
  sumStops: "#sumStops",
  sumPassengers: "#sumPassengers",
  lblSelectedLine: "#lblSelectedLine",
  lblSelectedStop: "#lblSelectedStop",
  tblLine: "#tblLine",
  tblStop: "#tblStop",
  tblPassenger: "#tblPassenger",
  btnAddStop: "#btnAddStop",
  btnAddPassenger: "#btnAddPassenger",
  btnSaveDispatch: "#btnSaveDispatch",
};

const state = {
  snapshot: null,
  head: null,
  lines: [],
  selectedLine: null,
  selectedStop: null,
};

let tableLine;
let tableStop;
let tablePassenger;

$(document).ready(async function () {
  await initApp();
  await showLoader({ show: true });

  try {
    $(dom.workdate).val(todayYMD());
    $(dom.type).val("OT");

    await initTables();
    bindEvents();
    await loadDispatch();
  } catch (error) {
    console.error(error);
    showMessage("เกิดข้อผิดพลาดในการเริ่มต้นหน้า", "error");
  } finally {
    await showLoader({ show: false });
  }
});

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mapShift(uiType) {
  if (uiType === "OT") return "D";
  if (uiType === "NIGHT") return "N";
  if (uiType === "HOLIDAY") return "H";
  return "D";
}

function makeDtoGetDispatch() {
  return {
    workdate: $(dom.workdate).val(),
    dispatch_type: "O",
    shift: mapShift($(dom.type).val()),
  };
}

function setSelectedLineLabel(line) {
  $(dom.lblSelectedLine).text(
    line ? `Selected: ${line.busname || line.busid || "-"}` : "Selected: -",
  );
}

function setSelectedStopLabel(stop) {
  $(dom.lblSelectedStop).text(
    stop ? `Selected: ${stop.stop_name || stop.stop_id || "-"}` : "Selected: -",
  );
}

function updateSummary() {
  const totalLines = state.lines.length;
  const totalStops = state.lines.reduce(
    (sum, line) => sum + ((line.stops || []).length),
    0,
  );
  const totalPassengers = state.lines.reduce((sum, line) => {
    return (
      sum +
      (line.stops || []).reduce((stopSum, stop) => {
        return stopSum + ((stop.passengers || []).length);
      }, 0)
    );
  }, 0);

  $(dom.sumLines).text(totalLines);
  $(dom.sumStops).text(totalStops);
  $(dom.sumPassengers).text(totalPassengers);
}

async function initTables() {
  const lineOpt = await lineOptions([]);
  tableLine = await createTable(lineOpt, { id: dom.tblLine });

  const stopOpt = await stopOptions([]);
  tableStop = await createTable(stopOpt, { id: dom.tblStop });

  const passengerOpt = await passengerOptions([]);
  tablePassenger = await createTable(passengerOpt, { id: dom.tblPassenger });

  $(dom.btnAddStop).prop("disabled", true);
  $(dom.btnAddPassenger).prop("disabled", true);
  setSelectedLineLabel(null);
  setSelectedStopLabel(null);
}

async function lineOptions(data) {
  const opt = { ...tableOption };
  opt.data = data;
  opt.searching = false;
  opt.paging = false;
  opt.info = false;
  opt.columns = [
    {
      data: null,
      title: "สายรถ",
      render: function (data, type, row) {
        return row.busname || row.busid || "-";
      },
    },
    {
      data: "busseat",
      title: "จำนวนที่นั่ง",
      className: "text-center",
      width: "80px",
      defaultContent: "-",
    },
    {
      data: "bustype",
      title: "ประเภท",
      className: "text-center",
      width: "80px",
      render: function (data) {
        if (data === "1") {
          return `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-900 rounded-full">Bus</span>`;
        }
        if (data === "2") {
          return `<span class="px-2 py-1 text-xs bg-orange-100 text-purple-900 rounded-full">Van</span>`;
        }
        return data || "-";
      },
    },
    /*
    {
      data: "stops",
      title: "STOP",
      className: "text-center",
      width: "80px",
      render: function (data) {
        return data?.length || 0;
      },
    },*/
  ];
  opt.createdRow = function (row) {
    $(row).addClass("line-row cursor-pointer hover:bg-gray-100 transition");
  };
  return opt;
}

async function stopOptions(data) {
  const opt = { ...tableOption };
  opt.data = data;
  opt.searching = false;
  opt.paging = false;
  opt.info = false;
  opt.columns = [
    /*{
      data: "stop_id",
      title: "STOP_ID",
      className: "text-center",
      width: "90px",
      defaultContent: "-",
    },*/
    {
      data: "stop_name",
      title: "จุดรถ",
      defaultContent: "-",
    },
    {
      data: "plan_time",
      title: "เวลา",
      className: "text-center",
      width: "90px",
      defaultContent: "-",
    },
    {
      data: null,
      title: "ผู้โดยสาร(คน)",
      className: "text-center",
      render: function (data, type, row) {
        const count = row.passengers?.length || 0;
        return `<span class="pax-badge">${count}</span>`;
      }
    },
  ];
  opt.createdRow = function (row) {
    $(row).addClass("stop-row cursor-pointer hover:bg-gray-100 transition");
  };
  return opt;
}

async function passengerOptions(data) {
  const opt = { ...tableOption };
  opt.data = data;
  opt.searching = false;
  opt.paging = false;
  opt.info = false;
  opt.columns = [
    {
      data: "empno",
      title: "รหัสพนักงาน",
      width: "120px",
      defaultContent: "-",
    },
    {
      data: "thainame",
      title: "ชื่อพนักงาน",
      defaultContent: "-",
    },
  ];
  return opt;
}

async function renderLineTable(data) {
  if (tableLine) {
    tableLine.destroy();
    $(dom.tblLine).empty();
  }

  const lineOpt = await lineOptions(data);
  tableLine = await createTable(lineOpt, { id: dom.tblLine });
}

async function renderStopTable(data) {
  if (tableStop) {
    tableStop.destroy();
    $(dom.tblStop).empty();
  }

  const stopOpt = await stopOptions(data);
  tableStop = await createTable(stopOpt, { id: dom.tblStop });
}

async function renderPassengerTable(data) {
  if (tablePassenger) {
    tablePassenger.destroy();
    $(dom.tblPassenger).empty();
  }

  const passengerOpt = await passengerOptions(data);
  tablePassenger = await createTable(passengerOpt, { id: dom.tblPassenger });
}

function clearRightSelection() {
  state.selectedLine = null;
  state.selectedStop = null;
  setSelectedLineLabel(null);
  setSelectedStopLabel(null);
  $(dom.btnAddStop).prop("disabled", true);
  $(dom.btnAddPassenger).prop("disabled", true);
}

async function loadDispatch() {
  await showLoader({ show: true });

  try {
    const dto = makeDtoGetDispatch();

    if (!dto.workdate) {
      showMessage("กรุณาเลือกวันที่", "warning");
      return;
    }

    const res = await dispatchGetDispatch(dto);

    state.snapshot = res;
    state.head = {
      dispatch_id: res.dispatch_id,
      workdate: res.workdate,
      dispatch_type: res.dispatch_type,
      shift: res.shift,
      status: res.status,
      update_by: res.update_by,
      update_date: res.update_date,
    };
    state.lines = res.lines || [];

    updateSummary();
    clearRightSelection();

    await renderLineTable(state.lines);
    await renderStopTable([]);
    await renderPassengerTable([]);

    if (state.lines.length > 0) {
      await selectLine(state.lines[0], 0);
    }
  } catch (error) {
    console.error(error);
    showMessage(error?.message || "โหลดข้อมูลไม่สำเร็จ", "error");
  } finally {
    await showLoader({ show: false });
  }
}

async function selectLine(line, rowIndex = null) {
  state.selectedLine = line;
  state.selectedStop = null;

  setSelectedLineLabel(line);
  setSelectedStopLabel(null);

  $(dom.btnAddStop).prop("disabled", false);
  $(dom.btnAddPassenger).prop("disabled", true);

  await renderStopTable(line.stops || []);
  await renderPassengerTable([]);

  $(".line-row").removeClass("line-selected");
  if (rowIndex !== null && tableLine?.row(rowIndex).node()) {
    $(tableLine.row(rowIndex).node()).addClass("line-selected");
  }

  if ((line.stops || []).length > 0) {
    await selectStop(line.stops[0], 0);
  }
}

async function selectStop(stop, rowIndex = null) {
  state.selectedStop = stop;
  setSelectedStopLabel(stop);
  $(dom.btnAddPassenger).prop("disabled", false);

  await renderPassengerTable(stop.passengers || []);

  $(".stop-row").removeClass("line-selected");
  if (rowIndex !== null && tableStop?.row(rowIndex).node()) {
    $(tableStop.row(rowIndex).node()).addClass("line-selected");
  }
}

function bindEvents() {
  $(dom.workdate).on("change", async function () {
    await loadDispatch();
  });

  $(dom.type).on("change", async function () {
    await loadDispatch();
  });

  $(document).on("click", ".line-row", async function (e) {
    e.preventDefault();

    try {
      const rowIndex = tableLine.row(this).index();
      const data = tableLine.row(this).data();
      await selectLine(data, rowIndex);
    } catch (error) {
      console.error(error);
      showMessage("Failed to load line details", "error");
    }
  });

  $(document).on("click", ".stop-row", async function (e) {
    e.preventDefault();

    try {
      const rowIndex = tableStop.row(this).index();
      const data = tableStop.row(this).data();
      await selectStop(data, rowIndex);
    } catch (error) {
      console.error(error);
      showMessage("Failed to load stop details", "error");
    }
  });

  $(dom.btnAddStop).on("click", function () {
    if (!state.selectedLine) {
      showMessage("กรุณาเลือก BUS LINE ก่อน", "warning");
      return;
    }

    // TODO: open modal add stop
    console.log("ADD STOP", state.selectedLine);
  });

  $(dom.btnAddPassenger).on("click", function () {
    if (!state.selectedStop) {
      showMessage("กรุณาเลือก BUS STOP ก่อน", "warning");
      return;
    }

    // TODO: open modal add passenger
    console.log("ADD PASSENGER", state.selectedStop);
  });

  $(dom.btnSaveDispatch).on("click", async function () {
    const isConfirm = await showConfirm({
      title: "ยืนยันการบันทึก",
      message: "ต้องการบันทึก DISPATCH ใช่หรือไม่?",
      acceptText: "ยืนยัน",
      cancelText: "ยกเลิก",
    });

    if (!isConfirm) return;

    try {
      await showLoader({ show: true });

      // TODO: เปลี่ยนเป็น payload จริงเมื่อพร้อมใช้งาน
      // const payload = {
      //   dispatch_id: state.head.dispatch_id,
      //   update_by: "15199",
      //   lines: state.lines,
      // };
      // await dispatchSaveOverwrite(payload);

      showMessage("SAVE_DISPATCH_TODO", "success");
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "SAVE_FAILED", "error");
    } finally {
      await showLoader({ show: false });
    }
  });
}