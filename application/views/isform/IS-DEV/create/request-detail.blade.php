<header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
    <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">01</span>
    <div>
        <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Request Detail</h2>
        <div class="text-sm text-gray-500">รายละเอียดคำขอพัฒนาหรือปรับปรุงโปรแกรม</div>
    </div>
</header>
<div class="bg-white p-5 flex flex-col gap-5">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">System Name
            </legend>
            <ul class="flex flex-wrap gap-5 pt-1">
                <li class="flex items-center gap-2.5 text-base">
                    <input type="radio" name="system_name" class="radio radio-primary" checked />
                    <span>AS400 Application</span>
                </li>
                <li class="flex items-center gap-2.5 text-base">
                    <input type="radio" name="system_name" class="radio radio-primary" />
                    <span>Windows Application</span>
                </li>
            </ul>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Request Type
            </legend>
            <ul class="flex flex-wrap gap-4 pt-1">
                <li class="flex items-center gap-2.5 text-base">
                    <input type="radio" name="request_type" class="radio radio-primary request-type" value="1"
                        checked />
                    <span>New Program/Additional Request</span>
                </li>
                <li class="flex items-center gap-2.5 text-base">
                    <input type="radio" name="request_type" class="radio radio-primary request-type" value="2" />
                    <span>Modify Program</span>
                </li>
                <li class="flex items-center gap-2.5 text-base">
                    <input type="radio" name="request_type" class="radio radio-primary request-type" value="3" />
                    <span>Fixed Error Program</span>
                </li>
                <li class="flex items-center gap-2.5 text-base">
                    <input type="radio" name="request_type" class="radio radio-primary request-type" value="4" />
                    <span>Data Change</span>
                </li>
                <li class="flex items-center gap-2.5 text-base">
                    <input type="radio" name="request_type" class="radio radio-primary request-type" value="5" />
                    <span>Search Data</span>
                </li>
            </ul>
        </fieldset>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Program Name
            </legend>
            <input type="text" class="input w-full text-base req-1" name="program_name"
                placeholder="ชื่อโปรแกรม เช่น Webflow, SCM, Cost Reduction หรือ Procurement เป็นต้น"
                data-map="SYSTEMNAME" />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Title
            </legend>
            <input type="text" class="input w-full text-base req-1" name="title"
                placeholder="ตั้งชื่อ Request / ชื่อโปรเจค" data-map="TITLE" />
        </fieldset>
    </div>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Detail</legend>
        <textarea class="textarea w-full h-52 text-base text-comment req-1" name="detail" maxlength="500"
            placeholder="เขียนอธิบายภาพรวมของ Requirement นี้ หรือบอกถึงวัตถุประสงค์ของการ Project นี้" data-map="PURPOSE"></textarea>
        <div class="flex items-center justify-between mt-1">
            <div class="label text-sm justify-start text-red-500 text-comment-err p-0"></div>
            <div class="label text-sm justify-end text-count p-0 text-gray-500 font-mono">
                <span class="text-count-no" id="detail-count">0</span>/1000
            </div>
        </div>
    </fieldset>

    <fieldset class="fieldset">
        <div class="flex items-center justify-between mb-1">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700 p-0">
                Additional Information
            </legend>
            <button class="btn btn-sm btn-outline btn-primary gap-1" id="add-file" type="button">
                <i class="fi fi-rr-plus-small text-base"></i>
                <span>Add File</span>
            </button>
        </div>
        <p class="text-sm text-gray-500 mb-2">แนบเอกสารที่เกี่ยวข้อง เช่น Flow การทำงาน, Screenshot เป็นต้น
        </p>
        <div class="flex flex-col gap-2 items-center file-input-wrap">
            <input type="file" class="file-input w-full attachments border-gray-300 text-sm" name="attachments[]" />
        </div>
    </fieldset>
</div>
