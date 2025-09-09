import { getAuditRevision } from "../../api/escs/audit_revision";
import { skeleton } from "../../public/v1.0.3/component/skeleton";
import { formatDate } from "../../public/v1.0.3/_dayjs";
import { getAuditMaster } from "../../api/escs/audit_master";
import {
    logtest,
    requiredForm,
    showErrorMessage,
    showMessage,
} from "../../public/v1.0.3/jFuntion";

import Sortable, { create } from "sortablejs";
import { btnAdd, btnDel, btnStatus, input } from "./component";
import { saveMaster } from "./data";

let sortables = [],
    editMode = false,
    currentRev = 0,
    nextRev;

const sortOpt = ({ handle, clsList, attr }) => ({
    forceFallback: true,
    handle: handle,
    filter: ".hidden",
    animation: 150,
    ghostClass: "bg-[#64b0db]!", // เวลาลาก
    chosenClass: "bg-[#64b0db]!", // เวลาคลิก
    // dragClass: 'bg-[#64b0db]!'
    onStart: function (evt) {
        evt.item.querySelector(handle).classList.remove("cursor-grab");
        evt.item.querySelector(handle).classList.add("cursor-grabbing");
    },
    onEnd: function (/**Event*/ evt) {
        evt.item.querySelector(handle).classList.remove("cursor-grabbing");
        evt.item.querySelector(handle).classList.add("cursor-grab");
        var items = evt.to.querySelectorAll(`${clsList}:not(.hidden)`);
        items.forEach(function (item, index) {
            const oldNo = item.getAttribute(`${attr}`);
            // if (oldNo != index + 1 && item.getAttribute("type") != "new") {
            // if (oldNo != index + 1) {
            console.log("test", oldNo, index + 1);

            // item.setAttribute("type", "edit");
            setTypeEdit(item, item.getAttribute("type"), ["new"]);
            showReasonArea();
            item.setAttribute(`new-${attr}`, index + 1);
            if (clsList == ".topic") {
                setListNewTopic(item);
            }
            // } else {
            //     // item.removeAttribute("edit");
            // }
        });
    },
});

$(async function () {
    try {
        $("body").addClass("bg-[#ecf0f5]");
        await setSkeleton();
        resetForm();
    } catch (error) {
        showErrorMessage(error);
    }
});

/**
 * เรียงลำดับ new-topic ให้กับ list-row
 * @param {object} topic
 */
async function setListNewTopic(topic) {
    const listRow = topic.nextElementSibling.querySelectorAll(".list-row");
    listRow.forEach(function (row) {
        if (topic.getAttribute("new-topic")) {
            row.setAttribute("new-topic", topic.getAttribute("new-topic"));
        }
        // row.setAttribute("type", "edit");
        setTypeEdit(row, row.getAttribute("type"), ["new", "del"]);
        showReasonArea();
    });
}

async function setSkeleton() {
    skeleton({ element: "#revision", width: "w-32", height: "h-12" });
    skeleton({ element: "#tableRevision", width: "w-96", height: "h-72" });
    skeleton({ element: "#master", width: "w-32", height: "h-12" });
    skeleton({ element: "#tableMaster", width: "w-full", height: "h-[60vh]" });
}

async function tableRevision(revision) {
    $("#revision").text("Revision");
    let html = `<table id="tableRevision" class="table table-zebra">
                <thead class="sticky top-0 z-20 bg-[#3c8dbc] text-white">
                    <tr>
                        <th>Revision</th>
                        <th>Date</th>
                        <th>In-charge</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                `;
    for (const rev of revision) {
        html += `
            <tr>
                <td>${rev.ARR_REV_TEXT}</td>
                <td class="text-nowrap">${formatDate(rev.ARR_CREATEDATE)}</td>
                <td>${
                    rev.ARR_INCHARGE != 0
                        ? `${rev.ARR_INCHARGE_INFO.USR_NAME} (${rev.ARR_INCHARGE_INFO.USR_NO})`
                        : "SYSTEM"
                }</td>
                <td>${rev.ARR_REASON}</td>
            </tr>
        `;
    }
    html += `</tbody></table>`;
    $("#tableRevision").replaceWith(html);
}

