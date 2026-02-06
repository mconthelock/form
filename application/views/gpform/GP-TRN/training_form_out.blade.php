<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ในประเทศ <br>
        สนับสนุน การศึกษาดูงานนอกสถานที่ (Support Outside Learning)
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
    </div>

    <!-- Part 1 -->
    <div class="mb-6" id="out_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อ และ กำหนดการศึกษาดูงาน (Training Learning Subject & Schedule)<b style="color:red">*</b></h3>
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
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : วัตถุประสงค์ของการศึกษาดูงาน (Outside Learning Objective)<b style="color:red">*</b></h3>
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
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : ความคาดหวัง / ประโยชน์ <b style="color:red">*</b></h3>
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

    <!-- Part 4  new-->
    <div class="mb-6" id="out_part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ข้อมูลผู้ขอศึกษาดูงานนอกสถานที่ <b style="color:red">*</b></h3>
        <table class="table-auto border border-gray-300 text-xs w-full text-center" id="out_participants">
            <thead class="bg-gray-100 text-sm">
                <tr>
                    <th class="border">#</th>
                    <th class="border">Emp No</th>
                    <th class="border">ชื่อ - นามสกุล</th>
                    <th class="border">ตำแหน่ง</th>
                    <th class="border">Section</th>
                    <th class="border">Department</th>
                    <th class="border">Division</th>
                    <th class="border">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr class="participant-row">
                    <td class="row-index border">1</td>
                    <td class="border">
                        <input type="text" name="outTraineecode[]"
                            class="input input-bordered input-sm w-20 text-center outTraineecode-input"
                            maxlength="5" placeholder="รหัส">
                        <input type="hidden" name="outTraineeposcode[]" value="">
                    </td>
                    <td class="emp-name border text-blue-600 font-bold"></td>
                    <td class="emp-pos border text-blue-600 font-bold"></td>
                    <td class="emp-sec border text-blue-600 font-bold"></td>
                    <td class="emp-dept border text-blue-600 font-bold"></td>
                    <td class="emp-div border text-blue-600 font-bold"></td>
                    <td class="border">
                        <button type="button" class="btn btn-xs btn-error remove-out-row">ลบ</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <button type="button" id="add-out-participant" class="btn btn-primary btn-sm mt-2">+ เพิ่มผู้เข้าอบรม</button>

    </div>


    <!-- Part 5 -->
    <div class="mb-6" id="out_part7">
    <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : หมายเหตุ (Remark)</h3>
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
