@extends('layouts/webflowTemplate')
@section('contents')
<div class="w-full max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">

    {{-- Header --}}
  <h2 class="text-3xl font-extrabold mb-8 text-center text-[#DC143C] tracking-wide drop-shadow-lg">
    {{ "แบบฟอร์มแจ้งความประสงค์ฝึกอบรมภายนอก "}}<br>
    <span class="text-2xl">
        {{ $data_head[0]->FORM_NAME_TH  }}<br>
        {{ "(".$data_head[0]->FORM_NAME_EN.")" }}
    </span>
</h2>


    <form method="POST" action="">
        {{-- Hidden field --}}
        <input type="hidden" name="NFRMNO" value="{{ $NFRMNO }}">
        <input type="hidden" name="VORGNO" value="{{ $VORGNO }}">
        <input type="hidden" name="CYEAR" value="{{ $CYEAR }}">
        <input type="hidden" name="CYEAR2" value="{{ $CYEAR2 }}">
        <input type="hidden" name="NRUNNO" value="{{ $NRUNNO }}">
        <input type="hidden" name="PREFIX" value="{{ $data_head[0]->FID }}">
        <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1">
            รายละเอียดฟอร์ม
        </h3>
         <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
            <table class="w-full">
                <tr class="bg-gray-50">
                    <td class="p-3 font-bold w-48">Form no </td>
                    <td class="p-3 text-blue-600 font-semibold">{{ $formno }}</td>
                </tr>
                <tr>
                    <td class="p-3 font-bold">Request By</td>
                    <td class="p-3 text-blue-600 font-semibold">{{ $data_head[0]->REQ_EMPNO."_".$data_head[0]->REQ_NAME }}</td>
                </tr>
                <tr>
                    <td class="p-3 font-bold">Input By</td>
                    <td class="p-3 text-blue-600 font-semibold">{{ $data_head[0]->INP_EMPNO."_".$data_head[0]->INP_NAME }}</td>
                </tr>
            </table>
        </div>
        <!-- Part 1 -->
        <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1">
            หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม (Training Subject & Schedule)
        </h3>
        <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
            <table class="w-full">
                <tr class="bg-gray-50">
                    <td class="p-3 font-bold w-48">หัวข้อการอบรม</td>
                    <td class="p-3 text-blue-600 font-semibold">{{ $data_head[0]->SUBJECT }}</td>
                </tr>
                <tr>
                    <td class="p-3 font-bold">สถานที่อบรม</td>
                    <td class="p-3 text-blue-600 font-semibold">{{ $data_head[0]->PLACE }}</td>
                </tr>
                <tr class="bg-gray-50">
                    <td class="p-3 font-bold">วันที่อบรม</td>
                    <td class="p-3 text-blue-600 font-semibold">
                        {{ \Carbon\Carbon::createFromFormat('Ymd', $data_head[0]->DATE_FROM)->format('d/m/Y') }}
                        ถึง
                        {{ \Carbon\Carbon::createFromFormat('Ymd', $data_head[0]->DATE_TO)->format('d/m/Y') }}
                    </td>
                </tr>
                <tr>
                    <td class="p-3 font-bold">เวลาที่อบรม</td>
                    <td class="p-3 text-blue-600 font-semibold">
                        {{ substr($data_head[0]->TIME_FROM,0,2).":".substr($data_head[0]->TIME_FROM,2,2) }}
                        ถึง
                        {{ substr($data_head[0]->TIME_TO,0,2).":".substr($data_head[0]->TIME_TO,2,2) }}
                    </td>
                </tr>
                <tr class="bg-gray-50">
                    <td class="p-3 font-bold">สถาบันที่อบรม</td>
                    <td class="p-3 text-blue-600 font-semibold">{{ $data_head[0]->INSTITUTION }}</td>
                </tr>
            </table>
        </div>

        <!-- Part Laws -->
        <? if($data_head[0]->FID == '2'){?>
            <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1">
            ชื่อกฎหมายที่เกี่ยวข้อง (Concerned laws)
            </h3>
            <table class="w-full text-sm border border-gray-300 rounded-lg mb-6 table-fixed">
                <tr>
                    <td class="text-blue-600 p-2 border text-left font-semibold">{{ $data_head[0]->LAWS }}</td>
                </tr>
            </table>
        <?}?>

         <!-- Part 2 -->
        <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1">
            วัตถุประสงค์ของการฝึกอบรม (Training Objective)
        </h3>
        <table class="w-full text-sm border border-gray-300 rounded-lg mb-6 table-fixed">
            <thead class="bg-gray-100 font-bold">
                <tr>
                    <th class="p-2 text-center w-[10%]">ลำดับ</th>
                    <th class="p-2 text-left w-[90%]">วัตถุประสงค์</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data_purpose as $row_pp)
                <tr>
                    <td class="text-blue-600 p-2 border text-center font-semibold">{{ $row_pp->PID }}</td>
                    <td class="text-blue-600 p-2 border font-semibold">{{ $row_pp->PURPOSE }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        <!-- Part 3 -->
        <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1">
            ความคาดหวัง / ประโยชน์ที่คาดว่าจะได้รับ (Expectation / AMEC's Benefit)
        </h3>
        <table class="w-full text-sm border border-gray-300 rounded-lg mb-6 table-fixed">
            <thead class="bg-gray-100 font-bold">
                <tr>
                    <th class="p-2 text-center w-[10%]">ลำดับ</th>
                    <th class="p-2 text-left w-[90%]">ความคาดหวัง / ประโยชน์</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data_benefit as $row_bnf)
                <tr>
                    <td class="text-blue-600 p-2 border text-center font-semibold">{{ $row_bnf->BID }}</td>
                    <td class="text-blue-600 p-2 border font-semibold">{{ $row_bnf->BENEFIT }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

         <!-- Part 4 -->
        <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1">
            ผู้เข้าร่วมฝึกอบรม (Participant Information)
        </h3>
        <table class="w-full text-sm border border-gray-300 rounded-lg mb-6">
            <thead class="bg-gray-100 font-bold">
                <tr>
                    <th class="p-2 text-left">รหัสพนักงาน</th>
                    <th class="p-2 text-left">ชื่อ-สกุล</th>
                    <th class="p-2 text-left">ตำแหน่ง</th>
                    <th class="p-2 text-left">Sec.</th>
                    <th class="p-2 text-left">Dept.</th>
                    <th class="p-2 text-left">Div.</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data_trainee as $row_trainee)
                    <tr>
                         <td class="text-blue-600 p-2 border font-semibold">{{ $row_trainee->EMPNO }}</td>
                        <td class="text-blue-600 p-2 border font-semibold">{{ $row_trainee->TRAINEE_NAME }}</td>
                        <td class="text-blue-600 p-2 border font-semibold">{{ $row_trainee->TRAINEE_POS }}</td>
                        <td class="text-blue-600 p-2 border font-semibold">{{ $row_trainee->TRAINEE_SEC }}</td>
                        <td class="text-blue-600 p-2 border font-semibold">{{ $row_trainee->TRAINEE_DEPT }}</td>
                        <td class="text-blue-600 p-2 border font-semibold">{{ $row_trainee->TRAINEE_DIV }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <?if($data_head[0]->FID == '1'){?>
             <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
                <table class="w-full">
                    <tr class="bg-gray-50">
                        <td class="p-3 font-bold w-48">หัวข้อกชื่อตาม JD </td>
                        <td class="p-3 text-blue-600 font-semibold">{{ $data_trainee[0]->JD_NAME }}</td>
                    </tr>
                    <tr>
                        <td class="p-3 font-bold">เอกสารประกอบ JD </td>
                        <td class="p-3 text-blue-600 font-semibold">
                            @foreach($data_attach_jd as $row_jd)
                                <a href="{{ base_url('gpform/GP-TRN/training/preview_file/' . $formno.'/'.$row_jd->FILENAME) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                        {{ $row_jd->FILENAME }}
                                </a>
                            @endforeach
                        </td>
                    </tr>
                     <tr class="bg-gray-50">
                        <td class="p-3 font-bold w-48">รายละเอียด JD </td>
                        <td class="p-3 text-blue-600 font-semibold">{{ $data_trainee[0]->JD_DESC }}</td>
                    </tr>
                </table>
            </div>
        <?}?>
        <?if($data_head[0]->FID == '1' || $data_head[0]->FID == '2' || $data_head[0]->FID == '3' || $data_head[0]->FID == '4'){?>    
            <!-- Part 5 -->
            <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1">
                การพิจารณาค่าฝึกอบรม (Training expense consideration)
            </h3>
            <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
                <table class="w-full">
                    <?if($data_head[0]->TRN_EXPENSE_STATUS == 'not_compare'){?>
                        <tr class="bg-gray-50">
                            <td class="p-3 font-bold w-48 text-blue-600" colspan='2'> {{ "ไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม (Not compare training expense)" }}</td>
                        </tr>
                        <?if($data_head[0]->TRN_EXPENSE_REASON == 'free'){?>
                            <tr class="bg-gray-50">
                                <td class="pl-5 p-3 font-bold w-48 text-blue-600" colspan='2'> {{ "- อบรมฟรี (Free of Charge)" }}</td>
                            </tr>
                        <?}else{?>
                            <tr class="bg-gray-50">
                                <td class="pl-5 p-3 font-bold w-48 text-blue-600" colspan='2'> {{ "- เหตุผลอื่น: ". $data_head[0]->TRN_EXPENSE_OTHER }}</td>
                            </tr>
                        <?}?>
                    <?}else{?>
                        <tr class="bg-gray-50">
                            <td class="p-3 font-bold" colspan='2'> {{ " มีการเปรียบเทียบราคา ค่าฝึกอบรม (Compared training expense)" }}</td>
                        </tr>   
                        <tr>
                            <td class="p-3 font-bold ">เอกสารที่เกี่ยวข้อง</td>
                            <td class="p-3 text-blue-600 font-semibold">
                                @foreach($data_attach_compare as $row_cp)
                                     <a href="{{ base_url('gpform/GP-TRN/training/preview_file/'.$formno.'/'.$row_cp->FILENAME) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                        {{ $row_cp->FILENAME }}
                                    </a>
                                @endforeach
                            </td>
                        </tr>
                    <?}?>
                </table>
            </div>

            <!-- Part 6 -->
            <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1">
                ค่าใช้จ่ายในการฝึกอบรม (Training Expense)
            </h3>
            <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
                <table class="w-full">
                    <tr class="bg-gray-50">
                        <td class="p-3 font-bold w-48">ค่าใช้จ่าย </td>
                        <td class="p-3 text-blue-600 font-semibold">{{ number_format($data_head[0]->COST, 2) }}</td>
                    </tr>
                     <tr class="bg-gray-50">
                        <td class="p-3 font-bold w-48">(รวม VAT 7%) </td>
                        <td class="p-3 text-blue-600 font-semibold">{{ number_format($data_head[0]->COST * 1.07, 2) }}</td>
                    </tr>
                     <tr class="bg-gray-50">
                        <td class="p-3 font-bold w-48">บันทึกเพิ่มเติม </td>
                        <td class="p-3 text-blue-600 font-semibold">{{ $data_head[0]->COST_NOTE }}</td>
                    </tr>
                </table>
            </div>
        <?}?>


            {{-- Remark & Action --}}
            @if ($mode == '02')
                <div class="mb-4 mt-6">
                    <span class="font-bold text-gray-700">Remark :</span>
                    <textarea name="txt_remark" id="txt_remark" class="w-full border p-2 rounded mb-3" placeholder="หมายเหตุ"></textarea>
                </div>


                <div class="flex justify-center gap-12">
                    <button type="button" class="btn-submit px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                        data-action="approve">
                        ✅ Approve
                    </button>
                    <button type="button" class="btn-submit px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
                        data-action="reject">
                        ❌ Reject
                    </button>
                    <button type="button" class="btn-submit px-6 py-3 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
                        data-action="returnb">
                        ↩ Return
                    </button>
                </div>
            @endif
            <div class="form-data" 
                data-nfrmno="{{ $NFRMNO }}" 
                data-vorgno="{{ $VORGNO }}" 
                data-cyear="{{ $CYEAR }}" 
                data-cyear2="{{ $CYEAR2 }}" 
                data-nrunno="{{ $NRUNNO }}" 
                data-empno="{{ $EMPNO }}">
            </div>
            <div class="flow mt-6" style="overflow: hidden"></div>

        </div>

        




    </form>
</div>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/view_train.js?ver={{ $GLOBALS['version'] }}"></script>             
@endsection