async function createList(master) {
    try {
        $("#master").text("Master");
        $("#edit-button").attr("disabled", false);
        $("#collapse-button").attr("disabled", false);
        $("#expand-button").attr("disabled", false);
        let html = `<div class="join join-vertical w-full" id="masterList">`;
        for (const item of master) {
            if (item.ARM_TYPE == "H") {
                html += `<div class="collapse collapse-arrow bg-base-100 border-base-300 border join-item">
                        <input type="checkbox" checked="checked" class='toggle-list sr-only'/>
                        <div class="collapse-title font-semibold bg-[#3c8dbc] text-white flex gap-3 topic" rev="${item.ARM_REV}" topic="${item.ARM_NO}" status="${item.ARM_STATUS}"><i class="icofont-drag handle cursor-grab"></i><span class="topic-input">${item.ARM_DETAIL}</span></div>
                        <ul class="collapse-content text-sm list" id="list-master-${item.ARM_NO}">`;
            } else {
                const cls =
                    item.ARM_STATUS == 0
                        ? "!bg-red-100 text-gray-400 line-through cursor-not-allowed"
                        : handleClassList(item.ARM_SEQ);
                html += `<li class="list-row rounded-none flex items-center gap-3 ${cls}" rev="${item.ARM_REV}" topic="${item.ARM_NO}" seq="${item.ARM_SEQ}" status="${item.ARM_STATUS}"><i class="icofont-drag handleList cursor-grab"></i><span class="list-input">${item.ARM_DETAIL}</span></li>`;
            }

            const nextItem = master[master.indexOf(item) + 1];
            if (!nextItem || nextItem.ARM_TYPE == "H") {
                html += `
                </ul>
            </div>
        `;
            }
        }
        html += `</div>`;
        $("#masterList").replaceWith(html);
        // $(".toggle-list").addClass("sr-only");
        await sortablesDestroy();

        document.querySelectorAll("#masterList").forEach(function (el) {
            let s = new Sortable(
                el,
                sortOpt({ handle: ".handle", clsList: ".topic", attr: "topic" })
            );
            sortables.push(s);
        });

        document.querySelectorAll(".list").forEach(function (el) {
            let s = new Sortable(
                el,
                sortOpt({
                    handle: ".handleList",
                    clsList: ".list-row",
                    attr: "seq",
                })
            );
            sortables.push(s);
        });
    } catch (error) {
        showErrorMessage(error);
    }
}

function handleClassList(num) {
    return num % 2 === 0 ? "bg-base-200" : "bg-white";
}

async function sortablesDestroy() {
    sortables.forEach((s) => s.destroy());
    sortables = [];
}

function showReasonArea() {
    $("#save").removeClass("hidden");
}

function collapseFocus() {
    $("#expand-button").addClass("btn-outline");
    $("#collapse-button").removeClass("btn-outline");
}

function expandFocus() {
    $("#collapse-button").addClass("btn-outline");
    $("#expand-button").removeClass("btn-outline");
}

function renumber(e, attr) {
    const items = document.querySelectorAll(`${e}:not(.hidden)`);
    items.forEach((li, i) => {
        console.log(li, i + 1);

        li.setAttribute(`new-${attr}`, i + 1); // set อันดับใหม่
        // li.setAttribute("type", "edit");
        const type = li.getAttribute("type");
        // console.log(type);
        // if(li.getAttribute(`old-${attr}`) != i+1){
        setTypeEdit(li, type, ["new", "del"]);
        // }
    });
}

async function resetForm() {
    try {
        const revision = await getAuditRevision();
        nextRev = revision.length > 0 ? revision[0].ARR_REV + 1 : 0;
        await tableRevision(revision);
        const master = await getAuditMaster();
        await createList(master);
        $("#save").addClass("hidden");
        $("#add-topic").addClass("hidden");
        $("#reason").val("");
        editMode = false;
        expandFocus();
    } catch (error) {
        showErrorMessage(error);
    }
}

/**
 * Choose detail from text or value
 * @param {object} element t.querySelector(".topic-input")
 */
function chooseDetail(element) {
    return editMode ? element.value.trim() : element.textContent.trim();
}

// collapse all
$(document).on("click", "#collapse-button", function () {
    collapseFocus();
    $(".toggle-list").each((index, element) => {
        // $(element).attr("checked", false);
        if (element.checked) {
            element.click(); // toggle ถ้ายัง checked
        }
    });
});

// Expand all
$(document).on("click", "#expand-button", function () {
    expandFocus();
    $(".toggle-list").each((index, element) => {
        // $(element).attr("checked", true);
        if (!element.checked) {
            element.click(); // toggle ถ้ายังไม่ checked
        }
    });
});

// Collapse/Expand topic
$(document).on("click", ".collapse-title.topic", function () {
    $(this).siblings(".toggle-list").trigger("click");
    $("#masterList")
        .find(".toggle-list")
        .each((index, element) => {
            if ($(element).is(":checked")) {
                expandFocus();
                return false; // ออกจาก loop
            } else {
                collapseFocus();
            }
        });
});

// click status
$(document).on("click", ".topic-status", function (e) {
    e.stopPropagation();
    const toggle = $(this).find('input[type="checkbox"]');
    toggle.trigger("click");
});

/**
 *
 * @param {object} element
 * @param {string} type attribute type
 * @param {array<string>} condition e.g. ['del', 'new']
 */
function setTypeEdit(element, type, condition) {
    if (!condition.includes(type) || !type) {
        element.setAttribute("type", "edit");
    }
}

// change status
$(document).on("click", '.topic-status input[type="checkbox"]', function (e) {
    e.stopPropagation();
    const topic = $(this).closest(".topic");
    const list = topic.siblings(".list");
    const listRow = list.find(".list-row");
    const input = topic.find(".topic-input");
    // topic.attr("type", "edit");
    // const type = topic.attr("type");
    // if (type != "new") topic.attr("type", "edit");
    setTypeEdit(topic[0], topic.attr("type"), ["new"]);
    if ($(this).is(":checked")) {
        // status on
        topic.removeClass("!bg-[#85b2cc]");
        topic
            .find(".add-list")
            .removeClass("bg-gray-100 text-gray-400 cursor-not-allowed");
        topic.attr("status", 1);
        input.attr("disabled", false);
        listRow.each((index, element) => {
            if ($(element).attr("status") == 0) {
                $(element).attr("status", 1);
                // $(element).attr("type", "edit");
                setTypeEdit(element, listRow.attr("type"), ["new"]);
                $(element).removeClass("!bg-red-100 line-through");
                $(element).find(".list-input").attr("disabled", false);
                $(element).find(".list-status").attr("disabled", false);
                $(element)
                    .find(".list-status input[type='checkbox']")
                    .prop("checked", true);
                $(element).find(".delete-list").attr("disabled", false);
            }
        });
    } else {
        // status off
        topic.closest(".collapse").appendTo("#masterList"); // ย้ายรายการไปไว้ท้ายสุด
        renumber(`.topic`, "topic");
        // เรียงลำดับ new-topic ให้กับ list-row
        document.querySelectorAll(".topic").forEach(function (t, i) {
            setListNewTopic(t);
        });
        topic.addClass("!bg-[#85b2cc]");
        topic
            .find(".add-list")
            .addClass("bg-gray-100 text-gray-400 cursor-not-allowed");
        topic.attr("status", 0);
        input.attr("disabled", true);
        listRow.each((index, element) => {
            // $(element).closest('.list').siblings('.topic').attr("new-topic");
            // $(element).attr("new-topic", topic.attr("new-topic"));
            if ($(element).attr("status") == 1) {
                $(element).attr("status", 0);
                // $(element).attr("type", "edit");
                setTypeEdit(element, listRow.attr("type"), ["new"]);
                $(element).addClass("!bg-red-100 line-through");
                $(element).find(".list-input").attr("disabled", true);
                $(element).find(".list-status").attr("disabled", true);
                $(element)
                    .find(".list-status input[type='checkbox']")
                    .prop("checked", false);
                $(element).find(".delete-list").attr("disabled", true);
            }
        });
    }
});
// click status
$(document).on("click", ".list-status", function (e) {
    e.stopPropagation();
    const toggle = $(this).find('input[type="checkbox"]');
    toggle.trigger("click");
    // toggle.is(':checked') ? toggle.attr("checked", false) : toggle.attr("checked", true);
});

