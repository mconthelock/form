<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="base_url" content="<?php echo e(base_url()); ?>">
    <meta name="root_url" content="<?php echo e(root_url()); ?>">
    <link rel="manifest" href="<?php echo e(base_url()); ?>manifest.json?ver=<?php echo e($GLOBALS['version']); ?>">
    <meta name="appname" content="<?php echo e($_ENV['APP_NAME']); ?>">
    <meta name="appstatus" content="<?php echo e($_ENV['STATE']); ?>">
    <meta name="theme-color" content="#C0C0C0">
    <meta name="appname" content="<?php echo e($_ENV['APP_NAME']); ?>">
    <meta name="appstatus" content="<?php echo e($_ENV['STATE']); ?>">
    <link rel="shortcut icon" href="<?php echo e(base_url()); ?>assets/images/favicon.ico">
    <link rel="apple-touch-icon" href="<?php echo e(base_url()); ?>assets/images/favicon.ico">
    <link rel="apple-touch-startup-image" href="<?php echo e(base_url()); ?>assets/images/icon_512.png">
    <title>AMEC Webflow</title>
    <link rel="stylesheet" href="<?php echo e($_ENV['APP_CDN']); ?>/icofont/icofont.min.css">
    <link rel="stylesheet" href="<?php echo e($_ENV['APP_CDN']); ?>/flaticon/3.3.1/all/all.min.css">
    <link rel="stylesheet" href="<?php echo e(base_url()); ?>assets/dist/css/tailwind.css?ver=<?php echo e($GLOBALS['version']); ?>">
    <?php echo $__env->yieldContent('styles'); ?>
</head>

<body class="flex flex-col min-h-screen">
    <input type="checkbox" id="loading-box" class="modal-toggle" checked />

    <div class="flex flex-col w-full px-4 mt-20 mb-20 md:px-8 lg:mt-5">
        <?php echo $__env->yieldContent('contents'); ?>
    </div>

    <!-- <dialog id="confirm_box" class="modal">
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
    </dialog> -->
    <?php echo $__env->yieldContent('scripts'); ?>
</body>

</html>
<?php /**PATH D:\for_dev\src\form\application\views/layouts/webflowTemplate.blade.php ENDPATH**/ ?>