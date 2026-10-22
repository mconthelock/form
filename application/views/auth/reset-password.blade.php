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
    <input type="hidden" id="appid" value="1">
    <input class="hidden" type="password" id="tokens" value="{{ $value }}">
    {{-- @include('layouts/splash') --}}
    {{-- Carousel --}}

    {{-- bg-[url({{ $_ENV['APP_IMG'] }}/_TT14985.webp)] --}}
    <div class="relative flex flex-col min-h-screen w-full p-4 overflow-x-hidden bg-cover bg-center bg-no-repeat"
        style="background-image: url('{{ $_ENV['APP_IMG'] }}/_TT14985 (1).webp');">
        @include('auth/banner')


        {{-- Login form --}}
        <div class="w-full h-[calc(100vh-96px)] flex items-center justify-center xl:px-20 ">
            <div class="bg-white showdow-xl w-full xl:max-w-7xl flex items-center justify-center gap-5 rounded-xl p-20">
                <div class="flex-1">
                    New Password
                </div>
                <div class="flex-1">

                    <div class="mockup-code w-full">
                        <pre data-prefix="$"><code>npm i daisyui</code></pre>
                    </div>


                </div>
            </div>
        </div>

    </div>
    @include('layouts.footer')
</body>
