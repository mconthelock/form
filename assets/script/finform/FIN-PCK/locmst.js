import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { createTable } from '@amec/webasset/dataTable';
import { writeExcelTemp, exportExcel, readInput } from '@amec/webasset/excel';
import { getArrayBufferFile } from '@amec/webasset/file';
import { showLoader } from '@amec/webasset/preloader';
import {
    filterFormData,
    requiredForm,
    logFormData,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';
import ExcelJS from 'exceljs';
select2();
var tableLocMst, locmstdata;
let posdata, orgdata;
$(document).ready(async function () {
    locmstdata = await getLocMstData({});
    const columnLocMst = [
        {
            data: 'LOCCODE',
            title: 'Location Code',
            width: '100px',
            className: 'text-center',
        },
        { data: 'LOCNAME', title: 'Location Name' },
        {
            data: 'INC.EMPINFO.SNAME',
            title: 'Person in Charge',
            defaultContent: '-',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (row.INC && row.INC.EMPINFO) {
                    const emp = row.INC.EMPINFO;
                    return `${emp.SEMPNO} - ${emp.SEMPPRE} ${emp.SNAME}`;
                }
                return '-';
            },
        },
        { data: 'POS.SPOSNAME', title: 'Position' },
        { data: 'ORG.VNAME', title: 'Organization' },
        {
            data: null, // ใส่เป็น null เพราะปุ่มแก้ไขไม่ได้ผูกกับ data ตัวใดตัวหนึ่งโดยตรง
            title: 'Action',
            width: '80px',
            className: 'text-center',
            orderable: false, // ปิดการกดเรียงลำดับหัวตารางของคอลัมน์นี้
            render: function (data, type, row) {
                // ใช้ปุ่มสไตล์ DaisyUI/Tailwind สีเหลือง (warning) ขนาดเล็ก (btn-xs หรือ btn-sm)
                return `
                    <button type="button" class="btn btn-neutral btn-xs btn-edit-loc" data-id="${row.LOCCODE}" data-name ="${row.LOCNAME}" data-vorgno ="${row.VORGNO}" data-sposcode ="${row.SPOSCODE}"  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                    Edit
                </button>
            `;
            },
        },
    ];

    tableLocMst = await createTable(
        {
            data: locmstdata.data,
            columns: columnLocMst,
            // order: false
        },
        {
            id: '#tableLocMst',
            columnSelect: { status: false },
            domScroll: { status: true, maxHeight: '21rem', type: 'tailwind4' },
            join: true,
        },
    );
    const pos = await getPosition();
    posdata = pos.map((p) => ({
        value: p.SPOSCODE,
        text: p.SPOSNAME,
    }));
    const org = await getOrganize();
    orgdata = org.map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));
    positionManager.init(posdata);
    organizeManager.init(orgdata);

    $(document).on('click', '#btnExp', async function () {
        const res = await writeExcel(locmstdata.data);
    });

    $(document).on('click', '#btnImport', async function () {
        $('#modalImport')[0].showModal();
    });

    $(document).on('click', '#btnAdd', async function () {
        $('#formAddLocation').trigger('reset');
        $('#btnSaveLocation').data('action', 'add');
        $('#modalTitle').text('Add New Location');
        $('#POS_SELECT, #ORG_SELECT').val('').trigger('change');
        $('#modalAdd')[0].showModal();
    });

    $(document).on('click', '#btnSaveLocation', async function () {
        try {
            showLoader();
            if (!(await requiredForm('#formAddLocation'))) return;
            const formData = new FormData($('#formAddLocation')[0]);
            const filteredFormData = filterFormData(formData);
            const action = $(this).data('action');
            let res;
            if (action == 'add') {
                res = await createLoc(filteredFormData);
            } else {
                res = await updateLoc(filteredFormData);
            }

            if (res.status == true) {
                showMessage(res.message, 'success');
            } else if (res.status == false) {
                showMessage(res.message, 'error');
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            // console.error(err);
            showErrorMessage(err);
        } finally {
            showLoader({ show: false });
        }
    });

    $(document).on('click', '#uploadFile', async function () {
        if (!(await requiredForm('#formImportExcel'))) return;
        const fileInput = $('#excelFile')[0];
        const file = fileInput.files[0];
        const arrayBuffer = await file.arrayBuffer();
        try {
            showLoader();
            // โยนเข้าฟังก์ชันอ่านไฟล์ของคุณ
            const data = await readInput(arrayBuffer, {
                readDefault: true,
                startRow: 2,
            });

            const getOrgCode = (excelName) => {
                const found = orgdata.find((o) => o.text === excelName);
                return found ? found.value : '';
            };

            const getPosCode = (excelName) => {
                const found = posdata.find((o) => o.text === excelName);
                return found ? found.value : '';
            };

            const dataloc = data
                .map((row) => {
                    const excelOrgName = String(row[4] || '').trim();
                    const excelPosName = String(row[2] || '').trim();
                    return {
                        LOCCODE: String(row[0] || ''),
                        LOCNAME: String(row[1] || ''),
                        VORGNO: getOrgCode(excelOrgName), // ดึงรหัสจาก Global
                        SPOSCODE: getPosCode(excelPosName),
                    };
                })
                .filter((item) => item.LOCCODE !== '');
            console.log(dataloc);
            const res = await importLoc(dataloc);

            if (res.status == true) {
                showMessage(res.message, 'success');
                locmstdata = await getLocMstData({});
                tableLocMst.clear().rows.add(locmstdata.data).draw();
            } else if (res.status == false) {
                showMessage(res.message, 'error');
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            showErrorMessage(err);
        } finally {
            showLoader({ show: false });
        }
    });

    $(document).on('click', '.btn-edit-loc', async function () {
        $('#btnSaveLocation').data('action', 'edit');
        $('#modalTitle').text('Edit Location');
        const locCode = $(this).data('id');
        const locName = $(this).data('name');
        const posCode = $(this).data('sposcode');
        const vorgno = $(this).data('vorgno');
        $('input[name="LOCCODE"]')
            .val(locCode)
            .prop('readonly', true)
            .addClass('bg-base-200 cursor-not-allowed');
        $('input[name="LOCNAME"]').val(locName);
        $('#POS_SELECT').val(posCode).trigger('change');
        $('#ORG_SELECT').val(vorgno).trigger('change');

        $('#modalAdd')[0].showModal();
    });
});

export async function getLocMstData(filters = {}) {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/search`,
        method: 'GET',
        params: filters,
    });
}

export async function getPosition() {
    return fetchUtils({
        url: `${process.env.APP_API}/amec/pposition/filter`,
        method: 'GET',
    });
}

export async function getOrganize() {
    return fetchUtils({
        url: `${process.env.APP_API}/webform/vorgmst/findactive`,
        method: 'GET',
    });
}

export async function writeExcel(dataList) {
    var workbook = new ExcelJS.Workbook();
    const templatePath = `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE`;
    try {
        // const bfile = await getArrayBufferFile(templatePath, 'TEMPLOCMST.xlsx');
        const bfile = await getTemplate('TEMPLOCMST.xlsx');
        const workbook = await writeExcelTemp(bfile.buffer, {
            write: (wb) => {
                const sheet = wb.getWorksheet(1);
                const startRow = 2;

                dataList.forEach((item, index) => {
                    const currentRow = startRow + index;
                    sheet.getCell(`A${currentRow}`).value = item.LOCCODE;
                    sheet.getCell(`B${currentRow}`).value = item.LOCNAME;
                    sheet.getCell(`C${currentRow}`).dataValidation = {
                        type: 'list',
                        allowBlank: true,
                        formulae: ['POSITION!$B$2:$B$6'],
                    };
                    sheet.getCell(`C${currentRow}`).value = item.POS.SPOSNAME;
                    sheet.getCell(`E${currentRow}`).dataValidation = {
                        type: 'list',
                        allowBlank: true,
                        formulae: ['ORGANIZE!$B$2:$B$92'],
                    };
                    sheet.getCell(`E${currentRow}`).value = item.ORG.VNAME;
                });
            },
        });
        const d = new Date();
        const formatted = d
            .toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            })
            .replace(/\D/g, '');
        exportExcel(workbook, `LOCMST_${formatted}`);
    } catch (error) {
        console.error('Error reading excel template on NAS server:', error);
        throw new Error('can not open file');
    }
}

export const getTemplate = async (filename) => {
    const data = {
        path: `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE/${filename}`,
        name: filename,
    };
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/files/template/read/`,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (res) {
                const binaryData = atob(res.content);
                const buffer = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                    buffer[i] = binaryData.charCodeAt(i);
                }
                res.buffer = buffer;
                resolve(res);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
};

export const positionManager = {
    list: ['POS_SELECT'],
    get select() {
        return $('.pos');
    },
    set text(val) {
        $('.pos').text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger('change');
            $(`#${id}_HIDDEN`).val(val);
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: 'sm',
                placeholder: 'Select Position',
                search: false,
                clear: false,
                width: '60%',
                emptyValue: false,
                dropdownParent: $('#modalAdd'),
            });
            $(`#${id}`).on('change', function () {
                $(`#${id}_HIDDEN`).val($(this).val());
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$('#' + id).is(element)) {
                $('#' + id)
                    .val(value.toUpperCase())
                    .trigger('change');
                $(`#${id}_HIDDEN`).val(value.toUpperCase());
            }
        }
    },
};

export const organizeManager = {
    list: ['ORG_SELECT'],
    get select() {
        return $('.org');
    },
    set text(val) {
        $('.org').text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger('change');
            $(`#${id}_HIDDEN`).val(val);
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: 'sm',
                placeholder: 'Select Organize',
                search: true,
                clear: false,
                width: '60%',
                emptyValue: false,
                dropdownParent: $('#modalAdd'),
            });
            $(`#${id}`).on('change', function () {
                $(`#${id}_HIDDEN`).val($(this).val());
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$('#' + id).is(element)) {
                $('#' + id)
                    .val(value.toUpperCase())
                    .trigger('change');
                $(`#${id}_HIDDEN`).val(value.toUpperCase());
            }
        }
    },
};

export async function createLoc(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/create`,
        method: 'POST',
        data: formData,
    });
}

export async function importLoc(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/import`,
        method: 'POST',
        data: formData,
    });
}

export async function updateLoc(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/update`,
        method: 'POST',
        data: formData,
    });
}
