
import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { setSelect2 } from "@amec/webasset/select2";
import select2 from "select2";
import "select2/dist/css/select2.min.css";
import { createTable } from "@amec/webasset/dataTable";
import { getAllInfo } from "@amec/webasset/indexDB";
import {
  dispatchGetDispatch, dispatchMoveStop, disableDispatchPassenger,
  getUserbyemp, deleteLineDispatch,
  getLine, getStopRoutes,
  saveAddPassenger, reportBusDaily, reportDisabledPassengerDaily,
  updatePassengerStatus,updateLineDispatchStatus,updateLineTypeDispatch, 
  updateStatusHead, createfolder, exportAndsendmail
} from "./data.js";
import { initApp, tableOption } from "../../utils.js";
import { exportExcel, defaultExcel, mergeCell, applyStyleToRange, alignment, border,} from "@amec/webasset/excel";
import { sendMail, mailsubject } from "@amec/webasset/sendmail";

  select2();
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
    btnAddPassenger: "#btnAddPassenger",
    btnSaveDispatch: "#btnSaveDispatch",
    passengerSearch: "#txtPassengerSearch",
    
    btnShowDisabledPassenger: "#btnShowDisabledPassenger",
    disabledPassengerModal: "#disabled_passenger_modal",
    tblDisabledPassenger: "#tblDisabledPassenger",
    btnSaveandSendmail: "#btnSaveandSendmail",

    moveDisabledPassengerModal: "#move_disabled_passenger_modal",
    mdpEmpno: "#mdpEmpno",
    mdpEmpnoText: "#mdpEmpnoText",
    mdpFullname: "#mdpFullname",
    mdpLineId: "#mdpLineId",
    mdpStopId: "#mdpStopId",
    btnSaveMoveDisabledPassenger: "#btnSaveMoveDisabledPassenger",
    chkShowHiddenLine: "#chkShowHiddenLine",

    lineTypeModal: "#line_type_modal",
    ltDispatchId: "#ltDispatchId",
    ltBusId: "#ltBusId",
    ltBusName: "#ltBusName",
    ltBusSeat: "#ltBusSeat",
    btnSaveLineType: "#btnSaveLineType",
    ltOldBusType: "#ltOldBusType",
    ltOldBusSeat: "#ltOldBusSeat",
  };

  const state = {
    snapshot: null,
    head: null,
    lines: [],
    selectedLine: null,
    selectedStop: null,
    addPassengerLines: [],
    addPassengerStops: [],

    // NEW
    disabledPassengers: [],
    disabledPassengerLines: [],
    disabledPassengerStops: [],
    selectedDisabledPassenger: null,
  };

  let tableLine;
  let tableStop;
  let tablePassenger;
  let tableDisabledPassenger;
  let login_empno = null;

  $(document).ready(async function () {
    const LOGIN_USER = await getAllInfo(); // 👈 ดึงจาก IndexedDB
    login_empno = LOGIN_USER[0].data.SEMPNO;

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

  function getVisibleLines(lines = []) {
    const showHidden = $(dom.chkShowHiddenLine).is(":checked");
    if (showHidden) return lines;
    return lines.filter((line) => getLineStatus(line) === "1");
  }

  function getLineStatus(line) {
    return String(line?.line_status ??line?.LINE_STATUS ??"").trim();
  }

  function initFlatpickr(selector, modal) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (el._flatpickr) {
      el._flatpickr.destroy();
    }
    setDatePicker({ element: selector, time: true, appendTo: modal });
  }

  function todayYMD() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function mapShift(uiType) {
    if (uiType === "OT") return "D";
    if (uiType === "OT_SPECIAL") return "S";
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

  function isDispatchFinalized() {
    return String(state.head?.status || "").toUpperCase() === "F";
  }



  function syncActionButtonsState() {
    const disabled = isDispatchFinalized();
    const $allButtons = $(
      `${dom.btnAddPassenger}, ${dom.btnSaveandSendmail}, ${dom.btnShowDisabledPassenger}`
    );

    $allButtons.prop("disabled", disabled);
    if (disabled) {
      $allButtons
        .removeClass("bg-indigo-600 bg-emerald-600 bg-rose-600 text-white cursor-pointer")
        .addClass("bg-gray-300 text-gray-500 opacity-70 cursor-not-allowed");
    } else {
      $(dom.btnAddPassenger)
        .removeClass("bg-gray-300 text-gray-500 opacity-70 cursor-not-allowed")
        .addClass("bg-indigo-600 text-white cursor-pointer");

      $(dom.btnSaveandSendmail)
        .removeClass("bg-gray-300 text-gray-500 opacity-70 cursor-not-allowed")
        .addClass("bg-emerald-600 text-white cursor-pointer");

      $(dom.btnShowDisabledPassenger)
        .removeClass("bg-gray-300 text-gray-500 opacity-70 cursor-not-allowed")
        .addClass("bg-rose-600 text-white cursor-pointer");
    }
  
    $(".btn-update-line-status, .btn-move-stop, .btn-delete-passenger")
    .prop("disabled", disabled)
    .toggleClass("bg-gray-300 text-gray-500 cursor-not-allowed opacity-70", disabled);
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
    const activeLines = (state.lines || []).filter((line) => String(line.line_status ?? line.LINE_STATUS ?? "") === "1");
    const totalLines = activeLines.length;
    const totalStops = activeLines.reduce( (sum, line) => sum + ((line.stops || []).length),0);
    const totalPassengers = activeLines.reduce((sum, line) => {return sum + (line.stops || []).reduce((stopSum, stop) => { return stopSum + ((stop.passengers || []).length);}, 0);}, 0);

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
        data: null, title: "สายรถ",
        render: function (data, type, row) {
          const isHidden = getLineStatus(row) === "0";
          return `
            <div class="flex items-center justify-between">
              <span class="${isHidden ? 'opacity-50 line-through' : ''}">
                ${row.busname || row.busid || "-"}
              </span>
              ${isHidden ? `<span class="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">ไม่ใช้งาน</span>` : ""}
            </div>
          `;
        },
      },
      {
        data: null,
        title: "ที่นั่ง",
        className: "text-center",
        width: "120px",
        render: function (data, type, row) {
          const p = Number(row.passenger_count || 0);
          const s = Number(row.busseat || 0);
          const remain = s - p;

          let color = "bg-green-100 text-green-700";

          if (s > 0 && p >= s) {
            color = "bg-red-300 text-red-900";
          } else if (s > 0 && remain < 4) {
            color = "bg-gray-300 text-gray-900";
          } else if (s > 0 && p / s > 0.7) {
            color = "bg-yellow-100 text-yellow-700";
          }

          return `<span class="px-2 py-1 text-xs rounded-full ${color}">${p} / ${s}</span>`;
        },
      },
      {
        data: null,
        title: "ประเภทรถ",
        className: "text-center",
        render: function (data, type, row) {
          const rawBusType = String(row.bustype || "").trim();
          const busTypeLabel = rawBusType === "2" ? "Van" : "Bus";
          const badgeClass = rawBusType === "2"
            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200";

          return `
            <button
              type="button"
              class="btn-edit-line-type inline-flex items-center rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition ${badgeClass}"
              data-dispatch_id="${row.dispatch_id || ""}"
              data-busid="${row.busid || ""}"
              data-busname="${row.busname || ""}"
              data-bustype="${rawBusType}"
              data-busseat="${row.busseat || ""}"
              title="คลิกเพื่อแก้ไขประเภทรถ"
            >
              ${busTypeLabel}
            </button>
          `;
        },
      },
      {
        data: null,
        title: "จัดการ",
        className: "text-center",
        width: "80px",
        orderable: false,
        render: function (data, type, row) {
          const disabled = isDispatchFinalized();
          const disabledAttr = disabled ? 'disabled style="cursor:not-allowed !important;"' : "";
          const isHidden = getLineStatus(data) === "0";

          if (!isHidden) {
            return `
              <button
                class="btn-update-line-status px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
                data-busid="${row.busid}"
                data-status="0"
                ${disabledAttr}
              >
                ลบ
              </button>
            `;
          }

          return `
            <button
              class="btn-update-line-status px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 cursor-pointer"
              data-busid="${row.busid}"
              data-status="1"
              ${disabledAttr}
            >
              กู้กลับ
            </button>
          `;
        },
      },
    ];

    opt.createdRow = function (row, data) {
      const isHidden = getLineStatus(data) === "0";

      $(row).addClass("line-row cursor-pointer transition");

      if (isHidden) {
        $(row).addClass("bg-gray-50 opacity-70");
      } else {
        $(row).addClass("hover:bg-gray-100");
      }
    };

    return opt;
  }

  async function stopOptions(data) {
    const sortedData = [...(data || [])].sort((a, b) => {
      const t1 = parseInt(a.plan_time || "9999", 10);
      const t2 = parseInt(b.plan_time || "9999", 10);
      return t2 - t1; // เรียงจากมากไปน้อย 
    });
    const opt = { ...tableOption };
    opt.data = sortedData;
    opt.searching = false;
    opt.paging = false;
    opt.info = false;
    opt.ordering = false;
    opt.columns = [
      {
        data: "stop_name", title: "จุดรถ", defaultContent: "-",
      },
      {
        data: null, title: "จัดการ", className: "text-center", width: "80px", orderable: false,
        render: function (data, type, row) {
          const disabled = isDispatchFinalized();
          return `
            <button
              class="btn-move-stop px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-400 cursor-pointer"
              data-stop-id="${row.stop_id}"
              data-stop-name="${row.stop_name || ""}"
              data-plan-time="${row.plan_time || ""}"
              ${disabled ? 'disabled style="cursor:not-allowed !important;"' : ""}
            >
              แก้ไข
            </button>
          `;
        },
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
    opt.ordering = false;
    opt.columns = [
      {
        data: "empno",
        title: "รหัส",
        width: "80px",
        defaultContent: "-",
      },
      {
        data: "thainame",
        title: "ชื่อพนักงาน",
        defaultContent: "-",
      },
      {
        data: "ssec", title: "Sec", defaultContent: "-",
        render: function (data) {
          if (!data) return "-";
          let txt = data.toString().toUpperCase();
          txt = txt.replace("SEC.", "").trim();
          txt = txt.replace(" ", "").trim();
          txt = txt.replace("NOSECTION", "-").trim();
          return txt || "-";
        }
      },
      {
        data: "sdept", title: "Dept", defaultContent: "-",
        render: function (data) {
          if (!data) return "-";
          let txt = data.toString().toUpperCase();
          txt = txt.replace("DEPT", "").trim();
          txt = txt.replace(".", "").trim();
          txt = txt.replace(" ", "").trim();
          return txt || "-";
        }
      },
      {
        data: "sdiv", title: "Div", defaultContent: "-",
        render: function (data) {
          if (!data) return "-";
          let txt = data.toString().toUpperCase();
          txt = txt.replace("DIV", "").trim();
          txt = txt.replace(".", "").trim();
          txt = txt.replace(" ", "").trim();
          return txt || "-";
        }
      },
      {
        data: null,
        title: "จัดการ",
        className: "text-center",
        width: "50px",
        orderable: false,
        render: function (data, type, row) {
          const disabled = isDispatchFinalized();
          return `
            <button
              class="btn-delete-passenger px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
              data-empno="${row.empno || ""}"
              data-name="${row.thainame || ""}"
              ${disabled ? 'disabled style="cursor:not-allowed !important;"' : ""}
            >
              ลบ
            </button>
          `;
        },
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

  function findPassengerGlobal(keyword) {
    const q = String(keyword || "").trim().toLowerCase();
    if (!q) return null;
    for (const line of state.lines || []) {
      for (const stop of line.stops || []) {
        for (const passenger of stop.passengers || []) {
          const empno = String(passenger.empno || "").toLowerCase();
          const thainame = String(passenger.thainame || "").toLowerCase();
          if (empno.includes(q) || thainame.includes(q)) {
            return { line, stop, passenger,  };
          }
        }
      }
    }
    return null;
  }

  async function jumpToPassengerSearch(keyword) {
    const found = findPassengerGlobal(keyword);
    if (!found) {
      showMessage("ไม่พบข้อมูลผู้โดยสาร", "warning");
      return;
    }

    const lineRowIndex = (state.lines || []).findIndex((item) => String(item.busid) === String(found.line.busid));
    await selectLine(found.line, lineRowIndex >= 0 ? lineRowIndex : null);
    const stopRows = tableStop?.rows?.().data?.()?.toArray?.() || [];
    const stopRowIndex = stopRows.findIndex((item) => String(item.stop_id) === String(found.stop.stop_id));
    await selectStop(found.stop, stopRowIndex >= 0 ? stopRowIndex : null);
  }

  $(dom.passengerSearch).on("input", async function () {
    const keyword = $(this).val();

    if (!String(keyword || "").trim()) {
      await loadDispatch();
      return;
    }
    await jumpToPassengerSearch(keyword);
  });

  $(dom.chkShowHiddenLine).on("change", async function () {
    await renderLineTable(getVisibleLines(state.lines));
    await renderStopTable([]);
    await renderPassengerTable([]);
    clearRightSelection();
  });

  function clearRightSelection() {
    state.selectedLine = null;
    state.selectedStop = null;
    setSelectedLineLabel(null);
    setSelectedStopLabel(null);
  }

  async function loadDispatch(options = {}) {
    await showLoader({ show: true });
    try {
      const dto = makeDtoGetDispatch();

     if (!dto.workdate) {
      showMessage("กรุณาเลือกวันที่", "warning");
      return;
    } else {
      const d = new Date(dto.workdate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');

      dto.workdate = `${yyyy}-${mm}-${dd}`;
    }

      const preserveBusId = options.preserveBusId ?? state.selectedLine?.busid ?? null;
      const preserveStopId = options.preserveStopId ?? state.selectedStop?.stop_id ?? null;
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

      await renderLineTable(getVisibleLines(state.lines));
      await renderStopTable([]);
      await renderPassengerTable([]);

      if (state.lines.length > 0) {
        let lineIndex = findLineIndexByBusId(preserveBusId);
        if (lineIndex < 0) lineIndex = 0;

        const targetLine = state.lines[lineIndex];
        await selectLine(targetLine, lineIndex, preserveStopId);
      }
      syncActionButtonsState();
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      await showLoader({ show: false });
    }
  }

  function findLineIndexByBusId(busid) {
    return (state.lines || []).findIndex(
      (line) => String(line.busid) === String(busid)
    );
  }

  function findStopIndexByStopId(stops, stopId) {
    return (stops || []).findIndex(
      (stop) => String(stop.stop_id) === String(stopId)
    );
  }

  async function selectLine(line, rowIndex = null, preferredStopId = null) {
    state.selectedLine = line;
    state.selectedStop = null;
    setSelectedLineLabel(line);
    setSelectedStopLabel(null);

    const stops = line.stops || [];

    await renderStopTable(stops);
    await renderPassengerTable([]);

    $(".line-row").removeClass("line-selected");
    if (rowIndex !== null && tableLine?.row(rowIndex).node()) {
      $(tableLine.row(rowIndex).node()).addClass("line-selected");
    }

    if (tableStop && tableStop.rows().count() > 0) {
      let stopIndex = findStopIndexByStopId(stops, preferredStopId);
      if (stopIndex < 0) stopIndex = 0;

      const targetStop = stops[stopIndex];
      await selectStop(targetStop, stopIndex);
    }
  }

  async function selectStop(stop, rowIndex = null) {
    state.selectedStop = stop;
    setSelectedStopLabel(stop);
    $(dom.btnAddPassenger).prop("disabled", isDispatchFinalized());
    await renderPassengerTable(stop.passengers || []);

    $(".stop-row").removeClass("stop-selected");
    if (rowIndex !== null && tableStop?.row(rowIndex).node()) {
      $(tableStop.row(rowIndex).node()).addClass("stop-selected");
    }
    syncActionButtonsState();
  }

function bindEvents() {
  $(dom.workdate).on("change", async function () { await loadDispatch(); });
  $(dom.type).on("change", async function () { await loadDispatch();});
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


  $(dom.btnSaveDispatch).on("click", async function () {
    const isConfirm = await showConfirm({
      title: "ยืนยันการบันทึก",
      message: "ต้องการบันทึกการจัดรถ ใช่หรือไม่?",
      acceptText: "ยืนยัน",
      cancelText: "ยกเลิก",
    });

    if (!isConfirm) return;
    try {
      await showLoader({ show: true });
      showMessage("SAVE_DISPATCH_TODO", "success");
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "SAVE_FAILED", "error");
    } finally {
      await showLoader({ show: false });
    }
  });


  $(document).on("click", ".btn-move-stop", async function (e) {
    e.stopPropagation();
    if (isDispatchFinalized()) return;
    const stopId = $(this).data("stop-id");
    const stopName = $(this).data("stop-name");
    const planTime = $(this).data("plan-time");
    const currentLine = state.selectedLine;
    if (!currentLine) {
      showMessage("กรุณาเลือกสายรถก่อน", "warning");
      return;
    }

    $("#moveStopId").val(stopId);
    $("#moveStopName").val(stopName || "");
    $("#movePlanTime").val(formatPlanTimeDisplay(planTime));
    $("#moveCurrentLineId").val(currentLine.busid || "");
    $("#moveCurrentLineName").val(currentLine.busname || currentLine.busid || "");

    const $ddl = $("#moveTargetLine");
    $ddl.empty();
    $ddl.append(`<option value="${currentLine.busid}"> ${currentLine.busname || currentLine.busid} ${currentLine.bustype === "2" ? "(Van)" : "(Bus)"}(สายปัจจุบัน)</option>`);

    (state.lines || []).forEach((line) => {
      const lineId = line.busid;
      const lineName = line.busname || line.busid || "-";
      if (String(lineId) === String(currentLine.busid)) return;
      $ddl.append(`
        <option value="${lineId}">
          ${lineName} ${line.bustype === "2" ? "(Van)" : "(Bus)"}
        </option>
      `);
    });

    const modal = document.getElementById("move_stop_modal");
    modal.showModal();
    initFlatpickr("#movePlanTime", modal);
    if ($("#movePlanTime")[0]?._flatpickr) {$("#movePlanTime")[0]._flatpickr.setDate( formatPlanTimeDisplay(planTime),false, "H:i"); }
  });


  $(document).on("click", "#btnConfirmMoveStop", async function () {
    const stopId = $("#moveStopId").val();
    const targetLineId = $("#moveTargetLine").val();
    const currentLineId = $("#moveCurrentLineId").val();
    if (!stopId) {
      showMessage("ไม่พบข้อมูลจุดรถ", "warning");
      return;
    }

    if (!targetLineId) {
      showMessage("กรุณาเลือกสายรถปลายทาง", "warning");
      return;
    }

    if (!login_empno) {
      showMessage("ไม่พบข้อมูลผู้ใช้งาน (empno)", "error");
      return;
    }

    const moveModal = document.getElementById("move_stop_modal");
    try {
      moveModal.close();
      const isConfirm = await showConfirm({
        title: "ยืนยันการย้ายสายรถ",
        message: "ต้องการแก้ไขข้อมูลนี้ ใช่หรือไม่?",
        acceptText: "ยืนยัน",
        cancelText: "ยกเลิก",
      });

      if (!isConfirm) {
        moveModal.showModal();
        return;
      }

      await showLoader({ show: true });
      const dto = {
        dispatch_id: String(state.head?.dispatch_id || ""),
        stop_id: String(stopId || ""),
        target_line_id: targetLineId ? String(targetLineId) : undefined,
        stop_name: String($("#moveStopName").val() || "").trim() || undefined,
        plan_time: normalizePlanTimeSave($("#movePlanTime").val()),
        update_by: String(login_empno),
      };

      console.log("MOVE STOP DTO =", dto);
      await dispatchMoveStop(dto);
      showMessage("ย้ายสายรถสำเร็จ", "success");
      await loadDispatch();
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "เกิดข้อผิดพลาดในการย้ายสายรถ", "error");
    } finally {
      await showLoader({ show: false });
    }
  });

  $(document).on("click", ".btn-delete-passenger", async function (e) {
    e.stopPropagation();
    if (isDispatchFinalized()) return;
    const empno = String($(this).data("empno") || "").trim();
    const empName = String($(this).data("name") || "").trim();
    if (!state.head?.dispatch_id) {
      showMessage("ไม่พบ dispatch id", "warning");
      return;
    }
    if (!empno) {
      showMessage("ไม่พบรหัสพนักงาน", "warning");
      return;
    }

    const isConfirm = await showConfirm({
      title: "ยืนยันการลบ",
      message: `ต้องการลบพนักงาน ${empName || empno} ออกจากการจัดรถ ใช่หรือไม่?`,
      acceptText: "ยืนยัน",
      cancelText: "ยกเลิก",
    });

    if (!isConfirm) return;
    try {
      await showLoader({ show: true });
      await disableDispatchPassenger({
        dispatch_id: String(state.head.dispatch_id),
        empno: empno,
        update_by: String(login_empno),
      });

      showMessage("ลบพนักงานสำเร็จ", "success");
      await loadDispatch();
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "ลบพนักงานไม่สำเร็จ", "error");
    } finally {
      await showLoader({ show: false });
    }
  });

  function formatPlanTimeDisplay(value) {
    if (!value) return "";
    const txt = String(value).replace(/\D/g, "").slice(0, 4);
    if (txt.length !== 4) return String(value);
    return `${txt.slice(0, 2)}:${txt.slice(2, 4)}`;
  }

  function normalizePlanTimeSave(value) {
    if (!value) return undefined;
    const txt = String(value).replace(/\D/g, "").slice(0, 4);
    return txt.length === 4 ? txt : undefined;
  }

  $(document).on("click", ".btn-delete-line", async function (e) {
    e.stopPropagation();
    if (isDispatchFinalized()) return;
    const busid = String($(this).data("busid") || "").trim();
    if (!state.head?.dispatch_id) {
      showMessage("ไม่พบ dispatch id", "warning");
      return;
    }

    const isConfirm = await showConfirm({
      title: "ยืนยันการลบสายรถ", 
      message: "ต้องการลบสายรถนี้ออกจากการจัดรถ ใช่หรือไม่ ? <br> (คนที่อยู่ในสายรถนี้ทั้งหมดจะไปอยู่สถานะ => ไม่จัดรถรับส่ง)", 
      acceptText: "ยืนยัน",cancelText: "ยกเลิก",
    });

    if (!isConfirm) return;
    try {
      await showLoader({ show: true });
      const dto = {
        dispatch_id: String(state.head.dispatch_id),
        busid: busid,
        update_by: String(login_empno),
      };

      console.log("DELETE LINE DTO =", dto);
      await deleteLineDispatch(dto);
      showMessage("ลบสายรถสำเร็จ", "success");
      await loadDispatch();
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "ลบสายรถไม่สำเร็จ", "error");
    } finally {
      await showLoader({ show: false });
    }
  });
    
  
  $(document).on("click", "#btnAddPassenger", async function (e) {
    e.preventDefault();
    if (isDispatchFinalized()) return;
    if (!state.head?.dispatch_id) {
      showMessage("ไม่พบ แผนการจัดรถปัจจุบันของ (วัน/เวลา)ที่เลือก", "warning");
      return;
    }

    $("#apDispatchId").val(String(state.head.dispatch_id));
    $("#apEmpno").val("");
    $("#apEmpName").text("").removeClass("text-blue-600 text-red-600 text-gray-400");

    const modal = document.getElementById("add_passenger_modal");
    modal.showModal();
    await initLineSelect2(modal, state.selectedLine?.busid || "");
    await initStopSelect2(modal, state.selectedStop?.stop_id && state.selectedLine?.busid ? `${String(state.selectedStop.stop_id)}_${String(state.selectedLine.busid)}` : "");

    setTimeout(() => {
      $("#apEmpno").trigger("focus");
    }, 50);
  });



  $(document).on("input", "#apEmpno", async function () {
    const apEmpno = $(this).val();
    if (apEmpno.length !== 5) {
      $("#apEmpName").text("").removeClass("text-blue-600 text-red-600 text-gray-400");
      return;
    }
    try {
      const newPassenger = await getUserbyemp(apEmpno);
      if (newPassenger.CSTATUS === "0") {
        $("#apEmpName").text(`${apEmpno} - พนักงานนี้ได้ลาออกจากบริษัทแล้ว`).removeClass("text-blue-600").addClass("text-red-600");
        $("#apEmpno").val("");
        return;
      }

      $("#apEmpName").text(newPassenger.STNAME || "").removeClass("text-red-600 text-gray-400").addClass("text-blue-600");
    } catch (error) {
      console.error("getUserbyemp error =", error);
      $("#apEmpName").text(`${apEmpno} - ไม่พบข้อมูลพนักงาน`).removeClass("text-blue-600").addClass("text-red-600");
      $("#apEmpno").val("");
      return;
    }
  });



  async function initLineSelect2(modal, selectedLineId = "") {
    try {
      const lines = await getLine();
      const data = (lines || []).map((line) => {
        const busid = line.busid ?? line.BUSID ?? "";
        const busname = line.busname ?? line.BUSNAME ?? "";
        const bustype = line.bustype ?? line.BUSTYPE ?? "";
        const busseat = line.busseat ?? line.BUSSEAT ?? null;
        const busstatus = line.busstatus ?? line.BUSSTATUS ?? "";
        return {
          id: String(busid),
          text: `${busname || busid} (${bustype === "2" ? "Van" : "Bus"})`,
          busid: String(busid),
          busname: String(busname || ""),
          bustype: String(bustype || ""),
          busseat: busseat,
          busstatus: String(busstatus || ""),
        };
      });

      state.addPassengerLines = data;
      await setSelect2({
        element: "#apLineId",
        data,
        dropdownParent: $(modal),
        placeholder: "เลือกสายรถ",
        destroy: true,
      });

      if (selectedLineId) {
        $("#apLineId").val(String(selectedLineId)).trigger("change");
      } else {
        $("#apLineId").val("").trigger("change");
      }
    } catch (error) {
      console.error("initLineSelect2 error =", error);
      showMessage("โหลดข้อมูลสายรถไม่สำเร็จ", "error");
    }
  }


  async function initStopSelect2(modal, selectedValue = "") {
    try {
      const rows = await getStopRoutes();
      const allStops = (rows || []).map((row) => {
        const stopId = row.STOP_ID ?? row.stop_id ?? "";
        const stopName = row.STOP_NAME ?? row.stop_name ?? "";
        const busline = row.BUSLINE ?? row.busline ?? "";
        const workday = row.WORKDAY_TIMEIN ?? row.workday_timein ?? "";

        return {
          id: `${String(stopId)}_${String(busline)}`,
          text: `${formatPlanTimeDisplay(workday)} : ${stopName || stopId} (${busline})`,
          stop_id: String(stopId),
          stop_name: stopName,
          busid: String(busline),
          plan_time: workday ? String(workday) : "",
        };
      });

      state.addPassengerStops = allStops;

      await setSelect2({
        element: "#apStopId",
        data: allStops,
        dropdownParent: $(modal),
        placeholder: "เลือกจุดรถ",
        destroy: true,
      });

      if (selectedValue) {
        $("#apStopId").val(String(selectedValue)).trigger("change");
      } else {
        $("#apStopId").val("").trigger("change");
      }
    } catch (error) {
      console.error("initStopSelect2 error =", error);
      showMessage("โหลดข้อมูลจุดรถไม่สำเร็จ", "error");
    }
  }


  $(document).on("change", "#apStopId", function () {
    const selectedId = $(this).val();
    const item = state.addPassengerStops.find((x) => String(x.id) === String(selectedId));
    if (!item) return;
    $("#apLineId").val(String(item.busid)).trigger("change.select2");
  });


  $(document).on("click", "#btnSaveAddPassenger", async function () {
    const empno = String($("#apEmpno").val() || "").trim();
    const selectedLineId = String($("#apLineId").val() || "").trim();
    const selectedStop = getSelectedAddPassengerStop();
    const selectedLine = (state.addPassengerLines || []).find((item) => String(item.busid) === String(selectedLineId));

    if (!state.head?.dispatch_id) {
      showMessage("ไม่พบ dispatch id", "warning");
      return;
    }

    if (!selectedLineId) {
      showMessage("กรุณาเลือกสายรถ", "warning");
      return;
    }

    if (!selectedLine?.busid) {
      showMessage("ไม่พบข้อมูลสายรถ", "warning");
      return;
    }

    if (!selectedStop?.stop_id) {
      showMessage("กรุณาเลือกจุดรถ", "warning");
      return;
    }

    if (!/^\d{5}$/.test(empno)) {
      showMessage("กรุณาระบุรหัสพนักงาน 5 หลัก", "warning");
      return;
    }

    const dto = {
      dispatch_id: String(state.head.dispatch_id),
      update_by: String(login_empno),
      line: {
        busid: String(selectedLine?.busid || ""),
        busname: String(selectedLine?.busname || ""),
        busseat: selectedLine?.busseat ?? null,
        busstatus: String(selectedLine?.busstatus || ""),
      },

      stop: {
        stop_id: String(selectedStop?.stop_id || ""),
        stop_name: String(selectedStop?.stop_name || ""),
        plan_time: String(selectedStop?.plan_time || ""),
      },

      passenger: {
        empno: empno,
      },
    };
    console.log("ADD PASSENGER SAVE DTO =", dto);

    try {
      const res = await saveAddPassenger(dto);
      if (!res?.status) {
        showMessage(res?.message || "ไม่สามารถบันทึกข้อมูลได้", "warning");
        return;
      }

      showMessage(res.message || "บันทึกข้อมูลสำเร็จ", "success");
      const modal = document.getElementById("add_passenger_modal");
      modal.close();

      await loadDispatch({
        preserveBusId: busid,
        preserveStopId: state.selectedStop?.stop_id || null,
      });
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    }
  });

  function getSelectedAddPassengerStop() {
    const selectedId = $("#apStopId").val();
    return (state.addPassengerStops.find( (item) => String(item.id) === String(selectedId)) || null);
  }

  //=============== Report ===============

  function formatPlanTime(time) {
    if (!time) return "-";
    const t = String(time).padStart(4, "0");
    return t.length === 4 ? `${t.slice(0, 2)}:${t.slice(2, 4)}` : t;
  }

  // =====================================
  // 1) รายงานจัดรถประจำวัน (Bus Daily Report)
  // =====================================
  async function exportBusDailyLayoutExcel(dispatchId) {
    const res = await reportBusDaily({ dispatch_id: String(dispatchId) });
    const today = new Date().toLocaleDateString("th-TH");
    if (!res?.status) {
      throw new Error(res?.message || "ไม่สามารถดึงข้อมูลรายงานจัดรถได้");
    }

    const lines = Array.isArray(res.lines) ? res.lines : [];
    if (!lines.length) {
      throw new Error("ไม่พบข้อมูลรายชื่อผู้ที่จัดรถ");
    }

    const workbook = await defaultExcel({
      data: [],
      column: [{ key: "A", header: "" }],
      sheetName: "Bus Daily Layout",
      manual: true,
      autoWidth: false,
      manualActions: (sheet) => {
        const BLOCKS_PER_ROW = 5;
        const BLOCK_WIDTH = 4;     // จุดลงรถ | No. | รายชื่อ | แผนก
        const BLOCK_GAP = 0;       // เว้นคอลัมน์ระหว่าง block
        const TOTAL_BLOCK_WIDTH = BLOCK_WIDTH + BLOCK_GAP;

        const validLines = lines.filter((line) => {
          const busId = String(line.busid || "").trim();
          if (busId === "30") return false;
          const stops = Array.isArray(line.stops) ? line.stops : [];
          return stops.some((stop) => Array.isArray(stop.passengers) && stop.passengers.length > 0);
        });

        if (!validLines.length) {
          throw new Error("ไม่พบข้อมูลรายชื่อผู้ที่จัดรถ");
        }

        function getBlockStartCol(blockIndex) {
          return 1 + (blockIndex * TOTAL_BLOCK_WIDTH);
        }

        function setCell(row, col, value) {
          sheet.getRow(row).getCell(col).value = value;
        }

        function styleCell(row, col, opts = {}) {
          const cell = sheet.getRow(row).getCell(col);
          if (opts.font) cell.font = opts.font;
          if (opts.alignment) cell.alignment = opts.alignment;
          if (opts.border) cell.border = opts.border;
          if (opts.fill) cell.fill = opts.fill;
        }

        function applyBorderRange(rowStart, rowEnd, colStart, colEnd) {
          for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
              styleCell(r, c, { border: border() });
            }
          }
        }

        function mergeAndSet(row, colStart, colEnd, value, style = {}) {
          mergeCell(sheet, row, colStart, row, colEnd);
          setCell(row, colStart, value);
          for (let c = colStart; c <= colEnd; c++) {
            styleCell(row, c, style);
          }
        }

        function getLineBlockRows(line) {
          const stops = Array.isArray(line.stops) ? line.stops : [];
          let count = 3; // header block 3 rows: title, route code, table header

          stops.forEach((stop) => {
            const passengers = Array.isArray(stop.passengers) ? stop.passengers : [];
            if (!passengers.length) return;
            count += passengers.length;
          });

          return count;
        }

        function writeLineBlock(startRow, startCol, line) {
          const col1 = startCol;
          const col2 = startCol + 1;
          const col3 = startCol + 2;
          const col4 = startCol + 3;

          const stops = Array.isArray(line.stops) ? line.stops : [];
          let currentRow = startRow;
          let runningNo = 1;

          // Row 1 : ชื่อสายรถ
          const busTypeText =
          String(line.bustype) === "1" ? "Bus" :
          String(line.bustype) === "2" ? "Van" : "";

          const lineName = `${line.busname || line.busid || "-"}${busTypeText ? ` (${busTypeText})` : ""}`;

          mergeAndSet(currentRow, col1, col4, lineName, {
            font: { bold: true, size: 11 },
            alignment: alignment("center", "middle"),
            border: border(),
            fill: {
              type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" },
            },
          });
          sheet.getRow(currentRow).height = 20;
          currentRow++;

          // Row 2 : header
          setCell(currentRow, col1, "จุดลงรถ");
          setCell(currentRow, col2, "No.");
          setCell(currentRow, col3, "รายชื่อ");
          setCell(currentRow, col4, "แผนก");

          for (let c = col1; c <= col4; c++) {
            styleCell(currentRow, c, {
              font: { bold: true, size: 10 },
              alignment: alignment("center", "middle"),
              border: border(),
              fill: {
                type: "pattern", pattern: "solid",fgColor: { argb: "FFF8F8F8" },
              },
            });
          }
          sheet.getRow(currentRow).height = 18;
          currentRow++;

          // detail
          stops.forEach((stop) => {
            const passengers = Array.isArray(stop.passengers) ? stop.passengers : [];
            if (!passengers.length) return;

            const stopStartRow = currentRow;
            const stopEndRow = currentRow + passengers.length - 1;

            if (passengers.length > 1) {
              mergeCell(sheet, stopStartRow, col1, stopEndRow, col1);
            }

            setCell(stopStartRow, col1, stop.stop_name || "-");
            styleCell(stopStartRow, col1, {
              font: { size: 10 },
              alignment: {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
              },
              border: border(),
            });

            if (passengers.length > 1) {
              for (let r = stopStartRow; r <= stopEndRow; r++) {
                styleCell(r, col1, {
                  border: border(),
                  alignment: {
                    vertical: "middle",
                    horizontal: "center",
                    wrapText: true,
                  },
                });
              }
            }

            passengers.forEach((p, index) => {
              const rowNo = currentRow + index;
              setCell(rowNo, col2, runningNo++);
              setCell(rowNo, col3, p.fullname || "-");
              const sec = String(p.sec || "").trim().toUpperCase();
              const dept = String(p.dept || "").trim();
              let department = dept;
              if (sec && sec !== "NO SECTION") { department = sec; }

              setCell(rowNo, col4, department || "-");
              styleCell(rowNo, col2, {
                font: { size: 10 },
                alignment: alignment("center", "middle"),
                border: border(),
              });
              styleCell(rowNo, col3, {
                font: { size: 10 },
                alignment: {
                  vertical: "middle",
                  horizontal: "left",
                  wrapText: true,
                  indent: 1,
                },
                border: border(),
              });
              styleCell(rowNo, col4, {
                font: { size: 10 },
                alignment: alignment("center", "middle"),
                border: border(),
              });
              sheet.getRow(rowNo).height = 18;
            });
            currentRow = stopEndRow + 1;
          });

          const endRow = currentRow - 1;
          applyBorderRange(startRow, endRow, col1, col4);

          return endRow;
        }

        // ===== Report Title =====
        const totalCols = (BLOCKS_PER_ROW * TOTAL_BLOCK_WIDTH) - BLOCK_GAP;
        mergeCell(sheet, 1, 1, 1, totalCols);
        setCell(1, 1, res.title || "ตารางรถรับส่งพนักงาน");

        applyStyleToRange(sheet, 1, totalCols, 1, {
          font: { bold: true, size: 14 },
          alignment: alignment("center", "middle"),
        });

        sheet.getRow(1).height = 24;

        // ===== Layout Blocks =====
        let rowCursor = 3;
        for (let i = 0; i < validLines.length; i += BLOCKS_PER_ROW) {
          const rowLines = validLines.slice(i, i + BLOCKS_PER_ROW);
          let maxBlockHeight = 0;
          rowLines.forEach((line) => {
            const h = getLineBlockRows(line);
            if (h > maxBlockHeight) maxBlockHeight = h;
          });

          rowLines.forEach((line, idx) => {
            const startCol = getBlockStartCol(idx);
            writeLineBlock(rowCursor, startCol, line);
          });

          rowCursor += maxBlockHeight + 2;
        }

        // ===== Column Width =====
        for (let i = 0; i < BLOCKS_PER_ROW; i++) {
          const startCol = getBlockStartCol(i);
          sheet.getColumn(startCol).width = 16;     // จุดลงรถ
          sheet.getColumn(startCol + 1).width = 6;  // No.
          sheet.getColumn(startCol + 2).width = 22; // รายชื่อ
          sheet.getColumn(startCol + 3).width = 12; // แผนก
        }

        // print setup แบบคร่าวๆ
        sheet.pageSetup = {
          paperSize: 9, // A4
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: {
            left: 0.2,
            right: 0.2,
            top: 0.3,
            bottom: 0.3,
            header: 0.1,
            footer: 0.1,
          },
        };
      },
    });

    //exportExcel(workbook, `bus_daily_layout_${dispatchId}`);
    const fname = "Bus_daily_A" + today + ".xlsx";
    exportExcel(workbook, fname);
  }

  // =====================================
  // 2) export คนที่ไม่ได้จัดรถ
  // =====================================
  async function exportDisabledPassengerExcel(dispatchId) {
    const res = await reportDisabledPassengerDaily({ dispatch_id: String(dispatchId) });
    if (!res?.status) {throw new Error(res?.message || "ไม่สามารถดึงข้อมูลรายงานผู้ไม่ได้จัดรถได้"); }
    const rows = Array.isArray(res.rows) ? res.rows : [];
    const selectedDateText = getSelectedDispatchCondition();
    const workbook = await defaultExcel({
      data: rows.map((row, i) => ({
        NO: row.no ?? i + 1,
        EMPNO: row.empno || "",
        FULLNAME: row.fullname || "",
        SEC: row.sec || "",
        DEPT: row.dept || "",
        DIV: row.div || "",
        STOP_NAME: row.stop_name || "",
        PLAN_TIME: selectedDateText.time,
      })),

      column: [
        { key: "NO", header: "No" },
        { key: "EMPNO", header: "รหัส" },
        { key: "FULLNAME", header: "ชื่อ-นามสกุล" },
        { key: "SEC", header: "SEC" },
        { key: "DEPT", header: "DEPT" },
        { key: "DIV", header: "DIV" },
        { key: "STOP_NAME", header: "จุดรถ" },
        { key: "PLAN_TIME", header: "เวลากลับ" },
      ],

      sheetName: "Disabled Passenger", manual: true, autoWidth: false,
      manualActions: (sheet) => {
        sheet.insertRow(1, ["รายชื่อผู้ที่ไม่สามารถจัดรถรับส่งได้"]);
        sheet.insertRow(2, [`ประจำวันที่ : ${selectedDateText.date}`]);
        sheet.insertRow(3, []);
        mergeCell(sheet, 1, 1, 1, 8);
        mergeCell(sheet, 2, 1, 2, 8);
        applyStyleToRange(sheet, 1, 8, 1, {
          font: { bold: true, size: 16 },
          alignment: alignment("center", "middle"),
        });

        applyStyleToRange(sheet, 1, 8, 2, {
          font: { bold: true, size: 14 },
          alignment: alignment("center", "middle"),
        });

        applyStyleToRange(sheet, 1, 8, 4, {
          font: { bold: true, size: 13 },
          alignment: alignment("center", "middle"),
          border: border(),
        });

        sheet.getColumn(1).width = 6;   // NO
        sheet.getColumn(2).width = 12;  // EMPNO
        sheet.getColumn(3).width = 30;  // FULLNAME
        sheet.getColumn(4).width = 16;  // SEC
        sheet.getColumn(5).width = 18;  // DEPT
        sheet.getColumn(6).width = 18;  // DIV
        sheet.getColumn(7).width = 24;  // STOP_NAME
        sheet.getColumn(8).width = 12;  // PLAN_TIME
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber >= 4) {
            row.eachCell((cell, colNumber) => {
              cell.font = { ...cell.font, size: 12 };
              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
              };

              if (colNumber === 3 && rowNumber >= 5) {
                cell.alignment = {
                  vertical: "middle",
                  horizontal: "left",
                  wrapText: true,
                  indent: 1,
                };
              }
              cell.border = border();
            });
          }
        });
      },
    });
    exportExcel(workbook, `disabled_passenger_${dispatchId}`);
  }

  function getSelectedDispatchCondition() {
      const dateVal = $("#dd_workdate").val();
      const [y, m, d] = dateVal.split("-");
      const dateText =  `${d}/${m}/${y}`;
      const text = $("#dd_type option:selected").text().trim();
      const match = text.match(/\d{2}\.\d{2}/);
      const time = match ? match[0] : "";
      return {
        date: dateText,
        time: time,
      };
    }


  // =========================
