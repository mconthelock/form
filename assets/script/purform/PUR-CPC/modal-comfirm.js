import { createModal, setModal } from '@amec/webasset/components/modal';

export const modalConfirmRequest = {
    id: 'modal-confirm-request',
    _data: null,
    set data(data) {
        this._data = data;
    },
    get data() {
        return this._data;
    },
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
    },
};
