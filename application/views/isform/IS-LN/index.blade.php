@extends('layouts/webflowTemplate')

@section('styles')
    {{-- สามารถลบ style block นี้ได้ถ้าไม่จำเป็นแล้ว --}}
@endsection

@section('contents')

    {{-- ใช้ Flexbox เพื่อจัดฟอร์มให้อยู่กึ่งกลางหน้าจอ และเพิ่มพื้นหลัง --}}

    {{-- ใช้ card component ของ DaisyUI --}}
    <div class="max-w-6xl w-full mx-auto px-4 py-8 bg-white shadow rounded-xl">
        <h1 class="card-title text-2xl justify-center">FINANCIAL SYSTEM</h1>
        <h2 class="text-center font-semibold mb-6 underline">USER REGISTRATION FORM</h2>

        {{-- FORM DESCRIPTION --}}
        <fieldset class="border border-base-300 p-4 rounded-lg mb-6 bg-gray-100">
            <legend class="font-semibold text-primary px-2">FORM DESCRIPTION</legend>
            <div class="grid md:grid-cols-2 gap-x-6 gap-y-2">
                {{-- ใช้ form-control pattern ของ DaisyUI --}}
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-semibold">Input By : <span class="text-error">*</span></span>
                    </label>
                    <input type="text" id="input-by" placeholder="Employee ID (e.g. 24012)" class="input input-bordered w-full rounded-lg bg-white" value="{{ isset($_GET['empno']) ? $_GET['empno'] : '' }}" />
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-semibold">Request By : <span class="text-error">*</span></span>
                    </label>
                    <input type="text" id="request-by" placeholder="Employee ID (e.g. 24012)" class="input input-bordered w-full rounded-lg bg-white" />
                </div>
            </div>
        </fieldset>

        <!-- <fieldset class="border border-base-300 p-4 rounded-lg mb-6 bg-gray-50">
                <legend class="font-semibold text-primary px-2">PART I : USER DESCRIPTION</legend>
                <div class="grid md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                    <div class="form-control">
                        <label class="label"><span class="label-text font-semibold">UserID/Emp Code :</span></label>
                        <input type="text" value="" class="input input-bordered w-full rounded-lg bg-white" />
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-semibold">Department :</span></label>
                        <input type="text" value="" class="input input-bordered w-full rounded-lg bg-white" />
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-semibold">Employee Name :</span></label>
                        <input type="text" value="" class="input input-bordered w-full rounded-lg bg-white" />
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-semibold">Section :</span></label>
                        <input type="text" value="" class="input input-bordered w-full rounded-lg bg-white" />
                    </div>
                </div>
            </fieldset> -->

        <fieldset class="border border-base-300 p-4 rounded-lg mb-6 bg-gray-100">
            <legend class="font-semibold text-primary px-2">PART II : PROGRAM REQUESTION</legend>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-4">
                @foreach ($action as $at)
                    <label class="label cursor-pointer justify-start gap-2"><input type="radio" name="action" value="{{ $at->ACTION_ID }}" class="radio radio-primary" /><span>{{ $at->ACTION_NAME }}</span></label>
                @endforeach
                <!-- <label class="label cursor-pointer justify-start gap-2"><input type="radio" name="action" class="radio radio-primary" checked /><span>Add new user</span></label> -->
                <!-- <label class="label cursor-pointer justify-start gap-2"><input type="radio" name="action" class="radio radio-primary" /><span>Add new role</span></label> -->
                <!-- <label class="label cursor-pointer justify-start gap-2"><input type="radio" name="action" class="radio radio-primary" /><span>Delete user</span></label> -->
                <!-- <label class="label cursor-pointer justify-start gap-2"><input type="radio" name="action" class="radio radio-primary" /><span>Update role</span></label> -->
                <!-- <label class="label cursor-pointer justify-start gap-2"><input type="radio" name="action" class="radio radio-primary" /><span>Transfer user</span></label> -->
            </div>

            <div class="form-control mt-4">
                <label class="label"><span class="label-text font-semibold">Group Code :</span></label>
                <input type="text" class="input input-bordered w-full rounded-lg bg-white" placeholder="Please specify group code if necessary" />
            </div>

            <div class="form-control mt-4">
                <label class="label"><span class="label-text font-semibold">Remark :</span></label>
                <textarea class="textarea textarea-bordered w-full rounded-lg bg-white" rows="2" placeholder="Remark..."></textarea>
            </div>
        </fieldset>

        <fieldset class="border border-base-300 p-4 rounded-lg bg-gray-100">
            <legend class="font-semibold text-primary px-2">PART III : Permission / Role</legend>

            <div class="space-y-4 mt-2">


                @foreach ($module as $key => $title)
                    {{-- จัด Layout ใหม่ให้อ่านง่ายขึ้น --}}
                    <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-3 rounded-lg hover:bg-gray-200 transition-colors">
                        <span class="font-semibold text-sm">{{ $title->MODULE_NAME }}</span>
                        <div class="md:col-span-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                            @foreach ($roles as $role)
                                <label class="label cursor-pointer justify-start gap-2">
                                    <input type="checkbox" name="{{ $title->MODULE_ID }}[]" value="{{ $role->ROLE_ID }}" class="checkbox checkbox-primary checkbox-sm" />
                                    <span>{{ $role->ROLE_NAME }}</span>
                                </label>
                            @endforeach
                        </div>
                    </div>
                @endforeach
            </div>

        </fieldset>

        <div class="card-actions justify-end mt-8">
            <button class="btn btn-ghost rounded-lg">Cancel</button>
            <button class="btn btn-primary rounded-lg" id="submit_del">Submit Request</button>
        </div>
    </div>


@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/lnUserReg.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection