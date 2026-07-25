@extends('layouts/webflowTemplate')
@section('styles')
    <style>


</style>
@endsection
@section('contents')
@php
  $MODE_ADD = "1";
  $MODE_EDIT = "2";
  $MODE_VIEW = "3";
@endphp
    <div id="loading-overlay"
        style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.85); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{ base_url() }}assets/images/loading_gif.gif" alt="Loading..." width="120">
        </div>
    </div>
    <div class="bg-white rounded-md shadow-md border border-gray-200">

<!-- ===== Header ===== -->
<div class="text-center py-5 border-b border-gray-200">
    <h1 class="text-xl font-semibold tracking-wide text-blue-900">
        MITSUBISHI ELEVATOR ASIA CO., LTD.
    </h1>
    <p class="mt-1 text-base font-semibold text-blue-900">
        Changing Notice
    </p>
</div>
<!-- ===== Content ===== -->
<div class="p-4  space-y-0">
<div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}"
        data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $empno }}" ></div>
<form id="cn-form" method="post" enctype="multipart/form-data"> 
<input type="hidden" name="cextData" id="cextData" value="{{ $strcextData }}" />
<input type="hidden" name="mstatus" id="mstatus" value="{{ $cnform->MSTATUS }}" />
<input type="hidden" name="chkopr" id="chkopr" value="{{ $chkopr }}" />
<input type="hidden" name="demapv" id="demapv" value="{{ $demapv }}" />
<input type="hidden" name="empno" id="empno" value="{{ $empno }}" />
<input type="hidden" name="stepready" id="stepready" value="{{ !empty($stepready) ? $stepready[0]->CSTEPNO : '' }}" />


