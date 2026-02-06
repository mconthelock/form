<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= $title ?></title>
<script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100">

<div class="max-w-6xl mx-auto p-6">

    <h1 class="text-2xl font-bold mb-6">Routes Master</h1>

    <div class="bg-white rounded-xl shadow relative">

        <table class="w-full">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-4 text-left">Route Name</th>
                    <th class="p-4 text-center">Seat</th>
                    <th class="p-4 text-center">Status</th>
                    <th class="p-4 text-right">Action</th>
                </tr>
            </thead>
            <tbody id="routeTable"></tbody>
        </table>

        <div class="p-4 text-right">
            <button id="btnAddRoute"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
                + Add Route
            </button>
        </div>

    </div>

</div>

<script>
    const API_BASE = "<?= $api_base ?>";
</script>

<script type="module"
    src="<?= base_url('assets/js/bus/routes.js') ?>">
</script>

</body>
</html>
