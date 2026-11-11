import $ from 'jquery';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { getFile } from '@amec/webasset/api/file';
import { host } from '../../utils';

import 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import { uploadDocFiles, handleAutoFeDocUpload } from './data';

$(document).ready(function () {
    let dtInstance = null;
    const currentEmp = window.CURRENT_EMPNO || '';

    // 1. นิยาม Columns ทั้งหมด 12 คอลัมน์ (DataTables จะนำ title ไปสร้าง thead ให้เอง)
    const reportColumns = [
        {
            title: 'No.',
            data: null,
            className:
                'text-center align-middle font-medium text-slate-500 w-12',
            render: (data, type, row, meta) => meta.row + 1,
        },
        {
            title: 'Control no.',
            data: 'CONTROL_NO',
            className: 'align-middle whitespace-nowrap',
            render: function (data, type, row) {
                const curHost = host || window.location.origin + '/form/';
                const backPath = encodeURIComponent(
                    '/formtest/workflow/mineList.asp',
                );
                const docUrl = `${curHost}feform/FE-ASP/form/main?no=${row.NFRMNO}&orgNo=${row.VORGNO}&y=${row.CYEAR}&y2=${row.CYEAR2}&runNo=${row.NRUNNO}&m=3&empno=${currentEmp}&bp=${backPath}&menu=1`;

                return `
                    <div class="flex items-center gap-1.5">
                        <a href="${docUrl}" target="_blank" class="font-bold text-emerald-700 hover:underline" title="เปิดดูฟอร์ม">${data}</a>
                        <button type="button" class="btn-view-history p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer" data-control="${data}" title="ดูประวัติ Revision ทั้งหมด">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                    </div>
                    <div class="flex items-center gap-1 text-[10px] text-slate-400">
                        <span>${row.DOC_REVISION ? 'Rev.' + row.DOC_REVISION : ''}</span>
                        <span>•</span>
                        <span>${row.DOC_NO || ''}</span>
                    </div>
                `;
            },
        },
        {
            title: 'Division',
            data: null,
            className: 'align-middle whitespace-nowrap',
            render: (data, type, row) =>
                row.DIVISION_NAME || row.SDIVCODE || '-',
        },
        {
            title: 'Department',
            data: null,
            className: 'align-middle whitespace-nowrap',
            render: (data, type, row) => row.DEPT_NAME || row.SDEPCODE || '-',
        },
        {
            title: 'Section',
            data: null,
            className: 'align-middle whitespace-nowrap',
            render: (data, type, row) =>
                row.SSECCODE && row.SSECCODE !== '00'
                    ? row.SEC_NAME || row.SSECCODE
                    : '-',
        },
        {
            title: 'Review period',
            data: 'REVIEW_PERIOD',
            className: 'align-middle text-center whitespace-nowrap',
            render: (data) =>
                data === 'YEARLY'
                    ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Yearly review</span>'
                    : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Review on changing</span>',
        },
        {
            title: 'Review details',
            data: 'REVIEW_DETAILS',
            className: 'align-middle text-center whitespace-nowrap',
            render: (data) =>
                data === 'NO_CHANGE'
                    ? '<span class="font-medium text-slate-700">No change</span>'
                    : '<span class="font-bold text-amber-700">Change</span>',
        },
        {
            title: 'Detail of change',
            data: 'DETAIL_OF_CHANGE',
            className: 'align-middle max-w-xs truncate',
            render: (data) =>
                data ? `<span title="${data}">${data}</span>` : '-',
        },
        {
            title: 'Status',
            data: 'STATUS',
            className: 'align-middle text-center whitespace-nowrap',
            render: function (data) {
                const st = (data || 'DRAFT').toUpperCase();
                let badgeClass = 'bg-slate-100 text-slate-700';
                if (st === 'APPROVE' || st === 'APPROVED')
                    badgeClass =
                        'bg-emerald-100 text-emerald-800 border border-emerald-200';
                else if (st === 'PROCESS')
                    badgeClass =
                        'bg-blue-100 text-blue-800 border border-blue-200';
                else if (st === 'REJECT')
                    badgeClass =
                        'bg-rose-100 text-rose-800 border border-rose-200';
                return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}">${st}</span>`;
            },
        },
        {
            title: 'Reviewed date',
            data: 'REVIEWED_DATE',
            className: 'align-middle text-center whitespace-nowrap',
        },
        {
            title: 'Requester',
            data: null,
            className: 'align-middle whitespace-nowrap',
            render: (data, type, row) =>
                `<span class="font-semibold text-slate-700">${row.REQ_NAME || row.REQ_BY || '-'}</span>`,
        },
        {
            title: 'APPROVED FILE',
            data: null,
            orderable: false,
            className: 'align-middle whitespace-nowrap',
            render: function (data, type, row) {
                const files = row.FILES || [];
                if (files.length === 0) {
                    return '<span class="text-slate-400 italic text-[11px]">- ไม่มีไฟล์ -</span>';
                }

                let html = '<div class="flex flex-col gap-1.5 py-0.5">';
                files.forEach((f) => {
                    const isCover = (f.FILE_ONAME || '').includes('CoverSheet');
                    const formattedBaseDir = (f.FILE_PATH || '').replace(
                        /\\/g,
                        '/',
                    );
                    const config = isCover
                        ? {
                              label: 'Cover Sheet',
                              btnClass:
                                  'text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 border-indigo-200/80',
                              badgeClass: 'bg-indigo-600 text-white',
                          }
                        : {
                              label: 'Evaluation PDF',
                              btnClass:
                                  'text-emerald-700 hover:text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200/80',
                              badgeClass: 'bg-emerald-600 text-white',
                          };

                    html += `
                        <button type="button" 
                                class="btn-open-report-file inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border shadow-2xs transition-all duration-150 cursor-pointer w-fit ${config.btnClass}"
                                data-base-dir="${formattedBaseDir}"
                                data-stored-name="${f.FILE_FNAME}"
                                data-original-name="${f.FILE_ONAME}">
                            <span class="text-[9px] font-bold px-1 py-0.5 rounded leading-none ${config.badgeClass}">PDF</span>
                            <span>${config.label}</span>
                        </button>
                    `;
                });
                html += '</div>';
                return html;
            },
        },
    ];

    // 2. ฟังก์ชันวาดตาราง (Render Data พร้อมสร้าง thead ให้เอง ปลอดภัยจาก DOM mismatch)
    function renderDataTable(dataList) {
        if ($.fn.DataTable.isDataTable('#tblReport')) {
            dtInstance.clear().destroy();
        }

        // สร้าง thead เปล่าๆ ไว้ใน Table Element เพื่อป้องกัน DataTables error ถ้า HTML เป็นแท็กว่าง
        if ($('#tblReport thead').length === 0) {
            $('#tblReport').html('<thead><tr></tr></thead><tbody></tbody>');
        }

        dtInstance = $('#tblReport').DataTable({
            data: dataList || [],
            columns: reportColumns,
            responsive: true,
            pageLength: 15,
            lengthMenu: [10, 15, 25, 50, 100],
            order: [[0, 'desc']],
            language: {
                search: 'ค้นหา:',
                lengthMenu: 'แสดง _MENU_ รายการ',
                info: 'แสดง _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ',
                infoEmpty: 'ไม่พบข้อมูล',
                zeroRecords: 'ไม่พบข้อมูลที่ตรงกับการค้นหา',
                paginate: {
                    first: 'แรก',
                    last: 'ท้ายสุด',
                    next: 'ถัดไป',
                    previous: 'ก่อนหน้า',
                },
            },
        });
    }

    // 3. ฟังก์ชันดึงข้อมูลจาก AJAX
    async function loadReportData() {
        const queryParams = $.param({
            fiscalYear: $('#filter_fiscalYear').val() || '',
            docNo: $('#filter_docNo').val() || '',
            divCode: $('#filter_divCode').val() || '',
            depCode: $('#filter_depCode').val() || '',
            reviewPeriod: $('#filter_reviewPeriod').val() || '',
            status: $('#filter_status').val() || '',
            startDate: $('#filter_startDate').val() || '',
            endDate: $('#filter_endDate').val() || '',
        });

        try {
            await showLoader({ show: true });
            const res = await $.getJSON(
                `${host}feform/FE-ASP/report/ajaxGetReportData?${queryParams}`,
            );
            renderDataTable(res?.status ? res.data : []);
        } catch (e) {
            console.error('loadReportData error:', e);
            showErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน');
            renderDataTable([]);
        } finally {
            await showLoader({ show: false });
        }
    }

    // 4. ผูก Event คอนโทรล
    // ดัก Submit ของ Form ไม่ให้เบราว์เซอร์รีโหลดหน้า
    $('#formFilter').on('submit', function (e) {
        e.preventDefault();
        const fy = $('#filter_fiscalYear').val();
        updateFiscalYearBanner(fy);
        loadReportData();
        return false;
    });

    // ปุ่มคลิกค้นหา
    $('#btnSearch').on('click', function (e) {
        e.preventDefault();
        const fy = $('#filter_fiscalYear').val();
        updateFiscalYearBanner(fy);
        loadReportData();
    });

    // ปุ่มคลิกรีเซ็ต
    $('#btnResetFilter').on('click', function (e) {
        e.preventDefault();
        $('#formFilter')[0].reset();
        const fy = $('#filter_fiscalYear').val();
        updateFiscalYearBanner(fy);
        loadReportData();
    });

    // เปิดไฟล์แนบ
    $(document).on('click', '.btn-open-report-file', async function (e) {
        e.preventDefault();
        const baseDir = $(this).data('base-dir');
        const storedName = $(this).data('stored-name');
        const originalName = $(this).data('original-name') || 'document.pdf';

        if (!storedName) {
            showErrorMessage('ไม่พบข้อมูลไฟล์');
            return;
        }

        try {
            await showLoader({ show: true });
            const file = await getFile({
                baseDir: baseDir,
                storedName: storedName,
                originalName: originalName,
                mode: 'open',
            });

            const blobUrl = URL.createObjectURL(file);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        } catch (err) {
            console.error('Open file error:', err);
            showErrorMessage('เกิดข้อผิดพลาดในการเปิดไฟล์');
        } finally {
            await showLoader({ show: false });
        }
    });

    // ตรวจสอบความคืบหน้ารายปีของ Fiscal Year
    async function updateFiscalYearBanner(year) {
        const selectedYear = year || $('#filter_fiscalYear').val() || '2026';
        const nextYear = Number(selectedYear) + 1;

        $('#banner-year-txt').text(selectedYear);
        $('#banner-start-year').text(selectedYear);
        $('#banner-end-year').text(nextYear);

        try {
            const res = await $.getJSON(
                `${host}feform/FE-ASP/report/ajaxCheckYearlyProgress?fiscalYear=${selectedYear}`,
            );
            if (res && res.status) {
                const d = res.data;
                const total = d.total || 0;
                const approved = d.approved || 0;
                const percent =
                    total > 0 ? Math.round((approved / total) * 100) : 0;

                $('#banner-count-txt').text(`${approved} / ${total}`);
                $('#banner-percent-badge').text(`${percent}%`);

                if (d.isCompleted) {
                    $('#banner-status-desc').html(
                        '<span class="text-emerald-400 font-bold">✓ อนุมัติครบถ้วน 100% แล้ว</span> — สามารถดาวน์โหลดเอกสาร Cover ประจำปีได้',
                    );
                    $('#btnDownloadCoverExcel').removeClass('hidden');
                } else {
                    $('#banner-status-desc').text(
                        `ยังอยู่ระหว่างดำเนินการ (คงเหลืออีก ${d.remaining} ใบที่ยังไม่อนุมัติ)`,
                    );
                    $('#btnDownloadCoverExcel').addClass('hidden');
                }

                $('#btnDownloadCoverExcel').removeClass('hidden');
            }
        } catch (e) {
            console.error('Update banner error:', e);
        }
    }

    // เมื่อเปลี่ยน Fiscal Year ใน Dropdown
    $('#filter_fiscalYear').on('change', function () {
        const fy = $(this).val();
        updateFiscalYearBanner(fy);
        loadReportData();
    });

    // ดูประวัติ Revision ย้อนหลัง
    $(document).on('click', '.btn-view-history', async function (e) {
        e.preventDefault();
        const controlNo = $(this).data('control');
        $('#modal-control-txt').text(controlNo);
        $('#tblHistoryBody').html(
            '<tr><td colspan="7" class="text-center py-4 text-slate-400">กำลังโหลดข้อมูลประวัติ...</td></tr>',
        );
        $('#modalHistory').removeClass('hidden');

        try {
            const res = await $.getJSON(
                `${host}feform/FE-ASP/report/ajaxGetControlHistory?controlNo=${encodeURIComponent(controlNo)}`,
            );
            if (res && res.status && res.data.length > 0) {
                let html = '';
                res.data.forEach((h) => {
                    const st = (h.STATUS || 'DRAFT').toUpperCase();
                    let badgeClass =
                        st === 'APPROVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700';

                    html += `
                        <tr class="hover:bg-slate-50">
                            <td class="p-2.5 text-center font-bold text-slate-700">${h.DOC_REVISION || '*'}</td>
                            <td class="p-2.5 font-medium text-slate-800">${h.DOC_NO || '-'}</td>
                            <td class="p-2.5">${h.REVIEW_PERIOD === 'YEARLY' ? 'Yearly review' : 'Changing review'}</td>
                            <td class="p-2.5 max-w-xs truncate">${h.DETAIL_OF_CHANGE || (h.REVIEW_DETAILS === 'NO_CHANGE' ? 'No change' : '-')}</td>
                            <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}">${st}</span></td>
                            <td class="p-2.5 text-slate-500">${h.CREATE_DATE_TXT || '-'}</td>
                            <td class="p-2.5 text-center">
                                <a href="${host}feform/FE-ASP/form/main?no=${h.NFRMNO}&orgNo=${h.VORGNO}&y=${h.CYEAR}&y2=${h.CYEAR2}&runNo=${h.NRUNNO}&m=3" target="_blank" class="text-blue-600 hover:underline">เปิดดู</a>
                            </td>
                        </tr>
                    `;
                });
                $('#tblHistoryBody').html(html);
            } else {
                $('#tblHistoryBody').html(
                    '<tr><td colspan="7" class="text-center py-4 text-slate-400">ไม่พบประวัติเอกสาร</td></tr>',
                );
            }
        } catch (err) {
            $('#tblHistoryBody').html(
                '<tr><td colspan="7" class="text-center py-4 text-rose-500">เกิดข้อผิดพลาดในการโหลดประวัติ</td></tr>',
            );
        }
    });

    $('#btnCloseModalHistory').on('click', function () {
        $('#modalHistory').addClass('hidden');
    });

    // ปุ่มดาวน์โหลด Cover Excel
    $('#btnDownloadCoverExcel').on('click', function () {
        const fy = $('#filter_fiscalYear').val() || '2026';
        window.open(
            `${host}feform/FE-ASP/report/exportYearlyCoverExcel?fiscalYear=${fy}`,
            '_blank',
        );
    });

    // คลิกปุ่ม "ตรวจสอบรอบปี & สร้าง FE-DOC"

    $('#btnCheckAndCreateFeDoc').on('click', async function () {
        const fy = $('#filter_fiscalYear').val() || '2026';
        const empNoToSend = (
            window.CURRENT_EMPNO ||
            $('#EMPNOHid').val() ||
            '13204'
        ).trim();

        try {
            await showLoader({ show: true });

            // 1. สร้าง Form FE-DOC และหยอดข้อมูลลง Excel Template
            const res = await $.post(
                `${host}feform/FE-ASP/report/ajaxTriggerYearlyReviewAndFeDoc`,
                {
                    fiscalYear: fy,
                    empno: empNoToSend,
                },
                'json',
            );

            if (res && res.status) {
                // 2. ถ้ามีไฟล์ Excel ให้เรียกใช้งานฟังก์ชันกลาง
                if (res.excelFile && res.feDocKeys) {
                    await handleAutoFeDocUpload(res, empNoToSend);
                }

                alert(`${res.message}\nกด ตกลง เพื่อเปิดไปยังฟอร์ม FE-DOC`);
                window.open(res.docUrl, '_blank');
                updateFiscalYearBanner(fy);
            } else {
                showErrorMessage(res?.message || 'ไม่สามารถดำเนินการได้');
            }
        } catch (err) {
            console.error('Trigger FeDoc Error:', err);
            showErrorMessage(
                'เกิดข้อผิดพลาดในการดำเนินการ: ' + (err.message || ''),
            );
        } finally {
            await showLoader({ show: false });
        }
    });

    // 5. เริ่มต้นทำงาน (ตัด initDataTable() เปล่าๆ ออก ให้ดึงข้อมูลมาสร้าง DataTables ทันที)
    const defaultFY = $('#filter_fiscalYear').val();
    updateFiscalYearBanner(defaultFY);
    loadReportData();
});
