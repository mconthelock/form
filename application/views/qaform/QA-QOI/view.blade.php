@extends('layouts/webflowTemplate')
@section('styles')
    <style>
        /* ช่วยบังคับให้ขนาดปุ่มรวม padding, border ครบในขนาดเดียวกัน */
        .btn-square {
            box-sizing: border-box;
        }
   
        .custom-radio {
    appearance: none;
    width: 1.125rem;   /* ✅ 18px */
    height: 1.125rem;
    border-radius: 9999px;
    border: 1px solid #0ea5e9; /* sky-500 */
    background-color: white;
    cursor: pointer;
    display: inline-block;
    position: relative;
    box-sizing: border-box;
    transition: all 0.2s ease-in-out;
  }

  .custom-radio::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.625rem;   /* ✅ 10px วงกลมในใหญ่ขึ้นนิด */
    height: 0.625rem;
    background-color: #0ea5e9;
    border-radius: 9999px;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.2s ease-in-out;
  }

  .custom-radio:checked::before {
    transform: translate(-50%, -50%) scale(1); /* แสดงจุดกลางเมื่อเลือก */
  }

  /* สีแดงสำหรับ error */
  .radio-error-custom {
    border-color: #ef4444; /* red-500 */
  }

  .radio-error-custom:checked::before {
    background-color: #ef4444;
  }

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
    <!-- Container ที่ควบคุมความกว้าง -->
    <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}"
        data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $empno }}"></div>
    <div class="max-w-6xl w-full mx-auto">

        <!-- Header -->
        <div class="bg-gradient-to-b from-sky-400 to-sky-600 text-white text-center py-6 rounded-t-md shadow-md">
            <h1 class="text-xl font-semibold tracking-wide">MITSUBISHI ELEVATOR ASIA CO., LTD.</h1>
            <p class="text-base mt-2">Quality Observation Inspection</p>
        </div>
        <form id="qoi-form" method="post" enctype="multipart/form-data"> 
        <input type="hidden" name="cextData" id="cextData" value="{{ $cextData }}">
        <input type="hidden" name="stepreq" id="stepreq" value="{{ (($form[0]->CST == '0') && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))) ? '1' : '0'}}" >
        <!-- Section ติด Header (หัวข้อละแถว) -->
        <div class="bg-white rounded-b-md shadow-md p-6 mb-8  max-w-6xl w-full mx-auto text-sm text-gray-800 space-y-3">
            <div class="flex items-center">
                <div class="w-55 text-sm font-normal text-gray-600">Form No.</div>
                <div class="flex-1">{{ $formno }}</div>
            </div>
            <div class="flex items-center">
                <div class="w-55  text-sm font-normal text-gray-600">Input by</div>
                <div class="flex-1">{{ '(' . $qoiform->VINPUTER . ') ' . $qoiform->INPNAME }}</div>
            </div>
            <div class="flex items-center">
                <div class="w-55  text-sm font-normal text-gray-600">Requested by</div>
                <div class="flex-1">{{ '(' . $qoiform->VREQNO . ') ' . $qoiform->REQNAME }}</div>
            </div>
            <div class="flex items-center">
                <div class="w-55  text-sm font-normal text-gray-600">Title</div>
                <div class="flex-1">
                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
                    <input type="text" name="title"
                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req"
                    value="{{ $qoiform->TITLE }}" />
                @else
                    <div class="py-2 px-1">
                    {{ $qoiform->TITLE }}
                    </div>
                @endif
                </div>
            </div>
            <div class="flex items-center">
                <div class="w-55  text-sm font-normal text-gray-600">Item</div>
                <div class="flex-1">
                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
                    <input type="text" name="itemno"
                        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req"
                        value="{{ $qoiform->ITEMNO }}" />
                @else
                    <div class="py-2 px-1">
                        {{ $qoiform->ITEMNO }}
                    </div>
                @endif
                </div>
            </div>
            <!-- แถว Drawing -->
            <div class="flex ">
                <!-- ใช้ flex items-center และกำหนดความสูงเท่ากับแถว header ของตาราง -->
                <div class="w-55  text-sm font-normal text-gray-600 flex items-center" style="height: 44px;">
                    Drawing No.
                </div>
                <div class="flex-1 overflow-x-auto">
                    <table class="min-w-full border border-sky-300 text-left text-sm">
                        <thead>
                            <!-- กำหนดความสูงแถวหัวตารางเท่ากัน -->
                            <tr class="h-11" style="background-color: #bfdbfe !important;">
                                <th class="border border-sky-300 px-4 py-2 text-sky-700 font-medium ">DWG No.</th>
                                <th class="border border-sky-300 px-4 py-2 text-sky-700 font-medium">OK</th>
                                <th class="border border-sky-300 px-4 py-2 text-sky-700 font-medium">NG</th>
                                <th class="border border-sky-300 px-4 py-2 text-sky-700 font-medium">Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($resultdwg as $d)
                                <tr>
                                    <td class="border border-sky-300 px-4 py-2">
                                           @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
        
                                                <input type="text" name="dwgno[]"
                                                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req"
                                                    value="{{ $d->DWGNO }}" />
                                            @else
                                                <div class="py-2 px-1">
                                                {{ $d->DWGNO }}
                                                </div>
                                            @endif
                                    </td>
                                    <td class="border border-sky-300 px-4 py-2">
                                           @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
        
                                                    <label class="flex items-center gap-2 cursor-pointer">
                                                        <input type="radio" name="result[]" value="0" class="custom-radio radio-primary-custom radio-result req"   @if ($d->RESULT == '0') checked @endif   />
                                                    </label>
                                            @else
                                                @if ($d->RESULT == '0')
                                                    <span class="inline-block bg-green-100 text-green-700 px-2 py-1 text-sm rounded-full font-semibold">✔</span>
                                                @endif
                                            @endif
                                    </td>
                                    <td class="border border-sky-300 px-4 py-2">
                                           @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
        
                                                 <label class="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="result[]" value="1" class="custom-radio radio-error-custom radio-result req"   @if ($d->RESULT == '1') checked @endif  />
                                                </label>
                                            @else
                                                @if ($d->RESULT == '1')
                                                    <span
                                                        class="inline-block bg-red-100 text-red-700 px-2 py-1 text-sm rounded-full font-semibold">✘</span>
                                                @endif
                                            @endif
                                    </td>
                                    <td class="border border-sky-300 px-4 py-2">
                                            @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
          
                                                <input type="text" name="dwgrem[]"
                                                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                                    value="{{ $d->REMARK }}" />
                                            @else
                                                <div class="py-2 px-1">
                                                    {{ $d->REMARK }}
                                                </div>
                                            @endif
                                    
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="flex items-center">
                <div class="w-55  text-sm font-normal text-gray-600">Part Name</div>
                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
                    <div class="flex-1"><input type="text" name="prtname"
                            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req"
                            value="{{ $qoiform->PRTNAME }}" />
                    </div>
                @else
                    <div class="py-2 px-1">
                    {{ $qoiform->PRTNAME }}
                    </div>
                @endif
            </div>
            <div class="flex items-center">
                <div class="w-55  text-sm font-normal text-gray-600">Pur Item No.</div>
                <div class="flex-1">
                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))  
                        <input type="text" name="puritem"
                        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req"
                        value="{{ $qoiform->PURITEM }}" />
                @else
                    <div class="py-2 px-1">
                    {{ $qoiform->PURITEM }}
                    </div>
                @endif
                </div>
            </div>
            <div class="flex items-center">
                <div class="w-55  text-sm font-normal text-gray-600">Supplier or subcontractor name</div>
                <div class="flex-1">
                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER)))) 
                    <input type="text" name="svendname"
                        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req"
                        value="{{ $qoiform->SVENDNAME }}" />
                @else   
                    <div class="py-2 px-1">
                    {{ $qoiform->SVENDNAME }}
                    </div>
                @endif

                </div>
            </div>
        </div>

        <!-- Section 2 -->
        <div class="bg-white rounded-md shadow-md p-6 mb-8 text-sm text-gray-800">
            <h2 class="text-lg font-semibold text-sky-700 mb-4 border-b-2 border-sky-500 pb-2">
                Necessary Document submitted with Quality Observation Inspection
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col">
                    <label class="block text-gray-700 font-medium mb-1">DWG.</label>
                    @foreach ($attdwg as $d)
                             <div class="openfl"  data-id="{{ $d->ITEMNO }}" data-filename="{{$d->SFILE}}">
                                <a href="{{ base_url('qaform/QA-QOI/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$d->SFILE.'/'.substr($d->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($d->SFILE, 13) }}</a>
                                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
                                 <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                @endif
                            </div>
                    @endforeach
                    @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER)))) 
                    <div id="dvdwgFile">
                        <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                            <input type="file" name="DWGFILE[]" data-map="DWGFILE"
                                class="file-input file-input-bordered border-blue-200 w-full" multiple>

                            <!-- ปุ่มลบ -->
                            <button type="button"
                                class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                                title="Reset file input">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                   
                    <div class="flex justify-end mt-2">
                        <!-- ปุ่มเพิ่ม -->
                        <button type="button"
                            class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                            title="Add row" data-var1="DWGFILE" data-var2="dvdwgFile">
                            <!-- onclick="add_more('DWGFILE','dvdwgFile');" -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    @endif


                </div>

                <div class="flex flex-col">
                    <label class="block text-gray-700 font-medium mb-1">Spec.</label>
                    @foreach ($attspec as $s)
                             <div class="openfl"  data-id="{{ $s->ITEMNO }}" data-filename="{{ $s->SFILE }}">
                             <a href="{{ base_url('qaform/QA-QOI/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$s->SFILE.'/'.substr($s->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($s->SFILE, 13) }}</a>
                          
                                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
         
                                 <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                @endif
                            </div>
                    @endforeach
                    @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))
        
                    <div id="dvspecFile">
                        <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                            <input type="file" name="SPECFILE[]" data-map="SPECFILE"
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

                    <div class="flex justify-end mt-2">
                        <!-- ปุ่มเพิ่ม -->
                        <button type="button"
                            class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                            title="Add row" data-var1="SPECFILE" data-var2="dvspecFile">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Section 3 -->
        <div class="bg-white rounded-md shadow-md p-6 mb-8 text-sm text-gray-800">
            <h2 class="text-lg font-semibold text-sky-700  mb-4 border-b-2 border-sky-500 pb-2">
                Contents of inspection
            </h2>
            <div class="flex flex-col gap-y-4">
            <div class="flex items-center">
                <div class="w-55 text-sm font-normal text-gray-600">Required Inspection Date</div>
                <div class="flex-1">
                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))   
                       <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="request_date" id="request_date" value="{{$qoiform->SINSPECDATE}}"  />
                @else
                        <div class="py-2 px-1">
                         {{ $qoiform->INSPECDATE }}
                        </div>
                @endif
                
                </div>
            </div>
            <div class="flex items-center">
                <div class="w-55 text-sm font-normal text-gray-600">Expected Finish date</div>
                <div class="flex-1">
                @if (($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3))) || (($form[0]->CST == "0") && (($empno == $form[0]->VREQNO) || ($empno == $form[0]->VINPUTER))))    
                    <input type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="expect_date" id="expect_date" value="{{$qoiform->SEXPCHGDATE}}" />
                @else
                    <div class="py-2 px-1">
                         {{ $qoiform->EXPCHGDATE }}
                    </div>
                @endif

                </div>
            </div>
            @if (($mode == $MODE_EDIT) && ($cextData ==1))  
              <div class="flex items-center">
                <div class="w-55 text-sm font-normal text-gray-600">J-Staff in charge</div>
                <div class="flex-1">
                     <select name="jstaff" id="jstaff" class="select jstaff_select">
                            <option value="">------------</option>
                      </select>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-55 text-sm font-normal text-gray-600">Engineer in charge</div>
                <div class="flex-1">
                    <select name="enginc" id="enginc" class="select eng_select">
                            <option value="">------------</option>
                    </select>
                </div>
              </div>
            @endif
            @if (($mode == $MODE_EDIT) && ($cextData ==4) && ($RESULTQOIDWG->RESULT == "1"))  
              <div class="flex items-center">
                <div class="w-55 text-sm font-normal text-gray-600">SEM. in charge</div>
                <div class="flex-1">
                     <select name="seminc" id="seminc" class="select sem_select">
                            <option value="">------------</option>
                      </select>
                </div>
              </div>
            @endif
            <div class="flex items-start">
                <div class="w-55 text-sm font-normal text-gray-600">Check sheet</div>
                <div class="flex-1">
                <div id="dvconchk">
                @foreach ($attchks as $c)
                             <div class="openfl"  data-id="{{ $c->ITEMNO }}" data-filename="{{ $c->SFILE }}">
                             <a href="{{ base_url('qaform/QA-QOI/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$c->SFILE.'/'.substr($c->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($c->SFILE, 13) }}</a>
                      
                             @if ($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3)))  
                                 <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                @endif
                            </div>
                @endforeach
                </div>
                @if ($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3)))   
                   <div id="dvsheetFile">
                        <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                            <input type="file" name="SHEETFILE[]" data-map="SHEETFILE"
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

                    <div class="flex justify-end mt-2">
                        <!-- ปุ่มเพิ่ม -->
                        <button type="button"
                            class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                            title="Add row" data-var1="SHEETFILE" data-var2="dvsheetFile">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                @endif
                </div>
            </div>
            <div class="flex items-start gap-4 mb-4">
                <!-- คอลัมน์หลักที่ 1: Label -->
                <div class="w-55 text-sm font-normal text-gray-600 pt-2">
                    Judgment
                </div>
                @if ($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3)))  
                <!-- คอลัมน์หลักที่ 2: ส่วนเนื้อหา (แบ่ง 2 ย่อย: radio + attach file) -->
                <div class="flex-1 flex items-start gap-4">
                    <!-- ซ้าย: Radio แนวนอน (ขนาดเล็ก) -->
                    <div class=" flex items-center gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="judgement" value="1" class="custom-radio radio-primary-custom  req"   @if ($qoiform->JDGMNTNO == '1') checked @endif />
                        <span class="text-sm text-gray-700">Acceptable</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="judgement" value="2" class="custom-radio radio-error-custom  req"  @if ($qoiform->JDGMNTNO == '2') checked @endif />
                        <span class="text-sm text-gray-700">Not Accept</span>
                    </label>
                    </div>

                    <!-- ขวา: Attach file + ปุ่มลบ/เพิ่ม -->
                    <div class="flex-1 flex flex-col gap-2" id="dvNGFile">
                    <!-- กล่องแนบไฟล์ -->
                    @foreach($attnot as $n)
                          <div class="openfl"  data-id="{{ $n->ITEMNO }}" data-filename="{{ $n->SFILE }}">
                          <a href="{{ base_url('qaform/QA-QOI/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$n->SFILE.'/'.substr($n->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($n->SFILE, 13) }}</a>
                            @if ($mode == $MODE_EDIT && (($cextData >= 2) && ($cextData <= 3)))  
                                 <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                                @endif
                          </div>
                    @endforeach
                    <div id="dvNGFileWrap" class="flex flex-col gap-2">
                        <div class="dvSFile flex items-center gap-2">
                        <input type="file" name="NGFILE[]" data-map="NGFILE"
                            class="file-input file-input-bordered border-blue-200 w-full" multiple>

                        <!-- ปุ่มลบ -->
                        <button type="button"
                            class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                            title="Reset">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        </div>
                    </div>

                    <!-- ปุ่มเพิ่ม -->
                    <div class="flex justify-end">
                    <button type="button"
                        class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                        title="Add file" data-var1="NGFILE" data-var2="dvNGFileWrap">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    </div>
                    </div>
                </div>
                @else
                     <div class="py-2 px-1">
                         {{ $qoiform->JDGMNTNO == '1' ? 'Acceptable' : $qoiform->JDGMNTNO == '2' ? 'Not Accept' : '' }}
                         @foreach($attnot as $n)
                         <div class="openfl" >
                         <a href="{{ base_url('qaform/QA-QOI/form/mdownload/') . $NFRMNO . '_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.$n->SFILE.'/'.substr($n->SFILE, 13) }}" class="link text-sm text-blue-600 font-semibold" target="_blank">{{ substr($n->SFILE, 13) }}</a>
                         </div>
                         @endforeach
                    </div>
                @endif

                </div>
                @if ($mode == $MODE_EDIT && (($cextData >= 1) && ($cextData <= 3)))    
                <div class="flex items-star">
                <div class="w-55  text-sm font-normal text-gray-600">Remark</div>
                <div class="flex-1">
                <textarea name="remark" id="remark" rows="3" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"></textarea>
                </div>
                </div>
                @endif
</div>
 </div>
 @if($resultdwg[0]->RESULT == 1) 
 <!-- Section 4 -->
 <div class="bg-white rounded-md shadow-md p-6 mb-8 text-sm text-gray-800">
  <h2 class="text-lg font-semibold text-sky-700 mb-4 border-b-2 border-sky-500 pb-2">
    Quality Observation Report (QOI)
  </h2>

<!-- Countermeasure Table -->
<div class="mt-6">
  <h3 class="text-base font-semibold text-gray-700 mb-2">Countermeasure</h3>
  <div class="overflow-x-auto">
    <table id="countermeasure-table" class="min-w-full table-auto border border-gray-300 text-sm text-gray-800">
      <thead class="bg-sky-100">
        <tr>
          <th class="border border-gray-300 px-4 py-2 text-left">Action</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Due Date</th>
          <th class="border border-gray-300 px-4 py-2 text-left">In-charge</th>
          @if (($mode == $MODE_EDIT) && ($cextData == 8))  
          <th class="border border-gray-300 px-4 py-2 text-center w-16">Delete</th>
          @endif
        </tr>
      </thead>
      <tbody id="countermeasure-body">
      @if (($mode == $MODE_EDIT) && ($cextData == 8))  
        @if(count($measure == 0))
        <tr>
          <td class="border border-gray-300 px-4 py-2">
            <input type="text" name="m_action[]" value="" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </td>
          <td class="border border-gray-300 px-4 py-2">
            <input type="text" name="m_due_date[]" value="" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </td>
          <td class="border border-gray-300 px-4 py-2">
            <input type="text" name="m_in_charge[]" value="" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            <button type="button"  data-table = "countermeasure-body" class="text-red-500 hover:text-red-700 cursor-pointer del-table-row" >
              ✕
            </button>
          </td>
        </tr>
        @endif
        @foreach($measure as $m)
        <tr>
          <td class="border border-gray-300 px-4 py-2">
            <input type="text" name="m_action[]" value="{{ $m->QACTION }}" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </td>
          <td class="border border-gray-300 px-4 py-2">
            <input type="text" name="m_due_date[]" value="{{ $m->QDUEDATE }}" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </td>
          <td class="border border-gray-300 px-4 py-2">
            <input type="text" name="m_in_charge[]" value="{{ $m->QINCHARGE }}" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            <button type="button"  data-table = "countermeasure-body" class="text-red-500 hover:text-red-700 cursor-pointer del-table-row" >
              ✕
            </button>
          </td>
        </tr>
        @endforeach
     @else
        @foreach($measure as $m)
        <tr>
          <td class="border border-gray-300 px-4 py-2">{{ $m->QACTION }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ $m->QDUEDATE }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ $m->QINCHARGE }}</td>
        </tr>
        @endforeach
     @endif
      </tbody>
    </table>
  </div>

  <!-- Add Row Button -->
  @if (($mode == $MODE_EDIT) && ($cextData == 8))  
  <div class="mt-4">
    <button type="button"  data-table = "countermeasure-body" class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded shadow cursor-pointer add-table-row">
      + Add Row
    </button>
  </div>
  @endif

</div>
<div class="flex items-star">
    <div class="w-55 text-sm font-normal text-gray-600 mt-2">Document/Picture</div>
    <div class="flex-1">
        @foreach($attmea as $m)
                            <span class="sfile">{{ substr($m->SFILE, 13) }}</span>
                            @if (($mode == $MODE_EDIT) && ($cextData == 8))  
                                 <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                            @endif
        @endforeach
        @if (($mode == $MODE_EDIT) && ($cextData == 8))  
                    <div id="dvmeasureFile">
                        <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                            <input type="file" name="MEASUREFILE[]" data-map="MEASUREFILE"
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

                    <div class="flex justify-end mt-2">
                        <!-- ปุ่มเพิ่ม -->
                        <button type="button"
                            class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                            title="Add row" data-var1="MEASUREFILE" data-var2="dvmeasureFile">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
        @endif

    </div>
</div>
<!-- Corrective and Preventive Table -->
<div class="mt-6">
  <h3 class="text-base font-semibold text-gray-700 mb-2">Corrective and Preventive Action</h3>
  <div class="overflow-x-auto">
    <table id="corrective-table" class="min-w-full table-auto border border-gray-300 text-sm text-gray-800">
      <thead class="bg-sky-100">
        <tr>
          <th class="border border-gray-300 px-4 py-2 text-left">Action</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Due Date</th>
          <th class="border border-gray-300 px-4 py-2 text-left">In-charge</th>
          @if (($mode == $MODE_EDIT) && ($cextData == 8))  
          <th class="border border-gray-300 px-4 py-2 text-center w-16">Delete</th>
          @endif
        </tr>
      </thead>
      <tbody id="corrective-body">
      @if (($mode == $MODE_EDIT) && ($cextData == 8)) 
          @if(count($correct) == 0)
          <tr>
              <td class="border border-gray-300 px-4 py-2">
                <input type="text" name="c_action[]" values="" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input type="text" name="c_due_date[]" values="" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input type="text" name="c_in_charge[]" values="" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </td>
              <td class="border border-gray-300 px-4 py-2 text-center">
                <button type="button" data-table = "corrective-body"  class="text-red-500 hover:text-red-700 cursor-pointer del-table-row" >
                  ✕
                </button>
              </td>
            </tr>
          @endif
          @foreach($correct as $c)
            <tr>
              <td class="border border-gray-300 px-4 py-2">
                <input type="text" name="c_action[]" values="{{$c->QACTION}}" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input type="text" name="c_due_date[]" values="{{$c->QDUEDATE}}" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input type="text" name="c_in_charge[]" values="{{$c->QINCHARGE}}" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </td>
              <td class="border border-gray-300 px-4 py-2 text-center">
                <button type="button" data-table = "corrective-body"  class="text-red-500 hover:text-red-700 cursor-pointer del-table-row" >
                  ✕
                </button>
              </td>
            </tr>
          @endforeach
      @else
       @foreach($correct as $c)
          <tr>
            <td class="border border-gray-300 px-4 py-2">{{ $c->QACTION }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ $c->QDUEDATE }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ $c->QINCHARGE }}</td>
          </tr>
        @endforeach
      @endif
      </tbody>
    </table>
  </div>
  @if (($mode == $MODE_EDIT) && ($cextData == 8)) 
  <!-- Add Row Button -->
  <div class="mt-4">
    <button type="button" data-table = "corrective-body" class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded shadow cursor-pointer add-table-row">
      + Add Row
    </button>
  </div>
  @endif
