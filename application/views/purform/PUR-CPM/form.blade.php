@extends('layouts/webflowTemplate')

@section('styles')
<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    fieldset:not(:has(.fieldset-label)) {
        display: flex;
    }

    fieldset span {
        font-weight: bold;
        white-space: nowrap;
        width: fit-content;
    }

    label:not(:has(input[name="DELIVELY"])):not(:has(input[name="FORM_TYPE"])) {
        width: 100%;
    }

    span.required::after, h2.required::after {
        content: "**";
        color: red;
        font-weight: bold;
        padding-left: 0.25rem;
    }
</style>
@endsection

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}" return="{{$return ?? ''}}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-white w-full lg:w-[70rem] place-self-center shadow-sm">
        <div class="card-body p-6 lg:p-10">
            <h2 class="card-title justify-center">
                <h1 class="text-3xl text-center text-primary font-bold mb-15">Cover Payment For Invoice Receiving</h1>
            </h2>
            <form id="form" class="flex flex-col gap-5">
                <section id="section-0">
                    <fieldset class="flex gap-12">
                        <span>Input by</span>
                        <label>
                            <input type="text" name="INPUTBY" id="INPUTBY" class="input input-sm w-40" value="{{$empno}}" readonly>
                        </label>
                    </fieldset>
                    <fieldset class="flex gap-3">
                        <span class="required">Request by</span>
                        <label>
                            <input type="text" name="REQBY" id="REQBY" class="input input-sm w-40 req">
                        </label>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <section id="section-1">
                    <fieldset class="gap-4">
                        <span class="required">Delivery locate: </span>
                        <label>
                            <input type="radio" name="DELIVELY" value="Internal AMEC" class="radio radio-xs req">
                            Internal AMEC 
                        </label>
                        <label>
                            <input type="radio" name="DELIVELY" value="Out Side AMEC" class="radio radio-xs req">
                            Out Side AMEC 
                        </label>
                    </fieldset>
                    <fieldset class="gap-8">
                        <span class="required">Invoice Type: </span>
                        <div class="flex flex-col gap-2 w-full">
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Trial Parts, Sample Parts (Ship to other)" class="checkbox checkbox-xs req" i-type="trial">
                                Trial Parts, Sample Parts (Ship to other)
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Indirec Parts, None Production Parts (Ship direct to requester's area.)" class="checkbox checkbox-xs req" i-type="indirec">
                                Indirec Parts, None Production Parts (Ship direct to requester's area.)
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Services / Construction / Building" class="checkbox checkbox-xs req" i-type="service">
                                Services / Construction / Building
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Molds, DIE" class="checkbox checkbox-xs req" i-type="molds">
                                Molds, DIE
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Machine" class="checkbox checkbox-xs req" i-type="machine">
                                Machine
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Maintenance, Rental, Software, etc." class="checkbox checkbox-xs req" i-type='maintenance'>
                                Maintenance, Rental, Software, etc.
                            </label>
                            <label >
                                <input type="checkbox" name="INVOICE_TYPE" value="Other" class="checkbox checkbox-xs req" i-type='other'>
                                Other
                            </label>
                            <input type="text" name="INVOICE_OTHER" id="INVOICE_OTHER" class="input input-sm w-full" disabled>
                        </div>
                    </fieldset>
                    <fieldset class="gap-10 hidden!" id="third-party-fieldset">
                        <span class="required">Third Party: </span>
                        <label>
                            <select name="THIRD_PARTY" id="THIRD_PARTY" class="select select-sm w-full" placeholder="Select third party"></select>
                        </label>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <section id="section-2">
                    <fieldset class="gap-8">
                        <span class="required">Subject: </span>
                        <label>
                            <textarea name="SUBJECT" id="SUBJECT" maxlength="512" class="textarea w-full req" placeholder="Device UTP Cat6 for LAN Access point (2 Points) ESA Factory"></textarea>
                        </label>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <section id="section-3" >
                    <fieldset class="gap-8">
                        <span>ACCEPT P/O BY</span>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="flex items-center gap-2">
                                <input type="radio" name="ACCEPT_PO" value="Sub-con / Vendor" class="radio radio-xs" a-type="subcon">
                                <span class="text-nowrap w-fit">
                                    Sub-con / Vendor
                                </span>
                                <input type="text" name="ACCEPT_SUBCON" id="ACCEPT_SUBCON" class="input input-sm w-full" placeholder="CREATOR DESIGN SYSTEM CO.,LTD." disabled>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="radio" name="ACCEPT_PO" value="Other" class="radio radio-xs" a-type="other">
                                <span class="text-nowrap w-fit">
                                    Other
                                </span>
                                <input type="text" name="ACCEPT_OTHER" id="ACCEPT_OTHER" class="input input-sm w-full" disabled>
                            </label>
                        </div>
                    </fieldset>
                    <div class="flex gap-8">
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-4">
                                <span>Quotation No.</span>
                                <label>
                                    <input type="text" name="QUOTATION" id="QUOTATION" class="input input-sm w-full" placeholder="CDS-2K24-00074">
                                </label>
                            </fieldset>
                            <fieldset class="gap-10">
                                <span>PR/PO No.</span>
                                <label>
                                    <input type="text" name="PONO" id="PONO" class="input input-sm w-full" placeholder="AMEC00440693">
                                </label>
                            </fieldset>
                            {{-- <fieldset class="gap-9">
                                <span>P/O sign by</span>
                                <label>
                                    <input type="text" name="PO_SIGNBY" id="PO_SIGNBY" class="input input-sm w-full">
                                </label>
                            </fieldset> --}}
                        </div>
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-2">
                                <span>Date: (version)</span>
                                <label>
                                    <input type="date" name="QUOTATION_DATE" id="QUOTATION_DATE" class="input input-sm w-full fdate" placeholder="2026-01-19">
                                </label>
                            </fieldset>
                            <fieldset class="gap-3">
                                <span>Total Amount</span>
                                <label class="flex gap-2">
                                    <input type="number" step="1" min="0" name="TOTAL_AMOUNT" id="TOTAL_AMOUNT" class="input input-sm w-full" placeholder="47,300.00">
                                    <select id="curr-total" class="select select-sm w-fit min-w-16 currency">
                                    </select>
                                </label>
                            </fieldset>
                            {{-- <fieldset class="gap-24">
                                <span>DATE : </span>
                                <label>
                                    <input type="date" name="PO_SIGNDATE" id="PO_SIGNDATE" class="input input-sm w-full fdate" placeholder="2026-01-19">
                                </label>
                            </fieldset> --}}
                        </div>
                    </div>
                    {{-- <fieldset class="gap-4">
                        <label>
                            <input type="radio" name="FORM_TYPE" value="Print out Documents or E-mail" class="radio radio-xs">
                            Print out Documents or E-mail
                        </label>
                        <label>
                            <input type="radio" name="FORM_TYPE" value="Electronic Form (SCM)" class="radio radio-xs">
                            Electronic Form (SCM)
                        </label>
                    </fieldset> --}}
                </section>
                <div class="divider"></div>
                <section id="section-4">
                    <div class="flex gap-8">
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-4">
                                <span class="required">INVOICE NO.</span>
                                <label>
                                    <input type="text" name="INVOICE_NO" id="INVOICE_NO" class="input input-sm w-full req" placeholder="INV68-00109, 110">
                                </label>
                            </fieldset>
                            <fieldset class="gap-4">
                                <span>AMEC Person in charge</span>
                                <label>
                                    <input type="text" name="PERSON_INCHARGE" id="PERSON_INCHARGE" class="input input-sm w-full">
                                </label>
                            </fieldset>
                        </div>
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-4">
                                <span class="required">Amount</span>
                                <label class="flex gap-2">
                                    <input type="number" step="1" min="0" name="INVOICE_AMOUNT" id="INVOICE_AMOUNT" class="input input-sm w-full req" placeholder="47,300.00">
                                    <select id="curr-invoice" class="select select-sm w-fit min-w-16 currency">
                                    </select>
                                </label>
                            </fieldset>
                            <fieldset class="gap-11">
                                <span>DATE : </span>
                                <label>
                                    <input type="date" name="INVOICE_DATE" id="INVOICE_DATE" class="input input-sm w-full fdate" placeholder="2026-01-19">
                                </label>
                            </fieldset>
                        </div>
                    </div>
                </section>
                <div class="divider"></div>
                <section id="section-5">
                    <h2 class="font-bold text-xl mb-3 required">PAYMENT CONDITIONS & TERMS</h2>
                    <div class="flex gap-8 justify-between">
                        <fieldset class="flex-col gap-4">
                            <label>
                                <input type="radio" name="PAYMENT_TYPE" value="payment condition (If any)" p-type="manual" class="radio radio-xs req">
                                <input type="number" step="1" min="1" name="PAYMENT_NUM" id="PAYMENT_NUM" disabled="disabled" class="input input-sm w-24" placeholder="1">
                                payment condition (If any)
                            </label>
                            <label>
                                <input type="radio" name="PAYMENT_TYPE" value="Final payment condition (or 100% payment)" p-type="final" class="radio radio-xs req">
                                Final payment condition (or 100% payment)
                            </label>
                            <div>
                            </div>
                        </fieldset>
                        <fieldset>
                            <label>
                                <span class="required"></span>
                                <input type="number" step="1" min="0" name="PAYMENT" id="PAYMENT" class="input input-sm w-48 req" placeholder="47,300.00" disabled>
                                <select id="curr-payment" class="select select-sm w-fit min-w-16 currency">
                                    </select>
                            </label>
                        </fieldset>
                    </div>
                </section>
                <textarea name="PAYMENT_DETAIL" id="PAYMENT_DETAIL" maxlength="3000" class="textarea w-full" placeholder=""></textarea>
                <div class="divider"></div>
                <section>
                    <h2 class="font-bold text-xl mb-3 required">Attach files</h2>
                    <fieldset class="flex-col gap-2">
                        <label class="hidden attach-file" id="attach-po">
                            <input type="checkbox" name="ATTACH_TYPE" value="P/O Confirmation" class="checkbox checkbox-xs" a-type="po">
                            P/O Confirmation
                        </label>
                        <label class="hidden attach-file" id="attach-equipment">
                            <input type="checkbox" name="ATTACH_TYPE" value="Equipment Evaluation Report" class="checkbox checkbox-xs" a-type="equipment">
                            Equipment Evaluation Report
                        </label>
                        <label class="hidden attach-file" id="attach-thirdparty">
                            <input type="checkbox" name="ATTACH_TYPE" value="Third Party Confirmation" class="checkbox checkbox-xs" a-type="thirdparty">
                            Third Party Confirmation
                        </label>
                        <label class="hidden attach-file" id="attach-delivery">
                            <input type="checkbox" name="ATTACH_TYPE" value="Delivery Confirmation" class="checkbox checkbox-xs" a-type="delivery">
                            Delivery Confirmation
                        </label>
                        <label class="hidden attach-file" id="attach-part">
                            <input type="checkbox" name="ATTACH_TYPE" value="Part Evaluation /Audit Report" class="checkbox checkbox-xs" a-type="part">
                            Part Evaluation /Audit Report
                        </label>
                        <label class="hidden attach-file" id="attach-asset">
                            <input type="checkbox" name="ATTACH_TYPE" value='"Asset use Agreement" or "Request Equipment to Outside" Sheet.(for Outside Asset)' class="checkbox checkbox-xs" a-type="asset">
                            "Asset use Agreement" or "Request Equipment to Outside" Sheet.(for Outside Asset)
                        </label>
                        <label class="hidden attach-file flex items-center gap-2" id="attach-other">
                            <input type="checkbox" name="ATTACH_TYPE" value="Other" class="checkbox checkbox-xs" a-type="other">
                            Other
                            <input type="text" name="ATTACH_OTHER" id="ATTACH_OTHER" class="input input-sm w-full" disabled>
                        </label>
                    </fieldset>
                    <div id="attachFile"></div>
                </section>
                <div class="divider"></div>
                <div id="form-action-container"></div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purCpm.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection