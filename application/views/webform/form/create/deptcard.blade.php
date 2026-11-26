<div class="p-5 flex flex-col items-center text-center h-full justify-center">
    <div class="w-16 h-16 flex items-center justify-center mb-3 transition-transform duration-150 group-hover:scale-105">
        @include('webform/svg/dept_' . $dept['code'])
    </div>
    <h3 class="text-sm font-bold text-base-content group-hover:text-primary transition-colors">
        {{ $dept['name'] }}
    </h3>
    <span class="mt-1 text-[10px] font-mono uppercase tracking-wider wf-mute">
        {{ strtoupper($dept['code']) }}
    </span>
</div>
