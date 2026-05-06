@extends('layouts/webflowTemplate')
@section('contents')
    <div class="w-full mx-auto px-5 py-10 text-gray-800">
        {{-- ===== Header ===== --}}
        <div class="rounded-2xl overflow-hidden shadow-sm border border-base-300 mb-8">
            <div class="bg-sky-600 text-white p-6">
                <div class="flex items-center justify-between gap-4">
                    <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                        Regular Review<span class="mx-2 text-xs md:text-sm font-normal bg-white/15 px-2 py-1 rounded">({{ $program }})</span>[{{ $formNumber }}]
                    </h1>
                </div>
            </div>
            <div class="p-4 bg-base-100">
                <p class="text-sm text-base-content/70">โปรดยืนยันสิทธิ์การใช้งานของผู้ใช้งานในแต่ละเซิร์ฟเวอร์ว่าถูกต้องหรือไม่ หากไม่ถูกต้องโปรดระบุเหตุผลในช่อง Remark</p>
            </div>
        </div>

        {{-- ===== Hidden Context (structure kept) ===== --}}
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>

        {{-- ===== Table Card ===== --}}
        <div class="card bg-base-100 border border-base-300 shadow-xl">
            <div class="card-body p-4 md:p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="card-title text-lg md:text-xl">User Access Checklist</h2>
                    <div class="text-xs text-base-content/60">รวมทั้งหมด: <span class="font-semibold">{{ count($user) }}</span> รายการ</div>
                </div>

                <div class="overflow-x-auto rounded-xl border border-base-300">
                    <table class="table table-zebra table-sm" id="checktable">
                        <thead>
                            <tr class="bg-base-200 text-center">
                                <th class="whitespace-nowrap">Server Name</th>
                                <th class="whitespace-nowrap">Group</th>
                                <th class="whitespace-nowrap">User</th>
                                <th class="whitespace-nowrap">EMPNO</th>
                                <th class="whitespace-nowrap">EMPNAME</th>
                                <th class="whitespace-nowrap">Status</th>
                                <th class="whitespace-nowrap">Match</th>
                                <th class="whitespace-nowrap">Unmatch</th>
                                <th class="whitespace-nowrap">Remark</th>
                            </tr>
                        </thead>
                        <tbody>

                            @foreach ($user as $key => $item)
                                <tr class="text-center hover bg-base-100">
                                    <td class="align-middle">{{ $item->SERVER_NAME }}</td>
                                    <td class="align-middle">{{ $item->GROUP_NAME }}</td>
                                    <td class="align-middle font-medium">{{ $item->USER_LOGIN }}</td>
                                    <td class="align-middle">{{ $item->EMPNO }}</td>
                                    <td class="align-middle">{{ $item->SNAME }}</td>
                                    <td class="align-middle">
                                        <span class="badge {{ $item->USER_STATUS == '1' ? 'badge-success' : 'badge-neutral' }} badge-outline">
                                            {{ $item->USER_STATUS == '1' ? 'Enable' : 'Disable' }}
                                        </span>
                                    </td>
                                    <td class="align-middle">
                                        @if (is_null($item->RESULT))
                                            <label class="label cursor-pointer justify-center gap-2">
                                                <input type="radio" id="correct-{{ $item->EMPNO }}" checked name="result[{{ $item->EMPNO }}{{ $key }}]" class="radio radio-success result-radio" value="1" />
                                                <span class="text-xs">Yes</span>
                                            </label>
                                        @else
                                            {!! $item->RESULT == '1' ? '&#x2714;' : '' !!}
                                        @endif
                                    </td>
                                    <td class="align-middle">
                                        @if (is_null($item->RESULT))
                                            <label class="label cursor-pointer justify-center gap-2">
                                                <input type="radio" id="incorrect-{{ $item->EMPNO }}" name="result[{{ $item->EMPNO }}{{ $key }}]" class="radio radio-error result-radio" value="0" />
                                                <span class="text-xs">No</span>
                                            </label>
                                        @else
                                            {!! $item->RESULT == '0' ? '&#x2714;' : '' !!}
                                        @endif
                                    </td>
                                    <td class="align-middle w-[18rem] min-w-[14rem]">
                                        @if (is_null($item->RESULT))
                                            <input type="text" id="remark-{{ $item->EMPNO }}" class="input input-bordered w-full rounded-xl remark-input" name="remark[{{ $item->EMPNO }}]" placeholder="เหตุผล (ถ้าไม่ถูกต้อง)" />
                                        @else
                                            <div class="text-left">{{ $item->DETAIL }}</div>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                {{-- ===== Actions ===== --}}
                @if ($mode == '02')
                    <div class="flex justify-center mt-6 space-x-4">
                        @if ($form->STATUS == '1')
                            <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-submit" data-action="approve" id="btn-confirm">Approve</button>
                        @else
                            <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-approve" data-action="approve" id="btn-confirm">Approve</button>
                        @endif
                        {{-- <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-approve" data-action="reject">Reject</button> --}}
                    </div>
                @endif
            </div>
        </div>

        {{-- ===== Flow (structure kept) ===== --}}
        <div class="flow mt-8"></div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/RgvView.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
        // UX: แถวไฮไลต์เมื่อโฟกัสช่อง Remark
        document.addEventListener('focusin', (e) => {
            if (e.target && e.target.classList.contains('remark-input')) {
                e.target.closest('tr')?.classList.add('bg-base-200');
            }
        });
        document.addEventListener('focusout', (e) => {
            if (e.target && e.target.classList.contains('remark-input')) {
                e.target.closest('tr')?.classList.remove('bg-base-200');
            }
        });
    </script>
@endsection
