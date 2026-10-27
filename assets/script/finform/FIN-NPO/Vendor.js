import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { createTable } from '@amec/webasset/dataTable';
import { showMessage } from '@amec/webasset/utils';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import '@amec/webasset/css/dataTable.css';

const vendorUrl = `${process.env.APP_API}/finform/fin-npo/vendor`;
let vendorTable;
let vendorToDelete = null;

const columns = [
    {
        data: null,
        title: 'No.',
        className: 'text-center',
        orderable: false,
        render: (_, type, row, meta) => meta.row + 1,
    },
    {
        data: 'VENDOR_CODE',
        title: 'Vendor Code',
        className: 'text-nowrap',
        render: renderText,
    },
    { data: 'VENDOR_NAME', title: 'Vendor Name', render: renderText },
    {
        data: 'ACTIVE',
        title: 'Status',
        className: 'text-center',
        render: (value) =>
            String(value) === '1'
                ? '<span class="badge badge-success">Active</span>'
                : '<span class="badge badge-ghost">Inactive</span>',
    },
    {
        data: null,
        title: 'Action',
        className: 'text-center',
        orderable: false,
        searchable: false,
        render: () => `<div class="flex justify-center gap-2">
            <button type="button" class="edit-vendor btn btn-sm btn-info btn-outline">Edit</button>
            <button type="button" class="delete-vendor btn btn-sm btn-error btn-outline">Delete</button>
        </div>`,
    },
];

$(async function () {
    await loadVendors();
});

$(document).on('click', '#addVendor', function () {
    resetForm();
    $('#vendorModalTitle').text('Add Vendor');
    document.getElementById('vendorModal')?.showModal();
});

$(document).on('click', '#cancelVendor', function () {
    document.getElementById('vendorModal')?.close();
});

$(document).on('click', '.edit-vendor', function () {
    const vendor = vendorTable.row($(this).closest('tr')).data();
    $('#vendorModalTitle').text('Edit Vendor');
    $('#ORIGINAL_VENDOR_CODE').val(vendor.VENDOR_CODE);
    $('#ORIGINAL_VENDOR_NAME').val(vendor.VENDOR_NAME);
    $('#VENDOR_CODE').val(vendor.VENDOR_CODE);
    $('#VENDOR_NAME').val(vendor.VENDOR_NAME);
    $('#ACTIVE').val(String(vendor.ACTIVE));
    document.getElementById('vendorModal')?.showModal();
});

$(document).on('submit', '#vendorForm', async function (event) {
    event.preventDefault();
    if (!this.reportValidity()) return;

    const button = $('#saveVendor').prop('disabled', true);
    const isEdit = Boolean($('#ORIGINAL_VENDOR_CODE').val());
    try {
        const result = await fetchUtils({
            url: vendorUrl,
            method: isEdit ? 'PATCH' : 'POST',
            data: getFormData(),
        });
        if (result?.status === false) throw new Error(result.message);

        document.getElementById('vendorModal')?.close();
        await loadVendors();
        showMessage(result?.message || 'Vendor saved successfully.', 'success');
    } catch (error) {
        showMessage(error?.message || 'Cannot save vendor.', 'error');
    } finally {
        button.prop('disabled', false);
    }
});

$(document).on('click', '.delete-vendor', function () {
    vendorToDelete = vendorTable.row($(this).closest('tr')).data();
    $('#deleteVendorName').text(
        `${vendorToDelete.VENDOR_CODE} - ${vendorToDelete.VENDOR_NAME}`,
    );
    document.getElementById('deleteVendorModal')?.showModal();
});

$(document).on('click', '#cancelDeleteVendor', function () {
    vendorToDelete = null;
    document.getElementById('deleteVendorModal')?.close();
});

$(document).on('click', '#confirmDeleteVendor', async function () {
    if (!vendorToDelete) return;

    const button = $(this).prop('disabled', true);
    try {
        const result = await fetchUtils({
            url: vendorUrl,
            method: 'DELETE',
            data: {
                VENDOR_CODE: vendorToDelete.VENDOR_CODE,
                VENDOR_NAME: vendorToDelete.VENDOR_NAME,
            },
        });
        if (result?.status === false) throw new Error(result.message);

        vendorToDelete = null;
        document.getElementById('deleteVendorModal')?.close();
        await loadVendors();
        showMessage(
            result?.message || 'Vendor deleted successfully.',
            'success',
        );
    } catch (error) {
        showMessage(error?.message || 'Cannot delete vendor.', 'error');
    } finally {
        button.prop('disabled', false);
    }
});

async function loadVendors() {
    try {
        const response = await fetchUtils({ url: vendorUrl, method: 'GET' });
        const rows = normalizeList(response);

        if (vendorTable?.destroy) vendorTable.destroy();
        $('#vendorTable').empty();
        vendorTable = await createTable(
            {
                data: rows,
                columns,
                responsive: false,
                order: [[1, 'asc']],
            },
            {
                id: '#vendorTable',
                dataTableCss: false,
                cssCustom: false,
                domScroll: { status: true },
            },
        );
    } catch (error) {
        showMessage(error?.message || 'Cannot load vendor data.', 'error');
    }
}

function getFormData() {
    return {
        ORIGINAL_VENDOR_CODE: $('#ORIGINAL_VENDOR_CODE').val(),
        ORIGINAL_VENDOR_NAME: $('#ORIGINAL_VENDOR_NAME').val(),
        VENDOR_CODE: $('#VENDOR_CODE').val().trim(),
        VENDOR_NAME: $('#VENDOR_NAME').val().trim(),
        ACTIVE: $('#ACTIVE').val(),
    };
}

function resetForm() {
    document.getElementById('vendorForm')?.reset();
    $('#ORIGINAL_VENDOR_CODE, #ORIGINAL_VENDOR_NAME').val('');
    $('#ACTIVE').val('1');
}

function normalizeList(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
}

function renderText(value, type) {
    return type === 'display' ? escapeHtml(value) : value;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
