{{-- filepath: d:\Docker_mark\src\form\application\views\gpform\GP-TPH\addarea.blade.php --}}
@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background: #e6e7ea;
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
        }

        .page-wrapper {
            min-height: 100vh;
            border-top: 2px solid #222;
            padding: 22px 19px;
        }

        .page-title {
            margin: 0 0 11px 13px;
            color: #0754b8;
            font-size: 30px;
            font-weight: 700;
        }

        .page-subtitle {
            display: block;
            margin-top: 3px;
            font-size: 22px;
            color: #0754b8;
        }

        .content-card {
            width: 100%;
            min-height: 344px;
            padding: 31px 32px;
            background: #fff;
            border-radius: 4px;
        }

        .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .area-form {
            display: none;
            margin-bottom: 20px;
            padding: 20px;
            border: 1px solid #c6d2e1;
            border-radius: 8px;
            background: #f8fafc;
        }

        .area-form.is-visible {
            display: block;
        }

        .area-form-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
        }

        .area-form label {
            display: block;
            margin-bottom: 5px;
            color: #4a596d;
            font-size: 13px;
            font-weight: 600;
        }

        .area-form input {
            width: 100%;
            height: 34px;
            padding: 0 10px;
            border: 1px solid #c8c8c8;
            border-radius: 3px;
            outline: none;
            font-size: 13px;
        }

        .area-form input:focus {
            border-color: #0754b8;
        }

        .area-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
        }

        .area-form-actions button {
            min-width: 80px;
            height: 33px;
            padding: 0 14px;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
        }

        .cancel-area-button {
            background: #e5e7eb;
            color: #374151;
        }

        .save-area-button {
            background: #0754b8;
            color: #fff;
        }

        .search-input {
            width: 185px;
            height: 32px;
            padding: 0 12px;
            border: 1px solid #c8c8c8;
            border-radius: 3px;
            outline: none;
            font-size: 13px;
        }

        .search-input:focus {
            border-color: #0754b8;
        }

        .add-button {
            min-width: 98px;
            height: 33px;
            padding: 0 14px;
            border: 0;
            border-radius: 9px;
            background: #0754b8;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .add-button:hover {
            background: #06449a;
        }

        .table-wrapper {
            overflow-x: auto;
        }

        .area-table {
            width: 100%;
            border: 1px solid #c6d2e1;
            border-radius: 8px;
            border-spacing: 0;
            border-collapse: separate;
            overflow: hidden;
            font-size: 13px;
        }

        .area-table th {
            height: 37px;
            padding: 0 10px;
            background: #fff;
            color: #4a596d;
            text-align: left;
            font-weight: 600;
            white-space: nowrap;
            border-bottom: 1px solid #c6d2e1;
        }

        .area-table td {
            height: 49px;
            padding: 0 10px;
            border-bottom: 1px solid #c6d2e1;
            white-space: nowrap;
        }

        .area-table tbody tr:last-child td {
            border-bottom: 0;
        }

        .area-table tbody tr:nth-child(even) {
            background: #e9e9e9;
        }

        .area-table th:nth-child(1),
        .area-table td:nth-child(1) {
            width: 8%;
        }

        .area-table th:nth-child(2),
        .area-table td:nth-child(2) {
            width: 23%;
        }

        .area-table th:nth-child(3),
        .area-table td:nth-child(3) {
            width: 22%;
        }

        .area-table th:nth-child(4),
        .area-table td:nth-child(4) {
            width: 12%;
        }

        .area-table th:nth-child(5),
        .area-table td:nth-child(5) {
            width: 25%;
        }

        .area-table th:last-child,
        .area-table td:last-child {
            width: 120px;
            text-align: center;
        }

        .sort-icon {
            float: right;
            color: #e5e5e5;
            font-size: 13px;
            line-height: 12px;
        }

        .action-link {
            display: inline-flex;
            width: 27px;
            height: 30px;
            align-items: center;
            justify-content: center;
            margin: 0 3px;
            text-decoration: none;
            cursor: pointer;
        }

        .table-action-button {
            border: 0;
            background: transparent;
            font: inherit;
        }

        .edit-icon {
            color: #facc15;
            font-size: 21px;
        }

        .delete-icon {
            color: #d30b17;
            font-size: 21px;
        }

        .empty-row {
            height: 80px !important;
            text-align: center;
            color: #777;
        }

        .table-summary {
            margin-top: 25px;
            text-align: right;
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .content-card {
                padding: 20px 14px;
            }

            .page-title {
                margin-left: 0;
                font-size: 25px;
            }

            .toolbar {
                gap: 12px;
                align-items: stretch;
                flex-direction: column;
            }

            .search-input {
                width: 100%;
            }

            .add-button {
                align-self: flex-end;
            }

            .area-form-grid {
                grid-template-columns: 1fr;
            }

            .area-table {
                min-width: 850px;
            }
        }
    </style>
    
