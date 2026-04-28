/**
 * Build HTML content for AMEC Scrap Master PDF export.
 * @param {Object} opts
 * @param {Array}  opts.data          - Row data from getDataPriceByRunNo
 * @param {number} opts.newYear       - NEW_FYEAR
 * @param {number} opts.newPeriod     - NEW_PERIOD
 * @param {string} opts.oldPricePeriod - e.g. "Y2023/2F"
 * @param {string} opts.newPricePeriod - e.g. "Y2024/1F"
 * @param {string} opts.dateRange     - e.g. "1 Apr'2024 - 30 Sep'2024"
 * @param {string} opts.flow          - HTML content for the flow section
 * @param {Array}  opts.approved       - Approved steps [{step, emp}]
 */
export function buildScrapPdfHtml({ data = [], newYear, newPeriod, oldPricePeriod, newPricePeriod, dateRange, flow, bankGuarantees = [], approved = [], remark = "" }) {
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const todayStr = `${today.getDate()} ${months[today.getMonth()]} '${String(today.getFullYear()).slice(-2)}`;

    // step -> approved entry map (02=PUR DIN, 81=FIN DEM, 93=G/S DEM, 84=FE DEM, 59=PS DEM)
    const stepMap = Object.fromEntries(approved.map(a => [a.step, a]));
    // Column order matches approval table headers: PS DEM, FE DEM, G/S DEM, FIN DEM, PUR DIN
    const stepOrder = ['59', '84', '93', '81', '02'];
    const approvalCells = stepOrder.map(step => {
        const entry = stepMap[step];
        if (entry && entry.emp) {
            const name = (entry.emp.sname || '').split(' ')[0];
            return `
                <td class="approval-cell">
                    <div class="stamp-circle">
                        <span class="stamp-company">AMEC</span>
                        <hr class="stamp-divider">
                        <span class="stamp-date">${entry.dateApv || todayStr}</span>
                        <hr class="stamp-divider">
                        <span class="stamp-name">${name}</span>
                    </div>
                </td>`;
        }
        return `<td class="approval-cell"></td>`;
    }).join('');

    const rows = data.map((row, i) => {
        const boi = row.BOI === "1" ? "BOI" : "Non-BOI";
        const guarantee = row.B_GUARANTEE === "1" ? "YES" : "NO";
        return `
            <tr>
                <td class="center">${i + 1}</td>
                <td class="center">${row.SCRAP_ID ?? ""}</td>
                <td>${row.SCRAP_NAME ?? ""}</td>
                <td class="center">${row.QUOTATION ?? ""}</td>
                <td class="winner">${row.NEW_VENDOR ?? ""}</td>
                <td class="center">${row.UNIT ?? ""}</td>
                <td class="center old-price">${row.PRICE != null ? row.PRICE : ""}</td>
                <td class="center winner new-price">${row.NEW_PRICE != null ? row.NEW_PRICE : ""}</td>
                <td class="center">${boi}</td>
                <td class="center">${guarantee}</td>
            </tr>
        `;
    }).join("");

    // Bank guarantee section — use data from DB if available, otherwise derive from price rows
    let guaranteeHeaderCells, guaranteeValueCells, hasBankGuarantees;
    if (bankGuarantees.length > 0) {
        guaranteeHeaderCells = bankGuarantees.map(bg => `<th>${bg.VENDOR}</th>`).join("");
        guaranteeValueCells  = bankGuarantees.map(bg =>
            `<td class="center">${bg.AMOUNT != null && bg.AMOUNT !== '' ? Number(bg.AMOUNT).toLocaleString() : '-'}</td>`
        ).join("");
        hasBankGuarantees = true;
    } else {
        const vendorMap = {};
        data.forEach(row => {
            if (!row.NEW_VENDOR || row.B_GUARANTEE !== "1") return;
            vendorMap[row.NEW_VENDOR] = (vendorMap[row.NEW_VENDOR] || 0) + 1;
        });
        const vendorKeys = Object.keys(vendorMap);
        guaranteeHeaderCells = vendorKeys.map(v => `<th>${v}</th>`).join("");
        guaranteeValueCells  = vendorKeys.map(() => `<td class="center">-</td>`).join("");
        hasBankGuarantees = vendorKeys.length > 0;
    }

    return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <style>
                    @page {
                        size: A4 portrait;
                        margin: 12mm 5mm 15mm 5mm;
                    }

                    * { box-sizing: border-box; }

                    body {
                        font-family: Arial, sans-serif;
                        font-size: 9px;
                        color: #000;
                        margin: 0;
                        padding: 0;
                    }

                    .page-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 6px;
                    }

                    .header-title {
                        flex: 1;
                        text-align: center;
                    }

                    .header-title h1 {
                        font-size: 16px;
                        font-weight: bold;
                        margin: 0 0 2px 0;
                        text-decoration: underline;
                    }

                    .header-title h2 {
                        font-size: 13px;
                        font-weight: bold;
                        background: #FFD700;
                        display: inline-block;
                        padding: 2px 10px;
                        margin: 0;
                    }

                    .header-meta {
                        font-size: 8px;
                        text-align: right;
                        line-height: 1.6;
                        min-width: 140px;
                    }

                    .confidential {
                        display: inline-block;
                        border: 1.5px solid red;
                        color: red;
                        font-weight: bold;
                        font-size: 10px;
                        padding: 1px 8px;
                        margin-top: 4px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 4px;
                    }

                    th, td {
                        border: 1px solid #333;
                        padding: 2px 4px;
                        vertical-align: middle;
                        word-break: break-word;
                    }

                    th {
                        background: #1F497D;
                        color: #fff;
                        font-size: 8px;
                        text-align: center;
                    }

                    th.winner-col {
                        background: #FFD700;
                        color: #000;
                    }

                    td { font-size: 8px; }

                    td.center { text-align: center; }

                    td.winner { font-weight: bold; }

                    td.new-price {
                        font-weight: bold;
                        background: #FFFF99;
                    }

                    td.old-price { color: #555; }

                    tr:nth-child(even) td { background: #f7f7f7; }
                    tr:nth-child(even) td.new-price { background: #FFFF99; }

                    .guarantee-section {
                        margin-top: 10px;
                        font-size: 9px;
                    }

                    .guarantee-section table th {
                        background: #ddd;
                        color: #000;
                        font-size: 8px;
                    }

                    .footer-note {
                        margin-top: 6px;
                        font-size: 8px;
                        font-style: italic;
                    }

                    .approval-section {
                        margin-top: 12px;
                        margin-left: 50px;
                        margin-right: 50px;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    .approval-table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                    }

                    .approval-table th {
                        background: #fff;
                        color: #000;
                        font-size: 8px;
                        font-weight: bold;
                        text-align: center;
                        border: 1px solid #333;
                        padding: 4px;
                    }

                    .approval-table td.approval-cell {
                        border: 1px solid #333;
                        height: 80px;
                        text-align: center;
                        vertical-align: middle;
                        background: #fff;
                    }

                    .stamp-circle {
                        display: inline-flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        border: 2.5px solid #cc0000;
                        outline: 1px solid #cc0000;
                        outline-offset: -5px;
                        color: #cc0000;
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 4px;
                        gap: 0;
                    }

                    .stamp-circle .stamp-company {
                        font-size: 10px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        line-height: 1.2;
                    }

                    .stamp-divider {
                        width: 80%;
                        border: none;
                        border-top: 1px solid #cc0000;
                        margin: 2px 0;
                    }

                    .stamp-circle .stamp-date {
                        font-size: 5px;
                        font-weight: bold;
                        line-height: 1.3;
                        letter-spacing: 0.5px;
                    }

                    .stamp-circle .stamp-name {
                        font-size: 7px;
                        font-weight: bold;
                        line-height: 1.3;
                        letter-spacing: 0.5px;
                    }

                    .flow{
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    </style>
                </head>
            <body>

        <div class="page-header">
            <div style="min-width:140px;"></div>
            <div class="header-title">
                <div style="font-size:11px;font-weight:bold;margin-bottom:2px;">AMEC SCRAP MASTER (Y${newYear}/${newPeriod}F)</div>
                <h2>${dateRange}</h2>
            </div>
            <div class="header-meta">
                Revision : *<br>
                Date : ${todayStr}<br>
                <div class="confidential">CONFIDENTIAL</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th rowspan="2">S/N</th>
                    <th rowspan="2">SCRAP ID</th>
                    <th rowspan="2" style="width:200px;">SCRAP NAME (English)</th>
                    <th rowspan="2">Quotation</th>
                    <th rowspan="2" class="winner-col">WINNER VENDOR<br>(${newPricePeriod})</th>
                    <th rowspan="2">U/M</th>
                    <th rowspan="2">PRICE (THB/UM)<br>${oldPricePeriod}</th>
                    <th rowspan="2" class="winner-col">NEW UNIT PRICE<br>(THB/UM)<br>${newPricePeriod}</th>
                    <th rowspan="2">BOI / Non-BOI</th>
                    <th rowspan="2">Bank Guarantee</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        ${hasBankGuarantees ? `
        <div class="guarantee-section">
            <table style="width:auto;margin-top:8px;">
                <thead>
                    <tr>
                        <th></th>
                        ${guaranteeHeaderCells}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight:bold;">BANK GUARANTEE AMOUNT</td>
                        ${guaranteeValueCells}
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="footer-note">
            Remark : ${remark || "-"}
        </div>
        ` : ""}

        <div class="flow">${flow}</div>

        <div class="approval-section">
            
            <table class="approval-table">
                <thead>
                    <tr>
                        <th>PS DEM</th>
                        <th>FE DEM</th>
                        <th>G/S DEM</th>
                        <th>FIN DEM</th>
                        <th>PUR DIM</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        ${approvalCells}
                    </tr>
                </tbody>
            </table>
            <table>
            </table>
        </div>

        </body>
    </html>`;
}
