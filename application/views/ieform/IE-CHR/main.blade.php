@extends('layouts/webflowTemplate')
@section('contents')
    <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>

    <div class="mx-auto flex w-full max-w-full flex-col gap-6 text-slate-800">
        <section class="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
            <div class="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div class="text-center lg:text-left">
                    <h1 class="text-xl font-black text-primary sm:text-2xl">
                        Monthly Report on Crimp Height Measurement of Connectors
                    </h1>
                    <p class="mt-1 text-sm text-slate-500">
                        สรุปข้อมูลเอกสารประจำเดือนสำหรับการตรวจวัด Crimp Height ของ Connector
                    </p>
                </div>
                <div class="flex justify-center lg:justify-end">
                    <span class="badge badge-outline border-primary/30 bg-primary/5 px-4 py-3 text-primary">{{ $form->SHOP }}</span>
                </div>
            </div>
            <div class="grid gap-4 px-6 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
                <div class="rounded-3xl border border-sky-100 bg-sky-50 px-5 py-4">
                    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Year</p>
                    <p class="mt-2 text-2xl font-black text-slate-900">{{ $form->YEAR }}</p>
                </div>
                <div class="rounded-3xl border border-indigo-100 bg-indigo-50 px-5 py-4">
                    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Month</p>
                    <p class="mt-2 text-2xl font-black text-slate-900">{{ $form->MONTH_NAME }}</p>
                </div>
                <div class="rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-4 sm:col-span-2 lg:col-span-1">
                    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Shop</p>
                    <p class="mt-2 text-2xl font-black text-slate-900">{{ $form->SHOP }}</p>
                </div>
            </div>
        </section>

        {{-- <pre>
            {{ print_r($record) }}
        </pre> --}}

        <section class="rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
            <div class="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 class="text-xl font-black text-primary sm:text-2xl">
                        ตารางตรวจสอบมาตรฐาน Crimping Condition สำหรับ Skill "CA"
                    </h2>
                    <p class="mt-1 text-sm text-slate-500">
                        แสดงข้อมูลการตรวจวัดจริงรายชิ้น พร้อมรูปตัวอย่าง 3 ภาพและสถานะการผ่านเกณฑ์ของแต่ละค่า
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-sm">
                    <span class="badge badge-outline border-primary/30 bg-primary/5 px-4 py-3 text-primary">{{ $form->SHOP }}</span>
                    {{-- <span class="badge badge-outline border-slate-300 px-4 py-3 text-slate-600">{{ $form->MONTH }} {{ $form->YEAR }}</span> --}}
                </div>
            </div>

            <div class="overflow-x-auto px-3 py-4 sm:px-5">
                <table class="table border-separate border-spacing-0 text-center align-middle">
                    <thead>
                        <tr>
                            <th rowspan="2" colspan="9" class="rounded-tl-3xl border border-slate-200 bg-sky-50 px-4 text-lg font-black text-primary">
                                ตารางตรวจสอบมาตรฐาน Crimping Condition สำหรับ Skill "CA"
                            </th>
                            <th rowspan="3" class="border border-slate-200 bg-sky-100 px-3 py-2 font-bold text-primary">CrimpHeight<br> STD</th>
                            <th rowspan="3" class="border border-slate-200 bg-sky-100 px-3 py-2 font-bold text-primary">Accuracy <br> &plusmn;</th>
                            <th class="border border-rose-200 bg-rose-500 px-3 py-2"></th>
                            <th colspan="2" class="border border-slate-200 bg-rose-50 px-3 py-2 font-bold text-rose-700">= ค่าไม่ผ่าน</th>
                            <th rowspan="2" colspan="3" class="rounded-tr-3xl border border-slate-200 bg-indigo-50 px-3 py-2 font-bold text-indigo-700">รูปตัวอย่างชิ้นงาน (3 ชิ้น)</th>
                        </tr>
                        <tr>
                            <th colspan="3" class="border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-700">ค่า CrimpHeight ที่วัดได้</th>
                        </tr>
                        <tr>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">วันที่</th>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">Machine</th>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">JUN</th>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">ผู้ตรวจสอบ</th>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">Applicator</th>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">Connector</th>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">DWG</th>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">สายไฟ</th>
                            <th class="border border-slate-200 bg-sky-50 px-3 py-2 font-bold text-primary">Crimping<br> Condition</th>
                            <th class="border border-rose-200 bg-rose-50 px-3 py-2 font-bold text-rose-700">ครั้งที่ 1</th>
                            <th class="border border-rose-200 bg-rose-50 px-3 py-2 font-bold text-rose-700">ครั้งที่ 2</th>
                            <th class="border border-rose-200 bg-rose-50 px-3 py-2 font-bold text-rose-700">ครั้งที่ 3</th>
                            <th class="border border-indigo-200 bg-indigo-50 px-3 py-2 font-bold text-indigo-700">รูปที่ 1</th>
                            <th class="border border-indigo-200 bg-indigo-50 px-3 py-2 font-bold text-indigo-700">รูปที่ 2</th>
                            <th class="border border-indigo-200 bg-indigo-50 px-3 py-2 font-bold text-indigo-700">รูปที่ 3</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($record as $row)
                            <tr class="transition hover:bg-slate-50/80">
                                <td class="border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">{{ $row->CREATED_AT }}</td>
                                <td class="border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">{{ $row->MACHINE_NO }}</td>
                                <td class="border border-slate-200 bg-white px-3 py-2 text-slate-700">{{ $row->JUN_NO }}</td>
                                <td class="border border-slate-200 bg-white px-3 py-2 text-slate-700">{{ $row->INSPECTOR }}</td>
                                <td class="border border-slate-200 bg-white px-3 py-2 text-slate-700">{{ $row->APPLICATOR_NO }}</td>
                                <td class="border border-slate-200 bg-white px-3 py-2 text-slate-700">{{ $row->CONNECTOR }}</td>
                                <td class="border border-slate-200 bg-white px-3 py-2 text-slate-700">{{ $row->PARTNO }}</td>
                                <td class="border border-slate-200 bg-white px-3 py-2 text-slate-700">{{ number_format($row->WIRESIZE, 2) }}</td>
                                <td class="border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">{{ $row->CRIMPING_CONDITION }}</td>
                                <td class="border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900">{{ number_format($row->CRIMPHEIGHT_STD, 2) }}</td>
                                <td class="border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900">{{ number_format($row->ACCURACY, 2) }}</td>
                                <td class="border border-slate-200 bg-emerald-50 px-2 py-2 text-emerald-700">
                                    <div class="flex flex-col items-center gap-2">
                                        <span class="font-black">{{ number_format($row->MEASURE1, 3) }}</span>
                                        {{-- <span class="badge badge-sm badge-success badge-soft">Pass</span> --}}
                                    </div>
                                </td>
                                <td class="border border-slate-200 bg-emerald-50 px-2 py-2 text-emerald-700">
                                    <div class="flex flex-col items-center gap-2">
                                        <span class="font-black">{{ number_format($row->MEASURE2, 3) }}</span>
                                        {{-- <span class="badge badge-sm badge-success badge-soft">Pass</span> --}}
                                    </div>
                                </td>
                                <td class="border border-slate-200 bg-emerald-50 px-2 py-2 text-emerald-700">
                                    <div class="flex flex-col items-center gap-2">
                                        <span class="font-black">{{ number_format($row->MEASURE3, 3) }}</span>
                                        {{-- <span class="badge badge-sm badge-success badge-soft">Pass</span> --}}
                                    </div>
                                </td>
                                <td class="border border-slate-200 bg-white px-2 py-2">
                                    <div class="mx-auto flex w-20 flex-col gap-2">
                                        <div class="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                                            <img
                                                src="https://amecweb.mitsubishielevatorasia.co.th/mfgmonitor/uploads/photos/{{ $row->IMAGE1 }}"
                                                alt="รูปตัวอย่างชิ้นงาน 1"
                                                class="js-image-preview h-full w-full cursor-pointer object-cover transition duration-200 hover:scale-105"
                                                data-preview-label="{{ $row->MACHINE_NO }} | รูปที่ 1">
                                            {{-- <div class="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#1e293b)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Sample 1</div> --}}
                                        </div>
                                        <span class="text-xs text-slate-500">รูปที่ 1</span>
                                    </div>
                                </td>
                                <td class="border border-slate-200 bg-white px-2 py-2">
                                    <div class="mx-auto flex w-20 flex-col gap-2">
                                        <div class="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                                            <img
                                                src="https://amecweb.mitsubishielevatorasia.co.th/mfgmonitor/uploads/photos/{{ $row->IMAGE2 }}"
                                                alt="รูปตัวอย่างชิ้นงาน 2"
                                                class="js-image-preview h-full w-full cursor-pointer object-cover transition duration-200 hover:scale-105"
                                                data-preview-label="{{ $row->MACHINE_NO }} | รูปที่ 2">
                                            {{-- <div class="flex h-full items-center justify-center bg-[linear-gradient(135deg,#111827,#1f2937)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Sample 2</div> --}}
                                        </div>
                                        <span class="text-xs text-slate-500">รูปที่ 2</span>
                                    </div>
                                </td>
                                <td class="border border-slate-200 bg-white px-2 py-2">
                                    <div class="mx-auto flex w-20 flex-col gap-2">
                                        <div class="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                                            <img
                                                src="https://amecweb.mitsubishielevatorasia.co.th/mfgmonitor/uploads/photos/{{ $row->IMAGE3 }}"
                                                alt="รูปตัวอย่างชิ้นงาน 3"
                                                class="js-image-preview h-full w-full cursor-pointer object-cover transition duration-200 hover:scale-105"
                                                data-preview-label="{{ $row->MACHINE_NO }} | รูปที่ 3">
                                            {{-- <div class="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#334155)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Sample 3</div> --}}
                                        </div>
                                        <span class="text-xs text-slate-500">รูปที่ 3</span>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                        {{-- <tr class="transition hover:-translate-y-0.5 hover:bg-slate-50/80">
                            <td class="border border-slate-200 bg-white px-3 py-4 text-sm font-medium text-slate-700">22-OCT-25</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 font-semibold text-slate-700">AC35</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">202510C</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">13258</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">L25160</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">Molex</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">X39HM-01</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">0.08</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 font-semibold text-slate-700">C2</td>
                            <td class="border border-slate-200 bg-slate-50 px-3 py-4 font-bold text-slate-900">1.30</td>
                            <td class="border border-slate-200 bg-slate-50 px-3 py-4 font-bold text-slate-900">0.05</td>
                            <td class="border border-slate-200 bg-emerald-50 px-2 py-3 text-emerald-700">
                                <div class="flex min-w-24 flex-col items-center gap-2">
                                    <span class="font-black">1.288</span>
                                    <span class="badge badge-sm badge-success badge-soft">Pass</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-emerald-50 px-2 py-3 text-emerald-700">
                                <div class="flex min-w-24 flex-col items-center gap-2">
                                    <span class="font-black">1.280</span>
                                    <span class="badge badge-sm badge-success badge-soft">Pass</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-emerald-50 px-2 py-3 text-emerald-700">
                                <div class="flex min-w-24 flex-col items-center gap-2">
                                    <span class="font-black">1.298</span>
                                    <span class="badge badge-sm badge-success badge-soft">Pass</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-white px-2 py-3">
                                <div class="mx-auto flex w-28 flex-col gap-2">
                                    <div class="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                                        <div class="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#1e293b)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Sample 1</div>
                                    </div>
                                    <span class="text-xs text-slate-500">รูปที่ 1</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-white px-2 py-3">
                                <div class="mx-auto flex w-28 flex-col gap-2">
                                    <div class="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                                        <div class="flex h-full items-center justify-center bg-[linear-gradient(135deg,#111827,#1f2937)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Sample 2</div>
                                    </div>
                                    <span class="text-xs text-slate-500">รูปที่ 2</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-white px-2 py-3">
                                <div class="mx-auto flex w-28 flex-col gap-2">
                                    <div class="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                                        <div class="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#334155)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Sample 3</div>
                                    </div>
                                    <span class="text-xs text-slate-500">รูปที่ 3</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-sm font-medium text-slate-700">23-OCT-25</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 font-semibold text-slate-700">AC36</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">202510D</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">12640</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">L25161</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">JST</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">X39HM-02</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 text-slate-700">0.13</td>
                            <td class="border border-slate-200 bg-white px-3 py-4 font-semibold text-slate-700">C1</td>
                            <td class="border border-slate-200 bg-slate-50 px-3 py-4 font-bold text-slate-900">1.45</td>
                            <td class="border border-slate-200 bg-slate-50 px-3 py-4 font-bold text-slate-900">0.05</td>
                            <td class="border border-slate-200 bg-rose-50 px-2 py-3 text-rose-700">
                                <div class="flex min-w-24 flex-col items-center gap-2">
                                    <span class="font-black">1.520</span>
                                    <span class="badge badge-sm badge-error badge-soft">Fail</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-emerald-50 px-2 py-3 text-emerald-700">
                                <div class="flex min-w-24 flex-col items-center gap-2">
                                    <span class="font-black">1.461</span>
                                    <span class="badge badge-sm badge-success badge-soft">Pass</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-emerald-50 px-2 py-3 text-emerald-700">
                                <div class="flex min-w-24 flex-col items-center gap-2">
                                    <span class="font-black">1.447</span>
                                    <span class="badge badge-sm badge-success badge-soft">Pass</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-white px-2 py-3">
                                <div class="mx-auto flex w-28 flex-col gap-2">
                                    <div class="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#020617,#1e293b)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300 shadow-sm">Sample 1</div>
                                    <span class="text-xs text-slate-500">รูปที่ 1</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-white px-2 py-3">
                                <div class="mx-auto flex w-28 flex-col gap-2">
                                    <div class="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#111827,#334155)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300 shadow-sm">Sample 2</div>
                                    <span class="text-xs text-slate-500">รูปที่ 2</span>
                                </div>
                            </td>
                            <td class="border border-slate-200 bg-white px-2 py-3">
                                <div class="mx-auto flex w-28 flex-col gap-2">
                                    <div class="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#475569)] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300 shadow-sm">Sample 3</div>
                                    <span class="text-xs text-slate-500">รูปที่ 3</span>
                                </div>
                            </td>
                        </tr> --}}
                    </tbody>
                </table>
            </div>
        </section>

        <div id="image-preview-modal" class="fixed inset-0 hidden items-center justify-center bg-slate-950/85 px-4 py-6">
            <div class="absolute inset-0 js-image-preview-close"></div>
            <div class="relative z-10 flex max-h-full w-full max-w-5xl flex-col gap-3">
                <div class="flex items-center justify-between gap-4 text-white">
                    <p id="image-preview-label" class="text-sm font-semibold text-slate-200"></p>
                    <button
                        type="button"
                        class="js-image-preview-close inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20"
                        aria-label="Close image preview">
                        &times;
                    </button>
                </div>
                <div class="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
                    <img
                        id="image-preview-target"
                        src=""
                        alt="ภาพตัวอย่างขนาดใหญ่"
                        class="max-h-[80vh] w-full bg-slate-950 object-contain">
                </div>
            </div>
        </div>
    </div>

    @if ($mode == '2')
        <section class="flex justify-center gap-4 py-6">
            <button type="button" class="btn btn-success btn-approve" action="approve">
                <span>Approve</span>
            </button>
            <button type="button" class="btn btn-error btn-approve" action="reject">
                <span>Reject</span>
            </button>
        </section>
    @endif

    <div class="flow mt-5"></div>
@endsection
@section('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const loadingBox = document.getElementById('loading-box');

            if (loadingBox) {
                loadingBox.checked = false;
            }
        });
    </script>
    <script src="{{ $_ENV['APP_JS'] }}/iechr.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
