@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" nfrmno="{{ $NFRMNO }}" vorgno="{{ $VORGNO }}" cyear="{{ $CYEAR }}"
        mode="{{ $mode }}">
    </div>
    <div class="apv-data hidden" apv="{{ $apv }}"></div>

    <div class="flex flex-col px-4 my-5 font-sans">
        <div class="card bg-base-100 border border-slate-300 w-full lg:w-280 place-self-center shadow-sm p-8">
            <h2 class="card-title">
                <u class="text-3xl text-primary font-bold mb-5">Non-PO Expense</u>
                <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
            </h2>

            <div class="flex gap-5 mb-5">
                <fieldset class="flex-1 fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                    <legend class="fieldset-legend">Request By <span class="text-red-500">*</span></legend>
                    <input type="text" class="input" placeholder="My awesome page" />
                </fieldset>
                <fieldset class="flex-1 fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                    <legend class="fieldset-legend">Input By <span class="text-red-500">*</span></legend>
                    <div class="flex">
                        <div class="avatar">
                            <div class="w-16 rounded-full">
                                <img src="https://img.daisyui.com/images/profile/demo/yellingwoman@192.webp" />
                            </div>
                        </div>
                        <div class="flex-col ml-4">
                            <h1 class="text-sm font-bold">Chalorms Sewanam</h1>
                            <h1 class="text-sm font-bold text-primary">12069</h1>
                            <h1 class="text-sm text-slate-600">WSD/IS/EP</h1>
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/fin-npo-create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
