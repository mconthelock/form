@extends('layouts/webflowTemplate')

@section('contents')
<div class="form-info hidden" 
     data-nfrmno="{{ $NFRMNO ?? '' }}"
     data-vorgno="{{ $VORGNO ?? '' }}"
     data-cyear="{{ $CYEAR ?? '' }}"
     data-cyear2="{{ $CYEAR2 ?? '' }}"
     data-nrunno="{{ $NRUNNO ?? '' }}"
     data-empno="{{ $EMPNO ?? '' }}"
     data-reqby="{{ $REQBY_EMPNO ?? '' }}"
     data-inputby="{{ $INPUTBY_EMPNO ?? '' }}"
     data-doc_no="{{ $DOC_NO ?? '' }}"
     data-doc_header_id="{{ $DOC_HEADER_ID ?? '' }}"
     data-status="{{ $STATUS ?? '' }}"
     data-is_auto_job="{{ $IS_AUTO_JOB ?? 'N' }}">
</div>

<input type="hidden" id="MODEHid">
<input type="hidden" id="EXTDATAHid">
<input type="hidden" id="EMPNOHid" value="{{ $EMPNO ?? '' }}">
<input type="hidden" id="IS_AUTO_JOBHid" value="{{ $IS_AUTO_JOB ?? 'N' }}">


<div class="load flex justify-center items-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
</div>

<div id="form" class="hidden max-w-7xl mx-auto space-y-6 pb-12">
    @include('feform.FE-ASP.detail_doc')
    @include('feform.FE-ASP.flow_spec')
</div>

<!-- Webflow Flow Progress Bar -->
<div class="flow mb-4"></div>
@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/feaspview.js') }}"></script>
@endsection