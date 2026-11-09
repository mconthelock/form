import { doaction, getAreas, getEmpData, getFormData } from './data';
import Swal from 'sweetalert2';
import { getMode, showflow } from '@amec/webasset/api/webform';
import { webflowSubmit } from '@amec/webasset/components/form';
import { redirectWebflow } from '@amec/webasset/form';
import { showMessage } from '@amec/webasset/utils';
import { getAllDepartment, getAllDivision, searchUser } from '@amec/webasset/api/amec';

let areaApprovalContext = null;

async function loadAreaOwnerNames() {
    const [employees, departments, divisions] = await Promise.all([
        searchUser(), getAllDepartment(), getAllDivision(),
    ]);
    const items = (response) => Array.isArray(response) ? response : response?.data || [];
    const organizationNames = new Map();
    const positionNames = new Map();
    items(divisions).forEach((division) => {
        organizationNames.set(String(division.SDIVCODE || '').trim(),
            shortOrganizationName(division.SDIV, division.SDIVISION));
    });
    items(departments).forEach((department) => {
        organizationNames.set(String(department.SDEPCODE || '').trim(),
            shortOrganizationName(department.SDEPT, department.SDEPARTMENT));
    });
    items(employees).forEach((employee) => {
        const code = String(employee.SPOSCODE || '').trim();
        const abbreviation = String(employee.SPOSNAME || '').trim();
        const name = abbreviation && abbreviation !== code
            ? abbreviation : String(employee.SPOSITION || '').trim();
        if (code && name && !positionNames.has(code)) positionNames.set(code, name);
    });
    return { organizationNames, positionNames };
}

function shortOrganizationName(abbreviation, fullName) {
    const name = String(abbreviation || '').trim() ||
        String(fullName || '').trim().split(',').pop().trim();
    return name.replace(/\(\s*cancel\s*\)/gi, '').replace(/\s{2,}/g, ' ').trim();
}

function getAreaOwnerLabel(area, ownerNames) {
    const organizationCode = String(area.AREA_OWNER || '').trim();
    const positionCode = String(area.AREA_OWNER_POSCODE || '').trim();
    const organization = ownerNames?.organizationNames.get(organizationCode);
    const position = ownerNames?.positionNames.get(positionCode);
    return organization && position
        ? `${organization} / ${position}`
        : [positionCode, organizationCode].filter(Boolean).join('+') || '-';
}

function setValue(selector, value) {
    const field = document.querySelector(selector);
    if (field) {
        field.value = value || '';
    }
}

function setChecked(name, value) {
    const field = document.querySelector(
        `input[name="${name}"][value="${value}"]`,
    );
    if (field) {
        field.checked = true;
    }
}

function formatDate(value) {
    return value ? String(value).split('T')[0] : '';
}

function getFlowForm(marker) {
    return {
        NFRMNO: marker.dataset.nfrmno,
        VORGNO: marker.dataset.vorgno,
        CYEAR: marker.dataset.cyear,
        CYEAR2: marker.dataset.cyear2,
        NRUNNO: marker.dataset.nrunno,
        EMPNO: marker.dataset.empno,
    };
}

async function renderApprovalFlow(form, areaOwnerOrder = []) {
    const container = document.getElementById('sentApprove');
    if (!container) {
        return;
    }

    const [flow, mode] = await Promise.all([
        showflow(form),
        form.EMPNO ? getMode(form) : Promise.resolve('3'),
    ]);
    const canAction = String(mode) === '2';

    container.innerHTML = webflowSubmit({
        actionsForm: canAction,
        remark: canAction,
        approve: canAction,
        reject: canAction,
        flow: true,
        flowhtml: flow.html,
    });

    const tbody = container.querySelector('table tbody');
    if (!tbody) return;
    const rows = Array.from(tbody.rows);
    const seen = new Set();
    const flowRows = (flow.data || [])
        .map((step, index) => ({ step, row: rows[index + 1] }))
        .filter(({ step, row }) => {
            if (!row) return false;
            const key = JSON.stringify(step);
            if (seen.has(key)) {
                row.remove();
                return false;
            }
            seen.add(key);
            return true;
        });
    if (!areaOwnerOrder.length) return;
    const ranks = new Map(areaOwnerOrder.map((employeeCode, index) => [employeeCode.trim(), index]));
    const ownerRows = flowRows
        .filter(({ step, row }) => row && step.CEXTDATA?.trim() === '01');
    if (!ownerRows.length) return;
    const nextRow = ownerRows[ownerRows.length - 1].row.nextSibling;
    ownerRows.sort((a, b) =>
        (ranks.get(a.step.VAPVNO?.trim()) ?? Number.MAX_SAFE_INTEGER) -
        (ranks.get(b.step.VAPVNO?.trim()) ?? Number.MAX_SAFE_INTEGER),
    );
    ownerRows.forEach(({ row }) => tbody.insertBefore(row, nextRow));
}

function fillRequester(data, employee) {
    setValue('#INPUTBY', data.form?.VINPUTER);
    setValue('#REQBY', data.form?.VREQNO);
    setValue('#empName', employee?.SNAME || employee?.STNAME);
    setValue(
        '#empDiv',
        employee
            ? [employee.SSEC, employee.SDEPT, employee.SDIV]
                  .filter(Boolean)
                  .join('/')
            : '',
    );
}

async function getEmployeeInfo(empno) {
    if (!empno) {
        return null;
    }

    const response = await getEmpData(empno);
    return response?.data || response;
}

async function fillVisitors(details) {
    const body = document.getElementById('visitor-table-body');
    const template = document.getElementById('visitor-row-template');
    if (!body || !template) {
        return;
    }

    const employees = await Promise.all(
        details.map(async (detail) => {
            try {
                return await getEmployeeInfo(detail.EMP_CODE);
            } catch (error) {
                console.warn(
                    `Unable to load employee ${detail.EMP_CODE}.`,
                    error,
                );
                return null;
            }
        }),
    );

    body.replaceChildren();
    details.forEach((detail, index) => {
        const employee = employees[index];
        const row = template.content.cloneNode(true);
        const cells = row.querySelectorAll('input');
        row.querySelector('.visitor-row-number').textContent = index + 1;
        cells[0].value = detail.EMP_CODE || '';
        cells[1].value =
            detail.APPLICANT_NAME || employee?.SNAME || employee?.STNAME || '';
        cells[2].value =
            detail.DIVISION || detail.VISITOR_DIV || employee?.SDIV || '';
        cells[3].value =
            detail.DEPARTMENT || detail.VISITOR_DEPT || employee?.SDEPT || '';
        cells[4].value =
            detail.SECTION || detail.VISITOR_SEC || employee?.SSEC || '';
        body.appendChild(row);
    });
}

function fillAreas(areaRecords, areas, ownerNames, isAreaOwnerAction) {
    const body = document.getElementById('area-table-body');
    if (!body) {
        return;
    }

    const recordsById = new Map(
        areaRecords.map((record) => [String(record.AREA_ID), record]),
    );
    const assignedRecords = areaRecords.filter((record) => record.CAN_APPROVE);
    const selectedAreas = areas.filter((area) => {
        const record = recordsById.get(String(area.AREA_ID));
        return record && (!isAreaOwnerAction || record.CAN_APPROVE);
    }).sort((a, b) => Number(a.AREA_ID) - Number(b.AREA_ID));
    if (isAreaOwnerAction && selectedAreas.length !== assignedRecords.length) {
        throw new Error('Unable to load all areas assigned to this Area Owner');
    }

    const header = body.closest('table')?.querySelector('thead tr');
    header?.querySelectorAll('[data-area-decision-column]').forEach((cell) => cell.remove());
    document.querySelector('[data-area-decision-hint]')?.remove();
    if (header && isAreaOwnerAction) {
        ['Not Allow', 'Allow'].forEach((label) => {
            const cell = document.createElement('th');
            cell.className = 'border p-2 text-center';
            cell.dataset.areaDecisionColumn = '';
            cell.textContent = label;
            header.prepend(cell);
        });
    }
    if (header && !header.querySelector('[data-approval-column]')) {
        const cell = document.createElement('th');
        cell.className = 'border p-2 text-center';
        cell.dataset.approvalColumn = '';
        cell.textContent = 'Area approval';
        header.appendChild(cell);
    }

    body.replaceChildren();
    if (!selectedAreas.length) {
        const cell = document.createElement('td');
        cell.colSpan = isAreaOwnerAction ? 8 : 6;
        cell.className = 'border p-4 text-center text-slate-500';
        cell.textContent = isAreaOwnerAction
            ? 'ไม่พบพื้นที่ที่มอบหมายให้ Area Owner นี้'
            : 'ไม่มีพื้นที่ที่เลือก';
        const row = document.createElement('tr');
        row.appendChild(cell);
        body.appendChild(row);
        return;
    }

    selectedAreas.forEach((area, index) => {
        const row = document.createElement('tr');
        if (isAreaOwnerAction) {
            row.dataset.areaApproval = String(area.AREA_ID);
            [
                { label: 'Allow', value: 'allow' },
                { label: 'Not Allow', value: 'not_allow' },
            ].forEach(({ label, value }) => {
                const cell = document.createElement('td');
                cell.className = 'border p-2 text-center';
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `area-decision-${area.AREA_ID}`;
                radio.value = value;
                radio.className = 'radio radio-success radio-sm';
                radio.setAttribute('aria-label', `${label}: ${area.AREA_NAME || area.AREA_ID}`);
                cell.appendChild(radio);
                row.appendChild(cell);
            });
        }
        [
            index + 1,
            area.LOCATION?.LOCATION_NAME || '',
            area.AREA_NAME || '',
            area.AREA_LEVEL ?? '',
            getAreaOwnerLabel(area, ownerNames),
        ].forEach((value) => {
            const cell = document.createElement('td');
            cell.className = 'border p-2';
            cell.textContent = value;
            row.appendChild(cell);
        });
        const record = recordsById.get(String(area.AREA_ID));
        const approvalCell = document.createElement('td');
        approvalCell.className = 'border p-2 text-center';
        const status = document.createElement('div');
        if (record.APPROVAL_STATUS === 'approved') {
            status.textContent = 'อนุญาต';
            status.className = 'font-bold text-green-700';
        } else if (record.APPROVAL_STATUS === 'rejected') {
            status.textContent = 'ไม่อนุญาต';
            status.className = 'font-bold text-red-700';
        } else {
            status.textContent = 'รออนุมัติ';
            status.className = 'font-bold text-yellow-500';
        }
        approvalCell.appendChild(status);
        row.appendChild(approvalCell);
        body.appendChild(row);
    });
    if (isAreaOwnerAction) {
        const hint = document.createElement('p');
        hint.className = 'mt-2 text-sm text-slate-600';
        hint.dataset.areaDecisionHint = '';
        hint.textContent = 'เลือก Allow หรือ Not Allow ให้ครบทุกพื้นที่ก่อนกด Approve';
        body.closest('table')?.parentElement?.after(hint);
    }
}

