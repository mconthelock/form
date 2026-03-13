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
	dispatchGetDispatch,
	dispatchSaveOverwrite,
	getLine,
	getStop,
} from "./data.js";
import { initApp, tableOption } from "../../utils.js";
import { exportExcel, defaultExcel, mergeCell, applyStyleToRange, alignment, border,} from "@amec/webasset/excel";


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
        preserveBusId: selectedLine?.busid,
        preserveStopId: selectedStop?.stop_id,
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