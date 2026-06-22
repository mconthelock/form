@extends('layouts/webflowTemplate')

@section('contents')
    <div class="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <!-- Card Container: ปรับขนาดเป็น max-w-2xl เพื่อให้ฟอร์มดูกระชับพอดี ไม่กว้างเกินไป -->
        <div class="card w-full bg-base-100 shadow-xl border border-gray-200 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
                <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-3 ">

                    <svg class="w-[35px] h-[35px] text-gray-800 dark:text-white" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4" />
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
                    <div class="flex flex-col sm:flex-row gap-4 mt-4 pt-6 border-t border-gray-200">
                        <button type="button" id="btnSearch"
                            class="btn btn-info  border-none min-w-[140px] shadow-md transition-all">
                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                viewBox="0 0 24 24">
                                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
                                <path fill-rule="evenodd"
                                    d="M21.707 21.707a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.414l3.5 3.5a1 1 0 0 1 0 1.414Z"
                                    clip-rule="evenodd" />
                            </svg>
                            Search
                        </button>
                        <button type="reset" id="btnReset"
                            class="btn btn-warning btn-soft  border-none min-w-[140px] shadow-md transition-all">
                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4" />
                            </svg>

                            Reset Data
                        </button>
                        <button type="button" id="btnExport"
                            class="btn btn-success btn-soft  border-none min-w-[140px] shadow-md transition-all">
                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                viewBox="0 0 24 24">
                                <path fill-rule="evenodd"
                                    d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v9.293l-2-2a1 1 0 0 0-1.414 1.414l.293.293h-6.586a1 1 0 1 0 0 2h6.586l-.293.293A1 1 0 0 0 18 16.707l2-2V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z"
                                    clip-rule="evenodd" />
                            </svg>

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
