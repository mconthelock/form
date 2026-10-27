@extends('layouts/template')

@section('contents')
    <div>
        <h1>{{ $selected_dept['name'] }}</h1>
        <p>Code: {{ $selected_dept['code'] }}</p>
        <p>Links:</p>
        <ul>
            @foreach ($selected_dept['link'] as $link)
                <li>{{ $link }}</li>
            @endforeach
        </ul>
    </div>
@endsection
