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
                                    <input type="text" name="PRICE_COMPARE_NO" id="PRICE_COMPARE_NO" readonly class="grow req">
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
                            <legend class="fieldset-legend req">Vendor Name</legend>
                            <input type="text" name="VVENDOR_NAME" id="VVENDOR_NAME" class="input w-full" readonly>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Vendor Code</legend>
                            <input type="text" name="VVENDOR" id="VVENDOR" class="input w-full" readonly>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Planner Code</legend>
                            <input type="text" name="VPLANNER" id="VPLANNER" class="input w-full" readonly>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Material Code</legend>
                            <input type="text" name="VMATERIAL_CODE" id="VMATERIAL_CODE" class="input w-full req" placeholder="กรอก Material Code" data-message="Please enter material code">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Maker (Business route)</legend>
                            <input type="text" name="VMAKER" id="VMAKER" class="input w-full req" placeholder="กรอก Maker" data-message="Please enter maker">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Part Name</legend>
                            <input type="text" name="VPART_NAME" id="VPART_NAME" class="input w-full req" placeholder="กรอก Part Name" data-message="Please enter part name">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Model Name</legend>
                            <input type="text" name="VMODEL_NAME" id="VMODEL_NAME" class="input w-full" placeholder="กรอก Model Name">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Job Item</legend>
                            <input type="text" name="VJOB_ITEM" id="VJOB_ITEM" class="input w-full" placeholder="กรอก Job Item">
                        </fieldset>

                        {{-- PCS Committee --}}
                        <fieldset class="fieldset md:col-span-2">
                            <legend class="fieldset-legend">PCS Committee</legend>
                            <div class="flex flex-wrap gap-2">
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="checkbox" name="pcs_committee[]" value="AB" class="checkbox checkbox-sm checkbox-primary">
                                    <span class="label-text">AB : [SPR], [R&amp;D]</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="checkbox" name="pcs_committee[]" value="C" class="checkbox checkbox-sm checkbox-primary">
                                    <span class="label-text">C : [IE]</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="checkbox" name="pcs_committee[]" value="D" class="checkbox checkbox-sm checkbox-primary">
                                    <span class="label-text">D : [MCC]</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="checkbox" name="pcs_committee[]" value="E" class="checkbox checkbox-sm checkbox-primary">
                                    <span class="label-text">E : [PS]</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="checkbox" name="pcs_committee[]" value="F" class="checkbox checkbox-sm checkbox-primary">
                                    <span class="label-text">F : [ESE]</span>
                                </label>
                            </div>
                        </fieldset>

                        {{-- Group --}}
                        <fieldset class="fieldset md:col-span-2">
                            <legend class="fieldset-legend">Group</legend>
                            <div class="flex flex-wrap gap-2">
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="group" value="Bulk" class="radio radio-sm radio-primary">
                                    <span class="label-text">Bulk</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="group" value="JOP" class="radio radio-sm radio-primary">
                                    <span class="label-text">JOP</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="group" value="Sub-Con" class="radio radio-sm radio-primary">
                                    <span class="label-text">Sub-Con</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="group" value="Indirect" class="radio radio-sm radio-primary">
                                    <span class="label-text">Indirect</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="group" value="Sample" class="radio radio-sm radio-primary">
                                    <span class="label-text">Sample</span>
                                </label>
                                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                    <input type="radio" name="group" value="Others" class="radio radio-sm radio-primary">
                                    <span class="label-text">Others</span>
                                </label>
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
                            <label class="input w-full">
                                <input type="text" name="NTOTAL_PRES" id="NTOTAL_PRES" class="grow text-right" readonly>
                                <span class="badge badge-ghost badge-sm">Col. AA</span>
                            </label>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">New Total Price</legend>
                            <label class="input w-full">
                                <input type="text" name="NTOTAL_NEW" id="NTOTAL_NEW" class="grow text-right" readonly>
                                <span class="badge badge-ghost badge-sm">Col. BB</span>
                            </label>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Cost Down (+) / Cost Up (-) Amount</legend>
                            <label class="input w-full">
                                <input type="text" name="NTOTAL_COST" id="NTOTAL_COST" class="grow text-right" readonly>
                                <span class="badge badge-ghost badge-sm">Col. CC</span>
                            </label>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend req">Cost Down (+) / Cost Up (-) Ratio %</legend>
                            <label class="input w-full">
                                <input type="text" name="NTOTAL_RATIO" id="NTOTAL_RATIO" class="grow text-right" readonly>
                                <span class="badge badge-ghost badge-sm">Col. DD</span>
                            </label>
                            <p class="label">จาก Price comparison</p>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Effective Month</legend>
                            <input type="month" name="effective_month" class="input w-full req" data-message="Please select effective month">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Effective Type</legend>
                            <label class="label cursor-pointer justify-start gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                                <input type="radio" name="effective_type" value="Others" class="radio radio-sm radio-primary">
                                <span class="label-text">Others</span>
                            </label>
                            <input type="text" name="effective_type_other" class="input w-full mt-2" placeholder="Incase other ; need to input data">
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

                        {{-- Negotiation --}}
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-semibold">Negotiation</legend>
                            <div class="flex flex-col gap-2">
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="neg_compare" class="radio radio-sm radio-primary">
                                    <span class="label-text">Compare with Other vendors / MELINA or AMEC's Price / Other</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="neg_hq" class="radio radio-sm radio-primary">
                                    <span class="label-text">MELCO HQ Central purchasing / MELINA Global integrated price</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="neg_material" class="radio radio-sm radio-primary">
                                    <span class="label-text">Material Cost / Freight Cost</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="neg_moq" class="radio radio-sm radio-primary">
                                    <span class="label-text">MOQ Change</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="neg_cost_eval" class="radio radio-sm radio-primary">
                                    <span class="label-text">Cost evaluation</span>
                                </label>
                                <div class="flex items-center gap-2">
                                    <label class="label cursor-pointer justify-start gap-2 shrink-0">
                                        <input type="radio" name="reason" value="neg_other" class="radio radio-sm radio-primary">
                                        <span class="label-text">Other</span>
                                    </label>
                                    <input type="text" name="reason_neg_other" class="input input-sm w-full max-w-xs" placeholder="ระบุเหตุผล">
                                </div>
                            </div>
                        </fieldset>

                        {{-- Change --}}
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-semibold">Change</legend>
                            <div class="flex flex-col gap-2">
                                <div class="flex flex-wrap items-center gap-2">
                                    <label class="label cursor-pointer justify-start gap-2 shrink-0">
                                        <input type="radio" name="reason" value="share_shift" class="radio radio-sm radio-primary">
                                        <span class="label-text">Share Shift</span>
                                    </label>
                                    <span class="text-xs text-slate-400">from</span>
                                    <input type="text" name="share_shift_from" class="input input-sm w-32">
                                    <span class="text-xs text-slate-400">to</span>
                                    <input type="text" name="share_shift_to" class="input input-sm w-32">
                                </div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <label class="label cursor-pointer justify-start gap-2 shrink-0">
                                        <input type="radio" name="reason" value="maker_change" class="radio radio-sm radio-primary">
                                        <span class="label-text">Maker Change</span>
                                    </label>
                                    <span class="text-xs text-slate-400">from</span>
                                    <input type="text" name="maker_change_from" class="input input-sm w-32">
                                    <span class="text-xs text-slate-400">to</span>
                                    <input type="text" name="maker_change_to" class="input input-sm w-32">
                                </div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <label class="label cursor-pointer justify-start gap-2 shrink-0">
                                        <input type="radio" name="reason" value="route_change" class="radio radio-sm radio-primary">
                                        <span class="label-text">Business route change</span>
                                    </label>
                                    <span class="text-xs text-slate-400">from</span>
                                    <input type="text" name="route_change_from" class="input input-sm w-32">
                                    <span class="text-xs text-slate-400">to</span>
                                    <input type="text" name="route_change_to" class="input input-sm w-32">
                                </div>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="localization" class="radio radio-sm radio-primary">
                                    <span class="label-text">Localization</span>
                                </label>
                                <div class="flex items-center gap-2">
                                    <label class="label cursor-pointer justify-start gap-2 shrink-0">
                                        <input type="radio" name="reason" value="ve_proposal" class="radio radio-sm radio-primary">
                                        <span class="label-text">VE proposal</span>
                                    </label>
                                    <input type="text" name="ve_proposal_detail" class="input input-sm w-full max-w-xs">
                                </div>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="air_fee" class="radio radio-sm radio-primary">
                                    <span class="label-text">Air fee</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="other" class="radio radio-sm radio-primary">
                                    <span class="label-text">Other</span>
                                </label>
                            </div>
                        </fieldset>

                        {{-- Basic condition revise --}}
                        <fieldset class="fieldset lg:col-span-2">
                            <legend class="fieldset-legend font-semibold">Basic condition revise</legend>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_validity" class="radio radio-sm radio-primary">
                                    <span class="label-text">Update period of validity</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_exchange" class="radio radio-sm radio-primary">
                                    <span class="label-text">Exchange rate</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_mt" class="radio radio-sm radio-primary">
                                    <span class="label-text">MT (MELINA Knockdown)</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_mts" class="radio radio-sm radio-primary">
                                    <span class="label-text">MT-S</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_mtt" class="radio radio-sm radio-primary">
                                    <span class="label-text">MT-T</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_copper" class="radio radio-sm radio-primary">
                                    <span class="label-text">Copper</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_aluminum" class="radio radio-sm radio-primary">
                                    <span class="label-text">Aluminum</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_adc12" class="radio radio-sm radio-primary">
                                    <span class="label-text">ADC12</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_nddy" class="radio radio-sm radio-primary">
                                    <span class="label-text">Nd, Dy</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_nicr" class="radio radio-sm radio-primary">
                                    <span class="label-text">Ni, Cr</span>
                                </label>
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="bcr_oil" class="radio radio-sm radio-primary">
                                    <span class="label-text">Oil</span>
                                </label>
                                <div class="flex items-center gap-2">
                                    <label class="label cursor-pointer justify-start gap-2 shrink-0">
                                        <input type="radio" name="reason" value="bcr_others" class="radio radio-sm radio-primary">
                                        <span class="label-text">Others</span>
                                    </label>
                                    <input type="text" name="reason_bcr_others" class="input input-sm w-full max-w-[10rem]">
                                </div>
                            </div>
                            <div class="flex flex-wrap items-center gap-3 mt-2">
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="radio" name="reason" value="estimate_price" class="radio radio-sm radio-primary">
                                    <span class="label-text">Estimate price</span>
                                </label>
                                <span class="badge badge-info badge-outline">PO issue with temporary price</span>
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
                                <button type="button" class="btn btn-neutral join-item" data-view-record="quotation">
                                    <i class="fi fi-rr-eye"></i>View record
                                </button>
                            </div>
                            <p class="label">Attach file by pdf file</p>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Special Price Compare (E-Stamp)</legend>
                            <div class="join w-full">
                                <input type="file" name="file_price_compare" accept="application/pdf" class="file-input join-item w-full">
                                <button type="button" class="btn btn-neutral join-item" data-view-record="price_compare">
                                    <i class="fi fi-rr-eye"></i>View record
                                </button>
                            </div>
                            <p class="label">Attach file by pdf file</p>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Additional document</legend>
                            <div class="join w-full">
                                <input type="file" name="file_additional" accept="application/pdf" class="file-input join-item w-full">
                                <button type="button" class="btn btn-neutral join-item" data-view-record="additional">
                                    <i class="fi fi-rr-eye"></i>View record
                                </button>
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