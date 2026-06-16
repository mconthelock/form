@extends('layouts/webflowTemplate')

@section('contents')
    <div class="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <!-- Card Container: ปรับขนาดเป็น max-w-2xl เพื่อให้ฟอร์มดูกระชับพอดี ไม่กว้างเกินไป -->
        <div class="card w-full bg-base-100 shadow-xl border border-gray-200 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary to-blue-600 p-6 text-primary-content">
                <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-3 ">
                    
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                    Return Part/Material to WHI Report
                </h1>
            </div>
            <div class="card-body p-6 md:p-8">


                <!-- Form -->
                <form class="flex flex-col gap-5">

                    <!-- Form Date -->
                    <fieldset class="w-full">
                        <legend class="font-bold text-primary mb-2">Form Date</legend>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <input type="date" placeholder="From Date" id="fromDate" name="fromDate"
                                class="input input-bordered w-full transition-all duration-200 focus:input-primary " />
                            <input type="date" placeholder="To Date" id="toDate"
                                class="input input-bordered w-full transition-all duration-200 focus:input-primary" />
                        </div>
                    </fieldset>

                    <!-- Schedule -->
                    <fieldset class="w-full">
                        <legend class="font-bold text-primary mb-2">Schedule</legend>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <input type="text" placeholder="From Schedule" id="fromSch" name="fromSch"
                                class="input input-bordered w-full transition-all duration-200 focus:input-primary" />
                            <input type="text" placeholder="To Schedule" id="toSch"
                                class="input input-bordered w-full transition-all duration-200 focus:input-primary" />
                        </div>
                    </fieldset>

                    <!-- PUR ITEM -->
                    <fieldset class="w-full">
                        <legend class="font-bold text-primary mb-2">PUR ITEM</legend>
                        <input type="text" id="pItem" name="pItem"
                            class="input input-bordered w-full transition-all duration-200 focus:input-primary" />
                    </fieldset>

                    <!-- Issue No -->
                    <fieldset class="w-full">
                        <legend class="font-bold text-primary mb-2">Issue No</legend>
                        <input type="text" id="issueNo" name="issueNo"
                            class="input input-bordered w-full transition-all duration-200 focus:input-primary" />
                    </fieldset>

                    <!-- Issue To -->
                    <fieldset class="w-full">
                        <legend class="font-bold text-primary mb-2">Issue To</legend>
                        <input type="text" id="issueTo" name="issueTo"
                            class="input input-bordered w-full transition-all duration-200 focus:input-primary" />
                    </fieldset>

                    <!-- Action Buttons: เพิ่มเส้นคั่นด้านบนและระยะห่าง -->
                    <div class="flex flex-col sm:flex-row gap-4 mt-4 pt-6 border-t border-gray-100">
                        <button type="button" id="btnSearch" class="btn btn-primary  border-none min-w-[140px] shadow-md">
                            Search Data
                        </button>
                        <button type="reset" id="btnReset"
                            class="btn btn-warning  border-none min-w-[140px] shadow-md transition-all">
                            Reset Data
                        </button>
                        <button type="button" id="btnExport"
                            class="btn btn-success  border-none min-w-[140px] shadow-md transition-all">
                            Export Data
                        </button>
                    </div>

                    <div class="mt-4 border-t border-base-300 pt-6">
                        <div class="w-full overflow-hidden ">
                            <div class=" w-full  px-4 py-3">
                                <table class="table table-zebra w-full min-w-[1000px] text-sm" id="reportTable">
                                </table>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/prRPreport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
