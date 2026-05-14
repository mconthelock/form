@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" nfrmno="{{ $NFRMNO }}" vorgno="{{ $VORGNO }}" cyear="{{ $CYEAR }}"
        mode="{{ $mode }}">
    </div>
    <div class="apv-data hidden" apv="{{ $apv }}"></div>

    <div class="flex flex-col px-4 my-5 font-sans">
        <div class="card bg-base-100 w-full lg:w-280 place-self-center shadow-sm">
            <h2 class="card-title">
                <u class="text-3xl text-primary font-bold mb-5">Production Environment ID temporary use request</u>
                <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
            </h2>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/fin-npo-create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
