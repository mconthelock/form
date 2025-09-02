@extends('layouts/webflowTemplate')
@section('styles')
<style>
</style>
@endsection
@section('contents')
<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-start justify-center px-6 pt-20">
  <div class="max-w-5xl w-full">

    <h1 class="text-3xl font-extrabold text-gray-800 mb-10 text-center tracking-wide">
      Visitor Management
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Create Visitor Form -->
      <a href="{{ base_url('marform/MAR-VMS/form/main?mode=A&').'no='.$NFRMNO.'&orgNo='.$VORGNO.'&y='.$CYEAR.'&c=1&empno='.$empno }}"
         class="block rounded-2xl p-10 flex flex-col items-center text-center
                bg-gradient-to-br from-blue-50 to-blue-100
                shadow-md hover:shadow-2xl hover:-translate-y-4
                transform transition-all duration-300 active:scale-95 overflow-hidden">

        <!-- Icon Container -->
        <div class="flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 mb-6 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" 
               class="w-16 h-16 text-blue-700" 
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="9" y2="9"/>
          </svg>
        </div>

        <h2 class="text-xl font-semibold text-gray-800">Create Visitor Form</h2>
        <p class="text-gray-500 text-sm mt-2">สร้างฟอร์มผู้เยี่ยมชมใหม่</p>
      </a>

      <!-- Group Master -->
      <a href="{{ base_url('marform/MAR-VMS/master/master?') }}"
         class="block rounded-2xl p-10 flex flex-col items-center text-center
                bg-gradient-to-br from-green-50 to-green-100
                shadow-md hover:shadow-2xl hover:-translate-y-4
                transform transition-all duration-300 active:scale-95 overflow-hidden">

        <!-- Icon Container -->
        <div class="flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-green-200 to-green-400 mb-6 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" 
               class="w-16 h-16 text-green-700" 
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-5a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>

        <h2 class="text-xl font-semibold text-gray-800">Group Master</h2>
        <p class="text-gray-500 text-sm mt-2">จัดการข้อมูลกลุ่ม</p>
      </a>

    </div>
  </div>
</div>

@endsection

@section('scripts')
    <script>
    </script>
@endsection
