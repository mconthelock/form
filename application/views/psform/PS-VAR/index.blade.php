@extends('layouts/webflowTemplate')
@section('contents')
    <div class="form-data"
        data-nfrmno="{{ $_GET['no'] }}"
        data-vorgno="{{ $_GET['orgNo'] }}"
        data-cyear="{{ $_GET['y'] }}"
        data-cyear2="{{ $_GET['y2'] }}"
        data-nrunno="{{ $_GET['runNo'] }}">
    </div>
    <div class="min-h-screen bg-base-200 px-4 py-6 text-base-content md:px-6">
        <h2 class="sr-only">
            Variance Adjustment Report — WHI Inventory Checking
        </h2>

        <div class="mx-auto flex max-w-7xl flex-col gap-4">
            <div class="card bg-base-100 shadow-sm border border-base-300">
                <div class="card-body gap-4 p-5 md:p-6">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div class="space-y-2">
                            <div class="badge badge-primary badge-outline">Variance Adjustment Report</div>
                            <h1 class="text-2xl font-semibold tracking-tight">WHI Situation Report</h1>
                            <p class="text-sm text-base-content/70">
                                Inventory checking summary for WHI warehouse operations.
                            </p>
                            {{-- <div class="badge badge-info badge-lg badge-outline">Jan 2568 - Jun 2568</div> --}}
                            <div class="flex flex-wrap items-center gap-3 pt-2">
                                <div class="badge badge-info badge-lg badge-outline"><span class="preview-date-range"></span></div>

                            </div>
                        </div>

                        <div class="grid gap-3 sm:grid-cols-2 lg:min-w-88 lg:text-right">
                            <div class="stat rounded-box bg-base-200 p-4">
                                <div class="stat-title text-xs uppercase tracking-wide">From</div>
                                <div class="stat-value text-lg">WHI SEM</div>
                            </div>
                            <div class="stat rounded-box bg-base-200 p-4">
                                <div class="stat-title text-xs uppercase tracking-wide">Date</div>
                                <div class="stat-value text-lg">15 / 06 / 2568</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
                <div class="card bg-base-100 shadow-sm border border-base-300">
                    <div class="card-body gap-4 p-5 md:p-6">
                        <div class="flex items-center justify-between">
                            <h2 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">Conditions</h2>
                        </div>
                        <ul class="space-y-3 text-sm leading-6 text-base-content/80">
                            <li class="flex items-start gap-2">
                                <i class="ti ti-circle-check mt-0.5 text-success" aria-hidden="true"></i>
                                <span>WHI inventory checking — all warehouse</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="ti ti-circle-check mt-0.5 text-success" aria-hidden="true"></i>
                                <span>WHI office print parts list, issue to foreman and controller</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="ti ti-circle-check mt-0.5 text-success" aria-hidden="true"></i>
                                <span>WHI operator checking</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="ti ti-circle-check mt-0.5 text-success" aria-hidden="true"></i>
                                <span>WHI summary report by foreman, sent to WHI SEM for approval</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="ti ti-circle-check mt-0.5 text-success" aria-hidden="true"></i>
                                <span>Report inventory checking by WHI SEM and send to PS DDEM,PS DEM, E/P DDIM, E/P DIM and President for approval</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="card bg-base-100 shadow-sm border border-base-300">
                    <div class="card-body gap-4 p-5 md:p-6">
                        <div class="flex items-center justify-between">
                            <h2 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">Remarks</h2>
                        </div>
                        <div class="space-y-3 text-sm leading-6 text-base-content/80">
                            <div class="flex gap-3">
                                <div class="badge badge-neutral badge-sm mt-1">1</div>
                                <p>
                                    The result of inventory checking group all warehouse = 
                                    "<span class="font-semibold text-warning variance-amount">0.00</span>".
                                </p>
                            </div>
                            <div class="flex gap-3">
                                <div class="badge badge-neutral badge-sm mt-1">2</div>
                                <p>
                                    During inventory checking, WHI Controller normally work for issue and receive part, If found difference item
                                    form working and able to Clearly explain by Refer Issue card no. Receiving slip or Overusage sheet will Report
                                    "<span class="font-semibold text-warning variance">0</span>" and
                                    "<span class="font-semibold text-warning variance-amount">0.00</span>".
                                </p>
                            </div>
                            <div class="flex gap-3">
                                <div class="badge badge-neutral badge-sm mt-1">3</div>
                                <p>This report will reference history of Warehouse for AS-400 transaction history and MCScard record.</p>
                            </div>
                            <div class="flex gap-3">
                                <div class="badge badge-neutral badge-sm mt-1">4</div>
                                <p>
                                    The report will difference and Varaince In case of WHI's operator can't explain and exhibit for referable abount
                                    over usage sheet, Issue card and Receiving slip.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card bg-base-100 shadow-sm border border-base-300">
                <div class="card-body gap-4 p-5 md:p-6">
                    <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">Result</h2>
                            <p class="text-lg font-semibold">WHI Inventory Checking, All Warehouse</p>
                            <div class="mt-4">
                                Refer : <a href="#" target="_blank" class="btn btn-sm btn-outline link-cycle-count">
                                    <i class="ti ti-external-link text-lg" aria-hidden="true"></i>
                                    Form Cycle Count Inventory Checking (6 Month)
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="stats stats-vertical shadow-sm border border-base-300 lg:stats-horizontal">
                        <div class="stat">
                            <div class="stat-title text-xs uppercase tracking-wide">Total items</div>
                            <div class="stat-value text-primary text-2xl tabular-nums total">0</div>
                            <div class="stat-desc">parts</div>
                        </div>
                        <div class="stat border-t border-base-300 lg:border-t-0 lg:border-l">
                            <div class="stat-title text-xs uppercase tracking-wide">Diff. (1st time)</div>
                            <div class="stat-value text-warning text-2xl tabular-nums diff-first">0</div>
                            <div class="stat-desc">items</div>
                        </div>
                        <div class="stat border-t border-base-300 lg:border-t-0 lg:border-l">
                            <div class="stat-title text-xs uppercase tracking-wide">Variance items</div>
                            <div class="stat-value text-error text-2xl tabular-nums variance">0</div>
                            <div class="stat-desc">items remaining</div>
                        </div>
                    </div>

                    <div class="overflow-x-auto border border-base-300 rounded-box">
                        <table class="table table-zebra table-sm">
                            <thead class="bg-base-200 text-base-content">
                                <tr>
                                    <th>Category</th>
                                    <th class="text-right">ITEM</th>
                                    <th class="text-right">Sum amount (฿)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Total</td>
                                    <td class="tabular-nums text-right total">0</td>
                                    <td class="tabular-nums text-right total-amount">0.00</td>
                                </tr>
                                <tr>
                                    <td>Checking</td>
                                    <td class="tabular-nums text-right checking">0</td>
                                    <td class="tabular-nums text-right checking-amount">0.00</td>
                                </tr>
                                <tr>
                                    <td>Diff. item (1st time)</td>
                                    <td class="tabular-nums text-right diff-first">0</td>
                                    <td class="tabular-nums text-right diff-first-amount">0.00</td>
                                </tr>
                                <tr>
                                    <td>Diff. item (after re-check)</td>
                                    <td class="tabular-nums text-right diff-after">0</td>
                                    <td class="tabular-nums text-right diff-after-amount">0.00</td>
                                </tr>
                                <tr class="bg-error/10 font-semibold text-error">
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <i class="ti ti-alert-triangle" aria-hidden="true"></i>
                                            <span>Variance item</span>
                                        </div>
                                    </td>
                                    <td class="tabular-nums text-right variance">0</td>
                                    <td class="tabular-nums text-right variance-amount">0.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card bg-base-100 shadow-sm border border-base-300">
                <div class="card-body gap-4 p-5 md:p-6">
                    <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">Monthly summary</h2>
                            <p class="text-lg font-semibold">Inventory checking by group</p>
                        </div>
                    </div>

                    <div class="overflow-x-auto border border-base-300 rounded-box">
                        <table class="table table-pin-rows table-pin-cols table-sm">
                            <thead>
                                <tr class="bg-base-200">
                                    <th rowspan="2" class="bg-base-300 border-r border-base-300">Month & Group</th>
                                    <th class="text-center border-b border-base-300 bg-info/15 text-info date-A1">-</th>
                                    <th class="text-center border-b border-base-300 bg-success/15 text-success date-A2">-</th>
                                    <th class="text-center border-b border-base-300 bg-warning/15 text-warning date-A3">-</th>
                                    <th class="text-center border-b border-base-300 bg-error/15 text-error date-BE">-</th>
                                    <th class="text-center border-b border-base-300 bg-base-200/15 text-base-content/40">.....\...</th>
                                    <th class="text-center border-b border-base-300 bg-primary/15 text-primary date-CDFGI">-</th>
                                    <th rowspan="2" class="bg-base-300 text-center border-l border-base-300">Grand total</th>
                                </tr>
                                <tr>
                                    <th class="text-center font-semibold bg-info/10 text-info border-b border-base-300">Group A1</th>
                                    <th class="text-center font-semibold bg-success/10 text-success border-b border-base-300">Group A2</th>
                                    <th class="text-center font-semibold bg-warning/10 text-warning border-b border-base-300">Group A3</th>
                                    <th class="text-center font-semibold bg-error/10 text-error border-b border-base-300">Group B+E</th>
                                    <th class="text-center font-semibold bg-base-200 border-b border-base-300"></th>
                                    <th class="text-center font-semibold bg-primary/10 text-primary border-b border-base-300">Group C+D+F+G+I</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="hover:bg-base-200/50 transition-colors">
                                    <td class="font-medium bg-base-100 border-r border-base-300">Total Item</td>
                                    <td class="text-center tabular-nums total-A1 bg-info/5">0</td>
                                    <td class="text-center tabular-nums total-A2 bg-success/5">0</td>
                                    <td class="text-center tabular-nums total-A3 bg-warning/5">0</td>
                                    <td class="text-center tabular-nums total-BE bg-error/5">0</td>
                                    <td class="text-center text-base-content/40"></td>
                                    <td class="text-center tabular-nums total-CDFGI bg-primary/5">0</td>
                                    <td class="text-center tabular-nums font-semibold bg-base-200 border-l border-base-300 grand-total">0</td>
                                </tr>
                                <tr class="hover:bg-base-200/50 transition-colors">
                                    <td class="font-medium bg-base-100 border-r border-base-300">Sum Onhand Qty(Unit)</td>
                                    <td class="text-center tabular-nums onhand-A1 bg-info/5">0</td>
                                    <td class="text-center tabular-nums onhand-A2 bg-success/5">0</td>
                                    <td class="text-center tabular-nums onhand-A3 bg-warning/5">0</td>
                                    <td class="text-center tabular-nums onhand-BE bg-error/5">0</td>
                                    <td class="text-center text-base-content/40"></td>
                                    <td class="text-center tabular-nums onhand-CDFGI bg-primary/5">0</td>
                                    <td class="text-center tabular-nums font-semibold bg-base-200 border-l border-base-300 grand-onhand">0</td>
                                </tr>
                                <tr class="hover:bg-base-200/50 transition-colors">
                                    <td class="font-medium bg-base-100 border-r border-base-300">SumUnitPrice(฿)</td>
                                    <td class="text-center tabular-nums price-unit-A1 bg-info/5">0.00</td>
                                    <td class="text-center tabular-nums price-unit-A2 bg-success/5">0.00</td>
                                    <td class="text-center tabular-nums price-unit-A3 bg-warning/5">0.00</td>
                                    <td class="text-center tabular-nums price-unit-BE bg-error/5">0.00</td>
                                    <td class="text-center text-base-content/40"></td>
                                    <td class="text-center tabular-nums price-unit-CDFGI bg-primary/5">0.00</td>
                                    <td class="text-center tabular-nums font-semibold bg-base-200 border-l border-base-300 grand-price-unit">0.00</td>
                                </tr>
                                <tr class="hover:bg-base-200/50 transition-colors">
                                    <td class="font-medium bg-base-100 border-r border-base-300">SumAmount(฿)</td>
                                    <td class="text-center tabular-nums amount-A1 bg-info/5">0.00</td>
                                    <td class="text-center tabular-nums amount-A2 bg-success/5">0.00</td>
                                    <td class="text-center tabular-nums amount-A3 bg-warning/5">0.00</td>
                                    <td class="text-center tabular-nums amount-BE bg-error/5">0.00</td>
                                    <td class="text-center text-base-content/40"></td>
                                    <td class="text-center tabular-nums amount-CDFGI bg-primary/5">0.00</td>
                                    <td class="text-center tabular-nums font-semibold bg-base-200 border-l border-base-300 grand-amount">0.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6 aprv-section" style="display: none">
            <div class="max-w-xl mx-auto">
                <div class="space-y-2">
                    <div>
                        <label class="label">
                            <span class="label-text font-medium">Attachment</span>
                        </label>
                        <input type="file" class="file-input file-input-sm file-input-bordered w-full attach-file" />
                    </div>
                    <div>
                        <label class="label">
                            <span class="label-text font-medium">Remark</span>
                        </label>
                        <textarea class="textarea textarea-sm textarea-bordered w-full min-h-30" id="remark" placeholder="Enter your remark here..."></textarea>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                        <button class="btn btn-success min-w-35 btn-approve" data-action="approve"> Approve</button>
                        <button class="btn btn-error min-w-35 btn-approve" data-action="reject"> Reject</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- ─── Approval flow timeline ─────────────────────────────────────────── ─ --}}
        <div class="mt-5 flow"></div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psVar.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
