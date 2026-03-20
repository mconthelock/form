import select2 from "select2";
import "select2/dist/css/select2.min.css";
import { host } from "../../utils.js";
import { redirectWebflow } from "@amec/webasset/form";
import { createForm } from "@amec/webasset/api/webform"
import Swal from "sweetalert2";

// Ensure jQuery plugin is loaded
// require("select2");

select2();

$(document).ready(function () {
	$("#entertain-form-no").select2();
	const formData = $(".form-data").data();
	let nfrmno, vorgno, cyear;
	if (formData) {
		({ nfrmno, vorgno, cyear } = formData);
	}
	$("#no-entertain").change(function () {
		if ($(this).is(":checked")) {
			$("#form-entertain").hide();
			$("#entertain-form-no").val("").trigger("change");
		} else {
			$("#form-entertain").show();
			$("#entertain-form-no").val("").trigger("change");
		}
	});

	let searchTimeout;
	$("#input-empcode").on("input", function () {
		const empcode = $(this).val().trim();

		// Clear previous timeout
		clearTimeout(searchTimeout);

		// If empty, clear the dropdown
		if (empcode === "") {
			$("#entertain-form-no").empty();
			$("#entertain-form-no").append(
				$("<option>").val("").text("กรุณาใส่รหัสพนักงาน")
			);
			return;
		}

		// Set timeout to avoid too many requests
		searchTimeout = setTimeout(function () {
			$.ajax({
				type: "POST",
				url: host + "gpform/GP-CLER/main/getformEmp",
				data: {
					empno: empcode,
					orgNo: vorgno,
					y: cyear,
				},
				dataType: "json",
				beforeSend: function () {
					$("#entertain-form-no").empty();
					$("#entertain-form-no").append(
						$("<option>").val("").text("กำลังโหลด...")
					);
				},
				success: function (response) {
					$("#entertain-form-no").empty();
					if (response.length > 0) {
						$("#entertain-form-no").append(
							$("<option>")
								.val("")
								.text("เลือก Entertainment Form No.")
						);
						response.forEach((item) => {
							console.log(item);
							$("#entertain-form-no").append(
								$("<option>")
									.val(item.CYEAR2 + "/" + item.NRUNNO)
									.text(item.form_number)
							);
						});
					} else {
						$("#entertain-form-no").append(
							$("<option>")
								.val("")
								.text("ไม่พบข้อมูล Entertainment Form")
						);
					}
				},
				error: function () {
					$("#entertain-form-no").empty();
					$("#entertain-form-no").append(
						$("<option>")
							.val("")
							.text("เกิดข้อผิดพลาดในการโหลดข้อมูล")
					);
				},
			});
		}, 500); // Wait 500ms after user stops typing
	});

	$("#file_group").on("change", function () {
		const fileList = $(this)[0].files;
		const $list = $("#file-list");
		$list.empty();
		if (fileList.length === 0) {
			$list.append("<li>ไม่พบไฟล์ที่เลือก</li>");
		} else {
			Array.from(fileList).forEach((file) => {
				$list.append(`<li>- ${file.name}</li>`);
			});
		}
	});

	$("#btn-submit").on("click", async function (e) {
		e.preventDefault();

		// Get values
		const p_join = $("input[name='president_join']:checked").val();
		const actual_cost = $("#actual-cost").val().trim();
		const remain = $("#remain").val().trim();
		const remark = $("#remark").length ? $("#remark").val().trim() : "";
		const formnumber = $("#formnumber").val();
		// const fileInput = $("#receipt")[0];
		// const file = fileInput.files[0];

		const ent = $(".form-ent").data();
		const ent_nfrmno = ent.nfrmno;
		const ent_vorgno = ent.vorgno;
		const ent_cyear = ent.cyear;
		const ent_cyear2 = ent.cyear2;
		const ent_nrunno = ent.nrunno;

		// Validate all required fields in tables
		let hasEmptyField = false;
		let emptyFieldName = "";

		// ตรวจสอบตารางปกติ
		if ($("#expense-table").length > 0) {
			$("#expense-table tbody tr").each(function (index) {
				const row = index + 1;
				const receiptNo = $(this)
					.find("input[name='receipt_no[]']")
					.val()
					?.trim();
				const cost = $(this).find("input[name='cost[]']").val()?.trim();
				const dateIssue = $(this)
					.find("input[name='date_issue[]']")
					.val()
					?.trim();
				const receiptFile = $(this).find(
					"input[name='receipt_file[]']"
				)[0];

				if (!receiptNo) {
					hasEmptyField = true;
					emptyFieldName = `Receipt No. (แถวที่ ${row})`;
					$(this)
						.find("input[name='receipt_no[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (!cost) {
					hasEmptyField = true;
					emptyFieldName = `Cost (แถวที่ ${row})`;
					$(this)
						.find("input[name='cost[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (!dateIssue) {
					hasEmptyField = true;
					emptyFieldName = `Date issue receipt (แถวที่ ${row})`;
					$(this)
						.find("input[name='date_issue[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (!receiptFile || receiptFile.files.length === 0) {
					hasEmptyField = true;
					emptyFieldName = `Attach Receipt (แถวที่ ${row})`;
					$(this)
						.find("input[name='receipt_file[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
			});
		}

		// ตรวจสอบตารางแยก (ตามประเภท)
		if ($(".expense-table-split").length > 0 && !hasEmptyField) {
			$(".expense-table-split").each(function () {
				if (hasEmptyField) return false;
				const $table = $(this);
				const type = $table.data("type");
				const label = $table.data("label") || `Type ${type}`;

				$table.find("tbody tr").each(function (index) {
					const row = index + 1;
					const receiptNo = $(this)
						.find(`input[name='receipt_no_${type}[]']`)
						.val()
						?.trim();
					const cost = $(this)
						.find(`input[name='cost_${type}[]']`)
						.val()
						?.trim();
					const dateIssue = $(this)
						.find(`input[name='date_issue_${type}[]']`)
						.val()
						?.trim();
					const receiptFile = $(this).find(
						`input[name='receipt_file_${type}[]']`
					)[0];

					if (!receiptNo) {
						hasEmptyField = true;
						emptyFieldName = `${label} - Receipt No. (แถวที่ ${row})`;
						$(this)
							.find(`input[name='receipt_no_${type}[]']`)
							.addClass("input-error")
							.focus();
						return false;
					}
					if (!cost) {
						hasEmptyField = true;
						emptyFieldName = `${label} - Cost (แถวที่ ${row})`;
						$(this)
							.find(`input[name='cost_${type}[]']`)
							.addClass("input-error")
							.focus();
						return false;
					}
					if (!dateIssue) {
						hasEmptyField = true;
						emptyFieldName = `${label} - Date issue receipt (แถวที่ ${row})`;
						$(this)
							.find(`input[name='date_issue_${type}[]']`)
							.addClass("input-error")
							.focus();
						return false;
					}
					if (!receiptFile || receiptFile.files.length === 0) {
						hasEmptyField = true;
						emptyFieldName = `${label} - Attach Receipt (แถวที่ ${row})`;
						$(this)
							.find(`input[name='receipt_file_${type}[]']`)
							.addClass("input-error")
							.focus();
						return false;
					}
				});
			});
		}

		if (hasEmptyField) {
			Swal.fire({
				icon: "warning",
				title: `กรุณากรอก ${emptyFieldName}`,
				toast: true,
				position: "top-end",
				timer: 3000,
				showConfirmButton: false,
				background: "#FBF6D9",
			});
			return;
		}

		// Validate president_join
		if (!p_join) {
			Swal.fire({
				icon: "warning",
				title: "กรุณาเลือก President Join",
				toast: true,
				position: "top-end",
				timer: 3000,
				showConfirmButton: false,
				background: "#FBF6D9",
			});
			return;
		}

		// Validate actual_cost (required & number & >= 0)
		if (!actual_cost || isNaN(actual_cost) || parseFloat(actual_cost) < 0) {
			Swal.fire({
				icon: "warning",
				title: "กรุณาระบุ Actual Cost",
				toast: true,
				position: "top-end",
				timer: 3000,
				showConfirmButton: false,
				background: "#FBF6D9",
			});
			$("#actual-cost").focus();
			return;
		}

		// Validate file
		// if (!file) {
		//   Swal.fire({
		//     icon: "warning",
		//     title: "กรุณาแนบไฟล์ใบเสร็จรับเงิน",
		//     toast: true,
		//     position: "top-end",
		//     timer: 3000,
		//     showConfirmButton: false,
		//     background: "#FBF6D9",
		//   });
		//   $("#receipt").addClass("input-error").focus();
		//   return;
		// }

		// Validate memo files for split expense (if visible)
		if ($(".expense-table-split").length > 0) {
			let memoMissing = false;
			$(".memo-section:visible").each(function () {
				const type = $(this).data("type");
				const label = $(
					`.expense-table-split[data-type='${type}']`
				).data("label") || `Type ${type}`;
				const memoFile = $("input[name='memo_" + type + "']")[0];
				if (!memoFile || memoFile.files.length === 0) {
					memoMissing = true;
					Swal.fire({
						icon: "warning",
						title: `กรุณาแนบ Memo สำหรับ ${label} เนื่องจากค่าใช้จ่ายเกินงบประมาณ`,
						toast: true,
						position: "top-end",
						timer: 3000,
						showConfirmButton: false,
						background: "#FBF6D9",
					});
					$("input[name='memo_" + type + "']")
						.addClass("input-error")
						.focus();
					return false;
				}
			});
			if (memoMissing) return;
		}

		// If file-group-section is visible, require at least one file in #file_group
		if (parseFloat(remain) < 0) {
			const fileGroupInput = $("#file_group")[0];
			if (!fileGroupInput || fileGroupInput.files.length === 0) {
				Swal.fire({
					icon: "warning",
					title: "กรุณาแนบไฟล์ใน Attach File อย่างน้อย 1 ไฟล์",
					toast: true,
					position: "top-end",
					timer: 3000,
					showConfirmButton: false,
					background: "#FBF6D9",
				});
				$("#file_group").addClass("input-error").focus();
				return;
			}
		}

		// ถ้า remain < 0 ต้องมี remark
		// if (parseFloat(remain) < 0 && remark === "") {
		// 	Swal.fire({
		// 		icon: "warning",
		// 		title: "กรุณาระบุเหตุผลใน Remark กรณีค่าใช้จ่ายจริงเกินประมาณการ",
		// 		toast: true,
		// 		position: "top-end",
		// 		timer: 3000,
		// 		showConfirmButton: false,
		// 		background: "#FBF6D9",
		// 	});
		// 	$("#remark").focus();
		// 	return;
		// }

		// Prepare FormData for file upload
		let formData = new FormData();
		formData.append("p_join", p_join);
		formData.append("actual_cost", actual_cost);
		formData.append("remain", parseFloat(remain));
		formData.append("remark", remark);
		// formData.append("receipt", file);
		// แนบไฟล์กลุ่ม
		const fileGroupInput = $("#file_group")[0];
		if (fileGroupInput && fileGroupInput.files.length > 0) {
			Array.from(fileGroupInput.files).forEach((f, idx) => {
				formData.append(`file_group[]`, f);
			});
		}
		formData.append("nfrmno", nfrmno);
		formData.append("vorgno", vorgno);
		formData.append("cyear", cyear);
		// formData.append("empcode", $("#empcode").val());
		formData.append("inputer", $("#inputer").val());
		formData.append("requester", $("#requester").val());
		formData.append("formnumber", formnumber);
		formData.append("ent_nfrmno", ent_nfrmno);
		formData.append("ent_vorgno", ent_vorgno);
		formData.append("ent_cyear", ent_cyear);
		formData.append("ent_cyear2", ent_cyear2);
		formData.append("ent_nrunno", ent_nrunno);
		// const form = await createForm(
		// 	nfrmno,
		// 	vorgno,
		// 	cyear,
		// 	$("#requester").val(),
		// 	$("#inputer").val(),
		// 	"",
		// 	1
		// );
		const form = await createForm({
			NFRMNO: nfrmno,
			VORGNO: vorgno,
			CYEAR: cyear,
			REQBY: $("#requester").val(),
			INPUTBY: $("#inputer").val(),
		});
		const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;
		formData.append("nrunno", NRUNNO);
		formData.append("cyear2", CYEAR2);

		// รวบรวมข้อมูล expense
		const expense = [];
		const expenseSplit = {
			types: {},
		};

		// ตรวจสอบว่าเป็นตารางปกติหรือตารางแยก
		if ($("#expense-table").length > 0) {
			// กรณีตารางปกติ
			let rowIndex = 0;
			$("#expense-table tbody tr").each(function () {
				const receipt_no = $(this)
					.find("input[name='receipt_no[]']")
					.val()
					.trim();
				const cost =
					parseFloat(
						$(this).find("input[name='cost[]']").val().trim()
					) || 0;
				const date_issue = $(this)
					.find("input[name='date_issue[]']")
					.val()
					.trim();
				const receiptFile = $(this).find(
					"input[name='receipt_file[]']"
				)[0];

				if (receipt_no !== "" || cost > 0) {
					expense.push({
						receipt_no,
						cost,
						date_issue,
					});

					// แนบไฟล์ receipt ถ้ามี
					if (receiptFile && receiptFile.files.length > 0) {
						formData.append(
							`receipt_file_${rowIndex}`,
							receiptFile.files[0]
						);
					}
				}
				rowIndex++;
			});
			formData.append("expense", JSON.stringify(expense));
		} else {
			// กรณีตารางแยก (ตามประเภท)
			$(".expense-table-split").each(function () {
				const type = Number($(this).data("type"));
				const rows = [];
				let rowIndex = 0;

				$(this).find("tbody tr").each(function () {
					const receipt_no = $(this)
						.find(`input[name='receipt_no_${type}[]']`)
						.val()
						.trim();
					const cost =
						parseFloat(
							$(this)
								.find(`input[name='cost_${type}[]']`)
								.val()
								.trim()
						) || 0;
					const date_issue = $(this)
						.find(`input[name='date_issue_${type}[]']`)
						.val()
						.trim();
					const receiptFile = $(this).find(
						`input[name='receipt_file_${type}[]']`
					)[0];

					if (receipt_no !== "" || cost > 0) {
						rows.push({
							receipt_no,
							cost,
							date_issue,
							type,
						});

						// แนบไฟล์ receipt ถ้ามี
						if (receiptFile && receiptFile.files.length > 0) {
							formData.append(
								`receipt_file_type_${type}_${rowIndex}`,
								receiptFile.files[0]
							);
						}
					}
					rowIndex++;
				});

				expenseSplit.types[type] = rows;
			});

			formData.append("expenseSplit", JSON.stringify(expenseSplit));

			// แนบไฟล์ memo สำหรับแต่ละ type
			$(".memo-section").each(function () {
				const type = $(this).data("type");
				const memoFile = $("input[name='memo_" + type + "']")[0];
				if (memoFile && memoFile.files.length > 0) {
					formData.append(`memo_${type}`, memoFile.files[0]);
				}
			});
		}

		// Send AJAX request

		$.ajax({
			type: "POST",
			url: host + "gpform/GP-CLER/main/insert",
			data: formData,
			processData: false,
			contentType: false,
			beforeSend: function () {
				$("#loading-overlay").show();
			},
			success: function (response) {
				Swal.fire({
					icon: "success",
					title: "ส่งข้อมูลสำเร็จ",
					showConfirmButton: false,
					timer: 2000,
				});
				// location.reload();
				redirectWebflow();
			},
			complete: function () {
				$("#loading-overlay").hide();
			},
			error: function (xhr, status, error) {
				Swal.fire({
					icon: "error",
					title: "เกิดข้อผิดพลาด",
					text: error,
					showConfirmButton: true,
				});
			},
		});
	});

	$("#receipt").on("change", function () {
		$("#receipt").removeClass("input-error");
	});

	// ลบ class error เมื่อผู้ใช้กรอกข้อมูล
	$(document).on("input change", "input.input-error", function () {
		$(this).removeClass("input-error");
	});

	$(function () {
		// เพิ่มแถวสำหรับตารางปกติ
		$("#add-row").click(function () {
			var table = $("#expense-table tbody");
			var rowCount = table.find("tr").length + 1;
			var newRow = `<tr>
            <td class="py-2 px-4 text-center">${rowCount}</td>
            <td class="py-2 px-4">
                <input type="text" name="receipt_no[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition" placeholder="Receipt No.">
            </td>
            <td class="py-2 px-4">
                <input type="number" name="cost[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition cost-input" placeholder="Cost">
            </td>
            <td class="py-2 px-4">
                <input type="date" name="date_issue[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition">
            </td>
            <td class="py-2 px-4">
                <input type="file" name="receipt_file[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-green-400">
            </td>
            <td class="py-2 px-4 text-center">
                <button type="button" class="remove-row bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center cursor-pointer justify-center shadow transition" title="Remove row"> &times; </button>
            </td>
        </tr>`;
			table.append(newRow);
			updateRowNumbers();
		});

		// เพิ่มแถวสำหรับตารางแยก (เฉพาะประเภทที่อนุญาต)
		$(".add-row-split").click(function () {
			const type = $(this).data("type");
			const table = $(`.expense-table-split[data-type="${type}"] tbody`);
			const rowCount = table.find("tr").length + 1;

			const colorMap = {
				1: "cyan",
				2: "blue",
				3: "orange",
				4: "purple",
				7: "pink",
			};
			const colorClass = colorMap[type] || "gray";

			const newRow = `<tr>
            <td class="py-2 px-4 text-center">${rowCount}</td>
            <td class="py-2 px-4">
                <input type="text" name="receipt_no_${type}[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-${colorClass}-400 transition" placeholder="Receipt No.">
            </td>
            <td class="py-2 px-4">
                <input type="number" name="cost_${type}[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-${colorClass}-400 transition cost-input" placeholder="Cost">
            </td>
            <td class="py-2 px-4">
                <input type="date" name="date_issue_${type}[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-${colorClass}-400 transition">
            </td>
            <td class="py-2 px-4">
                <input type="file" name="receipt_file_${type}[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-${colorClass}-400">
            </td>
            <td class="py-2 px-4 text-center">
                <button type="button" class="remove-row bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center cursor-pointer justify-center shadow transition" title="Remove row"> &times; </button>
            </td>
        </tr>`;
			table.append(newRow);
			updateRowNumbersSplit(table);
			calculateTotalsSplit();
		});

		// ลบแถวสำหรับตารางปกติ
		$("#expense-table").on("click", ".remove-row", function () {
			$(this).closest("tr").remove();
			updateRowNumbers();
			calculateTotals();
		});

		// ลบแถวสำหรับตารางแยก
		$(".expense-table-split").on("click", ".remove-row", function () {
			const table = $(this).closest("tbody");
			$(this).closest("tr").remove();
			updateRowNumbersSplit(table);
			calculateTotalsSplit();
		});

		// อัปเดตลำดับแถวสำหรับตารางปกติ
		function updateRowNumbers() {
			$("#expense-table tbody tr").each(function (index) {
				$(this)
					.find("td:first")
					.text(index + 1);
			});
		}

		// อัปเดตลำดับแถวสำหรับตารางแยก
		function updateRowNumbersSplit(table) {
			table.find("tr").each(function (index) {
				$(this)
					.find("td:first")
					.text(index + 1);
			});
		}

		// คำนวณรวมสำหรับตารางปกติ
		$("#expense-table").on("input", "tbody input", calculateTotals);

		function calculateTotals() {
			let totalAmount = 0;
			$("#expense-table tbody tr").each(function () {
				const cost =
					parseFloat($(this).find("input[name='cost[]']").val()) || 0;
				totalAmount += cost;
			});
			console.log("Total (normal table):", totalAmount);
			$("#actual-cost").val(totalAmount).trigger("input");
		}

		// คำนวณรวมสำหรับตารางแยก
		$(".expense-table-split").on(
			"input",
			"tbody input",
			calculateTotalsSplit
		);

		function calculateTotalsSplit() {
			let totalAmount = 0;

			$(".expense-table-split").each(function () {
				const type = $(this).data("type");
				let typeTotal = 0;
				$(this).find("tbody tr").each(function () {
					const cost =
						parseFloat(
							$(this)
								.find(`input[name='cost_${type}[]']`)
								.val()
						) || 0;
					typeTotal += cost;
				});

				totalAmount += typeTotal;
				checkBudgetExceed(type, typeTotal);
			});

			console.log("Total (split tables):", totalAmount);
			$("#actual-cost").val(totalAmount).trigger("input");
		}

		// ฟังก์ชันตรวจสอบงบประมาณเกิน
		function checkBudgetExceed(type, actualCost) {
			// ดึงงบประมาณจาก data-estimate attribute
			const estimate =
				parseFloat(
					$(`.expense-table-split[data-type='${type}']`)
						.closest("div[data-estimate]")
						.data("estimate")
				) || 0;

			console.log(
				`Type ${type} - Actual: ${actualCost}, Estimate: ${estimate}`
			);

			// แสดง/ซ่อน Attach Memo section
			if (actualCost > estimate) {
				$(`#memo-section-${type}`).show();
			} else {
				$(`#memo-section-${type}`).hide();
			}
		}

		// เรียกคำนวณตอน load page
		if ($("#expense-table").length > 0) {
			calculateTotals();
		} else {
			calculateTotalsSplit();
		}
	});

	$("#test-submit").on("click", function () {
		const expense = [];
		$("#expense-table tbody tr").each(function () {
			expense.push({
				receipt_no: $(this).find("td:eq(1) input").val().trim(),
				cost:
					parseFloat($(this).find("td:eq(2) input").val().trim()) ||
					0,
			});
		});

		console.log("Expense Data:", expense);
	});

	// Clearance_form.blade.js logic for file_group visibility
	// ดึง estimate ให้ชัวร์ (ตัดทุกอย่างที่ไม่ใช่ตัวเลข จุด ลบ)
	function getEstimate() {
		const raw = $("#total_amount").text();
		const num = Number(String(raw).replace(/[^\d.-]/g, "")) || 0;
		return num;
	}

	const $actualCost = $("#actual-cost");
	const $remain = $("#remain");
	const $remainAlert = $("#remain-alert");
	const $remark = $("#remark");
	const $fileGroupSection = $("#file-group-section");

	// ผูก event ให้มีตัวเดียว
	$actualCost.off("input.fileGroup").on("input.fileGroup", function () {
		const estimate = getEstimate(); // อ่านสดทุกครั้งกันค่าถูกอัปเดต
		const val = Number(this.value) || 0;
		const remain = estimate - val;

		$remain.val(remain);

		console.log({
			val,
			estimate,
			remain,
			shouldShow: remain < 0,
		});

		const shouldShow = remain < 0;
		// สั่งทั้งสองแบบ กันโดน CSS/class อื่นทับ
		$fileGroupSection
			.toggle(shouldShow)
			.toggleClass("hidden", !shouldShow)
			.attr("aria-hidden", !shouldShow);

		if (remain >= 0) {
			$remark.prop("required", false);
			$remain.css("color", "#16a34a");
			// $remainAlert.html(
			// 	'<span class="text-green-700">ค่าใช้จ่ายจริงไม่เกินยอดประมาณการ</span>'
			// );
		} else {
			$remark.prop("required", true);
			$remain.css("color", "#dc2626");
			// $remainAlert.html(
			// 	'<span class="text-red-600">ค่าใช้จ่ายจริงเกินประมาณการ กรุณาระบุเหตุผลใน Remark</span>'
			// );
		}
	});

	// ให้ค่าตั้งต้น
	$actualCost.trigger("input");
});
