import { getAuditRevision } from "../../api/escs/audit_revision";
import { skeleton } from "@public/component/skeleton";
import { formatDate } from "@public/_dayjs";
import { getAuditMaster } from "../../api/escs/audit_master";
import { logtest, showErrorMessage } from "@public/jFuntion";

import Sortable, { create } from "sortablejs";
import { btnAdd, btnDel, btnStatus, input } from "./component";

let sortables = [];

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
        var items = evt.to.querySelectorAll(clsList);
        items.forEach(function (item, index) {
            const oldNo = item.getAttribute(`old-${attr}`);
            if (oldNo != index + 1 && item.getAttribute("new") != "true") {
                item.setAttribute("edit", true);
                showReasonArea();
            } else {
                // item.removeAttribute("edit");
            }
            item.setAttribute(`new-${attr}`, index + 1);
        });
    },
});

$(async function () {
    try {
        await setPage();
    } catch (error) {
        showErrorMessage(error);
    }
});

async function setPage() {
    $("body").addClass("bg-[#ecf0f5]");
    await setSkeleton();
    await tableRevision();
    await createList();
}

async function setSkeleton() {
    skeleton({ element: "#revision", width: "w-32", height: "h-12" });
    skeleton({ element: "#tableRevision", width: "w-96", height: "h-72" });
    skeleton({ element: "#master", width: "w-32", height: "h-12" });
    skeleton({ element: "#tableMaster", width: "w-full", height: "h-[60vh]" });
}

async function tableRevision() {
    const revision = await getAuditRevision();
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

async function createList() {
    const master = await getAuditMaster();
    $("#master").text("Master");
    $("#edit-button").attr("disabled", false);
    $("#collapse-button").attr("disabled", false);
    $("#expand-button").attr("disabled", false);
    let html = `<div class="join join-vertical w-full" id="masterList">`;
    for (const item of master) {
        if (item.ARM_TYPE == "H") {
            html += `<div class="collapse collapse-arrow bg-base-100 border-base-300 border join-item">
                        <input type="checkbox" checked="checked" class='toggle-list sr-only'/>
                        <div class="collapse-title font-semibold bg-[#3c8dbc] text-white flex gap-3 topic" old-no="${item.ARM_NO}" status="${item.ARM_STATUS}"><i class="icofont-drag handle cursor-grab"></i>${item.ARM_DETAIL}</div>
                        <ul class="collapse-content text-sm list" id="list-master-${item.ARM_NO}">`;
        } else {
            const cls =
                item.ARM_STATUS == 0
                    ? "bg-red-100 text-gray-400 line-through cursor-not-allowed"
                    : handleClassList(item.ARM_SEQ);
            html += `<li class="list-row rounded-none flex items-center gap-3 ${cls}" old-seq="${item.ARM_SEQ}" status="${item.ARM_STATUS}"><i class="icofont-drag handleList cursor-grab"></i>${item.ARM_DETAIL}</li>`;
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
            sortOpt({ handle: ".handle", clsList: ".topic", attr: "no" })
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
    li.setAttribute("edit", true);
  });
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

// click edit
$(document).on("click", "#edit-button", async function () {
    showReasonArea();
    // await sortablesDestroy();
    $("#edit-button").attr("disabled", true);
    $("#add-topic").removeClass("hidden");
    // $(".toggle-list").addClass("hidden");
    // หัวข้อ
    $(".topic").each((index, element) => {
        const status = $(element).attr("status");
        const text = $(element).text();
        $(element).html(`<i class="icofont-drag handle cursor-grab"></i>
            ${input({ val: text, cls: "topic-input" })}
            ${btnAdd({ cls: "add-list", text: "Add list" })}
            ${btnStatus({ status: status })}
            ${btnDel({ cls: "delete-topic" })}`);
    });

    // รายการ
    $(".list-row").each((index, element) => {
        const text = $(element).text();
        const status = $(element).attr("status");
        $(element).html(`<i class="icofont-drag handleList cursor-grab"></i>
            ${input({ val: text, cls: "list-input" })}
            ${btnStatus({ status: status })}
            ${btnDel({ cls: "delete-list" })}`);
    });
});

// save
$(document).on("click", "#save-button", async function () {
    logtest('-- save --');
    logtest('Topic = ', $(".topic").not(".hidden"));
    logtest('List = ', $(".list-row").not(".hidden"));
    const topic = document.querySelectorAll(`.topic:not(.hidden)`);
    const list = document.querySelectorAll(`.list-row:not(.hidden)`);
    const data = { topic: [], list: [] };
    topic.forEach((t) => {
        if (t.getAttribute("edit") == "true" || t.getAttribute("new") == "true" || t.getAttribute("del") == "true") {
            data.topic.push({
                old_no: t.getAttribute("old-no"),
                new_no: t.getAttribute("new-no"),
                status: t.getAttribute("status"),
                detail: t.querySelector(".topic-input").value,
            });
        }
    });
    list.forEach((l) => {
        if (l.getAttribute("edit") == "true" || l.getAttribute("new") == "true" || l.getAttribute("del") == "true") {
            data.list.push({
                old_seq: l.getAttribute("old-seq"),
                new_seq: l.getAttribute("new-seq"),
                status: l.getAttribute("status"),
                detail: l.querySelector(".list-input").value,
                topic_no: l.closest(".list").id.replace("list-master-", ""),
            });
        }
    });
    logtest('data = ', data);

});

// cancel
$(document).on("click", "#cancel-button", async function () {
    $("#save").addClass("hidden");
    $("#add-topic").addClass("hidden");
    expandFocus();
    await createList();
});

// Collapse/Expand topic
$(document).on("click", ".collapse-title.topic", function () {
    // $(this).siblings('.toggle-list').is(':checked') ? $(this).siblings(".toggle-list").attr("checked", false) : $(this).siblings(".toggle-list").attr("checked", true);
    $(this).siblings(".toggle-list").trigger("click");
});

$(document).on("click", ".list-status", function (e) {
    e.stopPropagation();
    const toggle = $(this).find('input[type="checkbox"]');
    toggle.trigger("click");
    // toggle.is(':checked') ? toggle.attr("checked", false) : toggle.attr("checked", true);
});

$(document).on("click", '.list-status input[type="checkbox"]', function (e) {
    e.stopPropagation();
    const listRow = $(this).closest(".list-row");
    const listInput = listRow.find(".list-input");
    listRow.attr("edit", true);
    if ($(this).is(":checked")) {
        listRow.removeClass("!bg-red-100");
        listInput.attr("disabled", false);
    } else {
        listRow.addClass("!bg-red-100");
        listInput.attr("disabled", true);
    }
});

$(document).on("click", ".topic-input", function (e) {
    e.stopPropagation();
});

$(document).on("click", ".add-list", function (e) {
    e.stopPropagation();
    const list = $(this).closest(".collapse").find(".list");
    const newSeq = list.find(".list-row").length + 1;
    const html = `<li class="list-row rounded-none flex items-center gap-3 bg-white" old-seq="${newSeq}" new-seq="${newSeq}" status="1" new="true">
                        <i class="icofont-drag handleList cursor-grab"></i>
                        ${input({ cls: "list-input" })}
                        ${btnStatus()}
                        ${btnDel({ cls: "delete-list" })}
                    </li>`;
    list.append(html);
});

$(document).on("click", ".delete-topic", function (e) {
    e.stopPropagation();
    const topic = $(this).closest(".topic");
    if(topic.attr("new") == "true"){
        topic.closest('.collapse').remove();
        return;
    }
    topic.addClass("hidden");
    topic.attr("del", true);
    topic.attr("status", 0);
    renumber(`.topic`, "no");
});

$(document).on("click", ".delete-list", function () {
    const list = $(this).closest(".list-row");
    logtest('-- delete list --');
    logtest('Attribute new = ',list.attr("new"));
    const id = list.closest('.list').attr('id');
    logtest('id = ',id);
    if (list.attr("new") == "true") {
        list.remove();
        return;
    }
    list.addClass("hidden");
    list.attr("status", 0);
    list.attr("del", true);
    renumber(`#${id} .list-row`, "seq");
});

$(document).on("click", "#add-topic", function () {
    const newId = $(".topic").length + 1;
    const html = `<div class="collapse collapse-arrow bg-base-100 border-base-300 border join-item">
                        <input type="checkbox" checked="checked" class='toggle-list sr-only'/>
                        <div class="collapse-title font-semibold bg-[#3c8dbc] text-white flex gap-3 topic" old-no="${newId}" new-no="${newId}" status="1" new="true">
                            <i class="icofont-drag handle cursor-grab"></i>
                            ${input({ cls: "topic-input" })}
                            ${btnAdd({ cls: "add-list", text: "Add list" })}
                            ${btnStatus()}
                            ${btnDel({ cls: "delete-topic" })}
                        </div>
                        <ul class="collapse-content text-sm list" id="list-master-${newId}">
                            <li class="list-row rounded-none flex items-center gap-3 bg-white" old-seq="1" new-seq="1" status="1" new="true">
                                <i class="icofont-drag handleList cursor-grab"></i>
                                ${input({ cls: "list-input" })}
                                ${btnStatus()}
                                ${btnDel({ cls: "delete-list" })}
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
