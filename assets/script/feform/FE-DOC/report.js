import $ from 'jquery';
import { createTable, destroyTable } from '@amec/webasset/dataTable';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { host } from '../../utils';

let reportTable = null;

const columns = [
    {
        title: '#',
        data: null,
        className: 'text-center text-slate-400',
        render: (data, type, row, meta) => meta.row + 1,
    },
    {
        title: 'DOC NO.',
        data: 'DOC_NO',
        defaultContent: '-',
        render: (data, type) => {
            if (type !== 'display') return data ?? '';
            return `<span class="font-semibold text-blue-700">${escapeHtml(data ?? '-')}</span>`;
        },
    },
    {
        title: 'DOC TYPE',
        data: null,
        render: (data, type) => {
            if (type !== 'display') return data?.DOC_TYPE_CODE ?? '';
            return `
                <span class="font-bold text-slate-700">${escapeHtml(data?.DOC_TYPE_CODE ?? '-')}</span>
                <div class="text-[10px] text-slate-400">${escapeHtml(data?.DOC_TYPE_NAME ?? '')}</div>
            `;
        },
    },
    {
        title: 'สถานะ',
        data: 'STATUS',
        className: 'text-center',
        defaultContent: 'DRAFT',
        render: (data, type) => {
            if (type !== 'display') return data ?? '';
            let badgeClass = 'bg-slate-100 text-slate-600';
            if (data === 'APPROVE')
                badgeClass =
                    'bg-emerald-50 text-emerald-600 border border-emerald-200';
            else if (data === 'PROCESS')
                badgeClass = 'bg-blue-50 text-blue-600 border border-blue-200';
            else if (data === 'REJECT')
                badgeClass = 'bg-rose-50 text-rose-600 border border-rose-200';
            return `<span class="px-2 py-0.5 rounded text-[11px] font-bold ${badgeClass}">${escapeHtml(data || 'DRAFT')}</span>`;
        },
    },
    {
        title: 'วันที่เอกสาร',
        data: 'DOC_DATE_FORMAT',
        className: 'text-center text-slate-600',
        defaultContent: '-',
        render: renderText,
    },
    {
        title: 'USER ล่าสุด',
        data: 'USER_ACTION',
        className: 'text-slate-600 font-mono',
        defaultContent: '-',
        render: renderText,
    },
    {
        title: 'REMARK',
        data: 'REMARK',
        className: 'text-slate-500 max-w-xs truncate',
        defaultContent: '-',
        render: (data, type) => {
            if (type !== 'display') return data ?? '';
            return `<span title="${escapeHtml(data ?? '')}">${escapeHtml(data ?? '-')}</span>`;
        },
    },
    {
        title: 'ACTION',
        data: null,
        className: 'text-center no-export',
        orderable: false,
        render: (item, type) => {
            if (type !== 'display') return '';

            const empno = ($('#EMPNOHid').val() || '').trim();

            // 🟢 2. เพิ่ม m=3 เข้าไปในพารามิเตอร์
            const formUrl =
                host +
                `feform/FE-DOC/form/main?no=${item.NFRMNO}&orgNo=${item.VORGNO}&y=${item.CYEAR}&y2=${item.CYEAR2}&runNo=${item.NRUNNO}&m=3&empno=${empno}&bp=%2Fformtest%2Fworkflow%2FmineList%2Easp&menu=1`;

            return `
                <a href="${formUrl}" target="_blank" 
                   class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-sm">
                    📂 เปิดเอกสาร
                </a>
            `;
        },
    },
];

$(document).ready(function () {
    // Submit ฟอร์มค้นหา
    $('#form').on('submit', async function (e) {
        e.preventDefault();
        await loadReport(this);
    });

    // 🟢 กดปุ่ม Export Excel แล้ว trigger ผ่าน DataTables Button API
    $('#exportReport').on('click', function () {
        if (!reportTable) {
            showMessage('กรุณาค้นหาข้อมูลก่อนทำการ Export', 'warning');
            return;
        }
        reportTable.button('.buttons-excel').trigger();
    });

    // ปุ่ม Reset
    $('#resetReport').on('click', function () {
        this.form.reset();
        destroyTable('#reportTable');
        reportTable = null;
        $('#result').addClass('hidden');
        $('#reportSummary').text('');
    });

    // โหลดผลลัพธ์รอบแรกอัตโนมัติ
    loadReport($('#form')[0]);
});

async function loadReport(formElement) {
    try {
        showLoader();
        const baseUrl = host || window.location.origin + '/';

        const res = await $.ajax({
            url: baseUrl + 'feform/FE-DOC/FeDocReport/Search',
            type: 'POST',
            data: new FormData(formElement),
            processData: false,
            contentType: false,
            dataType: 'json',
        });

        if (!res || !res.status) {
            throw new Error(res?.message || 'Failed to load report');
        }

        const rows = Array.isArray(res.data) ? res.data : [];
        await destroyTable('#reportTable');
        reportTable = null;

        $('#result').removeClass('hidden');
        $('#reportSummary').text(`${rows.length} รายการที่พบ`);

        // 🟢 เรียกใช้ createTable จาก @amec/webasset
        reportTable = await createTable(
            {
                data: rows,
                columns,
                responsive: false,
                scrollX: true,
                ordering: true,
                searching: true,
                pageLength: 15,
                buttons: [
                    {
                        extend: 'excelHtml5',
                        title:
                            'FE_DOC_Report_' +
                            new Date().toISOString().slice(0, 10),
                        exportOptions: {
                            columns: ':not(.no-export)',
                            format: {
                                body: function (data, row, column, node) {
                                    return $(node).text().trim();
                                },
                            },
                        },
                    },
                ],
            },
            { id: '#reportTable' },
        );

        if (!rows.length) {
            showMessage('ไม่พบข้อมูลเอกสาร', 'warning');
        }
    } catch (error) {
        showErrorMessage(error?.message || error);
    } finally {
        showLoader({ show: false });
    }
}

function renderText(data, type) {
    return type === 'display' ? escapeHtml(data ?? '') : (data ?? '');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
