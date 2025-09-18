import { formatDate } from "../../public/v1.0.3/_dayjs";
import { host, logtest } from "../../public/v1.0.3/jFuntion";
import { displayEmpImage } from "../../public/v1.0.3/setIndexDB";
import { btnMinus, btnPlus, inputNum, radio } from "./component";
import { handleClassList, setAuditorToString } from "./function";

const createScoreBoard = () => `
<div class="lg:absolute right-8 w-full lg:w-40 rounded-2xl border border-slate-200 shadow-sm overflow-hidden z-[20]" id="score">
    <div class="bg-[#3c8dbc] text-white px-3 py-1.5 text-sm text-center font-bold">Total Score</div>
    <div class="p-3 text-center">
        <div class="text-4xl font-extrabold leading-none" id="totalScore">0</div>
        <div class="text-xs text-slate-500 mt-1">
            <span>/</span>
            <span id="total">100</span>
        </div>
    </div>
</div>`;

async function createTableAuditMaster(data, audit = 0, score = []) {
    logtest("Audit Master Data", data);
    logtest("Audit Data", audit);
    logtest("Score Data", score);
    let total = 0;
    let html = `<div class="overflow-y-auto w-full  max-h-[80vh] rounded-lg shadow" id="auditReport">
        <table class="table w-full">
            <colgroup>
                <col class="w-fit border">
                <col class="w-full border">
                <col class="w-fit border">
                <col class="w-fit border">
                <col class="w-fit border">
                <col class="w-fit border">
            </colgroup>
            <thead class="sticky top-0 z-10 text-center">
                <tr class="bg-[#3c8dbc] font-bold text-white">
                    <th>No.</th>
                    <th>Topic</th>
                    <th>Factor</th>
                    <th>Audit</th>
                    <th>Result</th>
                    <th class="flex flex-col justify-center">
                        <span>Suggestion/</span>
                        <span>Comment</span>
                    </th>
                </tr>
            </thead>
            <tbody>`;
    data.forEach((item, index) => {
        total += parseInt(item.ARM_MAXSCORE) * parseInt(item.ARM_FACTOR);
        if (item.ARM_TYPE == "H") {
            html += `<tr class="bg-gray-300">
                <td colspan="6" class="font-bold">${item.ARM_NO}. ${item.ARM_DETAIL}</td>
            </tr>`;
        } else {
            const foundscore = score.find(
                (s) => s.QAA_TOPIC == item.ARM_NO && s.QAA_SEQ == item.ARM_SEQ
            );
            const valScore = foundscore ? parseInt(foundscore.QAA_AUDIT) : 0;
            const valComment = foundscore ? foundscore.QAA_COMMENT ?? "-" : "-";
            html += `<tr class="list-row ${handleClassList(
                item.ARM_SEQ
            )}" topic="${item.ARM_NO}" seq="${item.ARM_SEQ}">
                <td></td>
                <td>${item.ARM_DETAIL}</td>
                <td class="flex justify-center text-white font-bold">
                    <span class="px-4 py-2 right-8 border shadow-lg rounded bg-neutral list-factor" factor="${
                        item.ARM_FACTOR
                    }">
                        ${item.ARM_FACTOR}
                    </span>
                </td>
                <td class="text-center">
                    <div class="join list-maxScore" maxScore="${
                        item.ARM_MAXSCORE
                    }">`;
            if (audit != 1) {
                html += btnMinus({ cls: "join-item" });
                html += inputNum({
                    name: `score-${item.ARM_NO}-${item.ARM_SEQ}`,
                    val: valScore,
                    max: item.ARM_MAXSCORE,
                    cls: "join-item audit-score text-center req",
                });
                html += btnPlus({ cls: "join-item" });
            } else {
                html += `<span class="audit-score">${valScore}</span>`;
            }
            html += `
                    </div>
                </td>
                <td class="text-center"><span class="result"></span></td>
                <td class="flex justify-center join">`;
            if (audit != 1) {
                html += radio({
                    name: `list-${item.ARM_NO}-${item.ARM_SEQ}`,
                    val: "S",
                    cls: "join-item cs-radio [&:not(:checked)]:bg-white btn-lg",
                    checked: foundscore ? foundscore.QAA_COMMENT == "S" : false,
                });
                html += radio({
                    name: `list-${item.ARM_NO}-${item.ARM_SEQ}`,
                    val: "C",
                    cls: "join-item cs-radio [&:not(:checked)]:bg-white btn-lg",
                    checked: foundscore ? foundscore.QAA_COMMENT == "C" : false,
                });
            } else {
                html += `<span>${valComment}</span>`;
            }
            html += `
                </td>
            </tr>`;
        }
    });

    html += `</tbody>
        </table>
    </div>`;
    return html;
}

async function createDetail(data, auditee) {
    const auditor = setAuditorToString(data);
    const item = data.QA_ITEM;
    const auditees = setAuditorToString(data, "ESO");
    const name = auditee.QOA_EMPNO_INFO.SNAME;
    const empno = auditee.QOA_EMPNO_INFO.SEMPNO;
    const img = await displayEmpImage(empno);

    let html = `
        <table class="table w-full">
            <colgroup>
                <col class="w-fit border">
                <col class="w-fit border">
                <col class="w-full border">
                <col class="w-fit border">
            </colgroup>
            <tbody>
                <tr>
                    <td colspan="2" class="font-bold text-nowrap">Item</td>
                    <td class="" id="detail-item">${item}</td>
                    <td rowspan="2" class="w-full h-full text-center">
                        <div class="avatar">
                            <div class="w-32 rounded">
                                <img id="detail-user-img" class="" src="${img}" />
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td rowspan="3" class="text-center font-bold">Participant</td>
                    <td class="font-bold text-nowrap">Auditor</td>
                    <td id="detail-auditor" class="min-w-60">${auditor}</td>
                </tr>
                <tr>
                    <td class="font-bold text-nowrap">Auditee</td>
                    <td id="detail-auditee" class="min-w-60">${auditees}</td>
                    <td id="detail-auditee-name" class="text-nowrap">${name}</td>
                </tr>
                <tr>
                    <td class="font-bold text-nowrap">Audit date</td>
                    <td id="detail-audit-date">${formatDate(data.QA_OJT_DATE)}</td>
                    <td id="detail-auditee-empno" class="text-center">${empno}</td>
                </tr>
            </tbody>
        </table>`;
    return html;
}

async function createTableRevision(revision) {
    let html = `<table id="tableRevision" class="table table-zebra">
                <thead class="sticky top-0 z-20 bg-[#3c8dbc] text-white">
                    <tr>
                        <th>Revision</th>
                        <th>Date</th>
                        <th>In-charge</th>
                        <th>Reason</th>
                        <th>View</th>
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
                <td><a href="${host}/qaform/QA-INS/form/preview/${rev.ARR_SECID}/${
            rev.ARR_REV
        }" target="_blank" class="btn btn-sm btn-primary"><i class="icofont-eye-alt"></i></a></td>
            </tr>
        `;
    }
    if (revision.length === 0) {
        html += `<tr><td colspan="4" class="text-center">No data available in table</td></tr>`;
    }
    html += `</tbody></table>`;
    return html;
}

async function createTableCS(){
    let html = `<table id="tableCS" class="table w-full">
        <colgroup>
            <col class="border">
            <col class="border">
            <col class="border">
        </colgroup>
        <thead>
            <tr>
                <td>Audit result</td>
                <td>Improvment activity</td>
                <td>Picture</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="p-0">
                    <textarea class="w-full h-full p-4 autosize autosize-match" id="audit-result" placeholder="Enter audit result here..."></textarea>   
                </td>
                <td class="p-0">
                    <textarea class="w-full h-full p-4 autosize autosize-match" id="audit-activity" placeholder="Enter audit activity here..."></textarea>   
                </td>
                <td></td>
            </tr>
        </tbody>
    </table>`;
    return html;
}

function calScoreTotal() {
    let total = 0;
    let score = 0;
    $(".list-row").each((i, el) => {
        const factor = parseInt($(el).find(".list-factor").attr("factor"));
        const maxScore = parseInt(
            $(el).find(".list-maxScore").attr("maxScore")
        );
        const auditScore = $(el).find(".audit-score");
        const res =
            parseInt(auditScore.val() || auditScore.text() || 0) * factor;
        $(el).find(".result").text(res);
        score += res;
        total += maxScore * factor;
    });
    return { total, score };
}

function setScore() {
    const { total, score } = calScoreTotal();
    $("#totalScore").text(score);
    $("#total").text(total);
}

$(document).on("click", ".plus", function () {
    const input = $(this).siblings(".audit-score");
    let val = parseInt(input.val());
    const max = parseInt(input.attr("max"));

    if (val < max) {
        val++;
        input.val(val);
    }
    setScore();
});

$(document).on("click", ".minus", function () {
    const input = $(this).siblings(".audit-score");
    const min = parseInt(input.attr("min")) || 0;
    let val = parseInt(input.val());
    if (val > min) {
        val--;
        input.val(val);
    }
    setScore();
});

$(document).on("change", ".audit-score", function () {
    let val = parseInt($(this).val());
    const max = parseInt($(this).attr("max"));
    const min = parseInt($(this).attr("min")) || 0;
    if (val > max) {
        val = max;
        $(this).val(val);
    }
    if (val < min || isNaN(val)) {
        val = min;
        $(this).val(val);
    }
    setScore();
});

export {
    createTableAuditMaster,
    createScoreBoard,
    calScoreTotal,
    setScore,
    createDetail,
    createTableRevision,
    createTableCS
};
