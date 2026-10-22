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
        setExtContainer(dataFilter, el);
        extContainer.append(setExtContainer(dataFilter, el));
    });
});

function setExtContainer(dataFilter, el) {
    let start = 0;
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

    let str = `<h3 class="text-primary text-xl font-bold mb-3">${el.name}</h3>`;
    report.map((rpt) => {
        str += `<li class="border border-base-200 rounded-2xl hover:bg-primary hover:text-white!">
                <a href="${rpt.REPORT_MASTER.VURL}" class="flex px-4 py-2  w-full h-full text-xs"><i class="fi fi-rs-paper-plane-top me-2"></i>${rpt.REPORT_MASTER.VNAME}</a>
            </li>`;
        start += 1;
    });
    return `<ul class="group bg-white p-4 card border border-base-300 rounded-lg shadow-md flex flex-col gap-2" style="grid-row-end: span ${start}">${str}</ul>`;
}
