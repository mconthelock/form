@extends('layouts/template')

@section('contents')
    <input type="text" id="deptid" value="{{ $department['id'] }}" class="hidden" />
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
                        DEPARTMENT FORMS
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-primary line-clamp-1"
                    id="page-title">
                    Create {{ $department['name'] }}
                </h1>
                <p class="text-sm wf-mute leading-relaxed" id="page-description">
                    Request {{ $department['name'] }}
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
                <a class="btn btn-sm btn-outline btn-primary gap-1.5" href="{{ base_url('webform/form/create') }}">
                    <i class="fi fi-br-arrow-small-left text-base"></i>
                    <span>Back</span>
                </a>
            </div>
        </div>

        {{-- Section 2: Form Search, DataTable & Recent Created Forms --}}
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <div class="xl:col-span-9 flex flex-col gap-4">
                {{-- Precision Filter Strip --}}
                <section class="bg-base-100 shadow-sm border border-base-300 p-4">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div class="md:col-span-7">
                            <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                                for="search-form">
                                Search
                            </label>
                            <label
                                class="input input-sm border border-base-300 bg-base-100 flex items-center gap-2 h-9.5 w-full">
                                <i class="fi fi-rr-search text-sm wf-mute shrink-0"></i>
                                <input id="search-form" type="text"
                                    class="grow text-sm text-base-content placeholder:text-[#636363] outline-none border-none focus:outline-none"
                                    placeholder="Search form code, name, or description..." autocomplete="off" />
                                <button type="button" class="btn btn-ghost btn-xs clear-search-form"
                                    aria-label="Clear search">
                                    <i class="fi fi-rr-cross-small text-base"></i>
                                </button>
                                <kbd class="kbd kbd-xs font-mono hidden sm:inline-flex">Ctrl</kbd>
                                <kbd class="kbd kbd-xs font-mono hidden sm:inline-flex">K</kbd>
                            </label>
                        </div>
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                                for="group-filter">
                                Group
                            </label>
                            <select id="group-filter"
                                class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-sm s2">
                                <option value="">All Groups</option>
                            </select>
                        </div>
                        <div class="md:col-span-1">
                            <button id="reset-filter"
                                class="btn btn-sm btn-primary w-full h-9.5 flex items-center justify-center gap-1"
                                title="Reset Filters" aria-label="Reset Filters" type="button">
                                <i class="fi fi-rr-rotate-left text-sm"></i>
                                <span class="md:hidden">Reset</span>
                            </button>
                        </div>
                    </div>
                </section>

                {{-- Form Directory DataTable --}}
                <section class="bg-base-100 shadow-sm border border-base-300 overflow-hidden">
                    <div
                        class="px-4 py-2.5 bg-base-100 border-b border-base-200 flex flex-wrap items-center justify-between gap-2 text-xs wf-mute">
                        <div class="flex items-center gap-2">
                            <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
                            <span class="font-semibold uppercase tracking-wider text-[11px] text-primary">
                                Available Forms
                            </span>
                        </div>
                        <span class="badge badge-xs badge-outline font-mono font-bold" id="form-count-badge">0 FORMS</span>
                    </div>
                    <div class="overflow-x-auto tableArea">
                        @include('layouts/datatable_load')
                        <table id="table" class="table table-sm w-full border-collapse text-left text-xs"></table>
                    </div>
                </section>
            </div>

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
