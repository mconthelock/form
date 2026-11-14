@extends('layouts/webflowTemplate')

@section('contents')
    <main class="flex flex-col gap-4">
        @include('layouts/form-header')
        @include('layouts/form-header-info')

        <section class="border border-gray-300 ">
            <table class="table table-bordered tax-table w-full">
                <thead>
                    <tr class="bg-blue-900 text-white">
                        <th width="25%">รายการ</th>
                        <th width="35%">อัตราค่าลดหย่อน</th>
                        <th width="12%">ข้อมูลปัจจุบัน</th>
                        <th width="28%">รายละเอียด</th>
                    </tr>
                </thead>
                <tbody id="tax-form-tbody">
                    <tr>
                        <td colspan="4" class="text-center py-10 text-slate-400">
                            <span class="loading loading-spinner loading-md text-primary"></span>
                            <span class="ml-2 font-medium text-slate-600">กำลังโหลดรายการสิทธิลดหย่อน...</span>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="bg-gray-300">
                        <th colspan="2" class="text-center total font-bold">รวมรายการลดหย่อน</th>
                        <th class="text-end total font-mono font-bold" id="table-tax-total">0.00</th>
                        <td class="text-strat total font-mono font-bold text-blue-700" id="input-tax-total">0.00</td>
                    </tr>
                </tfoot>
            </table>
        </section>

        @include('layouts/form-action')
        @include('layouts/form-flow')
    </main>
@endsection


@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpLY01.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
