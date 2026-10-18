import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { createTable } from '@amec/webasset/dataTable';
import { showMessage } from '@amec/webasset/utils';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import '@amec/webasset/css/dataTable.css';

const expenseUrl = `${process.env.APP_API}/finform/fin-npo/expense`;
const expenseListUrl = `${expenseUrl}?all=1`;
let expenseTable;
let expenseToDelete = null;

const columns = [
    {
        data: null,
        title: 'No.',
        className: 'text-center',
        orderable: false,
        render: (_, type, row, meta) => meta.row + 1,
    },
    {
        data: 'EXPENSE_CODE',
        title: 'Expense Code',
        className: 'text-center text-nowrap',
        render: renderText,
    },
    {
        data: 'EXPENSE_ENAME',
        title: 'English Name',
        render: renderText,
    },
    {
        data: 'EXPENSE_TNAME',
        title: 'Thai Name',
        render: renderText,
    },
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
            <button type="button" class="edit-expense btn btn-sm btn-info btn-outline">Edit</button>
            <button type="button" class="delete-expense btn btn-sm btn-error btn-outline">Delete</button>
        </div>`,
    },
];

$(async function () {
    await loadExpenses();
});

$(document).on('click', '#addExpense', function () {
    resetForm();
    $('#expenseModalTitle').text('Add Expense');
    document.getElementById('expenseModal')?.showModal();
});

$(document).on('click', '#cancelExpense', function () {
    document.getElementById('expenseModal')?.close();
});

$(document).on('click', '.edit-expense', function () {
    const expense = expenseTable.row($(this).closest('tr')).data();
    $('#expenseModalTitle').text('Edit Expense');
    $('#ORIGINAL_EXPENSE_CODE').val(expense.EXPENSE_CODE);
    $('#ORIGINAL_EXPENSE_ENAME').val(expense.EXPENSE_ENAME);
    $('#ORIGINAL_EXPENSE_TNAME').val(expense.EXPENSE_TNAME);
    $('#EXPENSE_CODE').val(expense.EXPENSE_CODE);
    $('#EXPENSE_ENAME').val(expense.EXPENSE_ENAME);
    $('#EXPENSE_TNAME').val(expense.EXPENSE_TNAME);
    $('#ACTIVE').val(String(expense.ACTIVE));
    document.getElementById('expenseModal')?.showModal();
});

$(document).on('submit', '#expenseForm', async function (event) {
    event.preventDefault();
    if (!this.reportValidity()) return;

    const button = $('#saveExpense').prop('disabled', true);
    const isEdit = Boolean($('#ORIGINAL_EXPENSE_CODE').val());
    try {
        const result = await fetchUtils({
            url: expenseUrl,
            method: isEdit ? 'PATCH' : 'POST',
            data: getFormData(),
        });
        if (result?.status === false) throw new Error(result.message);

        document.getElementById('expenseModal')?.close();
        await loadExpenses();
        showMessage(result?.message || 'Expense saved successfully.', 'success');
    } catch (error) {
        showMessage(error?.message || 'Cannot save expense.', 'error');
    } finally {
        button.prop('disabled', false);
    }
});

$(document).on('click', '.delete-expense', function () {
    expenseToDelete = expenseTable.row($(this).closest('tr')).data();
    $('#deleteExpenseName').text(
        `${expenseToDelete.EXPENSE_CODE} - ${expenseToDelete.EXPENSE_ENAME}`,
    );
    document.getElementById('deleteExpenseModal')?.showModal();
});

$(document).on('click', '#cancelDeleteExpense', function () {
    expenseToDelete = null;
    document.getElementById('deleteExpenseModal')?.close();
});

$(document).on('click', '#confirmDeleteExpense', async function () {
    if (!expenseToDelete) return;

    const button = $(this).prop('disabled', true);
    try {
        const result = await fetchUtils({
            url: expenseUrl,
            method: 'DELETE',
            data: {
                EXPENSE_CODE: expenseToDelete.EXPENSE_CODE,
                EXPENSE_ENAME: expenseToDelete.EXPENSE_ENAME,
                EXPENSE_TNAME: expenseToDelete.EXPENSE_TNAME,
            },
        });
        if (result?.status === false) throw new Error(result.message);

        expenseToDelete = null;
        document.getElementById('deleteExpenseModal')?.close();
        await loadExpenses();
        showMessage(
            result?.message || 'Expense deleted successfully.',
            'success',
        );
    } catch (error) {
        showMessage(error?.message || 'Cannot delete expense.', 'error');
    } finally {
        button.prop('disabled', false);
    }
});

async function loadExpenses() {
    try {
        const response = await fetchUtils({
            url: expenseListUrl,
            method: 'GET',
        });
        const rows = normalizeList(response);

        if (expenseTable?.destroy) expenseTable.destroy();
        $('#expenseTable').empty();
        expenseTable = await createTable(
            {
                data: rows,
                columns,
                responsive: false,
                order: [[1, 'asc']],
            },
            {
                id: '#expenseTable',
                dataTableCss: false,
                cssCustom: false,
                domScroll: { status: true },
            },
        );
    } catch (error) {
        showMessage(error?.message || 'Cannot load expense data.', 'error');
    }
}

function getFormData() {
    return {
        ORIGINAL_EXPENSE_CODE: $('#ORIGINAL_EXPENSE_CODE').val(),
        ORIGINAL_EXPENSE_ENAME: $('#ORIGINAL_EXPENSE_ENAME').val(),
        ORIGINAL_EXPENSE_TNAME: $('#ORIGINAL_EXPENSE_TNAME').val(),
        EXPENSE_CODE: $('#EXPENSE_CODE').val().trim(),
        EXPENSE_ENAME: $('#EXPENSE_ENAME').val().trim(),
        EXPENSE_TNAME: $('#EXPENSE_TNAME').val().trim(),
        ACTIVE: $('#ACTIVE').val(),
    };
}

function resetForm() {
    document.getElementById('expenseForm')?.reset();
    $(
        '#ORIGINAL_EXPENSE_CODE, #ORIGINAL_EXPENSE_ENAME, #ORIGINAL_EXPENSE_TNAME',
    ).val('');
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
