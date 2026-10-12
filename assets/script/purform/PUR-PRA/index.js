import {
    getUrlParams,
    logFormData,
    renderLoadError,
    requiredForm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { showLoader } from '@amec/webasset/preloader';
import { PdfViewer } from '@amec/webasset/components/pdfViewer';
import { FileUpload } from '@amec/webasset/components/fileUpload';
import { webflowSubmit } from '@amec/webasset/components/form';
import { getFlatpickrDate, setDatePicker } from '@amec/webasset/flatpickr';
import { formatDate } from '@amec/webasset/dayjs';
import { dragDropInit, handleFiles } from '@amec/webasset/dragdrop';
import { tableDraft } from '../PUR-CPC/table/table-draft';
import { getListCreate, getPlanner } from './data';
import {
    checkPlanner,
    checkVendor,
    committees,
    groups,
    setAutoField,
} from './function';
import { modalSelectPriceComparison } from './modal/select-price-comparison';
import { ChangeReason, getReasons } from './reason';
import { redirectWebflow } from '@amec/webasset/form';

$(async function () {
    try {
        showLoader();
        const params = getUrlParams();
        const empno = params.EMPNO;
        if (!(await checkPlanner(empno))) {
            throw new Error('User not found');
        }
        $('#INPUTBY').val(empno);
        // ตั้งค่าโหมดฟอร์มเริ่มต้นเป็น 1
        setAutoField({ mode: 1, trigger: false });
        // สร้าง modal สำหรับเลือก Price Comparison
        modalSelectPriceComparison.init();
        // สร้าง instance ของ PdfViewer และ FileUpload สำหรับไฟล์ Price Comparison
        const pdfViewer = new PdfViewer({
            containerId: 'price-compare-container',
            iframeId: 'price-compare-iframe',
        });
        // สร้างช่องสำหรับอัปโหลดไฟล์ Price Comparison ที่ผู้ใช้สามารถเลือกไฟล์ PDF ได้และแสดงชื่อไฟล์ที่เลือกและตัวอย่างไฟล์ใน PDF Viewer
        new FileUpload({
            inputId: 'PRICE_COMPARE_FILE',
            selectFileNameId: 'price-compare-file-name',
            containerId: 'price-compare-file-container',
            type: 'pdf',
            resetText: 'Please select a PDF file',
            onChange(file, uploader) {
                pdfViewer.setViewer(file);
            },
            onError(file, uploader) {
                pdfViewer.reset();
            },
            buttons: [
                {
                    id: 'clear-file',
                    label: '<i class="fi fi-sr-trash"></i> Clear',
                    className: 'btn btn-error btn-outline btn-sm',
                    onClick: (file, instance, event) => {
                        instance.reset();
                        pdfViewer.reset();
                    },
                },
            ],
        });
        // เรียกใช้งานฟังก์ชันเพื่อโหลดข้อมูลคณะกรรมการและกลุ่ม
        committees();
        // เรียกใช้งานฟังก์ชันเพื่อโหลดข้อมูลกลุ่ม
        groups();
        ChangeReason.create({
            containerId: 'reason-cost-down-container',
            name: 'NREASON_COST_DOWN',
            type: 'down',
            halfColumn: true,
        });
        ChangeReason.create({
            containerId: 'reason-cost-up-container',
            name: 'NREASON_COST_UP',
            type: 'up',
            halfColumn: true,
        });
        ChangeReason.create({
            containerId: 'reason-basic-condition-container',
            name: 'NREASON_BASIC_CONDITION',
            type: 'basic',
        });
        ChangeReason.create({
            containerId: 'reason-estimate-price-container',
            name: 'NREASON_ESTIMATE_PRICE',
            type: 'estimate',
        });
        // ตั้งค่า Date Picker สำหรับฟิลด์ Effective Month
        setDatePicker({
            element: '#VEFT_MONTH',
            mode: 'month',
            range: true,
            dateFormat: "M'y",
            onChange: function (selectedDates, dateStr, instance) {
                console.log(dateStr);
                console.log(formatDate(selectedDates[0]));
                console.log(selectedDates);
            },
        });
        // สร้างปุ่ม สำหรับ request form
        $('#btnRequest').html(
            webflowSubmit({
                request: true,
                draft: true,
            }),
        );
        $('#drop-image').html(
            dragDropInit({
                id: 'IMAGE_DETAIL',
                name: 'IMAGE_DETAIL',
                format: 'image',
                showImg: true,
                text: 'Drag & Drop Image here or click to select',
            }),
        );
        $('#drop-quotation').html(
            dragDropInit({
                id: 'FILE_QUOTATION',
                name: 'FILE_QUOTATION',
                format: 'pdf',
                text: 'Drag & Drop PDF files here or click to select',
            }),
        );
        $('#drop-additional').html(
            dragDropInit({
                id: 'FILE_ADDITIONAL',
                name: 'FILE_ADDITIONAL',
                format: 'pdf',
                text: 'Drag & Drop PDF files here or click to select',
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
        const req = $('#REQBY').val();
        if (!req) {
            showMessage('Please enter the requester.', 'warning');
            return;
        }
        const lists = await getListCreate(req);
        if (!lists.status) {
            showMessage(`Price comparison not found for ${req}`, 'warning');
            return;
        }
        modalSelectPriceComparison.show(true);
        tableDraft.init(lists.data, 'table-select-price-comparison');
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
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

$(document).on(
    'click',
    'button[name="btnRequest"], button[name="btnAction"]',
    async function () {
        try {
            showLoader();
            const val = $(this).val();
            // if (!(await requiredForm('#form-price-approval'))) return;
            const formData = setFormData();
            let res;
            switch (val) {
                case 'draft':
                    break;
                case 'save':
                    break;
                case 'request':
                    return;
            }
            // // if (!res.status) {
            // //     throw new Error('Failed to create price approval.');
            // // }
            // showMessage('Price approval created successfully.', 'success');
            // redirectWebflow();
        } catch (error) {
            console.error(error);
            showErrorMessage(error.message);
        } finally {
            showLoader({ show: false });
        }
    },
);

function setFormData() {
    const formData = new FormData($('#form-price-approval')[0]);
    formData.set('DEFT_MONTH_START', getFlatpickrDate('#VEFT_MONTH', 0));
    formData.set('DEFT_MONTH_END', getFlatpickrDate('#VEFT_MONTH', 1));
    const costDown = getReasons('reason-cost-down-container').getValue();
    const costUp = getReasons('reason-cost-up-container').getValue();
    const basic = getReasons('reason-basic-condition-container').getValue();
    const estimate = getReasons('reason-estimate-price-container').getValue();
    formData.set('reson', JSON.stringify(costDown));

    // logFormData(formData);
    return formData;
}
