<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="base_url" content="{{ base_url() }}">
    <meta name="appname" content="{{ $_ENV['APP_NAME'] }}">
    <meta name="appstatus" content="{{ $_ENV['STATE'] }}">
    <link rel="manifest" href="{{ base_url() }}manifest.json">
    <meta name="theme-color" content="#C0C0C0">
    <link rel="shortcut icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-startup-image" href="{{ base_url() }}assets/images/icon_512.png">

    <title>AMEC Webflow 🕊️ Document Mananagement System</title>
    <link rel="stylesheet" href="{{ $_ENV['APP_CDN'] }}/select2/css/select2.min.css">
    <link rel="stylesheet" href="{{ $_ENV['APP_CSS'] }}/v1.0.1.min.css?ver={{ $GLOBALS['version'] }}">
    <script src="{{ base_url() }}assets/script/inc/auth.js"></script>
    @yield('styles')
</head>

<body class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <div id="navbar" class=""></div>
    <div class="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col items-center justify-start w-full h-full">
            <!-- Page content here -->
            <div class="flex-1 flex flex-col w-full px-4 md:px-8 lg:mt-5">
                @yield('contents')
            </div>
            <!-- Footer -->
            @include('layouts.footer')
        </div>
        <div class="drawer-side shadow-2xl z-[51]!">
            <div id="sidebar"></div>
        </div>
    </div>

    <dialog id="confirm_box" class="modal">
        <div class="modal-box">
            <form method="dialog" class="">
                <h3 class="text-lg font-bold flex items-center gap-3" id="confirm_title"></h3>
                <p class="py-4" id="confirm_message"></p>
                <textarea class="textarea textarea-bordered w-full h-24 hidden" id="confirm_reason"
                    placeholder="Please enter your reson"></textarea>
                <input type="hidden" id="confirm_key">
                <div class="modal-action">
                    <button class="btn btn-primary" id="confirm_accept"><span
                            class="loading loading-spinner hidden"></span>
                        Confirm</button>
                    <button class="btn btn-error text-white" id="confirm_close">Discard</button>
                </div>
            </form>
        </div>
    </dialog>
    <script src="{{ $_ENV['APP_JS'] }}/apps.js?ver={{ $GLOBALS['version'] }}"></script>
    @yield('scripts')
</body>

</html>
