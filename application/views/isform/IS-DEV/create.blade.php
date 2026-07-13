@extends('layouts/webflowTemplate')

@section('contents')
    <section class="flex flex-col gap-3 mb-4 px-32 w-full xl:px-70">
        <h1 class="text-3xl font-bold text-primary"> Computer program Requisition Form </h1>
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Requester</legend>
            <div class="flex">
                <fieldset class="fieldset flex-1">
                    <legend class="fieldset-legend">Requrst By</legend>
                    <input type="text" class="input" placeholder="Employee No." />
                </fieldset>
                <fieldset class="fieldset flex-1">
                    <legend class="fieldset-legend">Input By</legend>
                    <div class="flex items-center gap-3">
                        <div class="avatar flex-none">
                            <div class="w-16 rounded-full">
                                <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                            </div>
                        </div>
                        <div class="flex-1">
                            <h1 class="font-bold text-md">Chalormsak Sewanam</h1>
                            <h2>12069</h2>
                            <p class="text-xs text-gray-500">chalormsak@example.com</p>
                        </div>
                </fieldset>
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Request Detail</legend>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">System Name</legend>
                <ul class="flex gap-5">
                    <li class="flex items-center gap-3"><input type="radio" name="radio-2"
                            class="radio radio-primary" />AS400 Application</li>
                    <li class="flex items-center gap-3"><input type="radio" name="radio-2"
                            class="radio radio-primary" />Windows Application</li>
                </ul>
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Request Type</legend>
                <ul class="flex gap-5">
                    <li class="flex items-center gap-3"><input type="radio" name="radio-2"
                            class="radio radio-primary request-type" value="1" />Additional Request</li>
                    <li class="flex items-center gap-3"><input type="radio" name="radio-2"
                            class="radio radio-primary request-type" value="2" />Modify Program</li>
                    <li class="flex items-center gap-3"><input type="radio" name="radio-2"
                            class="radio radio-primary request-type" value="3" />Fixed Error Program</li>
                    <li class="flex items-center gap-3"><input type="radio" name="radio-2"
                            class="radio radio-primary request-type" value="4" />Data Change</li>
                    <li class="flex items-center gap-3"><input type="radio" name="radio-2"
                            class="radio radio-primary request-type" value="5" />Search Data</li>
                </ul>

            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Title</legend>
                <input type="text" class="input w-full" placeholder="Type here" />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Detail</legend>
                <textarea class="textarea w-full" placeholder="Bio"></textarea>
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Additional Information</legend>
                <div class="flex gap-2 items-center ">
                    <input type="file" class="file-input file-input-sm flex-1" />
                    <button class="btn btn-primary btn-sm">+</button>
                </div>
            </fieldset>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi hiddenx">
            <legend class="font-semibold text-lg px-1">Expected Outcome</legend>

            <div class="flex gap-3">
                <div class="flex-1">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Current Workflow</legend>
                        <textarea class="textarea w-full" placeholder="Bio"></textarea>
                    </fieldset>
                </div>
                <div class="flex-1">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Current Workflow</legend>
                        <textarea class="textarea w-full" placeholder="Bio"></textarea>
                    </fieldset>
                </div>
            </div>


            <fieldset class="fieldset">
                <legend class="fieldset-legend">Current Workflow</legend>
                <textarea class="textarea w-full" placeholder="Bio"></textarea>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Expected Workflow</legend>
                <textarea class="textarea w-full" placeholder="Bio"></textarea>
            </fieldset>


            <div class="table-wrap overflow-x-auto mt-3">
                @include('isform.FORM-1.table-benefit')
            </div>
            <p class="label mt-1 text-xs"></p>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi hiddenx">
            <legend class="font-semibold text-lg px-1">Efficiency Gains</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-labor')
            </div>
            <div class="flex mt-3 ">
                <button class="btn btn-outline btn-primary">+ More Row</button>
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi hiddenx">
            <legend class="font-semibold text-lg px-1">Investment in equipment.</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-investment')
            </div>
            <div class="flex mt-3 ">
                <button class="btn btn-outline btn-primary"><i class="fi fi-tr-multiple"></i>+ More Item</button>
            </div>
        </fieldset>

        <div class="flex gap-3 mt-3 ">
            <button class="btn btn-primary"><i class="fi fi-tr-multiple"></i>Confirm</button>
        </div>
    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/isDev.js"></script>
@endsection

@section('styles')
    <style>
        .table-edit tbody tr td {
            padding: 0 !important;
        }

        .table-edit tbody tr td:not(:last-child),
        .table-edit tbody tr th {
            border-right: 1px solid var(--color-gray-300);
        }

        .table-edit tbody tr td input {
            width: 100%;
            height: 100%;
            min-height: 40px;
            padding: 10px;
            border: none;
            background-color: var(--color-primary-content);
            text-align: right;
        }

        .table-edit tbody tr td input:focus {
            outline: none;
            box-shadow: none;
        }

        .table-edit tbody tr td input:read-only {
            background-color: var(--color-gray-100);
        }
    </style>
@endsection
