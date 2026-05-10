@extends('layouts/template')

@section('contents')
    <iframe src="{{ $target }}" frameborder="0" class="w-full h-[95vh]"></iframe>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
