import { Steps } from '@amec/webasset/components/steps';
import {
    getUrlParams,
    requiredForm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { tableCreatePrice } from './table/table-create-price';
import { tableComparison } from './table/table-comparison';
import { importExcel } from './importExcel';
import { tableDraft } from './table/table-draft';
import { getActivePriceConditions, getK850mpData, getListDraft } from './data';
import { webflowSubmit } from '@amec/webasset/components/form';
import { skeletons } from '@amec/webasset/skeleton';
import { getUser, getUserImage } from '@amec/webasset/api/amec';
import { EmployeeProfileCard } from '@amec/webasset/components/profileCard';
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
    _system: null,
    _formNo: null,
    _priceApvForm: null,
    _vendor: null,
    _compareMode: null,
    _isReturn: false,
    set compareMode(value) {
        $('input[name="compare-mode"][value="' + value + '"]').prop(
            'checked',
            true,
        );
        this._compareMode = value;
    },
    get compareMode() {
        return this._compareMode;
    },
    set priceApvForm(value) {
        this._priceApvForm = value;
        if (value?.PRA_NO) {
            $('#detail-step-apv-no').removeClass('hidden');
            $('#detail-step-apv-no .detail-text').text(value.PRA_NO);
        } else {
            $('#detail-step-apv-no').addClass('hidden');
        }
    },
    get priceApvForm() {
        return this._priceApvForm;
    },
    set vendor(value) {
        this._vendor = value;
    },
    get vendor() {
        return this._vendor;
    },
    set system(value) {
        this._system = value;
    },
    get system() {
        return this._system;
    },
    set plannerCode(value) {
        this._plannerCode = value;
    },
    get plannerCode() {
        return this._plannerCode;
    },
    async setInputer(value) {
        this._inputer = value;
        await this.setProfileCard(value, '#inputer-card-container', 'Inputer');
    },
    get inputer() {
        return this._inputer;
    },
    set requester(value) {
        this._requester = value;
    },
    async setRequester(value) {
        this.requester = value;
        if (!value) {
            this.requester = null;
            this.plannerCode = null;
            this.priceApvForm = null;
            $('input[name="requester"]').val('');
            $('#requester-card-container').empty();
        } else {
            await this.setProfileCard(
                value,
                '#requester-card-container',
                'Requester',
            );
        }
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
            <div class="hidden flex flex-col items-center gap-2 px-8 py-6" id="detail-step-comp-no">
                <p class="text-xs font-semibold uppercase tracking-widest text-white/80">Price Comparison No.</p>
                <p class="text-2xl font-extrabold drop-shadow-sm detail-text">${this.formNo}</p>
            </div>
            <div class="hidden flex flex-col items-center gap-2" id="detail-step-apv-no">
                <p class="text-xs font-semibold uppercase tracking-widest text-white/80">Price Approval No.</p>
                <p class="text-2xl font-extrabold drop-shadow-sm detail-text">${this.priceApvForm}</p>
            </div>
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
        if (value) {
            $('#detail-step-comp-no').removeClass('hidden');
            $('#detail-step-comp-no .detail-text').text(value);
        } else {
            $('#detail-step-comp-no').addClass('hidden');
        }
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
            system: this._system,
            function: this._function,
            formNo: this._formNo,
            priceApvForm: this._priceApvForm,
            vendor: this._vendor,
            compareMode: this._compareMode,
        };
    },
    reset() {
        this._mode = null;
        this._requester = null;
        this._plannerCode = null;
        this._function = null;
        this._system = null;
        this._formNo = null;
        this._priceApvForm = null;
        this._vendor = null;
        this._compareMode = null;
    },
    async init(isReturn = false) {
        this._isReturn = isReturn;
        this.instance = new Steps({
            container: '#price-comparison-steps',
            steps: [
                { label: 'New or Continue' },
                { label: 'Choose Pending Items' },
                { label: 'Input Data' },
                { label: 'Select Item Code' },
                { label: 'Upload File' },
            ],
            currentStep: isReturn ? 3 : 0,
            disabledSteps: isReturn ? [0, 1, 2] : [],
            clickable: true,
            allowClickForward: false,
            onChange: async function (currentStep) {
                try {
                    await steps.handlePanel(currentStep);
                } catch (error) {
                    console.error(error);
                    showErrorMessage(error.message);
                    steps.handlePreviousStep();
                }
            },
        });
        if (isReturn) {
            this.handlePanel(3);
        } else {
            this.handlePanel(0);
        }
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
        const buyers = k850mpData.data.filter((record) =>
            record.K85M10.startsWith('BUY'),
        );
        const purs = k850mpData.data.filter((record) =>
            record.K85M10.startsWith('PUR'),
        );
        if (k850mpRecord.length === 0) {
            $(containner).empty();
            if (isRequester) {
                this.setRequester(null);
            }
            showMessage('Planner not found', 'warning');
            return;
        }
        const empnoData = await getUser(empno);
        const userImage = await getUserImage(empno);
        if (!empnoData) {
            $(containner).empty();
            if (isRequester) {
                this.setRequester(null);
            }
            showMessage('User not found', 'warning');
            return;
        }
        if (isRequester) {
            const enableFuncAs400 = buyers.some(
                (record) => record.K85M03 === empno,
            );
            const enebleFuncMitsu = purs.some(
                (record) => record.K85M03 === empno,
            );
            if (enableFuncAs400) {
                $('input[name="function"][data-system="AS400"]').prop(
                    'disabled',
                    false,
                );
            }
            if (enebleFuncMitsu) {
                $('input[name="function"][data-system="PROCUREMENT"]').prop(
                    'disabled',
                    false,
                );
            }
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
        if (index === 3) {
            return await requiredForm('#step-vendor');
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
            this.system = null;
            this.formNo = null;
            this.setRequester(null);
            $('#step-vendor')[0].reset();
            this.vendor = null;
            this.compareMode = null;
            // เมื่อกลับไปหน้าแรกให้ reset ค่าทั้งหมด
            if (index === 0) {
                $('#detail-step-container').html('');
                this.reset();
            }
        }
        const params = getUrlParams();
        const empno = params.EMPNO;
        switch (index) {
            case 0:
                await this.setInputer(empno);
                btnNewStep.removeClass('hidden');
                btnDraftStep.removeClass('hidden');
                break;
            case 1:
                await tableDraft.destroy();
                tableDraft.preload();
                const draftData = await getListDraft(this.inputer);
                if (!draftData.status) {
                    showMessage('No draft data available', 'warning');
                    this.instance.skipTo(2);
                    this.mode = 'new';
                    return;
                }
                await this.setInputer(empno);
                await this.setRequester(this.inputer);
                tableDraft.init(draftData.data);
                btnPrevious.removeClass('hidden');
                btnNext.removeClass('hidden');
                btnNext.prop('disabled', false);
                break;
            case 2:
                this.function = null;
                this.system = null;
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
                                        data-message="Please enter function" data-system="${condition.SYSTEM}" disabled>
                                    ${condition.NO}
                                    ${condition.DESCRIPTION}
                                </label>
                            `,
                        )
                        .join(''),
                );
                break;
            case 3:
                await tableCreatePrice.init({
                    PLANNER: this.plannerCode,
                    SYSTEM: this.system,
                });
                if (!this._isReturn) {
                    btnPrevious.removeClass('hidden');
                }
                btnNext.removeClass('hidden');
                break;
            case 4:
                importExcel.reset();
                await tableComparison.init({ formNo: this.formNo });
                btnPrevious.removeClass('hidden');
                const submitOpt = {
                    remark: false,
                    back: false,
                };
                if (this.mode == 'new') {
                    submitOpt.draft = true;
                    submitOpt.request = true;
                }
                if (this.mode == 'draft') {
                    submitOpt.draft = false;
                    submitOpt.save = true;
                    submitOpt.request = true;
                }
                let submitHtml = webflowSubmit(submitOpt);
                if (this.priceApvForm != null) {
                    submitOpt.request = false;
                    submitOpt.form = this.priceApvForm;
                    submitHtml = await webflowSubmit(submitOpt);
                }
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
                    $('input[name="function"]').prop('disabled', true);
                    $('#requester-card-container').empty();
                    return;
                }
                await self.setRequester(requester);
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
                    $('input[name="function"]').prop('disabled', true);
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
                self.system = $(this).data('system');
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
            }
        });
    },
};
