@extends('layouts/webflowTemplate')

@section('contents')

<input type="hidden" id="nfrmno" name="nfrmno" value="{{ $NFRMNO }}">
<input type="hidden" id="vorgno" name="vorgno" value="{{ $VORGNO }}">
<input type="hidden" id="cyear" name="cyear" value="{{ $CYEAR }}">

@php
    $linkClass = 'mr-8 cursor-pointer font-extrabold text-blue-600 hover:text-blue-800 hover:underline';
    $radioClass = 'cursor-pointer accent-indigo-700';
    $labelClass = 'cursor-pointer items-center gap-2 py-1.5 font-bold text-slate-700';
    $inputClass = 'rounded-lg border border-slate-400 px-3 py-2 font-bold outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200';
    $buttonClass = 'min-w-[130px] cursor-pointer rounded-full bg-indigo-700 px-8 py-2.5 font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
    $fileClass = 'block w-full cursor-pointer font-bold text-slate-700 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-indigo-700 file:px-5 file:py-2.5 file:font-extrabold file:text-white file:shadow-md hover:file:bg-indigo-800';
@endphp

<div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-violet-50 p-3">
    <div class="mx-auto max-w-[1600px] overflow-hidden rounded-2xl bg-white shadow-xl">

        <div class="bg-indigo-700 px-6 py-7 text-center text-white">
            <h1 class="text-3xl font-extrabold tracking-wide text-white">
                Operation Regulation (OR) Form
            </h1>
            <p class="mt-1 text-sm font-bold text-indigo-100">
                MANUFACTURING DIVISION
            </p>
        </div>

        <form id="formMfgOr" enctype="multipart/form-data" class="p-4">
            <div class="m-4 overflow-hidden rounded-2xl border-2 border-purple-500">
                <table class="w-full table-fixed text-[15px] font-bold">
                    <tbody>

                        <tr class="border-b border-indigo-200">
                            <th class="w-[320px] border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Download Document
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <a href="#" class="{{ $linkClass }}">คู่มือการใช้งาน OR</a>
                                <a href="<?= base_url('mfgform/MFG-OR/main_or/download_template/vertical') ?>" class="{{ $linkClass }}">Template OR File Master (แนวตั้ง)</a>
                                <a href="<?= base_url('mfgform/MFG-OR/main_or/download_template/horizontal') ?>" class="{{ $linkClass }}">Template OR File Master (แนวนอน)</a>
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Create By
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <input type="hidden" id="inputBy" name="inputBy" value="{{ $EMPNO }}">
                                <input type="hidden" id="sseccode" name="sseccode">
                                <input type="hidden" id="ssec" name="ssec">
                                <input type="hidden" id="sdepcode" name="sdepcode">
                                <span id="input_name" class="font-extrabold text-black"></span>
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Request by <span class="text-red-600">*</span>
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <input type="text" id="request_by" name="request_by" maxlength="5" placeholder="Ex.15199"
                                    class="w-[140px] {{ $inputClass }}">
                                <span id="request_by_name" class="ml-2 font-extrabold text-indigo-700"></span>
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Type form <span class="text-red-600">*</span>
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <label class="inline-flex {{ $labelClass }}">
                                    <input type="radio" name="type_form" value="NEW" class="{{ $radioClass }}">
                                    New
                                </label>
                                <br>

                                <label class="mr-6 inline-flex {{ $labelClass }}">
                                    <input type="radio" name="type_form" value="REVISE" class="{{ $radioClass }}">
                                    Revise : Current No.
                                </label>

                                <input type="text" id="current_no" name="current_no" placeholder="Ex.OR-MFG-26003"
                                    class="w-[280px] disabled:bg-slate-100 {{ $inputClass }}"
                                    disabled>
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Classification <span class="text-red-600">*</span>
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <label class="flex {{ $labelClass }}">
                                    <input type="radio" name="classification" value="BASIC" class="{{ $radioClass }}">
                                    Basic Knowledge (ความรู้พื้นฐาน)
                                </label>

                                <label class="flex {{ $labelClass }}">
                                    <input type="radio" name="classification" value="IMPROVE" class="{{ $radioClass }}">
                                    Improvement Case (กรณีปรับปรุงงาน)
                                </label>

                                <label class="flex {{ $labelClass }}">
                                    <input type="radio" name="classification" value="TROUBLE" class="{{ $radioClass }}">
                                    Trouble Case (กรณีเกิดปัญหาซ้ำ)
                                </label>

                                <label class="flex {{ $labelClass }}">
                                    <input type="radio" name="classification" value="REGULATION" class="{{ $radioClass }}">
                                    Regulation (กฎระเบียบ/ข้อบังคับ)
                                </label>
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Topic <span class="text-red-600">*</span>
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <input type="text" id="topic" name="topic"
                                    class="w-full {{ $inputClass }}">
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                DWG No
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <input type="text" id="dwg_no" name="dwg_no"
                                    class="w-[700px] max-w-full {{ $inputClass }}">
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Shop No
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <input type="text" id="shop_no" name="shop_no" placeholder="Ex.B1"
                                    class="w-[190px] {{ $inputClass }}">
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Item No <span class="text-red-600">*</span>
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <label class="mr-5 inline-flex {{ $labelClass }}">
                                    <input type="radio" name="item_type" value="ALL" class="{{ $radioClass }}">
                                    Over all Item
                                </label>

                                <input type="text" id="overall_item" name="overall_item" placeholder="Ex.PACKING"
                                    class="mr-5 w-[280px] disabled:bg-slate-100 {{ $inputClass }}"
                                    disabled>

                                <label class="mr-5 inline-flex {{ $labelClass }}">
                                    <input type="radio" name="item_type" value="OR" class="{{ $radioClass }}">
                                    OR Item
                                </label>

                                <input type="text" id="or_item" name="or_item" placeholder="Ex.203-20"
                                    class="w-[180px] disabled:bg-slate-100 {{ $inputClass }}"
                                    disabled>
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Apply For <span class="text-red-600">*</span>
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <select id="apply_for" name="apply_for"
                                    class="w-[280px] cursor-pointer {{ $inputClass }}">
                                    <option value="">--- Please select ---</option>
                                    <option value="NEW_MODEL">New Model</option>
                                    <option value="MASS">Mass Production</option>
                                    <option value="ALL">All Product</option>
                                </select>
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Attach OR File (Excel) <span class="text-red-600">*</span>
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <input type="file" id="or_excel" name="or_excel" accept=".xls,.xlsx"
                                    class="block w-full cursor-pointer text-sm font-bold text-slate-700
                                    file:mr-4 file:cursor-pointer file:rounded-xl file:border-0
                                    file:bg-indigo-700 file:px-5 file:py-2.5
                                    file:font-extrabold file:text-white file:shadow-md
                                    hover:file:bg-indigo-800">
                            </td>
                        </tr>

                        <tr class="border-b border-indigo-200">
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Attach OR File Master (PDF) <span class="text-red-600">*</span>
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <input type="file" id="or_pdf" name="or_pdf" accept=".pdf"
                                    class="{{ $fileClass }}">
                            </td>
                        </tr>

                        <tr>
                            <th class="border-r border-indigo-200 bg-indigo-50 px-4 py-3 text-left align-middle font-extrabold text-indigo-700">
                                Remark
                            </th>
                            <td class="px-4 py-3 align-middle">
                                <textarea id="remark" name="remark" rows="4" placeholder="Remark..."
                                    class="min-h-[90px] w-full resize-y {{ $inputClass }}"></textarea>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex justify-center gap-4 py-5">
                <button type="button" id="btnSendForm"
                    class="min-w-[130px] cursor-pointer rounded-full bg-indigo-700 px-8 py-2.5 font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
                    Send Form
                </button>
            </div>

        </form>
    </div>
</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/mfg_or_create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection