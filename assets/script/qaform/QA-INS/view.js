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
    logFormData,
    logtest,
    requiredForm,
    showErrorMessage,
    showMessage,
} from "../../public/v1.0.3/jFuntion";
import { getImageByUser } from "../../public/v1.0.3/setIndexDB";
import { getformData, openfile, qcConfirm } from "./data";
import { showLoader } from "../../public/v1.0.3/preloader";
import { redirectWebflow } from "../../public/v1.0.3/_form";
var formInfo, form, qafiles, cextdata, tableAuditor;

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
            const alertMsg = [
                {
                    element: $("#TRAINING_DATE"),
                    message: "Please select training date",
                },
                { element: $("#OJTDATE"), message: "Please select OJT date" },
                {
                    element: $("#QCFOREMAN"),
                    message: "Please select QC Foreman",
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
                showMessage("Please select at least one row", "warning");
                return;
            }
            selected.forEach((v) => formData.append("AUDITOR", v));
            res = await qcConfirm(formData);
        } else {
            res = await doaction(formData);
        }
        logFormData(formData);
        logtest(res);
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
    // const flow = await showflow({
    //     NFRMNO: 9,
    //     VORGNO: "030101",
    //     CYEAR: "25",
    //     CYEAR2: "2025",
    //     NRUNNO: 22,
    // });
    await setSkeleton();
    const data = await getformData(form);
    qafiles = data.QA_FILES;
    const formDetail = await getformDetail(form);
    $(".form-detail").html(formDetail);
    $(".item").replaceWith(data.QA_ITEM);

    let operator = '<div class="flex flex-col">';
    data.QA_AUD_OPT.forEach((o) => {
        if (o.QOA_TYPECODE == "ESO") {
            operator += `<span>${o.QOA_EMPNO_INFO.SNAME} (${o.QOA_EMPNO})</span>`;
        }
    });
    operator += "</div>";
    $(".operator").replaceWith(operator);

    let files = '<div class="flex flex-col">';
    data.QA_FILES.forEach((f, i) => {
        files += `<a href="${f.FILE_PATH}" storedName="${f.FILE_FNAME}" class="file-link text-primary flex items-center gap-2 w-fit"><i class="icofont-download text-base"></i><span class="link link-primary">${f.FILE_ONAME}</span></a>`;
    });
    files += "</div>";
    $(".attachFile").replaceWith(files);

    $(".qcIncharge").replaceWith(
        `<div class="flex gap-3"><span>${data.QA_INCHARGE_INFO.SNAME} (${data.QA_INCHARGE_SECTION_INFO.SEC_NAME})</span></div>`
    );

    switch (cextdata) {
        case "01":
            await setInchargeForm(data);
            break;
        case "edit":
            // Do something for edit mode
            break;
        case "create":
            // Do something for create mode
            break;
        default:
            // Handle unknown mode
            break;
    }

    if (formInfo.mode == 2) {
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
    logtest(formInfo.mode);

    formInfo.mode == 2
        ? formSubmitSkeleton({
              element: "#actionWebflow",
              mode: "edit",
              count: 4,
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
    // logtest(
    //     foreman.map((u) => {
    //         return { value: u.USR_NO, text: `${u.USR_NAME} (${u.USR_NO})` };
    //     })
    // );
    // logtest(foreman.map((u) => u.USR_NO));

    setDatePicker({enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true});
    setSelect2({
        element: "#QCFOREMAN",
        avatar: true,
        avatarData: foremanUser,
        // width: "100%",
        selectionCssClass: "max-w-sm w-full",
    });
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
