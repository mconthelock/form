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

function bindEvents() {
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

  $(dom.type).on("change", async function () {
    state.type = $(this).val();
    await reloadDispatch();
  });

  $(dom.btnRefresh).on("click", reloadDispatch);

  $(dom.btnAddPassenger).on("click", () => {
    // TODO modal add passenger
    showMessage("info", "TODO: เพิ่ม Passenger modal");
  });

  $(dom.btnSaveDispatch).on("click", onSaveDispatch);

  $(dom.btnAddStop).on("click", () => {
    // TODO modal add stop
    showMessage("info", "TODO: เพิ่มจุดรถ modal");
  });
}

// -------------------------
// Table events (3-level)
// -------------------------
function bindTableEvents() {
  // Level 1 -> Level 2
  $(dom.tblLine).on("click", "tbody tr", function () {
    const row = tableLine.row(this).data();
    if (!row) return;

    state.selectedLineId = row.line_id;
    state.selectedStopId = null;

    renderStopsBySelectedLine();
    renderPassengers([]);

    updateHeaderLabels();
  });

  // Level 2 -> Level 3
  $(dom.tblStop).on("click", "tbody tr", function (e) {
    if ($(e.target).hasClass("btnMoveStop")) return;

    const row = tableStop.row(this).data();
    if (!row) return;

    state.selectedStopId = row.stop_instance_id;
    renderPassengers(row.passengers || []);
    updateHeaderLabels();
  });

  // move stop button
  $(dom.tblStop).on("click", ".btnMoveStop", function () {
    const stopRow = tableStop.row($(this).closest("tr")).data();
    if (!stopRow) return;

    // TODO modal move stop (เลือกสายใหม่ + เวลา)
    showMessage("info", `TODO: ย้ายจุดรถ ${stopRow.stop_name}`);
  });
}

// -------------------------
// LOAD (สำคัญ: ใช้ API จริง)
// -------------------------
async function reloadDispatch() {
  await showLoader({ show: true });

  try {
    const dto = {
      dispatch_date: state.workdate,          // "2026-03-04"
      shift: mapShift($(dom.type).val()),     // "1"
    };

    const res = await dispatchGetOrInit(dto);

    // res example: { dispatch_id, dispatch_date, shift, status, update_by, update_date, lines: [...] }
    state.snapshot = res;
    state.head = {
      dispatch_id: res.dispatch_id,
      dispatch_date: res.dispatch_date,
      shift: res.shift,
      status: res.status,
      update_by: res.update_by,
      update_date: res.update_date,
    };

    // แปลง lines ให้เป็น format ที่ tableLine ใช้
    state.lines = (res.lines || []).map((l) => ({
      line_id: l.line_id,
      busid: l.busid,
      line_name: l.busname,
      vehicle_type: normalizeVehicle(l.bustype),
      vehicle_seat: Number(l.busseat || 0),
      total_pax: Number(l.passenger_total || 0), // ถ้ายังไม่มี field นี้ ให้คำนวณจาก stops->passengers
      seq: l.seq,
      line_status: l.line_status,
      stops: (l.stops || []).map((s) => ({
        stop_dispatch_id: s.stop_dispatch_id,
        stop_id: s.stop_id,
        seq_no: s.seq,
        stop_name: s.stop_name,
        time_in: hhmmToHHMM(s.plan_time),
        passenger_count: Number(s.passenger_count || 0),
        passengers: (s.passengers || []).map((p) => ({
          dispatch_pass_id: p.dispatch_pass_id,
          empno: String(p.empno),
          name: p.name || "", 
        })),
      })),
    }));

    // reset selection
    state.selectedLineId = null;
    state.selectedStopDispatchId = null;

    renderLines(state.lines);
    renderStops([]);
    renderPassengers([]);

    updateSummaryFromSnapshot();
    updateHeaderLabels();
    $(dom.btnAddStop).prop("disabled", true);

    console.log("dispatch snapshot:", res);
  } catch (err) {
    console.error(err);
    showMessage("error", getErrText(err));
  } finally {
    await showLoader({ show: false });
  }
}

