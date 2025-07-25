@extends('layouts/webflowTemplate')
@section('styles')
<style>
  .active-tab {
    background-color: rgba(255, 255, 255, 0.5); /* โปร่งบาง */
    border-left-color: #2563eb;
    color: #1e40af;
    font-weight: 600;
  }
    /* ใช้ peer เพื่อจับสถานะ checked */
    input[type="checkbox"].checkbox-primary {
    /* transition สำหรับ animation */
    transition: all 0.3s ease;
  }

  /* ตอน hover ขยาย checkbox */
  input[type="checkbox"].checkbox-primary:hover {
    transform: scale(1.1);
  }

  /* ตอน checked เปลี่ยนสีเป็น gradient และโชว์เครื่องหมาย ✔ */
  input[type="checkbox"].checkbox-primary:checked {
    background: linear-gradient(90deg, #3b82f6, #6366f1); /* from blue-500 to indigo-600 */
    border-color: transparent;
    position: relative;
    color: white;
  }
  /* ซ่อนเครื่องหมาย ✔ โดย default */
  input[type="checkbox"].checkbox-primary:checked::after {
    content: "✔";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 14px;
    font-weight: bold;
    color: white;
  }
</style>
@endsection
@section('contents')
<!-- Tabs ด้านบน -->
<div class="w-full px-4 md:px-8 mt-10 mb-6">
  <div class="flex border-b border-blue-300 space-x-2 overflow-x-auto">
    <button class="px-4 py-3 text-sm font-medium text-blue-800 border-b-2 border-blue-600 bg-white rounded-t-xl shadow-sm active-tab" data-tab="tab1">Visit Arrangement</button>
    <button class="px-4 py-3 text-sm font-medium text-blue-800 border-b-2 border-transparent hover:border-blue-400 hover:bg-white/70 rounded-t-xl transition" data-tab="tab2">Schedule</button>
    <button class="px-4 py-3 text-sm font-medium text-blue-800 border-b-2 border-transparent hover:border-blue-400 hover:bg-white/70 rounded-t-xl transition" data-tab="tab3">หมายเหตุ</button>
  </div>
</div>
<div id="tab1" class="tab-pane w-full max-w-6xl mx-auto mt-8">
  <h2 class="text-2xl font-bold text-blue-900 mb-2">Visit Arrangement</h2>
  <p class="text-sm text-gray-600 mb-6">Please provide complete information to ensure smooth and efficient visit arrangements.</p>

  <div class="space-y-10">
    <!-- Section: Form & Documents -->
    <div>
      <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-6">Form & Documents</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="formVersion" class="block text-sm font-medium text-gray-700 mb-1">Form Version</label>
          <input type="text" id="formVersion" name="formVersion" placeholder="Enter form version" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
        </div>
        <div>
          <label for="formC1" class="block text-sm font-medium text-gray-700 mb-1">Form C1-1</label>
          <select id="formC1" name="formC1" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
            <option value="" disabled selected>-- Select --</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Section: Visit Details -->
    <div>
      <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-6">Visit Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1">
          <label for="visitDate" class="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
          <input type="date" id="visitDate" name="visitDate" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
        </div>
        <div class="md:col-span-1">
          <label for="receptionRoom" class="block text-sm font-medium text-gray-700 mb-1">Reception Room</label>
          <select id="receptionRoom" name="receptionRoom" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
            <option value="" disabled selected>-- Select Reception Room --</option>
            <option value="room1">Room 1</option>
            <option value="room2">Room 2</option>
            <option value="room3">Room 3</option>
          </select>
        </div>
        <div class="md:col-span-1">
          <label for="purposeOfVisit" class="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
          <input type="text" id="purposeOfVisit" name="purposeOfVisit" placeholder="Enter purpose of visit" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
        </div>
        <div>
          <label for="visitTypes" class="block text-sm font-medium text-gray-700 mb-1">Visit Types</label>
          <select id="visitTypes" name="visitTypes" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
            <option value="" disabled selected>-- Select Visit Type --</option>
            <option value="type1">Type 1</option>
            <option value="type2">Type 2</option>
          </select>
        </div>
        <div>
          <label for="guestType" class="block text-sm font-medium text-gray-700 mb-1">Guest Type</label>
          <select id="guestType" name="guestType" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
            <option value="" disabled selected>-- Select Guest Type --</option>
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
        </div>
        <div>
          <label for="specific" class="block text-sm font-medium text-gray-700 mb-1">Specific</label>
          <input type="text" id="specific" name="specific" placeholder="ระบุรายละเอียดเพิ่มเติม" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
        </div>
        <div class="md:col-span-3">
          <label for="specificAttachment" class="block text-sm font-medium text-gray-700 mb-1">Attachment Specific</label>
          <input type="file" id="specificAttachment" name="specificAttachment" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </div>

    <!-- Section: Travel & Accommodation -->
    <div>
      <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-6">Travel & Accommodation</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="hotelReservation" class="block text-sm font-medium text-gray-700 mb-1">Hotel Reservation</label>
          <input type="text" id="hotelReservation" name="hotelReservation" placeholder="Enter hotel reservation details" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
        </div>
        <div>
          <label for="carHotel" class="block text-sm font-medium text-gray-700 mb-1">Car Reservation Hotel</label>
          <select id="carHotel" name="carHotel" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
            <option value="" disabled selected>-- Select --</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Section: Meal Arrangement -->
    <div>
      <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-6">Meal Arrangement</h3>
      <div class="space-y-6">
        <div>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" id="hasLunch" class="w-5 h-5 rounded-lg checkbox checkbox-primary border-blue-200" />
            <span class="ml-2 text-sm text-gray-700 font-medium">Do you require Lunch arrangement?</span>
          </label>
          <div id="lunchDetails" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3 hidden">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lunch Location</label>
              <select class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
                <option value="">-- Select --</option>
                <option value="inside">Inside</option>
                <option value="outside">Outside</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Place</label>
              <input type="text" placeholder="e.g. Chonburi/Green grass Amata City Chonburi" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
            </div>
          </div>
        </div>
        <div>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" id="hasDinner" class="w-5 h-5 rounded-lg checkbox checkbox-primary border-blue-200" />
            <span class="ml-2 text-sm text-gray-700 font-medium">Do you require Dinner arrangement?</span>
          </label>
          <div id="dinnerDetails" class="mt-3 hidden">
            <label class="block text-sm font-medium text-gray-700 mb-1">Place</label>
            <input type="text" placeholder="e.g. Chonburi/Green grass Amata City Chonburi" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-4 border-t border-gray-200">
      <button class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
        <span>Save</span>
      </button>
    </div>
  </div>
</div>

  <!-- Tab2: Schedule -->
  <div id="tab2" class="tab-pane hidden w-full">
    <h2 class="text-2xl font-bold text-blue-900 mb-2">Schedule</h2>
    <p class="text-sm text-gray-600 mb-6">Please fill in the schedule of activities during the visit.</p>

    <div class="overflow-x-auto rounded-2xl border border-blue-200 shadow">
      <table class="min-w-full text-sm text-gray-800">
        <thead class="bg-blue-100 text-blue-800">
          <tr>
            <th class="px-4 py-3 text-left">Time Start</th>
            <th class="px-4 py-3 text-left">Time End</th>
            <th class="px-4 py-3 text-left">Duration</th>
            <th class="px-4 py-3 text-left">Place</th>
            <th class="px-4 py-3 text-left">Content</th>
            <th class="px-4 py-3 text-left">AMEC Participants</th>
            <th class="px-4 py-3 text-left">Note</th>
            <th class="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody id="scheduleTableBody" class="divide-y divide-blue-100">
          <tr class="even:bg-white odd:bg-blue-50">
            <td class="px-4 py-2"><input type="time" class="input input-sm input-bordered w-full rounded-xl border-blue-200" /></td>
            <td class="px-4 py-2"><input type="time" class="input input-sm input-bordered w-full rounded-xl border-blue-200" /></td>
            <td class="px-4 py-2"><input type="text" placeholder="e.g. 1h" class="input input-sm input-bordered w-full rounded-xl border-blue-200" /></td>
            <td class="px-4 py-2"><input type="text" placeholder="Place" class="input input-sm input-bordered w-full rounded-xl border-blue-200" /></td>
            <td class="px-4 py-2"><input type="text" placeholder="Content" class="input input-sm input-bordered w-full rounded-xl border-blue-200" /></td>
            <td class="px-4 py-2"><input type="text" placeholder="Participants" class="input input-sm input-bordered w-full rounded-xl border-blue-200" /></td>
            <td class="px-4 py-2"><input type="text" placeholder="Note" class="input input-sm input-bordered w-full rounded-xl border-blue-200" /></td>
            <td class="px-4 py-2 text-center">
              <button type="button" class="text-red-500 hover:text-red-700 font-medium" onclick="removeRow(this)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ปุ่มเพิ่มแถว -->
    <div class="flex justify-end mt-6">
      <button type="button"
        class="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
        onclick="addRow()">
        + Add Activity
      </button>
    </div>
  </div>

  <!-- Tab3: หมายเหตุ -->
  <div id="tab3" class="tab-pane hidden w-full max-w-4xl mx-auto mt-8">
    <h2 class="text-xl font-semibold mb-2 text-gray-800">หมายเหตุ</h2>
    <p class="text-sm text-gray-600">หมายเหตุเพิ่มเติม</p>
  </div>
</div>


@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/index.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
       // Tab toggle logic
  const tabs = document.querySelectorAll('[data-tab]');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('border-blue-600', 'bg-white', 'shadow-sm', 'active-tab'));
      tab.classList.add('border-blue-600', 'bg-white', 'shadow-sm', 'active-tab');

      const target = tab.getAttribute('data-tab');
      panes.forEach((pane) => pane.classList.add('hidden'));
      document.getElementById(target).classList.remove('hidden');
    });
  });

  function addRow() {
    const tbody = document.getElementById('scheduleTableBody');
    const clone = tbody.querySelector('tr').cloneNode(true);
    clone.querySelectorAll('input').forEach(input => input.value = '');
    tbody.appendChild(clone);
  }

  function removeRow(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentNode;
    if (tbody.rows.length > 1) tbody.removeChild(row);
  }
    const lunchCheckbox = document.getElementById('hasLunch');
  const lunchDetails = document.getElementById('lunchDetails');
  lunchCheckbox.addEventListener('change', () => {
    lunchDetails.classList.toggle('hidden', !lunchCheckbox.checked);
  });

  const dinnerCheckbox = document.getElementById('hasDinner');
  const dinnerDetails = document.getElementById('dinnerDetails');
  dinnerCheckbox.addEventListener('change', () => {
    dinnerDetails.classList.toggle('hidden', !dinnerCheckbox.checked);
  });
    </script>
@endsection
