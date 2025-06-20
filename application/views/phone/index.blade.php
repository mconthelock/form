@extends('layouts/template')

@section('contents')
    <div class="flex py-5 ">
        <div class="flex-none">
            @include('phone/search')
        </div>
        <div class="flex-1">
            <table class="table table-zebra" id="amec-employee"></table>
        </div>
    </div>
@endsection
