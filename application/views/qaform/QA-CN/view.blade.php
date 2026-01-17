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
<input type="hidden" name="stepExt" value="{{ $cextData}}" />
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
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <input type="text" name="txtTitle" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="{{ $cnform->TITLE ?? 'New item' }}" maxlenght="256">
            @else
                {{ $cnform->TITLE }}
            @endif
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Order No.</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                {{ $cnform->ORDERNO }}
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Item</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <input type="text" name="txtItemno" 
                       class="w-24 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="  {{ $cnform->ITEMNO }}" maxlenght="3">
                       @else
                {{ $cnform->ITEMNO }}
            @endif    
            </td>
        </tr>

        <tr>
            <td class="force-w-350 align-top pt-2">Drawing No</td>
            <td class="p-2 bg-white border-b border-white">
                <table class="w-2/3 text-center text-xs">
                    <thead>
                        <tr class="text-white" style="background-color: #009688;">
                            <th class="py-1 border-r border-white w-2/3 font-normal">DWG No.</th>
                            <th class="py-1 border-r border-white w-16 font-normal">OK</th>
                            <th class="py-1 border-r border-white w-16 font-normal">NG</th>
                            <th class="py-1 font-normal">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                    @php
                        $cnt = 0;
                    @endphp
                    @foreach ($resultdwg as $d)
                    <tr class="text-white" style="background-color: #8BC34A;">
                    <td class="py-1 border-r border-white font-bold text-blue-900">
                        @if ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                        @php
                            $parts = explode(' ', $d->DWGNO);
                            $dwg = $parts[0] ?? ''; 
                            $g = $parts[1] ?? ''; 
                            $l = $parts[2] ?? ''; 
                        @endphp
                            <span><input type="text" name="txtDwgNo" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $dwg }}">
                            <input type="text" name="txtG" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $g }}">
                            <input type="text" name="txtL" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $l }}"></span>
                        @else
                         <span>{{ $d->DWGNO }}</span>
                         @if (($cextData >= 1) && ($cextData <= 3))
                             <a OnClick="opendwg('{{ strtoupper(substr($d->DWGNO, 0, 9)) }}','')" style='cursor: pointer;' >openfile</a>
                         @endif
                        @endif  
                        <span class="px-2">Rev no. :</span>
                        <span>
                            @if ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                                 <input type="text" name="revNo" 
                            class="w-20 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $d->REVNO }}">
                            @else
                                {{ $d->REVNO }}
                            @endif  
                        </span>
                    </td>
                    <td class="py-1 border-r border-white">
                      @if ($d->RESULT == '0')
                            @if (($mode == $MODE_EDIT)&&($cextData >= 1) && ($cextData <= 3))
                                <span><input type='radio' name="radDwg{{ $cnt }}" value="0" checked /></span>
                            @else
                              <span class="inline-block bg-green-100 text-green-700 px-2 py-1 text-sm rounded-full font-semibold">✔</span>
                            @endif 
                      @else
                            @if (($cextData >= 1) && ($cextData <= 3))
                                <span><input type='radio' name="radDwg{{ $cnt }}" value="0" /></span>
                            @endif 
                      @endif
                    </td>
                    <td class="py-1 border-r border-white">
                    @if ($d->RESULT == '1')
                            @if (($mode == $MODE_EDIT)&&($cextData >= 1) && ($cextData <= 3))
                                <span><input type='radio' name="radDwg{{ $cnt }}" value="1" checked /></span>
                            @else
                              <span class="inline-block bg-red-100 text-red-700 px-2 py-1 text-sm rounded-full font-semibold">✘</span>
                            @endif 
                     @else
                            @if (($mode == $MODE_EDIT)&&($cextData >= 1) && ($cextData <= 3))
                                <span><input type='radio' name="radDwg{{ $cnt }}" value="1" /></span>
                            @endif 
                      @endif
                    </td>
                    <td class="py-1 text-black">
                        @if (($mode == $MODE_EDIT)&&($cextData >= 1) && ($cextData <= 3))
                            <input type="text" name="txtDwgRem" 
                            class="w-20 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="{{ $d->REMARK }}">
                        @else
                            {{ $d->REMARK }}
                        @endif 
                    </td>
                     </tr>
                     @endforeach
                    </tbody>
                    @if ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                    <tfoot>
							<tr>
								<td colspan="4" style="text-align:right" >
                                <button type="button" data-table = "corrective-body" class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded shadow cursor-pointer add-table-row">
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
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <input type="text" name="txtPrtName" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="{{ $cnform->PRTNAME }}" maxlenght="256">
            @else
                    {{ $cnform->PRTNAME }}    
            @endif           
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Pur Item No.</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <input type="text" name="txtPurItem" 
                       class="w-48 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="{{ $cnform->PURITEM }}" maxlength="10" >
            </td>
            @else
                    {{ $cnform->PURITEM }}    
            @endif  
        </tr>

        <tr>
            <td class="force-w-350">PO. or Invoice no.</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <input type="text" name="txtInvNo" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="{{ $cnform->INVNO }}" maxlength="90" >
            @else
                    {{ $cnform->INVNO }}    
            @endif  

            </td>
        </tr>

        <tr>
            <td class="force-w-350">Order Quantity</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <input type="text" name="txtOrdQ" 
                       class="w-24 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="{{ $cnform->ORDQ }}" maxlength="15">
            @else
                    {{ $cnform->ORDQ }}    
            @endif  
            </td>
        </tr>

        <tr>
            <td class="force-w-350">Supplier or subcontractor name</td>
            <td class="px-3 py-1 bg-gray-100 border-b border-white">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <input type="text" name="txtSupName" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="{{ $cnform->SVENDNAME }}">
            @else
                    {{ $cnform->SVENDNAME }}    
            @endif      
                
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Classification of changing</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div class="flex flex-col space-y-1">
                @foreach ($cncls as $c)
                     <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="chkClass" class="h-4 w-4" value="{{ $c->CLSNO }}"  {{ ($cnform->CLSNO == $c->CLSNO) ? 'checked' : '' }}  >
                        <span>{{ $c->CLSCHANGE }}   </span>
                    </label>
                @endforeach
                </div>
             @else
                    {{ $cnform->CLSCHANGE }}    
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2">Reason</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div class="flex flex-col space-y-1">
                    @foreach ($cnreason as $r)
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radReason" class="h-4 w-4" value="{{ $r->RSNNO}}"  {{ ($cnform->RSNNO == $r->RSNNO) ? 'checked' : '' }}  >
                        <span>{{ $r->REASON }}</span>
                        @if($r->RSNNO == "5")
                        <span class="px-2 inline-block w-[450px]"><input type="text" name="txtOther" value="{{ $cnform->RSNOTHER }}"  class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm" /></span>
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
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div class="flex flex-col space-y-1">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="1"  {{ ($cnform->TRANSNO == "1") ? 'checked' : '' }}  >
                        <span class="w-20">Scrap</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="2"  {{ ($cnform->TRANSNO == "2") ? 'checked' : '' }}  >
                        <span class="w-20">Return to</span><span class="px-2 inline-block w-[450px]"><input type="text" name="txtReturn" value="{{ $cnform->TRANSNO == 2 ? $cnform->DETTRANS :'' }}"  class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm" /></span>
                  
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="2"  {{ ($cnform->TRANSNO == "3") ? 'checked' : '' }}  >
                        <span class="w-20">Other</span><span class="px-2 inline-block w-[450px]"><input type="text" name="txtOth" value="{{ $cnform->TRANSNO == 3 ? $cnform->DETTRANS :'' }}"  class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm" /></span>
                  
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
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
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
                                        @if (
                                            ($mode == $MODE_EDIT)
                                            || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                                        )
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
                    <input type="file" name="DWGFILE[]" data-map="DWGFILE"
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
                    title="Add row" data-var1="DWGFILE" data-var2="dvdwgFile">
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
                                            @if (
                                                ($mode == $MODE_EDIT)
                                                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                                            )
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
                    <input type="file" name="MATFILE[]" data-map="MATFILE"
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
                    title="Add row" data-var1="MATFILE" data-var2="dvmatFile">
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
            <td class="force-w-350 align-top pt-2 ">Maker Insp. Data <span class="px-2 text-red-600">(Max 1000 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
            <div id="dvmak" class="py-2 px-1 w-[600px]" >
                @foreach($attmaker as $d)
                                    <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{ $d->SFILE }}">
                                        <a href="{{ base_url('qaform/QA-CN/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                            @if (
                                                ($mode == $MODE_EDIT)
                                                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                                            )
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (
                ($mode == $MODE_EDIT)
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
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
                                            @if (
                                                ($mode == $MODE_EDIT)
                                                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                                            )
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (
                ($mode == $MODE_EDIT)
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div id="dvrohFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="ROHFILE[]" data-map="ROHFILE"
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
                    title="Add row" data-var1="ROHFILE" data-var2="dvrohFile">
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
                                            @if (
                                                ($mode == $MODE_EDIT)
                                                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                                            )
                                                <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                            @endif
                                    </div>
                @endforeach
            </div>
            @if (
                ($mode == $MODE_EDIT)
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
                <div id="dvpurFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="PURFILE[]" data-map="PURFILE"
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
                    title="Add row" data-var1="PURFILE" data-var2="dvpurFile">
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
                                            @if (
                                                ($mode == $MODE_EDIT)
                                                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
                                            )
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
                    <input type="file" name="SUBFILE[]" data-map="SUBFILE"
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
                    title="Add row" data-var1="SUBFILE" data-var2="dvsubFile">
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
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
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
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
            <input type="text" class="w-48 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="txtprtLoc"  value="{{$cnform->PRTLOC}}"  />
    
             @else
                    {{ $cnform->PRTLOC }}    
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Before Changing</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
          
            <textarea name="txtBefChg" id="txtBefChg" rows="3" class="w-1/3 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req resize-none"> {{ $cnform->BEFCHANGE }}  </textarea>
         
             @else
                    {{ $cnform->BEFCHANGE }}    
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">After Changing</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
          
            <textarea name="txtAftChg" id="txtAftChg" rows="3" class="w-1/3 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req resize-none"> {{ $cnform->AFTCHANGE }}  </textarea>
         
             @else
                    {{ $cnform->AFTCHANGE }}    
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Possible Submitting Date</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="submit_date" id="submit_date" value="{{$cnform->SUBMITDATE}}"  />
    
             @else
                    {{ $cnform->SUBMITDATE }}  
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Required Inspection Date</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="inspec_date" id="inspec_date" value="{{$cnform->INSPECDATE}}"  />
    
             @else
                    {{ $cnform->INSPECDATE }}  
            @endif  
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Expected Changing Date</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            @if (
                ($mode == $MODE_EDIT && $cextData >= 2 && $cextData < 8 )
                || ((($form[0]->CST == "0")||($mode == $MODE_EDIT)) && in_array($empno, [$form[0]->VREQNO, $form[0]->VINPUTER]))
            )
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="expchg_date" id="expchg_date" value="{{$cnform->EXPCHGDATE}}"  />
    
             @else
                    {{ $cnform->EXPCHGDATE }}  
            @endif  
            </td>
        </tr>
        
    </table>
</div>

</form>
</div>
</div>
</form>
        <div class="flow {{ ($form[0]->CST == '0' && ($empno == $form[0]->VREQNO || $empno == $form[0]->VINPUTER)) ? 'hidden' : '' }}">

        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/cnview.js?ver={{ $GLOBALS['version'] }}"></script>
    <script></script>
@endsection
