@extends('layouts/template')

@section('contents')
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/bus_overtime.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection
