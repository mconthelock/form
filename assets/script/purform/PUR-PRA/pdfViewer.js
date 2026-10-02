import { checkFileFormat, filePdfFormat } from '@amec/webasset/file';
import { showErrorMessage } from '@amec/webasset/utils';

const viewers = new Map();

/**
 * @description ดึง instance ของ PdfViewer ที่ผูกกับ input ตาม id ที่กำหนด
 * @param {string} inputId
 * @returns {PdfViewer|undefined}
 * @author Sutthipong Tungmongkhoncharoen(24008)
 * @since 2026-10-02
 * @model Kimi K3
 * @description ดึง instance ของ PdfViewer ที่ผูกกับ input ตาม id ที่กำหนด
 * @returns {PdfViewer|undefined} instance ของ PdfViewer ที่ผูกกับ input ตาม id ที่กำหนด
 * @example
 * const pdfViewer = getPdfViewer('PRICE_COMPARE_FILE');
 * console.log(pdfViewer);
 * //* ใช้งาน instance ของ PdfViewer ที่ดึงมาจาก getPdfViewer
 * //* ตัวอย่างการใช้งานอื่น ๆ ของ PdfViewer สามารถเรียกใช้ผ่าน pdfViewer instance ได้
 * //* รีเซ็ตสถานะของ PdfViewer กลับไปยังค่าเริ่มต้น
 * pdfViewer.reset();
 * //* แสดง PDF ใน iframe โดยใช้ไฟล์ที่เลือก
 * pdfViewer.setViewer(file);
 *
 */
export const getPdfViewer = (inputId) => viewers.get(inputId);

/**
 * @author Sutthipong Tungmongkhoncharoen(24008)
 * @since 2026-10-02
 * @model Kimi K3
 * @description แสดง PDF ผ่าน iframe
 * @param {string} inputId ID ของ input type="file" ที่จะใช้เลือกไฟล์ PDF
 * @param {string} containerId ID ของ container ที่จะใช้แสดง iframe
 * @param {string} iframeId ID ของ iframe ที่จะแสดง PDF
 * @param {string} width ความกว้างของ iframe
 * @param {string} height ความสูงของ iframe
 * @example
 * const pdfViewer = new PdfViewer({
 *     inputId: 'PRICE_COMPARE_FILE',
 *     containerId: 'price-compare-container',
 *     iframeId: 'price-compare-iframe',
 *     width: '100%',
 *     height: '800px',
 * });
 * //* แสดง PDF ใน iframe เมื่อเลือกไฟล์ PDF จาก input
 * pdfViewer.input.addEventListener('change', (event) => {
 *     const file = event.target.files[0];
 *     pdfViewer.setViewer(file);
 * });
 */
export class PdfViewer {
    constructor({
        inputId = null,
        containerId = null,
        iframeId = null,
        width = '100%',
        height = '800px',
    } = {}) {
        this.inputId = inputId;
        this.containerId = containerId;
        this.iframeId = iframeId;
        this.iframeWidth = width;
        this.iframeHeight = height;

        const iframe = `
        <iframe
            id="${this.iframeId}"
            style="width: ${this.iframeWidth}; height: ${this.iframeHeight};"
        >
        </iframe>`;
        this.container.innerHTML = iframe;

        viewers.set(inputId, this);
        this.reset();
        this.bindEvents();
    }
    get input() {
        return document.getElementById(this.inputId);
    }

    get iframe() {
        return document.getElementById(this.iframeId);
    }

    get container() {
        return document.getElementById(this.containerId);
    }

    reset() {
        this.input.value = '';
        this.iframe.src = '';
        this.container.hidden = true;
    }

    setViewer(file) {
        console.log(this.input);
        if (
            !file ||
            !checkFileFormat(
                this.input,
                filePdfFormat.extension,
                filePdfFormat.msgEn,
            )
        ) {
            this.reset();
            return;
        }
        const fileURL = URL.createObjectURL(file);
        this.iframe.src = fileURL;
        this.container.hidden = false;
    }

    bindEvents() {
        const self = this;
        $(document).on('change', `#${self.inputId}`, function () {
            try {
                const file = this.files[0];
                self.setViewer(file);
            } catch (error) {
                console.error(error);
                self.reset();
                showErrorMessage(error.message);
                return;
            }
        });
    }
}
