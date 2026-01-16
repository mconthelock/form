import { showLoader } from "@public/preloader";
import { requiredForm, ajaxOptions, getData } from "@public/jFuntion";
import { host } from "../../utils";
import Swal from "sweetalert2";
import { setDatePicker, setDatefpk } from "@amec/webasset/flatpickr";
import { createTable } from "@public/_dataTable";
import { exportExcel, defaultExcel } from "@public/_excel";
setDatePicker({ element: ".datesel", dateFormat: "Y-m-d" });
setDatePicker({
	element: ".monthsel",
	plugins: [
		new monthSelectPlugin({
			shorthand: true, //defaults to false
			dateFormat: "Y-m",
		}),
	],
});
setDatefpk({
	name: ".yearsel", // name ของ input
	date: "2025", // ถ้าต้องการ set default
	onReady: function (selectedDates, dateStr, instance) {
		// ซ่อนเดือน
		instance.currentYearElement.focus();
		instance.monthElements.forEach((m) => (m.style.display = "none"));
	},
	dateFormat: "Y", // output เป็นปี
	altFormat: "Y", // แสดงใน input
});
$("#dateMode").on("change", function () {
	$("#dateRange, #monthRange, #yearRange").addClass("hidden");

	if (this.value === "date") {
		$("#dateRange").removeClass("hidden");
	} else if (this.value === "month") {
		$("#monthRange").removeClass("hidden");
	} else if (this.value === "year") {
		$("#yearRange").removeClass("hidden");
	}
});
$("#searchBtn").on("click", async function () {
	console.log(process.env.APP_API);
	if (!(await requiredForm("#form-report"))) return;
	const datemode = $("#dateMode").val();
	let startdate = "";
	let enddate = "";
	let datareport = {};
	let columns = [];
	let extraOpt = {};
	const reporttype = $("#report_type").val();
	let url = "";
	if (datemode == "date") {
		startdate = $("#start_date").val();
		enddate = $("#end_date").val();
	} else if (datemode == "month") {
		startdate = $("#start_month").val();
		enddate = $("#end_month").val();
	} else if (datemode == "year") {
		startdate = $("#start_year").val();
		enddate = $("#end_year").val();
	}
	if (!isValidRange(startdate, enddate, datemode)) {
		Swal.fire({
			icon: "warning",
			title: "Start Date or End Date incorrect",
			toast: true,
			position: "top-end",
			timer: 3000,
			showConfirmButton: false,
			background: "#FBF6D9",
		});
		return false; // หยุด submit / หยุด process
	}
	if (reporttype == "VR") {
		columns = [
			{
				data: "VISITDATE",
				title: "Visit Date",
				width: "10%",
			},
			{
				data: "COUNTRY",
				title: "Country",
				width: "10%",
			},
			{
				data: "COMPANY",
				title: "Company",
				width: "20%",
			},
			{
				data: "NAME",
				title: "Visitor Name",
				width: "30%",
			},
			{
				data: "POSITION",
				title: "Position",
				width: "20%",
			},
			{
				data: "VISITEXP",
				title: "Previous Visit Experience",
				width: "5%",
			},
			{
				data: "VISIT_NO",
				title: "No. of Visitors",
				width: "5%",
			},
		];
	} else if (reporttype == "VO") {
		columns = [
			{
				data: "TOTAL_VISITS",
				title: "Total Visits",
				width: "10%",
			},
			{
				data: "TOTAL_VISITORS",
				title: "Total Visitors",
				width: "10%",
			},
			{
				data: "UNIQUE_COMPANIES",
				title: "Unique Companies",
				width: "10%",
			},
			{
				data: "UNIQUE_COUNTRIES",
				title: "Countries Represented",
				width: "10%",
			},
		];
		extraOpt = {
			columnDefs: [{ targets: "_all", className: "dt-center" }],
		};
	} else if (reporttype == "VF") {
		columns = [
			{
				data: "COUNTRY",
				title: "Country",
				width: "10%",
			},
			{
				data: "COMPANY",
				title: "Company Name",
				width: "10%",
			},
			{
				data: "TOTAL_VISITS",
				title: "No. of Visits",
				width: "10%",
			},
			{
				data: "TOTAL_VISITORS",
				title: "No. of Visitors",
				width: "10%",
			},
		];
		extraOpt = {
			columnDefs: [{ targets: [2, 3], className: "dt-center" }],
		};
	} else if (reporttype == "WE") {
		columns = [
			{
				data: "ACTIVITY",
				title: "Activity",
				width: "30%",
			},
			{
				data: "TIMESPENT",
				title: "Time Spent per Visit (Hrs.)",
				width: "10%",
			},
			{
				data: "TOTAL_COUNT",
				title: "Frequency",
				width: "10%",
			},
			{
				data: "TOTAL_HOURS",
				title: "Total Hours (Hrs.)",
				width: "10%",
			},
		];
		extraOpt = {
			rowCallback: function (row, data, index) {
				const table = this.api();
				if (index === table.rows().count() - 1) {
					$(row).attr(
						"style",
						"background-color: #FED7AA  !important; font-weight: bold; color :#374151"
					);
				}
			},
		};
	} else if (reporttype == "CE") {
		columns = [
			{
				data: "ITEM",
				title: "Item",
				width: "20%",
			},
			{
				data: "DETAILS",
				title: "Detail",
				width: "20%",
			},
			{
				data: "UNIT_COST",
				title: "Unit Cost (THB)",
				render: $.fn.dataTable.render.number(",", ".", 2, ""),
				width: "15%",
			},
			{
				data: "QTY",
				title: "Quantity",
				width: "15%",
			},
			{
				data: "TOTAL_COST",
				title: "Total Cost (THB)",
				render: $.fn.dataTable.render.number(",", ".", 2, ""),
				width: "15%",
			},
			{
				data: "ACTUAL_COST",
				title: "Actual Cost (THB)",
				render: $.fn.dataTable.render.number(",", ".", 2, ""),
				width: "15%",
			},
		];
		extraOpt = {
			rowCallback: function (row, data) {
				if (data.ITEM?.startsWith("Total")) {
					$(row).attr(
						"style",
						"background-color: #FED7AA !important; font-weight: bold; color :#374151"
					);
				}
			},
		};
	}

	showLoader({ show: true });
	try {
		datareport = await getData({
			...ajaxOptions,
			url: host + "marform/MAR-VMS/report/get_report_vms",
			data: {
				datemode: datemode,
				reporttype: reporttype,
				startdate: startdate,
				enddate: enddate,
			},
		});
		await createTableResult(datareport, columns, "reportTable", extraOpt);
	} catch (err) {
		Swal.fire({
			icon: "error",
			title: "Report.",
			text: err.responseText || "Failed to search report.",
		});
	} finally {
		showLoader({ show: false });
	}
});

