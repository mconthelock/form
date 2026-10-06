@extends('layouts/webflowTemplate')

@section('contents')
    <input type="text" class="hidden" id="NFRMNO" value="{{ $NFRMNO }}" />
    <input type="text" class="hidden" id="VORGNO" value="{{ $VORGNO }}" />
    <input type="text" class="hidden" id="CYEAR" value="{{ $CYEAR }}" />
    <input type="text" class="hidden" id="CYEAR2" value="{{ $CYEAR }}" />
    <input type="text" class="hidden" id="NRUNNO" value="{{ $NRUNNO }}" />
    <input type="text" class="hidden" id="EMPNO" value="{{ $EMPNO }}" />
    <section class="flex flex-col gap-3 mb-4">
        <h1 class="text-3xl font-bold text-primary"> Computer program Requisition Form </h1>
        {{-- Request User --}}
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5"></fieldset>
    </section>
@endsection
