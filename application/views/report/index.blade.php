@extends('layouts/template')

@section('contents')
    <div class="space-y-3 mb-8">
        <div>
            <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
                Electronic Form Report
            </h1>
            <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
                Select a department to view the electronic form reports.
            </div>
        </div>
    </div>

    <div class="flex gap-5 w-full mb-8">
        {{-- <div class="flex-1 grid grid-cols-2 gap-5 items-start">
            @foreach ($department as $dept)
                <ul class="list p-4 hidden" id="list-{{ $dept['id'] }}">
                    <li class="p-4 pb-2 text-md text-primary font-bold tracking-wide">{{ $dept['name'] }}</li>
                    <li class="list-row skeleton "></li>
                </ul>
            @endforeach
        </div> --}}
        <div class="flex-1 flex flex-col gap-2">
            <label class="input w-full mb-3">
                <i class="fi fi-rr-search text-xl text-gray-400"></i>
                <input type="text" class="grow" placeholder="Search" id="search-form" />
                <button type="button" class="btn btn-ghost btn-xs btn-circle clear-search-form" aria-label="Clear search">
                    <i class="fi fi-rr-cross-small text-lg"></i>
                </button>
                <kbd class="kbd kbd-sm">Ctrl</kbd>
                <kbd class="kbd kbd-sm">K</kbd>
            </label>
            <div class="grid grid-cols-2 gap-2" id="list-report">
                @for ($i = 0; $i < 4; $i++)
                    <div class="skeleton h-90 w-135"></div>
                @endfor
            </div>
        </div>



        <div class="flex-none w-96">
            <div class="bg-primary/10 rounded-lg p-5" id="recent-report-forms">
                <div>
                    <h1>Recent Created Forms</h1>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_report.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
