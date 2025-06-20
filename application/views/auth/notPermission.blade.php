<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Move to another link.</title>
    <link rel="stylesheet" href="{{ base_url() }}assets/dist/css/tailwind.css?ver={{ $GLOBALS['version'] }}">
    <link rel="stylesheet" href="{{ $_ENV['APP_CDN'] }}/icofont/icofont.min.css">
</head>

<body>
    <div class="draw-container h-screen w-screen">
        <div class="relative flex items-end justify-center h-1/2">
            <i class="icofont-brand-micromax text-[20vw] !font-black text-error absolute"></i>
            <i class="icofont-brand-micromax text-[20vw] !font-black text-error animate-ping absolute"></i>
        </div>
        <div class="flex flex-col justify-start text-center h-1/2">
            <div class=" mt-5!font-black text-3xl px-0 w-full font-normal">
                Access Denied
            </div>
            <div class="text-md font-normal text-xl px-0 w-full text-gray-400 flex flex-col">
                <span>You have no permission to Access on our system</span>
                <span>Please contact admin Tel. 2032-2038</span>
                <a href="{{ $_ENV['APP_ENV']}}"class="text-blue-500 z-10 mt-6"><u>Back to website</u></a>
            </div>
        </div>
            
    </div>
    <script src="{{ $_ENV['APP_CDN'] }}/jquery/3.7.1/jquery.min.js"></script>
</body>

</html>
