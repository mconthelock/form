@extends('layouts/template')

@section('contents')
    <main class="webform-theme w-full flex flex-col gap-4 pb-12">
        {{-- Section 1: Standard Page Header Component --}}
        <div
            class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-base-100 p-5 md:p-6 shadow-sm border border-base-300 border-t-4 border-t-primary">
            <div class="space-y-1.5 max-w-3xl">
                <div class="flex items-center gap-2">
                    <span class="badge badge-primary font-mono text-xs uppercase tracking-wider font-bold">
                        AMEC-WEBFLOW
                    </span>
                    <span class="badge badge-sm badge-outline font-mono font-bold uppercase">
                        FORM CONFIGURATION
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-primary line-clamp-1" id="page-title">
                    Form Master Management
                </h1>
                <p class="text-base wf-mute leading-relaxed" id="page-description">
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
        <section class="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:items-stretch">
            <div class="xl:col-span-7 bg-base-100 border border-base-300 shadow-sm flex flex-col" id="form-info">
                <div class="p-5 space-y-5 flex-1">
                    @include('admin/formmst/_info')
                </div>

                {{-- Footer Action Strip --}}
                <div
                    class="px-5 py-3.5 bg-base-200 border-t border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div class="flex items-center gap-2 text-sm wf-mute font-mono">
                        <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
                        <span>AMEC Webflow Form Master Registry</span>
                    </div>
                    <div class="btn-container flex flex-wrap items-center gap-2"></div>
                </div>
            </div>

            <aside class="xl:col-span-5 xl:relative" id="form-flow-panel">
                <div
                    class="xl:absolute xl:inset-0 bg-base-100 border border-base-300 border-t-4 border-t-primary shadow-sm flex flex-col">
                    <div
                        class="px-4 py-3 bg-base-200 border-b border-base-300 flex items-center justify-between gap-2 shrink-0">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-1.5 h-5 bg-primary shrink-0"></span>
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-bold uppercase tracking-wider text-primary">Form Flow</span>
                                    <span class="badge badge-sm badge-primary font-mono font-bold"
                                        id="flow-step-count">0</span>
                                </div>
                                <div class="wf-mute text-xs truncate">Approval sequence · drag or use arrows to reorder
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary gap-1 shrink-0 add-flow" id="add-flow"
                            title="Add Flow Step">
                            <i class="fi fi-rr-plus-small text-base"></i>
                            <span>Add Step</span>
                        </button>
                    </div>
                    <div class="flex flex-col flex-1 min-h-0">
                        @include('admin/formmst/_flow')
                    </div>
                </div>
            </aside>
        </section>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/formmst_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
