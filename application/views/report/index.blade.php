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

    <div class="flex gap-5 w-full mb-20">
        <div class="flex-1 grid grid-cols-2 gap-5 items-start">
            @foreach ($department as $dept)
                <details class="collapse bg-base-100 border border-gray-300 shadow-sm" name="my-accordion-det-1" open>
                    <summary class="collapse-title font-semibold" data-id="{{ $dept['link'][0] }}">{{ $dept['name'] }}
                    </summary>
                    <div class="collapse-content text-sm">
                        <div class="skeleton h-12 w-full"></div>
                    </div>
                </details>
            @endforeach
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
