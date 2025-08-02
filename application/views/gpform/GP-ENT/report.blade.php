@extends('layouts.webflowTemplate')

@section('styles')
    {{-- หากมี styles เพิ่มเติมสำหรับหน้านี้ --}}
    <style>
        .select2-container .select2-selection--single {
            border-radius: 0.75rem !important;
        }

        .loader {
            border-top-color: #3498db;
        }
    </style>
@endsection

@section('contents')
    <div id="loading-overlay" class="fixed inset-0 bg-white/50 flex items-center justify-center z-[9999] hidden">
        <div class="loader border-4 border-t-4 border-gray-200 rounded-full w-16 h-16 animate-spin"></div>
        
    </div>

    <div class="relative min-h-[calc(100vh-7rem)] flex items-center justify-center">
        <div class="card w-full max-w-5xl bg-green-100 shadow-xl">
            <div class="card-body">
                <h2 class="card-title text-2xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a4 4 0 014 4v2" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17h6" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a4 4 0 00-4-4H9a4 4 0 00-4 4" />
                    </svg>
                    Entertainment Report

                </h2>
                <div role="alert" class="alert alert-error" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>กรุณาเลือก Entertainment Type !</span>
                </div>

                <div class="divider"></div>

                <form action="#" method="GET">
                    {{-- Filter Grid --}}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                        {{-- EmpCode --}}
                        <div class="form-control w-full">
                            <label class="label" for="emp_code">
                                <span class="label-text">EmpCode</span>
                            </label>
                            <input type="text" id="emp_code" name="emp_code" placeholder="Enter employee code" class="input input-bordered rounded-xl w-full" />
                        </div>

                        {{-- Entertainment Type --}}
                        <div class="form-control w-full">
                            <label class="label" for="entertain_type">
                                <span class="label-text">Entertainment Type<span class="text-red-500">*</span></span>
                            </label>
                            <select id="entertain_type" name="entertain_type" class="select select-bordered rounded-xl w-full" required>
                                <option disabled selected value="">Please Select</option>
                                <option value="type1">Requesting Approval for Entertainment</option>
                                <option value="type2">Clearance Expense for Entertainment</option>
                            </select>
                        </div>

                        {{-- Entertainment Date --}}
                        <div class="form-control w-full">
                            <label class="label" for="daterange">
                                <span class="label-text">Entertainment Date</span>
                            </label>
                            <input id="daterange" name="daterange" type="text" class="input input-bordered rounded-xl w-full" placeholder="Select date range..." readonly />
                        </div>

                        {{-- Section --}}
                        <div class="form-control w-full">
                            <label class="label" for="section">
                                <span class="label-text">Section</span>
                            </label>
                            <select id="section" name="section" class="select select-bordered rounded-xl select2 w-full">
                                <option value="">All Sections</option>
                                @foreach ($section as $sec)
                                    <option value="{{ $sec->SSECCODE }}">{{ $sec->SSEC }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- Department --}}
                        <div class="form-control w-full">
                            <label class="label" for="department">
                                <span class="label-text">Department</span>
                            </label>
                            <select id="department" name="department" class="select select-bordered rounded-xl select2 w-full">
                                <option value="">All Departments</option>
                                @foreach ($department as $dep)
                                    <option value="{{ $dep->SDEPCODE }}">{{ $dep->SDEPT }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- Division --}}
                        <div class="form-control w-full">
                            <label class="label" for="division">
                                <span class="label-text">Division</span>
                            </label>
                            <select id="division" name="division" class="select select-bordered rounded-xl select2 w-full">
                                <option value="">All Divisions</option>
                                @foreach ($division as $div)
                                    <option value="{{ $div->SDIVCODE }}">{{ $div->SDIV }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    {{-- Action Buttons --}}
                    <div class="card-actions justify-end mt-8">
                        <button type="reset" class="btn btn-ghost">Clear</button>
                        <button type="submit" class="btn btn-primary" id="search_btn">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                            </svg>
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    {{-- อย่าลืมใส่ id ให้กับ input/select เพื่อให้ JS ทำงานได้ถูกต้อง --}}
    <script src="{{ $_ENV['APP_JS'] }}/entertainReport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection