import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { checkFileFormat, fileExcelFormat } from '@amec/webasset/file';
import { colToNumber, readInput } from '@amec/webasset/excel';
import { getItemDetail, getPriceComparison, getVendors } from './data';
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
            try {
                showLoader();
                tableComparison.init(); // เคลียร์ตารางก่อนเลือกไฟล์ใหม่
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
                if ((await self.checkFileData(data)) === false) {
                    return;
                }

                const size = (file.size / 1024 / 1024).toFixed(2);
                self.selectFileName.html(`
                ${file.name}
                <span class="text-base-content/50">(${size} MB)</span>
            `);
            } catch (error) {
                console.error(error);
                showErrorMessage(error.message);
            } finally {
                showLoader({ show: false });
            }
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
                const mode = steps.compareMode;
                // โหมด Edit จะใช้ item เดียวกันเปรียบเทียบ
                // โหมด Add จะใช้ item เก่าเปรียบเทียบหาก user กรอกมา
                const oldItems = data
                    .map((row) =>
                        mode == 'E' ? row.VITEM_CODE : row.VOLD_ITEM_COMPARE,
                    )
                    .filter(Boolean);
                const newItems = data.map((row) => row.VITEM_CODE);
                let newData = [];
                let oldData = [];

                // Edit เอา oldItems ไปหา priceComparison และเอา ค่ามาใส่ new ด้วย
                if (oldItems.length > 0) {
                    const res = await getPriceComparison({
                        FUNC: steps.function,
                        ITEM: oldItems,
                        SYSTEM: steps.system,
                    });
                    if (res.length === 0) {
                        showMessage(
                            'No price comparison data found',
                            'warning',
                        );
                        return;
                    }
                    oldData = res;
                    newData = res.map((row) => ({
                        VNEWITEM_CODE: row.VITEM_CODE,
                        VNEWJOB_ITEMNO: row.VJOB_ITEMNO,
                        VNEWSPEC: row.VSPEC,
                        VNEWMATERIAL_CODE: row.VMATERIAL_CODE,
                        VNEWDRAWING: row.VDRAWING,
                        VNEWPART_NAME: row.VPART_NAME,
                        VNEW_VENDOR: row.VPRES_VENDOR,
                        VNEW_VENDOR_NAME: row.VPRES_VENDOR_NAME,
                        VNEW_MAKER: row.VPRES_MAKER,
                    }));
                }
                // Edit เอา newItems ไปหา detail และเอา ค่ามาใส่ new ด้วย
                if (mode == 'A') {
                    const item = await getItemDetail({
                        SYSTEM: steps.system,
                        ITEM: newItems,
                    });
                    if (item.length === 0) {
                        showMessage('New Item not found in IIM', 'error');
                        return;
                    }
                    newData = item.map((row) => {
                        const newItem = {
                            VNEWITEM_CODE: row.ITEM_CODE,
                            VNEWJOB_ITEMNO: row.JOB_ITEMNO,
                            VNEWSPEC: row.SPEC,
                            VNEWMATERIAL_CODE: row.MATERIAL_CODE,
                            VNEWDRAWING: row.DRAWING,
                            VNEWPART_NAME: row.PART_NAME,
                            VNEW_VENDOR: row.VENDOR,
                            VNEW_VENDOR_NAME: row.VENDOR_NAME,
                            VNEW_MAKER: row.MAKER,
                        };
                        // หากไม่มี oldItems ให้เติมค่า default ให้ newItem
                        if (oldItems.length === 0) {
                            return {
                                VJOB_ITEMNO: null,
                                VPART_NAME: null,
                                VDRAWING: null,
                                VITEM_CODE: null,
                                VSPEC: null,
                                VMATERIAL_CODE: null,
                                NQUANTITY_YEAR: 0,
                                VPRES_VENDOR: null,
                                VPRES_VENDOR_NAME: null,
                                VPRES_MAKER: null,
                                NPRES_BASE_PRICE: 0,
                                VPRES_BASE_CURR: null,
                                NPRES_BASE_CURRENCY: 0,
                                NPRES_PRICE: 0,
                                VPRES_PRICE_CURR: null,
                                NPRES_PRICE_CURRENCY: 0,
                                BASE_CURRENCY: null,
                                NPRES_PRICE_ETA_AMEC: 0,
                                ...newItem,
                            };
                        }
                        return newItem;
                    });
                }
                const mapData = data.map((row) => {
                    // หา old data ที่ตรงกับ row ปัจจุบันก่อน
                    const matched = oldData.find(
                        (r) =>
                            r.VITEM_CODE ===
                            (mode == 'E'
                                ? row.VITEM_CODE
                                : row.VOLD_ITEM_COMPARE),
                    );
                    // หา new data ที่ตรงกับ row ปัจจุบันก่อน
                    if (newData.length > 0) {
                        const newItem = newData.find(
                            (n) => n.VNEWITEM_CODE === row.VITEM_CODE,
                        );
                        if (newItem) {
                            Object.assign(row, {
                                ...newItem,
                                VNEW_VENDOR:
                                    row.VNEW_VENDOR || newItem.VNEW_VENDOR,
                                VNEW_MAKER:
                                    row.VNEW_MAKER || newItem.VNEW_MAKER,
                            });
                        }
                    }
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
    async checkFileData(data) {
        const fail = (message) => {
            showMessage(message, 'warning');
            this.reset();
            return false;
        };
        const rules = [
            {
                fail: () => data.length === 0,
                message: 'The selected Excel file is empty',
            },
            {
                fail: () => data.some((row) => !row.NFUNCTIONS),
                message:
                    'The uploaded data exceeds the number of assigned functions.',
            },
            {
                fail: () =>
                    data.some((row) => row.NFUNCTIONS != steps.function),
                message:
                    'The selected Excel file contains rows with a different function',
            },
            {
                fail: () =>
                    data.some((row) => row.VPRES_VENDOR != steps.vendor),
                message:
                    'The selected Excel file contains rows with a different vendor',
            },
            {
                fail: () => data.some((row) => row.CMODE != steps.compareMode),
                message:
                    'The selected Excel file contains rows with a different mode',
            },
            {
                // Edit mode: ไม่ต้องกรอก old item compare
                fail: () =>
                    steps.compareMode === 'E' &&
                    data.some((row) => row.VOLD_ITEM_COMPARE),
                message:
                    'The selected Excel file contains rows with an old item compare',
            },
        ];

        const failed = rules.find((rule) => rule.fail());
        if (failed) {
            return fail(failed.message);
        }

        // ตรวจสอบว่า new vendor มีในระบบไหม
        const newVendors = data.map((row) => row.VNEW_VENDOR).filter(Boolean);
        if (newVendors.length > 0) {
            const vendors = await getVendors();
            if (!vendors || vendors.length === 0) {
                return fail('No vendor data found in the system');
            }
            const vendorCodes = new Set(vendors.map((v) => v.VENDOR));
            const notFoundVendors = newVendors.filter(
                (v) => !vendorCodes.has(v),
            );
            console.log('Not found vendors:', notFoundVendors);
            if (notFoundVendors.length > 0) {
                return fail(
                    'Some new vendors could not be found in the system: ' +
                        notFoundVendors.join(', '),
                );
            }
        }
        if (steps.compareMode != 'A') return true;
        // Add mode
        const filters = data.filter((row) => row.VOLD_ITEM_COMPARE);
        // ตรวจสอบว่ามีการกรอก old item compare หรือไม่
        // กรอกบางแถวแต่ไม่ครบ → ไม่ผ่าน
        if (filters.length > 0 && filters.length < data.length) {
            return fail(
                'The selected Excel file contains rows with an old item compare but not all rows have it',
            );
        }
        // ตรวจสอบว่า old item compare ทั้งหมดมีอยู่ในฐานข้อมูลหรือไม่
        if (filters.length > 0) {
            const oldItems = filters.map((row) => row.VOLD_ITEM_COMPARE);
            const item = await getItemDetail({
                SYSTEM: steps.system,
                ITEM: oldItems,
            });
            // ไม่พบ old item compare ในฐานข้อมูล
            if (item.length === 0) {
                return fail('Old items could not be found in the database');
            }
            const found = item.map((item) => item.ITEM_CODE);
            const foundSet = new Set(found);

            const notFound = oldItems.filter((id) => !foundSet.has(id));
            // ไม่พบ old item compare บางรายการในฐานข้อมูล
            if (notFound.length > 0) {
                return fail(
                    'Some old items could not be found in the database',
                );
            }
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
