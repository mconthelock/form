@extends('layouts/webflowTemplate')
@section('styles')
<style>
/* ปรับหัวตารางเป็นเขียวมัทฉะ */
#table.dataTable thead th {
  background: linear-gradient(to bottom right, #f0fdf4, #dcfce7) !important;
  color: #2e2e2e !important;
}

#table tbody tr{
    background-color:red; 
}
/* แถวสลับสี */
#table tbody tr:nth-child(odd) {
  background-color: #f6fdf4; /* เขียวอ่อน */
}
#table tbody tr:nth-child(even) {
  background-color: #e9f5e1; /* เขียวมัทฉะอ่อน */
}

/* hover effect */
#table tbody tr:hover {
  background-color: #d4ebc7;
  transition: background 0.2s ease-in-out;
}
</style>
@endsection
@section('contents')
    <div class="flex mx-5">
   
        <div class="card w-full  bg-base-100">
            <div class="card-body">
                <!-- Header -->
              <div class="flex justify-between items-center mb-3">
                <h2 class="text-lg font-semibold text-gray-700">Group Master</h2>
                <button id="btnAddGroup" class="btn btn-sm bg-green-500 text-white hover:bg-green-600">
                  + Add Group
                </button>
              </div>
                <div class="overflow-x-auto">
                    <table class="table" id="table"></table>
                </div>
            </div>
        </div>
    </div>
    <form id="form-group" method="post" enctype="multipart/form-data">
      <input type="hidden" name="GID" id="GID" value="" />
  <div id="modalAddGroup" class="fixed inset-0 bg-gray-200 bg-opacity-40 hidden items-center justify-center z-50">
    <div class="bg-green-50  rounded-2xl shadow-2xl p-6 w-11/12 max-w-5xl">

      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <h3 class="text-xl font-semibold text-gray-800">Add Group</h3>
        <button id="closeModal" type="button" class="text-gray-500 hover:text-red-500 transition close-modal">
          ✖
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Group Name <span class="text-red-500">*</span></label>
          <input type="text" id="groupName" name="groupName" 
                 class="bg-white w-full rounded-lg border  border-gray-300 focus:border-green-300 focus:outline-none focus:shadow-sm focus:shadow-green-200 px-3 py-2" 
                 placeholder="Enter group name">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Detail <span class="text-red-500">*</span></label>
          <textarea id="groupDetail" name="groupDetail" rows="3"
                    class="bg-white w-full rounded-lg border border-gray-300 focus:border-green-300 focus:outline-none focus:shadow-sm focus:shadow-green-200 px-3 py-2"
                    placeholder="Enter details"></textarea>
        </div>
      </div>

      <!-- Participants -->
      <div class="mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Participants</label>
        <div class="max-h-[50vh] overflow-y-auto border rounded-lg">
          <table id="tablepstModal" class="min-w-full text-sm text-gray-800">
            <thead class="sticky top-0 z-10 bg-gradient-to-r from-green-100 to-green-200">
              <tr class="text-left text-gray-700 font-semibold">
                <th class="px-3 py-2 w-10">No.</th>
                <th class="px-3 py-2 w-64">Email</th>
                <th class="px-3 py-2 w-64">Name</th>
                <th class="px-3 py-2 w-48">Position</th>
                <th class="px-3 py-2 w-64">Div./Dept./Sec.</th>
              </tr>
            </thead>
            <tbody id="tbodyModal" class="divide-y divide-gray-200 bg-white">
            </tbody>
          </table>
        </div>
        <button id="addPstBtn" type="button" 
                class="btn btn-sm mt-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg px-3 py-1 transition">
          + Add Row
        </button>
      </div>

      <!-- Footer Buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <button id="closeModalBtn" type="button" 
                class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition close-modal">
          Cancel
        </button>
        <button id="saveGroup" type="button" 
                class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition">
          Save
        </button>
      </div>
    </div>
  </div>
</form>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/vmsmst.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
