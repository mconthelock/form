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
                        FORM CONFIGURATION
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-primary line-clamp-1" id="page-title">
                    Form Master Management
                </h1>
                <p class="text-sm wf-mute leading-relaxed" id="page-description">
                    Configure form master metadata, organization owner, and approval workflow steps.
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
                <a href="{{ base_url('admin/formmaster') }}" class="btn btn-sm btn-outline btn-primary gap-1.5">
                    <i class="fi fi-br-arrow-small-left text-base"></i>
                    <span>Back</span>
                </a>
            </div>
        </div>

        {{-- Section 2: Form Info & Workflow Editor --}}
        <section class="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <div class="xl:col-span-8 bg-base-100 border border-base-300 shadow-sm flex flex-col" id="form-info">
                <div class="p-5 space-y-5">
                    @include('admin/formmst/_info')
                </div>

                {{-- Footer Action Strip --}}
                <div
                    class="px-5 py-3.5 bg-base-200 border-t border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-2 text-xs wf-mute font-mono">
                        <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
                        <span>AMEC Webflow Form Master Registry</span>
                    </div>
                    <div class="btn-container flex flex-wrap items-center gap-2"></div>
                </div>
            </div>

            <aside
                class="xl:col-span-4 bg-base-100 border border-base-300 border-t-4 border-t-primary shadow-sm flex flex-col">
                <div class="px-4 py-3 bg-base-200 border-b border-base-300 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-4 bg-primary shrink-0"></span>
                        <div>
                            <div class="text-xs font-bold uppercase tracking-wider text-primary">Form Flow</div>
                            <div class="wf-mute text-[11px]">Approval workflow steps</div>
                        </div>
                    </div>
                    <a href="#" class="btn btn-xs btn-primary add-flow" id="add-flow" title="Add Flow Step">+ Add Step</a>
                </div>
                <div class="p-4 flex flex-col gap-2">
                    @include('admin/formmst/_flow')
                </div>
            </aside>
        </section>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/formmst_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
