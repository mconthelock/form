@extends('layouts/template')

@section('contents')

<div class="px-8 py-6 bg-gray-50 min-h-screen">

    <!-- Page Header -->
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
            🚍 Routes Master
        </h2>
        <p class="text-sm text-gray-500 mt-1">
            Manage Bus / Van Transportation Routes
        </p>
    </div>

    <!-- Main Card -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">


        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                        <th class="p-4 text-left">Route Name</th>
                        <th class="p-4 text-center">Seat</th>
                        <th class="p-4 text-center">Status</th>
                        <th class="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody id="routeTable" class="divide-y divide-gray-100"></tbody>
            </table>
        </div>


        <div class="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h3 class="text-white font-semibold text-lg">
                Route List
            </h3>

            <button id="btnAddRoute"
                class="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition">
                + Add Route
            </button>
        </div>
    </div>

</div>

<script>
    window.API_BASE = "<?= $api_base ?>";
</script>

<script src="<?= base_url('assets/dist/js/bus_routes.js') ?>"></script>


@endsection
