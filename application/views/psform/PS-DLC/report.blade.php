@extends('layouts/webflowTemplate')

@section('contents')
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/prDLCreport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection