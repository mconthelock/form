import {
    createTable,
    destroyTable,
    getSelectedData,
} from '@amec/webasset/dataTable';
import { dataTableSkeleton } from '@amec/webasset/skeleton';
import { showErrorMessage } from '@amec/webasset/utils';
import { steps } from './steps';
import { formatDate } from '@amec/webasset/dayjs';

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
                responsive: data.length == 0 ? true : false,
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
                    type: 'radio',
                },
                domScroll: {
                    status: true,
                },
            },
        );
    },
    bindEvents() {
        const self = this;
        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-09-22
         * @description Set form number
         */
        $(document).on(
            'click',
            'input[name="select-dt-row-radio"]',
            async function () {
                try {
                    const selected = getSelectedData(self.instance);
                    const data = selected[0];
                    steps.formNo = data.VFORMNO;
                    steps.function = data.NFUNCTIONS;
                    steps.system = data.VSYSTEM;
                    steps.priceApvForm = data.PRICE_APV_FORM;
                    steps.setRequester(data.VREQNO);
                    steps.setInputer(data.VINPUTER);
                } catch (error) {
                    console.error(error);
                    showErrorMessage(error.message);
                }
            },
        );
    },
    columns: [
        {
            title: 'No.',
            data: null,
            className: 'sticky-column',
            render: function (data, type, row, meta) {
                if (Array.isArray(meta.row)) {
                    return meta.row[0] + 1;
                }
                return meta.row + 1;
            },
        },
        {
            title: 'Price Comparison no.',
            data: 'VFORMNO',
            className: 'sticky-column',
        },
        {
            title: 'Input by',
            data: 'VINPUTBY_NAME',
            className: 'text-nowrap',
        },
        {
            title: 'Request by',
            data: 'VREQBY_NAME',
            className: 'text-nowrap',
        },
        {
            title: 'Function',
            data: 'NFUNCTIONS',
        },
        {
            title: 'PLANNER',
            data: 'VPLANNER_CODE',
        },
        {
            title: 'MODE',
            data: 'VMODE',
        },
        {
            title: 'Amount of Present price(KB/Y)',
            data: 'NAMOUNT_PRESENT',
        },
        {
            title: 'Amount of New price(KB/Y)',
            data: 'NAMOUNT_NEW',
        },
        {
            title: 'Amount of Difference(KB/Y)',
            data: 'NAMOUNT_DIFF',
        },
        {
            title: 'Ratio',
            data: 'NRATIO',
        },
        {
            title: 'Request Date',
            data: 'DREQDATE',
            className: 'text-nowrap',
            render: function (data, type, row, meta) {
                return formatDate(data, 'DD-MMM-YY HH:mm');
            },
        },
        {
            title: 'Status',
            data: 'NSTATUS',
            render: function (data, type, row, meta) {
                switch (data) {
                    case 0:
                        return 'Draft';
                    case 1:
                        return '<span class="text-primary">Created</span>';
                    case 2:
                        return '<span class="text-success">Used</span>';
                    default:
                        return 'Unknown';
                }
            },
        },
    ],
};
