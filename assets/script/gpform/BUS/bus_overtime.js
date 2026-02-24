import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import {
  getLine,
  getRoute,
  getStop
} from "./data.js";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";

var tableLine;
var tableStop;
let selectedBusId = null;

// ⭐ state ใหม่ของหน้า
let tableNormal;
let tableOT;

let passengerNormal = [];
let passengerOT = [];

let lines = [];

/* ================= INIT ================= */
$(async function () {
  initApp();
  await initPage();
});

async function initPage() {
  try {
    showLoader(true);

    await loadMaster();
    initTable();
    bindEvent();

  } catch (err) {
    console.error(err);
    showMessage("error", err.message);
  } finally {
    showLoader(false);
  }
}

/* ================= LOAD MASTER ================= */
async function loadMaster() {
  lines = await getLine();
}

/* ================= INIT TABLE ================= */
function initTable() {
  // ⭐ Normal table
  tableNormal = createTable("#tbNormalPassenger", {
    ...tableOption,
    data: passengerNormal,
    columns: [
      { data: "BUSNAME", title: "Line" },
      { data: "STOP_NAME", title: "Stop" },
      { data: "EMPNO", title: "Empno" },
      { data: "EMPNAME", title: "Name" },
      { data: "SECTION", title: "Section" }
    ]
  });

  // ⭐ OT table
  tableOT = createTable("#tbOTPassenger", {
    ...tableOption,
    data: passengerOT,
    columns: [
      { data: "BUSNAME", title: "Line" },
      { data: "STOP_NAME", title: "Stop" },
      { data: "EMPNO", title: "Empno" },
      { data: "EMPNAME", title: "Name" },
      { data: "SECTION", title: "Section" }
    ]
  });
}

/* ================= EVENT ================= */
function bindEvent() {
  $("#btnRefresh").on("click", refreshData);
  $("#btnSave").on("click", saveDispatch);
  $("#btnAuto").on("click", autoAssign);
}

/* ================= REFRESH ================= */
async function refreshData() {
  try {
    showLoader(true);

    // TODO: replace ด้วย API จริง
    passengerNormal = [];
    passengerOT = [];

    reloadTable();

  } catch (err) {
    console.error(err);
  } finally {
    showLoader(false);
  }
}

function reloadTable() {
  tableNormal.clear().rows.add(passengerNormal).draw();
  tableOT.clear().rows.add(passengerOT).draw();
}

/* ================= DISPATCH ================= */
function autoAssign() {
  showMessage("info", "Auto assign coming soon");
}

function saveDispatch() {
  showMessage("success", "Dispatch saved (mock)");
}