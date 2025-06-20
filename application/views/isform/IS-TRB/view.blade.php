@extends('layouts/webflowTemplate')
@section('styles')
@endsection

@section('contents')
    <div class="max-w-6xl w-full mx-auto px-6 py-10 bg-white space-y-8 text-gray-800">
        <h1 class="text-3xl font-bold text-blue-900 border-b pb-4">IS Trouble Report</h1>
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>

        <table class="w-full border border-slate-300 text-sm">
            {{-- print_r($form) --}}
            <tbody>
                {{-- ผู้แจ้ง --}}
                <tr class="bg-blue-100 border-b">
                    <th colspan="2" class="text-left p-2 font-semibold">1. ข้อมูลผู้แจ้ง (Requester Information)</th>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">เลขที่เอกสาร / Form No.</td>
                    <td class="p-2">{{ $formNumber }}</td>
                </tr>
                <tr class="border-b">
                    <td class="w-1/4 p-2 font-medium bg-blue-50 border-slate-300 border-r">วันที่ / Date</td>
                    <td class="p-2">{{ $form->REQUEST_DATE }}</td>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">ชื่อ / Name</td>
                    <td class="p-2">{{ $form->NAME }}</td>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">สถานที่ / Location</td>
                    <td class="p-2">{{ $form->LOCATION }}</td>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">โทรศัพท์ / Tel</td>
                    <td class="p-2">{{ $form->TEL ?? "-" }}</td>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">อีเมล / Email</td>
                    <td class="p-2">{{ $form->EMAIL ?? "-" }}</td>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">หมายเหตุ / Note</td>
                    <td class="p-2">{{ $form->NOTE ?? "-" }}</td>
                </tr>

                {{-- ผู้ปฏิบัติงาน --}}
                <tr class="bg-blue-100 border">
                    <th colspan="2" class="text-left p-2 font-semibold">2. ผู้ปฏิบัติงาน (Person in Charge)</th>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">รายชื่อ</td>
                    <td class="p-2">
                        @foreach ($emp as $e)
                            - {{ $e->SNAME }}<br>
                        @endforeach
                    </td>
                </tr>

                {{-- ผลลัพธ์ --}}
                <tr class="bg-blue-100 border-b">
                    <th colspan="2" class="text-left p-2 font-semibold">3. ผลลัพธ์ (Result)</th>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">สถานะ</td>
                    <td class="p-2">{{ $form->RESULT == '1' ? 'เสร็จสิ้น / complete' : '' }}</td>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">รายละเอียด</td>
                    <td class="p-2">{{ $form->RESULTDETAIL ?? '-' }}</td>
                </tr>

                {{-- การแจ้งกลับ --}}
                <tr class="bg-blue-100 border-b">
                    <th colspan="2" class="text-left p-2 font-semibold">4. การแจ้งกลับ (Inform)</th>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">แจ้งผลกลับ</td>
                    <td class="p-2">{!! $form->INFORM == '1' ? '<i class="icofont-ui-check text-green-700"></i>' : '<i class="icofont-ui-close text-red-700"></i>' !!}</td>
                </tr>

                {{-- ลักษณะปัญหา --}}
                <tr class="bg-blue-100 border-b">
                    <th colspan="2" class="text-left p-2 font-semibold">5. ลักษณะปัญหา (Trouble Type)</th>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">ประเภท</td>
                    <td class="p-2">
                        @foreach ($trouble as $tb)
                            - {{ $tb->TYPE_NAME }}<br>
                        @endforeach
                    </td>
                </tr>

                {{-- สาเหตุ --}}
                <tr class="bg-blue-100 border-b">
                    <th colspan="2" class="text-left p-2 font-semibold">6. สาเหตุของปัญหา (Cause Trouble)</th>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">รายละเอียด</td>
                    <td class="p-2">{{ $form->CAUSETROUBLE }}</td>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">ไฟล์แนบ</td>
                    <td class="p-2">
                        <!-- <img src="{{ $path }}{{ $form->CAUSEFILE }}" alt="รูปสาเหตุ" class="rounded border max-w-sm"> -->
                        <!-- {{ FCPATH }} -->
                        <!-- <a href="{{ FCPATH }}">Test</a> -->
                        @if($form->CAUSEFILE)
                            <a href="{{ base_url('isform/IS-TRB/main/preview/') . $form->CAUSEFILE }}" class="link text-blue-400 btn rounded-lg" target="_blank">Open Attachment</a>
                        @endif
                    </td>
                </tr>

                {{-- วิธีแก้ไข --}}
                <tr class="bg-blue-100 border-b">
                    <th colspan="2" class="text-left p-2 font-semibold">7. วิธีการแก้ไข (Countermeasure)</th>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">รายละเอียด</td>
                    <td class="p-2">{{ $form->COUNTERMEASURE }}</td>
                </tr>
                <tr class="border-b">
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">ไฟล์แนบ</td>
                    <td class="p-2">
                        @if($form->COUNTERMEASUREFILE)
                            <a href="{{ base_url('isform/IS-TRB/main/preview/') . $form->COUNTERMEASUREFILE }}" class="link text-blue-400 btn rounded-lg" target="_blank">Open Attachment</a>
                        @endif
                    </td>
                </tr>

                {{-- การป้องกัน --}}
                <tr class="bg-blue-100 border-b">
                    <th colspan="2" class="text-left p-2 font-semibold">8. แนวทางป้องกัน (Prevention)</th>
                </tr>
                <tr>
                    <td class="p-2 font-medium bg-blue-50 border-slate-300 border-r">รายละเอียด</td>
                    <td class="p-2">{{ $form->PREVENTION }}</td>
                </tr>
            </tbody>
        </table>
        @if ($mode == '02')
            <div class="flex justify-center mt-6 space-x-4">
                <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-submit" data-action="approve" id="btn-confirm">
                    Approve
                </button>
                <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-submit" data-action="reject">
                    Reject
                </button>
            </div>
        @endif
        <div class="showflow">

        </div>
    </div>


@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/troubleReportView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection