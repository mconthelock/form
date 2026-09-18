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
import { getPlannerCompareSheet } from './data';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate.js';

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
    async init(plannerCode) {
        await this.destroy();
        this.preload();
        const plannerCompareSheet = await getPlannerCompareSheet(plannerCode);
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
                columns: this.columns,
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
    },
    columns: [
        {
            title: 'PLANNER CODE',
            data: 'IBUYC',
        },
        {
            title: 'ITEM',
            data: 'IPROD',
        },
        {
            title: 'DRAWING',
            data: 'IDRAW',
        },
        {
            title: 'PART NAME',
            data: 'IDESC',
        },
        {
            title: 'SPEC',
            data: 'IGLNO',
        },
        {
            title: 'VENDOR',
            data: 'IVEND',
        },
        {
            title: 'VENDOR NAME',
            data: 'VNDNAM',
        },
    ],
    bindEvents() {
        const self = this;
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
                        //map to array 2 dimensions for Excel export
                        const data = selected.map((row) => [
                            steps.function,
                            row.IBUYC,
                            row.IVEND,
                            row.IPROD,
                            row.IDRAW,
                        ]);
                        const template = await getFile({
                            baseDir: `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/webflow/template/price-compare`,
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
                            'A,H,J-L',
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
                        const newBuffer = await workbook.outputAsync();
                        exportExcel(
                            newBuffer,
                            'Price Compare Upload Template',
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
};
