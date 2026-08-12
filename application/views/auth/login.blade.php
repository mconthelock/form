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
</head>

<body class="flex flex-col min-h-screen">
    <input type="hidden" id="appid" value="{{ $id }}">
    @include('layouts/splash')
    {{-- Carousel --}}
    @include('auth/carousel')

    <div class="flex-1 flex flex-col w-full">
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