</div>
<div class="flex items-star">
    <div class="w-55 text-sm font-normal text-gray-600 mt-2">Document/Picture</div>
    <div class="flex-1">
    @foreach($attcor as $c)
                            <span class="sfile">{{ substr($c->SFILE, 13) }}</span>
                            @if (($mode == $MODE_EDIT) && ($cextData == 8))  
                                 <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                            @endif
    @endforeach
    @if (($mode == $MODE_EDIT) && ($cextData == 8)) 
                    <div id="dvcorrectFile">
                        <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                            <input type="file" name="CORRECTFILE[]" data-map="CORRECTFILE"
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

                    <div class="flex justify-end mt-2">
                        <!-- ปุ่มเพิ่ม -->
                        <button type="button"
                            class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                            title="Add row" data-var1="CORRECTFILE" data-var2="dvcorrectFile">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
      @endif
    </div>
</div>
<div class="mt-6">
  <h3 class="text-base font-semibold text-gray-700 mb-2">QE</h3>
  <div class="flex flex-col gap-3">
      @if (($mode == $MODE_EDIT) && ($cextData == 8)) 
          <!-- บรรทัด 1: Radio 1 + RQ no. -->
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Radio 1 -->
            <div class="flex items-center gap-2  md:w-1/2">
              <input type="radio" name="qe_option" value="1" class="radio radio-primary radio-sm"  @if ($qoiform->QECHECK == '1') checked @endif  />
              <span class="text-sm text-gray-700">Request concern Department issue new RQ to re-check part quality</span>
            </div>

            <!-- RQ no. -->
            <div class="flex flex-1 items-center gap-2">
              <label for="rq_no" class="w-20 text-sm text-gray-600">RQ no.</label>
              <input type="text" id="rq_no" name="rq_no"
                class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"  value="{{ $qoiform->QECHECK == '1'? $qoiform->RQCN:''}}" />
            </div>
          </div>

          <!-- บรรทัด 2: Radio 2 + CN no. -->
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Radio 2 -->
            <div class="flex items-center gap-2 md:w-1/2">
              <input type="radio" name="qe_option" value="2" class="radio radio-primary radio-sm"  @if ($qoiform->QECHECK == '2') checked @endif />
              <span class="text-sm text-gray-700">Request concern Department issue new CN to re-check part quality</span>
            </div>

            <!-- CN no. -->
            <div class="flex flex-1 items-center gap-2">
              <label for="cn_no" class="w-20 text-sm text-gray-600">CN no.</label>
              <input type="text" id="cn_no" name="cn_no"
                class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" value="{{ $qoiform->QECHECK == '2'? $qoiform->RQCN:''}}" />
            </div>
          </div>

          <!-- บรรทัด 3: Radio 3 ลำพัง -->
          <div class="flex items-center gap-2 md:w-1/2">
            <input type="radio" name="qe_option" value="3" class="radio radio-primary radio-sm"  @if ($qoiform->QECHECK == '3') checked @endif  />
            <span class="text-sm text-gray-700">No need to issue CN/RQ because this trouble can solve by QC/QIC</span>
          </div>
      @else
                 <div class="py-2 px-1">
                   {{ $qoiform->QECHECK == "1" ? 'Request concern Department issue new RQ to re-check part quality     RQ no. '.$qoiform->RQCN : ( $qoiform->QECHECK == "2" ? 'Request concern Department issue new CN to re-check part quality     CN no. '.$qoiform->RQCN : ( $qoiform->QECHECK == "3" ? 'No need to issue CN/RQ because this trouble can solve by QC/QIC' : '')) }}
                  </div>
      @endif
  </div>
