<div class="loginform hidden" id="frm-barcode">
    <form action="#" method="POST" class="mt-4" autocomplete="off" id="barcodeLogin">
        <div class="form-control mt-4">
            <label class="label">
                <span class="label-text font-bold mb-3">Employee No</span>
            </label>
            <input type="password" name="password" placeholder="Scan Barcode/QR Code your card"
                class="input input-bordered" autocomplete="new-password" id="barcode-input" required>
        </div>
        <div class="mt-4 flex flex-col gap-3">
            <button type="submit" class="btn btn-primary w-full text-white">Login</button>
            <button type="button" class="btn btn-outline btn-primary w-full" id="opencamera">Open
                Camera</button>
        </div>
    </form>
</div>


{{-- Open Camera for Scan QR Code --}}
<div class="shadow-xl fixed inset-0 z-0 hidden bg-black/80" id="open-camera">
    <h1 class="text-xl text-center text-white w-full pt-4 relative z-10">
        ให้ Barcode/QR Code อยู่ตรงกลางภาพ
    </h1>
    <div id="video-wrapper" class="absolute inset-0 flex items-center justify-center z-0">
        <video id="video" class="w-full h-full object-cover bg-black border-0"></video>
    </div>
    <div class="absolute inset-x-0 bottom-0 z-10 w-full text-center pb-5 flex justify-center items-center gap-8">
        {{-- <button class="btn btn-circle btn-error btn-lg text-white" aria-label="Camera options">
            <i class="icofont-image text-4xl"></i>
        </button> --}}
        <button class="btn btn-circle btn-error btn-lg text-white" type="button" id="close-camera"
            aria-label="Close camera">
            <i class="fi fi-sr-stop"></i>
        </button>
    </div>
</div>
