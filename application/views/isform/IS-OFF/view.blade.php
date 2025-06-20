@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}" CYEAR2="{{ $CYEAR2 }}"  NRUNNO="{{ $NRUNNO }}" mode="{{ $mode }}"></div>
    @if ($mode != '1')
        <div class="apv-data hidden" apv="{{ $empno }}"  cextData="{{ $cextData }}" firstStep="{{$firstStep}}"></div>
    @endif
    <div class="flex flex-col w-full px-4 my-5 font-sans">
        <div class="card bg-white w-full place-self-center shadow-sm">
            <div class="load flex flex-col gap-5 h-screen w-full p-6">
                <div class="flex">
                    <div class="skeleton h-16 w-[40%]"></div>
                    <div class="skeleton h-16 w-[20%] ml-auto"></div>
                </div>
                {{-- form info --}}
                <div class="skeleton h-[20%] w-[25rem]"></div>
                <div class="skeleton h-[80%] w-full"></div>
                {{-- remark --}}
                <div class="skeleton  min-h-24 w-56"></div>
                {{-- button --}}
                <div class="flex gap-1">
                    <div class="skeleton h-10 w-24"></div>
                    <div class="skeleton h-10 w-24"></div>
                </div>
            </div>
            <div class="card-body hidden" id="form">
                <h2 class="card-title">
                    <u class="text-3xl text-primary font-bold mb-5">List for Varied off AS400 display</u>
                    <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
                </h2>
                <div class="form-info"></div>
                <table id="table"></table>
                
            </div>
            @if ($mode != 1)
                @include('component/webflow/formAction')
            @endif
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/variedOff.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
