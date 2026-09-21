import { Steps } from '@amec/webasset/components/steps';
import {
    requiredForm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { tableCreatePrice } from './table-create-price';
import { tableComparison } from './table-comparison';
import { importExcel } from './importExcel';
import { tableDraft } from './table.draft';
import { getActivePriceConditions } from './data';
/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-15
 * @description Handles the step navigation and validation for the price comparison form.
 */
export const steps = {
    instance: null,
    _mode: null,
    _inputer: null,
    _requester: null,
    _plannerCode: null,
    _function: null,
    _formNo: null,
    set plannerCode(value) {
        this._plannerCode = value;
    },
    get plannerCode() {
        return this._plannerCode;
    },
    set inputer(value) {
        this._inputer = value;
    },
    get inputer() {
        return this._inputer;
    },
    set requester(value) {
        this._requester = value;
    },
    get requester() {
        return this._requester;
    },
    set mode(value) {
        this._mode = value;
        $('#detail-step-container')
            .html(`<div class="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10"></div>
            <div class="absolute -right-2 top-10 h-12 w-12 rounded-full bg-white/10"></div>
            <div class="flex gap-5">
                <div class="relative flex flex-col items-center gap-2 px-8 py-6">
                    <p class="text-xs font-semibold uppercase tracking-widest text-white/80">Mode</p>
                    <p class="text-4xl font-extrabold drop-shadow-sm">${this.mode.toUpperCase()}</p>
                </div>
                <div class="relative flex flex-col items-center gap-2 px-8 py-6">
                    <p class="text-xs font-semibold uppercase tracking-widest text-white/80">Function</p>
                    <p id="card-func" class="text-4xl font-extrabold drop-shadow-sm">${this.function || '-'}</p>
                </div>
            </div>
        </div>`);
    },
    get mode() {
        return this._mode;
    },
    set function(value) {
        this._function = value ? +value : null;
        $('#card-func').text(this.function || '-');
    },
    get function() {
        return this._function;
    },
    set formNo(value) {
        this._formNo = value;
    },
    get formNo() {
        return this._formNo;
    },
    get data() {
        return {
            mode: this._mode,
            inputer: this._inputer,
            requester: this._requester,
            plannerCode: this._plannerCode,
            function: this._function,
            formNo: this._formNo,
        };
    },
    reset() {
        this._mode = null;
        this._inputer = null;
        this._requester = null;
        this._plannerCode = null;
        this._function = null;
        this._formNo = null;
    },
    init(inputer) {
        this.inputer = inputer;
        this.instance = new Steps({
            container: '#price-comparison-steps',
            steps: [
                { label: 'New or Continue' },
                { label: 'Choose Pending Items' },
                { label: 'Input Data' },
                { label: 'Pre Data' },
                { label: 'Upload File' },
            ],
            currentStep: 0,
            clickable: true,
            allowClickForward: false,
            onChange: async function (currentStep) {
                try {
                    await steps.handlePanel(currentStep);
                } catch (error) {
                    console.error(error);
                    showErrorMessage(error.message);
                }
            },
        });
        this.handlePanel(0);
        this.bindEvents();
    },
    bindEvents() {
        const self = this;
        const stepper = self.instance;
        // Bind click events for previous buttons
        $(document).on('click', '#previous-step', function () {
            self.handlePreviousStep(stepper.currentStep);
        });
        // Bind click events for next buttons
        $(document).on('click', '#next-step, .next-step', async function () {
            if (!(await self.validatePanel(stepper.currentStep))) return;
            if (stepper.currentStep === 0) {
                self.mode = $(this).attr('mode');
            }
            self.handleNextStep(stepper.currentStep);
        });
    },
    /**
     * @author Sutthipong Tangmongkhoncharoen(24008)
     * @since 2026-09-15
     * @description ตรวจสอบข้อมูลของหน้าปัจจุบันก่อนไป step ถัดไป
     * @param {number} index - เลข step นับตาม index เริ่มที่ 0 จาก step ปัจจุบัน
     */
    async validatePanel(index) {
        // TODO: ใส่ validation ของแต่ละหน้า เช่น
        if (index === 2) {
            return await requiredForm('#step-requester');
        }
        return true;
    },
    /**
     * @author Sutthipong Tangmongkhoncharoen(24008)
     * @since 2026-09-15
     * @description จัดการการแสดงผลของแต่ละ step เมื่อเปลี่ยนหน้า
     * @param {number} index - เลข step นับตาม index เริ่มที่ 0
     */
    async handlePanel(index) {
        const requester = $('input[name="requester"]');
        const stepNavigation = $('#step-navigation');
        const btnPrevious = $('#previous-step');
        const btnNext = $('#next-step');
        const btnSaveDraft = $('#save-draft');
        const btnSubmit = $('#submit-form');
        const btnNewStep = $('#new-step');
        const btnDraftStep = $('#draft-step');
        btnNewStep.addClass('hidden');
        btnDraftStep.addClass('hidden');
        stepNavigation.find('button').addClass('hidden');
        switch (index) {
            case 0:
                btnNewStep.removeClass('hidden');
                btnDraftStep.removeClass('hidden');
                break;
            case 1:
                // this.inputer
                const draftData = []; // Replace this with actual draft data
                if (draftData.length === 0) {
                    showMessage('No draft data available', 'warning');
                    this.instance.skipTo(2);
                    this.mode = 'new';
                    return;
                }
                tableDraft.init(draftData);
                btnPrevious.removeClass('hidden');
                btnNext.removeClass('hidden');
                break;
            case 2:
                this.function = null;
                const activePriceConditions = await getActivePriceConditions();
                if (!activePriceConditions.status) {
                    throw new Error(activePriceConditions.message);
                }
                const priceCondContainer = $('#price-cond');
                priceCondContainer.html(
                    activePriceConditions.data
                        .map(
                            (condition) => `
                                <label class="label">
                                    <input type="radio" name="function" value="${condition.NO}" class="radio req"
                                        data-message="Please enter function">
                                    ${condition.NO}
                                    ${condition.DESCRIPTION}
                                </label>
                            `,
                        )
                        .join(''),
                );
                requester.trigger('focus');
                btnPrevious.removeClass('hidden');
                btnNext.removeClass('hidden');
                break;
            case 3:
                tableCreatePrice.init(this.plannerCode);
                tableComparison.reset();
                btnPrevious.removeClass('hidden');
                btnNext.removeClass('hidden');
                break;
            case 4:
                importExcel.reset();
                tableComparison.init({ formNo: this._formNo });
                btnPrevious.removeClass('hidden');
                btnSaveDraft.removeClass('hidden');
                btnSubmit.removeClass('hidden');
                break;
        }

        if (index <= 2) {
            // reset ฟอร์ม requester และลบ profile card
            $('#step-requester')[0].reset();
            $('#requester-card-container').empty();
            // เมื่อกลับไปหน้าแรกให้ reset ค่าทั้งหมด
            if (index === 0) {
                $('#detail-step-container').html('');
                this.reset();
            }
        }
    },
    /**
     * @author Sutthipong Tangmongkhoncharoen(24008)
     * @since 2026-09-15
     * @description จัดการการกดปุ่ม previous ของแต่ละ step
     * @param {number} index - เลข step นับตาม index เริ่มที่ 0 จาก step ปัจจุบัน
     */
    handlePreviousStep(index) {
        switch (index) {
            case 3:
                if (this.mode === 'new') {
                    this.instance.previous();
                } else {
                    this.instance.skipTo(1);
                }
                break;
            case 2:
                this.instance.skipTo(0);
                break;

            default:
                this.instance.previous();
                break;
        }
    },
    /**
     * @author Sutthipong Tangmongkhoncharoen(24008)
     * @since 2026-09-15
     * @description จัดการการกดปุ่ม next ของแต่ละ step
     * @param {number} index - เลข step นับตาม index เริ่มที่ 0 จาก step ปัจจุบัน
     */
    handleNextStep(index) {
        switch (index) {
            case 0:
                if (this.mode === 'new') {
                    this.instance.disableStep(1);
                    this.instance.enableStep(2);
                    this.instance.skipTo(2);
                } else {
                    this.instance.disableStep(2);
                    this.instance.enableStep(1);
                    this.instance.next();
                }
                break;
            case 1:
                this.instance.skipTo(3);
                break;
            default:
                this.instance.next();
                break;
        }
    },
};
