@extends('layouts/webflowTemplate')

@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.85); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{base_url()}}assets/images/loading_gif.gif" alt="Loading..." width="120">
        </div>
    </div>
    <div class="bg-gradient-to-b from-sky-400 to-sky-600 text-white text-center py-6 rounded-t-md shadow-md">
    <h1 class="text-xl font-semibold tracking-wide">MITSUBISHI ELEVATOR ASIA CO., LTD.</h1>
    <p class="text-base mt-2">Quality Observation Inspection</p>
    </div>
    <div class="bg-gradient-to-b from-sky-400 to-sky-600 text-white text-center py-6 rounded-t-md shadow-md">
  <h1 class="text-xl font-semibold tracking-wide">MITSUBISHI ELEVATOR ASIA CO., LTD.</h1>
  <p class="text-base mt-2">Quality Observation Inspection</p>
</div>

<div class="bg-white p-6 rounded-b-md shadow-md max-w-4xl mx-auto space-y-6">
  <form class="space-y-8">
    <!-- Section 1 -->
    <div>
      <h2 class="text-lg font-semibold text-sky-700 mb-3">1. Inspector Information</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Name</label>
          <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Enter inspector name" />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Employee ID</label>
          <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Enter ID" />
        </div>
      </div>
    </div>

    <!-- Section 2 -->
    <div>
      <h2 class="text-lg font-semibold text-sky-700 mb-3">2. Inspection Details</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Date</label>
          <input type="date" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Location</label>
          <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Machine No.</label>
          <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      </div>
    </div>

    <!-- Section 3 -->
    <div>
      <h2 class="text-lg font-semibold text-sky-700 mb-3">3. Observation Points</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Point 1</label>
          <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Point 2</label>
          <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Point 3</label>
          <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      </div>
    </div>

    <!-- Section 4 -->
    <div>
      <h2 class="text-lg font-semibold text-sky-700 mb-3">4. Inspector Comments</h2>
      <textarea rows="4" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Add any general comments..."></textarea>
    </div>

    <!-- Submit -->
    <div class="text-right pt-4">
      <button type="submit" class="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded shadow">Submit</button>
    </div>
  </form>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/qoiview.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
