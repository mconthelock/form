import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { createTable } from '@amec/webasset/dataTable';

let reportTable = null;

const columns = [
    {
        title: 'Form No.',
        data: 'formno',
        render(data, type, row) {
            return `
            <a 
            href="${process.env.APP_ENV}/psform/ps-upi/main/?no=${row.NFRMNO}&orgNo=${row.VORGNO}&y=${row.CYEAR}&y2=${row.CYEAR2}&runNo=${row.NRUNNO}" 
            target="_blank"
            class="text-primary underline"
            >
                ${data}
            </a>
            `;
        },
    },
    { title: 'Section Request', data: 'VORGNO', defaultContent: '' },
    { title: 'Requester', data: 'VREQNO', defaultContent: '' },
    {
        title: 'Status approve',
        data: 'CST',
        render(data, type, row) {
            switch (data) {
                case '1':
                    return '<span class="badge ">On process <i class="fi fi-br-priority-importance"></i></span>';
                case '2':
                    return '<span class="badge ">Finished <i class="fi fi-rs-user-check"></i></span>';
                default:
                    return '';
            }
        },
    },
    {
        title: 'Remark detail',
        data: null,
        defaultContent: '',
        render() {
            return '';
        },
    },
];

$(document).ready(async function () {
    $('#upiReportForm').on('submit', async function (event) {
        event.preventDefault();

        const criteria = Object.fromEntries(
            [...new FormData(this).entries()]
                .map(([key, value]) => [key, String(value).trim()])
                .filter(([, value]) => value !== ''),
        );
        const $button = $('#searchUpiReport');

        $button.prop('disabled', true).addClass('loading');
        $('#upiReportSummary').text('Loading report data...');

        try {
            const response = await fetchUtils({
                url: `${process.env.APP_API}/ps-upi/getReport`,
                method: 'POST',
                data: criteria,
            });
            const rows = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                  ? response.data
                  : [];

            await renderReport(rows);
            $('#upiReportSummary').text(`${rows.length} requisition(s) found.`);
        } catch (error) {
            console.error('Cannot load PS-UPI report', error);
            clearReportTable();
            $('#upiReportSummary').text('Unable to load report data.');
        } finally {
            $button.prop('disabled', false).removeClass('loading');
        }
    });

    $('#resetUpiReport').on('click', function (event) {
        event.preventDefault();
        document.getElementById('upiReportForm').reset();
        clearReportTable();
        $('#upiReportSummary').text('Search to display report data.');
    });
});

async function renderReport(rows) {
    destroyReportTable();
    $('#ReportTable tbody').empty();
    reportTable = await createTable(
        {
            data: rows,
            columns,
        },
        { id: 'ReportTable' },
    );
}

function clearReportTable() {
    destroyReportTable();
    $('#ReportTable tbody').html(
        '<tr><td colspan="5" class="py-8 text-center text-base-content/50">Search to display requisitions.</td></tr>',
    );
}

function destroyReportTable() {
    if (reportTable?.destroy) reportTable.destroy();
    if ($.fn.DataTable?.isDataTable('#ReportTable')) {
        $('#ReportTable').DataTable().clear().destroy();
    }
    reportTable = null;
}
