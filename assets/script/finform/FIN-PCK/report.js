import { writeExcelTemp, exportExcel, readInput } from '@amec/webasset/excel';
import { showLoader } from '@amec/webasset/preloader';
import { getTemplate } from './function';
import {
    filterFormData,
    requiredForm,
    logFormData,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import ExcelJS from 'exceljs';
import { getGrpmst, getRptDetail } from './data';

$(document).ready(async function () {
    let startYear = 2026;
    let curYear = new Date().getFullYear();
    for (let year = startYear; year <= curYear; year++) {
        $('#formYear').append($('<option></option>').val(year).html(year));
    }
    const grpmst = await getGrpmst();
    $.each(grpmst, function (index, item) {
        let optionText = item.GRPCODE + ' - ' + item.GRPDESC;
        $('#assetGroup').append(
            $('<option></option>').val(item.GRPCODE).html(optionText),
        );
    });

    $(document).on('click', '#btnExport', async function (e) {
        let reportType = $('input[name="reportType"]:checked').val();
        const formData = new FormData($('#frmmain')[0]);
        const filteredFormData = filterFormData(formData);

        if (reportType == 'detail') {
            //  console.log('ข้อมูลก่อนส่ง:', finalObject);
            let data = await getRptDetail(filteredFormData);
            console.log(data);
        }
    });
});

async function writeExcelDetail(dataList) {
    var workbook = new ExcelJS.Workbook();
    //const templatePath = `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE`;
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
