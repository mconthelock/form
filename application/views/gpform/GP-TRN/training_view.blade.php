@extends('layouts/webflowTemplate')
<style>
    .training-view {
        font-size: 16px;         
        line-height: 1.7;
        color: #111827;
    }

    .main-text {
        color: #374151;          
        font-weight: 800;
        font-size: 1.125rem;  /* 16px */
    }

    .value-text {
        color: #111827;          
        font-weight: 500;
        font-size: 1.125rem;  /* 16px */
    }

    .value-sp-text {
        color: #1d4ed8;        
        font-weight: 600;
        font-size: 1.125rem;  /* 18px */
    }
</style>

@section('contents')
<div class="w-full max-w-7xl mx-auto bg-white p-6 rounded-xl shadow">
    {{-- Header --}}
  <h2 class="text-3xl font-extrabold mb-8 text-center text-[#DC143C] tracking-wide drop-shadow-lg">
    {{ "แบบฟอร์มแจ้งความประสงค์ฝึกอบรมภายนอก ในประเทศ"}}<br>
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
        <input type="text" name="txt_exdata" id="txt_exdata" value="{{ $exdata }}">
        <input type="hidden" name="txt_fid" value="{{ $data_head[0]->FID }}">
        <h3 class="font-bold text-lg mb-3 text-black-800 border-b pb-1">
            รายละเอียดฟอร์ม
        </h3>
         <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
            <table class="w-full">
                <tr class="bg-gray-50">
                    <td class="p-3 main-text w-48">Form no </td>
                    <td class="p-3 value-sp-text">{{ $formno }}
                    </td>
                </tr>
                <tr>
                    <td class="p-3 main-text w-48">Request By</td>
                    <td class="p-3 value-text">{{ $data_head[0]->REQ_EMPNO."_".$data_head[0]->REQ_NAME }}</td>
                </tr>
                <tr class="bg-gray-50">
                    <td class="p-3 main-text w-48">Input By</td>
                    <td class="p-3 value-text">{{ $data_head[0]->INP_EMPNO."_".$data_head[0]->INP_NAME }}</td>
                </tr>
            </table>
        </div>
        <!-- Part 1 -->
        <h3 class="font-bold text-lg mb-3 text-black-800 border-b pb-1">
            หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม (Training Subject & Schedule)
        </h3>
        <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
            <table class="w-full">
                <tr class="bg-gray-50">
                    <td class="p-3 main-text w-48">หัวข้อการอบรม</td>
                    <td class="p-3 value-sp-text">
                        @if ($mode == '02' && $exdata == '19x')
                            <input type="text" id="viewTrainingSubject" name="viewTrainingSubject" maxlength="200" class="input input-bordered w-full mb-2" data-alert="กรุณากรอกหัวข้อฝึกอบรม" value=" {{ $data_head[0]->SUBJECT }}">
                        @else
                            {{ $data_head[0]->SUBJECT }}
                            <input type="hidden" id="viewTrainingSubject" name="viewTrainingSubject" value=" {{ $data_head[0]->SUBJECT }}">
                        @endif
                    </td>
                </tr>
                <tr>
                    <td class="p-3 main-text w-48">สถานที่อบรม</td>
                    <td class="p-3 value-text">
                        @if ($mode == '02' && $exdata == '19x')
                            <input type="text" id="viewLocation"  class="input input-bordered w-full mb-2" maxlength="200" data-alert="กรุณาระบุสถานที่" value="{{ $data_head[0]->PLACE }}">
                        @else
                             {{ $data_head[0]->PLACE }}
                        @endif
                    </td>
                </tr>
                @if ($data_head[0]->FID != '5')
                    <tr class="bg-gray-50">
                        <td class="p-3 main-text w-48">สถาบันที่อบรม</td>
                        <td class="p-3 value-text">
                            @if ($mode == '02' && $exdata == '19x')
                                <input type="text" id="viewInstitute" class="input input-bordered w-full" maxlength="200"
                                data-alert="กรุณาระบุสถาบันฝึกอบรม" value="{{ $data_head[0]->INSTITUTION }}">
                            @else
                                {{ $data_head[0]->INSTITUTION }}
                            @endif
                        </td>
                    </tr>
                @endif
                <tr class="bg-gray-50">
                    <td class="p-3 main-text w-48">วันที่อบรม</td>
                    <td class="p-3 value-text">
                        @if ($mode == '02' && $exdata == '19x')
                            <input type="date" id="viewDateFrom" class="input input-bordered w-[200px]" maxlength="8" data-alert="กรุณาเลือกวันที่อบรม"
                             value="{{ \Carbon\Carbon::createFromFormat('Ymd', $data_head[0]->DATE_FROM)->format('Y-m-d') }}">
                            <span class="self-center">ถึง</span>
                            <input type="date" id="viewDateTo" class="input input-bordered w-[200px]" maxlength="8" data-alert="กรุณาเลือกวันที่อบรม"
                            value="{{ \Carbon\Carbon::createFromFormat('Ymd', $data_head[0]->DATE_TO)->format('Y-m-d') }}">
                        @else
                            {{ \Carbon\Carbon::createFromFormat('Ymd', $data_head[0]->DATE_FROM)->format('d/m/Y') }}
                            ถึง
                            {{ \Carbon\Carbon::createFromFormat('Ymd', $data_head[0]->DATE_TO)->format('d/m/Y') }}
                            <font style='color:red;padding-left:15px'>(DD/MM/YYYY)</font>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td class="p-3 main-text w-48">เวลาที่อบรม</td>
                    <td class="p-3 value-text">
                        @if ($mode == '02' && $exdata == '19x')
                            <select id="viewTimeFromHour" class="input input-bordered w-20 text-center" value="{{ substr($data_head[0]->TIME_FROM,0,2)}}"></select>
                            <span class="self-center">:</span>
                            <select id="viewTimeFromMin" class="input input-bordered w-20 text-center" value="{{ substr($data_head[0]->TIME_FROM,2,2)}}"></select>
                            <span class="self-center">ถึง</span>
                            <select id="viewTimeToHour" class="input input-bordered w-20 text-center" value="{{ substr($data_head[0]->TIME_TO,0,2)}}"></select>
                            <span class="self-center">:</span>
                            <select id="viewTimeToMin" class="input input-bordered w-20 text-center" value="{{ substr($data_head[0]->TIME_TO,2,2)}}"></select>
                        @else
                            {{ substr($data_head[0]->TIME_FROM,0,2).":".substr($data_head[0]->TIME_FROM,2,2) }}
                            ถึง
                            {{ substr($data_head[0]->TIME_TO,0,2).":".substr($data_head[0]->TIME_TO,2,2) }}
                        @endif
                    </td>
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
                    @if ($mode == '02' && $exdata == '19x')
                         <textarea id="viewConcernLaw" class="textarea textarea-bordered w-full" rows="3" maxlength="200"
                            data-alert="กรุณาระบุชื่อกฎหมายที่เกี่ยวข้อง"> {{ $data_head[0]->LAWS }}</textarea>
                    @else
                        <td class="p-3 value-text">{{ $data_head[0]->LAWS }}</td>
                    @endif
                </tr>
            </table>
        <?}?>

        <h3 class="font-bold text-lg mb-3 text-black-700 border-b pb-1"> วัตถุประสงค์ของการฝึกอบรม (Training Objective)</h3>
        <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
            <table id="tblObjective" class="w-full text-sm table-fixed">
                <thead class="bg-gray-100 main-text w-48">
                    <tr>
                        <th class="p-3 text-center w-[7%]">ลำดับ</th>
                        <th class="p-3 text-left w-[83%]">วัตถุประสงค์</th>
                        @if ($mode == '02' && $exdata == '19x')
                            <th class="p-3 text-center w-[10%]">จัดการ</th>
                        @endif
                    </tr>
                </thead>
                <tbody>
                    @foreach($data_purpose as $row_pp)
                        <tr>
                            <td class="p-3 border text-center font-semibold">{{ $loop->iteration }}</td>
                            <td class="p-3 border">
                                @if ($mode == '02' && $exdata == '19x')
                                    <input type="text" class="input input-bordered w-full objective-input"
                                        value="{{ $row_pp->DETAIL }}" maxlength="200"
                                        data-alert="กรุณากรอกวัตถุประสงค์">
                                @else
                                    <span class="value-text">{{ $row_pp->DETAIL }}</span>
                                @endif
                            </td>
                            @if ($mode == '02' && $exdata == '19x')
                                <td class="p-3 text-center border">
                                    <button type="button" id="btnDelObjective" class="btn btn-sm bg-red-500 hover:bg-red-600 text-white font-bold btnDelObjective">−</button>
                                </td>
                            @endif
                        </tr>
                    @endforeach
                </tbody>
            </table>
            @if ($mode == '02' && $exdata == '19x')
                <div class="w-full text-center mt-4 pb-4">
                    <button 
                        type="button" id="btnAddObjective" class="btn bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 mt-2">
                        ＋ เพิ่มวัตถุประสงค์
                    </button>
                </div>
            @endif
        </div>

        <h3 class="font-bold text-lg mb-3 text-black-800 border-b pb-1">
            ความคาดหวัง / ประโยชน์ที่คาดว่าจะได้รับ (Expectation / AMEC's Benefit)
        </h3>
        <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
            <table id="tblBenefit" class="w-full text-sm table-fixed">
                <thead class="bg-gray-100 main-text w-48">
                    <tr>
                        <th class="p-3 text-center w-[7%]">ลำดับ</th>
                        <th class="p-3 text-left w-[83%]">ความคาดหวัง / ประโยชน์</th>
                        @if ($mode == '02' && $exdata == '19x')
                            <th class="p-3 text-center w-[10%]">จัดการ</th>
                        @endif
                    </tr>
                </thead>
                <tbody>
                    @foreach($data_benefit as $row_bnf)
                        <tr>
                            <td class="p-3 border text-center font-semibold">{{ $loop->iteration }}</td>
                            <td class="p-3 border">
                                @if ($mode == '02' && $exdata == '19x')
                                    <input type="text" class="input input-bordered w-full benefit-input"
                                        value="{{ $row_bnf->DETAIL }}" maxlength="200"
                                        data-alert="กรุณากรอกความคาดหวัง">
                                @else
                                    <span class="value-text">{{ $row_bnf->DETAIL }}</span>
                                @endif
                            </td>
                            @if ($mode == '02' && $exdata == '19x')
                                <td class="p-3 text-center border">
                                    <button type="button" id="btnDelBenefit" class="btn btn-sm bg-red-500 hover:bg-red-600 text-white font-bold btnDelBenefit">−</button>
                                </td>
                            @endif
                        </tr>
                    @endforeach
                </tbody>
            </table>
            @if ($mode == '02' && $exdata == '19x')
                <div class="w-full text-center mt-4 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <button type="button" id="btnAddBenefit" class="btn bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2">＋ เพิ่มความคาดหวัง / ประโยชน์</button>
                </div>
            @endif
        </div>

         <!-- Part 4 -->
        <h3 class="font-bold text-lg mb-3 text-black-800 border-b pb-1">
            ผู้เข้าร่วมฝึกอบรม (Participant Information)
        </h3>
        <table class="w-full text-sm border border-gray-300 rounded-lg mb-6">
            <thead class="bg-gray-100 main-text w-48">
                <tr>
                    <th class="p-3 main-text">รหัสพนักงาน</th>
                    <th class="p-3 main-text">ชื่อ-สกุล</th>
                    <th class="p-3 main-text">ตำแหน่ง</th>
                    <th class="p-3 main-text">Section</th>
                    <th class="p-3 main-text">Department</th>
                    <th class="p-3 main-text">Division</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data_trainee as $row_trainee)
                    <tr>
                        <td class="p-3 value-sp-text text-center">{{ $row_trainee->EMPNO }}</td>
                        <td class="p-3 value-sp-text">{{ $row_trainee->TRAINEE_NAME }}</td>
                        <td class="p-3 value-sp-text text-center">{{ $row_trainee->TRAINEE_POS }}</td>
                        <td class="p-3 value-sp-text text-center">{{ $row_trainee->TRAINEE_SEC }}</td>
                        <td class="p-3 value-sp-text text-center">{{ $row_trainee->TRAINEE_DEPT }}</td>
                        <td class="p-3 value-sp-text text-center">{{ $row_trainee->TRAINEE_DIV }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <?if($data_head[0]->FID == '1'){?>
             <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
                <table class="w-full">
                    <tr class="bg-gray-50">
                        <td class="p-3 main-text w-48">ชื่องานตาม JD </td>
                        <td class="p-3 value-text">{{ $data_trainee[0]->JD_NAME }}</td>
                    </tr>
                    <tr>
                        <td class="p-3 main-text w-48">เอกสารประกอบ JD </td>
                        <td class="p-3 value-text">
                            @foreach($data_attach_jd as $row_jd)
                                <a href="{{ base_url('gpform/GP-TRN/training/preview_file/' . $formno.'/'.$row_jd->FILENAME.'/'.$row_jd->ORIGIN_FILENAME) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                    {{ $row_jd->ORIGIN_FILENAME }}
                                </a>

                                @if ($mode == '02' && $exdata == '19x')
                                    <button   type="button"
                                        class="inline-flex items-center justify-center p-1 rounded bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition cursor-pointer"
                                        onclick="confirmDelete(
                                            '{{ $row_jd->FILENAME }}',
                                            '{{ $CYEAR2 }}',
                                            '{{ $NRUNNO }}',
                                            '{{ $row_jd->TYPE_ATT }}',
                                            '{{ $row_jd->ID }}'
                                        )"  title="ลบไฟล์นี้" 
                                    >
                                        <i class="icofont-trash text-xl font-bold pointer-events-none"></i>
                                    </button><br>
                                @endif
                            @endforeach
                        </td>
                    </tr>
                     <tr class="bg-gray-50">
                        <td class="p-3 main-text w-48">รายละเอียด JD </td>
                        <td class="p-3 value-text">{{ $data_trainee[0]->JD_DESC }}</td>
                    </tr>
                </table>
            </div>
        <?}?>
        <?if($data_head[0]->FID == '1' || $data_head[0]->FID == '2' || $data_head[0]->FID == '3' || $data_head[0]->FID == '4'){?>    
            <!-- Part 5 -->
            <h3 class="font-bold text-lg mb-3 text-black-800 border-b pb-1">
                การพิจารณาค่าฝึกอบรม (Training expense consideration)
            </h3>
            <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
                <table class="w-full">
                    <?if($data_head[0]->TRN_EXPENSE_STATUS == '0'){?> 
                        <tr class="bg-gray-50">
                            <td class="p-3 value-text" colspan='2'> {{ "ไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม (Not compare training expense)" }}</td>
                        </tr>
                        <?if($data_head[0]->TRN_EXPENSE_REASON == '1'){?>
                            <tr class="bg-gray-50">
                                <td class="p-3 value-text" colspan='2'> {{ "- อบรมฟรี (Free of Charge)" }}</td>
                            </tr>
                        <?}else{?>
                            <tr class="bg-gray-50">
                                <td class="p-3 value-text" colspan='2'> {{ "- เหตุผลอื่น: ". $data_head[0]->TRN_EXPENSE_OTHER }}</td>
                            </tr>
                        <?}?>
                    <?}else{?>
                        <tr class="bg-gray-50">
                            <td class="p-3 font-bold" colspan='2'> {{ " มีการเปรียบเทียบราคา ค่าฝึกอบรม (Compared training expense)" }}</td>
                        </tr>
                        <tr>
                            <td class="p-3 main-text w-48">เอกสารที่เกี่ยวข้อง</td>
                            <td class="p-3 value-text">
                                @foreach($data_attach_compare as $row_cp)
                                     <a href="{{ base_url('gpform/GP-TRN/training/preview_file/'.$formno.'/'.$row_cp->FILENAME.'/'.$row_cp->ORIGIN_FILENAME) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                        {{ $row_cp->ORIGIN_FILENAME }}
                                    </a>

                                    @if ($mode == '02' && $exdata == '19x')
                                        <button   type="button"
                                            class="inline-flex items-center justify-center p-1 rounded bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition cursor-pointer"
                                            onclick="confirmDelete(
                                                '{{ $row_cp->FILENAME }}',
                                                '{{ $CYEAR2 }}',
                                                '{{ $NRUNNO }}',
                                                '{{ $row_cp->TYPE_ATT }}',
                                                '{{ $row_cp->ID }}'
                                            )"  title="ลบไฟล์นี้" 
                                        >
                                            <i class="icofont-trash text-xl font-bold pointer-events-none"></i>
                                        </button><br>
                                    @endif
                                @endforeach
                            </td>

                        </tr>
                    <?}?>
                </table>
            </div>

            <!-- Part 6 -->
            <h3 class="font-bold text-lg mb-3 text-black-800 border-b pb-1">
                ค่าใช้จ่ายในการฝึกอบรม (Training Expense)
            </h3>
            <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
                <table class="w-full">
                     @if ($data_head[0]->TRN_EXPENSE_REASON == '0' || $data_head[0]->TRN_EXPENSE_STATUS == '1')  
                        <tr class="bg-gray-50">
                            <td class="p-3 main-text w-48">ค่าใช้จ่าย </td>
                                <td class="p-3 value-sp-text">
                                    @if ($mode == '02' && $exdata == '19x')
                                        <input type="number" id="viewAmountInput" class="input input-bordered w-1/2" data-alert="กรุณากรอกจำนวนเงิน" value="{{ $show_cost }}">
                                    @else
                                        {{ number_format($show_cost, 2) }}
                                    @endif
                                </td>
                        </tr>
                        <tr>
                            <td class="p-3 main-text w-48">(รวม VAT 7%) </td>
                            <td class="p-3 value-sp-text">
                                @if ($mode == '02' && $exdata == '19x')
                                    <span id="viewVatResult" class="font-bold text-indigo-600 text-lg whitespace-nowrap">
                                        {{ number_format($show_cost * 1.07, 2) }}
                                    </span>
                                @else
                                    {{ number_format($show_cost * 1.07, 2) }}
                                @endif
                            </td>
                        </tr>
                        <tr class="bg-gray-50">
                            <td class="p-3 font-bold w-48" valign="top">บันทึกเพิ่มเติม </td>
                            <td class="p-3 value-text">
                                 @if ($mode == '02' && $exdata == '19x')
                                    <textarea id="viewAmountNote" class="textarea textarea-bordered w-full" maxlength="200" rows="2" >
                                         {{ trim($data_head[0]->COST_NOTE) }}
                                    </textarea>
                                @else
                                    {{ $data_head[0]->COST_NOTE }}
                                @endif
                            </td>
                        </tr>
                    @else
                        <tr class="bg-gray-50">
                            <td colspan="2" class="p-3 value-text" style="color:red">ไม่มีค่าใช้จ่าย </td>
                        </tr>
                    @endif
                </table>
            </div>
        <?}?>
            <div class="border border-gray-300 rounded-lg overflow-hidden text-sm mb-6">
                <table class="w-full">
                   <tr>
                        <td class="p-3 main-text w-48">เอกสารที่เกี่ยวข้อง</td>
                        <td class="p-3 value-text">
                            @foreach($data_attach_other as $row_other)
                                <a href="{{ base_url('gpform/GP-TRN/training/preview_file/'.$formno.'/'.$row_other->FILENAME.'/'.$row_other->ORIGIN_FILENAME) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                    {{ $row_other->ORIGIN_FILENAME }}
                                </a>
                                @if ($mode == '02' && $exdata == '19x')
                                    <button   type="button"
                                        class="inline-flex items-center justify-center p-1 rounded bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition cursor-pointer"
                                        onclick="confirmDelete(
                                            '{{ $row_other->FILENAME }}',
                                            '{{ $CYEAR2 }}',
                                            '{{ $NRUNNO }}',
                                            '{{ $row_other->TYPE_ATT }}',
                                            '{{ $row_other->ID }}'
                                        )"  title="ลบไฟล์นี้" 
                                    >
                                        <i class="icofont-trash text-xl font-bold pointer-events-none"></i>
                                    </button><br>
                                @endif
                            @endforeach
                        </td>
                    </tr>
                </table>
            </div>
           


            {{-- Remark & Action --}}
            @if ($mode == '02')
                <div class="mb-4 mt-6">
                    <span class="font-bold text-gray-800">Remark :</span>
                    <textarea name="txt_remark" id="txt_remark" class="w-full border p-3 rounded mb-3" placeholder="หมายเหตุ"></textarea>
                </div>

                {{-- ================================================================= --}}
                {{--  ตารางเลือกฟอร์มเพื่อทำ Cash Advance (เฉพาะ exdata = 19)        --}}
                {{-- ================================================================= --}}
                @if ($exdata == '19')
                    @php  
                        $sum_cost = 0; 
                    @endphp
                    <h3 class="text-lg mb-3 font-bold text-blue-800 flex items-center gap-3">
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-md shadow-sm">
                            รายการฟอร์มที่อยู่ใน Group เดียวกัน
                        </span>
                    </h3>
                    <div class="border border-purple-300 bg-purple-50 rounded-xl shadow-sm overflow-hidden text-xs mb-6 p-3">
                        <table class="w-full table-auto text-xs">
                            <thead class="bg-purple-100 main-text w-48">
                                <tr>
                                    <th class="p-3 main-text text-center w-48">FORMNO</th>
                                    <th class="p-3 main-text text-left">SUBJECT</th>
                                    <th class="p-3 main-text text-center w-20">TRAINEE</th>
                                    <th class="p-3 main-text text-center w-32">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($data_group as $row)
                                    @php
                                        $isReady = ($row->CSTEPST == '3');
                                        $statusText  = $isReady ? 'READY' : 'Wait for approve';
                                        $statusClass = $isReady ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
                                         if (in_array($data_head[0]->FID, [1,3,4])) {
                                            $sum_cost += $row->COST;
                                        } elseif (in_array($data_head[0]->FID, [2,5])) {
                                            $sum_cost += $row->COST_PERSON;
                                        }
                                    @endphp

                                    <tr data-nfrmno="{{$row->NFRMNO}}" data-vorgno="{{$row->VORGNO}}" data-cyear="{{$row->CYEAR}}" data-cyear2="{{$row->CYEAR2}}" data-nrunno="{{$row->NRUNNO}}" class="cash-row {{$isReady?'bg-white hover:bg-purple-50':'bg-gray-100' }}" data-status="{{ $isReady ? 'READY' : 'WAIT' }}">
                                       <td class="border p-3 whitespace-nowrap">
                                            @php
                                                $url = site_url("gpform/GP-TRN/training?no={$row->NFRMNO}&orgNo={$row->VORGNO}&y={$row->CYEAR}&y2={$row->CYEAR2}&runNo={$row->NRUNNO}");
                                            @endphp
                                            <a href="{{ $url }}" target="_blank"
                                                class="px-3 py-1 inline-flex items-center
                                                    bg-gradient-to-r from-blue-50 to-purple-50
                                                    border border-blue-200 rounded-md font-semibold
                                                    text-blue-700 hover:bg-blue-100">
                                                <i class="bi bi-link-45deg text-blue-600 mr-1"></i>
                                                {{ $row->FORMNO }}
                                            </a>
                                        </td>

                                        <td class="border p-3 value-text">{{ $row->SUBJECT }}</td>
                                        <td class="border p-3 value-sp-text whitespace-nowrap max-w-xs truncate">  {{ "(".$row->SEMPNO.") ".$row->STNAME }}</td>
                                        <td class="border p-3 text-center {{ $statusClass }}">{{ $statusText }} </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    <input type="hidden" name="txt_sumcost"  id="txt_sumcost" class="input input-bordered w-20 mb-2" value=' {{ $sum_cost }}' >
                

                <div id="cashAdvSection" class="mb-5 rounded-xl border border-emerald-300 p-4 shadow-sm"  style="background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 45%, #bbf7d0 100%) !important;">
                    <div class="mb-4 flex items-center gap-3">
                        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-2xl text-white shadow">💰</div>
                        <div>
                            <div class="text-2xl font-extrabold text-emerald-800">
                                ข้อมูลสำหรับ Form Cash Advance
                            </div>
                            <div class="text-xs text-emerald-700 opacity-80">
                                กรุณากรอกข้อมูลและแนบเอกสารประกอบ
                            </div>
                        </div>
                    </div>

                    <!-- Effective Date -->
                    <div class="mb-3 flex items-center gap-3">
                        <div class="flex min-w-[190px] items-center gap-2 rounded-xl bg-emerald-200 px-3 py-2 shadow-sm">
                            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base shadow">
                                📅
                            </div>
                            <label for="effectiveDate"
                                class="whitespace-nowrap text-base font-bold text-emerald-900">
                                Effective Date :
                            </label>
                        </div>

                        <input type="date" id="effectiveDate"
                            class="input input-bordered h-[46px] w-[320px] rounded-xl border-emerald-300 bg-white text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            data-alert="กรุณาเลือก Effective Date สำหรับ Form Cash Advance !!" maxlength="8">
                    </div>

                    <!-- Attachment -->
                    <div class="flex items-center gap-3">
                        <div class="flex min-w-[190px] items-center gap-2 rounded-xl bg-emerald-200 px-3 py-2 shadow-sm">
                            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base shadow"> 📎</div>
                            <label for="cashAdvFiles" class="whitespace-nowrap text-base font-bold text-emerald-900"> Attachment :</label>
                        </div>

                        <input type="file" id="cashAdvFiles" name="cashAdvFiles[]"
                            class="file-input file-input-bordered h-[46px] flex-1 rounded-xl border-emerald-300 bg-white text-sm shadow-sm"
                            multiple  data-alert="กรุณาแนบไฟล์สำหรับ Form Cash Advance !!">
                    </div>
                </div>
            @endif

            
                <div class="flex justify-center gap-12">
                    {{-- ปุ่มสำหรับ Cash Advance --}}
                    <button type="button" id="btnApprove_fin"
                        class="btn-last-submit px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                        data-action="approve">
                        ✅ Approve  ✅
                    </button>


                    {{-- ปุ่มปกติ --}}
                    <button type="button" id="btn-submit"
                        class="btn-submit px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                        data-action="approve">
                        ✅ Approve
                    </button>


                    <button type="button" class="btn-submit px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
                        data-action="reject">
                        ❌ Reject
                    </button>
                    
                    @if ( ( in_array($data_head[0]->FID, [1, 5]) && in_array($exdata, [10, 13])) || ( in_array($data_head[0]->FID, [2, 3, 4]) && in_array($exdata, ['01', '02', 10])))
                        <button type="button" class="btn-submit px-6 py-3 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600" data-action="returnE">
                            ↩ Return
                        </button>
                    @endif
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
            <div class="flow mt-6" ></div>
        </div>

        <div >
            Cyear2 :
            <input type="text" name="txt_year_text"  id="txt_year_text" class="input input-bordered w-20 mb-2" value="{{ $CYEAR2 }}" maxlength='4'>
            Formno :
            <input type="text" name="txt_form_text"  id="txt_form_text" class="input input-bordered w-20 mb-2" value="{{ $NRUNNO }}" maxlength='3'>

            Empno for approve :
            <input type="text" name="txt_emp_text"  id="txt_emp_text"  class="input input-bordered w-20 mb-2" maxlength='5' value="{{ $EMPNO }}">
            <button type="button" class="btn-test-submit px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" data-action="approve">✅ TEST Approve</button>
        </div>
    </form>
</div>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/view_train.js?ver={{ $GLOBALS['version'] }}"></script>             
@endsection