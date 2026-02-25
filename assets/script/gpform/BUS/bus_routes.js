import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import {
	getLine,
	getRoute,
	getStop,
	insertLine,
	updateLine,
	deleteLineCascade,
	insertStop,
	updateStop,
	insertRoute,
	deleteRoute,
	deleteStopandPassenger,
} from "./data.js";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";
import { generatePdf } from "@amec/webasset/api/pdf";
import { buildBusRouteHtml } from "./templete_pdf.js";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { createBtn, activatedBtn } from "@amec/webasset/components/buttons";

var tableLine;
var tableStop;
let selectedBusId = null;

$(document).ready(async function () {
	await initApp({ submenu: ".nav-bus" });
	await showLoader({ show: true });

	const data_line = await getLine();
	const tale_line = await lineOptions(data_line);
	tableLine = await createTable(tale_line, { id: "#line_table" });
	console.log("TABLE LINE:", tableLine);
	if (tableLine.rows().count() > 0) {
		const firstRow = tableLine.row(0);
		const firstData = firstRow.data();
		selectedBusId = firstData.BUSID;
		$("#routeLineName").text(firstData.BUSNAME);
		$(firstRow.node()).addClass("line-selected");
		const route = await getRoute({ BUSLINE: selectedBusId });
		await showRouteDetail(route);
	}

	const exportBtn = await createBtn({
		id: "btnExportRoute",
		title: "Export Transportation Route",
		icon: "fi fi-tr-file-pdf text-lg",
		className: "btn-warning text-white",
	});
	$("#btn-container").html(`<div class="flex gap-2">${exportBtn}</div>`);

	await showLoader({ show: false });
});


async function lineOptions(data) {
	const filteredData = data
		.filter((item) => item.BUSSTATUS === "1")
		.sort((a, b) => a.BUSNAME.localeCompare(b.BUSNAME));
	const opt = { ...tableOption };
	opt.lengthMenu = [10, 15, 20, 30, 50, -1];
	opt.pageLength = 15;
	opt.data = filteredData;
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
		},
		{
			data: null,
			title: "จัดการ",
			className: "text-center",
			orderable: false,
			render: function (data, type, row) {
				return `
                <div class="flex justify-center gap-2">
                    <button class="btn-edit-line px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 cursor-pointer"data-id="${row.BUSID}">✏️</button>
                    <button class="btn-delete-line px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer" data-id="${row.BUSID}">🗑</button>
                </div>
            `;
			},
		},
	];
	opt.createdRow = function (row, data) {
		$(row).addClass("line-row cursor-pointer hover:bg-gray-100 transition");
	};
	return opt;
}

$(document).on("click", "#btnAddLine", async function () {
	$("#lineModalTitle").text("เพิ่มสายรถ");
	$("#hdLineId").val("");
	$("#txtLineName").val("");
	$("input[name='busType'][value='1']").prop("checked", true);
	$("#ddlSeat").val("");
	document.getElementById("line_modal").showModal();
});

$(document).on("click", "#btnAddStop", function () {
	if (!selectedBusId) {
		showMessage("กรุณาเลือกสายรถก่อน", "warning");
		return;
	} else {
		// ⭐ reset ค่า form
		$("#hdStopNo").val("");
		$("#txtStopName").val("");
		$("#workdayTime").val("");
		$("#nightTime").val("");
		$("#holidayTime").val("");
	}

	// ดึงข้อมูลสายที่เลือก
	const rowData = tableLine
		.rows()
		.data()
		.toArray()
		.find((r) => r.BUSID == selectedBusId);
	$("#hdBusId").val(selectedBusId);
	$("#lblBusName").text(rowData?.BUSNAME || "-");

	const modal = document.getElementById("stop_modal");
	modal.showModal();
	initFlatpickr("#workdayTime", modal);
	initFlatpickr("#nightTime", modal);
	initFlatpickr("#holidayTime", modal);
});

$(document).on("click", ".line-row", async function (e) {
	e.preventDefault();
	try {
		const data = tableLine.row($(this)).data();
		selectedBusId = data.BUSID;
		$(".line-row").removeClass("line-selected");
		$(this).addClass("line-selected");

		const route = await getRoute({ BUSLINE: data.BUSID });
		const detail = await showRouteDetail(route);
		$("#routeLineName").text(data.BUSNAME);
	} catch (error) {
		console.error(error);
		showMessage("Failed to load route details", "error");
	}
});

async function showRouteDetail(data) {
	if (tableStop) {
		tableStop.destroy();
		$("#route_detail_table").empty();
	}
	const stop = await getStop();
	const route_data = data
		.map((r) => {
			const stops = stop.filter(
				(s) => s.STOP_ID === r.STOPNO && s.STOP_STATUS == "1",
			);
			return { ...r, stops: stops };
		})
		.filter((r) => r.stops.length > 0);

	// ✅ sort ตาม WORKDAY_TIMEIN น้อย → มาก
	route_data.sort((a, b) => {
		const t1 = a.stops?.[0]?.WORKDAY_TIMEIN || "9999";
		const t2 = b.stops?.[0]?.WORKDAY_TIMEIN || "9999";
		return parseInt(t1) - parseInt(t2);
	});

	console.log("ROUTE DATA WITH STOPS:", route_data);
	const tale_stop = await routeOptions(route_data);
	tableStop = await createTable(tale_stop, { id: "#route_detail_table" });
}

async function routeOptions(data) {
	const opt = { ...tableOption };
	opt.data = data;
	opt.lengthMenu = [10, 15, 20, 30, 50, -1];
	opt.pageLength = 15;
	opt.ordering = false;
	opt.columns = [
		{
			data: null,
			title: "จุดที่",
			className: "text-center",
			render: function (data, type, row, meta) {
				return meta.row + 1; // 🔥 รัน 1,2,3,...
			},
		},
		{
			data: "stops",
			title: "จุดรถ",
			render: (data) => data[0]?.STOP_NAME || "-",
		},
		{
			data: "stops",
			title: "กะปกติ",
			render: (data) => formatTime4Digit(data?.[0]?.WORKDAY_TIMEIN),
		},
		{
			data: "stops",
			title: "กะกลางคืน",
			render: (data) => formatTime4Digit(data?.[0]?.NIGHT_TIMEIN),
		},
		{
			data: "stops",
			title: "วันหยุด",
			render: (data) => formatTime4Digit(data?.[0]?.HOLIDAY_TIMEIN),
		},
		{
			data: null,
			title: "จัดการ",
			className: "text-center",
			orderable: false,
			render: function (data, type, row) {
				return `
                    <div class="flex justify-center gap-2">
                        <button
                          class="btn-edit-stop px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 cursor-pointer"
                          data-stop="${row.STOPNO}" data-route="${row.BUSLINE}"> ✏️
                        </button>
                        <button
                          class="btn-delete-stop px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
                          data-stop="${row.STOPNO}" data-route="${row.BUSLINE}"> 🗑
                        </button>
                    </div>
                `;
			},
		},
	];
	opt.createdRow = function (row, data) {
		$(row).addClass("stop-row");
	};
	return opt;
}

$(document).on("click", "#btnSaveLine", async function () {
	const lineId = $("#hdLineId").val();
	const lineName = $("#txtLineName").val().trim();
	const seat = $("#ddlSeat").val();
	const busType = $("input[name='busType']:checked").val();
	const isChonburi = $("input[name='isChonburi']:checked").val();

	if (!lineName) {
		showMessage("กรุณากรอกชื่อสายรถ", "warning");
		return;
	}

	if (!seat) {
		showMessage("กรุณาเลือกจำนวนที่นั่ง", "warning");
		return;
	}

	const payload = {
		BUSNAME: lineName,
		BUSTYPE: busType,
		BUSSTATUS: "1",
		BUSSEAT: seat,
		IS_CHONBURI: isChonburi,
	};
	try {
		if (lineId) {
			payload.BUSID = lineId;
			const update_line = await updateLine(payload);
		} else {
			const add_line = await insertLine(payload);
		}

		showMessage("บันทึกข้อมูลเรียบร้อย", "success");
		document.getElementById("line_modal").close();

		const newData = await getLine();
		const newOption = await lineOptions(newData);
		tableLine.destroy();
		$("#line_table").empty();
		tableLine = await createTable(newOption, { id: "#line_table" });
		resetLineForm();
	} catch (error) {
		console.error(error);
		showMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
	}
});

function resetLineForm() {
	$("#hdLineId").val("");
	$("#txtLineName").val("");
	$("#ddlSeat").val("");
	$("input[name='busType'][value='1']").prop("checked", true);
	$("input[name='isChonburi'][value='1']").prop("checked", true);
}

$(document).on("click", "#btnSaveStop", async function () {
	const stopNo = $("#hdStopNo").val();
	const busLine = $("#hdBusId").val();
	const stopName = $("#txtStopName").val().trim();
	const stopType = $("input[name='stopType']:checked").val();
	const workdayTime = getTimeHHMM("#workdayTime", true);
	const nightTime = getTimeHHMM("#nightTime");
	const holidayTime = getTimeHHMM("#holidayTime");

	if (!busLine) {
		showMessage("กรุณาเลือกสายรถ", "warning");
		return;
	}

	if (!stopName) {
		showMessage("กรุณากรอกชื่อจุดรถ", "warning");
		return;
	}

	if (!workdayTime) {
		showMessage("กรุณาเลือกเวลากะปกติให้ครบ", "warning");
		return;
	}
	if (nightTime === null) return;
	if (holidayTime === null) return;

	const payload_stop = {
		STOP_NAME: stopName,
		STOP_STATUS: "1",
		WORKDAY_TIMEIN: workdayTime,
		NIGHT_TIMEIN: nightTime || "",
		HOLIDAY_TIMEIN: holidayTime || "",
	};

	try {
		if (stopNo) {
			payload_stop.STOP_ID = stopNo;
			await updateStop(payload_stop);
			showMessage("แก้ไขข้อมูลเรียบร้อย", "success");
		} else {
			//  1. insert stop
			const insertResponse = await insertStop(payload_stop);
			console.log("INSERT STOP RESPONSE:", insertResponse);
			const newStopId = insertResponse.STOP_ID;

			// 🔥 2. insert route ต่อ
			const payload_route = {
				BUSLINE: Number(busLine),
				STOPNO: Number(newStopId),
				NEXTSTOP: 0,
				STATENO: Number(stopType),
				IS_START: "1",
			};

			await insertRoute(payload_route);
			showMessage("เพิ่มจุดรถเรียบร้อย", "success");
		}

		const route = await getRoute({ BUSLINE: busLine });
		await showRouteDetail(route);
		document.getElementById("stop_modal").close();
		$("#hdStopNo").val("");
	} catch (error) {
		console.error(error);
		showMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
	}
});

$(document).on("click", ".btn-edit-stop", function (e) {
	const stopNo = $(this).data("stop");
	const busLine = $(this).data("route");
	const rowData = tableStop
		.rows()
		.data()
		.toArray()
		.find((r) => r.STOPNO == stopNo && r.BUSLINE == busLine);
	const stop = rowData.stops?.[0];
	const lineData = tableLine
		.rows()
		.data()
		.toArray()
		.find((r) => r.BUSID == busLine);

	$("#hdBusId").val(busLine);
	$("#hdStopNo").val(stopNo);
	$("#lblBusName").text(lineData?.BUSNAME || "-");
	$("#txtStopName").val(stop?.STOP_NAME || "");

	$("#workdayTime").val("");
	$("#nightTime").val("");
	$("#holidayTime").val("");

	const modal = document.getElementById("stop_modal");
	modal.showModal();
	initFlatpickr("#workdayTime", modal);
	initFlatpickr("#nightTime", modal);
	initFlatpickr("#holidayTime", modal);

	setTimeToFlatpickr("#workdayTime", stop?.WORKDAY_TIMEIN);
	setTimeToFlatpickr("#nightTime", stop?.NIGHT_TIMEIN);
	setTimeToFlatpickr("#holidayTime", stop?.HOLIDAY_TIMEIN);
});

$(document).on("click", ".btn-edit-line", function (e) {
	e.stopPropagation(); // กันไม่ให้ trigger click แถว
	const busId = $(this).data("id");
	const rowData = tableLine
		.rows()
		.data()
		.toArray()
		.find((r) => r.BUSID == busId);

	console.log("EDIT:", rowData);
	$("#hdLineId").val(rowData.BUSID);
	$("#txtLineName").val(rowData.BUSNAME);
	$("input[name='busType'][value='" + rowData.BUSTYPE + "']").prop(
		"checked",
		true,
	);
	$("#ddlSeat").val(rowData.BUSSEAT);
	$("input[name='isChonburi'][value='" + rowData.IS_CHONBURI + "']").prop(
		"checked",
		true,
	);
	document.getElementById("line_modal").showModal();
});

$(document).on("click", ".btn-delete-line", async function (e) {
	e.stopPropagation(); // กันไม่ให้ trigger click แถว
	const busId = $(this).data("id");
	const isConfirm = await showConfirm({
		title: "ยืนยันการลบ",
		message: "ต้องการลบสายรถนี้หรือไม่?",
		acceptText: "ยืนยัน",
		cancelText: "ยกเลิก",
	});

	if (!isConfirm) {
		console.log("user canceled delete", busId);
		return;
	}

	try {
		const delete_line = await deleteLineCascade({ BUSID: busId });
		showMessage("ลบข้อมูลเรียบร้อย", "success");
		const data_line = await getLine();
		const tale_line = await lineOptions(data_line);
		tableLine.destroy();
		tableLine = await createTable(tale_line, { id: "#line_table" });
		if (tableLine.rows().count() > 0) {
			const firstRow = tableLine.row(0);
			const firstData = firstRow.data();
			selectedBusId = firstData.BUSID;
			$(firstRow.node()).addClass("line-selected");
			const route = await getRoute({ BUSLINE: selectedBusId });
			await showRouteDetail(route);
		}
	} catch (error) {
		console.error(error);
		showMessage("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
	}
});

$(document).on("click", "#btnExportRoute", async function (e) {
	e.preventDefault();
	try {
		await activatedBtn($(this));
		const lines = await getLine();
		const routes = await getRoute();
		const stops = await getStop();
		const stopMap = {};
		stops
			.filter((s) => s.STOP_STATUS === "1")
			.forEach((s) => (stopMap[s.STOP_ID] = s));

		const routeMap = {};
		routes
			.filter((r) => r.STATENO === 1)
			.forEach((r) => {
				const stop = stopMap[r.STOPNO];
				if (stop) {
					if (!routeMap[r.BUSLINE]) {
						routeMap[r.BUSLINE] = [];
					}
					routeMap[r.BUSLINE].push({
						time: stop.WORKDAY_TIMEIN,
						name: stop.STOP_NAME,
					});
				}
			});

		// 🔥 เรียงตามเวลา
		Object.keys(routeMap).forEach((busId) => {
			routeMap[busId].sort(
				(a, b) => parseInt(a.time || 9999) - parseInt(b.time || 9999),
			);
			routeMap[busId] = routeMap[busId].map(
				(s) => `${formatTime4Digit(s.time)} ${s.name}`,
			);
		});

		const allData = lines
			.filter((l) => l.BUSSTATUS === "1")
			.sort((a, b) => a.BUSNAME.localeCompare(b.BUSNAME, "th"))
			.map((l) => ({
				line: l.BUSNAME,
				type: l.BUSTYPE,
				stops: routeMap[l.BUSID] || [],
			}));

		const busData = allData.filter((d) => d.type === "1");
		const vanData = allData.filter((d) => d.type === "2");
		const html = buildBusRouteHtml(busData, vanData);
		const path_file = "//amecnas/AMECWEB/file/development/test/OMG/";
		const file_name = "BUS.pdf";
		let pdf;
		try {
			pdf = await generatePdf({
				html: html,
				options: {
					path: path_file + file_name,
					printBackground: true,
					landscape: true,
					format: "A3",
					margin: {
						top: "15mm",
						right: "15mm",
						bottom: "15mm",
						left: "15mm",
					},
				},
			});
		} catch (error) {
			console.error("PDF GENERATION ERROR:", error);
			showMessage("เกิดข้อผิดพลาดในการสร้างรายงาน", "error");
			return;
		}
		await downloadOrOpenFile({
			baseDir: path_file,
			storedName: file_name,
			originalName: file_name,
			mode: "open",
		});
	} catch (error) {
		console.error(error);
		await showMessage("Something went wrong.");
	} finally {
		await activatedBtn($(this), false);
	}
});

function formatTime4Digit(value) {
	if (!value) return "-";
	const str = value.toString().padStart(4, "0");
	return str.slice(0, 2) + ":" + str.slice(2, 4);
}

function getTimeHHMM(selector, required = false) {
	const val = $(selector).val();
	if (!val) {
		if (required) {
			showMessage("กรุณาเลือกเวลา", "warning");
			return null;
		}
		return "";
	}

	const [h, m] = val.split(":");
	if (!h || !m) return "";
	return h.padStart(2, "0") + m.padStart(2, "0");
}

function setTimeToFlatpickr(selector, hhmm) {
	if (!hhmm) return;
	const str = hhmm.toString().padStart(4, "0");
	const time = str.slice(0, 2) + ":" + str.slice(2, 4);
	const el = document.querySelector(selector);
	if (el?._flatpickr) el._flatpickr.setDate(time, true);
}

function initFlatpickr(selector, modal) {
	const el = document.querySelector(selector);
	if (!el) return;
	if (el._flatpickr) {
		el._flatpickr.destroy();
	}
	setDatePicker({ element: selector, time: true, appendTo: modal });
}

$(document).on("click", ".btn-delete-stop", async function (e) {
	e.stopPropagation();
	const stopId = $(this).data("stop");
	const busLine = $(this).data("route");
	const isConfirm = await showConfirm({
		title: "ยืนยันการลบ",
		message: "ต้องการลบจุดรถนี้หรือไม่?",
		acceptText: "ยืนยัน",
		cancelText: "ยกเลิก",
	});

	if (!isConfirm) return;

	try {
		// ⭐ 1. ลบ route ก่อน
		await deleteRoute({
			BUSLINE: Number(busLine),
			STOPNO: Number(stopId),
		});

		// ⭐ 2. ลบ stop ฿& Passenger
		await deleteStopandPassenger({ STOP_ID: Number(stopId) });

		showMessage("ลบจุดรถเรียบร้อย", "success");

		// ⭐ reload route
		const route = await getRoute({ BUSLINE: busLine });
		await showRouteDetail(route);
	} catch (error) {
		console.error(error);
		showMessage("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
	}
});
