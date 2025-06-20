<div class="card border rounded-lg shadow-md flex-1 flex flex-row gap-5 bg-white p-5 min-w-80" id="{{ $id }}">
    <div class="flex-1 flex flex-col gap-5">
        <h2 class="text-nowrap text-lg font-semibold">{{ $text }}</h2>
        <h1 class="text-nowrap text-7xl font-black">0</h1>
        <h3 class="text-nowrap text-md">Jan 1st - Feb 1st</h3>
    </div>
    <div class="flex-none flex items-center justify-center ">
        <div class="w-16 h-16 text-red-500">
            @include('svg.' . $id . '_icon')
        </div>
    </div>
</div>
