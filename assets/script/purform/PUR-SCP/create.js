import { host } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { exportExcel, defaultExcel, mergeCell, applyStyleToRange, alignment, border, fill } from "@amec/webasset/excel";
import ExcelJS from "exceljs";
import Swal from "sweetalert2";
import { redirectWebflow } from "@amec/webasset/form";
import { createForm, getFormMasterByVaname } from "@amec/webasset/api/webform"

$(async function () {
    const formMst = await getFormMasterByVaname("PUR-SCP");
    const params = new URLSearchParams(window.location.search);
    const empno = params.get('empno');
    const nfrmno = formMst.NNO;
    const vorgno = formMst.VORGNO;
    const cyear = formMst.CYEAR;
    // console.log({ formMst, empno, nfrmno, vorgno, cyear });

    const data = await $.ajax({
        type: "GET",
        url: `${host}/purform/PUR-SCP/main/getDataPrice`,
        dataType: "json",
        success: function (response) {
            console.log(response);
        }
    });

    const pricePeriod = data.length > 0 ? `Y${data[0].FYEAR}/${data[0].PERIOD}F` : "";
    $(".old-price-period").text(pricePeriod);

    let nextYear = null;
    let nextPeriod = null;

    if (data.length > 0) {
        const fyear = parseInt(data[0].FYEAR);
        const period = parseInt(data[0].PERIOD);
        // Next period
        nextPeriod = period === 1 ? 2 : 1;
        nextYear = period === 1 ? fyear : fyear + 1;
        const dateRange = nextPeriod === 1
            ? `1 Jan'${nextYear} - 30 Jun'${nextYear}`
            : `1 Jul'${nextYear} - 31 Dec'${nextYear}`;
        $(".fyear").text(`AMEC Scrap Master (Y${nextYear}/${nextPeriod}F) ${dateRange}`);
        $(".new-price-period").text(`Y${nextYear}/${nextPeriod}F`);
        $(".new-period").text(`FY${nextYear}/${nextPeriod}F`);
    }

    if (data.length > 0) {
        $("#emptyState").addClass("hidden");
    } else {
        $("#emptyState").removeClass("hidden");
    }


    const table = await createTable({
        data: data,
        buttons: [
            {
                text: '<i class="icofont-file-excel"></i> Export Excel',
                attr: { class: "btn btn-success btn-sm" },
                action: async function (e, dt) {
                    const rows = dt.rows({ search: "applied" }).data().toArray();
                    const exportData = rows.map((row) => ({
                        ...row,
                        BOI: row.BOI === "1" ? "BOI" : "Non-BOI",
                        B_GUARANTEE: row.B_GUARANTEE === "1" ? "Yes" : "No",
                    }));
                    const winnerCols = [6, 7, 10]; // New Vendor, New Price
                    const workbook = await defaultExcel({
                        data: exportData,
                        sheetName: "Price Data",
                        column: [
                            { key: "SCRAP_ID", header: "Scrap ID" },
                            { key: "SCRAP_NAME", header: "Scrap Name" },
                            { key: "QUOTATION", header: "Quotation" },
                            { key: "VENDOR", header: "Old Vendor" },
                            { key: "PRICE", header: "Price" },
                            { key: "_NEW_VENDOR", header: "New Vendor" },
                            { key: "_NEW_PRICE", header: "New Price", type: "number" },
                            { key: "UNIT", header: "Unit" },
                            { key: "BOI", header: "BOI" },
                            { key: "_EFFECTIVE_DATE", header: "Effective Date", type: "date" },
                            { key: "B_GUARANTEE", header: "Guarantee" },
                        ],
                        manual: true,
                        manualActions: (sheet) => {
                            sheet.eachRow((row, rowNum) => {
                                row.eachCell({ includeEmpty: true }, (cell, colNum) => {
                                    const isWinner = winnerCols.includes(colNum);
                                    if (rowNum === 1) {
                                        cell.fill = fill(isWinner ? "FFFFFF00" : "FF1F497D");
                                        cell.font = { bold: true, color: { argb: isWinner ? "FF000000" : "FFFFFFFF" } };
                                        cell.border = border("thin");
                                        cell.alignment = alignment("center", "middle");
                                    } else {
                                        if (isWinner) cell.fill = fill("FFFFFF00");
                                        cell.border = border("thin");
                                    }
                                });
                            });
                        },
                    });
                    exportExcel(workbook, "PriceData");
                },
            }
        ],
        dom: '<"flex mb-3 items-center gap-2"<"flex items-center gap-2"fB><"ml-auto"l>><"bg-white border border-slate-700 rounded-2xl overflow-hidden my-5"t><"flex mt-5"<"flex-1"p><"flex-none"i>>',
        columns: [
            { data: "SCRAP_ID" },
            { data: "SCRAP_NAME" },
            { data: "QUOTATION", className: "text-center" },
            { data: "VENDOR" },
            { data: "PRICE" },
            { data: null, className: "bg-amber-100", render: function (data, type, row) { return row._NEW_VENDOR || ''; } },
            { data: null, className: "bg-amber-100", render: function (data, type, row) { return row._NEW_PRICE != null ? row._NEW_PRICE : ''; } },
            { data: "UNIT" },
            { data: "BOI", render: function (data, type, row) { return data === '1' ? 'BOI' : 'Non-BOI'; } },
            { data: null, className: "bg-amber-100", render: function (data, type, row) { return row._EFFECTIVE_DATE || ''; } },
            { data: "B_GUARANTEE", render: function (data, type, row) { return data === '1' ? 'Yes' : 'No'; } },
        ]
    }, {
        id: "price_table"
    });

    // ---- Upload Excel → preview in table ----
    $("#saveFile").on("click", async function (e) {
        e.preventDefault();

        const file = $("#uploadExcel")[0].files[0];
        if (!file) {
            Swal.fire({ icon: 'warning', title: 'กรุณาเลือกไฟล์ Excel', timer: 1500 });
            return;
        }

        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const sheet = workbook.worksheets[0];
        const excelMap = {};

        // Column layout (1-based, matches exported format):
        // 1=Scrap ID, 2=Scrap Name, 3=Quotation, 4=Old Vendor, 5=Price,
        // 6=New Vendor, 7=New Price, 8=Unit, 9=BOI, 10=Effective Date, 11=Guarantee
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber <= 1) return; // skip 2 header rows
            const scrapId = row.getCell(1).value;
            if (!scrapId) return;

            const rawDate = row.getCell(10).value;
            let effectiveDate = '';
            if (rawDate instanceof Date) {
                effectiveDate = rawDate.toISOString().slice(0, 10);
            } else if (rawDate) {
                effectiveDate = String(rawDate);
            }

            const rawPrice = row.getCell(7).value;
            excelMap[String(scrapId).trim()] = {
                _NEW_VENDOR: row.getCell(6).value ?? '',
                _NEW_PRICE: rawPrice != null && rawPrice !== '' ? parseFloat(rawPrice).toFixed(2) : '',
                _EFFECTIVE_DATE: effectiveDate,
            };
        });

        let updated = 0;
        table.rows().every(function () {
            const rowData = this.data();
            const match = excelMap[String(rowData.SCRAP_ID).trim()];
            if (match) {
                rowData._NEW_VENDOR = match._NEW_VENDOR;
                rowData._NEW_PRICE = match._NEW_PRICE;
                rowData._EFFECTIVE_DATE = match._EFFECTIVE_DATE;
                this.data(rowData);
                updated++;
            }
        });
        table.draw(false);

        $("#btnSaveToDb").removeClass("hidden");
        Swal.fire({ icon: 'success', title: `โหลดข้อมูลแล้ว ${updated} รายการ`, text: 'ตรวจสอบข้อมูลแล้วกด Save', timer: 2000 });
    });

    // ---- Save winner data to database ----
    $("#btnSaveToDb").on("click", async function () {
        const rows = table.rows().data().toArray().filter(r => r._NEW_VENDOR || r._NEW_PRICE);
        if (!rows.length) {
            Swal.fire({ icon: 'warning', title: 'ไม่มีข้อมูล New Vendor / New Price', timer: 1500 });
            return;
        }

        const form = {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            REQBY: empno,
            INPUTBY: empno,
            REMARK: "",
        }
        const result = await createForm(form);

        console.log(result);

        const confirm = await Swal.fire({
            icon: 'question',
            title: 'ยืนยันการบันทึก?',
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
        });
        if (!confirm.isConfirmed) return;

        try {
            const res = await $.ajax({
                type: "POST",
                url: `${host}/purform/PUR-SCP/main/saveWinner`,
                contentType: "application/json",
                data: JSON.stringify({ fyear: nextYear, period: nextPeriod, rows, nrunno: result.data.NRUNNO, cyear2: result.data.CYEAR2 }),
                dataType: "json",
            });
            Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500 });
            $("#btnSaveToDb").addClass("hidden");
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.responseText || 'Save failed' });
        }
    });

});