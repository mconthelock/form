@extends('layouts/webflowTemplate')

@section('contents')
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div class="w-full max-w-md text-center bg-white p-10 rounded-3xl shadow-xl border border-gray-200">
            <h1 class="text-3xl font-bold text-blue-700 mb-4">ลงชื่อเข้าใช้งาน</h1>
            <p class="text-gray-600 text-lg mb-6">กรุณาแตะบัตรพนักงานของคุณ</p>

            <!-- แสดงไอคอนบัตร -->
            <div class="flex justify-center mb-6">
                <div class="bg-blue-100 text-blue-600 rounded-full p-6 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm16 0H5v14h14V5z" />
                    </svg>
                </div>
            </div>

            <!-- สถานะ -->
            <div id="status" class="text-xl text-gray-800 font-medium">
                รอแตะบัตร...
            </div>

            <!-- ซ่อน input สำหรับอ่านรหัสบัตรจากเครื่อง -->
            <input type="text" id="cardInput" class="opacity-0 absolute pointer-events-none" autofocus>
        </div>
    </div>

    <script>
        const cardInput = document.getElementById("cardInput");
        const statusBox = document.getElementById("status");

        // โฟกัส input ตลอดเวลา
        setInterval(() => cardInput.focus(), 1000);

        // เมื่อแตะบัตร (หรือยิงข้อมูลผ่าน USB reader)
        cardInput.addEventListener("input", function () {
            const cardID = cardInput.value.trim();

            if (cardID.length >= 5) {
                statusBox.innerText = "กำลังตรวจสอบ...";
                statusBox.classList.add("text-yellow-600");

                // ทำเป็นตัวอย่างจำลอง AJAX
                setTimeout(() => {
                    // จำลอง: ถ้าขึ้นต้นด้วย 123 ถือว่าสำเร็จ
                    if (cardID.startsWith("123")) {
                        statusBox.innerText = "เข้าสู่ระบบสำเร็จ";
                        statusBox.classList.remove("text-yellow-600");
                        statusBox.classList.add("text-green-600");
                        // redirect ไปหน้า dashboard หรือหน้าถัดไป
                    } else {
                        statusBox.innerText = "ไม่พบรหัสพนักงานนี้";
                        statusBox.classList.remove("text-yellow-600");
                        statusBox.classList.add("text-red-600");
                    }

                    cardInput.value = "";
                }, 1500);
            }
        });
    </script>
@endsection