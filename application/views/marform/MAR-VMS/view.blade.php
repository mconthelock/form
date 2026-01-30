@extends('layouts/webflowTemplate')
@section('styles')
<style>
 
</style>
@endsection
@section('contents')

<form id="form-submit" method="post" enctype="multipart/form-data" class="space-y-6 font-sans">
<input type="hidden" id="cyear2" name="cyear2" value="{{ $CYEAR2 }}"/>
<input type="hidden" id="nrunno" name="nrunno" value="{{ $NRUNNO }}"/>
<div id="tab-submit" class="tab-pane w-full max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="grid grid-cols-3 gap-4 p-4 bg-white rounded-xl shadow-md text-sm h-40">
      <!-- Left Side -->
      <div class="col-span-2 grid gap-y-2 h-full">
        <!-- Attn -->
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="font-semibold text-gray-700">Attn:</span>
          <span class="text-gray-900 break-words" data-field="attn">{{ (isset($head['ATT']) && !empty($head['ATT'])) ? $head['ATT']:'' }}</span>
        </div>

        <!-- CC -->
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="font-semibold text-gray-700">CC:</span>
          <span class="text-gray-900 break-words" data-field="cc">{{ (isset($head['CC']) && !empty($head['CC'])) ? $head['CC']:'' }}</span>
        </div>

        <div class="flex-1"></div>

        <!-- Purpose of visit -->
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="font-semibold text-gray-700">Purpose of visit:</span>
          <span class="text-gray-900" data-field="purpose">{{ (isset($head['PURPOSEVISIT']) && !empty($head['PURPOSEVISIT'])) ? $head['PURPOSEVISIT']:'' }}</span>
        </div>
      </div>

      <!-- Right Side -->
      <div class="col-span-1 flex flex-col justify-between space-y-1 h-full">
      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Issue Date:</span>
        <span class="text-gray-900" data-field="issueDate">{{ (isset($head['ISSUEDATE']) && !empty($head['ISSUEDATE'])) ? $head['ISSUEDATE']:'' }}</span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Ref. No.:</span>
        <span class="text-gray-900" data-field="refno">{{ (isset($head['REFNO']) && !empty($head['REFNO'])) ? $head['REFNO']:'' }}</span>
      </div>
      @php
          $shortnm = "";
          if (isset($head['ISSUEBY'])&&!empty($head['ISSUEBY'])){
              $parts = preg_split('/\s+/', trim($head['ISSUEBY']));
              if (count($parts) >= 3) {
                  $shortnm = $parts[0] . " " . $parts[1] . " " . $parts[2][0] . ".";
              }
          }
      @endphp
      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Issued by:</span>
        <span class="text-gray-900" data-field="issueby">{{  $shortnm }}</span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Visit date:</span>
        <span class="text-gray-900" data-field="visitdate" >{{ (isset($head['VISITDATE']) && !empty($head['VISITDATE'])) ? $head['VISITDATE'] : '' }} </span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Reception room:</span>
        <span class="text-gray-900" data-field="receptroom" >{{ (isset($head['RECEPTROOM']) && !empty($head['RECEPTROOM'])) ? $head['RECEPTROOM'] : '' }}</span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">No. of visitors:</span>
        <span class="text-gray-900" data-field="visitor">{{ (isset($head['VISITOR_COUNT']) && !empty($head['VISITOR_COUNT'])) ? $head['VISITOR_COUNT'] : '' }}</span>
      </div>
      </div>
    </div>

  <!-- Visitor Information -->
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
    <h2 class="font-semibold text-lg">Visitor Information</h2>
    </div>
    <table class="w-full border border-gray-300 text-sm mt-3 table-auto">
      <thead class="bg-blue-50 text-gray-700">
        <tr>
          <th class="border border-gray-300 px-3 py-2">No.</th>
          <th class="border border-gray-300 px-3 py-2">Country</th>
          <th class="border border-gray-300 px-3 py-2">Company</th>
          <th class="border border-gray-300 px-3 py-2">Name</th>
          <th class="border border-gray-300 px-3 py-2">Position</th>
          <th class="border border-gray-300 px-3 py-2">Experience</th>
        </tr>
      </thead>
      <tbody id="visitor-body" class="text-gray-900">
      @forelse($visitint as $i => $v)
        <tr>
            <td class="border px-2">{{ $i + 1 }}</td>
            <td class="border px-2">{{ $v->COUNTRY }}</td>
            <td class="border px-2">{{ $v->COMPANY }}</td>
            <td class="border px-2">{{ $v->NAME }}</td>
            <td class="border px-2">{{ $v->POSITION }}</td>
            <td class="border px-2">{{ $v->VISITEXP === "Y" ? "Yes" : "No" }}</td>
        </tr>
      @empty
        <tr>
            <td class="border px-2 text-center" colspan="6">No Data</td>
        </tr>
      @endforelse
      </tbody>

    </table>
  </div>

  <!-- Schedule -->
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
    <h2 class="font-semibold text-lg">Schedule</h2>
    </div>
    <table class="w-full border border-gray-300 text-sm mt-3 table-auto">
      <thead class="bg-blue-50 text-gray-700">
        <tr>
          <th class="border border-gray-300 px-3 py-2 w-40">Time</th>
          <th class="border border-gray-300 px-3 py-2">Place</th>
          <th class="border border-gray-300 px-3 py-2">Content</th>
          <th class="border border-gray-300 px-3 py-2">AMEC Participants</th>
          <th class="border border-gray-300 px-3 py-2">Note</th>
        </tr>
      </thead>
      <tbody id="schedule-body" class="text-gray-900">
      @forelse($schedule as $s)
        <tr>
            <td class="border px-2 w-40">{{ $s->SCHSTIME.'-'.$s->SCHETIME }}</td>
            <td class="border px-2">{{ $s->PLACE }}</td>
            <td class="border px-2">{{ $s->CONTENT }}</td>
            <td class="border px-2">{{ $s->AMECP }}</td>
            <td class="border px-2">{{ $s->NOTE }}</td>
            
        </tr>
      @empty
        <tr>
            <td class="border px-2 text-center" colspan="6">No Data</td>
        </tr>
      @endforelse
      </tbody>
    </table>
  </div>

  <!-- Request Items -->
  <div class="bg-white rounded-2xl shadow-lg p-6 space-y-6">
    <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
    <h2 class="font-semibold text-lg">Request Items</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Left Column: Arranged by G/P -->
      <div class="bg-gray-50 p-4 rounded-xl shadow-inner space-y-4">
        <h3 class="font-semibold text-sm text-blue-600">Arranged by G/P</h3>

        <div class="border rounded-lg p-3 text-sm bg-white shadow-sm">
          <div class="font-semibold mb-1">Welcome Board</div>
          <span class="text-gray-900" data-field="board">{{ !empty($item) && isset($item[0]->BOARD) ? ($item[0]->BOARD == "Y" ? 'Yes' : 'No') : '' }}</span>
          <span class="sfile text-blue-600" data-field="filename">
          {!! !empty($item) && isset($item[0]->SFILE) ? '<a href="'.base_url('marform/MAR-VMS/form/mdownload/').$NFRMNO.'_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.substr($item[0]->SFILE,13).'/'.$item[0]->SFILE.'" target="_blank" class="text-blue-600 hover:text-blue-800 underline">'.$item[0]->SFILE.'</a>': '' !!}
  
        </span>
        </div>

        <div class="border rounded-lg p-3 text-sm bg-white shadow-sm">
          <div class="font-semibold mb-2 text-blue-600" data-field="roomlunch">{{ !empty($item) && isset($item[0]->ROOMLUNCH)? $item[0]->ROOMLUNCH : '' }}</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">Date:</span>
                <span class="text-gray-900" data-field="roomdate">{{ !empty($item) ? $head['VISITDATE'] : '' }}</span>
              </div>
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">Time:</span>
                <span class="text-gray-900" data-field="roomtime">{{ !empty($item) ? $head['LUNCHTIME'] : '' }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">No. of Visitors:</span>
                <span class="text-gray-900" data-field="visitlunch">{{ !empty($item) && isset($item[0]->VISITORS)? $item[0]->VISITORS: '' }} </span>
              </div>
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">No. of AMEC:</span>
                <span class="text-gray-900" data-field="ameclunch">{{ !empty($item) && isset($item[0]->AMEC)? $item[0]->AMEC: '' }} </span>
              </div>
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">Total:</span>
                <span class="text-gray-900" data-field="totlunch">{{ !empty($item)?  ($item[0]->VISITORS + $item[0]->AMEC):''  }}</span>
              </div>
            </div>
            @php 
              $dietList = [];
              $dietText = "";
                foreach ($dietary as $d) {
                    if (!empty($d->DIETREQ)) {
                        $dietList[] = $d->DIETREQ . " (" . $d->CNT . ")";
                    }
                }
                $dietText = implode(", ", $dietList);
            @endphp
            <div class="md:col-span-2 grid grid-cols-[auto_1fr] gap-x-2">
              <span class="font-semibold text-gray-700">Dietary Restrictions:</span>
              <span class="text-gray-900" data-field="roomdietary">{{ $dietText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Arranged by Visitor's Host -->
      <div class="bg-gray-50 p-4 rounded-xl shadow-inner space-y-3">
        <h3 class="font-semibold text-sm text-blue-600">Arranged by Visitor's Host</h3>

        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="text-sm font-semibold text-gray-700 w-32">Hotel Reservation:</span>
          <span class="text-sm text-gray-900" data-field="hotelname">{{ !empty($item) && isset($item[0]->HOTELNAME)? $item[0]->HOTELNAME: '' }}</span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="text-sm font-semibold text-gray-700 w-32">Shop tour:</span>
          <span class="text-sm text-gray-900" data-field="shoptour">{{ 
    !empty($item) && isset($item[0]->SHOPTOUR) 
        ? ($item[0]->SHOPTOUR == "G" 
            ? 'General' 
            : ($item[0]->SHOPTOUR == "I" 
                ? "Inspection" 
                : "Specific"
              )
          ) 
        : '' 
}}</span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="text-sm font-semibold text-gray-700 w-32">Form C1-1:</span>
          <span class="text-sm text-gray-900" data-field="formc1_1">{{ 
    !empty($item) && isset($item[0]->FORMC1_1) 
        ? ($item[0]->FORMC1_1 == "Y" ? 'Yes' : 'No') 
        : '' 
}}</span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="text-sm font-semibold text-gray-700 w-32">Car reservation:</span>
          <span class="text-sm text-gray-900" data-field="car">
          {{ 
            !empty($item) && isset($item[0]->CARHOTEL) ? ($item[0]->CARHOTEL == "Y" ? 'Yes' : 'No') : '' 
          }}
          </span>
        </div>
        @php
            $html="";
            if (!empty($ent)) {
            $links = [];
            foreach ($ent as $e) {
                $url = base_url('gpform/GP-ENT') . "/main?sr=4&no=9&orgNo=030101&y=25"
                . "&y2=" . $e->ENTCYEAR2
                . "&runNo=" . $e->ENTNRUNNO;

            $links[] = '<a href="' . $url . '" target="_blank" '
                    . 'class="text-blue-600 hover:text-blue-800 underline">'
                    . '[' . $e->REQENT . ']</a>';
                }
                $html = implode(', ', $links);
                }
            @endphp
        <div class="md:col-span-2">
        <span class="text-sm font-semibold text-gray-700 w-32">Entertainment Form:</span>
          <span class="text-sm text-gray-900" data-field="formreqent">{!! $html !!}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Projects (Vertical Stack) -->
  <div class="space-y-6">

    <div class="bg-white rounded-2xl shadow-lg p-6">
      <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
      <h2 class="font-semibold text-lg">Secured Projects</h2>
      </div>
      <table class="w-full border border-gray-300 text-sm mt-3 table-auto">
        <thead class="bg-blue-50 text-gray-700">
          <tr>
            <th class="border border-gray-300 px-3 py-2 w-48">Project No.</th>
            <th class="border border-gray-300 px-3 py-2 w-72">Project Name</th>
            <th class="border border-gray-300 px-3 py-2 w-96">Model</th>
            <th class="border border-gray-300 px-3 py-2 w-96">Specification</th>
            <th class="border border-gray-300 px-3 py-2 w-40">No. of Units</th>
            <th class="border border-gray-300 px-3 py-2 w-48">Status</th>
          </tr>
        </thead>
        <tbody id="sproject-body" class="text-gray-900">
        @php $tot =0; @endphp
        @foreach($sproj as $s)
              <tr>
              <td class="border px-2">{{ $s->PROJNO }}</td>
              <td class="border px-2">{{ $s->PROJNAME }}</td>
              <td class="border px-2">{{ $s->MODEL }}</td>
              <td class="border px-2">{{ $s->SPEC }}</td>
              <td class="border px-2 text-center">{{ $s->QTY }}</td>
              <td class="border px-2 text-center">{{ $s->STATUS }}</td>
            </tr>
            @php $tot += $s->QTY; @endphp
        @endforeach
            <tr class="bg-blue-50 text-gr">
                <td colspan="4" class="border px-2 text-right font-bold">Total</td>
                <td class="border px-2 text-center font-bold">{{ $tot }}</td>
                <td class="border px-2"></td>
            </tr>
        </tbody>
      </table>
    </div>

    <div class="bg-white rounded-2xl shadow-lg p-6">
      <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
      <h2 class="font-semibold text-lg">Prospective Projects</h2>
      </div>
      <table class="w-full border border-gray-300 text-sm mt-3 table-auto">
        <thead class="bg-blue-50 text-gray-700">
          <tr>
            <th class="border border-gray-300 px-3 py-2 w-48">Project No.</th>
            <th class="border border-gray-300 px-3 py-2 w-72">Project Name</th>
            <th class="border border-gray-300 px-3 py-2 w-96">Model</th>
            <th class="border border-gray-300 px-3 py-2 w-96">Specification</th>
            <th class="border border-gray-300 px-3 py-2 w-40">No. of Units</th>
            <th class="border border-gray-300 px-3 py-2 w-48">Status</th>
          </tr>
        </thead>
        <tbody id="pproject-body" class="text-gray-900">
        @php $tot =0; @endphp
        @foreach($pproj as $p)
              <tr>
              <td class="border px-2">{{ $p->PROJNO }}</td>
              <td class="border px-2">{{ $p->PROJNAME }}</td>
              <td class="border px-2">{{ $p->MODEL }}</td>
              <td class="border px-2">{{ $p->SPEC }}</td>
              <td class="border px-2 text-center">{{ $p->QTY }}</td>
              <td class="border px-2 text-center">{{ $p->STATUS }}</td>
            </tr>
            @php $tot += $p->QTY; @endphp
        @endforeach
            <tr class="bg-blue-50 text-gr">
                <td colspan="4" class="border px-2 text-right font-bold">Total</td>
                <td class="border px-2 text-center font-bold">{{ $tot }}</td>
                <td class="border px-2"></td>
            </tr>
        </tbody>
      </table>
    </div>

  </div>
  <div class="flex justify-end space-x-2 mt-6">
      <button type="button" data-tab="submit" 
        class="export-btn flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 
         text-white px-6 py-2 rounded-xl text-sm font-semibold
         shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700
         transition-all duration-300">
        Export
      </button>
  </div>
</div>
</form>





@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/vmsview.js?ver={{ $GLOBALS['version'] }}"></script>
    
@endsection
