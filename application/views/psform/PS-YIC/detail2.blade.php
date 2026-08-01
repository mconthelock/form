@extends('layouts/webflowTemplate')
@section('contents')
    <div class="w-full mx-auto bg-white shadow-xl ring-1 ring-gray-200 rounded-lg p-6" id="page-root" data-part="1">

        <div class="flex items-center justify-between mb-3">
            <h1 class="font-bold text-sm">The Result Of Yearly Inventory Checking FY <span class="period">2025 half #2nd</span></h1>
            {{-- <a href="{{ route('ps-yic.index', request()->query()) }}" class="btn btn-xs btn-outline">&laquo; Back to Summary</a> --}}
        </div>

        {{-- ============ VARIANCE DETAIL TABLE ============ --}}
        <div class="relative overflow-x-auto rounded-md shadow-sm">
            <table id="tbl-variance2" class="w-full table text-xs border-collapse border border-gray-400">
                <thead>
                    <tr class="bg-[#0066cc] text-white">
                        <th class="border border-gray-400 py-1.5 px-2 w-10">No.</th>
                        <th class="border border-gray-400 py-1.5 px-2">Tag no</th>
                        <th class="border border-gray-400 py-1.5 px-2">Item Code</th>
                        <th class="border border-gray-400 py-1.5 px-2 text-left">Description</th>
                        <th class="border border-gray-400 py-1.5 px-2 text-left">WH User</th>
                        <th class="border border-gray-400 py-1.5 px-2">Onhand Q'ty</th>
                        <th class="border border-gray-400 py-1.5 px-2">Actual Q'ty</th>
                        <th class="border border-gray-400 py-1.5 px-2">Diff Q'ty</th>
                        <th class="border border-gray-400 py-1.5 px-2">STD Cost</th>
                        <th class="border border-gray-400 py-1.5 px-2">Diff Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @for ($j = 0; $j < 15; $j++)
                        <tr class="{{ $j % 2 === 0 ? 'bg-white' : 'bg-gray-50' }} hover:bg-purple-50/60">
                            <td class="border border-gray-400 py-1 px-2 h-8">{{ $j + 1 }}</td>
                            @for ($i = 0; $i < 9; $i++)
                                <td class="border border-gray-400 py-1 px-2 h-8"></td>
                            @endfor
                        </tr>
                    @endfor
                </tbody>
            </table>

            {{-- Watermark shown when there is no variance --}}
            <div class="variance-empty hidden absolute inset-0 flex items-center justify-center pointer-events-none">
                <span class="text-6xl font-bold text-gray-800/70">Variance=0</span>
            </div>
        </div>

        <div class="flex justify-end mt-3 text-xs">
            <div class="flex gap-2 items-center bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
                <span class="font-medium">Total Amount</span>
                <span class="border-b border-black px-4 text-right total-amount font-semibold text-red-600">0.00</span>
            </div>
        </div>

    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psYicDetail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
