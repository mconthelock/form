import { dragDropInit } from '@amec/webasset/dragdrop';
$(document).ready(async function () {
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
    dragDropInit();
});
