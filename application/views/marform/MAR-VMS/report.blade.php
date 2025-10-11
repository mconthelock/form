@extends('layouts/webflowTemplate')
@section('styles')
<style>
 
</style>
@endsection
@section('contents')

  <div class="flex mx-5">
    <div class="card w-full bg-orange-50 shadow-lg rounded-2xl">
      <div class="card-body">
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h2 class="text-lg font-semibold text-gray-800">Reports</h2>
          <div class="flex gap-2">
            <button type="button" id="searchBtn" class="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium shadow">
              Search
            </button>
            <button type="button" id="exportBtn" class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium shadow">
              Export
            </button>
          </div>
        </div>

        <!-- Form -->
        <form id="form-report" action="" method="post" class="grid grid-cols-12 gap-4 items-center">

          <!-- VISITDATE Mode -->
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Visitdate Mode</label>
            <select id="dateMode" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-orange-400">
              <option value="date">Date</option>
              <option value="month">Month+Year</option>
              <option value="year">Year</option>
            </select>
          </div>

          <!-- Date Range -->
          <div id="dateRange" class="col-span-3 flex items-center gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="text" name="start_date" id="start_date" placeholder="yyyy-mm-dd"
                     class="datesel w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-orange-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="text" name="end_date" id="end_date"  placeholder="yyyy-mm-dd"
                     class="datesel w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-orange-400">
            </div>
          </div>

          <!-- Month+Year Range -->
          <div id="monthRange" class="hidden col-span-3 flex items-center gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Month</label>
              <input type="text" id="start_month" name="start_month" placeholder="MM-YYYY"
                     class="monthsel w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-orange-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Month</label>
              <input type="text" id="end_month" name="end_month" placeholder="MM-YYYY"
                     class="monthsel w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-orange-400">
            </div>
          </div>

          <!-- Year Range -->
          <div id="yearRange" class="hidden col-span-3 flex items-center gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
              <input type="text" id="start_year" name="start_year" placeholder="YYYY"
                     class="yearsel w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-orange-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Year</label>
              <input type="text" id="end_year" name="end_year" placeholder="YYYY"
                     class="yearsel w-full border border-gray-300 rounded-lg px-3 py-2 text-sm  bg-white text-gray-700 focus:ring-2 focus:ring-orange-400">
            </div>
          </div>

          <!-- Type -->
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="report_type" id="report_type"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-orange-400 req">
              <option value="" disabled selected class="text-gray-400">-- Select Type --</option>
              <option value="VO">Visitor Overview</option>
              <option value="VF">Visit Frequency</option>
              <option value="WE">Workload Estimation</option>
              <option value="CE">Cost Estimation</option>
              <option value="VR">Visitor Raw Data</option>
            </select>
          </div>

        </form>
          <!-- พื้นที่แสดงผลลัพธ์ -->
            <div id="result" class="" >
                <h2 class="text-lg font-semibold text-gray-800 mb-4"></h2>
                <table id="reportTable" class="display w-full text-sm"></table>
            </div>
    </div>
  </div>


@endsection

@section('scripts')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/style.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/index.js"></script>
<script src="{{ $_ENV['APP_JS'] }}/vmsreport.js?ver={{ $GLOBALS['version'] }}"></script>

    
@endsection
