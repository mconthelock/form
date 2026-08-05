import { getExtData, getMode, showflow } from "@amec/webasset/api/webform";
import { createTable } from "@amec/webasset/dataTable";
import { redirectWebflow } from "@amec/webasset/form";
import { showErrorMessage, showMessage } from "@amec/webasset/utils";
import { showLoader } from "@amec/webasset/preloader";
import { webflowSubmit } from "@amec/webasset/components/form";
import { getConfig } from "@amec/webasset/config";
import { getUser } from "@amec/webasset/api/amec";
import { displayEmpImage } from "@amec/webasset/indexDB";
import { setDatePicker } from "@amec/webasset/flatpickr";

let formKey = {};
let details = [];
let extData = {};
let itemTable;
let actionPending = false;
let pageCanAction = false;
let assignedEmployeeNo = "";
let as400Sent = false;

$(document).ready(async function () {
    try {
        formKey = readJsonScript("psClmFormKey") || {};
        extData = readJsonScript("psClmExtData") || {};

        const detailData = readJsonScript("psClmDetails");
        details = Array.isArray(detailData) ? detailData.map(normalizeDetail) : [];

        const form = pickFormKey(formKey);
        await loadFormData(form);

        const actionForm = {
            ...form,
            EMPNO: formKey.EMPNO || $("#INPUTBY").val(),
        };

        const [mode, cextData, flow] = await Promise.all([
            getMode(actionForm),
            getExtData(actionForm),
            showflow(form),
        ]);

        formKey.CEXTDATA = extractFlowStep(cextData) || formKey.CEXTDATA;
        pageCanAction = String(mode) === "2";
        if (flowStep() === "02" && pageCanAction) {
            as400Sent = hasSavedSchedule(details);
        }

        $("#actionform").html(webflowSubmit({
            flow: true,
            flowhtml: flow?.html || "",
            actionsForm: pageCanAction,
            approve: pageCanAction,
            reject: pageCanAction,
        }));

        if (flowStep() === "02" && pageCanAction) {
            const $actionButtons = $("#actionform .actions-Form > div.flex.gap-3.mt-2")
                .addClass("flex-wrap justify-center");
            $actionButtons.before(`
                <button type="button" class="btn btn-primary mb-2 mt-2" id="btnPreviewAs400">
                    Preview AS400 (no insert)
                </button>
            `);
            $actionButtons.find("button").last().before(`
                <button type="button" class="btn btn-success" id="btnSendToAs400">
                    ${as400Sent ? "Sent to AS400" : "Send to AS400"}
                </button>
            `);
        }

        renderPageState();
        renderItemsMeta();
        renderAssignPeople();
        await renderSummary();

        itemTable = await createItemTable(details);
        syncAs400Controls();
    } catch (error) {
        showErrorMessage(error.message || error);
    } finally {
        $("#psClmPage").removeClass("is-loading");
    }
});

$(document).on("input", "#assignPeople", function () {
    const cleanValue = String($(this).val() || "")
        .replace(/\D/g, "")
        .slice(0, 5);

    $(this)
        .val(cleanValue)
        .removeClass("input-error");

    $("#assignPeopleName").val("");
    $("#assignPeopleImage")
        .removeAttr("src")
        .attr("alt", "")
        .addClass("hidden");

    assignedEmployeeNo = "";
});

$(document).on("change blur", "#assignPeople", async function () {
    if ($(this).val()) {
        await lookupEmpName();
    }
});

$(document).on("change blur", ".ps-clm-schedule-date", function () {
    applyScheduleDate(
        $(this).data("row"),
        $(this).val(),
    );
});

$(document).on("input change", ".ps-clm-p", function () {
    $(this).removeClass("ps-clm-input-error");
});

$(document).on("blur", ".ps-clm-p", function () {
    const value = formatP($(this).val());

    if (value) {
        $(this).val(value);
    }

});

$(document).on("click", "#applyScheduleAll", function () {
    applyScheduleToAll();
});

