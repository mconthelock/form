<div class="max-w-5xl mx-auto bg-white p-8 mt-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ต่างประเทศ <br>
        (Support Specific Functional Competency)
    </h2>

    <!-- ===================== -->
    <!-- Input By / Request By -->
    <!-- ===================== -->
    <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
            <label for="inputBy" class="block text-sm font-medium text-gray-700 mb-1">Input By</label>
            <input type="text" id="txt_inp" class="input input-bordered w-full" placeholder="ระบุผู้บันทึก (Input By)" maxlength="5" value="{{ $EMPNO ?? '' }}"> 
        </div>
        <div>
            <label for="requestBy" class="block text-sm font-medium text-gray-700 mb-1">Request By</label>
            <input type="text" id="txt_req" class="input input-bordered w-full" placeholder="ระบุผู้ร้องขอ (Request By)" maxlength="5" >
        </div>
    </div>

    <!-- Part 1 -->
    <div class="mb-6" id="part1">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 1 : หัวข้อฝึกอบรม และ กำหนดการฝึกอบรม</h3>
        <input type="text" id="trainingSubject" placeholder="1.1 หัวข้อฝึกอบรม" class="input input-bordered w-full mb-2">
        <div class="flex gap-2 mb-2 items-center">
            <input type="date" id="dateFrom" class="input input-bordered">
            <span class="self-center">ถึง</span>
            <input type="date" id="dateTo" class="input input-bordered">
            <input type="time" id="timeFrom" class="input input-bordered">
            <span class="self-center">ถึง</span>
            <input type="time" id="timeTo" class="input input-bordered">
        </div>
        <input type="text" id="location" placeholder="1.3 สถานที่" class="input input-bordered w-full mb-2">
        <input type="text" id="institute" placeholder="1.4 สถาบันฝึกอบรม" class="input input-bordered w-full">
    </div>

    <!-- Part 2 -->
    <div class="mb-6" id="part2">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 2 : วัตถุประสงค์การฝึกอบรม</h3>
        <textarea id="objective" class="textarea textarea-bordered w-full" rows="3" placeholder="กรอกวัตถุประสงค์..."></textarea>
    </div>

    <!-- Part 3 -->
    <div class="mb-6" id="part3">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 3 : ความคาดหวัง / ประโยชน์</h3>
        <textarea id="expectation" class="textarea textarea-bordered w-full" rows="3" placeholder="กรอกความคาดหวังและประโยชน์..."></textarea>
    </div>

    <div>
        <b style="color:red">Remark :</b>
        <font style="color:red;font-size:11px">
            แผนก HRD จะติดตามผลการฝึกอบรม ในมิติ "ระดับความสามารถ (Competency)" และ "ผลลัพธ์จากความสามารถ (Working result)" ภายหลังฝึกอบรมครบ 3 เดือน <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            (HRD Sect. will follow up training result in dimension "Competency level" and "Working result of competency" after completed training 3 months)
        </font>
    </div>

    <!-- Part 4 -->
    <div class="mb-6" id="part4">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 4 : ข้อมูลผู้เข้ารับการฝึกอบรม</h3>
        <div class="grid grid-cols-2 gap-4 mb-3">
            <input type="text" id="traineeName" placeholder="ชื่อ - นามสกุล" class="input input-bordered w-full">
            <input type="text" id="traineeCode" placeholder="รหัส (Code)" class="input input-bordered w-full">
            <input type="text" id="traineePosition" placeholder="ตำแหน่ง (Position)" class="input input-bordered w-full">
        </div>
        <div class="grid grid-cols-3 gap-4 mb-3">
            <!-- Sect -->
            <select id="sect" name="sect" class="select select-bordered w-full">
                <option value="">เลือก Sect</option>
                @foreach($sects as $s)
                    <option value="{{ $s->SSECCODE }}">{{ $s->SSEC }}</option>
                @endforeach
            </select>

            <!-- Dept -->
            <select id="dept" name="dept" class="select select-bordered w-full">
                <option value="">เลือก Dept</option>
                @foreach($depts as $d)
                    <option value="{{ $d->SDEPCODE }}">{{ $d->SDEPT }}</option>
                @endforeach
            </select>

            <!-- Div -->
            <select id="div" name="div" class="select select-bordered w-full">
                <option value="">เลือก Div</option>
                @foreach($divs as $v)
                    <option value="{{ $v->SDIVCODE }}">{{ $v->SDIV }}</option>
                @endforeach
            </select>
        </div>
        <input type="text" id="jdName" placeholder="ชื่อตาม JD" class="input input-bordered w-full mb-3">
        <textarea id="jdRelation" class="textarea textarea-bordered w-full" rows="3"
            placeholder="กรุณาอธิบาย ความสัมพันธ์ ระหว่าง JD และหัวข้อฝึกอบรมนี้"></textarea>
    </div>

    <!-- Part 5 -->
    <div class="mb-6" id="part5">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 5 : การพิจารณาค่าใช้จ่ายฝึกอบรม</h3>

        <!-- ตัวเลือกหลัก -->
        <label class="block mb-2">
            <input type="radio" name="expense_option" value="not_compare" class="mr-2">
            ไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม (Not compare training expense)
        </label>

        <!-- เหตุผล กรณีไม่เปรียบเทียบราคา -->
        <div id="reasonBox" class="ml-6 hidden">
            <label class="block mb-2">
                <input type="radio" name="reason" value="free" class="mr-2">
                อบรมฟรี (Free of Charge) 
            </label>
            <label class="block mb-2">
                <input type="radio" name="reason" value="other" class="mr-2">
                เหตุผลอื่น (Other reason):
                <input type="text" id="reasonOtherText" class="input input-bordered ml-2 w-1/2" placeholder="โปรดระบุเหตุผล">
            </label>
        </div>

        <!-- ตัวเลือกเปรียบเทียบ -->
        <label class="block mt-4">
            <input type="radio" name="expense_option" value="compare" class="mr-2">
            มีการเปรียบเทียบราคา ค่าฝึกอบรม (Compared training expense) 
        </label>

        <!-- ช่องแนบไฟล์ กรณี compare -->
        <div id="compareUpload" class="ml-6 mt-2 hidden">
            <input type="file" id="compareFiles" class="file-input file-input-bordered w-full" multiple>
        </div>
    </div>

    <!-- Part 6 -->
    <div id="part6" class="mb-6">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 6 : ค่าใช้จ่าย</h3>
        <div class="flex items-center gap-3 mb-2">
            <!-- กล่อง input ครึ่งหนึ่ง -->
            <input type="number" id="amountInput" placeholder="จำนวนเงิน (บาท)" 
                class="input input-bordered w-1/2">

            <!-- แสดงผล VAT -->
            <span id="vatResult" 
                class="font-bold text-indigo-600 text-lg hidden whitespace-nowrap"></span>
        </div>

        <textarea id="amountNote" class="textarea textarea-bordered w-full" rows="2" placeholder="บันทึกเพิ่มเติม..."></textarea>
    </div>

    <!-- Part 7 -->
    <div class="mb-6" id="part7">
        <h3 class="font-bold text-lg mb-2">ส่วนที่ 7 : หมายเหตุ</h3>
        <textarea id="note" class="textarea textarea-bordered w-full" rows="3" placeholder="ระบุหมายเหตุ..."></textarea>
    </div>

    <!-- ปุ่ม -->
    <div class="flex justify-between mt-6">
        <button type="button" id="backBtn_functional"
            class="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
            ← กลับไปเลือกเมนู
        </button>

        <button type="button" id="sendFormBtn"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            📤 ส่งฟอร์ม
        </button>
    </div>
</div>
