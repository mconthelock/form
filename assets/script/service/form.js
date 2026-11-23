import { displayEmpInfo } from '@amec/webasset/indexDB';
import { showMessage } from '@amec/webasset/utils';
import dayjs from 'dayjs';

export async function setRequester() {
    const inputuser = $('#EMPNO').val();
    const users = await displayEmpInfo(inputuser);
    //Requester Info
    $('#req-by-img').find('img').attr('src', users.image).removeClass('hidden');
    $('#req-by-name').html(users.SNAME);
    $('#req-by-id').html(users.SEMPNO);
    $('#req-by-organization').html(
        `${users.SDIV}` +
            (users.SDEPT ? ` - ${users.SDEPT}` : '') +
            (users.SSEC ? ` - ${users.SSEC}` : ''),
    );
    $('#req-by-info').find('.skeleton').addClass('hidden');

    // Input Employee Info
    $('#input-by-img')
        .find('img')
        .attr('src', users.image)
        .removeClass('hidden');
    $('#input-by-name').html(users.SNAME);
    $('#input-by-id').html(users.SEMPNO);
    $('#input-by-organization').html(
        `${users.SDIV}` +
            (users.SDEPT ? ` - ${users.SDEPT}` : '') +
            (users.SSEC ? ` - ${users.SSEC}` : ''),
    );
    $('#input-by-info').find('.skeleton').addClass('hidden');

    $(document).on('click', '#change-req-employee', async function (e) {
        e.preventDefault();
        $('#req-by-input').removeClass('hidden');
        $('#req-by-info').addClass('hidden');
        $('#req-by-input').focus();
    });

    $(document).on('change', '#req-by-input', async function (e) {
        e.preventDefault();
        const inputuser = $(this).val();
        const users = await displayEmpInfo(inputuser);
        if (!users) {
            await showMessage('Employee do not found.');
            $(this).val('').focus();
            return;
        }

        $('#req-by-img').find('img').attr('src', users.image);
        $('#req-by-name').html(users.SNAME);
        $('#req-by-id').html(users.SEMPNO);
        $('#req-by-organization').html(
            `${users.SDIV}` +
                (users.SDEPT ? ` - ${users.SDEPT}` : '') +
                (users.SSEC ? ` - ${users.SSEC}` : ''),
        );
        $('#req-by-info').removeClass('hidden');
        $(this).val('').addClass('hidden');
    });
}

export async function formHeader(data) {
    const setVname = (name) => {
        const arr = name.split('-');
        if (arr.length == 1) return name;

        return arr[1].substr(0, 2);
    };

    const setStatus = (status) => {
        switch (status) {
            case '1':
                return {
                    classed: 'bg-amber-200  border-amber-500 text-amber-700',
                    en: 'Approval',
                    th: 'อยู่ระหว่างการอนุมัติ',
                    icon: '<i class="fi fi-ts-duration-alt text-3xl"></i>',
                };
            case '2':
                return {
                    classed: 'bg-green-200  border-green-500 text-green-700',
                    en: 'Approved',
                    th: 'อนุมัติสมบูรณ์',
                    icon: '<i class="fi fi-rr-shield-trust text-3xl"></i>',
                };
            case '3':
                return {
                    classed: 'bg-red-200  border-red-500 text-red-700',
                    en: 'Rejected',
                    th: 'ไม่อนุมัติ',
                    icon: '<i class="fi fi-rr-message-xmark text-3xl"></i>',
                };
            default:
                return {
                    classed: 'bg-gray-200  border-gray-300 text-gray-500',
                    en: 'Unkown',
                    th: 'ไม่ระบุสถานะ/ฉบับร่าง',
                    icon: '❌',
                };
        }
    };

    const master = data.formmst;
    $('#form-header-icon').html(setVname(master.VANAME));
    $('#form-header-title').html(master.VNAME);
    $('#form-header-subtitle').html(master.VDESC);
    //const form = master.form;
    const stat = setStatus('1');
    $('#form-header-status').addClass(stat.classed);
    $('#form-header-status-icon').html(stat.icon);
    $('#form-header-status-en').html(stat.en);
    $('#form-header-status-th').html(stat.th);
}

export async function formHeaderInfo(data) {
    const setEmpInfo = (emp, el) => {
        $(el)
            .find('.img')
            .html(
                `<img src="${emp.image}" alt="Profile Image" class="h-full w-full">`,
            );

        $(el)
            .find('.name')
            .html(`${emp.SNAME} / ${emp.STNAME} (${emp.SEMPNO})`);
        $(el).find('.pos').html(emp.SPOSNAME);
        $(el).find('.org').html(`${emp.SDIV}/${emp.SDEPT}/${emp.SSEC}`);
        $(el).find('.email').html(emp.SRECMAIL);
    };
    const master = data.formmst;
    const no = `${master.VANAME}${data.CYEAR2.slice(2)}-${('000000' + data.NRUNNO).slice(-6)}`;
    const date = `${dayjs(data.DREQDATE).format('YYYY-MM-DD')} ${data.CREQTIME}`;
    $('#form-header-no').html(no);
    $('#form-header-date').html(date);
    $('#form-header-remark').html(data.VREMARK);

    const req = await displayEmpInfo(data.VREQNO);
    const inputter = await displayEmpInfo(data.VINPUTER);
    setEmpInfo(req, '#form-header-req');
    setEmpInfo(inputter, '#form-header-inputted');
}

export async function formFlowApproval(data) {
    const approvingStep = async (data) => {
        const currentStepNo = data.find((c) => c.CSTEPST == '3');
        const curName = await displayEmpInfo(currentStepNo.VAPVNO);

        const lastStepNo = data.find(
            (n) => n.CSTEPNEXTNO == currentStepNo.CSTEPNO,
        );

        return `<div class="px-4 py-2 bg-amber-200 border border-amber-300 text-amber-700 flex flex-col gap-3">
            <div class="text-xs flex flex-row items-center gap-0.5">
                <i class="fi fi-ts-arrow-circle-right text-xl me-2"></i>
                <span class="font-bold">Current Step:</span>
                <span class="bg-amber-700 rounded-full text-white px-2 py-1">${currentStepNo.steps.VNAME}</span>
                <span>${curName.SNAME} / ${curName.STNAME} (${curName.SEMPNO})</span>
            </div>
            <div class="text-xs flex flex-row items-center gap-0.5 text-green-700">
                <i class="fi fi-rs-check-circle text-xl me-2"></i>
                <span class="font-bold">Last Approved:</span>
                <span>${dayjs(lastStepNo.DAPVDATE).format('YYYY-MM-DD')} ${lastStepNo.CAPVTIME} <span class="bg-red-500 px-2 py-1 rounded-full text-white">(${dayjs().diff(dayjs(lastStepNo.DAPVDATE), 'day')} day ago)</span></span>
            </div>
        </div>`;
    };

    const approvedStep = (data) => {
        return `<div class="px-4 py-2 bg-green-200 border border-green-300 text-green-700 flex gap-3">
            <div class="text-xs flex flex-row items-center gap-0.5 text-green-700">
                <i class="fi fi-rs-check-circle text-xl me-2"></i>
                <span class="font-bold">Approval Completed:</span>
                <span>2026-01-01 15:00:23 (3 ago)</span>
            </div>
        </div>`;
    };

    const rejectStep = (data) => {
        return `<div class="px-4 py-2 bg-red-200 border border-red-300 text-red-700 flex gap-3">
            <div class="text-xs flex flex-row items-center gap-0.5 text-red-700">
                <i class="fi fi-rs-check-circle text-xl me-2"></i>
                <span class="font-bold">Approval Completed:</span>
                <span>2026-01-01 15:00:23 (3 ago)</span>
            </div>
        </div>`;
    };

    const currentStep = async (data) => {
        let el = '';
        switch (data.CST) {
            case '1':
                el = await approvingStep(data.flow);
                break;
            case '2':
                el = await approvedStep(data.flow);
                break;
            case '3':
                el = await rejectStep(data.flow);
                break;
            default:
                el = '';
                break;
        }
        $('#form-flow-status').html(el);
    };

    const setStepInfo = (data) => {
        let steps = '';
        for (let dt of data) {
            steps += `<li class="step ${parseInt(dt.CSTEPST) > 3 ? 'step-primary' : ''}"><span class="font-mono text-sm">${dt.VAPVNO}</span></li>`;
        }
        $('#form-flow-steps').html(steps);
    };

    const setStepTable = async (data) => {
        const badgeStatus = (dt) => {
            if (dt.CSTEPNO == '--')
                return `<span class="bg-gray-200 border border-gray-300 text-gray-700 px-2 py-0.5 text-nowrap">Submitted</span>`;
            const st = parseInt(dt.CSTEPST);
            if (st == 3)
                return `<span class="bg-amber-200 border border-amber-300 text-amber-700 px-2 py-0.5 text-nowrap">Pending Approval</span>`;

            if (st == 5)
                return `<span class="bg-green-600 border border-green-700 text-white px-2 py-0.5 text-nowrap">Approved</span>`;

            if (st > 5)
                return `<span class="bg-red-600 border border-red-700 text-white px-2 py-0.5 text-nowrap">Rejected</span>`;

            return ``;
        };

        const badgeLine = (dt, no) => {
            if (parseInt(dt.CSTEPST) == 3)
                return `<div class="w-8 h-8 bg-red-600 text-white font-bold text-md flex items-center justify-center">${no}</div>`;

            return `<div class="w-8 h-8 bg-gray-300 text-gray-600 font-bold text-md flex items-center justify-center">${no}</div>`;
        };

        let table = '';
        let no = 1;
        for (let dt of data) {
            const date =
                dt.DAPVDATE == null
                    ? ''
                    : `${dayjs(dt.DAPVDATE).format('YYYY-MM-DD')} ${dt.CAPVTIME}`;
            const user = await displayEmpInfo(dt.VAPVNO);
            table += `<tr>
                <td>${badgeLine(dt, no)}</td>
                <td>${dt.steps.VNAME}</td>
                <td>${dt.VAPVNO}</td>
                <td>${user.SNAME} / ${user.STNAME}</td>
                <td>${user.SPOSITION}</td>
                <td>${date}</td>
                <td>${badgeStatus(dt)}</td>
                <td>${dt.VREMARK == null ? '' : dt.VREMARK}</td>
            </tr>`;
            no++;
        }
        $('#form-flow-table tbody').html(table);
    };

    currentStep(data);
    setStepInfo(data.flow);
    setStepTable(data.flow);
}

export async function formApprovalBtn(opt) {
    const opts = {
        approve: true,
        reject: true,
        return: false,
        delete: false,
        print: false,
        ...opt,
    };
    $('#form-button-container button').each(function () {
        const id = $(this).data('attr');
        if (opts[id]) {
            $(this).removeClass('hidden');
        }
    });
    $('#form-button-container-loading').addClass('hidden');
}
