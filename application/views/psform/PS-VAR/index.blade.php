@extends('layouts/webflowTemplate')
@section('contents')
    <style>
        .vr-root {
            font-size: 13px;
            color: var(--color-text-primary);
            padding: 1rem 0;
        }

        .vr-doc-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            padding: 1rem 1.25rem;
            background: var(--color-background-primary);
            border: 0.5px solid var(--color-border-tertiary);
            border-radius: 0.5rem;
        }

        .vr-doc-meta {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .vr-doc-meta span {
            font-size: 12px;
            color: var(--color-text-secondary);
        }

        .vr-doc-meta strong {
            font-size: 14px;
            font-weight: 500;
        }

        .vr-title-block {
            text-align: center;
            margin-bottom: 1rem;
            padding: 1rem 1.25rem;
            background: var(--color-background-primary);
            border: 0.5px solid var(--color-border-tertiary);
            border-radius: 0.5rem;
        }

        .vr-title-block h1 {
            font-size: 15px;
            font-weight: 500;
            margin: 0 0 4px;
        }

        .vr-title-block p {
            font-size: 12px;
            color: var(--color-text-secondary);
            margin: 0;
        }

        .vr-period-badge {
            display: inline-block;
            margin-top: 6px;
            padding: 3px 10px;
            border-radius: var(--border-radius-md);
            background: #e6f1fb;
            color: #0c447c;
            font-size: 12px;
            font-weight: 500;
        }

        .vr-section {
            margin-bottom: 0.75rem;
        }

        .vr-section-label {
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--color-text-tertiary);
            margin-bottom: 6px;
            padding-left: 2px;
        }

        .vr-card {
            background: #ffffff;
            border: 0.5px solid var(--color-border-tertiary);
            border-radius: 0.5rem;
            padding: 1rem 1.25rem;
        }

        .vr-approval-flow {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .vr-approval-box {
            flex: 1;
            border: 0.5px solid var(--color-border-tertiary);
            border-radius: var(--border-radius-md);
            padding: 10px;
            text-align: center;
        }

        .vr-approval-box .label {
            font-size: 11px;
            color: var(--color-text-secondary);
            margin-bottom: 4px;
        }

        .vr-approval-box .name {
            font-size: 12px;
            font-weight: 500;
            min-height: 18px;
        }

        .vr-approval-box .date-line {
            font-size: 11px;
            color: var(--color-text-tertiary);
            margin-top: 6px;
            border-top: 0.5px solid var(--color-border-tertiary);
            padding-top: 4px;
        }

        .vr-approval-box.signed {
            border-color: #85b7eb;
            background: #e6f1fb;
        }

        .vr-approval-box.signed .label {
            color: #185fa5;
        }

        .vr-arrow {
            color: var(--color-text-tertiary);
            font-size: 16px;
            flex-shrink: 0;
        }

        .vr-cc-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .vr-cc-chip {
            font-size: 11px;
            padding: 3px 8px;
            border-radius: var(--border-radius-md);
            background: var(--color-background-secondary);
            color: var(--color-text-secondary);
            border: 0.5px solid var(--color-border-tertiary);
        }

        .vr-conditions {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .vr-condition-row {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 12px;
            color: var(--color-text-secondary);
        }

        .vr-condition-row i {
            color: #1d9e75;
            font-size: 14px;
            flex-shrink: 0;
            margin-top: 1px;
        }

        .vr-two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .vr-kpi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 10px;
        }

        .vr-kpi {
            background: var(--color-background-secondary);
            border-radius: var(--border-radius-md);
            padding: 10px 12px;
        }

        .vr-kpi .k-label {
            font-size: 11px;
            color: var(--color-text-secondary);
            margin-bottom: 2px;
        }

        .vr-kpi .k-value {
            font-size: 18px;
            font-weight: 500;
        }

        .vr-kpi .k-sub {
            font-size: 11px;
            color: var(--color-text-tertiary);
        }

        .vr-kpi.warn .k-value {
            color: #854f0b;
        }

        .vr-kpi.danger .k-value {
            color: #a32d2d;
        }

        .vr-kpi.ok .k-value {
            color: #3b6d11;
        }

        .vr-result-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }

        .vr-result-table th {
            font-size: 11px;
            font-weight: 500;
            color: var(--color-text-secondary);
            padding: 6px 10px;
            border-bottom: 0.5px solid var(--color-border-tertiary);
            text-align: right;
            white-space: nowrap;
        }

        .vr-result-table th:first-child {
            text-align: left;
        }

        .vr-result-table td {
            padding: 7px 10px;
            border-bottom: 0.5px solid var(--color-border-tertiary);
            text-align: right;
        }

        .vr-result-table td:first-child {
            text-align: left;
            color: var(--color-text-secondary);
        }

        .vr-result-table tr:last-child td {
            border-bottom: none;
        }

        .vr-result-table .variance-row td {
            background: #faeeda;
            color: #412402;
            font-weight: 500;
        }

        .vr-result-table .variance-row td:first-child {
            color: #633806;
            border-left: 3px solid #ef9f27;
            padding-left: 7px;
            border-radius: 0;
        }

        .vr-num {
            font-variant-numeric: tabular-nums;
        }

        .vr-remarks {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .vr-remark-row {
            display: flex;
            gap: 10px;
            font-size: 12px;
        }

        .vr-remark-num {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--color-background-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 500;
            color: var(--color-text-secondary);
            margin-top: 1px;
        }

        .vr-remark-text {
            color: var(--color-text-secondary);
            line-height: 1.6;
        }

        .vr-highlight-amber {
            color: #854f0b;
            font-weight: 500;
        }

        .vr-summary-wrap {
            overflow-x: auto;
        }

        .vr-summary-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            min-width: 520px;
        }

        .vr-summary-table th {
            padding: 5px 8px;
            text-align: center;
            font-weight: 500;
            font-size: 11px;
            border-bottom: 0.5px solid var(--color-border-tertiary);
            color: var(--color-text-secondary);
            background: var(--color-background-secondary);
            white-space: nowrap;
        }

        .vr-summary-table th.group-header {
            background: #185fa5;
            color: #e6f1fb;
        }

        .vr-summary-table th.grand-header {
            background: #3b6d11;
            color: #eaf3de;
        }

        .vr-summary-table th.sig-header {
            background: var(--color-background-secondary);
            color: var(--color-text-secondary);
        }

        .vr-summary-table td {
            padding: 5px 8px;
            text-align: center;
            border-bottom: 0.5px solid var(--color-border-tertiary);
            font-size: 11px;
        }

        .vr-summary-table td:first-child {
            text-align: left;
            font-weight: 500;
            color: var(--color-text-primary);
        }

        .vr-summary-table tr:last-child td {
            border-bottom: none;
        }

        .vr-summary-table .sig-cell {
            min-width: 70px;
            border-left: 0.5px solid var(--color-border-tertiary);
            color: var(--color-text-tertiary);
            font-style: italic;
        }

        .vr-grand-val {
            font-weight: 500;
            color: #27500a;
        }

        .vr-sig-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 10px;
        }

        .vr-sig-box {
            border: 0.5px solid var(--color-border-tertiary);
            border-radius: var(--border-radius-md);
            padding: 10px;
            text-align: center;
        }

        .vr-sig-box .sig-role {
            font-size: 11px;
            font-weight: 500;
            color: var(--color-text-secondary);
            margin-bottom: 28px;
        }

        .vr-sig-box .sig-line {
            border-top: 0.5px solid var(--color-border-tertiary);
            padding-top: 4px;
            font-size: 11px;
            color: var(--color-text-tertiary);
        }

        .vr-divider {
            height: 0.5px;
            background: var(--color-border-tertiary);
            margin: 0.5rem 0;
        }
    </style>

    <div class="vr-root">
        <h2 class="sr-only" style="position: absolute; left: -9999px">
            Variance Adjustment Report — WHI Inventory Checking
        </h2>

        <div class="vr-doc-header">
            <div>
                <div
                    style="
          font-size: 11px;
          color: var(--color-text-tertiary);
          margin-bottom: 2px;
        ">
                    From
                </div>
                <div style="font-size: 14px; font-weight: 500">WHI S/M</div>
            </div>
            <div style="text-align: right">
                <div
                    style="
          font-size: 11px;
          color: var(--color-text-tertiary);
          margin-bottom: 2px;
        ">
                    Date
                </div>
                <div style="font-size: 14px; font-weight: 500">15 / 06 / 2568</div>
            </div>
        </div>

        <div class="vr-title-block">
            <p
                style="
        font-size: 11px;
        color: var(--color-text-tertiary);
        margin-bottom: 4px;
      ">
                Variance Adjustment Report
            </p>
            <h1>WHI Situation Report</h1>
            <div class="vr-period-badge">Jan 2568 – Jun 2568</div>
        </div>

        <div class="vr-two-col vr-section">
            <div>
                <div class="vr-section-label">Conditions</div>
                <div class="vr-card">
                    <div class="vr-conditions">
                        <div class="vr-condition-row">
                            <i class="ti ti-circle-check" aria-hidden="true"></i><span>WHI inventory checking — all warehouse</span>
                        </div>
                        <div class="vr-condition-row">
                            <i class="ti ti-circle-check" aria-hidden="true"></i><span>WHI office print parts list, issue to foreman and
                                controller</span>
                        </div>
                        <div class="vr-condition-row">
                            <i class="ti ti-circle-check" aria-hidden="true"></i><span>WHI operator checking</span>
                        </div>
                        <div class="vr-condition-row">
                            <i class="ti ti-circle-check" aria-hidden="true"></i><span>WHI summary report by foreman, sent to WHI S/M for approval</span>
                        </div>
                        <div class="vr-condition-row">
                            <i class="ti ti-circle-check" aria-hidden="true"></i><span>Report sent to PS DOM / PS DOM, 1st DOM, 1st DM, and President
                                for approval</span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div class="vr-section-label">Remarks</div>
                <div class="vr-card">
                    <div class="vr-remarks">
                        <div class="vr-remark-row">
                            <div class="vr-remark-num">1</div>
                            <div class="vr-remark-text">
                                The result of inventory checking across all warehouses is reported
                                as
                                <span class="vr-highlight-amber">Variance Item SUM AMOUNT(฿)</span>.
                            </div>
                        </div>
                        <div class="vr-remark-row">
                            <div class="vr-remark-num">2</div>
                            <div class="vr-remark-text">
                                During checking, WHI Controller normally works for issue and
                                receive parts. Differences that can be clearly explained (Refer
                                Issue card, Receiving slip, or Over usage sheet) will not report
                                <span class="vr-highlight-amber">Variance Item ITEM</span> or
                                <span class="vr-highlight-amber">SUM AMOUNT(฿)</span>.
                            </div>
                        </div>
                        <div class="vr-remark-row">
                            <div class="vr-remark-num">3</div>
                            <div class="vr-remark-text">
                                This report references warehouse history from AS/400 transaction
                                history and MCS card record.
                            </div>
                        </div>
                        <div class="vr-remark-row">
                            <div class="vr-remark-num">4</div>
                            <div class="vr-remark-text">
                                Differences and variances arise only when WHI's operator cannot
                                explain or exhibit tolerable documents (over usage sheet, issue
                                card, or receiving slip).
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="vr-section">
            <div class="vr-section-label">
                Result — WHI Inventory Checking, All Warehouse
            </div>
            <div class="vr-card" style="padding: 0.75rem 1.25rem">
                <div class="vr-kpi-grid">
                    <div class="vr-kpi">
                        <div class="k-label">Total items</div>
                        <div class="k-value vr-num">1,248</div>
                        <div class="k-sub">parts</div>
                    </div>
                    <div class="vr-kpi warn">
                        <div class="k-label">Diff. (1st time)</div>
                        <div class="k-value vr-num">38</div>
                        <div class="k-sub">items</div>
                    </div>
                    <div class="vr-kpi danger">
                        <div class="k-label">Variance items</div>
                        <div class="k-value vr-num">12</div>
                        <div class="k-sub">items remaining</div>
                    </div>
                </div>
                <div class="vr-divider"></div>
                <table class="vr-result-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Item (qty)</th>
                            <th>Sum amount (฿)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total</td>
                            <td class="vr-num">1,248</td>
                            <td class="vr-num">4,820,350.00</td>
                        </tr>
                        <tr>
                            <td>Checking</td>
                            <td class="vr-num">1,248</td>
                            <td class="vr-num">4,820,350.00</td>
                        </tr>
                        <tr>
                            <td>Diff. item (1st time)</td>
                            <td class="vr-num">38</td>
                            <td class="vr-num">182,640.00</td>
                        </tr>
                        <tr>
                            <td>Diff. item (after re-check)</td>
                            <td class="vr-num">20</td>
                            <td class="vr-num">94,200.00</td>
                        </tr>
                        <tr class="variance-row">
                            <td>
                                <i
                                    class="ti ti-alert-triangle"
                                    style="font-size: 12px; margin-right: 4px; vertical-align: -1px"
                                    aria-hidden="true"></i>Variance item
                            </td>
                            <td class="vr-num">12</td>
                            <td class="vr-num">48,750.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="vr-section">
            <div class="vr-section-label">
                Monthly summary — inventory checking by group
            </div>
            <div class="vr-card" style="padding: 0.75rem 1.25rem">
                <div class="vr-summary-wrap">
                    <table class="vr-summary-table">
                        <thead>
                            <tr>
                                <th rowspan="2" style="text-align: left">Month & Group</th>
                                <th colspan="4" class="group-header">Checking groups</th>
                                <th rowspan="2" class="grand-header">Grand total</th>
                                <th colspan="3" class="sig-header">Signature</th>
                            </tr>
                            <tr>
                                <th class="group-header">Group A1</th>
                                <th class="group-header">Group A2</th>
                                <th class="group-header">Group A3</th>
                                <th class="group-header">Group A4</th>
                                <th class="sig-header">PS S/M</th>
                                <th class="sig-header">PS DOM</th>
                                <th class="sig-header">WHI S/M</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Jan 2568</td>
                                <td>15A</td>
                                <td>18A</td>
                                <td>12A</td>
                                <td>14A</td>
                                <td class="vr-grand-val vr-num">59A</td>
                                <td class="sig-cell">0.00</td>
                                <td class="sig-cell">0.00</td>
                                <td class="sig-cell">0.00</td>
                            </tr>
                            <tr>
                                <td>Feb 2568</td>
                                <td>16A</td>
                                <td>17A</td>
                                <td>13A</td>
                                <td>15A</td>
                                <td class="vr-grand-val vr-num">61A</td>
                                <td class="sig-cell">0.00</td>
                                <td class="sig-cell">0.00</td>
                                <td class="sig-cell">0.00</td>
                            </tr>
                            <tr>
                                <td>Mar 2568</td>
                                <td>14A</td>
                                <td>19A</td>
                                <td>11A</td>
                                <td>16A</td>
                                <td class="vr-grand-val vr-num">60A</td>
                                <td class="sig-cell">0.00</td>
                                <td class="sig-cell">0.00</td>
                                <td class="sig-cell">0.00</td>
                            </tr>
                            <tr>
                                <td>Apr 2568</td>
                                <td>17A</td>
                                <td>18A</td>
                                <td>14A</td>
                                <td>13A</td>
                                <td class="vr-grand-val vr-num">62A</td>
                                <td class="sig-cell">0.00</td>
                                <td class="sig-cell">0.00</td>
                                <td class="sig-cell">0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="vr-sig-section">
                    <div class="vr-sig-box">
                        <div class="sig-role">PS S/M</div>
                        <div class="sig-line">Name / Date</div>
                    </div>
                    <div class="vr-sig-box">
                        <div class="sig-role">PS DOM</div>
                        <div class="sig-line">Name / Date</div>
                    </div>
                    <div class="vr-sig-box">
                        <div class="sig-role">WHI S/M</div>
                        <div class="sig-line">Name / Date</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
@endsection