@endsection

@section('contents')
    <div class="page-wrapper">
            <div class="text-center">
                <H1 class="text-3xl font-bold text-primary">พื้นที่ขออนุญาตถ่ายภาพ</H1>
                <H2 lass="text-xl font-semibold uppercase opacity-50 tracking-wider mt-1">(Photo Permission Area)</H2>
      
            </div>

        <div class="content-card">
            <div class="toolbar">
                <input
                    type="text"
                    id="searchArea"
                    class="search-input"
                    placeholder="Search record"
                    autocomplete="off"
                >
                <button type="button" id="newAreaButton" class="add-button">
                    + New Area
                </button>
            </div>

            <form id="areaForm" class="area-form">
                <div class="area-form-grid">
                    <div>
                        <label for="areaLocation">Location</label>
                        <input type="text" id="areaLocation" name="location" required>
                    </div>
                    <div>
                        <label for="areaName">Area</label>
                        <input type="text" id="areaName" name="area" required>
                    </div>
                    <div>
                        <label for="areaLevel">Level</label>
                        <input type="text" id="areaLevel" name="level" required>
                    </div>
                    <div>
                        <label for="areaOwner">Area Owner</label>
                        <input type="text" id="areaOwner" name="area_owner" required>
                    </div>
                </div>
                <div class="area-form-actions">
                    <button type="button" id="cancelAreaButton" class="cancel-area-button">Cancel</button>
                    <button type="submit" class="save-area-button">Save</button>
                </div>
            </form>

            <div class="table-wrapper border-slate-200">
                <table class="area-table">
                    <thead>
                        <tr>
                            <th class ="border p-2 bg-blue-500 text-white">
                                NO
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Location
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Area
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Level
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Area Owner
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody id="areaTableBody">
                        @forelse ($areas ?? [] as $index => $area)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td>{{ $area->location ?? '-' }}</td>
                                <td>{{ $area->area ?? '-' }}</td>
                                <td>{{ $area->level ?? '-' }}</td>
                                <td>{{ $area->area_owner ?? '-' }}</td>
                                <td>
                                    <a
                                        href="{{ url('/photo-permission-area/' . $area->id . '/edit') }}"
                                        class="action-link"
                                        title="แก้ไขข้อมูล"
                                        style="border-block-end-color: gold"
                                    >
                                        <span class="edit-icon">✎</span>
                                    </a>

                                    <form
                                        action="{{ url('/photo-permission-area/' . $area->id) }}"
                                        method="POST"
                                        style="display: inline;"
                                        onsubmit="return confirm('ยืนยันการลบข้อมูลนี้หรือไม่?');"
                                    >
                                        @csrf
                                        @method('DELETE')

                                        <button
                                            type="submit"
                                            class="action-link"
                                            title="ลบข้อมูล"
                                            style="border: 0; background: transparent;"
                                        >
                                            <span class="delete-icon">🗑</span>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="empty-row">
                                    ไม่พบข้อมูล
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="table-summary">
                1 to {{ count($areas ?? []) }} of {{ count($areas ?? []) }} row(s)
            </div>
        </div>
    </div>

@endsection

