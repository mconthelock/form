        <fieldset id="checkpoint-fields" {{ $pageMode !== 'create' ? 'disabled' : '' }}>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 class="flex items-center gap-3 font-bold text-slate-900"><span class="flex size-7 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-700">3</span>Check Points <span class="text-xs font-normal text-slate-400">Inspection Data</span></h2><span id="checkpoint-summary" class="text-xs text-slate-500" aria-live="polite"></span></div>
            <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full min-w-[900px] table-fixed text-sm">
                    <colgroup>
                        <col style="width:4%"><col style="width:25%"><col style="width:17%">
                        <col style="width:9%"><col style="width:9%"><col style="width:10%">
                        <col style="width:13%"><col style="width:9%"><col style="width:4%">
                    </colgroup>
                    <thead class="bg-slate-50 text-xs font-bold text-slate-800">
                        <tr>
                            <th rowspan="2" class="p-3">#</th>
                            <th rowspan="2">Check Point <span class="text-red-600">*</span></th>
                            <th rowspan="2">Inspection Tool</th><th colspan="2" class="p-2">Standard</th>
                            <th rowspan="2">Measured <span class="text-red-600">*</span></th>
                            <th rowspan="2">Unit</th><th rowspan="2">Result</th>
                            <th rowspan="2"><span class="sr-only">ลบ</span></th>
                        </tr>
                        <tr>
                            <th class="p-2">MIN<span class="text-red-600">*</span></th>
                            <th>MAX<span class="text-red-600">*</span></th>
                        </tr>
                    </thead>
                    <tbody id="checkpoint-rows"></tbody>
                </table>
            </div>
            <div class="mt-4 flex flex-wrap items-center justify-between gap-3"><button id="add-checkpoint" type="button" class="btn btn-sm border-slate-200 bg-white text-indigo-700">+ เพิ่ม Check Point</button><p class="text-xs text-slate-400">กรอก MIN / MAX ก่อน Measured · ค่าในช่วงรวมขอบเขต = OK</p></div>
        </section>
        </fieldset>
