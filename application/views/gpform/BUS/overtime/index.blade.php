@extends('layouts/template')

@section('contents')
<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

  <!-- PAGE HEADER -->
  <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
    <div>
      <div class="text-2xl font-bold text-gray-800">Daily Transportation Dispatch</div>
      <div class="text-sm text-gray-500">Manage daily dispatch snapshot (Line → Stop → Passenger)</div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Workdate</span>
        <input id="dd_workdate" type="date" class="border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Type</span>
        <select id="dd_type" class="border rounded-lg px-3 py-2 text-sm">
          <option value="OT">OT</option>
          <option value="NIGHT">NIGHT</option>
          <option value="HOLIDAY">HOLIDAY</option>
        </select>
      </div>


      <button id="btnAddPassenger" class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold">
        เพิ่ม Passenger
      </button>

      <button id="btnSaveDispatch" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
        Save DISPATCH
      </button>
    </div>
  </div>

  <!-- SUMMARY BAR -->
  <div class="grid grid-cols-3 gap-3 mb-5">
    <div class="rounded-xl border p-4">
      <div class="text-xs text-gray-500">Bus Lines</div>
      <div class="text-2xl font-bold" id="sumLines">0</div>
    </div>
    <div class="rounded-xl border p-4">
      <div class="text-xs text-gray-500">Bus Stops</div>
      <div class="text-2xl font-bold" id="sumStops">0</div>
    </div>
    <div class="rounded-xl border p-4">
      <div class="text-xs text-gray-500">Passengers</div>
      <div class="text-2xl font-bold" id="sumPassengers">0</div>
    </div>
  </div>

  <!-- 3 LEVEL TABLES -->
  <div class="grid grid-cols-3 gap-4">
    <!-- LEVEL 1 : BUS LINE -->
    <div class="rounded-2xl border p-3">
      <div class="font-semibold mb-2">BUS LINE</div>
      <table id="tblLine" class="display w-full"></table>
    </div>

    <!-- LEVEL 2 : BUS STOP -->
    <div class="rounded-2xl border p-3">
      <div class="font-semibold mb-2">
        BUS STOP
        <span class="text-xs text-gray-500 ml-2" id="lblSelectedLine">Selected: -</span>
      </div>
      <table id="tblStop" class="display w-full"></table>
      <div class="mt-2">
        <button id="btnAddStop" class="px-3 py-2 rounded-lg border text-sm" disabled>
          + เพิ่มจุดรถ
        </button>
      </div>
    </div>

    <!-- LEVEL 3 : BUS PASSENGER -->
    <div class="rounded-2xl border p-3">
      <div class="font-semibold mb-2">
        BUS PASSENGER
        <span class="text-xs text-gray-500 ml-2" id="lblSelectedStop">Selected: -</span>
      </div>
      <table id="tblPassenger" class="display w-full"></table>
    </div>
  </div>
</div>
@endsection


@section('scripts')
<script type="module" src="{{ $_ENV['APP_JS'] }}/bus_overtime.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection
