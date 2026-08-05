import { createTable, newRow } from "@amec/webasset/dataTable";
import { redirectWebflow } from "@amec/webasset/form";
import { showErrorMessage, showMessage } from "@amec/webasset/utils";
import { showLoader } from "@amec/webasset/preloader";
import { webflowSubmit } from "@amec/webasset/components/form";
import { getUser } from "@amec/webasset/api/amec";
import { getConfig } from "@amec/webasset/config";

const requiredKeys = [
    "ORDERNO",
    "ITEMNO",
    "DRAWING",
    "QTY",
    "ISSUECARD",
];

const fieldLabels = {
    INPUTBY: "Input By",
    REQBY: "Request By",
    ORDERNO: "Original Order",
    ITEMNO: "Item",
    DRAWING: "Drawing",
    PURCODE: "Variable",
    QTY: "Qty",
    ISSUECARD: "SCL-No.",
    TYPE: "Type",
    PRODUCTION: "Schedule",
    ISSUESEQ: "P",
    NEWORDER: "New Order No.",
};

const orderPrefixes = {
    E: "ET2C",
    S: "ST2C",
};

let itemTable;
let dataConfirmed = false;
let newOrderRequest = 0;
let fieldEdit = null;

$(document).ready(async function () {
    $("#actionform").html(`
        <button type="button" class="btn btn-info" id="btnConfirmData">
            <i class="icofont-check-alt"></i>
            Confirm Data
        </button>
        ${webflowSubmit({ request: true })}
    `);
    setRequestEnabled(false);

    itemTable = await createItemTable();
    addRow();

    $("#addItem").on("click", addRow);
    $("#attachment").on("change", importExcelFile);
    bindEmpLookup("#INPUTBY", "#inputName");
    bindEmpLookup("#REQBY", "#requestName");
    lookupEmpName("#INPUTBY", "#inputName");

    $(document).on("input change blur", "#itemTable input", function () {
        resetDataConfirm();
        setTimeout(updateNewOrderNo);
    });

    $(document).on("input", ".ps-clm-drawing-part", function () {
        this.value = normalizeDrawingPart($(this).data("part"), this.value);
    });

    $(document).on("input", ".ps-clm-drawing-paste", function () {
        const drawing = validateDrawingNo(this.value);
        if (drawing) populateDrawingFields(drawing);
        $("#psClmDrawingPasteStatus").text(drawing ? "Split completed. Check the fields below." : "วางเลข Drawing ที่นี่เพื่อแยกเลข Drawing อัตโนมัติ");
    });

    $(document).on("click", "#itemTable tbody td.ps-clm-drawing-cell", function (event) {
        startDrawingEdit(this);
    });

    $(document).on("input", ".ps-clm-variable-part", function () {
        this.value = normalizeVariableEntry(this.value);
    });

    $(document).on("click", "#itemTable tbody td.ps-clm-variable-cell", function (event) {
        startVariableEdit(this);
    });

    $(document).on("click", "#psClmFieldApply", async function () {
        const type = fieldEdit?.type;
        if (type === "drawing") await finishDrawingEdit();
        if (type === "variable") await finishVariableEdit();
        if (type === "order") await finishOriginalOrderSelect();
        if (type === "excel") await finishExcelImport();
    });

    $(document).on("click", "#psClmFieldCancel", cancelFieldEdit);
    $(document).on("close", "#psClmFieldModal", function () {
        fieldEdit?.resolve?.();
        fieldEdit = null;
    });

    $(document).on("input change blur", "#INPUTBY, #REQBY, #REMARK", resetDataConfirm);

    $(document).on("click", "#btnConfirmData", function () {
        showConfirmData();
    });

    $(document).on("click", "#psClmConfirmApply", async function () {
        await applyConfirmInputs();
        showConfirmData();
    });

    $(document).on("click", "#psClmConfirmClose", function () {
        closeConfirmModal();
    });

    $(document).on("click", "#btnRequest, .btn-submit", async function (e) {
        e.preventDefault();
        const action = $(this).data("action") || "request";
        if (action === "request" && !dataConfirmed) {
            showConfirmData();
            return;
        }
        await submitForm(action);
    });
});

async function createItemTable() {
    return await createTable(
        {
            data: [],
            searching: false,
            autoWidth: false,
            responsive: false,
            scrollX: true,
            scrollCollapse: true,
            dom: "t",
            columnDefs: [
                { targets: 0, width: "46px" },
                { targets: 1, width: "110px" },
                { targets: 2, width: "64px" },
                { targets: 3, width: "150px" },
                { targets: 4, width: "110px" },
                { targets: 5, width: "110px" },
                { targets: 6, width: "70px" },
                { targets: 7, width: "110px" },
                { targets: 8, width: "130px" },
                { targets: 9, width: "130px" },
                { targets: 10, width: "70px" },
                { targets: 11, width: "100px" },
                { targets: 12, width: "130px" },
                {
                    targets: "_all",
                    className: "dt-nowrap",
                    createdCell: function (td) {
                        td.style.whiteSpace = "nowrap";
                    },
                },
            ],
            columns: [
                {
                    data: null,
                    name: "ACTION",
                    className: "text-center",
                    render: function () {
                        return '<button type="button" class="btn btn-error btn-outline btn-xs ps-clm-delete" aria-label="Delete item"><i class="icofont-trash"></i></button>';
                    },
                },
                { data: "ORDERNO", name: "ORDERNO", render: requiredCell("ORDERNO") },
                { data: "ITEMNO", name: "ITEMNO", render: requiredCell("ITEMNO") },
                { data: "DESCRIPTION", name: "DESCRIPTION", defaultContent: "" },
                { data: "DRAWING", name: "DRAWING", className: "ps-clm-drawing-cell", render: requiredCell("DRAWING") },
                { data: "PURCODE", name: "PURCODE", className: "ps-clm-variable-cell", render: requiredCell("PURCODE") },
                { data: "QTY", name: "QTY", render: requiredCell("QTY") },
                { data: "ISSUECARD", name: "ISSUECARD", render: requiredCell("ISSUECARD") },
                {
                    data: "TYPE",
                    name: "TYPE",
                    className: "ps-clm-type-cell",
                    render: function (data, type, row, meta) {
                        if (type !== "display") return data || "";
                        const vendorChecked = claimTypeCode(row.TYPE) === "1" ? "checked" : "";
                        const subconChecked = claimTypeCode(row.TYPE) === "2" ? "checked" : "";
                        return `
                            <label><input type="radio" name="DETAILS[${meta.row}][TYPE]" value="1" data-field="TYPE" ${vendorChecked}>Vendor</label>
                            <label><input type="radio" name="DETAILS[${meta.row}][TYPE]" value="2" data-field="TYPE" ${subconChecked}>Subcon</label>
                        `;
                    },
                },
                {
                    data: "PRODUCTION",
                    name: "PRODUCTION",
                    className: "ps-clm-yellow",
                    defaultContent: "",
                },
                { data: "ISSUESEQ", name: "ISSUESEQ", className: "ps-clm-yellow", defaultContent: "" },
                { data: "ISSUETO", name: "ISSUETO", defaultContent: "" },
                { data: "RETURNTO", name: "RETURNTO", defaultContent: "" },
            ],
            drawCallback: function () {
                const table = this.api();
                requestAnimationFrame(() => table.columns.adjust());
                updateNewOrderNo();
            },
        },
        {
            id: "#itemTable",
            dataTableCss: false,
            cssCustom: false,
            dataTableSm: { status: false },
            inlineEdit: {
                status: true,
                disabledColumns: [0, 4, 5, 8, 9, 10],
                columns: {
                    ORDERNO: requiredInline("Original Order"),
                    ITEMNO: requiredInline("Item"),
                    ISSUECARD: requiredInline("SCL-No."),
                    QTY: {
                        ...requiredInline("Qty"),
                        validate: ({ value }) => {
                            if (String(value || "").trim() === "") return "Please input Qty";
                            if (Number(value) <= 0 || Number.isNaN(Number(value))) {
                                return "Please enter a valid Qty greater than zero";
                            }
                            return true;
                        },
                        transform: (value) => Number(value),
                        onSuccess: ({ cell, rowData }) => {
                            if (rowData.DRAWING) {
                                return fillOriginalOrder(itemTable.row(cell.index().row), rowData.DRAWING);
                            }
                        },
                    },
                },
                onError: ({ error }) => {
                    showMessage(error.message, "warning");
                },
            },
        },
    );
}

function requiredCell(key) {
    return function (data, type) {
        if (type !== "display") return data || "";
        return escapeHtml(data);
    };
}

function startDrawingEdit(node) {
    const cell = itemTable.cell(node);
    const original = cell.data() || "";
    const { dwg, g, lValues } = splitDrawingNo(original);
    const lInputs = Array.from({ length: 9 }, (_, index) => {
        const value = lValues[index] || "";
        return `
            <label class="ps-clm-field-group">
                <span>L${index + 1} ${index ? "(2 digits)" : "(L + 2 digits)"}</span>
                <input type="text" class="input input-bordered input-sm ps-clm-drawing-part" data-part="${index ? "l-next" : "l"}" data-l-index="${index}" maxlength="${index ? 2 : 3}" value="${escapeHtml(index ? value.replace(/^L/, "") : value)}" placeholder="${index ? "XX" : "LXX"}" aria-label="Drawing L number ${index + 1}">
            </label>
        `;
    }).join("");
    openFieldEdit("drawing", cell, "Drawing details", `
        <label class="ps-clm-field-group">
            <span>Paste full Drawing</span>
            <input type="text" class="input input-bordered ps-clm-drawing-paste" value="${escapeHtml(original)}" placeholder="Example: YA175D037-01L01L02" autocomplete="off">
        </label>
        <p class="mt-1 text-xs text-base-content/70" id="psClmDrawingPasteStatus" aria-live="polite">วางเลข Drawing ที่นี่เพื่อแยกอัตโนมัติ.</p>
        <div class="ps-clm-drawing-editor">
            <label class="ps-clm-field-group">
                <span>DWG number (5–9 characters)</span>
                <input type="text" class="input input-bordered input-sm ps-clm-drawing-part" data-part="dwg" maxlength="9" value="${escapeHtml(dwg)}" placeholder="DWG" aria-label="Drawing number">
            </label>
            <label class="ps-clm-field-group">
                <span>G / dash number</span>
                <input type="text" class="input input-bordered input-sm ps-clm-drawing-part" data-part="g" maxlength="4" value="${escapeHtml(g)}" placeholder="G01 or -01" aria-label="Drawing G number">
            </label>
            <div class="ps-clm-drawing-l-editor">${lInputs}</div>
        </div>
    `);
    $("#psClmFieldEditor .ps-clm-drawing-paste").trigger("focus").select();
}

function populateDrawingFields(drawing) {
    const { dwg, g, lValues } = splitDrawingNo(drawing);
    const $editor = $("#psClmFieldEditor");
    $editor.find('[data-part="dwg"]').val(dwg);
    $editor.find('[data-part="g"]').val(g);
    $editor.find("[data-l-index]").each(function (index) {
        const value = lValues[index] || "";
        $(this).val(index ? value.replace(/^L/, "") : value);
    });
}

async function finishDrawingEdit() {
    const $editor = $("#psClmFieldEditor");
    const drawing = validateDrawingNo(buildDrawingNo(
        $editor.find('[data-part="dwg"]').val(),
        $editor.find('[data-part="g"]').val(),
        $editor.find("[data-l-index]").map(function () { return this.value; }).get(),
    ));
    if (!drawing) {
        showMessage("Please enter a valid Drawing", "warning");
        return;
    }
    const row = itemTable.row(fieldEdit.cell.index().row);
    fieldEdit.cell.data(drawing);
    resetDataConfirm();
    closeFieldEdit();
    await fillOriginalOrder(row, drawing);
}

async function fillOriginalOrder(row, drawing) {
    try {
        const qty = Number(row.data().QTY);
        const variable = String(row.data().PURCODE || "").trim();
        if (!drawing || !Number.isInteger(qty) || qty <= 0) return;
        const params = new URLSearchParams({ qty });
        if (variable) params.set("variable", variable);
        const res = await fetch(`${getConfig().APP_API}/as400/m001kp/drawing/${encodeURIComponent(drawing)}?${params}`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data.message || 'Cannot search M001');
        const matches = [...new Map((Array.isArray(data) ? data : []).map((item) => {
            const match = {
                ORDERNO: String(item.ORDERNO || "").trim(),
                ITEMNO: String(item.ITEMNO || "").trim(),
            };
            return [`${match.ORDERNO}|${match.ITEMNO}`, match];
        }).filter(([, match]) => match.ORDERNO && match.ITEMNO)).values()];
        if (!matches.length) throw new Error(`Drawing and QTY${variable ? " with Variable" : ""} not found in M001`);
        if (matches.length > 1) return openOriginalOrderSelect(row, matches);
        await setOriginalOrder(row, matches[0]);
    } catch (error) {
        showMessage(error.message || error, 'warning');
    }
}

function openOriginalOrderSelect(row, matches) {
    return new Promise((resolve) => {
        fieldEdit = { type: "order", row, matches, resolve };
        $("#psClmFieldTitle").text("Select Original Order");
        $("#psClmFieldEditor").html(`
            <div class="overflow-x-auto">
                <table class="table table-xs">
                    <thead><tr><th>Select</th><th>Original Order</th><th>Item</th></tr></thead>
                    <tbody>${matches.map((match, index) => `
                        <tr>
                            <td><input type="radio" name="psClmOriginalOrder" value="${index}" ${index ? "" : "checked"} aria-label="Select ${escapeHtml(match.ORDERNO)} item ${escapeHtml(match.ITEMNO)}"></td>
                            <td>${escapeHtml(match.ORDERNO)}</td>
                            <td>${escapeHtml(match.ITEMNO)}</td>
                        </tr>
                    `).join("")}</tbody>
                </table>
            </div>
        `);
        document.getElementById("psClmFieldModal")?.showModal();
    });
}

async function finishOriginalOrderSelect() {
    const index = Number($("input[name='psClmOriginalOrder']:checked").val());
    const match = fieldEdit.matches[index];
    if (!match) return;
    const resolve = fieldEdit.resolve;
    await setOriginalOrder(fieldEdit.row, match);
    resolve?.();
    closeFieldEdit();
}

async function setOriginalOrder(row, match) {
    const detail = row.data();
    detail.ORDERNO = match.ORDERNO;
    detail.ITEMNO = match.ITEMNO;
    row.data(detail).invalidate().draw(false);
    resetDataConfirm();
    await updateNewOrderNo();
}

function startVariableEdit(node) {
    const cell = itemTable.cell(node);
    const original = cell.data() || "";
    const entries = splitVariable(original);
    const inputs = Array.from({ length: 15 }, (_, index) => `
        <label class="ps-clm-field-group">
            <span>Variable ${index + 1}</span>
            <input type="text" class="input input-bordered input-sm ps-clm-variable-part" maxlength="13" value="${escapeHtml(entries[index] || "")}" placeholder="XXX=XXXXXXXXX" aria-label="Variable ${index + 1}">
        </label>
    `).join("");
    openFieldEdit("variable", cell, "Variable details", `
        <p class="mb-3 text-sm text-base-content/70">Enter up to 15 variables. Each key allows 1–3 characters and each value allows 1–9 characters.</p>
        <div class="ps-clm-variable-editor">${inputs}</div>
    `);
    $("#psClmFieldEditor input").first().trigger("focus").select();
}

async function finishVariableEdit() {
    const variable = buildVariable($("#psClmFieldEditor .ps-clm-variable-part").map(function () { return this.value; }).get());
    const valid = !variable || validateVariable(variable).isValid;
    if (!valid) {
        showMessage("Please enter Variable as XXX=XXXXXXXXX (maximum 15)", "warning");
        return;
    }
    const row = itemTable.row(fieldEdit.cell.index().row);
    fieldEdit.cell.data(variable);
    resetDataConfirm();
    closeFieldEdit();
    await fillOriginalOrder(row, row.data().DRAWING);
}

function openFieldEdit(type, cell, title, html) {
    fieldEdit = { type, cell };
    $("#psClmFieldTitle").text(title);
    $("#psClmFieldEditor").html(html);
    document.getElementById("psClmFieldModal")?.showModal();
}

function closeFieldEdit() {
    document.getElementById("psClmFieldModal")?.close();
}

function cancelFieldEdit() {
    fieldEdit?.resolve?.();
    closeFieldEdit();
}

function requiredInline(label) {
    return {
        trim: true,
        validate: ({ value }) => {
            if (String(value || "").trim() === "") return `Please input ${label}`;
            return true;
        },
    };
}

const excelHeaders = {
    DESCRIPTION: ["part name", "partname"],
    DRAWING: ["drawing no", "drawing number", "drawing"],
    QTY: ["quantity", "qty"],
    ITEMNO: ["job item", "item no", "item"],
    PURCODE: ["remark", "remarks", "variable"],
    ISSUECARD: ["claim slip no", "claim slip number"],
    "": ["p o no", "po no", "invoice no", "pur item", "code no"],
};

const excelTargets = {
    "": "Ignore",
    DESCRIPTION: "Part Name",
    DRAWING: "Drawing",
    QTY: "Qty",
    ITEMNO: "Item",
    PURCODE: "Variable",
    ISSUECARD: "SCL-No.",
    REMARKTABLE: "Remark",
};

async function importExcelFile() {
    const input = document.getElementById("attachment");
    const file = input?.files?.[0];
    if (!file || !/\.(xlsx|xlsm)$/i.test(file.name)) return;
    try {
        if (file.size > 10 * 1024 * 1024) throw new Error("Excel file must not exceed 10 MB");
        showLoader({ show: true });
        const { default: ExcelJS } = await import("exceljs");
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        openExcelImport(findExcelTable(workbook));
    } catch (error) {
        showErrorMessage(error.message || error);
    } finally {
        showLoader({ show: false });
    }
}

function findExcelTable(workbook) {
    let best = null;
    workbook.eachSheet((sheet) => {
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            const sources = [];
            const matched = new Set();
            row.eachCell({ includeEmpty: false }, (cell, column) => {
                if (cell.isMerged && cell.address !== cell.master.address) return;
                const label = excelCellText(cell);
                const target = excelTarget(label);
                if (!label || target === undefined) return;
                sources.push({ column, label, target });
                matched.add(normalizeExcelHeader(label));
            });
            if (!best || matched.size > best.score) best = { sheet, rowNumber, sources, score: matched.size };
        });
    });
    if (!best || best.score < 3) throw new Error("Cannot find the Excel table headers");

    const claimSlipNo = findClaimSlipNo(workbook);
    const sources = [...best.sources];
    if (claimSlipNo && !sources.some((source) => source.target === "ISSUECARD")) {
        sources.push({ column: null, label: "Claim Slip no.", target: "ISSUECARD" });
    }
    const rows = [];
    let blankRows = 0;
    for (let rowNumber = best.rowNumber + 1; rowNumber <= best.sheet.actualRowCount; rowNumber++) {
        const values = sources.map((source) => source.column
            ? excelCellText(best.sheet.getCell(rowNumber, source.column))
            : claimSlipNo);
        if (!values.some(Boolean)) {
            if (rows.length && ++blankRows >= 5) break;
            continue;
        }
        blankRows = 0;
        rows.push(values);
    }
    if (!rows.length) throw new Error("No item rows found below the Excel headers");
    return { sheetName: best.sheet.name, sources, rows };
}

function excelCellText(cell) {
    return String(cell?.text ?? cell?.value ?? "").trim();
}

function normalizeExcelHeader(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function excelTarget(label) {
    const header = normalizeExcelHeader(label);
    for (const [target, aliases] of Object.entries(excelHeaders)) {
        if (aliases.includes(header)) return target;
    }
}

function findClaimSlipNo(workbook) {
    let found = "";
    workbook.eachSheet((sheet) => {
        if (found) return;
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (found) return;
            row.eachCell({ includeEmpty: false }, (cell, column) => {
                if (found) return;
                const text = excelCellText(cell);
                if (!/^claim\s*slip\s*(?:no|number)\.?/i.test(text)) return;
                found = text.replace(/^claim\s*slip\s*(?:no|number)\.?\s*[:#-]?\s*/i, "").trim();
                for (let offset = 1; !found && offset <= 3; offset++) {
                    const candidates = [
                        excelCellText(sheet.getCell(rowNumber, column + offset)),
                        excelCellText(sheet.getCell(rowNumber + offset, column)),
                    ];
                    found = candidates.find((value) =>
                        value && !/^claim\s*slip\s*(?:no|number)/i.test(value)) || "";
                }
            });
        });
    });
    return found;
}

function openExcelImport(data) {
    fieldEdit = { type: "excel", data };
    $("#psClmFieldTitle").text(`Import Excel: ${data.sheetName}`);
    const options = Object.entries(excelTargets).map(([value, label]) =>
        `<option value="${value}">${label}</option>`).join("");
    const mapping = data.sources.map((source, index) => `
        <label class="grid grid-cols-2 items-center gap-3 py-1">
            <span>${escapeHtml(source.label)}</span>
            <select class="select select-bordered select-sm ps-clm-excel-map" data-index="${index}">
                ${options}
            </select>
        </label>
    `).join("");
    const preview = data.rows.slice(0, 5).map((row) => `
        <tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>
    `).join("");
    $("#psClmFieldEditor").html(`
        <p class="mb-2 text-sm">Check the column mapping before import. The file stays in this browser.</p>
        <div class="grid gap-1">${mapping}</div>
        <div class="mt-4 max-h-52 overflow-auto">
            <table class="table table-xs"><thead><tr>${data.sources.map((source) => `<th>${escapeHtml(source.label)}</th>`).join("")}</tr></thead><tbody>${preview}</tbody></table>
        </div>
        <p class="mt-2 text-xs">${data.rows.length} row(s) found</p>
    `);
    data.sources.forEach((source, index) => {
        $(`.ps-clm-excel-map[data-index='${index}']`).val(source.target);
    });
    document.getElementById("psClmFieldModal")?.showModal();
}

async function finishExcelImport() {
    const data = fieldEdit.data;
    const mapping = $(".ps-clm-excel-map").map(function () { return String($(this).val() || ""); }).get();
    const selected = mapping.filter(Boolean);
    if (new Set(selected).size !== selected.length) {
        showMessage("Each PS-CLM field can be mapped only once", "warning");
        return;
    }
    if (!["DRAWING", "QTY"].every((field) => selected.includes(field))) {
        showMessage("Please map Drawing and Qty", "warning");
        return;
    }

    const imported = data.rows.map((values) => {
        const row = createEmptyRow();
        mapping.forEach((target, index) => {
            if (target) row[target] = String(values[index] ?? "").trim();
        });
        row.DRAWING = validateDrawingNo(row.DRAWING) || String(row.DRAWING || "").toUpperCase();
        row.PURCODE = buildVariable(splitVariable(row.PURCODE));
        row.QTY = parseExcelQuantity(row.QTY);
        return row;
    }).filter((row) => row.DRAWING || row.DESCRIPTION || row.QTY);
    if (!imported.length) {
        showMessage("No usable item rows found", "warning");
        return;
    }

    const existing = itemTable.rows().data().toArray().filter((row) =>
        ["ORDERNO", "ITEMNO", "DESCRIPTION", "DRAWING", "PURCODE", "QTY", "ISSUECARD"]
            .some((key) => String(row[key] || "").trim()));
    itemTable.clear();
    [...existing, ...imported].forEach((row) => itemTable.row.add(row));
    itemTable.draw(false);
    reindexRows();
    resetDataConfirm();
    closeFieldEdit();

    for (let index = existing.length; index < existing.length + imported.length; index++) {
        const row = itemTable.row(index);
        await fillOriginalOrder(row, row.data().DRAWING);
    }
    showMessage(`${imported.length} item(s) imported`, "success");
}

function parseExcelQuantity(value) {
    const match = String(value || "").trim().replace(/,/g, "").match(/^(\d+)(?:\s*PCS\.?)?$/i);
    return match ? Number(match[1]) : NaN;
}

function addRow() {
    resetDataConfirm();
    newRow(itemTable, createEmptyRow());
    updateNewOrderNo();
}

function createEmptyRow(row = {}) {
    return {
        LINEID: itemTable ? itemTable.rows().count() + 1 : 1,
        ORDERNO: "",
        ITEMNO: "",
        DESCRIPTION: "",
        DRAWING: "",
        PURCODE: "",
        QTY: "",
        ISSUECARD: "",
        TYPE: "",
        PRODUCTION: "",
        ISSUESEQ: "",
        ISSUETO: "",
        RETURNTO: "",
        ...row,
    };
}

$(document).on("change", "#itemTable [data-field='TYPE']", function () {
    const row = itemTable.row($(this).closest("tr"));
    const rowData = row.data();

    rowData.TYPE = $(this).val();
    row.data(rowData);
});

$(document).on("click", ".ps-clm-delete", function () {
    if (itemTable.rows().count() <= 1) return;
    resetDataConfirm();
    itemTable.row($(this).closest("tr")).remove().draw(false);
    reindexRows();
    updateNewOrderNo();
});

function reindexRows() {
    itemTable.rows().every(function (index) {
        const data = this.data();
        data.LINEID = index + 1;
        this.data(data);
    });
    itemTable.draw(false);
}

function resetDataConfirm() {
    dataConfirmed = false;
    setRequestEnabled(false);
}

function setRequestEnabled(enabled) {
    $("#actionform").find("#btnRequest, .btn-submit").prop("disabled", !enabled).toggleClass("btn-disabled", !enabled);
}

function showConfirmData(openModal = true) {
    const checks = getConfirmChecks();
    const failed = checks.filter((item) => !item.valid);
    dataConfirmed = failed.length === 0;
    setRequestEnabled(dataConfirmed);
    if (openModal || failed.length) {
        renderConfirmChecks(checks, failed.length);
        openConfirmModal();
    }
    return dataConfirmed;
}

function getConfirmChecks() {
    const inputBy = String($("#INPUTBY").val() || "").trim();
    const requestBy = String($("#REQBY").val() || "").trim();
    const checks = [
        formCheck("INPUTBY", inputBy, /^\d{5}$/.test(inputBy) && Boolean($("#inputName").val()), "Please input a valid 5 digit employee number."),
        formCheck("REQBY", requestBy, /^\d{5}$/.test(requestBy) && Boolean($("#requestName").val()), "Please input a valid 5 digit requester number."),
    ];

    itemTable.rows().every(function (rowIndex) {
        const data = this.data();
        requiredKeys.forEach((key) => {
            checks.push(itemCheck(rowIndex, key, data[key]));
        });
        ["TYPE"].forEach((key) => {
            checks.push(itemDisplay(rowIndex, key, data[key]));
        });
    });
    return checks;
}

function formCheck(key, value, valid, message) {
    return {
        type: "form",
        key,
        label: fieldLabels[key] || key,
        value,
        valid,
        message,
    };
}

function itemCheck(rowIndex, key, value) {
    const valid = validateItemValue(key, value);
    const columnIndex = itemTable.column(`${key}:name`).index();
    const cellNode = itemTable.cell(rowIndex, columnIndex).node();
    $(cellNode).toggleClass("ps-clm-invalid", !valid);

    return {
        type: "item",
        rowIndex,
        key,
        label: `Line ${rowIndex + 1} - ${fieldLabels[key] || key}`,
        value,
        valid,
        message: getItemMessage(key),
    };
}

function itemDisplay(rowIndex, key, value) {
    return {
        type: "display",
        rowIndex,
        key,
        label: `Line ${rowIndex + 1} - ${fieldLabels[key] || key}`,
        value: key === "TYPE" ? ({ 1: "Vendor", 2: "Subcon" }[claimTypeCode(value)] || "-") : value,
        valid: true,
        message: "",
    };
}

function getItemMessage(key) {
    if (key === "ORDERNO") return "Original Order must start with E or S.";
    if (key === "DRAWING") return "Please enter a valid Drawing.";
    if (key === "PURCODE") return "Please enter a valid Variable.";
    if (key === "QTY") return "Please enter a valid Qty.";
    return `Please input ${fieldLabels[key] || key}.`;
}

function renderConfirmChecks(checks, failedCount) {
    const html = checks.map((item) => `
        <div class="flex flex-col gap-2 border-b border-base-300 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div class="font-bold ${item.valid ? "text-success" : "text-warning"}">
                    ${item.valid ? '<i class="icofont-check-circled"></i>' : '<i class="icofont-warning-alt"></i>'}
                    ${escapeHtml(item.label)}
                </div>
                ${item.valid ? "" : `<div class="text-xs text-base-content/70">${escapeHtml(item.message)}</div>`}
            </div>
            ${item.type === "display" ? `<span class="text-sm">${escapeHtml(item.value ?? "-")}</span>` : confirmInput(item)}
        </div>
    `).join("");

    $("#psClmConfirmSummary").html(`
        <div role="${failedCount ? "alert" : "status"}" class="alert ${failedCount ? "alert-warning" : "alert-success"} mb-3">
            ${failedCount
                ? `${failedCount} item(s) need correction.`
                : '<span><i class="icofont-check-circled"></i> All data is valid and ready to request.</span>'}
        </div>
        <div class="max-h-[55vh] overflow-auto">${html}</div>
    `);
}

function confirmInput(item) {
    const attrs = item.type === "form"
        ? `data-type="form" data-key="${item.key}"`
        : `data-type="item" data-row="${item.rowIndex}" data-key="${item.key}"`;
    const inputType = item.key === "QTY" ? "number" : "text";

    return `<input type="${inputType}" class="input input-bordered ${item.valid ? "input-success" : "input-warning"} input-sm w-full max-w-xs ps-clm-confirm-input" ${attrs} value="${escapeHtml(item.value ?? "")}" placeholder="${escapeHtml(item.label)}">`;
}

async function applyConfirmInputs() {
    const employeeLookups = [];
    resetDataConfirm();

    $(".ps-clm-confirm-input").each(function () {
        const value = String($(this).val() ?? "").trim();
        const key = $(this).data("key");

        if ($(this).data("type") === "form") {
            const nameSelector = key === "INPUTBY" ? "#inputName" : "#requestName";
            $(`#${key}`).val(value);
            $(nameSelector).val("");
            employeeLookups.push(lookupEmpName(`#${key}`, nameSelector));
            return;
        }

        const row = itemTable.row(Number($(this).data("row")));
        const data = row.data();
        data[key] = key === "QTY" && validateItemValue(key, value) ? Number(value) : value;
        row.data(data);
    });

    await Promise.all(employeeLookups);
    itemTable.draw(false);
    updateNewOrderNo();
}

function openConfirmModal() {
    const modal = document.getElementById("psClmConfirmModal");
    if (modal?.showModal && !modal.open) modal.showModal();
}

function closeConfirmModal() {
    const modal = document.getElementById("psClmConfirmModal");
    if (modal?.close) modal.close();
}

async function submitForm(action) {
    try {
        if (!showConfirmData(false)) return;

        const payload = await buildPayload();
        if (!payload.NEWORDER) {
            showMessage("Cannot generate new order from Original Order.", "warning");
            return;
        }

        showLoader({ show: true });
        const res = await createPsClm(payload);

        if (res.status) {
            showMessage(res.message || "Send form successfully.", "success");
            redirectWebflow();
            return;
        }

        throw new Error(res.message || "Send form failed.");
    } catch (error) {
        showErrorMessage(error.message || error);
    } finally {
        showLoader({ show: false });
    }
}

async function buildPayload() {
    const remark = $("#REMARK").val();
    const newOrderNo = await updateNewOrderNo(true);

    return {
        REMARK: remark,
        INPUTBY: $("#INPUTBY").val(),
        REQBY: $("#REQBY").val(),
        NEWORDER: newOrderNo,
        DETAILS: buildDetails(),
    };
}

async function createPsClm(payload) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
        formData.append(
            key,
            typeof value === "object"
                ? JSON.stringify(value)
                : value ?? "",
        );
    }
    const attachment = document.getElementById("attachment")?.files?.[0];
    if (attachment) formData.append("ATTACHMENT", attachment);

    const res = await fetch(`${getConfig().APP_API}/psform/ps-clm`, {
        method: "POST",
        body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Send form failed.");
    return data;
}

function buildDetails() {
    return itemTable.rows().data().toArray().map((row, index) => {
        const detail = { ...row };
        detail.DRAWING = validateDrawingNo(detail.DRAWING);
        detail.PRODUCTION = "";
        detail.ISSUESEQ = "";

        return {
            ...detail,
            LINEID: index + 1,
        };
    });
}

function claimTypeCode(value) {
    if (value === "vendor") return "1";
    if (value === "subcon") return "2";
    return ["1", "2"].includes(String(value || "")) ? String(value) : "";
}

function validateItemValue(key, value) {
    if (key === "PURCODE") return !String(value || "").trim() || validateVariable(value).isValid;
    if (String(value || "").trim() === "") return false;
    if (key === "ORDERNO") return Boolean(getOrderPrefix(value));
    if (key === "QTY") return Number(value) > 0 && !Number.isNaN(Number(value));
    return key !== "DRAWING" || validateDrawingNo(value);
}

const plainDrawingPattern = /^[A-Z0-9-]{5,9}$/;
const detailedDrawingPattern = /^([A-Z0-9-]{5,9})(G\d{2,3}|-\d{2,3})((?:L\d{2}){0,9})$/;

function normalizeDrawingPart(part, input) {
    const value = typeof input === "string" ? input.toUpperCase() : "";
    if (part === "dwg") return value.replace(/[^A-Z0-9-]/g, "").slice(0, 9);
    if (part === "g") return /^[G-]/.test(value) ? value[0] + value.slice(1).replace(/\D/g, "").slice(0, 3) : "";
    if (part === "l") return value.startsWith("L") ? "L" + value.slice(1).replace(/\D/g, "").slice(0, 2) : "";
    if (part === "l-next") return value.replace(/\D/g, "").slice(0, 2);
    return "";
}

function buildDrawingNo(dwg, g = "", l = "") {
    const lValues = (Array.isArray(l) ? l : [l])
        .slice(0, 9)
        .map((value, index) => normalizeDrawingPart(index ? "l-next" : "l", value))
        .filter(Boolean)
        .map((value) => value.startsWith("L") ? value : `L${value}`);
    const parts = [normalizeDrawingPart("dwg", dwg), normalizeDrawingPart("g", g), ...lValues];
    return !parts[1] && !lValues.length ? parts[0] : parts.join(" ");
}

function splitDrawingNo(input) {
    if (typeof input !== "string") return { dwg: "", g: "", l: "", lValues: [] };

    const value = input.toUpperCase().trim();
    if (value.includes(" ")) {
        const [dwg = "", g = "", ...lValues] = value.split(/\s+/);
        return { dwg, g, l: lValues[0] || "", lValues: lValues.slice(0, 9) };
    }

    const detailed = value.match(detailedDrawingPattern);
    const lValues = detailed?.[3].match(/L\d{2}/g) || [];
    return detailed
        ? { dwg: detailed[1], g: detailed[2], l: lValues[0] || "", lValues }
        : { dwg: value, g: "", l: "", lValues: [] };
}

function validateDrawingNo(input) {
    if (typeof input !== "string") return null;

    const value = input.toUpperCase().trim().replace(/\s+/g, " ");
    const drawing = value.replace(/\s/g, "");
    const match = drawing.match(detailedDrawingPattern);
    if (match) return [match[1], match[2], ...(match[3].match(/L\d{2}/g) || [])].join(" ");
    return !value.includes(" ") && plainDrawingPattern.test(drawing) ? drawing : null;
}

function normalizeVariableEntry(input) {
    const value = String(input || "").toUpperCase().replace(/\s/g, "");
    const equals = value.includes("=");
    const [key = "", ...rest] = value.split("=");
    const cleanKey = key.replace(/[,=]/g, "").slice(0, 3);
    const cleanValue = rest.join("").replace(/[,=]/g, "").slice(0, 9);
    return equals ? `${cleanKey}=${cleanValue}` : cleanKey;
}

function splitVariable(input) {
    return String(input || "").split(",").map((entry) => entry.trim()).filter(Boolean);
}

function buildVariable(entries) {
    return entries.map(normalizeVariableEntry).filter(Boolean).slice(0, 15).join(",");
}

function validateVariable(input) {
    const entries = splitVariable(input);
    const isValid = entries.length > 0 && entries.length <= 15 && entries.every((entry) => /^[^=,\s]{1,3}=[^=,\s]{1,9}$/.test(entry));
    return { isValid };
}

async function updateNewOrderNo(refresh = false) {
    const row = itemTable?.rows().data().toArray().find((item) => getOrderPrefix(item.ORDERNO));
    const request = ++newOrderRequest;
    if (!row) {
        $("#newOrderNo").val("");
        return "";
    }

    const params = new URLSearchParams({ orderNo: row.ORDERNO });
    const res = await fetch(`${getConfig().APP_API}/psform/ps-clm/next-order?${params}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.status) {
        if (refresh) throw new Error(data.message || "Cannot generate new order.");
        return "";
    }

    if (request === newOrderRequest) $("#newOrderNo").val(data.newOrderNo || "");
    return data.newOrderNo || "";
}

function getOrderPrefix(orderNo) {
    const prefix = String(orderNo || "").trim().slice(0, 1).toUpperCase();
    return orderPrefixes[prefix] ? prefix : "";
}

function formatNewOrderNo(orderNo, sequence) {
    const prefix = getOrderPrefix(orderNo);
    if (!prefix) return "";

    return checkBitOrderNo(`${orderPrefixes[prefix]}${prefix === "E" ? formatEtSequence(sequence) : formatStSequence(sequence)}`);
}

function checkBitOrderNo(orderCheck) {
    const sum = orderCheck.slice(0, 8).toUpperCase().split("").reduce((total, char, index) => {
        const a = "ABCDEFGHI".indexOf(char);
        const j = "JKLMNOPQR".indexOf(char);
        const s = "STUVWXYZ".indexOf(char);
        const value = /\d/.test(char) ? Number(char) : a >= 0 ? a + 1 : j >= 0 ? j + 1 : s >= 0 ? s + 2 : 0;
        return total + value * (10 ** (7 - index));
    }, 0);

    return `${orderCheck}${sum % 7}`;
}

function formatEtSequence(sequence) {
    const index = sequence - 1;
    return `${letterAt(Math.floor(index / 999))}${String((index % 999) + 1).padStart(3, "0")}`;
}

function formatStSequence(sequence) {
    const index = sequence - 1;
    return `${letterAt(Math.floor(index / 234))}0${letterAt(Math.floor(index / 9) % 26)}${(index % 9) + 1}`;
}

function letterAt(index) {
    // ponytail: client-side draft sequence, move to backend allocation before Z-range or concurrent requests matter
    return String.fromCharCode(65 + index);
}

function bindEmpLookup(empSelector, nameSelector) {
    $(document).on("input change", empSelector, async function () {
        $(nameSelector).val("");
        if ($(this).val().trim().length === 5) await lookupEmpName(empSelector, nameSelector);
    });


    
    $(document).on("blur", empSelector, async function () {
        const empno = $(this).val().trim();
        if (!empno) return;
        if (empno.length < 5) {
            $(this).val("");
            $(nameSelector).val("");
            showMessage("Please enter 5 digit Employee Number", "warning");
            return;
        }
        await lookupEmpName(empSelector, nameSelector);
    });
}

async function lookupEmpName(empSelector, nameSelector) {
    const empno = $(empSelector).val().trim();
    if (empno.length !== 5) return;

    try {
        const user = await getUser(empno);
        if ($(empSelector).val().trim() !== empno) return;
        if (!user) throw new Error("Employee not found.");
        $(nameSelector).val(user.SNAME || "");
    } catch (error) {
        if ($(empSelector).val().trim() !== empno) return;
        $(empSelector).val("");
        $(nameSelector).val("");
        showMessage("Employee not found. Please enter the information again.", "warning");
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
