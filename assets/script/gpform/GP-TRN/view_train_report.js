console.log("✅ view_train_report.js loaded (OMG V1.1)");

import { redirectWebflow } from "@amec/webasset/form";
import { doaction, showflow } from "@amec/webasset/api/webform";
import { host } from "../../utils.js";
import Swal from "sweetalert2";

$(document).ready(async function () {
	console.log("view_train_report.js : version =", "OMG V2");
	const fd = $(".form-data").data();
	const nfrmno = fd.nfrmno;
	const vorgno = fd.vorgno;
	const cyear = fd.cyear;
	const cyear2 = fd.cyear2;
	const nrunno = fd.nrunno;
	const empno = fd.empno;
	const exdata = $("#txt_exdata").val();
	const trainee_pos = $("#txt_trainee_pos").val();
	const trainee_pos_x = parseInt(trainee_pos, 10);

	/* ============================================================
       🔄 Load Flow
    ============================================================ */
	try {
		const flow = await showflow({NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: nrunno});
		$(".flow").html(flow.html);
	} catch (err) {
		console.error("❌ Error loading flow:", err);
	}

	/* ============================================================
       📨 Submit Action
    ============================================================ */
	$(".btnSubmit").on("click", async function (e) {
		e.preventDefault();
		if ($(this).prop("disabled")) return false;

		console.log("Start Submit Action");

		const content = $("#CONTENT").val()?.trim() || "";
		const apply = $("#APPLY").val()?.trim() || "";
		const fileInput = document.querySelector("input[name='txt_trn_att[]']");
		const hasFile = fileInput?.files?.length > 0;

		try {
			/* ============================================================
			CASE exdata === 99
			============================================================ */
			if (exdata === "99") {

				if (trainee_pos_x >= 55 && trainee_pos_x <= 69) {

					if (!hasFile) {
						return Swal.fire({
							icon: "warning",
							title: "⚠ กรุณาแนบไฟล์",
							text: "ตำแหน่งนี้ต้องแนบไฟล์เท่านั้น",
						});
					}

					const formData = new FormData();
					formData.append("mode", "upload");
					formData.append("frmno", nfrmno);
					formData.append("orgno", vorgno);
					formData.append("cyear", cyear);
					formData.append("cyear2", cyear2);
					formData.append("nrunno", nrunno);
					formData.append("exdata", exdata);

					for (let f of fileInput.files) {
						formData.append("txt_trn_att[]", f);
					}

					const res = await fetch(`${host}gpform/GP-TRNRP/trainingreport/handle_trnrp`, {
						method: "POST",
						body: formData,
					});

					const json = await res.json();
					if (!json?.status) throw json?.message || "Upload ไม่สำเร็จ";

				} else {

					if (!content || !apply) {
						return Swal.fire({
							icon: "warning",
							title: "⚠ กรอกข้อมูลไม่ครบ",
							text: "กรุณากรอกเนื้อหาและการประยุกต์ใช้งาน",
						});
					}

					const formData = new FormData();
					formData.append("mode", "update_only");
					formData.append("frmno", nfrmno);
					formData.append("orgno", vorgno);
					formData.append("cyear", cyear);
					formData.append("cyear2", cyear2);
					formData.append("nrunno", nrunno);
					formData.append("exdata", exdata);
					formData.append("content", content);
					formData.append("apply", apply);

					if (hasFile) {
						for (let f of fileInput.files) {
							formData.append("txt_trn_att[]", f);
						}
					}

					const res = await fetch(`${host}gpform/GP-TRNRP/trainingreport/handle_trnrp`, {
						method: "POST",
						body: formData,
					});

					const json = await res.json();
					if (!json?.status) throw json?.message || "บันทึกข้อมูลไม่สำเร็จ";
				}
			}

			/* ============================================================
			CASE exdata === 02
			============================================================ */
			else if (exdata === "02") {

				const checked = $("input[name='rd_manager_score']:checked");

				if (!checked.length) {
					await Swal.fire({
						icon: "warning",
						title: "กรุณาประเมินผล",
						text: "กรุณาเลือกผลการประเมินระดับความเข้าใจก่อนส่งฟอร์ม",
					});

					checked.first().closest(".border").get(0)
						?.scrollIntoView({ behavior: "smooth", block: "center" });

					return false;
				}

				const score = checked.val();
				const comment = $("#txt_manager_comment").val()?.trim() || "";

				const res = await fetch(`${host}gpform/GP-TRNRP/trainingreport/handle_trnrp`, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						mode: "manager_score",
						frmno: nfrmno,
						orgno: vorgno,
						cyear: cyear,
						cyear2: cyear2,
						nrunno: nrunno,
						exdata: exdata,
						score,
						comment,
					}),
				});

				const json = await res.json();
				if (!json?.status) throw json?.message || "บันทึกผลประเมินไม่สำเร็จ";
			}

			/* ============================================================
			Approve / Reject
			============================================================ */

			console.log("Step Approve/Reject");

			const action = $(this).data("action");
			const remark = "";

			if ((action === "reject" || action === "returnE") && !remark) {
				Swal.fire({
					icon: "warning",
					title: "⚠ กรุณากรอก Remark ก่อนทำรายการ",
				});
				return;
			}

			const result = await doaction({
				NFRMNO: String(nfrmno),
				VORGNO: String(vorgno),
				CYEAR: String(cyear),
				CYEAR2: String(cyear2),
				NRUNNO: String(nrunno),
				ACTION: action,
				EMPNO: String(empno),
				REMARK: remark,
			});

			if (result?.status) {
				Swal.fire({
					icon: "success",
					title: "ดำเนินการสำเร็จ",
					timer: 1500,
					showConfirmButton: false,
				});
				redirectWebflow();
			} else {
				Swal.fire({
					icon: "error",
					title: "เกิดข้อผิดพลาดในการ Apprve/Reject",
				});
			}

		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "เกิดข้อผิดพลาด",
				text: err,
			});
		}
	});

});
