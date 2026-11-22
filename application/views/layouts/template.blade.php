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
    <link rel="stylesheet" href="{{ $_ENV['APP_CDN'] }}/icofont/icofont.min.css">
    <link rel="stylesheet" href="{{ base_url() }}assets/dist/css/tailwind.css?ver={{ $GLOBALS['version'] }}">
    <script>
        if (localStorage.getItem('pin') === null) {
            localStorage.setItem('pin', 'true');
        }
        if (localStorage.getItem('pin') === 'false') {
            document.documentElement.classList.add('sidebar-collapsed');
        }
    </script>
    @yield('styles')
</head>

<body id="top" menuTitle="{{ $title ?? '' }}" class="flex flex-col min-h-screen">
    <div id="nav-progress-bar" aria-hidden="true"></div>
    <input type="hidden" id="appid" value="{{ $_ENV['APP_ID'] }}">
    <input type="checkbox" id="loading-box" class="modal-toggle" checked />
    <!-- Navbar -->
    <div id="navbar" class="md:hidden!"></div>
    <div class="drawer md:drawer-open">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col items-center justify-start w-full h-full">
            <!-- Page content here -->
            <div class="flex-1 flex flex-col w-full px-4 md:px-8 lg:mt-5" id="main-contents">
                @yield('contents')
            </div>
            <!-- Footer -->
            @include('layouts.footer')
        </div>
        <div class="drawer-side z-51!">
            <div id="sidebar" class="size-xl h-full"></div>
            <script>
                (function () {
                    try {
                        var html = sessionStorage.getItem('amec_sidebar_html');
                        var el = document.getElementById('sidebar');
                        if (!html || !el) return;
                        el.outerHTML = html;
                        var sb = document.getElementById('sidebar');
                        if (!sb) return;
                        var collapsed = localStorage.getItem('pin') === 'false';
                        sb.classList.toggle('collapsed', collapsed);
                        sb.classList.remove('collapsed-hover');
                        sb.querySelectorAll('.menu-focus').forEach(function (a) {
                            a.classList.remove('menu-focus');
                        });
                        sb.querySelectorAll('details[open]').forEach(function (d) {
                            d.removeAttribute('open');
                        });
                        var title = document.body.getAttribute('menuTitle');
                        if (title) {
                            var item = sb.querySelector('.' + CSS.escape(title));
                            if (item) {
                                var det = item.closest('details');
                                if (det) det.setAttribute('open', '');
                                var link = item.querySelector('a');
                                if (link) link.classList.add('menu-focus');
                            }
                        }
                    } catch (e) {}
                })();
            </script>
        </div>
    </div>

    <script src="{{ $_ENV['APP_JS'] }}/apps.js?ver={{ $GLOBALS['version'] }}"></script>
    @yield('scripts')
</body>

</html>
