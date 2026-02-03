import { doaction, showflow } from "@amec/webasset/api/webform";
import { redirectWebflow } from "@amec/webasset/form";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { host } from "../../utils.js";
import Swal from "sweetalert2";
import "@flaticon/flaticon-uicons/css/all/all.css";
import { searchUser } from "@amec/webasset/api/amec";

import { s2disableSearch, s2opt, setSelect2 } from "@amec/webasset/select2";
import select2 from "select2";
import "select2/dist/css/select2.min.css";
select2();
$(document).ready(async function () {
	flatpickr("#start-date", { dateFormat: "Y-m-d" });

	const formData = $(".form-data").data();
	const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
	const NEED_PAYDATE = !!$(".form-data").data("need-paydate");

	console.log(NEED_PAYDATE);

	const formEnt = $(".form-ent").data() || {};
	const {
		ent_nfrmno,
		ent_vorgno,
		ent_cyear,
		ent_cyear2,
		ent_nrunno,
		ent_empno,
	} = formEnt;

	const flow = await showflow({ NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: nrunno, showStep: true });
	$(".flow").html(flow.html);

	if (
		ent_nfrmno &&
		ent_vorgno &&
		ent_cyear &&
		ent_cyear2 &&
		ent_nrunno &&
		ent_empno
	) {
		const flow_ent = await showflow({
			NFRMNO: ent_nfrmno,
			VORGNO: ent_vorgno,
			CYEAR: ent_cyear,
			CYEAR2: ent_cyear2,
			NRUNNO: ent_nrunno,
			showStep: true,
		});
		$(".flow_ent").html(flow_ent.html);
	}

	// ดึงข้อมูล expense มาแสดงในตาราง
	await loadExpenseData();

	async function loadExpenseData() {
		try {
			const response = await $.ajax({
				type: "POST",
				url: host + "gpform/GP-CLER/main/getExpenseData",
				data: {
					nfrmno: nfrmno,
					vorgno: vorgno,
					cyear: cyear,
					cyear2: cyear2,
					nrunno: nrunno
				},
				dataType: "json"
			});

			// ฟังก์ชันแปลงวันที่จาก DD-MMM-YY เป็น YYYY-MM-DD
			function convertDate(dateStr) {
				if (!dateStr) return '';
				try {
					const months = {
						'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
						'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
						'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
					};
					const parts = dateStr.split('-');
					if (parts.length === 3) {
						const day = parts[0].padStart(2, '0');
						const month = months[parts[1]];
						const year = '20' + parts[2];
						return `${year}-${month}-${day}`;
					}
				} catch (e) {
					console.error('Date conversion error:', e);
				}
				return dateStr;
			}

			// response คือ array โดยตรงจาก controller
			if (response && Array.isArray(response) && response.length > 0) {
				const expenses = response;

				// ตรวจสอบว่าเป็นตารางปกติหรือตารางแยก
				if ($("#expense-table").length > 0) {
					// กรณีตารางปกติ
					const $tbody = $("#expense-table tbody");
					$tbody.empty();

					expenses.forEach((expense, index) => {
						const receiptNo = expense.RECEIPT || expense.RECEIPT_NO || '';
						const cost = expense.COST || '';
						const dateIssue = convertDate(expense.DATE_ISSUE);
						const receiptFile = expense.RECEIPT_FILE;

						const row = `<tr>
							<td class="py-2 px-4 text-center">${index + 1}</td>
							<td class="py-2 px-4">
								<input type="text" name="receipt_no[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition" placeholder="Receipt No." value="${receiptNo}">
							</td>
							<td class="py-2 px-4">
								<input type="number" name="cost[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition cost-input" placeholder="Cost" value="${cost}">
							</td>
							<td class="py-2 px-4">
								<input type="date" name="date_issue[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition" value="${dateIssue}">
							</td>
							<td class="py-2 px-4">
								${receiptFile ?
								`<div class="flex items-center gap-2">
										<a href="${host}gpform/GP-CLER/main/preview/${receiptFile}" target="_blank" class="text-blue-600 text-xs underline">View</a>
										<input type="file" name="receipt_file[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-green-400">
									</div>` :
								`<input type="file" name="receipt_file[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-green-400">`
							}
							</td>
							<td class="py-2 px-4 text-center">
								<button type="button" class="remove-row bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center cursor-pointer justify-center shadow transition" title="Remove row"> &times; </button>
							</td>
						</tr>`;
						$tbody.append(row);
					});

					calculateTotals();
				} else if ($(".expense-table-split").length > 0) {
					// กรณีตารางแยก
					const lunchExpenses = expenses.filter(e => e.TYPE == 1);
					const breakExpenses = expenses.filter(e => e.TYPE == 4);

					// โหลดข้อมูล Lunch
					if (lunchExpenses.length > 0) {
						const $lunchTbody = $(".expense-table-split[data-type='1'] tbody");
						$lunchTbody.empty();

						lunchExpenses.forEach((expense, index) => {
							const receiptNo = expense.RECEIPT || expense.RECEIPT_NO || '';
							const cost = expense.COST || '';
							const dateIssue = convertDate(expense.DATE_ISSUE);
							const receiptFile = expense.RECEIPT_FILE;

							const row = `<tr>
								<td class="py-2 px-4 text-center">${index + 1}</td>
								<td class="py-2 px-4">
									<input type="text" name="receipt_no_1[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-cyan-400 transition" placeholder="Receipt No." value="${receiptNo}">
								</td>
								<td class="py-2 px-4">
									<input type="number" name="cost_1[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-cyan-400 transition cost-input" placeholder="Cost" value="${cost}">
								</td>
								<td class="py-2 px-4">
									<input type="date" name="date_issue_1[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-cyan-400 transition" value="${dateIssue}">
								</td>
								<td class="py-2 px-4">
									${receiptFile ?
									`<div class="flex items-center gap-2">
											<a href="${host}gpform/GP-CLER/main/preview/${receiptFile}" target="_blank" class="text-blue-600 text-xs underline">View</a>
											<input type="file" name="receipt_file_1[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-cyan-400">
										</div>` :
									`<input type="file" name="receipt_file_1[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-cyan-400">`
								}
								</td>
								<td class="py-2 px-4 text-center">
									<button type="button" class="remove-row bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center cursor-pointer justify-center shadow transition" title="Remove row"> &times; </button>
								</td>
							</tr>`;
							$lunchTbody.append(row);
						});
					}

					// โหลดข้อมูล Break
					if (breakExpenses.length > 0) {
						const $breakTbody = $(".expense-table-split[data-type='4'] tbody");
						$breakTbody.empty();

						breakExpenses.forEach((expense, index) => {
							const receiptNo = expense.RECEIPT || expense.RECEIPT_NO || '';
							const cost = expense.COST || '';
							const dateIssue = convertDate(expense.DATE_ISSUE);
							const receiptFile = expense.RECEIPT_FILE;

							const row = `<tr>
								<td class="py-2 px-4 text-center">${index + 1}</td>
								<td class="py-2 px-4">
									<input type="text" name="receipt_no_4[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-purple-400 transition" placeholder="Receipt No." value="${receiptNo}">
								</td>
								<td class="py-2 px-4">
									<input type="number" name="cost_4[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-purple-400 transition cost-input" placeholder="Cost" value="${cost}">
								</td>
								<td class="py-2 px-4">
									<input type="date" name="date_issue_4[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-purple-400 transition" value="${dateIssue}">
								</td>
								<td class="py-2 px-4">
									${receiptFile ?
									`<div class="flex items-center gap-2">
											<a href="${host}gpform/GP-CLER/main/preview/${receiptFile}" target="_blank" class="text-blue-600 text-xs underline">View</a>
											<input type="file" name="receipt_file_4[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-purple-400">
										</div>` :
									`<input type="file" name="receipt_file_4[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-purple-400">`
								}
								</td>
								<td class="py-2 px-4 text-center">
									<button type="button" class="remove-row bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center cursor-pointer justify-center shadow transition" title="Remove row"> &times; </button>
								</td>
							</tr>`;
							$breakTbody.append(row);
						});
					}

					calculateTotalsSplit();
				}
			}
		} catch (error) {
			console.error("Error loading expense data:", error);
		}
	}

	function todayYMD() {
		const d = new Date();
		const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
		return local.toISOString().slice(0, 10); // YYYY-MM-DD
	}

	if ($("#emp_select").length) {
		$("#emp_select").select2();

		const employees = await searchUser({ CSTATUS: "1" });

		const participants = await $.ajax({
			type: "POST",
			url: host + "gpform/GP-ENT/main/getamecParticipants",
			data: {
				nfrmno: ent_nfrmno,
				vorgno: ent_vorgno,
				cyear: ent_cyear,
				cyear2: ent_cyear2,
				nrunno: ent_nrunno
			},
			dataType: "json"
		});

		// ดึงเฉพาะ EMP_CODE / SEMPNO ของ participant
		const participantEmpCodes = participants.map(p => p.EMP_CODE);
		// หรือถ้าใช้ชื่อฟิลด์ SEMPNO
		// const participantEmpCodes = participants.map(p => p.SEMPNO);

		const emp_manager = employees
			.filter(emp =>
				emp.SPOSCODE <= "20" &&
				emp.SDIVCODE !== "140101" &&
				!participantEmpCodes.includes(emp.SEMPNO)
			)
			.sort((a, b) => a.SPOSCODE.localeCompare(b.SPOSCODE));

		emp_manager.forEach(emp => {
			const option = `<option value="${emp.SEMPNO}">
				${emp.SEMPNO} - ${emp.SNAME} (${emp.SPOSNAME})
			</option>`;
			$("#emp_select").append(option);
		});
	}

	$(".btn-submit").on("click", async function () {
		const action = $(this).data("action");
		const remark_approve = $("#remark_approve").val();

		if (action === "approve" && NEED_PAYDATE) {
			const $payInput = $("#pay_date");
			let payDate = ""; // ← ใช้ let

			if ($payInput.length > 0) {
				// มี input ให้ผู้อนุมัติกรอกเอง
				payDate = ($payInput.val() || "").trim();
				if (!payDate) {
					await Swal.fire({
						icon: "warning",
						title: "กรุณากรอก Pay Date",
						showConfirmButton: true,
					});
					return;
				}
			} else {
				// ไม่มี input → default เป็น “วันนี้”
				payDate = todayYMD();
			}

			try {
				$("#loading-overlay").show();
				await $.ajax({
					type: "POST",
					url: host + "gpform/GP-CLER/main/UpdatePayDate",
					data: {
						nfrmno,
						vorgno,
						cyear,
						cyear2,
						nrunno,
						empno,
						pay_date: payDate,
					},
				});
			} catch (xhr) {
				await Swal.fire({
					icon: "error",
					title: "เกิดข้อผิดพลาดในการบันทึก Pay Date",
					text: xhr?.responseText || "",
					showConfirmButton: true,
				});
				$("#loading-overlay").hide();
				return;
			} finally {
				$("#loading-overlay").hide();
			}
		}

		if (action === "approve" && $("#emp_select").length) {
			const approver = $("#emp_select").val();
			if (approver) { // ถ้าไม่ได้เลือกก็ไม่ต้อง Update
				$("#loading-overlay").show(); // Show loading overlay before sending the request
				await $.ajax({
					type: "post",
					url: host + "gpform/GP-ENT/main/NewApproveController",
					data: {
						approver,
						nfrmno,
						vorgno,
						cyear,
						cyear2,
						nrunno,
					},
					success: function (response) {
						console.log(response);
					},
					error: function (xhr) {
						console.log(xhr);
					},
					complete: function () {
						$("#loading-overlay").hide(); // Hide loading overlay after the request completes
					},
				});
			}
		}

		// ทำ action ต่อ
		const result = await doaction(
			{
				NFRMNO: nfrmno,
				VORGNO: vorgno,
				CYEAR: cyear,
				CYEAR2: cyear2,
				NRUNNO: nrunno,
				ACTION: action,
				EMPNO: empno,
				REMARK: remark_approve // optional
			}
		);
		if (result?.status) redirectWebflow();
	});

	// $(".remark").each(function () {
	//   console.log($(this).val());
	//   const value = $(this).val();
	//   const $row = $(this).closest("tr");
	//   const etCost = Number($row.find(".estimate-type option:selected").data("cost"));
	// });

	// $(".estimate-type").each(function () {
	//   // const value = $(this).val();
	//   if ($(this).val()) {
	//     const row = $(this).closest("tr");
	//     const cost = row.find("option:selected").data("cost");
	//     const amount = Number(row.find(".amount").val());
	//     if (amount > cost) row.fine(".remark").prop("disabled", false);
	//   }
	//   // const etCost = Number($row.find(".estimate-type option:selected").data("cost"));
	//   // console.log(cost);
	// });

	$("#btn-savechange").click(async function () {
		const p_join = $("input[name='president_join']:checked").val();
		const actual_cost = $("#actual-cost").val().trim();
		const remain = $("#remain").val().trim();
		const remark = $("#remark").val().trim();
		const formnumber = $("#formnumber").val();
		const fileInput = $("#receipt")[0];
		const file = fileInput ? fileInput.files[0] : null;
		const memoInput = $("#memo")[0];
		const memoFiles = memoInput && memoInput.files ? memoInput.files : null;

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
				// ไม่บังคับไฟล์ในโหมด edit ถ้ามีไฟล์เดิมอยู่แล้ว
			});
		}

		// ตรวจสอบตารางแยก (Lunch)
		if (
			$(".expense-table-split[data-type='1']").length > 0 &&
			!hasEmptyField
		) {
			$(".expense-table-split[data-type='1'] tbody tr").each(function (
				index
			) {
				const row = index + 1;
				const receiptNo = $(this)
					.find("input[name='receipt_no_1[]']")
					.val()
					?.trim();
				const cost = $(this)
					.find("input[name='cost_1[]']")
					.val()
					?.trim();
				const dateIssue = $(this)
					.find("input[name='date_issue_1[]']")
					.val()
					?.trim();

				if (!receiptNo) {
					hasEmptyField = true;
					emptyFieldName = `Lunch - Receipt No. (แถวที่ ${row})`;
					$(this)
						.find("input[name='receipt_no_1[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (!cost) {
					hasEmptyField = true;
					emptyFieldName = `Lunch - Cost (แถวที่ ${row})`;
					$(this)
						.find("input[name='cost_1[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (!dateIssue) {
					hasEmptyField = true;
					emptyFieldName = `Lunch - Date issue receipt (แถวที่ ${row})`;
					$(this)
						.find("input[name='date_issue_1[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
			});
		}

		// ตรวจสอบตารางแยก (Break)
		if (
			$(".expense-table-split[data-type='4']").length > 0 &&
			!hasEmptyField
		) {
			$(".expense-table-split[data-type='4'] tbody tr").each(function (
				index
			) {
				const row = index + 1;
				const receiptNo = $(this)
					.find("input[name='receipt_no_4[]']")
					.val()
					?.trim();
				const cost = $(this)
					.find("input[name='cost_4[]']")
					.val()
					?.trim();
				const dateIssue = $(this)
					.find("input[name='date_issue_4[]']")
					.val()
					?.trim();

				if (!receiptNo) {
					hasEmptyField = true;
					emptyFieldName = `Break - Receipt No. (แถวที่ ${row})`;
					$(this)
						.find("input[name='receipt_no_4[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (!cost) {
					hasEmptyField = true;
					emptyFieldName = `Break - Cost (แถวที่ ${row})`;
					$(this)
						.find("input[name='cost_4[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (!dateIssue) {
					hasEmptyField = true;
					emptyFieldName = `Break - Date issue receipt (แถวที่ ${row})`;
					$(this)
						.find("input[name='date_issue_4[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
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

		// Validate memo files for split expense (if visible)
		if ($(".expense-table-split").length > 0) {
			// ตรวจสอบ Lunch
			if ($("#memo-section-1").is(":visible")) {
				const memoFile1 = $("input[name='memo_1']")[0];
				if (!memoFile1 || memoFile1.files.length === 0) {
					Swal.fire({
						icon: "warning",
						title: "กรุณาแนบ Memo สำหรับ Lunch เนื่องจากค่าใช้จ่ายเกินงบประมาณ",
						toast: true,
						position: "top-end",
						timer: 3000,
						showConfirmButton: false,
						background: "#FBF6D9",
					});
					$("input[name='memo_1']").addClass("input-error").focus();
					return;
				}
			}

			// ตรวจสอบ Break
			if ($("#memo-section-4").is(":visible")) {
				const memoFile4 = $("input[name='memo_4']")[0];
				if (!memoFile4 || memoFile4.files.length === 0) {
					Swal.fire({
						icon: "warning",
						title: "กรุณาแนบ Memo สำหรับ Break เนื่องจากค่าใช้จ่ายเกินงบประมาณ",
						toast: true,
						position: "top-end",
						timer: 3000,
						showConfirmButton: false,
						background: "#FBF6D9",
					});
					$("input[name='memo_4']").addClass("input-error").focus();
					return;
				}
			}
		}

		// ถ้า remain < 0 ต้องมี remark
		if (parseFloat(remain) < 0 && remark === "") {
			Swal.fire({
				icon: "warning",
				title: "กรุณาระบุเหตุผลใน Remark กรณีค่าใช้จ่ายจริงเกินประมาณการ",
				toast: true,
				position: "top-end",
				timer: 3000,
				showConfirmButton: false,
				background: "#FBF6D9",
			});
			$("#remark").focus();
			return;
		}

		// Prepare FormData for file upload
		let formData = new FormData();
		formData.append("p_join", p_join);
		formData.append("actual_cost", actual_cost);
		formData.append("remain", parseFloat(remain));
		formData.append("remark", remark);
		if (file) formData.append("receipt", file);
		if (memoFiles && memoFiles.length) {
			for (let i = 0; i < memoFiles.length; i++)
				formData.append("memo[]", memoFiles[i]);
		}
		formData.append("nfrmno", nfrmno);
		formData.append("vorgno", vorgno);
		formData.append("cyear", cyear);
		formData.append("cyear2", cyear2);
		formData.append("nrunno", nrunno);

		// รวบรวมข้อมูล expense
		const expense = [];
		const expenseSplit = {
			lunch: [],
			break: [],
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
			// กรณีตารางแยก (Lunch และ Break)
			// รวบรวม Lunch (type=1)
			let lunchIndex = 0;
			$(".expense-table-split[data-type='1'] tbody tr").each(function () {
				const receipt_no = $(this)
					.find("input[name='receipt_no_1[]']")
					.val()
					.trim();
				const cost =
					parseFloat(
						$(this).find("input[name='cost_1[]']").val().trim()
					) || 0;
				const date_issue = $(this)
					.find("input[name='date_issue_1[]']")
					.val()
					.trim();
				const receiptFile = $(this).find(
					"input[name='receipt_file_1[]']"
				)[0];

				if (receipt_no !== "" || cost > 0) {
					expenseSplit.lunch.push({
						receipt_no,
						cost,
						date_issue,
						type: 1,
					});

					// แนบไฟล์ receipt ถ้ามี
					if (receiptFile && receiptFile.files.length > 0) {
						formData.append(
							`receipt_file_lunch_${lunchIndex}`,
							receiptFile.files[0]
						);
					}
				}
				lunchIndex++;
			});

			// รวบรวม Break (type=4)
			let breakIndex = 0;
			$(".expense-table-split[data-type='4'] tbody tr").each(function () {
				const receipt_no = $(this)
					.find("input[name='receipt_no_4[]']")
					.val()
					.trim();
				const cost =
					parseFloat(
						$(this).find("input[name='cost_4[]']").val().trim()
					) || 0;
				const date_issue = $(this)
					.find("input[name='date_issue_4[]']")
					.val()
					.trim();
				const receiptFile = $(this).find(
					"input[name='receipt_file_4[]']"
				)[0];

				if (receipt_no !== "" || cost > 0) {
					expenseSplit.break.push({
						receipt_no,
						cost,
						date_issue,
						type: 4,
					});

					// แนบไฟล์ receipt ถ้ามี
					if (receiptFile && receiptFile.files.length > 0) {
						formData.append(
							`receipt_file_break_${breakIndex}`,
							receiptFile.files[0]
						);
					}
				}
				breakIndex++;
			});

			formData.append("expenseSplit", JSON.stringify(expenseSplit));

			// แนบไฟล์ memo สำหรับแต่ละ type
			const memoFile1 = $("input[name='memo_1']")[0];
			if (memoFile1 && memoFile1.files.length > 0) {
				formData.append("memo_1", memoFile1.files[0]);
			}

			const memoFile4 = $("input[name='memo_4']")[0];
			if (memoFile4 && memoFile4.files.length > 0) {
				formData.append("memo_4", memoFile4.files[0]);
			}
		}

		$.ajax({
			type: "POST",
			url: host + "gpform/GP-CLER/main/Update",
			data: formData,
			processData: false,
			contentType: false,
			beforeSend: function () {
				$("#loading-overlay").show();
			},
			success: async function (response) {
				Swal.fire({
					icon: "success",
					title: "ส่งข้อมูลสำเร็จ",
					showConfirmButton: false,
					timer: 2000,
				});
				const confirm = await doaction(
					{
						NFRMNO: nfrmno,
						VORGNO: vorgno,
						CYEAR: cyear,
						CYEAR2: cyear2,
						NRUNNO: nrunno,
						ACTION: 'approve',
						EMPNO: empno,
						REMARK: "" // optional
					}
				);
				if (confirm.status) redirectWebflow();
				// location.reload();
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

	$("#submit-btn-noAdv").click(async function (e) {
		e.preventDefault();

		// --- Basic info validation ---
		if ($("#input-by").val().trim() === "")
			return showInputToast("#input-by", "กรุณากรอก Input By");
		if ($("#requested-by").val().trim() === "")
			return showInputToast("#requested-by", "กรุณากรอก Request By");
		if ($("#entertain-date").val().trim() === "")
			return showInputToast(
				"#entertain-date",
				"กรุณากรอก Entertainment Date"
			);
		if ($("#purpose").val().trim() === "")
			return showInputToast(
				"#purpose",
				"กรุณาเลือกเหตุผลสำหรับ Entertain"
			);

		if (!$("input[name='time']:checked").val())
			return showRadioToast("input[name='time']", "กรุณาเลือกช่วงเวลา");
		if (!$("input[name='location']:checked").val())
			return showRadioToast(
				"input[name='location']",
				"กรุณาเลือกสถานที่"
			);
		if (
			$("input[name='location']:checked").val() === "Outside" &&
			$("#location_detail").val().trim() === ""
		)
			return showInputToast(
				"#location_detail",
				"กรุณากรอกรายละเอียด Location"
			);

		// --- เพิ่มส่วน validation แบบเดิม (president_join, actual_cost, remain, remark, receipt) ---
		const p_join = $("input[name='president_join']:checked").val();
		const actual_cost = $("#actual-cost").val()?.trim() || "";
		const remain = $("#remain").val()?.trim() || "";
		const remark = $("#remark").val()?.trim() || "";
		const reason = $("#reason").val()?.trim() || "";
		const fileInput = $("#receipt")[0];
		const fileInputMemo = $("#file-memo")[0];
		const fileReceipt = fileInput?.files?.[0];
		const fileMemo = fileInputMemo?.files?.[0];

		// --- Company Validation ---
		let companiesArray = [];
		let companyValid = true,
			companyMsg = "";
		$("#companies-container .company-group").each(function (idx, group) {
			const $g = $(group);
			const name = $g.find(".company-name").val().trim();
			const orgType = $g.find(".org-type:checked").val();
			const fileInput = $g.find('input[type="file"]')[0];

			// << ประกาศตรงนี้เลย ไม่ต้องประกาศใน if
			const hasCurrentFile =
				$g.find(".current-file").is(":visible") &&
				$g.find(".current-file").html().trim() !== "";
			const hasNewFile = fileInput.files && fileInput.files.length > 0;

			if (!name) {
				companyValid = false;
				companyMsg = `กรุณากรอกชื่อบริษัท ในชุดที่ ${idx + 1}`;
				$g.find(".company-name").addClass("input-error").focus();
				return false;
			}
			if (!orgType) {
				companyValid = false;
				companyMsg = `กรุณาเลือกประเภทองค์กร ในชุดที่ ${idx + 1}`;
				$g.find(".org-type").addClass("radio-error").first().focus();
				return false;
			}

			if (orgType === "2") {
				if (!hasCurrentFile && !hasNewFile) {
					companyValid = false;
					companyMsg = `กรุณาแนบไฟล์ Appendix A ในชุดที่ ${idx + 1}`;
					$g.find('input[type="file"]')
						.addClass("input-error")
						.focus();
					return false;
				}
			}

			companiesArray.push({
				name: name,
				orgType: orgType,
				fileName: hasNewFile ? fileInput.files[0].name : null,
				current_file: hasCurrentFile
					? $g.find(".current-file a").text().trim()
					: "",
			});
		});

		$(".company-name").on("input change", function () {
			$(this).removeClass("input-error");
		});
		$(".org-type").on("change", function () {
			$(".org-type").removeClass("radio-error");
		});

		if (!companyValid)
			return Swal.fire({
				toast: true,
				position: "top-end",
				icon: "error",
				title: companyMsg,
				showConfirmButton: false,
				timer: 3000,
			});

		if (!$(".guest_type:checked").val())
			return showCheckboxToast(".guest_type", "กรุณาเลือก Guest Type");

		// --- Table estimate validation ---
		let costValid = false;
		let remarkValid = true;
		$("#table_cost tbody tr").each(function () {
			if ($(this).find("td:eq(0) select").val().trim() !== "")
				costValid = true;
			const $remark = $(this).find("input.remark");
			if (!$remark.is(":disabled") && $remark.val().trim() === "") {
				showInputToast($remark, "กรุณากรอกเหตุ.. กรณีเงินเกินเงื่อนไข");
				remarkValid = false;
				return false;
			}
		});
		if (!remarkValid) return;
		if (!costValid) {
			showInputToast(
				"#table_cost tbody tr:first td:eq(0) select",
				"กรุณากรอก Estimate อย่างน้อย 1 "
			);
			$("#alert-estimate").removeClass("hidden");
			$("#table_cost tbody tr:first td:eq(0) select").focus();
			setTimeout(() => $("#alert-estimate").addClass("hidden"), 5000);
			return;
		}

		// --- Participant validation ---
		if (guestCount() < 1)
			return showInputToast(
				"#guest-name-input",
				"กรุณากรอก guest อย่างน้อย 1 คน"
			);
		if (amecCount() < 1)
			return showInputToast(
				"#amec-name-input",
				"กรุณากรอกพนักงาน Amec 1 คน"
			);
		if (amecCount() > guestCount() && $("#remark").val() == "")
			return showInputToast(
				"#remark",
				"กรณีคน Amec มากกว่ากรุณากรอก Remark"
			);

		// Validate president_join
		if (!p_join)
			return showRadioToast(
				"input[name='president_join']",
				"กรุณาเลือก President Join"
			);
		// Validate actual_cost (required & number & >= 0)
		if (!actual_cost || isNaN(actual_cost) || parseFloat(actual_cost) < 0) {
			return showInputToast("#actual-cost", "กรุณากรอก Actual Cost");
		}

		// if (!fileMemo) {
		//   return showInputToast("#file-memo", "กรุณาแนบไฟล์ Memo");
		// }
		// Validate file
		// if (!fileReceipt) {
		//   //   $("#receipt").addClass("input-error").focus();
		//   return showInputToast("#receipt", "กรุณาแนบไฟล์ใบเสร็จรับเงิน");
		// }

		if (!reason) {
			return showInputToast("#reason", "กรุณากรอกเหตุผล");
		}

		// ถ้า remain < 0 ต้องมี remark
		if (parseFloat(remain) < 0 && remark === "") {
			Swal.fire({
				icon: "warning",
				title: "กรุณาระบุเหตุผลใน Remark กรณีค่าใช้จ่ายจริงเกินประมาณการ",
				toast: true,
				position: "top-end",
				timer: 3000,
				showConfirmButton: false,
				background: "#FBF6D9",
			});
			$("#remark").focus();
			return;
		}
		// --- Collect Data ---
		let formData = new FormData();

		// เพิ่ม field ที่จำเป็น
		formData.append("nfrmno", nfrmno);
		formData.append("vorgno", vorgno);
		formData.append("cyear", cyear);
		formData.append("input_by", $("#input-by").val());
		formData.append("requested_by", $("#requested-by").val());
		formData.append("entertain_date", $("#entertain-date").val());
		formData.append("purpose", $("#purpose").val());
		formData.append(
			"time",
			$("input[name='time']:checked").next("span").text()
		);
		formData.append(
			"location",
			$("input[name='location']:checked").next("span").text()
		);
		formData.append(
			"location_detail",
			$("input[placeholder='*Please identify the location.']").val()
		);
		formData.append("guest_type", $(".guest_type:checked").val());
		// formData.append("org_type", $("input[name='orgType']:checked").val());
		formData.append("entertain_budget", $("#entertain-budget").val());
		formData.append("total_amount", $("#total-amount").text());
		formData.append(
			"remark",
			$("textarea[placeholder*='ระบุเหตุผล']").val()
		);
		formData.append("companies", JSON.stringify(companiesArray));
		companiesArray.forEach((c, i) => {
			let fileInput = $("#companies-container .company-group")
				.eq(i)
				.find('input[type="file"]')[0];
			if (fileInput && fileInput.files.length > 0) {
				formData.append(`company_files[${i}]`, fileInput.files[0]);
			}
		});

		// ------- ส่วนข้อมูลของ president/receipt/actual_cost/remark/remain ที่เพิ่มมา ---------
		formData.append("p_join", p_join);
		formData.append("actual_cost", actual_cost);
		formData.append("remain", parseFloat(remain));
		formData.append("remark_president", remark); // หรือใช้ชื่อเดิม remark ก็ได้ถ้าไม่ซ้ำ
		formData.append("receipt", fileReceipt);
		formData.append("file_memo", fileMemo);
		formData.append("Reason", reason);

		// guest_list, amec_list, estimate_items เป็น JSON string
		formData.append(
			"guest_list",
			JSON.stringify(
				$("#guest-list li span")
					.map(function () {
						return $(this).text();
					})
					.get()
			)
		);
		formData.append(
			"amec_list",
			JSON.stringify(
				$("#amec-list li span")
					.map(function () {
						return $(this).data("empno");
					})
					.get()
			)
		);
		let estimate_items = [];
		$("#table_cost tbody tr").each(function () {
			let details = $(this).find("td:eq(0) select option:selected").val();
			let qty = $(this).find("td:eq(1) input").val();
			let cost = $(this).find("td:eq(2) input").val();
			let total = $(this).find("td:eq(3) input").val();
			let remark = $(this).find("td:eq(4) input").val();
			if (details && qty && cost && total)
				estimate_items.push({ details, qty, cost, total, remark });
		});
		formData.append("estimate_items", JSON.stringify(estimate_items));

		// const form = await createForm(nfrmno, vorgno, cyear, $("#requested-by").val(), $("#input-by").val(), "");
		// const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;
		formData.append("nrunno", nrunno);
		formData.append("cyear2", cyear2);

		// --- Submit AJAX ---
		$.ajax({
			type: "POST",
			url: host + "gpform/GP-CLER/main/UpdateNoAdv",
			data: formData,
			processData: false,
			contentType: false,
			beforeSend: function () {
				$("#loading-overlay").show();
			},
			success: async function (response) {
				const confirm = await doaction(
					{
						NFRMNO: nfrmno,
						VORGNO: vorgno,
						CYEAR: cyear,
						CYEAR2: cyear2,
						NRUNNO: nrunno,
						ACTION: 'approve',
						EMPNO: empno,
						REMARK: "" // optional
					}
				);
				if (confirm.status) redirectWebflow();
				Swal.fire({
					toast: true,
					position: "top-end",
					icon: "success",
					title: "บันทึกข้อมูลสำเร็จ!",
					showConfirmButton: false,
					timer: 2500,
					timerProgressBar: true,
					// didClose: () => location.reload(),
				});
			},
			complete: function () {
				$("#loading-overlay").hide();
			},
			error: function (xhr) {
				Swal.fire({
					toast: true,
					position: "top-end",
					icon: "error",
					title: xhr.responseText || "ไม่สามารถบันทึกข้อมูลได้",
					showConfirmButton: false,
					timer: 3000,
				});
			},
		});
	});

	$("input[name='president_join']").on("change", function () {
		$("input[name='president_join']")
			.removeClass("radio-error")
			.addClass("radio-success");
	});

	$("#actual-cost, #receipt, #reason, #file-memo").on(
		"input change",
		function () {
			// clearFieldError(this.id);
		}
	);

	$("#receipt").on("change", function () {
		$("#receipt").removeClass("input-error");
	});

	$(".del_file").on("click", function () {
		const fileName = $(this).data("name");
		deleteFile(fileName);
	});

	$("#memo").on("change", function () {
		const fileList = this.files;
		const $list = $("#file-list");
		$list.empty();

		if (!fileList.length) {
			$list.append('<li class="text-red-500">ไม่พบไฟล์ที่เลือก</li>');
			return;
		}

		Array.from(fileList).forEach((file, i) => {
			$list.append(
				`<li class="flex items-center gap-2">
                <span class="text-gray-700">- ${file.name}</span>
                <span class="text-xs text-gray-400">(${(
					file.size / 1024
				).toFixed(1)} KB)</span>
            </li>`
			);
		});
	});

	function deleteFile(fileName) {
		if (confirm("คุณต้องการลบไฟล์นี้ใช่หรือไม่?")) {
			$.post(
				host + "gpform/GP-CLER/main/delete_file",
				{
					file: fileName,
					nfrmno: nfrmno,
					vorgno: vorgno,
					cyear: cyear,
					cyear2: cyear2,
					nrunno: nrunno,
				},
				function (res) {
					location.reload();
				}
			);
		}
	}

	// ลบ class error เมื่อผู้ใช้กรอกข้อมูล
	$(document).on("input change", "input.input-error", function () {
		$(this).removeClass("input-error");
	});

	// เพิ่มแถวสำหรับตารางปกติ
	$(document).on("click", "#add-row", function () {
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

	// เพิ่มแถวสำหรับตารางแยก (Lunch/Break)
	$(document).on("click", ".add-row-split", function () {
		const type = $(this).data("type");
		const table = $(`.expense-table-split[data-type="${type}"] tbody`);
		const rowCount = table.find("tr").length + 1;

		// กำหนดสีตาม type
		const colorClass = type == 1 ? "cyan" : "purple";

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
	$(document).on("click", "#expense-table .remove-row", function () {
		$(this).closest("tr").remove();
		updateRowNumbers();
		calculateTotals();
	});

	// ลบแถวสำหรับตารางแยก
	$(document).on("click", ".expense-table-split .remove-row", function () {
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
	$(document).on("input", "#expense-table tbody input.cost-input", calculateTotals);

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
	$(document).on("input", ".expense-table-split tbody input.cost-input", calculateTotalsSplit);

	function calculateTotalsSplit() {
		let totalAmount = 0;
		let lunchTotal = 0;
		let breakTotal = 0;

		// รวมค่าใช้จ่ายจากตาราง Lunch (type=1)
		$(".expense-table-split[data-type='1'] tbody tr").each(function () {
			const cost =
				parseFloat($(this).find("input[name='cost_1[]']").val()) ||
				0;
			lunchTotal += cost;
		});

		// รวมค่าใช้จ่ายจากตาราง Break (type=4)
		$(".expense-table-split[data-type='4'] tbody tr").each(function () {
			const cost =
				parseFloat($(this).find("input[name='cost_4[]']").val()) ||
				0;
			breakTotal += cost;
		});

		totalAmount = lunchTotal + breakTotal;

		// ตรวจสอบงบประมาณสำหรับแต่ละประเภท
		checkBudgetExceed(1, lunchTotal);
		checkBudgetExceed(4, breakTotal);

		console.log(
			"Total (split tables):",
			totalAmount,
			"Lunch:",
			lunchTotal,
			"Break:",
			breakTotal
		);
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
	} else if ($(".expense-table-split").length > 0) {
		calculateTotalsSplit();
	}

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

	// ผูก event ให้มีตัวเดียว
	$actualCost.off("input.remain").on("input.remain", function () {
		const estimate = getEstimate(); // อ่านสดทุกครั้งกันค่าถูกอัปเดต
		const val = Number(this.value) || 0;
		const remain = estimate - val;

		$remain.val(remain);

		console.log({
			val,
			estimate,
			remain,
		});

		if (remain >= 0) {
			$remark.prop("required", false);
			$remain.css("color", "#16a34a");
			$remainAlert.html(
				'<span class="text-green-700">ค่าใช้จ่ายจริงไม่เกินยอดประมาณการ</span>'
			);
		} else {
			$remark.prop("required", true);
			$remain.css("color", "#dc2626");
			$remainAlert.html(
				'<span class="text-red-600">ค่าใช้จ่ายจริงเกินยอดประมาณการ กรุณาระบุเหตุผลใน Remark</span>'
			);
		}
	});

	// ให้ค่าตั้งต้น
	$actualCost.trigger("input");
});
