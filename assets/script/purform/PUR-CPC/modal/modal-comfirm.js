import { createModal } from '@amec/webasset/components/modal';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { tableComparison } from '../table/table-comparison';
import { createComparison } from '../data';
import { showLoader } from '@amec/webasset/preloader';
import { prepareFormData } from '../function';

export const modalConfirmRequest = {
    id: 'modal-confirm-request',
    show(isShow) {
        $('#' + this.id).prop('checked', isShow ? 'checked' : false);
        if (isShow) {
            $('#createPriceApproval').prop('checked', 'checked');
        }
    },
    init: function () {
        const modal = createModal({
            id: this.id,
            title: `<span class="text-xl font-bold">Create Request</span>`,
            classHeader: 'mb-1',
            className: 'min-w-xs max-w-lg',
            classTitle: 'flex flex-col gap-2',
            body: `
                <!-- Content -->
                <div class="py-6">

                    <p class="text-sm text-base-content/70 mb-5">
                        Please confirm what you want to create.
                    </p>

                    <!-- Option -->
                    <label
                        class="flex items-start gap-4 p-4 border border-base-300 rounded-lg
                            cursor-pointer hover:bg-base-200 transition-colors"
                    >
                        <input
                            type="checkbox"
                            id="createPriceApproval"
                            class="checkbox checkbox-primary mt-1"
                            checked
                        >

                        <div class="flex-1">
                            <div class="font-medium text-base-content">
                                Create Price Approval Form
                            </div>

                            <div class="text-sm text-base-content/60 mt-1">
                                Automatically create a Price Approval Form for this request.
                            </div>
                        </div>
                    </label>

                </div>
            `,
            action: `
                <label for="modal-confirm-request" class="btn btn-error">Cancel</label>
                <button class="btn btn-primary" id="submit-confirm-request">Submit</button>`,
        });
        $('body').append(modal);
        this.bindEvent();
    },
    bindEvent: function () {
        const self = this;
        $(document).on('click', '#submit-confirm-request', async function () {
            try {
                showLoader();
                const details = tableComparison.data();
                if (details.length === 0) {
                    showMessage('No data available for request.', 'warning');
                    return;
                }
                // const stepData = steps.data;

                // const data = {
                //     FUNC: stepData.function,
                //     REQBY: stepData.requester,
                //     INPUTBY: stepData.inputer,
                //     STATUS: 0,
                //     ISEDIT: stepData.formNo != null,
                //     FORMEDIT: stepData.formNo,
                //     DETAILS: details,
                //     VENDOR: stepData.vendor,
                //     MODE: stepData.compareMode,
                //     ...tableComparison.total,
                // };
                const data = prepareFormData(details);
                data.STATUS = $('#createPriceApproval').is(':checked') ? 2 : 1;
                const res = await createComparison(data);
                if (!res.status) {
                    throw new Error('Failed to create comparison.');
                }
                showMessage('Comparison created successfully.', 'success');
                self.show(false);
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
            } finally {
                showLoader({ show: false });
            }
        });
    },
};
