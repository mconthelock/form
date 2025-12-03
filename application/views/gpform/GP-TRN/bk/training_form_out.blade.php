<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ในประเทศ <br>
        สนับสนุน ขอศึกษาดูงานนอกสถานที่ (Support Outside Learning)
    </h2>

    <!-- Input / Request By -->
    <div class="flex items-center gap-8 mb-4">
        <div class="flex items-center gap-2">
            <label for="outInputBy" class="text-sm font-bold text-gray-700 whitespace-nowrap">
                Input By
            </label>
            <input type="text" id="outInputBy" name="outInputBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัสพนักงาน" maxlength="5" value="{{ $EMPNO ?? '' }}" readonly>
            <span class="font-semibold text-blue-600">
                {{ $emp_detail[0]->SNAME ?? '' }}
            </span>
        </div>

        <div class="flex items-center gap-2">
            <label for="outRequestBy" class="text-sm font-bold text-gray-700 whitespace-nowrap">
                Request By
            </label>
            <input type="text" id="outRequestBy" name="outRequestBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัสพนักงาน" maxlength="5"
                data-alert="กรุณากรอก Request By (รหัสพนักงาน) !!">
            <span id="outRequestByName" class="font-semibold text-blue-600"></span>
        </div>
    </div>

    <!-- Part 1 -->
    <div class="mb-6" id="out_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม (Training Subject & Training Schedule)</h3>
        <input type="text" id="outTrainingSubject"
            placeholder="1.1 หัวข้อฝึกอบรม" maxlength="200"
            class="input input-bordered w-full mb-2"
            data-alert="กรุณากรอกหัวข้อฝึกอบรม">
        <div class="flex gap-2 mb-2 items-center">
            <span class="self-center font-bold">วันที่</span>
            <input type="date" id="outDateFrom" class="input input-bordered w-[200px]" maxlength="8" data-alert="กรุณาเลือกวันที่อบรม">
            <span class="self-center">ถึง</span>
            <input type="date" id="outDateTo" class="input input-bordered w-[200px]" maxlength="8" data-alert="กรุณาเลือกวันที่อบรม">

            <div class="flex items-center gap-2 justify-end">
                <span class="self-center font-bold ml-[30px]">เวลา</span>
                <select id="outTimeFromHour" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">:</span>
                <select id="outTimeFromMin" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">ถึง</span>
                <select id="outTimeToHour" class="input input-bordered w-20 text-center"></select>
                <span class="self-center">:</span>
                <select id="outTimeToMin" class="input input-bordered w-20 text-center"></select>
            </div>
        </div>
        <input type="text" id="outLocation" placeholder="1.3 สถานที่"
            class="input input-bordered w-full mb-2" maxlength="200"
            data-alert="กรุณาระบุสถานที่">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="out_part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : วัตถุประสงค์ของการฝึกอบรม (Training Objective)</h3>
        <div id="outObjectiveList" class="space-y-2">
            <div class="flex items-center gap-2 objective-item">
                <input type="text" name="outObjective[]"
                    placeholder="ระบุวัตถุประสงค์..." maxlength="200"
                    class="input input-bordered w-full"
                    data-alert="กรุณากรอกวัตถุประสงค์">
                <button type="button" class="btn btn-sm bg-green-500 text-white add-objective">+</button>
            </div>
        </div>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="out_part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : ความคาดหวัง / ประโยชน์</h3>
        <div id="outExpectationList" class="space-y-2">
            <div class="flex items-center gap-2 expectation-item">
                <input type="text" name="outExpectation[]"
                    placeholder="ระบุความคาดหวัง / ประโยชน์..." maxlength="200"
                    class="input input-bordered w-full"
                    data-alert="กรุณากรอกความคาดหวัง/ประโยชน์">
                <button type="button" class="btn btn-sm bg-green-500 text-white add-expectation">+</button>
            </div>
        </div>
    </div>

    <!-- Part 4 -->
    <div class="mb-6" id="out_part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ข้อมูลผู้ขอศึกษาดูงานนอกสถานที่</h3>
        <div class="grid grid-cols-2 gap-4 mb-3">
            <input type="text" id="outTraineeCode" placeholder="รหัสพนักงาน (Code)"
                class="input input-bordered w-full font-bold"
                maxlength="5"
                data-alert="กรุณากรอกรหัสผู้เข้าอบรม">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-3">
            <input type="text" id="outTraineeName" placeholder="ชื่อ - นามสกุล"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="outTraineePosition" placeholder="ตำแหน่ง (Position)"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-3">
            <input type="text" id="outTraineeSec" placeholder="Section"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="outTraineeDept" placeholder="Department"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
            <input type="text" id="outTraineeDiv" placeholder="Division"
                class="input input-bordered w-full text-blue-600 font-bold" readonly>
        </div>
    </div>


    <!-- Part 5 -->
    <div class="mb-6" id="out_part7">
    <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : หมายเหตุ (Remark)</h3>
    
    <!-- ช่องกรอกเพิ่มเติม -->
    <textarea id="outRemark" 
                class="textarea textarea-bordered w-full mb-3" 
                rows="2" maxlength="200"
                placeholder="หมายเหตุเพิ่มเติม..."></textarea>

    <!-- กล่องหมายเหตุ -->
    <div class="p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-xs leading-relaxed">
        <p>
        <b>5.1)</b> ภายหลังเอกสารนี้ ได้รับอนุมัติจาก RAF Div. แล้ว ผู้ขอศึกษาดูงาน หรือ หน่วยงานต้นสังกัด จะต้องเป็นผู้ขออนุญาตใช้รถบริษัทฯ เพื่อการเดินทาง 
        <br>
        <i>(After approved by RAF Div., HRD Sect. has responsible for request company car for traveling)</i>
        </p>
    </div>
    </div>



    <!-- Buttons -->
    <div class="flex justify-between mt-6">
        <button type="button" id="backBtn_out"
            class="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
            ← Back to Menu
        </button>
        <button type="button" id="sendOutFormBtn"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            📤 Send Form
        </button>
    </div>
</div>
