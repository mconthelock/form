@extends('layouts/template')

@section('contents')
    <div class="flex flex-col w-full px-4 my-5">
        <h1 class="text-3xl text-primary font-bold mb-5">{{ $title }}</h1>
        <input type="hidden" name="status" id="status" value="{{ $status }}">
        <table class="table table-zebra" id="table"></table>
    </div>
@endsection


@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
