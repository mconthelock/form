<section class="bg-base-100 shadow-sm border border-base-300 flex flex-col">
    {{-- Category Navigation Tabs --}}
    <div class="flex items-center border-b border-base-300 overflow-x-auto px-4 pt-2 gap-1" id="phoneCategoryTabs"
        role="tablist" aria-label="Directory Category Tabs">
        <button type="button" role="tab" aria-selected="true" data-category="ALL"
            class="phone-cat-tab shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary border-b-2 border-primary text-nowrap cursor-pointer">
            <i class="fi fi-rr-address-book text-sm"></i>
            <span>All Employees</span>
            <span class="badge badge-xs badge-primary font-mono" id="cat-count-all">0</span>
        </button>
        <button type="button" role="tab" aria-selected="false" data-category="COMPANY"
            class="phone-cat-tab shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider wf-mute border-b-2 border-transparent text-nowrap cursor-pointer hover:text-primary transition-colors">
            <i class="fi fi-rr-phone-office text-sm"></i>
            <span>Company Telephone</span>
            <span class="badge badge-xs badge-outline font-mono" id="cat-count-company">0</span>
        </button>
        <button type="button" role="tab" aria-selected="false" data-category="OUTSOURCE"
            class="phone-cat-tab shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider wf-mute border-b-2 border-transparent text-nowrap cursor-pointer hover:text-primary transition-colors">
            <i class="fi fi-rr-briefcase text-sm"></i>
            <span>Outsource</span>
            <span class="badge badge-xs badge-outline font-mono" id="cat-count-outsource">0</span>
        </button>
        <button type="button" role="tab" aria-selected="false" data-category="OTHER"
            class="phone-cat-tab shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider wf-mute border-b-2 border-transparent text-nowrap cursor-pointer hover:text-primary transition-colors">
            <i class="fi fi-rr-info text-sm"></i>
            <span>Other / Hotlines</span>
            <span class="badge badge-xs badge-outline font-mono" id="cat-count-other">0</span>
        </button>
    </div>

    {{-- Precision Search & Cascading Filter Strip --}}
    <div class="p-4 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {{-- Instant Search --}}
            <div class="md:col-span-4">
                <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1" for="phone-search">
                    Quick Search (Tel / Emp.No / Name / Email)
                </label>
                <label class="input input-sm border border-base-300 bg-base-100 flex items-center gap-2 h-9.5 w-full">
                    <i class="fi fi-rr-search text-sm wf-mute shrink-0"></i>
                    <input id="phone-search" type="text"
                        class="grow text-sm text-base-content placeholder:text-[#636363] outline-none border-none focus:outline-none"
                        placeholder="Search tel., emp no., EN/TH name, email..." />
                    <button type="button" id="clear-phone-search"
                        class="btn btn-ghost btn-xs hidden" aria-label="Clear search">
                        <i class="fi fi-rr-cross-small text-sm"></i>
                    </button>
                    <kbd class="kbd kbd-xs font-mono hidden sm:inline-flex">Ctrl</kbd>
                    <kbd class="kbd kbd-xs font-mono hidden sm:inline-flex">K</kbd>
                </label>
            </div>

            {{-- Division --}}
            <div class="md:col-span-2">
                <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1" for="division">
                    Division
                </label>
                <select id="division" class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-xs">
                    <option value="">All Divisions</option>
                </select>
            </div>

            {{-- Department --}}
            <div class="md:col-span-2">
                <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1" for="department">
                    Department
                </label>
                <select id="department"
                    class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-xs">
                    <option value="">All Departments</option>
                </select>
            </div>

            {{-- Section --}}
            <div class="md:col-span-2">
                <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1" for="section">
                    Section
                </label>
                <select id="section" class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-xs">
                    <option value="">All Sections</option>
                </select>
            </div>

            {{-- Position --}}
            <div class="md:col-span-1">
                <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1" for="position">
                    Position
                </label>
                <select id="position" class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-xs">
                    <option value="">All</option>
                </select>
            </div>

            {{-- Reset --}}
            <div class="md:col-span-1">
                <button id="reset-filter" type="button"
                    class="btn btn-sm btn-primary w-full h-9.5 flex items-center justify-center gap-1"
                    title="Reset All Filters" aria-label="Reset All Filters">
                    <i class="fi fi-rr-rotate-left text-sm"></i>
                    <span class="md:hidden">Reset</span>
                </button>
            </div>
        </div>

        {{-- Yellow Pages A-Z Quick Jump Index --}}
        <div class="pt-2 border-t border-base-200 flex flex-wrap items-center gap-1" id="alpha-index"
            aria-label="Alphabetical Quick Jump">
            <span class="text-[10px] font-bold uppercase tracking-wider wf-mute mr-1.5">A–Z Index:</span>
            <button type="button" data-letter=""
                class="alpha-btn btn btn-xs btn-primary font-mono min-w-7 px-2">ALL</button>
            @foreach (range('A', 'Z') as $letter)
                <button type="button" data-letter="{{ $letter }}"
                    class="alpha-btn btn btn-xs btn-outline border-base-300 bg-base-100 font-mono min-w-6.5 px-1.5">{{ $letter }}</button>
            @endforeach
        </div>
    </div>
</section>
