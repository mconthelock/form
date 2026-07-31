import ApexCharts from 'apexcharts';

class TroubleDashboard {
    constructor() {
        this.charts = {};
        this.defaultEffect = 'HIGH';

        this.elements = {
            fiscalYear: document.getElementById('ddl-trouble-fiscal-year'),
            month: document.getElementById('ddl-trouble-month'),
            defectType: document.getElementById('ddl-trouble-defect-type'),
            item: document.getElementById('ddl-trouble-item'),
            section: document.getElementById('ddl-trouble-section'),
            resetButton: document.getElementById('btn-reset-trouble-filter'),
            effectButtons: [...document.querySelectorAll('.effect-button')],
            tableBody: document.getElementById('tbody-trouble-detail'),
            totalRecords: document.getElementById('lbl-trouble-total-records'),
        };

        this.mockData = this.createMockData();
        this.init();
    }

    init() {
        this.renderFiscalYears();
        this.renderFilterOptions();
        this.bindEvents();
        this.loadDashboard();
    }

    createMockData() {
        return {
            topItems: [
                {
                    item: '203',
                    assemblyMistake: 14,
                    other: 0,
                    wiringMistake: 30,
                },
                {
                    item: '235',
                    assemblyMistake: 1,
                    other: 0,
                    wiringMistake: 3,
                },
                {
                    item: '213',
                    assemblyMistake: 1,
                    other: 0,
                    wiringMistake: 1,
                },
            ],

            defectBySection: [
                { section: 'EWC', total: 46 },
                { section: 'ELC', total: 6 },
                { section: 'EEL', total: 1 },
            ],

            significantDefect: [
                { cause: 'Wrong wiring', total: 32 },
                { cause: 'Wrong assy', total: 10 },
                { cause: 'Alternate wiring', total: 4 },
                { cause: 'No assy', total: 4 },
                { cause: 'OM', total: 2 },
                { cause: 'PLIM', total: 1 },
            ],

            details: [
                {
                    dailyNo: 'EWC-DEC-258',
                    item: '203',
                    effect: 'High',
                    orderNo: 'EOJM44015',
                    causeSub: 'Wrong wiring',
                    causeName: 'งานประกอบสายไฟผิดพลาด',
                    detail: 'DWG.กำหนด WIRING CONNECTOR ZPE-PA02 ไป T.52 แต่ประกอบไป T.53',
                    month: 'DEC',
                    section: 'EWC',
                    defectType: 'WIRING',
                },
                {
                    dailyNo: 'EWC-APR-255',
                    item: '203',
                    effect: 'High',
                    orderNo: 'EXOU33012',
                    causeSub: 'Wrong wiring',
                    causeName: 'งานประกอบสายไฟผิดพลาด',
                    detail: 'CONNECTOR UPB-01 ไป PS-D2 ตำแหน่ง TB1-3 แต่ประกอบสลับกัน',
                    month: 'APR',
                    section: 'EWC',
                    defectType: 'WIRING',
                },
                {
                    dailyNo: 'EWC-NOV-2531',
                    item: '203',
                    effect: 'High',
                    orderNo: 'EXTT88045',
                    causeSub: 'Wrong wiring',
                    causeName: 'งานประกอบสายไฟผิดพลาด',
                    detail: 'Connector ZPE-PA02 ผิดตำแหน่งตาม Drawing',
                    month: 'NOV',
                    section: 'EWC',
                    defectType: 'WIRING',
                },
                {
                    dailyNo: 'ELC-JUL-2515',
                    item: '235',
                    effect: 'High',
                    orderNo: 'EXTP01030',
                    causeSub: 'OM',
                    causeName: 'อื่น ๆ',
                    detail: 'CONNECTOR ไม่ได้เขียนชื่อ ทำให้ตรวจสอบตำแหน่งได้ยาก',
                    month: 'JUL',
                    section: 'ELC',
                    defectType: 'OTHER',
                },
                {
                    dailyNo: 'EWC-MAY-2523',
                    item: '203',
                    effect: 'High',
                    orderNo: 'EO4S79100',
                    causeSub: 'Wrong wiring',
                    causeName: 'งานประกอบสายไฟผิดพลาด',
                    detail: 'DWG กำหนดตำแหน่ง TB1-3 แต่ Wiring ไป TB1-1',
                    month: 'MAY',
                    section: 'EWC',
                    defectType: 'WIRING',
                },
                {
                    dailyNo: 'EWC-FEB-2616',
                    item: '203',
                    effect: 'Medium',
                    orderNo: 'E8AW90012',
                    causeSub: 'Wrong wiring',
                    causeName: 'งานประกอบสายไฟผิดพลาด',
                    detail: 'DWG กำหนด CN2-P02 P05 แต่ประกอบสายไปตำแหน่งอื่น',
                    month: 'FEB',
                    section: 'EWC',
                    defectType: 'WIRING',
                },
                {
                    dailyNo: 'EWC-JUN-252',
                    item: '213',
                    effect: 'Low',
                    orderNo: 'EXTO11010',
                    causeSub: 'Wrong assy',
                    causeName: 'งานประกอบผิดพลาด',
                    detail: 'ประกอบ CONTACTOR สลับตำแหน่งกับอุปกรณ์ข้างเคียง',
                    month: 'JUN',
                    section: 'EWC',
                    defectType: 'ASSEMBLY',
                },
                {
                    dailyNo: 'ELC-SEP-2519',
                    item: '235',
                    effect: 'Medium',
                    orderNo: 'EO4U38066',
                    causeSub: 'No assy',
                    causeName: 'งานประกอบไม่ครบ',
                    detail: 'พบชิ้นส่วนไม่ได้ประกอบตามรายการใน Drawing',
                    month: 'SEP',
                    section: 'ELC',
                    defectType: 'ASSEMBLY',
                },
            ],
        };
    }

    renderFiscalYears() {
        const select = this.elements.fiscalYear;
        if (!select) return;

        const currentYear = new Date().getFullYear();
        const years = Array.from(
            { length: 6 },
            (_, index) => currentYear - index,
        );

        select.innerHTML = years
            .map((year) => `<option value="${year}">${year}</option>`)
            .join('');

        select.value = String(currentYear);
    }

    renderFilterOptions() {
        this.setSelectOptions(this.elements.defectType, [
            { value: 'ALL', text: 'All' },
            { value: 'ASSEMBLY', text: 'Assembly Mistake' },
            { value: 'WIRING', text: 'Wiring Mistake' },
            { value: 'OTHER', text: 'Other' },
        ]);

        this.setSelectOptions(this.elements.item, [
            { value: 'ALL', text: 'All' },
            { value: '203', text: '203' },
            { value: '235', text: '235' },
            { value: '213', text: '213' },
            { value: '295', text: '295' },
        ]);

        this.setSelectOptions(this.elements.section, [
            { value: 'ALL', text: 'All' },
            { value: 'EWC', text: 'EWC' },
            { value: 'ELC', text: 'ELC' },
            { value: 'EEL', text: 'EEL' },
        ]);
    }

    setSelectOptions(select, options) {
        if (!select) return;

        select.innerHTML = options
            .map(
                ({ value, text }) =>
                    `<option value="${value}">${text}</option>`,
            )
            .join('');
    }

