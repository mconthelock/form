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

    .radio:disabled,
    .checkbox:disabled {
        opacity: 1;
    }

    .subject-text {
        width: 100% !important;
        white-space: pre-wrap;
        /* รักษา \r\n และ space */
        line-height: 2em;
        background-image: linear-gradient(to bottom,
                transparent 1.9em,
                #000 2em);
        background-size: 100% 2em;
    }
</style>
@endsection

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-white w-full lg:w-[70rem] place-self-center shadow-sm">
        <div class="card-body p-6 lg:p-10">
            <h2 class="card-title justify-center">
                <h1 class="text-3xl text-center text-primary font-bold mb-15">Cover Payment For Invoice Receiving</h1>
            </h2>
            <form id="form" class="flex flex-col gap-5">
                <section id="section-0">
                </section>
                <div class="divider"></div>
                <section id="section-1">
                    <fieldset class="gap-4">
                        <span class="required">Delivery locate: </span>
                        <label>
                            <input type="radio" name="DELIVELY" value="Internal AMEC" class="radio radio-xs req"
                                disabled>
                            Internal AMEC
                        </label>
                        <label>
                            <input type="radio" name="DELIVELY" value="Out Side AMEC" class="radio radio-xs req"
                                disabled>
                            Out Side AMEC
                        </label>
                    </fieldset>
                    <fieldset class="gap-8">
                        <span class="required">Invoice Type: </span>
                        <div class="flex flex-col gap-2 w-full">
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE"
                                    value="Trial Parts, Sample Parts (Ship to other)" class="checkbox checkbox-xs req"
                                    i-type="trial" disabled>
                                Trial Parts, Sample Parts (Ship to other)
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE"
                                    value="Indirec Parts, None Production Parts (Ship direct to requester's area.)"
                                    class="checkbox checkbox-xs req" i-type="indirec" disabled>
                                Indirec Parts, None Production Parts (Ship direct to requester's area.)
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Services / Construction / Building"
                                    class="checkbox checkbox-xs req" i-type="service" disabled>
                                Services / Construction / Building
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Molds, DIE"
                                    class="checkbox checkbox-xs req" i-type="molds" disabled>
                                Molds, DIE
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Machine"
                                    class="checkbox checkbox-xs req" i-type="machine" disabled>
                                Machine
                            </label>
                            <label>
                                <input type="checkbox" name="INVOICE_TYPE" value="Maintenance, Rental, Software, etc."
                                    class="checkbox checkbox-xs req" i-type='maintenance' disabled>
                                Maintenance, Rental, Software, etc.
                            </label>
                            <div class="w-full flex gap-5">
                                <label class="w-16!">
                                    <input type="checkbox" name="INVOICE_TYPE" value="Other"
                                        class="checkbox checkbox-xs req" i-type='other' disabled>
                                    Other
                                </label>
                                <span class="subject-text" id="INVOICE_OTHER"></span>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset class="gap-10 hidden!">
                        <span class="required">Third Party: </span>
                        <span id="THIRD_PARTY"></span>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <section id="section-2">
                    <fieldset class="gap-8">
                        <span class="required leading-[2em]">Subject: </span>
                        <label>
                            <div id="SUBJECT" class="subject-text"></div>
                            {{-- <textarea name="SUBJECT" id="SUBJECT" maxlength="512" class="textarea w-full req"
                                placeholder="Device UTP Cat6 for LAN Access point (2 Points) ESA Factory"
                                disabled></textarea> --}}
                        </label>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <section id="section-3">
                    <fieldset class="gap-8">
                        <span>ACCEPT P/O BY</span>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="flex items-center gap-2">
                                <input type="radio" name="ACCEPT_PO" value="Sub-con / Vendor" class="radio radio-xs"
                                    a-type="subcon" disabled>
                                <span class="text-nowrap w-fit">
                                    Sub-con / Vendor
                                </span>
                                <div id="ACCEPT_SUBCON" class="subject-text"></div>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="radio" name="ACCEPT_PO" value="Other" class="radio radio-xs" a-type="other"
                                    disabled>
                                <span class="text-nowrap w-fit">
                                    Other
                                </span>
                                <div id="ACCEPT_OTHER" class="subject-text"></div>
                            </label>
                        </div>
                    </fieldset>
                    <div class="flex gap-8">
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-4">
                                <span>Quotation No.</span>
                                <div id="QUOTATION" class="subject-text"></div>
                            </fieldset>
                            <fieldset class="gap-10">
                                <span>PR/PO No.</span>
                                <div id="PONO" class="subject-text"></div>
                            </fieldset>
                            {{-- <fieldset class="gap-9">
                                <span>P/O sign by</span>
                                <div id="PO_SIGNBY" class="subject-text"></div>
                            </fieldset> --}}
                        </div>
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-11">
                                <span>Date: (version)</span>
                                <div id="QUOTATION_DATE" class="subject-text"></div>
                            </fieldset>
                            <fieldset class="gap-2">
                                <span>Total Amount (THB)</span>
                                <div id="TOTAL_AMOUNT" class="subject-text"></div>
                            </fieldset>
                            {{-- <fieldset class="gap-24">
                                <span>DATE : </span>
                                <div id="PO_SIGNDATE" class="subject-text"></div>
                            </fieldset> --}}
                        </div>
                    </div>
                    {{-- <fieldset class="gap-4">
                        <label>
                            <input type="radio" name="FORM_TYPE" value="Print out Documents or E-mail"
                                class="radio radio-xs" disabled>
                            Print out Documents or E-mail
                        </label>
                        <label>
                            <input type="radio" name="FORM_TYPE" value="Electronic Form (SCM)" class="radio radio-xs"
                                disabled>
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
                                <div id="INVOICE_NO" class="subject-text"></div>
                            </fieldset>
                            <fieldset class="gap-4">
                                <span>AMEC Person in charge</span>
                                <div id="PERSON_INCHARGE" class="subject-text"></div>
                            </fieldset>
                        </div>
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-8">
                                <span class="required">Amount (THB)</span>
                                <div id="INVOICE_AMOUNT" class="subject-text"></div>
                            </fieldset>
                            <fieldset class="gap-22">
                                <span>DATE : </span>
                                <div id="INVOICE_DATE" class="subject-text"></div>
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
                                <input type="radio" name="PAYMENT_TYPE" value="payment condition (If any)"
                                    p-type="manual" class="radio radio-xs req" disabled>
                                <span id="PAYMENT_NUM" class="subject-text"></span>
                                payment condition (If any)
                            </label>
                            <label>
                                <input type="radio" name="PAYMENT_TYPE"
                                    value="Final payment condition (or 100% payment)" p-type="final"
                                    class="radio radio-xs req" disabled>
                                Final payment condition (or 100% payment)
                            </label>
                            <div>
                            </div>
                        </fieldset>
                        <fieldset>
                            <span id="PAYMENT" class="mr-5"></span>
                            <label>
                                <span class="required">(THB)</span>
                            </label>
                        </fieldset>
                    </div>
                </section>
                <div id="PAYMENT_DETAIL" class="subject-text"></div>
                <div class="divider"></div>
                <section>
                    <h2 class="font-bold text-xl mb-3 required">Attach files</h2>
                    <fieldset class="flex-col gap-2">
                        <label class="hidden attach-file" id="attach-po">
                            <input type="checkbox" name="ATTACH_TYPE" value="P/O Confirmation"
                                class="checkbox checkbox-xs" a-type="po" disabled>
                            P/O Confirmation
                        </label>
                        <label class="hidden attach-file" id="attach-equipment">
                            <input type="checkbox" name="ATTACH_TYPE" value="Equipment Evaluation Report"
                                class="checkbox checkbox-xs" a-type="equipment" disabled>
                            Equipment Evaluation Report
                        </label>
                        <label class="hidden attach-file" id="attach-thirdparty">
                            <input type="checkbox" name="ATTACH_TYPE" value="Third Party Confirmation"
                                class="checkbox checkbox-xs" a-type="thirdparty" disabled>
                            Third Party Confirmation
                        </label>
                        <label class="hidden attach-file" id="attach-delivery">
                            <input type="checkbox" name="ATTACH_TYPE" value="Delivery Confirmation"
                                class="checkbox checkbox-xs" a-type="delivery" disabled>
                            Delivery Confirmation
                        </label>
                        <label class="hidden attach-file" id="attach-part">
                            <input type="checkbox" name="ATTACH_TYPE" value="Part Evaluation /Audit Report"
                                class="checkbox checkbox-xs" a-type="part" disabled>
                            Part Evaluation /Audit Report
                        </label>
                        <label class="hidden attach-file" id="attach-asset">
                            <input type="checkbox" name="ATTACH_TYPE"
                                value='"Asset use Agreement" or "Request Equipment to Outside" Sheet.(for Outside Asset)'
                                class="checkbox checkbox-xs" a-type="asset" disabled>
                            "Asset use Agreement" or "Request Equipment to Outside" Sheet.(for Outside Asset)
                        </label>
                        <label class="hidden attach-file flex items-center gap-2" id="attach-other">
                            <input type="checkbox" name="ATTACH_TYPE" value="Other" class="checkbox checkbox-xs"
                                a-type="other" disabled>
                            Other
                            <div id="ATTACH_OTHER" class="subject-text"></div>
                        </label>
                    </fieldset>
                    <div id="attachFile"></div>
                </section>
                <div class="divider"></div>
                <div id="btnAction"></div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purCpm.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection