import { host } from "../../utils.js";
import { createForm, redirectWebflow } from "@amec/webasset/form";
import Swal from "sweetalert2";

$(document).ready(function () {
	const formData = $(".form-data").data();
	const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

	/**
	 * Refactored renderTable using ES6+ and DaisyUI
	 * @param {Array} systems
	 */
	const renderTable = (systems = []) => {
		const $tbody = $("#systemsTable tbody");
		const $remarkDiv = $(".remark-div");

		// QC Check: ตรวจสอบข้อมูลว่างหรือ User เป็น 0 ทั้งหมด
		const isEmpty =
			!systems.length ||
			systems.every((s) => Number(s.total_users) === 0);

		if (isEmpty) {
			$tbody.html(`
            <tr>
                <td colspan="7" class="text-center py-16">
                    <div class="flex flex-col items-center opacity-40">
                        <i class="fa-solid fa-folder-open text-5-xl mb-3"></i>
                        <span class="text-xl font-medium">No systems found.</span>
                    </div>
                </td>
            </tr>
        `);
			$remarkDiv.hide();
			return;
		}

		const html = systems
			.map((system, sysIdx) => {
				const programs = system.programs || [{}];
				const rowspan = programs.length;

				// ดึง Unique NRUNNO ออกมาแบบกระชับ
				const uniqueForms = Array.from(
					new Map(
						programs
							.flatMap((p) => p.form_unmatch || [])
							.map((f) => [f.NRUNNO, f])
					).values()
				);

				return programs
					.map((program, progIdx) => {
						const isFirst = progIdx === 0;
						const borderClass =
							isFirst && sysIdx !== 0
								? "border-t-4 border-base-300"
								: "";

						// ข้อมูลตัวเลข (Robust parsing)
						const matched = parseInt(program.matched || 0);
						const unmatched = parseInt(program.unmatched || 0);
						const uncheck = parseInt(program.uncheck || 0);
						console.log(system);
						return `
                <tr class="hover ${borderClass} transition-all duration-200">
                    ${
						isFirst
							? `
                        <th rowspan="${rowspan}" class="bg-base-200/50 text-center text-lg font-black border-r border-base-300 w-12">${
									sysIdx + 1
							  }</th>
                        <td rowspan="${rowspan}" class="align-top p-4 border-r border-base-300 max-w-xs">
                            <div class="font-bold text-2xl text-primary mb-1">${
								system.main_system_name
							}</div>
                            <p class="text-xs text-base-content/70 leading-relaxed">Check consistency of user IDs and authorizations of user IDs accessible to ${
								system.main_system_name
							}</p>
                        </td>
                        <td rowspan="${rowspan}" class="align-top text-center p-4 border-r border-base-300">
                            <div class="stat p-0">
                                <div class="stat-value text-secondary text-2xl">${
									system.total_users
								}</div>
                                <div class="stat-desc font-bold text-secondary/60 uppercase">Users</div>
                            </div>
                        </td>
                        <td rowspan="${rowspan}" class="align-top p-4 border-r border-base-300 min-w-[140px]">

                            <div class=" p-0 text-center">
                                <div class="stat-value text-error text-2xl">${
									system.unmatched
								}</div>
                                <div class="stat-desc font-bold text-error/60 uppercase">Users</div>
                            </div>
                            <div class="flex flex-col mt-2 gap-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                ${uniqueForms
									.map(
										(form) => `
                                    <a target="_blank" href="http://amecwebtest.mitsubishielevatorasia.co.th/form/isform/IS-RGV/main/?no=7&orgNo=050601&y=25&y2=2025&runNo=${form.NRUNNO}"
                                       class="btn btn-xs btn-outline btn-info no-underline normal-case justify-start">
                                       Form No :  ${form.NRUNNO}
                                    </a>
                                `
									)
									.join("")}
                            </div>
                        </td>
                    `
							: ""
					}

                    <td class="p-4 border-b border-base-200">
                        <div class="flex flex-col gap-2">
                            <span class="font-bold text-sm text-base-content/80">${
								program.name || "-"
							}</span>
                            <div class="flex flex-wrap gap-1">
                                <div class="badge badge-success badge-outline text-[10px] py-2">Matched: ${
									matched + unmatched
								}</div>
                                <div class="badge badge-error badge-outline text-[10px] py-2">Unchecked: ${uncheck}</div>
                            </div>
                            <input type="hidden" name="programs[${
								program.program_id
							}][${program.name}][matched]" value="${matched}">
                            <input type="hidden" name="programs[${
								program.program_id
							}][${
							program.name
						}][unmatched]" value="${unmatched}">
                            <input type="hidden" name="programs[${
								program.program_id
							}][${program.name}][uncheck]" value="${uncheck}">
                        </div>
                    </td>

                    <td class="p-4 border-b border-base-200">
                        <div class="flex flex-col gap-2">
                            <div class="join w-full">
                                <input type="number" name="programs[${
									program.program_id
								}][${program.name}][delete_count]"
                                    class="input input-bordered input-sm join-item w-full focus:input-primary text-center"
                                    placeholder="Delete" min="0">
                                <input type="number" name="programs[${
									program.program_id
								}][${program.name}][change_count]"
                                    class="input input-bordered input-sm join-item w-full focus:input-primary text-center"
                                    placeholder="Change" min="0">
                            </div>
                        </div>
                    </td>

                    <td class="p-4 border-b border-base-200">
                        <textarea name="programs[${program.program_id}][${
							program.name
						}][detail_remark]"
                            class="textarea textarea-bordered textarea-sm w-full h-16 leading-tight focus:textarea-primary"
                            placeholder="ระบุ User IDs / เหตุผล..."></textarea>
                    </td>
                </tr>
            `;
					})
					.join("");
			})
			.join("");

		$tbody.html(html);
		$remarkDiv.fadeIn(300);
	};

	function loadSystemsTable(period = null, year = null) {
		$.ajax({
			url: host + "isform/IS-RGR/Main/getSummaryData",
			method: "POST",
			dataType: "json",
			data: {
				period: period,
				year: year,
			},
			success: function (response) {
				// Assuming response is an array of systems
				renderTable(response.systems || []);
				$("#remark-div").show();
			},
			error: function () {
				$("#systemsTable tbody").html(
					`<tr>
                <td colspan="7" class="text-center py-10 text-red-500">
                    <i class="fa-solid fa-triangle-exclamation mr-2"></i> Failed to load data.
                </td>
            </tr>`
				);
			},
		});
	}

	// Hide remark-div by default
	$(".remark-div").hide();
	// Show initial message in table body
	$("#systemsTable tbody").html(
		`<tr>
      <td colspan="7" class="text-center py-10 text-gray-400">
        <i class="fa-solid fa-hand-pointer mr-2"></i> กรุณาเลือกช่วงเวลาและปีที่ต้องการ
      </td>
    </tr>`
	);
	// Initial load (do not load data until period/year selected)

	// Optionally, reload table on period/year change
	$("#period, #year").on("change", function () {
		const period = $("#period").val();
		const year = $("#year").val();

		loadSystemsTable(period, year);
	});

	$("#reviewForm").on("submit", async function (e) {
		e.preventDefault();

		const formData = $(this).serializeArray();
		const period = $("#period").val();
		const fyear = $("#year").val();
		const remark = $("#remark").val().trim();
		const result = [];

		console.log(formData);

		let hasUncheck = false;

		formData.forEach(({ name, value }) => {
			const match = name.match(/^programs\[(\d+)\]\[(.+?)\]\[(.+?)\]$/);
			if (match) {
				const [, id, programName, field] = match;

				let program = result.find(
					(p) => p.id === id && p.program_name === programName
				);
				if (!program) {
					program = { id, program_name: programName };
					result.push(program);
				}

				program[field] = value;

				if (field === "uncheck" && parseInt(value, 10) > 0) {
					hasUncheck = true;
				}
			}
		});

		console.log(result);

		if (hasUncheck) {
			Swal.fire({
				icon: "warning",
				title: "พบรายการ Uncheck",
				text: "มีโปรแกรมที่ยังไม่ได้ตรวจสอบ (Uncheck) อยู่ กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนส่งแบบฟอร์ม",
				confirmButtonText: "ตกลง",
			});
			return;
		}

		result.forEach((item) => {
			if (item.detail_remark && item.detail_remark.trim() !== "") {
				item.detail_remark = item.detail_remark
					.split(/\r?\n/)
					.map((v) => v.trim())
					.filter((v) => v !== "")
					.join("<br>");
			}
		});

		// console.log(result);

		const form = await createForm(nfrmno, vorgno, cyear, empno, empno, "");
		const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;

		$.ajax({
			url: host + "isform/IS-RGR/Main/submitReview",
			method: "POST",
			dataType: "json",
			data: {
				nfrmno,
				vorgno,
				cyear,
				cyear2: CYEAR2,
				nrunno: NRUNNO,
				period,
				fyear,
				empno,
				remark,
				data_result: result,
			},
			success: function (response) {
				// Handle success
			},
			error: function () {
				// Handle error
			},
		});
		console.log(result);
	});

	// $("#reviewForm").on("submit", function (e) {
	//   e.preventDefault();
	//   // Get all form data from #reviewForm
	//   const formDataObj = {};
	//   $(this)
	//     .serializeArray()
	//     .forEach(({ name, value }) => {
	//       formDataObj[name] = value;
	//     });

	//   console.log(formDataObj);

	// Transform flat formDataObj to nested structure
	// Example: programs[1][AS400][delete_count] => programs: { 1: { AS400: { delete_count: "" } } }
	// const result = { programs: {} };
	// Object.entries(formDataObj).forEach(([key, value]) => {
	//   const match = key.match(/^programs\[(\d+)\]\[([^\]]+)\]\[([^\]]+)\]$/);
	//   if (match) {
	//     const [, progId, progName, field] = match;
	//     if (!result.programs[progId]) result.programs[progId] = {};
	//     if (!result.programs[progId][progName]) result.programs[progId][progName] = {};
	//     result.programs[progId][progName][field] = value;
	//   } else if (key === "remark") {
	//     result.remark = value;
	//   }
	// });

	// console.log(result);

	// // Send the nested result to the server
	// $.ajax({
	//   url: host + "isform/IS-RGR/Main/submitReview",
	//   method: "POST",
	//   dataType: "json",
	//   data: result,
	//   success: function (response) {
	//     // Handle success
	//   },
	//   error: function () {
	//     // Handle error
	//   },
	// });
	// });
});
