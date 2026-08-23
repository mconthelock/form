<ul class="list bg-base-100 rounded-box shadow-md border border-slate-200" id="flow-list">
    <li class="p-4 pb-2 text-xs tracking-wide flex">
        <div class="flex-1">
            <div class="font-semibold uppercase">Form Flow</div>
            <div class="text-slate-500">The flow of the form process</div>
        </div>
        <a href="#" class="btn btn-primary add-flow" id="add-flow">+</a>
    </li>

    <li class="list-row">
        <div>
            {{-- <img class="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp" /> --}}
        </div>
        <div>
            <div>Dio Lupa</div>
            <div class="text-xs uppercase font-semibold opacity-60">Remaining Reason</div>
        </div>
        <button class="btn btn-square btn-ghost btn-sm">
            <i class="fi fi-rr-caret-down text-xl flex"></i>
        </button>
        <button class="btn btn-square btn-ghost btn-sm">
            <i class="fi fi-rr-caret-up text-xl flex"></i>
        </button>
    </li>
</ul>

<div class="bg-base-100 rounded-box shadow-md border border-slate-200 hidden" id="add-flow-form">
    <form action="#" class="p-4 space-y-3" id="flow-form">
        <h1 class="font-semibold mb-2">New Flow Step</h1>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Flow Name</legend>
            <input type="text" class="input w-full" placeholder="Type here" id="vflowname" />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Flow Name</legend>
            <input type="text" class="input w-full" placeholder="Type here" id="vflowname" />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Flow Name</legend>
            <input type="text" class="input w-full" placeholder="Type here" id="vflowname" />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Flow Name</legend>
            <input type="text" class="input w-full" placeholder="Type here" id="vflowname" />
        </fieldset>

        <button class="btn btn-primary w-full mt-3" type="button" id="save-flow-btn">Save Data</button>
        <button class="btn btn-soft w-full mt-1 add-flow" type="button">Cancel</button>
    </form>
</div>