    bindEvents() {
        const filterElements = [
            this.elements.fiscalYear,
            this.elements.month,
            this.elements.defectType,
            this.elements.item,
            this.elements.section,
        ].filter(Boolean);

        filterElements.forEach((element) => {
            element.addEventListener('change', () => {
                this.loadDashboard();
            });
        });

        this.elements.effectButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.selectEffect(button.dataset.effect);
            });
        });

        this.elements.resetButton?.addEventListener('click', () =>
            this.resetFilters(),
        );
    }

    selectEffect(effect) {
        this.elements.effectButtons.forEach((button) => {
            const isActive = button.dataset.effect === effect;
            button.classList.toggle('active', isActive);
        });

        this.loadDashboard();
    }

    getSelectedEffect() {
        const activeButton = this.elements.effectButtons.find((button) =>
            button.classList.contains('active'),
        );

        return activeButton?.dataset.effect || this.defaultEffect;
    }

    getFilters() {
        return {
            fiscalYear: this.elements.fiscalYear?.value || '',
            month: this.elements.month?.value || 'ALL',
            defectType: this.elements.defectType?.value || 'ALL',
            item: this.elements.item?.value || 'ALL',
            section: this.elements.section?.value || 'ALL',
            effect: this.getSelectedEffect(),
        };
    }

    resetFilters() {
        const currentYear = String(new Date().getFullYear());

        if (this.elements.fiscalYear) {
            this.elements.fiscalYear.value = currentYear;
        }

        if (this.elements.month) {
            this.elements.month.value = 'ALL';
        }

        if (this.elements.defectType) {
            this.elements.defectType.value = 'ALL';
        }

        if (this.elements.item) {
            this.elements.item.value = 'ALL';
        }

        if (this.elements.section) {
            this.elements.section.value = 'ALL';
        }

        this.elements.effectButtons.forEach((button) => {
            button.classList.toggle(
                'active',
                button.dataset.effect === this.defaultEffect,
            );
        });

        this.loadDashboard();
    }

    loadDashboard() {
        const filters = this.getFilters();
        const filteredDetails = this.filterDetails(
            this.mockData.details,
            filters,
        );

        this.renderTopDefectiveItems(
            this.createTopItemsFromDetails(filteredDetails),
        );

        this.renderDefectBySection(this.createSectionSummary(filteredDetails));

        this.renderSignificantDefect(this.createCauseSummary(filteredDetails));

        this.renderDetailTable(filteredDetails);

        console.log('Trouble dashboard filters:', filters);
    }

    filterDetails(details, filters) {
        return details.filter((row) => {
            const effectMatched =
                !filters.effect || row.effect.toUpperCase() === filters.effect;

            const monthMatched =
                filters.month === 'ALL' || row.month === filters.month;

            const itemMatched =
                filters.item === 'ALL' || row.item === filters.item;

            const sectionMatched =
                filters.section === 'ALL' || row.section === filters.section;

            const defectTypeMatched =
                filters.defectType === 'ALL' ||
                row.defectType === filters.defectType;

            return (
                effectMatched &&
                monthMatched &&
                itemMatched &&
                sectionMatched &&
                defectTypeMatched
            );
        });
    }

    createTopItemsFromDetails(details) {
        const summary = new Map();

        details.forEach((row) => {
            if (!summary.has(row.item)) {
                summary.set(row.item, {
                    item: row.item,
                    assemblyMistake: 0,
                    other: 0,
                    wiringMistake: 0,
                });
            }

            const item = summary.get(row.item);

            if (row.defectType === 'ASSEMBLY') {
                item.assemblyMistake += 1;
            } else if (row.defectType === 'WIRING') {
                item.wiringMistake += 1;
            } else {
                item.other += 1;
            }
        });

        return [...summary.values()]
            .map((row) => ({
                ...row,
                total: row.assemblyMistake + row.other + row.wiringMistake,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);
    }

    createSectionSummary(details) {
        const summary = new Map();

        details.forEach((row) => {
            summary.set(row.section, (summary.get(row.section) || 0) + 1);
        });

        return [...summary.entries()]
            .map(([section, total]) => ({ section, total }))
            .sort((a, b) => b.total - a.total);
    }

    createCauseSummary(details) {
        const summary = new Map();

        details.forEach((row) => {
            summary.set(row.causeSub, (summary.get(row.causeSub) || 0) + 1);
        });

        return [...summary.entries()]
            .map(([cause, total]) => ({ cause, total }))
            .sort((a, b) => b.total - a.total);
    }

    renderTopDefectiveItems(data) {
        const categories = data.map((row) => row.item);

        const options = {
            chart: {
                type: 'bar',
                height: '100%',
                stacked: true,
                toolbar: { show: false },
                animations: { enabled: true },
            },
            series: [
                {
                    name: 'Assembly Mistake',
                    data: data.map((row) => row.assemblyMistake),
                },
                {
                    name: 'Other',
                    data: data.map((row) => row.other),
                },
                {
                    name: 'Wiring Mistake',
                    data: data.map((row) => row.wiringMistake),
                },
            ],
            plotOptions: {
                bar: {
                    columnWidth: '52%',
                    borderRadius: 2,
                    dataLabels: {
                        total: {
                            enabled: true,
                            offsetY: -6,
                            style: {
                                fontSize: '12px',
                                fontWeight: 700,
                            },
                        },
                    },
                },
            },
            dataLabels: {
                enabled: true,
                formatter: (value) => (value > 0 ? value : ''),
                style: {
                    fontSize: '11px',
                    fontWeight: 700,
                },
            },
            xaxis: {
                categories,
                title: { text: 'ITEM' },
            },
            yaxis: {
                min: 0,
                forceNiceScale: true,
                title: { text: 'Total Daily' },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left',
                fontSize: '11px',
            },
            grid: {
                borderColor: '#e2e8f0',
                strokeDashArray: 3,
            },
            noData: {
                text: 'No data',
            },
        };

        this.renderChart('topItems', '#chart-top-defective-items', options);
    }

    renderDefectBySection(data) {
        const total = data.reduce((sum, row) => sum + row.total, 0);

        const options = {
            chart: {
                type: 'donut',
                height: '100%',
                toolbar: { show: false },
            },
            series: data.map((row) => row.total),
            labels: data.map((row) => row.section),
            legend: {
                position: 'top',
                fontSize: '11px',
            },
            stroke: {
                width: 2,
                colors: ['#ffffff'],
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '62%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: () => String(total),
                            },
                        },
                    },
                },
            },
            dataLabels: {
                enabled: true,
                formatter: (percentage, context) => {
                    const value = context.w.config.series[context.seriesIndex];

                    return `${value} (${percentage.toFixed(1)}%)`;
                },
            },
            noData: {
                text: 'No data',
            },
        };

        this.renderChart('section', '#chart-defect-by-section', options);
    }

    renderSignificantDefect(data) {
        const values = data.map((row) => row.total);
        const total = values.reduce((sum, value) => sum + value, 0);

        let accumulated = 0;
        const cumulativePercentages = values.map((value) => {
            accumulated += value;

            return total ? Number(((accumulated / total) * 100).toFixed(2)) : 0;
        });

        const options = {
            chart: {
                height: '100%',
                type: 'line',
                stacked: false,
                toolbar: { show: false },
            },
            series: [
                {
                    name: 'Defect',
                    type: 'column',
                    data: values,
                },
                {
                    name: 'Cumulative',
                    type: 'line',
                    data: cumulativePercentages,
                },
            ],
            stroke: {
                width: [0, 2],
                curve: 'straight',
            },
            plotOptions: {
                bar: {
                    columnWidth: '78%',
                    distributed: true,
                    borderRadius: 1,
                },
            },
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0, 1],
                formatter: (value, context) =>
                    context.seriesIndex === 1 ? `${Math.round(value)}%` : value,
                offsetY: -6,
                style: {
                    fontSize: '11px',
                },
            },
            xaxis: {
                categories: data.map((row) => row.cause),
                labels: {
                    rotate: 0,
                    trim: true,
                    style: {
                        fontSize: '10px',
                    },
                },
            },
            yaxis: [
                {
                    min: 0,
                    forceNiceScale: true,
                    title: { text: 'Defect' },
                },
                {
                    opposite: true,
                    min: 0,
                    max: 100,
                    tickAmount: 5,
                    labels: {
                        formatter: (value) => `${Math.round(value)}%`,
                    },
                    title: {
                        text: 'Cumulative',
                    },
                },
            ],
            legend: {
                show: false,
            },
            grid: {
                borderColor: '#e2e8f0',
                strokeDashArray: 3,
            },
            noData: {
                text: 'No data',
            },
        };

        this.renderChart('pareto', '#chart-significant-defect', options);
    }

    renderChart(name, selector, options) {
        const element = document.querySelector(selector);
        if (!element) return;

        if (this.charts[name]) {
            this.charts[name].destroy();
        }

        element.innerHTML = '';

        this.charts[name] = new ApexCharts(element, options);

        this.charts[name].render();
    }

    renderDetailTable(rows) {
        const tbody = this.elements.tableBody;
        if (!tbody) return;

        if (!rows.length) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">No data</td>
                </tr>
            `;

            this.updateTotalRecords(0);
            return;
        }

        tbody.innerHTML = rows
            .map(
                (row) => `
                    <tr>
                        <td>${this.escapeHtml(row.dailyNo)}</td>
                        <td class="text-center">${this.escapeHtml(row.item)}</td>
                        <td>${this.renderEffectBadge(row.effect)}</td>
                        <td>${this.escapeHtml(row.orderNo)}</td>
                        <td>${this.escapeHtml(row.causeSub)}</td>
                        <td>${this.escapeHtml(row.causeName)}</td>
                        <td>${this.escapeHtml(row.detail)}</td>
                    </tr>
                `,
            )
            .join('');

        this.updateTotalRecords(rows.length);
    }

    renderEffectBadge(effect) {
        const effectName = String(effect || '').trim();
        const effectClass =
            {
                High: 'bg-red-100 text-red-700',
                Medium: 'bg-amber-100 text-amber-700',
                Low: 'bg-emerald-100 text-emerald-700',
            }[effectName] || 'bg-slate-100 text-slate-700';

        return `
            <span class="inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${effectClass}">
                ${this.escapeHtml(effectName)}
            </span>
        `;
    }

    updateTotalRecords(total) {
        if (!this.elements.totalRecords) return;

        this.elements.totalRecords.textContent = `${total.toLocaleString()} Records`;
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.troubleDashboard = new TroubleDashboard();
});
