// import { downloadOrOpenFile, getEscsUsers, showflow } from "../../api";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { getEscsUsers } from "@amec/webasset/api/escs";
import { doaction, showflow } from "@amec/webasset/api/webform";
import { createTable } from "@amec/webasset/dataTable";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { setSelect2 } from "@amec/webasset/select2";
import {
	getformDetail,
	input,
	select,
	webflowSubmit,
} from "@amec/webasset/components/form";
import {
	dataTableSkeleton,
	formDetailSkeleton,
	formSubmitSkeleton,
	skeleton,
	skeletons,
} from "@amec/webasset/skeleton";
import {
	getAllAttr,
	host,
	logFormData,
	logtest,
	openNewWindow,
	requiredForm,
	showErrorMessage,
	showMessage,
} from "@amec/webasset/utils";
import { getImageByUser } from "@amec/webasset/indexDB";
import {
	searchAuditees,
	getformData,
	openfile,
	qcConfirm,
	getOA,
	getAuditee,
	getQaFiles,
	lastApprove,
	setIncharge,
} from "./data";
import { showLoader } from "@amec/webasset/preloader";
import { redirectWebflow } from "@amec/webasset/form";
import { formatDate } from "@amec/webasset/dayjs";
import { setAuditorToString, shortName, shortSec } from "./function";
import { getAuditRevision } from "@amec/webasset/api/escs";
import { getEscsUserSection } from "@amec/webasset/api/escs";
import { searchUser } from "@amec/webasset/api/amec";
var formInfo, form, cextdata, tableAuditor, tableAuditee;

$(async function () {
	try {
		formInfo = await getAllAttr(".form-info");
		form = {
			NFRMNO: formInfo.nfrmno,
			VORGNO: formInfo.vorgno,
			CYEAR: formInfo.cyear,
			CYEAR2: $(".form-no").attr("CYEAR2"),
			NRUNNO: $(".form-no").attr("NRUNNO"),
		};
		cextdata = $(".apv-data").attr("cextData");

		await setPage();
	} catch (err) {
		console.error(err);
		showErrorMessage(err);
	}
});

$(document).on("click", ".file-link", async function (e) {
	e.preventDefault();
	const filePath = $(this).attr("href");
	const filename = $(this).text();
	const storedName = $(this).attr("storedName");
	await downloadOrOpenFile({
		baseDir: filePath,
		storedName: storedName,
		originalName: filename,
		mode: "download",
	});
});

