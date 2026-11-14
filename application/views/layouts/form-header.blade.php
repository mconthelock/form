<header class="flex grow gap-3">
    <div class="flex flex-row flex-1 gap-2 items-center">
        <h1 class="bg-black text-white w-14 h-14 flex items-center justify-center text-4xl font-mono font-bold overflow-hidden"
            id="form-header-icon">
            ..
        </h1>
        <div class="flex flex-col gap-0">
            <h2 class="text-2xl" id="form-header-title">Loading...</h2>
            <h3 class="text-sm text-gray-400" id="form-header-subtitle">Loading...</h3>
        </div>
    </div> <!-- Close flex flex-col gap-2 -->
    <div class="flex-none flex flex-row items-center gap-2 px-4 py-2 border " id="form-header-status">
        <span id="form-header-status-icon">
            <span class="loading loading-spinner loading-xl text-gray-500"></span>
        </span>
        <div class="flex flex-col gap-0">
            <h3 class="font-bold text-md uppercase" id="form-header-status-en">Loading...</h3>
            <h4 class="text-[10px]" id="form-header-status-th">Loading....</h4>
        </div>
    </div>
    <div
        class="flex-none border-3 border-red-500 px-3 flex items-center justify-center font-bold font-head text-xl text-red-500 {{ isset($confidential) ? 'visible' : 'hidden' }}">
        CONFIDENTIAL</div>
</header>
<input type="text" class="hidden" id="NFRMNO" value="{{ $NFRMNO }}" />
<input type="text" class="hidden" id="VORGNO" value="{{ $VORGNO }}" />
<input type="text" class="hidden" id="CYEAR" value="{{ $CYEAR }}" />
<input type="text" class="hidden" id="CYEAR2" value="{{ $CYEAR2 }}" />
<input type="text" class="hidden" id="NRUNNO" value="{{ $NRUNNO }}" />
<input type="text" class="hidden" id="EMPNO" value="{{ $EMPNO }}" />
