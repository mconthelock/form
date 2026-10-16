<div class="grid gap-5 min-w-[60vw] max-w-[70vw]">

    {{-- main content --}}
    <div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg backdrop-blur-sm">
        <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
            <div class="flex items-center gap-2">
                <i class="fi fi-sr-memo-circle-check text-lg text-slate-600"></i>
                <h2 class="text-base font-bold text-slate-800">Price Approval System</h2>
            </div>
        </div>

        <form id="form-price-approval" class="flex flex-col gap-6 p-6">

            {{-- Section 1: ข้อมูลเอกสาร --}}
            <section class="rounded-xl border border-slate-200">
                <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <span class="badge badge-neutral badge-sm">1</span>
                    <h3 class="font-semibold text-slate-700">ข้อมูลเอกสาร</h3>
                </header>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                    <div class="col-span-2" id="form-detail"></div>
                </div>
            </section>

            {{-- Section 2: รายละเอียดสินค้า --}}
            <section class="rounded-xl border border-slate-200">
                <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <span class="badge badge-neutral badge-sm">2</span>
                    <h3 class="font-semibold text-slate-700">รายละเอียดสินค้า (New Item)</h3>
                </header>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                    <div
                        class="grid grid-cols-[max-content_auto] border rounded-xl overflow-hidden block-detail text-sm">
                        <span>Vendor Code</span>
                        <span id="VVENDOR"></span>
                        <span>Planner Code</span>
                        <span id="VPLANNER"></span>
                        <span>Maker (Business route)</span>
                        <span id="VMAKER"></span>
                        <span>Model Name</span>
                        <span id="VMODEL_NAME"></span>
                    </div>
                    <div
                        class="grid grid-cols-[max-content_auto] border rounded-xl overflow-hidden block-detail text-sm">
                        <span>Vendor Name</span>
                        <span id="VVENDOR_NAME"></span>
                        <span>Material Code</span>
                        <span id="VMATERIAL_CODE"></span>
                        <span>Part Name</span>
                        <span id="VPART_NAME"></span>
                        <span>Job Item</span>
                        <span id="VJOB_ITEM"></span>
                    </div>

                    {{-- PCS Committee --}}
                    <div class="block-container">
                        <div class="block-title">PCS Committee</div>
                        <div id="committee"></div>
                    </div>

                    {{-- Group --}}
                    <div class="block-container">
                        <div class="block-title">Group</div>
                        <div id="group"></div>
                    </div>
                </div>
            </section>

            {{-- Section 3: ราคา --}}
            <section class="rounded-xl border border-slate-200">
                <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <span class="badge badge-neutral badge-sm">3</span>
                    <h3 class="font-semibold text-slate-700">ข้อมูลราคา</h3>
                </header>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                    <div class="block-container bg-blue-50 flex items-center gap-3 font-bold">
                        <div class="block-icon bg-blue-100">
                            <i class="fi fi-rr-coins text-xl text-blue-500"></i>
                        </div>
                        <div class="flex flex-col">
                            <div class="block-title">Present Total Price</div>
                            <div class="flex items-end gap-2">
                                <span id="NTOTAL_PRES" class="text-3xl"></span>
                                <span class="text-lg text-gray-500">KB/YEAR</span>
                            </div>
                        </div>
                    </div>
                    <div class="block-container bg-emerald-50 flex items-center gap-3 font-bold">
                        <div class="block-icon bg-emerald-100">
                            <i class="fi fi-rr-coins text-xl text-emerald-500"></i>
                        </div>
                        <div class="flex flex-col">
                            <div class="block-title">New Total Price</div>
                            <div class="flex items-end gap-2">
                                <span id="NTOTAL_NEW" class="text-3xl"></span>
                                <span class="text-lg text-gray-500">KB/YEAR</span>
                            </div>
                        </div>
                    </div>
                    <div class="block-container flex items-center gap-3 font-bold">
                        <div class="block-icon bg-gray-100">
                            <i class="fi fi-br-stats text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <div class="block-title">Cost Down (-) / Cost Up (+) Amount</div>
                            <div class="flex items-end gap-2">
                                <span id="NTOTAL_COST" class="text-3xl"></span>
                                <span class="text-lg text-gray-500">KB/YEAR</span>
                            </div>
                        </div>
                    </div>
                    <div class="block-container flex items-center gap-3 font-bold">
                        <div class="block-icon bg-gray-100">
                            <i class="fi fi-br-stats text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <div class="block-title">Cost Down (-) / Cost Up (+) Ratio %</div>
                            <div class="flex items-end gap-2">
                                <span id="NTOTAL_RATIO" class="text-3xl"></span>
                                <span class="text-lg text-gray-500">%</span>
                            </div>
                        </div>
                    </div>
                    <div class="block-container flex items-center gap-3 font-bold">
                        <div class="block-icon bg-gray-100">
                            <i class="fi fi-br-calendar-day text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <div class="block-title">Effective Month</div>
                            <div class="flex items-end gap-2">
                                <span id="EFT_MONTH" class="text-2xl"></span>
                            </div>
                        </div>
                    </div>
                    <div class="block-container flex items-center gap-3 font-bold">
                        <div class="block-icon bg-blue-100">
                            <i class="fi fi-rr-document text-blue-500 text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <div class="block-title">Effective Type</div>
                            <div class="flex items-end gap-2">
                                <span id="VEFT_TYPE" class="badge badge-soft badge-info"></span>
                                <span id="VEFT_TYPE_OTHER" class="hidden"></span>
                            </div>
                        </div>
                    </div>

            </section>

            {{-- Section 4: เหตุผลการเปลี่ยนแปลง --}}
            <section class="rounded-xl border border-slate-200">
                <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <span class="badge badge-neutral badge-sm">4</span>
                    <h3 class="font-semibold text-slate-700">เหตุผลการเปลี่ยนแปลง (Reason Change - update)</h3>
                </header>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 p-4">

                    {{-- Cost Down --}}
                    <fieldset class="fieldset col-span-2">
                        <legend class="fieldset-legend font-semibold">Cost Down</legend>
                        <div class="grid grid-flow-col grid-cols-2 gap-2" id="reason-cost-down-container">
                        </div>
                    </fieldset>

                    {{-- Cost Up --}}
                    <fieldset class="fieldset lg:col-span-2">
                        <legend class="fieldset-legend font-semibold">Cost Up</legend>
                        <div class="grid grid-cols-1 gap-2" id="reason-cost-up-container">
                        </div>
                    </fieldset>

                    {{-- Basic condition revise --}}
                    <fieldset class="fieldset lg:col-span-2">
                        <legend class="fieldset-legend font-semibold">Basic condition revise</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                            id="reason-basic-condition-container">
                        </div>
                    </fieldset>

                    {{-- Estimate price --}}
                    <fieldset class="fieldset lg:col-span-2">
                        <legend class="fieldset-legend font-semibold">Estimate price</legend>
                        <div id="reason-estimate-price-container" class="grid grid-cols-1 gap-2">
                        </div>
                    </fieldset>

                    {{-- Detail contents --}}
                    <fieldset class="fieldset lg:col-span-2">
                        <legend class="fieldset-legend font-semibold">Detail contents</legend>
                        <textarea name="VDETAIL" id="VDETAIL" class="textarea w-full" rows="4" readonly>-</textarea>
                        <div id="drop-image"></div>
                    </fieldset>
                </div>
            </section>

            {{-- Section 5: ไฟล์แนบ --}}
            <section class="rounded-xl border border-slate-200">
                <header class="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <span class="badge badge-neutral badge-sm">5</span>
                    <h3 class="font-semibold text-slate-700">ไฟล์แนบ (Attach file)</h3>
                </header>
                <div class="flex flex-col gap-4 p-4">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Quotation price (E-Stamp)</legend>
                        <div id="drop-quotation"></div>
                    </fieldset>
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Additional document</legend>
                        <div id="drop-additional"></div>
                    </fieldset>
                </div>
            </section>

            {{-- Section 6: หมายเหตุ --}}
            <section class="rounded-xl border border-info/30 bg-info/5 p-4">
                <h3 class="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <i class="fi fi-rr-info text-info"></i>Remark
                </h3>
                <ul class="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>Localization : Describe price, L/T and necessary stock month (quantity) of before and after</li>
                    <li>Basic condition revise : Describe condition of before and after</li>
                    <li>*(Conditions approval of Production Bulk / Material / Sub-Con and None Production [refer to
                        BP-QP-B005])</li>
                </ul>
            </section>

        </form>
        <div id="btnRequest" class="p-5"></div>
    </div>

</div>