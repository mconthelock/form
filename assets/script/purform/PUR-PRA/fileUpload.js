import { checkFileFormat, fileFormats } from '@amec/webasset/file';
import { showErrorMessage } from '@amec/webasset/utils';

const fileUploadInstances = new Map();

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-02
 * @description ดึง instance ของ FileUpload ตาม inputId ที่ระบุ
 * @param {string} inputId - ID ของ input element สำหรับอัปโหลดไฟล์
 * @returns {FileUpload} instance ของคลาส FileUpload
 */
export const getFileUploadInstance = (inputId) =>
    fileUploadInstances.get(inputId);

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-02
 * @description คลาสสำหรับจัดการการอัปโหลดไฟล์
 * @param {string} inputId - ID ของ input element สำหรับอัปโหลดไฟล์
 * @param {string} selectFileNameId - ID ของ element ที่จะแสดงชื่อไฟล์ที่เลือก
 * @param {string} containerId - ID ของ container element ที่จะเรนเดอร์ UI ของ FileUpload
 * @param {string} type - ประเภทของไฟล์ที่อนุญาต ได้แก่ pdf, excel, word, powerpoint, image หรือ all (สำหรับทุกประเภทไฟล์) นอกเหนือจากนี้จะถือว่าไม่รู้จักและการตรวจสอบไฟล์จะถูกปิด
 * @param {string} icon - ไอคอนที่จะแสดง (ถ้ามี)
 * @param {string} iconColor - สีของไอคอน (ถ้ามี)
 * @param {string} iconBackground - สีพื้นหลังของไอคอน (ถ้ามี)
 * @param {string} acceptType - ค่า MIME type ที่อนุญาตสำหรับ input element (เช่น 'application/pdf')
 * @param {string} resetText - ข้อความเริ่มต้นที่จะแสดงเมื่อยังไม่ได้เลือกไฟล์
 * @param {Array} buttons - อาร์เรย์ของปุ่มที่จะแสดงใน UI ของ FileUpload
 * @param {function} onChange - ฟังก์ชัน callback ที่จะถูกเรียกเมื่อมีการเปลี่ยนแปลงไฟล์
 * @param {function} onError - ฟังก์ชัน callback ที่จะถูกเรียกเมื่อเกิดข้อผิดพลาดในการอัปโหลดไฟล์
 * @returns {FileUpload} instance ของคลาส FileUpload
 * @example
 * const fileUpload = new FileUpload({
 *     inputId: 'PRICE_COMPARE_FILE',
 *     selectFileNameId: 'price-compare-file-name',
 *     containerId: 'price-compare-container',
 *     resetText: 'Please select a PDF file',
 *     type: 'pdf',
 *     buttons: [
 *         {
 *             id: 'clear-file',
 *             label: 'Clear',
 *             onClick: (file, instance, event) => {
 *                 instance.reset();
 *             },
 *         },
 *     ],
 *     onChange: (file, instance) => {
 *         console.log('File changed:', file);
 *     },
 *     onError: (file, instance) => {
 *         console.error('File upload error:', file);
 *     },
 * });
 */
export class FileUpload {
    constructor({
        inputId = null,
        selectFileNameId = null,
        containerId = null,
        type = 'all',
        icon = null,
        iconColor = null,
        iconBackground = null,
        acceptType = '*/*',
        resetText = null,
        buttons = [],
        onChange = null,
        onError = null,
    } = {}) {
        this.inputId = inputId;
        this.selectFileNameId = selectFileNameId;
        this.containerId = containerId;
        this.type = type;
        this.icon = icon;
        this.iconColor = iconColor;
        this.iconBackground = iconBackground;
        this.buttons = buttons;
        this.onChange = onChange;
        this.onError = onError;

        const format = fileFormats[this.type];
        if (this.type !== 'all' && format === undefined) {
            console.warn(
                `FileUpload: unknown type "${this.type}", file validation is disabled.`,
            );
        }
        this.acceptType = format?.extension.join(',') ?? acceptType;

        this.resetText =
            resetText ??
            `Please select a ${this.type !== 'all' ? this.type.toUpperCase() + ' ' : ''}file`;

        this.render();

        this.bindEvents();
        fileUploadInstances.set(this.inputId, this);
    }
    get input() {
        return document.getElementById(this.inputId);
    }

    get selectFileName() {
        return document.getElementById(this.selectFileNameId);
    }

    get container() {
        return document.getElementById(this.containerId);
    }

    render() {
        if (!this.container) {
            throw new Error(
                `FileUpload: container element "${this.containerId}" not found.`,
            );
        }
        const format = fileFormats[this.type];
        this.container.innerHTML = `
            <div class="flex flex-wrap items-center gap-4 p-5 rounded-xl bg-base-200/50 border border-base-300">
                <div class="flex items-center justify-center w-12 h-12 rounded-lg shrink-0" style="background-color: ${this.iconBackground ?? format?.background ?? ''};">
                    ${this.icon ?? `<i class="${format?.flatIcon ?? ''} text-2xl " style="color: ${this.iconColor ?? format?.color ?? ''};"></i>`}
                </div>
                <div class="flex-1 min-w-40">
                    <div class="font-semibold">${this.type != 'all' ? this.type.toUpperCase() : ''} File</div>
                    <div id="${this.selectFileNameId}" class="text-sm text-base-content/60 truncate">
                        ${this.resetText}
                    </div>
                </div>
                <div class="flex items-center gap-3 ms-auto">
                    <label for="${this.inputId}" class="btn btn-outline btn-sm cursor-pointer">
                        <i class="fi fi-sr-folder-open"></i>
                        Choose File
                    </label>
                    <div class="flex items-center gap-3 ms-auto" data-role="actions"></div>
                </div>
                <input type="file" id="${this.inputId}" class="hidden" accept="${this.acceptType}" />
            </div>
        `;
        const actionsContainer = this.container.querySelector(
            '[data-role="actions"]',
        );
        this.buttons.forEach((btn) => {
            const el = document.createElement('button');
            el.type = 'button';
            if (btn.id) el.id = btn.id;
            el.className = btn.className || 'btn btn-outline btn-sm';
            el.innerHTML = `${btn.label || ''}`;
            el.addEventListener('click', (event) => {
                if (typeof btn.onClick === 'function') {
                    btn.onClick(this.input.files[0], this, event);
                }
            });
            actionsContainer.appendChild(el);
        });
    }

    bindEvents() {
        this.input.addEventListener('change', (event) => {
            try {
                const file = event.target.files[0];
                if (!file) {
                    // User cancelled the file dialog; reset quietly without treating it as an error.
                    this.reset();
                    return;
                }
                if (
                    this.type !== 'all' &&
                    fileFormats[this.type] !== undefined &&
                    !checkFileFormat(
                        this.input,
                        fileFormats[this.type].extension,
                        fileFormats[this.type].msgEn,
                    )
                ) {
                    this.reset();
                    if (typeof this.onError === 'function') {
                        this.onError(file, this);
                    }
                    return;
                }
                const size = (file.size / 1024 / 1024).toFixed(2);
                this.selectFileName.textContent = `${file.name} (${size} MB)`;
                if (typeof this.onChange === 'function') {
                    this.onChange(file, this);
                }
            } catch (error) {
                console.error(error);
                this.reset();
                if (typeof this.onError === 'function') {
                    this.onError(event.target.files[0], this);
                }
                showErrorMessage(error.message);
                return;
            }
        });
    }
    reset() {
        this.input.value = '';
        this.selectFileName.textContent = this.resetText;
    }
}
