@extends('layouts/webflowTemplate')

@section('styles')
<style>
/* ================== 1. จัดการตัวหนังสือหัวข้อ (ทั้งซ้ายและขวา) ================== */
#form-detail > div:first-child,
.location-overlap-wrapper > div:first-child {
    font-size: 16px !important; 
    position: relative !important;
    z-index: 10 !important; 
    width: fit-content !important;
    margin-left: 24px !important; 
    padding: 0 10px !important; 
    
    /* ⚠️ จุดที่ต้องแก้: เปลี่ยนจาก #ffffff เป็นสีเดียวกับพื้นหลัง */
    /* ถ้าใช้ DaisyUI ลองใช้คำสั่งดึงสีนี้ดูครับ จะดึงสีพื้นหลังมาใช้อัตโนมัติ */
    background-color: hsl(var(--b1)) !important; 
    /* หรือถ้าคำสั่งด้านบนไม่ทำงาน ให้ลองใส่รหัสสีเทาอ่อน เช่น #f8f9fa หรือ #f9fafb แทนครับ */
    
    border-radius: 4px !important;
    margin-bottom: 0 !important; 
}

/* ================== 2. จัดการกล่องตาราง (ทั้งซ้ายและขวา) ================== */
#form-detail > div:nth-child(2),
.location-overlap-wrapper > div:nth-child(2) {
    /* ถ้ารู้สึกว่าเส้นขอบมันตัดต่ำไป (ไม่ตรงกลางตัวหนังสือ) ลองเปลี่ยนเลขนี้ดูครับ เช่น -12px หรือ -16px */
    margin-top: -14px !important; 
    
    position: relative !important;
    z-index: 1 !important; 
    width: 100% !important; 
    max-width: 100% !important;
}


</style>
@endsection
@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<div class="p-6 max-w-7xl mx-auto flex flex-col gap-6 min-w-[70vw]">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 shadow-md rounded-lg p-6">
        <div>
            <h1 class="text-2xl font-bold text-base-content flex items-center gap-2">
               Fixed Asset Physical Checking Form
            </h1>
        </div>
    </div>
    <div class="bg-base-100 shadow-md rounded-lg p-6">
           <!-- <div class="form-overlap-wrapper">
            <section id="form-detail">
            </section>
            </div> -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-4">
                
                <div class="form-overlap-wrapper w-full">
                    <section id="form-detail" class="w-full">
                        </section>
                </div>

                <div class="location-overlap-wrapper w-full">
                    <div class="font-bold mb-5">Location Information</div>
                    <div class="h-fit w-full bg-base-200 border border-base-300 p-4 rounded-box relative">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td class="text-primary font-bold w-1/3">Location Code:</td>
                                    <td><span id="loccode"></span></td>
                                </tr>
                                <tr>
                                    <td class="text-primary font-bold">Description:</td>
                                    <td><span id="locname"></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        <form id="frmmain">
            <div class="w-full mx-auto py-8">          
                    <div class="w-full overflow-x-auto">
                        <table class="table !table-zebra" id="tablepck" style="width:100%">
                        </table>
                    </div>
                </div>
             <div id="form-action-container"></div>
        </form>
    </div>

</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/view.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection