import {
    getUrlParams,
    renderLoadError,
    requiredForm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { showLoader } from '@amec/webasset/preloader';
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
    setView,
    setContent,
    setFormData,
    handleReqFile,
} from './function';
import { setForm } from './function';
import { modalSelectPriceComparison } from './modal/select-price-comparison';
import { redirectWebflow } from '@amec/webasset/form';
import { doaction, getMode } from '@amec/webasset/api/webform';
import { webflowSubmit } from '@amec/webasset/components/form';

let isReturn = false;
$(async function () {
    try {
        showLoader();
        const params = getUrlParams();
        const form = getFormByUrlParam();
        const empno = params.EMPNO;

        let formMode = 1;
        if (params.NRUNNO) {
            formMode = await getMode({
                ...form,
                EMPNO: empno,
            });
        }
        console.log('mode', formMode);
        switch (+formMode) {
            case 1:
                if (!(await checkPlanner(empno))) {
                    throw new Error('User not found');
                }
                setContent('create');
                // ตั้งค่าโหมดฟอร์มเริ่มต้นตามค่าที่ส่งเข้ามา
                setAutoField({ mode: 1, trigger: false });
                $('#btn-edit-compare').remove();
                await setForm({ inputer: empno });
                // สร้างปุ่ม สำหรับ request form
                $('#btnRequest').html(
                    webflowSubmit({
                        request: true,
                        draft: true,
                    }),
                );
                break;
            case 2:
                isReturn = await setReturn();
                console.log('isReturn', isReturn);
                if (!isReturn) {
                    await setView();
                    // สร้างปุ่ม สำหรับ request form
                    $('#btnRequest').html(
                        await webflowSubmit({
                            approve: true,
                            reject: true,
                            returnp: true,
                            form: form,
                        }),
                    );
                    return;
                }
                setContent('create');
                // สร้างปุ่ม สำหรับ request form
                $('#btnRequest').html(
                    await webflowSubmit({
                        save: true,
                        approve: true,
                        reject: true,
                        form: form,
                    }),
                );
                break;
            case 3:
                await setView();
                // สร้างปุ่ม สำหรับ request form
                $('#btnRequest').html(
                    await webflowSubmit({
                        remark: false,
                        back: false,
                        form: form,
                    }),
                );
                break;
            default:
                throw new Error('Invalid form mode');
        }
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
        // $('#requester-fieldset span#card-empno').text();
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
        setAutoField({ mode: +mode, trigger: false, isReturn: isReturn });
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
        if (!checked.status) {
            $(this).val('');
            return;
        }
        setAutoField({
            data: {
                vendor: checked.data.VENDOR,
                vendorName: checked.data.VNDNAM,
                planner: $('#VPLANNER').val(),
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
 * @since 2026-10-19
 * @description จัดการการเปลี่ยนแปลงการตรวจสอบไฟล์ที่จำเป็นตามเหตุผลและสถานะการ Return Form
 */
$(document).on(
    'change',
    'input[name="NREASON_ESTIMATE_PRICE"]',
    async function () {
        try {
            const value = $(this).val();
            handleReqFile(+value, isReturn);
        } catch (error) {
            console.error(error);
            showErrorMessage(error.message);
        }
    },
);

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
        // disable form elements during the request/action process
        const disabledElementsForm = (flag = true) => {
            $('#form-price-approval')
                .find('input, button, select, textarea')
                .prop('disabled', flag);
            $('#btnRequest').find('textarea, button').prop('disabled', flag);
        };
        try {
            showLoader();
            let res;
            let redirect = true;
            let reload = false;
            const params = getUrlParams();
            const form = getFormByUrlParam();
            const val = $(this).val();

            // ตรวจสอบไฟล์ที่จำเป็นตามเหตุผลและสถานะการ Return Form
            handleReqFile(
                +$('input[name="NREASON_ESTIMATE_PRICE"]:checked').val(),
                isReturn,
            );
            // กรณีเป็น draft หรือ save ให้ตรวจสอบว่า REQBY ถูกกรอกหรือไม่
            if (val === 'draft' || val === 'save') {
                if ($('#REQBY').val() === '') {
                    showMessage(
                        'REQBY is required for draft or save actions',
                        'warning',
                    );
                    return;
                }
            }
            // กรณีที่ไม่ใช่ draft หรือ save ให้ตรวจสอบความถูกต้องของฟอร์ม
            else if (
                !(await requiredForm('#form-price-approval')) &&
                (val === 'request' || val === 'approve')
            ) {
                return;
            }
            if (
                ['draft', 'save', 'request'].includes(val) ||
                (val === 'approve' && isReturn)
            ) {
                const formData = setFormData();

                disabledElementsForm();

                switch (val) {
                    case 'draft':
                        formData.set('isDraft', true);
                        formData.set('DRAFT', '0');
                        break;
                    case 'save':
                        redirect = false;
                        reload = true;
                        formData.set('isSave', true);
                        Object.keys(form).forEach((key) => {
                            formData.set(key, form[key]);
                        });
                        break;
                    case 'approve':
                        formData.set('isReturn', true);
                        Object.keys(form).forEach((key) => {
                            formData.set(key, form[key]);
                        });
                        formData.set('EMPNO', params.EMPNO);
                        break;
                }
                res = await createPriceApproveForm(formData);
            } else {
                if (
                    val === 'return' ||
                    val === 'returnp' ||
                    val === 'returnb'
                ) {
                    const remark = $('#remark').val();
                    if (!remark) {
                        showMessage(
                            'Remark is required for return actions',
                            'warning',
                        );
                        return;
                    }
                }
                if (!params.EMPNO || val === '') {
                    throw new Error('Missing required EMPNO or action value');
                }

                res = await doaction({
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
            if (redirect) redirectWebflow();
            if (reload) window.location.reload();
        } catch (error) {
            console.error(error);
            disabledElementsForm(false);
            showErrorMessage(error.message);
        } finally {
            showLoader({ show: false });
        }
    },
);
