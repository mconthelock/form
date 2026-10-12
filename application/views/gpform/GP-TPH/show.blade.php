@extends('gpform/GP-TPH/create')

@section('styles')
	@parent
	<style>
		#tphForm input:disabled,
		#tphForm textarea:disabled {
			color: #0f172a;
			-webkit-text-fill-color: #0f172a;
			opacity: 1;
		}
	</style>
@endsection

@section('contents')
	<div id="gp-tph-form-data"
		data-nfrmno="{{ $NFRMNO }}"
		data-vorgno="{{ $VORGNO }}"
		data-cyear="{{ $CYEAR }}"
		data-cyear2="{{ $CYEAR2 }}"
		data-nrunno="{{ $NRUNNO }}"
		data-empno="{{ $EMPNO }}"
		hidden></div>
	@parent
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpTPHShow.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
