import { getAuditRevision } from "../../api/escs/audit_revision";
import { skeleton } from "../../public/v1.0.3/component/skeleton";
import { formatDate } from "../../public/v1.0.3/_dayjs";
import { getAuditMaster } from "../../api/escs/audit_master";
import { showErrorMessage } from "../../public/v1.0.3/jFuntion";

import Sortable, { create } from "sortablejs";

let sortables = [];

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
    let html = `<div class="join join-vertical w-full" id="list">`;
    for (const item of master) {
        if (item.ARM_TYPE == "H") {
            html += `<div class="collapse collapse-arrow bg-base-100 border-base-300 border join-item">
                        <input type="checkbox" checked="checked" class='toggle-list'/>
                        <div class="collapse-title font-semibold bg-[#3c8dbc] text-white flex gap-3 topic" old-no="${item.ARM_NO}"><i class="icofont-drag handle cursor-grab"></i>${item.ARM_DETAIL}</div>
                        <ul class="collapse-content text-sm list" id="list-master-${item.ARM_NO}">`;
        } else {
            const cls =
                item.ARM_STATUS == 0
                    ? "bg-red-100 text-gray-400 line-through cursor-not-allowed"
                    : handleClassList(item.ARM_SEQ);
            html += `<li class="list-row rounded-none flex items-center gap-3 ${cls}" old-seq="${item.ARM_SEQ}" status="${item.ARM_STATUS}"><i class="icofont-drag handle cursor-grab"></i>${item.ARM_DETAIL}</li>`;
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
    $("#list").replaceWith(html);
    $(".toggle-list").addClass("sr-only");
    await sortablesDestroy();

    const option = {
        forceFallback: true,
        handle: ".handle",
        animation: 150,
        ghostClass: "bg-[#64b0db]!", // เวลาลาก
        chosenClass: "bg-[#64b0db]!", // เวลาคลิก
        // dragClass: 'bg-[#64b0db]!'
        onStart: function (evt) {
            evt.item.querySelector(".handle").classList.remove("cursor-grab");
            evt.item.querySelector(".handle").classList.add("cursor-grabbing");
        },
    };

    document.querySelectorAll("#list").forEach(function (el) {
        let s = new Sortable(el, {
            ...option,
            onEnd: function (/**Event*/ evt) {
                evt.item
                    .querySelector(".handle")
                    .classList.remove("cursor-grabbing");
                evt.item.querySelector(".handle").classList.add("cursor-grab");
                var items = evt.to.querySelectorAll(".topic");
                items.forEach(function (item, index) {
                    const oldNo = item.getAttribute("old-no");
                    if (oldNo != index + 1) {
                        item.setAttribute("edit", true);
                        showReasonArea();
                    } else {
                        // item.removeAttribute("edit");
                    }
                    item.setAttribute("new-no", index + 1);
                });
            },
        });
        sortables.push(s);
    });

    document.querySelectorAll(".list").forEach(function (el) {
        let s = new Sortable(el, {
            ...option,
            onEnd: function (/**Event*/ evt) {
                evt.item
                    .querySelector(".handle")
                    .classList.remove("cursor-grabbing");
                evt.item.querySelector(".handle").classList.add("cursor-grab");
                var items = evt.to.querySelectorAll(".list-row");
                items.forEach(function (item, index) {
                    const oldSeq = item.getAttribute("old-seq");
                    if (oldSeq != index + 1) {
                        item.setAttribute("edit", true);
                        showReasonArea();
                    } else {
                        // item.removeAttribute("edit");
                    }
                    item.setAttribute("new-seq", index + 1);
                    item.classList.remove("bg-base-200", "bg-white");
                    item.classList.add(handleClassList(index));
                });
            },
        });
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

function collapseFocus(){
    $("#expand-button").addClass("btn-outline");
    $("#collapse-button").removeClass("btn-outline");
}

function expandFocus(){
    $("#collapse-button").addClass("btn-outline");
    $("#expand-button").removeClass("btn-outline");
}

$(document).on("click", "#collapse-button", function () {
    // $(this).removeClass("btn-outline");
    // $("#expand-button").addClass("btn-outline");
    collapseFocus();
    $(".toggle-list").each((index, element) => {
        // $(element).attr("checked", false);
        if (element.checked) {
            element.click(); // toggle ถ้ายัง checked
        }
    });
});

$(document).on("click", "#expand-button", function () {
    // $(this).removeClass("btn-outline");
    // $("#collapse-button").addClass("btn-outline");
    expandFocus();
    $(".toggle-list").each((index, element) => {
        // $(element).attr("checked", true);
        if (!element.checked) {
            element.click(); // toggle ถ้ายังไม่ checked
        }
    });
});

$(document).on("click", "#edit-button", async function () {
    showReasonArea();
    // await sortablesDestroy();
    $("#edit-button").attr("disabled", true);
    $("#add-button").removeClass("hidden");
    // $(".toggle-list").addClass("hidden");
    // หัวข้อ
    $(".topic").each((index, element) => {
        const text = $(element).text();
        $(element)
            .html(`<i class="icofont-drag handle cursor-grab"></i><input type="text" class="input w-full text-black" value="${text}"/>
            <button class="add-detail btn"><i class="icofont-ui-add"></i> Add list</button>`);
    });

    // รายการ
    $(".list-row").each((index, element) => {
        const text = $(element).text();
        const status = $(element).attr("status");
        $(element).html(`<i class="icofont-drag handle cursor-grab"></i>
            <input type="text" class="input w-full list-input" value="${text}"/>
            <div class="btn btn-outline flex items-center gap-2 list-status">
                Status
                <input type="checkbox" ${
                    status == 1 ? 'checked="checked"' : ""
                } class="toggle toggle-xl toggle-success " />
            </div>
            <button class="btn btn-error delete-list"><i class="icofont-ui-delete"></i> Delete</button>
            `);
    });
});

$(document).on("click", "#cancel-button", async function () {
    $("#save").addClass("hidden");
    $("#add-button").addClass("hidden");
    expandFocus();
    await createList();
});

// Collapse/Expand topic
$(document).on("click", ".collapse-title.topic", function () {
    // $(this).siblings('.toggle-list').is(':checked') ? $(this).siblings(".toggle-list").attr("checked", false) : $(this).siblings(".toggle-list").attr("checked", true);
    $(this).siblings(".toggle-list").trigger("click");
});

$(document).on("click", ".list-status", function () {
    const toggle = $(this).find('.list-status input[type="checkbox"]');
    toggle.trigger("click");
    // toggle.is(':checked') ? toggle.attr("checked", false) : toggle.attr("checked", true);
});

$(document).on("click", '.list-status input[type="checkbox"]', function (e) {
    e.stopPropagation();
    const listRow = $(this).closest(".list-row");
    const listInput = listRow.find(".list-input");
    listRow.attr("edit", true);

    console.log(2);
    if ($(this).is(":checked")) {
        listRow.removeClass("!bg-red-100");
        listInput.attr("disabled", false);
    } else {
        listRow.addClass("!bg-red-100");
        listInput.attr("disabled", true);
    }
});

$(document).on("click", ".topic input", function (e) {
    e.stopPropagation();
});

$(document).on("click", ".topic .add-detail", function (e) {
    e.stopPropagation();
});
