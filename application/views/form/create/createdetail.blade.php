@extends('layouts/template')

@section('contents')
    <input type="text" id="deptid" value="{{ $department['id'] }}" class="hidden" />
    <div class="space-y-3 mb-8">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
                    Create {{ $department['name'] }}
                </h1>
                <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
                    Requuest {{ $department['name'] }}
                </div>
            </div>
            <div>
                <a class="btn btn-outline btn-primary" href="{{ base_url('webform/form/create') }}"><i
                        class="fi fi-br-arrow-small-left text-xl"></i>Back</a>
            </div>
        </div>
    </div>

    <div class="flex gap-5 w-full mb-20">
        <div class="flex-1 flex flex-col gap-5">
            <label class="input w-full">
                <i class="fi fi-rr-search text-xl text-gray-400"></i>
                <input type="text" class="grow" placeholder="Search" id="search-form" />
                <button type="button" class="btn btn-ghost btn-xs btn-circle clear-search-form" aria-label="Clear search">
                    <i class="fi fi-rr-cross-small text-lg"></i>
                </button>
                <kbd class="kbd kbd-sm">Ctrl</kbd>
                <kbd class="kbd kbd-sm">K</kbd>
            </label>

            <div id="formlist"></div>
        </div>
        <div class="flex-none w-96">
            <div class="bg-primary/10 rounded-lg p-5" id="recent-created-forms">
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
