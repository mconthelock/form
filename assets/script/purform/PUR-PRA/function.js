import { getUser, getUserImage } from '@amec/webasset/api/amec';
import {
    getUrlParams,
    removeClassError,
    showMessage,
} from '@amec/webasset/utils';
import { getPdfViewer, PdfViewer } from '@amec/webasset/components/pdfViewer';
import {
    FileUpload,
    getFileUploadInstance,
} from '@amec/webasset/components/fileUpload';
import { getK850mpData } from '../PUR-CPC/data';
import { tableComparison } from '../PUR-CPC/table/table-comparison';
import { getCommittee, getFormPriceApprove, getGroup, getVendor } from './data';
import { checkReturn, getFormDetail } from '@amec/webasset/api/webform';
import { ChangeReason, getReasons } from './reason';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { webflowSubmit } from '@amec/webasset/components/form';
import { dragDropInit, dragDropListImage } from '@amec/webasset/dragdrop';
import { ShowFile } from '@amec/webasset/components/showFile';
import { modalSelectPriceComparison } from './modal/select-price-comparison';
import { fancybox } from '@amec/webasset/fancybox';
import { getFile } from '@amec/webasset/api/file';
import { EmployeeProfileCard } from '@amec/webasset/components/profileCard';
import { formatDate } from '@amec/webasset/dayjs';

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description ตรวจสอบว่า Planner มีอยู่ในระบบหรือไม่
 * @param {string} empno
 * @returns
 */
export async function checkPlanner(empno) {
    const k850mpData = await getK850mpData();
    const k850mpRecord = k850mpData.data.filter(
        (record) => record.K85M03 === empno,
    );
    if (k850mpRecord.length === 0) {
        showMessage('Planner not found', 'warning');
        return false;
    }
    const empnoData = await getUser(empno);
    if (!empnoData) {
        showMessage('User not found', 'warning');
        return false;
    }
    return true;
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-01
 * @description ดึง field ที่ต้องกรอกอัตโนมัติจากฟอร์ม Price Comparison
 * @returns
 */
const getAutoField = () => {
    return {
        formComparison: $('#PRICE_COMPARE_NO'),
        vendor: $('#VVENDOR'),
        vendorName: $('#VVENDOR_NAME'),
        planner: $('#VPLANNER'),
        totalPresent: $('#NTOTAL_PRES'),
        totalNew: $('#NTOTAL_NEW'),
        totalCost: $('#NTOTAL_COST'),
        totalRatio: $('#NTOTAL_RATIO'),
    };
};

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-01
 * @description ตั้งค่า field ที่ต้องกรอกอัตโนมัติจากฟอร์ม Price Comparison
 * แก้ไขสถานะของฟิลด์ตามโหมด (mode)
 * @param {{data: Object, mode: number}} param0
 */
export const setAutoField = ({
    data,
    mode = 1,
    trigger = true,
    removeError = true,
} = {}) => {
    const autoField = getAutoField();
    const priceCompareFile = $('#price-compare-file-fieldset');
    const priceCompareInput = $('#price-compare-input-fieldset');
    const input = $('#PRICE_COMPARE_NO');
    const file = $('#PRICE_COMPARE_FILE');
    $(`input[name="NMODE"][value="${mode}"]`).prop('checked', true);

    input.toggleClass('req', mode === 1);
    file.toggleClass('req', mode !== 1);
    priceCompareFile.toggleClass('hidden', mode === 1);
    priceCompareInput.toggleClass('hidden', mode !== 1);
    tableComparison.destroy();
    if (mode === 1) {
        getPdfViewer('price-compare-container')?.reset();
        getFileUploadInstance('PRICE_COMPARE_FILE')?.reset();
    }
    Object.keys(autoField).forEach((key) => {
        const label = autoField[key].closest('label');
        const element = label.length ? label : autoField[key];
        autoField[key].prop('readonly', mode === 1);
        autoField[key].val(data?.[key] || '');
        if (removeError) removeClassError(autoField[key]);
        if (trigger) autoField[key].trigger('blur');
        if (mode == 1) {
            element.addClass('bg-amber-50');
        } else {
            if (key === 'vendorName') return;
            element.removeClass('bg-amber-50');
        }
    });
};

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-02
 * @description ตรวจสอบว่ามี Vendor อยู่ในระบบหรือไม่
 * @param {string} vendor  รหัส Vendor ที่ต้องการตรวจสอบ
 * @returns {Promise<{status: boolean, data?: Object}|false>} ผลลัพธ์การตรวจสอบ Vendor
 */
export async function checkVendor(vendor) {
    const vendors = await getVendor(vendor);
    if (!vendors || vendors.length === 0) {
        showMessage('No vendor data found', 'warning');
        return false;
    }
    return { status: true, data: vendors[0] };
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-05
 * @description โหลดข้อมูลคณะกรรมการและแสดงใน container สามารถส่งค่า committeeId เพื่อกำหนดค่าเริ่มต้นได้
 * @param {number} committeeId
 * @returns {Promise<void>}
 */
export const committees = async function (committeeId) {
    const container = $('#committee-container');
    if (!container.length) throw new Error('Committee container not found');
    const committees = await getCommittee();
    if (!committees.status) throw new Error('Failed to fetch committees');
    container.html(
        committees.data
            .map((val) => {
                return `
                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 has-checked:border-primary has-checked:bg-primary/5">
                    <input type="radio" name="NCOMMITTEE" value="${val.NID}" class="radio radio-sm radio-primary req" ${val.NID === committeeId ? 'checked' : ''} data-message="Please select a committee">
                    <span class="label-text">${val.VCODE}: ${val.VNAME}</span>
                </label>
            `;
            })
            .join(''),
    );
};

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-05
 * @description โหลดข้อมูลกลุ่มและแสดงใน container สามารถส่งค่า groupId เพื่อกำหนดค่าเริ่มต้นได้
 * @param {number} groupId
 * @returns {Promise<void>}
 */
export const groups = async function (groupId) {
    const container = $('#group-container');
    if (!container.length) throw new Error('Group container not found');
    const groups = await getGroup();
    if (!groups.status) throw new Error('Failed to fetch groups');
    container.html(
        groups.data
            .map((val) => {
                return `
                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                    <input type="radio" name="NGROUP" value="${val.NID}" class="radio radio-sm radio-primary req" ${val.NID === groupId ? 'checked' : ''} data-message="Please select a group">
                    <span class="label-text">${val.VNAME}</span>
                </label>
            `;
            })
            .join(''),
    );
};

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-13
 * @description ดึงข้อมูลฟอร์มจากพารามิเตอร์ใน URL
 * @returns {Object} ข้อมูลฟอร์มที่ถูกดึงจาก URL
 */
export function getFormByUrlParam() {
    const params = getUrlParams();
    const form = {
        NFRMNO: params.NFRMNO,
        VORGNO: params.VORGNO,
        CYEAR: params.CYEAR,
        CYEAR2: params.CYEAR2,
        NRUNNO: params.NRUNNO,
    };
    for (const key in form) {
        if (form[key] === undefined || form[key] === null) {
            throw new Error(`Missing required form field: ${key}`);
        }
    }
    return form;
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-13
 * @description ตั้งค่าฟอร์มตามค่าที่ส่งเข้ามา
 */
export async function setForm({
    inputer,
    requester,
    committee = '',
    group = '',
    eftMonth = [],
} = {}) {
    if (inputer) {
        $('#INPUTBY').val(inputer);
    }
    if (requester) {
        $('#REQBY').val(requester).prop('readonly', true);
    }
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
        inputAttributes: {
            name: 'PRICE_COMPARE_FILE',
            'data-message': 'Please select a Comparison PDF file',
        },
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
    committees(committee);
    // เรียกใช้งานฟังก์ชันเพื่อโหลดข้อมูลกลุ่ม
    groups(group);
    // เรียกใช้งานฟังก์ชันเพื่อสร้างส่วนของเหตุผลการเปลี่ยนแปลง (Change Reason)
    await initReason();
    // ตั้งค่า Date Picker สำหรับฟิลด์ Effective Month
    setDatePicker({
        element: '#VEFT_MONTH',
        mode: 'month',
        range: true,
        dateFormat: "M'y",
        defaultDate: eftMonth,
        // onChange: function (selectedDates, dateStr, instance) {
        //     console.log(dateStr);
        //     console.log(formatDate(selectedDates[0]));
        //     console.log(selectedDates);
        // },
    });
    // สร้างส่วนของ Drag & Drop สำหรับไฟล์แนบ
    $('#drop-image').append(
        dragDropInit({
            id: 'IMAGE_DETAIL',
            name: 'IMAGE_DETAIL',
            format: 'image',
            showImg: true,
            text: 'Drag & Drop Image here or click to select',
        }),
    );
    $('#drop-quotation').append(
        dragDropInit({
            id: 'FILE_QUOTATION',
            name: 'FILE_QUOTATION',
            format: 'pdf',
            text: 'Drag & Drop PDF files here or click to select',
        }),
    );
    $('#drop-additional').append(
        dragDropInit({
            id: 'FILE_ADDITIONAL',
            name: 'FILE_ADDITIONAL',
            format: 'pdf',
            text: 'Drag & Drop PDF files here or click to select',
        }),
    );
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-16
 * @description ฟังก์ชันเพื่อสร้างส่วนของเหตุผลการเปลี่ยนแปลง (Change Reason)
 */
async function initReason(readonly = false) {
    await ChangeReason.create({
        containerId: 'reason-cost-down-container',
        name: 'NREASON_COST_DOWN',
        type: 'down',
        halfColumn: true,
        readonly: readonly,
    });
    await ChangeReason.create({
        containerId: 'reason-cost-up-container',
        name: 'NREASON_COST_UP',
        type: 'up',
        halfColumn: true,
        readonly: readonly,
    });
    await ChangeReason.create({
        containerId: 'reason-basic-condition-container',
        name: 'NREASON_BASIC_CONDITION',
        type: 'basic',
        readonly: readonly,
    });
    await ChangeReason.create({
        containerId: 'reason-estimate-price-container',
        name: 'NREASON_ESTIMATE_PRICE',
        type: 'estimate',
        readonly: readonly,
    });
}

var priceComparisonForms = null;
export const getComparisonForm = () => priceComparisonForms;

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-13
 * @description ตรวจสอบว่าฟอร์มเป็นการ Return หรือไม่ หากใช่ จะตั้งค่าฟอร์มตามข้อมูลที่ดึงมา
 * @returns {Promise<boolean>} สถานะการคืน (Return) ของฟอร์ม
 */
export async function setReturn() {
    // ดึงพารามิเตอร์จาก URL
    const params = getUrlParams();
    // หากไม่มี NRUNNO ในพารามิเตอร์ แสดงว่าฟอร์มไม่ใช่การ Return
    if (!params.NRUNNO) return false;
    // ดึงข้อมูลฟอร์มตามพารามิเตอร์ใน URL
    const form = getFormByUrlParam();

    // ตรวจสอบว่าฟอร์มเป็นการ Return หรือไม่
    const isReturn = await checkReturn({
        ...form,
        EMPNO: params.EMPNO,
    });
    if (!isReturn) {
        return false;
    }
    // หากฟอร์มเป็นการ Return ให้ดึงข้อมูลฟอร์มเพื่อใช้ในการตั้งค่าฟิลด์ต่าง ๆ
    const formData = await getFormPriceApprove(form);
    if (!formData.status) {
        throw new Error(formData.message);
    }
    const data = formData.data;
    // ตั้งค่าข้อมูลบัตรพนักงาน (Employee Profile Card) สำหรับผู้ขอและผู้กรอกฟอร์ม
    await setEmpCard(data.FORM.VREQNO, data.FORM.VINPUTER);

    // ตรวจสอบว่าประเภทการเปลี่ยนแปลงเป็น "Others" หรือไม่ หากใช่ ให้แสดงช่องกรอกข้อมูลเพิ่มเติม (VEFT_TYPE_OTHER)
    if (data.VEFT_TYPE === 'Others') {
        $('#VEFT_TYPE_OTHER')
            .removeClass('hidden')
            .prop('disabled', false)
            .val(data.VEFT_TYPE_OTHER || '');
    }
    // ตรวจสอบว่ามีฟอร์มที่ลิงก์มาหรือไม่ (LINK_FORM)
    if (data.LINK_FORM) {
        priceComparisonForms = data.LINK_FORM.CNO;
        const vendor = await checkVendor(data.VVENDOR);
        if (!vendor.status) {
            throw new Error('Vendor Name not found');
        }
        const comparisonData = {
            formComparison: priceComparisonForms,
            vendor: data.VVENDOR,
            vendorName: vendor.data.VNDNAM,
            planner: data.VPLANNER,
            totalPresent: data.NTOTAL_PRES,
            totalNew: data.NTOTAL_NEW,
            totalCost: data.NTOTAL_COST,
            totalRatio: data.NTOTAL_RATIO,
        };
        // ตั้งค่าฟิลด์อัตโนมัติด้วยข้อมูลจากการเปรียบเทียบ
        setAutoField({
            mode: data.NMODE,
            trigger: false,
            data: comparisonData,
        });

        // แสดงตารางการเปรียบเทียบหลังจากตั้งค่าฟิลด์อัตโนมัติ
        await tableComparison.init({
            formNo: priceComparisonForms,
            function: data.NMODE,
        });
    } else {
        // หากไม่มีฟอร์มที่ลิงก์มา ให้ตั้งค่าฟิลด์อัตโนมัติด้วยโหมดปัจจุบันเท่านั้น
        setAutoField({ mode: data.NMODE, trigger: false });
    }

    // ตั้งค่าฟิลด์ของฟอร์มตามข้อมูลที่ดึงมา
    Object.keys(data).forEach((key) => {
        if (typeof data?.[key] === 'object' || Array.isArray(data?.[key]))
            return;
        $(`#${key}`).val(data?.[key] || '');
    });
    // ตั้งค่าฟิลด์ (VEFT_TYPE)
    $(`input[name="VEFT_TYPE"][value="${data.VEFT_TYPE}"]`).prop(
        'checked',
        true,
    );

    // ตั้งค่าฟอร์มด้วยข้อมูลจากฟอร์มที่ดึงมา
    await setForm({
        inputer: data.FORM.VINPUTER,
        requester: data.FORM.VREQNO,
        committee: data.COMMITTEE?.NID,
        group: data.GROUP?.NID,
        eftMonth: [data.DEFT_MONTH_END, data.DEFT_MONTH_START].filter(Boolean),
    });

    // ตรวจสอบว่ามีไฟล์ image detail หรือไม่ หากมีให้ตั้งค่าไฟล์ด้วยฟังก์ชัน setFiles
    if (data.FILES.length > 0) {
        await setFiles({ files: data.FILES, fromDB: true, btnDel: true });
    }

    // ตั้งค่าฟิลด์เหตุผล (Reasons) ด้วยข้อมูลจากฟอร์มที่ดึงมา
    getReasons('reason-cost-down-container').setValue(data.REASONS);
    getReasons('reason-cost-up-container').setValue(data.REASONS);
    getReasons('reason-basic-condition-container').setValue(data.REASONS);
    getReasons('reason-estimate-price-container').setValue(data.REASONS);
    // สร้างปุ่ม สำหรับ request form
    $('#btnRequest').html(
        await webflowSubmit({
            save: true,
            approve: true,
            reject: true,
            form: form,
        }),
    );
    return true;
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-15
 * @description ตั้งค่าไฟล์สำหรับฟอร์ม Price Approval
 * @param {Array} files รายการไฟล์ที่จะตั้งค่า
 * @param {boolean} fromDB ระบุว่าข้อมูลมาจากฐานข้อมูลหรือไม่
 * @param {boolean} btnDel ระบุว่าจะแสดงปุ่มลบไฟล์หรือไม่
 * @example
 * const files = [
 *     {
 *         TYPE: { VCODE: 'PURPRA_DTL' },
 *         FILE_ID: '1',
 *         FILE_PATH: '/path/to/file',
 *         FILE_FNAME: 'file.jpg',
 *         FILE_ONAME: 'file.jpg',
 *     }
 * ];
 * await setFiles({ files, fromDB: true, btnDel: true });
 */
async function setFiles({ files, fromDB = false, btnDel = false } = {}) {
    const comparisonFiles = files.filter(
        (file) => file.TYPE.VCODE === 'PURPRA_PCP',
    );
    const images = files.filter((file) => file.TYPE.VCODE === 'PURPRA_DTL');
    const quotations = files.filter((file) => file.TYPE.VCODE === 'PURPRA_QUO');
    const additionals = files.filter(
        (file) => file.TYPE.VCODE === 'PURPRA_ADT',
    );
    let imageHtml = '';
    if (images.length > 0) {
        for (const image of images) {
            imageHtml += await dragDropListImage({
                attr: `data-id="${image.FILE_ID}"`,
                fromDB: fromDB,
                remove: btnDel,
                fileInfo: {
                    baseDir: image.FILE_PATH,
                    storedName: image.FILE_FNAME,
                    originalName: image.FILE_ONAME,
                },
            });
        }
        $('#drop-image').append(`
            <div class="w-full rounded border bg-base-100 overflow-auto">
                <ul class="flex flex-wrap w-full items-start text-gray-500 gap-5 p-5">
                    ${imageHtml}
                </ul>
            </div>`);
        fancybox();
    }
    if (comparisonFiles.length > 0) {
        const file = await getFile({
            baseDir: comparisonFiles[0].FILE_PATH,
            storedName: comparisonFiles[0].FILE_FNAME,
            originalName: comparisonFiles[0].FILE_ONAME,
            mode: 'download',
        });
        getPdfViewer('price-compare-container').setViewer(file);
    }
    if (quotations.length > 0) {
        new ShowFile({
            containerId: 'drop-quotation',
            lists: quotations.map((file) => ({
                id: file.FILE_ID,
                baseDir: file.FILE_PATH,
                storedName: file.FILE_FNAME,
                originalName: file.FILE_ONAME,
            })),
            btnDel: btnDel,
        });
    }

    if (additionals.length > 0) {
        new ShowFile({
            containerId: 'drop-additional',
            lists: additionals.map((file) => ({
                id: file.FILE_ID,
                baseDir: file.FILE_PATH,
                storedName: file.FILE_FNAME,
                originalName: file.FILE_ONAME,
            })),
            btnDel: btnDel,
        });
    }
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-15
 * @description Sets the employee profile cards for the requester and inputer.
 * @param {string} req - Requester's employee number
 * @param {string} inputer - Inputer's employee number
 */
async function setEmpCard(req, inputer) {
    const inputerData = await getUser(inputer);
    const inputerImage = await getUserImage(inputer);
    const requester = await getUser(req);
    const requesterImage = await getUserImage(req);
    new EmployeeProfileCard({
        container: '#inputer-fieldset',
        name: inputerData.SNAME,
        empno: inputer,
        position: inputerData.SPOSITION,
        sec: inputerData.SSEC || '-',
        dept: inputerData.SDEPT || '-',
        image: inputerImage,
        title: 'Inputer',
    });
    new EmployeeProfileCard({
        container: '#requester-fieldset',
        name: requester.SNAME,
        empno: req,
        position: requester.SPOSITION,
        sec: requester.SSEC || '-',
        dept: requester.SDEPT || '-',
        image: requesterImage,
        title: 'Requester',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-16
 * @description Sets the content
 * @param {string} t
 * @returns {void}
 */
export function setContent(t) {
    if (t == 'view') {
        $('#view-form').removeClass('hidden');
        $('#create-form').empty();
        return;
    }
    $('#view-form').empty();
    $('#create-form').removeClass('hidden');
}

export async function setView() {
    // ดึงพารามิเตอร์จาก URL
    const params = getUrlParams();
    // หากไม่มี NRUNNO ในพารามิเตอร์ แสดงว่าฟอร์มไม่ใช่การ Return
    if (!params.NRUNNO) throw new Error('NRUNNO is required');

    // แสดงฟอร์มในโหมดดู (view mode)
    setContent('view');

    // ดึงข้อมูลฟอร์มตามพารามิเตอร์ใน URL
    const form = getFormByUrlParam();

    // หากฟอร์มเป็นการ Return ให้ดึงข้อมูลฟอร์มเพื่อใช้ในการตั้งค่าฟิลด์ต่าง ๆ
    const formData = await getFormPriceApprove(form);
    if (!formData.status) {
        throw new Error(formData.message);
    }
    const data = formData.data;
    const formDetail = await getFormDetail(form);
    // แสดง Request no
    $('#req-form').text(formDetail.FORMNO);

    // ตั้งค่าข้อมูลบัตรพนักงาน (Employee Profile Card) สำหรับผู้ขอและผู้กรอกฟอร์ม
    await setEmpCard(data.FORM.VREQNO, data.FORM.VINPUTER);

    if (data.NMODE === 0) {
        // สร้าง instance ของ PdfViewer และ FileUpload สำหรับไฟล์ Price Comparison
        new PdfViewer({
            containerId: 'price-compare-container',
            iframeId: 'price-compare-iframe',
        });
    }
    // ตั้งค่าไฟล์ที่เกี่ยวข้องกับฟอร์ม
    setFiles({ files: data.FILES });

    // ตรวจสอบว่ามีฟอร์มที่ลิงก์มาหรือไม่ (LINK_FORM)
    if (data.LINK_FORM) {
        // แสดงตารางการเปรียบเทียบหลังจากตั้งค่าฟิลด์อัตโนมัติ
        await tableComparison.init({
            formNo: data.LINK_FORM.CNO,
            function: data.NMODE,
        });
    }

    // ตรวจสอบและตั้งค่าข้อมูล Vendor
    const vendor = await checkVendor(data.VVENDOR);
    if (!vendor.status) {
        throw new Error('Vendor Name not found');
    }
    data.VVENDOR_NAME = vendor.data.VNDNAM;

    // เพิ่มข้อมูลตาม fieald
    Object.keys(data).forEach((key) => {
        if (typeof data?.[key] === 'object' || Array.isArray(data?.[key]))
            return;
        const element = $(`#${key}`);
        if (element.length) {
            element.text(data?.[key] === 0 ? '0' : data?.[key] || '-');
        }
    });

    $('#committee').html(
        data.COMMITTEE
            ? `<span class="badge badge-soft badge-info">${data.COMMITTEE.VCODE}: ${data.COMMITTEE.VNAME}</span>`
            : '-',
    );
    $('#group').html(
        data.GROUP
            ? `<span class="badge badge-soft badge-info">${data.GROUP.VNAME}</span>`
            : '-',
    );
    $('#EFT_MONTH').text(
        data.DEFT_MONTH_END && data.DEFT_MONTH_START
            ? `${formatDate(data.DEFT_MONTH_START, "MMM'YY")} - ${formatDate(data.DEFT_MONTH_END, "MMM'YY")}`
            : '-',
    );
    if (data.VEFT_TYPE_OTHER) {
        $('#VEFT_TYPE_OTHER').removeClass('hidden');
    }
    await initReason();

    // ตั้งค่าฟิลด์เหตุผล (Reasons) ด้วยข้อมูลจากฟอร์มที่ดึงมา
    getReasons('reason-cost-down-container').setValue(data.REASONS, true);
    getReasons('reason-cost-up-container').setValue(data.REASONS, true);
    getReasons('reason-basic-condition-container').setValue(data.REASONS, true);
    getReasons('reason-estimate-price-container').setValue(data.REASONS, true);

    // สร้างปุ่ม สำหรับ request form
    $('#btnRequest').html(
        await webflowSubmit({
            approve: true,
            reject: true,
            return: true,
            form: form,
        }),
    );
}
