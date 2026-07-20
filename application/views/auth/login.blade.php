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
    @include('layouts/splash')
    <div class="flex-1 flex flex-col w-full">
        <input type="hidden" id="appid" value="{{ $id }}">
        <div class="relative flex flex-col min-h-screen w-full p-4 overflow-x-hidden">
            {{-- Braner && Background --}}
            <div class="px-8 py-4">
                <img src="{{ base_url() }}assets/images/{{ $id == 1 ? 'brand_text_w.png' : 'brand_text_p.png' }}"
                    alt="AMEC Webflow" class="w-48">
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
                    <h1 class="text-sm font-bold text-center text-slate-400">Welcome</h1>
                    <h1 class="text-2xl font-black text-center text-slate-600" id="login-title"></h1>
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
                                    <a href="#" id="show-password"
                                        class="text-primary h-6 w-6 flex items-center show-password">
                                        <i class="fi fi-rs-crossed-eye eye-close flex text-2xl text-gray-600"></i>
                                        <i class="fi fi-sr-eye eye-open text-2xl text-gray-600 hidden"></i>
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
                                    <span class="label-text font-bold">Card ID</span>
                                </label>
                                <input type="password" name="password" placeholder="Scan Barcode/QR Code your card"
                                    class="input input-bordered" autocomplete="new-password" id="barcode-input"
                                    required>
                            </div>
                            <div class="mt-4 flex flex-col gap-3">
                                <button type="submit" class="btn btn-primary w-full text-white">
                                    <span class="loading loading-spinner hidden"></span>
                                    <span>Login</span>
                                </button>
                                <button type="button" class="btn btn-neutral w-full text-white" id="open-camera-btn">Open Camera</button>
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
                            <span class="flex justify-center"><i
                                    class="fi fi-rs-password-alt me-2 text-2xl"></i></span>
                            <p class="line-clamp-1">Password Login</p>
                        </a>
                        <a class="btn btn-neutral w-full toggle-login" data-type="frm-barcode">
                            <span class="loading loading-spinner hidden"></span>
                            <span class="flex justify-center"><i class="fi fi-rr-qrcode me-2 text-2xl"></i></span>
                            <p class="line-clamp-1">Barcode/QR Code Log in</p>
                        </a>
                        <a class="btn btn-neutral w-full toggle-login" data-type="frm-rfid">
                            <span class="loading loading-spinner hidden"></span>
                            <span class="flex justify-center">
                                <i class="fi fi-rr-credit-card-buyer me-2 text-2xl"></i>
                            </span>
                            <p class="line-clamp-1">Employee Card Log in</p>
                        </a>
                    </div>
                    <div class="mt-8 hidden" id="webflow-link">
                        <a href="{{ base_url() }}" class="block text-center text-md text-primary">I need to login
                            Webflow</a>
                    </div>
                </div>
            </div>

            {{-- Open Camera for Scan QR Code --}}
            <div class="shadow-xl fixed top-0 left-0 w-full h-full z-50 hidden" id="open-camera">
                <div id="video-wrapper" class="w-full h-full relative flex">
                    <video id="video" class="w-full aspect-video bg-white border-2 "></video>
                </div>
                <div class="line "></div>
                <h1 class="absolute text-xl text-center text-white w-full top-0 pt-3">
                    ให้ Barcode/QR Code อยู่ตรงกลางภาพ
                </h1>

                <div class="absolute w-full text-center bottom-0 pb-5 flex justify-center items-center gap-8">
                    <button class="btn btn-circle btn-ghost btn-lg text-white">
                        <i class="icofont-image text-4xl"></i>
                    </button>
                    <button class="btn btn-circle btn-ghost btn-lg text-white" type="button" id="close-camera">
                        <i class="icofont-close-circled text-4xl"></i>
                    </button>
                </div>
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

    {{-- <script src="{{ $_ENV['APP_CDN'] }}/jquery/3.7.1/jquery.min.js"></script> --}}
    <script src="{{ $_ENV['APP_JS'] }}/login.js?ver={{ $GLOBALS['version'] }}"></script>
</body>

</html>