// change status
$(document).on("click", '.list-status input[type="checkbox"]', function (e) {
    e.stopPropagation();
    const listRow = $(this).closest(".list-row");
    const id = $(listRow).closest(".list").attr("id");
    const listInput = listRow.find(".list-input");
    console.log(listRow, id, listRow.attr("type"));

    // const type = listRow.attr("type");
    // if (type != "new") listRow.attr("type", "edit");
    setTypeEdit(listRow[0], listRow.attr("type"), ["new"]);
    if ($(this).is(":checked")) {
        listRow.removeClass("!bg-red-100 line-through");
        listRow.attr("status", 1);
        listInput.attr("disabled", false);
    } else {
        listRow.addClass("!bg-red-100 line-through");
        listRow.attr("status", 0);
        listInput.attr("disabled", true);
        listRow.appendTo(`#${id}`); // ย้ายรายการไปไว้ท้ายสุด
        renumber(`#${id} .list-row`, "seq");
    }
});

$(document).on("click", ".topic-input", function (e) {
    e.stopPropagation();
});

$(document).on("change", ".topic-input", function () {
    const input = $(this);
    const topic = input.closest(".topic");
    const type = topic.attr("type");
    if (type === "new") {
        const val = input.val().trim();
        if (val !== "") {
            input
                .siblings(".add-list")
                .removeClass("bg-gray-100 text-gray-400 cursor-not-allowed");
            topic
                .siblings(".list")
                .find(".list-row")
                .each((i, el) => {
                    console.log(el);

                    $(el).find(".list-input").prop("disabled", false);
                    // $(el).find(".list-status").removeClass("btn-disabled");
                    $(el).find(".delete-list").removeClass("btn-disabled");
                });
        }
        return;
    }
    topic.attr("type", "edit");
});

$(document).on("change", ".list-input", function () {
    const list = $(this).closest(".list-row");
    // const type = list.attr("type");
    // if (type != "new") list.attr("type", "edit");
    setTypeEdit(list, list.attr("type"), ["new"]);
});

// add topic
$(document).on("click", "#add-topic", function () {
    const newId = $(".topic:not(.hidden)").length + 1;
    const html = `<div class="collapse collapse-arrow bg-base-100 border-base-300 border join-item">
                        <input type="checkbox" checked="checked" class='toggle-list sr-only'/>
                        <div class="collapse-title font-semibold bg-[#3c8dbc] text-white flex gap-3 topic" topic="${newId}" new-topic="${newId}" status="1" type="new">
                            <i class="icofont-drag handle cursor-grab"></i>
                            ${input({ cls: "topic-input" })}
                            ${btnAdd({
                                cls: "add-list bg-gray-100 text-gray-400 cursor-not-allowed",
                                text: "Add list",
                            })}
                            ${btnDel({ cls: "delete-topic" })}
                        </div>
                        <ul class="collapse-content text-sm list" id="list-master-${newId}">
                            <li class="list-row rounded-none flex items-center gap-3 bg-white" topic="${newId}" new-topic="${newId}" seq="1" new-seq="1" status="1" type="new">
                                <i class="icofont-drag handleList cursor-grab"></i>
                                ${input({
                                    cls: "list-input",
                                    attr: 'disabled="disabled"',
                                })}
                                ${btnDel({ cls: "delete-list btn-disabled" })}
                            </li>
                        </ul>
                        
                    </div>
                `;
    $("#masterList").append(html);

    const el = document.querySelector(`#list-master-${newId}`);
    let s = new Sortable(
        el,
        sortOpt({
            handle: ".handleList",
            clsList: ".list-row",
            attr: "seq",
        })
    );
    sortables.push(s);
});

