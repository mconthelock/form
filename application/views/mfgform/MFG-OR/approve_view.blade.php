@extends('layouts/webflowTemplate')

@section('contents')

<input type="hidden" id="nfrmno" value="{{ $NFRMNO }}">
<input type="hidden" id="vorgno" value="{{ $VORGNO }}">
<input type="hidden" id="cyear" value="{{ $CYEAR }}">
<input type="hidden" id="cyear2" value="{{ $CYEAR2 }}">
<input type="hidden" id="nrunno" value="{{ $NRUNNO }}">
<input type="hidden" id="empno" value="{{ $EMPNO ?? '' }}">
<input type="hidden" id="mode" value="{{ $mode ?? '' }}">
<input type="hidden" id="txt_exdata" value="{{ $exdata ?? '' }}">
<input type="hidden" id="base_url" value="{{ base_url() }}">
<input type="hidden" id="formno" value="{{ $formno ?? '' }}">

<div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-violet-50 p-[18px]">
    <div class="mx-auto max-w-[1600px] overflow-hidden rounded-[18px] bg-white shadow-[0_18px_45px_rgba(15,23,42,.12)]">

        <div class="bg-indigo-700 px-5 py-5 text-center text-white">
            <h1 class="m-0 text-center text-[28px] font-black tracking-wide text-white">
                Operation Regulation (OR) Form
            </h1>
            <p class="mt-[3px] text-center text-[13px] font-extrabold text-indigo-100">
                MANUFACTURING DIVISION
            </p>
        </div>

        <div class="m-4 overflow-hidden rounded-2xl border-2 border-purple-500">
            <table class="w-full table-fixed text-[15px] font-bold">
                <tbody>
                    <tr class="border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Form No
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_form_no" data-formno="{{ $formno }}" class="min-h-[28px] font-extrabold text-slate-950">
                                {{ trim($formno) }}
                            </div>
                        </td>
                    </tr>

                    <tr class="border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Create By
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_create_by" class="min-h-[28px] whitespace-pre-wrap font-extrabold text-slate-950">Loading...</div>
                        </td>
                    </tr>

                    <tr class="border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Request By
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_request_by" class="min-h-[28px] whitespace-pre-wrap font-extrabold text-slate-950">Loading...</div>
                        </td>
                    </tr>

                    <tr class="border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Type form
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_type_form" class="min-h-[28px] whitespace-pre-wrap font-extrabold text-slate-950">-</div>
                        </td>
                    </tr>

                    <tr id="row_current_no" class="hidden border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Current No
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_current_no" class="min-h-[28px] whitespace-pre-wrap font-extrabold text-slate-950">-</div>
                        </td>
                    </tr>

                    <tr id="row_rev" class="hidden border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Rev
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_rev" class="min-h-[28px] whitespace-pre-wrap font-extrabold text-slate-950">-</div>
                        </td>
                    </tr>

                    <tr class="border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Classification
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_class" class="min-h-[28px] whitespace-pre-wrap font-extrabold text-slate-950">-</div>
                        </td>
                    </tr>

                    <tr class="border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Topic
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_topic" class="min-h-[28px] whitespace-pre-wrap font-extrabold text-slate-950">-</div>
                        </td>
                    </tr>

                    <tr class="border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Attach File (Excel)
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_file_excel" class="[&_a]:mb-1.5 [&_a]:block [&_a]:w-fit [&_a]:cursor-pointer [&_a]:rounded-lg [&_a]:bg-indigo-50 [&_a]:px-3 [&_a]:py-1 [&_a]:font-black [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:bg-blue-100 hover:[&_a]:text-blue-800">
                                Loading...
                            </div>
                        </td>
                    </tr>

                    <tr class="border-b border-[#b7c8dc]">
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Attach File (PDF)
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <div id="v_file_pdf" class="[&_a]:mb-1.5 [&_a]:block [&_a]:w-fit [&_a]:cursor-pointer [&_a]:rounded-lg [&_a]:bg-indigo-50 [&_a]:px-3 [&_a]:py-1 [&_a]:font-black [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:bg-blue-100 hover:[&_a]:text-blue-800">
                                Loading...
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <th class="w-[320px] border-r border-[#b7c8dc] bg-indigo-50 px-4 py-3 text-left align-middle font-black leading-[1.4] text-indigo-700">
                            Remark
                        </th>
                        <td class="px-4 py-3 align-middle font-bold leading-[1.45] text-slate-950">
                            <textarea id="remark" placeholder="Remark..."
                                class="min-h-[90px] w-full resize-y rounded-lg border border-[#b7c8dc] bg-white p-2.5 text-sm font-bold text-slate-950 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200"></textarea>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="btn-zone flex justify-center gap-10 px-4 pb-3 pt-[18px]">
            <button type="button" data-action="approve"
                class="btn-submit min-w-[120px] cursor-pointer rounded-full border-0 bg-emerald-600 px-[30px] py-[11px] text-[15px] font-black text-white shadow-[0_6px_14px_rgba(15,23,42,.16)] transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_10px_20px_rgba(15,23,42,.2)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0">
                Approve
            </button>

            <button type="button" data-action="reject"
                class="btn-submit min-w-[120px] cursor-pointer rounded-full border-0 bg-red-600 px-[30px] py-[11px] text-[15px] font-black text-white shadow-[0_6px_14px_rgba(15,23,42,.16)] transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_10px_20px_rgba(15,23,42,.2)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0">
                Reject
            </button>
        </div>

        <div class="flex justify-center px-4 pb-[26px] pt-2">
            <div class="flow max-w-full overflow-x-auto"></div>
        </div>

    </div>
</div>

@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/mfg_or_approve.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection