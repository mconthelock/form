<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="base_url" content="{{ base_url() }}">
    <meta name="appname" content="{{ $_ENV['APP_NAME'] }}">
    <meta name="appstatus" content="{{ $_ENV['STATE'] }}">
    <link rel="shortcut icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-icon" href="{{ base_url() }}assets/images/favicon.ico">

    <title>AMEC Telephone Directory — สมุดหน้าเหลืองบริษัท</title>
    <link rel="stylesheet" href="{{ $_ENV['APP_CDN'] }}/icofont/icofont.min.css">
    <link rel="stylesheet" href="{{ base_url() }}assets/dist/css/tailwind.css?ver={{ $GLOBALS['version'] }}">
</head>

<body id="top" class="flex flex-col min-h-screen bg-[#f4f5f7]">
    {{-- Public Corporate Top Bar (No Login Required) --}}
    <header class="sticky top-0 z-30 w-full bg-primary text-white shadow-sm">
        <div class="max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
            <a href="{{ base_url('phone') }}" class="flex items-center gap-3 min-w-0">
                <img src="{{ base_url() }}assets/images/logo_yellow.png" alt="AMEC"
                    class="w-8 h-8 object-contain shrink-0" />
                <div class="leading-tight min-w-0">
                    <div class="text-sm font-bold tracking-tight truncate">AMEC DIRECTORY</div>
                    <div class="text-[10px] font-mono uppercase tracking-wider text-white/75 truncate">
                        Mitsubishi Elevator Asia • Yellow Pages
                    </div>
                </div>
            </a>

            <div class="flex items-center gap-2 shrink-0">
                <span class="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-white/85 px-2.5 py-1 bg-white/10">
                    <i class="fi fi-rr-phone-call text-xs"></i>
                    <span>+66-38-936-600</span>
                </span>
                <a href="{{ base_url() }}"
                    class="btn btn-xs rounded-none bg-white text-primary border-0 hover:bg-white/90 font-semibold gap-1">
                    <i class="fi fi-rr-sign-in-alt text-xs"></i>
                    <span>Webflow</span>
                </a>
            </div>
        </div>
    </header>

    <div class="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-5">
        <main class="webform-theme w-full flex flex-col gap-4 pb-8">
            {{-- Section 1: Standard Corporate Page Header --}}
            <div
                class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-base-100 p-5 md:p-6 shadow-sm border border-base-300 border-t-4 border-t-primary">
                <div class="space-y-1.5 max-w-3xl">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="badge badge-primary font-mono text-[11px] uppercase tracking-wider font-bold">
                            AMEC-DIRECTORY
                        </span>
                        <span class="badge badge-xs badge-warning font-mono font-bold uppercase">
                            YELLOW PAGES • สมุดหน้าเหลืองบริษัท
                        </span>
                        <span class="badge badge-xs badge-outline font-mono font-bold uppercase">
                            PUBLIC ACCESS
                        </span>
                    </div>
                    <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-primary line-clamp-1">
                        AMEC Telephone Directory
                    </h1>
                    <p class="text-sm wf-mute leading-relaxed">
                        สมุดหน้าเหลืองและข้อมูลติดต่อภายในบริษัท • Search internal phone extensions, emails, positions, and
                        organizational contacts across Mitsubishi Elevator Asia.
                    </p>
                </div>

                <div class="flex flex-wrap items-center gap-2 shrink-0">
                    <div class="px-3 py-1.5 bg-base-200 border border-base-300 flex items-center gap-2">
                        <i class="fi fi-rr-phone-call text-primary text-sm"></i>
                        <div class="leading-tight">
                            <div class="text-[10px] font-bold uppercase tracking-wider wf-mute">Main Switchboard</div>
                            <div class="font-mono text-xs font-bold text-primary">+66-38-936-600</div>
                        </div>
                    </div>
                    <button type="button" id="btn-export-phone" class="btn btn-sm btn-outline btn-primary gap-1.5">
                        <i class="fi fi-rr-download text-sm"></i>
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {{-- Section 2: Summary KPI Ribbon --}}
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div class="bg-base-100 p-4 shadow-sm border border-base-300 border-t-4 border-t-primary">
                    <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider wf-mute">
                        <span>Total Employees</span>
                        <i class="fi fi-rr-users text-base text-primary"></i>
                    </div>
                    <div class="mt-2 flex items-baseline gap-1.5">
                        <span id="kpi-total-emp" class="text-2xl font-bold font-mono text-primary">0</span>
                        <span class="text-xs wf-mute">Personnel</span>
                    </div>
                </div>

                <div class="bg-base-100 p-4 shadow-sm border border-base-300 border-t-4 border-t-warning">
                    <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider wf-mute">
                        <span>With Extension</span>
                        <i class="fi fi-rr-phone-office text-base text-warning"></i>
                    </div>
                    <div class="mt-2 flex items-baseline gap-1.5">
                        <span id="kpi-with-tel" class="text-2xl font-bold font-mono text-base-content">0</span>
                        <span class="text-xs wf-mute">Direct Lines</span>
                    </div>
                </div>

                <div class="bg-base-100 p-4 shadow-sm border border-base-300 border-t-4 border-t-info">
                    <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider wf-mute">
                        <span>Departments</span>
                        <i class="fi fi-rr-building text-base text-info"></i>
                    </div>
                    <div class="mt-2 flex items-baseline gap-1.5">
                        <span id="kpi-total-dept" class="text-2xl font-bold font-mono text-base-content">0</span>
                        <span class="text-xs wf-mute">Units</span>
                    </div>
                </div>

                <div class="bg-base-100 p-4 shadow-sm border border-base-300 border-t-4 border-t-success">
                    <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider wf-mute">
                        <span>Matched Results</span>
                        <i class="fi fi-rr-filter text-base text-success"></i>
                    </div>
                    <div class="mt-2 flex items-baseline gap-1.5">
                        <span id="kpi-matched" class="text-2xl font-bold font-mono text-success">0</span>
                        <span class="text-xs wf-mute">Contacts</span>
                    </div>
                </div>
            </div>

            {{-- Section 3: Category Tabs, Search & Filters --}}
            @include('phone/search')

            {{-- Section 4: Directory Results (Cards / Table) --}}
            <section class="bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                {{-- Toolbar --}}
                <div
                    class="px-4 py-2.5 bg-base-200 border-b border-base-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-4 bg-primary shrink-0"></span>
                        <span class="font-bold uppercase tracking-wider text-primary" id="result-heading">
                            Employee Directory
                        </span>
                        <span class="badge badge-xs badge-primary font-mono font-bold" id="result-count-badge">0</span>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <label
                            class="inline-flex items-center gap-1.5 cursor-pointer select-none font-medium text-base-content">
                            <input type="checkbox" id="filter-has-tel" class="checkbox checkbox-xs checkbox-primary" checked />
                            <span>Has Tel. Only</span>
                        </label>

                        <div class="join">
                            <button type="button" id="view-mode-cards" class="join-item btn btn-xs btn-primary gap-1"
                                title="Card View">
                                <i class="fi fi-rr-apps text-xs"></i>
                                <span>Cards</span>
                            </button>
                            <button type="button" id="view-mode-table"
                                class="join-item btn btn-xs btn-outline border-base-300 bg-base-100 gap-1"
                                title="Table View">
                                <i class="fi fi-rr-list text-xs"></i>
                                <span>Table</span>
                            </button>
                        </div>
                    </div>
                </div>

                {{-- Loading Skeleton --}}
                <div id="phone-loading" class="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    @for ($i = 0; $i < 6; $i++)
                        <div class="skeleton h-36 w-full"></div>
                    @endfor
                </div>

                {{-- Card Grid View --}}
                <div id="phone-cards-wrap" class="hidden">
                    <div id="phone-cards-grid" class="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"></div>
                    <div id="phone-cards-empty" class="hidden p-10 text-center">
                        <i class="fi fi-rr-search-alt text-3xl wf-mute"></i>
                        <p class="mt-2 text-sm font-semibold text-base-content">No matching contacts found</p>
                        <p class="text-xs wf-mute mt-0.5">Try adjusting your search keyword or clearing filters.</p>
                    </div>
                    <div id="phone-cards-footer"
                        class="px-4 py-3 bg-base-100 border-t border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs wf-mute">
                        <div id="phone-cards-info"></div>
                        <div id="phone-cards-pagination" class="flex justify-center"></div>
                    </div>
                </div>

                {{-- Table View --}}
                <div id="phone-table-wrap" class="hidden overflow-x-auto tableArea">
                    <table class="table table-sm w-full border-collapse text-left text-xs" id="amec-employee"></table>
                </div>
            </section>
        </main>
    </div>

    @include('layouts.footer')

    <script src="{{ $_ENV['APP_JS'] }}/phone.js?ver={{ $GLOBALS['version'] }}"></script>
</body>

</html>