/**
 * Create export excel
 */
$("#exportBtn").on("click", async function () {
	if (!(await requiredForm("#form-report"))) return;
	const datemode = $("#dateMode").val();
	let startdate = "";
	let enddate = "";
	let datareport = {};
	let columnrpt = [];
	const reporttype = $("#report_type").val();
	if (reporttype == "VR") {
		columnrpt = [
			{ header: "Visit Date", key: "VISITDATE" },
			{ header: "Country", key: "COUNTRY" },
			{ header: "Company", key: "COMPANY" },
			{ header: "Visitor Name", key: "NAME" },
			{ header: "Position", key: "POSITION" },
			{ header: "Previous Visit Experience", key: "VISITEXP" },
			{ header: "No. of Visitors", key: "VISIT_NO" },
		];
	} else if (reporttype == "VO") {
		columnrpt = [
			{ header: "Total Visits", key: "TOTAL_VISITS" },
			{ header: "Total Visitors", key: "TOTAL_VISITORS" },
			{ header: "Unique Companies", key: "UNIQUE_COMPANIES" },
			{ header: "Countries Represented", key: "UNIQUE_COUNTRIES" },
		];
	} else if (reporttype == "VF") {
		columnrpt = [
			{ header: "Country", key: "COUNTRY" },
			{ header: "Company Name", key: "COMPANY" },
			{ header: "No. of Visits", key: "TOTAL_VISITS" },
			{ header: "No. of Visitors", key: "TOTAL_VISITORS" },
		];
	} else if (reporttype == "WE") {
		columnrpt = [
			{ header: "Activity", key: "ACTIVITY" },
			{ header: "Time Spent per Visit (Hrs.)", key: "TIMESPENT" },
			{ header: "Frequency", key: "TOTAL_COUNT" },
			{ header: "Total Hours (Hrs.)", key: "TOTAL_HOURS" },
		];
	} else if (reporttype == "CE") {
		columnrpt = [
			{ header: "Item", key: "ITEM" },
			{ header: "Detail", key: "DETAILS" },
			{ header: "Unit Cost (THB)", key: "UNIT_COST" },
			{ header: "Quantity", key: "QTY" },
			{ header: "Total Cost (THB)", key: "TOTAL_COST" },
			{ header: "Actual Cost (THB)", key: "ACTUAL_COST" },
		];
	}

	let url = "";
	if (datemode == "date") {
		startdate = $("#start_date").val();
		enddate = $("#end_date").val();
	} else if (datemode == "month") {
		startdate = $("#start_month").val();
		enddate = $("#end_month").val();
	} else if (datemode == "year") {
		startdate = $("#start_year").val();
		enddate = $("#end_year").val();
	}
	if (!isValidRange(startdate, enddate, datemode)) {
		Swal.fire({
			icon: "warning",
			title: "Start Date or End Date incorrect",
			toast: true,
			position: "top-end",
			timer: 3000,
			showConfirmButton: false,
			background: "#FBF6D9",
		});
		return false; // หยุด submit / หยุด process
	}
	showLoader({ show: true });
	try {
		datareport = await getData({
			...ajaxOptions,
			url: host + "marform/MAR-VMS/report/get_report_vms",
			data: {
				datemode: datemode,
				reporttype: reporttype,
				startdate: startdate,
				enddate: enddate,
			},
		});

		var now = new Date();
		var timestamp =
			("0" + now.getDate()).slice(-2) +
			("0" + (now.getMonth() + 1)).slice(-2) +
			now.getFullYear() +
			("0" + now.getHours()).slice(-2) +
			("0" + now.getMinutes()).slice(-2) +
			("0" + now.getSeconds()).slice(-2);
		var reportname = $("#report_type option:selected").text();
		var fileName = `${reportname}_${timestamp}`;
		const opt = {
			data: datareport,
			column: columnrpt,
			sheetName: `${reportname}`,
			font: { bold: true, size: 12 }, // ตัวหนา + ขนาด 12
			alignment: { vertical: "middle", horizontal: "center" },
			extraWidth: 5,
			manual: true,
			manualActions: (sheet) => {
				// ทำอะไรเพิ่มเติม เช่น แทรก row, สีพื้น, border
				sheet.getRow(1).fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFFFC000" }, // สีส้มพื้น header
				};
			},
		};
		const workbook = await defaultExcel(opt);
		exportExcel(workbook, fileName);
	} catch (err) {
		Swal.fire({
			icon: "error",
			title: "Report.",
			text: err.responseText || "Failed to export.",
		});
	} finally {
		showLoader({ show: false });
	}
});

/**
 * Create table
 * @param {array} data
 * @returns
 */
async function createTableResult(data, columns, tableid, extraOpt = {}) {
	if ($.fn.DataTable.isDataTable("#" + tableid)) {
		$("#" + tableid)
			.DataTable()
			.clear()
			.destroy();
		$("#" + tableid).empty(); // เคลียร์ thead/tbody เดิม
	}

	if (columns.length >= 6) {
		$("#result")
			.removeClass("w-3/4 max-w-5xl mx-auto") // ลบ class เก่า
			.addClass("w-full max-w-full"); // เพิ่ม class ใหม่
	} else {
		$("#result")
			.removeClass("w-full max-w-full") // ลบ class เก่า
			.addClass("w-3/4 max-w-5xl mx-auto");
	}
	createTable(
		{
			data: data,
			columns: columns,
			ordering: false,
			headerCallback: function (thead, data, start, end, display) {
				$(thead).find("th").css({
					"background-color": "#fb923c", // ส้ม
					color: "#ffffff", // ดำ
					"font-weight": "bold", // ตัวหนา
					"text-align": "center", // จัดกลาง
				});
			},
			paging: false,
			searching: false,
			info: false,
			...extraOpt,
		},
		{
			id: "#" + tableid,
			join: true,
		}
	);
}

function isValidRange(start, end, mode) {
	if (!start || !end) return true; // ถ้าไม่กรอกเต็ม ไม่เช็ค
	let s, e;

	if (mode === "date") {
		s = new Date(start);
		e = new Date(end);
	} else if (mode === "month") {
		// แปลง 'YYYY-MM' เป็น Date object (วันแรกของเดือน)
		s = new Date(start + "-01");
		e = new Date(end + "-01");
	} else if (mode === "year") {
		s = new Date(start + "-01-01");
		e = new Date(end + "-01-01");
	}

	return e >= s;
}