// -------------------------
// BUILD DISPATCH (core mapper)
// -------------------------
function buildDispatchFromOT({
  otList,
  passengerRel,
  linesMaster,
  stopsMaster,
  routesMaster,
}) {
  const stopById = new Map(
    (stopsMaster || []).map((s) => [String(s.STOP_ID ?? s.stop_id), s])
  );

  const lineById = new Map(
    (linesMaster || []).map((l) => [String(l.BUSID ?? l.busid), l])
  );

  // EMPNO -> passenger row
  const paxByEmp = new Map(
    (passengerRel || []).map((p) => [String(p.EMPNO ?? p.empno).trim(), p])
  );

  // index route to find BUSLINE by stop
  // match by NEXTSTOP first, fallback STATENO
  const routeByNextStop = new Map();
  const routeByStateNo = new Map();

  (routesMaster || []).forEach((r) => {
    const busline = r.BUSLINE ?? r.busLine;
    const nextStop = r.NEXTSTOP ?? r.nextStop;
    const stateNo = r.STATENO ?? r.stateNo;

    if (nextStop != null) routeByNextStop.set(String(nextStop), r);
    if (stateNo != null) routeByStateNo.set(String(stateNo), r);

    // บางระบบเก็บ stop id ใน field อื่น เผื่อไว้
    const maybeStop = r.BUSSTOP ?? r.stopId;
    if (maybeStop != null && !routeByNextStop.has(String(maybeStop))) {
      routeByNextStop.set(String(maybeStop), r);
    }
  });

  const lineMap = new Map(); // lineId -> lineNode

  (otList || []).forEach((ot) => {
    const empno = String(ot.EMPNO ?? ot.empno ?? "").trim();
    if (!empno) return;

    const pax = paxByEmp.get(empno);
    if (!pax) return; // ถ้าอยากให้ OT ที่ไม่มี passenger เข้า "unassigned" ค่อยเพิ่มทีหลัง

    const stopId = pax.BUSSTOP ?? pax.busStop ?? pax.stop_id;
    if (!stopId) return;

    // ✅ หา route เพื่อรู้ว่า stop นี้อยู่สายไหน
    const routeRow =
      routeByNextStop.get(String(stopId)) ||
      routeByStateNo.get(String(stopId));

    if (!routeRow) {
      console.warn("NO ROUTE FOUND FOR STOP:", stopId, "EMPNO:", empno);
      return;
    }

    const lineId = routeRow.BUSLINE ?? routeRow.busLine;
    if (!lineId) return;

    const lineM = lineById.get(String(lineId));
    const stopM = stopById.get(String(stopId));

    const lineName = lineM?.BUSNAME ?? `Line ${lineId}`;
    const vehicleType = lineM?.BUSTYPE ?? "1";
    const vehicleSeat = Number(lineM?.BUSSEAT ?? 40);

    const stopName = stopM?.STOP_NAME ?? `Stop ${stopId}`;

    // เวลา: ใช้ master stop ก่อน ถ้าไม่มีค่อย fallback TIMEIN จาก OT
    const timeIn =
      pickStopTime(stopM, state.type) ||
      hhmmToHHMM(ot.TIMEIN) ||
      "";

    // ---- line node ----
    const keyLine = String(lineId);
    if (!lineMap.has(keyLine)) {
      lineMap.set(keyLine, {
        line_id: Number(lineId),
        line_name: lineName,
        vehicle_type: normalizeVehicle(vehicleType),
        vehicle_seat: vehicleSeat,
        total_pax: 0,
        stops: [],
      });
    }
    const lineNode = lineMap.get(keyLine);

    // ---- stop node ----
    let stopNode = lineNode.stops.find((s) => String(s.stop_id) === String(stopId));
    if (!stopNode) {
      stopNode = {
        stop_instance_id: `L${keyLine}-S${stopId}`,
        stop_id: Number(stopId),
        seq_no: 0,
        stop_name: stopName,
        time_in: timeIn,
        passengers: [],
      };
      lineNode.stops.push(stopNode);
    }

    // ---- passenger ----
    const name = ot.SNAME ?? "";
    stopNode.passengers.push({ empno, name });
  });

  const result = Array.from(lineMap.values());

  // จัดเรียง stop ตาม STOPNO ของ route
  result.forEach((line) => {
    line.stops = sortStopsByRouteStopNo(line.line_id, line.stops, routesMaster);
    line.stops.forEach((s, idx) => (s.seq_no = idx + 1));
    line.total_pax = line.stops.reduce((acc, s) => acc + (s.passengers?.length || 0), 0);
  });

  // sort line by name
  result.sort((a, b) => String(a.line_name).localeCompare(String(b.line_name), "th"));

  return result;
}

function sortStopsByRouteStopNo(lineId, stops, routesMaster) {
  const routes = (routesMaster || []).filter(
    (r) => String(r.BUSLINE ?? r.busLine) === String(lineId)
  );

  // map stopId -> STOPNO
  const orderMap = new Map();
  routes.forEach((r) => {
    const stopId = r.NEXTSTOP ?? r.STATENO ?? r.BUSSTOP ?? r.stopId;
    const stopNo = Number(r.STOPNO ?? r.stopNo ?? 9999);
    if (stopId != null) orderMap.set(String(stopId), stopNo);
  });

  return [...stops].sort((a, b) => {
    const ao = orderMap.get(String(a.stop_id)) ?? 9999;
    const bo = orderMap.get(String(b.stop_id)) ?? 9999;
    return ao - bo;
  });
}

// -------------------------
// RENDER
// -------------------------
function renderLines(lines) {
  tableLine.clear().rows.add(lines).draw();
}

function renderStops(stops) {
  tableStop.clear().rows.add(stops).draw();
}

function renderPassengers(passengers) {
  tablePassenger.clear().rows.add(passengers).draw();
}

function renderStopsBySelectedLine() {
  if (!state.selectedLineId) {
    renderStops([]);
    $(dom.btnAddStop).prop("disabled", true);
    return;
  }

  const line = state.lines.find((l) => String(l.line_id) === String(state.selectedLineId));
  renderStops(line?.stops || []);
  $(dom.btnAddStop).prop("disabled", false);
}

