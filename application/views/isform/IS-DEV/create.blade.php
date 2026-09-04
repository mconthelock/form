@extends('layouts/webflowTemplate')
@section('contents')
    <section class="flex flex-col gap-3 mb-4 w-full px-32">
        <h1 class="text-3xl font-bold text-primary">Program requesition</h1>
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
                            <h1>Chalormsak</h1>
                            <p class="text-sm text-gray-500">chalormsak@example.com</p>
                        </div>
                </fieldset>
            </div>
        </fieldset>
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Request Detail</legend>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Title</legend>
                <input type="text" class="input w-full" placeholder="Type here" />
            </fieldset>
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
                <legend class="fieldset-legend">Detail</legend>
                <textarea class="textarea w-full" placeholder="Bio"></textarea>
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Additional Information</legend>
                <div class="flex gap-2 items-center ">
                    <input type="file" class="file-input flex-1" />
                    <button class="btn btn-primary btn-sm">+</button>
                </div>
            </fieldset>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi hidden">
            <legend class="font-semibold text-lg px-1">Expected Outcome</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-benefit')
            </div>
            <p class="label mt-1 text-xs"></p>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi hidden">
            <legend class="font-semibold text-lg px-1">Efficiency Gains</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-labor')
            </div>
            <p class="label text-sm">Optional</p>
            <div class="flex mt-3 ">
                <button class="btn btn-outline btn-primary">Add Row</button>
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi hidden">
            <legend class="font-semibold text-lg px-1">Equipment Invest</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-investment')
            </div>
            <div class="flex mt-3 ">
                <button class="btn btn-outline btn-primary"><i class="fi fi-tr-multiple"></i>Add Row</button>
            </div>
        </fieldset>

        <div class="flex gap-3 mt-3 ">
            <button class="btn btn-primary"><i class="fi fi-tr-multiple"></i>Confirm</button>
        </div>
    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/is-dev.js"></script>
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
            background: rgba(0, 0, 0, 0.15)
        }
    </style>
@endsection
