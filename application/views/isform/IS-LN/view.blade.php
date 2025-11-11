@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        .permission-table th,
        .permission-table td {
            border: 1px solid #d1d5db;
            padding: 12px;
        }

        .permission-table th {
            background-color: #f3f4f6;
            font-weight: 600;
        }

        @media print {
            .no-print {
                display: none !important;
            }
        }
    </style>
@endsection

@section('contents')
    <!-- <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div> -->
    <div class="max-w-6xl w-full mx-auto px-4 py-8 bg-white shadow rounded-xl">
        <!-- Header -->
        <div class="text-center mb-6">
            <h1 class="text-2xl font-bold">FINANCIAL SYSTEM</h1>
            <h2 class="font-semibold underline">USER REGISTRATION FORM</h2>
        </div>

        <!-- Form Information -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
            <!-- Form Description -->
            <div class="card bg-base-200 shadow-md">
                <div class="card-body p-4">
                    <h3 class="card-title text-lg text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                        </svg>
                        Form Description
                    </h3>
                    <div class="divider my-2"></div>
                    <div class="space-y-3">
                        <div>
                            <div class="text-sm text-gray-500 mb-1">Form Number</div>
                            <div class="font-medium text-base">{{ $formNumber }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500 mb-1">Input By</div>
                            <div class="font-medium text-base">{{ $formData->INPUT_BY ?? '' }} - {{ $inputByName ?? '' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500 mb-1">Request By</div>
                            <div class="font-medium text-base">{{ $formData->REQUEST_BY ?? '' }} - {{ $requestByName ?? '' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500 mb-1">Created Date</div>
                            <div class="font-medium text-base">
                                {{ isset($formData->DCREDTE) ? date('d/m/Y H:i', strtotime($formData->DCREDTE)) : '-' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Description -->
            <div class="card bg-base-200 shadow-md">
                <div class="card-body p-4">
                    <h3 class="card-title text-lg text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                        User Description
                    </h3>
                    <div class="divider my-2"></div>
                    <div class="space-y-3">
                        <div>
                            <div class="text-sm text-gray-500 mb-1">UserID / Emp Code</div>
                            <div class="font-medium text-base">{{ $userData->SEMPNO ?? '-' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500 mb-1">Employee Name</div>
                            <div class="font-medium text-base">{{ $userData->SNAME ?? '-' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500 mb-1">Department</div>
                            <div class="font-medium text-base">{{ $userData->SDEPT ?? '-' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500 mb-1">Section</div>
                            <div class="font-medium text-base">{{ $userData->SSEC ?? '-' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Program Requisition -->
        <div class="card bg-base-200 shadow-md mb-6">
            <div class="card-body p-4">
                <h3 class="card-title text-lg text-primary">
                    PART II : PROGRAM REQUISITION
                </h3>
                <div class="divider my-2"></div>

                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Action -->
                    <div>
                        <div class="text-sm text-gray-500 mb-2">Action</div>
                        @php
                            $actionId   = $formData->ACTION_ID ?? 0;
                            $actionText = '';
                            $badgeClass = 'badge-ghost';

                            switch ($actionId) {
                                case 1:
                                    $badgeClass = 'badge-success';
                                    break;
                                case 2:
                                    $badgeClass = 'badge-error';
                                    break;
                                case 3:
                                    $badgeClass = 'badge-info';
                                    break;
                                default:
                                    $actionText = '-';
                            }
                        @endphp
                        <span class="badge badge-lg {{ $badgeClass }}">{{ $formData->ACTION_NAME }}</span>
                    </div>

                    <!-- Group Code -->
                    <div>
                        <div class="text-sm text-gray-500 mb-2">Group Code</div>
                        <div class="font-medium">{{ $formData->GROUP_CODE ?? '-' }}</div>
                    </div>
                </div>

                <!-- Remark -->
                @if(!empty($formData->REMARK))
                    <div class="mt-4">
                        <div class="text-sm text-gray-500 mb-2">Remark</div>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                            {{ $formData->REMARK }}
                        </div>
                    </div>
                @endif
            </div>
        </div>

        <!-- Permissions/Role -->
        <div class="card bg-base-200 shadow-md mb-6">
            <div class="card-body p-4">
                <h3 class="card-title text-lg text-primary">
                    PART III : Permission/Role
                </h3>
                <div class="divider my-2"></div>

                @if(!empty($permissions) && count($permissions) > 0)
                    <div class="space-y-4">
                        @foreach($permissions as $moduleId => $modulePerms)
                            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div class="flex items-center mb-3">
                                    <span class="font-semibold text-gray-700">
                                        {{ $modulePerms['module_name'] ?? 'Unknown Module' }}
                                    </span>
                                </div>
                                <div class="flex flex-wrap gap-2 ml-6">
                                    @foreach($modulePerms['roles'] as $role)
                                        <span class="badge badge-primary gap-1">
                                            {{ $role }}
                                        </span>
                                    @endforeach
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>No permissions assigned yet.</span>
                    </div>
                @endif
            </div>
        </div>

        @if ($mode == '02')
            <div class="flex justify-center mt-6 space-x-4">
                <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-submit" data-action="approve" id="btn-confirm">
                    Approve
                </button>
                <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-submit" data-action="reject">
                    Reject
                </button>
            </div>
        @endif





        <!-- Hidden form data for JavaScript -->
        <div id="form-data" data-nfrmno="{{ $formData->NFRMNO ?? '' }}" data-vorgno="{{ $formData->VORGNO ?? '' }}" data-cyear="{{ $formData->CYEAR ?? '' }}" data-cyear2="{{ $formData->CYEAR2 ?? '' }}" data-nrunno="{{ $formData->NRUNNO ?? '' }}" data-empno="{{ $formData->EMPNO ?? '' }}" class="hidden">
        </div>

        <!-- Flow container -->
        <div class="flow mt-8"></div>
@endsection

    @section('scripts')
        <script src="{{ $_ENV['APP_JS'] }}/lnUserRegView.js?ver={{ $GLOBALS['version'] }}"></script>
    @endsection