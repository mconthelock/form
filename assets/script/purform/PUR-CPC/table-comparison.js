import { createTable, destroyTable } from '@amec/webasset/dataTable';
import { dataTableSkeleton } from '@amec/webasset/skeleton';
import { showErrorMessage } from '@amec/webasset/utils';
import { showLoader } from '@amec/webasset/preloader';
import { steps } from './steps';
import { getCurrenCy } from './data';

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
                responsive: false,
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
                <th rowspan="3">Quantity/year</th>
                <th colspan="8">Present</th>
                <th colspan="8">New</th>
                <th colspan="3">Cost down(+) / Cost up(-)</th>
                <th colspan="2">New price parts 1st delivered</th>
            </tr>
            <tr>
                <th rowspan="2">Vendor Name</th>
                <th rowspan="2">Maker Name</th>
                <th colspan="2">Base Price</th>
                <th colspan="2">Price</th>
                <th rowspan="2">Price ETA AMEC <br> &lt;B&gt; <br> [THB/pcs] </th>
                <th rowspan="2">Amount <br> &lt;C=B*A&gt; <br> [KB/year]</th>
                <th rowspan="2">Vendor Name</th>
                <th rowspan="2">Maker Name</th>
                <th colspan="2">Base Price</th>
                <th colspan="2">Price</th>
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
                return meta.row + 1;
            },
        },
        { data: 'MODEL_NAME' },
        { data: 'JOB_ITEMNO' },
        { data: 'PART_NAME' },
        { data: 'DRAWING' },
        { data: 'ITEM_CODE' },
        { data: 'SPEC' },
        { data: 'MATERIAL_CODE' },
        { data: 'QUANTITY_YEAR' },
        { data: 'VENDOR_NAME' },
        { data: 'MAKER_NAME' },
        {
            data: 'BASE_PRICE',
            render: function (data, type, row, meta) {
                row.BASE_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.BASE_PRICE });
            },
        },
        { data: 'BASE_CURR' },
        {
            data: 'PRICE',
            render: function (data, type, row, meta) {
                row.PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.PRICE });
            },
        },
        { data: 'CURR' },
        {
            data: 'PRICE_ETA_AMEC',
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
            render: function (data, type, row, meta) {
                return data || row.VENDOR_NAME;
            },
        },
        {
            data: 'NEW_MAKER_NAME',
            render: function (data, type, row, meta) {
                return data || row.MAKER_NAME;
            },
        },
        {
            data: 'NEW_BASE_PRICE',
            render: function (data, type, row, meta) {
                row.NEW_BASE_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.NEW_BASE_PRICE });
            },
        },
        { data: 'NEW_BASE_CURR' },
        {
            data: 'NEW_PRICE',
            render: function (data, type, row, meta) {
                row.NEW_PRICE = roundNumber({ value: data });
                return formatNumber({ value: row.NEW_PRICE });
            },
        },
        { data: 'NEW_CURR' },
        {
            data: null,
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
                row.COST_RATIO = roundNumber({
                    value:
                        (row.COST_PRICE_DIFFERENCE / row.PRICE_ETA_AMEC) * 100,
                });
                return formatNumber({ value: row.COST_RATIO });
            },
        },
        { data: 'NEW_PRICE_YEAR' },
        { data: 'NEW_PRICE_MONTH' },
    ],
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

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-18
 * @description ปัดเศษแบบคณิตศาสตร์ (ปัดขึ้นเมื่อ >= 5) ให้เป็น number
 *              ใช้ e-notation เพื่อเลี่ยงปัญหา floating point เช่น 1.005
 *              ค่าที่ได้เก็บใน row data เพื่อนำไปลง database
 * @param {object}  param
 * @param {number|string} param.value ค่าที่ต้องการปัดเศษ (รองรับ string ที่มี comma)
 * @param {number} [param.digit=2] จำนวนตำแหน่งทศนิยม
 */
export function roundNumber({ value, digit = 2 } = {}) {
    const num = parseFloat(String(value ?? 0).replace(/,/g, ''));
    if (isNaN(num)) {
        return 0;
    }
    const sign = Math.sign(num) || 1;
    return (
        (sign * Math.round(Number(Math.abs(num) + 'e' + digit))) /
        Number('1e' + digit)
    );
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-18
 * @description แปลงตัวเลขเป็น string ทศนิยมพร้อม comma คั่นหลักพัน
 *              ใช้สำหรับแสดงผลบนหน้าจอเท่านั้น ห้ามนำไปคำนวณต่อ
 * @param {object}  param
 * @param {number|string} param.value ค่าที่ต้องการแสดงผล (รองรับ string ที่มี comma)
 * @param {number} [param.digit=2] จำนวนตำแหน่งทศนิยม
 */
export function formatNumber({ value, digit = 2 } = {}) {
    const parts = roundNumber({ value, digit }).toFixed(digit).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}
