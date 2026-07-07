import { dragDropInit } from '@amec/webasset/dragdrop';
$(document).ready(async function () {
    dragDropInit();
    // 1. เปิด Modal
    $('#btnOpenModal').on('click', function () {
        $('#searchModal')[0].showModal(); // เรียกใช้คำสั่งของ HTML dialog
    });

    // 2. ปิด Modal (เมื่อกดปุ่มปิด)
    $('#btnCloseModal').on('click', function () {
        $('#searchModal')[0].close();
    });

    // 3. ตัวอย่างการเลือกข้อมูลแล้วนำค่าไปใส่ Input
    $('.select-item').on('click', function () {
        let selectedValue = $(this).data('value'); // ค่าที่เลือก (เช่น NVF-001)

        // นำค่าไปใส่ในช่อง Input หลัก (สมมติว่า id ของ input คือ #vendorCode)
        $('#vendorCode').val(selectedValue);

        // ปิด modal
        $('#searchModal')[0].close();
    });

    $(document).on('click', '#add-contact', async function () {
        const newRow = `
                <div class="flex gap-4 contact-row mt-2">
                    <input type="text" placeholder="Name" class="input input-sm border border-gray-400 h-8 rounded w-[450px] px-2">
                    <input type="email" placeholder="E-mail" class="input input-sm border border-gray-400 h-8 rounded w-[450px] px-2">
                    <button type="button" class="btn-remove text-red-500 hover:text-red-700 font-bold px-2 flex items-center">
                        ✕
                    </button>
                </div>
            `;
        $('#contact-list').append(newRow);
    });

    // จัดการปุ่มลบแถว (ใช้ .on() เพื่อรองรับ HTML ที่เพิ่งถูกสร้างใหม่)
    $('#contact-list').on('click', '.btn-remove', function () {
        $(this).closest('.contact-row').remove();
    });
});
