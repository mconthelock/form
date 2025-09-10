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
                html += `<li class="list-row rounded-none flex items-center gap-5 ${cls} relative" rev="${item.ARM_REV}" topic="${item.ARM_NO}" seq="${item.ARM_SEQ}" status="${item.ARM_STATUS}">
                    <i class="icofont-drag handleList cursor-grab"></i>
                    <span class="list-input">${item.ARM_DETAIL}</span>
                    <div class="flex hover:gap-3 absolute px-4 py-2 right-8 border shadow-lg rounded group ${item.ARM_STATUS == 0 ? 'bg-gray-400' : 'bg-neutral'} text-white">
                        <span class="list-factor w-0 group-hover:w-fit opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:transition-all group-hover:duration-500 group-hover:ease-out whitespace-nowrap" factor="${item.ARM_FACTOR}">Factor </span>
                        <span class="font-bold">${item.ARM_FACTOR}</span>
                    </div>
                    <div class="list-maxScore hidden" maxScore="${item.ARM_MAXSCORE}">${item.ARM_MAXSCORE}</div>
                </li>`;
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
        calculateTotal();
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
        li.setAttribute(`new-${attr}`, i + 1); // set อันดับใหม่
        // li.setAttribute("type", "edit");
        const type = li.getAttribute("type");
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
                $(element)
                    .find(".list-factor")
                    .each((i, el) => {
                        $(el).find("input").prop("disabled", false);
                    });
                $(element)
                    .find(".list-maxScore")
                    .each((i, el) => {
                        $(el).find("input").prop("disabled", false);
                    });
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
                $(element)
                    .find(".list-factor")
                    .each((i, el) => {
                        $(el).find("input").prop("disabled", true);
                    });
                $(element)
                    .find(".list-maxScore")
                    .each((i, el) => {
                        $(el).find("input").prop("disabled", true);
                    });
            }
        });
    }
    calculateTotal();
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
    const factor = listRow.find(".list-factor");
    const maxScore = listRow.find(".list-maxScore");
    // const type = listRow.attr("type");
    // if (type != "new") listRow.attr("type", "edit");
    setTypeEdit(listRow[0], listRow.attr("type"), ["new"]);
    if ($(this).is(":checked")) {
        listRow.removeClass("!bg-red-100 line-through");
        listRow.attr("status", 1);
        listInput.attr("disabled", false);
        factor.each((i, el) => {
            $(el).find("input").prop("disabled", false);
        });
        maxScore.each((i, el) => {
            $(el).find("input").prop("disabled", false);
        });
    } else {
        listRow.addClass("!bg-red-100 line-through");
        listRow.attr("status", 0);
        listInput.attr("disabled", true);
        factor.each((i, el) => {
            $(el).find("input").prop("disabled", true);
        });
        maxScore.each((i, el) => {
            $(el).find("input").prop("disabled", true);
        });
        listRow.appendTo(`#${id}`); // ย้ายรายการไปไว้ท้ายสุด
        renumber(`#${id} .list-row`, "seq");
    }
    calculateTotal();
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
                    $(el).find(".list-input").prop("disabled", false);
                    $(el)
                        .find(".list-factor")
                        .each((i, el) => {
                            $(el).find("input").prop("disabled", false);
                        });
                    $(el)
                        .find(".list-maxScore")
                        .each((i, el) => {
                            $(el).find("input").prop("disabled", false);
                        });
                    // $(el).find(".list-status").removeClass("btn-disabled");
                    $(el).find(".delete-list").removeClass("btn-disabled");
                });
            calculateTotal();
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
                            <li class="list-row rounded-none flex items-center gap-5 bg-white" topic="${newId}" new-topic="${newId}" seq="1" new-seq="1" status="1" type="new">
                                <i class="icofont-drag handleList cursor-grab"></i>
                                ${input({
                                    cls: "list-input",
                                    attr: 'disabled="disabled"',
                                })}
                                <div class="list-factor bg-[#ebf0f0] p-1 rounded flex items-center gap-1" factor="1">
                                    <span class="font-bold text-nowrap ">Factor</span>
                                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-${newId}-1" aria-label="1" value="1" checked="checked" disabled="disabled" />
                                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-${newId}-1" aria-label="2" value="2" disabled="disabled"/>
                                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-${newId}-1" aria-label="3" value="3" disabled="disabled"/>
                                </div>
                                <div class="list-maxScore  bg-[#ebf0f0] p-1 rounded flex items-center gap-1" maxScore="3">
                                    <span class="font-bold text-nowrap ">Max score</span>
                                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-max-${newId}-1" aria-label="1" value="1" disabled="disabled"/>
                                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-max-${newId}-1" aria-label="2" value="2" disabled="disabled"/>
                                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-max-${newId}-1" aria-label="3" value="3" checked="checked" disabled="disabled"/>
                                </div>
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
    const topic = $(this).closest(".topic");
    if (!topic.siblings(".toggle-list").is(":checked")) {
        topic.trigger("click"); // เปิดหัวข้อ
        expandFocus();
    }
    const topicNo = topic.attr("topic");
    const list = $(this).closest(".collapse").find(".list");
    const newSeq = list.find(".list-row").length + 1;
    const html = `<li class="list-row rounded-none flex items-center gap-5 bg-white" topic="${topicNo}" ${
        topic.attr("new-topic") ? `new-topic="${topic.attr("new-topic")}" ` : ""
    }" seq="${newSeq}" new-seq="${newSeq}" status="1" type="new">
                        <i class="icofont-drag handleList cursor-grab"></i>
                        ${input({ cls: "list-input" })}
                        <div class="list-factor bg-[#ebf0f0] p-1 rounded flex items-center gap-1" factor="1">
                            <span class="font-bold text-nowrap ">Factor</span>
                            <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-${topicNo}-${newSeq}" aria-label="1" value="1" checked="checked" />
                            <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-${topicNo}-${newSeq}" aria-label="2" value="2"/>
                            <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-${topicNo}-${newSeq}" aria-label="3" value="3"/>
                        </div>
                        <div class="list-maxScore  bg-[#ebf0f0] p-1 rounded flex items-center gap-1" maxScore="3">
                            <span class="font-bold text-nowrap ">Max score</span>
                            <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-max-${topicNo}-${newSeq}" aria-label="1" value="1"/>
                            <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-max-${topicNo}-${newSeq}" aria-label="2" value="2"/>
                            <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="new-max-${topicNo}-${newSeq}" aria-label="3" value="3" checked="checked"/>
                        </div>
                        ${btnDel({ cls: "delete-list" })}
                    </li>`;
    list.append(html);
    calculateTotal();
});

// click edit
$(document).on("click", "#edit-button", async function () {
    editMode = true;
    showReasonArea();
    $("#edit-button").attr("disabled", true);
    $("#add-topic").removeClass("hidden");
    $(".topic").each((index, element) => {
        const statusT = $(element).attr("status");
        const text = $(element).find(".topic-input").text();
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
            .each((i, e) => {
                const topic = $(e).attr("topic");
                const seq = $(e).attr("seq");
                const text = $(e).find(".list-input").text();
                const status = $(e).attr("status");
                const disabled =
                    status == 0 || statusT == 0 ? 'disabled="disabled"' : "";
                const factor = $(e).find(".list-factor").attr("factor");
                const maxScore = $(e).find(".list-maxScore").attr("maxScore");
                $(e).html(`<i class="icofont-drag handleList cursor-grab"></i>
                ${input({ val: text, cls: "list-input", attr: disabled })}
                <div class="list-factor bg-[#ebf0f0] border border-gray p-1 rounded flex items-center gap-1" factor="${factor}">
                    <span class="font-bold text-nowrap ">Factor</span>
                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="${topic}-${seq}" aria-label="1" value="1" ${
                    factor == 1 ? 'checked="checked"' : ""
                } />
                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="${topic}-${seq}" aria-label="2" value="2" ${
                    factor == 2 ? 'checked="checked"' : ""
                } />
                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="${topic}-${seq}" aria-label="3" value="3" ${
                    factor == 3 ? 'checked="checked"' : ""
                } />
                </div>
                <div class="list-maxScore  bg-[#ebf0f0] border border-gray p-1 rounded flex items-center gap-1" maxScore="${maxScore}">
                    <span class="font-bold text-nowrap ">Max score</span>
                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="max-${topic}-${seq}" aria-label="1" value="1" ${
                    maxScore == 1 ? 'checked="checked"' : ""
                } />
                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="max-${topic}-${seq}" aria-label="2" value="2" ${
                    maxScore == 2 ? 'checked="checked"' : ""
                } />
                    <input class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm" type="radio" name="max-${topic}-${seq}" aria-label="3" value="3" ${
                    maxScore == 3 ? 'checked="checked"' : ""
                } />
                </div>
                ${btnStatus({ status: status, attr: disabledT })}
                ${btnDel({ cls: "delete-list", attr: disabledT })}`);
            });
    });
});

// delete topic
$(document).on("click", ".delete-topic", function (e) {
    e.stopPropagation();
    const topic = $(this).closest(".topic");
    if (topic.attr("type") == "new") {
        topic.closest(".collapse").remove();
        calculateTotal();
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
    calculateTotal();
});

//delete list
$(document).on("click", ".delete-list", function () {
    const list = $(this).closest(".list-row");
    const id = list.closest(".list").attr("id");
    if (list.attr("type") == "new") {
        list.remove();
        calculateTotal();
        return;
    }
    list.addClass("hidden");
    list.attr("status", 0);
    list.attr("type", "del");
    renumber(`#${id} .list-row`, "seq");
    calculateTotal();
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
                    factor: l.querySelector(".list-factor").getAttribute("factor"),
                    maxScore: l
                        .querySelector(".list-maxScore")
                        .getAttribute("maxScore"),
                });
            }
        });
        logtest("data = ", data);
        if (data.topic.length === 0 && data.list.length === 0) {
            showMessage("No changes to save.", "warning");
            return;
        }
        if (calculateTotal() > 100) {
            showMessage("The total factor must not exceed 100.", "warning");
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

function calculateTotal() {
    let sum = 0;
    document.querySelectorAll(`.list-row:not(.hidden)`).forEach((l) => {
        if (l.getAttribute("status") == 1) {
            const factor = l
                .querySelector(".list-factor")
                .getAttribute("factor");
            const maxScore = l
                .querySelector(".list-maxScore")
                .getAttribute("maxScore");
            sum += parseInt(factor) * parseInt(maxScore);
        }
    });
    $("#total").html(sum);
    if (sum > 100) {
        $("#total").closest("button").removeClass("btn-neutral");
        $("#total").closest("button").addClass("btn-error");
        showMessage("The total factor must not exceed 100.", "warning");
    } else {
        $("#total").closest("button").addClass("btn-neutral");
        $("#total").closest("button").removeClass("btn-error");
    }
    return sum;
}

$(document).on("click", '.list-factor input[type="radio"]', function () {
    const val = $(this).val();
    const factor = $(this).closest(".list-factor");
    factor.attr("factor", val);
    setTypeEdit(
        factor.closest(".list-row")[0],
        factor.closest(".list-row").attr("type"),
        ["new"]
    );
    calculateTotal();
});

$(document).on("click", '.list-maxScore input[type="radio"]', function () {
    const val = $(this).val();
    const maxScore = $(this).closest(".list-maxScore");
    maxScore.attr("maxScore", val);
    setTypeEdit(
        maxScore.closest(".list-row")[0],
        maxScore.closest(".list-row").attr("type"),
        ["new"]
    );
    calculateTotal();
});
