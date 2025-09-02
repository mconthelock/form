<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ต่างประเทศ <br>
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
                placeholder="รหัส" maxlength="5" value="{{ $EMPNO ?? '' }}" readonly>
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
                placeholder="รหัส" maxlength="5">
            <span id="funcRequestByName" class="font-semibold text-blue-600"></span>
        </div>
    </div>

    <!-- Part 1 -->
    <div class="mb-6" id="func_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม</h3>
        <input type="text" id="funcTrainingSubject" placeholder="1.1 หัวข้อฝึกอบรม" class="input input-bordered w-full mb-2">
        <div class="flex gap-2 mb-2 items-center">
            <span class="self-center font-bold">วันที่</span>
            <input type="date" id="funcDateFrom" class="input input-bordered w-[200px]">
            <span class="self-center">ถึง</span>
            <input type="date" id="funcDateTo" class="input input-bordered w-[200px]">

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
        <input type="text" id="funcLocation" placeholder="1.3 สถานที่" class="input input-bordered w-full mb-2">
        <input type="text" id="funcInstitute" placeholder="1.4 สถาบันฝึกอบรม" class="input input-bordered w-full">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="func_part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : วัตถุประสงค์การฝึกอบรม</h3>
        <div id="funcObjectiveList" class="space-y-2">
            <div class="flex items-center gap-2 objective-item">
            <input type="text" name="funcObjective[]" placeholder="ระบุวัตถุประสงค์..." class="input input-bordered w-full">
            <button type="button" class="btn btn-sm bg-green-500 text-white add-objective">+</button>
            </div>
        </div>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="func_part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : ความคาดหวัง / ประโยชน์</h3>
        <div id="funcExpectationList" class="space-y-2">
            <div class="flex items-center gap-2 expectation-item">
            <input type="text" name="funcExpectation[]" placeholder="ระบุความคาดหวัง / ประโยชน์..." class="input input-bordered w-full">
            <button type="button" class="btn btn-sm bg-green-500 text-white add-expectation">+</button>
            </div>
        </div>
    </div>


    <!-- Part 4 -->
    <div class="mb-6" id="func_part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ข้อมูลผู้เข้ารับการฝึกอบรม</h3>
        <div class="grid grid-cols-2 gap-4 mb-1">
            <input type="text" id="funcTraineeCode" placeholder="รหัสพนักงาน (Trainee Code)" class="input input-bordered w-50 text-center" maxlength="5">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-1">
            <input type="text" id="funcTraineeName"   placeholder="ชื่อ - นามสกุล"  class="input input-bordered w-full text-blue-600 font-bold"  readonly>
            <input type="text" id="funcTraineePosition" placeholder="ตำแหน่ง (Position)" class="input input-bordered w-full text-blue-600 font-bold" readonly>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-1">
            <input type="text" id="funcSec" placeholder="Section"  class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="funcDept" placeholder="Department" class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="funcDiv" placeholder="Division"  class="input input-bordered w-full text-blue-600 font-bold"  readonly>
        </div>

        <input type="text" id="funcJdName" placeholder="ชื่อตาม JD" class="input input-bordered w-full mb-1 font-bold">
        <input type="file" id="funcJdFiles" class="file-input file-input-bordered w-full mb-1" multiple>
        <textarea id="funcJdRelation" class="textarea textarea-bordered w-full font-bold" rows="3"placeholder="กรุณาอธิบาย ความสัมพันธ์ ระหว่าง JD และหัวข้อฝึกอบรมนี้"></textarea>
    </div>

    <!-- Part 5 -->
    <div class="mb-6" id="func_part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : การพิจารณาค่าใช้จ่ายฝึกอบรม</h3>

        <label class="block mb-2">
            <input type="radio" name="funcExpenseOption" value="not_compare" class="mr-2">
            ไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม (Not compare training expense)
        </label>

        <div id="funcReasonBox" class="ml-6 hidden">
            <label class="block mb-2">
                <input type="radio" name="funcReason" value="free" class="mr-2">
                อบรมฟรี (Free of Charge) 
            </label>
            <label class="block mb-2">
                <input type="radio" name="funcReason" value="other" class="mr-2">
                เหตุผลอื่น (Other reason):
                <input type="text" id="funcReasonOtherText" class="input input-bordered ml-2 w-1/2" placeholder="โปรดระบุเหตุผล">
            </label>
        </div>

        <label class="block mt-4">
            <input type="radio" name="funcExpenseOption" value="compare" class="mr-2">
            มีการเปรียบเทียบราคา ค่าฝึกอบรม (Compared training expense) 
        </label>

        <div id="funcCompareUpload" class="ml-6 mt-2 hidden">
            <input type="file" id="funcCompareFiles" class="file-input file-input-bordered w-full" multiple>
        </div>
    </div>

    <!-- Part 6 -->
    <div id="func_part6" class="mb-6">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 6 : ค่าใช้จ่าย</h3>
        <div class="flex items-center gap-3 mb-2">
            <input type="number" id="funcAmountInput" placeholder="จำนวนเงิน (บาท)" class="input input-bordered w-1/2">
            <span id="funcVatResult" class="font-bold text-indigo-600 text-lg hidden whitespace-nowrap"></span>
        </div>
        <textarea id="funcAmountNote" class="textarea textarea-bordered w-full" rows="2" placeholder="บันทึกเพิ่มเติม..."></textarea>
    </div>

    <!-- Part 7 -->
    <div class="mb-6" id="func_part7">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 7 : หมายเหตุ</h3>
        <textarea id="funcNote" class="textarea textarea-bordered w-full" rows="3" placeholder="ระบุหมายเหตุ..."></textarea>
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
