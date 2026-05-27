@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        #stampTable tbody tr {
            height: 48px;
        }

        #stampTable tbody td {
            padding: 10px 12px !important;
            vertical-align: middle;
        }

        #stampTable tbody input,
        #stampTable tbody select,
        #stampTable tbody textarea {
            min-height: 38px;
            padding: 6px 10px;
        }

   /* body {
            font-family: 'Segoe UI', sans-serif;
            background: #f4f6f9;
            margin: 0;
            padding: 20px;
        } */

        h1 {
            color: #1f2d3d;
            margin-bottom: 20px;
        }

        .card-container {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .card {
            background: #fff;
            border-radius: 15px;
            padding: 20px;
            min-width: 220px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
        }

        .card h4 {
            color: #6c757d;
            margin: 0 0 10px;
        }

        .card .value {
            font-size: 36px;
            font-weight: bold;
            color: #ff7a00;
        }

        .nav-btn {
            background: #0d1b3d;
            color: #fff;
            border: none;
            border-radius: 10px;
            padding: 5px 10px;
            margin: 5px;
            cursor: pointer;
        }

        .export-btn {
            font-size: 32px;
            color: #ff7a00;
            border: 3px solid #ff7a00;
            width: 20%;
            height: 20%;
            text-align: center;
            line-height: 55px;
            border-radius: 8px;
        }

        .icon {
            position: absolute;
            right: 15px;
            bottom: 15px;
            font-size: 24px;
            color: #0d1b3d;
        }

    </style>
@endsection
@section('contents')
  {{-- //----------------------------------------------------------------- --}}
    <div class="show-page min-h-screen py-8 px-4 font-sans flex flex-col items-center text-slate-700">
        <div class="max-w-5xl w-full mx-auto">

            {{-- Page Header --}}
            <div class="card show-card-header shadow-md rounded-2xl mb-5 relative overflow-hidden">
                <div class="card-body px-8 py-5">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div class="flex items-center gap-4">
                            <div class="bg-sky-600 text-white rounded-xl p-3 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     class="w-6 h-6"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor"
                                     stroke-width="2">
                                    <path stroke-linecap="round"
                                          stroke-linejoin="round"
                                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25z" />
                                </svg>
                            </div>

                            <div>
                                <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">
                                    Control duty stamp report
                                </h1>
                            </div>
                        </div>

                        {{-- <div class="flex items-center gap-2">
                            <span class="badge badge-outline badge-lg font-bold px-5 py-4 text-sm shadow-sm border-slate-300 text-slate-600"
                                  id="Pos">
                            </span>
                        </div> --}}
                    </div>
                </div>
            </div>

<div class="card bg-base-100 shadow-xl border border-base-200 rounded-2xl overflow-hidden">
                <div class="card-body px-6 py-8 md:px-10">
                    <form action="#" id="form" method="POST" enctype="multipart/form-data" class="space-y-8">
                        <div>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-primary/20 p-1.5 rounded-lg text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 class="text-base font-bold text-primary uppercase tracking-widest">Request Physical Year report
                                </h2>
                            </div>
                            <div class="bg-primary/5 rounded-xl border border-primary/20 p-5 shadow-sm space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                                    <div class="form-control">
                                        <h4>FYEAR</h4>
                                        <label class="label pb-1">
                                            
                                            
                                            <div class="value" id="year">{{ date('Y') }}</div>
                                            {{-- <button class="nav-btn" onclick="changeYear(-1)">&lt;</button>
                                            <button class="nav-btn" onclick="changeYear(1)">&gt;</button> --}}
                                            <button type="button" class="nav-btn" onclick="changeYear(-1)">&lt;</button>
                                            <button type="button" class="nav-btn" onclick="changeYear(1)">&gt;</button>



                                        </label>
                                    </div>
                                    
                                    <div class="form-control h-full">
                                        <h4>Export</h4>

                                    <button type="button" id="addStampRow" class="btn btn-sm btn-accent ml-auto gap-1 mt-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                     Export
                                    </button>


                                    </div>
                                </div>
                            </div>  
                        </div>
                        </div>
    </div>
</div>  

<section>
    <div class="flex items-center gap-3 mb-4">
         <div class="bg-emerald-100 p-1.5 rounded-lg text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg"
                 class="w-5 h-5"
                 fill="none"
                 viewBox="0 0 24 24"
                 stroke="currentColor"
                 stroke-width="2">
                 <path stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>

                <h2 class="text-base font-bold text-emerald-700 uppercase tracking-widest">
                                        REPORT Stamp duty report FY <span id="reportYear">{{ date('Y') }}</span>
                </h2>
        </div>

            <div class="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table id="stampTable" class="table table-xs w-full text-center"></table>
                    
          </div>
      </div>
 </section>


@endsection

@section('scripts')

<script src="{{ $_ENV['APP_JS'] }}/report.js?ver={{ $GLOBALS['version'] }}"></script>

@endsection