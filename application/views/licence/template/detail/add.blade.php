@extends('layouts/template')

@section('contents')
    <h1 class="text-2xl font-bold mb-1">New Template</h1>
    <div class="divider"></div>

    <form action="#" method="POST" id="form-template">
        <div class="flex flex-col flex-wrap gap-5 lg:flex-row">
            <div class="flex-1 min-w-80">
                @include('licence/template/detail/add-info')
            </div>
            <div class="flex-1 min-w-80">
                @include('licence/template/detail/add-prop')
            </div>
            <div class="flex-1 min-w-80">
                <div class="flex flex-col gap-5 h-full">
                    @include('licence/template/detail/add-member')
                    @include('licence/template/detail/add-owner')
                </div>
            </div>
        </div>
        <div class="flex gap-3 mt-5">
            <button class="btn btn-primary text-base-300" type="button" id="addtemplate">
                <span class="loading loading-spinner hidden"></span>
                <span>Save Template</span>
            </button>

            {{-- <button class="btn btn-error text-base-300" type="reset">
                <span class="loading loading-spinner hidden"></span>
                <span>Clear Data</span>
            </button> --}}

            <a class="btn btn-neutral text-base-300" href="{{ base_url() }}master">
                <span class="loading loading-spinner hidden"></span>
                <span>Back</span>
            </a>
        </div>
    </form>
@endsection

@section('scripts')
    <script
        src="{{ $_ENV['APP_JS'] }}/licencemasterdetail.js?ver={{ $_ENV['STATE'] == 'production' ? $_ENV['VERSION'] : time() }}">
    @endsection
