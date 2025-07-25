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
  #tablesch_info {
    display: none !important;
  }
</style>
@endsection
@section('contents')
<div class="flex flex-col w-full px-4 mt-20 mb-20 md:px-8 lg:mt-5">
  <div class="flex bg-white rounded-xl shadow-md overflow-hidden w-full max-w-7xl mx-auto">

<div class="flex-[0_0_240px] bg-gradient-to-b from-gray-100 via-blue-50 to-blue-100 border-r shadow-md rounded-l-xl overflow-hidden">
  <ul class="flex flex-col text-sm font-medium text-gray-700" id="tabs">
    <li>
      <button
        class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300 active-tab"
        data-tab="tab1"
      >
        <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 110-16 8 8 0 010 16z" />
        </svg>
        <span>Visit Arrangement</span>
      </button>
    </li>

    <!-- Schedule -->
    <li>
      <button
        class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
        data-tab="tab2"
      >
        <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2z" />
        </svg>
        <span>Schedule</span>
      </button>
    </li>

    <!-- หมายเหตุ -->
    <li>
      <button
        class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
        data-tab="tab3"
      >
        <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h8m-8 4h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>หมายเหตุ</span>
      </button>
    </li>
  </ul>
</div>

<!-- Content ขวา -->
<div class="flex-1 w-full min-w-0 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 lg:p-10" id="tab-content">
<div id="tab1" class="tab-pane w-full">

<!-- Header (no box, just spacing) -->
<div class="mb-10 px-1">
  <h2 class="text-2xl font-bold text-blue-900 mb-1">Visit Arrangement</h2>
  <p class="text-sm text-gray-600">Please provide complete information to ensure smooth and efficient visit arrangements.</p>
</div>

<!-- Card -->
<div class="bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 shadow rounded-2xl p-6 md:p-10 space-y-12 max-w-5xl mx-auto">
 
  <!-- Section: Form & Documents -->
  <div>
    <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-6">Form & Documents</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <!-- Form Version -->
      <div>
        <label for="formVersion" class="block text-sm text-gray-700 font-medium mb-1">Form Version</label>
        <input
          type="text"
          id="formVersion"
          name="formVersion"
          placeholder="Enter form version"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        />
      </div>

      <!-- Form C1-1 -->
      <div>
        <label for="formC1" class="block text-sm text-gray-700 font-medium mb-1">Form C1-1</label>
        <select
          id="formC1"
          name="formC1"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        >
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

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Visit Date -->
      <div>
        <label for="visitDate" class="block text-sm text-gray-700 font-medium mb-1">Visit Date</label>
        <input
          type="date"
          id="visitDate"
          name="visitDate"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        />
      </div>

      <!-- Reception Room (Dropdown) -->
      <div>
        <label for="receptionRoom" class="block text-sm text-gray-700 font-medium mb-1">Reception Room</label>
        <select
          id="receptionRoom"
          name="receptionRoom"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        >
          <option value="" disabled selected>-- Select Reception Room --</option>
          <option value="room1">Room 1</option>
          <option value="room2">Room 2</option>
          <option value="room3">Room 3</option>
        </select>
      </div>

      <!-- Purpose of Visit -->
      <div class="md:col-span-2">
        <label for="purposeOfVisit" class="block text-sm text-gray-700 font-medium mb-1">Purpose of Visit</label>
        <input
          type="text"
          id="purposeOfVisit"
          name="purposeOfVisit"
          placeholder="Enter purpose of visit"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        />
      </div>

      <!-- Visit Types (Dropdown) -->
      <div>
        <label for="visitTypes" class="block text-sm text-gray-700 font-medium mb-1">Visit Types</label>
        <select
          id="visitTypes"
          name="visitTypes"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        >
          <option value="" disabled selected>-- Select Visit Type --</option>
          <option value="type1">Type 1</option>
          <option value="type2">Type 2</option>
        </select>
      </div>

      <!-- Guest Type (Dropdown) -->
      <div>
        <label for="guestType" class="block text-sm text-gray-700 font-medium mb-1">Guest Type</label>
        <select
          id="guestType"
          name="guestType"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        >
          <option value="" disabled selected>-- Select Guest Type --</option>
          <option value="internal">Internal</option>
          <option value="external">External</option>
        </select>
      </div>

      <!-- Specific -->
      <div>
        <label for="specific" class="block text-sm text-gray-700 font-medium mb-1">Specific</label>
        <input
          type="text"
          id="specific"
          name="specific"
          placeholder="ระบุรายละเอียดเพิ่มเติม"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        />
      </div>

      <!-- Attachment Specific (File Upload) -->
      <div>
        <label for="specificAttachment" class="block text-sm text-gray-700 font-medium mb-1">Attachment Specific</label>
        <input
          type="file"
          id="specificAttachment"
          name="specificAttachment"
          class="w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-md file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>

  <!-- Section: Travel & Accommodation -->
  <div>
    <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-6">Travel &amp; Accommodation</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Hotel Reservation -->
      <div>
        <label for="hotelReservation" class="block text-sm text-gray-700 font-medium mb-1">Hotel Reservation</label>
        <input
          type="text"
          id="hotelReservation"
          name="hotelReservation"
          placeholder="Enter hotel reservation details"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        />
      </div>

      <!-- Car Reservation Hotel -->
      <div>
        <label for="carHotel" class="block text-sm text-gray-700 font-medium mb-1">Car Reservation Hotel</label>
        <select
          id="carHotel"
          name="carHotel"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        >
          <option value="" disabled selected>-- Select --</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Section: Meal Arrangement -->
  <div>
    <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-4 mb-6">Meal Arrangement</h3>

    <!-- Lunch -->
    <div class="mb-8">
    <label class="inline-flex items-center cursor-pointer mb-3 select-none">
  <input type="checkbox" id="hasLunch" class="w-6 h-6 rounded-lg checkbox checkbox-primary shadow-sm border-blue-200" />

  <span class="text-sm text-gray-700 font-semibold select-text ml-2">Do you require Lunch arrangement?</span>
</label>
      

      <div id="lunchDetails" class="grid grid-cols-1 md:grid-cols-2 gap-6 hidden">
        <div>
          <label class="block text-sm text-gray-700 font-medium mb-1">Lunch Location</label>
          <select
            class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
          >
            <option value="">-- Select --</option>
            <option value="inside">Inside</option>
            <option value="outside">Outside</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-700 font-medium mb-1">Place</label>
          <input
            type="text"
            placeholder="e.g. Chonburi/Green grass Amata City Chonburi"
            class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
          />
        </div>
      </div>
    </div>

    <!-- Dinner -->
    <div>
    <label class="inline-flex items-center cursor-pointer mb-3 select-none">
  <input type="checkbox" id="hasDinner" class="w-6 h-6 rounded-lg checkbox checkbox-primary shadow-sm border-blue-200" />

  <span class="text-sm text-gray-700 font-semibold select-text ml-2">Do you require Dinner arrangement?</span>
</label>


      <div id="dinnerDetails" class="hidden">
        <label class="block text-sm text-gray-700 font-medium mb-1">Place</label>
        <input
          type="text"
          placeholder="e.g. Chonburi/Green grass Amata City Chonburi"
          class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
        />
        
      </div>
    </div>
  </div>

  <!-- ปุ่มบันทึก -->
  <div class="flex justify-end pt-4 border-t border-gray-200">
    <button
      class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
    >
      <span>Save</span>
    </button>
  </div>
</div>
</div>
  <!-- Tab2 -->
  <div id="tab2" class="tab-pane hidden w-full max-w-7xl mx-auto mt-8">
  <h2 class="text-2xl font-bold text-blue-900 mb-2">Schedule</h2>
  <p class="text-sm text-gray-600 mb-6">Please fill in the schedule of activities during the visit.</p>
  <div>
    <table id="tablesch" class="min-w-[1600px] text-sm text-gray-800 w-full ">
      <thead class="text-blue-800 sticky top-0 z-10 shadow-sm">
        <tr class="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100 text-sm">
          <th class="px-4 py-3 text-left w-32 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">Time Start</th>
          <th class="px-4 py-3 text-left w-32 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">Time End</th>
          <th class="px-4 py-3 text-left w-36">Duration (Min)</th>
          <th class="px-4 py-3 text-left w-96">Place</th>
          <th class="px-4 py-3 text-left w-100">Content</th>
          <th class="px-4 py-3 text-left w-96">AMEC Participants</th>
          <th class="px-4 py-3 text-left w-96">Note</th>
          <th class="px-4 py-3 text-left w-52">Activity</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-blue-100">
  <tr class="bg-white">
    <td class="px-2 py-2 w-32 sticky-column">
      <input name="starttime" type="time"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>
    <td class="px-2 py-2 w-32 sticky-column">
      <input name="endtime" type="time"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>
    <td class="px-2 py-2 w-28">
      <input name="duration" type="text" placeholder="e.g. 60"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>

    <!-- เพิ่มความกว้างให้ Place -->
    <td class="px-2 py-2  w-100">
      <input name="place" type="text"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>

    <!-- Content ยาวขึ้น -->
    <td class="px-2 py-2 w-108">
      <input name="content" type="text"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>

    <!-- Participants -->
    <td class="px-2 py-2  w-100">
      <input name="participants" type="text"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>

    <!-- Note -->
    <td class="px-2 py-2  w-100">
      <input name="note" type="text"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>

    <!-- Activity -->
    <td class="px-2 py-2 w-60">
      <select name="activity"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm">
        <option value="P1">Preparation & Coordination</option>
        <option value="P2">Presentation</option>
        <option value="F">Factory Tour</option>
        <option value="Q">Q&A</option>
        <option value="L">Lunch Hosting</option>
      </select>
    </td>
  </tr>
</tbody>
    </table>
      <!-- ปุ่มอยู่ชิดขวาใต้ตาราง -->
  <div class="flex justify-end mt-4">
    <button id="addRowBtn" type="button"
      class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
      + Add Row
    </button>
  </div>
  </div>
</div>

  <!-- Tab3 -->
  <div id="tab3" class="tab-pane hidden w-full max-w-4xl mx-auto mt-8">
    <h2 class="text-xl font-semibold mb-2 text-gray-800">หมายเหตุ</h2>
    <p class="text-sm text-gray-600">หมายเหตุเพิ่มเติม</p>
  </div>
</div>


  </div>
</div>


@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/vms.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
          const tabButtons = document.querySelectorAll('#tabs button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // remove active classes
        tabButtons.forEach(btn => btn.classList.remove('active-tab'));
        tabPanes.forEach(pane => pane.classList.add('hidden'));

        // add active to current
        button.classList.add('active-tab');
        const tab = button.getAttribute('data-tab');
        document.getElementById(tab).classList.remove('hidden');
      });
    });
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
