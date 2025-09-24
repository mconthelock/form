// import { downloadOrOpenFile, getEscsUsers, showflow } from "../../api";
import { downloadOrOpenFile } from "../../api/file";
import { getEscsUsers } from "../../api/escs/user";
import { doaction, showflow } from "../../api/webform/flow";
import { createTable } from "../../public/v1.0.3/_dataTable";
import { setDatePicker } from "../../public/v1.0.3/_flatpickr";
import { setSelect2 } from "../../public/v1.0.3/_select2";
import {
    getformDetail,
    input,
    select,
    webflowSubmit,
} from "../../public/v1.0.3/component/form";
import {
    dataTableSkeleton,
    formDetailSkeleton,
    formSubmitSkeleton,
    skeleton,
    skeletons,
} from "../../public/v1.0.3/component/skeleton";
import {
    getAllAttr,
    host,
    logFormData,
    logtest,
    openNewWindow,
    requiredForm,
    showErrorMessage,
    showMessage,
} from "../../public/v1.0.3/jFuntion";
import { getImageByUser } from "../../public/v1.0.3/setIndexDB";
import {
    searchAuditees,
    getformData,
    openfile,
    qcConfirm,
    getOA,
    getAuditee,
    getQaFiles,
} from "./data";
import { showLoader } from "../../public/v1.0.3/preloader";
import { redirectWebflow } from "../../public/v1.0.3/_form";
import { formatDate } from "../../public/v1.0.3/_dayjs";
import { setAuditorToString, shortName, shortSec } from "./function";
import { getAuditRevision } from "../../api/escs/audit_revision";
var formInfo, form, qafiles, cextdata, tableAuditor, tableAuditee;

$(async function () {
    try {
        formInfo = await getAllAttr(document.querySelector(".form-info"));
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

$(document).on("click", 'button[name="btnAction"]', async function () {
    try {
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
                case "01":
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
                            element: $("#QCFOREMAN"),
                            message: "Please select QC Foreman",
                        },
                        {
                            element: $("#QA_REV"),
                            message: "Please select Revision",
                        },
                    ];
                    if (!(await requiredForm(qcform, alertMsg))) return;

                    const data = tableAuditor.rows().data().toArray();
                    logtest("data", data);

                    const selected = data
                        .filter((row) => row.selected == true)
                        .map((row) => row.SEMPNO);

                    logtest("selected", selected);
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
                    logtest("tableAuditee", tableAuditee);
                    const auditeeData = tableAuditee.rows().data().toArray();
                    logtest("auditeeData", auditeeData);
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
                default:
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
    }
});

async function setPage() {
    $("body").addClass("bg-blue-100");
    const flow = await showflow(form);
    await setSkeleton();
    const data = await getformData(form);
    qafiles = await getQaFiles({ ...form, FILE_TYPECODE: "ESF" });
    const formDetail = await getformDetail(form);
    $(".form-detail").html(formDetail);
    $(".item").replaceWith(data.QA_ITEM);

    const operator = await searchAuditees({ ...form, QOA_TYPECODE: "ESO" });
    let operatorHtml = '<div class="flex flex-col">';
    operator.forEach((o) => {
        operatorHtml += `<span>${o.QOA_EMPNO_INFO.SNAME} (${o.QOA_EMPNO})</span>`;
    });
    operatorHtml += "</div>";
    $(".operator").replaceWith(operatorHtml);

    let files = '<div class="flex flex-col">';
    if(qafiles.length === 0) {
        files += `<span>-</span>`;
    }else{
        qafiles.forEach((f, i) => {
            files += `<a href="${f.FILE_PATH}" storedName="${f.FILE_FNAME}" class="file-link text-primary flex items-center gap-2 w-fit"><i class="icofont-download text-base"></i><span class="link link-primary">${f.FILE_ONAME}</span></a>`;
        });
    }
    files += "</div>";
    $(".attachFile").replaceWith(files);

    $(".qcIncharge").replaceWith(
        `<div class="flex gap-3"><span>${data.QA_INCHARGE_INFO.SNAME} (${data.QA_INCHARGE_SECTION_INFO.SEC_NAME})</span></div>`
    );

    switch (cextdata) {
        case "01":
            await setInchargeForm(data);
            break;
        case "02":
            await setAudit(data);
            break;
        default:
            // Handle unknown mode
            break;
    }

    if (formInfo.mode == 2) {
        // edit
        if (cextdata == "01") {
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

async function setSkeleton() {
    formInfo.mode == 2
        ? formSubmitSkeleton({
              element: "#actionWebflow",
              mode: "edit",
              count: cextdata == "01" ? 4: 3,
          })
        : formSubmitSkeleton({ element: "#actionWebflow", mode: "view" });
    formDetailSkeleton(".form-detail");
    // skeleton({ element: ".form-detail", width: "w-lg", height: "h-44" });
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
            dataTableSkeleton({
                height: "h-[27rem]",
            });
            break;
        case "02":
            $("#qcForm2").removeClass("hidden");
            skeleton({ element: "#tdateShow", width: "w-24", height: "h-4" });
            skeleton({ element: "#ojtShow", width: "w-24", height: "h-4" });
            dataTableSkeleton({
                height: "h-[27rem]",
            });
            break;
        default:
            break;
    }
}

async function setInchargeForm(data) {
    const user = await getEscsUsers({
        USR_STATUS: 1,
    });

    const foreman = user.filter(
        (u) =>
            u.GRP_ID === 2 &&
            u.SEC_ID == data.QA_INCHARGE_SECTION &&
            data.QA_INCHARGE_SECTION_INFO.SEC_NAME.trim() == u.SSEC.trim()
    );
    const foremanUser = foreman.length > 0 ? foreman.map((u) => u.USR_NO) : [];
    const UserImage = await getImageByUser(
        user.length > 0 ? user.map((u) => u.USR_NO) : []
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
                              value: u.USR_NO,
                              text: `${u.USR_NAME} (${u.USR_NO})`,
                          };
                      })
                    : [],
            class: "select s2 max-w-sm w-full req",
            placeholder: "Select QC Foreman",
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
    // logtest(
    //     foreman.map((u) => {
    //         return { value: u.USR_NO, text: `${u.USR_NAME} (${u.USR_NO})` };
    //     })
    // );
    // logtest(foreman.map((u) => u.USR_NO));

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
            data: user.filter(
                // (u) => u.GRP_ID > 1 && ![4, 7].includes(u.GRP_ID) && u.SEC_ID == secId
                (u) =>
                    ![4].includes(u.GRP_ID) &&
                    u.SEC_ID == data.QA_INCHARGE_SECTION &&
                    data.QA_INCHARGE_SECTION_INFO.SEC_NAME.trim() ==
                        u.SSEC.trim()
            ),
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
    console.log(data);
    $("#tdateShow").text(
        formatDate(data.QA_TRAINING_DATE, "DD-MMM-YYYY HH:mm")
    );
    $("#ojtShow").text(formatDate(data.QA_OJT_DATE, "DD-MMM-YYYY HH:mm"));
    const auditor = await setAuditorToString(form);
    console.log("auditor", auditor);

    const auditee = await searchAuditees(form);
    console.log("auditee", auditee);

    // const auditee = data.QA_AUD_OPT.filter((i) => i.QOA_TYPECODE == "ESO");
    $("#auditorShow").text(auditor.slice(0, -2) || ", ");
    await createTableAuditee(auditee);
}

async function createTableAuditee(data) {
    console.log(data);

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
    }
});
