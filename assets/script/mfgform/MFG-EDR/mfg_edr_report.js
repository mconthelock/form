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
import { host } from '../../utils';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

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
        $('#ddl-work-type').on('change', async () => {
            await this.loadCauses();
        });

        $('#btn-clear-filter').on('click', () => {
            this.clearFilter();
        });

        $('#form-edr-export').on('submit', (event) => {
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
            const response = await getcause({
                CAUSE_GROUP: causeGroup,
            });

            /*
             * ป้องกัน response เก่าทับ response ใหม่
             * กรณีผู้ใช้เปลี่ยน Work Type เร็ว
             */
            if (requestId !== this.causeRequestId) {
                return;
            }

            this.causes = this.normalizeData(response);

            this.renderCauses();
        } catch (error) {
            if (requestId !== this.causeRequestId) {
                return;
            }

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
            if (requestId === this.causeRequestId) {
                this.setSelectLoading('ddl-initial-cause', false);
            }
        }
    }

    renderWorkTypes() {
        const options = this.workTypes
            .filter((item) => item.TID !== null && item.TID !== undefined)
            .map((item) => ({
                value: item.TID,
                text: item.TYPENAME ?? '',
            }));

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
                text: item.CAUSE + '_' + item.CAUSENAME,
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
            .map((item) => ({
                value: item.SSECCODE,
                text: item.SSEC ?? '',
            }));

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
        if (isLoading) {
            select.innerHTML = `
                <option value="">
                    Loading...
                </option>
            `;
        }
    }

    normalizeData(response) {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.result)) {
            return response.result;
        }

        if (Array.isArray(response?.data?.data)) {
            return response.data.data;
        }

        return [];
    }

    clearFilter() {
        const form = document.getElementById('form-edr-export');
        if (form) {
            form.reset();
        }

        $('#ddl-work-type').val('');
        $('#ddl-responsible-section').val('');
        $('#ddl-form-status').val('ALL');

        this.loadCauses();
    }

    async exportExcel() {
        const $button = $('#btn-export-excel');
        const originalText = $button.text();
        const rawFilters = {
            REQUEST_BY: $('#txt-request-by').val()?.trim(),
            REPAIR_BY: $('#txt-repair-by').val()?.trim(),
            DAILY_REPORT_NO: $('#txt-daily-report-no').val()?.trim(),
            TID: $('#ddl-work-type').val()? Number($('#ddl-work-type').val()) : '',
            CID: $('#ddl-initial-cause').val()? Number($('#ddl-initial-cause').val()) : '',
            SSECCODE: $('#ddl-responsible-section').val(),
            ORDERNO: $('#txt-order-no').val()?.trim(),
            DWGNO: $('#txt-drawing-no').val()?.trim(),
            ITEM: $('#txt-item-no').val()?.trim(),
            ISSUE_DATE_FROM: $('#txt-request-date-from').val(),
            ISSUE_DATE_TO: $('#txt-request-date-to').val(),
            CST: $('#ddl-form-status').val(),
        };

        console.log(rawFilters);
        /*
        * ไม่ส่งช่องว่าง และไม่ส่ง CST เมื่อเลือก ALL
        */
        const filters = Object.fromEntries(
            Object.entries(rawFilters).filter(([key, value]) => {
                if (value === '' || value === null || value === undefined) {
                    return false;
                }

                if (key === 'CST' && value === 'ALL') {
                    return false;
                }
                return true;
            }),
        );
        try {
            $button.prop('disabled', true).text('Exporting...');
            Swal.fire({
                title: 'กำลังค้นหาข้อมูล',
                text: 'กรุณารอสักครู่',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {Swal.showLoading();},
            });

            const response = await searchMfgEdrReport(filters);
            const rows = this.normalizeData(response);

            if (rows.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'ไม่พบข้อมูล',
                    text: 'ไม่พบข้อมูลตามเงื่อนไขที่เลือก',
                });
                return;
            }

            const excelRows = rows.map((item, index) => ({
                No: index + 1,
                'Issue Date': item.ISSUE_DATE ?? '',
                'Section Code': item.SSECCODE ?? '',
                Section: item.SEC ?? '',
                Department: item.DEPT ?? '',
                'Request No': item.REQUEST_NO ?? '',
                'Daily Report No': item.DAILY_REPORT_NO ?? '',
                'Order No': item.ORDERNO ?? '',
                'Production Jun': item.PRDN_JUN ?? '',
                Model: item.MODEL ?? '',
                'Drawing No': item.DWGNO ?? '',
                Item: item.ITEM ?? '',
                Cause: item.CAUSE ?? '',
                Process: item.PROCESS ?? '',
                Line: item.LINE ?? '',
                Qty: item.QTY ?? '',
                Detail: item.DETAIL ?? '',
                'Repair By': item.REPAIR_BY ?? '',
                'Repair By Name': item.REPAIR_BY_NAME ?? '',
                'Work Type': item.TYPENAME ?? '',
                Status: item.CST ?? '',
                'Approve Date': item.APPROVE_DATE ?? '',
                Year: item.CYEAR2 ?? '',
                'Run No': item.NRUNNO ?? '',
                Month: item.DAILY_MONTH ?? '',
                'Daily Run No': item.DAILY_RUNNO ?? '',
                VREQNO: item.VREQNO ?? '',
                TID: item.TID ?? '',
                CID: item.CID ?? '',
                LID: item.LID ?? '',
                PID: item.PID ?? '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelRows);
            worksheet['!autofilter'] = {ref: worksheet['!ref'],};
            worksheet['!cols'] = [
                { wch: 6 },
                { wch: 14 },
                { wch: 14 },
                { wch: 18 },
                { wch: 18 },
                { wch: 18 },
                { wch: 22 },
                { wch: 18 },
                { wch: 16 },
                { wch: 18 },
                { wch: 22 },
                { wch: 10 },
                { wch: 28 },
                { wch: 22 },
                { wch: 20 },
                { wch: 10 },
                { wch: 50 },
                { wch: 14 },
                { wch: 28 },
                { wch: 24 },
                { wch: 12 },
                { wch: 16 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                'MFG E-Daily Report',
            );

            const now = new Date();
            const dateText = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, '0'),
                String(now.getDate()).padStart(2, '0'),
            ].join('');

            const timeText = [
                String(now.getHours()).padStart(2, '0'),
                String(now.getMinutes()).padStart(2, '0'),
                String(now.getSeconds()).padStart(2, '0'),
            ].join('');

            XLSX.writeFile(workbook,`MFG_E_Daily_Report_${dateText}_${timeText}.xlsx`,);
            Swal.fire({
                icon: 'success',
                title: 'Export สำเร็จ',
                text: `Export ข้อมูลทั้งหมด ${rows.length} รายการ`,
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Export Excel error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Export ไม่สำเร็จ',
                text: error?.message ?? error?.responseJSON?.message ??'เกิดข้อผิดพลาดระหว่างค้นหาและ Export ข้อมูล',});
        } finally {
            $button.prop('disabled', false).text(originalText);
        }
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

$(document).ready(function () {
    const mfgEdrReport = new MfgEdrReport();
    mfgEdrReport.init();
});
