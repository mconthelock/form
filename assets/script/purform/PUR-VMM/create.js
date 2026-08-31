$(document).on('click', '.add-row-btn', function () {
    const tableId = $(this).data('table');
    const tbody = $('#' + tableId + ' tbody');
    const newRow = tbody.find('.row-template').first().clone();
    newRow.removeClass('row-template');
    newRow.find('input').val('');
    newRow
        .find('td:last-child')
        .html(
            '<button type="button" class="remove-row w-7 h-7 rounded border border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center font-bold text-lg mx-auto transition-colors">×</button>',
        );
    tbody.append(newRow);
});

$(document).on('click', '.remove-row', function () {
    $(this).closest('tr').remove();
});
