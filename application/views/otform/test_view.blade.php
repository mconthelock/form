@extends('layouts/webflowTemplate')

@section('contents')
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div class="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-gray-300">
            <!-- Header -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <!-- ข้อมูลพนักงาน -->
                <div class="md:col-span-2 space-y-4">
                    <div>
                        <label class="block font-bold text-gray-700 mb-1">รหัสพนักงาน (ENP No.)</label>
                        <input type="text" class="input input-bordered w-full rounded-lg" placeholder="กรอกรหัสพนักงาน">
                    </div>
                    <div>
                        <label class="block font-bold text-gray-700 mb-1">ชื่อ นามสกุล (Name)</label>
                        <input type="text" class="input input-bordered w-full rounded-lg" placeholder="กรอกชื่อ-นามสกุล">
                    </div>
                </div>

                <!-- OT Date Card -->
                <div class="card w-full bg-white border border-gray-300 shadow-md rounded-xl">
                    <div class="text-center border-b border-gray-300 py-2 font-semibold text-lg">เลือกวัน</div>
                    <div class="bg-gray-100 text-center text-sm font-bold py-1 border-b border-gray-300">OT DATE</div>
                    <div class="py-6 cursor-pointer hover:bg-blue-50 transition" id="triggerCalendar">
                        <div id="date-day" class="text-5xl font-bold text-gray-800 text-center"></div>
                    </div>
                    <div class="flex border-t border-gray-300 text-center text-2xl font-semibold">
                        <div class="flex-1 border-r border-gray-300 py-2" id="date-dow"></div>
                        <div class="flex-1 py-2" id="date-month"></div>
                    </div>
                    <input type="text" id="pickdate" value="{{ date('d/m/Y') }}" class="input input-bordered input-sm w-full rounded-none rounded-b-xl text-center text-base font-medium " />
                </div>
            </div>

            <!-- การเดินทาง -->
            <div class="mt-8">
                <h2 class="font-bold text-xl text-gray-800 mb-2">การเดินทาง</h2>
                <div class="grid grid-cols-2 gap-6 mt-4">
                    <label class="cursor-pointer">
                        <input type="radio" name="car_type" value="private" class="peer hidden">
                        <div class="btn w-full flex items-center justify-center text-xl font-bold rounded-lg bg-blue-100 border border-blue-300 peer-checked:bg-primary peer-checked:text-white peer-checked:ring-4 peer-checked:ring-blue-300 peer-checked:shadow-lg transition duration-200">
                            รถส่วนตัว
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="radio" name="car_type" value="company" class="peer hidden">
                        <div class="btn w-full flex items-center justify-center text-xl font-bold rounded-lg bg-blue-100 border border-blue-300 peer-checked:bg-primary peer-checked:text-white  peer-checked:ring-4 peer-checked:ring-blue-300 peer-checked:shadow-lg transition duration-200">
                            รถบริษัท
                        </div>
                    </label>
                </div>

            </div>

            <!-- เวลาเลิกงาน -->
            <div class="mt-8">
                <h2 class="font-bold text-xl text-gray-800 mb-2">เวลาเลิกงาน</h2>
                <div class="grid grid-cols-2 gap-6 mt-4">
                    <label class="cursor-pointer">
                        <input type="radio" name="time_type" value="19:30" class="peer hidden">
                        <div class="btn w-full flex items-center justify-center text-xl font-bold rounded-lg bg-blue-100 border border-blue-300 peer-checked:bg-primary peer-checked:text-white peer-checked:ring-4 peer-checked:ring-blue-300 peer-checked:shadow-lg transition duration-200">
                            19:30
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="radio" name="time_type" value="21:30" class="peer hidden">
                        <div class="btn w-full flex items-center justify-center text-xl font-bold rounded-lg bg-blue-100 border border-blue-300 peer-checked:bg-primary peer-checked:text-white  peer-checked:ring-4 peer-checked:ring-blue-300 peer-checked:shadow-lg transition duration-200">
                            21:30
                        </div>
                    </label>
                </div>
                {{-- <div class="grid grid-cols-2 gap-6">
                    <button class="btn btn-primary btn-lg w-full text-white text-xl font-bold rounded-lg">19:30</button>
                    <button class="btn btn-primary btn-lg w-full text-white text-xl font-bold rounded-lg">21:30</button>
                </div>--}}
            </div>

            <div class="mt-8">
                <button class="btn btn-success">Submit</button>
            </div>
        </div>
    </div>

    <!-- Flatpickr -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

    <script>
        const thDayLong = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];

        const picker = flatpickr("#pickdate", {
            dateFormat: "d/m/Y",
            onChange: function (selectedDates, dateStr, instance) {
                updateCard(selectedDates[0]);
            }
        });

        function updateCard(dateObj) {
            if (!dateObj) return;
            const d = new Date(dateObj);
            document.getElementById('date-day').textContent = ("0" + d.getDate()).slice(-2);
            document.getElementById('date-dow').textContent = thDayLong[d.getDay()];
            document.getElementById('date-month').textContent = (d.getFullYear() + 543).toString().slice(2);
        }

        document.getElementById("triggerCalendar").addEventListener("click", function () {
            picker.open();
        });

        updateCard(picker.selectedDates[0]);
    </script>
@endsection