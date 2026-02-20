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
    <link rel="stylesheet" href="{{ base_url() }}assets/dist/css/tailwind.css?ver={{ $GLOBALS['version'] }}">
    @yield('styles')
</head>

<body class="flex flex-col min-h-screen">
    <input type="hidden" id="appid" value="{{ $_ENV['APP_ID'] }}">
    <input type="checkbox" id="loading-box" class="modal-toggle" checked />
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
        <div class="drawer-side z-51!" style="box-shadow: 8px 0 12px rgba(0,0,0,0.25);">
            <div id="sidebar"></div>
        </div>
    </div>

    <script src="{{ $_ENV['APP_JS'] }}/apps.js?ver={{ $GLOBALS['version'] }}"></script>
    @yield('scripts')
</body>

</html>
