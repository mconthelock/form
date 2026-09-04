<div class="w-60 p-5 card bordered rounded-lg shadow-xl flex">
    <div class="flex flex-col items-center">
        <div class="w-20 h-20 rounded-full flex items-center justify-center">
            @include('svg/dept_' . $dept['code'])
        </div>
        <h2 class="text-lg font-bold mt-3">{{ $dept['name'] }}</h2>
    </div>
</div>
