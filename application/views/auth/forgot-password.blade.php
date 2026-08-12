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
    <div class="flex-1 flex flex-col w-full">
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
            <div class="w-full lg:w-96 h-[calc(100vh-86px)] flex items-center justify-center lg:justify-center ">
                <div class="w-full p-8 rounded-lg shadow-lg bg-white z-0 form-cover">
                    <h1 class="text-sm font-bold text-center text-slate-400">Forgot Password</h1>
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
                </div>
            </div>
        </div>
    </div>
</body>

</html>
