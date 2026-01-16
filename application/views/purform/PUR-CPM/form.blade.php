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

    label {
        width: 100%;
    }
</style>
@endsection

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2={{$mode !=1 ? $CYEAR2 : '' }} nrunno={{$mode !=1 ? $NRUNNO : '' }}></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-white w-full lg:w-[70rem] place-self-center shadow-sm">
        <div class="card-body p-6 lg:p-10">
            <h2 class="card-title justify-center">
                <h1 class="text-3xl text-center text-primary font-bold mb-15">Cover Payment For Invoice Receive</h1>
            </h2>
            <form id="form" class="flex flex-col gap-5">
                <section id="section-1">
                    <fieldset class="gap-4">
                        <span>Delivery locate: </span>
                        <label>
                            <input type="radio" name="delivery-locate" value="internal">
                            Internal AMEC 
                        </label>
                        <label>
                            <input type="radio" name="delivery-locate" value="outside">
                            Out Side AMEC 
                        </label>
                    </fieldset>
                    <fieldset class="gap-8">
                        <span>Invoice Type: </span>
                        <div class="flex flex-col gap-2 w-full">
                            <label>
                                <input type="radio" name="invoice-type" value="trial">
                                Trial Parts, Sample Parts (Ship to other)
                            </label>
                            <label>
                                <input type="radio" name="invoice-type" value="indirect">
                                Indirec Parts, None Production Parts (Ship direct to requester's area.)
                            </label>
                            <label>
                                <input type="radio" name="invoice-type" value="service">
                                Services / Construction / Building
                            </label>
                            <label>
                                <input type="radio" name="invoice-type" value="molds">
                                Molds, DIE
                            </label>
                            <label>
                                <input type="radio" name="invoice-type" value="machine">
                                Machine
                            </label>
                            <label>
                                <input type="radio" name="invoice-type" value="maintenance">
                                Maintenance, Rental, Software, etc.
                            </label>
                            <label >
                                <input type="radio" name="invoice-type" value="other">
                                Other
                            </label>
                            <input type="text" name="other-invoice" id="other-invoice" class="input input-sm w-full" disabled>
                        </div>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <section id="section-2">
                    <fieldset class="gap-8">
                        <span>Subject: </span>
                        <label>
                            <textarea name="subject" id="subject" maxlength="512" class="textarea w-full"></textarea>
                        </label>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <section id="section-3" >
                    <fieldset class="gap-8">
                        <span>ACCEPT P/O BY</span>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="flex items-center gap-2">
                                <input type="radio" name="accept-po" value="subcon">
                                <span class="text-nowrap w-fit">
                                    Sub-con / Vendor
                                </span>
                                <input type="text" name="subcon-detail" id="subcon-detail" class="input input-sm w-full" disabled>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="radio" name="accept-po" value="other">
                                <span class="text-nowrap w-fit">
                                    Other
                                </span>
                                <input type="text" name="other-accept" id="other-accept" class="input input-sm w-full" disabled>
                            </label>
                        </div>
                    </fieldset>
                    <div class="flex gap-8">
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-4">
                                <span>Quotation No.</span>
                                <label>
                                    <input type="text" name="quotation-no" id="quotation-no" class="input input-sm w-full">
                                </label>
                            </fieldset>
                            <fieldset class="gap-10">
                                <span>PR/PO No.</span>
                                <label>
                                    <input type="text" name="prpo-no" id="prpo-no" class="input input-sm w-full">
                                </label>
                            </fieldset>
                            <fieldset class="gap-9">
                                <span>P/O sign by</span>
                                <label>
                                    <input type="text" name="po-sign-by" id="po-sign-by" class="input input-sm w-full">
                                </label>
                            </fieldset>
                        </div>
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-11">
                                <span>Date: (version)</span>
                                <label>
                                    <input type="date" name="quo-date" id="quo-date" class="input input-sm w-full">
                                </label>
                            </fieldset>
                            <fieldset class="gap-2">
                                <span>Total Amount (THB)</span>
                                <label>
                                    <input type="text" name="total-amount" id="total-amount" class="input input-sm w-full">
                                </label>
                            </fieldset>
                            <fieldset class="gap-24">
                                <span>DATE : </span>
                                <label>
                                    <input type="date" name="po-sign-date" id="po-sign-date" class="input input-sm w-full">
                                </label>
                            </fieldset>
                        </div>
                    </div>
                    <fieldset class="flex-col">
                        <label>
                            <input type="radio" name="type-form" value="document">
                            Print out Documents or E-mail
                        </label>
                        <label>
                            <input type="radio" name="type-form" value="electronic">
                            Electronic Form (SCM)
                        </label>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <section id="section-4">
                    <div class="flex gap-8">
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-4">
                                <span>INVOICE NO.</span>
                                <label>
                                    <input type="text" name="invoice-no" id="invoice-no" class="input input-sm w-full">
                                </label>
                            </fieldset>
                            <fieldset class="gap-4">
                                <span>AMEC Person in charge</span>
                                <label>
                                    <input type="text" name="person-in-charge" id="person-in-charge" class="input input-sm w-full">
                                </label>
                            </fieldset>
                        </div>
                        <div class="flex flex-col gap-2 w-1/2">
                            <fieldset class="gap-4">
                                <span>Amount (THB)</span>
                                <label>
                                    <input type="text" name="invoice-amount" id="invoice-amount" class="input input-sm w-full">
                                </label>
                            </fieldset>
                            <fieldset class="gap-18">
                                <span>DATE : </span>
                                <label>
                                    <input type="date" name="person-in-charge-date" id="person-in-charge-date" class="input input-sm w-full">
                                </label>
                            </fieldset>
                        </div>
                    </div>
                </section>
                <div class="divider"></div>
                <section id="section-5">
                    <h2 class="font-bold text-xl mb-3">PAYMENT CONDITIONS & TERMS</h2>
                    <div class="flex gap-8 justify-between">
                        <fieldset class="flex-col gap-4">
                            <label>
                                <input type="radio" name="payment-type" value="first">
                                FIRST payment condition (If any)
                            </label>
                            <label>
                                <input type="radio" name="payment-type" value="second">
                                2 <sup>nd</sup> payment condition or
                            </label>
                            <label>
                                <input type="radio" name="payment-type" value="others">
                                <input type="text" name="num-payment" id="num-payment" disabled="disabled" class="input input-sm w-24">
                                payment condition (If any)
                            </label>
                            <label>
                                <input type="radio" name="payment-type" value="final">
                                Final payment condition (or 100% payment)
                            </label>
                        </fieldset>
                        <fieldset>
                            <label>
                                (THB)
                                <input type="number" name="payment" id="payment" class="input input-sm w-48" disabled>
                            </label>
                        </fieldset>
                    </div>
                </section>
            </form>
            <div class="divider"></div>
            <div id="btnAction"></div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purCpm.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection