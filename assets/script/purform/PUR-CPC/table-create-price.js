import {
    createTable,
    destroyTable,
    getSelectedData,
} from '@amec/webasset/dataTable';
import { dataTableSkeleton } from '@amec/webasset/skeleton';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import {
    convertArrayForXlsxPopulation,
    exportExcel,
} from '@amec/webasset/excel';
import { steps } from './steps';
import { getFile } from '@amec/webasset/api/file';
import { showLoader } from '@amec/webasset/preloader';
import { getPlannerCompareSheet, templateBaseDir } from './data';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate.js';
import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';

select2();
export const tableCreatePrice = {
    instance: null,
    tableId: '#table-create-price',
    skeleton: null,
    handleInstance() {
        if (!this.instance) {
            throw new Error(
                'Table instance not initialized. Call init() first.',
            );
        }
    },
    get() {
        this.handleInstance();
        return this.instance;
    },
    set(instance) {
        this.instance = instance;
    },
    data(where = {}) {
        this.handleInstance();
        return this.instance.rows(where).data().toArray();
    },
    row(tr) {
        this.handleInstance();
        return this.instance.row(tr).data();
    },
    /**
     * @author Sutthipong Tangmongkhoncharoen(24008)
     * @since 2026-09-30
     * @description Filters the table by vendor code (exact match). Pass an empty value to show all rows.
     */
    search(vendor = '') {
        this.handleInstance();
        const column = this.instance.column('vendor:name');
        if (!vendor) {
            column.search('').draw(false);
            return;
        }
        column
            .search(`^${$.fn.dataTable.util.escapeRegex(vendor)}$`, true, false)
            .draw(false);
    },
    updateRow(tr, data) {
        this.handleInstance();
        this.instance.row(tr).data(data).draw(false);
    },
    preload(show = true) {
        this.skeleton = dataTableSkeleton({
            show: show,
            idLoading: this.tableId,
            height: 'h-[50vh]',
            searchSize: {
                width: 'w-96',
            },
        });
    },
    async destroy() {
        if (!this.instance) {
            return;
        }
        await destroyTable(this.tableId);
        this.instance = null;
    },
    async init(data) {
        await this.destroy();
        this.preload();
        const plannerCompareSheet = await getPlannerCompareSheet(data);
        if (plannerCompareSheet.length == 0) {
            throw new Error('No data found for the given planner code.');
        }
        await this.createTable(plannerCompareSheet);
        this.skeleton.remove();
        this.bindEvents();
    },
    async createTable(data) {
        this.instance = await createTable(
            {
                data: data,
                columns:
                    steps.system == 'PROCUREMENT'
                        ? this.columnProcurement
                        : this.columns,
                initComplete: function () {
                    const table = this.api();
                    const wrapper = table.table().container();
                    $(wrapper).find('.right-menu')
                        .html(`<button type="button" class="btn btn-success rounded" id="price-compare-export">
                            <i class="fi fi-sr-file-excel text-lg text-white"></i>
                            Price Compare Export  
                        </button>`);
                },
            },
            {
                id: this.tableId,
                join: true,
                columnSelect: {
                    status: true,
                },
                domScroll: {
                    status: true,
                    maxHeight: '40vh',
                },
            },
        );
        await setSelect2({
            id: 'filter-vendor',
            destroy: true,
            data: data
                .filter(
                    (row, index, self) =>
                        index ===
                        self.findIndex(
                            (r) => r.VPRES_VENDOR === row.VPRES_VENDOR,
                        ),
                )
                .sort((a, b) =>
                    String(a.VPRES_VENDOR).localeCompare(
                        String(b.VPRES_VENDOR),
                        undefined,
                        { numeric: true, sensitivity: 'base' },
                    ),
                )
                .map((row) => ({
                    id: row.VPRES_VENDOR,
                    text: `${row.VPRES_VENDOR_NAME} (${row.VPRES_VENDOR})`,
                })),
            defaultValue: steps.vendor || null,
        });
    },
    bindEvents() {
        const self = this;
        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-09-30
         * @description เลือก vendor จาก dropdown เพื่อกรองข้อมูลในตาราง
         */
        $(document)
            .off('change.filter-vendor', '#filter-vendor')
            .on('change.filter-vendor', '#filter-vendor', function () {
                try {
                    const vendor = $(this).val();
                    self.search(vendor);
                    steps.vendor = vendor;
                } catch (error) {
                    console.error(error);
                    showErrorMessage(error.message);
                }
            });
        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-09-30
         * @description เลือกโหมดการเปรียบเทียบจาก radio button เพื่อกำหนดค่าใน steps.compareMode
         */
        $(document)
            .off('change.compare-mode', 'input[name="compare-mode"]')
            .on(
                'change.compare-mode',
                'input[name="compare-mode"]',
                function () {
                    try {
                        const mode = $(this).val();
                        steps.compareMode = mode;
                    } catch (error) {
                        console.error(error);
                        showErrorMessage(error.message);
                    }
                },
            );
        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-09-16
         * @description Exports the selected rows from the price comparison table to an Excel file.
         */
        $(document)
            .off('click.price-compare-export', '#price-compare-export')
            .on(
                'click.price-compare-export',
                '#price-compare-export',
                async function () {
                    try {
                        showLoader();
                        const selected = getSelectedData(self.instance);
                        if (selected.length === 0) {
                            showMessage(
                                'Please select at least one row to export.',
                                'warning',
                            );
                            return;
                        }
                        const duplicateVendorCheck = selected.map(
                            (row) => row.VPRES_VENDOR,
                        );
                        if (new Set(duplicateVendorCheck).size > 1) {
                            showMessage(
                                'Please select rows with the same vendor only.',
                                'warning',
                            );
                            return;
                        }

                        //map to array 2 dimensions for Excel export
                        const data = selected.map((row) =>
                            steps.system == 'PROCUREMENT'
                                ? [
                                      steps.function,
                                      row.VPLANNER_CODE,
                                      'E',
                                      row.VPRES_VENDOR,
                                      row.VPROD_CODE,
                                      null,
                                  ]
                                : [
                                      steps.function,
                                      row.VPLANNER_CODE,
                                      'E',
                                      row.VPRES_VENDOR,
                                      row.VITEM_CODE,
                                      row.VDRAWING,
                                  ],
                        );
                        const template = await getFile({
                            baseDir: templateBaseDir,
                            storedName: 'Price Compare Upload Template.xlsx',
                            mode: 'open',
                        });
                        // const workbook = await writeExcelTemp(template, {
                        //     write: (workbook) => {
                        //         const sheet = workbook.worksheets[0];
                        //         sheet.duplicateRow(3, selected.length, true);
                        //         const startRow = 3;
                        //         const columns = ['A', 'H', 'J', 'K', 'L'];
                        //         data.forEach((row, i) => {
                        //             columns.forEach((col, j) => {
                        //                 sheet.getCell(
                        //                     `${col}${startRow + i}`,
                        //                 ).value = row[j];
                        //             });
                        //         });
                        //     },
                        // });
                        // exportExcel(workbook, 'Price Compare Upload Template');

                        const convertedData = convertArrayForXlsxPopulation(
                            data,
                            'A,H-L',
                        );
                        const startRow = 3;
                        const endRow = startRow + convertedData.length - 1;
                        const styleTemplateEndRow = 4500;

                        const buffer = await template.arrayBuffer();
                        const workbook =
                            await XlsxPopulate.fromDataAsync(buffer);
                        const sheet = workbook.sheet(0);
                        sheet
                            .range(`A${startRow}:L${endRow}`)
                            .value(convertedData);
                        if (endRow > styleTemplateEndRow) {
                            sheet
                                .range(
                                    `A${styleTemplateEndRow + 1}:AI${endRow}`,
                                )
                                .style({
                                    border: {
                                        top: { style: 'thin' },
                                        bottom: { style: 'thin' },
                                        left: { style: 'thin' },
                                        right: { style: 'thin' },
                                    },
                                });
                        }
                        sheet.range(`D${startRow}:D${endRow}`).dataValidation({
                            type: 'decimal',
                            operator: 'between',
                            allowBlank: true,
                            showErrorMessage: true,
                            errorTitle: 'Invalid Input',
                            error: 'Please enter a year between 2025 and 3000.',
                            formula1: '2025',
                            formula2: '3000',
                        });
                        sheet.range(`M${startRow}:AB${endRow}`).dataValidation({
                            type: 'decimal',
                            operator: 'between',
                            allowBlank: true,
                            showErrorMessage: true,
                            errorTitle: 'Invalid Input',
                            error: 'Please enter a numeric between 0 and 1000000000',
                            formula1: '0',
                            formula2: '1000000000',
                        });
                        sheet
                            .range(`AF${startRow}:AF${endRow}`)
                            .dataValidation({
                                type: 'decimal',
                                operator: 'between',
                                allowBlank: true,
                                showErrorMessage: true,
                                errorTitle: 'Invalid Input',
                                error: 'Please enter a numeric between 0 and 1000000000',
                                formula1: '0',
                                formula2: '1000000000',
                            });
                        sheet
                            .range(`AH${startRow}:AI${endRow}`)
                            .dataValidation({
                                type: 'date',
                                operator: 'between',
                                allowBlank: true,
                                showErrorMessage: true,
                                errorTitle: 'Invalid Input',
                                error: 'Please enter a date between 1/1/1900 and 12/31/9999',
                                formula1: 'DATE(1900,1,1)',
                                formula2: 'DATE(9999,12,31)',
                            });
                        const newBuffer = await workbook.outputAsync();
                        exportExcel(
                            newBuffer,
                            `Price Compare Upload Template - ${steps.function} [${new Date().toISOString().split('T')[0]}]`,
                            'buffer',
                        );
                    } catch (error) {
                        console.error(error);
                        showErrorMessage(error.message);
                    } finally {
                        showLoader({ show: false });
                    }
                },
            );
    },
    columns: [
        {
            title: 'PLANNER CODE',
            data: 'VPLANNER_CODE',
        },
        {
            title: 'ITEM',
            data: 'VITEM_CODE',
            className: 'text-nowrap',
        },
        {
            title: 'DRAWING',
            data: 'VDRAWING',
        },
        {
            title: 'PART NAME',
            data: 'VPART_NAME',
        },
        {
            title: 'SPEC',
            data: 'VSPEC',
        },
        {
            title: 'VENDOR',
            data: 'VPRES_VENDOR',
            name: 'vendor',
        },
        {
            title: 'VENDOR NAME',
            data: 'VPRES_VENDOR_NAME',
        },
    ],
    columnProcurement: [
        {
            title: 'PLANNER CODE',
            data: 'VPLANNER_CODE',
        },
        {
            title: 'EXPENSE TYPE',
            data: 'VSEXPTYPE',
        },
        {
            title: 'PRODUCT CODE',
            data: 'VPROD_CODE',
            className: 'text-nowrap',
        },
        {
            title: 'PRODUCT NAME',
            data: 'VPROD_NAME',
        },
        {
            title: 'DESCRIPTION',
            data: 'VDESCRIPTION',
        },
        {
            title: 'VENDOR',
            data: 'VPRES_VENDOR',
            name: 'vendor',
        },
        {
            title: 'VENDOR NAME',
            data: 'VPRES_VENDOR_NAME',
        },
    ],
};
