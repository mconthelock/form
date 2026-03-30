@extends('layouts/template')

@section('contents')
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/bus_lines.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection
