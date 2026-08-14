@extends('finform.FIN-NPO.create')

@section('return-form-number')
    <div class="form-control">
        <label class="label pb-1" for="FORMNO">
            <span class="label-text font-bold text-base-content/80 text-sm">Form No.</span>
        </label>
        <input id="FORMNO" name="FORMNO" type="text" readonly
            class="input input-sm input-bordered w-full border-base-300 bg-base-200/80 cursor-not-allowed font-semibold" />
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/finNpoReturn.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
