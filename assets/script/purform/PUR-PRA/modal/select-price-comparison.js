import { createModal } from '@amec/webasset/components/modal';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { getSelectedData } from '@amec/webasset/dataTable';
import { tableDraft } from '../../PUR-CPC/table-draft';
import { getAutoField } from '../function';
import { getVendors } from '../../PUR-CPC/data';

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
                    const autoField = getAutoField();
                    autoField.formComparison.val(data.VFORMNO);
                    autoField.vendor.val(data.VVENDOR);
                    autoField.vendorName.val(
                        vendors.find((v) => v.VENDOR == data.VVENDOR)?.VNDNAM,
                    );
                    autoField.planner.val(data.VPLANNER_CODE);
                    autoField.totalPresent.val(data.NAMOUNT_PRESENT);
                    autoField.totalNew.val(data.NAMOUNT_NEW);
                    autoField.totalCost.val(data.NAMOUNT_DIFF);
                    autoField.totalRatio.val(data.NRATIO);
                    self.show(false);
                } catch (error) {
                    console.error(error);
                    showErrorMessage(error.message);
                }
            },
        );
    },
};