function makeReadOnly() {
    document
        .querySelectorAll('#add-visitor-row, #btnaddDatarow')
        .forEach((button) => button.classList.add('hidden'));

    document
        .querySelectorAll('#tphForm input, #tphForm textarea, #tphForm button')
        .forEach((field) => {
            field.disabled = true;
        });

    document
        .querySelectorAll('#tphForm [data-action-column]')
        .forEach((cell) => cell.remove());
    document.getElementById('modal-add')?.remove();
    document.querySelector('.modal')?.remove();
}

async function loadShowPage() {
    const marker = document.getElementById('gp-tph-form-data');
    if (!marker) {
        return;
    }

    makeReadOnly();

    try {
        const form = getFlowForm(marker);
        const data = await getFormData(
            form.NFRMNO,
            form.VORGNO,
            form.CYEAR,
            form.CYEAR2,
            form.NRUNNO,
            form.EMPNO,
        );
        const [employee, areas, ownerNames] = await Promise.all([
            data.form?.VREQNO ? getEmpData(data.form.VREQNO) : null,
            getAreas(),
            loadAreaOwnerNames().catch((error) => {
                console.error('Unable to load GP-TPH area owner names.', error);
                showMessage('ไม่สามารถโหลดชื่อ Area Owner ได้', 'error');
                return null;
            }),
        ]);

        fillRequester(data, employee?.data || employee);
        setValue('#PURPOSE', data.PURPOSE);
        setValue('#LONGTERM_YEARS', data.LONGTERM_YEARS);
        const isLongTerm = Number(data.LONGTERM_YEARS) > 0;
        setValue('#PERMIT_START_DATE', isLongTerm ? '' : formatDate(data.PERMIT_START_DATE));
        setValue('#PERMIT_END_DATE', isLongTerm ? '' : formatDate(data.PERMIT_END_DATE));
        document.getElementById('long-term-valid-until')?.classList.toggle('hidden', !isLongTerm);
        const longTermEndDate = document.getElementById('LONGTERM_VALID_UNTIL_DISPLAY');
        if (longTermEndDate) {
            longTermEndDate.textContent = formatDate(data.PERMIT_END_DATE) || '-';
        }
        setChecked('REQUEST_TYPE', data.REQUEST_TYPE);
        setChecked('REQUEST_SUB_TYPE', data.REQUEST_SUB_TYPE);
        setChecked(
            'permit_option',
            isLongTerm ? 'long_term' : 'period',
        );
        document.getElementById('HELMET_STICKER').checked =
            data.HELMET_STICKER === 'Y';
        document.getElementById('PHOTO_PERMIT_BADGE').checked =
            data.PHOTO_PERMIT_BADGE === 'Y';

        const isHostRequest = data.REQUEST_TYPE === 'H';
        document
            .getElementById('applicant-visitor-section')
            .classList.toggle('hidden', isHostRequest);
        document
            .getElementById('host-external-section')
            .classList.toggle('hidden', !isHostRequest);

        if (isHostRequest) {
            const applicant = data.DETAILS?.[0] || {};
            setValue(
                '#host-external-section #APPLICANT_NAME',
                applicant.APPLICANT_NAME,
            );
            setValue('#HOST_NAME', (employee?.data || employee)?.SNAME);
            setValue('#COMPANY_NAME', applicant.COMPANY_NAME);
        } else {
            await fillVisitors(data.DETAILS || []);
        }

        makeReadOnly();
        fillAreas(data.AREA_RECORDS || [], areas || [], ownerNames, data.IS_AREA_OWNER_ACTION);
        areaApprovalContext = {
            isAreaOwnerAction: data.IS_AREA_OWNER_ACTION,
            hasAssignedAreas: (data.AREA_RECORDS || []).some((record) => record.CAN_APPROVE),
        };
        await renderApprovalFlow(form, data.AREA_OWNER_ORDER || []);
    } catch (error) {
        console.error('Unable to load GP-TPH request.', error);
        alert('Unable to load the photo permission request.');
    }
}

$(loadShowPage);

$(document).on(
    'click',
    '#sentApprove button[name="btnAction"]',
    async function () {
        const marker = document.getElementById('gp-tph-form-data');
        if (!marker) {
            return;
        }

        const button = this;
        const action = button.value;
        const remark = document.getElementById('remark')?.value.trim() || '';
        if (!areaApprovalContext) {
            showMessage('ข้อมูลพื้นที่ยังไม่พร้อม กรุณาลองอีกครั้ง', 'warning');
            return;
        }
        let areaIds = [];
        if (areaApprovalContext.isAreaOwnerAction && !areaApprovalContext.hasAssignedAreas) {
            showMessage('ไม่พบพื้นที่ที่มอบหมายให้ Area Owner นี้ กรุณาติดต่อผู้ดูแลระบบ', 'error');
            return;
        }
        if (action === 'reject' && !remark) {
            showMessage(
                'Please enter a remark before rejecting this request.',
                'warning',
            );
            return;
        }
        if (areaApprovalContext.isAreaOwnerAction && action === 'approve') {
            const rows = Array.from(document.querySelectorAll('#area-table-body tr[data-area-approval]'));
            const undecided = rows.find((row) => !row.querySelector('input[type="radio"]:checked'));
            if (undecided) {
                showMessage('กรุณาเลือก Allow หรือ Not Allow ให้ครบทุกพื้นที่', 'warning');
                undecided.querySelector('input[type="radio"]')?.focus();
                return;
            }
            areaIds = rows
                .filter((row) => row.querySelector('input[type="radio"]:checked')?.value === 'allow')
                .map((row) => Number(row.dataset.areaApproval));
        }
        const buttons = document.querySelectorAll('#sentApprove button[name="btnAction"]');
        const areaChoices = document.querySelectorAll('#area-table-body tr[data-area-approval] input[type="radio"]');
        buttons.forEach((actionButton) => { actionButton.disabled = true; });
        areaChoices.forEach((choice) => { choice.disabled = true; });
        const enableActions = () => {
            buttons.forEach((actionButton) => { actionButton.disabled = false; });
            areaChoices.forEach((choice) => { choice.disabled = false; });
        };
        try {
            if (areaApprovalContext.isAreaOwnerAction && action === 'approve' && !areaIds.length) {
                const result = await Swal.fire({
                    title: 'ยืนยันการไม่อนุญาต',
                    text: 'ท่านไม่ได้เลือกอนุญาตพื้นที่ใด ยืนยันว่าไม่อนุญาตทุกพื้นที่ของท่านหรือไม่?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'ยืนยัน',
                    cancelButtonText: 'ยกเลิก',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-success text-white',
                        cancelButton: 'btn btn-error text-white',
                    },
                });
                if (!result.isConfirmed) {
                    enableActions();
                    return;
                }
            }
            const result = await doaction({
                ...getFlowForm(marker),
                ACTION: action,
                REMARK: remark,
                ...(areaApprovalContext.isAreaOwnerAction && action === 'approve'
                    ? { AREA_IDS: areaIds } : {}),
            });
            if (!result?.status) {
                throw new Error(
                    result?.message || 'Unable to update the approval flow.',
                );
            }

            showMessage(result.message, 'success');
            redirectWebflow();
        } catch (error) {
            console.error('Unable to update GP-TPH approval flow.', error);
            showMessage(
                error.message || 'Unable to update the approval flow.',
                'error',
            );
            enableActions();
        }
    },
);
