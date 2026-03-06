import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";
import { getAllInfo } from "@amec/webasset/indexDB";
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

    console.log("ADD PASSENGER", state.selectedStop);
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
      const stopId = $(this).data("stop-id");
      const stopName = $(this).data("stop-name");
      const currentLine = state.selectedLine;

      if (!currentLine) {
        showMessage("กรุณาเลือกสายรถก่อน", "warning");
        return;
      }

      $("#moveStopId").val(stopId);
      $("#moveStopName").val(stopName);
      $("#moveCurrentLineId").val(currentLine.busid || "");
      $("#moveCurrentLineName").val(currentLine.busname || currentLine.busid || "");

      const $ddl = $("#moveTargetLine");
      $ddl.empty();
      $ddl.append(`<option value="">-- เลือกสายรถ --</option>`);

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

      document.getElementById("move_stop_modal").showModal();
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

    if (String(targetLineId) === String(currentLineId)) {
      showMessage("กรุณาเลือกสายรถใหม่ที่ไม่ใช่สายเดิม", "warning");
      return;
    }

    try {
      const isConfirm = await showConfirm({
        title: "ยืนยันการย้ายสายรถ",
        message: "ต้องการย้ายจุดรถนี้ไปยังสายรถที่เลือกหรือไม่?",
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
      showMessage(error?.message || "เกิดข้อผิดพลาดในการย้ายสายรถ", "error");
    } finally {
      await showLoader({ show: false });
    }
  });
}