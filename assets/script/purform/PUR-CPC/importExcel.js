import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { checkFileFormat, fileExcelFormat } from '@amec/webasset/file';
import { colToNumber, readInput } from '@amec/webasset/excel';
import { getPriceComparison } from './data';
import { tableComparison } from './table-comparison';
import { steps } from './steps';

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
                const file = self.input[0].files[0];
                if (!file) {
                    showMessage('Please select an Excel file', 'warning');
                    return;
                }
                const data = await self.readExcelFile(file);
                const itemCode = data.map((row) => row.ITEM_CODE);
                const res = await getPriceComparison({
                    FUNC: steps.function,
                    ITEM: itemCode,
                });
                if (res.length === 0) {
                    showMessage('No price comparison data found', 'warning');
                    return;
                }
                const mapData = data.map((row) => {
                    const matched = res.find(
                        (r) => r.ITEM_CODE === row.ITEM_CODE,
                    );
                    return {
                        ...row,
                        ...matched,
                    };
                });
                console.log(mapData);
                tableComparison.init({ newData: mapData });
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
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
        if (data.find((row) => row.FUNCTION !== steps.function)) {
            showMessage(
                'The selected Excel file contains rows with a different function',
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
                { key: 'FUNCTION', column: 'A' },
                { key: 'NEW_VENDOR_NAME', column: 'B' },
                { key: 'NEW_MAKER_NAME', column: 'C' },
                { key: 'NEW_PRICE_YEAR', column: 'D' },
                { key: 'NEW_PRICE_MONTH', column: 'E' },
                { key: 'MODEL_NAME', column: 'F' },
                { key: 'OLD_ITEM_COMPARE', column: 'G' },
                { key: 'PLANNER', column: 'H' },
                { key: 'MODE', column: 'I' },
                { key: 'VENDOR_CODE', column: 'J' },
                { key: 'ITEM_CODE', column: 'K' },
                { key: 'DRAWING', column: 'L' },
                { key: 'QTY', column: 'M' },
                { key: 'QTY2', column: 'N' },
                { key: 'QTY3', column: 'O' },
                { key: 'QTY4', column: 'P' },
                { key: 'QTY5', column: 'Q' },
                { key: 'QTY6', column: 'R' },
                { key: 'QTY7', column: 'S' },
                { key: 'QTY8', column: 'T' },
                { key: 'NEW_PRICE', column: 'U' },
                { key: 'NEW_PRICE2', column: 'V' },
                { key: 'NEW_PRICE3', column: 'W' },
                { key: 'NEW_PRICE4', column: 'X' },
                { key: 'NEW_PRICE5', column: 'Y' },
                { key: 'NEW_PRICE6', column: 'Z' },
                { key: 'NEW_PRICE7', column: 'AA' },
                { key: 'NEW_PRICE8', column: 'AB' },
                { key: 'NEW_CURR', column: 'AC' },
                { key: 'QUOTATION_NO', column: 'AD' },
                { key: 'NEW_BASE_CURR', column: 'AE' },
                { key: 'NEW_BASE_PRICE', column: 'AF' },
                { key: 'COMMENT', column: 'AG' },
                { key: 'QUOTATION_DATE', column: 'AH' },
                { key: 'PUR_DIM_APV_DATE', column: 'AI' },
            ],
        });
    },
};