var isButtonProcessing = false;
$(document).on("click", 'button[name="btnAction"]', async function (e) {
	try {
		// ป้องกันการคลิกซ้ำ
		if (isButtonProcessing) {
			e.preventDefault();
			e.stopImmediatePropagation();
			return;
		}
		isButtonProcessing = true;
		showLoader();
		let res;
		const action = $(this).val();
		const qcform = $("#qcForm1");
		const formData = new FormData(qcform[0]);
		formData.set("NFRMNO", form.NFRMNO);
		formData.set("VORGNO", form.VORGNO);
		formData.set("CYEAR", form.CYEAR);
		formData.set("CYEAR2", form.CYEAR2);
		formData.set("NRUNNO", form.NRUNNO);
		formData.set("EMPNO", formInfo.empno);
		formData.set("ACTION", action);
		formData.set("REMARK", $("#remark").val());
		if (action == "approve") {
			switch (cextdata) {
				case "00":
					// Incharge approve
					if (
						!(await requiredForm($(".qcIncharge"), [
							{
								element: $("#incharge"),
								message: "Please select incharge",
							},
						]))
					)
						return;
					formData.set("QA_INCHARGE_EMPNO", $("#incharge").val());
					res = await setIncharge(formData);
					break;
				case "01":
					if (
						$("#QCFOREMAN").val() == "" &&
						$("#QCLEADER").val() == ""
					) {
						showMessage(
							"Please select QC Foreman or QC Leader",
							"warning"
						);
						return;
					}
					const alertMsg = [
						{
							element: $("#TRAINING_DATE"),
							message: "Please select training date",
						},
						{
							element: $("#OJTDATE"),
							message: "Please select OJT date",
						},
						{
							element: $("#QA_REV"),
							message: "Please select Revision",
						},
					];
					if (!(await requiredForm(qcform, alertMsg))) return;

					const data = tableAuditor.rows().data().toArray();
					const selected = data
						.filter((row) => row.selected == true)
						.map((row) => row.SEMPNO);
					if (selected.length === 0) {
						showMessage(
							"Please select at least one row",
							"warning"
						);
						return;
					}
					selected.forEach((v) => formData.append("AUDITOR", v));
					res = await qcConfirm(formData);
					break;
				case "02":
					const auditeeData = tableAuditee.rows().data().toArray();
					const notAudited = auditeeData.filter(
						(row) => row.QOA_AUDIT != 1
					);
					if (notAudited.length > 0) {
						showMessage(
							"There are auditees who have not been audited.",
							"warning"
						);
						return;
					}
					res = await doaction(formData);
					break;
				case "06":
					res = await lastApprove(formData);
					break;
				default:
					res = await doaction(formData);
					break;
			}
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
		// Reset flag
		setTimeout(() => {
			isButtonProcessing = false;
		}, 2000);
	}
});

async function setPage() {
	$("body").addClass("bg-blue-100");
	await setSkeleton();
	const flow = await showflow(form);
	const data = await getformData(form);
	const qafiles = await getQaFiles({ ...form, FILE_TYPECODE: "ESF" });
	const formDetail = await getformDetail(form);
	const operator = await searchAuditees({ ...form, QOA_TYPECODE: "ESO" });

	$(".form-detail").html(formDetail);
	$(".item").replaceWith(data.QA_ITEM);
	let operatorHtml = '<div class="flex flex-col">';
	operator.forEach((o) => {
		operatorHtml += `<span>${o.QOA_EMPNO_INFO.SNAME} (${o.QOA_EMPNO})</span>`;
	});
	operatorHtml += "</div>";
	$(".operator").replaceWith(operatorHtml);

	let files = '<div class="flex flex-col">';
	if (qafiles.length === 0) {
		files += `<span>-</span>`;
	} else {
		qafiles.forEach((f, i) => {
			files += `<a href="${f.FILE_PATH}" storedName="${f.FILE_FNAME}" class="file-link text-primary flex items-center gap-2 w-fit"><i class="icofont-download text-base"></i><span class="link link-primary">${f.FILE_ONAME}</span></a>`;
		});
	}
	files += "</div>";
	$(".attachFile").replaceWith(files);

	if (data.QA_INCHARGE_EMPNO) {
		$(".qcIncharge").replaceWith(
			`<div class="flex gap-3"><span>${data.QA_INCHARGE_INFO.SNAME} (${data.QA_INCHARGE_SECTION_INFO.SEC_NAME})</span></div>`
		);
	} else {
		$(".qcIncharge").html(`<div class="flex gap-3"><span>-</span></div>`);
	}

	switch (cextdata) {
		case "00":
			await setQCIncharge(data);
			break;
		case "01":
			await setInchargeForm(data);
			break;
		default:
			await setAudit(data);
			break;
	}

	if (formInfo.mode == 2) {
		// edit
		if (cextdata == "00") {
			$("#actionWebflow").html(
				webflowSubmit({
					approve: true,
					reject: true,
					return: true,
					flow: true,
					flowhtml: flow.html,
				})
			);
		} else {
			$("#actionWebflow").html(
				webflowSubmit({
					approve: true,
					reject: true,
					remark: true,
					flow: true,
					flowhtml: flow.html,
				})
			);
		}
	} else {
		// view
		$("#actionWebflow").html(
			webflowSubmit({
				actionsForm: false,
				remark: false,
				flow: true,
				flowhtml: flow.html,
			})
		);
	}
}

async function setQCIncharge(data) {
	$(".qcIncharge").html(
		select({
			id: "incharge",
			class: "select select-sm req",
			placeholder: "Select In-Charge",
		})
	);
	const users = await searchUser({
		CSTATUS: "1",
		SPOSCODE: "<80",
	});
	const sectionData = await getEscsUserSection({
		SEC_ID: data.QA_INCHARGE_SECTION,
	});
	await setSelect2({
		data: users
			.filter((u) => {
				return u?.SSECCODE == sectionData?.[0]?.SSECCODE;
			})
			.map((u) => {
				return {
					value: u.SEMPNO,
					text: `${u.SNAME} (${u.SEMPNO})`,
				};
			}),
		element: "#incharge",
		selectionCssClass: "select-sm",
		avatar: true,
		avatarData: users.map((u) => u.SEMPNO),
	});
}

async function setInchargeForm(data) {
	const user = await searchUser({
		CSTATUS: "1",
		SPOSCODE: "<80",
		SSECCODE: data.QA_INCHARGE_SECTION_INFO.SSECCODE,
	});
	const foreman = await searchUser({
		CSTATUS: "1",
		SPOSCODE: "50",
		SSECCODE: data.QA_INCHARGE_SECTION_INFO.SSECCODE,
	});
	const foremanUser = foreman.length > 0 ? foreman.map((u) => u.SEMPNO) : [];

	const leader = await searchUser({
		CSTATUS: "1",
		SPOSCODE: "55",
		SSECCODE: data.QA_INCHARGE_SECTION_INFO.SSECCODE,
	});
	const leaderUser = leader.length > 0 ? leader.map((u) => u.SEMPNO) : [];

	const UserImage = await getImageByUser(
		user.length > 0 ? user.map((u) => u.SEMPNO) : []
	);

	const revision = await getAuditRevision();

	$(".trainingDate").html(
		input({
			id: "TRAINING_DATE",
			name: "TRAINING_DATE",
			class: "input fdate max-w-sm w-full req",
			placeholder: "Select training date",
		})
	);
	$(".ojtDate").html(
		input({
			id: "OJTDATE",
			name: "OJTDATE",
			class: "input fdate max-w-sm w-full req",
			placeholder: "Select OJT date",
		})
	);
	$(".qcForeman").html(
		select({
			id: "QCFOREMAN",
			name: "QCFOREMAN",
			data:
				foreman.length > 0
					? foreman.map((u) => {
							return {
								value: u.SEMPNO,
								text: `${u.SNAME} (${u.SEMPNO})`,
							};
					  })
					: [],
			class: "select s2 max-w-sm w-full req",
			placeholder: "Select QC Foreman",
		})
	);
	$(".qcLeader").html(
		select({
			id: "QCLEADER",
			name: "QCLEADER",
			data:
				leader.length > 0
					? leader.map((u) => {
							return {
								value: u.SEMPNO,
								text: `${u.SNAME} (${u.SEMPNO})`,
							};
					  })
					: [],
			class: "select s2 max-w-sm w-full req",
			placeholder: "Select QC Leader",
		})
	);
	$(".inchargeRevision").html(
		select({
			id: "QA_REV",
			name: "QA_REV",
			data: revision.map((r) => {
				return { value: r.ARR_REV, text: r.ARR_REV_TEXT };
			}),
			class: "select s2 max-w-sm w-full req",
			placeholder: "Select revision",
		})
	);
	setDatePicker({
		enableTime: true,
		dateFormat: "Y-m-d H:i",
		time_24hr: true,
	});
	setSelect2({
		element: "#QCFOREMAN",
		avatar: true,
		avatarData: foremanUser,
		// width: "100%",
		selectionCssClass: "max-w-sm w-full",
	});
	setSelect2({
		element: "#QCLEADER",
		avatar: true,
		avatarData: leaderUser,
		// width: "100%",
		selectionCssClass: "max-w-sm w-full",
	});
	setSelect2({
		element: "#QA_REV",
		disableSearch: true,
		// width: "100%",
		selectionCssClass: "max-w-sm w-full",
	});
	$("#QA_REV").val(revision[0].ARR_REV).trigger("change");
	const columnAuditor = [
		{
			data: null,
			title: "Image",
			width: "80px",
			render: (data, type, row) => {
				return `<div class="avatar">
                            <div class="w-10 rounded-full border">
                                <img src="${
									UserImage.find(
										(img) => img.empno == row.SEMPNO
									).src || `${process.env.APP_IMG}/Avatar.png`
								}">
                            </div>
                        </div>`;
			},
		},
		{
			data: "SEMPNO",
			title: "Emp. No.",
			width: "100px",
			className: "text-center",
		},
		{ data: "SNAME", title: "Name" },
		{ data: "SPOSNAME", title: "Position" },
		{ data: "SSEC", title: "Section" },
		{ data: "SDEPT", title: "Department" },
		{ data: "SDIV", title: "Division" },
	];

	tableAuditor = await createTable(
		{
			data: user,
			columns: columnAuditor,
			// order: false
		},
		{
			id: "#tableAuditor",
			columnSelect: { status: true },
			domScroll: { status: true, maxHeight: "21rem", type: "tailwind4" },
			join: true,
		}
	);
	dataTableSkeleton({ show: false });
}

async function setAudit(data) {
	$("#tdateShow").text(
		formatDate(data.QA_TRAINING_DATE, "DD-MMM-YYYY HH:mm") || "-"
	);
	$("#ojtShow").text(
		formatDate(data.QA_OJT_DATE, "DD-MMM-YYYY HH:mm") || "-"
	);
	const auditor = await setAuditorToString(form);
	$("#auditorShow").text(auditor || "-");
	const showOperator = await checkFinishAudit();
	if (showOperator || cextdata == "02") {
		const auditee = await searchAuditees(form);
		await createTableAuditee(auditee);
	}
	dataTableSkeleton({
		idLoading: "tableAuditeeLoading",
		show: false,
	});
}

async function createTableAuditee(data) {
	tableAuditee = await createTable(
		{
			data: data,
			searching: false,
			lengthChange: false,
			ordering: false,
			paging: false,
			columns: [
				{ data: "QOA_EMPNO", title: "Emp. No." },
				{ data: "QOA_EMPNO_INFO.SNAME", title: "Name" },
				{ data: "QOA_EMPNO_INFO.SPOSNAME", title: "Position" },
				{ data: "QOA_EMPNO_INFO.SSEC", title: "Section" },
				{
					data: "QOA_RESULT",
					title: "Result",
					render: (data, type, row) => {
						return data == 1
							? '<span class="text-green-600 font-bold">Pass</span>'
							: data == 0
							? '<span class="text-red-600 font-bold">Not Pass</span>'
							: "-";
					},
				},
				{
					data: "QOA_GRADE",
					title: "Grade",
					render: (data, type, row) => {
						return data || "-";
					},
				},
				{
					data: null,
					title: "Status",
					render: (data, type, row) => {
						if (row.QOA_AUDIT == 1) {
							return '<span class="text-green-600 font-bold">Audited</span>';
						} else if (row.QOA_AUDIT == 2) {
							return '<span class="text-blue-600 font-bold">Save draft</span>';
						} else {
							return '<span class="text-red-600 font-bold">Not Audited</span>';
						}
					},
				},
				{
					data: null,
					title: "Audit",
					render: (data, type, row) => {
						return `<div class="btn btn-primary audit-btn" seq="${
							row.QOA_SEQ
						}" link="${host}/qaform/QA-INS/form/audit/${
							row.NFRMNO
						}/${row.VORGNO}/${row.CYEAR}/${row.CYEAR2}/${
							row.NRUNNO
						}/${row.QOA_SEQ}/${formInfo.empno}">${
							row.QOA_AUDIT == 1
								? `<i class="icofont-eye-alt"></i>View`
								: `<i class="icofont-external-link text-el"></i>Audit`
						}</div>`;
					},
				},
			],
		},
		{
			id: "#auditee",
			domScroll: { status: true, maxHeight: "21rem", type: "tailwind4" },
			join: true,
		}
	);
	dataTableSkeleton({ show: false });
}

async function setSkeleton() {
	formInfo.mode == 2
		? formSubmitSkeleton({
				element: "#actionWebflow",
				mode: "edit",
				count: cextdata == "00" ? 4 : 3,
		  })
		: formSubmitSkeleton({ element: "#actionWebflow", mode: "view" });
	formDetailSkeleton(".form-detail");
	$(".reqDetail").removeClass("hidden");
	skeleton({ element: ".item", width: "w-24", height: "h-4" });
	skeletons({
		element: ".operator",
		count: 3,
		pattern: [
			{ width: "w-40", height: "h-4" },
			{ width: "w-48", height: "h-4" },
			{ width: "w-36", height: "h-4" },
		],
	});
	skeletons({
		element: ".attachFile",
		count: 3,
		pattern: [
			{ width: "w-40", height: "h-4" },
			{ width: "w-48", height: "h-4" },
			{ width: "w-56", height: "h-4" },
		],
	});
	skeleton({ element: ".qcIncharge", width: "w-60", height: "h-4" });
	switch (cextdata) {
		case "00":
			break;
		case "01":
			$("#qcForm1").removeClass("hidden");
			skeleton({
				element: ".trainingDate",
				width: "w-[24rem]",
				height: "h-12",
			});
			skeleton({
				element: ".ojtDate",
				width: "w-[24rem]",
				height: "h-12",
			});
			skeleton({
				element: ".qcForeman",
				width: "w-[24rem]",
				height: "h-12",
			});
			skeleton({
				element: ".qcLeader",
				width: "w-[24rem]",
				height: "h-12",
			});
			dataTableSkeleton({
				height: "h-[27rem]",
			});
			break;
		default:
			await setSkeletonAudit();
			break;
	}
}

async function setSkeletonAudit() {
	$("#qcForm2").removeClass("hidden");
	skeleton({
		element: "#auditorShow",
		width: "w-64",
		height: "h-4",
	});
	skeleton({
		element: "#tdateShow",
		width: "w-24",
		height: "h-4",
	});
	skeleton({ element: "#ojtShow", width: "w-24", height: "h-4" });
	const showOperator = await checkFinishAudit();
	if (showOperator || cextdata == "02") {
		$("#topicAuditee").text("Auditee");
		dataTableSkeleton({
			idLoading: "tableAuditeeLoading",
			height: "h-[27rem]",
			page: false,
			search: false,
			button: false,
		});
	}
}

async function checkFinishAudit() {
	const operator = await searchAuditees({ ...form, QOA_TYPECODE: "ESO" });
	let status = true;
	operator.forEach((o) => {
		if (o.QOA_AUDIT != 1) status = false;
	});
	return status;
}

$(document).on("click", ".audit-btn", function () {
	const link = $(this).attr("link");
	const seq = $(this).attr("seq");
	openNewWindow({ url: link, name: seq });
});

// ฟัง event storage
window.addEventListener("storage", async (e) => {
	if (e.key === "TableAuditeeReload") {
		const auditee = await searchAuditees(form);
		createTableAuditee(auditee);
		const checkedSuccess = await checkFinishAudit(form);
		if (checkedSuccess) {
			$("button[name='btnAction']").trigger("click");
		}
	}
});
