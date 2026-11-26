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
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Request Type
            </legend>
            <div class="bg-gray-50 border border-gray-300 px-3 py-2 min-h-10 text-base text-gray-800 map-data"
                data-key="CATEGORY_NAME" data-group="category">
                <div class="skeleton h-6 w-56"></div>
            </div>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Program Name
            </legend>
            <div class="bg-gray-50 border border-gray-300 px-3 py-2 min-h-10 text-base text-gray-800 map-data"
                data-key="SYSTEMNAME" data-group="">
                <div class="skeleton h-6 w-72"></div>
            </div>
        </fieldset>
    </div>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Title</legend>
        <div class="bg-gray-50 border border-gray-300 px-3 py-2 min-h-10 text-base text-gray-800 map-data"
            data-key="TITLE" data-group="">
            <div class="skeleton h-6 w-96 max-w-full"></div>
        </div>
    </fieldset>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Detail</legend>
        <div class="bg-gray-50 border border-gray-300 px-3 py-2.5 min-h-36 text-base text-gray-800 map-data"
            data-key="PURPOSE" data-group="">
            <div class="skeleton h-6 w-full max-w-lg"></div>
        </div>
    </fieldset>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">
            Additional Information
        </legend>
        <p class="text-sm text-gray-500 mb-2">เอกสารแนบที่เกี่ยวข้อง เช่น Flow การทำงาน, Screenshot เป็นต้น</p>
        <div class="bg-gray-50 border border-gray-300 px-3 py-2.5 min-h-12 text-base text-gray-800"
            id="attachment-list">
            <ul class="flex flex-col gap-1.5">
                <li class="text-sm text-gray-400">ไม่มีเอกสารแนบ</li>
            </ul>
        </div>
    </fieldset>
</div>
