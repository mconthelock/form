@extends('layouts/template')

@section('contents')
    <main class="webform-theme w-full flex flex-col gap-4 pb-12">
        <div
            class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-base-100 p-5 md:p-6 shadow-sm border border-base-300 border-t-4 border-t-primary">
            <div class="space-y-1.5 max-w-3xl">
                <div class="flex items-center gap-2">
                    <span class="badge badge-primary font-mono text-[11px] uppercase tracking-wider font-bold">
                        AMEC-WEBFLOW
                    </span>
                    <span class="badge badge-xs badge-outline font-mono font-bold uppercase">
                        REPORT DETAIL
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-primary line-clamp-1">
                    {{ $selected_dept['name'] }}
                </h1>
                <p class="text-sm wf-mute font-mono">
                    Code: {{ $selected_dept['code'] }}
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
                <a class="btn btn-sm btn-outline btn-primary gap-1.5" href="{{ base_url('webform/report') }}">
                    <i class="fi fi-br-arrow-small-left text-base"></i>
                    <span>Back</span>
                </a>
            </div>
        </div>

        <section class="bg-base-100 border border-base-300 shadow-sm p-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-primary border-b border-base-200 pb-2.5 mb-3">
                Linked Organization Codes
            </h2>
            <ul class="divide-y divide-base-200 text-sm">
                @foreach ($selected_dept['link'] as $link)
                    <li class="py-2 font-mono text-xs">{{ $link }}</li>
                @endforeach
            </ul>
        </section>
    </main>
@endsection
