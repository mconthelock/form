@extends('layouts/template')

@section('contents')
    <input type="text" id="deptid" value="{{ $department['id'] }}" class="hidden" />
    <div class="space-y-3 mb-8">
        <div>
            <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
                Create {{ $department['name'] }}
            </h1>
            {{-- <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
                Requuest {{ $department['name'] }}
            </div> --}}
        </div>
    </div>

    <div class="flex gap-5 w-full mb-20">
        <div class="flex-1" id="formlist"></div>
        <div class="flex-none w-96">
            <div class="bg-primary/10 rounded-lg p-5">
                <div>
                    <h1>Recent Created Forms</h1>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
