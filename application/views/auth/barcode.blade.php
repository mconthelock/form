<div class="loginform hidden" id="frm-barcode">
    <form action="#" method="POST" class="mt-4" autocomplete="off" id="barcodeLogin">
        <div class="form-control mt-4">
            <label class="label">
                <span class="label-text font-bold">Employee No</span>
            </label>
            <input type="password" name="password" placeholder="Scan Barcode/QR Code your card"
                class="input input-bordered" autocomplete="new-password" id="barcode-input" required>
        </div>
        <div class="mt-4 flex flex-col gap-3">
            <button type="submit" class="btn btn-primary w-full text-white">Login</button>
            <button type="button" class="btn btn-neutral w-full text-white">Open Camera</button>
        </div>
    </form>
</div>


{{-- Open Camera for Scan QR Code --}}
<div class="shadow-xl fixed top-0 left-0 w-full h-full z-1 hidden" id="open-camera">
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
