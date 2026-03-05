import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";
import {dispatchGetDispatch, dispatchSaveOverwrite, getLine, getStop,} from "./data.js";

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

let tableLine, tableStop, tablePassenger;
function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mapShift(uiType) {
  if (uiType === "OT") return "D"; // OT Day (NORMAL)
  if (uiType === "NIGHT") return "N"; // Night
  if (uiType === "HOLIDAY") return "H"; // Holiday
  return "D";
}

function makeDtoGetDispatch() {
  return {
    workdate: $(dom.workdate).val(),     // YYYY-MM-DD
    dispatch_type: "O",                  // หน้านี้เป็น OT dispatch
    shift: mapShift($(dom.type).val()),  // D/N/H
  };
}

function setSelectedLineLabel(line) {
  $(dom.lblSelectedLine).text(  line ? `Selected: ${line.busname || line.busid || "-"}` : "Selected: -" );
}

function setSelectedStopLabel(stop) {
  $(dom.lblSelectedStop).text( stop ? `Selected: ${stop.stop_name || stop.stop_id || "-"}` : "Selected: -" );
}

function updateSummary() {
  const totalLines = state.lines.length;
  const totalStops = state.lines.reduce((sum, l) => sum + ((l.stops || []).length), 0);
  const totalPassengers = state.lines.reduce((sum, l) => {
    return sum + (l.stops || []).reduce((s2, st) => s2 + ((st.passengers || []).length), 0);
  }, 0);

  $(dom.sumLines).text(totalLines);
  $(dom.sumStops).text(totalStops);
  $(dom.sumPassengers).text(totalPassengers);
}

function clearRightTables() {
  state.selectedLine = null;
  state.selectedStop = null;
  setSelectedLineLabel(null);
  setSelectedStopLabel(null);
  $(dom.btnAddStop).prop("disabled", true);
  tableStop.clear().draw();
  tablePassenger.clear().draw();
}

function initTables() {
  createTable(dom.tblLine, {
    ...tableOption,
    searching: false,
    paging: false,
    info: false,
    columns: [
      { title: "BUS", data: null, render: (v, t, row) => row.busname || row.busid || "-" },
      { title: "SEAT", data: "busseat", width: "60px", defaultContent: "-" },
      { title: "TYPE", data: "bustype", width: "60px", defaultContent: "-" },
    ],
  });
  tableLine = $(dom.tblLine).DataTable();


  createTable(dom.tblStop, {
    ...tableOption,
    searching: false,
    paging: false,
    info: false,
    columns: [
      { title: "STOP_ID", data: "stop_id", width: "80px" },
      { title: "STOP", data: "stop_name", defaultContent: "-" },
      { title: "PLAN", data: "plan_time", width: "70px", defaultContent: "-" },
      { title: "PAX", data: null, width: "60px", render: (v, t, row) => (row.passengers ? row.passengers.length : 0) },
    ],
  });
  tableStop = $(dom.tblStop).DataTable(); 

  createTable(dom.tblPassenger, {
    ...tableOption,
    searching: false,
    paging: false,
    info: false,
    columns: [{ title: "EMPNO", data: "empno", width: "120px" }],
  });
  tablePassenger = $(dom.tblPassenger).DataTable(); 

  // click handlers ใช้เหมือนเดิมได้
}

async function loadDispatch() {
  await showLoader({ show: true });

  try {
    const dto = makeDtoGetDispatch();
    if (!dto.workdate) throw new Error("WORKDATE_REQUIRED");

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

    tableLine.clear().rows.add(state.lines).draw();
    clearRightTables();
    updateSummary();

    // auto select first line + first stop (UX)
    if (state.lines.length) {
      const firstLine = state.lines[0];
      state.selectedLine = firstLine;
      setSelectedLineLabel(firstLine);
      $(dom.btnAddStop).prop("disabled", false);

      tableStop.clear().rows.add(firstLine.stops || []).draw();

      const trLine0 = $(tableLine.row(0).node());
      $(tableLine.table().body()).find("tr").removeClass("selected");
      trLine0.addClass("selected");

      if ((firstLine.stops || []).length) {
        const firstStop = firstLine.stops[0];
        state.selectedStop = firstStop;
        setSelectedStopLabel(firstStop);

        tablePassenger.clear().rows.add(firstStop.passengers || []).draw();

        const trStop0 = $(tableStop.row(0).node());
        $(tableStop.table().body()).find("tr").removeClass("selected");
        trStop0.addClass("selected");
      }
    }
  } catch (e) {
    console.error(e);
    showMessage("error", e?.message || "LOAD_FAILED");
  } finally {
    await showLoader({ show: false });
  }
}

function bindEvents() {
  $(dom.workdate).on("change", loadDispatch);
  $(dom.type).on("change", loadDispatch);

  $(dom.btnAddPassenger).on("click", () => {
    if (!state.selectedStop) return showMessage("warning", "กรุณาเลือก BUS STOP ก่อน");
    // TODO: open modal add passenger
    console.log("ADD PASSENGER", state.selectedStop);
  });

  $(dom.btnAddStop).on("click", () => {
    if (!state.selectedLine) return showMessage("warning", "กรุณาเลือก BUS LINE ก่อน");
    // TODO: open modal add stop
    console.log("ADD STOP", state.selectedLine);
  });

  $(dom.btnSaveDispatch).on("click", async () => {
    // TODO: เตรียม payload overwrite จาก state.lines (หลังแก้ไข)
    const ok = await showConfirm("ต้องการบันทึก DISPATCH ใช่ไหม?");
    if (!ok) return;

    try {
      await showLoader({ show: true });

      // TODO: เปลี่ยนเป็น payload จริงเมื่อท่านพร้อม
      // const payload = { dispatch_id: state.head.dispatch_id, update_by: "15199", lines: ... }
      // await dispatchSaveOverwrite(payload);

      showMessage("success", "SAVE_DISPATCH_TODO");
    } catch (e) {
      console.error(e);
      showMessage("error", e?.message || "SAVE_FAILED");
    } finally {
      await showLoader({ show: false });
    }
  });
}

$(document).ready(async function () {
  initApp?.(); // ถ้า utils.js ของท่านต้อง init อะไร
  $(dom.workdate).val(todayYMD());
  $(dom.type).val("OT");

  initTables();
  bindEvents();
  await loadDispatch();
});