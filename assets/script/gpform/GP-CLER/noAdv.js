import "select2";
import "select2/dist/css/select2.min.css";
import { host } from "../../utils.js";
import { createForm, redirectWebflow } from "@amec/webasset/form";
import Swal from "sweetalert2";
import { dayOff } from "@amec/webasset/flatpickr";

$(function () {
	console.log(dayOff);
	$("#entertain-form-no").select2();
	const formData = $(".form-data").data();
	const { nfrmno, vorgno, cyear } = formData;
	const GUEST_MAX = 100,
		AMEC_MAX = 100;

	// -------- Initialize Flatpickr --------
	const entertainPicker = flatpickr("#entertain-date", {
		dateFormat: "Y-m-d",
		maxDate: "today", // noAdv เป็นการเคลียร์ย้อนหลัง ให้เลือกวันปัจจุบันหรือก่อนหน้า
	});

	// Icon triggers (ถ้ามี)
	$("#entertain-date-icon").on("click", function () {
		entertainPicker.open();
	});

	// -------- Utility Functions --------
	window.getGuestType = function () {
		return $(".guest_type:checked").val();
	};
	window.guestCount = function () {
		return $("#guest-list li").length;
	};
	window.amecCount = function () {
		return $("#amec-list li").length;
	};

	window.updateCount = function (type) {
		let count = type === "guest" ? guestCount() : amecCount();
		$(`#${type}-count`).text(
			`(${count}/${type === "guest" ? GUEST_MAX : AMEC_MAX})`
		);
		$(`#add-${type}-btn`).prop(
			"disabled",
			count >= (type === "guest" ? GUEST_MAX : AMEC_MAX)
		);
	};

	function validateAmecLimit() {
		updateCount("amec");
	}

	// -------- Add/Remove Guest/Amec --------
	function addGuest() {
		const name = $("#guest-name-input").val().trim();
		if (!name || guestCount() >= GUEST_MAX) return;
		$("#guest-list").append(
			`<li class="flex items-center justify-between gap-2 border border-blue-200 bg-blue-50 shadow-sm rounded-lg px-3 py-1">
        <span>${name}</span>
        <button type="button" class="remove-li bg-red-200 text-red-700 cursor-pointer rounded px-2 py-0.5 text-xs">ลบ</button>
      </li>`
		);
		$("#guest-name-input").val("");
		updateCount("guest");
		validateAmecLimit();
	}

	async function addAmec() {
		const amecName = $("#amec-name-input").val().trim();
		if (!amecName) return;
		$("#amec-loading").removeClass("hidden");
		$("#add-amec-btn").prop("disabled", true);
		const empData = await getDataEmp(amecName);
		$("#amec-loading").addClass("hidden");
		$("#add-amec-btn").prop("disabled", false);
		if (!empData.length) {
			Swal.fire({
				toast: true,
				position: "top-end",
				icon: "error",
				title: "ไม่พบรหัสพนักงาน",
				showConfirmButton: false,
				timer: 2000,
			});
			return;
		}
		if (amecCount() >= AMEC_MAX) return;
		$("#amec-list").append(
			`<li class="flex items-center justify-between gap-2 border border-blue-200 bg-blue-50 shadow-sm rounded-lg px-3 py-1">
        <span data-empno="${empData[0].SEMPNO}">${empData[0].SEMPPRE ?? ""} ${
				empData[0].SNAME
			} (${empData[0].SEMPNO})</span>
        <button type="button" class="remove-li bg-red-200 text-red-700 cursor-pointer rounded px-2 py-0.5 text-xs">ลบ</button>
      </li>`
		);
		$("#amec-name-input").val("");
		updateCount("amec");
		validateAmecLimit();
	}

	// -------- Event Bindings --------
	$("#add-guest-btn").click(addGuest);
	$("#add-amec-btn").click(addAmec);

	$("#guest-name-input").keydown((e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addGuest();
		}
	});
	$("#amec-name-input").keydown((e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addAmec();
		}
	});

	// Remove Guest/Amec (event delegation)
	$("#guest-list, #amec-list").on("click", ".remove-li", function () {
		$(this).closest("li").remove();
		updateCount("guest");
		updateCount("amec");
		validateAmecLimit();
	});

	// Guest type change
	$(".guest_type").on("change", validateAmecLimit);

	// Initial
	updateCount("guest");
	updateCount("amec");
	validateAmecLimit();

	// -------- No Entertain Checkbox --------
	$("#no-entertain").change(function () {
		if ($(this).is(":checked")) {
			$("#form-entertain").hide();
			$("#entertain-form-no").val("").trigger("change");
		} else {
			$("#form-entertain").show();
			$("#entertain-form-no").val("").trigger("change");
		}
	});

	// -------- Form Submit --------
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

		const timeVal = $("input[name='time']:checked").val();

		// บังคับตามประเภทเวลา
		if (timeVal === "Gift") {
			const gf = $("#gift-memo-file")[0];
			if (!gf || gf.files.length === 0) {
				return showInputToast(
					"#gift-memo-file",
					"กรุณาแนบ Memo (Gift)"
				);
			}
		}

		if (timeVal === "Other") {
			if ($("#other-details").val().trim() === "") {
				return showInputToast(
					"#other-details",
					"กรุณากรอก Other Details"
				);
			}
			const of = $("#other-memo-file")[0];
			if (!of || of.files.length === 0) {
				return showInputToast(
					"#other-memo-file",
					"กรุณาแนบ Memo (Other)"
				);
			}
		}

		// Location validation (เฉพาะเมื่อ visible)
		if ($("#div_location").is(":visible")) {
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
		}

		// --- Company Validation ---
		let companiesArray = [];
		let companyValid = true,
			companyMsg = "";
		$("#companies-container .company-group").each(function (idx, group) {
			const $g = $(group);
			const name = $g.find(".company-name").val().trim();
			const orgType = $g.find(".org-type:checked").val();
			const fileInput = $g.find('input[type="file"]')[0];

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
				if (!fileInput.files || fileInput.files.length === 0) {
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
				fileName:
					fileInput.files && fileInput.files.length > 0
						? fileInput.files[0].name
						: null,
			});
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

		// Guest Type validation (เฉพาะเมื่อไม่ใช่ Gift/Other)
		if (timeVal !== "Gift" && timeVal !== "Other") {
			if (!$(".guest_type:checked").val()) {
				return showCheckboxToast(
					".guest_type",
					"กรุณาเลือก Guest Type"
				);
			}
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
		if (amecCount() > guestCount() && $("#remark-participant").val() == "")
			return showInputToast(
				"#remark-participant",
				"กรณีคน Amec มากกว่ากรุณากรอก Remark"
			);

		// ตรวจสอบว่าพิมพ์ค้างไว้ในช่อง input แต่ยังไม่ได้กด ADD
		if ($("#guest-name-input").val().trim() !== "") {
			return showInputToast(
				"#guest-name-input",
				"คุณพิมพ์ชื่อ Guest ไว้แต่ยังไม่ได้กด ADD"
			);
		}
		if ($("#amec-name-input").val().trim() !== "") {
			return showInputToast(
				"#amec-name-input",
				"คุณพิมพ์รหัสพนักงานไว้แต่ยังไม่ได้กด ADD"
			);
		}

		// --- Expense Table Validation ---
		const expense = [];
		let hasExpense = false;
		let hasEmptyField = false;
		let emptyFieldName = "";

		$("#expense-table tbody tr").each(function (index) {
			const row = index + 1;
			const receipt_no =
				$(this).find("input[name='receipt_no[]']").val()?.trim() || "";
			const cost =
				parseFloat(
					$(this).find("input[name='cost[]']").val()?.trim()
				) || 0;
			const date_issue =
				$(this).find("input[name='date_issue[]']").val()?.trim() || "";
			const receiptFile = $(this).find("input[name='receipt_file[]']")[0];

			if (receipt_no !== "" || cost > 0) {
				hasExpense = true;

				// ถ้ามีข้อมูลแล้ว ต้องกรอกให้ครบทุก field
				if (!receipt_no) {
					hasEmptyField = true;
					emptyFieldName = `Receipt No. (แถวที่ ${row})`;
					$(this)
						.find("input[name='receipt_no[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (cost <= 0) {
					hasEmptyField = true;
					emptyFieldName = `Cost (แถวที่ ${row})`;
					$(this)
						.find("input[name='cost[]']")
						.addClass("input-error")
						.focus();
					return false;
				}
				if (!date_issue) {
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
			}

			expense.push({ receipt_no, cost, date_issue });
		});

		if (hasEmptyField) {
			return Swal.fire({
				icon: "warning",
				title: `กรุณากรอก ${emptyFieldName}`,
				toast: true,
				position: "top-end",
				timer: 3000,
				showConfirmButton: false,
				background: "#FBF6D9",
			});
		}

		if (!hasExpense) {
			return showInputToast(
				"#expense-table",
				"กรุณากรอกข้อมูลค่าใช้จ่ายอย่างน้อย 1 แถว"
			);
		}

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

		// Validate Memo file
		if (!fileMemo) {
			return showInputToast("#file-memo", "กรุณาแนบไฟล์ Memo");
		}

		// Validate Receipt file
		if (!fileReceipt) {
			return showInputToast("#receipt", "กรุณาแนบไฟล์ใบเสร็จรับเงิน");
		}

		// Validate Reason
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
		let formDataSubmit = new FormData();
		const isLocationVisible = $("#div_location").is(":visible");

		// เพิ่ม field ที่จำเป็น
		formDataSubmit.append("nfrmno", nfrmno);
		formDataSubmit.append("vorgno", vorgno);
		formDataSubmit.append("cyear", cyear);
		formDataSubmit.append("input_by", $("#input-by").val());
		formDataSubmit.append("requested_by", $("#requested-by").val());
		formDataSubmit.append("entertain_date", $("#entertain-date").val());
		formDataSubmit.append("purpose", $("#purpose").val());
		formDataSubmit.append("time", timeVal);
		formDataSubmit.append(
			"location",
			isLocationVisible ? $("input[name='location']:checked").val() : ""
		);
		formDataSubmit.append(
			"location_detail",
			isLocationVisible ? $("#location_detail").val() : ""
		);
		formDataSubmit.append(
			"guest_type",
			$(".guest_type:checked").val() ?? ""
		);
		formDataSubmit.append("total_amount", $("#total-amount").text());
		formDataSubmit.append(
			"remark",
			$("textarea[placeholder*='ระบุเหตุผล']").val()
		);
		formDataSubmit.append("companies", JSON.stringify(companiesArray));
		formDataSubmit.append("other_details", $("#other-details").val() || "");

		companiesArray.forEach((c, i) => {
			let fileInput = $("#companies-container .company-group")
				.eq(i)
				.find('input[type="file"]')[0];
			if (fileInput && fileInput.files.length > 0) {
				formDataSubmit.append(
					`company_files[${i}]`,
					fileInput.files[0]
				);
			}
		});

		if (timeVal === "Gift") {
			const gf = $("#gift-memo-file")[0];
			if (gf && gf.files.length > 0) {
				formDataSubmit.append("file_memo_gift", gf.files[0]);
			}
		}
		if (timeVal === "Other") {
			const of = $("#other-memo-file")[0];
			if (of && of.files.length > 0) {
				formDataSubmit.append("file_memo_other", of.files[0]);
			}
		}

		formDataSubmit.append("expense", JSON.stringify(expense));

		// แนบไฟล์ receipt สำหรับแต่ละแถว
		let rowIndex = 0;
		$("#expense-table tbody tr").each(function () {
			const receiptFile = $(this).find("input[name='receipt_file[]']")[0];
			if (receiptFile && receiptFile.files.length > 0) {
				formDataSubmit.append(
					`receipt_file_${rowIndex}`,
					receiptFile.files[0]
				);
			}
			rowIndex++;
		});

		// ------- ส่วนข้อมูลของ president/receipt/actual_cost/remark/remain ที่เพิ่มมา ---------
		formDataSubmit.append("p_join", p_join);
		formDataSubmit.append("actual_cost", actual_cost);
		formDataSubmit.append("remain", parseFloat(remain));
		formDataSubmit.append("remark_president", remark);
		formDataSubmit.append("receipt", fileReceipt);
		formDataSubmit.append("file_memo", fileMemo);
		formDataSubmit.append("Reason", reason);

		// guest_list, amec_list เป็น JSON string
		formDataSubmit.append(
			"guest_list",
			JSON.stringify(
				$("#guest-list li span")
					.map(function () {
						return $(this).text();
					})
					.get()
			)
		);
		formDataSubmit.append(
			"amec_list",
			JSON.stringify(
				$("#amec-list li span")
					.map(function () {
						return $(this).data("empno");
					})
					.get()
			)
		);

		const form = await createForm(
			nfrmno,
			vorgno,
			cyear,
			$("#requested-by").val(),
			$("#input-by").val(),
			""
		);
		const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;
		formDataSubmit.append("nrunno", NRUNNO);
		formDataSubmit.append("cyear2", CYEAR2);

		// --- Submit AJAX ---
		$.ajax({
			type: "POST",
			url: host + "gpform/GP-CLER/main/InsertFormNoAdv",
			data: formDataSubmit,
			processData: false,
			contentType: false,
			beforeSend: function () {
				$("#loading-overlay").show();
			},
			success: function (response) {
				Swal.fire({
					toast: true,
					position: "top-end",
					icon: "success",
					title: "บันทึกข้อมูลสำเร็จ!",
					showConfirmButton: false,
					timer: 2500,
					timerProgressBar: true,
				});
				redirectWebflow();
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

	// ---- Clear error on change ----
	$("input[name='president_join']").on("change", function () {
		$("input[name='president_join']")
			.removeClass("radio-error")
			.addClass("radio-success");
	});

	$("#actual-cost, #receipt, #reason, #file-memo").on(
		"input change",
		function () {
			clearFieldError(this.id);
		}
	);

	$("#receipt").on("change", function () {
		$("#receipt").removeClass("input-error");
	});

	// ลบ error class เมื่อมีการเปลี่ยนแปลง
	$(".company-name").on("input change", function () {
		$(this).removeClass("input-error");
	});
	$(".org-type").on("change", function () {
		$(".org-type").removeClass("radio-error");
	});

	$(
		"#input-by, #requested-by, #entertain-date, #purpose, #location_detail, #guest-name-input, #amec-name-input, #remark, #reason"
	).on("input change", function () {
		clearFieldError(this.id);
	});

	// -------- Time Radio Change Behavior (เหมือน GP-ENT) --------
	$("input[name='time']").on("change", function () {
		$("input[name='time']")
			.removeClass("radio-error")
			.addClass("radio-primary");
		const val = $(this).val();

		// ค่าเริ่มต้น: แสดง GT และ Location, ซ่อน Gift/Other fields
		$("#gift-memo, #other-fields").hide();
		$("#div_gt").show();
		$("#div_location").show();
		$("input[name='location']").prop("disabled", false);
		$("#location_detail").prop("disabled", false);

		if (val === "Gift") {
			$("#gift-memo").show();
			$("#div_gt").hide();
			$("#div_location").hide();
			// ล้างค่า/ปิดการใช้งาน Location เมื่อซ่อน
			$("input[name='location']")
				.prop("checked", false)
				.prop("disabled", true);
			$("#location_detail").val("").prop("disabled", true);
			return;
		}

		if (val === "Other") {
			$("#other-fields").show();
			$("#div_gt").hide();
			$("#div_location").hide();
			$("input[name='location']")
				.prop("checked", false)
				.prop("disabled", true);
			$("#location_detail").val("").prop("disabled", true);
			return;
		}

		// เคสปกติ: Lunch/Dinner
		if (val === "Dinner") {
			$("#location-inside").prop("disabled", true);
			$("#location-outside").prop("checked", true);
			$("#location_detail").prop("disabled", false).focus();
		} else {
			$("#location-inside").prop("disabled", false);
			$("#location-outside").prop("checked", false);
			$("#location_detail").val("");
		}
	});

	$("input[name='location']").on("change", function () {
		$("input[name='location']")
			.removeClass("radio-error")
			.addClass("radio-primary");
	});

	$(".guest_type").on("change", function () {
		$(this).removeClass("checkbox-error").addClass("checkbox-primary");
	});

	// -------- Company Management --------
	let companyIndex = 1;

	function updateRadioNames() {
		$("#companies-container .company-group").each(function (i, group) {
			$(group)
				.find(".org-type")
				.each(function () {
					$(this).attr("name", "orgType-" + i);
				});
		});
	}

	$("#add-company-btn").on("click", function () {
		// clone ฟอร์มแรก แล้ว reset ค่า
		let $lastGroup = $("#companies-container .company-group").last();
		let $newGroup = $lastGroup.clone();

		// reset ค่า input
		$newGroup.find('input[type="text"]').val("");
		$newGroup.find('input[type="file"]').val("");
		$newGroup.find(".appendix-section").addClass("hidden");
		$newGroup.find("input.org-type").prop("checked", false);

		// show ปุ่มลบ ถ้ามากกว่า 1 ชุด
		$newGroup.find(".remove-company-btn").removeClass("hidden");

		// append
		$("#companies-container").append($newGroup);

		updateRadioNames();
	});

	// toggle ช่องแนบไฟล์ในแต่ละชุด
	$("#companies-container").on("change", ".org-type", function () {
		let $group = $(this).closest(".company-group");
		if ($(this).val() === "2") {
			$group.find(".appendix-section").removeClass("hidden");
		} else {
			$group.find(".appendix-section").addClass("hidden");
			$group.find('input[type="file"]').val("");
		}
	});

	// ลบชุดบริษัท
	$("#companies-container").on("click", ".remove-company-btn", function () {
		$(this).closest(".company-group").remove();
		updateRadioNames();
	});

	// ---- Utility functions (Toast Version) ----
	window.showInputToast = function (selector, msg) {
		$(selector).addClass("input-error").focus();
		Swal.fire({
			toast: true,
			position: "top-end",
			icon: "warning",
			title: msg,
			showConfirmButton: false,
			timer: 2000,
			background: "#FBF6D9",
		});
	};
	window.showRadioToast = function (selector, msg) {
		$(selector)
			.removeClass("radio-primary radio-success")
			.addClass("radio-error")
			.first()
			.focus();
		Swal.fire({
			toast: true,
			position: "top-end",
			icon: "warning",
			title: msg,
			showConfirmButton: false,
			timer: 2000,
		});
	};
	window.showCheckboxToast = function (selector, msg) {
		$(selector)
			.addClass("checkbox-error")
			.removeClass("checkbox-primary")
			.first()
			.focus();
		Swal.fire({
			toast: true,
			position: "top-end",
			icon: "warning",
			title: msg,
			showConfirmButton: false,
			timer: 2000,
		});
	};

	window.clearFieldError = function (inputId) {
		$("#" + inputId).removeClass("input-error");
	};
});

// -------- Expense Table Functions --------
$(function () {
	// เพิ่มแถว
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

	// ลบแถว
	$("#expense-table").on("click", ".remove-row", function () {
		$(this).closest("tr").remove();
		updateRowNumbers();
		calculateTotals();
	});

	// ลำดับแถว
	function updateRowNumbers() {
		$("#expense-table tbody tr").each(function (index) {
			$(this)
				.find("td:first")
				.text(index + 1);
		});
	}

	$("#expense-table").on("input", "tbody input", calculateTotals);

	function calculateTotals() {
		let totalAmount = 0;
		$("#expense-table tbody tr").each(function () {
			const cost =
				parseFloat($(this).find("input[name='cost[]']").val()) || 0;
			totalAmount += cost;
		});
		console.log(totalAmount);
		$("#actual-cost").val(totalAmount).trigger("input");
	}

	// ลบ class error เมื่อผู้ใช้กรอกข้อมูล
	$(document).on("input change", "input.input-error", function () {
		$(this).removeClass("input-error");
	});

	calculateTotals();
});

// --------- OUTSIDE ASYNC FUNCTIONS ---------
function getDataEmp(empcode) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${host}gpform/GP-ENT/main/getDataEmp`,
			method: "POST",
			data: { empcode },
			dataType: "json",
			success: resolve,
			error: function (_, __, error) {
				reject(error);
			},
		});
	});
}
