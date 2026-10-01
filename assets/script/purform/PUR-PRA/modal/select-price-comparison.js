import { createModal } from '@amec/webasset/components/modal';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { getSelectedData } from '@amec/webasset/dataTable';
import { tableDraft } from '../../PUR-CPC/table-draft';
import { setAutoField } from '../function';
import { getVendors } from '../../PUR-CPC/data';
import { tableComparison } from '../../PUR-CPC/table-comparison';

export const modalSelectPriceComparison = {
    id: 'modal-select-price-comparison',
    show(isShow) {
        $('#' + this.id).prop('checked', isShow ? 'checked' : false);
    },
    init: function () {
        const modal = createModal({
            id: this.id,
            closeBackdrop: false,
            title: `<span class="text-xl font-bold">Select Price Comparison</span>`,
            classHeader: 'mb-1',
            className: 'min-w-[80vw] w-fit self-start mt-5',
            classTitle: 'flex flex-col gap-2',
            body: `
                <table id="table-select-price-comparison" class="table table-zebra"></table>
            `,
            action: `<label for="modal-select-price-comparison" class="btn btn-error">Close</label>
            <button class="btn btn-primary" id="btn-select-price-comparison">Select</button>`,
        });
        $('body').append(modal);
        this.bindEvent();
    },
    bindEvent: function () {
        const self = this;
        $(document).on(
            'click',
            '#btn-select-price-comparison',
            async function () {
                try {
                    const selected = getSelectedData(tableDraft.get());
                    if (selected.length === 0) {
                        showMessage(
                            'Please select a price comparison.',
                            'warning',
                        );
                        return;
                    }
                    const vendors = await getVendors();
                    if (!vendors || vendors.length === 0) {
                        showMessage('No vendor data found', 'warning');
                        return;
                    }
                    const data = selected[0];
                    setAutoField({
                        data: {
                            formComparison: data.VFORMNO,
                            vendor: data.VVENDOR,
                            vendorName: vendors.find(
                                (v) => v.VENDOR == data.VVENDOR,
                            )?.VNDNAM,
                            planner: data.VPLANNER_CODE,
                            totalPresent: data.NAMOUNT_PRESENT,
                            totalNew: data.NAMOUNT_NEW,
                            totalCost: data.NAMOUNT_DIFF,
                            totalRatio: data.NRATIO,
                        },
                        mode: 1,
                    });

                    self.show(false);
                    await tableComparison.init({
                        formNo: data.VFORMNO,
                        function: data.NFUNCTIONS,
                    });
                } catch (error) {
                    console.error(error);
                    showErrorMessage(error.message);
                }
            },
        );
    },
};