@section('scripts')
    <script>
        const areaStorageKey = 'gp-tph-photo-permission-areas';
        const serverAreas = @json($areas ?? []);
        const searchArea = document.getElementById('searchArea');
        const newAreaButton = document.getElementById('newAreaButton');
        const cancelAreaButton = document.getElementById('cancelAreaButton');
        const areaForm = document.getElementById('areaForm');
        const areaTableBody = document.getElementById('areaTableBody');
        let editingRow = null;

        function getStoredAreas() {
            try {
                return JSON.parse(localStorage.getItem(areaStorageKey)) || [];
            } catch (error) {
                return [];
            }
        }

        function saveStoredAreas(areas) {
            localStorage.setItem(areaStorageKey, JSON.stringify(areas));
        }

        function syncServerAreas() {
            const storedAreas = getStoredAreas();
            const storedIds = new Set(storedAreas.map(area => String(area.id)));
            const mergedAreas = storedAreas.slice();

            serverAreas.forEach(function (area) {
                if (!storedIds.has(String(area.id))) {
                    mergedAreas.push({
                        id: String(area.id),
                        location: area.location || '',
                        area: area.area || '',
                        level: area.level || '',
                        area_owner: area.area_owner || ''
                    });
                }
            });

            saveStoredAreas(mergedAreas);
        }

        function addStoredAreaRow(area) {
            const row = document.createElement('tr');
            row.dataset.localId = area.id;
            row.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <button type="button" class="action-link table-action-button edit-row" title="แก้ไขข้อมูล">
                        <span class="edit-icon">✎</span>
                    </button>
                    <button type="button" class="action-link table-action-button delete-row" title="ลบข้อมูล">
                        <span class="delete-icon">🗑</span>
                    </button>
                </td>
            `;

            row.cells[1].textContent = area.location;
            row.cells[2].textContent = area.area;
            row.cells[3].textContent = area.level;
            row.cells[4].textContent = area.area_owner;
            areaTableBody.appendChild(row);
        }

        function renderStoredAreas() {
            const areas = getStoredAreas();

            if (areas.length > 0) {
                const emptyRow = areaTableBody.querySelector('.empty-row');
                if (emptyRow) {
                    emptyRow.closest('tr').remove();
                }
            }

            areas.forEach(function (area) {
                addStoredAreaRow(area);
            });
            updateRowNumbers();
        }

        function updateRowNumbers() {
            areaTableBody.querySelectorAll('tr:not(.empty-row)').forEach(function (row, index) {
                row.cells[0].textContent = index + 1;
            });
        }

        function closeAreaForm() {
            areaForm.reset();
            editingRow = null;
            areaForm.classList.remove('is-visible');
        }

        syncServerAreas();
        renderStoredAreas();

        searchArea.addEventListener('input', function () {
            const keyword = this.value.toLowerCase();
            const rows = areaTableBody.querySelectorAll('tr');

            rows.forEach(function (row) {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(keyword) ? '' : 'none';
            });
        });

        newAreaButton.addEventListener('click', function () {
            areaForm.classList.add('is-visible');
            areaForm.querySelector('input').focus();
        });

        cancelAreaButton.addEventListener('click', function () {
            closeAreaForm();
        });

        areaForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(areaForm);
            const emptyRow = areaTableBody.querySelector('.empty-row');

            if (emptyRow) {
                emptyRow.closest('tr').remove();
            }

            const areas = getStoredAreas();
            const area = {
                id: editingRow?.dataset.localId || Date.now().toString(),
                location: formData.get('location'),
                area: formData.get('area'),
                level: formData.get('level'),
                area_owner: formData.get('area_owner')
            };

            if (editingRow?.dataset.localId) {
                const index = areas.findIndex(item => item.id === area.id);
                if (index !== -1) {
                    areas[index] = area;
                }
                editingRow.remove();
            } else {
                areas.push(area);
            }

            saveStoredAreas(areas);
            addStoredAreaRow(area);

            updateRowNumbers();
            closeAreaForm();
        });

        areaTableBody.addEventListener('click', function (event) {
            const editButton = event.target.closest('.edit-row');
            const deleteButton = event.target.closest('.delete-row');

            if (editButton) {
                editingRow = editButton.closest('tr');
                areaForm.elements.location.value = editingRow.cells[1].textContent;
                areaForm.elements.area.value = editingRow.cells[2].textContent;
                areaForm.elements.level.value = editingRow.cells[3].textContent;
                areaForm.elements.area_owner.value = editingRow.cells[4].textContent;
                areaForm.classList.add('is-visible');
                areaForm.elements.location.focus();
            }

            if (deleteButton && confirm('ยืนยันการลบข้อมูลนี้หรือไม่?')) {
                const row = deleteButton.closest('tr');
                const localId = row.dataset.localId;

                if (localId) {
                    saveStoredAreas(getStoredAreas().filter(area => area.id !== localId));
                }

                row.remove();
                updateRowNumbers();
            }
        });
    </script>
@endsection
