@extends('layouts/template')

@section('contents')
    <div class="card rounded-lg h-72 w-full bordered mb-3 overflow-hidden relative">
        <div class="f-carousel" id="news-carousel">
            <div class="f-carousel__slide">
                <img class="w-full h-72 object-cover object-center" src="{{ base_url() }}assets/images/start_images.png"
                    alt="title" />
                <div
                    class="absolute top-0 left-0 w-full h-72 p-3 overflow-hidden flex flex-col items-start justify-end lg:p-10 lg:w-2/5 lg:min-w-2/5">
                    <div class="p-3 w-full">
                        <a class="btn btn-md btn-primary" href="{{ base_url() }}docs">Check More Detail<i
                                class="icofont-arrow-right text-2xl"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Stat Card --}}
    <div class="flex flex-col w-full max-w-[100vw] mb-3">
        <div class="flex overflow-x-scroll hide-scroll-bar">
            <div class="flex gap-5 pb-3 flex-nowrap w-full">
                @include('home.stats', ['id' => 'wait', 'text' => 'Waiting for Approval'])
                @include('home.stats', ['id' => 'prepare', 'text' => 'Under preparation'])
                @include('home.stats', ['id' => 'mine', 'text' => 'Mine'])
                @include('home.stats', ['id' => 'finish', 'text' => 'Approved/Rejected'])
            </div>
        </div>
    </div>

    {{-- Recent Link --}}
    <h1 class="text-3xl text-primary font-bold mb-5 recent-apps border-b-primary border-b-4 pb-[10px]">Recent Link</h1>
    <div class="flex flex-wrap justify-center gap-8 mb-8 lg:justify-start recent-apps" id="recent-apps">
        @for ($i = 0; $i < 3; $i++)
            <a href="#" class="flex flex-col items-center gap-3 w-28">
                <div class="skeleton h-12 w-12 shrink-0 rounded-full"></div>
                <div class="skeleton h-8 w-32"></div>
            </a>
        @endfor
    </div>

    {{-- AMEC WEB --}}
    <h1 class="mb-5 flex amecweb_links border-b-primary border-b-4 pb-[10px]">
        <div class="flex-1 text-3xl text-primary font-bold">AMEC WEB</div>
        <div class="flex-none"><button class="btn btn-circle btn-ghost text-2xl" type="button" id="reload_amecweb"><i
                    class="icofont-refresh"></i></button>
        </div>
    </h1>
    <div class="flex flex-col gap-3 mb-8 lg:flex-row lg:flex-wrap amecweb_links" id="amecweb_links">
        @for ($i = 0; $i < 8; $i++)
            <div
                class="card bg-white
            bordered w-full h-28 shadow-xl flex gap-3 flex-row items-center p-3 lg:w-72">
                <div class="flex-none skeleton h-16 w-16 rounded-full"></div>
                <div class="flex-1 flex flex-col gap-3">
                    <div class="skeleton h-8 w-32"></div>
                    <div class="skeleton h-6 w-full"></div>
                </div>
            </div>
        @endfor
    </div>
    {{-- Other Link --}}
    <h1 class="text-3xl text-primary font-bold mb-5 border-b-primary border-b-4 pb-[10px]">Other Link</h1>
    {{-- md, lg: 2cols,  xl: 4 --}}
    <div class="flex flex-col gap-8 mb-5 lg:flex-row lg:flex-wrap">
        @include('home/links', ['links' => $links['electronic']])
        @include('home/links', ['links' => $links['utility']])
        @include('home/links', ['links' => $links['design']])
        @include('home/links', ['links' => $links['other']])
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/home.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection

@section('styles')
    <style>
        .hide-scroll-bar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .hide-scroll-bar::-webkit-scrollbar {
            display: none;
        }
    </style>
@endsection
