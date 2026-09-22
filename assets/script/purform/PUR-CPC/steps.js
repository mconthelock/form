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
import { getActivePriceConditions, getK850mpData } from './data';
import { webflowSubmit } from '@amec/webasset/components/form';
import { skeletons } from '@amec/webasset/skeleton';
import { getUser, getUserImage } from '@amec/webasset/api/amec';
import { EmployeeProfileCard } from '@amec/webasset/components/profileCard';
import { getSelectedData } from '@amec/webasset/dataTable';
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
        this._requester = null;
        this._plannerCode = null;
        this._function = null;
        this._formNo = null;
    },
    resetRequester() {
        this.requester = null;
        this.plannerCode = null;
        $('input[name="requester"]').val('');
        $('#requester-card-container').empty();
    },
    async init(inputer) {
        this.inputer = inputer;
        await this.setProfileCard(
            inputer,
            '#inputer-card-container',
            'Inputer',
        );

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
    /**
     * @author Sutthipong Tangmongkhoncharoen(24008)
     * @since 2026-09-15
     * @description Sets the profile card for the given employee number in the specified container with an optional title.
     * @param {string} empno
     * @param {string} containner
     * @param {string} title
     * @returns
     */
    async setProfileCard(empno, containner, title = 'Requester') {
        const isRequester = title == 'Requester';
        const k850mpData = await getK850mpData();
        const k850mpRecord = k850mpData.data.filter(
            (record) => record.K85M03 === empno,
        );
        if (k850mpRecord.length === 0) {
            $(containner).empty();
            if (isRequester) {
                this.resetRequester();
            }
            showMessage('Planner not found', 'warning');
            return;
        }
        const empnoData = await getUser(empno);
        const userImage = await getUserImage(empno);
        if (!empnoData) {
            $(containner).empty();
            if (isRequester) {
                this.resetRequester();
            }
            showMessage('User not found', 'warning');
            return;
        }
        if (isRequester) {
            this.requester = empno;
            this.plannerCode = k850mpRecord.map((record) => record.K85M02);
        }

        new EmployeeProfileCard({
            container: containner,
            name: empnoData.SNAME,
            empno: empno,
            position: empnoData.SPOSITION,
            sec: empnoData.SSEC || '-',
            dept: empnoData.SDEPT || '-',
            image: userImage,
            title: title,
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
        if (index === 1 && this.mode == 'draft' && this.formNo == null) {
            showMessage('Please select a draft form.', 'warning');
            return;
        }
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
        const webformSubmitContainer = $('#webform-submit');
        const btnNewStep = $('#new-step');
        const btnDraftStep = $('#draft-step');
        btnNewStep.addClass('hidden');
        btnDraftStep.addClass('hidden');
        webformSubmitContainer.addClass('hidden');
        stepNavigation.find('button').addClass('hidden');
        if (index <= 2) {
            // reset ฟอร์ม requester และลบ profile card
            $('#step-requester')[0].reset();
            this.function = null;
            this.formNo = null;
            this.resetRequester();
            // เมื่อกลับไปหน้าแรกให้ reset ค่าทั้งหมด
            if (index === 0) {
                $('#detail-step-container').html('');
                this.reset();
            }
        }
        switch (index) {
            case 0:
                btnNewStep.removeClass('hidden');
                btnDraftStep.removeClass('hidden');
                break;
            case 1:
                // this.inputer
                await this.setProfileCard(
                    this.inputer,
                    '#requester-card-container',
                );
                // TODO: ดึงข้อมูล draft จากแหล่งข้อมูลจริง
                // * mockdata
                const draftData = [
                    {
                        FORMNO: 'COMP-2026-000001',
                        REQBY_NAME: 'John Doe',
                        PLANNER_CODE: 'X',
                        MODE: 'E',
                        VENDOR: '70006',
                        AMOUNT_PRESENT: 28500,
                        AMOUNT_NEW: 30000,
                        AMOUNT_DIFF: -1500,
                        RATIO: '5%',
                        REQ_DATE: '2026-08-15 09:59',
                        QUOTATION: null,
                        FUNCTION: 1,
                        STATUS: 0,
                    },
                    {
                        FORMNO: 'COMP-2026-000002',
                        REQBY_NAME: 'John Doo',
                        PLANNER_CODE: 'X',
                        MODE: 'E',
                        VENDOR: '70006',
                        AMOUNT_PRESENT: 25500,
                        AMOUNT_NEW: 30000,
                        AMOUNT_DIFF: -4500,
                        RATIO: '7%',
                        REQ_DATE: '2026-08-16 09:59',
                        QUOTATION: null,
                        FUNCTION: 2,
                        STATUS: 1,
                    },
                ];
                if (draftData.length === 0) {
                    showMessage('No draft data available', 'warning');
                    this.instance.skipTo(2);
                    this.mode = 'new';
                    return;
                }
                tableDraft.init(draftData);
                btnPrevious.removeClass('hidden');
                btnNext.removeClass('hidden');
                btnNext.prop('disabled', false);
                break;
            case 2:
                this.function = null;
                btnNext.prop('disabled', true);
                btnPrevious.removeClass('hidden');
                btnNext.removeClass('hidden');
                requester.trigger('focus');
                const priceCondContainer = $('#price-cond');
                priceCondContainer.html('');
                skeletons({
                    element: '#price-cond',
                    count: 5,
                    pattern: [{ width: 'w-1/2', height: 'h-8' }],
                });
                const activePriceConditions = await getActivePriceConditions();
                if (!activePriceConditions.status) {
                    throw new Error(activePriceConditions.message);
                }
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
                break;
            case 3:
                tableCreatePrice.init(this.plannerCode);
                tableComparison.reset();
                btnPrevious.removeClass('hidden');
                btnNext.removeClass('hidden');
                break;
            case 4:
                importExcel.reset();
                tableComparison.init({ formNo: this.formNo });
                btnPrevious.removeClass('hidden');
                const submitOpt = {
                    remark: false,
                    draft: true,
                    request: true,
                    back: false,
                };
                if (this.mode !== 'new') {
                    submitOpt.draft = false;
                    submitOpt.request = false;
                    submitOpt.save = true;
                    submitOpt.approve = true;
                    submitOpt.flow = true;
                    submitOpt.flowHtml = ''; // TODO หาก user ตัดสินใจ ว่าให้ approve ค่อยมากำหนดค่า
                }
                const submitHtml = webflowSubmit(submitOpt);
                webformSubmitContainer.html(submitHtml).removeClass('hidden');
                break;
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
        /**
         * Handle input event for requester field and update profile card accordingly.
         */
        $(document).on('input', 'input[name="requester"]', async function () {
            try {
                const requester = $(this).val();
                if (requester.length < 5) {
                    $('#requester-card-container').empty();
                    return;
                }
                await self.setProfileCard(
                    requester,
                    '#requester-card-container',
                );
                $('#next-step').prop('disabled', false);
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
            }
        });

        /**
         * Handle change event for requester field and validate its length.
         */
        $(document).on('change', 'input[name="requester"]', async function () {
            try {
                const requester = $(this).val();
                if (requester.length < 5) {
                    showMessage(
                        'Requester must be at least 5 characters',
                        'warning',
                    );
                    $(this).val('');
                }
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
            }
        });

        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-09-15
         */
        $(document).on('change', 'input[name="function"]', async function () {
            try {
                self.function = $(this).val();
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
            }
        });
    },
};
