import { createTable, destroyTable } from '@amec/webasset/dataTable';
import { dataTableSkeleton } from '@amec/webasset/skeleton';
import {
    showErrorMessage,
    formatNumber,
    roundNumber,
} from '@amec/webasset/utils';
import { showLoader } from '@amec/webasset/preloader';
import { steps } from './steps';
import { getCurrenCy } from './data';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate.js';
import { getFile } from '@amec/webasset/api/file';
import {
    convertArrayForXlsxPopulation,
    exportExcel,
} from '@amec/webasset/excel';

export const tableComparison = {
    instance: null,
    tableId: '#table-comparison',
    skeleton: null,
    _currency: null,
    _draftData: [],
    _newData: [],
    get currency() {
        return this._currency;
    },
    set currency(value) {
        this._currency = value;
    },
    get draftData() {
        return this._draftData;
    },
    get newData() {
        return this._newData;
    },
    set draftData(value) {
        this._draftData = value;
    },
    set newData(value) {
        this._newData = value;
    },
    reset() {
        this._draftData = [];
        this._newData = [];
    },
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
            height: 'h-[80vh]',
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
    async init({ formNo = null, newData = [] } = {}) {
        await this.destroy();
        this.preload();
        this.currency = await getCurrenCy();
        console.log(this.currency);
        $(this.tableId).html(this.header);
        if (formNo) {
            this._draftData = []; // รอรองรับ draft
        }
        if (newData && newData.length > 0) {
            this._newData = newData;
        }
        const data = [...this._draftData, ...this._newData];
        await this.createTable(data);
        this.skeleton.remove();
        this.bindEvents();
    },
    async createTable(data) {
        this.instance = await createTable(
            {
                data: data,
                columns: this.columns,
                responsive: data.length == 0 ? true : false,
                ordering: false,
                initComplete: function () {
                    const table = this.api();
                    const wrapper = table.table().container();
                    $(wrapper).find('.right-menu')
                        .html(`<button type="button" class="btn btn-success rounded" id="comparison-export">
                            <i class="fi fi-sr-file-excel text-lg text-white"></i>
                            Price Compare Export  
                        </button>`);
                },
            },
            {
                id: this.tableId,
                join: true,
                domScroll: {
                    status: true,
                    maxHeight: '70vh',
                },
            },
        );
    },
    bindEvents() {
        const self = this;
        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-09-16
         * @description Exports the selected rows from the price comparison table to an Excel file.
         */
        $(document)
            .off('click.comparison-export', '#comparison-export')
            .on(
                'click.comparison-export',
                '#comparison-export',
                async function () {
                    try {
                        showLoader();
                        const data = self.data();
                        console.log(data);
                        const template = await getFile({
                            baseDir: `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/webflow/template/price-compare`,
                            storedName: 'Price Compare Export Template.xlsx',
                            mode: 'open',
                        });

                        const convertedData = convertArrayForXlsxPopulation(
                            data.map((row) => [
                                row.SEQ,
                                row.MODEL_NAME,
                                row.JOB_ITEMNO,
                                row.PART_NAME,
                                row.DRAWING,
                                row.ITEM_CODE,
                                row.SPEC,
                                row.MATERIAL_CODE,
                                row.QUANTITY_YEAR,
                                row.VENDOR_NAME,
                                row.MAKER_NAME,
                                row.BASE_PRICE,
                                row.BASE_CURR,
                                row.PRICE,
                                row.CURR,
                                row.AMOUNT,
                                row.NEW_VENDOR_NAME,
                                row.NEW_MAKER_NAME,
                                row.NEW_BASE_PRICE,
                                row.NEW_BASE_CURR,
                                row.NEW_PRICE,
                                row.NEW_CURR,
                                row.NEW_PRICE_ETA_AMEC,
                                row.NEW_AMOUNT,
                                row.COST_PRICE_DIFFERENCE,
                                row.COST_AMOUNT,
                                row.COST_RATIO,
                                row.NEW_PRICE_YEAR,
                                row.NEW_PRICE_MONTH,
                            ]),
                            'A-AD',
                        );
                        const startRow = 6;
                        const endRow = startRow + convertedData.length - 1;
                        const styleTemplateEndRow = 4500;

                        const buffer = await template.arrayBuffer();
                        const workbook =
                            await XlsxPopulate.fromDataAsync(buffer);
                        const sheet = workbook.sheet(0);
                        sheet
                            .range(`A${startRow}:AD${endRow}`)
                            .value(convertedData);
                        if (endRow > styleTemplateEndRow) {
                            sheet
                                .range(
                                    `A${styleTemplateEndRow + 1}:AD${endRow}`,
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
                            'Price Compare Export Template',
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
    header: `<thead>
            <tr>
                <th rowspan="3">No.</th>
                <th rowspan="3">Model Name</th>
                <th rowspan="3">Job Item No.</th>
                <th rowspan="3">Part Name</th>
                <th rowspan="3">Drawing No.</th>
                <th rowspan="3">Item Code</th>
                <th rowspan="3">Spec.</th>
                <th rowspan="3">Material Code</th>
                <th rowspan="3">Quantity/year <br> &lt;A&gt; </th>
                <th colspan="8" class="bg-[#ccffcc]">Present</th>
                <th colspan="8" class="bg-[#ccffff]">New</th>
                <th colspan="3">Cost down(+) / Cost up(-)</th>
                <th colspan="2" class="bg-[#ffff77]">New price parts 1st delivered</th>
            </tr>
            <tr>
                <th rowspan="2">Vendor Name</th>
                <th rowspan="2">Maker Name</th>
                <th colspan="2" class="bg-[#ccffcc]">Base Price</th>
                <th colspan="2" class="bg-[#ccffcc]">Price</th>
                <th rowspan="2">Price ETA AMEC <br> &lt;B&gt; <br> [THB/pcs] </th>
                <th rowspan="2">Amount <br> &lt;C=B*A&gt; <br> [KB/year]</th>
                <th rowspan="2">Vendor Name</th>
                <th rowspan="2">Maker Name</th>
                <th colspan="2" class="bg-[#ccffff]">Base Price</th>
                <th colspan="2" class="bg-[#ccffff]">Price</th>
                <th rowspan="2">Price ETA AMEC <br> &lt;D&gt; <br> [THB/pcs] </th>
                <th rowspan="2">Amount <br> &lt;E=D*A&gt; <br> [KB/year]</th>
                <th rowspan="2">Price difference <br> &lt;F=B-D&gt; <br> [THB/pcs]</th>
                <th rowspan="2">Amount <br> &lt;F*A&gt; <br> [KB/year]</th>
                <th rowspan="2">Ratio <br> &lt;F/B&gt; <br> [%]</th>
                <th rowspan="2">Year</th>
                <th rowspan="2">Month</th>
            </tr>
            <tr>
                <th>(Import)</th>
                <th>Cur.</th>
                <th>CIF LCB <br> (Import)</th>
                <th>Cur.</th>
                <th>(Import)</th>
                <th>Cur.</th>
                <th>CIF LCB <br> (Import)</th>
                <th>Cur.</th>
            </tr>
        </thead>`,
    columns: [
        {
            data: null,
            render: function (data, type, row, meta) {
                row.SEQ = meta.row + 1;
                return meta.row + 1;
            },
        },
        { data: 'MODEL_NAME' },
        { data: 'JOB_ITEMNO', className: 'sticky-column' },
        { data: 'PART_NAME' },
        { data: 'DRAWING', className: 'sticky-column' },
        { data: 'ITEM_CODE', className: 'sticky-column' },
        { data: 'SPEC' },
        { data: 'MATERIAL_CODE', className: 'sticky-column' },
        { data: 'QUANTITY_YEAR' },
        { data: 'VENDOR_NAME', className: 'bg-[#ffff77]' },
        { data: 'MAKER_NAME', className: 'bg-[#ffff77]' },
        {
            data: 'BASE_PRICE',
            className: 'bg-[#ccffcc]',
            render: function (data, type, row, meta) {
                row.BASE_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.BASE_PRICE });
            },
        },
        { data: 'BASE_CURR' },
        {
            data: 'PRICE',
            className: 'bg-[#ccffcc]',
            render: function (data, type, row, meta) {
                row.PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.PRICE });
            },
        },
        { data: 'CURR' },
        {
            data: 'PRICE_ETA_AMEC',
            className: 'bg-[#ccffcc]',
            render: function (data, type, row, meta) {
                row.PRICE_ETA_AMEC = roundNumber({ value: data });
                return formatNumber({ value: row.PRICE_ETA_AMEC });
            },
        },
        {
            data: 'AMOUNT',
            render: function (data, type, row, meta) {
                row.AMOUNT = roundNumber({ value: data });
                return formatNumber({ value: row.AMOUNT });
            },
        },
        {
            data: 'NEW_VENDOR_NAME',
            className: 'bg-[#ffff77]',
            render: function (data, type, row, meta) {
                return data || row.VENDOR_NAME;
            },
        },
        {
            data: 'NEW_MAKER_NAME',
            className: 'bg-[#ffff77]',
            render: function (data, type, row, meta) {
                return data || row.MAKER_NAME;
            },
        },
        {
            data: 'NEW_BASE_PRICE',
            className: 'bg-[#ccffff]',
            render: function (data, type, row, meta) {
                row.NEW_BASE_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.NEW_BASE_PRICE });
            },
        },
        { data: 'NEW_BASE_CURR' },
        {
            data: 'NEW_PRICE',
            className: 'bg-[#ccffff]',
            render: function (data, type, row, meta) {
                row.NEW_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.NEW_PRICE });
            },
        },
        { data: 'NEW_CURR' },
        {
            data: null,
            className: 'bg-[#ccffff]',
            render: function (data, type, row) {
                let rate = 1;
                switch (steps.function) {
                    case 1:
                        rate = tableComparison.currency.find(
                            (item) => item.CURRNAME === row.NEW_BASE_CURR,
                        )?.CURRENCY;
                        row.NEW_PRICE_ETA_AMEC = roundNumber({
                            value: row.NEW_BASE_PRICE * rate,
                        });
                        break;
                    case 2:
                    case 3:
                        row.NEW_PRICE_ETA_AMEC = row.NEW_PRICE;
                        break;
                    case 4:
                    case 5:
                        rate = tableComparison.currency.find(
                            (item) => item.CURRNAME === row.NEW_CURR,
                        )?.CURRENCY;
                        row.NEW_PRICE_ETA_AMEC = roundNumber({
                            value: row.NEW_PRICE * rate,
                        });
                        break;
                }
                console.log('currency', tableComparison.currency);
                console.log('rate', rate, row.NEW_BASE_CURR, row.NEW_CURR);
                return formatNumber({ value: row.NEW_PRICE_ETA_AMEC });
            },
        },
        {
            data: null,
            render: function (data, type, row, meta) {
                row.NEW_AMOUNT = roundNumber({
                    value: (row.NEW_PRICE_ETA_AMEC * row.QUANTITY_YEAR) / 1000,
                });
                return formatNumber({ value: row.NEW_AMOUNT });
            },
        },
        {
            data: null,
            render: function (data, type, row, meta) {
                row.COST_PRICE_DIFFERENCE = roundNumber({
                    value: row.PRICE_ETA_AMEC - row.NEW_PRICE_ETA_AMEC,
                });
                return formatNumber({ value: row.COST_PRICE_DIFFERENCE });
            },
        },
        {
            data: null,
            render: function (data, type, row, meta) {
                row.COST_AMOUNT = roundNumber({
                    value:
                        (row.COST_PRICE_DIFFERENCE * row.QUANTITY_YEAR) / 1000,
                });
                return formatNumber({ value: row.COST_AMOUNT });
            },
        },
        {
            data: null,
            render: function (data, type, row, meta) {
                row.COST_RATIO =
                    row.PRICE_ETA_AMEC !== 0
                        ? roundNumber({
                              value:
                                  (row.COST_PRICE_DIFFERENCE /
                                      row.PRICE_ETA_AMEC) *
                                  100,
                          })
                        : 0;
                return formatNumber({ value: row.COST_RATIO }) + '%';
            },
        },
        { data: 'NEW_PRICE_YEAR', className: 'bg-[#ffff77]' },
        { data: 'NEW_PRICE_MONTH', className: 'bg-[#ffff77]' },
    ],
};
