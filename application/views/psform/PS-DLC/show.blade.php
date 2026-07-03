@extends('layouts/webflowTemplate')

@section('contents')
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psDLCShow.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection