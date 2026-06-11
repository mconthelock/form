@extends('layouts/webflowTemplate')

@section('contents')
<style>
    .or-card { box-shadow: 0 20px 45px rgba(15, 23, 42, .12); }
    .or-label {
        background: linear-gradient(135deg, #ecfeff, #d1fae5);
        font-weight: 800;
        color: #0f766e;
        border-right: 1px solid #cbd5e1;
    }
    .or-input {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: .65rem;
        padding: .45rem .75rem;
        font-size: .875rem;
        outline: none;
        background: #fff;
    }
    .or-input:focus {
        border-color: #0d9488;
        box-shadow: 0 0 0 3px rgba(13,148,136,.15);
    }
    .required { color: #dc2626; font-weight: 900; }
    .or-link {
        color: #2563eb;
        font-weight: 700;
        margin-right: 1.5rem;
    }
    .or-link:hover { text-decoration: underline; }
    .or-radio, .or-check {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        margin-right: 1.25rem;
        margin-bottom: .35rem;
        color: #334155;
        font-weight: 600;
        font-size: .875rem;
    }
</style>

<input type="hidden" id="nfrmno" name="nfrmno" value="{{ $NFRMNO }}">
<input type="hidden" id="vorgno" name="vorgno" value="{{ $VORGNO }}">
<input type="hidden" id="cyear" name="cyear" value="{{ $CYEAR }}">

<script>
    console.log('NFRMNO =', '{{ $NFRMNO }}');
    console.log('VORGNO =', '{{ $VORGNO }}');
    console.log('CYEAR =', '{{ $CYEAR }}');
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-50 py-6">
    <div class="or-card w-full max-w-[1500px] mx-auto overflow-hidden rounded-2xl bg-white">

        <div class="bg-gradient-to-r from-emerald-900 via-teal-700 to-cyan-600 px-6 py-6">
            <h1 class="text-center text-3xl font-extrabold tracking-wide text-white">
                MFG OR Form
            </h1>
            <p class="mt-1 text-center text-sm font-bold text-cyan-100">
                Operation Regulation (OR) - Production Department
            </p>
        </div>

        <form id="formMfgOr" enctype="multipart/form-data" class="p-4">

            <div class="overflow-hidden rounded-2xl border border-slate-300 bg-white">

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Download Document
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <a href="#" class="or-link">คู่มือการใช้งาน OR</a>
                        <a href="<?= base_url('mfgform/MFG-OR/main_or/download_template/vertical') ?>"   class="or-link">Template OR File Master (แนวตั้ง)</a>
                        <a href="<?= base_url('mfgform/MFG-OR/main_or/download_template/horizontal') ?>" class="or-link">Template OR File Master (แนวนอน)</a>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Create By
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2 font-bold text-slate-800">
                        <input type="hidden" id="inputBy" name="inputBy" value="{{ $EMPNO }}">
                        <input type="hidden" id="sseccode" name="sseccode">
                        <input type="hidden" id="ssec" name="ssec">
                        <input type="hidden" id="sdepcode" name="sdepcode">
                        <span id="input_name" class="text-sm text-emerald-700"></span>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Request by <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-2">
                        <input type="text" id="request_by" name="request_by" maxlength="5" placeholder="Ex.15199" class="or-input max-w-[130px]">
                        <span id="request_by_name" class="ml-2 text-sm font-bold text-emerald-700"></span>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Type form <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <label class="or-radio">
                            <input type="radio" name="type_form" value="NEW">
                            New
                        </label><br>

                        <label class="or-radio">
                            <input type="radio" name="type_form" value="REVISE">
                            Revise : Current No.
                        </label>

                        <input type="text" id="current_no" name="current_no" placeholder="Ex.OR-MFG-MP-23003"
                            class="or-input inline-block max-w-[260px]" disabled>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Classification <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <label class="or-radio"><input type="radio" name="classification" value="BASIC"> Basic Knowledge (ความรู้พื้นฐาน)</label><br>
                        <label class="or-radio"><input type="radio" name="classification" value="IMPROVE"> Improvement Case (กรณีปรับปรุงงาน)</label><br>
                        <label class="or-radio"><input type="radio" name="classification" value="TROUBLE"> Trouble Case (กรณีเกิดปัญหาซ้ำ)</label><br>
                        <label class="or-radio"><input type="radio" name="classification" value="REGULATION"> Regulation (กฎระเบียบ/ข้อบังคับ)</label>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Topic <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <input type="text" id="topic" name="topic" class="or-input">
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        DWG No
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <input type="text" id="dwg_no" name="dwg_no" class="or-input max-w-[650px]">
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Shop No
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <input type="text" id="shop_no" name="shop_no" placeholder="Ex.B1" class="or-input max-w-[180px]">
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Item No <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <label class="or-radio">
                            <input type="radio" name="item_type" value="ALL">
                            Over all Item
                        </label>
                        <input type="text" id="overall_item" name="overall_item" placeholder="Ex.PACKING"
                            class="or-input inline-block max-w-[260px]" disabled>
                        <label class="or-radio ml-4">
                            <input type="radio" name="item_type" value="OR">
                            OR Item
                        </label>
                        <input type="text" id="or_item" name="or_item" placeholder="Ex.203-20"
                            class="or-input inline-block max-w-[160px]" disabled>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Apply For <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <select id="apply_for" name="apply_for" class="or-input max-w-[260px]">
                            <option value="">--- Please select ---</option>
                            <option value="NEW_MODEL">New Model</option>
                            <option value="MASS">Mass Production</option>
                            <option value="ALL">All Product</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Attach OR File (Excel) <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <input type="file" id="or_excel" name="or_excel" accept=".xls,.xlsx"
                            class="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-teal-700 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-teal-800">
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Attach OR File Master (PDF) <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <input type="file" id="or_pdf" name="or_pdf" accept=".pdf"
                            class="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-teal-700 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-teal-800">
                    </div>
                </div>

                <div class="grid grid-cols-12">
                    <div class="or-label col-span-12 md:col-span-2 px-4 py-2">
                        Remark
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <textarea id="remark" name="remark" rows="4" placeholder="Remark..." class="or-input resize-y"></textarea>
                    </div>
                </div>

            </div>

            <div class="mt-5 flex justify-center gap-4">
                <button type="reset" id="btnResetForm"
                    class="rounded-full border border-slate-300 bg-white px-8 py-2 font-extrabold text-slate-700 shadow hover:bg-slate-100">
                    Reset
                </button>

                <button type="button" id="btnSendForm"
                    class="rounded-full bg-gradient-to-r from-violet-700 to-indigo-500 px-8 py-2 font-extrabold text-white shadow-lg hover:scale-[1.02]">
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