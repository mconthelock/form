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
    const stat = setStatus(String(data.CST));
    $('#form-header-status').addClass(stat.classed);
    $('#form-header-status-icon').html(stat.icon);
    $('#form-header-status-en').html(stat.en);
    $('#form-header-status-th').html(stat.th);
}

export async function formHeaderInfo(data = {}, opt = {}) {
    const setEmpInfo = (emp, el) => {
        if (!emp) return;
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
    const no =
        master && data.CYEAR2 && data.NRUNNO
            ? `${master.VANAME}${String(data.CYEAR2).slice(2)}-${('000000' + data.NRUNNO).slice(-6)}`
            : 'Draft';
    const date = data.DREQDATE
        ? `${dayjs(data.DREQDATE).format('YYYY-MM-DD')} ${data.CREQTIME || ''}`.trim()
        : dayjs().format('YYYY-MM-DD');
    $('#form-header-no').html(no);
    $('#form-header-date').html(date);
    $('#form-header-remark').html(data.VREMARK || '');

    const reqNo = String(data.VREQNO || $('#EMPNO').val() || '').trim();
    const req = reqNo ? await displayEmpInfo(reqNo) : null;
    const inputterNo = String(data.VINPUTER || $('#EMPNO').val() || '').trim();
    const inputter = inputterNo ? await displayEmpInfo(inputterNo) : null;
    setEmpInfo(req, '#form-header-req');
    setEmpInfo(inputter, '#form-header-inputted');
    if (req?.SEMPNO) {
        $('#form-header-req-no').val(req.SEMPNO);
    }

    const updateOnBehalfBadge = (selectedReqNo) => {
        const isDifferent =
            Boolean(selectedReqNo) &&
            Boolean(inputter?.SEMPNO || inputterNo) &&
            String(selectedReqNo).trim() !==
                String(inputter?.SEMPNO || inputterNo).trim();
        $('#form-header-req-badge').toggleClass('hidden', !isDifferent);
    };
    updateOnBehalfBadge(req?.SEMPNO || reqNo);

    if (opt.editableReq) {
        const $changeBtn = $('#form-header-req-change-btn');
        const $editor = $('#form-header-req-editor');
        const $input = $('#form-header-req-input');
        const $confirmBtn = $('#form-header-req-confirm');
        const $error = $('#form-header-req-error');

        $changeBtn.removeClass('hidden');

        const showError = (msg) => {
            if (!msg) {
                $error.addClass('hidden').find('span').text('');
            } else {
                $error.removeClass('hidden').find('span').text(msg);
            }
        };

        const openEditor = () => {
            showError('');
            $input.val('');
            $editor.removeClass('hidden');
            $input.trigger('focus');
        };

        const closeEditor = () => {
            showError('');
            $editor.addClass('hidden');
        };

        const applyRequester = async () => {
            const empNo = String($input.val() || '').trim();
            if (!empNo) {
                showError('กรุณากรอกรหัสพนักงาน');
                $input.trigger('focus');
                return;
            }

            showError('');
            $confirmBtn.prop('disabled', true);
            $confirmBtn.find('.loading-spinner').removeClass('hidden');
            try {
                const emp = await displayEmpInfo(empNo);
                if (!emp) {
                    showError(`ไม่พบข้อมูลพนักงานรหัส ${empNo}`);
                    $input.trigger('focus').trigger('select');
                    return;
                }

                setEmpInfo(emp, '#form-header-req');
                $('#form-header-req-no').val(emp.SEMPNO);
                updateOnBehalfBadge(emp.SEMPNO);
                closeEditor();

                if (typeof opt.onChangeRequester === 'function') {
                    await opt.onChangeRequester(emp);
                }
            } catch (err) {
                console.error('Error fetching requester info:', err);
                showError('เกิดข้อผิดพลาดในการค้นหาข้อมูลพนักงาน');
            } finally {
                $confirmBtn.prop('disabled', false);
                $confirmBtn.find('.loading-spinner').addClass('hidden');
            }
        };

        $(document)
            .off('click.reqChange', '#form-header-req-change-btn')
            .on('click.reqChange', '#form-header-req-change-btn', function (e) {
                e.preventDefault();
                if ($editor.hasClass('hidden')) {
                    openEditor();
                } else {
                    closeEditor();
                }
            });

        $(document)
            .off('click.reqChange', '#form-header-req-cancel')
            .on('click.reqChange', '#form-header-req-cancel', function (e) {
                e.preventDefault();
                closeEditor();
            });

        $(document)
            .off('click.reqChange', '#form-header-req-confirm')
            .on('click.reqChange', '#form-header-req-confirm', function (e) {
                e.preventDefault();
                applyRequester();
            });

        $(document)
            .off('keydown.reqChange', '#form-header-req-input')
            .on('keydown.reqChange', '#form-header-req-input', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyRequester();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeEditor();
                }
            });
    } else {
        $('#form-header-req-change-btn').addClass('hidden');
        $('#form-header-req-editor').addClass('hidden');
    }
}

