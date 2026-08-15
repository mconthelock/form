<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="base_url" content="{{ base_url() }}">
    <meta name="appname" content="{{ $_ENV['APP_NAME'] }}">
    <meta name="appstatus" content="{{ $_ENV['STATE'] }}">
    <meta name="theme-color" content="#C0C0C0">
    <link rel="manifest" href="{{ base_url() }}manifest.json">
    <link rel="shortcut icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-startup-image" href="{{ base_url() }}assets/images/icon_512.png">
    <title>AMEC Webflow</title>
    <link rel="stylesheet" href="{{ base_url() }}assets/dist/css/tailwind.css?ver={{ $GLOBALS['version'] }}">
    <script src="{{ base_url() }}script.js?ver={{ $_ENV['VERSION'] }}"></script>
    {{-- CSS สำหรับ QRScanner (@amec/webasset/qrScanner) — component นี้ append overlay เข้า document.body เอง
         และไม่มีการ import CSS ของมันไว้ที่ไหนในโปรเจกต์ ทำให้ <video> ไม่ถูกจัดวางเป็น overlay จริง
         ถ้ามีไฟล์ CSS อย่างเป็นทางการของ package (เช่น @amec/webasset/qrScanner.css) ให้ import แทนอันนี้ --}}
    <style>
        .zxing-overlay {
            position: fixed;
            inset: 0;
            z-index: 60;
            background: #000;
            overflow: hidden;
        }

        .zxing-container {
            position: relative;
            width: 100% !important;
            height: 100% !important;
        }

        .zxing-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .zxing-nav {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            color: #fff;
        }

        .zxing-menu {
            display: flex;
            gap: 12px;
        }

        .zxing-menu button,
        .zxing-overlay-close-btn {
            background: rgba(0, 0, 0, 0.4);
            border: none;
            border-radius: 9999px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #fff;
        }

        .zxing-torch-btn {
            display: none;
        }

        .zxing-info {
            font-weight: 600;
            font-size: 0.95rem;
        }

        .qr-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        }

        .qr-frame {
            position: relative;
            width: 220px;
            height: 220px;
        }

        .qr-frame span {
            position: absolute;
            width: 32px;
            height: 32px;
            border: 3px solid #fff;
        }

        .qr-frame span:nth-child(1) {
            top: 0;
            left: 0;
            border-right: none;
            border-bottom: none;
        }

        .qr-frame span:nth-child(2) {
            top: 0;
            right: 0;
            border-left: none;
            border-bottom: none;
        }

        .qr-frame span:nth-child(3) {
            bottom: 0;
            left: 0;
            border-right: none;
            border-top: none;
        }

        .qr-frame span:nth-child(4) {
            bottom: 0;
            right: 0;
            border-left: none;
            border-top: none;
        }

        .zxing-lists {
            display: none;
            position: absolute;
            inset: 0;
            z-index: 3;
            background: #fff;
            overflow: auto;
            padding: 16px;
        }
    </style>
</head>

<body class="flex flex-col min-h-screen">
    <input type="hidden" id="appid" value="{{ $id }}">
    @include('layouts/splash')
    {{-- Carousel --}}
    @include('auth/carousel')

    <div class="flex flex-col w-full">
        <div class="relative flex flex-col min-h-screen w-full p-4 overflow-x-hidden">
            {{-- Braner && Background --}}
            @include('auth/banner')
            {{-- Login form --}}
            <div class="w-full h-[calc(100vh-86px)] flex items-center justify-center lg:justify-end ">
                <div class="w-96 p-8 rounded-lg shadow-lg bg-white z-0 lg:mr-32 form-cover">
                    <h1 class="text-sm font-bold text-center text-slate-400">Welcome</h1>
                    <h1 class="text-2xl font-black text-center text-slate-600" id="login-title"></h1>
                    {{-- Password login --}}
                    @include('auth/password')

                    {{-- RFID Lofin  --}}
                    @include('auth/rfid')

                    {{-- Barcode Login --}}
                    @include('auth/barcode')

                    {{-- Form footer --}}
                    <div class="mt-4">
                        <a href="{{ $_ENV['APP_ENV'] }}/authen/forgotpassword/" class="block text-center">Forgot
                            Password?</a>
                    </div>
                    <div class="divider">OR</div>
                    @include('auth/login-footer')
                    <div class="mt-8 {{ $id == 1 ? 'hidden' : '' }}">
                        <a href="{{ base_url() }}" class="block text-center text-md text-primary">I need to login
                            Webflow</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('layouts.footer')
    <script src="{{ $_ENV['APP_JS'] }}/login.js?ver={{ $GLOBALS['version'] }}"></script>
</body>

</html>
