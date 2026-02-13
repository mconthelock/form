import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { getLine, getRoute, getStop, insertLine, updateLine, deleteLine, insertStop, 
	updateStop, deleteStop, insertRoute, updateRoute, deleteRoute, getPassenger,insertPassenger, 
	updatePassenger, deletePassenger  } from "./data.js";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";

let tableLine;
let tablePassenger;

let BUS_LINES = [];
let BUS_ROUTES = [];
let BUS_STOPS = [];
let BUS_PASSENGERS = [];

$(document).ready(async function () {
	await initApp({ submenu: ".nav-bus" });
	await showLoader({ show: true });

	try {
		const [lines, routes, stops, passengers] = await Promise.all([
			getLine(),
			getRoute(),
			getStop(),
			getPassenger()
		]);

		BUS_LINES = lines.filter(l => l.BUSSTATUS === "1");
		BUS_ROUTES = routes;
		BUS_STOPS = stops;
		BUS_PASSENGERS = passengers;

		await renderLineTable();

		if (BUS_LINES.length > 0) {
			selectedBusId = BUS_LINES[0].BUSID;
			showPassengerByLine(selectedBusId);
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
		{ data: "BUSSEAT", title: "จำนวนที่นั่ง", className: "text-center" }
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

	showPassengerByLine(selectedBusId);
});

function showPassengerByLine(busId) {
	const stopIds = BUS_ROUTES
		.filter(r => r.BUSLINE === busId)
		.map(r => r.STOPNO);

	// 2️⃣ เอาเฉพาะ stop ที่ active
	const activeStops = BUS_STOPS.filter(s => stopIds.includes(s.STOP_ID) && s.STOP_STATUS == "1");
	const activeStopIds = activeStops.map(s => s.STOP_ID);

	// 3️⃣ หา passenger ที่อยู่ stop เหล่านี้
	const passengers = BUS_PASSENGERS
		.filter(p => activeStopIds.includes(p.BUSSTOP));

	// 4️⃣ merge ชื่อ stop
	const result = passengers.map(p => {
		const stop = activeStops.find(s => s.STOP_ID === p.BUSSTOP);

		return {
			...p,
			STOP_NAME: stop?.STOP_NAME || "-"
		};
	});

	renderPassengerTable(result);
}

async function renderPassengerTable(data) {

	if (tablePassenger) {
		tablePassenger.destroy();
		$("#passenger_table").empty();
	}

	const opt = { ...tableOption };
	opt.data = data;

	opt.columns = [
		{ data: "EMPNO", title: "รหัสพนักงาน" },
		{ data: "STOP_NAME", title: "จุดจอด" },
		{ data: "UPDATE_DATE", title: "วันที่แก้ไข" }
	];

	tablePassenger = await createTable(opt, { id: "#passenger_table" });
}