function sortFlowSteps(flow) {
    if (!Array.isArray(flow) || flow.length <= 1) return flow || [];

    const byStepNo = new Map();
    const nextStepSet = new Set();

    for (const item of flow) {
        const stepNo = String(item.CSTEPNO ?? '').trim();
        const nextNo = String(item.CSTEPNEXTNO ?? '').trim();
        if (!byStepNo.has(stepNo)) {
            byStepNo.set(stepNo, []);
        }
        byStepNo.get(stepNo).push(item);
        if (nextNo && nextNo !== '00') {
            nextStepSet.add(nextNo);
        }
    }

    let startStep = byStepNo.has('--')
        ? '--'
        : [...byStepNo.keys()].find((stepNo) => !nextStepSet.has(stepNo));

    if (startStep === undefined) {
        startStep = String(flow[0].CSTEPNO ?? '').trim();
    }

    const ordered = [];
    const visited = new Set();
    const queue = [startStep];

    while (queue.length > 0) {
        const currentKey = queue.shift();
        if (!currentKey || currentKey === '00' || visited.has(currentKey)) {
            continue;
        }
        const items = byStepNo.get(currentKey);
        if (!items) continue;

        visited.add(currentKey);
        for (const item of items) {
            ordered.push(item);
            const nextKey = String(item.CSTEPNEXTNO ?? '').trim();
            if (nextKey && nextKey !== '00' && !visited.has(nextKey)) {
                queue.push(nextKey);
            }
        }
    }

    for (const item of flow) {
        if (!ordered.includes(item)) {
            ordered.push(item);
        }
    }

    return ordered;
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

    const orderedFlow = sortFlowSteps(data.flow);
    currentStep({ ...data, flow: orderedFlow });
    setStepInfo(orderedFlow);
    setStepTable(orderedFlow);
}

export async function formApprovalBtn(form, opt = {}) {
    const opts = {
        approve: false,
        reject: false,
        return: false,
        delete: false,
        print: true,
        remark: false,
        empno: $('#EMPNO').val(),
        onPrint: async () => {
            window.print();
        },
        ...opt,
    };

    const currentEmp = String(opts.empno || '').trim();
    const flowList = Array.isArray(form?.flow) ? form.flow : [];
    const currentStep = flowList.find((c) => String(c.CSTEPST) === '3');
    const isApprover =
        String(form?.CST) === '1' &&
        Boolean(currentStep) &&
        Boolean(currentEmp) &&
        (String(currentStep.VAPVNO || '').trim() === currentEmp ||
            String(currentStep.VREPNO || '').trim() === currentEmp);

    const visibleMap = {
        approve: isApprover && opts.approve,
        reject: isApprover && opts.reject,
        return: isApprover && opts.return,
        delete: isApprover && opts.delete,
        print: Boolean(opts.print),
    };

    let hasVisibleBtn = false;
    $('#form-button-container button').each(function () {
        const id = $(this).data('attr');
        if (visibleMap[id]) {
            $(this).removeClass('hidden');
            hasVisibleBtn = true;
        } else {
            $(this).addClass('hidden');
        }
    });

    if (isApprover && opts.remark) {
        $('#form-remark-container').removeClass('hidden');
    } else {
        $('#form-remark-container').addClass('hidden');
    }

    if (hasVisibleBtn) {
        $('#form-action-section').removeClass('hidden');
    } else {
        $('#form-action-section').addClass('hidden');
    }

    $('#form-button-container-loading').addClass('hidden');

    // ผูก click event ให้ทุกปุ่มในกลุ่ม form-action โดยจัดการ disabled + loading อัตโนมัติ
    const handlerMap = {
        approve: opts.onApprove,
        reject: opts.onReject,
        return: opts.onReturn,
        delete: opts.onDelete,
        print: opts.onPrint,
    };

    $(document)
        .off('click.formAction', '#form-button-container button')
        .on(
            'click.formAction',
            '#form-button-container button',
            async function (e) {
                const $container = $('#form-button-container');
                if (
                    $container.data('action-loading') ||
                    $(this).prop('disabled')
                ) {
                    return;
                }

                const action = $(this).data('attr');
                const remark = ($('#form-remark').val() || '').trim();
                const specificHandler = handlerMap[action];
                const handler =
                    typeof specificHandler === 'function'
                        ? specificHandler
                        : typeof opts.onAction === 'function'
                          ? opts.onAction
                          : null;

                toggleFormActionLoading(this, true);

                if (!handler) return;

                try {
                    if (typeof specificHandler === 'function') {
                        await specificHandler({
                            action,
                            remark,
                            form,
                            event: e,
                        });
                    } else {
                        await opts.onAction(action, remark, { form, event: e });
                    }
                } finally {
                    toggleFormActionLoading(null, false);
                }
            },
        );
}

/**
 * Toggle disabled และ loading spinner ของปุ่มในกลุ่ม #form-button-container
 * เพื่อป้องกันการกดปุ่มซ้ำระหว่างประมวลผล
 * @param {HTMLElement|jQuery|string|null} [activeBtn=null] - ปุ่มที่ถูกกด (แสดง spinner เฉพาะปุ่มนี้)
 * @param {boolean} [loading] - true = disable ทั้งกลุ่มและแสดง spinner, false = คืนค่าปกติ (ถ้าไม่ส่งจะ toggle อัตโนมัติ)
 */
export function toggleFormActionLoading(activeBtn = null, loading) {
    const $container = $('#form-button-container');
    const $buttons = $container.find('button');
    const isLoading =
        typeof loading === 'boolean'
            ? loading
            : !$container.data('action-loading');

    $container.data('action-loading', isLoading);
    $buttons.prop('disabled', isLoading);
    $('#form-remark').prop('disabled', isLoading);

    // รีเซ็ต spinner และ icon ของทุกปุ่มก่อน
    $buttons.each(function () {
        const $btn = $(this);
        $btn.find('.loading-spinner').addClass('hidden');
        $btn.find('i').closest('span').removeClass('hidden');
    });

    if (isLoading && activeBtn) {
        const $target = $(activeBtn);
        $target.find('.loading-spinner').removeClass('hidden');
        $target.find('i').closest('span').addClass('hidden');
    }
}