$(document).on("click", "#btnPreviewAs400", async function () {
    if (actionPending) return;

    const payload = {
        ...pickFormKey(formKey),
        EMPNO: formKey.EMPNO || $("#INPUTBY").val(),
        DETAILS: collectDetails(),
    };
    if (!payload.DETAILS) return;

    actionPending = true;
    $(this).prop("disabled", true);
    showLoader({ show: true });
    try {
        const response = await fetch(
            `${getConfig().APP_API}/psform/ps-clm/preview-as400`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            },
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.status) {
            throw new Error(data.message || "Preview AS400 failed.");
        }
        console.info("[PS-CLM AS400 Preview] Checked libraries:", data.data?.libraries);
        showAs400Preview(data.data);
        showMessage(data.message, "success");
    } catch (error) {
        showErrorMessage(error.message || error);
    } finally {
        actionPending = false;
        $(this).prop("disabled", false);
        showLoader({ show: false });
    }
});

$(document).on("click", "#btnSendToAs400", async function () {
    if (actionPending || !window.confirm("Send this order to RTNLIBF and backup to DBGDEV14 now?")) return;
    const payload = {
        ...pickFormKey(formKey),
        EMPNO: formKey.EMPNO || $("#INPUTBY").val(),
        DETAILS: collectDetails(),
    };
    if (!payload.DETAILS) return;

    let sent = false;
    actionPending = true;
    $("#btnPreviewAs400, #btnSendToAs400").prop("disabled", true);
    showLoader({ show: true });
    try {
        const response = await fetch(
            `${getConfig().APP_API}/psform/ps-clm/send-as400`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            },
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.status) throw new Error(data.message || "Send to AS400 failed.");
        sent = true;
        as400Sent = true;
        $(this).text("Sent to AS400");
        syncAs400Controls();
        renderPageState();
        console.info("[PS-CLM AS400 Send] Insert result:", data.data);
        showMessage(data.message, "success");
    } catch (error) {
        showErrorMessage(error.message || error);
    } finally {
        actionPending = false;
        $("#btnPreviewAs400").prop("disabled", false);
        if (!sent) $(this).prop("disabled", false);
        showLoader({ show: false });
    }
});

function showAs400Preview(data = {}) {
    const libraries = Array.isArray(data.libraries) ? data.libraries : ["DBGDEV14"];
    const targets = libraries.map((library) => escapeHtml(library)).join(" + ");
    const renderFile = (name, rows = []) => `
        <section class="ps-clm-as400-file">
            <h4>LIBRARIES: ${targets} &nbsp; FILE: ${name} &nbsp; RECORDS: ${rows.length}</h4>
            ${rows.map((row, index) => {
                const values = Object.entries(row || {}).filter(([, value]) => String(value ?? "").trim() !== "");
                return `
                    <details class="ps-clm-as400-record" ${index ? "" : "open"}>
                        <summary>RECORD ${String(index + 1).padStart(3, "0")}</summary>
                        <div class="ps-clm-as400-data">
                            <table>
                                <thead><tr>${values.map(([field]) => `<th>${escapeHtml(field)}</th>`).join("")}</tr></thead>
                                <tbody><tr>${values.map(([, value]) => `<td>${escapeHtml(value)}</td>`).join("")}</tr></tbody>
                            </table>
                        </div>
                    </details>
                `;
            }).join("") || '<p class="ps-clm-as400-empty">NO RECORD FOUND</p>'}
        </section>
    `;

    $("#psClmAs400Preview").remove();
    $("body").append(`
        <dialog id="psClmAs400Preview" class="modal">
            <div class="modal-box w-11/12 max-w-5xl ps-clm-as400-screen">
                <div class="ps-clm-as400-title">
                    <strong>IBM i / AS400 &mdash; ${targets} INSERT PREVIEW</strong>
                    <span>READ ONLY</span>
                </div>
                <p class="ps-clm-as400-notice">SIMULATION ONLY - NOTHING WAS INSERTED - BLANK FIELDS ARE HIDDEN</p>
                ${renderFile("M001KP", data.m001)}
                ${renderFile("RTNLIBF.M002KPBM / DBGDEV14.M002KP", data.m002)}
                ${renderFile("M008KP", data.m008)}
                ${renderFile("M012KP", data.m012)}
                <div class="modal-action"><form method="dialog"><button class="btn ps-clm-as400-close">F3 = EXIT</button></form></div>
            </div>
        </dialog>
    `);
    document.getElementById("psClmAs400Preview")?.showModal();
}

$(document).on(
    "click",
    "#psClmPage button[name='btnAction']",
    async function (event) {
        event.preventDefault();
        await submitAction($(this).val());
    },
);

