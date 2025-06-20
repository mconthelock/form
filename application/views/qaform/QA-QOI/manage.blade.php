@extends('layouts/webflowTemplate')
@section('contents')
    <div class="flex mx-5">
        {{-- <div id="test" class="btn">test</div> --}}
        <div class="card w-full  shadow-2xl bg-base-100">
        {{-- <div class="card bg-base-100 flex-1 shadow-xl max-md:min-w-[48%] h-40"> --}}
            <div class="card-body">
                <div class="stats shadow w-36">
                    <div class="stat ">
                        <div class="stat-title">FYEAR</div>
                        <div class="stat-value text-primary">
                                <h1 id="year" class="text-4xl font-bold text-primary z-10">{{$year}}</h1>
                        </div>
                        <div class="stat-desc z-10 join">
                            <button type="button" class="btn btn-xs btn-neutral join-item md:w-1/2 text-base" id="previousFY"><</button>
                            <button type="button" class="btn btn-xs btn-neutral join-item md:w-1/2 text-base" id="nextFY">></button>
                        </div>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="table" id="table"></table>
                </div>
            </div>
        </div>
    </div>
    @include('qaform/QA-QOI/modaladdedit')
    @include('qaform/QA-QOI/modal_del')
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/manage.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
