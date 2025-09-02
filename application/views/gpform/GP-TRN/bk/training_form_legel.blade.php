<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ต่างประเทศ <br>
        (Support Legal Requirement)
    </h2>

    <!-- Input By -->
    <div class="flex items-center gap-3 mb-4">
        <div>
            <label for="legalInputBy" class="block text-sm font-medium text-gray-700 mb-1">Input By</label>
            <input type="text" id="legalInputBy" name="legalInputBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัส" maxlength="5" value="{{ $EMPNO ?? '' }}">
        </div>
        <div class="mt-6 text-gray-800 font-semibold" style="color:blue">
            {{ $emp_detail[0]->SNAME ?? '' }}
        </div>
    </div>

    <!-- Request By -->
    <!-- Request By -->
    <div class="flex items-center gap-3 mb-4">
        <div>
            <label for="legalRequestBy" class="block text-sm font-medium text-gray-700 mb-1">Request By</label>
            <input type="text" id="legalRequestBy" name="legalRequestBy"
                class="input input-bordered w-24 text-center"
                placeholder="รหัส" maxlength="5">
        </div>
        <div id="legalRequestByName" class="mt-6 text-gray-800 font-semibold"></div>
    </div>



    <!-- Part 1 -->
    <div class="mb-6" id="legal_part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม</h3>
        <input type="text" id="legalSubject" name="legalSubject" placeholder="1.1 หัวข้อฝึกอบรม"
            class="input input-bordered w-full mb-2">
        <div class="flex gap-2 mb-2 items-center">
            <input type="date" id="legalDateFrom" class="input input-bordered">
            <span>ถึง</span>
            <input type="date" id="legalDateTo" class="input input-bordered">
            <input type="time" id="legalTimeFrom" class="input input-bordered">
            <span>ถึง</span>
            <input type="time" id="legalTimeTo" class="input input-bordered">
        </div>
        <input type="text" id="legalPlace" placeholder="1.3 สถานที่" class="input input-bordered w-full mb-2">
        <input type="text" id="legalInstitute" placeholder="1.4 ชื่อสถาบันฝึกอบรม" class="input input-bordered w-full">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="legal_part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : ข้อกฎหมายที่เกี่ยวข้อง</h3>
        <textarea id="legalConcernLaw" class="textarea textarea-bordered w-full" rows="3"
            placeholder="กรอกข้อกฎหมายที่เกี่ยวข้อง..."></textarea>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="legal_part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : วัตถุประสงค์การฝึกอบรม</h3>
        <textarea id="legalObjective" class="textarea textarea-bordered w-full" rows="3"
            placeholder="กรอกวัตถุประสงค์..."></textarea>
    </div>

    <!-- Part 4 -->
    <div class="mb-6" id="legal_part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ความคาดหวัง / ประโยชน์</h3>
        <textarea id="legalExpectation" class="textarea textarea-bordered w-full" rows="3"
            placeholder="กรอกความคาดหวัง / ประโยชน์ที่บริษัทจะได้รับ..."></textarea>
    </div>

    <!-- Part 5 -->
    <div class="mb-6" id="legal_part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : ข้อมูลผู้เข้ารับการฝึกอบรม</h3>
        <div class="grid grid-cols-2 gap-4 mb-3">
            <input type="text" id="legalName" placeholder="ชื่อ - นามสกุล" class="input input-bordered w-full">
            <input type="text" id="legalCode" placeholder="รหัส (Code)" class="input input-bordered w-full">
            <input type="text" id="legalPosition" placeholder="ตำแหน่ง (Position)" class="input input-bordered w-full">
        </div>
        <div class="grid grid-cols-3 gap-4 mb-3">
            <select id="legalSect" class="select select-bordered w-full">
                <option value="">เลือก Sect</option>
                @foreach($sects as $s)
                    <option value="{{ $s->SSECCODE }}">{{ $s->SSEC }}</option>
                @endforeach
            </select>
            <select id="legalDept" class="select select-bordered w-full">
                <option value="">เลือก Dept</option>
                @foreach($depts as $d)
                    <option value="{{ $d->SDEPCODE }}">{{ $d->SDEPT }}</option>
                @endforeach
            </select>
            <select id="legalDiv" class="select select-bordered w-full">
                <option value="">เลือก Div</option>
                @foreach($divs as $v)
                    <option value="{{ $v->SDIVCODE }}">{{ $v->SDIV }}</option>
                @endforeach
            </select>
        </div>
    </div>

    <!-- Part 6 -->
    <div class="mb-6" id="legal_part6">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 6 : การพิจารณาค่าใช้จ่ายฝึกอบรม</h3>

        <!-- ตัวเลือกหลัก -->
        <label class="block mb-2">
            <input type="radio" name="legalExpenseOption" value="not_compare" class="mr-2">
            ไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม (Not compare training expense)
        </label>
        <div id="legalReasonBox" class="ml-6 hidden">
            <label class="block mb-2">
                <input type="radio" name="legalReason" value="free" class="mr-2">
                อบรมฟรี (Free of Charge) → ซ่อน Part 7
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
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 7 : ค่าใช้จ่าย</h3>
        <div class="flex items-center gap-3 mb-2">
            <input type="number" id="legalAmount" placeholder="จำนวนเงิน (บาท)" class="input input-bordered w-1/2">
            <span id="legalVatResult" class="font-bold text-indigo-600 text-lg hidden whitespace-nowrap"></span>
        </div>
        <textarea id="legalAmountNote" class="textarea textarea-bordered w-full" rows="2"
            placeholder="บันทึกเพิ่มเติม..."></textarea>
    </div>

    <!-- Part 8 -->
    <div class="mb-6" id="legal_part8">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 8 : หมายเหตุ</h3>
        <p class="text-sm text-gray-600 mb-2">
            8.1 หน่วยงานที่รับผิดชอบกฎหมาย ต้องคัดกรองคุณสมบัติของผู้เข้ารับการฝึกอบรม เช่น คุณวุฒิการศึกษา,
            ประสบการณ์, ภาวะสุขภาพ ก่อนแจ้งรายชื่อผู้เข้าอบรมไปยัง HRD
        </p>
        <p class="text-sm text-gray-600">
            8.2 ภายหลังเอกสารถูกเห็นชอบจาก RAF Div. และ HRD ต้องดำเนินการใช้รถยนต์บริษัทเพื่อการเดินทาง
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
