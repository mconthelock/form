@extends('layouts/webflowTemplate')
@section('contents')

    <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>
    <div class="container mx-auto p-4">
        <div class="flex flex-col md:flex-row items-center justify-between mb-6">
            <h1 class="text-3xl font-bold text-gray-800">User Group in FIN and CAT Department</h1>
            <div class="flex space-x-2">
                <!-- <button class="btn btn-sm btn-outline btn-primary">+ เพิ่มเมนูหลัก</button>
                        <button class="btn btn-sm btn-outline btn-secondary">จัดการเมนู</button> -->
            </div>
        </div>

        <!-- <div class="mb-4">
                    <span>Empno</span>
                    <input type="text" class="input input-bordered w-full max-w-xs" id="empno">
                </div> -->

        <div class="overflow-x-auto bg-white shadow-md rounded-lg p-4">
            <table id="menuTable" class="table table-sm w-full border rounded-lg">
                <thead>
                    <tr>
                        <th class="w-1/3">โครงสร้างเมนู</th>
                        <th class="text-center">AUTHORIZE</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($rows as $r)
                        @php
                            $lvl      = isset($r->MENU_LEVEL) ? (int) $r->MENU_LEVEL : 1;
                            $indentPx = max(0, ($lvl - 1) * 24);
                            $checked  = !empty($r->EMPNO) ? '✔' : '';
                          @endphp
                        {{-- เพิ่ม hover effect ด้วย utility class ของ Tailwind โดยตรง --}}
                        <tr class="hover:bg-gray-100! hover:cursor-pointer {{ $lvl === 1 ? 'bg-blue-100!' : '' }}">
                            <td>
                                <span class="{{ $lvl === 1 ? 'font-bold' : '' }}" style="margin-left: {{ $indentPx }}px">
                                    {{ htmlspecialchars($r->MENU_TREE) }}
                                </span>
                            </td>
                            <td class="text-center text-xl">
                                @if(!empty($r->EMPNO))
                                    {{ $checked }}
                                @else
                                    <!-- <input type="checkbox" class="create_author checkbox border-black bg-white" data-menu-id="{{ htmlspecialchars($r->MENU_ID) }}"> -->
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <div class="divider mt-5"></div>
            <form class="mt-6 space-y-4" id="matchForm">
                <div class="flex flex-col md:flex-row md:items-center gap-4">
                    <label class="font-semibold text-gray-700">Match Status:</label>
                    <div class="flex gap-4">
                        @if($form->STATUS == '1')
                            <label class="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg border hover:border-primary transition">
                                <input type="radio" name="match_status" value="match" class="radio radio-primary" required>
                                <span class="font-medium text-green-600 flex items-center gap-1">
                                    <i class="fa-solid fa-circle-check"></i> Match
                                </span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg border hover:border-error transition">
                                <input type="radio" name="match_status" value="unmatch" class="radio radio-error" required>
                                <span class="font-medium text-red-600 flex items-center gap-1">
                                    <i class="fa-solid fa-circle-xmark"></i> Unmatch
                                </span>
                            </label>
                            <div>
                                <label for="comment" class="block font-semibold text-gray-700 mb-1">Comment:</label>
                                <textarea id="comment" name="comment" class="textarea textarea-bordered w-full" rows="3" placeholder="Enter your comment"></textarea>
                            </div>
                        @else
                            <div class="flex justify-center w-full">
                                @if($empform[0]['RESULT'] == '1')
                                    <div class="px-4 py-2 rounded-lg bg-green-100 border border-green-300 text-green-700 font-bold flex items-center gap-2">
                                        <i class="fa-solid fa-circle-check"></i> Match
                                    </div>
                                @elseif($empform[0]['RESULT'] == '0')
                                    <div class="px-4 py-2 rounded-lg bg-red-100 border border-red-300 text-red-700 font-bold flex items-center gap-2">
                                        <i class="fa-solid fa-circle-xmark"></i> Unmatch
                                    </div>
                                @else
                                    <div class="px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-500 font-semibold">
                                        -
                                    </div>
                                @endif
                            </div>
                        @endif
                    </div>
                </div>

                @if($mode == '2')
                    <div class="flex justify-center gap-4 mb-5">
                        @if($form->STATUS == '1')
                            <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-submit" data-action="approve" id="btn-confirm">
                                Approve
                            </button>
                        @else
                            <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-approve" data-action="approve" id="btn-confirm">
                                Approve
                            </button>
                        @endif
                        {{-- <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-approve" data-action="reject">Reject</button> --}}
                    </div>
                @endif
            </form>
            <div class="flow">

            </div>
        </div>
    </div>



@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/RgvView.js?ver={{ $GLOBALS['version'] }}"></script> 
@endsection