<!-- Document/Picture Section -->
<div class="flex items-start mt-6">
  <!-- Label -->
  <div class="w-55 text-sm font-normal text-gray-600 mt-1">Document/Picture</div>

  <!-- Input Files -->
  <div class="flex-1">
  @foreach($attqe as $qe)
                            <span class="sfile">{{ substr($qe->SFILE, 13) }}</span>
                            @if (($mode == $MODE_EDIT) && ($cextData == 8))  
                                 <button type="button"  data-table = "" class="text-red-500 hover:text-red-700 cursor-pointer del-file" >✕</button>
                            @endif
  @endforeach
  @if (($mode == $MODE_EDIT) && ($cextData == 8)) 
    <div id="dvqeFile" class="pt-1">
      <div class="dvSFile flex items-center justify-between gap-2 mb-2">
        <input type="file" name="QEFILE[]" data-map="QEFILE"
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
    <div class="flex justify-end mt-2">
      <button type="button"
        class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
        title="Add row" data-var1="QEFILE" data-var2="dvqeFile">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  @endif

  </div>
</div>
@if (($mode == $MODE_EDIT) && ($cextData >= 7)) 
<div class="flex items-star">
                <div class="w-55  text-sm font-normal text-gray-600">Remark</div>
                <div class="flex-1 mt-2">
                <textarea name="remark" id="remark" rows="3" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"></textarea>

  
                </div>
</div>
@endif
</div>


</div>
@endif
@if ($mode == $MODE_EDIT)
  <div class="flex justify-center  gap-4 pt-4">
  <!-- ปุ่ม Approve -->
  <button type="button" id="btn-approve" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded shadow cursor-pointer btn-submit" data-action="approve">
    Approve
  </button>

  <!-- ปุ่ม Reject -->
  <button type="button" id="btn-reject" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow  cursor-pointer btn-submit" data-action="reject">
    Reject
  </button>
</div>
<br/>
@endif
  </form>
        <div class="flow">

        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/qoiview.js?ver={{ $GLOBALS['version'] }}"></script>
    <script></script>
@endsection
