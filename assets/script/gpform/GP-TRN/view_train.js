console.log("✅ view_train.js loaded");
console.log("version =", "OMG V1.4");

import { redirectWebflow } from "@amec/webasset/form";
import { doaction, createForm, showflow } from "@amec/webasset/api/webform";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { host } from "../../utils.js";
import Swal from "sweetalert2";

$(document).ready(async function () {
	const exdata = $("#txt_exdata").val();
	const getCost = parseFloat($("#txt_sumcost").val() || 0);

	const vat = getCost * 0.07;
	const sumCost = getCost + vat;

	if (exdata === "12" && sumCost > 0) {
		// เงื่อนไขแรก: exdata=12 และ sum_cost > 0
		$("#btnApprove_fin").show();
		$("#btn-submit").hide();
	} else {
		// ไม่เข้าเงื่อนไขแรก → ใช้ปุ่มปกติ
		$("#btnApprove_fin").hide();
		$("#btn-submit").show();
	}

	// init date picker
	flatpickr("#start-date", { dateFormat: "Y-m-d" });

	// ────────────────────────────────────────────────
	// 🕒 สร้าง dropdown เวลา
	// ────────────────────────────────────────────────
	function populateTimeSelects() {
		const hourSelects = ["#viewTimeFromHour", "#viewTimeToHour"];
		const minuteSelects = ["#viewTimeFromMin", "#viewTimeToMin"];

		for (let h = 0; h < 24; h++) {
			const val = String(h).padStart(2, "0");
			hourSelects.forEach((sel) => {
				$(sel).append(new Option(val, val));
			});
		}

		for (let m = 0; m < 60; m += 5) {
			const val = String(m).padStart(2, "0");
			minuteSelects.forEach((sel) => {
				$(sel).append(new Option(val, val));
			});
		}

		$("#viewTimeFromHour").val($("#viewTimeFromHour").attr("value"));
		$("#viewTimeFromMin").val($("#viewTimeFromMin").attr("value"));
		$("#viewTimeToHour").val($("#viewTimeToHour").attr("value"));
		$("#viewTimeToMin").val($("#viewTimeToMin").attr("value"));
	}

	// ────────────────────────────────────────────────
	// 💰 คำนวณ VAT
	// ────────────────────────────────────────────────
	$(document).on("input", "#viewAmountInput", function () {
		const cost = parseFloat($(this).val()) || 0;
		const vat = (cost * 1.07).toFixed(2);
		$("#viewVatResult")
			.text(vat)
			.removeClass("hidden")
			.addClass("font-bold text-indigo-600 text-lg whitespace-nowrap");
	});

	// ────────────────────────────────────────────────
	// ✳ Dynamic Rows
	// ────────────────────────────────────────────────

	function resetRowNumbers(id) {
		$(`#${id} tbody tr`).each(function (i) {
			$(this)
				.find("td:first")
				.text(i + 1);
		});
	}

	$("#btnAddObjective").on("click", function () {
		const tbody = $("#tblObjective tbody");
		const count = tbody.find("tr").length + 1;
		tbody.append(`
            <tr>
                <td class="text-blue-600 p-2 border text-center font-semibold">${count}</td>
                <td class="p-2 border">
                    <input type="text" class="input input-bordered w-full objective-input" maxlength="200">
                </td>
                <td class="p-2 text-center border">
                    <button type="button" class="btn btn-sm bg-red-500 text-white btnDelObjective">−</button>
                </td>
            </tr>
        `);
	});

	$(document).on("click", ".btnDelObjective", function () {
		const tbody = $("#tblObjective tbody");
		if (tbody.find("tr").length <= 1) {
			Swal.fire({ icon: "warning", title: "⚠ ต้องมีอย่างน้อย 1 รายการ" });
			return;
		}
		$(this).closest("tr").remove();
		resetRowNumbers("tblObjective");
	});

	$("#btnAddBenefit").on("click", function () {
		const tbody = $("#tblBenefit tbody");
		const count = tbody.find("tr").length + 1;
		tbody.append(`
            <tr>
                <td class="text-blue-600 p-2 border text-center font-semibold">${count}</td>
                <td class="p-2 border">
                    <input type="text" class="input input-bordered w-full benefit-input" maxlength="200">
                </td>
                <td class="p-2 text-center border">
                    <button type="button" class="btn btn-sm bg-red-500 text-white btnDelBenefit">−</button>
                </td>
            </tr>
        `);
	});

	$(document).on("click", ".btnDelBenefit", function () {
		const tbody = $("#tblBenefit tbody");
		if (tbody.find("tr").length <= 1) {
			Swal.fire({ icon: "warning", title: "⚠ ต้องมีอย่างน้อย 1 รายการ" });
			return;
		}
		$(this).closest("tr").remove();
		resetRowNumbers("tblBenefit");
	});

	// ────────────────────────────────────────────────
	// 📅 ตรวจสอบวันที่
	// ────────────────────────────────────────────────
	$(document).on("change", "#viewDateFrom, #viewDateTo", function () {
		const from = new Date($("#viewDateFrom").val());
		const to = new Date($("#viewDateTo").val());

		if ($("#viewDateFrom").val() && $("#viewDateTo").val() && to < from) {
			Swal.fire({
				icon: "warning",
				title: "⚠ กรุณาเลือกวันที่ให้ถูกต้อง",
			});
			$("#viewDateTo").val("").focus();
		}
	});

	populateTimeSelects();

	// Load flow
	const formData = $(".form-data").data();
	const flow = await showflow({
		NFRMNO: formData.nfrmno,
		VORGNO: formData.vorgno,
		CYEAR: formData.cyear,
		CYEAR2: formData.cyear2,
		NRUNNO: formData.nrunno,
	});
	$(".flow").html(flow.html);

	// ------------------------------------------------------------------
	// 🔹 Approve / Reject / Return
	// ------------------------------------------------------------------
	$(".btn-submit").on("click", async function () {
		const action = $(this).data("action");
		const exdata = $("#txt_exdata").val();
		const remark = $("#txt_remark").val()?.trim() || "";
		if ((action === "reject" || action === "returnE") && !remark) {
			Swal.fire({
				icon: "warning",
				title: "⚠ กรุณากรอก Remark ก่อนทำรายการ",
			});
			return;
		}

		try {
			console.log("ACTION =>", action, typeof action);
			console.log("EMPNO =>", formData.empno, typeof formData.empno);
			const result = await doaction({
				NFRMNO: String(formData.nfrmno),
				VORGNO: String(formData.vorgno),
				CYEAR: String(formData.cyear),
				CYEAR2: String(formData.cyear2),
				NRUNNO: String(formData.nrunno),
				ACTION: action,
				EMPNO: String(formData.empno),
				REMARK: remark,
				CEXTDATA: "19",
			});

			if (exdata === "12" && action === "approve") {
				const confirmResult = await Swal.fire({
					icon: "question",
					title: "ยืนยันการทำรายการ",
					html: "ต้องการ Approve และ บันทึกไปที่ Training Record ใช่หรือไม่ ?",
					showCancelButton: true,
					confirmButtonText: "ยืนยัน",
					cancelButtonText: "ยกเลิก",
				});

				if (!confirmResult.isConfirmed) return;

				const formData = $(".form-data").data();
				let allRows = [];
				let items_for_detail = [];
				for (const row of $(".cash-row")) {
					const $row = $(row);
					const nfrmno = $row.data("nfrmno");
					const vorgno = $row.data("vorgno");
					const cyear = $row.data("cyear");
					const cyear2 = $row.data("cyear2");
					const nrunno = $row.data("nrunno");

					items_for_detail.push({
						NFRMNO: String(nfrmno),
						VORGNO: String(vorgno),
						CYEAR: String(cyear),
						CYEAR2: String(cyear2),
						NRUNNO: String(nrunno),
					});

					allRows.push(`CYEAR2: ${cyear2} — NRUNNO: ${nrunno}`);
				}

				//Form Finsish -> Insert to Training Record
				await fetch(
					`${host}gpform/GP-TRN/training/add_to_training_record`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							itemsx: items_for_detail,
						}),
					}
				);
			}

			if (result?.status) {
				Swal.fire({
					icon: "success",
					title: "ดำเนินการสำเร็จแล้ว",
					timer: 1500,
					showConfirmButton: false,
				});
				console.log("go action =", "add_to_training_record 4");
				redirectWebflow();
			} else {
				Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
			}

			console.log("go action =", "add_to_training_record 4");
			redirectWebflow();
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "ไม่สามารถเชื่อมต่อระบบได้ =>".err.message,
			});
		}
	});

	// ------------------------------------------------------------------
	// 🔹 exdata = 12 logic
	// ------------------------------------------------------------------
	if (exdata === "12") {
		const $btnFin = $("#btnApprove_fin");
		const $btnNormal = $("#btn-submit");
		if (sumCost === 0) {
			$btnFin.hide();
			$btnNormal.css("display", "inline-flex");
			return;
		}

		// sum > 0 → หา WAIT
		let hasWait = false;
		$(".cash-row").each(function () {
			if ($(this).data("status") === "WAIT") hasWait = true;
		});

		if (hasWait) {
			$btnFin
				.prop("disabled", true)
				.addClass("opacity-50 cursor-not-allowed bg-gray-400")
				.removeClass("bg-blue-600 hover:bg-blue-700")
				.text("⚠ รอ Approve รายการในกลุ่มให้ครบก่อน");
		}
	}

	// ------------------------------------------------------------------
	// Delete File
	// ------------------------------------------------------------------
	window.confirmDelete = function (filename, cyear2, nrunno, type_att, id) {
		Swal.fire({
			icon: "warning",
			html: `
                <b>ต้องการลบไฟล์</b><br>
                <span class="text-red-600">${filename}</span>
            `,
			showCancelButton: true,
			confirmButtonText: "ลบไฟล์",
			cancelButtonText: "ยกเลิก",
		}).then((res) => {
			if (res.isConfirmed)
				deleteAttachment(filename, cyear2, nrunno, type_att, id);
		});
	};

	window.deleteAttachment = function (
		filename,
		cyear2,
		nrunno,
		type_att,
		id
	) {
		const baseUrl = host.endsWith("/") ? host : host + "/";
		$.post(`${baseUrl}gpform/GP-TRN/training/delete_attachment`, {
			filename,
			cyear2,
			nrunno,
			type_att,
			id,
		})
			.done(() => {
				Swal.fire({
					icon: "success",
					title: "ลบไฟล์สำเร็จ",
					timer: 1200,
					showConfirmButton: false,
				});
				location.reload();
			})
			.fail(() =>
				Swal.fire({ icon: "error", title: "ไม่สามารถลบไฟล์ได้" })
			);
	};

	// ------------------------------------------------------------------
	// 🔹 TEST Approve (btn-test-submit)
	// ------------------------------------------------------------------
	$(".btn-test-submit").on("click", async function () {
		const cyearx = $("#txt_year_text").val();
		const formno = $("#txt_form_text").val();
		const empTest = $("#txt_emp_text").val();
		const resultx = await doaction({
			NFRMNO: "15",
			VORGNO: "030101",
			CYEAR: "25",
			CYEAR2: cyearx,
			NRUNNO: formno,
			ACTION: "approve",
			EMPNO: empTest,
			REMARK: "",
		});

		if (resultx?.status) {
			Swal.fire({
				icon: "success",
				title: "ดำเนินการสำเร็จ",
				text: "Action: Approve",
				timer: 1500,
				showConfirmButton: false,
			});
		} else {
			Swal.fire({
				icon: "error",
				title: "เกิดข้อผิดพลาด",
				text: resultx?.message || "ไม่สามารถดำเนินการได้",
			});
		}
	});

	// ------------------------------------------------------------------
	// btn-last-submit : STEP 1 (approve all) + STEP 2 (create cash form)
	//                  + STEP 3 (send all rows to create_cash_adv)
	// ------------------------------------------------------------------
	$(".btn-last-submit").on("click", async function () {
		const subject = $("#viewTrainingSubject").val();
		const confirmResult = await Swal.fire({
			icon: "question",
			title: "ยืนยันการทำรายการ",
			html: "ต้องการ Approve และสร้าง Cash Advance ใช่หรือไม่ ?",
			showCancelButton: true,
			confirmButtonText: "ยืนยัน",
			cancelButtonText: "ยกเลิก",
		});

		if (!confirmResult.isConfirmed) return;
		// =============================================================
		// 1) APPROVE ทุกแถวผ่าน doaction
		// =============================================================
		const formData = $(".form-data").data();
		let allRows = [];
		let items_for_detail = [];

		for (const row of $(".cash-row")) {
			const $row = $(row);
			const nfrmno = $row.data("nfrmno");
			const vorgno = $row.data("vorgno");
			const cyear = $row.data("cyear");
			const cyear2 = $row.data("cyear2");
			const nrunno = $row.data("nrunno");

			// เก็บข้อมูลไว้ส่งต่อให้ create_cash_adv
			items_for_detail.push({
				NFRMNO: String(nfrmno),
				VORGNO: String(vorgno),
				CYEAR: String(cyear),
				CYEAR2: String(cyear2),
				NRUNNO: String(nrunno),
			});

			allRows.push(`CYEAR2: ${cyear2} — NRUNNO: ${nrunno}`);

			const res = await doaction({
				NFRMNO: String(formData.nfrmno),
				VORGNO: String(formData.vorgno),
				CYEAR: String(formData.cyear),
				CYEAR2: String(cyear2),
				NRUNNO: String(nrunno),
				ACTION: "approve",
				EMPNO: String(formData.empno),
				REMARK: $("#txt_remark").val() || "",
				CEXTDATA: "19",
			});

			if (!res?.status) {
				Swal.fire({
					icon: "error",
					title: "เกิดข้อผิดพลาด",
					text: `Approve ไม่สำเร็จ NRUNNO = ${nrunno}`,
				});
				return;
			}
		}

		// =============================================================
		// 2) CREATE FORM CASH ADV (HEAD)
		// =============================================================
		const payload_cash = {
			NFRMNO: "4",
			VORGNO: "080101",
			CYEAR: "13",
			REQBY: String(formData.empno),
			INPUTBY: String(formData.empno),
			REMARK: "",
		};
		const headcash = await createForm(payload_cash);
		const headData_cash = headcash.data || {};
		const payload_clear = {
			NFRMNO: "6",
			VORGNO: "080101",
			CYEAR: "13",
			REQBY: String(formData.empno),
			INPUTBY: String(formData.empno),
			REMARK: "",
		};
		const headclear = await createForm(payload_clear);
		const headData_clear = headclear.data || {};

		// =============================================================
		// 3) ส่งข้อมูลทั้งหมดไป controller: create_cash_adv
		// =============================================================

		await fetch(`${host}gpform/GP-TRN/training/create_cash_adv`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				itemsx: items_for_detail, // list ของ CYEAR2 + NRUNNO
				cashHead: {
					NFRMNO: headData_cash.NFRMNO,
					VORGNO: headData_cash.VORGNO,
					CYEAR: headData_cash.CYEAR,
					CYEAR2: headData_cash.CYEAR2,
					NRUNNO: headData_cash.NRUNNO,
					SUMCOST: sumCost,
					SUBJECT: subject,
				},
				clearHead: {
					NFRMNO: headData_clear.NFRMNO,
					VORGNO: headData_clear.VORGNO,
					CYEAR: headData_clear.CYEAR,
					CYEAR2: headData_clear.CYEAR2,
					NRUNNO: headData_clear.NRUNNO,
				},
			}),
		});

		// =============================================================
		// 4) แสดงผลรายการทั้งหมด
		// =============================================================
		Swal.fire({
			icon: "success",
			title: "สร้าง Cash Advance สำเร็จ",
			html: allRows.join("<br>"),
			timer: 2000,
			showConfirmButton: false,
		});

		redirectWebflow();
	});
});
