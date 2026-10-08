import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { checkFileFormat, fileExcelFormat } from '@amec/webasset/file';
import { colToNumber, readInput } from '@amec/webasset/excel';
import { getPriceComparison } from './data';
import { tableComparison } from './table/table-comparison';
import { steps } from './steps';
import { showLoader } from '@amec/webasset/preloader';

export const importExcel = {
    id: 'import-excel-container',
    get container() {
        return $(`#${this.id}`);
    },
    get selectFileName() {
        return $('#selected-file-name');
    },
    get input() {
        return $('#excel-file');
    },
    html: `
        <!-- Upload Area -->
        <div
            class="flex flex-wrap items-center gap-4 p-5 rounded-xl bg-base-200/50 border border-base-300">
            <div
                class="flex items-center justify-center w-12 h-12 rounded-lg bg-success/10 shrink-0">
                <i class="fi fi-sr-file-excel text-2xl text-success"></i>
            </div>

            <div class="flex-1 min-w-40">
                <div class="font-semibold">Excel File</div>
                <div id="selected-file-name" class="text-sm text-base-content/60 truncate">
                    Please select an Excel file
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 ms-auto">
                <label for="excel-file" class="btn btn-outline btn-sm cursor-pointer">
                    <i class="fi fi-sr-folder-open"></i>
                    Choose File
                </label>

                <button id="import-excel" class="btn btn-primary btn-sm" type="button">
                    <i class="fi fi-sr-file-upload"></i>
                    <span>Import & Map</span>
                </button>
            </div>

            <input type="file" id="excel-file" class="hidden" accept=".xlsx,.xls" />
        </div>`,
    init() {
        this.container.html(this.html);
        this.bindEvents();
    },
    reset() {
        this.input.val('');
        this.selectFileName.text('Please select an Excel file');
    },
    bindEvents() {
        const self = this;
        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-09-17
         * @description Handles the selection of an Excel file for upload.
         */
        $(document).on('change', '#excel-file', async function () {
            const file = this.files[0];
            if (!file) {
                self.reset();
                return;
            }
            if (
                !checkFileFormat(
                    self.input,
                    fileExcelFormat.extension,
                    fileExcelFormat.msgEn,
                )
            ) {
                return;
            }
            const data = await self.readExcelFile(file);
            if (self.checkFileData(data) === false) {
                return;
            }

            const size = (file.size / 1024 / 1024).toFixed(2);
            self.selectFileName.html(`
                ${file.name}
                <span class="text-base-content/50">(${size} MB)</span>
            `);
        });

        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-09-17
         * @description จัดการการนำเข้าไฟล์ Excel และอ่านข้อมูลจากไฟล์เพื่อใช้ map ข้อมูล
         */
        $(document).on('click', '#import-excel', async function () {
            try {
                showLoader();
                const file = self.input[0].files[0];
                if (!file) {
                    showMessage('Please select an Excel file', 'warning');
                    return;
                }
                const data = await self.readExcelFile(file);
                const itemCode = data.map((row) => row.VITEM_CODE);
                const res = await getPriceComparison({
                    FUNC: steps.function,
                    ITEM: itemCode,
                    SYSTEM: steps.system,
                });
                if (res.length === 0) {
                    showMessage('No price comparison data found', 'warning');
                    return;
                }
                const mapData = data.map((row) => {
                    const matched = res.find(
                        (r) => r.VITEM_CODE === row.VITEM_CODE,
                    );
                    return {
                        ...row,
                        ...matched,
                    };
                });
                tableComparison.init({ newData: mapData });
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
            } finally {
                showLoader({ show: false });
            }
        });
    },
    checkFileData(data) {
        if (data.length === 0) {
            this.reset();
            showMessage('The selected Excel file is empty', 'warning');
            return false;
        }

        // * ตรวจสอบข้อมูลในไฟล์ Excel ว่าตรงกับฟังก์ชันที่เลือกหรือไม่
        if (data.find((row) => row.NFUNCTIONS !== steps.function)) {
            showMessage(
                'The selected Excel file contains rows with a different function',
                'warning',
            );
            this.reset();
            return false;
        }
        // * ตรวจสอบข้อมูลในไฟล์ Excel ว่าตรงกับ vendor ที่เลือกหรือไม่
        if (data.find((row) => row.VPRES_VENDOR != steps.vendor)) {
            showMessage(
                'The selected Excel file contains rows with a different vendor',
                'warning',
            );
            this.reset();
            return false;
        }
        // * ตรวจสอบข้อมูลในไฟล์ Excel ว่าตรงกับ compare mode ที่เลือกหรือไม่
        if (data.find((row) => row.CMODE != steps.compareMode)) {
            showMessage(
                'The selected Excel file contains rows with a different mode',
                'warning',
            );
            this.reset();
            return false;
        }
        return true;
    },
    async readExcelFile(file) {
        return await readInput(file, {
            maxReadRow: 8000,
            startRow: 3,
            endCol: colToNumber('AI'),
            headerName: [
                { key: 'NFUNCTIONS', column: 'A' },
                { key: 'VNEW_VENDOR', column: 'B' },
                { key: 'VNEW_MAKER', column: 'C' },
                { key: 'CNEW_PRICE_YEAR', column: 'D' },
                { key: 'VNEW_PRICE_MONTH', column: 'E' },
                { key: 'VMODEL', column: 'F' },
                { key: 'VOLD_ITEM_COMPARE', column: 'G' },
                { key: 'VPLANNER', column: 'H' },
                { key: 'CMODE', column: 'I' },
                { key: 'VPRES_VENDOR', column: 'J' },
                { key: 'VITEM_CODE', column: 'K' },
                { key: 'VDRAWING', column: 'L' },
                { key: 'NQTY1', column: 'M' },
                { key: 'NQTY2', column: 'N' },
                { key: 'NQTY3', column: 'O' },
                { key: 'NQTY4', column: 'P' },
                { key: 'NQTY5', column: 'Q' },
                { key: 'NQTY6', column: 'R' },
                { key: 'NQTY7', column: 'S' },
                { key: 'NQTY8', column: 'T' },
                { key: 'NPRICE1', column: 'U' },
                { key: 'NPRICE2', column: 'V' },
                { key: 'NPRICE3', column: 'W' },
                { key: 'NPRICE4', column: 'X' },
                { key: 'NPRICE5', column: 'Y' },
                { key: 'NPRICE6', column: 'Z' },
                { key: 'NPRICE7', column: 'AA' },
                { key: 'NPRICE8', column: 'AB' },
                { key: 'VNEW_PRICE_CURR', column: 'AC' },
                { key: 'VQUOTATION_NO', column: 'AD' },
                { key: 'VNEW_BASE_CURR', column: 'AE' },
                { key: 'NNEW_BASE_PRICE', column: 'AF' },
                { key: 'VCOMMENT', column: 'AG' },
                { key: 'DQUOTATION_DATE', column: 'AH' },
                { key: 'DDIMAPV_DATE', column: 'AI' },
            ],
        });
    },
};
