@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        .confidential {
            color: red;
            font-weight: bold;
        }
    </style>
@endsection

@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{base_url()}}assets/images/loading_gif.gif" alt="Loading..." width="150">
        </div>
    </div>

    <div class="max-w-6xl w-full mx-auto px-4 py-8 bg-white shadow rounded-xl">
        <div class="form-info" NFRMNO="{{ $_GET['no'] }}" VORGNO="{{ $_GET['orgNo'] }}" CYEAR="{{ $_GET['y'] }}"></div>
        <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold text-blue-900">Special Authorization ID Application</h1>
            <div class="text-red-600 font-bold text-xl border-2 border-red-600 px-2 py-1 rounded-lg">CONFIDENTIAL</div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
            <div class="mb-6">
                <label class="block text-sm font-semibold mb-2 text-blue-900">Request date</label>
                <input type="date" class="input rounded-lg input-bordered w-full bg-white" id="request-date" value="" />
            </div>

            <div class="mb-6">
                <label class="block text-sm font-semibold mb-2 text-blue-900">Requester <label style="color:red">*</label></label>
                <input type="text" class="input rounded-lg input-bordered w-full bg-white" id="requester"placeholder="Employee ID (e.g. 24012)" />
                <input type="hidden" class="input rounded-lg input-bordered w-full bg-white" id="inputer" value="{{ $_GET['empno'] }}" />
            </div>
        </div>

        <hr class="my-2">

        <fieldset class="fieldset  border-base-300 bg-gray-50 rounded-box w-sm border p-4">
            <legend class="fieldset-legend text-sm font-semibold text-blue-900">Action</legend>
            <div class="grid grid-cols-3 gap-5 justify-center">
                <label class="flex items-center gap-2">
                    <input type="checkbox" class="checkbox checkbox-success action-check" checked value="ADD" /> ADD
                </label>
                <label class="flex items-center gap-2">
                    <input type="checkbox" class="checkbox checkbox-success action-check" value="DELETE" /> DELETE
                </label>
            </div>
        </fieldset>

        <div class="col-span-2">
            <div class="ADD">
                <fieldset class="fieldset border-base-300 bg-gray-50 rounded-box w-full border p-4">
                    <legend class="fieldset-legend text-sm font-semibold text-blue-900">Detail</legend>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">Platform <p style="color:red">*</p></span>
                            <select name="" id="platform" class="select rounded-lg bg-white w-full">
                                <option value="" selected disabled>Choose a platform</option>
                                @foreach ($serverName as $server)
                                    <option value="{{ $server->SERVER_NAME }}">{{ $server->SERVER_NAME }}</option>
                                @endforeach
                            </select>
                        </label>

                        <label class="floating-label mb-3">
                            <span class="label text-2xl text-blue-500">Class</span>
                            <select class="select rounded-lg bg-white w-full" id="class">
                                <option disabled selected>Choose a class</option>
                                <option value="General">General</option>
                                <option value="Almighty">Almighty</option>
                            </select>
                        </label>

                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">Category</span>
                            <select class="select rounded-lg bg-white w-full" id="category">
                                <option disabled selected>Choose a category</option>
                                <option value="APP">APP</option>
                                <option value="DB">DB</option>
                                <option value="OS">OS</option>
                            </select>
                        </label>

                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">Role</span>
                            <input type="text" class="input rounded-lg bg-white w-full" id="role" placeholder="Role" />
                        </label>



                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">Duration Type</span>
                            <select class="select rounded-lg bg-white w-full" id="duration">
                                <option disabled selected>Choose a duration</option>
                                <option value="Permanent">Permanent</option>
                                <option value="Temporary">Temporary</option>
                            </select>
                        </label>

                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">User Type</span>
                            <select class="select rounded-lg bg-white w-full" id="user-type">
                                <option disabled selected>Choose a User Type</option>
                                <option value="System">System</option>
                                <option value="Human">Human</option>
                            </select>
                        </label>

                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">Organizer</span>
                            <select class="select rounded-lg bg-white w-full" id="organizer">
                                <option disabled selected>Choose an organizer</option>
                                <option value="WSD">WSD</option>
                                <option value="AAS">AAS</option>
                                <option value="SSA">SSA</option>
                            </select>
                        </label>

                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">Admin</span>
                            <select class="select rounded-lg bg-white w-full admin" name="" id="admin">
                                <option value="">Choose a admin</option>
                            </select>
                        </label>

                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">Owner</span>
                            <input type="text" class="input rounded-lg bg-white w-full" id="owner" placeholder="Owner" />
                        </label>

                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500 ">Reason</span>
                            <textarea class="textarea rounded-lg bg-white w-full" id="reason" placeholder="Reason"></textarea>
                        </label>

                    </div>
                </fieldset>
                <hr class="my-6">

                <div class="flex justify-end gap-4 mt-6">
                    <button class="btn btn-primary rounded-xl" id="submit">Submit</button>
                    <button class="btn btn-outline rounded-xl">Reset</button>
                </div>
            </div>
            <div class="DEL hidden">
                <fieldset class="fieldset border-base-300 bg-gray-50 rounded-box w-full border p-4">
                    <legend class="fieldset-legend text-sm font-semibold text-blue-900">Detail</legend>

                    <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <label class="floating-label mb-3">
                            <span class="label text-xl text-blue-500">Platform <p style="color:red">*</p></span>
                            <select name="" id="platform_del" class="select rounded-lg bg-white w-full">
                                <option value="" selected disabled>Choose a platform</option>
                                @foreach ($serverName as $server)
                                    <option value="{{ $server->SERVER_NAME }}">{{ $server->SERVER_NAME }}</option>
                                @endforeach
                            </select>
                        </label>

                        {{-- <label class="floating-label mb-3">
                            <span class="label text-2xl text-blue-500">User For Delete</span>
                            
                        </label> --}}
                        <label for="">
                            <span class="label text-blue-500">User For Delete <span class="text-red-500">*</span></span>
                        </label>
                        <select class="select rounded-lg bg-white w-full " id="user_del">
                            <option disabled selected>Choose an User</option>
                        </select>

                        <label class="floating-label mb-3 mt-3">
                            <span class="label text-xl text-blue-500">Admin</span>
                            <select class="select rounded-lg bg-white w-full" name="" id="admin_del">
                                <option value="">Choose a admin</option>
                            </select>
                        </label>

                        <label class="floating-label mb-3 ">
                            <span class="label text-xl text-blue-500 ">Reason</span>
                            <textarea class="textarea rounded-lg bg-white w-full" id="reason_del" placeholder="Reason"></textarea>
                        </label>
                    </div>
                </fieldset>
                <hr class="my-6">

                <div class="flex justify-end gap-4 mt-6">
                    <button class="btn btn-primary rounded-xl" id="submit_del">Submit</button>
                    <button class="btn btn-outline rounded-xl">Reset</button>
                </div>
            </div>
        </div>


    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/specialAuth.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
