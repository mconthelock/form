@extends('layouts/template')

@section('contents')
<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

  <!-- PAGE HEADER -->
  <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
    <div>
      <div class="text-2xl font-bold text-gray-800">Daily Transportation Dispatch</div>
      <div class="text-sm text-gray-500">Manage daily dispatch  (Line → Stop → Passenger)</div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Workdate</span>
        <input id="dd_workdate" type="date" class="border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Type</span>
        <select id="dd_type" class="border rounded-lg px-3 py-2 text-sm">
          <option value="OT">19.30</option>
          <option value="OT_SPECIAL">21.30</option>
          <option value="NIGHT">07.30 (Night)</option>
          <option value="HOLIDAY">17.00 (Holiday)</option>
        </select>
      </div>


      <button id="btnAddPassenger" name="btnAddPassenger"  class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold cursor-pointer">
        เพิ่ม Passenger
      </button>

      <button id="btnSaveDispatch" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold cursor-pointer">
        Save DISPATCH
      </button>
      
      <button id="btnExportDispatch"
            class="bg-yellow-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition shadow-sm flex items-center gap-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5">
                <path fill="#21A366" d="M6 4h23v40H6z"/>
                <path fill="#107C41" d="M29 4h13v40H29z"/>
                <path fill="#fff" d="M14 16l3.2 5.5L14 27h2.6l1.9-3.7L20.4 27H23l-3.2-5.5L23 16h-2.6l-1.9 3.7L16.6 16H14z"/>
            </svg>
             Export Data Passenger
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

  
  <div class="grid grid-cols-3 gap-4">
    <!-- LEVEL 1 : BUS LINE -->
    <div class="rounded-2xl border p-3">
      <div class="font-semibold mb-2"> BUS LINE </div>
      <table id="tblLine" name="tblLine" class="display w-full">
      </table>
    </div>

    <!-- LEVEL 2 : BUS STOP -->
    <div class="rounded-2xl border p-3">
      <div class="font-semibold mb-2"> BUS STOP <span class="text-xs text-gray-500 ml-2" id="lblSelectedLine">-</span>
      </div>
      <table id="tblStop" class="display w-full"></table>
<<<<<<< HEAD
=======
      <div class="mt-2">
        <button id="btnAddStop" name="btnAddStop" class="px-3 py-2 rounded-lg border text-sm" disabled> + เพิ่มจุดรถ </button>
      </div>
>>>>>>> 5567cd8 (feat: enhance bus overtime UI with improved table structures and modal functionality)
    </div>

    <!-- LEVEL 3 : BUS PASSENGER -->
    <div class="rounded-2xl border p-3">
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="font-semibold">
          BUS PASSENGER
          <span class="text-xs text-gray-500 ml-2" id="lblSelectedStop">-</span>
        </div>

        <input
          id="txtPassengerSearch"
          type="text"
          class="border rounded-lg px-3 py-2 text-sm w-56"
          placeholder="ค้นหา empno / ชื่อ"
          autocomplete="off"
        />
      </div>
      <table id="tblPassenger" name="tblPassenger" class="display w-full"></table>
    </div>
<<<<<<< HEAD
    
  </div>
</div>
<dialog id="move_stop_modal" class="modal">
  <div class="modal-box max-w-md">
    <h3 class="font-bold text-lg mb-4">จัดการจุดรถ</h3>
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-semibold mb-1">สายรถปัจจุบัน</label>
        <input id="moveCurrentLineName" type="text"  class="input input-bordered w-full" readonly />
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1">ชื่อจุดรถ</label>
=======
  </div>
</div>

<dialog id="move_stop_modal" class="modal">
  <div class="modal-box max-w-md">
    <h3 class="font-bold text-lg mb-4">ย้ายสายรถ</h3>

    <div class="space-y-3">
      <div>
        <label class="block text-sm font-semibold mb-1">จุดรถ</label>
>>>>>>> 5567cd8 (feat: enhance bus overtime UI with improved table structures and modal functionality)
        <input id="moveStopName" type="text" class="input input-bordered w-full" readonly />
      </div>

      <div>
<<<<<<< HEAD
          <label class="block text-sm font-medium mb-1"> เวลา<b style="color:red">*</b></label>
          <input type="text" id="movePlanTime" name="movePlanTime" class="input input-bordered w-full" placeholder="HH:mm" autocomplete="off">
      </div>
      <div>
        <label class="block text-sm font-semibold mb-1">ย้ายไปสายรถ</label>
        <select id="moveTargetLine" class="select select-bordered w-full">
          <option value="">-- ไม่ย้ายสายรถ --</option>
        </select>
      </div>

    </div>

    <div class="modal-action">
      <button id="btnConfirmMoveStop" class="btn btn-warning">
        บันทึก
      </button>

      <form method="dialog">
        <button class="btn">ยกเลิก</button>
      </form>
    </div>
  </div>
</dialog>

<dialog id="add_passenger_modal" class="modal">
  <div class="modal-box max-w-lg">
    <h3 class="font-bold text-lg mb-4">เพิ่ม Passenger</h3>

    <input type="hidden" id="apDispatchId" />
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1"> รหัสพนักงาน <b style="color:red">*</b> </label>
        <input type="text" id="apEmpno" maxlength="5" class="input input-bordered w-full" placeholder="กรอกรหัสพนักงาน 5 หลัก" autocomplete="off" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">ชื่อ</label>
        <div id="apEmpName" class="text-sm font-medium text-gray-400"></div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">
          จุดรถ <b style="color:red">*</b>
        </label>
        <select id="apStopId" class="select select-bordered w-full">
          <option value="">-- เลือกจุดรถ --</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">สายรถ <b style="color:red">*</b> </label>
        <select id="apLineId" class="select select-bordered w-full">
          <option value="">-- เลือกสายรถ --</option>
        </select>
      </div>

    </div>

    <div class="modal-action">
      <button id="btnSaveAddPassenger" class="btn btn-primary">บันทึก</button>
=======
        <label class="block text-sm font-semibold mb-1">สายรถปัจจุบัน</label>
        <input id="moveCurrentLineName" type="text" class="input input-bordered w-full" readonly />
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1">ย้ายไปสายรถ</label>
        <select id="moveTargetLine" class="select select-bordered w-full">
          <option value="">-- เลือกสายรถ --</option>
        </select>
      </div>
    </div>

    <div class="modal-action">
      <button id="btnConfirmMoveStop" class="btn btn-warning">ยืนยัน</button>
>>>>>>> 5567cd8 (feat: enhance bus overtime UI with improved table structures and modal functionality)
      <form method="dialog">
        <button class="btn">ยกเลิก</button>
      </form>
    </div>
  </div>
</dialog>
<<<<<<< HEAD

=======
>>>>>>> 5567cd8 (feat: enhance bus overtime UI with improved table structures and modal functionality)
<input type="hidden" id="moveStopId" />
<input type="hidden" id="moveCurrentLineId" />
@endsection


@section('scripts')
<script type="module" src="{{ $_ENV['APP_JS'] }}/bus_overtime.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection


@section('styles')
<style>
/* =========================
   CARD / PANEL
========================= */
.bus-panel {
  background: #ffffff;
  border: 1px solid #d9dee7;
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}

.bus-panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

.bus-panel-title small {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

/* =========================
   DATATABLE BASE
========================= */
.bus-table-wrap .dataTables_wrapper {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.bus-table-wrap table.dataTable {
  width: 100% !important;
  border-collapse: separate !important;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid #d7dee7;
  border-radius: 14px;
}

.bus-table-wrap table.dataTable thead th {
  color: #fff !important;
  font-weight: 700;
  font-size: 13px;
  padding: 12px 10px;
  border-bottom: none !important;
}

.bus-table-wrap table.dataTable tbody td {
  padding: 11px 10px;
  font-size: 14px;
  color: #0f172a;
  border-bottom: 1px solid #edf2f7 !important;
  background: #fff;
  vertical-align: middle;
}

.bus-table-wrap table.dataTable tbody tr:last-child td {
  border-bottom: none !important;
}

.bus-table-wrap table.dataTable tbody tr {
  transition: 0.18s ease;
}

.bus-table-wrap table.dataTable tbody tr:hover td {
  background: #f8fafc;
}

.bus-table-wrap td.text-center,
.bus-table-wrap th.text-center {
  text-align: center !important;
}

/* =========================
   TABLE COLOR THEMES
========================= */

/* BUS LINE = emerald */
.bus-table-line table.dataTable thead th {
  background: linear-gradient(90deg, #10b981, #14b8a6);
}

/* BUS STOP = sky */
.bus-table-stop table.dataTable thead th {
  background: linear-gradient(90deg, #0ea5e9, #2563eb);
}

/* BUS PASSENGER = violet */
.bus-table-passenger table.dataTable thead th {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

/* =========================
   SELECTED ROW
========================= */
.line-selected td {
  background: #ecfdf5 !important;
}

.line-selected td:first-child {
  box-shadow: inset 4px 0 0 #10b981;
}

.stop-selected td {
  background: #eff6ff !important;
}

.stop-selected td:first-child {
  box-shadow: inset 4px 0 0 #2563eb;
}

.passenger-selected td {
  background: #f5f3ff !important;
}

.passenger-selected td:first-child {
  box-shadow: inset 4px 0 0 #7c3aed;
}

/* =========================
   BUS NAME BADGE (แบบรูป 2)
========================= */
.bus-line-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  line-height: 1;
  color: #854d0e;
  background: linear-gradient(180deg, #fde68a, #fcd34d);
  border: 1px solid #f59e0b;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55);
}

.bus-line-name::before {
  content: "🚌";
  font-size: 14px;
  line-height: 1;
}

/* ถ้าเป็น VAN */
.bus-line-name.is-van {
  color: #6b21a8;
  background: linear-gradient(180deg, #f5d0fe, #e9d5ff);
  border-color: #d8b4fe;
}

.bus-line-name.is-van::before {
  content: "🚐";
}

/* ถ้าเป็น BUS */
.bus-line-name.is-bus {
  color: #92400e;
  background: linear-gradient(180deg, #fde68a, #fef3c7);
  border-color: #facc15;
}

/* =========================
   SMALL BADGES
========================= */
.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.type-badge.bus {
  background: #dbeafe;
  color: #1d4ed8;
}

.type-badge.van {
  background: #fae8ff;
  color: #a21caf;
}

.pax-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  color: #075985;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
}

/* =========================
   LABEL SELECTED TEXT
========================= */
.selected-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
</style>
@endsection
