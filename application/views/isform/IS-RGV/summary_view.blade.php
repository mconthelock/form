@extends('layouts/webflowTemplate')

@section('contents')

<section class="py-12 px-6 bg-gray-50 min-h-screen flex flex-col items-center">
    <div class="mb-10 text-center">
        <h2 class="text-4xl font-light text-gray-700 mb-2">User ID & Authorization Review Input</h2>
        <p class="text-sm text-gray-500">กรุณากรอก **จำนวนการดำเนินการ (Delete/Change)** และ **รายละเอียด (User IDs/Reasons)**</p>
    </div>

    {{-- เปิดฟอร์มที่นี่ --}}
    <form id="reviewForm" action="/path/to/your/submit/url" method="POST" class="w-full max-w-[1700px]">

        <div class="w-full shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="table w-full text-sm">
                    <thead class="bg-gray-100 text-gray-600 sticky top-0 z-10">
                        <tr>
                            <th rowspan="2" class="w-[50px] text-center font-bold border-b-2 border-gray-300">No.</th>
                            <th rowspan="2" class="min-w-[250px] text-left font-bold border-b-2 border-gray-300">System (ชื่อระบบหลัก)</th>
                            <th rowspan="2" class="w-[120px] text-center font-bold border-b-2 border-gray-300">Total Users</th>
                            <th rowspan="2" class="w-[120px] text-center font-bold border-b-2 border-gray-300">Unmatched</th>
                            <th colspan="3" class="text-center font-bold bg-primary/10 text-primary border-b-2 border-gray-300">
                                <i class="fas fa-keyboard mr-2"></i> ACTION & DETAIL INPUT
                            </th>
                        </tr>
                        <tr class="bg-primary/5 text-gray-600">
                            <th class="w-[200px] text-center font-semibold border-b-2 border-gray-300">Program Name</th>
                            <th class="w-[200px] text-center font-semibold border-b-2 border-gray-300">Delete / Change <span class="text-xs text-gray-400">(Count)</span></th>
                            <th class="min-w-[400px] text-center font-semibold border-b-2 border-gray-300">Detail (User IDs / Reasons)</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($systems as $system)
                            {{-- คำนวณ rowspan แบบไดนามิกจากจำนวนโปรแกรมในระบบนั้นๆ --}}
                            @php($rowspan = count($system['programs']))

                            @foreach ($system['programs'] as $program)
                                {{-- ใช้ $loop->parent->first, $loop->parent->last เพื่อสไตล์แถวแรกและแถวสุดท้ายของแต่ละกลุ่ม --}}
                                <tr class="program-row group hover:bg-gray-50 transition-colors duration-200
                                    @if($loop->parent->first && $loop->first)
                                        {{-- ไม่ต้องมี border top สำหรับรายการแรกสุด --}}
                                    @elseif($loop->first)
                                        border-t-8 border-gray-100
                                    @endif">

                                    {{-- แสดงคอลัมน์หลักแค่ครั้งเดียวสำหรับแต่ละกลุ่ม โดยใช้ $loop->first --}}
                                    @if ($loop->first)
                                        <td rowspan="
                                            {{ $rowspan }}" class="align-top text-center font-extrabold text-2xl pt-4 border-r">
                                            {{ $loop->parent->iteration }}</td>
                                        <td rowspan="
                                            {{ $rowspan }}" class="align-top text-base pt-4 border-r">
                                            Check consistency of user IDs and authorizations of user IDs accessible to <span class="text-warning font-semibold">{{ $system['main_system_name'] }}</span>
                                        </td>
                                        <td rowspan="
                                            {{ $rowspan }}" class="align-top text-center pt-4 border-r">
                                            <span class="badge badge-lg badge-success font-bold text-base">{{ $system['total_users'] }}</span>
                                        </td>
                                        <td rowspan="
                                            {{ $rowspan }}" class="align-top text-center pt-4 border-r">
                                            <span class="badge badge-lg {{ $system['unmatched'] > 0 ? 'badge-error' : 'badge-ghost' }} font-bold text-base">{{ $system['unmatched'] }}</span>
                                        </td>
                                    @endif

                                    {{-- คอลัมน์สำหรับกรอกข้อมูล จะมีทุกแถวของโปรแกรม --}}
                                    <td class="text-center align-middle font-bold border-b">
                                        {{ $program['name'] }}
                                    </td>
                                    <td class="text-center align-middle border-b">
                                        <div class="flex gap-2 justify-center">
                                            <input type="number" class="input input-sm input-bordered w-[80px] text-center font-medium action-count" name="programs[{{ $system['id'] }}][{{ $program['name'] }}][delete_count]" placeholder="Delete" min="0">
                                            <input type="number" class="input input-sm input-bordered w-[80px] text-center font-medium action-count" name="programs[{{ $system['id'] }}][{{ $program['name'] }}][change_count]" placeholder="Change" min="0">
                                        </div>
                                    </td>
                                    <td class="align-middle border-b p-2">
                                        <textarea class="textarea textarea-bordered textarea-sm w-full h-12 resize-none focus:border-primary detail-remark" name="programs[{{ $system['id'] }}][{{ $program['name'] }}][detail_remark]" placeholder="ระบุ User IDs และเหตุผลที่แนบมา..."></textarea>
                                    </td>
                                </tr>
                            @endforeach
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-10 text-gray-500">
                                    <i class="fa-solid fa-circle-info mr-2"></i> No systems found.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div class="flex justify-end mt-10 w-full">
            <button class="btn btn-primary btn-lg px-16 shadow-lg rounded-xl text-base font-semibold" type="submit">
                <i class="fa-solid fa-floppy-disk mr-3"></i> Save All
            </button>
        </div>

    </form>
</section>

@endsection