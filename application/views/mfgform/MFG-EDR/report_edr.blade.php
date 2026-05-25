<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>ELA Daily Report</title>
</head>

<body class="bg-gray-100 p-4">
    <!-- HEADER -->

    <div class="bg-green-700 rounded-2xl border-2 border-green-800 shadow-lg px-5 py-4 mb-4">

        <div class="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-4">
            <!-- TITLE -->
            <div>
                <h1 class="text-4xl font-bold text-white leading-tight">
                    ELA Daily Report
                    <span class="text-xl text-green-100">
                        (In-process Trouble)
                    </span>
                </h1>
            </div>

            <!-- FILTER -->
            <div class="flex flex-wrap items-end gap-3">
                <!-- Fiscal Year -->
                <div class="flex flex-col">
                    <label class="text-xs font-semibold text-green-100 mb-1">
                        Fiscal Year
                    </label>

                    <select id="fiscalYear"
                        class="w-32 h-12 rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    </select>
                </div>

                <!-- Month -->
                <div class="flex flex-col">
                    <label class="text-xs font-semibold text-green-100 mb-1">
                        Month
                    </label>

                    <select
                        class="w-28 h-12 rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                        <option>Jan</option>
                        <option>Feb</option>
                        <option>Mar</option>
                        <option>Apr</option>
                        <option>May</option>
                        <option>Jun</option>
                        <option>Jul</option>
                        <option>Aug</option>
                        <option>Sep</option>
                        <option>Oct</option>
                        <option>Nov</option>
                        <option>Dec</option>
                    </select>
                </div>

                <!-- Defect Type -->
                <div class="flex flex-col">
                    <label class="text-xs font-semibold text-green-100 mb-1">
                        Defect Type
                    </label>

                    <select
                        class="w-32 h-12 rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                        <option>All</option>
                    </select>
                </div>

                <!-- ITEM -->
                <div class="flex flex-col">
                    <label class="text-xs font-semibold text-green-100 mb-1">
                        ITEM
                    </label>

                    <select class="w-28 h-12 rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                        <option>All</option>
                    </select>
                </div>

                <!-- Dept -->
                <div class="flex flex-col">
                    <label class="text-xs font-semibold text-green-100 mb-1">
                        Dept. Sec
                    </label>

                    <select class="w-36 h-12 rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                        <option>All</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <!-- TOP CONTENT -->
    <div class="flex flex-col xl:flex-row gap-4">
        <!-- LEFT -->
        <div class="w-full xl:w-1/2 border-2 border-gray-300 rounded-2xl p-3 bg-gray-50">
            <div class="flex flex-col gap-4">
                <!-- SUMMARY -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div class="h-32 bg-white rounded-2xl border-2 border-gray-300 shadow-md">L-1</div>

                    <div class="h-32 bg-white rounded-2xl border-2 border-gray-300 shadow-md">L-2</div>

                    <div class="h-32 bg-white rounded-2xl border-2 border-gray-300 shadow-md">L-3</div>

                    <div class="h-32 bg-white rounded-2xl border-2 border-gray-300 shadow-md">L-4</div>

                </div>

                <!-- DONUT -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div class="h-72 bg-white rounded-2xl border-2 border-gray-300 shadow-md">D-1</div>

                    <div class="h-72 bg-white rounded-2xl border-2 border-gray-300 shadow-md">D-2</div>

                </div>

                <!-- TABLE -->
                <div class="h-72 bg-white rounded-2xl border-2 border-gray-300 shadow-md">T-1</div>
            </div>
        </div>

        <!-- RIGHT -->
        <!-- RIGHT -->
        <div class="w-full xl:w-1/2 border-2 border-gray-300 rounded-2xl p-3 bg-gray-50">

            <!-- เพิ่ม h-full -->
            <div class="flex flex-col gap-4 h-full">

                <!-- CHART A -->
                <div class="h-[350px] bg-white rounded-2xl border-2 border-gray-300 shadow-md">
                    R-1
                    <div id="troubleTrendChart" class="w-full h-full"></div>
                </div>

                <!-- CHART B -->
                <!-- เปลี่ยนจาก h-[350px] => flex-1 -->
                <div class="flex-1 bg-white rounded-2xl border-2 border-gray-300 shadow-md min-h-[350px]">
                    R-2
                </div>
            </div>
        </div>

    </div>

    <!-- BOTTOM SECTION -->
    <div class="mt-4">
            <div class="h-72 bg-white rounded-2xl border-2 border-gray-300 shadow-md">F-1</div>
    </div>

</body>
</html>

<script>
    // ===== Fiscal Year =====
    const fiscalYear = document.getElementById('fiscalYear');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) { option.selected = true;}
        fiscalYear.appendChild(option);
    }
</script>