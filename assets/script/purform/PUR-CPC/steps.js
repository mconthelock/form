import { Steps } from '@amec/webasset/components/steps';
import { requiredForm, showErrorMessage } from '@amec/webasset/utils';
import { getPlannerCompareSheet } from './data';
import { tableCreatePrice } from './table-create-price';
import { showLoader } from '@amec/webasset/preloader';
/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-15
 * @description Handles the step navigation and validation for the price comparison form.
 */
export const steps = {
    instance: null,
    mode: null,
    _requester: null,
    _plannerCode: null,
    _function: null,
    set plannerCode(value) {
        this._plannerCode = value;
    },
    get plannerCode() {
        return this._plannerCode;
    },
    set requester(value) {
        this._requester = value;
    },
    get requester() {
        return this._requester;
    },
    set function(value) {
        this._function = value;
    },
    get function() {
        return this._function;
    },
    get data() {
        return {
            mode: this.mode,
            requester: this._requester,
            plannerCode: this._plannerCode,
            function: this._function,
        };
    },
    reset() {
        this.mode = null;
        this._requester = null;
        this._plannerCode = null;
        this._function = null;
    },
    init() {
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
                await steps.handlePanel(currentStep);
            },
        });
        this.handlePanel(0);
        this.bindEvents();
    },
    bindEvents() {
        const self = this;
        const stepper = self.instance;
        $(document).on('click', '#previous-step', function () {
            self.handlePreviousStep(stepper.currentStep);
        });
        $(document).on('click', '#next-step, .next-step', async function () {
            try {
                showLoader();
                if (!(await self.validatePanel(stepper.currentStep))) return;
                if (stepper.currentStep === 0) {
                    self.mode = $(this).attr('mode');
                }
                await self.handleNextStep(stepper.currentStep);
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
            } finally {
                showLoader({ show: false });
            }
        });
    },
    /** ตรวจสอบข้อมูลของหน้าปัจจุบันก่อนไป step ถัดไป */
    async validatePanel(index) {
        // TODO: ใส่ validation ของแต่ละหน้า เช่น
        if (index === 2) {
            return await requiredForm('#step-requester');
        }
        return true;
    },
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
            case 2:
            case 3:
                btnPrevious.removeClass('hidden');
                btnNext.removeClass('hidden');
                break;
            case 4:
                btnPrevious.removeClass('hidden');
                btnSaveDraft.removeClass('hidden');
                btnSubmit.removeClass('hidden');
                break;
        }

        if (index <= 1) {
            // reset ฟอร์ม requester และลบ profile card
            $('#step-requester')[0].reset();
            $('#requester-card-container').empty();
            // เมื่อไปหน้า input data ให้ focus ที่ช่อง requester
            if (index === 2) {
                requester.trigger('focus');
            }
            // เมื่อกลับไปหน้าแรกให้ reset ค่าทั้งหมด
            if (index === 0) {
                this.reset();
            }
        }
    },
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
    async handleNextStep(index) {
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
            case 2:
                tableCreatePrice.init(this.plannerCode);
                this.instance.next();
                break;
            default:
                this.instance.next();
                break;
        }
    },
};
