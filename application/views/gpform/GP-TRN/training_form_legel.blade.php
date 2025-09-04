<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ต่างประเทศ <br>
        (Support Legal Requirement)
    </h2>

    <div class="flex items-center gap-8 mb-4">
        <!-- Input By -->
        <div class="flex items-center gap-2">
            <label for="legalInputBy" class="text-sm font-bold text-gray-700 whitespace-nowrap">
                Input By
            </label>
            <input type="text" id="legalInputBy" name="legalInputBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัสพนักงาน" maxlength="5" value="{{ $EMPNO ?? '' }}" readonly>
            <span class="font-semibold text-blue-600">
                 {{ $emp_detail[0]->SNAME ?? '' }}
            </span>
        </div>

        <!-- Request By -->
        <div class="flex items-center gap-2">
            <label for="legalRequestBy" class="text-sm font-bold text-gray-700 whitespace-nowrap">
                Request By
            </label>
            <input type="text" id="legalRequestBy" name="legalRequestBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัสพนักงาน" maxlength="5" data-alert="กรุณากรอก Request By (รหัสพนักงาน) !!">
            <span id="legalRequestByName" class="font-semibold text-blue-600"></span>
        </div>
    </div>


    <!-- Part 1 -->
    <div class="mb-6" id="legal_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม (Training Subject & Training Schedule)</h3>
        <input type="text" id="legalTrainingSubject" placeholder="1.1 หัวข้อฝึกอบรม" class="input input-bordered w-full mb-2">
        <div class="flex gap-2 mb-2 items-center">
            <span class="self-center font-bold">วันที่</span>
            <input type="date" id="legalDateFrom" class="input input-bordered w-[200px]" data-alert="กรุณาเลือกวันที่อบรม">
            <span class="self-center">ถึง</span>
            <input type="date" id="legalDateTo" class="input input-bordered w-[200px]" data-alert="กรุณาเลือกวันที่อบรม">

            <div class="flex items-center gap-2 justify-end">
                <span class="self-center font-bold ml-[30px]">เวลา</span>
                <select id="legalTimeFromHour" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">:</span>
                <select id="legalTimeFromMin" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">ถึง</span>
                <select id="legalTimeToHour" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">:</span>
                <select id="legalTimeToMin" class="input input-bordered w-20 text-center"></select>
            </div>

        </div>
        <input type="text" id="legalLocation" placeholder="1.3 สถานที่" class="input input-bordered w-full mb-2" data-alert="กรุณาระบุสถานที่">
        <input type="text" id="legalInstitute" placeholder="1.4 สถาบันฝึกอบรม" class="input input-bordered w-full" data-alert="กรุณาเลือกสถาบัน">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="legal_part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : ชื่อกฎหมายที่เกี่ยวข้อง (Concerned laws)</h3>
        <textarea id="legalConcernLaw" class="textarea textarea-bordered w-full" rows="3"
            placeholder="กรอกข้อกฎหมายที่เกี่ยวข้อง..."></textarea>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="legal_part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : วัตถุประสงค์ของการฝึกอบรม (Training Objective)</h3>
        <div id="legalObjectiveList" class="space-y-2">
            <div class="flex items-center gap-2 objective-item">
            <input type="text" name="legalObjective[]" placeholder="ระบุวัตถุประสงค์..." class="input input-bordered w-full">
            <button type="button" class="btn btn-sm bg-green-500 text-white add-objective">+</button>
            </div>
        </div>
    </div>

    <!-- Part 4 -->
    <div class="mb-6" id="legal_part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ความคาดหวัง / ประโยชน์ ต่อการดำเนินงานของบริษัทฯ จากการฝึกอบรมครั้งนี้ (Expectation / AMEC's Benefit from this training)</h3>
        <div id="legalExpectationList" class="space-y-2">
            <div class="flex items-center gap-2 expectation-item">
            <input type="text" name="legalExpectation[]" placeholder="ระบุความคาดหวัง / ประโยชน์..." class="input input-bordered w-full">
            <button type="button" class="btn btn-sm bg-green-500 text-white add-expectation">+</button>
            </div>
        </div>
    </div>
    
    <!-- Remark -->
    <div class="mb-6 text-sm text-red-600">
        <b>Remark :</b>
        <p>
            แผนก HRD จะติดตามผลการฝึกอบรม ในมิติ "ระดับความสามารถ (Competency)" และ "ผลลัพธ์จากความสามารถ (Working result)" ภายหลังฝึกอบรมครบ 3 เดือน
        </p>
        <p class="text-red-600">
            (HRD Sect. will follow up training result in dimension "Competency level"  and "Working result of competency" after completed training 3 months)
        </p>
    </div>

    <!-- Part 5 -->
    <div class="mb-6" id="legal_part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : ข้อมูลผู้เข้ารับการฝึกอบรม (Participant Information)</h3>
        <div class="grid grid-cols-2 gap-4 mb-1">
            <input type="text" id="legalCode" placeholder="รหัสพนักงาน (Trainee Code)" class="input input-bordered w-50 text-center" maxlength="5" data-alert="กรุณากรอกรหัสผู้เข้าอบรม">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-2">
            <input type="text" id="legalName"   placeholder="ชื่อ - นามสกุล"  class="input input-bordered w-full text-blue-600 font-bold"  readonly>
            <input type="text" id="legalPosition" placeholder="ตำแหน่ง (Position)" class="input input-bordered w-full text-blue-600 font-bold" readonly>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-3">
            <input type="text" id="legalSec" placeholder="Section"  class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="legalDept" placeholder="Department" class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="legalDiv" placeholder="Division"  class="input input-bordered w-full text-blue-600 font-bold"  readonly>
        </div>
    </div>

    <!-- Part 6 -->
    <div class="mb-6" id="legal_part6">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 6 : การพิจารณาค่าฝึกอบรม (Training expense consideration)</h3>

        <!-- ตัวเลือกหลัก -->
        <label class="block mb-2">
            <input type="radio" name="legalExpenseOption" value="not_compare" class="mr-2">
            ไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม (Not compare training expense)
        </label>
        <div id="legalReasonBox" class="ml-6 hidden">
            <label class="block mb-2">
                <input type="radio" name="legalReason" value="free" class="mr-2">
                อบรมฟรี (Free of Charge) 
            </label>
            <label class="block mb-2">
                <input type="radio" name="legalReason" value="other" class="mr-2">
                เหตุผลอื่น:
                <input type="text" id="legalReasonText" class="input input-bordered ml-2 w-1/2">
            </label>
        </div>

        <label class="block mt-4">
            <input type="radio" name="legalExpenseOption" value="compare" class="mr-2">
            มีการเปรียบเทียบราคา ค่าฝึกอบรม (Compared training expense) 
        </label>
        <div id="legalCompareUpload" class="ml-6 mt-2 hidden">
            <input type="file" id="legalCompareFiles" class="file-input file-input-bordered w-full" multiple>
        </div>
    </div>

    <!-- Part 7 -->
    <div class="mb-6" id="legal_part7">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 7 : ค่าใช้จ่ายในการฝึกอบรม (Training Expense)</h3>
        <div class="flex items-center gap-3 mb-2">
            <input type="number" id="legalAmount" placeholder="จำนวนเงิน (บาท)" min="0" class="input input-bordered w-1/2">
            <span id="legalVatResult" class="font-bold text-indigo-600 text-lg hidden whitespace-nowrap"></span>
        </div>
        <textarea id="legalAmountNote" class="textarea textarea-bordered w-full" rows="2"
            placeholder="บันทึกเพิ่มเติม..."></textarea>
    </div>

    <!-- Part 8 -->
    <div class="mb-6" id="legal_part8">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 8 : หมายเหตุ (Remark)</h3>
        <p class="text-sm text-gray-600 mb-2">
            8.1 หน่วยงานที่รับผิดชอบกฎหมาย ต้องคัดกรองคุณสมบัติของผู้เข้ารับการฝึกอบรม เช่น คุณวุฒิการศึกษา,
            ประสบการณ์, ภาวะสุขภาพ ก่อนแจ้งรายชื่อผู้เข้าอบรมไปยัง HRD
            (Any Section who has responsible for the law have to complete screening participant qualification such as Education, Experience, Health Condition, etc. before inform participant name list to HRD Section.)
        </p>
        <p class="text-sm text-gray-600">
            8.2 ภายหลังเอกสารถูกเห็นชอบจาก RAF Div. และ HRD ต้องดำเนินการใช้รถยนต์บริษัทเพื่อการเดินทาง 
            (After approved by RAF Div., HRD Sect. has responsible for request company car for traveling) 
        </p>
    </div>

    <!-- ปุ่ม -->
    <div class="flex justify-between mt-6">
        <button type="button" id="backBtn_legal"
            class="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
            ← กลับไปเลือกเมนู
        </button>

        <button type="button" id="sendLegalFormBtn"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            📤 ส่งฟอร์ม
        </button>
    </div>
</div>