// add list
$(document).on("click", ".add-list", function (e) {
    e.stopPropagation();
    if ($(this).hasClass("cursor-not-allowed")) {
        return;
    }
    if (!$(this).closest(".topic").siblings(".toggle-list").is(":checked")) {
        $(this).closest(".topic").trigger("click"); // เปิดหัวข้อ
        expandFocus();
    }
    const topic = $(this).closest(".topic");
    const list = $(this).closest(".collapse").find(".list");
    const newSeq = list.find(".list-row").length + 1;
    const html = `<li class="list-row rounded-none flex items-center gap-3 bg-white" topic="${topic.attr(
        "topic"
    )}" ${
        topic.attr("new-topic") ? `new-topic="${topic.attr("new-topic")}" ` : ""
    }" seq="${newSeq}" new-seq="${newSeq}" status="1" type="new">
                        <i class="icofont-drag handleList cursor-grab"></i>
                        ${input({ cls: "list-input" })}
                        ${btnDel({ cls: "delete-list" })}
                    </li>`;
    list.append(html);
});

// click edit
$(document).on("click", "#edit-button", async function () {
    editMode = true;
    showReasonArea();
    // await sortablesDestroy();
    $("#edit-button").attr("disabled", true);
    $("#add-topic").removeClass("hidden");
    // $(".toggle-list").addClass("hidden");
    // หัวข้อ
    // $(".topic").each((index, element) => {
    //     const status = $(element).attr("status");
    //     const text = $(element).text();
    //     const disabled = status == 1 ? "" : 'disabled="disabled"';
    //     const btnAddCls = status == 1 ? "" : "bg-gray-100 text-gray-400 cursor-not-allowed";
    //     status == 0
    //         ? $(element).addClass("!bg-[#85b2cc]")
    //         : $(element).removeClass("!bg-[#85b2cc]");
    //     $(element).html(`<i class="icofont-drag handle cursor-grab"></i>
    //         ${input({ val: text, cls: "topic-input", attr: disabled })}
    //         ${btnAdd({ cls: `add-list ${btnAddCls}`, text: "Add list"})}
    //         ${btnStatus({ cls: "topic-status", status: status })}
    //         ${btnDel({ cls: "delete-topic" })}`);
    // });
    $(".topic").each((index, element) => {
        const statusT = $(element).attr("status");
        const text = $(element).text();
        const disabledT = statusT == 1 ? "" : 'disabled="disabled"';
        const btnAddCls =
            statusT == 1 ? "" : "bg-gray-100 text-gray-400 cursor-not-allowed";
        statusT == 0
            ? $(element).addClass("!bg-[#85b2cc]")
            : $(element).removeClass("!bg-[#85b2cc]");
        $(element).html(`<i class="icofont-drag handle cursor-grab"></i>
        ${input({ val: text, cls: "topic-input", attr: disabledT })}
        ${btnAdd({ cls: `add-list ${btnAddCls}`, text: "Add list" })}
        ${btnStatus({ cls: "topic-status", status: statusT })}
        ${btnDel({ cls: "delete-topic" })}`);
        // รายการ
        $(element)
            .siblings(".list")
            .find(".list-row")
            .each((index, element) => {
                const text = $(element).text();
                const status = $(element).attr("status");
                const disabled = status == 0 || statusT == 0 ? 'disabled="disabled"' : '';
                $(element)
                    .html(`<i class="icofont-drag handleList cursor-grab"></i>
                ${input({ val: text, cls: "list-input", attr: disabled })}
                ${btnStatus({ status: status, attr: disabledT })}
                ${btnDel({ cls: "delete-list", attr: disabledT })}`);
            });
    });

    // // รายการ
    // $(".list-row").each((index, element) => {
    //     const text = $(element).text();
    //     const status = $(element).attr("status");
    //     const disabled = status == 1 ? "" : 'disabled="disabled"';
    //     $(element).html(`<i class="icofont-drag handleList cursor-grab"></i>
    //         ${input({ val: text, cls: "list-input", attr: disabled })}
    //         ${btnStatus({ status: status })}
    //         ${btnDel({ cls: "delete-list" })}`);
    // });
});

// delete topic
$(document).on("click", ".delete-topic", function (e) {
    e.stopPropagation();
    const topic = $(this).closest(".topic");
    if (topic.attr("type") == "new") {
        topic.closest(".collapse").remove();
        return;
    }
    topic.closest(".collapse").addClass("hidden");
    topic.addClass("hidden");

    topic.attr("type", "del");
    topic.attr("status", 0);
    renumber(`.topic`, "topic");
    const list = topic.siblings(".list");
    list.find(".list-row").each((index, element) => {
        $(element).attr("type", "del");
        $(element).addClass("hidden");
    });
    // เรียงลำดับ new-topic ให้กับ list-row
    document.querySelectorAll(".topic").forEach(function (t, i) {
        setListNewTopic(t);
    });
});

//delete list
$(document).on("click", ".delete-list", function () {
    const list = $(this).closest(".list-row");
    const id = list.closest(".list").attr("id");
    if (list.attr("type") == "new") {
        list.remove();
        return;
    }
    list.addClass("hidden");
    list.attr("status", 0);
    list.attr("type", "del");
    renumber(`#${id} .list-row`, "seq");
});

// save
$(document).on("click", "#save-button", async function () {
    try {
        if (
            !(await requiredForm("#save", [
                {
                    element: $("#reason"),
                    message: "Please enter a reason for the changes.",
                },
            ]))
        ) {
            return;
        }
        const topic = document.querySelectorAll(`.topic`);
        const list = document.querySelectorAll(`.list-row`);
        const data = {
            topic: [],
            list: [],
            reason: $("#reason").val(),
            incharge: $(".userid").attr("userid"),
        };
        topic.forEach((t) => {
            if (
                (t.getAttribute("type") == "edit" ||
                    t.getAttribute("type") == "new" ||
                    t.getAttribute("type") == "del") &&
                chooseDetail(t.querySelector(".topic-input"))
            ) {
                data.topic.push({
                    rev: t.getAttribute("rev"),
                    topic: t.getAttribute("topic"),
                    new_topic: t.getAttribute("new-topic"),
                    status: t.getAttribute("status"),
                    type: t.getAttribute("type"),
                    detail: chooseDetail(t.querySelector(".topic-input")),
                });
            }
        });
        list.forEach((l) => {
            if (
                (l.getAttribute("type") == "edit" ||
                    l.getAttribute("type") == "new" ||
                    l.getAttribute("type") == "del") &&
                chooseDetail(l.querySelector(".list-input"))
            ) {
                data.list.push({
                    rev: l.getAttribute("rev"),
                    topic: l.getAttribute("topic"),
                    new_topic: l.getAttribute("new-topic"),
                    seq: l.getAttribute("seq"),
                    new_seq: l.getAttribute("new-seq"),
                    status: l.getAttribute("status"),
                    type: l.getAttribute("type"),
                    detail: chooseDetail(l.querySelector(".list-input")),
                });
            }
        });
        logtest("data = ", data);
        if (data.topic.length === 0 && data.list.length === 0) {
            showMessage("No changes to save.", "warning");
            return;
        }
        const res = await saveMaster(data);
        console.log(res);
        if (res.status) {
            resetForm();
            showMessage("Save successfully.", "success");
        } else {
            throw new Error("Failed to save data.");
        }
    } catch (error) {
        showErrorMessage(error);
    }
});

// cancel
$(document).on("click", "#cancel-button", async function () {
    await resetForm();
});
