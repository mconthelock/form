<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ในประเทศ <br>
        (Support Specific Functional Competency)
    </h2>

    <div class="flex items-center gap-8 mb-4">
        <!-- Input By -->
        <div class="flex items-center gap-2">
            <label for="funcInputBy" class="text-sm text-gray-700 whitespace-nowrap font-bold">
                Input By
            </label>
            <input type="text" id="funcInputBy" name="funcInputBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัสพนักงาน" maxlength="5" value="{{ $EMPNO ?? '' }}" readonly>
            <span class="font-semibold text-blue-600">
                {{ $emp_detail[0]->SNAME ?? '' }}
            </span>
        </div>

        <!-- Request By -->
        <div class="flex items-center gap-2">
            <label for="funcRequestBy" class="text-sm text-gray-700 whitespace-nowrap font-bold">
                Request By
            </label>
            <input type="text" id="funcRequestBy" name="funcRequestBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัสพนักงาน" maxlength="5"
                data-alert="กรุณากรอก Request By (รหัสพนักงาน) !!">
            <span id="funcRequestByName" class="font-semibold text-blue-600"></span>
        </div>
    </div>

    <!-- Part 1 -->
    <div class="mb-6" id="func_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม</h3>
        <input type="text" id="funcTrainingSubject"
            placeholder="1.1 หัวข้อฝึกอบรม"
            class="input input-bordered w-full mb-2"
            data-alert="กรุณากรอกหัวข้อฝึกอบรม">
        <div class="flex gap-2 mb-2 items-center">
            <span class="self-center font-bold">วันที่</span>
            <input type="date" id="funcDateFrom" class="input input-bordered w-[200px]" data-alert="กรุณาเลือกวันที่อบรม">
            <span class="self-center">ถึง</span>
            <input type="date" id="funcDateTo" class="input input-bordered w-[200px]" data-alert="กรุณาเลือกวันที่อบรม">

            <div class="flex items-center gap-2 justify-end">
                <span class="self-center font-bold ml-[30px]">เวลา</span>
                <select id="funcTimeFromHour" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">:</span>
                <select id="funcTimeFromMin" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">ถึง</span>
                <select id="funcTimeToHour" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">:</span>
                <select id="funcTimeToMin" class="input input-bordered w-20 text-center"></select>
            </div>
        </div>
        <input type="text" id="funcLocation"
            placeholder="1.3 สถานที่"
            class="input input-bordered w-full mb-2"
            data-alert="กรุณาระบุสถานที่">
        <input type="text" id="funcInstitute"
            placeholder="1.4 สถาบันฝึกอบรม"
            class="input input-bordered w-full"
            data-alert="กรุณาระบุสถาบันฝึกอบรม">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="func_part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : วัตถุประสงค์</h3>
        <div id="funcObjectiveList" class="space-y-2">
            <div class="flex items-center gap-2 objective-item">
                <input type="text" name="funcObjective[]"
                    placeholder="ระบุวัตถุประสงค์..."
                    class="input input-bordered w-full"
                    data-alert="กรุณากรอกวัตถุประสงค์">
                <button type="button" class="btn btn-sm bg-green-500 text-white add-objective">+</button>
            </div>
        </div>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="func_part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : ความคาดหวัง / ประโยชน์</h3>
        <div id="funcExpectationList" class="space-y-2">
            <div class="flex items-center gap-2 expectation-item">
                <input type="text" name="funcExpectation[]"
                    placeholder="ระบุความคาดหวัง / ประโยชน์..."
                    class="input input-bordered w-full"
                    data-alert="กรุณากรอกความคาดหวัง/ประโยชน์">
                <button type="button" class="btn btn-sm bg-green-500 text-white add-expectation">+</button>
            </div>
        </div>
    </div>

    <!-- Part 4 -->
    <div class="mb-6" id="func_part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ข้อมูลผู้เข้ารับการฝึกอบรม</h3>
        <div class="grid grid-cols-2 gap-4 mb-1">
            <input type="text" id="funcTraineeCode"
                placeholder="รหัสพนักงาน (Trainee Code)"
                class="input input-bordered w-64 text-center"
                maxlength="5"
                data-alert="กรุณากรอกรหัสผู้เข้าอบรม">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-1">
            <input type="text" id="funcTraineeName" class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="funcTraineePosition" class="input input-bordered w-full text-blue-600 font-bold" readonly>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-1">
            <input type="text" id="funcTraineeSec" class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="funcTraineeDept" class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="funcTraineeDiv" class="input input-bordered w-full text-blue-600 font-bold" readonly>
        </div>
        <input type="text" id="funcJdName"
            placeholder="ชื่อตาม JD"
            class="input input-bordered w-full mb-1 font-bold"
            data-alert="กรุณากรอก JD">
        <input type="file" id="funcJdFiles" name="funcJdFiles[]"
            class="file-input file-input-bordered w-full mb-1"
            multiple
            data-alert="กรุณาแนบไฟล์ JD">
        <textarea id="funcJdRelation"
            class="textarea textarea-bordered w-full font-bold"
            rows="3"
            placeholder="กรุณาอธิบายความสัมพันธ์ JD"
            data-alert="กรุณากรอกความสัมพันธ์ JD"></textarea>
    </div>

    <!-- Part 5 -->
    <div class="mb-6" id="func_part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : การพิจารณาค่าฝึกอบรม</h3>
        <label class="block mb-2">
            <input type="radio" name="funcExpenseOption" value="not_compare" class="mr-2">
            ไม่มีการเปรียบเทียบราคา
        </label>
        <div id="funcReasonBox" class="ml-6 hidden">
            <label class="block mb-2">
                <input type="radio" name="funcReason" value="free" class="mr-2">
                อบรมฟรี (Free of Charge)
            </label>
            <label class="block mb-2">
                <input type="radio" name="funcReason" value="other" class="mr-2">
                เหตุผลอื่น:
                <input type="text" id="funcReasonOtherText"
                    class="input input-bordered w-full"
                    placeholder="โปรดระบุเหตุผล"
                    data-alert="กรุณาระบุเหตุผลอื่น">
            </label>
        </div>
        <label class="block mt-4">
            <input type="radio" name="funcExpenseOption" value="compare" class="mr-2">
            มีการเปรียบเทียบราคา
        </label>
        <div id="funcCompareUpload" class="ml-6 mt-2 hidden">
            <input type="file" id="funcCompareFiles" name="funcCompareFiles[]"
                class="file-input file-input-bordered w-full" multiple>
        </div>
    </div>

    <!-- Part 6 -->
    <div id="func_part6" class="mb-6">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 6 : ค่าใช้จ่าย</h3>
        <div class="flex items-center gap-3 mb-2">
            <input type="number" id="funcAmountInput"
                placeholder="จำนวนเงิน (บาท)"
                min="0"
                class="input input-bordered w-1/2"
                data-alert="กรุณากรอกจำนวนเงิน">
            <span id="funcVatResult" class="font-bold text-indigo-600 text-lg hidden whitespace-nowrap"></span>
        </div>
        <textarea id="funcAmountNote" class="textarea textarea-bordered w-full" rows="2" placeholder="บันทึกเพิ่มเติม..."></textarea>
    </div>

    <!-- Part 7 -->
    <div class="mb-6" id="func_part7">
    <h3 class="font-bold text-lg mb-2">ส่วนที่ 7 : หมายเหตุ (Remark)</h3>
    
    <!-- ช่องกรอกเพิ่มเติม -->
    <textarea id="funcRemark" 
                class="textarea textarea-bordered w-full mb-3" 
                rows="2" 
                placeholder="หมายเหตุเพิ่มเติม..."></textarea>

    <!-- กล่องหมายเหตุ -->
    <div class="p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-xs leading-relaxed">
        <p>
        <b>7.1)</b> ภายหลังเอกสารนี้ ได้รับอนุมัติจาก RAF Div. แล้ว ผู้เข้ารับการฝึกอบรม หรือ หน่วยงานต้นสังกัด จะต้องเป็นผู้ขออนุญาตใช้รถบริษัทฯ เพื่อการเดินทาง
        <br>
        <i>(After approved by RAF Div., Participant or Direct Section have responsible for request company car for traveling) </i>
        </p>
    </div>
    </div>


    <!-- ปุ่ม -->
    <div class="flex justify-between mt-6">
        <button type="button" id="backBtn_func"
            class="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
            ← กลับไปเลือกเมนู
        </button>
        <button type="button" id="sendFuncFormBtn"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            📤 ส่งฟอร์ม
        </button>
    </div>
</div>
