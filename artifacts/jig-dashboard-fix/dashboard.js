$(document).ready(function () {
    JigDashboard.init();
});

const JigDashboard = {
    data: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    currentFilter: 'all',
    searchText: '',
    fiscalYear: null,

    async init() {
        this.bindEvents();
        await this.loadDashboard();
    },

    bindEvents() {
        $(document).on('click', '.jig-filter', function () {
            $('.jig-filter').removeClass('active');
            $(this).addClass('active');

            JigDashboard.currentFilter = $(this).data('filter');
            JigDashboard.currentPage = 1;
            JigDashboard.applyFilter();
        });

        $('#jig-search').on('input', function () {
            JigDashboard.searchText = $(this).val().trim().toLowerCase();
            JigDashboard.currentPage = 1;
            JigDashboard.applyFilter();
        });

        $('#fyear').on('change', async function () {
            JigDashboard.fiscalYear = Number($(this).val());
            JigDashboard.currentPage = 1;
            await JigDashboard.loadDashboard(JigDashboard.fiscalYear);
        });

        $('#btn-export').on('click', function () {
            JigDashboard.exportExcel();
        });

        $('#btn-add-jig').on('click', function () {
            JigDashboard.openAddJig();
        });

        $(document).on('click', '.page-btn', function () {
            const page = Number($(this).data('page'));

            if (!page || page === JigDashboard.currentPage) return;

            JigDashboard.currentPage = page;
            JigDashboard.renderTable();
        });

        $(document).on('click', '.btn-inspect', function () {
            const jigNo = $(this).data('jig');
            JigDashboard.openInspection(jigNo);
        });

        $(document).on('click', '.btn-view-jig', function () {
            const jigNo = $(this).data('jig');
            JigDashboard.viewJig(jigNo);
        });
    },

    async loadDashboard(fyear = null) {
        this.showLoading();
        try {
            let url = `${JIG_CONFIG.apiUrl}/iedoc/jig/dashboard`;
            if (fyear) {
                url += `?fyear=${fyear}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            this.data = Array.isArray(result.items) ? result.items : [];
            this.fiscalYear = Number(result.fyear);

            this.renderFiscalYear();
            this.renderSummary(result.summary || {});
            this.renderPeriod(result.period);
            this.applyFilter();
        } catch (error) {
            console.error('JIG Dashboard Error:', error);

            this.data = [];
            this.filteredData = [];

            $('#jig-table-body').html(`
                <tr>
                    <td colspan="9" class="text-center text-danger py-4">
                        <i class="fa fa-exclamation-triangle"></i>
                        ไม่สามารถโหลดข้อมูล Dashboard ได้
                    </td>
                </tr>
            `);
        }
    },


    renderFiscalYear() {
        const now = new Date();
        const current = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        const selected = Number.isInteger(this.fiscalYear) && this.fiscalYear > 0
            ? this.fiscalYear : current;
        this.fiscalYear = selected;
        const options = [];
        for (let year = Math.max(current + 1, selected); year >= Math.min(current - 5, selected); year--) {
            options.push(`<option value="${year}">FY${year} (Apr–Mar)</option>`);
        }
        $('#fyear').html(options.join('')).val(String(selected));
        $('#summary-fy').text(String(selected).slice(-2));
    },
    renderSummary(summary) {
        const total = Number(summary.total ?? this.data.length);
        const completed = Number(summary.completed || 0);
        $('#summary-total').text(total);
        $('#summary-completed').text(completed);
        $('#summary-due-soon').text(Number(summary.dueSoon || 0));
        $('#summary-overdue').text(Number(summary.overdue || 0));
        $('#summary-new').text(Math.max(0, total - completed));
        $('#filter-total').text(this.data.length);
        $('#filter-due-soon').text(this.data.filter(item => (item.DUE_STATUS || item.DASHBOARD_STATUS) === 'DUE_SOON').length);
        $('#filter-overdue').text(this.data.filter(item => (item.DUE_STATUS || item.DASHBOARD_STATUS) === 'OVERDUE').length);
        $('#filter-new').text(this.data.filter(item => this.isNewJig(item)).length);
        $('#filter-12m').text(this.data.filter(item => Number(item.INSPEC_PERIOD) === 12).length);
        $('#filter-6m').text(this.data.filter(item => Number(item.INSPEC_PERIOD) === 6).length);
    },

    isNewJig(item) {
        const date = this.parseDate(item.START_USE_DATE);
        return !!date && date >= new Date(this.fiscalYear, 3, 1) && date < new Date(this.fiscalYear + 1, 3, 1);
    },

    applyFilter() {
        let items = [...this.data];

        switch (this.currentFilter) {
            case 'due-soon':
                items = items.filter(item =>
                    (item.DUE_STATUS || item.DASHBOARD_STATUS) === 'DUE_SOON'
                );
                break;

            case 'new':
                items = items.filter(item => this.isNewJig(item));
                break;
            case 'overdue':
                items = items.filter(item => (item.DUE_STATUS || item.DASHBOARD_STATUS) === 'OVERDUE');
                break;
            case '12m':
                items = items.filter(item => Number(item.INSPEC_PERIOD) === 12);
                break;

            case '6m':
                items = items.filter(item =>
                    Number(item.INSPEC_PERIOD) === 6
                );
                break;
        }

        if (this.searchText) {
            items = items.filter(item => {
                const jigNo = String(item.JIG_NO || '').toLowerCase();
                const jigName = String(item.JIG_NAME || '').toLowerCase();
                const picName = String(item.PIC_NAME || '').toLowerCase();
                const picEmpno = String(item.PIC_EMPNO || '').toLowerCase();
                const process = String(item.PROCESS_CODE || '').toLowerCase();

                return (
                    jigNo.includes(this.searchText) ||
                    jigName.includes(this.searchText) ||
                    picName.includes(this.searchText) ||
                    picEmpno.includes(this.searchText) ||
                    process.includes(this.searchText)
                );
            });
        }

        this.filteredData = items;
        this.renderTable();
    },

    renderTable() {
        const $tbody = $('#jig-table-body');
        $tbody.empty();

        const total = this.filteredData.length;
        const totalPages = Math.ceil(total / this.pageSize);

        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }

        if (total === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="9" class="text-center text-muted py-4">
                        ไม่พบข้อมูล
                    </td>
                </tr>
            `);

            this.renderPagination(0, 0, 0);
            return;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, total);
        const pageItems = this.filteredData.slice(startIndex, endIndex);

        pageItems.forEach((item, index) => {
            const no = startIndex + index + 1;
            const controller = this.getControllerName(item);
            const period = this.getInspectionPeriod(item);
            const schedule = this.renderSchedule(item);
            const nextInspection = this.formatMonthYear(item.NEXT_INSPEC_DATE);
            const status = this.renderStatus(item.DASHBOARD_STATUS);
            const action = this.renderAction(item);

            const isSixMonth = Number(item.INSPEC_PERIOD) === 6;

            $tbody.append(`
                <tr>
                    <td class="row-number">${no}</td>

                    <td>
                        <a href="javascript:void(0)"
                           class="jig-link btn-view-jig"
                           data-jig="${this.escapeHtml(item.JIG_NO)}">
                            ${this.escapeHtml(item.JIG_NO)}
                        </a>
                    </td>

                    <td>
                        <span class="jig-name">
                            ${this.escapeHtml(item.JIG_NAME || '-')} ${this.isNewJig(item) ? '<span class="legend-status status-new">New</span>' : ''}
                        </span>
                    </td>

                    <td>
                        ${this.escapeHtml(controller)}
                    </td>

                    <td class="${isSixMonth ? 'period-6m' : ''}">
                        ${period}
                    </td>

                    <td>
                        <div class="schedule-container">
                            ${schedule}
                        </div>
                    </td>

                    <td class="${this.getNextInspectionClass(item.DASHBOARD_STATUS)}">
                        ${nextInspection}
                    </td>

                    <td>
                        ${status}
                    </td>

                    <td class="text-center">
                        ${action}
                    </td>
                </tr>
            `);
        });

        this.renderPagination(startIndex + 1, endIndex, total);
    },

    renderSchedule(item) {
        const date = this.parseDate(item.NEXT_INSPEC_DATE);
        if (!date) return '-';
        const hues = [210, 270, 330, 150, 35, 185, 240, 15, 290, 80, 170, 350];
        const hue = hues[date.getMonth()];
        return '<span style="display:inline-block;padding:5px 12px;border-radius:8px;font-weight:700;background:hsl(' + hue + ',80%,94%);color:hsl(' + hue + ',70%,28%);border:1px solid hsl(' + hue + ',65%,78%)" title="เดือนตรวจครั้งถัดไป">' + this.getMonthShort(date.getMonth()) + '</span>';
    },

    renderStatus(status) {
        switch (status) {
            case 'OVERDUE':
                return `
                    <span class="jig-status status-overdue">
                        <i class="fa fa-circle"></i> Overdue
                    </span>
                `;

            case 'DUE_SOON':
                return `
                    <span class="jig-status status-due-soon">
                        <i class="fa fa-circle"></i> Due Soon
                    </span>
                `;

            default:
                return `
                    <span class="jig-status status-planned">
                        <i class="fa fa-circle"></i> Planned
                    </span>
                `;
        }
    },

    renderAction(item) {
        const inspections = Array.isArray(item.INSPECTIONS)
            ? item.INSPECTIONS
            : [];

        const pendingInspection = inspections.find(inspection =>
            String(inspection.INSPEC_STATUS || '').toUpperCase() !== 'FINISH'
        );

        if (pendingInspection) {
            return `
                <button type="button"
                        class="btn btn-sm btn-inspect"
                        data-jig="${this.escapeHtml(item.JIG_NO)}">
                    ตรวจสอบ
                </button>
            `;
        }

        return `
            <button type="button"
                    class="btn btn-sm btn-view-jig"
                    data-jig="${this.escapeHtml(item.JIG_NO)}">
                ดูผล
            </button>
        `;
    },

    renderPagination(start, end, total) {
        const $pagination = $('#pagination');

        $('#pagination-info').text(
            total
                ? `แสดง ${start}-${end} จาก ${total} รายการ`
                : 'แสดง 0-0 จาก 0 รายการ'
        );

        $pagination.empty();

        const totalPages = Math.ceil(total / this.pageSize);

        if (totalPages <= 1) return;

        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';

        $pagination.append(`
            <button type="button"
                    class="page-btn page-arrow"
                    data-page="${this.currentPage - 1}"
                    ${prevDisabled}>
                ‹
            </button>
        `);

        const pages = this.getPaginationPages(totalPages);

        pages.forEach(page => {
            if (page === '...') {
                $pagination.append(`
                    <span class="page-dots">...</span>
                `);
                return;
            }

            $pagination.append(`
                <button type="button"
                        class="page-btn ${page === this.currentPage ? 'active' : ''}"
                        data-page="${page}">
                    ${page}
                </button>
            `);
        });

        const nextDisabled =
            this.currentPage === totalPages ? 'disabled' : '';

        $pagination.append(`
            <button type="button"
                    class="page-btn page-arrow"
                    data-page="${this.currentPage + 1}"
                    ${nextDisabled}>
                ›
            </button>
        `);
    },

    getPaginationPages(totalPages) {
        if (totalPages <= 5) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        }

        if (this.currentPage <= 3) {
            return [1, 2, 3, 4, '...', totalPages];
        }

        if (this.currentPage >= totalPages - 2) {
            return [
                1,
                '...',
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages
            ];
        }

        return [
            1,
            '...',
            this.currentPage - 1,
            this.currentPage,
            this.currentPage + 1,
            '...',
            totalPages
        ];
    },

    renderPeriod() {
        const fy = this.fiscalYear;
        $('#period-label').text('FY' + String(fy).slice(-2) + ' (1 Apr ' + fy + ' - 31 Mar ' + (fy + 1) + ')');
    },

    getControllerName(item) {
        const empno = String(item.PIC_EMPNO || '').trim();
        const name = String(item.PIC_NAME || '').trim();
        return [empno ? '(' + empno + ')' : '', name].filter(Boolean).join(' ') || '-';
    },

    getInspectionPeriod(item) {
        const period = Number(item.INSPEC_PERIOD);

        if (!period) return '-';

        if (period === 12) return '12M';

        return `${period}M`;
    },

    getNextInspectionClass(status) {
        if (status === 'OVERDUE') return 'next-overdue';
        if (status === 'DUE_SOON') return 'next-due-soon';

        return '';
    },

    formatMonthYear(value) {
        const date = this.parseDate(value);

        if (!date) return '-';

        return `${this.getMonthShort(date.getMonth())} ${date.getFullYear()}`;
    },

    parseDate(value) {
        if (!value) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
            const [y, m, d] = value.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        const instant = new Date(value);
        if (Number.isNaN(instant.getTime())) return null;
        const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Bangkok', year: 'numeric', month: 'numeric', day: 'numeric'}).formatToParts(instant);
        const part = type => Number(parts.find(p => p.type === type).value);
        return new Date(part('year'), part('month') - 1, part('day'));
    },

    getMonthShort(month) {
        return [
            'Jan', 'Feb', 'Mar', 'Apr',
            'May', 'Jun', 'Jul', 'Aug',
            'Sep', 'Oct', 'Nov', 'Dec'
        ][month];
    },

    showLoading() {
        $('#jig-table-body').html(`
            <tr>
                <td colspan="9" class="text-center py-4">
                    <i class="fa fa-spinner fa-spin"></i>
                    Loading...
                </td>
            </tr>
        `);
    },

    exportExcel() {
        if (!this.filteredData.length) {
            alert('ไม่มีข้อมูลสำหรับ Export');
            return;
        }

        const rows = [
            [
                'No',
                'JIG No.',
                'JIG Name',
                'Controller',
                'Period',
                'Next Inspection',
                'Status'
            ]
        ];

        this.filteredData.forEach((item, index) => {
            rows.push([
                index + 1,
                item.JIG_NO || '',
                item.JIG_NAME || '',
                this.getControllerName(item),
                this.getInspectionPeriod(item),
                this.formatMonthYear(item.NEXT_INSPEC_DATE),
                item.DASHBOARD_STATUS || ''
            ]);
        });

        const csv = rows
            .map(row =>
                row.map(value =>
                    `"${String(value).replace(/"/g, '""')}"`
                ).join(',')
            )
            .join('\r\n');

        const blob = new Blob(
            ['\ufeff' + csv],
            { type: 'text/csv;charset=utf-8;' }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `JIG_Dashboard_FY${this.fiscalYear}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    },

    openAddJig() {
        console.log('Add JIG');
        /*
         * Modal Add JIG จะทำในขั้นถัดไป
         */
    },

    openInspection(jigNo) {
        console.log('Inspection:', jigNo);
        /*
         * Modal Inspection จะทำในขั้นถัดไป
         */
    },

    viewJig(jigNo) {
        console.log('View JIG:', jigNo);
        /*
         * Detail / Inspection History จะทำในขั้นถัดไป
         */
    },

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};