// click export 2 files
// =========================
  $("#btnExportDispatch").on("click", async function () {
    try {
      await showLoader({ show: true });
      const dispatchId = state?.head?.dispatch_id || state?.dispatch_id;
      if (!dispatchId) {
        showMessage("ไม่พบ แผนการจัดรถที่เลือก", "warning");
        return;
      }
  
      await exportBusDailyLayoutExcel(dispatchId);
      //await exportBusDailyExcel(dispatchId);  // แนวตั้ง
      await exportDisabledPassengerExcel(dispatchId);

      showMessage("Export Excel สำเร็จ", "success");
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Export ไม่สำเร็จ", "error");
    } finally {
      await showLoader({ show: false });
    }
  });





//======================================================================================================================
  $(dom.btnShowDisabledPassenger).on("click", async function () {
    if (!state.head?.dispatch_id) {
      showMessage("ไม่พบแผนการจัดรถของวันที่/เวลาที่เลือก", "warning");
      return;
    }
    await openDisabledPassengerModal();
  });

  async function openDisabledPassengerModal() {
    await showLoader({ show: true });
    try {
      await loadDisabledPassengerList();
      await renderDisabledPassengerTable(state.disabledPassengers);

      const modal = document.querySelector(dom.disabledPassengerModal);
      modal.showModal();
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "โหลดรายชื่อผู้ไม่ได้จัดรถไม่สำเร็จ", "error");
    } finally {
      await showLoader({ show: false });
    }
  }
  
 
  async function loadDisabledPassengerList() {
    if (!state.head?.dispatch_id) {
      showMessage("ไม่พบ dispatch id", "warning");
      return;
    }
    const res = await reportDisabledPassengerDaily({dispatch_id: String(state.head.dispatch_id),});

    if (!res?.status) {
      throw new Error(res?.message || "โหลดข้อมูลผู้ไม่ได้จัดรถไม่สำเร็จ");
    }
    state.disabledPassengers = Array.isArray(res.rows) ? res.rows : [];
  }

  async function disabledPassengerOptions(data) {
    const opt = { ...tableOption };
    opt.data = data || [];
    opt.searching = true;
    opt.paging = true;
    opt.info = true;
    opt.ordering = true;
    opt.columns = [
      {
        data: "empno",
        title: "รหัส",
        defaultContent: "-",
      },
      {
        data: "fullname",
        title: "ชื่อ",
        defaultContent: "-",
      },
      {
        data: "sec",
        title: "SEC",
        defaultContent: "-",
      },
      {
        data: "dept",
        title: "DEPT",
        defaultContent: "-",
      },
      {
        data: "div",
        title: "DIV",
        defaultContent: "-",
      },
      {
        data: "stop_name",
        title: "จุดรถ",
        defaultContent: "-",
      },
      {
        data: null,
        title: "จัดการ",
        className: "text-center",
        orderable: false,
        width: "180px",
        render: function (data, type, row) {
          const disabled = isDispatchFinalized();
          return `
            <div class="flex gap-2 justify-center">
              <button
                class="btn-enable-disabled-passenger px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 cursor-pointer"
                data-empno="${row.empno || ""}"
                ${disabled ? 'disabled style="cursor:not-allowed !important;"' : ""}
              >
                คืนสถานะ
              </button>

            </div>
          `;
        },
      },
    ];

    return opt;
  }
  
  async function renderDisabledPassengerTable(data) {
    if (tableDisabledPassenger) {
      tableDisabledPassenger.destroy();
      $(dom.tblDisabledPassenger).empty();
    }
    const opt = await disabledPassengerOptions(data);
    tableDisabledPassenger = await createTable(opt, { id: dom.tblDisabledPassenger });
  }

  async function reloadDisabledPassengerStopByLine(modal, lineId, selectedValue = "") {
    const filteredStops = (state.disabledPassengerStops || []).filter(
      (item) => String(item.busid) === String(lineId)
    );

    await setSelect2({
      element: dom.mdpStopId,
      data: filteredStops,
      dropdownParent: $(modal),
      placeholder: "เลือกจุดรถ",
      destroy: true,
    });

    $(dom.mdpStopId).val(selectedValue ? String(selectedValue) : "").trigger("change");
  }

  $(document).on("click", ".btn-enable-disabled-passenger", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (isDispatchFinalized()) return;
    const empno = $(this).data("empno");
    try {
      const res = await updatePassengerStatus({
        dispatch_id: String(state.head.dispatch_id),
        empno: String(empno),
        status: "E",
        update_by: String(login_empno),
      });

      if (!res?.ok) {
        showMessage(res?.message || "คืนสถานะไม่สำเร็จ", "warning");
        return;
      }

      showMessage("คืนสถานะสำเร็จ", "success");

      // reload ทั้งหน้า dispatch + modal
      await loadDispatch();
      await loadDisabledPassengerList();
      await renderDisabledPassengerTable(state.disabledPassengers);

    } catch (error) {
      console.error(error);
      showMessage(error?.message || "เกิดข้อผิดพลาด", "error");
    }
  });

  $(document).on("change", dom.mdpLineId, async function () {
    const modal = document.querySelector(dom.moveDisabledPassengerModal);
    const lineId = $(this).val();
    await reloadDisabledPassengerStopByLine(modal, lineId);
  });



  $(document).on("click", ".btn-update-line-status", async function (e) {
    e.stopPropagation();
    if (isDispatchFinalized()) return;
    const busid = String($(this).data("busid")).trim();
    const status = String($(this).data("status")).trim(); // 0=ซ่อน, 1=กู้กลับ
    console.log("clicked button html =", this.outerHTML);
    console.log("busid =", busid);
    console.log("status =", status);

    if (!state.head?.dispatch_id) {
      showMessage("ไม่พบ dispatch id", "warning");
      return;
    }

    if (!["0", "1"].includes(status)) {
      showMessage("สถานะไม่ถูกต้อง", "warning");
      return;
    }

    const isHide = status === "0";
    const isConfirm = await showConfirm({
      title: isHide ? "ยืนยันการซ่อนสายรถ" : "ยืนยันการกู้กลับสายรถ",
      message: isHide
        ? "ต้องการซ่อนสายรถนี้ออกจากการจัดรถ ใช่หรือไม่ ? <br> (คนที่อยู่ในสายรถนี้ทั้งหมดจะไปอยู่สถานะ => ไม่จัดรถรับส่ง)"
        : "ต้องการกู้กลับสายรถนี้ ใช่หรือไม่ ? <br> (คนที่อยู่ในสายรถนี้ทั้งหมดจะกลับมาอยู่สถานะ => จัดรถรับส่ง)",
      acceptText: "ยืนยัน",
      cancelText: "ยกเลิก",
    });

    if (!isConfirm) return;

    try {
      await showLoader({ show: true });

      const dto = {
        dispatch_id: String(state.head.dispatch_id),
        busid: busid,
        status: status,
        update_by: String(login_empno),
      };

      console.log("UPDATE LINE STATUS DTO =", dto);
      await updateLineDispatchStatus(dto);
      showMessage(isHide ? "ซ่อนสายรถสำเร็จ" : "กู้กลับสายรถสำเร็จ","success");

      await loadDispatch();
    } catch (error) {
      console.error(error);
      showMessage(
        error?.message || (isHide ? "ซ่อนสายรถไม่สำเร็จ" : "กู้กลับสายรถไม่สำเร็จ"),
        "error"
      );
    } finally {
      await showLoader({ show: false });
    }
  });


  function getBusTypeLabel(value) {
    const txt = String(value || "").trim();
    if (txt === "2" || txt.toUpperCase() === "VAN") return "Van";
    return "Bus";
  }

  function mapBusTypeToApi(value) {
    return String(value || "").trim() === "Van" ? "2" : "1";
  }

  function openLineTypeModal(data) {
    const busTypeLabel = getBusTypeLabel(data.bustype);
    const busSeat = String(data.busseat || "").trim();

    $(dom.ltDispatchId).val(String(data.dispatch_id || ""));
    $(dom.ltBusId).val(String(data.busid || ""));
    $(dom.ltBusName).val(String(data.busname || ""));

    $(dom.ltOldBusType).val(busTypeLabel);
    $(dom.ltOldBusSeat).val(busSeat ? `${busSeat} ที่นั่ง` : "-");

    $('input[name="ltBusType"]').prop("checked", false);
    $(`input[name="ltBusType"][value="${busTypeLabel}"]`).prop("checked", true);

    renderSeatOptionsByType(busTypeLabel, busSeat);

    document.querySelector(dom.lineTypeModal).showModal();
  }

  const seatOptionsByType = {Bus: [{ value: "40", label: "40 ที่นั่ง" },],Van: [{ value: "9", label: "9 ที่นั่ง" },{ value: "12", label: "12 ที่นั่ง" },],};
  const defaultSeatByType = {Bus: "40", Van: "12",};

  function renderSeatOptionsByType(type, selectedValue = "") {
    const typeKey = String(type || "").trim();
    const options = seatOptionsByType[typeKey] || [];
    const $seat = $(dom.ltBusSeat);

    $seat.empty();
    $seat.append(`<option value="">-- เลือกจำนวนที่นั่ง --</option>`);

    options.forEach((item) => {
      $seat.append(`<option value="${item.value}">${item.label}</option>`);
    });

    const finalValue =
      selectedValue && options.some((x) => x.value === String(selectedValue))
        ? String(selectedValue)
        : (defaultSeatByType[typeKey] || "");

    $seat.val(finalValue);
  }

  $(document).on("change", 'input[name="ltBusType"]', function () {
    const selectedType = String($(this).val() || "").trim();
    renderSeatOptionsByType(selectedType);
  });


  $(document).on("click", ".btn-edit-line-type", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (isDispatchFinalized()) return;

    openLineTypeModal({
      dispatch_id: $(this).data("dispatch_id"),
      busid: $(this).data("busid"),
      busname: $(this).data("busname"),
      bustype: $(this).data("bustype"),
      busseat: $(this).data("busseat"),
    });
  });


  async function saveLineTypeDispatch() {
    const dispatch_id = String($(dom.ltDispatchId).val() || "").trim();
    const busid = String($(dom.ltBusId).val() || "").trim();
    const selectedType = String($('input[name="ltBusType"]:checked').val() || "").trim();
    const busseat = String($(dom.ltBusSeat).val() || "").trim();
    if (!dispatch_id || !busid) {
      showMessage("ไม่พบข้อมูลสายรถที่ต้องการแก้ไข", "warning");
      return;
    }

    if (!selectedType) {
      showMessage("กรุณาเลือกประเภทรถ", "warning");
      return;
    }

    if (!busseat) {
      showMessage("กรุณาเลือกจำนวนที่นั่ง", "warning");
      return;
    }
    const payload = {
      dispatch_id,
      busid,
      bustype: mapBusTypeToApi(selectedType), // Bus => 1, Van => 2
      busseat,
      update_by: String(login_empno || ""),
    };

    try {
      await showLoader({ show: true });

      const res = await updateLineTypeDispatch(payload);

      if (!res?.status) {
        showMessage(res?.message || "ไม่สามารถแก้ไขประเภทรถได้", "error");
        return;
      }

      showMessage("แก้ไขประเภทรถสำเร็จ", "success");
      document.querySelector(dom.lineTypeModal).close();

      await loadDispatch({
        preserveBusId: busid,
        preserveStopId: state.selectedStop?.stop_id || null,
      });
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "เกิดข้อผิดพลาดในการแก้ไขประเภทรถ", "error");
    } finally {
      await showLoader({ show: false });
    }
  }

  $(document).on("click", dom.btnSaveLineType, async function (e) {
    e.preventDefault();
    await saveLineTypeDispatch();
  });


//----------------------------------------------- S E N D  E M A I L -------------------------------------------
  $(document).on("click", "#btnSaveandSendmail", async function (e) {
    e.preventDefault();
    if (isDispatchFinalized()) return;

    if (!state.head?.dispatch_id) {
      showMessage("ไม่พบ แผนการจัดรถปัจจุบันของ (วัน/เวลา)ที่เลือก", "warning");
      return;
    }

    const isConfirm = await showConfirm({
      title: "บันทึกแผนการจัดรถ",
      message: "ต้องการบันทึกข้อมูลแผนการจัดรถและส่งอีเมลล์ให้พนักงาน ใช่หรือไม่?",
      acceptText: "ยืนยัน",
      cancelText: "ยกเลิก",
    });

    if (!isConfirm) {
      return;
    }

    const currentWorkdate = $(dom.workdate).val();
    const currentType = $(dom.type).val();

    try {
      await showLoader({ show: true });

      // 1) ปิดสถานะงานก่อน
      const dto = {
        dispatch_id: Number(state.head.dispatch_id),
        status: "F",
        update_by: String(login_empno),
      };

      const updateRes = await updateStatusHead(dto);

      // 2) เรียก Node API ให้ไปทำต่อทั้งหมด
      const mailPayload = {
        dispatch_id: Number(state.head.dispatch_id),
        workdate: currentWorkdate,
        dispatch_type: currentType,
        update_by: String(login_empno),
        create_folder: true,
        export_excel: true,
        send_mail: true,
      };

     // const result = await runDispatchExportAndSendMail(mailPayload);
      const result = await exportAndsendmail(mailPayload);


      if (!result?.status) {
        throw new Error(result?.message || "ไม่สามารถสร้างไฟล์ Excel และส่งอีเมลได้");
      }

      showMessage("บันทึกข้อมูล สร้างไฟล์ และส่งอีเมลสำเร็จ", "success");

      // 3) โหลดข้อมูลเดิมกลับตาม
      await reload_dispatch();

    } catch (error) {
      console.error("Save and send mail error:", error);
      showMessage(error?.message || "เกิดข้อผิดพลาดในการสร้างไฟล์และส่งอีเมล", "error");
    } finally {
      await showLoader({ show: false });
    }
  });

  
  async function loadDispatchData({ workdate, type }) {
    const res = await dispatchGetDispatch({
      workdate,
      dispatch_type: type,
    });

    if (!res?.status) {
      throw new Error(res?.message || "ไม่สามารถโหลดข้อมูลแผนการจัดรถได้");
    }

    state.head = res.head || null;
    state.lines = Array.isArray(res.lines) ? res.lines : [];
    state.disabledPassengers = Array.isArray(res.disabledPassengers) ? res.disabledPassengers : [];

    renderAll();
    syncActionButtonsState();
  }


  async function reload_dispatch() {
    const currentWorkdate = $(dom.workdate).val();
    const currentType = $(dom.type).val();
    $(dom.workdate).val(currentWorkdate);
    $(dom.type).val(currentType).trigger("change");
    await initTables();
    bindEvents();
    await loadDispatch();
  }





  async function testCreateFolder() {
    try {
      const res = await createfolder();
      console.log("create folder =", res);
      if (res.status) {
        showMessage("สร้างโฟลเดอร์สำเร็จ: " + res.month_path, "success");
      } else {
        showMessage(res.message || "สร้างโฟลเดอร์ไม่สำเร็จ", "warning");
      }

    } catch (err) {
      console.error(err);
      showMessage("เรียก API ไม่สำเร็จ", "warning");
    }
  }

}