class MfgEdrDashboard {
    constructor() {
        this.yearSelect = document.getElementById('ddl-dashboard-year');

        this.allSectionCheckbox = document.getElementById(
            'chk-dashboard-section-all',
        );

        this.sectionCheckboxes = [
            ...document.querySelectorAll('.dashboard-section-checkbox'),
        ];

        this.init();
    }

    init() {
        this.renderFiscalYears();
        this.bindSectionEvents();
    }

    renderFiscalYears() {
        if (!this.yearSelect) return;

        const currentYear = new Date().getFullYear();

        const years = Array.from(
            { length: 6 },
            (_, index) => currentYear - index,
        );

        this.yearSelect.innerHTML = years
            .map((year) => `<option value="${year}">${year}</option>`)
            .join('');

        this.yearSelect.value = String(currentYear);
    }

    bindSectionEvents() {
        if (!this.allSectionCheckbox) return;

        this.allSectionCheckbox.addEventListener('change', () => {
            const checked = this.allSectionCheckbox.checked;

            this.sectionCheckboxes.forEach((checkbox) => {
                checkbox.checked = checked;
            });

            this.onFilterChange();
        });

        this.sectionCheckboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                this.syncAllSectionCheckbox();
                this.onFilterChange();
            });
        });
    }

    syncAllSectionCheckbox() {
        const total = this.sectionCheckboxes.length;

        const checkedCount = this.sectionCheckboxes.filter(
            (checkbox) => checkbox.checked,
        ).length;

        this.allSectionCheckbox.checked = checkedCount === total;

        this.allSectionCheckbox.indeterminate =
            checkedCount > 0 && checkedCount < total;
    }

    getSelectedSections() {
        return this.sectionCheckboxes
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => ({
                code: checkbox.value,
                display: checkbox.dataset.display,
            }));
    }

    getFilters() {
        return {
            CYEAR2: this.yearSelect?.value || '',
            SSECCODE: this.getSelectedSections().map((item) => item.code),
        };
    }

    onFilterChange() {
        const filters = this.getFilters();
        console.log('Dashboard Filters:', filters);

        /*
        Step ถัดไปค่อยเรียก API

        await loadDashboard(filters);
        */
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.mfgEdrDashboard = new MfgEdrDashboard();
});
