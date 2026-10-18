@extends('layouts/webflowTemplate')

@section('contents')
<div class="hidden form-info" 
     data-nfrmno="{{ $NFRMNO ?? '' }}" 
     data-vorgno="{{ $VORGNO ?? '' }}" 
     data-cyear="{{ $CYEAR ?? '' }}" 
     data-cyear2="{{ $CYEAR2 ?? '' }}" 
     data-nrunno="{{ $NRUNNO ?? '' }}" 
     data-empno="{{ $EMPNO ?? '' }}" 
     data-doc_no="{{ $DOC_NO ?? '' }}"
     data-doc_header_id="{{ $DOC_HEADER_ID ?? '' }}"
     data-doc_type_code="{{ $DOC_TYPE_CODE ?? '' }}"
     data-status="{{ $STATUS ?? '' }}"
     data-reqby="{{ $REQBY ?? '' }}"
     data-inputby="{{ $INPUTBY ?? '' }}"
     >
</div>

<input type="hidden" name="MODEHid" id="MODEHid" value="{{ $MODE ?? '1' }}" />
<input type="hidden" name="EXTDATAHid" id="EXTDATAHid" value="{{ $EXTDATA ?? '' }}" />
<input type="hidden" name="EMPNOHid" id="EMPNOHid" value="{{ $EMPNO }}" />

<div class="flex flex-col w-full px-4 my-6 font-sans max-w-6xl mx-auto">
    <div class="card bg-white w-full shadow-md border border-slate-200 rounded-2xl">
        
        <!-- Skeleton Loader -->
        <div class="load flex flex-col gap-5 p-8">
            <div class="skeleton h-14 w-full rounded-xl"></div>
            <div class="skeleton h-72 w-full rounded-xl"></div>
        </div>

        <form class="card-body p-6 sm:p-8 hidden" id="form">
            <!-- Header Top Bar -->
            <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                <div>
                    <h1 class="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                        FE Document Approval (FE_DOC)
                    </h1>
                    <p class="text-xs text-slate-400 font-medium">ระบบจัดเก็บและประทับตรารับรองเอกสารอิเล็กทรอนิกส์</p>
                </div>
                <div>
                    <span class="badge badge-sm font-bold uppercase tracking-wider shadow-xs" id="StatusBadge">
                        {{ $STATUS ?: 'DRAFT' }}
                    </span>
                </div>
            </div>

            <!-- ส่วนที่ 1: ดึงรายละเอียดเอกสารและโซนอัปโหลด -->
            @include('feform.FE-DOC.detail_doc')

            <!-- ส่วนที่ 2: ดึงระบบปุ่ม Workflow และ Remark -->
            @include('feform.FE-DOC.flow_spec')
        </form>
    </div>
</div>

<!-- Webflow Diagram Flow -->
<div class="flow max-w-6xl mx-auto px-4 mt-6"></div>
@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/feedocview.js') }}"></script>
@endsection