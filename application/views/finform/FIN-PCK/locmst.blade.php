@extends('layouts/webflowTemplate')

@section('styles')
<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    fieldset:not(:has(.fieldset-label)) {
        display: flex;
    }

    fieldset span {
        font-weight: bold;
        white-space: nowrap;
        width: fit-content;
    }

    label:not(:has(input[name="DELIVELY"])):not(:has(input[name="FORM_TYPE"])) {
        width: 100%;
    }

    span.required::after, h2.required::after {
        content: "**";
        color: red;
        font-weight: bold;
        padding-left: 0.25rem;
    }
    





</style>
@endsection
@section('contents')
<div class="p-6 max-w-7xl mx-auto flex flex-col gap-6 min-w-[70vw]">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 shadow-md rounded-lg p-6">
        <div>
            <h1 class="text-2xl font-bold text-base-content flex items-center gap-2">Location Master Management
            </h1>
        </div>
        
        <div class="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <button type="button" id="btnImport" class="btn btn-outline btn-success btn-sm md:btn-md gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V3.75m0 12.75l-4.5-4.5m4.5 4.5l4.5-4.5M3 18.75h18" />
                </svg>
                <span>Import</span>
            </button>

            <button type="button"  id="btnExp"  class="btn btn-outline btn-info btn-sm md:btn-md gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12.75a18.75 18.75 0 0 0 2.25-2.25M12 3a18.75 18.75 0 0 1-2.25 2.25M12 3v12.75m-9 3h18" />
                </svg>
                <span>Export</span>
            </button>

            <button type="button" id="btnAdd" class="btn btn-primary btn-sm md:btn-md gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>ADD</span>
            </button>
        </div>
    </div>
    <div class="bg-base-100 shadow-md rounded-lg p-6">
        <div class="w-full">
            <table class="table !table-zebra"  id="tableLocMst" style="width:100%">
            </table>
        </div>
    </div>

</div>
<dialog id="modalAdd" class="modal">
    <div class="modal-box max-w-xl">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        
        <h3 id="modalTitle" class="text-xl font-bold mb-4">Add New Location</h3>
        <hr class="border-base-300 mb-4">
        
        <form id="formAddLocation">
            <section>
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text required">Location Code</span>
                    </label>
                    <input type="text" name="LOCCODE"  placeholder="311" required class="input input-bordered w-full req" />
                </div>

                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text required">Location Name</span>
                    </label>
                    <input type="text" name="LOCNAME" placeholder="RAF DIV." required class="input input-bordered w-full req" />
                </div>

                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text required">Position</span>
                    </label>
                     <select name="SPOSCODE" id="POS_SELECT" class="select select-bordered select-sm bg-gray-50 border-gray-300 pos  w-full req" style="width: 100%;">
                            <option value="">-- Select Position --</option>
                    </select>
                </div>
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text required">Organize</span>
                    </label>
                     <select name="VORGNO" id="ORG_SELECT" class="select select-bordered select-sm bg-gray-50 border-gray-300 org  w-full req" style="width: 100%;">
                            <option value="">-- Select Organize --</option>
                    </select>
                </div>

            </section>

            <div class="modal-action mt-6">
                <button type="button" onclick="document.getElementById('modalAdd').close()" class="btn btn-ghost">Cancel</button>
                <button type="button"  id="btnSaveLocation" class="btn btn-primary px-6">Save</button>
          
            </div>
        </form>
    </div>
</dialog>

<dialog id="modalImport" class="modal">
    <div class="modal-box max-w-md">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        
        <h3 class="text-xl font-bold mb-4">Import Excel Data</h3>
        <hr class="border-base-300 mb-4">
        
        <form id="formImportExcel">
            <section>
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text required">เลือกไฟล์ Excel (.xlsx)</span>
                    </label>
                    <input type="file" id="excelFile" accept=".xlsx" required class="file-input file-input-bordered file-input-success w-full req" />
                    <label class="label">
                        <span class="label-text-alt text-base-content/60">โปรดตรวจสอบว่าใช้ Template ที่กำหนดเท่านั้น</span>
                    </label>
                </div>
            </section>

            <div class="modal-action mt-6">
                <button type="button" onclick="document.getElementById('modalImport').close()" class="btn btn-ghost">Cancel</button>
                <button type="button" id="uploadFile" class="btn btn-success text-white px-6">Upload</button>
            </div>
        </form>
    </div>
</dialog>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/locmst.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection