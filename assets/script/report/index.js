import { initApp } from '../utils';
import { getReportAuthen, getFormDept } from '../service';

$(document).ready(async function () {
    await initApp();
    const user = $('#user-login').attr('empno');
    const data = await getReportAuthen(user);
    const dataFilter = data.filter((item) => item.CAUTHNO != '003');
    const formDept = await getFormDept();
    const extContainer = $('#list-report');
    extContainer.html('');
    formDept.forEach((el) => {
        const card = setExtContainer(dataFilter, el);
        if (card) {
            extContainer.append(card);
        }
    });
});

function setExtContainer(dataFilter, el) {
    const report = [];
    for (const dept of el.link) {
        const reportDept = dataFilter
            .filter((item) => item.REPORT_MASTER.VORGNO === dept)
            .sort((a, b) => a.REPORT_MASTER.NSEQ - b.REPORT_MASTER.NSEQ);
        reportDept.map((rpt) => {
            report.push(rpt);
        });
    }

    if (report.length == 0) return;

    const header = `<div class="px-4 py-3 border-b border-base-200 flex items-center justify-between gap-2 bg-base-100">
        <h3 class="text-xs font-bold uppercase tracking-wider text-primary">${el.name}</h3>
        <span class="badge badge-xs badge-primary font-mono font-bold">${report.length}</span>
    </div>`;

    let items = '';
    report.map((rpt) => {
        items += `<li class="report-item border-b border-base-200 last:border-b-0 border-l-2 border-l-transparent hover:border-l-primary hover:bg-primary/[0.05] transition-colors">
                <a href="${rpt.REPORT_MASTER.VURL}" class="flex items-center justify-between gap-2 px-4 py-2.5 w-full h-full text-xs text-base-content hover:text-primary font-medium">
                    <span class="flex items-center gap-2"><i class="fi fi-rs-paper-plane-top text-primary/70"></i><span>${rpt.REPORT_MASTER.VNAME}</span></span>
                    <i class="fi fi-rr-angle-small-right wf-mute text-sm"></i>
                </a>
            </li>`;
    });

    return `<div class="report-dept-card bg-base-100 border border-base-300 border-t-4 border-t-primary shadow-sm flex flex-col">
        ${header}
        <ul class="flex flex-col">${items}</ul>
    </div>`;
}

function filterReports() {
    const query = ($('#search-form').val() || '').trim().toLowerCase();
    $('#list-report .report-dept-card').each(function () {
        const card = $(this);
        const deptName = card.find('h3').text().toLowerCase();
        const deptMatch = query !== '' && deptName.includes(query);
        let visibleCount = 0;

        card.find('.report-item').each(function () {
            const item = $(this);
            const text = item.text().toLowerCase();
            const match = query === '' || deptMatch || text.includes(query);
            item.toggle(match);
            if (match) visibleCount += 1;
        });

        card.toggle(visibleCount > 0);
    });
}

$(document).on('keyup', '#search-form', function () {
    filterReports();
});

$(document).on('click', '.clear-search-form', function () {
    const input = $('#search-form');
    input.val('').trigger('keyup');
    input.focus();
});

$(document).on('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = $('#search-form');
        input.focus();
        input.select();
    }
});
