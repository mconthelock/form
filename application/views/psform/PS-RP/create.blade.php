@extends('layouts/webflowTemplate')

@section('contents')
    <div class="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <!-- Form Container Card -->
        <div class="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">

            <!-- Elegant Header Banner -->
            <div class="bg-gradient-to-r from-primary to-blue-600 p-6 text-white ">
                <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-3 ">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                    Return Part/Material to WHI
                </h1>
                <p class="text-sm opacity-80 mt-1 flex items-center justify-center">Modern Warehouse Material Return & Revise Request Form</p>
            </div>

            <form class="card-body gap-6 p-6 md:p-8" id="rpForm">
                <!-- Section 1: User & Request Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text font-bold text-base-content/80 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 bg-primary rounded-full"></span> Input By
                            </span>
                        </label>
                        <input type="text" placeholder="Enter Employee ID"
                            class="input input-bordered w-full transition-all duration-200 focus:input-primary "
                            id="INPUTBY" name="INPUTBY" />
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text font-bold text-base-content/80 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 bg-primary rounded-full"></span> Name
                            </span>
                        </label>
                        <input type="text" placeholder="Enter Full Name"
                            class="input input-bordered w-full transition-all duration-200 focus:input-primary "
                            id="inputName" name="inputName" readonly />
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text font-bold text-base-content/80 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 bg-primary rounded-full"></span> Request By
                            </span>
                        </label>
                        <input type="text" placeholder="Enter Requester ID"
                            class="input input-bordered w-full transition-all duration-200 focus:input-primary req"
                            id="REQBY" name="REQBY" />
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text font-bold text-base-content/80 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 bg-primary rounded-full"></span> Name
                            </span>
                        </label>
                        <input type="text" placeholder="Enter Requester Name"
                            class="input input-bordered w-full transition-all duration-200 focus:input-primary "
                            id="empName" name="empName" readonly />
                    </div>
                </div>

                <!-- Section 2: Remark -->
                <div class="w-full">
                    <div class="form-control w-full">
                        <label class="label pb-1">
                            <span class="label-text font-bold text-base-content/80 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                Remark
                            </span>
                        </label>

                        <textarea class="textarea textarea-bordered h-28 w-full focus:textarea-primary req"
                            placeholder="Describe the reason for returning or details of the rivision..." id="reason" name="REASON"></textarea>
                    </div>
                </div>

                <!-- Section 3: Request For Option Checklist -->
                <div class="form-control bg-base-200/60 border border-base-300 p-4 rounded-xl ">
                    <span class="label-text font-bold text-base-content/80 mb-3 block flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Request For
                    </span>
                    <div class="flex flex-col sm:flex-row gap-6">
                        <label
                            class="label cursor-pointer justify-start gap-3 bg-base-100 px-4 py-2 rounded-lg border border-base-300 shadow-sm hover:border-primary transition-all">
                            <input type="radio" id="option1" name="REQ_TYPE" value="0"
                                class="radio radio-primary " checked />
                            <span class="label-text font-medium text-base-content">Revise Part to Warehouse</span>
                        </label>
                        <label
                            class="label cursor-pointer justify-start gap-3 bg-base-100 px-4 py-2 rounded-lg border border-base-300 shadow-sm hover:border-primary transition-all">
                            <input type="radio" id="option2" name="REQ_TYPE" value="1"
                                class="radio radio-primary " />
                            <span class="label-text font-medium text-base-content">Return Part to Warehouse</span>
                        </label>
                    </div>
                </div>

                <!-- Section 4: Data Dynamic Table Header -->
                <div
                    class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 border-t border-base-300 pt-6">
                    <div>
                        <h2 class="text-xl font-bold text-primary flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Parts / Materials Details
                        </h2>
                        <p class="text-xs text-base-content/60">Fill in the technical and warehouse destination attributes
                            below.</p>
                    </div>
                    <label for="modal-add" id="btnaddDatarow"
                        class="btn btn-info btn-sm gap-2 shadow-md hover:scale-105 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Data Row
                    </label>
                </div>

                <!-- Section 5: Responsive Data Table with Form Elements -->
                {{-- <div class="w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm"> --}}
                <div class="w-full overflow-hidden ">
                    <div class=" w-full  px-4 py-3">
                        <table class="table table-zebra w-full min-w-[1000px] text-sm" id="Addtable">
                        </table>
                    </div>
                </div>

                <div
                    class="mt-4 border-t border-base-300 pt-6">
                    <div id="sentRequest"></div>
                </div>
            </form>
        </div>
    </div>
    <input type="checkbox" id="modal-add" class="modal-toggle" />

    <div class="modal" role="dialog">
        <div class="modal-box flex w-[95vw] max-w-7xl max-h-[90vh] flex-col overflow-hidden p-0">
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-base-300 px-6 py-4">
                <h3 class="text-lg font-bold" id="modalHeader"></h3>

                <label for="modal-add" class="btn btn-sm btn-circle btn-ghost">
                    ✕
                </label>
            </div>

            <!-- Modal Content -->
            <div class="flex-1 overflow-y-auto px-6 py-5">
                <div class="w-full space-y-5">

                    <!-- Search Area -->
                    <div class="w-full rounded-xl border border-base-300 bg-base-200/60 p-4 shadow-sm">
                        <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <!-- PUR ITEM -->
                            <div class="form-control w-full" id="hiddenPuritem">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        PUR ITEM
                                    </span>
                                </label>

                                <input type="text" id="PURITEM" name="PURITEM"
                                    class="input input-bordered input-sm w-full bg-base-100 focus:input-primary"
                                    placeholder="PUR Item" />
                            </div>

                            <!-- ISSUE NO -->
                            <div class="form-control w-full">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        ISSUE NO
                                    </span>
                                </label>

                                <input type="text" id="ISSUENO" name="ISSUENO"
                                    class="input input-bordered input-sm w-full bg-base-100 focus:input-primary"
                                    placeholder="Issue No" />
                            </div>

                            <!-- SCHEDULE -->
                            <div class="form-control w-full" id="hiddenSch">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        SCHEDULE
                                    </span>
                                </label>

                                <input type="text" id="SCHEDULE" name="SCHEDULE"
                                    class="input input-bordered input-sm w-full bg-base-100 focus:input-primary"
                                    placeholder="Schedule" />
                            </div>

                            <!-- ISSUE TO -->
                            <div class="form-control w-full" id="hiddenIssueto">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        ISSUE TO
                                    </span>
                                </label>

                                <input type="text" id="ISSUETO" name="ISSUETO"
                                    class="input input-bordered input-sm w-full bg-base-100 focus:input-primary"
                                    placeholder="Issue To" />
                            </div>
                        </div>

                        <!-- Search Buttons -->
                        <div class="mt-4 flex flex-wrap justify-end gap-2">
                            <button type="button" id="btnSearch" class="btn btn-primary btn-sm gap-2 shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                                </svg>

                                Search
                            </button>

                            <button type="button" id="btnClear" class="btn btn-error btn-sm btn-soft shadow-md transition-all">
                                Clear
                            </button>
                        </div>
                    </div>

                    <!-- Table Area -->
                    <div class="w-full overflow-hidden ">
                        <div class="w-full px-4 py-3">
                            <table class="table table-zebra w-full min-w-[1000px] text-sm" id="modalTable">
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex flex-wrap justify-end gap-2 border-t border-base-300 bg-base-100 px-6 py-4">
                <label class="btn btn-warning" for="modal-add" id="addData">
                    Add
                </label>

                <label class="btn" for="modal-add">
                    Close
                </label>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psRP.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
