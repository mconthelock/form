import { writeExcelTemp, exportExcel, readInput } from '@amec/webasset/excel';
import { showLoader } from '@amec/webasset/preloader';
import { getTemplate } from './function';
import {
    filterFormData,
    requiredForm,
    logFormData,
    showErrorMessage,
    showMessage,
    setRound,
} from '@amec/webasset/utils';
import ExcelJS from 'exceljs';
import { getGrpmst, getRptDetail, getRptStatus } from './data';
import { formatDate } from '@amec/webasset/dayjs';
import { getFormno } from '@amec/webasset/api/webform';

$(document).ready(async function () {
    let startYear = 2026;
    let curYear = new Date().getFullYear();
    for (let year = startYear; year <= curYear; year++) {
        $('#formYear').append($('<option></option>').val(year).html(year));
    }
    $('#formYear').val(curYear);
    const grpmst = await getGrpmst();
    $.each(grpmst, function (index, item) {
        let optionText = item.GRPCODE + ' - ' + item.GRPDESC;
        $('#assetGroup').append(
            $('<option></option>').val(item.GRPCODE).html(optionText),
        );
    });

    $(document).on('click', '#btnExport', async function (e) {
        try {
            const requiredMessage = [
                {
                    element: $('#formYear'),
                    message: 'Please select the year of issue',
                },
            ].filter(Boolean);
            if (!(await requiredForm('#frmmain', requiredMessage))) return;
            let reportType = $('input[name="reportType"]:checked').val();
            const formData = new FormData($('#frmmain')[0]);
            const filteredFormData = filterFormData(formData);
            if (reportType == 'detail') {
                //  console.log('ข้อมูลก่อนส่ง:', finalObject);
                let data = await getRptDetail(filteredFormData);
                await writeExcelDetail(data);
            } else {
                let data = await getRptStatus(filteredFormData);
                // console.log(data);
                await writeExcelStatus(data);
            }
        } catch (err) {
            throw new Error(err);
        } finally {
            showLoader({ show: false });
        }
    });

    $(document).on('change', 'input[name="reportType"]', function () {
        const selectedValue = $(this).val();
        $('#assetGroup').prop('disabled', false);
        $('#assetNo').prop('disabled', false);
        if (selectedValue === 'status') {
            $('#assetGroup').prop('disabled', true);
            $('#assetNo').prop('disabled', true);
        }
    });
});

