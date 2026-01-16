<div class="min-h-[200px] bg-blue-50 py-6 px-4 flex flex-col items-center">
  <div class="bg-white w-full max-w-7xl rounded-2xl shadow-lg p-8 border">
    <h2 class="text-lg font-extrabold text-center text-indigo-700 mb-6">
      จัดการกลุ่มแบบฟอร์ม External Training
    </h2>

    <!-- Dropdown -->
    <div class="mb-6 flex items-center gap-4 w-full">
      <label class="block text-sm font-semibold text-gray-700 whitespace-nowrap">
        เลือกประเภทแบบฟอร์ม
      </label>

      <select id="ddlFormType"
        class="select select-bordered flex-1 text-sm">
        <option value="">-- เลือกประเภทแบบฟอร์ม --</option>
      </select>
    </div>

    <!-- Table -->
    <div id="groupContainer" class="mt-4 hidden">
      <div class="overflow-x-auto rounded-xl shadow">
        <table class="w-full text-sm border border-gray-300 rounded-lg mb-6" id="tableGroup">
       
          <thead class="bg-indigo-100 text-indigo-900">
            <tr>
              <th class="py-2 px-2 text-center w-10"> <input type="checkbox" id="chkAll"></th>
              <th class="py-2 px-3 text-left whitespace-nowrap w-32"> FORMNO</th>
              <th class="py-2 px-3 text-left whitespace-nowrap max-w-[240px] "> SUBJECT</th>
              <th class="py-2 px-3 text-left whitespace-nowrap w-32">DATE FROM </th>
              <th class="py-2 px-3 text-left whitespace-nowrap w-32"> DATE TO</th>
              <th class="py-2 px-3 text-left whitespace-nowrap max-w-[260px] truncate"> TRAINEE</th>
            </tr>
          </thead>
          <tbody id="tbodyGroup" class="divide-y">
            <!-- JS fill -->
          </tbody>

        </table>
      </div>

      <div class="mt-6 flex justify-between items-center">
          <!-- REMARK MESSAGE (ซ้ายมือ) -->
          <div class="text-sm md:text-base font-bold 
                      text-yellow-800 bg-yellow-200/70 
                      border-2 border-yellow-500 
                      px-4 py-3 rounded-xl shadow-md flex items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill text-yellow-700 text-lg"></i>
              หมายเหตุ: แสดงเฉพาะฟอร์มที่ยังไม่มีการ Set Group เท่านั้น
          </div>

          <button type="button" id="backBtn_grp"
            class="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
            ← Back to Menu
          </button>

          <!-- BUTTON (ขวามือ) -->
          <button id="btnUpdateGroup"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow">
            ✔ Update Group
          </button>
      </div>

    </div>
  </div>
</div>
