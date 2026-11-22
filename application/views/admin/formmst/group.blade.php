@extends('layouts/template')

@section('contents')
    <main class="webform-theme w-full flex flex-col gap-4 pb-12">
        {{-- Section 1: Standard Page Header Component --}}
        <div
            class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-base-100 p-5 md:p-6 shadow-sm border border-base-300 border-t-4 border-t-primary">
            <div class="space-y-1.5 max-w-3xl">
                <div class="flex items-center gap-2">
                    <span class="badge badge-primary font-mono text-[11px] uppercase tracking-wider font-bold">
                        AMEC-WEBFLOW
                    </span>
                    <span class="badge badge-xs badge-outline font-mono font-bold uppercase">
                        GROUP MASTER
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-primary line-clamp-1" id="page-title">
                    Form Group Master Management
                </h1>
                <p class="text-sm wf-mute leading-relaxed" id="page-description">
                    Organize electronic form groups by department and organization code.
                </p>
            </div>
        </div>

        {{-- Section 2: Group Table & Group Form --}}
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <section class="xl:col-span-8 bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                <div class="px-4 py-2.5 bg-base-100 border-b border-base-200 flex items-center gap-2">
                    <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    <span class="font-semibold uppercase tracking-wider text-[11px] text-primary">Form Groups</span>
                </div>
                <div class="overflow-x-auto tableArea">
                    @include('layouts/datatable_load')
                    <table id="table" class="table table-sm w-full border-collapse text-left text-xs"></table>
                </div>
            </section>

            <section class="xl:col-span-4 bg-base-100 border border-base-300 border-t-4 border-t-primary shadow-sm"
                id="add-group-form">
                <div class="px-4 py-3 border-b border-base-200">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-primary">Group Details</h2>
                </div>
                <form action="#" class="p-4 space-y-3">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend text-[11px] font-bold uppercase tracking-wider wf-mute">Form Organize</legend>
                        <select class="select select-sm w-full" id="vgrouporg" name="vgrouporg">
                            <option disabled selected>Select Owner</option>
                        </select>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend text-[11px] font-bold uppercase tracking-wider wf-mute">Group Name</legend>
                        <input type="text" class="input input-sm w-full" placeholder="Type here" id="vgroupname" />
                    </fieldset>

                    <div class="pt-2 flex flex-col gap-2">
                        <button class="btn btn-sm btn-primary w-full" type="button" id="save-group-btn">Save Data</button>
                        <button class="btn btn-sm btn-outline btn-error w-full" disabled type="button"
                            id="reset-group-btn">Cancel</button>
                    </div>
                    <input type="text" class="input hidden" id="vgroup" name="vgroup" value="" />
                </form>
            </section>
        </div>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/formmst_group.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
