@extends('layouts/template')

@section('contents')
    <div class="flex flex-col w-full px-4 mt-5 mb-20">
        <h1 class="text-3xl text-primary font-bold mb-5">Create Electronic Form</h1>
        <div class="flex flex-wrap justify-start gap-5">
            @foreach ($department as $dept)
                <a href="{{ base_url() . 'webform/form/createdetail/' . $dept['link'] }}">@include('form/create/deptcard', $dept)</a>
            @endforeach
        </div>
    </div>
@endsection
