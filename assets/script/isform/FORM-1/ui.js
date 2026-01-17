import { showMessage } from "../../utils";
import { displayEmpInfo } from "@amec/webasset/indexDB";

$(document).on("change", "#requester", async function () {
	const emp = await displayEmpInfo($(this).val());
	if (!emp) {
		await showMessage("Employee not found");
		$(this).val("");
		return;
	}

	$(this).addClass("hidden");
	const empDiv = $(this).closest("fieldset").find(".requester-info");
	empDiv.removeClass("hidden");
	empDiv.find("h1").text(`${emp.SNAME} (${emp.SEMPNO})`);
	empDiv.find("p").text(`${emp.SDIV}/${emp.SDEPT}/${emp.SSEC}`);
	empDiv.find("img").attr("src", emp.image);
});

$(document).on("click", "#remove-requester", function () {
	const empDiv = $(this).closest("fieldset").find(".requester-info");
	empDiv.addClass("hidden");
	empDiv.find("h1").text(``);
	empDiv.find("p").text(``);
	empDiv.find("img").attr("src", "");
	$("#requester").val("").removeClass("hidden").focus();
});

$(document).on("click", "#add-file", function () {
	const fieldset = $(this).closest("fieldset");
	const newFileInput = $(this)
		.closest("div")
		.find(".file-input")
		.first()
		.clone()
		.val("");
	fieldset.append(newFileInput);
});

$(document).on("keyup", ".input-number", function (e) {
	let value = $(this).val();
	value = value.replace(/[^\d.-]/g, "");
	value = value.replace(/(?!^)-/g, "");
	const parts = value.split(".");
	if (parts.length > 2) {
		value = parts[0] + "." + parts.slice(1).join("");
	}
	$(this).val(`${value}`);
});

$(document).on("change", ".input-benefit", function (e) {
	const colIndex = $(this).closest("td").index();
	//sum value in the row
	let rowSum = 0;
	const row = $(this).closest("tr");
	const step1 = row.find("td:eq(0)").find("input").val() || 0;
	const step2 = row.find("td:eq(1)").find("input").val() || 0;
	rowSum = parseFloat(step1) - parseFloat(step2);
	row.find("td:eq(2)").find("input").val(rowSum);

	//Sum value in the same column
	let sum = 0;
	$(this)
		.closest("table")
		.find("tbody tr")
		.each(function () {
			const cellValue = $(this)
				.find("td")
				.eq(colIndex - 1)
				.find("input")
				.val();
			sum += parseFloat(cellValue) || 0;
		});

	//Set sum to footer
	$(this)
		.closest("table")
		.find("tfoot tr td")
		.eq(colIndex - 1)
		.find("input")
		.val(
			sum.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		);

	//Grand total
	const totalCols1 =
		$(this).closest("table").find("tfoot tr td:eq(0) input").val() || 0;
	const totalCols2 =
		$(this).closest("table").find("tfoot tr td:eq(1) input").val() || 0;
	const grandTotal = parseFloat(totalCols1) - parseFloat(totalCols2) || 0;
	$(this)
		.closest("table")
		.find("tfoot tr td:eq(2) input")
		.val(
			grandTotal.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		);
});

$(document).on("change", ".input-labor", function (e) {
	const colIndex = $(this).closest("td").index();
	//sum value in the row
	let rowSum = 0;
	const row = $(this).closest("tr");
	const step1 = row.find("td:eq(0)").find("input").val() || 0;
	const step2 = row.find("td:eq(1)").find("input").val() || 0;
	rowSum = parseFloat(step1) - parseFloat(step2);
	row.find("td:eq(2)").find("input").val(rowSum);

	//Sum value in the same column
	let sum = 0;
	$(this)
		.closest("table")
		.find("tbody tr")
		.each(function () {
			const cellValue = $(this)
				.find("td")
				.eq(colIndex - 1)
				.find("input")
				.val();
			sum += parseFloat(cellValue) || 0;
		});

	//Set sum to footer
	$(this)
		.closest("table")
		.find("tfoot tr td")
		.eq(colIndex - 1)
		.find("input")
		.val(
			sum.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		);

	//Grand total
	const totalCols1 =
		$(this).closest("table").find("tfoot tr td:eq(0) input").val() || 0;
	const totalCols2 =
		$(this).closest("table").find("tfoot tr td:eq(1) input").val() || 0;
	const grandTotal = parseFloat(totalCols1) - parseFloat(totalCols2) || 0;
	$(this)
		.closest("table")
		.find("tfoot tr td:eq(2) input")
		.val(
			grandTotal.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		);
});

$(document).on("click", "#add-row-benefit", function () {
	const tableBody = $(this).closest("fieldset").find("table tbody");
	const newRow = $(this)
		.closest("fieldset")
		.find("table tbody tr")
		.first()
		.clone();
	newRow.find("input").val("");
	tableBody.append(newRow);
});

$(document).on("click", "#add-row-investment", function () {
	const tableBody = $(this).closest("fieldset").find("table tbody");
	const newRow = $(this)
		.closest("fieldset")
		.find("table tbody tr")
		.first()
		.clone();
	newRow.find("input").val("");
	tableBody.append(newRow);
});

$(document).on("click", ".remove-row", function () {
	const tableBody = $(this).closest("tbody");
	if (tableBody.find("tr").length > 1) {
		$(this).closest("tr").remove();
	} else {
		showMessage("You must have at least one row.");
	}
});

$(document).on("change", "#select-position", function () {
	const wage = $(this).find("option:selected").data("wage");
	$("#input-wage").val(
		parseFloat(wage).toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	);
});

$(document).on("change", "#select-device", function () {
	const device = $(this).find("option:selected").data("device");
	$("#input-device").val(device);
});

$(document).on("click", ".msg-close", function (e) {
	$(".alert-message").removeClass("opacity-100");
	$(".alert-message").addClass("opacity-0");
	setTimeout(() => {
		$(".alert-message").remove();
	}, 700);
});
