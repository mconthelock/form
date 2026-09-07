@extends('layouts/template')

@section('contents')
    {{-- <iframe src="{{ $target }}" frameborder="0" class="w-full h-[95vh]"></iframe> --}}
    <!-- กล่องครอบ (Wrapper) กำหนดความสูงและจัดให้อยู่ตรงกลาง -->
    <div class="relative w-full h-[95vh] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-5">
        <!-- กล่อง Loading Overlay (ใช้ z-10 เพื่อให้อยู่ด้านบน) -->
        <div id="loading-indicator"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-500 ease-in-out opacity-100">
            <!-- วงกลม Spinner หมุนๆ -->
            <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <!-- ข้อความ Loading มีเอฟเฟกต์กระพริบเบาๆ (Pulse) -->
            <p class="mt-4 text-gray-500 font-medium animate-pulse">กำลังเตรียมฟอร์ม กรุณารอสักครู่...</p>
        </div>

        <!-- Iframe (ตั้งค่าเริ่มต้นให้โปร่งใส opacity-0) -->
        <iframe id="my-iframe" src="{{ $target }}"
            class="absolute inset-0 w-full h-full border-0 transition-opacity duration-700 ease-in-out opacity-0 py-5 bg-white"></iframe>

    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
