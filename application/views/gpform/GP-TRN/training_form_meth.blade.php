<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ต่างประเทศ <br>
        (Support ME-TH Training Subject)
    </h2>

    <!-- Input / Request By -->
    <div class="flex items-center gap-8 mb-4">
        <div class="flex items-center gap-2">
            <label for="methInputBy" class="text-sm font-bold text-gray-700 whitespace-nowrap">
                Input By
            </label>
            <input type="text" id="methInputBy" name="methInputBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัส" maxlength="5" value="{{ $EMPNO ?? '' }}" readonly>
            <span class="font-semibold text-blue-600">
                {{ $emp_detail[0]->SNAME ?? '' }}
            </span>
        </div>

        <div class="flex items-center gap-2">
            <label for="methRequestBy" class="text-sm font-bold text-gray-700 whitespace-nowrap">
                Request By
            </label>
            <input type="text" id="methRequestBy" name="methRequestBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัส" maxlength="5">
            <span id="methRequestByName" class="font-semibold text-blue-600"></span>
        </div>
    </div>

    <!-- Part 1 -->
    <div class="mb-6" id="meth_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม</h3>
        <input type="text" id="methSubject" class="input input-bordered w-full mb-2" placeholder="1.1 หัวข้อฝึกอบรม">
        <div class="flex gap-2 mb-2 items-center">
            <input type="date" id="methDateFrom" class="input input-bordered">
            <span>ถึง</span>
            <input type="date" id="methDateTo" class="input input-bordered">
            <input type="time" id="methTimeFrom" class="input input-bordered">
            <span>ถึง</span>
            <input type="time" id="methTimeTo" class="input input-bordered">
        </div>
        <input type="text" id="methPlace" class="input input-bordered w-full mb-2" placeholder="1.3 สถานที่">
        <input type="text" id="methInstitute" class="input input-bordered w-full" placeholder="1.4 ชื่อสถาบันฝึกอบรม">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="meth_part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : วัตถุประสงค์การฝึกอบรม</h3>
        <div id="methObjectiveList" class="space-y-2">
            <div class="flex items-center gap-2 objective-item">
            <input type="text" name="methObjective[]" placeholder="ระบุวัตถุประสงค์..." class="input input-bordered w-full">
            <button type="button" class="btn btn-sm bg-green-500 text-white add-objective">+</button>
            </div>
        </div>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="meth_part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : ความคาดหวัง / ประโยชน์</h3>
        <div id="methExpectationList" class="space-y-2">
            <div class="flex items-center gap-2 expectation-item">
            <input type="text" name="methExpectation[]" placeholder="ระบุความคาดหวัง / ประโยชน์..." class="input input-bordered w-full">
            <button type="button" class="btn btn-sm bg-green-500 text-white add-expectation">+</button>
            </div>
        </div>
    </div>


    <!-- Remark -->
    <div class="mb-6 text-sm text-red-600">
        <b>Remark :</b>
        <p>
            แผนก HRD จะติดตามผลการฝึกอบรม ในมิติ "ระดับความสามารถ (Competency)" 
            และ "ผลลัพธ์จากความสามารถ (Working result)" ภายหลังฝึกอบรมครบ 3 เดือน
        </p>
        <p class="text-gray-600">
            (HRD Sect. will follow up training result in dimension "Competency level" 
            and "Working result of competency" after completed training 3 months)
        </p>
    </div>

    <!-- Part 4 -->
    <div class="mb-6" id="meth_part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ข้อมูลผู้เข้ารับการฝึกอบรม</h3>
        <div class="grid grid-cols-2 gap-4 mb-3">
            <input type="text" id="methCode" placeholder="รหัสพนักงาน (Code)" class="input input-bordered w-full">
            <input type="text" id="methName" placeholder="ชื่อ - นามสกุล" class="input input-bordered w-full" readonly>
            <input type="text" id="methPosition" placeholder="ตำแหน่ง (Position)" class="input input-bordered w-full" readonly>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-3">
            <input type="text" id="methSec" placeholder="Section" class="input input-bordered w-full" readonly>
            <input type="text" id="methDept" placeholder="Department" class="input input-bordered w-full" readonly>
            <input type="text" id="methDiv" placeholder="Division" class="input input-bordered w-full" readonly>
        </div>
    </div>

    <!-- Part 5 -->
    <div class="mb-6" id="meth_part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : การพิจารณาค่าใช้จ่ายฝึกอบรม</h3>
        <label class="block mb-2">
            <input type="radio" name="methExpenseOption" value="not_compare" class="mr-2">
            ไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม (Not compare training expense)
        </label>
        <div id="methReasonBox" class="ml-6 hidden">
            <label class="block mb-2">
                <input type="radio" name="methReason" value="free" class="mr-2">
                อบรมฟรี (Free of Charge) 
            </label>
            <label class="block mb-2">
                <input type="radio" name="methReason" value="other" class="mr-2">
                เหตุผลอื่น:
                <input type="text" id="methReasonText" class="input input-bordered ml-2 w-1/2">
            </label>
        </div>
        <label class="block mt-4">
            <input type="radio" name="methExpenseOption" value="compare" class="mr-2">
            มีการเปรียบเทียบราคา ค่าฝึกอบรม (Compared training expense)
        </label>
        <div id="methCompareUpload" class="ml-6 mt-2 hidden">
            <input type="file" id="methCompareFiles" class="file-input file-input-bordered w-full" multiple>
        </div>
    </div>

    <!-- Part 6 -->
    <div class="mb-6" id="meth_part6">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 6 : ค่าใช้จ่าย</h3>
        <div class="flex items-center gap-3 mb-2">
            <input type="number" id="methAmount" placeholder="จำนวนเงิน (บาท)" class="input input-bordered w-1/2">
            <span id="methVatResult" class="font-bold text-indigo-600 text-lg hidden whitespace-nowrap"></span>
        </div>
        <textarea id="methAmountNote" class="textarea textarea-bordered w-full" rows="2"
            placeholder="บันทึกเพิ่มเติม..."></textarea>
    </div>

    <!-- Part 7 -->
    <div class="mb-6" id="meth_part7">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 7 : หมายเหตุ</h3>
        <p class="text-sm text-gray-600 mb-2">
            ภายหลังเอกสารถูกเห็นชอบจาก RAF Div. และ HRD 
            ต้องดำเนินการใช้รถยนต์บริษัทเพื่อการเดินทาง
        </p>
    </div>

    <!-- Buttons -->
    <div class="flex justify-between mt-6">
        <button type="button" id="backBtn_meth"
            class="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
            ← กลับไปเลือกเมนู
        </button>
        <button type="button" id="sendMethFormBtn"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            📤 ส่งฟอร์ม
        </button>
    </div>
</div>
