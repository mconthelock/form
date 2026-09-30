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
import {
    getCurrenCy,
    getformComparison,
    getVendors,
    templateBaseDir,
} from './data';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate.js';
import { getFile } from '@amec/webasset/api/file';
import {
    convertArrayForXlsxPopulation,
    exportExcel,
} from '@amec/webasset/excel';

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description คำนวณ New Price ETA AMEC ตาม step function ปัจจุบัน
 */
const calcNewPriceEta = (row) => {
    let rate = 1;
    switch (steps.function) {
        case 1:
            rate = tableComparison.currency.find(
                (item) => item.CURRNAME === row.VNEW_BASE_CURR,
            )?.CURRENCY;
            return roundNumber({ value: row.NNEW_BASE_PRICE * rate });
        case 2:
        case 3:
            return row.NNEW_PRICE;
        case 4:
        case 5:
            rate = tableComparison.currency.find(
                (item) => item.CURRNAME === row.VNEW_PRICE_CURR,
            )?.CURRENCY;
            return roundNumber({ value: row.NNEW_PRICE * rate });
    }
};

export const tableComparison = {
    instance: null,
    tableId: '#table-comparison',
    skeleton: null,
    _currency: null,
    _vendorData: [],
    _totalPres: 0,
    _totalNew: 0,
    _totalCost: 0,
    _ratio: 0,
    get totalPres() {
        return this._totalPres;
    },
    set totalPres(value) {
        this._totalPres = value;
    },
    get totalNew() {
        return this._totalNew;
    },
    set totalNew(value) {
        this._totalNew = value;
    },
    get totalCost() {
        return this._totalCost;
    },
    set totalCost(value) {
        this._totalCost = value;
    },
    get ratio() {
        return this._ratio;
    },
    set ratio(value) {
        this._ratio = value;
    },
    get currency() {
        return this._currency;
    },
    set currency(value) {
        this._currency = value;
    },
    set vendors(value) {
        this._vendorData = value;
    },
    get vendors() {
        return this._vendorData;
    },
    get total() {
        return {
            TOTAL_PRES: this.totalPres,
            TOTAL_NEW: this.totalNew,
            TOTAL_COST: this.totalCost,
            TOTAL_RATIO: this.ratio,
        };
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
        let data = [];
        if (formNo) {
            const oldData = await getformComparison(formNo);
            if (!oldData.status) {
                throw new Error(oldData.message);
            }

            data = oldData.data.flatMap((parent) =>
                parent.DETAILS.map((child) => ({
                    ...parent,
                    ...child,
                })),
            );
        }
        if (newData && newData.length > 0) {
            data = newData;
        }
        if (data.length > 0) {
            this.currency = await getCurrenCy();
            const vendors = await getVendors();
            if (!vendors || vendors.length === 0) {
                showMessage('No vendor data found', 'warning');
                return;
            }
            this.vendors = vendors;
        }
        $(this.tableId).html(this.header);
        await this.createTable(data);
        this.skeleton.remove();
        this.bindEvents();
    },
    async sumTotal(data) {
        let totalPres = 0,
            totalNew = 0,
            totalCost = 0;
        data.forEach((row) => {
            const presEta = row.NPRES_PRICE_ETA_AMEC;
            const presAmount =
                row.NPRES_AMOUNT != null
                    ? roundNumber({
                          value: row.NPRES_AMOUNT,
                      })
                    : roundNumber({
                          value: (presEta * row.NQUANTITY_YEAR) / 1000,
                      });
            const newEta = calcNewPriceEta(row);
            const newAmount = roundNumber({
                value: (newEta * row.NQUANTITY_YEAR) / 1000,
            });
            const costAmount = roundNumber({
                value: ((presEta - newEta) * row.NQUANTITY_YEAR) / 1000,
            });
            totalPres += presAmount || 0;
            totalNew += newAmount || 0;
            totalCost += costAmount || 0;
        });
        const ratio = totalPres !== 0 ? (totalCost / totalPres) * 100 : 0;
        this.totalPres = formatNumber({
            value: roundNumber({
                value: totalPres,
            }),
        });
        this.totalNew = formatNumber({
            value: roundNumber({
                value: totalNew,
            }),
        });
        this.totalCost = formatNumber({
            value: roundNumber({
                value: totalCost,
            }),
        });
        this.ratio = formatNumber({
            value: roundNumber({
                value: ratio,
            }),
        });
    },
    async createTable(data) {
        this.instance = await createTable(
            {
                data: data,
                columns: this.columns(this.vendors),
                responsive: data.length == 0 ? true : false,
                ordering: false,
                initComplete: async function () {
                    const table = this.api();
                    const wrapper = table.table().container();
                    $(wrapper).find('.right-menu')
                        .html(`<button type="button" class="btn btn-success rounded" id="comparison-export">
                            <i class="fi fi-sr-file-excel text-lg text-white"></i>
                            Price Compare Export  
                        </button>`);
                    if (data.length == 0) {
                        return;
                    }
                    await tableComparison.sumTotal(data);
                    const footer = tableComparison
                        .columns()
                        .map((col) => {
                            switch (col.name) {
                                case 'NPRES_AMOUNT':
                                    return `<th id="total-pres-amount" class="bg-amber-500 text-right!">${tableComparison.totalPres}</th>`;
                                case 'NNEW_AMOUNT':
                                    return `<th id="total-new-amount" class="bg-amber-500 text-right!">${tableComparison.totalNew}</th>`;
                                case 'NCOST_AMOUNT':
                                    return `<th id="total-cost-amount" class="bg-amber-500 text-right!">${tableComparison.totalCost}</th>`;
                                case 'NCOST_RATIO':
                                    return `<th id="total-cost-ratio" class="bg-amber-500 text-right!">${tableComparison.ratio} %</th>`;
                                case 'NPRES_PRICE_ETA_AMEC':
                                case 'NNEW_PRICE_ETA_AMEC':
                                case 'NCOST_DIFF':
                                    return `<th class="bg-amber-500 text-center">Total</th>`;
                            }
                            if (
                                col.className &&
                                col.className.includes('sticky-column')
                            ) {
                                return `<th class="bg-gray-200! text-center sticky-column"></th>`;
                            }
                            return `<th class="bg-gray-200!"></th>`;
                        })
                        .join('');
                    $(table.table().node()).append(`
                        <tfoot>
                            ${footer}
                        </tfoot>`);
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
                        const totalRows = endRow + 1;
                        const columnTotal = [
                            { col: 'P', value: 'Total' },
                            { col: 'X', value: 'Total' },
                            { col: 'Z', value: 'Total' },
                            { col: 'Q', value: self.totalPres },
                            { col: 'Y', value: self.totalNew },
                            { col: 'AA', value: self.totalCost },
                            { col: 'AB', value: self.ratio },
                        ];
                        columnTotal.forEach((item) => {
                            sheet
                                .cell(`${item.col}${totalRows}`)
                                .value(item.value);
                            sheet.cell(`${item.col}${totalRows}`).style({
                                border: {
                                    top: { style: 'thin' },
                                    bottom: { style: 'thin' },
                                    left: { style: 'thin' },
                                    right: { style: 'thin' },
                                },
                            });
                            sheet
                                .cell(`${item.col}${totalRows}`)
                                .style('fill', 'FFC000');
                        });

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
            name: 'NPRES_PRICE_ETA_AMEC',
            className: 'bg-[#ccffcc]',
            render: function (data, type, row, meta) {
                row.NPRES_PRICE_ETA_AMEC = roundNumber({ value: data });
                return formatNumber({ value: row.NPRES_PRICE_ETA_AMEC });
            },
        },
        {
            data: 'NPRES_AMOUNT',
            name: 'NPRES_AMOUNT',
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
            name: 'NNEW_PRICE_ETA_AMEC',
            className: 'bg-[#ccffff]',
            render: function (data, type, row) {
                row.NNEW_PRICE_ETA_AMEC = calcNewPriceEta(row);
                return formatNumber({ value: row.NNEW_PRICE_ETA_AMEC });
            },
        },
        {
            data: null,
            name: 'NNEW_AMOUNT',
            render: function (data, type, row, meta) {
                row.NNEW_AMOUNT = roundNumber({
                    value:
                        (row.NNEW_PRICE_ETA_AMEC * row.NQUANTITY_YEAR) / 1000,
                });
                return formatNumber({ value: row.NNEW_AMOUNT });
            },
        },
        {
            data: null,
            name: 'NCOST_DIFF',
            render: function (data, type, row, meta) {
                row.NCOST_DIFF = roundNumber({
                    value: row.NPRES_PRICE_ETA_AMEC - row.NNEW_PRICE_ETA_AMEC,
                });
                return formatNumber({ value: row.NCOST_DIFF });
            },
        },
        {
            data: null,
            name: 'NCOST_AMOUNT',
            render: function (data, type, row, meta) {
                row.NCOST_AMOUNT = roundNumber({
                    value: (row.NCOST_DIFF * row.NQUANTITY_YEAR) / 1000,
                });
                return formatNumber({ value: row.NCOST_AMOUNT });
            },
        },
        {
            data: null,
            name: 'NCOST_RATIO',
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
