@extends('layouts.app')

@section('content')
<div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-4">
    <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-xl">
        <h1 class="text-2xl font-bold text-blue-800 mb-4">Training Form: {{ ucfirst($type) }}</h1>
        <form method="post" action="{{ base_url('training/save') }}">
            <input type="hidden" name="type" value="{{ $type }}">
            <div class="mb-4">
                <label class="block text-sm font-medium">Title</label>
                <input type="text" name="title" class="border rounded-lg w-full p-2">
            </div>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Submit</button>
        </form>
    </div>
</div>
@endsection
