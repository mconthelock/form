// import { downloadOrOpenFile, getEscsUsers, showflow } from "../../api";
import { downloadOrOpenFile } from '../../api/file';
import { getEscsUsers } from "../../api/escs/user";
import { showflow } from "../../api/webform/flow";
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
import { getAllAttr, showErrorMessage } from "../../public/v1.0.3/jFuntion";
import { getImageByUser } from "../../public/v1.0.3/setIndexDB";
import { getformData, openfile } from "./data";

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

async function setPage() {
    $("body").addClass("bg-blue-100");
    const flow = await showflow(form);
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
            await setInchargeForm();
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
                flowhtml: flow.html
            })
        );
    } else {
        // view
        $("#actionWebflow").html(
            webflowSubmit({
                actionsForm: false,
                remark: false,
                flow: true,
                flowhtml: flow.html
            })
        );
    }
}

async function setSkeleton() {
    console.log(formInfo.mode);
    
    formInfo.mode == 2 ? formSubmitSkeleton({element: '#actionWebflow', mode: 'edit', count:4}) : formSubmitSkeleton({element: '#actionWebflow', mode: 'view'});
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

async function setInchargeForm() {
    $('#qcForm1').removeClass('hidden');
    const user = await getEscsUsers({
        USR_STATUS: 1,
    });
    const foreman = user.filter((u) => u.GRP_ID === 2);
    const foremanUser = foreman.length > 0 ? foreman.map((u) => u.USR_NO) : [];
    const UserImage = await getImageByUser(
        user.length > 0 ? user.map((u) => u.USR_NO) : []
    );
    $(".trainingDate").html(
        input({
            id: "trainingDate",
            name: "trainingDate",
            class: "input fdate max-w-sm w-full req",
            placeholder: "Select training date",
        })
    );
    $(".ojtDate").html(
        input({
            id: "ojtDate",
            name: "ojtDate",
            class: "input fdate max-w-sm w-full req",
            placeholder: "Select OJT date",
        })
    );
    $(".qcForeman").html(
        select({
            id: "qcForeman",
            name: "qcForeman",
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
    // console.log(
    //     foreman.map((u) => {
    //         return { value: u.USR_NO, text: `${u.USR_NAME} (${u.USR_NO})` };
    //     })
    // );
    // console.log(foreman.map((u) => u.USR_NO));

    setDatePicker();
    setSelect2({
        element: "#qcForeman",
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
                (u) => u.GRP_ID > 1 && ![4, 7].includes(u.GRP_ID)
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
