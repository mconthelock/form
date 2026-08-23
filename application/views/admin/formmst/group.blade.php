@extends('layouts/template')

@section('contents')
    <div class="space-y-3 mb-8 flex items-center justify-between">
        <div>
            <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
                Form Group Master Management
            </h1>
            <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
                {{-- <div class="skeleton h-8 w-120"></div> --}}
            </div>
        </div>
        <div>
            {{-- <button class="btn btn-primary min-w-30" id="add-group-btn">Add Group</button> --}}
        </div>
    </div>

    <div class="space-y-6 flex gap-3">
        <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex-1">
            <div class="overflow-hidden tableArea">
                @include('layouts/datatable_load')
                <table id="table" class="table table-zebra display text-sm"></table>
            </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex-none" id="add-group-form">
            <form action="#" class="w-80">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Form Organize</legend>
                    <select class="select" id="vgrouporg" name="vgrouporg">
                        <option disabled selected>Select Owner</option>
                    </select>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Group Name</legend>
                    <input type="text" class="input" placeholder="Type here" id="vgroupname" />
                </fieldset>

                <button class="btn btn-primary w-full mt-2" type="button" id="save-group-btn">Save Data</button>
                <button class="btn btn-error w-full mt-2" disabled type="button" id="reset-group-btn">Cancel</button>
                <input type="text" class="input hiddenx" id="vgroup" name="vgroup" value="" />
            </form>
        </section>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/formmst_group.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
