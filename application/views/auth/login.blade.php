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
        .qr-frame span:nth-child(1) { top: 0; left: 0; border-right: none; border-bottom: none; }
        .qr-frame span:nth-child(2) { top: 0; right: 0; border-left: none; border-bottom: none; }
        .qr-frame span:nth-child(3) { bottom: 0; left: 0; border-right: none; border-top: none; }
        .qr-frame span:nth-child(4) { bottom: 0; right: 0; border-left: none; border-top: none; }
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

            {{-- หมายเหตุ: กล่อง preview กล้อง (overlay, video, ปุ่มปิด) ถูกสร้างขึ้นเองโดย
                 @amec/webasset/qrScanner ตอน runtime (append เข้า document.body) จึงไม่ต้องเขียน markup
                 ของกล้องไว้ตรงนี้อีก --}}

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