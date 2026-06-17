import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { createTable } from '@amec/webasset/dataTable';
import { writeExcelTemp, exportExcel } from '@amec/webasset/excel';
import { getArrayBufferFile } from '@amec/webasset/file';
import ExcelJS from 'exceljs';

var tableLocMst, locmstdata;
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

    $(document).on('click', '.locmstexp', async function () {
        const res = await writeExcel(locmstdata.data);
    });
});

export async function getLocMstData(filters = {}) {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/search`,
        method: 'GET',
        params: filters,
    });
}

export async function writeExcel(dataList) {
    var workbook = new ExcelJS.Workbook();
    const templatePath = `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE`;
    console.log(templatePath);
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
                });
            },
        });
        exportExcel(workbook, 'LOCMST_${timestamp}');
        // console.log('อ่านได้ค่ะ');

        // return workbook;
    } catch (error) {
        console.error('Error reading excel template on NAS server:', error);
        throw new Error(
            'ไม่สามารถเปิดอ่านไฟล์เทมเพลตจากระบบเซิร์ฟเวอร์ NAS ได้ กรุณาเช็คสิทธิ์การเข้าถึงพิกัดเครือข่ายค่ะ',
        );
    }
}

export const getTemplate = async (filename) => {
    // path: `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE`,
    const data = {
        path: `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE/${filename}`,
        name: filename,
    };
    console.log(data.path);

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
