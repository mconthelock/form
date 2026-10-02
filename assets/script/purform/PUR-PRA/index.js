import {
    getUrlParams,
    renderLoadError,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { showLoader } from '@amec/webasset/preloader';
import { PdfViewer } from '@amec/webasset/components/pdfViewer';
import { FileUpload } from '@amec/webasset/components/fileUpload';
import { tableDraft } from '../PUR-CPC/table-draft';
import { getListCreate } from './data';
import { checkPlanner, setAutoField } from './function';
import { modalSelectPriceComparison } from './modal/select-price-comparison';

$(async function () {
    try {
        showLoader();
        const params = getUrlParams();
        const empno = params.EMPNO;
        if (!(await checkPlanner(empno))) {
            throw new Error('User not found');
        }
        $('#INPUTBY').val(empno);
        $('input[name="form-mode"][value="1"]').prop('checked', true);
        setAutoField({ mode: 1 });
        modalSelectPriceComparison.init();
        const pdfViewer = new PdfViewer({
            // inputId: 'PRICE_COMPARE_FILE',
            containerId: 'price-compare-container',
            iframeId: 'price-compare-iframe',
        });
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
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    } finally {
        showLoader({ show: false });
    }
});

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
$(document).on('change', 'input[name="form-mode"]', function () {
    try {
        const mode = $(this).val();
        setAutoField({ mode: +mode });
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});
