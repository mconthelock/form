@extends('layouts/webflowTemplate')

@section('contents')
    <section class="flex flex-col gap-3 mb-4 xl:m-auto">
        <div class="flex items-center gap-2">
            <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h1 class="uppercase font-black text-2xl text-slate-500">ตรวจสอบรายการคอมพิวเตอร์</h1>
        </div>

        <ol class="numbered mt-8">
            <li>
                <h1 class="text-primary text-bold text-xl mb-5">ตรวจสอบความถูกต้องของ QR Code</h1>
                <img src="{{ $_ENV['APP_IMG'] }}/is-cbo-1.png" alt="">
            </li>
            <li>
                <h1 class="text-primary text-bold text-xl mb-5">ตรวจสอบความถูกต้องของชื่อคอมพิวเตอร์</h1>
                <input type="text" id="computer-uid" class="input input-xl mb-8" placeholder="กรอก UID เช่น 0417008">

                <div class="text-primary text-2xl px-12 py-8 bg-primary/20 rounded-2xl border-3 border-primary border-dashed hidden"
                    id="computer-name"></div>
            </li>
        </ol>

    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/computerList.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection


@section('styles')
    <style>
        ol.numbered {
            counter-reset: numbered-list;
            border-left: #b3b3b3 5px solid;
            position: relative;
        }

        ol.numbered li {
            line-height: 1.2;
            margin-bottom: 30px;
            margin-left: 30px;
        }

        ol.numbered li::before {
            background-color: #b3b3b3;
            border: 3px solid white;
            border-radius: 50%;
            color: white;
            content: counter(numbered-list, decimal);
            counter-increment: numbered-list;
            display: block;
            width: 40px;
            height: 40px;
            line-height: 40px;
            margin-top: -0.5em;
            position: absolute;
            left: -22px;
            text-align: center;
        }
    </style>
@endsection