async function writeExcelDetail(dataList) {
    var workbook = new ExcelJS.Workbook();
    //const templatePath = `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE`;
    try {
        // const bfile = await getArrayBufferFile(templatePath, 'TEMPLOCMST.xlsx');
        const bfile = await getTemplate('TEMPRPTDETAIL.xlsx');
        const workbook = await writeExcelTemp(bfile.buffer, {
            write: (wb) => {
                const now = new Date();
                const sheet = wb.getWorksheet(1);
                sheet.getCell(`B3`).value = formatDate(now);
                const startRow = 6;

                dataList.forEach((item, index) => {
                    const currentRow = startRow + index;
                    sheet.getCell(`A${currentRow}`).value = item.GRPCODE;
                    sheet.getCell(`B${currentRow}`).value = item.GRPDESC;
                    sheet.getCell(`C${currentRow}`).value = item.CCCODE;
                    sheet.getCell(`D${currentRow}`).value = item.CCDESC;
                    sheet.getCell(`E${currentRow}`).value = item.LOCCODE;
                    sheet.getCell(`F${currentRow}`).value = item.LOCNAME;
                    sheet.getCell(`G${currentRow}`).value = item.ASSETNO;
                    sheet.getCell(`H${currentRow}`).value = item.ASSETDESC;
                    sheet.getCell(`I${currentRow}`).value = formatDate(
                        item.DOCDATE,
                    );
                    sheet.getCell(`J${currentRow}`).value = setRound(
                        item.INITVAL,
                        2,
                    );
                    sheet.getCell(`K${currentRow}`).value = formatDate(
                        item.STARTDP,
                    );
                    sheet.getCell(`L${currentRow}`).value = setRound(
                        item.MONTHDP,
                        2,
                    );
                    sheet.getCell(`M${currentRow}`).value = setRound(
                        item.YTDDP,
                        2,
                    );
                    sheet.getCell(`N${currentRow}`).value = setRound(
                        item.ACCUMDP,
                        2,
                    );
                    sheet.getCell(`O${currentRow}`).value = setRound(
                        item.BOOKVAL,
                        2,
                    );
                    sheet.getCell(`P${currentRow}`).value = item.INVNO;
                    sheet.getCell(`Q${currentRow}`).value = item.MODELNO;
                    sheet.getCell(`R${currentRow}`).value = item.SNNO;
                    sheet.getCell(`S${currentRow}`).value = item.PONO;
                    sheet.getCell(`T${currentRow}`).value = item.REFASSET;
                    sheet.getCell(`U${currentRow}`).value = item.VOUCHER;
                    sheet.getCell(`V${currentRow}`).value = item.QTY;
                    sheet.getCell(`W${currentRow}`).value = item.UNIT;
                    sheet.getCell(`X${currentRow}`).value = item.STATUS;
                    sheet.getCell(`Y${currentRow}`).value = item.SUPPLIER;
                    sheet.getCell(`Z${currentRow}`).value = item.PRNO;
                    sheet.getCell(`AA${currentRow}`).value = item.BUDGETNO;
                    sheet.getCell(`AB${currentRow}`).value = item.REQBY;
                    sheet.getCell(`AC${currentRow}`).value = item.USINGLIFE;
                    sheet.getCell(`AD${currentRow}`).value = item.CONFIRM;
                    sheet.getCell(`AE${currentRow}`).value = item.NOSTICKER;
                    sheet.getCell(`AF${currentRow}`).value = item.LOST;
                    sheet.getCell(`AG${currentRow}`).value = item.DAMAGE;
                    sheet.getCell(`AH${currentRow}`).value = item.MOVEMENT;
                    sheet.getCell(`AI${currentRow}`).value = item.OTHCAUSE;
                    sheet.getCell(`AJ${currentRow}`).value = item.REMOTHCAUSE;
                    sheet.getCell(`AK${currentRow}`).value = item.PIC;
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
        exportExcel(workbook, `PCKDETAIL_${formatted}`);
    } catch (error) {
        console.error('Error reading excel template on NAS server:', error);
        throw new Error('can not open file');
    }
}

async function writeExcelStatus(dataList) {
    try {
        const bfile = await getTemplate('TEMPRPTSTATUS.xlsx');
        const dataWithFormno = [];
        for (const item of dataList) {
            const formno = await getFormno({
                NFRMNO: item.NFRMNO,
                VORGNO: item.VORGNO,
                CYEAR: item.CYEAR,
                CYEAR2: item.CYEAR2,
                NRUNNO: item.NRUNNO,
            });
            dataWithFormno.push({ ...item, formno });
        }

        // 2. เรียกใช้ writeExcelTemp โดยใช้ข้อมูลที่เตรียมเสร็จแล้ว
        const workbook = await writeExcelTemp(bfile.buffer, {
            write: (wb) => {
                // ไม่จำเป็นต้องเป็น async แล้ว
                const now = new Date();
                const sheet = wb.getWorksheet(1);
                sheet.getCell(`B2`).value = formatDate(now);
                const startRow = 6;

                // 3. วนลูปข้อมูลที่เตรียมเสร็จแล้วเขียนลงเซลล์ได้เลย
                dataWithFormno.forEach((item, index) => {
                    const currentRow = startRow + index;
                    sheet.getCell(`A${currentRow}`).value = item.formno;
                    sheet.getCell(`B${currentRow}`).value = item.LOCCODE;
                    sheet.getCell(`C${currentRow}`).value = item.LOCNAME;
                    sheet.getCell(`D${currentRow}`).value = item.PICNOLOC;
                    sheet.getCell(`E${currentRow}`).value = item.PICNAMELOC;
                    sheet.getCell(`F${currentRow}`).value =
                        item.CST === 2 ? 'COMPLETE' : 'NOT COMPLETE';
                    sheet.getCell(`G${currentRow}`).value = item.PICNOWAIT;
                    sheet.getCell(`H${currentRow}`).value = item.PICNAMEWAIT;
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

        exportExcel(workbook, `PCKSTATUS_${formatted}`);
    } catch (error) {
        console.error('Error:', error);
        throw new Error('can not open file');
    }
}
