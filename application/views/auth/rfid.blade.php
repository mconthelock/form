<div class="loginform hidden  flex items-center justify-center my-12 " id="frm-rfid">
    {{-- <form action="#" method="POST" class="mt-4" autocomplete="off" id="rfidLogin">
        <div class="form-control mt-4">
            <label class="label">
                <span class="label-text">Card ID</span>
            </label>
            <input type="password" name="password" placeholder="Put your card on scanner" class="input input-bordered"
                autocomplete="new-password" id="rfid-input" required>
        </div>
        <div class="mt-4">
            <button type="submit" class="btn btn-primary w-full text-white">Login</button>
        </div>
    </form> --}}

    <div class="relative">
        <h1 class="text-2xl font-bold mb-4 text-center text-red-500">วางบัตรลงบนเครื่องอ่าน</h1>
        <div class="w-52 h-52 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <img src="{{ base_url('assets/images/rfid.png') }}" class="w-28 h-28 opacity-80" alt="barcode">
        </div>

        {{-- Pulse --}}
        <div class="absolute inset-0 rounded-full border-4 border-teal-400 animate-ping opacity-20"></div>
    </div>
</div>
