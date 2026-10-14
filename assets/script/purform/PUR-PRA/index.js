import {
    getUrlParams,
    logFormData,
    renderLoadError,
    requiredForm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { showLoader } from '@amec/webasset/preloader';
import { getFlatpickrDate } from '@amec/webasset/flatpickr';
import { handleFiles } from '@amec/webasset/dragdrop';
import { tableDraft } from '../PUR-CPC/table/table-draft';
import { createPriceApproveForm, getListCreate, getPlanner } from './data';
import {
    checkPlanner,
    checkVendor,
    getFormByUrlParam,
    setReturn,
    setAutoField,
    getComparisonForm,
} from './function';
import { setForm } from './function';
import { modalSelectPriceComparison } from './modal/select-price-comparison';
import { getReasons } from './reason';
import { redirectWebflow } from '@amec/webasset/form';
import { doaction } from '@amec/webasset/api/webform';
import { webflowSubmit } from '@amec/webasset/components/form';

$(async function () {
    try {
        showLoader();
        const params = getUrlParams();
        const empno = params.EMPNO;
        if (!(await checkPlanner(empno))) {
            throw new Error('User not found');
        }
        if (await setReturn()) {
            setTimeout(() => {
                const costDown = getReasons(
                    'reason-cost-down-container',
                ).getValue();
                console.log(costDown);
            }, 5000);
            return;
        }
        // ตั้งค่าโหมดฟอร์มเริ่มต้นตามค่าที่ส่งเข้ามา
        setAutoField({ mode: 1, trigger: false });

        await setForm({ inputer: empno });
        // สร้างปุ่ม สำหรับ request form
        $('#btnRequest').html(
            webflowSubmit({
                request: true,
                draft: true,
            }),
        );
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    } finally {
        showLoader({ show: false });
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-07
 * @description จัดการการเปลี่ยนแปลงของไฟล์แนบ (Attachment)
 */
$(document).on(
    'change',
    '#IMAGE_DETAIL, #FILE_QUOTATION, #FILE_ADDITIONAL',
    function () {
        handleFiles({ element: $(this) });
    },
);

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description ตรวจสอบว่า Planner มีอยู่ในระบบหรือไม่ เมื่อกรอกข้อมูลในฟิลด์ REQBY
 */
$(document).on('change', '#REQBY', async function () {
    const empno = $(this).val();
    if (!(await checkPlanner(empno))) {
        $(this).val('');
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description เปิด modal เพื่อเลือก รายการ Price Comparison
 */
$(document).on('click', '#btn-view-compare', async function () {
    try {
        showLoader();
        const req = $('#REQBY').val();
        if (!req) {
            showMessage('Please enter the requester.', 'warning');
            showLoader({ show: false });
            return;
        }
        const lists = await getListCreate(req, getComparisonForm());
        if (!lists.status) {
            showMessage(`Price comparison not found for ${req}`, 'warning');
            showLoader({ show: false });
            return;
        }
        modalSelectPriceComparison.show(true);
        tableDraft.init(lists.data, 'table-select-price-comparison');
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    } finally {
        showLoader({ show: false });
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-01
 * @description จัดการการเปลี่ยนแปลงโหมดฟอร์ม (form mode)
 */
$(document).on('change', 'input[name="NMODE"]', function () {
    try {
        const mode = $(this).val();
        setAutoField({ mode: +mode, trigger: false });
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-02
 * @description ตรวจสอบและตั้งค่า Vendor อัตโนมัติเมื่อกรอกข้อมูลในฟิลด์ VVENDOR
 */
$(document).on('change', '#VVENDOR', async function () {
    try {
        if ($('input[name="NMODE"]:checked').val() == 1) {
            return;
        }
        const vendor = $(this).val();
        const checked = await checkVendor(vendor);
        if (!checked) {
            $(this).val('');
            return;
        }
        setAutoField({
            data: {
                vendor: checked.data.VENDOR,
                vendorName: checked.data.VNDNAM,
            },
            mode: 0,
        });
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-06
 * @description ตรวจสอบ Planner อัตโนมัติเมื่อกรอกข้อมูลในฟิลด์ VPLANNER
 */
$(document).on('change', '#VPLANNER', async function () {
    try {
        const planner = $(this).val();
        if (!planner) return;
        const checked = await getPlanner(planner);
        if (!checked.status) {
            showMessage(`Planner not found for ${planner}`, 'warning');
            $(this).val('');
            return;
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-05
 * @description จัดการการเปิด/ปิดฟิลด์ VEFT_TYPE_OTHER ตามการเลือก VEFT_TYPE
 */
$(document).on('click', 'input[name="VEFT_TYPE"]', function () {
    try {
        const checked = $(this).prop('checked');
        const value = $(this).val();
        $('#VEFT_TYPE_OTHER')
            .val('')
            .toggleClass('hidden', !(checked && value === 'Others'))
            .prop('disabled', !(checked && value === 'Others'));
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-12
 * @description จัดการการส่งคำขอและการดำเนินการสำหรับฟอร์ม Price Approval
 */
$(document).on(
    'click',
    'button[name="btnRequest"], button[name="btnAction"]',
    async function () {
        try {
            showLoader();
            const val = $(this).val();
            if (
                !(await requiredForm('#form-price-approval')) &&
                (val === 'draft' || val === 'request')
            )
                return;
            const formData = setFormData();
            let res;
            switch (val) {
                case 'draft':
                    formData.set('isDraft', true);
                    formData.set('DRAFT', '0');
                    res = await createPriceApproveForm(formData);
                    break;
                case 'save':
                    formData.set('isSave', true);
                    res = await createPriceApproveForm(formData);
                    break;
                case 'request':
                    return;
                default:
                    const params = getUrlParams();
                    const form = getFormByUrlParam();
                    if (!params.EMPNO || val === '')
                        throw new Error(
                            'Missing required EMPNO or action value',
                        );

                    res = doaction({
                        ...form,
                        EMPNO: params.EMPNO,
                        ACTION: val,
                        REMARK: $('#remark').val(),
                    });
            }
            if (!res.status) {
                throw new Error('Failed to create price approval.');
            }
            showMessage(res.message, 'success');
            redirectWebflow();
        } catch (error) {
            console.error(error);
            showErrorMessage(error.message);
        } finally {
            showLoader({ show: false });
        }
    },
);

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-12
 * @description สร้างและจัดการข้อมูลฟอร์ม Price Approval
 * @returns {FormData} ข้อมูลฟอร์มที่ถูกจัดเตรียมสำหรับการส่ง
 */
function setFormData() {
    const formData = new FormData($('#form-price-approval')[0]);
    formData.set('DEFT_MONTH_START', getFlatpickrDate('#VEFT_MONTH', 0));
    formData.set('DEFT_MONTH_END', getFlatpickrDate('#VEFT_MONTH', 1));
    const costDown = getReasons('reason-cost-down-container').getValue();
    const costUp = getReasons('reason-cost-up-container').getValue();
    const basic = getReasons('reason-basic-condition-container').getValue();
    const estimate = getReasons('reason-estimate-price-container').getValue();
    const reasons = [...costDown, ...costUp, ...basic, ...estimate];
    reasons.forEach((item, i) => {
        // NestJS จะมองเป็น data[0][field], data[1][field]
        Object.keys(item).forEach((key) => {
            formData.append(`REASONS[${i}][${key}]`, item[key] ?? '');
        });
    });
    logFormData(formData);
    return formData;
}
