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
    console.log('Form mode:', mode);
    const flow = await showflow(formKey);
    $('.flow').html(flow.html);
    const extData = await getExtData(formKey);
    console.log('Ext Data:', extData);
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

    const action_button = webflowSubmit({
        approve: true,
        reject: true,
        returnp: true,
        back: false,
    });
    if (mode === '2') {
        $('.action-form').html(action_button);
    }

    const $tbody = $('#partTableBody');
    const showValue = (value) =>
        value === null || value === undefined || value === ''
            ? '—'
            : String(value);
    const appendCell = ($row, value, className = '') => {
        $('<td>').addClass(className).text(showValue(value)).appendTo($row);
    };

    try {
        const formDetail = await setformDetail(formKey);
        $('#formDetail').html(formDetail);
        const [response, reasons] = await Promise.all([
            fetchUtils({
                url: `${process.env.APP_API}/ps-upi/getDataForm`,
                data: formKey,
            }),
            fetchUtils({
                url: `${process.env.APP_API}/ps-upi/reason`,
                method: 'GET',
            }).catch(() => []),
        ]);

        const detail = Array.isArray(response)
            ? response[0]
            : (response?.data ?? response);
        if (!detail) throw new Error('Requisition data was not found.');

        const formData = response;
        const items = formData ?? [];
        const reasonNames = new Map(
            (Array.isArray(reasons) ? reasons : []).map((reason) => [
                String(reason.REASON_CODE),
                reason.REASON_NAME,
            ]),
        );

        $('#inputByValue').text(showValue(formData.INPUT_BY));
        $('#requestByValue').text(showValue(formData.REQUEST_BY));

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
                        render: (data, type, row, meta) =>
                            formatDate(data, 'YYYY-MM-DD'),
                    },
                ],
            },
            {
                id: '#partTable',
            },
        );
        // $tbody.empty();

        // if (!Array.isArray(items) || items.length === 0) {
        //     $tbody.append(
        //         '<tr><td colspan="11" class="py-8 text-center text-base-content/50">No items in this requisition.</td></tr>',
        //     );
        // } else {
        //     items.forEach((item, index) => {
        //         const $row = $('<tr>');
        //         appendCell($row, index + 1, 'text-center');
        //         appendCell($row, item.PUR_CODE);
        //         appendCell($row, item.DESCRIPTION);
        //         appendCell($row, item.DRAWING_NO);
        //         appendCell($row, item.ADDRESS);
        //         appendCell($row, item.WHI_USER);
        //         appendCell($row, item.QUANTITY);
        //         appendCell($row, item.PRODUCTION);
        //         appendCell($row, item.ISSUE_TO);

        //         const reasonName =
        //             reasonNames.get(String(item.REASON_CODE)) ??
        //             item.REASON_CODE;
        //         const reasonText = item.REASON_DETAIL
        //             ? `${showValue(reasonName)}: ${item.REASON_DETAIL}`
        //             : reasonName;
        //         appendCell($row, reasonText);
        //         appendCell(
        //             $row,
        //             formatDate(item.PLAN_RETURN_DATE, 'YYYY-MM-DD'),
        //         );
        //         $tbody.append($row);
        //     });
        // }

        // $('#partRowCount').text(Array.isArray(items) ? items.length : 0);
    } catch (error) {
        $tbody.html(
            '<tr><td colspan="11" class="py-8 text-center text-base-content/50">Could not load requisition items.</td></tr>',
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
        console.log(action);

        if (extData == '01') {
            if (!$('#workerSelect').val()) {
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
                VAPVNO: $('#workerSelect').val(),
                VREPNO: $('#workerSelect').val(),
            });
        }

        await doaction({ ...formKey, ACTION: action, REMARK: remark });
        redirectWebflow();
    });
});
