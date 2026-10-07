import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import {
    doaction,
    showflow,
    getMode,
    getExtData,
    updateFlow,
} from '@amec/webasset/api/webform';
import { formatDate } from '@amec/webasset/dayjs';
import { redirectWebflow, setformDetail } from '@amec/webasset/form';
import { createTable } from '@amec/webasset/dataTable';
import { webflowSubmit } from '@amec/webasset/components/form';
import { searchUser } from '@amec/webasset/api/amec';
import { setSelect2 } from '@amec/webasset/select2';
import select2 from 'select2';
select2();

$(document).ready(async function () {
    const params = new URLSearchParams(window.location.search);
    const formKey = {
        NFRMNO: params.get('no'),
        VORGNO: params.get('orgNo'),
        CYEAR: params.get('y'),
        CYEAR2: params.get('y2'),
        NRUNNO: params.get('runNo'),
        EMPNO: params.get('empno'),
    };
    const mode = await getMode(formKey);
    const flow = await showflow(formKey);
    $('.flow').html(flow.html);
    const extData = await getExtData(formKey);
    if (extData === '01') {
        const workers = await searchUser({ SSECCODE: '050504', CSTATUS: '1' });
        $('#worker-form').removeClass('hidden');
        await setSelect2({
            element: '#workerSelect',
            data: workers.map(({ SEMPNO, SNAME }) => ({
                id: SEMPNO,
                text: `(${SEMPNO}) ${SNAME}`,
            })),
        });
    }

    const actionButton = webflowSubmit({
        approve: true,
        reject: true,
        returnp: true,
        back: false,
    });
    if (mode === '2') {
        $('.action-form').html(actionButton);
    }

    const $tbody = $('#partTableBody');
    const showValue = (value) =>
        value === null || value === undefined || value === ''
            ? '—'
            : String(value);
    try {
        const formDetail = await setformDetail(formKey);
        $('#formDetail').html(formDetail);
        const response = await fetchUtils({
            url: `${process.env.APP_API}/ps-upi/getDataForm`,
            method: 'POST',
            data: formKey,
        });
        const payload = response?.data ?? response;
        const header = Array.isArray(payload)
            ? payload[0]
            : (payload?.form ?? payload?.header ?? payload);
        let items = Array.isArray(payload)
            ? payload
            : (payload?.LIST_DATA ??
              payload?.items ??
              payload?.rows ??
              payload?.details ??
              []);

        if (!header) throw new Error('Requisition data was not found.');
        if (!Array.isArray(items) && items && typeof items === 'object') {
            items = [items];
        }
        if (!items.length && payload?.PUR_CODE) items = [payload];

        $('#inputByValue').text(showValue(header.INPUT_BY));
        $('#requestByValue').text(showValue(header.REQUEST_BY));

        await createTable(
            {
                data: items,
                columns: [
                    {
                        data: null,
                        render: (data, type, row, meta) => meta.row + 1,
                    },
                    { data: 'PUR_CODE' },
                    { data: 'DESCRIPTION' },
                    { data: 'DRAWING_NO' },
                    { data: 'ADDRESS' },
                    { data: 'WHI_USER' },
                    { data: 'QUANTITY' },
                    { data: 'PRODUCTION' },
                    { data: 'ISSUE_TO' },
                    { data: 'REASON_NAME' },
                    { data: 'REASON_DETAIL' },
                    {
                        data: 'PLAN_RETURN_DATE',
                        render: (data) => formatDate(data, 'YYYY-MM-DD'),
                    },
                ],
            },
            {
                id: '#partTable',
            },
        );
    } catch (error) {
        $tbody.html(
            '<tr><td colspan="12" class="py-8 text-center text-base-content/50">Could not load requisition items.</td></tr>',
        );
        $('#viewErrorMessage').text(
            error?.message || 'Unable to load requisition details.',
        );
        $('#viewError').removeClass('hidden');
    } finally {
        $('#viewLoading').addClass('hidden');
    }

    $(document).on('click', "button[name='btnAction']", async function () {
        const remark = $('#remark').val();
        const action = $(this).val();

        if (extData === '01') {
            const worker = $('#workerSelect').val();
            if (!worker) {
                alert('Please select a worker.');
                return;
            }
            const formData = { ...formKey };
            delete formData.EMPNO;

            await updateFlow({
                condition: {
                    ...formData,
                    CSTEPNO: '19',
                },
                VAPVNO: worker,
                VREPNO: worker,
            });
        }

        await doaction({ ...formKey, ACTION: action, REMARK: remark });
        redirectWebflow();
    });
});
