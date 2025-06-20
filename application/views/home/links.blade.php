<div class="flex-1 card shadow-xl bordered">
    <figure class="h-[150px]">
        <img src="{{ base_url() }}assets/images/{{ $links['img'] }}" alt="" class="w-full" />
    </figure>
    <div class="card-body">
        <h2 class="card-title">{{ $links['text'] }}</h2>
        <ul class="flex flex-col gap-2 lg:min-w-[250px]" id="{{ $links['id'] }}">
            <div class="skeleton h-8 w-1/2"></div>
            <div class="skeleton h-8 w-3/4"></div>
            <div class="skeleton h-8 w-2/3"></div>
            <div class="skeleton h-8 w-4/4"></div>
            <div class="skeleton h-8 w-3/5"></div>
            <div class="skeleton h-8 w-2/5"></div>
        </ul>
    </div>
</div>
