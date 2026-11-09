import $ from 'jquery';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { getFile } from '@amec/webasset/api/file';
import { host } from '../../utils';

import 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';

$(document).ready(function () {
    let dtInstance = null;
    const currentEmp = window.CURRENT_EMPNO || '';

    function initDataTable() {
        dtInstance = $('#tblReport').DataTable({
            responsive: true,
            pageLength: 15,
            lengthMenu: [10, 15, 25, 50, 100],
            order: [[0, 'desc']],
            columns: [
                {
                    title: 'No.',
                    data: null,
                    className:
                        'text-center align-middle font-medium text-slate-500 w-12',
                    render: function (data, type, row, meta) {
                        return meta.row + 1;
                    },
                },
                {
                    title: 'Division',
                    data: null,
                    className: 'align-middle whitespace-nowrap',
                    render: function (data, type, row) {
                        return row.DIVISION_NAME || row.SDIVCODE || '-';
                    },
                },
                {
                    title: 'Department',
                    data: null,
                    className: 'align-middle whitespace-nowrap',
                    render: function (data, type, row) {
                        return row.DEPT_NAME || row.SDEPCODE || '-';
                    },
                },
                {
                    title: 'Section',
                    data: null,
                    className: 'align-middle whitespace-nowrap',
                    render: function (data, type, row) {
                        return row.SSECCODE && row.SSECCODE !== '00'
                            ? row.SEC_NAME || row.SSECCODE
                            : '-';
                    },
                },
                {
                    title: 'Control no.',
                    data: 'CONTROL_NO',
                    className:
                        'align-middle font-bold text-emerald-700 whitespace-nowrap',
                    render: function (data, type, row) {
                        const curHost =
                            host || window.location.origin + '/form/';
                        const backPath = encodeURIComponent(
                            '/formtest/workflow/mineList.asp',
                        );
                        const docUrl = `${curHost}feform/FE-ASP/form/main?no=${row.NFRMNO}&orgNo=${row.VORGNO}&y=${row.CYEAR}&y2=${row.CYEAR2}&runNo=${row.NRUNNO}&m=3&empno=${currentEmp}&bp=${backPath}&menu=1`;

                        return `<a href="${docUrl}" target="_blank" class="hover:underline" title="เปิดดูฟอร์มเอกสาร">${data}</a>
                                <span class="text-[10px] text-slate-400 block font-normal">${row.DOC_NO || ''}</span>`;
                    },
                },
                {
                    title: 'Review period',
                    data: 'REVIEW_PERIOD',
                    className: 'align-middle text-center whitespace-nowrap',
                    render: function (data) {
                        return data === 'YEARLY'
                            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Yearly review</span>'
                            : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Review on changing</span>';
                    },
                },
                {
                    title: 'Review details',
                    data: 'REVIEW_DETAILS',
                    className: 'align-middle text-center whitespace-nowrap',
                    render: function (data) {
                        return data === 'NO_CHANGE'
                            ? '<span class="font-medium text-slate-700">No change</span>'
                            : '<span class="font-bold text-amber-700">Change</span>';
                    },
                },
                {
                    title: 'Detail of change',
                    data: 'DETAIL_OF_CHANGE',
                    className: 'align-middle max-w-xs truncate',
                    render: function (data) {
                        return data
                            ? `<span title="${data}">${data}</span>`
                            : '-';
                    },
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
                    render: function (data, type, row) {
                        return `<span class="font-semibold text-slate-700">${row.REQ_NAME || row.REQ_BY || '-'}</span>`;
                    },
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
                            const isCover = (f.FILE_ONAME || '').includes(
                                'CoverSheet',
                            );
                            const formattedBaseDir = (
                                f.FILE_PATH || ''
                            ).replace(/\\/g, '/');

                            // กำหนด Theme สีตามประเภทไฟล์
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
            ],
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

    async function loadReportData() {
        const queryParams = $.param({
            docNo: $('#filter_docNo').val() || '',
            divCode: $('#filter_divCode').val() || '',
            depCode: $('#filter_depCode').val() || '',
            status: $('#filter_status').val() || '',
            startDate: $('#filter_startDate').val() || '',
            endDate: $('#filter_endDate').val() || '',
        });

        try {
            await showLoader({ show: true });
            const res = await $.getJSON(
                `${host}feform/FE-ASP/report/ajaxGetReportData?${queryParams}`,
            );
            if (res && res.status) {
                dtInstance.clear().rows.add(res.data).draw();
            } else {
                dtInstance.clear().draw();
            }
        } catch (e) {
            console.error('loadReportData error:', e);
            showErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน');
        } finally {
            await showLoader({ show: false });
        }
    }

    initDataTable();
    loadReportData();

    // Event ปุ่มค้นหา & รีเซ็ต
    $('#formFilter').on('submit', function (e) {
        e.preventDefault();
        loadReportData();
    });

    $('#btnResetFilter').on('click', function () {
        $('#formFilter')[0].reset();
        loadReportData();
    });

    // Event คลิกปุ่มเปิดดูไฟล์ PDF แนบ
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
});
