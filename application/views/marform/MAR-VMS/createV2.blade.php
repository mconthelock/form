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

    <!-- เมนูซ้ายโทนเขียว -->
    <div class="flex-[0_0_240px] bg-gradient-to-b from-[#e6f4ea] via-[#c8e6c9] to-[#a5d6a7] border-r shadow-md rounded-l-xl overflow-hidden">
      <ul class="flex flex-col text-sm font-medium text-green-900" id="tabs">
        <li>
          <button
            class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-green-600 transition-all duration-300 active-tab"
            data-tab="tab1"
          >
            <svg class="h-5 w-5 text-green-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 110-16 8 8 0 010 16z" />
            </svg>
            <span>Visit Arrangement</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- เนื้อหาขวาโทนเขียว gradient -->
    <div
      class="flex-1 w-full min-w-0 bg-gradient-to-b from-[#f0fbf4] via-[#d9f1db] to-[#b9e6bc] p-6 lg:p-10 rounded-r-xl overflow-hidden"
      id="tab-content"
    >

      <!-- Tab1 -->
      <div id="tab1" class="tab-pane w-full max-w-7xl mx-auto ">
        <h2 class="text-2xl font-bold text-green-900 mb-2">Visit Arrangement</h2>
        <p class="text-sm text-green-800 mb-6">Please provide complete information to ensure smooth and efficient visit arrangements.</p>

        <!-- Form & Document -->
        <section class="mb-12">
          <h3 class="text-lg font-semibold text-green-800 border-b border-green-200 pb-2 mb-3">Form & Documents</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- Form Version -->
            <div>
              <label for="formVersion" class="block text-sm text-green-900 font-medium mb-1">Form Version</label>
              <input
                type="text"
                id="formVersion"
                name="formVersion"
                placeholder="Enter form version"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              />
            </div>

            <!-- Form C1-1 -->
            <div>
              <label for="formC1" class="block text-sm text-green-900 font-medium mb-1">Form C1-1</label>
              <select
                id="formC1"
                name="formC1"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              >
                <option value="" disabled selected>-- Select --</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Visit Details -->
        <section class="mb-12">
          <h3 class="text-lg font-semibold text-green-800 border-b border-green-200 pb-2 mb-3">Visit Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- Visit Date -->
            <div>
              <label for="visitDate" class="block text-sm text-green-900 font-medium mb-1">Visit Date</label>
              <input
                type="date"
                id="visitDate"
                name="visitDate"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              />
            </div>

            <!-- Reception Room (Dropdown) -->
            <div>
              <label for="receptionRoom" class="block text-sm text-green-900 font-medium mb-1">Reception Room</label>
              <select
                id="receptionRoom"
                name="receptionRoom"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              >
                <option value="" disabled selected>-- Select Reception Room --</option>
                <option value="room1">Room 1</option>
                <option value="room2">Room 2</option>
                <option value="room3">Room 3</option>
              </select>
            </div>

            <!-- Purpose of Visit -->
            <div>
              <label for="purposeOfVisit" class="block text-sm text-green-900 font-medium mb-1">Purpose of Visit</label>
              <select
                id="purposeOfVisit"
                name="purposeOfVisit"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              >
                <option value="" disabled selected>-- Select Purpose of Visit --</option>
                <option value="">General visit</option>
                <option value="">VIP Reception</option>
                <option value="">VVIP Reception</option>
                <option value="">Specific activities</option>
                <option value="">Special meeting request</option>
                <option value="">Visual inspection</option>
                <option value="">Special Case (Seminar)</option>
                <option value="">Others</option>
              </select>
            </div>

            <!-- Purpose of Detail -->
            <div>
              <label for="detail" class="block text-sm text-green-900 font-medium mb-1">Detail</label>
              <input
                type="text"
                id="purposedetail"
                name="purposedetail"
                placeholder="ระบุรายละเอียดเพิ่มเติม"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              />
            </div>

            <!-- Visit Types (Dropdown) -->
            <div>
              <label for="visitTypes" class="block text-sm text-green-900 font-medium mb-1">Visit Types</label>
              <select
                id="visitTypes"
                name="visitTypes"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              >
                <option value="" disabled selected>-- Select Visit Type --</option>
                <option value="">Factory Tour</option>
                <option value="">Showroom</option>
                <option value="">Factory Tour & Showroom</option>
                <option value="">No Factory Tour</option>
                <option value="">Special Case(Seminar)</option>
                <option value="">Special Case(General)</option>
              </select>
            </div>

            <!-- Guest Type (Dropdown) -->
            <div>
              <label for="guestType" class="block text-sm text-green-900 font-medium mb-1">Guest Type</label>
              <select
                id="guestType"
                name="guestType"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              >
                <option value="" disabled selected>-- Select Guest Type --</option>
                <option value="">Board director , shareholder , VVIP</option>
                <option value="">Customer and Joint Venture</option>
                <option value="">Auditors</option>
                <option value="">Instructor</option>
                <option value="">Outside attending the meeting</option>
                <option value="">Outside guest consider with RAF</option>
                <option value="">Guest for RHQ</option>
              </select>
            </div>

            <!-- Specific -->
            <div>
              <label for="specific" class="block text-sm text-green-900 font-medium mb-1">Specific</label>
              <input
                type="text"
                id="specific"
                name="specific"
                placeholder="ระบุรายละเอียดเพิ่มเติม"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              />
            </div>

            <!-- Attachment Specific (File Upload) -->
            <div>
              <label for="specificAttachment" class="block text-sm text-green-900 font-medium mb-1">Attachment Specific</label>
              <input
                type="file"
                id="specificAttachment"
                name="specificAttachment"
                class="w-full text-sm text-green-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-green-50 file:text-green-700
                       hover:file:bg-green-100
                       focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </section>

        <!-- Section: Travel & Accommodation -->
        <section class="mb-12">
          <h3 class="text-lg font-semibold text-green-800 border-b border-green-200 pb-2 mb-3">Travel &amp; Accommodation</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- Hotel Reservation -->
            <div>
              <label for="hotelReservation" class="block text-sm text-green-900 font-medium mb-1">Hotel Reservation</label>
              <input
                type="text"
                id="hotelReservation"
                name="hotelReservation"
                placeholder="Enter hotel reservation details"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              />
            </div>
            <!-- Car Reservation Hotel -->
            <div>
              <label for="carHotel" class="block text-sm text-green-900 font-medium mb-1">Car Reservation Hotel</label>
              <select
                id="carHotel"
                name="carHotel"
                class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
              >
                <option value="" disabled selected>-- Select --</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Section: Meal Arrangement -->
        <section class="mb-12">
          <h3 class="text-lg font-semibold text-green-800 border-b border-green-200 pb-2 mb-3">Meal Arrangement</h3>
          <div>
            <!-- Lunch -->
            <div class="mb-8">
              <label class="inline-flex items-center cursor-pointer mb-3 select-none">
                <input type="checkbox" id="hasLunch" class="w-6 h-6 rounded-lg checkbox checkbox-primary shadow-sm border-green-200" />

                <span class="text-sm text-green-900 font-semibold select-text ml-2">Do you require Lunch arrangement?</span>
              </label>

              <div id="lunchDetails" class="grid grid-cols-1 md:grid-cols-2 gap-6 hidden">
                <div>
                  <label class="block text-sm text-green-900 font-medium mb-1">Lunch Location</label>
                  <select
                    class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
                  >
                    <option value="">-- Select --</option>
                    <option value="inside">Inside</option>
                    <option value="outside">Outside</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm text-green-900 font-medium mb-1">Place</label>
                  <input
                    type="text"
                    placeholder="e.g. Chonburi/Green grass Amata City Chonburi"
                    class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
                  />
                </div>
              </div>
            </div>

            <!-- Dinner -->
            <div>
              <label class="inline-flex items-center cursor-pointer mb-3 select-none">
                <input type="checkbox" id="hasDinner" class="w-6 h-6 rounded-lg checkbox checkbox-primary shadow-sm border-green-200" />

                <span class="text-sm text-green-900 font-semibold select-text ml-2">Do you require Dinner arrangement?</span>
              </label>

              <div id="dinnerDetails" class="hidden">
                <label class="block text-sm text-green-900 font-medium mb-1">Place</label>
                <input
                  type="text"
                  placeholder="e.g. Chonburi/Green grass Amata City Chonburi"
                  class="input input-bordered rounded-xl w-full shadow-sm border-green-200 text-green-900"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- ปุ่ม Save -->
        <div class="flex justify-end mt-6">
          <button
            class="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
                   shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            Save
          </button>
        </div>
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
