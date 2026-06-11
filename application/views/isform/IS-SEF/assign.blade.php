@extends('layouts/webflowTemplate')
@section('contents')
    <div class="min-h-screen bg-base-200 py-6">
        <div class="max-w-3xl mx-auto px-4 space-y-4">

            {{-- Header card --}}
            <div class="card bg-base-100 shadow-md overflow-hidden">
                <div class="bg-blue-900 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h1 class="text-white text-lg font-bold mb-0.5">Admin — Assign แบบประเมิน</h1>
                        <p class="text-blue-200 text-xs">Satisfaction Evaluation Form Management</p>
                    </div>
                    {{-- <div class="flex items-center gap-2">
                        <span class="inline-block w-2 h-2 rounded-full bg-success"></span>
                        <span class="text-blue-200 text-xs">Admin: สมชาย ก.</span>
                    </div> --}}
                </div>
            </div>

            {{-- Assign form card --}}
            <div class="card bg-base-100 shadow-md overflow-hidden">
                <div class="px-5 py-3 border-b border-base-200 bg-base-50">
                    <p class="font-bold text-[#1e3a5f] text-sm">Assign แบบประเมินใหม่</p>
                </div>
                <div class="px-6 py-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div class="form-control">
                            <label class="label pb-1">
                                <span class="label-text font-semibold text-slate-600">Project ID</span>
                            </label>
                            {{-- <input id="inProjId" type="text" placeholder="เช่น PRJ-2025-001"
                                class="input input-bordered input-sm w-full" /> --}}
                            <select name="projId" class="select select-sm w-full" id="inProjIdSelect">
                                <option value="" disabled selected>เลือกโปรเจกต์</option>
                            </select>
                        </div>
                        <div class="form-control">
                            <label class="label pb-1">
                                <span class="label-text font-semibold text-slate-600">User (ผู้รับแบบประเมิน)</span>
                            </label>
                            <input id="inUser" type="text" placeholder="ex. 24012" maxlength="5"
                                class="input input-bordered input-sm w-full" />
                            <span id="userName" class="text-sm text-slate-500"></span>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        {{-- <div class="form-control">
                            <label class="label pb-1">
                                <span class="label-text font-semibold text-slate-600">ชื่อโปรเจกต์ (Project Name)</span>
                            </label>
                            <input id="inProjName" readonly type="text" placeholder="เช่น ระบบ HR Online v2.0"
                                class="input input-bordered input-sm w-full" />
                        </div> --}}
                        {{-- <div class="form-control">
                            <label class="label pb-1">
                                <span class="label-text font-semibold text-slate-600">วันครบกำหนด (Due Date)</span>
                            </label>
                            <input id="inDue" type="date" class="input input-bordered input-sm w-full" />
                        </div> --}}
                    </div>
                    <div class="flex justify-end gap-2">
                        <button onclick="clearForm()" class="btn btn-sm btn-ghost border border-base-300">ล้างข้อมูล</button>
                        <button class="btn btn-sm btn-primary" id="submit_assign">+ Assign แบบประเมิน</button>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <script src="{{ $_ENV['APP_JS'] }}/isSefAssign.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
