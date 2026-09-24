import { createTable, destroyTable } from '@amec/webasset/dataTable';
import { dataTableSkeleton } from '@amec/webasset/skeleton';
import {
    showErrorMessage,
    formatNumber,
    roundNumber,
    showMessage,
} from '@amec/webasset/utils';
import { showLoader } from '@amec/webasset/preloader';
import { steps } from './steps';
import { getCurrenCy, getVendors, templateBaseDir } from './data';
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
    _vendorData: [],
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
    set vendors(value) {
        this._vendorData = value;
    },
    get vendors() {
        return this._vendorData;
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

        // TODO: ดึงข้อมูล draft หากมี formNo
        if (formNo) {
            this._draftData = []; // รอรองรับ draft
        }
        if (newData && newData.length > 0) {
            this._newData = newData;
        }
        const data = [...this._draftData, ...this._newData];
        if (data.length > 0) {
            this.currency = await getCurrenCy();
            const vendors = await getVendors();
            if (!vendors || vendors.length === 0) {
                showMessage('No vendor data found', 'warning');
                return;
            }
            this.vendors = vendors;
        }
        console.log(data);
        $(this.tableId).html(this.header);
        await this.createTable(data);
        this.skeleton.remove();
        this.bindEvents();
    },
    async createTable(data) {
        this.instance = await createTable(
            {
                data: data,
                columns: this.columns(this.vendors),
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
                        if (data.length === 0) {
                            showMessage(
                                'No data available to export.',
                                'warning',
                            );
                            return;
                        }
                        const template = await getFile({
                            baseDir: templateBaseDir,
                            storedName: 'Price Compare Export Template.xlsx',
                            mode: 'open',
                        });

                        const convertedData = convertArrayForXlsxPopulation(
                            data.map((row) => [
                                row.SEQ,
                                row.VMODEL,
                                row.VJOB_ITEMNO,
                                row.VPART_NAME,
                                row.VDRAWING,
                                row.VITEM_CODE,
                                row.VSPEC,
                                row.VMATERIAL_CODE,
                                row.NQUANTITY_YEAR,
                                row.VPRES_VENDOR_NAME,
                                row.VPRES_MAKER,
                                row.NPRES_BASE_PRICE,
                                row.VPRES_BASE_CURR,
                                row.NPRES_PRICE,
                                row.VPRES_PRICE_CURR,
                                row.NPRES_PRICE_ETA_AMEC,
                                row.NPRES_AMOUNT,
                                row.VNEW_VENDOR_NAME,
                                row.VNEW_MAKER,
                                row.NNEW_BASE_PRICE,
                                row.VNEW_BASE_CURR,
                                row.NNEW_PRICE,
                                row.VNEW_PRICE_CURR,
                                row.NNEW_PRICE_ETA_AMEC,
                                row.NNEW_AMOUNT,
                                row.NCOST_DIFF,
                                row.NCOST_AMOUNT,
                                row.NCOST_RATIO,
                                row.CNEW_PRICE_YEAR,
                                row.VNEW_PRICE_MONTH,
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
                            `Price Compare Export Template - ${steps.function} [${new Date().toISOString().split('T')[0]}]`,
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
    columns: (vendors) => [
        {
            data: null,
            render: function (data, type, row, meta) {
                row.SEQ = meta.row + 1;
                return meta.row + 1;
            },
        },
        { data: 'VMODEL' },
        { data: 'VJOB_ITEMNO', className: 'sticky-column' },
        { data: 'VPART_NAME', className: 'text-nowrap' },
        { data: 'VDRAWING', className: 'sticky-column text-nowrap' },
        { data: 'VITEM_CODE', className: 'sticky-column' },
        { data: 'VSPEC', className: 'text-nowrap' },
        { data: 'VMATERIAL_CODE', className: 'sticky-column' },
        { data: 'NQUANTITY_YEAR' },
        { data: 'VPRES_VENDOR_NAME', className: 'bg-[#ffff77] text-nowrap' },
        { data: 'VPRES_MAKER', className: 'bg-[#ffff77] text-nowrap' },
        {
            data: 'NPRES_BASE_PRICE',
            className: 'bg-[#ccffcc]',
            render: function (data, type, row, meta) {
                row.NPRES_BASE_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.NPRES_BASE_PRICE });
            },
        },
        { data: 'VPRES_BASE_CURR' },
        {
            data: 'NPRES_PRICE',
            className: 'bg-[#ccffcc]',
            render: function (data, type, row, meta) {
                row.NPRES_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.NPRES_PRICE });
            },
        },
        { data: 'VPRES_PRICE_CURR' },
        {
            data: 'NPRES_PRICE_ETA_AMEC',
            className: 'bg-[#ccffcc]',
            render: function (data, type, row, meta) {
                row.NPRES_PRICE_ETA_AMEC = roundNumber({ value: data });
                return formatNumber({ value: row.NPRES_PRICE_ETA_AMEC });
            },
        },
        {
            data: 'NPRES_AMOUNT',
            render: function (data, type, row, meta) {
                row.NPRES_AMOUNT = roundNumber({ value: data });
                return formatNumber({ value: row.NPRES_AMOUNT });
            },
        },
        {
            data: 'VNEW_VENDOR',
            className: 'bg-[#ffff77] text-nowrap',
            render: function (data, type, row, meta) {
                row.VNEW_VENDOR_NAME = vendors.find(
                    (v) => v.VENDOR === row.VNEW_VENDOR,
                )?.VNDNAM;
                return row.VNEW_VENDOR
                    ? row.VNEW_VENDOR_NAME
                    : row.VPRES_VENDOR_NAME;
            },
        },
        {
            data: 'VNEW_MAKER',
            className: 'bg-[#ffff77]',
            render: function (data, type, row, meta) {
                return data || row.VPRES_MAKER;
            },
        },
        {
            data: 'NNEW_BASE_PRICE',
            className: 'bg-[#ccffff]',
            render: function (data, type, row, meta) {
                row.NNEW_BASE_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.NNEW_BASE_PRICE });
            },
        },
        { data: 'VNEW_BASE_CURR' },
        {
            data: 'NNEW_PRICE',
            className: 'bg-[#ccffff]',
            render: function (data, type, row, meta) {
                row.NNEW_PRICE = roundNumber({ value: row.NPRICE1 });
                return formatNumber({ value: row.NNEW_PRICE });
            },
        },
        { data: 'VNEW_PRICE_CURR' },
        {
            data: null,
            className: 'bg-[#ccffff]',
            render: function (data, type, row) {
                let rate = 1;
                switch (steps.function) {
                    case 1:
                        rate = tableComparison.currency.find(
                            (item) => item.CURRNAME === row.VNEW_BASE_CURR,
                        )?.CURRENCY;
                        row.NNEW_PRICE_ETA_AMEC = roundNumber({
                            value: row.NNEW_BASE_PRICE * rate,
                        });
                        break;
                    case 2:
                    case 3:
                        row.NNEW_PRICE_ETA_AMEC = row.NNEW_PRICE;
                        break;
                    case 4:
                    case 5:
                        rate = tableComparison.currency.find(
                            (item) => item.CURRNAME === row.VNEW_PRICE_CURR,
                        )?.CURRENCY;
                        row.NNEW_PRICE_ETA_AMEC = roundNumber({
                            value: row.NNEW_PRICE * rate,
                        });
                        break;
                }
                return formatNumber({ value: row.NNEW_PRICE_ETA_AMEC });
            },
        },
        {
            data: null,
            render: function (data, type, row, meta) {
                row.NNEW_AMOUNT = roundNumber({
                    value: (row.NNEW_PRICE_ETA_AMEC * row.QUANTITY_YEAR) / 1000,
                });
                return formatNumber({ value: row.NNEW_AMOUNT });
            },
        },
        {
            data: null,
            render: function (data, type, row, meta) {
                row.NCOST_DIFF = roundNumber({
                    value: row.NPRES_PRICE_ETA_AMEC - row.NNEW_PRICE_ETA_AMEC,
                });
                return formatNumber({ value: row.NCOST_DIFF });
            },
        },
        {
            data: null,
            render: function (data, type, row, meta) {
                row.NCOST_AMOUNT = roundNumber({
                    value: (row.NCOST_DIFF * row.NQUANTITY_YEAR) / 1000,
                });
                return formatNumber({ value: row.NCOST_AMOUNT });
            },
        },
        {
            data: null,
            render: function (data, type, row, meta) {
                row.NCOST_RATIO =
                    row.NPRES_PRICE_ETA_AMEC !== 0
                        ? roundNumber({
                              value:
                                  (row.NCOST_DIFF / row.NPRES_PRICE_ETA_AMEC) *
                                  100,
                          })
                        : 0;
                return formatNumber({ value: row.NCOST_RATIO }) + '%';
            },
        },
        { data: 'CNEW_PRICE_YEAR', className: 'bg-[#ffff77]' },
        { data: 'VNEW_PRICE_MONTH', className: 'bg-[#ffff77]' },
    ],
};
