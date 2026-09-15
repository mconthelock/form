import { Steps } from '@amec/webasset/components/steps';
import { requiredForm } from '@amec/webasset/utils';
export const steps = {
    instance: null,
    mode: null,
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
        this.bindEvents();
    },
    bindEvents() {
        const self = this;
        const stepper = self.instance;
        $(document).on('click', '.previous-step', function () {
            self.handlePreviousStep(stepper.currentStep);
        });
        $(document).on('click', '.next-step', async function () {
            if (!(await self.validatePanel(stepper.currentStep))) return;
            if (stepper.currentStep === 0) {
                self.mode = $(this).attr('mode');
            }
            self.handleNextStep(stepper.currentStep);
        });
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
    handleNextStep(index) {
        console.log('mode', this.mode);
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
                console.log('2');
                this.instance.skipTo(3);
                break;
            default:
                console.log('3');
                this.instance.next();
                break;
        }
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
        if (index <= 1) {
            $('#step-requester')[0].reset();
            $('#requester-card-container').empty();
            if (index === 1) {
                requester.trigger('focus');
            }
        }
    },
};
