import { createTable, destroyTable } from '@amec/webasset/dataTable';
import { dataTableSkeleton } from '@amec/webasset/skeleton';

export const tableDraft = {
    instance: null,
    tableId: '#table-draft',
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
    async init(data) {
        await this.destroy();
        this.preload();
        await this.createTable(data);
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
                    // maxHeight: '60vh',
                },
            },
        );
    },
    bindEvents() {
        const self = this;
    },
    columns: [
        {
            title: 'No.',
            data: null,
            render: function (data, type, row, meta) {
                return meta.row + 1;
            },
        },
        {
            title: 'Price Comparison no.',
            data: 'FORMNO',
        },
        {
            title: 'Request by',
            data: 'REQBY_NAME',
        },
        {
            title: 'PLANNER',
            data: 'PLANNER_CODE',
        },
        {
            title: 'MODE',
            data: 'MODE',
        },
        {
            title: 'VENDOR',
            data: 'VENDOR',
        },
        {
            title: 'Amount of Present price(KB/Y)',
            data: 'AMOUNT_PRESENT',
        },
        {
            title: 'Amount of New price(KB/Y)',
            data: 'AMOUNT_NEW',
        },
        {
            title: 'Amount of Difference(KB/Y)',
            data: 'AMOUNT_DIFF',
        },
        {
            title: 'Ratio',
            data: 'RATIO',
        },
        {
            title: 'Request Date',
            data: 'REQ_DATE',
        },
        {
            title: 'QUOTATION',
            data: 'QUOTATION',
        },
        {
            title: 'Status',
            data: 'STATUS',
        },
    ],
};
