@extends('layouts/webflowTemplate')
@section('contents')
    <section class="flex flex-col gap-3 mb-4 w-full px-[8rem]">
        <h1 class="text-3xl font-bold text-primary">Annual software development plan</h1>
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Requester</legend>
            <div class="flex">
                <fieldset class="fieldset flex-1">
                    <legend class="fieldset-legend">Requrst By</legend>
                    <input type="text" class="input req" placeholder="Employee No." id="requester" />
                    <div class="hidden flex items-start gap-3 requester-info">
                        <div class="avatar flex-none">
                            <div class="w-16 rounded-full">
                                <img src="#" />
                            </div>
                        </div>
                        <div class="flex-1">
                            <h1 class="text-sm font-semibold"></h1>
                            <p class="text-sm text-gray-500 mb-3"></p>
                            <a class="text-sm text-blue-500" href="#" id="remove-requester">Remove</a>
                        </div>
                    </div>
                </fieldset>
                <fieldset class="fieldset flex-1">
                    <legend class="fieldset-legend">Input By</legend>
                    <div class="flex items-start gap-3 inputter-info">
                        <input type="text" class="hidden" name="inputter" />
                        <div class="avatar flex-none">
                            <div class="w-16 rounded-full">
                                <img src="#" />
                            </div>
                        </div>
                        <div class="flex-1">
                            <h1 class="text-sm font-semibold"></h1>
                            <p class="text-sm text-gray-500 mb-3"></p>
                        </div>
                    </div>
                </fieldset>
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Request Detail</legend>
            <div class="flex gap-3 w-full justify-between">
                <fieldset class="fieldset flex-1">
                    <legend class="fieldset-legend">Title</legend>
                    <input type="text" class="input w-full req" name="title" placeholder="Type here" />
                </fieldset>
                <fieldset class="fieldset flex-none">
                    <legend class="fieldset-legend">Objective</legend>
                    <select class="select w-full req" name="objective" id="objective">
                        <option disabled selected>Select Objective</option>
                    </select>
                </fieldset>
            </div>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Purpose</legend>
                <textarea class="textarea w-full req" name="purpose" placeholder=""></textarea>
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Current Working Operation</legend>
                <textarea class="textarea w-full req" name="current" placeholder="Bio"></textarea>
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Expected Outcome</legend>
                <textarea class="textarea w-full req" name="expected" placeholder="Bio"></textarea>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Additional Information</legend>
                <div class="flex gap-2 items-center ">
                    <input type="file" class="file-input w-full flex-1" name="file[]"
                        accept="image/*,.pdf,.docx, .xlsx, .pptx" />
                    <button class="btn btn-primary btn-sm" type="button" id="add-file">+</button>
                </div>
            </fieldset>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Expected Outcome</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-benefit')
            </div>
            <p class="label mt-1 text-xs"></p>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Efficiency Gains</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-labor')
            </div>
            <p class="label text-sm">Optional</p>
            <div class="flex mt-3 ">
                <button class="btn btn-outline btn-primary" id="add-row-benefit">Add Row</button>
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Equipment Invest</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-investment')
            </div>
            <div class="flex mt-3 ">
                <button class="btn btn-outline btn-primary" id="add-row-investment"><i class="fi fi-tr-multiple"></i>Add
                    Row</button>
            </div>
        </fieldset>

        <div class="flex gap-3 mt-3 ">
            <button class="btn btn-outline btn-primary"><i class="fi fi-tr-multiple"></i>Draft</button>
            <button class="btn btn-primary"><i class="fi fi-tr-multiple"></i>Confirm</button>
        </div>
    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form-1.js"></script>
    <script src="{{ $_ENV['APP_JS'] }}/form-1-ui.js"></script>
@endsection

@section('styles')
    <style>
        .table-wrap {
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .table thead tr th {
            text-align: center;
            vertical-align: middle;
            font-weight: 700;
            background: var(--color-primary);
            color: white;
        }

        .table tbody tr td {
            padding: 0 .5rem;
        }

        .table tbody tr td input {
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            border: none;
            border-radius: 0%;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.15);
            text-align: right;
        }
    </style>
@endsection
