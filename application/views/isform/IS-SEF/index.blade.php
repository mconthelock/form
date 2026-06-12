@extends('layouts/webflowTemplate')
@section('contents')
    <div class="min-h-screen bg-base-200 py-6">
        <div class="mx-auto px-4 space-y-4">

            {{-- Header card --}}
            <div class="card bg-base-100 shadow-md overflow-hidden">
                <div class="bg-blue-900 px-6 py-5 text-center">
                    <h1 class="text-white text-xl font-bold mb-1">แบบประเมินความพึงพอใจในการพัฒนาโปรแกรม</h1>
                    <p class="text-primary-content/70 text-sm italic">Satisfaction Evaluation Form</p>
                </div>
                <div class="px-6 py-4 bg-primary/5 border-b border-primary/20">
                    <div class="flex items-center gap-3 flex-wrap">
                        <span class="font-semibold text-slate-700 text-sm whitespace-nowrap">
                            ชื่อโปรเจกต์ (Project):<label class="pl-2 text-xl underline" id="projectName">Satisfaction Evaluation Form</label>
                        </span>
                    </div>
                </div>
                <div class="px-6 py-3 bg-amber-50 border-b border-warning/30 yr">
                    <p class="text-xs text-amber-800">
                        <strong>เกณฑ์การให้คะแนน:</strong>&nbsp;
                        <span class="badge badge-success text-white">5 = มากที่สุด (Excellent)</span>&nbsp;
                        <span class="badge bg-lime-600 text-white border-0">4 = มาก (Good)</span>&nbsp;
                        <span class="badge badge-warning text-white">3 = ปานกลาง (Fair)</span>&nbsp;
                        <span class="badge bg-orange-500 text-white border-0">2 = น้อย (Poor)</span>&nbsp;
                        <span class="badge badge-error text-white">1 = น้อยที่สุด (Very Poor)</span>
                    </p>
                </div>
            </div>

            {{-- Programmer section --}}
            <div class="card bg-base-100 shadow-md overflow-hidden">
                <div class="bg-blue-900 px-5 py-3">
                    <h2 class="text-white font-bold text-base">1. Programmer — ทีมพัฒนา</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="table table-sm w-full text-sm">
                        <thead class="bg-base-200">
                            <tr>
                                <th class="text-center text-base-content/50 w-9">#</th>
                                <th class="text-left text-[#1e3a5f] w-72">หัวข้อการประเมิน</th>
                                <th class="text-left text-[#1e3a5f] w-72">Thai</th>
                                <th class="text-center text-success w-11 text-xs">5<br /><span class="font-normal text-[0.7rem]">มากที่สุด</span></th>
                                <th class="text-center text-lime-600 w-11 text-xs">4<br /><span class="font-normal text-[0.7rem]">มาก</span></th>
                                <th class="text-center text-warning w-11 text-xs">3<br /><span class="font-normal text-[0.7rem]">ปานกลาง</span></th>
                                <th class="text-center text-orange-500 w-11 text-xs">2<br /><span class="font-normal text-[0.7rem]">น้อย</span></th>
                                <th class="text-center text-error w-11 text-xs">1<br /><span class="font-normal text-[0.7rem]">น้อยที่สุด</span></th>
                                <th class="text-center text-[#1e3a5f] w-14">คะแนน</th>
                            </tr>
                        </thead>
                        <tbody id="progBody"></tbody>
                    </table>
                </div>
                <div class="px-5 py-2 bg-info/10 border-t-2 border-info/30 flex justify-between items-center">
                    <span class="font-bold text-[#1e3a5f] text-sm">คะแนนเฉลี่ยหมวด Programmer</span>
                    <span id="progAvg" class="badge badge-lg bg-[#1e3a5f] text-white font-bold min-w-14 justify-center">—</span>
                </div>
            </div>

            {{-- Application section --}}
            <div class="card bg-base-100 shadow-md overflow-hidden">
                <div class="bg-blue-900 px-5 py-3">
                    <h2 class="text-white font-bold text-base">2. Application — ระบบงาน</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="table table-sm w-full text-sm">
                        <thead class="bg-base-200">
                            <tr>
                                <th class="text-center text-base-content/50 w-9">#</th>
                                <th class="text-left text-[#1e3a5f] w-72">หัวข้อการประเมิน</th>
                                <th class="text-left text-[#1e3a5f] w-72">Thai</th>
                                <th class="text-center text-success w-11 text-xs">5<br /><span class="font-normal text-[0.7rem]">มากที่สุด</span></th>
                                <th class="text-center text-lime-600 w-11 text-xs">4<br /><span class="font-normal text-[0.7rem]">มาก</span></th>
                                <th class="text-center text-warning w-11 text-xs">3<br /><span class="font-normal text-[0.7rem]">ปานกลาง</span></th>
                                <th class="text-center text-orange-500 w-11 text-xs">2<br /><span class="font-normal text-[0.7rem]">น้อย</span></th>
                                <th class="text-center text-error w-11 text-xs">1<br /><span class="font-normal text-[0.7rem]">น้อยที่สุด</span></th>
                                <th class="text-center text-[#1e3a5f] w-14">คะแนน</th>
                            </tr>
                        </thead>
                        <tbody id="appBody"></tbody>
                    </table>
                </div>
                <div class="px-5 py-2 bg-info/10 border-t-2 border-info/30 flex justify-between items-center">
                    <span class="font-bold text-[#1e3a5f] text-sm">คะแนนเฉลี่ยหมวด Application</span>
                    <span id="appAvg" class="badge badge-lg bg-[#1e3a5f] text-white font-bold min-w-14 justify-center">—</span>
                </div>
            </div>

            {{-- Summary & submit --}}
            <div class="card bg-base-100 shadow-md overflow-hidden">
                <div class="card-body p-0">
                    <div class="flex items-center justify-between flex-wrap gap-3 p-5 border-b border-base-200">
                        <div>
                            <p class="text-xs text-base-content/50 mb-1">คะแนนเฉลี่ยรวมทั้งหมด (Overall Average)</p>
                            <div class="flex items-baseline gap-2">
                                <span id="overallAvg" class="text-4xl font-bold text-[#1e3a5f]">—</span>
                                <span class="text-base-content/50 text-sm">/ 5.00</span>
                            </div>
                        </div>
                        <div id="levelBadge" class="text-center px-6 py-3 rounded-xl bg-base-200 border border-base-300">
                            <p class="text-xs text-base-content/50 mb-1">ระดับความพึงพอใจ</p>
                            <p id="levelText" class="font-bold text-base text-base-content/50">—</p>
                        </div>
                    </div>
                    <div class="p-5">
                        <label class="label pb-1">
                            <span class="label-text font-semibold text-[#1e3a5f]">ข้อเสนอแนะ / ความคิดเห็นเพิ่มเติม (Comments &amp; Suggestions)</span>
                        </label>
                        <textarea id="comments" rows="3" class="textarea textarea-bordered w-full resize-y" placeholder="กรุณาระบุข้อเสนอแนะหรือความคิดเห็นเพิ่มเติม..."></textarea>
                    </div>
                    <div class="px-5 pb-5 flex gap-3 justify-end flex-wrap">
                        <button id="resetBtn" class="btn btn-ghost btn-sm">รีเซ็ตแบบฟอร์ม</button>
                        <button id="submitBtn" class="btn btn-primary btn-sm">บันทึกการประเมิน ✓</button>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <script src="{{ $_ENV['APP_JS'] }}/isSef.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
