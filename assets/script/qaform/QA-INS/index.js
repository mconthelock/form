import { displayEmpImage } from "@amec/webasset/indexDB";
import { createTable, destroyTable } from "@amec/webasset/dataTable";
import {
	dragDropInit,
	dragDropReset,
	handleFiles,
	setFilePathToDragDrop,
} from "@amec/webasset/dragdrop";
import select2 from "select2";
import {
	formatAvatar,
	s2disableSearch,
	setSelect2,
} from "@amec/webasset/select2";
import { select, webflowSubmit } from "@amec/webasset/components/form";
import {
	dataTableSkeleton,
	skeleton,
	skeletons,
} from "@amec/webasset/skeleton";
import { checkEmployeeAndFocus } from "@amec/webasset/employee";
import {
	getAllAttr,
	getData,
	logFormData,
	requiredForm,
	showErrorMessage,
	showMessage,
} from "@amec/webasset/utils";
import { getEscsItems } from "@amec/webasset/api/escs";
import { getEscsUsers } from "@amec/webasset/api/escs";
import { getEscsUserSection } from "@amec/webasset/api/escs";
import { getFormMasterByVaname } from "@amec/webasset/api/webform";
import { showLoader } from "@amec/webasset/preloader";
import { redirectWebflow } from "@amec/webasset/form";
import {
	createFormQains,
	getAuditee,
	getformData,
	getQaFiles,
	returnApproval,
	searchAuditees,
} from "./data";
import { searchUser } from "@amec/webasset/api/amec";
import { doaction, showflow } from "@amec/webasset/api/webform";
import { downloadOrOpenFile, getFile } from "@amec/webasset/api/file";
import { readonly } from "vue";

select2();
var formInfo,
	userIncharge,
	users,
	items,
	qcsection,
	division,
	department,
	section,
	tableOperator,
	form;

$(async function () {
	try {
		$("body").addClass("bg-blue-100");
		$(".attach").html(dragDropInit());
		$(".drop-reset").replaceWith(dragDropReset({ class: "rounded-full" }));
		await setSkeleton();
		formInfo = await getAllAttr(".form-info");
		form = {
			NFRMNO: formInfo.nfrmno,
			VORGNO: formInfo.vorgno,
			CYEAR: formInfo.cyear,
			CYEAR2: $(".form-no").attr("CYEAR2"),
			NRUNNO: $(".form-no").attr("NRUNNO"),
		};

		await setCreate();
		if (formInfo.mode == 1) {
			$("#actionWebflow").html(
				webflowSubmit({
					request: true,
				})
			);
		} else if (formInfo.mode == 2) {
			showLoader({ show: true });
			const flow = await showflow(form);
			$("#actionWebflow").html(
				webflowSubmit({
					approve: true,
					reject: true,
					flow: true,
					flowhtml: flow.html,
				})
			);
			await setFormReturn();
		}
	} catch (err) {
		console.error(err);
		showErrorMessage(err);
	} finally {
		showLoader({ show: false });
	}
});

$(document).on("change", "#requester", async function (e) {
	const checked = await checkEmployeeAndFocus($(this));
	if (checked.status) {
		const empInfo = checked.data;
		console.log(empInfo);
		$("#division").val(empInfo.SDIVCODE).trigger("change");
		$("#department").val(empInfo.SDEPCODE).trigger("change");
		$("#section").val(empInfo.SSECCODE).trigger("change");
	}
});

// $(document).on("change", "#qcsection", async function () {
//     $("#incharge").empty();
//     const secId = $(this).val();
//     const incharge = qcsection.find((sec) => sec.SEC_ID == secId);
//     if (secId != "") {
//         const user = userIncharge.filter((u) => u?.SSECCODE == incharge?.SSECCODE);
//         $("#incharge").removeAttr("disabled");
//         await setIncharge(user);
//         if (incharge.INCHARGE) {
//             $("#incharge").val(incharge.INCHARGE).trigger("change");
//         }
//     }
// });

$(document).on("change", "#division", async function () {
	const divCode = $(this).val();
	if (divCode == "") {
		await createTableOperator();
		$("#department").empty().prop("disabled", true);
		$("#section").empty().prop("disabled", true);
		return;
	}
	$("#department").empty().prop("disabled", false);
	$("#section").empty().prop("disabled", true);
	setSelect2({
		element: "#department",
		data: department
			.filter((dept) => dept.SDIVCODE == divCode)
			.map((dept) => {
				return {
					value: dept.SDEPCODE,
					text: dept.SDEPT,
				};
			}),
	});
});

$(document).on("change", "#department", async function () {
	const deptCode = $(this).val();
	if (deptCode == "") {
		await createTableOperator();
		$("#section").empty().prop("disabled", true);
		return;
	}
	$("#section").empty().prop("disabled", false);
	setSelect2({
		element: "#section",
		data: section
			.filter((sec) => sec.SDEPCODE == deptCode)
			.map((sec) => {
				return {
					value: sec.SSECCODE,
					text: sec.SSEC,
				};
			}),
	});
});

$(document).on("change", "#section", async function () {
	const secCode = $(this).val();
	if (secCode == "") {
		await createTableOperator();
	}
});

$(document).on("click", "#searchOperator", async function (e) {
	if (!$("#tableLoading .dataTableSkeleton").hasClass("hidden")) return;
	const div = $("#division").val();
	const dept = $("#department").val();
	const sec = $("#section").val();
	let user = [];
	if (!sec || !dept || !div) {
		showMessage("Please select filter", "warning");
		return;
	}
	user = users.filter(
		(u) => u.SDIVCODE == div && u.SDEPCODE == dept && u.SSECCODE == sec
	);
	if (user.length == 0) {
		showMessage("No operator found", "warning");
	}
	await createTableOperator(user);
});

$(document).on("change", 'input[name="files"]', async function (e) {
	handleFiles();
});

$(document).on("click", "#btnRequest", async function () {
	try {
		showLoader();
		const qaform = $("#qa-form");
		const alertMsg = [
			{ element: $("#requester"), message: "Please input requester" },
			{ element: $("#item"), message: "Please select item" },
			{ element: $("#qcsection"), message: "Please select QC Section" },
			// { element: $("#division"), message: "Please select division" },
			// { element: $("#department"), message: "Please select department" },
			// { element: $("#section"), message: "Please select section" },
			// {element: $('input[name="files[]"]'), message: 'Please choose file to upload'},
		];
		if (!(await requiredForm(qaform, alertMsg))) return;
		const data = tableOperator.rows().data().toArray();

		const selected = data
			.filter((row) => row.selected == true)
			.map((row) => row.SEMPNO);

		if (selected.length === 0) {
			showMessage("Please select at least one row", "warning");
			return;
		}
		const formmst = await getFormMasterByVaname("QA-INS");

		const formData = new FormData(qaform[0]);
		formData.set("NFRMNO", formmst.NNO);
		formData.set("VORGNO", formmst.VORGNO);
		formData.set("CYEAR", formmst.CYEAR);

		formData.set("REQUESTER", $("#requester").val());
		formData.set("CREATEBY", $("#created_by").val());
		formData.set("QA_ITEM", $("#item").val());
		formData.set("QA_INCHARGE_SECTION", $("#qcsection").val());
		// formData.set("QA_INCHARGE_EMPNO", $("#incharge").val());
		formData.set("REMARK", $("#remark").val());
		selected.forEach((v) => formData.append("OPERATOR", v));
		logFormData(formData);
		const res = await createFormQains(formData);

		if (res.status == true) {
			showMessage(res.message, "success");
			redirectWebflow();
		} else {
			throw new Error(res.message);
		}
	} catch (error) {
		console.error(error);
		showErrorMessage(error);
	} finally {
		showLoader({ show: false });
	}
});

$(document).on("click", 'button[name="btnAction"]', async function () {
	try {
		showLoader();
		let res;
		const action = $(this).val();
		const qaform = $("#qa-form");
		const formData = new FormData(qaform[0]);
		formData.set("NFRMNO", form.NFRMNO);
		formData.set("VORGNO", form.VORGNO);
		formData.set("CYEAR", form.CYEAR);
		formData.set("CYEAR2", form.CYEAR2);
		formData.set("NRUNNO", form.NRUNNO);
		formData.set("EMPNO", formInfo.empno);
		formData.set("ACTION", action);
		formData.set("REMARK", $("#remark").val());
		if (action == "approve") {
			const alertMsg = [
				{ element: $("#requester"), message: "Please input requester" },
				{ element: $("#item"), message: "Please select item" },
				{
					element: $("#qcsection"),
					message: "Please select QC Section",
				},
				// { element: $("#incharge"), message: "Please select incharge" },
				// { element: $("#division"), message: "Please select division" },
				// { element: $("#department"), message: "Please select department" },
				// { element: $("#section"), message: "Please select section" },
				// {element: $('input[name="files[]"]'), message: 'Please choose file to upload'},
			];
			if (!(await requiredForm(qaform, alertMsg))) return;
			const data = tableOperator.rows().data().toArray();
			const selected = data
				.filter((row) => row.selected == true)
				.map((row) => row.SEMPNO);

			if (selected.length === 0) {
				showMessage("Please select at least one row", "warning");
				return;
			}
			selected.forEach((v) => formData.append("OPERATOR", v));
			formData.set("QA_ITEM", $("#item").val());
			formData.set("QA_INCHARGE_SECTION", $("#qcsection").val());
			// formData.set("QA_INCHARGE_EMPNO", $("#incharge").val());
			logFormData(formData);

			res = await returnApproval(formData);
		} else {
			res = await doaction(formData);
		}
		if (res.status == true) {
			showMessage(res.message, "success");
			redirectWebflow();
		} else {
			throw new Error(res.message);
		}
	} catch (error) {
		console.error("Error: " + error);
		showErrorMessage(error);
	} finally {
		showLoader({ show: false });
	}
});

async function setFormReturn() {
	try {
		const formData = await getformData(form);
		const auditee = await searchAuditees(form);
		const qafiles = await getQaFiles({ ...form, FILE_TYPECODE: "ESF" });
		if (qafiles.length > 0) {
			await setFilePathToDragDrop({
				filesInfo: qafiles.map((f) => ({
					baseDir: f.FILE_PATH,
					storedName: f.FILE_FNAME,
					originalName: f.FILE_ONAME,
				})),
				element: "#files",
			});
		}

		$("#created_by").val(formData.FORM.VINPUTER);
		$("#requester").val(formData.FORM.VREQNO);
		$("#requester").prop("readonly", true);
		$("#item").val(formData.QA_ITEM).trigger("change");
		$("#qcsection").val(formData.QA_INCHARGE_SECTION).trigger("change");
		// $("#incharge").val(formData.QA_INCHARGE_EMPNO).trigger("change");
		// $("#incharge").removeAttr("disabled");

		auditee.forEach((a) => {
			$("#division").val(a.QOA_EMPNO_INFO.SDIVCODE).trigger("change");
			$("#department").val(a.QOA_EMPNO_INFO.SDEPCODE).trigger("change");
			$("#section").val(a.QOA_EMPNO_INFO.SSECCODE).trigger("change");
		});
		// $("#searchOperator").trigger("click");
		const div = $("#division").val();
		const dept = $("#department").val();
		const sec = $("#section").val();
		await createTableOperator(
			users.filter(
				(u) =>
					u.SDIVCODE == div && u.SDEPCODE == dept && u.SSECCODE == sec
			)
		);
		tableOperator.rows().every(function (rowIdx, tableLoop, rowLoop) {
			const data = this.data();
			if (auditee.find((a) => a.QOA_EMPNO == data.SEMPNO)) {
				data.selected = true;
				this.data(data).draw(false);
			}
		});
	} catch (err) {
		console.error(err);
		showErrorMessage(err);
	}
}

async function setSkeleton() {
	dataTableSkeleton({
		height: "h-[27rem]",
	});
	skeleton({
		element: ".item",
		class: "w-40 h-10",
	});
	skeletons({
		element: ".incharge",
		count: 1,
		pattern: [
			{ width: "w-40", height: "h-10" },
			// { width: "w-xs", height: "h-10" },
		],
	});
	skeletons({
		element: ".organize",
		count: 3,
		pattern: [
			{ width: "w-40", height: "h-10" },
			{ width: "w-40", height: "h-10" },
			{ width: "w-40", height: "h-10" },
		],
	});
}

async function setCreate() {
	items = await getEscsItems({
		IT_STATUS: 1,
	});

	users = await searchUser({
		CSTATUS: "1",
		SPOSCODE: "<80",
	});

	qcsection = await getEscsUserSection({
		SEC_STATUS: 1,
	});

	// userIncharge = await getEscsUsers({
	//     USR_STATUS: 1,
	// });

	// item
	$(".item").html(
		select({
			data: items.map((item) => {
				return {
					value: item.IT_NO,
					text: item.IT_NO,
				};
			}),
			id: "item",
			class: "select select-sm s2 max-w-40 req",
			placeholder: "Select Item",
		})
	);
	await setSelect2();

	// incharge
	$(".incharge").html(
		select({
			data: qcsection.map((sec) => {
				return {
					value: sec.SEC_ID,
					text: sec.SEC_NAME,
				};
			}),
			id: "qcsection",
			class: "select select-sm max-w-40",
			placeholder: "Select Section",
		})
		// +
		//     select({
		//         id: "incharge",
		//         class: "select select-sm req",
		//         placeholder: "Select In-Charge",
		//         disabled: true,
		//     })
	);
	await setSelect2({ disableSearch: true, element: "#qcsection" });
	// await setIncharge(userIncharge);

	await createTableOperator();
	dataTableSkeleton({ show: false });

	division = Array.from(
		new Map(
			users.map((u) => [
				u.SDIVCODE,
				{ SDIVCODE: u.SDIVCODE, SDIV: u.SDIV },
			])
		).values()
	);

	department = Array.from(
		new Map(
			users.map((u) => [
				`${u.SDIVCODE}-${u.SDEPCODE}`,
				{
					SDIVCODE: u.SDIVCODE,
					SDIV: u.SDIV,
					SDEPCODE: u.SDEPCODE,
					SDEPT: u.SDEPT,
				},
			])
		).values()
	);

	section = Array.from(
		new Map(
			users.map((u) => [
				`${u.SDIVCODE}-${u.SDEPCODE}-${u.SSECCODE}`,
				{
					SDIVCODE: u.SDIVCODE,
					SDIV: u.SDIV,
					SDEPCODE: u.SDEPCODE,
					SDEPT: u.SDEPT,
					SSECCODE: u.SSECCODE,
					SSEC: u.SSEC,
				},
			])
		).values()
	);

	$(".organize").html(
		select({
			data: division.map((div) => {
				return {
					value: div.SDIVCODE,
					text: div.SDIV,
				};
			}),
			id: "division",
			class: "select select-sm max-w-40 req",
			placeholder: "Select Division",
			disabled: true,
		}) +
			select({
				data: department.map((dept) => {
					return {
						value: dept.SDEPCODE,
						text: dept.SDEPT,
					};
				}),
				id: "department",
				class: "select select-sm max-w-40 req",
				placeholder: "Select Department",
				disabled: true,
			}) +
			select({
				data: section.map((sec) => {
					return {
						value: sec.SSECCODE,
						text: sec.SSEC,
					};
				}),
				id: "section",
				class: "select select-sm max-w-40 req",
				placeholder: "Select Section",
				disabled: true,
			})
	);
	setSelect2({ element: "#division", width: "10rem" });
	setSelect2({ element: "#department", width: "10rem" });
	setSelect2({ element: "#section", width: "10rem" });
}

// async function setIncharge(data = "") {
//     if (data == "") {
//         await setSelect2({
//             element: "#incharge",
//             avatar: true,
//             width: "100%",
//         });
//         return;
//     }

//     const sec = qcsection.find((sec) => sec.SEC_ID == $('#qcsection').val());

//     await setSelect2({
//         data: data
//         .filter((u) => {
//             return sec ? u?.SSECCODE == sec?.SSECCODE : false;
//         })
//         .map((u) => {
//             console.log(u);

//             return {
//                 value: u.USR_NO,
//                 text: `${u.USR_NAME} (${u.USR_NO})`,
//             };
//         }),
//         element: "#incharge",
//         width: "100%",
//         avatar: true,
//         avatarData: data.map((u) => u.USR_NO),
//     });
// }

async function createTableOperator(data = []) {
	const image = await Promise.all(
		data.map(async (user) => {
			return {
				src: await displayEmpImage(user.SEMPNO),
				empno: user.SEMPNO,
			};
		})
	);
	const column = [
		{
			data: null,
			title: "Image",
			width: "10%",
			render: (data, type, row) => {
				return `<div class="avatar">
                            <div class="w-10 rounded-full border">
                                <img src="${
									image.find((img) => img.empno == row.SEMPNO)
										.src ||
									`${process.env.APP_IMG}/Avatar.png`
								}">
                            </div>
                        </div>`;
			},
		},
		{
			data: "SEMPNO",
			title: "Emp. No.",
			width: "10%",
			className: "text-center",
		},
		{ data: "SNAME", title: "Name" },
	];
	tableOperator = await createTable(
		{
			data: data,
			columns: column,
		},
		{
			id: "#tableOperator",
			columnSelect: { status: true },
			domScroll: { status: true, maxHeight: "21rem", type: "tailwind4" },
			join: true,
		}
	);
}
