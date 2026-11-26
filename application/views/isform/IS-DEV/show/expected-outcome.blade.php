<header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
    <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">02</span>
    <div>
        <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Expected Outcome</h2>
        <div class="text-sm text-gray-500">เป้าหมาย ผลลัพธ์ที่คาดหวัง และขั้นตอนการทำงาน</div>
    </div>
</header>
<div class="bg-white p-5 flex flex-col gap-5">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <fieldset class="fieldset lg:col-span-2">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Objective
            </legend>
            <div class="bg-gray-50 border border-gray-300 px-3 py-2 min-h-10 text-base text-gray-800 map-data"
                data-key="OBJECTIVE_TXT" data-group="">
                <div class="skeleton h-6 w-56"></div>
            </div>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">ROI Payback
                Period</legend>
            <div class="flex items-center gap-2.5">
                <div class="bg-gray-50 border border-gray-300 px-3 py-2 min-h-10 text-base text-gray-800 flex-1 map-data"
                    data-key="ROI_RETURN" data-group="">
                    <div class="skeleton h-6 w-24"></div>
                </div>
                <span class="text-gray-600 text-sm whitespace-nowrap">Year(s)</span>
            </div>
        </fieldset>
    </div>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">
            Preferred Requirement Gathering Period
        </legend>
        <p class="text-sm text-gray-500 italic mb-1.5">
            กำหนดการที่พร้อมสำหรับการเก็บรวบรวมข้อกำหนดและ Developer เริ่มงานได้
        </p>
        <div
            class="bg-gray-50 border border-gray-300 px-3 py-2 min-h-10 w-full sm:w-80 flex items-center justify-between gap-2 text-base text-gray-800">
            <span class="map-data" data-key="SPEC_CONFIRM_PLAN_TXT" data-group="">
                <span class="skeleton inline-block h-5 w-32"></span>
            </span>
            <i class="icofont-calendar text-gray-500 text-lg"></i>
        </div>
    </fieldset>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Current Workflow
            </legend>
            <div class="bg-gray-50 border border-gray-300 px-3 py-2.5 min-h-36 text-base text-gray-800 map-data"
                data-key="CURRENT_WORKFLOW" data-group="">
                <div class="skeleton h-6 w-full max-w-md"></div>
            </div>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Expected
                Workflow</legend>
            <div class="bg-gray-50 border border-gray-300 px-3 py-2.5 min-h-36 text-base text-gray-800 map-data"
                data-key="EXPECTED_WORKFLOW" data-group="">
                <div class="skeleton h-6 w-full max-w-md"></div>
            </div>
        </fieldset>
    </div>

    <div class="table-wrap overflow-x-auto mt-2 border border-gray-300">
        @include('isform.IS-DEV.create.table-benefit', ['view' => true])
    </div>
</div>
