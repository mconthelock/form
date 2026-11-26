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
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Objective</legend>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div class="flex-1">
                    <select class="select w-full text-base s2 req-2" id="req-objective" data-map="OBJECTIVE">
                        <option value=""></option>
                    </select>
                </div>
                <input type="text" placeholder="Other Objective" class="input text-base flex-1"
                    id="req-objective-other" readonly data-map="OBJECTIVE_OTHER" />
            </div>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">ROI Payback Period
            </legend>
            <div class="flex items-center gap-2.5">
                <input type="text" placeholder="จำนวนปีที่คาดว่าจะคืนทุน" class="input w-full text-base req-2"
                    value="1" id="req-roi-years" data-map="ROI_RETURN" />
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
        <label class="input w-full sm:w-80 flex items-center gap-2 text-base">
            <input type="text" class="grow text-base fdate req-2" placeholder="{{ Date('Y-M') }}"
                data-map="SPEC_CONFIRM_PLAN" />
            <i class="icofont-calendar text-gray-500 text-lg"></i>
        </label>
    </fieldset>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Current Workflow
            </legend>
            <textarea class="textarea w-full h-52 text-base text-comment req-2"
                placeholder="อธิบายวิธีการทำงานในปัจจุบัน เช่น พนักงานต้องกรอกแบบฟอร์มกระดาษแล้วจึงส่ง Approve เป็นต้น"
                data-map="CURRENT_WORKFLOW"></textarea>
            <div class="flex items-center justify-between mt-1">
                <div class="label text-sm justify-start text-red-500 text-comment-err p-0"></div>
                <div class="label text-sm justify-end text-count p-0 text-gray-500 font-mono">
                    <span class="text-count-no" id="current-workflow-count">0</span>/1000
                </div>
            </div>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Expected Workflow
            </legend>
            <textarea class="textarea w-full h-52 text-base text-comment req-2" data-map="EXPECTED_WORKFLOW"
                placeholder="อธิบายวิธีการทำงานที่คาดหวังหลังจากโครงการนี้สำเร็จ เช่น พนักงานกรอกแบบฟอร์มออนไลน์แล้วระบบส่ง Approve บนระบบ Webflow เป็นต้น"></textarea>
            <div class="flex items-center justify-between mt-1">
                <div class="label text-sm justify-start text-red-500 text-comment-err p-0"></div>
                <div class="label text-sm justify-end text-count p-0 text-gray-500 font-mono">
                    <span class="text-count-no" id="expected-workflow-count">0</span>/1000
                </div>
            </div>
        </fieldset>
    </div>

    <div class="table-wrap overflow-x-auto mt-2 border border-gray-300">
        @include('isform/IS-DEV/create/table-benefit')
    </div>
</div>