<div class="w-full border border-gray-300 text-sm font-sans">
    
    <style>
        .force-w-350 {
            width: 350px !important;      /* บังคับกว้าง 250px */
            min-width: 350px !important;  /* ห้ามเล็กกว่า 250px */
            max-width: 350px !important;  /* ห้ามใหญ่กว่า 250px */
            white-space: normal !important; /* บังคับตัดบรรทัด */
            word-wrap: break-word !important; /* ตัดคำยาวๆ ลงมา */
            background-color: #9CA2CB;
            color: white;
            padding: 4px 8px;
            font-weight: 600;
            border-bottom: 1px solid white;
            vertical-align: top;
        }
    </style>

    <table class="w-full border-collapse table-fixed">
        
        <colgroup>
            <col style="width: 350px;">
            <col style="width: auto;">
        </colgroup>

        <tr>
            <td class="force-w-350">Form No.</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
            {{ $formno }}
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Input by</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
            {{ '(' . $cnform->VINPUTER . ') ' . $cnform->INPNAME }}
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Request by</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                {{ '(' . $cnform->VREQNO . ') ' . $cnform->REQNAME }}
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Title</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <input type="text" name="txtTitle" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="{{ $cnform->TITLE ?? 'New item' }}" maxlength="256">
            @else
                {{ $cnform->TITLE }}
            @endif
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Order No.</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <input type="text" name="txtOrder" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="{{ $cnform->ORDERNO ?? 'New item' }}" maxlength="9" maxlength>
            @else
                {{ $cnform->ORDERNO }}
            @endif
                
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Item</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            {{--  @if (
                ($mode == $MODE_EDIT && $cextData >= 2 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <input type="text" name="txtItemno" 
                       class="w-36 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="{{ $cnform->ITEMNO }}" maxlength="3" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
             @else
                {{ $cnform->ITEMNO }}
            @endif    
            </td>
        </tr>

        <tr>
            <td class="force-w-350 align-top pt-2">Drawing No</td>
            <td class="p-2 bg-white border-b border-white">
                <table class="w-4/5  text-center text-xs">
                    <thead>
                        <tr class="text-white" style="background-color: #009688;">
                            <th class="py-1 border-r border-white w-[700px] font-normal">DWG No.</th>
                            <th class="py-1 border-r border-white w-16 font-normal">OK</th>
                            <th class="py-1 border-r border-white w-16 font-normal">NG</th>
                            <th class="py-1 font-normal">Remark</th>
                        </tr>
                    </thead>
                    <tbody  id="dwg-body">
                    @php
                        $cnt = 0;
                    @endphp
                    @foreach ($resultdwg as $d)
                    <tr class="dwg-template text-white" style="background-color: #8BC34A;">
                    <td class="py-1 border-r border-white font-bold text-blue-900">
                        @if ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                        @php
                            $parts = explode(' ', $d->DWGNO);
                            $dwg = $parts[0] ?? ''; 
                            $g = $parts[1] ?? ''; 
                            $l = $parts[2] ?? ''; 
                        @endphp
                            <span><input type="text" name="txtDwgNo[]" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $dwg }}" maxlength="9">
                            <input type="text" name="txtG[]" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $g }}">
                            <input type="text" name="txtL[]" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $l }}"></span>
                            <span class="px-2">Rev no. :</span>
                            <span>
                                 <input type="text" name="revNo[]" 
                            class="w-20 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ (!empty($d->REVNO))? $d->REVNO:'' }}">
                      
                            </span>
                        @else
                         <span>{{ $d->DWGNO.(!is_null($d->REVNO)? " (".$d->REVNO.")":"" ) }}</span>
                        @endif  
                    
                        <!-- <span class="px-2">Rev no. :</span>
                        <span>
                            @if ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                                 <input type="text" name="revNo[]" 
                            class="w-20 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ (!empty($d->REVNO))? $d->REVNO:'' }}">
                            @else
                                {{ (!empty($d->REVNO))? $d->REVNO:"" }}
                            @endif  
                        </span> -->
                        
                        @if ((($cextData >= 1) && ($cextData <= 3)) || ($cextData == 6)|| ($cextData == 7))
                              <span class="px-2 text-red-600 font-semibold">
                                <a class="btn-open  cursor-pointer" data-dwg="{{ strtoupper(substr($d->DWGNO, 0, 9)) }}" data-rev="{{ $d->REVNO }}" >openfile</a>
                             </span>
                             
                         @endif
                        @if ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                        <span class="px-2">
                        <button type="button"  data-table = "dwg-body" class="text-red-500 hover:text-red-700 cursor-pointer del-table-row" >✕</button>  
                        </span>
                        @endif  
                    </td>
                    <td class="py-1 border-r border-white">
                      @if ($d->RESULT == '0')
                            @if (($mode == $MODE_EDIT) &&  ((($cextData >= 3) && ($cextData < 6)) || ($cextData == 7) || (($cextData == 2) && ($chkopr)) ) )
                                <span><input type='radio' name="radDwg{{ $cnt }}" class="h-4 w-4 radDwg" value="0" checked /></span>
                            @else
                              <span class="inline-block bg-green-100 text-green-700 px-2 py-1 text-sm rounded-full font-semibold">✔</span>
                            @endif 
                      @else
                             @if (($mode == $MODE_EDIT) &&  ((($cextData >= 3) && ($cextData < 6)) || ($cextData == 7) || (($cextData == 2) && ($chkopr)) ) )
                                <span><input type='radio' name="radDwg{{ $cnt }}" class="h-4 w-4 radDwg" value="0" /></span>
                            @endif 
                      @endif
                    </td>
                    <td class="py-1 border-r border-white">
                    @if ($d->RESULT == '1')
                             @if (($mode == $MODE_EDIT) &&  ((($cextData >= 3) && ($cextData < 6)) || ($cextData == 7) || (($cextData == 2) && ($chkopr)) ) )
                                <span><input type='radio' name="radDwg{{ $cnt }}" class="h-4 w-4 radDwg" value="1" checked /></span>
                            @else
                              <span class="inline-block bg-red-100 text-red-700 px-2 py-1 text-sm rounded-full font-semibold">✘</span>
                            @endif 
                     @else
                            @if (($mode == $MODE_EDIT) &&  ((($cextData >= 3) && ($cextData < 6)) || ($cextData == 7) || (($cextData == 2) && ($chkopr)) ) )
                                <span><input type='radio' name="radDwg{{ $cnt }}" class="h-4 w-4 radDwg" value="1" /></span>
                            @endif 
                      @endif
                    </td>
                    <td class="py-1 text-black">
                        @if (($mode == $MODE_EDIT) &&  ((($cextData >= 3) && ($cextData < 6)) || ($cextData == 7) || (($cextData == 2) && ($chkopr)) ) )
                            <input type="text" name="txtDwgRem{{ $cnt }}" 
                            class="w-2/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $d->REMARK }}">
                        @else
                            {{ $d->REMARK }}
                        @endif 
                    </td>
                     </tr>
                     @php
                        $cnt++;
                     @endphp
                     @endforeach
                      <input type="hidden" name="cnt" value="{{ $cnt }}" />
                    </tbody>
                    @if ((($form[0]->CST == "0") ||  ($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                    <tfoot>
							<tr>
								<td colspan="4" style="text-align:right" >
                                <button type="button" data-table = "dwg-body" class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded shadow cursor-pointer add-table-row">
      + Add Row
    </button>
                                </td>
							</tr>
					</tfoot>
                    @endif 
                </table>
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Part Name</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <input type="text" name="txtPrtName" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="{{ $cnform->PRTNAME }}" maxlength="256">
            @else
                    {{ $cnform->PRTNAME }}    
            @endif           
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Pur Item No.</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
             {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <input type="text" name="txtPurItem" 
                       class="w-48 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="{{ $cnform->PURITEM }}" maxlength="10" >
            </td>
            @else
             <input type="hidden" name="txtPurItem" 
                       value="{{ $cnform->PURITEM }}" >
                    {{ $cnform->PURITEM }}    
            @endif  
        </tr>

        <tr>
            <td class="force-w-350">PO. or Invoice no.</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
          {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )  --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <input type="text" name="txtInvNo" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="{{ $cnform->INVNO }}" maxlength="90" >
            @else
              <input type="hidden" name="txtInvNo" 
                       
                       value="{{ $cnform->INVNO }}" >
                    {{ $cnform->INVNO }}    
            @endif  

            </td>
        </tr>

        <tr>
            <td class="force-w-350">Order Quantity</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
           {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <input type="text" name="txtOrdQ" 
                       class="w-24 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="{{ $cnform->ORDQ }}" maxlength="15" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            @else
                    {{ $cnform->ORDQ }}    
            @endif  
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Supplier or subcontractor name</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if(((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <input type="text" name="txtSupName" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="{{ $cnform->SVENDNAME }}">
            @else
                    {{ $cnform->SVENDNAME }}    
            @endif      
                
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Classification of changing</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <div class="flex flex-col space-y-1">
                @foreach ($cncls as $c)
                     <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="chkClass" class="h-4 w-4" value="{{ $c->CLSNO }}"  {{ ($cnform->CLSNO == $c->CLSNO) ? 'checked' : '' }}  >
                        <span>{{ $c->CLSCHANGE }}   </span>
                    </label>
                @endforeach
                </div>
             @else
                    {{ $cnform->CLSCHANGE }}<span> <input type="hidden" name="chkClass" class="h-4 w-4" value="{{ $cnform->CLSNO }}" /></span>    
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2">Reason</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <div class="flex flex-col space-y-1">
                    @foreach ($cnreason as $r)
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radReason" class="h-4 w-4" value="{{ $r->RSNNO}}"  {{ ($cnform->RSNNO == $r->RSNNO) ? 'checked' : '' }}  >
                        <span>{{ $r->REASON }}</span>
                        @if($r->RSNNO == "5")
                        <span class="px-2 inline-block w-[450px]"><input type="text" name="txtOther" id="txtOther" value="{{ $cnform->RSNOTHER }}"  class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm" /></span>
                        @endif
                    </label>

                    @endforeach
                </div>
            @else
                {{ $cnform->REASON." ".$cnform->RSNOTHER }}
            @endif 
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2">Sample transaction</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <div class="flex flex-col space-y-1">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="1"  {{ ($cnform->TRANSNO == "1") ? 'checked' : '' }}  >
                        <span class="w-20">Scrap</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="2"  {{ ($cnform->TRANSNO == "2") ? 'checked' : '' }}  >
                        <span class="w-20">Return to</span><span class="px-2 inline-block w-[450px]"><input type="text" name="txtReturn" id="txtReturn" value="{{ $cnform->TRANSNO == 2 ? $cnform->DETTRANS :'' }}"  class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm" /></span>
                  
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="3"  {{ ($cnform->TRANSNO == "3") ? 'checked' : '' }}  >
                        <span class="w-20">Other</span><span class="px-2 inline-block w-[450px]"><input type="text" name="txtOth" id="txtOth" value="{{ $cnform->TRANSNO == 3 ? $cnform->DETTRANS :'' }}"  class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm" /></span>
                  
                    </label>
                </div>
            @else
                {{ $cnform->TRANSNO == 1 ? 'Scrap' : ($cnform->TRANSNO == 2 ? 'Return to '.$cnform->DETTRANS : 'Other '.$cnform->DETTRANS) }}
            @endif 
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">RQ or CN No. for reference.</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                     <input type="text" name="txtNoRef" 
                       class="w-[250px] h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="{{ $cnform->RQCNREF }}" maxlength="20">
             @else
                    {{ $cnform->RQCNREF }}    
            @endif  
            </td>
        </tr>
        <tr class="bg-[#C5CCDC]"><td colspan="2" class="py-1 px-2 font-bold">Necessary Document submitted with changing notice<span class="px-2 text-red-600">(ชื่อไฟล์ต้องเป็นภาษาอังกฤษเท่านั้นและห้ามตัวอักษรพิเศษ)</span></td></tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Dwg. <span class="px-2 text-red-600">(Max 1500 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
            <div id="dvdwg" class="py-2 px-1 w-[600px]" >
                @foreach($attdwg as $d)
                                    <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                        <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                        @if (((($form[0]->CST == "0") || ($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])) || (($cextData == 3||$cextData == 2) && is_null($cnform->MSTATUS) && $mode == $MODE_EDIT ))
                                            <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                        @endif
                                    </div>
                @endforeach
            </div>
            @if (
                ($mode == $MODE_EDIT)
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div id="dvdwgFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="DWGFILE[]" data-map="DWGFILE" data-max-kb="1500"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="DWGFILE" data-var2="dvdwgFile" data-var3="1500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            @endif
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Material Certificate <span class="px-2 text-red-600">(Max 1000 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
            <div id="dvmat" class="py-2 px-1 w-[600px]" >
                @foreach($attmat as $d)
                                    <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                        <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                             @if (((($form[0]->CST == "0") || ($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])) || (($cextData == 3||$cextData == 2) && is_null($cnform->MSTATUS) && $mode == $MODE_EDIT ))
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (
                ($mode == $MODE_EDIT)
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div id="dvmatFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="MATFILE[]" data-map="MATFILE" data-max-kb="1000"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="MATFILE" data-var2="dvmatFile" data-var3="1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            @endif
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Maker Insp. Data</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
            <div id="dvmak" class="py-2 px-1 w-[600px]" >
                @foreach($attmaker as $d)
                                    <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                        <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                       @if (((($form[0]->CST == "0") || ($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])) || (($cextData == 3||$cextData == 2) && is_null($cnform->MSTATUS) && $mode == $MODE_EDIT ))
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (($mode == $MODE_EDIT)|| ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <div id="dvmakFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="MAKFILE[]" data-map="MAKFILE" 
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="MAKFILE" data-var2="dvmakFile">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            @endif
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">RoHS Certificate <span class="px-2 text-red-600">(Max 300 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
            <div id="dvroh" class="py-2 px-1 w-[600px]" >
                @foreach($attrohs as $d)
                                    <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                        <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                         @if (((($form[0]->CST == "0") || ($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])) || (($cextData == 3||$cextData == 2) && is_null($cnform->MSTATUS) && $mode == $MODE_EDIT ))
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (($mode == $MODE_EDIT)|| ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
                <div id="dvrohFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="ROHFILE[]" data-map="ROHFILE" data-max-kb="300"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="ROHFILE" data-var2="dvrohFile" data-var3="300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            @endif
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Pur. Spec. <span class="px-2 text-red-600">(Max 1000 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
            <div id="dvpur" class="py-2 px-1 w-[600px]" >
                @foreach($attpur as $d)
                                    <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                        <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                             @if (((($form[0]->CST == "0") || ($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])) || (($cextData == 3||$cextData == 2) && is_null($cnform->MSTATUS) && $mode == $MODE_EDIT ))
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (
                ($mode == $MODE_EDIT)|| ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div id="dvpurFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="PURFILE[]" data-map="PURFILE" data-max-kb="1000"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="PURFILE" data-var2="dvpurFile" data-var3="1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            @endif
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Sub-Contractor /Maker /AMEC Countermeasure<br>in case of 1st Sample "NG".<span class="px-2 text-red-600">(Max 1000 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
            <div id="dvsub" class="py-2 px-1 w-[600px]" >
                @foreach($attsubcon as $d)
                                    <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                        <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                            @if (((($form[0]->CST == "0") || ($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])) || (($cextData == 3||$cextData == 2) && is_null($cnform->MSTATUS) && $mode == $MODE_EDIT ))
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (
                ($mode == $MODE_EDIT)
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div id="dvsubFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="SUBFILE[]" data-map="SUBFILE" data-max-kb="1000"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="SUBFILE" data-var2="dvsubFile" data-var3="1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            @endif
            </td>
        </tr>
        <tr class="bg-[#C5CCDC]"><td colspan="2" class="py-1 px-2 font-bold">Contents of changing (Concretely, Briefly, with sketch if Necessary)</td></tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Part Arrive Date / Prod. Month</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="part_date" id="part_date" value="{{$cnform->PRDCTNAME}}"  />
    
             @else
                    {{ $cnform->PRDCTNAME }}    
                    @if($chkopr &&($cnform->MDATE !== null))
                        <span class="text-red-600 px-10">( Supplier or subcontractor status update : Yes </span><span class="text-red-600 px-10">Supplier or subcontractor update Date : {{ $cn->MDATE }}</span>
                    @endif
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Part Arrive Location</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
            <input type="text" class="w-48 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="txtprtLoc"  value="{{$cnform->PRTLOC}}"  />
    
             @else
                    {{ $cnform->PRTLOC }}    
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Before Changing</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
            <textarea name="txtBefChg" id="txtBefChg" rows="3" class="w-1/3 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req resize-none">{{ $cnform->BEFCHANGE }}</textarea>
         
            @else
                    {{ $cnform->BEFCHANGE }}    
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">After Changing</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
            <textarea name="txtAftChg" id="txtAftChg" rows="3" class="w-1/3 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req resize-none">{{ $cnform->AFTCHANGE }}</textarea>
         
             @else
                    {{ $cnform->AFTCHANGE }}    
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Possible Submitting Date</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))) 
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="submit_date" id="submit_date" value="{{$cnform->SSUBMITDATE}}"  />
    
             @else
                    {{ $cnform->SSUBMITDATE }}  
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Required Inspection Date</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="inspec_date" id="inspec_date" value="{{$cnform->SINSPECDATE}}"  />
    
             @else
                    {{ $cnform->SINSPECDATE }}  
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Expected Changing Date</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            {{-- @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            ) --}}
            @if (((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER])))
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="expchg_date" id="expchg_date" value="{{$cnform->SEXPCHGDATE}}"  />
    
             @else
                    {{ $cnform->SEXPCHGDATE }}  
            @endif  
            </td>
        </tr>
{{-- ส่วน J-Staff In Charge --}}
@if ($mode == $MODE_EDIT && $cextData == 1)
   @if (!$chkopr)
    <tr>
        <td class="force-w-350 align-top pt-2">Job Type
        <td class="px-3 py-1 bg-gray-100 border-b border-white">
            <div class="flex items-center gap-4 h-8">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="selJobType" value="S" 
                        class="w-4 h-4 text-sky-500 focus:ring-1 focus:ring-sky-400 border-gray-300"
                        {{ in_array($reqinf[0]->SDEPCODE ?? '', ['050501', '051401']) ? 'checked' : '' }}>
                    <span class="text-gray-700">Sub</span>
                </label>

                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="selJobType" value="B" 
                        class="w-4 h-4 text-sky-500 focus:ring-1 focus:ring-sky-400 border-gray-300"
                        {{ ($reqinf[0]->SDEPCODE ?? '') == '090501' ? 'checked' : '' }}>
                    <span class="text-gray-700">Bulk</span>
                </label>
            </div>
        </td>
    </tr>
   @endif
    <tr>
        <td class="force-w-350 align-top pt-2">J-Staff In Charge</td>
        <td class="px-3 py-1 bg-gray-100 border-b border-white">
            <select name="selJInchrg" class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm">
                @foreach ($jstaff as $s)
                    <option value="{{ $s->SEMPNO }}">
                        {{ $s->SNAME }}
                    </option>
                @endforeach
            </select>
        </td>
    </tr>

    {{-- ส่วน Engineer In Charge --}}
    <tr>
        <td class="force-w-350 align-top pt-2">Engineer In Charge</td>
        <td class="px-3 py-1 bg-gray-100 border-b border-white">
            <select name="selEInchrg" class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm">
                @foreach ($eng as $e)
                    <option value="{{ $e->SEMPNO }}">{{ $e->SNAME }}</option>
                @endforeach
            </select>
        </td>
    </tr>
@endif

@if (($mode == $MODE_EDIT) && ($cextData == 6) && !is_null($cnform->MSTATUS))
    <tr>
        <td class="force-w-350 align-top pt-2 " style="padding:5px;">Change To</td>
        <td class="px-3 py-1 bg-gray-100 border-b border-white">
             <select name="Foreman" id="Foreman" class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm">
                 <option value="">--------------------Foreman--------------------</option>
                @foreach ($foreman as $f)
                    <option value="{{ $f->SEMPNO }}">{{ $f->SNAME }}</option>
                @endforeach
            </select>
        </td>
    </tr>     
@endif

@if (($mode == $MODE_EDIT) && (($cextData == 2)||($cextData == 7)))
    <tr>
        <td class="force-w-350 align-top pt-2 " style="padding:5px;">Change To</td>
        <td class="px-3 py-1 bg-gray-100 border-b border-white">
             <select name="Pic" id="Pic" class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm">
                 <option value="">----------------------------------------</option>
                @foreach ($pic as $p)
                    <option value="{{ $p->SEMPNO }}">{{ $p->SNAME }}</option>
                @endforeach
            </select>
        </td>
    </tr>     
@endif

{{-- ส่วน Operator --}}
@if ($mode == $MODE_EDIT && $cextData == 6)
    <tr>
        <td class="force-w-350 align-top pt-2">Operator</td>
        <td class="px-3 py-1 bg-gray-100 border-b border-white">
            <select name="Operator" id="Operator" class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm">
                @foreach ($opr as $o)
                    <option value="{{ $o->SEMPNO }}">{{ $o->SNAME }}</option>
                @endforeach
            </select>
        </td>
    </tr>
@endif



{{-- ส่วน Check Sheet & Files --}}
@if ($form[0]->CST <> "0")
    <tr>
        <td class="force-w-350 align-top pt-2 " style="padding:5px;">Check Sheet</td>
        <td class="px-3 py-1 bg-gray-100 border-b border-white">
        <div id="dvchk" class="py-2 px-1 w-[600px]" >
                @foreach($attchk as $d)
                                    <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                        <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                           @if (($mode == $MODE_EDIT) && ($cextData >= 2) && ($cextData < 8))
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (($mode == $MODE_EDIT) && ($cextData >= 2) && ($cextData < 8))
                <div id="dvchkFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="CHKFILE[]" data-map="CHKFILE"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="CHKFILE" data-var2="dvchkFile">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            @endif
        </td>
    </tr>


    {{-- ส่วน Judgement --}}
    <tr>
        <td class="force-w-350 align-top pt-2" valign="top">Judgement</td>
        
        @if ($mode == $MODE_EDIT && (($cextData >= 2 && $cextData < 8 && $cnform->MSTATUS <> "1")||(($cextData == 7 || $cextData == 3) && $cnform->MSTATUS == "1")))
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
                @foreach ($cnjudg as $j)
                    @php
                        $isMainInteger = !str_contains($j->JDGMNTNO, '.');
                        $firstChar = substr($j->JDGMNTNO, 0, 1);
                    @endphp

                    {{-- Logic การแสดงผล Radio Button --}}
                    @if ($isMainInteger && in_array($j->JDGMNTNO, [1, 2]))
                        <label class="inline-flex items-center mr-3">
                            <input type="radio" name="radJudge" value="{{ $j->JDGMNTNO }}" 
                                   {{ $cnform->JDGMNTNO == $j->JDGMNTNO ? 'checked' : '' }}
                                   class="form-radio h-4 w-4 text-sky-600">
                            <span class="ml-2">{{ $j->JUDGEMENT }}</span>
                        </label>

                        @if ($j->JDGMNTNO == 2) <br/><span class="text-blue-700 font-bold">Not Accept</span> @endif
                    @elseif (!$isMainInteger && ($firstChar == 2 || $firstChar == 4))
                        @if ($j->JDGMNTNO == 4.1) <span class="text-blue-700 font-bold">Cancel</span><br/> @endif
                        <label class="inline-flex items-center mr-3">
                            <input type="radio" name="radJudge" value="{{ $j->JDGMNTNO }}" 
                                   {{ $cnform->JDGMNTNO == $j->JDGMNTNO ? 'checked' : '' }}
                                   class="form-radio h-4 w-4 text-sky-600">
                            <span class="ml-2">{{ $j->JUDGEMENT }}</span>
                        </label>

                        {{-- Case 4.1: Upload File --}}
                        @if ($j->JDGMNTNO == 4.1)
                        <div id="dvmak" class="py-2 px-1 w-[600px]" >
                            @foreach($attjud as $d)
                                                <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                                    <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                           
                                                    <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                                        
                                                </div>
                            @endforeach
                        </div>
                        <div id="dvjudFile" class="pt-1 w-[600px]">
                        <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                            <input type="file" name="JUDFILE[]" data-map="JUDFILE"
                            class="file-input file-input-bordered border-blue-200 w-full" multiple>

                            <!-- ปุ่มลบ -->
                            <button type="button"
                            class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                            title="Reset file input">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            </button>
                        </div>
                        </div>
                        <!-- ปุ่มเพิ่ม -->
                        <div class="flex justify-end mt-2  w-[600px]">
                        <button type="button"
                            class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                            title="Add row" data-var1="JUDFILE" data-var2="dvjudFile">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        </div>

                    @endif
                    @endif

                    {{-- Case 2.5: Other Text Input --}}
                    @if ($j->JDGMNTNO == 2.5)
                        <input type="text" name="txtJdgOther1" id="txtJdgOther1"
                               class="w-1/3 mt-1 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                               value="{{ $cnform->JDGMNTNO == 2.5 ? $cnform->JDGOTHER : '' }}">
                    @endif

                    {{-- Case 4.2: Other Text Input --}}
                    @if ($j->JDGMNTNO == 4.2)
                        <input type="text" name="txtJdgOther2"  id="txtJdgOther2"
                               class="w-1/3 mt-1 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                               value="{{ $cnform->JDGMNTNO == 4.2 ? $cnform->JDGOTHER : '' }}">
                    @endif
                    
                    <br>
                @endforeach
            </td>
        @else
            {{-- View Mode --}}
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
                {{ $cnform->JUDGEMENT }}&nbsp;{{ $cnform->JDGOTHER }}
                <div id="dvmak" class="py-2 px-1 w-[600px]" >
                        @foreach($attjud as $d)
                            <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>                      
                            </div>
                        @endforeach
                </div>
            </td>
        @endif
    </tr>
@endif

{{-- ส่วน Remark --}}
@if ($mode == $MODE_EDIT)
    <tr>
        <td class="force-w-350" valign="top">Remark</td>
        <td class="px-3 py-1 bg-gray-100 border-b border-white">
            <textarea name="txtRemark" id="txtRemark" rows="3" 
                      class="w-full p-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"></textarea>
        </td>
    </tr>
@endif

{{-- ส่วน Action Buttons --}}
<tr>
    <td colspan="2" class="py-4 text-center">
        @if ($mode == $MODE_EDIT)
            <div class="inline-flex flex-wrap justify-center gap-2">
                @if(!is_null($cnform->MSTATUS) &&($cextData == 7))
                <button type="button" name="btnSave"
                    data-action="jobsaveData"
                    class="btn-submit cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow mx-1">
                Save Data
                </button>
                @endif
                @if(!in_array($empno, [$form[0]->VREQNO]))
                <button type="button" name="btnApprove"  id="btnApprove"
                        data-action="approve"
                        class="{{ ($resultdwg[0]->RESULT == '1'? 'hidden':'') }} btn-submit cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow">
                    Approve
                </button>
                @endif
                @if(!is_null($cnform->MSTATUS) &&($cextData == 6))
                <button type="button" name="btnChange" 
                        data-action="change"
                        class="btn-submit cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
                    Change
                </button>
                @endif
                @if(($cextData == 2)||($cextData == 7))
                <button type="button" name="btnChange" 
                        data-action="changepic"
                        class="btn-submit cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
                    Change
                </button>
                @endif

                @if(($cextData == 4) ||($cextData == 5))
                <button type="button" name="btnReturn" 
                        data-action="returnqastaff"
                        class="btn-submit cursor-pointer bg-slate-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
                    Return To QA Staff
                </button>
                @endif
                @if(($cextData == 3) && is_null($cnform->MSTATUS))
                <button type="button" name="btnReturn" 
                        data-action="returnass"
                        class="btn-submit cursor-pointer bg-slate-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
                    Return To Assigned Person
                </button>
                @endif

                @if(!is_null($cnform->MSTATUS) &&($cextData == 7))
                <button type="button" name="btnReturn" 
                        data-action="returnb"
                        class="btn-submit cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
                    Return
                </button>
                @endif

                @if ((($cextData <= 4) || ($cextData == 8)) && !in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                    <button type="button" name="btnReturn" id="btnReturn"
                             data-action="returnrem"
                            class="btn-submit cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow">
                        Return
                    </button>
                @endif

        
            @if(!in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            <button type="button" name="btnReject" id="btnReject"
                    data-action="reject"
                    class="{{ ($resultdwg[0]->RESULT == '0'? 'hidden':'') }} btn-submit cursor-pointer bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow">
                Reject
            </button>
             @endif    
            </div>     
        @endif

        @if (($form[0]->CST == "0" || $mode == $MODE_EDIT) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            <button type="button" name="btnSave"
                    data-action="saveData"
                    class="btn-submit cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow mx-1">
                Save Data
            </button>

            @if ($form[0]->CST == "0")
                <button type="button" name="btnSndApv" 
                        data-action="sendApv"
                        class="btn-submit cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded shadow mx-1">
                    Send Approve
                </button>
            @else
                <button type="button" name="btnSndApv" 
                        data-action="approve"
                        class="btn-submit cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded shadow mx-1">
                    Submit
                </button>
            @endif

            <button type="button" name="btnDelete" 
                    data-action="deleteApv"
                    class="btn-submit  cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded shadow mx-1">
                Delete Form
            </button>
        @endif
        @if (!empty($empinf) && in_array($empinf[0]->SSECCODE, ['000502', '000503'])) 
            <button type="button" 
                    data-action="printFrm"
                    class="btn-print btn-submit cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow mx-1">
                Print Form
            </button> 
        @endif 
        
        @if ($mode == $MODE_VIEW)
             @if (in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]) && $form[0]->CST == "1" && (!$demapv))
                <button type="button" name="btnReturn" 
                         data-action="return"
                        class="btn-submit cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow mx-1">
                    Return
                </button>
             @endif
            <button type="button"    data-action="export"
                    class="btn-export cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow mx-1">
                Export Excel
            </button>
        @endif
        @if ($form[0]->CST == "2")
        <button type="button"    data-action="export"
                    class="btn-export-frm cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow mx-1">
                Export Form
        </button>
        @endif
        
    </td>
</tr>
        
    </table>
</div>

</form>
</div>
</div>
</form>
        <div class="flow {{ ($form[0]->CST == '0') ? 'hidden' : '' }}">

        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/cnview.js?ver={{ $GLOBALS['version'] }}"></script>
    <script></script>
@endsection
