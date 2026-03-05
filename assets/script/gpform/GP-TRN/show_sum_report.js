console.log("✅ show_sum_report.js loaded (OMG FIXED v100%)");
import { createTable } from "@amec/webasset/dataTable";

// 1. inject css
(function injectRowStyles() {
	const style = document.createElement("style");
	style.innerHTML = `
        .row-approved td { background-color: #e6ffe6 !important; }
        .row-running  td { background-color: #e6f2ff !important; }
        .row-reject   td { background-color: #ffe6e6 !important; }
    `;
	document.head.appendChild(style);
})();

window.table = null;
window.initFormReport = async function () {
	console.log("📊 initFormReport() started x1");
	const columns = [
		{
			title: "Formno",
			data: "FORMNO_DISPLAY",
			className: "dt-nowrap text-center",
		},
		{ title: "Category1", data: "CATEGORY", className: "dt-nowrap" },
		{ title: "Category2", data: "FORM_NAME_EN", className: "dt-nowrap" },
		{ title: "Code", data: "SEMPNO", className: "dt-nowrap text-center" },
		{ title: "Name", data: "STNAME", className: "dt-nowrap" },
		{
			title: "Position",
			data: "SPOSITION",
			className: "dt-nowrap text-center",
		},
		{ title: "Sect.", data: "SSEC", className: "dt-nowrap text-center" },
		{ title: "Dept.", data: "SDEPT", className: "dt-nowrap text-center" },
		{ title: "Div.", data: "SDIV", className: "dt-nowrap text-center" },
		{ title: "Subject", data: "SUBJECT", className: "dt-nowrap" },
		{
			title: "From",
			data: "DATE_FROM_DISPLAY",
			className: "dt-nowrap text-center",
		},
		{
			title: "To",
			data: "DATE_TO_DISPLAY",
			className: "dt-nowrap text-center",
		},
		{
			title: "Status",
			data: "STATUS_TEXT",
			className: "dt-nowrap text-center",
			render: function (data) {
				if (data === "Approved")
					return `<span style="color:green;font-weight:bold">${data}</span>`;
				if (data === "Running")
					return `<span style="color:blue;font-weight:bold">${data}</span>`;
				if (data === "Reject")
					return `<span style="color:red;font-weight:bold">${data}</span>`;
				return data;
			},
		},
		{
			title: "Amount",
			data: "COST",
			className: "dt-nowrap text-end",
			render: $.fn.dataTable.render.number(",", ".", 0),
		},
		{
			title: "Vat7%",
			data: "VAT",
			className: "dt-nowrap text-end",
			render: $.fn.dataTable.render.number(",", ".", 0),
		},
		{
			title: "Total Amount",
			data: "TOTAL",
			className: "dt-nowrap text-end",
			render: $.fn.dataTable.render.number(",", ".", 0),
		},
		{
			title: "Form Cash Adv",
			data: "CASH_FORMNO",
			className: "dt-nowrap text-center",
		},
		{
			title: "Form Clear Adv",
			data: "CLR_FORMNO",
			className: "dt-nowrap text-center",
		},
	];

	//const options = { data: [],  columns: columns,};
	const options = {
		data: [],
		columns: columns,
		pageLength: 30,
		lengthChange: false,
		order: [],
	};

	// ⭐ สร้าง table ก่อน
	window.table = await createTable(
		{
			data: [],
			columns: columns,
			scrollX: true,
			scrollCollapse: true,
			autoWidth: false,
			searching: false,
			responsive: false,
			dom: "rtip",
			createdRow: function (row, data) {
				if (data.STATUS_TEXT === "Approved") {
					row.classList.add("row-approved");
				} else if (data.STATUS_TEXT === "Running") {
					row.classList.add("row-running");
				} else if (data.STATUS_TEXT === "Reject") {
					row.classList.add("row-reject");
				}
			},
			buttons: [
				{
					extend: "excelHtml5",
					title: "Training_Summary",
				},
			],
		},
		{ id: "report_table" }
	);

	// ⭐ โหลดข้อมูลครั้งแรก
	window.loadReportData();

	$("#btnSearchSubmit")
		.off("click")
		.on("click", function () {
			filterModal.close();
			loadReportData();
		});

	$("#btnCloseModal").on("click", function () {
		filterModal.close();
	});

	$("#report_excel").on("click", function () {
		window.table.button(".buttons-excel").trigger();
	});
};

// 🔧 Utilities
function formatDate(v) {
	if (!v || v.length !== 8) return v;
	return `${v.substring(6, 8)}/${v.substring(4, 6)}/${v.substring(0, 4)}`;
}

function getStatusText(v) {
	if (v == 2) return "Approved";
	if (v == 1) return "Running";
	if (v == 3) return "Reject";
	return "-";
}

window.loadReportData = function () {
	if (!window.table) return;
	$.get(
		window.baseUrl + "gpform/GP-TRN/training/load_data",
		{
			from: $("#filter_from").val(),
			to: $("#filter_to").val(),
			type: $("#filter_type").val(),
			empno: $("#filter_empno").val(),
			sec: $("#filter_sec").val(),
			dept: $("#filter_dept").val(),
			div: $("#filter_div").val(),
		},
		function (res) {
			let data = JSON.parse(res).map((row, i) => {
				let cy2 = row.CYEAR2 ? row.CYEAR2.toString().slice(-2) : "";
				let run = row.NRUNNO
					? row.NRUNNO.toString().padStart(6, "0")
					: "";
				row.FORMNO_DISPLAY = `GP-TRN${cy2}-${run}`;
				row.DATE_FROM_DISPLAY = formatDate(row.DATE_FROM);
				row.DATE_TO_DISPLAY = formatDate(row.DATE_TO);
				row.STATUS_TEXT = getStatusText(row.CST);
				return row;
			});

			window.table.clear().rows.add(data).draw();
		}
	);
};
