<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="base_url" content="{{ base_url() }}">
    <meta name="root_url" content="{{ root_url() }}">
    <link rel="manifest" href="{{ base_url() }}manifest.json?ver={{ $GLOBALS['version'] }}">
    <meta name="theme-color" content="#C0C0C0">
    <link rel="shortcut icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-startup-image" href="{{ base_url() }}assets/images/icon_512.png">
    <title>AMEC Webflow</title>

    <link rel="stylesheet" href="{{ $_ENV['APP_CDN'] }}/icofont/icofont.min.css">
    <link rel="stylesheet" href="{{ $_ENV['APP_CDN'] }}/datatable/v2.2.2/datatables.min.css">
    <link rel="stylesheet" href="{{ $_ENV['APP_CDN'] }}/datatable/v2.2.2/responsive.dataTables.min.css">
    <link rel="stylesheet" href="{{ base_url() }}assets/dist/css/tailwind.css?ver={{ $GLOBALS['version'] }}">
    @yield('styles')
</head>

<body class="flex flex-col min-h-screen">

    <input type="checkbox" id="loading-box" class="modal-toggle" />
    <div class="modal !z-[9999]" role="dialog">
        <div class="loader"></div>
    </div>

    <div class="flex flex-col w-full px-4 mt-20 mb-20 md:px-8 lg:mt-5">
        @yield('contents')
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

    <script defer src="{{ base_url() }}script.js?ver={{ $GLOBALS['version'] }}"></script>
    <script src="{{ $_ENV['APP_CDN'] }}/jquery/3.7.1/jquery.min.js"></script>
    <script src="{{ $_ENV['APP_CDN'] }}/datatable/v2.2.2/datatables.min.js"></script>
    <script src="{{ $_ENV['APP_CDN'] }}/datatable/v2.2.2/dataTables.responsive.min.js"></script>
    {{-- <script src="{{ $_ENV['APP_JS'] }}/apps.js?ver={{ $GLOBALS['version'] }}"></script> --}}
    @yield('scripts')
</body>

</html>
