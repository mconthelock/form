import { doaction, showflow } from "@amec/webasset/api/webform";
import { redirectWebflow } from "@amec/webasset/form";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

import { host } from "../../utils.js";
import Swal from "sweetalert2";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { searchUser } from "@amec/webasset/api/amec";
import { s2disableSearch, s2opt, setSelect2 } from "@amec/webasset/select2";
import { dayOff } from "@amec/webasset/flatpickr";
import select2 from "select2";
import "select2/dist/css/select2.min.css";
select2();

$(document).ready(async function () {

	const formData = $(".form-data").data();
	const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
	const GUEST_MAX = 100,
		AMEC_MAX = 100;

	// -------- Initialize Flatpickr --------
	const entertainPicker = flatpickr("#entertain-date", {
		dateFormat: "Y-m-d",
		minDate: "today",
	});

	const payablePicker = flatpickr("#payable-date", {
		dateFormat: "Y-m-d",
		minDate: "today",
	});

	// Icon triggers
	$("#entertain-date-icon").on("click", function () {
		entertainPicker.open();
	});
	$("#payable-date-icon").on("click", function () {
		payablePicker.open();
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

	// -------- Urgent Case Attachment Logic --------
	function checkUrgentCase() {
		const selectedDate = new Date($("#entertain-date").val());
		const today = new Date();
		const urgentAttachmentDiv = $("#urgent-attachment");
		const urgentNoteDiv = $("#urgent-note");
		const urgentFile = $("#urgent-file");

		// Reset time part for accurate day calculation
		selectedDate.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);

		if (isNaN(selectedDate.getTime())) {
			urgentAttachmentDiv.addClass("hidden");
			urgentNoteDiv.addClass("hidden");
			return;
		}

		// Calculate working days
		let workingDays = 0;
		let currentDate = new Date(today);
		currentDate.setDate(currentDate.getDate() + 1); // Start counting from tomorrow

		// Helper to format date as YYYY-M-D to match dayOff.value format
		const formatDate = (date) => {
			return `${date.getFullYear()}-${date.getMonth() + 1
				}-${date.getDate()}`;
		};

		// If selected date is in the past, workingDays remains 0
		while (currentDate <= selectedDate) {
			const dateString = formatDate(currentDate);
			// Check if it is a day off (weekend or holiday included in dayOff.value)
			if (dayOff && dayOff.value && !dayOff.value.includes(dateString)) {
				workingDays++;
			} else if (!dayOff || !dayOff.value) {
				// Fallback if dayOff is not available: exclude weekends
				const dayOfWeek = currentDate.getDay();
				if (dayOfWeek !== 0 && dayOfWeek !== 6) {
					workingDays++;
				}
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}

		if (workingDays < 5) {
			urgentAttachmentDiv.removeClass("hidden");
			urgentNoteDiv.removeClass("hidden");
		} else {
			urgentAttachmentDiv.addClass("hidden");
			urgentNoteDiv.addClass("hidden");
			urgentFile.val(""); // Clear file if hidden
		}
	}

	$("#entertain-date").on("change", checkUrgentCase);

	// Check on page load
	checkUrgentCase();

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
			alert("ไม่พบรหัส พนักงาน");
			return;
		}
		if (amecCount() >= AMEC_MAX) return;
		$("#amec-list").append(
			`<li class="flex items-center justify-between gap-2 border border-blue-200 bg-blue-50 shadow-sm rounded-lg px-3 py-1">
        <span data-empno="${empData[0].SEMPNO}">${empData[0].SEMPPRE ?? ""} ${empData[0].SNAME
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
		if (e.key === "Enter") addGuest();
	});
	$("#amec-name-input").keydown((e) => {
		if (e.key === "Enter") addAmec();
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

	// Initial counts
	updateCount("guest");
	updateCount("amec");
	validateAmecLimit();

	// -------- Cost Table Calculation --------
	$("tbody input").on("input", calculateTotals);

	if ($("#emp_select").length) {
		$("#emp_select").select2();

		const employees = await searchUser({ CSTATUS: "1" });

		const participants = await $.ajax({
			type: "POST",
			url: host + "gpform/GP-ENT/main/getamecParticipants",
			data: {
				nfrmno: nfrmno,
				vorgno: vorgno,
				cyear: cyear,
				cyear2: cyear2,
				nrunno: nrunno
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

	// console.log(activeEmployees);
	function toggleGuestTypeSection() {
		const val = $("input[name='time']:checked").val();
		console.log(val);
		if (val === "Gift" || val === "Other") {
			$("#guest-type-section").hide();
			$(".guest_type").prop("checked", false);
		} else {
			$("#guest-type-section").show();
		}
	}

	// เวลาเปลี่ยนค่า radio time ให้เรียก toggle
	$("input[name='time']").on("change", toggleGuestTypeSection);

	// โหลดหน้า edit ครั้งแรก ต้องเช็คด้วย
	toggleGuestTypeSection();

	const modal = document.getElementById("my_modal_1");
	if (modal) {
		modal.showModal();
	}



	const flow = await showflow(
		{
			NFRMNO: nfrmno,
			VORGNO: vorgno,
			CYEAR: cyear,
			CYEAR2: cyear2,
			NRUNNO: nrunno,
			showStep: true
		}
	);
	$(".flow").html(flow.html);

	$(".btn-submit").click(async function () {
		const action = $(this).data("action");
		const remark_approve = $("#remark_approve").val();
		const cstepno = $(".cstepno").val();
		const cstepnextno = $(".cstepnextno").val();
		const $pay = $("#pay_date");

		if (action === "reject" && !String(remark_approve || "").trim()) {
			alert("กรุณากรอก Remark");
			$("#remark_approve").focus();
			return;
		}

		let approveRemark = "";
		let acceptStatus = "";

		// เงื่อนไขใหม่: ถ้ามี #emp_select และ action = approve
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

		if ($("input[name='accept']").length > 0) {
			const acceptval = $("input[name='accept']:checked").val();
			const acceptStatus = $("input[name='accept']:checked").attr("id");
			const acceptRemark = $("#accept_remark").val();
			const notAcceptRemark = $("#notaccept_remark").val();

			if (!acceptStatus) {
				alert("กรุณาเลือก Accept หรือ Not Accept");
				return;
			}

			if (acceptStatus === "notaccept" && !notAcceptRemark.trim()) {
				alert("กรุณากรอก Remark กรณี Not Accept");
				$("#notaccept_remark").focus();
				return;
			}

			approveRemark =
				acceptStatus === "accept" ? acceptRemark : notAcceptRemark;

			if (action === "approve") {
				await $.ajax({
					type: "post",
					url: host + "gpform/GP-ENT/main/UpdateApprove",
					data: {
						nfrmno,
						vorgno,
						cyear,
						cyear2,
						nrunno,
						approveRemark,
						acceptval,
					},
					success: function (response) {
						console.log(response);
					},
					error: function (xhr) {
						console.log(xhr);
					},
				});
			}
			// ... และ logic อื่นๆ ต่อได้เลย
		}

		if ($pay.length && !$pay.val() && action === "approve") {
			alert("กรุณาเลือกวันที่ Pay Date");
			$pay.focus();
			return; // ออกจาก handler ไม่เรียก doaction()
		}

		if ($pay.val() && action === "approve") {
			await $.post(host + "gpform/GP-ENT/main/UpdatePayDate", {
				nfrmno,
				vorgno,
				cyear,
				cyear2,
				nrunno,
				pay_date: $pay.val(),
			});
		}

		// if (action === "approve" && cstepno === "19" && cstepnextno === "18") {
		// 	$.getJSON(host + "gpform/GP-ENT/main/sendMailToApprover", {
		// 		nfrmno,
		// 		vorgno,
		// 		cyear,
		// 		cyear2,
		// 		nrunno,
		// 	})
		// 		.done(console.log)
		// 		.fail(console.log);
		// }

		if (action === "return") {
			$.ajax({
				type: "POST",
				url: `${host}gpform/GP-ENT/main/returnAction`,
				data: {
					nfrmno,
					vorgno,
					cyear,
					cyear2,
					nrunno,
				},
				dataType: "json",
				success: function (response) {
					console.log(response);
				},
			});
		}

		const confirm = await doaction(
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
		if (confirm.status) redirectWebflow();
	});

	$("input[name='accept']").on("change", function () {
		console.log($(this).val());
		if ($(this).val() === "1") {
			$("#accept_remark").prop("disabled", false);
			$("#notaccept_remark").prop("disabled", true);
		} else {
			$("#accept_remark").prop("disabled", true);
			$("#notaccept_remark").prop("disabled", false);
		}
	});

	$("#submit-btn-edit").click(async function (e) {
		e.preventDefault();
		let type = $("input[name='time']:checked").val();
		let oldType = $("#old-type").val();
		let guestType = $(".guest_type:checked").val();
		let giftMemo = $("#gift-memo-file")[0]?.files?.length || 0;
		let otherMemo = $("#other-memo-file")[0]?.files?.length || 0;

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

		// Urgent case validation
		if (!$("#urgent-attachment").hasClass("hidden")) {
			const uf = $("#urgent-file")[0];
			const hasCurrentUrgentFile = $("#urgent-attachment a").length > 0;
			const hasNewUrgentFile = uf && uf.files.length > 0;
			if (!hasCurrentUrgentFile && !hasNewUrgentFile) {
				return showInputToast(
					"#urgent-file",
					"กรุณาแนบไฟล์ Memo (Urgent Case)"
				);
			}
		}

		if ($("#purpose").val().trim() === "")
			return showInputToast(
				"#purpose",
				"กรุณาเลือกเหตุผลสำหรับ Entertain"
			);

		if (!$("input[name='time']:checked").val())
			return showRadioToast("input[name='time']", "กรุณาเลือกช่วงเวลา");

		// บังคับตามประเภทเวลา
		const timeVal = $("input[name='time']:checked").val();
		if (timeVal === "Gift") {
			const gf = $("#gift-memo-file")[0];
			const hasCurrentGiftFile = $("#gift-memo a").length > 0;
			const hasNewGiftFile = gf && gf.files.length > 0;
			if (!hasCurrentGiftFile && !hasNewGiftFile) {
				return showInputToast(
					"#gift-memo-file",
					"กรุณาแนบ Memo (Gift)"
				);
			}
			// Payable date is required when Gift
			if ($("#payable-date").val().trim() === "") {
				return showInputToast(
					"#payable-date",
					"กรุณาเลือก Payable Date"
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
			const hasCurrentOtherFile = $("#other-fields a").length > 0;
			const hasNewOtherFile = of && of.files.length > 0;
			if (!hasCurrentOtherFile && !hasNewOtherFile) {
				return showInputToast(
					"#other-memo-file",
					"กรุณาแนบ Memo (Other)"
				);
			}
		}

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

		// --- Memo file required if memo section is visible ---
		if ($("#attach-memo-section").is(":visible")) {
			var memoFileInput = $("#file-memo")[0];
			var hasCurrentMemoFile =
				$(".current-memo-file").is(":visible") &&
				$(".current-memo-file a").length > 0;
			var hasNewMemoFile =
				memoFileInput && memoFileInput.files.length > 0;

			if (!hasCurrentMemoFile && !hasNewMemoFile) {
				showInputToast("#file-memo", "กรุณาแนบไฟล์ Memo");
				return;
			}
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

		// ลบ error class เมื่อมีการเปลี่ยนแปลง
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

		if (timeVal !== "Gift" && timeVal !== "Other") {
			if (!$(".guest_type:checked").val()) {
				return showCheckboxToast(
					".guest_type",
					"กรุณาเลือก Guest Type"
				);
			}
		}

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
				return false; // Break .each loop
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

		if (!$(".cash_adv:checked").val()) {
			showCheckboxToast(".cash_adv", "กรุณาเลือก Cash Advance");
			return;
		}

		// --- Participant validation ---
		if (guestCount() < 1)
			return showInputToast(
				"#guest-name-input",
				"กรุณากรอก guest อย่างน้อง 1 คน"
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

		// --- Collect Data ---
		let formData = new FormData();
		const isLocationVisible = $("#div_location").is(":visible");

		formData.append("nfrmno", nfrmno);
		formData.append("vorgno", vorgno);
		formData.append("cyear", cyear);
		formData.append("input_by", $("#input-by").val());
		formData.append("requested_by", $("#requested-by").val());
		formData.append("entertain_date", $("#entertain-date").val());

		// Attach Urgent File if visible and provided
		if (!$("#urgent-attachment").hasClass("hidden")) {
			const uf = $("#urgent-file")[0];
			if (uf && uf.files.length > 0) {
				formData.append("urgent_file", uf.files[0]);
			}
		}

		formData.append("purpose", $("#purpose").val());
		formData.append("time", timeVal);
		formData.append(
			"location",
			isLocationVisible
				? $("input[name='location']:checked").val() || ""
				: ""
		);
		formData.append(
			"location_detail",
			isLocationVisible ? $("#location_detail").val() : ""
		);
		formData.append("guest_type", $(".guest_type:checked").val() || "");
		formData.append("entertain_budget", $("#entertain-budget").val());
		formData.append("total_amount", $("#total-amount").text());
		formData.append(
			"remark",
			$("textarea[placeholder*='ระบุเหตุผล']").val()
		);
		formData.append("companies", JSON.stringify(companiesArray));
		formData.append("cash_adv", $(".cash_adv:checked").val() || "");
		formData.append("other_details", $("#other-details").val() || "");
		companiesArray.forEach((c, i) => {
			let fileInput = $("#companies-container .company-group")
				.eq(i)
				.find('input[type="file"]')[0];
			if (fileInput && fileInput.files.length > 0) {
				formData.append(`company_files[${i}]`, fileInput.files[0]);
			}
		});

		if (timeVal === "Gift") {
			const gf = $("#gift-memo-file")[0];
			if (gf && gf.files.length > 0) {
				formData.append("file_memo_gift", gf.files[0]);
			} else if ($("#gift-memo a").length) {
				// ใช้ไฟล์เดิมถ้าไม่มีการเปลี่ยน
				formData.append("file_memo_gift_old", $("#gift-memo a").text());
			}
			// Include payable date when Gift
			formData.append("payable_date", $("#payable-date").val() || "");
		}

		// --- Other memo ---
		if (timeVal === "Other") {
			const of = $("#other-memo-file")[0];
			if (of && of.files.length > 0) {
				formData.append("file_memo_other", of.files[0]);
			} else if ($("#other-fields a").length) {
				formData.append(
					"file_memo_other_old",
					$("#other-fields a").text()
				);
			}
		}

		// แนบไฟล์ Memo ถ้ามี
		if ($("#attach-memo-section").is(":visible")) {
			var memoFileInput = $("#file-memo")[0];
			if (memoFileInput && memoFileInput.files.length > 0) {
				formData.append("file_memo", memoFileInput.files[0]);
			}
		}

		// Attach Visitor Notice file if provided
		const vn = $("#visitor-notice")[0];
		if (vn && vn.files.length > 0) {
			formData.append("visitor_notice", vn.files[0]);
		}

		// แนบไฟล์
		// if ($("#file-attachment2")[0].files.length > 0) formData.append("file2", $("#file-attachment2")[0].files[0]);

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
			console.log(details);
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
			url: host + "gpform/GP-ENT/main/Update",
			data: formData,
			processData: false,
			contentType: false,
			beforeSend: function () {
				$("#loading-overlay").show();
			},
			success: async function (response) {
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

				const action = "approve";

				const confirm = await doaction(
					{
						NFRMNO: nfrmno,
						VORGNO: vorgno,
						CYEAR: cyear,
						CYEAR2: cyear2,
						NRUNNO: nrunno,
						ACTION: action,
						EMPNO: empno
					}
				);
				if (confirm.status) redirectWebflow();
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

	function toggleFieldsByTime() {
		const timeVal = $("input[name='time']:checked").val();

		// ค่าเริ่มต้น: แสดง GT และ Location, ซ่อน Payable Date
		$("#gift-memo, #other-fields, #payable-date-section").hide();
		$("#div_gt").show();
		$("#div_location").show();
		$("input[name='location']").prop("disabled", false);
		$("#location_detail").prop("disabled", false);

		if (timeVal === "Gift") {
			$("#gift-memo").show();
			$("#payable-date-section").show();
			$("#div_gt").hide();
			$("#div_location").hide();
			// ล้างค่า/ปิดการใช้งาน Location เมื่อซ่อน
			$("input[name='location']")
				.prop("checked", false)
				.prop("disabled", true);
			$("#location_detail").val("").prop("disabled", true);
			return;
		}

		if (timeVal === "Other") {
			$("#other-fields").show();
			$("#div_gt").hide();
			$("#div_location").hide();
			$("input[name='location']")
				.prop("checked", false)
				.prop("disabled", true);
			$("#location_detail").val("").prop("disabled", true);
			// hide payable date for non-gift
			$("#payable-date-section").addClass("hidden");
			$("#payable-date").removeClass("input-error").val("");
			return;
		}

		// เคสปกติ: Lunch/Dinner
		if (timeVal === "Dinner") {
			$("#location-inside").prop("disabled", true);
			$("#location-outside").prop("checked", true);
			$("#location_detail").prop("disabled", false).focus();
		} else {
			$("#location-inside").prop("disabled", false);
			// hide payable date for non-gift
			$("#payable-date-section").addClass("hidden");
			$("#payable-date").removeClass("input-error").val("");
		}
	}

	// ✅ เรียกใช้เมื่อมีการเปลี่ยนค่า time
	$(document).on("change", "input[name='time']", toggleFieldsByTime);

	// ✅ เรียกใช้ตอนโหลดหน้าเพื่อแสดงฟิลด์ตามค่าที่บันทึกไว้
	toggleFieldsByTime();

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
		console.log(inputId);
		$("#" + inputId).removeClass("input-error");
	};

	$(
		"#input-by, #requested-by, #entertain-date, #payable-date, #purpose, #location_detail, #file-attachment2, #guest-name-input, #amec-name-input, #remark"
	).on("input change", function () {
		clearFieldError(this.id);
	});

	$("#table_cost tbody tr td:eq(0) select").on("change", function () {
		$(this).removeClass("input-error");
	});

	$(".time-radio, input[name='time']").on("change", function () {
		$(".time-radio, input[name='time']")
			.removeClass("radio-error")
			.addClass("radio-primary");
	});

	$("input[name='location']").on("change", function () {
		$("input[name='location']")
			.removeClass("radio-error")
			.addClass("radio-primary");
	});

	$(".guest_type").on("change", function () {
		$(this).removeClass("checkbox-error").addClass("checkbox-primary");
	});

	$(".cash_adv").on("change input", function () {
		$(this).removeClass("checkbox-error").addClass("checkbox-primary");
	});

	$("#file-attachment2").on("change", function () {
		$("#alert-file2").addClass("hidden");
	});

	// -------- Company Section Management --------
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
		$newGroup.find(".current-file").hide();

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
});

// -------- Estimate type and quantity change handler --------
$(document).on("change input", ".estimate-type, .quantity", function () {
	const $row = $(this).closest("tr");
	const etCost = Number(
		$row.find(".estimate-type option:selected").data("cost")
	);
	const quantity = Number($row.find(".quantity").val());
	const $remark = $row.find(".remark");
	if (quantity > etCost) {
		$remark.prop("disabled", false);
		$remark.addClass("input-error");
	} else {
		$remark.prop("disabled", true);
		$remark.removeClass("input-error");
	}
	// Check if any row exceeds limit and toggle memo section
	let showMemo = false;
	$("#table_cost tbody tr").each(function () {
		const etCostRow = Number(
			$(this).find(".estimate-type option:selected").data("cost")
		);
		const quantityRow = Number($(this).find(".quantity").val());
		if (quantityRow > etCostRow) {
			showMemo = true;
			return false; // break loop
		}
	});
	if (showMemo) {
		$("#attach-memo-section").show();
	} else {
		$("#attach-memo-section").hide();
	}
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

function calculateTotals() {
	let totalAmount = 0;
	$("#table_cost tbody tr").each(function () {
		const qty = Number($(this).find("td:eq(1) input").val()) || 0;
		const cost = Number($(this).find("td:eq(2) input").val()) || 0;
		const total = qty * cost;
		$(this)
			.find("td:eq(3) input")
			.val(total || "");
		totalAmount += total;
	});
	$("#total-amount").text(totalAmount);
}