async function submitAction(action) {
    if (actionPending) {
        return;
    }

    action = String(action || "")
        .trim()
        .toLowerCase();

    actionPending = true;

    $("#actionform button[name='btnAction']")
        .prop("disabled", true);

    try {
        const cextData = flowStep();

        const payload = {
            ...extData,
            ...pickFormKey(formKey),
            EMPNO: formKey.EMPNO || $("#INPUTBY").val(),
            ACTION: action,
            REMARK: $("#remark").val(),
        };

        if (cextData) {
            payload.CEXTDATA = cextData;
        }

        if (action === "approve") {
            if (cextData === "01") {
                payload.CONTROLLER = await getAssignedEmpno();

                if (!payload.CONTROLLER) {
                    return;
                }
            }

            if (cextData === "02") {
                payload.DETAILS = collectDetails();

                if (!payload.DETAILS) {
                    return;
                }
            }
        }

        showLoader({ show: true });

        const response = await updatePsClm(payload);

        if (response.status) {
            showMessage(
                response.message || "Action completed.",
                "success",
            );

            redirectWebflow();
            return;
        }

        throw new Error(
            response.message || "Action failed.",
        );
    } catch (error) {
        showErrorMessage(error.message || error);
    } finally {
        actionPending = false;

        $("#actionform button[name='btnAction']")
            .prop("disabled", false);

        showLoader({ show: false });
    }
}

async function createItemTable(detailRows) {
    const rows = Array.isArray(detailRows)
        ? detailRows
        : [];

    const canEditSchedule =
        flowStep() === "02" &&
        pageCanAction &&
        !as400Sent;

    const editableClass = canEditSchedule
        ? "ps-clm-editable"
        : "";

    const table = await createTable(
        {
            data: rows,
            searching: false,
            ordering: false,
            paging: false,
            info: false,
            autoWidth: false,
            responsive: false,
            scrollX: true,
            scrollCollapse: true,
            dom: "t",

            language: {
                emptyTable:
                    "No item details were found for this request.",
            },

            columnDefs: [
                {
                    targets: 0,
                    width: "120px",
                },
                {
                    targets: 1,
                    width: "72px",
                },
                {
                    targets: 2,
                    width: "190px",
                },
                {
                    targets: 3,
                    width: "120px",
                },
                {
                    targets: 4,
                    width: "110px",
                },
                {
                    targets: 5,
                    width: "68px",
                    className: "dt-body-right",
                },
                {
                    targets: 6,
                    width: "120px",
                },
                {
                    targets: 7,
                    width: "90px",
                },
                {
                    targets: 8,
                    width: "170px",
                },
                {
                    targets: 9,
                    width: "90px",
                },
                {
                    targets: 10,
                    width: "110px",
                },
                {
                    targets: 11,
                    width: "130px",
                },
                {
                    targets: "_all",
                    className: "dt-nowrap",
                },
            ],

            columns: [
                {
                    data: "ORDERNO",
                    defaultContent: "",
                    render: renderText,
                },
                {
                    data: "ITEMNO",
                    defaultContent: "",
                    render: renderText,
                },
                {
                    data: "DESCRIPTION",
                    defaultContent: "",
                    render: renderText,
                },
                {
                    data: "DRAWING",
                    defaultContent: "",
                    render: renderText,
                },
                {
                    data: "PURCODE",
                    defaultContent: "",
                    render: renderText,
                },
                {
                    data: "QTY",
                    defaultContent: "",
                    render: renderText,
                },
                {
                    data: "ISSUECARD",
                    defaultContent: "",
                    render: renderText,
                },
                {
                    data: "TYPE",
                    defaultContent: "",
                    render: (data, type) => renderText(
                        type === "display"
                            ? ({ 1: "Vendor", 2: "Subcon" })[data] ?? data
                            : data,
                        type,
                    ),
                },
                {
                    data: "PRODUCTION",
                    defaultContent: "",
                    className: editableClass,

                    render: function (
                        data,
                        type,
                        row,
                        meta,
                    ) {
                        if (type !== "display") {
                            return data || "";
                        }

                        if (!canEditSchedule) {
                            return `
                                <span class="ps-clm-cell-value">
                                    ${escapeHtml(data || "-")}
                                </span>
                            `;
                        }

                        return `
                            <div class="ps-clm-schedule-editor">
                                <input
                                    type="hidden"
                                    class="ps-clm-schedule"
                                    data-row="${meta.row}"
                                    value="${escapeHtml(data || "")}"
                                >

                                <input
                                    class="
                                        input
                                        input-bordered
                                        input-sm
                                        ps-clm-cell-input
                                        ps-clm-schedule-date
                                        fdate
                                    "
                                    data-row="${meta.row}"
                                    aria-label="Select production date"
                                    placeholder="Select date"
                                    autocomplete="off"
                                >

                                <div
                                    class="ps-clm-schedule-result"
                                    data-row="${meta.row}"
                                >
                                    ${
                                        data
                                            ? escapeHtml(String(data).slice(-5))
                                            : "Select a production date"
                                    }
                                </div>
                            </div>
                        `;
                    },
                },
                {
                    data: "ISSUESEQ",
                    defaultContent: "",
                    className: editableClass,

                    render: function (
                        data,
                        type,
                        row,
                        meta,
                    ) {
                        if (type !== "display") {
                            return data || "";
                        }

                        if (!canEditSchedule) {
                            return `
                                <span class="ps-clm-cell-value">
                                    ${escapeHtml(data || "-")}
                                </span>
                            `;
                        }

                        return `
                            <input
                                class="
                                    input
                                    input-bordered
                                    input-sm
                                    ps-clm-cell-input
                                    ps-clm-p
                                "
                                data-row="${meta.row}"
                                inputmode="numeric"
                                value="${escapeHtml(formatP(data))}"
                                placeholder="P1"
                            >
                        `;
                    },
                },
                {
                    data: "ISSUETO",
                    defaultContent: "",
                    render: renderText,
                },
                {
                    data: "RETURNTO",
                    defaultContent: "",
                    render: renderText,
                },
            ],
        },
        {
            id: "#itemTable",
            dataTableCss: false,
            cssCustom: false,

            dataTableSm: {
                status: false,
            },
        },
    );

    if (canEditSchedule) {
        initScheduleDatePicker();
    }

    return table;
}

async function loadFormData(form) {
    const url = [
        getConfig().APP_API,
        "psform",
        "ps-clm",
        form.NFRMNO,
        form.VORGNO,
        form.CYEAR,
        form.CYEAR2,
        form.NRUNNO,
    ].join("/");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Failed to load PS-CLM data.",
        );
    }

    const data = await response.json();

    extData = {
        ...extData,
        ...data,
        INPUTBY:
            extData.INPUTBY ||
            data?.form?.VINPUTER,
        REQBY:
            extData.REQBY ||
            data?.form?.VREQNO,
    };

    if (Array.isArray(data?.DETAILS)) {
        details = data.DETAILS.map(normalizeDetail);
    }
}

function hasSavedSchedule(rows) {
    return rows.length > 0 && rows.every((row) =>
        /^[A-Z0-9]{5}$/i.test(String(row.PRODUCTION || "").trim()) &&
        /^P\d+$/i.test(String(row.ISSUESEQ || "").trim()),
    );
}

async function updatePsClm(payload) {
    const response = await fetch(
        `${getConfig().APP_API}/psform/ps-clm`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
        },
    );

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Action failed.",
        );
    }

    return data;
}

function normalizeDetail(row) {
    return {
        ...row,

        ITEMNO:
            row.ITEMNO ??
            row.ITEM,

        DESCRIPTION:
            row.DESCRIPTION ??
            row.PARTNAME,

        PURCODE:
            row.PURCODE ??
            row.VARIABLE,

        ISSUECARD:
            row.ISSUECARD ??
            row.SCLNO,

        TYPE:
            row.TYPE ??
            row.SCLTYPE,

        PRODUCTION:
            row.PRODUCTION ??
            row.SCHDNUM,

        ISSUESEQ:
            row.ISSUESEQ ??
            row.SCHDP,

        RETURNTO:
            row.RETURNTO ??
            row.NEXTPROCESS,
    };
}

function collectDetails() {
    const rows = itemTable
        ? itemTable.rows().data().toArray()
        : details;

    if (!rows.length) {
        showMessage(
            "Item detail not found. Please reload the form.",
            "warning",
        );

        return null;
    }

    let firstInvalidInput = null;
    let hasMissingValue = false;
    let hasInvalidP = false;

    const updated = rows.map((row, index) => {
        const $schedule = $(
            `.ps-clm-schedule[data-row="${index}"]`,
        );

        const $dateInput = $(
            `.ps-clm-schedule-date[data-row="${index}"]`,
        );

        const $pInput = $(
            `.ps-clm-p[data-row="${index}"]`,
        );

        const production = String(
            $schedule.val() || "",
        ).trim();

        const issueSeq = formatP(
            $pInput.val(),
        );

        $dateInput.removeClass(
            "ps-clm-input-error",
        );

        $pInput.removeClass(
            "ps-clm-input-error",
        );

        if (!production) {
            hasMissingValue = true;

            $dateInput.addClass(
                "ps-clm-input-error",
            );

            if (!firstInvalidInput) {
                firstInvalidInput =
                    $dateInput.get(0);
            }
        }

        if (!issueSeq) {
            hasMissingValue = true;

            $pInput.addClass(
                "ps-clm-input-error",
            );

            if (!firstInvalidInput) {
                firstInvalidInput =
                    $pInput.get(0);
            }
        } else if (!/^P[0-9]+$/i.test(issueSeq)) {
            hasInvalidP = true;

            $pInput.addClass(
                "ps-clm-input-error",
            );

            if (!firstInvalidInput) {
                firstInvalidInput =
                    $pInput.get(0);
            }
        }

        $pInput.val(issueSeq);

        return {
            ...row,
            PRODUCTION: production,
            ISSUESEQ: issueSeq,
        };
    });

    if (firstInvalidInput) {
        firstInvalidInput.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });

        window.setTimeout(() => {
            firstInvalidInput.focus();
        }, 250);
    }

    if (hasMissingValue) {
        showMessage(
            "Complete Schedule and P for every item before approving.",
            "warning",
        );

        return null;
    }

    if (hasInvalidP) {
        showMessage(
            "P must use a value such as P1 or P2.",
            "warning",
        );

        return null;
    }

    return updated;
}

function initScheduleDatePicker() {
    setDatePicker({
        element: ".ps-clm-schedule-date",
        dateFormat: "Y-m-d",

        onChange: function (
            selectedDates,
            dateStr,
            instance,
        ) {
            applyScheduleDate(
                $(instance.input).data("row"),
                dateStr,
            );
        },
    });

    setDatePicker({
        element: "#bulkScheduleDate",
        dateFormat: "Y-m-d",
    });
}

function applyScheduleDate(
    row,
    dateStr,
    options = {},
) {
    const {
        silent = false,
    } = options;

    if (!dateStr && dateStr !== 0) {
        return false;
    }

    const $dateInput = $(
        `.ps-clm-schedule-date[data-row="${row}"]`,
    );

    const $scheduleInput = $(
        `.ps-clm-schedule[data-row="${row}"]`,
    );

    const $pInput = $(
        `.ps-clm-p[data-row="${row}"]`,
    );

    const $result = $(
        `.ps-clm-schedule-result[data-row="${row}"]`,
    );

    if (
        $dateInput.data("lastDate") === dateStr &&
        $scheduleInput.val()
    ) {
        return true;
    }

    $dateInput
        .val(dateStr)
        .data("lastDate", dateStr)
        .removeClass("ps-clm-input-error");

    $result.removeClass("is-error");

    const schedule =
        findScheduleByDate(dateStr);

    if (!schedule) {
        $scheduleInput.val("");
        $pInput.val("");

        $result
            .addClass("is-error")
            .text("No schedule found for this date");

        if (!silent) {
            showMessage(
                "Schedule not found for the selected date.",
                "warning",
            );
        }

        return false;
    }

    const scheduleNo = String(
        schedule.MFGSCHD ?? "",
    ).trim().slice(-5);

    const p = formatP(
        schedule.MFGSCHDP,
    );

    $scheduleInput.val(scheduleNo);

    $pInput
        .val(p)
        .removeClass("ps-clm-input-error");

    $result.text(scheduleNo || "-");

    if (!silent) {
        showMessage(
            `Schedule ${scheduleNo || "-"} and ${p || "P"} applied.`,
            "info",
        );
    }

    return true;
}

function applyScheduleToAll() {
    const dateStr = String(
        $("#bulkScheduleDate").val() || "",
    ).trim();

    if (!dateStr) {
        showMessage(
            "Select a production date before applying it to all items.",
            "warning",
        );

        $("#bulkScheduleDate").trigger("focus");
        return;
    }

    const rowCount = itemTable
        ? itemTable.rows().data().toArray().length
        : details.length;

    let appliedCount = 0;

    for (
        let index = 0;
        index < rowCount;
        index += 1
    ) {
        const applied = applyScheduleDate(
            index,
            dateStr,
            {
                silent: true,
            },
        );

        if (applied) {
            appliedCount += 1;
        }
    }

    if (
        appliedCount === rowCount &&
        rowCount > 0
    ) {
        showMessage(
            `Schedule applied to all ${rowCount} items.`,
            "success",
        );
    } else {
        showMessage(
            "No production schedule was found for the selected date.",
            "warning",
        );
    }
}

function findScheduleByDate(dateStr) {
    const key = dateKey(dateStr);

    return readSchedules().find(
        (schedule) =>
            dateKey(schedule.WORKID) === key,
    );
}

function readSchedules() {
    try {
        const value = JSON.parse(
            localStorage.getItem("schedule") ||
            "{}",
        );

        return Array.isArray(value?.value)
            ? value.value
            : [];
    } catch (error) {
        return [];
    }
}

function dateKey(value) {
    return String(value || "")
        .replace(/\D/g, "")
        .slice(0, 8);
}

function formatP(value) {
    const raw = String(value ?? "")
        .trim();

    if (!raw) {
        return "";
    }

    return /^P/i.test(raw)
        ? raw.toUpperCase()
        : `P${raw}`;
}

function renderPageState() {
    const step = flowStep();

    const state = getPageState(
        step,
        pageCanAction,
    );

    $("#workflowStatus")
        .removeClass(
            "is-warning is-neutral",
        )
        .addClass(state.statusClass)
        .text(state.status);

    $("#actionPanelTitle")
        .text(state.title);

    $("#actionPanelDescription")
        .text(state.description);

    $("#requirementAction")
        .text(state.requirement);

    $("#requirementActionRow")
        .toggleClass(
            "is-complete",
            state.requirementComplete,
        );

    $("#requirementActionIcon")
        .text(
            state.requirementComplete
                ? "✓"
                : state.activeStep,
        );

    renderStepper(state.activeStep);
    renderItemMode();
}

function getPageState(
    step,
    canAction,
) {
    const activeStep =
        step === "01"
            ? 1
            : step === "02"
                ? 2
                : 3;

    if (!canAction) {
        return {
            activeStep,
            status: "View only",
            statusClass: "is-neutral",
            title: "Workflow details",
            description:
                "This request is not currently waiting for your action. You can still review its information and workflow history.",
            requirement:
                "No action is required from you",
            requirementComplete: true,
        };
    }

    if (step === "01") {
        return {
            activeStep: 1,
            status: "Controller required",
            statusClass: "is-warning",
            title: "Assign controller",
            description:
                "Choose the employee who will prepare the production schedule, then approve to continue.",
            requirement:
                "Select and verify a controller",
            requirementComplete: false,
        };
    }

    if (step === "02") {
        if (as400Sent) {
            return {
                activeStep: 2,
                status: "AS400 sent",
                statusClass: "",
                title: "Ready to approve",
                description:
                    "Schedule and P are locked because the New Order has been sent to AS400.",
                requirement:
                    "Approve to continue",
                requirementComplete: true,
            };
        }
        return {
            activeStep: 2,
            status: "Schedule required",
            statusClass: "is-warning",
            title: "Complete scheduling",
            description:
                "Set the production schedule and P value for every item before approving the request.",
            requirement:
                "0 of 0 items completed",
            requirementComplete: false,
        };
    }

    return {
        activeStep: 3,
        status: "Ready for review",
        statusClass: "",
        title: "Review request",
        description:
            "Review the request information, workflow history, and remark before taking action.",
        requirement:
            "Review the request before continuing",
        requirementComplete: false,
    };
}

function renderStepper(activeStep) {
    $(".ps-clm-step").each(function () {
        const step = Number(
            $(this).data("step"),
        );

        $(this)
            .toggleClass(
                "is-complete",
                step < activeStep,
            )
            .toggleClass(
                "is-active",
                step === activeStep,
            );

        if (step < activeStep) {
            $(this)
                .find(".ps-clm-step-number")
                .text("✓");
        }
    });
}

function renderItemMode() {
    const canEditSchedule =
        flowStep() === "02" &&
        pageCanAction &&
        !as400Sent;

    $("#scheduleToolbar")
        .toggleClass(
            "hidden",
            !canEditSchedule,
        );

    $("#itemEditHint").text(
        as400Sent
            ? "Sent to AS400. Schedule and P are locked; approve to continue."
            : canEditSchedule
            ? "Select a production date for each item. Schedule and P are filled automatically when a match is found."
            : "Review the requested parts, SCL information, and routing details.",
    );

}

function syncAs400Controls() {
    if (flowStep() !== "02" || !pageCanAction) return;

    $("#actionform button[name='btnAction']")
        .filter(function () {
            return String($(this).val() || "").toLowerCase() === "approve";
        })
        .prop("disabled", !as400Sent);
    $("#btnSendToAs400")
        .prop("disabled", as400Sent)
        .text(as400Sent ? "Sent to AS400" : "Send to AS400");
    $(".ps-clm-schedule-date, .ps-clm-p, #bulkScheduleDate, #applyScheduleAll")
        .prop("disabled", as400Sent);
    renderItemMode();
}

function renderAssignPeople() {
    const shouldShow =
        flowStep() === "01" &&
        pageCanAction;

    $("#assignPeopleSection")
        .toggleClass(
            "hidden",
            !shouldShow,
        );

    updateAssignmentRequirement();
}

function renderItemsMeta() {
    const count = details.length;

    $("#headerItemCount, #itemCount")
        .text(count);

    $("#requirementItems")
        .text(
            count
                ? `${count} item${
                    count === 1 ? "" : "s"
                } loaded`
                : "No item details found",
        );

    $("#requirementItems")
        .closest(".ps-clm-requirement")
        .toggleClass(
            "is-complete",
            count > 0,
        );
}

async function renderSummary() {
    const inputBy =
        extData.INPUTBY ||
        formKey.EMPNO ||
        "";

    const requestBy =
        extData.REQBY ||
        "";

    await Promise.all([
        renderPerson(
            "#summaryInputBy",
            inputBy,
        ),

        renderPerson(
            "#summaryRequestBy",
            requestBy,
        ),
    ]);

    renderNewOrder();
    renderAttachment();
}

async function renderPerson(
    selector,
    empno,
) {
    empno = String(empno || "").trim();

    if (!empno) {
        $(selector).text("-");
        return;
    }

    $(selector).text(empno);

    try {
        const user =
            empno.length === 5
                ? await getUser(empno)
                : null;

        $(selector).text(
            user?.SNAME
                ? `${empno} - ${user.SNAME}`
                : empno,
        );
    } catch (error) {
        $(selector).text(empno);
    }
}

function renderNewOrder() {
    const raw = String(
        extData.NEWORDER ?? "",
    ).trim();

    $("#summaryNewOrder")
        .toggleClass(
            "is-positive",
            Boolean(raw),
        )
        .text(raw || "-");
}

function renderAttachment() {
    const file =
        extData.ATTACHMENT ||
        extData.attachment ||
        extData.ATTACH_FILE ||
        extData.fileAttachment;

    const rawHref =
        typeof file === "object"
            ? (
                file.url ||
                file.href ||
                file.path ||
                ""
            )
            : String(file || "");

    const name =
        typeof file === "object"
            ? (
                file.name ||
                file.filename ||
                file.FILE_NAME ||
                ""
            )
            : fileName(rawHref);

    const href = safeHref(rawHref);

    $("#summaryAttachment").html(
        href
            ? `
                <a
                    class="ps-clm-attachment"
                    href="${escapeHtml(href)}"
                    download
                >
                    <i class="icofont-attachment"></i>

                    <span>
                        ${escapeHtml(
                            name ||
                            "Download attachment",
                        )}
                    </span>

                    <i class="icofont-download"></i>
                </a>
            `
            : `
                <span class="text-slate-400">
                    ${escapeHtml(
                        name ||
                        "No attachment",
                    )}
                </span>
            `,
    );
}

function renderText(data, type) {
    if (type !== "display") {
        return data ?? "";
    }

    const value =
        data === 0
            ? "0"
            : data || "-";

    return `
        <span class="ps-clm-cell-value">
            ${escapeHtml(value)}
        </span>
    `;
}

function safeHref(href) {
    href = String(href || "").trim();

    if (!href) {
        return "";
    }

    if (
        /^(https?:\/\/|\/|\.\/|\.\.\/)/i
            .test(href)
    ) {
        return href;
    }

    if (
        !/^[a-z][a-z0-9+.-]*:/i
            .test(href)
    ) {
        return href;
    }

    return "";
}

function fileName(path) {
    return String(path || "")
        .split(/[\\/]/)
        .pop();
}

async function getAssignedEmpno() {
    const empno = String(
        $("#assignPeople").val() || "",
    ).trim();

    if (!/^\d{5}$/.test(empno)) {
        $("#assignPeople")
            .addClass("input-error")
            .trigger("focus");

        showMessage(
            "Enter a valid five-digit employee number.",
            "warning",
        );

        return "";
    }

    if (
        assignedEmployeeNo === empno &&
        $("#assignPeopleName").val()
    ) {
        return empno;
    }

    return await lookupEmpName()
        ? empno
        : "";
}

async function lookupEmpName() {
    const empno = String(
        $("#assignPeople").val() || "",
    ).trim();

    if (!/^\d{5}$/.test(empno)) {
        $("#assignPeople")
            .addClass("input-error");

        updateAssignmentRequirement();
        return false;
    }

    try {
        const user = await getUser(empno);

        if (!user) {
            throw new Error(
                "Employee not found.",
            );
        }

        assignedEmployeeNo = empno;

        $("#assignPeople")
            .removeClass("input-error");

        $("#assignPeopleName")
            .val(user.SNAME || empno);

        const image = await displayEmpImage(empno);

        $("#assignPeopleImage")
            .attr({
                src: image,
                alt: `Employee ${empno}`,
            })
            .removeClass("hidden");

        updateAssignmentRequirement();
        return true;
    } catch (error) {
        assignedEmployeeNo = "";

        $("#assignPeople")
            .addClass("input-error");

        $("#assignPeopleName")
            .val("");

        $("#assignPeopleImage")
            .removeAttr("src")
            .attr("alt", "")
            .addClass("hidden");

        updateAssignmentRequirement();

        showMessage(
            "Employee not found. Check the employee number and try again.",
            "warning",
        );

        return false;
    }
}

function updateAssignmentRequirement() {
    if (
        flowStep() !== "01" ||
        !pageCanAction
    ) {
        return;
    }

    const complete = Boolean(
        assignedEmployeeNo &&
        $("#assignPeopleName").val(),
    );

    $("#requirementActionRow")
        .toggleClass(
            "is-complete",
            complete,
        );

    $("#requirementActionIcon")
        .text(
            complete
                ? "✓"
                : "1",
        );

    $("#requirementAction")
        .text(
            complete
                ? `Controller ${assignedEmployeeNo} verified`
                : "Select and verify a controller",
        );
}

function updateCompletionProgress() {
    if (
        flowStep() !== "02" ||
        !pageCanAction
    ) {
        return;
    }

    const total = details.length;
    let completed = 0;

    for (
        let index = 0;
        index < total;
        index += 1
    ) {
        const schedule = String(
            $(
                `.ps-clm-schedule[data-row="${index}"]`,
            ).val() || "",
        ).trim();

        const p = formatP(
            $(
                `.ps-clm-p[data-row="${index}"]`,
            ).val(),
        );

        if (
            schedule &&
            /^P[0-9]+$/i.test(p)
        ) {
            completed += 1;
        }
    }

    const percent = total
        ? Math.round(
            (completed / total) * 100,
        )
        : 0;

    const complete =
        total > 0 &&
        completed === total;

    $("#completionProgress")
        .removeClass("hidden");

    $("#completionProgressBar")
        .css(
            "width",
            `${percent}%`,
        );

    $("#requirementActionRow")
        .toggleClass(
            "is-complete",
            complete,
        );

    $("#requirementActionIcon")
        .text(
            complete
                ? "✓"
                : "2",
        );

    $("#requirementAction")
        .text(
            `${completed} of ${total} items completed`,
        );
}

function flowStep() {
    return String(
        formKey.CEXTDATA || "",
    ).trim();
}

function extractFlowStep(value) {
    if (
        value &&
        typeof value === "object"
    ) {
        return String(
            value.CEXTDATA ??
            value.cextData ??
            value.step ??
            "",
        ).trim();
    }

    return String(value || "").trim();
}

function pickFormKey(data) {
    return {
        NFRMNO: data?.NFRMNO,
        VORGNO: data?.VORGNO,
        CYEAR: data?.CYEAR,
        CYEAR2: data?.CYEAR2,
        NRUNNO: data?.NRUNNO,
    };
}

function readJsonScript(id) {
    const node =
        document.getElementById(id);

    if (!node) {
        return null;
    }

    try {
        return JSON.parse(
            node.textContent || "null",
        );
    } catch (error) {
        return null;
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
