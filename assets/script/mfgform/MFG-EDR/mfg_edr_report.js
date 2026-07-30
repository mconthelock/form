import {
    getcause,
    getworktype,
    getUserbyemp,
    getprocess,
    getline,
    getamecorderdetail,
    getSection,
    searchMfgEdrReport,
} from './data.js';

import { showLoader } from '@amec/webasset/preloader';
import { showMessage, showConfirm } from '@amec/webasset/utils';
import { setDatePicker } from '@amec/webasset/flatpickr';
import {
    exportExcel,
    defaultExcel,
    mergeCell,
    applyStyleToRange,
    alignment,
    border,
} from '@amec/webasset/excel';
import { host } from '../../utils';
import Swal from 'sweetalert2';

class MfgEdrReport {
    constructor() {
        this.workTypes = [];
        this.causes = [];
        this.sections = [];
        this.causeRequestId = 0;
    }

    async init() {
        this.bindEvents();
        await this.loadMasterData();
    }

    bindEvents() {
        $('#ddl-work-type').on('change', async () => await this.loadCauses());
        $('#btn-clear-filter').on('click', () => this.clearFilter());
        $('#form-edr-export').on('submit', async (event) => {
            event.preventDefault();
            await this.exportExcel();
        });
    }

    async loadMasterData() {
        try {
            const [workTypeResponse, sectionResponse] = await Promise.all([
                getworktype(),
                getSection(),
            ]);
            this.workTypes = this.normalizeData(workTypeResponse);
            this.sections = this.normalizeData(sectionResponse);
            this.renderWorkTypes();
            this.renderSections();
            await this.loadCauses();
        } catch (error) {
            console.error('Load master data error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Load data failed',
                text: 'ไม่สามารถโหลดข้อมูล Master ได้',
            });
        }
    }

    async loadCauses() {
        const requestId = ++this.causeRequestId;
        const workType = String($('#ddl-work-type').val() ?? '');
        const causeGroup = workType === '4' ? 'PCB' : 'ALL';

        this.setSelectLoading('ddl-initial-cause', true);

        try {
            const response = await getcause({ CAUSE_GROUP: causeGroup });
            if (requestId !== this.causeRequestId) return;

            this.causes = this.normalizeData(response);
            this.renderCauses();
        } catch (error) {
            if (requestId !== this.causeRequestId) return;

            console.error('Load cause error:', error);
            this.setSelectOptions(
                'ddl-initial-cause',
                [],
                '--- Please select ---',
            );
            Swal.fire({
                icon: 'error',
                title: 'Load Cause Failed',
                text: 'ไม่สามารถโหลดข้อมูลสาเหตุได้',
            });
        } finally {
            if (requestId === this.causeRequestId)
                this.setSelectLoading('ddl-initial-cause', false);
        }
    }

    renderWorkTypes() {
        const options = this.workTypes
            .filter((item) => item.TID !== null && item.TID !== undefined)
            .map((item) => ({ value: item.TID, text: item.TYPENAME ?? '' }));

        this.setSelectOptions(
            'ddl-work-type',
            options,
            '--- Please select ---',
        );
    }

    renderCauses() {
        const options = this.causes
            .filter((item) => item.CID !== null && item.CID !== undefined)
            .map((item) => ({
                value: item.CID,
                text: `${item.CAUSE ?? ''}_${item.CAUSENAME ?? ''}`,
            }));

        this.setSelectOptions(
            'ddl-initial-cause',
            options,
            '--- Please select ---',
        );
    }

    renderSections() {
        const options = this.sections
            .filter((item) => {
                const sectionCode = String(item.SSECCODE ?? '').trim();
                const sectionName = String(item.SSEC ?? '')
                    .trim()
                    .toUpperCase();
                return (
                    sectionCode.startsWith('06') &&
                    !sectionName.includes('CANCEL')
                );
            })
            .map((item) => ({ value: item.SSECCODE, text: item.SSEC ?? '' }));

        this.setSelectOptions(
            'ddl-responsible-section',
            options,
            '--- Please select ---',
        );
    }

    setSelectOptions(selectId, items, placeholder) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const options = items.map(
            (item) =>
                `<option value="${this.escapeHtml(item.value)}">${this.escapeHtml(item.text)}</option>`,
        );
        select.innerHTML = `<option value="">${this.escapeHtml(placeholder)}</option>${options.join('')}`;
    }

    setSelectLoading(selectId, isLoading) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.disabled = isLoading;
        if (isLoading)
            select.innerHTML = '<option value="">Loading...</option>';
    }

    normalizeData(response) {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.result)) return response.result;
        if (Array.isArray(response?.data?.data)) return response.data.data;
        return [];
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    clearFilter() {
        const form = document.getElementById('form-edr-export');
        if (form) form.reset();

        $('#ddl-work-type').val('');
        $('#ddl-responsible-section').val('');
        $('#ddl-form-status').val('ALL');
        this.loadCauses();
    }

    async exportExcel() {
        const button = document.getElementById('btn-export-excel');
        const filters = Object.fromEntries(
            Object.entries({
                REQUEST_BY: $('#txt-request-by').val()?.trim(),
                REPAIR_BY: $('#txt-repair-by').val()?.trim(),
                DAILY_REPORT_NO: $('#txt-daily-report-no').val()?.trim(),
                TID: $('#ddl-work-type').val()
                    ? Number($('#ddl-work-type').val())
                    : '',
                CID: $('#ddl-initial-cause').val()
                    ? Number($('#ddl-initial-cause').val())
                    : '',
                SSECCODE: $('#ddl-responsible-section').val(),
                ORDERNO: $('#txt-order-no').val()?.trim(),
                DWGNO: $('#txt-drawing-no').val()?.trim(),
                ITEM: $('#txt-item-no').val()?.trim(),
                ISSUE_DATE_FROM: $('#txt-request-date-from').val(),
                ISSUE_DATE_TO: $('#txt-request-date-to').val(),
                CST:
                    $('#ddl-form-status').val() === 'ALL'
                        ? ''
                        : $('#ddl-form-status').val(),
            }).filter(
                ([, value]) =>
                    value !== '' && value !== null && value !== undefined,
            ),
        );

        try {
            if (button) button.disabled = true;
            await showLoader({ show: true });

            const response = await searchMfgEdrReport(filters);
            const rows = this.normalizeData(response);

            if (rows.length === 0) {
                showMessage('ไม่พบข้อมูลตามเงื่อนไขที่เลือก', 'warning');
                return;
            }

            const today = new Date().toLocaleDateString('th-TH');

            const data = rows.map((row) => ({
                ISSUE_DATE: row.ISSUE_DATE ?? '',
                SEC: row.SEC ?? '',
                DEPT: row.DEPT ?? '',
                REQUEST_NO: row.REQUEST_NO ?? '',
                DAILY_REPORT_NO: row.DAILY_REPORT_NO ?? '',
                ORDERNO: row.ORDERNO ?? '',
                PRDN_JUN: row.PRDN_JUN ?? '',
                MODEL: row.MODEL ?? '',
                DWGNO: row.DWGNO ?? '',
                ITEM: row.ITEM ?? '',
                CAUSE: row.CAUSE ?? '',
                PROCESS: row.PROCESS ?? '',
                LINE: row.LINE ?? '',
                QTY: row.QTY ?? '',
                DETAIL: row.DETAIL ?? '',
                REPAIR_BY_NAME: row.REPAIR_BY_NAME ?? '',
                TYPENAME: row.TYPENAME ?? '',
                CST: this.getStatusText(row.CST),
                APPROVE_DATE: row.APPROVE_DATE ?? '',
            }));

            const columns = [
                { key: 'ISSUE_DATE', header: 'Issue Date' },
                { key: 'SEC', header: 'Section' },
                { key: 'DEPT', header: 'Department' },
                { key: 'REQUEST_NO', header: 'Request No' },
                { key: 'DAILY_REPORT_NO', header: 'Daily Report No' },
                { key: 'ORDERNO', header: 'Order No' },
                { key: 'PRDN_JUN', header: 'Prod/Jun' },
                { key: 'MODEL', header: 'Model' },
                { key: 'DWGNO', header: 'Drawing No' },
                { key: 'ITEM', header: 'Item' },
                { key: 'CAUSE', header: 'Cause' },
                { key: 'PROCESS', header: 'Process' },
                { key: 'LINE', header: 'Line' },
                { key: 'QTY', header: 'Qty' },
                { key: 'DETAIL', header: 'Detail' },
                { key: 'REPAIR_BY_NAME', header: 'Repair By Name' },
                { key: 'TYPENAME', header: 'Work Type' },
                { key: 'CST', header: 'Status' },
                { key: 'APPROVE_DATE', header: 'Approve Date' },
            ];

            const totalColumns = columns.length;
            const workbook = await defaultExcel({
                data,
                column: columns,
                sheetName: 'MFG E-Daily Report',
                manual: true,
                autoWidth: false,
                manualActions: (sheet) => {
                    sheet.insertRow(1, ['MFG E-Daily Report']);
                    sheet.insertRow(2, []);

                    mergeCell(sheet, 1, 1, 1, totalColumns);
                    applyStyleToRange(sheet, 1, totalColumns, 1, {
                        font: { bold: true, size: 18 },
                        alignment: alignment('center', 'middle'),
                    });

                    applyStyleToRange(sheet, 1, totalColumns, 3, {
                        font: { bold: true, size: 12 },
                        alignment: alignment('center', 'middle'),
                        border: border(),
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFBFDBFE' },
                        },
                    });

                    const widths = [
                        14, 20, 20, 18, 22, 18, 12, 18, 24, 10, 30, 22, 20, 10,
                        50, 30, 24, 14, 16,
                    ];
                    widths.forEach((width, index) => {
                        sheet.getColumn(index + 1).width = width;
                    });

                    sheet.eachRow((row, rowNumber) => {
                        if (rowNumber < 3) return;

                        row.height = 22;
                        row.eachCell((cell, columnNumber) => {
                            cell.font = { ...cell.font, size: 11 };
                            cell.alignment = {
                                vertical: 'middle',
                                horizontal: 'center',
                                wrapText: true,
                            };

                            if (
                                rowNumber >= 4 &&
                                [
                                    2, 3, 5, 6, 8, 9, 11, 12, 13, 15, 16, 17,
                                ].includes(columnNumber)
                            ) {
                                cell.alignment = {
                                    vertical: 'middle',
                                    horizontal: 'left',
                                    wrapText: true,
                                    indent: 1,
                                };
                            }

                            cell.border = border();
                        });
                    });

                    sheet.views = [{ state: 'frozen', ySplit: 3 }];

                    sheet.autoFilter = {
                        from: { row: 3, column: 1 },
                        to: { row: 3, column: totalColumns },
                    };
                },
            });

            const now = new Date();
            const fileDate = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, '0'),
                String(now.getDate()).padStart(2, '0'),
            ].join('');
            const fileTime = [
                String(now.getHours()).padStart(2, '0'),
                String(now.getMinutes()).padStart(2, '0'),
                String(now.getSeconds()).padStart(2, '0'),
            ].join('');

            exportExcel(workbook, `MFG_E_Daily_Report_${fileDate}_${fileTime}`);
            showMessage(`Export สำเร็จ จำนวน ${data.length} รายการ`, 'success');
        } catch (error) {
            console.error('Export MFG E-Daily Report error:', error);
            showMessage(
                error?.message ||
                    error?.responseJSON?.message ||
                    'Export ไม่สำเร็จ',
                'error',
            );
        } finally {
            if (button) button.disabled = false;
            await showLoader({ show: false });
        }
    }

    getStatusText(status) {
        const statusMap = {
            1: 'Running',
            2: 'Approved',
            3: 'Rejected',
        };
        return statusMap[String(status ?? '')] ?? status ?? '';
    }
}

$(document).ready(function () {
    const mfgEdrReport = new MfgEdrReport();
    mfgEdrReport.init();
});
