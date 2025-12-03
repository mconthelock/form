<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ในประเทศ <br>
        สนับสนุน หัวข้อฝึกอบรมของ ME-TH (Support ME-TH Training subject)
    </h2>

    <!-- Input / Request By -->
    <div class="flex items-center gap-8 mb-4">
        <div class="flex items-center gap-2">
            <label for="methInputBy" class="text-sm font-bold text-gray-700 whitespace-nowrap">
                Input By
            </label>
            <input type="text" id="methInputBy" name="methInputBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัสพนักงาน" maxlength="5" value="{{ $EMPNO ?? '' }}" readonly>
            <span class="font-semibold text-blue-600">
                {{ $emp_detail[0]->SNAME ?? '' }}
            </span>
        </div>

    </div>

    <!-- Part 1 -->
    <div class="mb-6" id="meth_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม (Training Subject & Training Schedule)</h3>
        <input type="text" id="methTrainingSubject"
            placeholder="1.1 หัวข้อฝึกอบรม" maxlength="200"
            class="input input-bordered w-full mb-2"
            data-alert="กรุณากรอกหัวข้อฝึกอบรม">
        <div class="flex gap-2 mb-2 items-center">
            <span class="self-center font-bold">วันที่</span>
            <input type="date" id="methDateFrom" maxlength="8" class="input input-bordered w-[200px]" data-alert="กรุณาเลือกวันที่อบรม">
            <span class="self-center">ถึง</span>
            <input type="date" id="methDateTo" maxlength="8" class="input input-bordered w-[200px]" data-alert="กรุณาเลือกวันที่อบรม">

            <div class="flex items-center gap-2 justify-end">
                <span class="self-center font-bold ml-[30px]">เวลา</span>
                <select id="methTimeFromHour" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">:</span>
                <select id="methTimeFromMin" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">ถึง</span>
                <select id="methTimeToHour" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">:</span>
                <select id="methTimeToMin" class="input input-bordered w-20 text-center"></select>
            </div>
        </div>
        <input type="text" id="methLocation" placeholder="1.3 สถานที่"
            class="input input-bordered w-full mb-2" maxlength="200"
            data-alert="กรุณาระบุสถานที่">
        <input type="text" id="methInstitute" placeholder="1.4 สถาบันฝึกอบรม"
            class="input input-bordered w-full" maxlength="200"
            data-alert="กรุณาระบุสถาบัน">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="meth_part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : วัตถุประสงค์ของการฝึกอบรม (Training Objective)</h3>
        <div id="methObjectiveList" class="space-y-2">
            <div class="flex items-center gap-2 objective-item">
                <input type="text" name="methObjective[]"
                    placeholder="ระบุวัตถุประสงค์..." maxlength="200"
                    class="input input-bordered w-full"
                    data-alert="กรุณากรอกวัตถุประสงค์">
                <button type="button" class="btn btn-sm bg-green-500 text-white add-objective">+</button>
            </div>
        </div>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="meth_part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : ความคาดหวัง / ประโยชน์</h3>
        <div id="methExpectationList" class="space-y-2">
            <div class="flex items-center gap-2 expectation-item">
                <input type="text" name="methExpectation[]"
                    placeholder="ระบุความคาดหวัง / ประโยชน์..." maxlength="200"
                    class="input input-bordered w-full"
                    data-alert="กรุณากรอกความคาดหวัง/ประโยชน์">
                <button type="button" class="btn btn-sm bg-green-500 text-white add-expectation">+</button>
            </div>
        </div>
    </div>

    <!-- Part 4 -->
    <div class="mb-6" id="meth_part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ข้อมูลผู้เข้ารับการฝึกอบรม</h3>
        <div class="grid grid-cols-2 gap-4 mb-3">
            <input type="text" id="methTraineeCode" placeholder="รหัสพนักงาน (Code)"
                class="input input-bordered w-full font-bold"
                maxlength="5"
                data-alert="กรุณากรอกรหัสผู้เข้าอบรม">
                <input type="hidden" name="methTraineeposcode" value="">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-3">
            <input type="text" id="methTraineeName" placeholder="ชื่อ - นามสกุล"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="methTraineePosition" placeholder="ตำแหน่ง (Position)"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-3">
            <input type="text" id="methTraineeSec" placeholder="Section"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="methTraineeDept" placeholder="Department"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="methTraineeDiv" placeholder="Division"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
        </div>
    </div>

    <!-- Part 5 -->
    <div class="mb-6" id="meth_part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : การพิจารณาค่าฝึกอบรม</h3>
        <label class="block mb-2">
            <input type="radio" name="methExpenseOption" value="0" class="mr-2">
            ไม่มีการเปรียบเทียบราคา
        </label>
        <div id="methReasonBox" class="ml-6 hidden">
            <label class="block mb-2">
                <input type="radio" name="methReason" value="1" class="mr-2">
                อบรมฟรี
            </label>
            <label class="block mb-2">
                <input type="radio" name="methReason" value="0" class="mr-2"> เหตุผลอื่น:
                <input type="text" id="methReasonOtherText" class="input input-bordered ml-2 w-1/2" maxlength="200"
                    data-alert="กรุณาระบุเหตุผลอื่น">
            </label>
        </div>
        <label class="block mt-4">
            <input type="radio" name="methExpenseOption" value="1" class="mr-2">
            มีการเปรียบเทียบราคา
        </label>
        <div id="methCompareUpload" class="ml-6 mt-2 hidden">
            <input type="file" id="methCompareFiles" name="methCompareFiles[]"
                class="file-input file-input-bordered w-full" multiple
                data-alert="กรุณาแนบไฟล์เปรียบเทียบราคา">
        </div>
    </div>

    <!-- Part 6 -->
    <div class="mb-6" id="meth_part6">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 6 : ค่าใช้จ่ายในการฝึกอบรม</h3>
        <div class="flex items-center gap-3 mb-2">
            <input type="number" id="methAmountInput" name="methAmountInput" placeholder="จำนวนเงิน (บาท)" min="0"
                class="input input-bordered w-1/2"
                data-alert="กรุณากรอกจำนวนเงิน">
            <span id="methVatResult" class="font-bold text-indigo-600 text-lg hidden whitespace-nowrap"></span>
        </div>
        <textarea id="methAmountNote" class="textarea textarea-bordered w-full" rows="2" maxlength="200" placeholder="บันทึกเพิ่มเติม..."></textarea>
    </div>

    <!-- Part 7 -->
    <div class="mb-6" id="meth_part7">
    <h3 class="font-bold text-lg mb-2">ส่วนที่ 7 : หมายเหตุ (Remark)</h3>
        <div class="flex items-center gap-3 mb-3">
            <label for="methOtherFiles" class="font-semibold text-gray-700 whitespace-nowrap">
            แนบเอกสารเพิ่มเติม:
            </label>
            <input type="file"
                id="methOtherFiles"
                name="methOtherFiles[]"
                class="file-input file-input-bordered flex-1"
                multiple>
        </div>
    
    <!-- ช่องกรอกเพิ่มเติม -->
    <textarea id="methRemark" 
                class="textarea textarea-bordered w-full mb-3" 
                rows="2"  maxlength="200"
                placeholder="หมายเหตุเพิ่มเติม..."></textarea>

    <!-- กล่องหมายเหตุ -->
    <div class="p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-xs leading-relaxed">
        <p>
        <b>7.1)</b> ภายหลังเอกสารนี้ ได้รับอนุมัติจาก RAF Div. เรียบร้อยแล้ว 
        แผนก HRD จะเป็นผู้ขออนุญาตใช้รถบริษัทฯ เพื่อการเดินทาง  
        <br>
        <i>(After approved by RAF Div., HRD Sect. has responsible for request company car for traveling)</i>
        </p>
    </div>
    </div>



    <!-- Buttons -->
    <div class="flex justify-between mt-6">
        <button type="button" id="backBtn_meth"
            class="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
            ← Back to Menu
        </button>
        <button type="button" id="sendMethFormBtn"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            📤 Send Form
        </button>
    </div>
</div>
