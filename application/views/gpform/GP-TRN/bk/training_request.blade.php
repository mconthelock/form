@extends('layouts.app')

@section('content')
<div class="min-h-screen flex flex-col items-center justify-center bg-blue-50 py-10 px-4">
    <!-- Title -->
    <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">ระบบใบคำขอฝึกอบรม</h1>
        <p class="text-gray-500 text-base">Training Request Form System</p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border">
        <h2 class="text-xl font-bold text-gray-700 mb-2 text-center">เลือกประเภทแบบฟอร์ม</h2>
        <p class="text-gray-500 text-sm mb-6 text-center">กรุณาเลือกหมวดหมู่การฝึกอบรมที่ต้องการ</p>

        <!-- Select -->
        <label class="block text-sm font-medium text-gray-700 mb-2">Training / Seminar Type</label>
        <select id="trainingType" 
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">เลือกประเภทการฝึกอบรม...</option>
            <option value="functional">📘 Support Specific Functional Competency</option>
            <option value="legal">📑 Support Legal Requirement</option>
            <option value="meth">🎓 Support ME-TH Training subject</option>
        </select>

        <!-- Detail box -->
        <div id="detailBox" class="hidden mt-4 p-4 rounded-xl border bg-blue-50 text-blue-900">
            <h3 class="font-semibold flex items-center gap-2">
                <span id="detailTitle">-</span>
            </h3>
            <p id="detailDesc" class="text-sm text-gray-700 mt-1"></p>
        </div>

        <!-- Button -->
        <button id="submitBtn" 
            class="w-full mt-6 py-2 rounded-lg font-semibold text-white bg-indigo-400 cursor-not-allowed transition">
            ไปยังแบบฟอร์ม
        </button>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const trainingType = document.getElementById('trainingType');
    const detailBox = document.getElementById('detailBox');
    const detailTitle = document.getElementById('detailTitle');
    const detailDesc = document.getElementById('detailDesc');
    const submitBtn = document.getElementById('submitBtn');

    const details = {
        functional: {
            title: "Support Specific Functional Competency",
            desc: "ฟอร์มสำหรับฝึกอบรมเพื่อพัฒนาสมรรถนะเฉพาะทาง",
            url: "/training/form/functional"
        },
        legal: {
            title: "Support Legal Requirement",
            desc: "ฟอร์มสำหรับฝึกอบรมที่เกี่ยวข้องกับข้อกำหนดทางกฎหมาย",
            url: "/training/form/legal"
        },
        meth: {
            title: "Support ME-TH Training subject",
            desc: "ฟอร์มสำหรับหัวข้อการฝึกอบรม ME-TH",
            url: "/training/form/meth"
        }
    };

    trainingType.addEventListener('change', function () {
        const val = this.value;
        if (details[val]) {
            detailTitle.textContent = details[val].title;
            detailDesc.textContent = details[val].desc;
            detailBox.classList.remove('hidden');

            // enable button
            submitBtn.classList.remove('bg-indigo-400', 'cursor-not-allowed');
            submitBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
            submitBtn.disabled = false;

            submitBtn.onclick = () => {
                window.location.href = details[val].url;
            };
        } else {
            detailBox.classList.add('hidden');
            submitBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            submitBtn.classList.add('bg-indigo-400', 'cursor-not-allowed');
            submitBtn.disabled = true;
        }
    });
});
</script>
@endsection
