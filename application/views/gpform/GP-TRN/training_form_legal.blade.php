
<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ในประเทศ <br>
        สนับสนุน ข้อกำหนดกฎหมาย (Support Legal Requirement)
    </h2>

    <!-- Input By / Request By -->
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
    </div>

    <!-- Part 1 -->
    <div class="mb-6" id="legal_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม<b style="color:red">*</b></h3>
        <input type="text" id="legalTrainingSubject"
            placeholder="1.1 หัวข้อฝึกอบรม" maxlength="200"
            class="input input-bordered w-full mb-2"
            data-alert="กรุณากรอกหัวข้อฝึกอบรม">
        <div class="flex gap-2 mb-2 items-center">
            <span class="self-center font-bold">วันที่</span>
            <input type="date" id="legalDateFrom" class="input input-bordered w-[200px]" maxlength="8" data-alert="กรุณาเลือกวันที่อบรม">
            <span class="self-center">ถึง</span>
            <input type="date" id="legalDateTo" class="input input-bordered w-[200px]" maxlength="8" data-alert="กรุณาเลือกวันที่อบรม">

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
        <input type="text" id="legalLocation" placeholder="1.3 สถานที่"
            class="input input-bordered w-full mb-2" maxlength="200"
            data-alert="กรุณาระบุสถานที่">
        <input type="text" id="legalInstitute" placeholder="1.4 สถาบันฝึกอบรม"
            class="input input-bordered w-full" maxlength="200"
            data-alert="กรุณาระบุสถาบันฝึกอบรม">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="legal_part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : ชื่อกฎหมายที่เกี่ยวข้อง <b style="color:red">*</b></h3>
        <textarea id="legalConcernLaw" class="textarea textarea-bordered w-full" rows="3" maxlength="200"
            data-alert="กรุณาระบุชื่อกฎหมายที่เกี่ยวข้อง"></textarea>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="legal_part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : วัตถุประสงค์ <b style="color:red">*</b></h3>
        <div id="legalObjectiveList" class="space-y-2">
            <div class="flex items-center gap-2 objective-item">
                <input type="text" name="legalObjective[]"
                    placeholder="ระบุวัตถุประสงค์..." maxlength="200"
                    class="input input-bordered w-full"
                    data-alert="กรุณากรอกวัตถุประสงค์"> 
                <button type="button" class="btn btn-sm bg-green-500 text-white add-objective">+</button>
            </div>
        </div>
    </div>

    <!-- Part 4 -->
    <div class="mb-6" id="legal_part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ความคาดหวัง <b style="color:red">*</b></h3>
        <div id="legalExpectationList" class="space-y-2">
            <div class="flex items-center gap-2 expectation-item">
                <input type="text" name="legalExpectation[]"
                    placeholder="ระบุความคาดหวัง / ประโยชน์..." maxlength="200"
                    class="input input-bordered w-full"
                    data-alert="กรุณากรอกความคาดหวัง/ประโยชน์">
                <button type="button" class="btn btn-sm bg-green-500 text-white add-expectation">+</button>
            </div>
        </div>
    </div>

    <!-- Part 5 -->
    <div class="mb-6" id="legal_part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : ข้อมูลผู้เข้ารับการฝึกอบรม <b style="color:red">*</b></h3>
        <table class="table-auto border border-gray-300 text-xs w-full text-center" id="legal_participants">
            <thead class="bg-gray-100 text-sm">
                <tr>
                    <th class="border">#</th>
                    <th class="border">Emp No</th>
                    <th class="border">ชื่อ - นามสกุล</th>
                    <th class="border">ตำแหน่ง</th>
                    <th class="border">Section</th>
                    <th class="border">Department</th>
                    <th class="border">Division</th>
                    <th class="border">Cost</th>
                    <th class="border">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr class="participant-row">
                    <td class="row-index border">1</td>
                    <td class="border">
                        <input type="text" name="legalTraineecode[]"
                            class="input input-bordered input-sm w-20 text-center legalTraineecode-input"
                            maxlength="5" placeholder="รหัส">
                        <input type="hidden" name="legalTraineeposcode[]" value="">
                    </td>
                    <td class="emp-name border text-blue-600 font-bold"></td>
                    <td class="emp-pos border text-blue-600 font-bold"></td>
                    <td class="emp-sec border text-blue-600 font-bold"></td>
                    <td class="emp-dept border text-blue-600 font-bold"></td>
                    <td class="emp-div border text-blue-600 font-bold"></td>
                    <td class="border">
                        <input type="number" name="legalTraineecost[]"
                            class="input input-bordered input-sm w-20 text-center legalTraineecost-input"
                             placeholder="ค่าใช้จ่าย">
                    </td>
                    <td class="border">
                        <button type="button" class="btn btn-xs btn-error remove-legal-row">ลบ</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <button type="button" id="add-participant" class="btn btn-primary btn-sm mt-2">+ เพิ่มผู้เข้าอบรม</button>
    </div>

    <!-- Part 6 -->
    <div class="mb-6" id="legal_part6">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 6 : การพิจารณาค่าฝึกอบรม <b style="color:red">*</b></h3>
        <label class="block mb-2">
            <input type="radio" name="legalExpenseOption" value="0" class="mr-2">
            ไม่มีการเปรียบเทียบราคา
        </label>
        <div id="legalReasonBox" class="ml-6 hidden">
            <label class="block mb-2">
                <input type="radio" name="legalReason" value="1" class="mr-2"> อบรมฟรี
            </label>
            <label class="block mb-2">
                <input type="radio" name="legalReason" value="0" class="mr-2"> เหตุผลอื่น:
                <input type="text" id="legalReasonOtherText" class="input input-bordered ml-2 w-1/2" maxlength="200"
                    data-alert="กรุณาระบุเหตุผลอื่น">
            </label>
        </div>
        <label class="block mt-4">
            <input type="radio" name="legalExpenseOption" value="1" class="mr-2">
            มีการเปรียบเทียบราคา
        </label>
        <div id="legalCompareUpload" class="ml-6 mt-2 hidden">
            <input type="file" id="legalCompareFiles" name="legalCompareFiles[]"
                class="file-input file-input-bordered w-full" multiple
                data-alert="กรุณาแนบไฟล์เปรียบเทียบราคา">
        </div>
    </div>

    <!-- Part 7 -->
    <div class="mb-6" id="legal_part7">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 7 : ค่าใช้จ่ายในการฝึกอบรม </h3>
        <div class="flex items-center gap-3 mb-2">
            <input type="number" id="legalAmountInput" name="legalAmountInput"  min="0"
                class="input input-bordered w-1/2"  value="0" readonly
                data-alert="กรุณากรอกจำนวนเงิน">
            <span id="legalVatResult" class="font-bold text-indigo-600 text-lg hidden whitespace-nowrap"></span>
        </div>
        <textarea id="legalAmountNote" class="textarea textarea-bordered w-full" maxlength="200" rows="2" placeholder="บันทึกเพิ่มเติม..."></textarea>
    </div>

    <!-- Part 8 -->
    <div class="mb-6" id="legal_part8">
    <h3 class="font-bold text-lg mb-2">ส่วนที่ 8 : หมายเหตุ (Remark)</h3>
    <div class="flex items-center gap-3 mb-3">
            <label for="legalOtherFiles" class="font-semibold text-gray-700 whitespace-nowrap">
            แนบเอกสารเพิ่มเติม:
            </label>
            <input type="file"
                id="legalOtherFiles"
                name="legalOtherFiles[]"
                class="file-input file-input-bordered flex-1"
                multiple>
        </div>
    <!-- ช่องกรอกเพิ่มเติม -->
    <textarea id="legalRemark" 
                class="textarea textarea-bordered w-full mb-3" 
                rows="2"  maxlength="200"
                placeholder="หมายเหตุเพิ่มเติม..."></textarea>

        <!-- กล่องคำเตือน -->
        <div class="p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-xs leading-relaxed space-y-2">
            <p>
            <b>8.1)</b> หน่วยงานที่รับผิดชอบกฎหมาย จะต้องคัดกรองคุณสมบัติของผู้เข้ารับการฝึกอบรม 
            เช่น วุฒิการศึกษา, ประสบการณ์, ภาวะสุขภาพ เป็นต้น ให้เรียบร้อย 
            ก่อนแจ้งรายชื่อให้กับแผนก HRD  
            <br>
            <i>(Any Section who has responsible for the law have to complete screening participant qualification 
            such as Education, Experience, Health Condition, etc. before inform participant name list to HRD Section.)</i>
            </p>

            <p>
            <b>8.2)</b> ภายหลังเอกสารนี้ ได้รับอนุมัติจาก RAF Div. เรียบร้อยแล้ว 
            แผนก HRD จะเป็นผู้ขออนุญาตใช้รถบริษัทฯ เพื่อการเดินทาง  
            <br>
            <i>(After approved by RAF Div., HRD Sect. has responsible for request company car for traveling)</i>
            </p>
        </div>
    </div>



    <!-- ปุ่ม -->
    <div class="flex justify-between mt-6">
        <button type="button" id="backBtn_legal"
            class="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
            ← Back to Menu
        </button>
        <button type="button" id="sendLegalFormBtn"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            📤 Send Form
        </button>
    </div>
</div>

