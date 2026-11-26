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
                        NEW REQUEST
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-primary line-clamp-1"
                    id="page-title">
                    Create Electronic Form
                </h1>
                <p class="text-sm wf-mute leading-relaxed" id="page-description">
                    Select a department to create a new electronic form.
                </p>
            </div>
        </div>

        {{-- Section 2: Department Grid & Recent Created Forms --}}
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <section class="xl:col-span-9 bg-base-100 border border-base-300 shadow-sm">
                <div class="px-5 py-3 border-b border-base-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
                        <h2 class="text-xs font-bold uppercase tracking-wider text-primary">
                            Departments
                        </h2>
                    </div>
                    <span class="badge badge-xs badge-outline font-mono font-bold">
                        {{ count($department) }} DEPTS
                    </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
                    @foreach ($department as $dept)
                        <a class="block bg-base-100 border border-base-300 border-t-2 border-t-base-300 hover:border-primary hover:border-t-primary hover:bg-primary/3 transition-all group"
                            href="{{ base_url() . 'webform/form/createdetail/' . $dept['id'] }}">@include('webform/form/create/deptcard', $dept)</a>
                    @endforeach
                </div>
            </section>

            <aside class="xl:col-span-3 bg-base-100 border border-base-300 border-t-4 border-t-primary shadow-sm">
                <div class="p-4" id="recent-created-forms">
                    <div>
                        <h2 class="text-xs font-bold uppercase tracking-wider text-primary">Recent Created Forms</h2>
                    </div>
                </div>
            </aside>
        </div>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
