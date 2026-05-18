@extends('layouts/webflowTemplate')

@section('styles')

@endsection

@section('contents')
  
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/report.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection