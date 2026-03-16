import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { setSelect2 } from "@amec/webasset/select2";
import select2 from "select2";
import "select2/dist/css/select2.min.css";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";
import { getAllInfo } from "@amec/webasset/indexDB";
import {
<<<<<<< HEAD
	dispatchGetDispatch,
	dispatchSaveOverwrite,
	getLine,
	getStop,
=======
  dispatchGetDispatch, dispatchMoveStop, disableDispatchPassenger,
  getUserbyemp, deleteLineDispatch,
  getLine, getStopRoutes,
  saveAddPassenger, reportBusDaily, reportDisabledPassengerDaily
>>>>>>> 001e0a6 (feat: add export functionality for bus daily and disabled passenger reports; update UI and logic for data export)
} from "./data.js";
import { initApp, tableOption } from "../../utils.js";
import { exportExcel, defaultExcel, mergeCell, applyStyleToRange, alignment, border,} from "@amec/webasset/excel";


<<<<<<< HEAD
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
=======
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
  };

const state = {
  snapshot: null,
  head: null,
  lines: [],
  selectedLine: null,
  selectedStop: null,
  addPassengerLines: [],
  addPassengerStops: [],
>>>>>>> 001e0a6 (feat: add export functionality for bus daily and disabled passenger reports; update UI and logic for data export)
};

  let tableLine;
  let tableStop;
  let tablePassenger;
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

  function initFlatpickr(selector, modal) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (el._flatpickr) {
      el._flatpickr.destroy();
    }
    setDatePicker({ element: selector, time: true, appendTo: modal });
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
<<<<<<< HEAD
	if (uiType === "OT") return "D"; // OT Day (NORMAL)
	if (uiType === "NIGHT") return "N"; // Night
	if (uiType === "HOLIDAY") return "H"; // Holiday
	return "D";
=======
  if (uiType === "OT") return "D";
  if (uiType === "OT_SPECIAL") return "S";
  if (uiType === "NIGHT") return "N";
  if (uiType === "HOLIDAY") return "H";
  return "D";
>>>>>>> 001e0a6 (feat: add export functionality for bus daily and disabled passenger reports; update UI and logic for data export)
}

function makeDtoGetDispatch() {
	return {
		workdate: $(dom.workdate).val(), // YYYY-MM-DD
		dispatch_type: "O", // หน้านี้เป็น OT dispatch
		shift: mapShift($(dom.type).val()), // D/N/H
	};
}

function setSelectedLineLabel(line) {
	$(dom.lblSelectedLine).text(
		line ? `Selected: ${line.busname || line.busid || "-"}` : "Selected: -",
	);
}

function setSelectedStopLabel(stop) {
	$(dom.lblSelectedStop).text(
		stop
			? `Selected: ${stop.stop_name || stop.stop_id || "-"}`
			: "Selected: -",
	);
}

function updateSummary() {
	const totalLines = state.lines.length;
	const totalStops = state.lines.reduce(
		(sum, l) => sum + (l.stops || []).length,
		0,
	);
	const totalPassengers = state.lines.reduce((sum, l) => {
		return (
			sum +
			(l.stops || []).reduce(
				(s2, st) => s2 + (st.passengers || []).length,
				0,
			)
		);
	}, 0);

	$(dom.sumLines).text(totalLines);
	$(dom.sumStops).text(totalStops);
	$(dom.sumPassengers).text(totalPassengers);
}

<<<<<<< HEAD
function clearRightTables() {
	state.selectedLine = null;
	state.selectedStop = null;
	setSelectedLineLabel(null);
	setSelectedStopLabel(null);
	$(dom.btnAddStop).prop("disabled", true);
	tableStop.clear().draw();
	tablePassenger.clear().draw();
}

