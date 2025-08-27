@extends('layouts/webflowTemplate')
@section('contents')


    <div class="container mx-auto p-4">
        <div class="flex flex-col md:flex-row items-center justify-between mb-6">
            <h1 class="text-3xl font-bold text-gray-800">User Group in FIN and CAT Department</h1>
            <div class="flex space-x-2">
                <button class="btn btn-sm btn-outline btn-primary">+ เพิ่มเมนูหลัก</button>
                <button class="btn btn-sm btn-outline btn-secondary">จัดการเมนู</button>
            </div>
        </div>

        <div class="mb-4">
            <span>Empno</span>
            <input type="text" class="input input-bordered w-full max-w-xs" id="empno">
        </div>

        <div class="overflow-x-auto bg-white shadow-md rounded-lg p-4">
            <table id="menuTable" class="table table-zebra table-sm w-full border rounded-lg">
                <thead>
                    <tr>
                        <th class="w-1/2">โครงสร้างเมนู</th>
                        <th class="text-center">AUTHORIZE</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($rows as $r)
                        @php
                            $lvl      = isset($r->MENU_LEVEL) ? (int) $r->MENU_LEVEL : 1;
                            $indentPx = max(0, ($lvl - 1) * 24);
                            $checked  = !empty($r->EMPNO) ? '✔' : '';
                          @endphp
                        {{-- เพิ่ม hover effect ด้วย utility class ของ Tailwind โดยตรง --}}
                        <tr class="hover:bg-blue-100! hover:cursor-pointer">
                            <td>
                                <span class="{{ $lvl === 1 ? 'font-bold' : '' }}" style="margin-left: {{ $indentPx }}px">
                                    {{ htmlspecialchars($r->MENU_TREE) }}
                                </span>
                            </td>
                            <td class="text-center text-xl">
                                <input type="checkbox" class="create_author checkbox border-black bg-white" data-menu-id="{{ htmlspecialchars($r->MENU_ID) }}">
                                {{ $checked }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

@endsection

@section('scripts')
    <script>
        $(function () {
            const host = $("meta[name=base_url]").attr("content");
            const dt = $('#menuTable').DataTable({
                ordering: false
            });

            $(document).on('change', '.create_author', function () {
                const menuId = $(this).data('menu-id');
                const isChecked = $(this).is(':checked');
                const empno = $('#empno').val().trim();

                if (!empno) {
                    alert('Please enter an Employee No.');
                    $(this).prop('checked', !isChecked); // Revert the checkbox
                    return; // Stop the execution
                }

                $.ajax({
                    type: 'POST',
                    url: `${host}isform/IS-RGV/main/insert`, // ใช้ template literal เพื่อความกระชับ
                    data: {
                        menu_id: menuId,
                        is_checked: isChecked,
                        empno
                    },
                    dataType: 'json',
                    success: function (response) {
                        // ควรมีการจัดการ response ที่ดี เช่น แสดงข้อความสำเร็จ
                        console.log('Update successful:', response);
                    },
                    error: function (xhr, status, error) {
                        // จัดการ error เพื่อให้ debug ง่ายขึ้น
                        console.error('AJAX Error:', status, error);
                        alert('An error occurred while updating permissions.');
                        $(this).prop('checked', !isChecked); // Revert on error
                    }
                });
            });
        });
    </script>
@endsection