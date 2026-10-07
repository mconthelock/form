@extends('layouts/webflowTemplate')

@section('styles')
<style>
    td:not(:last-child),
    th:not(:last-child) {
        border-right-color: color-mix(in oklab, var(--color-base-300), #00000036);
        border-right-width: 1px;
    }

    th {
        text-align: center !important;
        vertical-align: top !important;
    }

    label:has(input:disabled){
        cursor: not-allowed;
    }
</style>
@endsection

@section('contents')
{{-- <div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}" return="{{$return ?? ''}}"></div> --}}
{{-- <div class="hidden apv-data" empno="{{$empno}}"></div> --}}
<div class="min-h-[calc(100vh-3rem)] p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

    <div class="grid gap-5">

        {{-- main content --}}
        <div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg backdrop-blur-sm">
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
                <div class="flex items-center gap-2">
                    <i class="fi fi-sr-memo-circle-check text-lg text-slate-600"></i>
                    <h2 class="text-base font-bold text-slate-800">Price Approval System</h2>
                </div>
            </div>

            <form id="form-price-approval" class="flex flex-col gap-6 p-6">

                {{-- legend --}}
                <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    
                    <div class="flex gap-5">
                        <label class="label">
                            <input type="radio" name="form-mode" value="1" class="radio radio-secondary req"
                                data-message="Please select an option">
                            Auto input (จาก Price Comparison)
                        </label>
                        <label class="label">
                            <input type="radio" name="form-mode" value="0" class="radio radio-neutral req"
                                data-message="Please select an option">
                            กรอกข้อมูลเอง (แนบไฟล์ Price Comparison)
                        </label>
                    </div>
                </div>

                {{-- Section 1: ข้อมูลเอกสาร --}}
                <section class="rounded-xl border border-slate-200">
                    <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                        <span class="badge badge-neutral badge-sm">1</span>
                        <h3 class="font-semibold text-slate-700">ข้อมูลเอกสาร</h3>
                    </header>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                        {{-- <fieldset class="fieldset hidden" id="request-form-no">
                            <legend class="fieldset-legend">Request form no.</legend>
                            <label class="input w-full">
                                <i class="fi fi-rr-barcode-read text-slate-400"></i>
                                <input type="text" name="form_no" value="PA-2026-0000XX" readonly class="grow">
                                <span class="badge badge-ghost badge-sm">Auto Running</span>
                            </label>
                        </fieldset> --}}
                        {{-- <fieldset class="fieldset">
                            <legend class="fieldset-legend">Request for quotation no.</legend>
                            <label class="input w-full border-error/40 bg-error/5">
                                <i class="fi fi-rr-document text-slate-400"></i>
                                <input type="text" name="quotation_no" value="PUR-QTA-26-00XXXXX" readonly class="grow">
                            </label>
                        </fieldset> --}}

                        {{-- Inputer --}}
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Inputer</legend>
                            <input type="text" name="INPUTBY" id="INPUTBY" class="input w-full bg-amber-50 req" placeholder="กรอกรหัสพนักงาน" data-message="Please enter inputer" readonly>
                        </fieldset>
                        {{-- Requester --}}
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Requester</legend>
                            <input type="text" name="REQBY" id="REQBY" class="input w-full req" placeholder="กรอกรหัสพนักงาน" data-message="Please enter requester">
                        </fieldset>
                        {{-- Refer Price compare no. --}}
                        <fieldset class="hidden fieldset" id="price-compare-input-fieldset">
                            <legend class="fieldset-legend req">Refer Price compare no.</legend>
                            <div class="join w-full" >
                                <label class="input join-item w-full bg-amber-50">
                                    <input type="text" name="PRICE_COMPARE_NO" id="PRICE_COMPARE_NO" readonly class="grow req" placeholder="PUR-CPC26-000001">
                                </label>
                                <button type="button" class="btn btn-neutral join-item" id="btn-view-compare">
                                    <i class="fi fi-rr-eye"></i>View record
                                </button>
                            </div>
                        </fieldset>
                        {{-- Refer Price compare file. --}}
                        <fieldset class="hidden fieldset" id="price-compare-file-fieldset">
                            <legend class="fieldset-legend req">Refer Price compare file.</legend>
                            <div id="price-compare-file-container"></div>
                        </fieldset>
                        <div></div>
                        <div class="col-span-2">
                            <table id="table-comparison" class="table table-zebra table-sm">
                            </table>
                        </div>
                        <div class="col-span-2" id="price-compare-container">
                        </div>
                    </div>
                </section>

                {{-- Section 2: รายละเอียดสินค้า --}}
                <section class="rounded-xl border border-slate-200">
                    <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                        <span class="badge badge-neutral badge-sm">2</span>
                        <h3 class="font-semibold text-slate-700">รายละเอียดสินค้า (New Item)</h3>
                    </header>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Vendor Code</legend>
                            <input type="text" name="VVENDOR" id="VVENDOR" class="input w-full req" readonly placeholder="10003" data-message="Please Enter Vendor code">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Vendor Name</legend>
                            <input type="text" name="VVENDOR_NAME" id="VVENDOR_NAME" class="input w-full req" readonly placeholder="MITSUBISHI ELECTRIC TRADING CO" data-message="Please Enter Vendor name">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Planner Code</legend>
                            <input type="text" name="VPLANNER" id="VPLANNER" class="input w-full req uppercase" readonly placeholder="G" data-message="Please Enter Planner code">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Material Code</legend>
                            <input type="text" name="VMATERIAL_CODE" id="VMATERIAL_CODE" class="input w-full req" placeholder="กรอก Material Code" data-message="Please enter material code">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Maker (Business route)</legend>
                            <input type="text" name="VMAKER" id="VMAKER" class="input w-full req" placeholder="กรอก Maker" data-message="Please enter maker">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Part Name</legend>
                            <input type="text" name="VPART_NAME" id="VPART_NAME" class="input w-full req" placeholder="กรอก Part Name" data-message="Please enter part name">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Model Name</legend>
                            <input type="text" name="VMODEL_NAME" id="VMODEL_NAME" class="input w-full req" placeholder="กรอก Model Name" data-message="Please enter model name">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Job Item</legend>
                            <input type="text" name="VJOB_ITEM" id="VJOB_ITEM" class="input w-full req" placeholder="กรอก Job Item" data-message="Please enter job item">
                        </fieldset>

                        {{-- PCS Committee --}}
                        <fieldset class="fieldset md:col-span-2">
                            <legend class="fieldset-legend req">PCS Committee</legend>
                            <div class="flex flex-wrap gap-2" id="committee-container">
                            </div>
                        </fieldset>

                        {{-- Group --}}
                        <fieldset class="fieldset md:col-span-2">
                            <legend class="fieldset-legend req">Group</legend>
                            <div class="flex flex-wrap gap-2" id="group-container">
                            </div>
                        </fieldset>
                    </div>
                </section>

                {{-- Section 3: ราคา --}}
                <section class="rounded-xl border border-slate-200">
                    <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                        <span class="badge badge-neutral badge-sm">3</span>
                        <h3 class="font-semibold text-slate-700">ข้อมูลราคา</h3>
                    </header>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Present Total Price</legend>
                            <div class="join">
                                <label class="input w-full join-item">
                                    <input type="text" name="NTOTAL_PRES" id="NTOTAL_PRES" class="grow text-right req" placeholder="0" readonly>
                                    {{-- <span class="badge badge-ghost badge-sm">Col. AA</span> --}}
                                </label>
                                <div class="flex items-center px-2 text-white bg-neutral join-item">KB/YEAR</div>
                            </div>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">New Total Price</legend>
                            <div class="join">
                                <label class="input w-full join-item">
                                    <input type="text" name="NTOTAL_NEW" id="NTOTAL_NEW" class="grow text-right req" placeholder="0" readonly>
                                    {{-- <span class="badge badge-ghost badge-sm">Col. BB</span> --}}
                                </label>
                                <div class="flex items-center px-2 text-white bg-neutral join-item">KB/YEAR</div>
                            </div>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Cost Down (+) / Cost Up (-) Amount</legend>
                            <div class="join">
                                <label class="input w-full join-item">
                                    <input type="text" name="NTOTAL_COST" id="NTOTAL_COST" class="grow text-right req" placeholder="0" readonly>
                                    {{-- <span class="badge badge-ghost badge-sm">Col. CC</span> --}}
                                </label>
                                <div class="flex items-center px-2 text-white bg-neutral join-item">KB/YEAR</div>
                            </div>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Cost Down (+) / Cost Up (-) Ratio %</legend>
                            <div class="join">
                                <label class="input w-full join-item">
                                    <input type="text" name="NTOTAL_RATIO" id="NTOTAL_RATIO" class="grow text-right req" placeholder="0" readonly>
                                    {{-- <span class="badge badge-ghost badge-sm">Col. DD</span> --}}
                                </label>
                                <div class="flex items-center px-2 text-white bg-neutral join-item">%</div>
                            </div>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Effective Month</legend>
                            <input type="month" name="VEFT_MONTH" id="VEFT_MONTH" class="input w-full req" data-message="Please select effective month" placeholder="Feb'26">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Effective Type</legend>
                            <div class="flex flex-wrap gap-2">
                                <label class="label cursor-pointer justify-start gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="VEFT_TYPE" value="PO issue basis" class="radio radio-sm radio-primary">
                                    <span class="label-text">PO issue basis</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="VEFT_TYPE" value="Delivery basis" class="radio radio-sm radio-primary">
                                    <span class="label-text">Delivery basis</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="VEFT_TYPE" value="Others" class="radio radio-sm radio-primary">
                                    <span class="label-text">Others</span>
                                </label>
                                <textarea name="VEFT_TYPE_OTHER" id="VEFT_TYPE_OTHER" class="textarea w-full" rows="5" disabled></textarea>
                            </div>
                        </fieldset>
                    </div>
                </section>

                {{-- Section 4: เหตุผลการเปลี่ยนแปลง --}}
                <section class="rounded-xl border border-slate-200">
                    <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                        <span class="badge badge-neutral badge-sm">4</span>
                        <h3 class="font-semibold text-slate-700">เหตุผลการเปลี่ยนแปลง (Reason Change - update)</h3>
                    </header>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 p-4">

                        <fieldset class="fieldset col-span-2">
                            <legend class="fieldset-legend font-semibold">Cost Down</legend>
                            <div class="grid grid-flow-col grid-cols-2 gap-2" id="reason-cost-down-container">
                            </div>
                        </fieldset>

                        <fieldset class="fieldset lg:col-span-2">
                            <legend class="fieldset-legend font-semibold">Cost Up</legend>
                            <div class="grid grid-cols-1 gap-2" id="reason-cost-up-container">
                            </div>
                        </fieldset>

                        {{-- Basic condition revise --}}
                        <fieldset class="fieldset lg:col-span-2">
                            <legend class="fieldset-legend font-semibold">Basic condition revise</legend>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" id="reason-basic-condition-container">
                            </div>
                        </fieldset>

                          {{-- Estimate price --}}
                        <fieldset class="fieldset lg:col-span-2">
                            <legend class="fieldset-legend font-semibold">Estimate price</legend>
                            <div id="reason-estimate-price-container" class="grid grid-cols-1 gap-2">
                            </div>
                        </fieldset>

                        {{-- Detail contents --}}
                        <fieldset class="fieldset lg:col-span-2">
                            <legend class="fieldset-legend font-semibold">Detail contents</legend>
                            <textarea name="detail_contents" class="textarea w-full" rows="4" placeholder="ระบุรายละเอียดเพิ่มเติม..."></textarea>
                        </fieldset>
                    </div>
                </section>

                {{-- Section 5: ไฟล์แนบ --}}
                <section class="rounded-xl border border-slate-200">
                    <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                        <span class="badge badge-neutral badge-sm">5</span>
                        <h3 class="font-semibold text-slate-700">ไฟล์แนบ (Attach file)</h3>
                    </header>
                    <div class="flex flex-col gap-4 p-4">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Quotation price (E-Stamp)</legend>
                            <div class="join w-full">
                                <input type="file" name="file_quotation" accept="application/pdf" class="file-input join-item w-full req" data-message="Please attach quotation price file">
                            </div>
                            <p class="label">Attach file by pdf file</p>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Special Price Compare (E-Stamp)</legend>
                            <div class="join w-full">
                                <input type="file" name="file_price_compare" accept="application/pdf" class="file-input join-item w-full">
                            </div>
                            <p class="label">Attach file by pdf file</p>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Additional document</legend>
                            <div class="join w-full">
                                <input type="file" name="file_additional" accept="application/pdf" class="file-input join-item w-full">
                            </div>
                            <p class="label">Attach file by pdf file</p>
                        </fieldset>
                        {{-- <fieldset class="fieldset">
                            <legend class="fieldset-legend">Send Approved quotation to other section</legend>
                            <input type="text" name="send_approve_to" class="input w-full" placeholder="เช่น หัวหน้างาน, แผนก, e-mail">
                            <p class="label">ระบุตาม Current organize ได้เลย ระบุผู้ที่ต้องการส่ง เช่น หัวหน้างาน, แผนก, e-mail</p>
                        </fieldset> --}}
                    </div>
                </section>

                {{-- Section 6: หมายเหตุ --}}
                <section class="rounded-xl border border-info/30 bg-info/5 p-4">
                    <h3 class="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <i class="fi fi-rr-info text-info"></i>Remark
                    </h3>
                    <ul class="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Localization : Describe price, L/T and necessary stock month (quantity) of before and after</li>
                        <li>Basic condition revise : Describe condition of before and after</li>
                        <li>*(Conditions approval of Production Bulk / Material / Sub-Con and None Production [refer to BP-QP-B005])</li>
                    </ul>
                </section>

            </form>
            <div id="btnRequest" class="p-5"></div>
            {{-- <div class="flex justify-end gap-3 px-6 pb-6">
                <button type="button" class="btn btn-ghost" id="btn-cancel">Cancel</button>
                <button type="submit" form="form-price-approval" class="btn btn-primary">
                    <i class="fi fi-rr-paper-plane"></i>Submit
                </button>
            </div> --}}
        </div>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purPra.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection