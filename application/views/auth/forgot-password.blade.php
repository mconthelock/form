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
    {{-- @include('layouts/splash') --}}
    {{-- Carousel --}}
    @include('auth/carousel')

    <div class="relative flex flex-col min-h-screen w-full p-4 overflow-x-hidden">
        {{-- Braner && Background --}}
        @include('auth/banner')
        {{-- Login form --}}
        <div class="w-full h-[calc(100vh-86px)] flex items-center justify-center lg:justify-center ">
            <div
                class="w-96 min-h-120! flex flex-col justify-center items-center p-8 rounded-lg shadow-lg bg-white border border-base-300 z-0 form-cover">
                <h1 class="text-2xl font-black text-center text-slate-600" id="login-title">Forgot Password</h1>
                <h1 class="text-sm font-bold text-center text-slate-400 mt-3 mb-8">Reset your password</h1>
                {{-- Password login --}}
                {{-- @include('auth/password') --}}
                <div class="loginform" id="frm-password">
                    <form action="#" method="POST" class="mt-4" autocomplete="off" id="passwordForgot">
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text font-bold mb-3">Username</span>
                            </label>
                            <input type="text" name="username" placeholder="Username"
                                class="input input-bordered username text-sm" autocomplete="new-password" required>
                        </div>
                        <div class="mt-4 flex flex-col gap-2">
                            <button type="submit" class="btn btn-primary w-full">
                                <span class="loading loading-spinner hidden"></span>
                                <span>Reset Password</span>
                            </button>

                            <a href="{{ base_url() }}" class="btn btn-neutral btn-outline w-full">
                                <span class="loading loading-spinner hidden"></span>
                                <span>Back</span>
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    @include('layouts.footer')
    <script src="{{ $_ENV['APP_JS'] }}/forgotpassword.js?ver={{ $GLOBALS['version'] }}"></script>
</body>

</html>
