<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="base_url" content="{{ base_url() }}">
    <meta name="appname" content="{{ $_ENV['APP_NAME'] }}">
    <meta name="theme-color" content="#C0C0C0">
    <link rel="shortcut icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-icon" href="{{ base_url() }}assets/images/favicon.ico">
    <link rel="apple-touch-startup-image" href="{{ base_url() }}assets/images/icon_512.png">
    <title>AMEC Webflow</title>
    <link rel="stylesheet" href="{{ $_ENV['APP_CDN'] }}/icofont/icofont.min.css">
    <link rel="stylesheet" href="{{ base_url() }}assets/dist/css/tailwind.css?ver={{ $_ENV['VERSION'] }}">
    <script>
        const host = document.querySelector('meta[name="base_url"]').content;
        const isdomain = host.indexOf("mitsubishielevatorasia.co.th");
        var s = host.split("/");
        if (isdomain == -1) {
            window.location = "https://" + s[2] + ".mitsubishielevatorasia.co.th/" + s[3];
        }

        const currenturl = window.location.href;
        const protocol = window.location.protocol;
        if (protocol == 'http:') {
            const url = currenturl.replace(protocol, 'https:')
            window.location.href = url;
        }

        var iscookie = '';
        const name = document.querySelector('meta[name="appname"]').content;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                iscookie = cookie.substring(name.length + 1);

            }
        }

        if (iscookie != "") {
            window.location.href = `${host}/home`;
        }
    </script>
</head>

<body class="flex flex-col min-h-screen">
    <div class="flex-1 flex flex-col w-full">
        <input type="hidden" id="appid" value="{{ $id }}">
        <div class="relative flex flex-col min-h-[100vh] w-full p-4 overflow-x-hidden">
            {{-- Braner && Background --}}
            <div class="px-8 py-4">
                @include('svg/brand_text_w')
            </div>
            <div class="absolute z-[-1] w-full h-96 md:w-96">
                <div
                    class="bg-accent -left-1/5 pointer-events-none  aspect-square w-3/4 -translate-x-1/2 rounded-full opacity-20 blur-3xl">
                </div>
                <div
                    class="bg-primary pointer-events-none absolute bottom-[-20%] left-1/2 aspect-square w-full -translate-x-1/2 rounded-full opacity-20 blur-3xl">
                </div>
                <div
                    class="bg-base-100 pointer-events-none absolute top-0 left-0 z-3 aspect-square w-1/2 rounded-full opacity-60 blur-3xl">
                </div>
            </div>

            {{-- Password Login --}}
            <div class="w-full h-[calc(100vh-86px)] flex items-center justify-center lg:justify-end ">
                <div class="w-96 p-8 rounded-lg shadow-lg bg-white z-0 lg:mr-32 form-cover">
                    <h1 class="text-2xl font-bold text-center">Login</h1>

                    {{-- Password login --}}
                    <div class="loginform" id="frm-password">
                        <form action="#" method="POST" class="mt-4" autocomplete="off" id="passwordLogin">
                            <div class="form-control">
                                <label class="label">
                                    <span class="label-text font-bold">Username</span>
                                </label>
                                <input type="text" name="username" placeholder="Username"
                                    class="input input-bordered username text-sm" autocomplete="new-password" required>
                            </div>
                            <div class="form-control mt-4">
                                <label class="label">
                                    <span class="label-text font-bold">Password</span>
                                </label>
                                <label class="input input-bordered flex items-center gap-2">
                                    <input type="password" class="grow password" autocomplete="new-password" required
                                        placeholder="Password" />
                                    <a href="#" id="option" class="text-primary h-6 w-6">
                                        @include('svg/eye_slash')
                                    </a>
                                </label>
                            </div>
                            <div class="mt-4">
                                <button type="submit" class="btn btn-primary text-white w-full">
                                    <span class="loading loading-spinner hidden"></span>
                                    <span>Sign in</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {{-- RFID Lofin  --}}
                    <div class="loginform hidden" id="frm-rfid">
                        <form action="#" method="POST" class="mt-4" autocomplete="off" id="rfidLogin">
                            <div class="form-control mt-4">
                                <label class="label">
                                    <span class="label-text">Card ID</span>
                                </label>
                                <input type="password" name="password" placeholder="Put your card on scanner"
                                    class="input input-bordered" autocomplete="new-password" id="rfid-input" required>
                            </div>
                            <div class="mt-4">
                                <button type="submit" class="btn btn-primary w-full text-white">Login</button>
                            </div>
                        </form>
                    </div>

                    {{-- Barcode Login --}}
                    <div class="loginform hidden" id="frm-barcode">
                        <form action="#" method="POST" class="mt-4" autocomplete="off" id="barcodeLogin">
                            <div class="form-control mt-4">
                                <label class="label">
                                    <span class="label-text font-bold">Employee No</span>
                                </label>
                                <input type="password" name="password" placeholder="Scan Barcode/QR Code your card"
                                    class="input input-bordered" autocomplete="new-password" id="barcode-input"
                                    required>

                                <input type="text" id="manual-input" placeholder="กรอกเอง"
                                    style="display: none;" />
                                <div id="result"></div>
                            </div>
                            <div class="mt-4">
                                <button type="submit" class="btn btn-primary w-full text-white">Login</button>
                            </div>
                        </form>
                    </div>

                    {{-- Form footer --}}
                    <div class="mt-4">
                        <a href="#" class="block text-center">Forgot Password?</a>
                    </div>
                    <div class="divider">OR</div>
                    <div class="mt-4 flex flex-col gap-3">
                        <a class="btn btn-neutral w-full toggle-login hidden" data-type="frm-password">
                            <span class="loading loading-spinner hidden"></span>
                            <span class="flex justify-center"><i class="icofont-flikr me-2 text-2xl"></i>Login with
                                Password</span>
                        </a>
                        <a class="btn btn-neutral w-full toggle-login" data-type="frm-barcode">
                            <span class="loading loading-spinner hidden"></span>
                            <span class="flex justify-center"><i class="icofont-qr-code me-2 text-2xl"></i>Login with
                                Barcode/QR Code</span>
                        </a>
                        <a class="btn btn-neutral w-full toggle-login" data-type="frm-rfid">
                            <span class="loading loading-spinner hidden"></span>
                            <span class="flex justify-center"><i class="icofont-penalty-card me-2 text-2xl"></i>Login
                                with Employee Card</span>
                        </a>
                    </div>
                    <div class="mt-8 hidden" id="webflow-link">
                        <a href="{{ base_url() }}" class="block text-center text-md text-primary">I need to login
                            Webflow</a>
                    </div>
                </div>
            </div>
            <div class="fixed top-0 left-0 w-[100dvw] h-[100dvh] bg-black hidden z-1" id="open-camera">
                <video id="video" width="100%" height="100%"></video>
            </div>

            {{-- Carousel --}}
            @include('auth/carousel')

        </div>
    </div>
    @include('layouts.footer')

    <input type="checkbox" id="loading-box" class="modal-toggle" />
    <div class="modal" role="dialog">
        <div class="loader"></div>
    </div>

    <script defer src="{{ base_url() }}script.js?ver={{ $_ENV['VERSION'] }}"></script>
    <script src="{{ $_ENV['APP_CDN'] }}/jquery/3.7.1/jquery.min.js"></script>
    <script src="{{ $_ENV['APP_JS'] }}/login.js?ver={{ $_ENV['VERSION'] }}"></script>
</body>

</html>
