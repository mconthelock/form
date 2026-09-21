@extends('layouts/template')

@section('contents')
    <div class="space-y-3 mb-8">
        <div>
            <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
                Create Electronic Form
            </h1>
            <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
                Select a department to create a new electronic form.
            </div>
        </div>
    </div>

    <div class="flex flex-col w-full px-4 mt-5 mb-20">
        <div class="flex">
            <div class="flex-1">
                <div class="flex flex-wrap justify-start gap-5">
                    @foreach ($department as $dept)
                        <a class="bg-white border border-slate-300 hover:shadow-lg hover:bg-primary/20 rounded-lg transition-shadow"
                            href="{{ base_url() . 'webform/form/createdetail/' . $dept['id'] }}">@include('form/create/deptcard', $dept)</a>
                    @endforeach
                </div>
            </div>
            <div class="flex-none w-96">
                <div class="bg-primary/10 rounded-lg p-5" id="recent-created-forms">
                    <div>
                        <h1>Recent Created Forms</h1>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
