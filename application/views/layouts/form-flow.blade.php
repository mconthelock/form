<section class="bg-gray-200 border border-gray-300">
    <header class="flex gap-3 p-4 items-center">
        <div class="flex-1 flex flex-row items-center gap-3">
            <h1 class="bg-black text-2xl text-white h-8 w-8 flex items-center justify-center"><i
                    class="fi fi-ts-workflow"></i></h1>
            <div>
                <h2 class="font-bold text-gray-600">Approval Workflow & Audit Trail</h2>
                <div class="text-xs text-gray-500">ลำดับการอนุมัติ่เอกสารและประวัติการตรวจสอบ</div>
            </div>
        </div>
        <div id="form-flow-status"></div>
    </header>

    <section class="bg-white border border-gray-300 p-4 overflow-x-auto">
        <ul class="steps w-full justify-center" id="form-flow-steps"></ul>
    </section>

    <table class="table text-xs" id="form-flow-table">
        <thead>
            <tr>
                <td class="w-8">STEP</td>
                <td>ROLE/TIER</td>
                <td class="w-16">EMP NO</td>
                <td>NAME</td>
                <td>POSITION</td>
                <td class="w-48">ACTION DATE</td>
                <td class="w-24">STATUS</td>
                <td>REMARK</td>
            </tr>
        </thead>
        <tbody class="bg-white"></tbody>
    </table>
</section>