<<<<<<< HEAD
function initTables() {
	createTable(dom.tblLine, {
		...tableOption,
		searching: false,
		paging: false,
		info: false,
		columns: [
			{
				title: "BUS",
				data: null,
				render: (v, t, row) => row.busname || row.busid || "-",
			},
			{
				title: "SEAT",
				data: "busseat",
				width: "60px",
				defaultContent: "-",
			},
			{
				title: "TYPE",
				data: "bustype",
				width: "60px",
				defaultContent: "-",
			},
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
			{
				title: "PLAN",
				data: "plan_time",
				width: "70px",
				defaultContent: "-",
			},
			{
				title: "PAX",
				data: null,
				width: "60px",
				render: (v, t, row) =>
					row.passengers ? row.passengers.length : 0,
			},
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
=======
async function lineOptions(data) {
  const opt = { ...tableOption };
  opt.data = data;
  opt.searching = false;
  opt.paging = false;
  opt.info = false;
  opt.columns = [
    {
      data: null,  title: "สายรถ",
      render: function (data, type, row) {
        return row.busname || row.busid || "-";
      },
    },
    {
      data: null, title: "ที่นั่ง",
      className: "text-center",
      width: "120px",
      render: function (data, type, row) {
        const p = Number(row.passenger_count || 0);
        const s = Number(row.busseat || 0);

        let color = "bg-green-100 text-green-700";
        if (s && p / s > 0.9) {
          color = "bg-red-100 text-red-700";
        } else if (s && p / s > 0.7) {
          color = "bg-yellow-100 text-yellow-700";
        }

        return `<span class="px-2 py-1 text-xs rounded-full ${color}">${p} / ${s}</span>`;
      }
    },
    {
      data: "bustype",  title: "ประเภท",
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
    {
      data: null,
      title: "จัดการ",
      className: "text-center",
      width: "50",
      orderable: false,
      render: function (data, type, row) {
        return `<button class="btn-delete-line px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer" data-busid="${row.busid}">ลบ</button> `;
      },
    },
  ];
  opt.createdRow = function (row) {
    $(row).addClass("line-row cursor-pointer hover:bg-gray-100 transition");
  };
  return opt;
}

  async function stopOptions(data) {
    const sortedData = [...(data || [])].sort((a, b) => {
      const t1 = parseInt(a.plan_time || "9999", 10);
      const t2 = parseInt(b.plan_time || "9999", 10);
      return t1 - t2;
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
        data: "plan_time", title: "เวลา",
        className: "text-center",
        width: "90px",
        defaultContent: "-",
        render: function (data) {
          if (!data) return "-";
          const t = data.toString();
          if (t.length === 4) {
            return t.slice(0, 2) + ":" + t.slice(2, 4);
          }
          return t;
        },
      },
      {
        data: null, title: "จัดการ", className: "text-center", width: "80px", orderable: false,
        render: function (data, type, row) {
          return `
            <button
              class="btn-move-stop px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-400 cursor-pointer"
              data-stop-id="${row.stop_id}"
              data-stop-name="${row.stop_name || ""}"
              data-plan-time="${row.plan_time || ""}"
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
        txt = txt.replace("SEC", "").trim();
        txt = txt.replace(".", "").trim();
        txt = txt.replace(" ", "").trim();
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
  ];
  return opt;
}
>>>>>>> 5567cd8 (feat: enhance bus overtime UI with improved table structures and modal functionality)

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

			tableStop
				.clear()
				.rows.add(firstLine.stops || [])
				.draw();

			const trLine0 = $(tableLine.row(0).node());
			$(tableLine.table().body()).find("tr").removeClass("selected");
			trLine0.addClass("selected");

			if ((firstLine.stops || []).length) {
				const firstStop = firstLine.stops[0];
				state.selectedStop = firstStop;
				setSelectedStopLabel(firstStop);

				tablePassenger
					.clear()
					.rows.add(firstStop.passengers || [])
					.draw();

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
=======
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
        data: null,  title: "สายรถ",
        render: function (data, type, row) {
          return row.busname || row.busid || "-";
        },
      },
      {
        data: null, title: "ที่นั่ง",
        className: "text-center",
        width: "120px",
        render: function (data, type, row) {
          const p = Number(row.passenger_count || 0);
          const s = Number(row.busseat || 0);
          const remain = s - p;

          let color = "bg-green-100 text-green-700";

          if (s > 0 && p >= s) {// เต็มหรือเกิน
            color = "bg-red-300 text-red-900";
          } 
          else if (s > 0 && remain < 4) {// เหลือน้อยกว่า 4 ที่
            color = "bg-gray-300 text-gray-900";
          } 
          else if (s > 0 && p / s > 0.7) {// เกิน 70%
            color = "bg-yellow-100 text-yellow-700";
          }

          return `<span class="px-2 py-1 text-xs rounded-full ${color}">${p} / ${s}</span>`;
        }
      },
      {
        data: "bustype",  title: "ประเภท",
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
      {
        data: null,
        title: "จัดการ",
        className: "text-center",
        width: "50",
        orderable: false,
        render: function (data, type, row) {
          return `<button class="btn-delete-line px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer" data-busid="${row.busid}">ลบ</button> `;
        },
      },
    ];
    opt.createdRow = function (row) {
      $(row).addClass("line-row cursor-pointer hover:bg-gray-100 transition");
    };
    return opt;
  }

  async function stopOptions(data) {
    const sortedData = [...(data || [])].sort((a, b) => {
      const t1 = parseInt(a.plan_time || "9999", 10);
      const t2 = parseInt(b.plan_time || "9999", 10);
      return t1 - t2;
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
      /*
      {
        data: "plan_time", title: "เวลา",
        className: "text-center",
        width: "90px",
        defaultContent: "-",
        render: function (data) {
          if (!data) return "-";
          const t = data.toString();
          if (t.length === 4) {
            return t.slice(0, 2) + ":" + t.slice(2, 4);
          }
          return t;
        },
      },*/
      {
        data: null, title: "จัดการ", className: "text-center", width: "80px", orderable: false,
        render: function (data, type, row) {
          return `
            <button
              class="btn-move-stop px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-400 cursor-pointer"
              data-stop-id="${row.stop_id}"
              data-stop-name="${row.stop_name || ""}"
              data-plan-time="${row.plan_time || ""}"
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
          return `
            <button
              class="btn-delete-passenger px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
              data-empno="${row.empno || ""}"
              data-name="${row.thainame || ""}"
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

      await renderLineTable(state.lines);
      await renderStopTable([]);
      await renderPassengerTable([]);

      if (state.lines.length > 0) {
        let lineIndex = findLineIndexByBusId(preserveBusId);
        if (lineIndex < 0) lineIndex = 0;

        const targetLine = state.lines[lineIndex];
        await selectLine(targetLine, lineIndex, preserveStopId);
      }
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
>>>>>>> 001e0a6 (feat: add export functionality for bus daily and disabled passenger reports; update UI and logic for data export)

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
    $(dom.btnAddPassenger).prop("disabled", false);
    await renderPassengerTable(stop.passengers || []);

    $(".stop-row").removeClass("stop-selected");
    if (rowIndex !== null && tableStop?.row(rowIndex).node()) {
      $(tableStop.row(rowIndex).node()).addClass("stop-selected");
    }
  }

function bindEvents() {
<<<<<<< HEAD
	$(dom.workdate).on("change", loadDispatch);
	$(dom.type).on("change", loadDispatch);

	$(dom.btnAddPassenger).on("click", () => {
		if (!state.selectedStop)
			return showMessage("warning", "กรุณาเลือก BUS STOP ก่อน");
		// TODO: open modal add passenger
		console.log("ADD PASSENGER", state.selectedStop);
	});

	$(dom.btnAddStop).on("click", () => {
		if (!state.selectedLine)
			return showMessage("warning", "กรุณาเลือก BUS LINE ก่อน");
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

			showMessage("success", "บันทึก DISPATCH สำเร็จ");
			await reloadDispatch(); // reload ใหม่เอา id/seq ล่าสุด
		} catch (err) {
			console.error(err);
			showMessage("error", getErrText(err));
		} finally {
			await showLoader({ show: false });
			await showLoader({ show: false });
		}
	});
}

function buildSaveDispatchPayload() {
	return {
		dispatch_date: state.workdate,
		shift: mapShift($(dom.type).val()),
		lines: state.lines.map((l) => ({
			busid: l.busid ?? l.line_id, // แล้วแต่ backend ใช้ field ไหน
			busname: l.line_name,
			bustype: denormalizeVehicle(l.vehicle_type), // "1"/"2"
			busseat: l.vehicle_seat,
			seq: l.seq ?? 0,
			line_status: l.line_status ?? "1",
			stops: (l.stops || []).map((s) => ({
				stop_id: s.stop_id,
				stop_name: s.stop_name,
				seq: s.seq_no,
				plan_time: HHMMToHHmm(s.time_in), // "1730"
				passenger_count: (s.passengers || []).length,
				passengers: (s.passengers || []).map((p) => ({
					empno: p.empno,
				})),
			})),
		})),
	};
}

$(document).ready(async function () {
	initApp?.(); // ถ้า utils.js ของท่านต้อง init อะไร
	$(dom.workdate).val(todayYMD());
	$(dom.type).val("OT");

	initTables();
	bindEvents();
	await loadDispatch();
});

// ⭐ state ใหม่ของหน้า
let tableNormal;
let tableOT;

let passengerNormal = [];
let passengerOT = [];

let lines = [];

/* ================= INIT ================= */
$(async function () {
  initApp();

  state.workdate = getTodayISO();
  $(dom.workdate).val(state.workdate);
  $(dom.type).val(state.type);

  await initTables();        // ✅ ต้อง await
  console.log("DT OK?", typeof tableLine.clear, typeof tableStop.clear, typeof tablePassenger.clear);
  bindHeaderEvents();
  bindTableEvents();

  await reloadDispatch();
});

// -------------------------
// DataTables
// -------------------------
async function initTables() {
  tableLine = await createTable(
    {
      ...tableOption,
      columns: [
        { title: "สายรถ", data: "line_name" },
        { title: "ประเภทรถ", data: "vehicle_type" },
        { title: "จำนวน", data: "total_pax" },
      ],
    },
    {
      id: "tblLine",
      // แนะนำปิด selectRows ของ lib นี้ไปก่อน (เรา bind click เอง)
      selectRows: { status: false },
    }
  );

  tableStop = await createTable(
    {
      ...tableOption,
      columns: [
        { title: "จุดที่", data: "seq_no" },
        { title: "จุดรถ", data: "stop_name" },
        { title: "เวลา", data: "time_in" },
        {
          title: "",
          data: null,
          orderable: false,
          render: () => `<button class="btnMoveStop btn btn-sm">ย้าย</button>`,
        },
      ],
    },
    {
      id: "tblStop",
      selectRows: { status: false },
    }
  );

  tablePassenger = await createTable(
    {
      ...tableOption,
      columns: [
        { title: "รหัส", data: "empno" },
        { title: "ชื่อ", data: "name" },
      ],
    },
    {
      id: "tblPassenger",
      selectRows: { status: false },
    }
  );
}

// -------------------------
// Header events
// -------------------------
function bindHeaderEvents() {
  $(dom.workdate).on("change", async function () {
    state.workdate = $(this).val();
    await reloadDispatch();
  });

  $(dom.btnAddStop).prop("disabled", true);
  $(dom.btnAddPassenger).prop("disabled", true);
}

  async function loadDispatch(options = {}) {
    await showLoader({ show: true });
    try {
      const dto = makeDtoGetDispatch();

      if (!dto.workdate) {
        showMessage("กรุณาเลือกวันที่", "warning");
        return;
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

      await renderLineTable(state.lines);
      await renderStopTable([]);
      await renderPassengerTable([]);

      if (state.lines.length > 0) {
        let lineIndex = findLineIndexByBusId(preserveBusId);
        if (lineIndex < 0) lineIndex = 0;

        const targetLine = state.lines[lineIndex];
        await selectLine(targetLine, lineIndex, preserveStopId);
      }
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
    $(dom.btnAddPassenger).prop("disabled", false);
    await renderPassengerTable(stop.passengers || []);

    $(".stop-row").removeClass("stop-selected");
    if (rowIndex !== null && tableStop?.row(rowIndex).node()) {
      $(tableStop.row(rowIndex).node()).addClass("stop-selected");
    }
  }

function bindEvents() {
=======
>>>>>>> 5567cd8 (feat: enhance bus overtime UI with improved table structures and modal functionality)
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

<<<<<<< HEAD

  $(document).on("click", ".btn-move-stop", async function (e) {
    e.stopPropagation();
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



  $(document).on("click", ".btn-move-stop", async function (e) {
    e.stopPropagation();
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

      if (!isConfirm) return;
      await showLoader({ show: true });
      const dto = {
        dispatch_id: String(state.head?.dispatch_id || ""),
        stop_id: String(stopId || ""),
        target_line_id: String(targetLineId || ""),
        update_by: String(login_empno || ""),
      };

      console.log("MOVE STOP DTO =", dto);
      console.log("dispatch_id =", state.head?.dispatch_id);
      console.log("stop_id =", stopId);
      console.log("target_line_id =", targetLineId);
      console.log("update_by =", login_empno);

      await dispatchMoveStop(dto);

      showMessage("ย้ายสายรถสำเร็จ", "success");
      document.getElementById("move_stop_modal").close();
      await loadDispatch();
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    }
  });

  function getSelectedAddPassengerStop() {
    const selectedId = $("#apStopId").val();
    return (state.addPassengerStops.find( (item) => String(item.id) === String(selectedId)) || null);
  }

  $(document).on("change", "#apStopId", function () {
    const selectedId = $(this).val();
    const item = state.addPassengerStops.find((x) => String(x.id) === String(selectedId));
    if (!item) return;
    $("#apLineId").val(String(item.busid)).trigger("change.select2");
  });

  //=============== Report ===============

function formatPlanTime(time) {
  if (!time) return "-";
  const t = String(time).padStart(4, "0");
  return t.length === 4 ? `${t.slice(0, 2)}:${t.slice(2, 4)}` : t;
}

// =========================
// 1) export คนที่จัดรถ
// =========================
async function exportBusDailyExcel(dispatchId) {
  const res = await reportBusDaily({ dispatch_id: String(dispatchId) });
  if (!res?.status) {
    throw new Error(res?.message || "ไม่สามารถดึงข้อมูลรายงานจัดรถได้");
  }

  const rows = Array.isArray(res.rows) ? res.rows : [];
  if (!rows.length) {
    throw new Error("ไม่พบข้อมูลรายชื่อผู้ที่จัดรถ");
  }

  const excelRows = [];
  let no = 1;

  // group ตามสายรถ
  const grouped = rows.reduce((acc, row) => {
    const busName =
      row.bus_name ||
      row.BUSNAME ||
      row.line_name ||
      row.busline_name ||
      "ไม่ระบุสายรถ";

    if (!acc[busName]) acc[busName] = [];
    acc[busName].push(row);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([busName, list]) => {
    excelRows.push({
      NO: "",
      EMPNO: "",
      FULLNAME: `สายรถ : ${busName}`,
      DEPT: "",
      STOP_NAME: "",
      PLAN_TIME: "",
      __isGroup: true,
    });

    list.forEach((row) => {
      excelRows.push({
        NO: no++,
        EMPNO: row.empno || row.EMPNO || "",
        FULLNAME: row.fullname || row.FULLNAME || row.stname || row.STNAME || "",
        DEPT: row.dept || row.DEPT || row.sdept || row.SDEPT || "",
        STOP_NAME: row.stop_name || row.STOP_NAME || "",
        PLAN_TIME: formatPlanTime(row.plan_time || row.PLAN_TIME),
        __isGroup: false,
      });
    });

    // เว้นบรรทัดแต่ละกลุ่ม
    excelRows.push({
      NO: "",
      EMPNO: "",
      FULLNAME: "",
      DEPT: "",
      STOP_NAME: "",
      PLAN_TIME: "",
      __isBlank: true,
    });
  });

  // ตัด blank row ท้ายสุดออก
  while (excelRows.length && excelRows[excelRows.length - 1].__isBlank) { excelRows.pop(); }

  const workbook = await defaultExcel({
    data: excelRows.map((row) => ({
      NO: row.NO,
      EMPNO: row.EMPNO,
      FULLNAME: row.FULLNAME,
      DEPT: row.DEPT,
      STOP_NAME: row.STOP_NAME,
      PLAN_TIME: row.PLAN_TIME,
    })),

    column: [
      { key: "NO", header: "No" },
      { key: "EMPNO", header: "รหัส" },
      { key: "FULLNAME", header: "ชื่อ-นามสกุล / สายรถ" },
      { key: "DEPT", header: "แผนก" },
      { key: "STOP_NAME", header: "จุดลง" },
      { key: "PLAN_TIME", header: "เวลา" },
    ],

    sheetName: "Bus Daily", manual: true, autoWidth: false,
    manualActions: (sheet) => {
      sheet.insertRow(1, [res.title || "รายงานผู้ที่จัดรถ"]);
      sheet.insertRow(2, [`Update : ${today}`]);
      sheet.insertRow(3, []);

      mergeCell(sheet, 1, 1, 1, 6);
      mergeCell(sheet, 2, 1, 2, 6);

      applyStyleToRange(sheet, 1, 6, 1, {
        font: { bold: true, size: 16 },
        alignment: alignment("center", "middle"),
      });

      applyStyleToRange(sheet, 1, 6, 2, {
        font: { bold: true, size: 14 },
        alignment: alignment("center", "middle"),
      });

      applyStyleToRange(sheet, 1, 6, 4, {
        font: { bold: true, size: 13 },
        alignment: alignment("center", "middle"),
        border: border(),
      });

      sheet.getColumn(1).width = 6;
      sheet.getColumn(2).width = 12;
      sheet.getColumn(3).width = 32;
      sheet.getColumn(4).width = 20;
      sheet.getColumn(5).width = 24;
      sheet.getColumn(6).width = 12;

      const dataStartRow = 5;
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber < 4) return;
        row.eachCell((cell, colNumber) => {
          cell.font = { ...cell.font, size: 12 };
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
          cell.border = border();

          if (colNumber === 3 && rowNumber >= dataStartRow) {
            cell.alignment = {
              vertical: "middle",
              horizontal: "left",
              wrapText: true,
              indent: 1,
            };
          }
        });
      });

      // style group row
      excelRows.forEach((item, index) => {
        const rowNo = index + 5; // header table อยู่ row 4, data เริ่ม row 5
        if (item.__isGroup) {
          mergeCell(sheet, rowNo, 3, rowNo, 6);

          for (let c = 1; c <= 6; c++) {
            const cell = sheet.getRow(rowNo).getCell(c);
            cell.font = { bold: true, size: 12 };
            cell.border = border();
            cell.alignment = alignment("left", "middle");
          }
        }

        if (item.__isBlank) {
          for (let c = 1; c <= 6; c++) {
            const cell = sheet.getRow(rowNo).getCell(c);
            cell.border = border();
          }
        }
      });
    },
  });
  exportExcel(workbook, `bus_daily_${dispatchId}`);
}

// =========================
// 2) export คนที่ไม่ได้จัดรถ
// =========================
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

      await exportBusDailyExcel(dispatchId);
      //await exportDisabledPassengerExcel(dispatchId);

      showMessage("Export Excel สำเร็จ", "success");
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Export ไม่สำเร็จ", "error");
    } finally {
      await showLoader({ show: false });
    }
  });


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


}