// -------------------------
// SUMMARY / LABELS
// -------------------------
function updateSummary() {
  const lineCount = state.lines.length;
  const stopCount = state.lines.reduce((acc, l) => acc + (l.stops?.length || 0), 0);
  const paxCount = state.lines.reduce(
    (acc, l) => acc + (l.stops || []).reduce((a2, s) => a2 + (s.passengers?.length || 0), 0),
    0
  );

  $(dom.sumLines).text(lineCount);
  $(dom.sumStops).text(stopCount);
  $(dom.sumPassengers).text(paxCount);
}

function updateHeaderLabels() {
  const line = state.lines.find((l) => String(l.line_id) === String(state.selectedLineId));
  const stop = line?.stops?.find((s) => String(s.stop_dispatch_id) === String(state.selectedStopDispatchId));

  $(dom.lblSelectedLine).text(`Selected: ${line ? line.line_name : "-"}`);
  $(dom.lblSelectedStop).text(`Selected: ${stop ? stop.stop_name : "-"}`);
}

// -------------------------
// SAVE DISPATCH (Overwrite snapshot)
// -------------------------
async function onSaveDispatch() {
  const ok = await showConfirm("ยืนยันบันทึก DISPATCH ?", "ระบบจะบันทึกข้อมูลจัดรถของวันเลือก");
  if (!ok) return;

  await showLoader({ show: true });
  try {
    const payload = buildSaveDispatchPayload();
    const res = await dispatchSaveOverwrite(payload);

    showMessage("success", "บันทึก DISPATCH สำเร็จ");
    await reloadDispatch(); // reload ใหม่เอา id/seq ล่าสุด
  } catch (err) {
    console.error(err);
    showMessage("error", getErrText(err));
  } finally {
    await showLoader({ show: false });
  }
}

function buildSaveDispatchPayload() {
  return {
    dispatch_date: state.workdate,
    shift: mapShift($(dom.type).val()),
    lines: state.lines.map((l) => ({
      busid: l.busid ?? l.line_id,          // แล้วแต่ backend ใช้ field ไหน
      busname: l.line_name,
      bustype: denormalizeVehicle(l.vehicle_type), // "1"/"2"
      busseat: l.vehicle_seat,
      seq: l.seq ?? 0,
      line_status: l.line_status ?? "1",
      stops: (l.stops || []).map((s) => ({
        stop_id: s.stop_id,
        stop_name: s.stop_name,
        seq: s.seq_no,
        plan_time: HHMMToHHmm(s.time_in),  // "1730"
        passenger_count: (s.passengers || []).length,
        passengers: (s.passengers || []).map((p) => ({
          empno: p.empno,
        })),
      })),
    })),
  };
}

// -------------------------
// Helpers
// -------------------------
function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toDDMMYYYY(iso) {
  // iso: YYYY-MM-DD -> DD-MM-YYYY
  const [y, m, d] = String(iso).split("-");
  return `${d}-${m}-${y}`;
}

function hhmmToHHMM(hhmm) {
  // "1730" -> "17:30"
  const s = String(hhmm ?? "").trim();
  if (s.length !== 4) return "";
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}

function normalizeVehicle(v) {
  const s = String(v || "").toUpperCase();
  if (s === "V") return "VAN";
  if (s === "B") return "BUS";
  return s || "BUS";
}

function pickStopTime(stopM, type) {
  if (!stopM) return "";
  // master STOP มี: WORKDAY_TIMEIN / NIGHT_TIMEIN / HOLIDAY_TIMEIN (HHMM)
  if (type === "NIGHT") return hhmmToHHMM(stopM.NIGHT_TIMEIN);
  if (type === "HOLIDAY") return hhmmToHHMM(stopM.HOLIDAY_TIMEIN);
  return hhmmToHHMM(stopM.WORKDAY_TIMEIN); // OT ใช้ WORKDAY เป็น default
}
function mapShift(type) {
  // ถ้าท่านใช้ OT/NIGHT/HOLIDAY ใน dropdown
  if (type === "NIGHT") return "2";
  if (type === "HOLIDAY") return "3";
  return "1"; // OT
}

function HHMMToHHmm(hhmmWithColon) {
  // "17:30" -> "1730"
  const s = String(hhmmWithColon || "").trim();
  if (!s) return "";
  return s.replace(":", "");
}

function denormalizeVehicle(v) {
  // VAN/BUS -> "2"/"1" (ปรับตามระบบจริง)
  const s = String(v || "").toUpperCase();
  if (s === "VAN") return "2";
  return "1";
}

function updateSummaryFromSnapshot() {
  const lineCount = state.lines.length;
  const stopCount = state.lines.reduce((a, l) => a + (l.stops?.length || 0), 0);
  const paxCount = state.lines.reduce(
    (a, l) => a + (l.stops || []).reduce((b, s) => b + (s.passengers?.length || 0), 0),
    0
  );
  $(dom.sumLines).text(lineCount);
  $(dom.sumStops).text(stopCount);
  $(dom.sumPassengers).text(paxCount);
}

function getErrText(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error?.message) return err.error.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  try { return JSON.stringify(err); } catch { return "Unknown error"; }
}