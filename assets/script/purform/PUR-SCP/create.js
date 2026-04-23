import { host } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { exportExcel, defaultExcel, mergeCell, applyStyleToRange, alignment, border, fill } from "@amec/webasset/excel";
import ExcelJS from "exceljs";
import Swal from "sweetalert2";
import { redirectWebflow } from "@amec/webasset/form";
import { createForm, getFormMasterByVaname } from "@amec/webasset/api/webform"

$(async function () {
    const $loadingSkeleton = $("#loadingSkeleton");
    const $tableWrapper = $("#tableWrapper");
    const $emptyState = $("#emptyState");

    const setLoadingState = (isLoading) => {
        $loadingSkeleton.toggleClass("hidden", !isLoading);
        $tableWrapper.toggleClass("hidden", isLoading);
    };

    setLoadingState(true);

    const params = new URLSearchParams(window.location.search);
    const empno = params.get('empno');
    let formMst;
    let data = [];

    try {
        formMst = await getFormMasterByVaname("PUR-SCB");

        data = await $.ajax({
            type: "GET",
            url: `${host}/purform/PUR-SCP/main/getDataPrice`,
            dataType: "json",
            success: function (response) {
                console.log(response);
            }
        });
    } catch (error) {
        console.error("Failed to load PUR-SCP create data", error);
        $emptyState.removeClass("hidden");
        setLoadingState(false);
        return;
    }

    const nfrmno = formMst.NNO;
    const vorgno = formMst.VORGNO;
    const cyear = formMst.CYEAR;
    // console.log({ formMst, empno, nfrmno, vorgno, cyear });

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
        $emptyState.addClass("hidden");
    } else {
        $emptyState.removeClass("hidden");
    }

    // Tag all rows as 'update' by default (toggled by quotation filter)
    data = data.map(row => ({ ...row, _UPDATE_TYPE: 'update' }));

    const table = await createTable({
        data: data,
        buttons: [
            {
                text: '<i class="icofont-file-excel"></i> Export Excel',
                attr: { class: "btn btn-success btn-sm" },
                action: async function (e, dt) {
                    const rows = dt.rows({ search: "applied" }).data().toArray();
                    const exportData = rows.filter(row => row._UPDATE_TYPE !== 'carry-over').map((row) => ({
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
            // {
            //     data: "_UPDATE_TYPE", className: "text-center", render: function (data) {
            //         return data === 'carry-over'
            //             ? '<span class="badge badge-ghost badge-sm">Carry Over</span>'
            //             : '<span class="badge badge-warning badge-sm">Update</span>';
            //     }
            // },
        ],

    }, {
        id: "price_table"
    });

    setLoadingState(false);

    // Hide carry-over rows from view
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        if (settings.nTable.id !== 'price_table') return true;
        const rowData = table.row(dataIndex).data();
        return rowData._UPDATE_TYPE !== 'carry-over';
    });
    table.draw(false);

    // ---- Bank Guarantee Amount ----
    let bgVendors = []; // only vendors explicitly added by user
    const bgAmounts = {};

    function getUniqueNewVendors() {
        const vendors = new Set();
        table.rows().every(function () {
            const d = this.data();
            if (d._NEW_VENDOR && String(d._NEW_VENDOR).trim() && d._UPDATE_TYPE === 'update') {
                vendors.add(String(d._NEW_VENDOR).trim());
            }
        });
        return [...vendors].sort();
    }

    function renderBankGuaranteeTable() {
        const $headerRow = $("#bgVendorHeaderRow");
        const $amountRow = $("#bgAmountInputRow");

        $headerRow.find('.bg-vendor-th').remove();
        $amountRow.find('.bg-vendor-td').remove();

        if (bgVendors.length === 0) {
            $("#bgEmptyMsg").removeClass("hidden");
            return;
        }
        $("#bgEmptyMsg").addClass("hidden");

        bgVendors.forEach(vendorName => {
            const currentAmount = bgAmounts[vendorName] ?? '';

            $headerRow.append(
                `<th class="bg-vendor-th text-center bg-primary/15 text-primary whitespace-nowrap">
                    ${vendorName}
                    <button class="btn btn-ghost btn-xs text-error p-0 ml-1 remove-bg-vendor" data-vendor="${vendorName}"><i class="icofont-close-circled"></i></button>
                </th>`
            );
            $amountRow.append(
                `<td class="bg-vendor-td text-center p-1">
                    <input type="number" class="input input-bordered input-sm w-36 text-right font-semibold bg-amber-50 bg-guarantee-input"
                        placeholder="0.00" step="0.01" min="0"
                        data-vendor="${vendorName}"
                        value="${currentAmount}">
                </td>`
            );
        });
    }

    $(document).on('input', '.bg-guarantee-input', function () {
        const vendor = $(this).data('vendor');
        bgAmounts[vendor] = $(this).val();
    });

    $(document).on('click', '.remove-bg-vendor', function () {
        const vendor = $(this).data('vendor');
        bgVendors = bgVendors.filter(v => v !== vendor);
        delete bgAmounts[vendor];
        renderBankGuaranteeTable();
    });

    $("#btnAddBgVendor").on("click", function () {
        const tableVendors = getUniqueNewVendors().filter(v => !bgVendors.includes(v));
        const hasTableVendors = tableVendors.length > 0;

        const selectOptions = hasTableVendors
            ? tableVendors.map(v => `<option value="${v}">${v}</option>`).join('')
            : '';

        Swal.fire({
            title: 'Add Bank Guarantee Vendor',
            html: `
                <div class="flex flex-col gap-3 text-left">
                    ${hasTableVendors ? `
                    <div>
                        <label class="block text-sm font-medium mb-1">เลือกจาก New Vendor ในตาราง</label>
                        <select id="swal-bg-select" class="swal2-input w-full mt-0 border">
                            <option value="">-- เลือก vendor --</option>
                            ${selectOptions}
                        </select>
                    </div>
                    <div class="divider text-xs my-0">หรือ</div>
                    ` : ''}
                    <div>
                        <label class="block text-sm font-medium mb-1">กรอกชื่อ Vendor เอง (manual)</label>
                        <input id="swal-bg-manual" class="swal2-input w-full mt-0" placeholder="Enter vendor name...">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Add',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const selected = document.getElementById('swal-bg-select')?.value?.trim() ?? '';
                const manual = document.getElementById('swal-bg-manual')?.value?.trim() ?? '';
                const name = (manual || selected).toUpperCase();
                if (!name) {
                    Swal.showValidationMessage('กรุณาเลือก vendor หรือกรอกชื่อ');
                    return false;
                }
                return name;
            }
        }).then(result => {
            if (result.isConfirmed && result.value) {
                if (!bgVendors.includes(result.value)) {
                    bgVendors.push(result.value);
                    bgVendors.sort();
                }
                renderBankGuaranteeTable();
            }
        });
    });

    renderBankGuaranteeTable();

    // ---- Quotation Filter ----
    function getSelectedQuotations() {
        return $(".qfilter:checked").map((_, el) => el.value).get();
    }

    function refreshUpdateSummary() {
        let updateCount = 0, carryCount = 0;
        table.rows().every(function () {
            const d = this.data();
            if (d._UPDATE_TYPE === 'update') updateCount++;
            else carryCount++;
        });
        $("#updateSummary").text(`${updateCount} update · ${carryCount} carry-over`).removeClass('hidden');
    }

    function applyUpdateType() {
        const selected = new Set(getSelectedQuotations());
        table.rows().every(function () {
            const d = this.data();
            d._UPDATE_TYPE = (selected.size === 0 || selected.has(d.QUOTATION)) ? 'update' : 'carry-over';
            this.data(d);
        });
        table.draw(false);
        refreshUpdateSummary();
    }

    const quotations = [...new Set(data.map(r => r.QUOTATION).filter(Boolean))].sort();
    if (quotations.length > 0) {
        const $filterContainer = $("#quotationCheckboxes");
        $filterContainer.empty();
        quotations.forEach(q => {
            $filterContainer.append(`
                <label class="flex items-center gap-1.5 cursor-pointer select-none">
                    <input type="checkbox" class="checkbox checkbox-sm checkbox-primary qfilter" value="${q}">
                    <span class="badge badge-outline font-semibold">${q}</span>
                </label>
            `);
        });
        $("#quotationFilterCard").removeClass("hidden");
        refreshUpdateSummary();
    }

    $(document).on('change', '.qfilter', applyUpdateType);

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
            if (match && rowData._UPDATE_TYPE === 'update') {
                rowData._NEW_VENDOR = match._NEW_VENDOR;
                rowData._NEW_PRICE = match._NEW_PRICE;
                rowData._EFFECTIVE_DATE = match._EFFECTIVE_DATE;
                this.data(rowData);
                updated++;
            }
        });
        table.draw(false);

        $("#saveFooter").removeClass("hidden");
        Swal.fire({ icon: 'success', title: `โหลดข้อมูลแล้ว ${updated} รายการ`, text: 'ตรวจสอบข้อมูลแล้วกด Save', timer: 2000 });
    });

    // ---- Save winner data to database ----
    $("#btnSaveToDb").on("click", async function () {
        const selectedQuotations = getSelectedQuotations();
        const rows = table.rows().data().toArray().filter(r => r._UPDATE_TYPE === 'update' && (r._NEW_VENDOR || r._NEW_PRICE));
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


        const confirm = await Swal.fire({
            icon: 'question',
            title: 'ยืนยันการบันทึก?',
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
        });
        if (!confirm.isConfirmed) return;
        const result = await createForm(form);

        console.log(result);
        const bankGuarantees = bgVendors.map(vendor => ({
            VENDOR: vendor,
            AMOUNT: bgAmounts[vendor] || '',
        }));

        try {
            const res = await $.ajax({
                type: "POST",
                url: `${host}/purform/PUR-SCP/main/saveWinner`,
                contentType: "application/json",
                data: JSON.stringify(
                    {
                        fyear: nextYear,
                        period: nextPeriod,
                        rows,
                        nfrmno: nfrmno,
                        vorgno: vorgno,
                        cyear: cyear,
                        nrunno: result.data.NRUNNO,
                        cyear2: result.data.CYEAR2,
                        selectedQuotations,
                        bankGuarantees,
                    }),
                dataType: "json",
            });
            const carryCount = table.rows().data().toArray().filter(r => r._UPDATE_TYPE === 'carry-over').length;
            Swal.fire({
                icon: 'success',
                title: `บันทึกสำเร็จ ${res.count ?? rows.length} รายการ`,
                text: carryCount > 0 ? `${carryCount} รายการใช้ราคาเดิม (Carry Over)` : '',
                timer: 2500,
            });
            redirectWebflow();
            $("#saveFooter").addClass("hidden");
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.responseText || 'Save failed' });
        }
    });

});