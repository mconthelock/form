@extends('layouts/webflowTemplate')
@section('styles')
    <style>
        .dt-type-numeric {
            text-align: left !important;
        }

        .cursor-wait {
            cursor: wait !important;
        }
    </style>
@endsection
@section('contents')
    <div class="container mx-auto ">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">User Management</h1>
            <!-- <button class="btn btn-primary rounded-xl" onclick="openModal()">Add User</button> -->
        </div>
        <div class="flex flex-wrap gap-3 mb-4" id="btn-group">
            <button class="btn btn-sm filter-btn btn-info" data-filter="all" id="btn-All">All</button>
            @foreach ($program as $item)
                <button class="btn btn-sm filter-btn" data-filter="{{ $item->PROGRAM }}" id="btn-{{ $item->PROGRAM }}">{{ $item->PROGRAM }}</button>
            @endforeach
        </div>

        <table class="table w-full table-zebra border" id="inchargeTable">
            <thead class="bg-blue-100 text-blue-900 text-sm">

            </thead>
        </table>
    </div>

    <!-- Modal -->
    <dialog id="user-modal" class="modal">
        <form method="dialog" class="modal-box">
            <h3 class="font-bold text-lg" id="modal-title">Add User</h3>
            <input type="hidden" id="edit-index">
            <div class="form-control mt-4">
                <label class="label">
                    <span class="label-text">Name</span>
                </label>
                <input id="name" type="text" placeholder="Enter name" class="input input-bordered rounded-lg" required />
            </div>
            <div class="form-control mt-2">
                <label class="label">
                    <span class="label-text">Email</span>
                </label>
                <input id="email" type="email" placeholder="Enter email" class="input input-bordered" required />
            </div>
            <div class="modal-action">
                <button type="submit" class="btn btn-primary" onclick="saveUser(event)">Save</button>
                <button class="btn" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    </dialog>


@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/RgvIncharge.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
        let users = [];

        function openModal(index = null) {
            const modal = document.getElementById('user-modal');
            const title = document.getElementById('modal-title');
            document.getElementById('edit-index').value = index;

            if (index !== null) {
                title.textContent = 'Edit User';
                document.getElementById('name').value = users[index].name;
                document.getElementById('email').value = users[index].email;
            } else {
                title.textContent = 'Add User';
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
            }

            modal.showModal();
        }

        function closeModal() {
            const modal = document.getElementById('user-modal');
            modal.close();
        }

        function saveUser(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const index = document.getElementById('edit-index').value;

            if (index) {
                users[index] = { name, email };
            } else {
                users.push({ name, email });
            }

            renderUsers();
            closeModal();
        }

        function renderUsers() {
            const tbody = document.getElementById('user-table-body');
            tbody.innerHTML = '';

            users.forEach((user, i) => {
                tbody.innerHTML += `
                                      <tr>
                                        <td>${i + 1}</td>
                                        <td>${user.name}</td>
                                        <td>${user.email}</td>
                                        <td>
                                          <button class="btn btn-xs btn-warning" onclick="openModal(${i})">Edit</button>
                                        </td>
                                      </tr>
                                    `;
            });
        }
    </script>
@endsection