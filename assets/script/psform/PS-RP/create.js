import { logFormData, requiredForm, showMessage } from '@amec/webasset/utils';
import { getEmpData, searchData } from './data';
import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { webflowSubmit } from '@amec/webasset/components/form';
import { redirectWebflow } from '@amec/webasset/form';
import { createTable } from '@amec/webasset/dataTable';

var mockupTable, mockupmodalTable;
// main function
$(async function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const empno = urlParams.get('empno');
    const getName = await getEmpData(empno);
    $('#INPUTBY').val(empno);
    $('#inputName').val(getName.SNAME);

    mockupTable = await createTable(
        {
            responsive: false,
            columns: [
                { title: 'NO' },
                { title: 'Item PUR' },
                { title: 'Seq' },
                { title: 'Description' },
                { title: 'Drawing No' },
                { title: 'Order No.' },
                { title: 'Item' },
                { title: 'Address' },
                { title: 'Return To' },
                { title: "Q'ty" },
                { title: 'Issue Card No' },
                { title: 'Shop' },
                { title: 'Production' },
                { title: 'Remark' },
            ],
        },
        {
            id: '#Addtable',
            domScroll: {
                status: true,
            },
        },
    );

    mockupmodalTable = await createTable(
        {
            responsive: false,
            columns: [
                { title: 'Issue No' },
                { title: 'Seq' },
                { title: 'Item' },
                { title: 'Item No' },
                { title: 'Order No' },
                { title: 'Drawing' },
                { title: 'Part Name' },
                { title: 'Location' },
                { title: 'Schedule' },
                { title: 'Qty' },
                { title: 'Complete Issue' },
                { title: 'Remain Issue' },
                { title: 'Shop' },
            ],
        },
        {
            id: '#modalTable',
            domScroll: {
                status: true,
                maxHeight: '450px',
            },
        },
    );

    const action = webflowSubmit({ request: true });
    $('#sentRequest').html(action);
});

// click request button
$(document).on('click', '#btnRequest', async function () {
    try {
        const requiredMessage = [
            {
                element: $('#REQBY'),
                message: 'Please fill the Request By',
            },
            {
                element: $('#reason'),
                message: 'Please fill the Remark',
            },
        ];
        if (!(await requiredForm(`#rpForm`, requiredMessage))) return;

        syncQtyToSelectedRows();
        syncRemarkToSelectedRows();

        const details = selectedRows.map((row) => ({
            ...row,
            QTY: row.REQUEST_QTY ?? getRequestQty(row),
            REMARKTABLE: row.REMARKTABLE || '',
        }));

        if (!details.length) {
            showMessage('Please add at least one item');
            return;
        }

        const submitDetails = details.map((row, index) => ({
            LINEID: index + 1,
            ISSUECARD: row.J2ODR,
            ISSUESEQ: row.J2SEQ,
            PURCODE: row.J2INO,
            ITEMNO: row.J2IINO,
            ORDERNO: row.J2CUS,
            DRAWING: row.J2DRAW,
            DESCRIPTION: row.J2DES,
            ADDREESS: row.J2LOCN,
            PRODUCTION: row.J2MTH,
            RETURNTO: row.WHI || 'WHI',
            QTY: row.QTY,
            REMARKTABLE: row.REMARKTABLE || '',
            ISSUETO: row.J2TO,
        }));

        const formData = new FormData($(`#rpForm`)[0]);
        formData.set('REMARK', $('#remark').val());
        // formData.set("DETAILS", JSON.stringify(submitDetails));
        submitDetails.forEach((item, i) => {
            // NestJS จะมองเป็น data[0][field], data[1][field]
            Object.keys(item).forEach((key) => {
                formData.append(`DETAILS[${i}][${key}]`, item[key] ?? '');
            });
        });
        logFormData(formData);
        const res = await createForm(formData);
        if (res.status == true) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        console.log(error);
        showMessage(error.message);
    }
});

var table,
    addTable = null;
let selectedRows = [];

const makeRowKey = (row) =>
    [row.J2ODR, row.J2SEQ, row.J2INO, row.J2IINO, row.J2CUS, row.J2MTH].join(
        '|',
    );

const toNumber = (value) => Number(value) || 0;

const getRequestQtyField = () =>
    $('#option2').is(':checked') ? 'J2CQTY' : 'J2IQTY';

const getRequestQtyLabel = () =>
    $('#option2').is(':checked') ? 'Complete Issue' : 'Remain Issue';

const getRequestQty = (row) => toNumber(row[getRequestQtyField()]);

const normalizeRequestQty = (value, maxQty) => {
    if (value === '' || value === '-' || value === '+') return value;

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) return '';

    return Math.min(Math.max(parsed, 1), maxQty);
};

$(document).on('change', 'input[name="REQ_TYPE"]', async function () {
    selectedRows = [];

    if (table) {
        table.rows().every(async function () {
            const row = this.data();
            delete row.selected;
            this.data(row);
        });

        table.clear().draw();
    }

    if (addTable) {
        addTable.clear().draw();
    }
});

const syncRemarkToSelectedRows = () => {
    $('#Addtable textarea[name="REMARKTABLE"]').each(async function () {
        const key = $(this).data('key');
        const row = selectedRows.find((item) => makeRowKey(item) === key);

        if (row) {
            row.REMARKTABLE = $(this).val();
        }
    });
};

const syncQtyToSelectedRows = () => {
    $('#Addtable input[name="QTY"]').each(async function () {
        const key = $(this).data('key');
        const row = selectedRows.find((item) => makeRowKey(item) === key);

        if (row) {
            row.REQUEST_QTY = $(this).val();
        }
    });
};

const syncSelectedRowsFromModal = () => {
    if (!table) return;

    syncQtyToSelectedRows();
    syncRemarkToSelectedRows();

    const currentRows = table.rows().data().toArray();
    const currentRowKeys = currentRows.map((row) => makeRowKey(row));
    const selectedMap = new Map(
        selectedRows.map((row) => [makeRowKey(row), row]),
    );

    currentRows.forEach((row) => {
        const key = makeRowKey(row);

        if (row.selected) {
            const selectedRow = selectedMap.get(key);

            selectedMap.set(key, {
                ...selectedRow,
                ...row,
                WHI: 'WHI',
                J2RQTY: selectedRow?.J2RQTY ?? row.J2RQTY,
                REMARK: selectedRow?.REMARKTABLE || row.REMARKTABLE || '',
            });
        } else if (currentRowKeys.includes(key)) {
            selectedMap.delete(key);
        }
    });

    selectedRows = Array.from(selectedMap.values());
};

const uncheckModalTableRow = (key) => {
    if (!table) return;

    table.rows().every(function () {
        const row = this.data();

        if (makeRowKey(row) === key) {
            delete row.selected;
            this.data(row);
        }
    });

    table.draw(false);
};

// search data and create modalTable
$(document).on('click', '#btnSearch', async function () {
    try {
        if (table) {
            syncSelectedRowsFromModal();
        }

        const searchValue = {
            PURITEM: $('#PURITEM').val() || null,
            ISSUENO: $('#ISSUENO').val() || null,
            SCHEDULE: $('#SCHEDULE').val() || null,
            ISSUETO: $('#ISSUETO').val() || null,
            ITEM: $('#ITEM').val() || null,
            ORDER: $('#ORDER').val() || null,
        };

        console.log(searchValue);

        const search = await searchData(searchValue);
        const selectedKeys = new Set(
            selectedRows.map((row) => makeRowKey(row)),
        );

        const filteredSearch = search.filter((row) => getRequestQty(row) > 0);

        const searchDataWithSelected = filteredSearch.map((row) => ({
            ...row,
            selected: selectedKeys.has(makeRowKey(row)),
        }));

        table = await createTable(
            {
                responsive: false,
                data: searchDataWithSelected,
                columns: [
                    { data: 'J2ODR', title: 'Issue No' },
                    { data: 'J2SEQ', title: 'Seq' },
                    { data: 'J2INO', title: 'Item' },
                    { data: 'J2IINO', title: 'Item No' },
                    { data: 'J2CUS', title: 'Order No' },
                    {
                        data: 'J2DRAW',
                        title: 'Drawing',
                        className: 'text-nowrap',
                    },
                    {
                        data: 'J2DES',
                        title: 'Part Name',
                        className: 'text-nowrap',
                    },
                    { data: 'J2LOCN', title: 'Location' },
                    { data: 'J2MTH', title: 'Schedule' },
                    { data: 'J2RQTY', title: 'Qty' },
                    { data: 'J2CQTY', title: 'Complete Issue' },
                    { data: 'J2IQTY', title: 'Remain Issue' },
                    { data: 'J2TO', title: 'Shop' },
                ],
            },
            {
                id: '#modalTable',
                columnSelect: { status: true },
                domScroll: {
                    status: true,
                    maxHeight: '450px',
                },
            },
        );
    } catch (error) {
        console.log(error);
    }
});

// clr search data
$(document).on('click', '#btnClear', async function () {
    $('#PURITEM').val('');
    $('#ISSUENO').val('');
    $('#SCHEDULE').val('');
    $('#ISSUETO').val('');
    $('#ITEM').val('');
    $('#ORDER').val('');

    if (table) {
        table.clear().draw();
    }
});

// get name Requester
$(document).on('change', '#REQBY', async function (e) {
    e.preventDefault();

    try {
        const empData = await getEmpData($(this).val());
        $('#empName').val(empData.SNAME);
    } catch (error) {
        console.log(error);
    }
});

$(document).on(
    'input',
    '#Addtable textarea[name="REMARKTABLE"]',
    async function () {
        const key = $(this).data('key');
        const row = selectedRows.find((item) => makeRowKey(item) === key);

        if (row) {
            row.REMARKTABLE = $(this).val();
        }
    },
);

// Add data to main table (addTable)
$(document).on('click', '#addData', async function (e) {
    try {
        syncSelectedRowsFromModal();
        const invalidRows = selectedRows.filter(
            (row) => getRequestQty(row) <= 0,
        );

        if (invalidRows.length) {
            const invalidKeys = new Set(
                invalidRows.map((row) => makeRowKey(row)),
            );

            selectedRows = selectedRows.filter(
                (row) => !invalidKeys.has(makeRowKey(row)),
            );

            if (table) {
                table.rows().every(function () {
                    const row = this.data();

                    if (invalidKeys.has(makeRowKey(row))) {
                        delete row.selected;
                        this.data(row);
                    }
                });

                table.draw(false);
            }

            e.preventDefault();
            showMessage(`${getRequestQtyLabel()} must not be 0`);
            return;
        }

        const addRows = selectedRows.map((row, index) => {
            const maxQty = getRequestQty(row);
            const requestQty =
                row.J2RQTY === undefined || row.J2RQTY === null
                    ? maxQty
                    : normalizeRequestQty(row.J2RQTY, maxQty);

            return {
                ...row,
                NO: index + 1,
                WHI: row.WHI || 'WHI',
                J2RQTY: requestQty,
                REMARK: row.REMARKTABLE || '',
            };
        });

        console.log(addRows);

        addTable = await createTable(
            {
                responsive: false,
                data: addRows,
                columns: [
                    {
                        data: null,
                        title: 'Action',
                        className: 'text-center',
                        orderable: false,
                        searchable: false,
                        render: function (data, type, row) {
                            return `
                <button
                  type="button"
                  class="btn btn-error btn-xs btnRemoveAddRow"
                  data-key="${makeRowKey(row)}"
                >
                  Delete
                </button>
              `;
                        },
                    },
                    { data: 'NO', title: 'NO' },
                    { data: 'J2INO', title: 'Item PUR' },
                    { data: 'J2SEQ', title: 'Seq' },
                    {
                        data: 'J2DES',
                        title: 'Description',
                        className: 'text-nowrap',
                    },
                    {
                        data: 'J2DRAW',
                        title: 'Drawing No',
                        className: 'text-nowrap',
                    },
                    { data: 'J2CUS', title: 'Order No.' },
                    { data: 'J2IINO', title: 'Item' },
                    { data: 'J2LOCN', title: 'Address' },
                    { data: 'WHI', title: 'Return To' },
                    {
                        data: null,
                        title: "Q'ty",
                        render: function (data, type, row) {
                            const maxQty = getRequestQty(row);

                            return `
              <input
                type="number"
                class="input input-bordered input-sm w-24"
                name="QTY"
                min="1"
                max="${maxQty}"
                value="${row.REQUEST_QTY ?? getRequestQty(row)}"
                data-key="${makeRowKey(row)}"
              />
            `;
                        },
                    },
                    { data: 'J2ODR', title: 'Issue Card No' },
                    { data: 'J2TO', title: 'Shop' },
                    { data: 'J2MTH', title: 'Production' },
                    {
                        data: null,
                        title: 'Remark',
                        width: '500px',
                        render: function (data, type, row) {
                            return `
                <textarea
                  class="textarea textarea-bordered textarea-md w-full min-w-[500px] min-h-20"
                  placeholder="WHI's reason to revise/return...."
                  name="REMARKTABLE"
                  data-key="${makeRowKey(row)}"
                  data-no="${row.NO}"
                >${row.REMARKTABLE || ''}</textarea>
              `;
                        },
                    },
                ],
            },
            {
                id: '#Addtable',
                domScroll: {
                    status: true,
                },
            },
        );
    } catch (error) {
        console.log(error);
    }
});

$(document).on('input', '#Addtable input[name="QTY"]', function () {
    const key = $(this).data('key');
    const row = selectedRows.find((item) => makeRowKey(item) === key);

    if (!row) return;

    row.REQUEST_QTY = $(this).val();
});

$(document).on('change', '#Addtable input[name="QTY"]', function () {
    const key = $(this).data('key');
    const row = selectedRows.find((item) => makeRowKey(item) === key);

    if (!row) return;

    const maxQty = getRequestQty(row);
    const qty = normalizeRequestQty($(this).val(), maxQty);

    row.REQUEST_QTY = qty;
    $(this).val(qty);
});

// button delete list item in Addtable
$(document).on('click', '.btnRemoveAddRow', async function () {
    const key = $(this).data('key');

    syncQtyToSelectedRows();
    syncRemarkToSelectedRows();

    selectedRows = selectedRows.filter((row) => makeRowKey(row) !== key);

    uncheckModalTableRow(key);

    if (addTable) {
        addTable
            .clear()
            .rows.add(
                selectedRows.map((row, index) => {
                    const maxQty = getRequestQty(row);
                    const requestQty =
                        row.J2RQTY === undefined || row.J2RQTY === null
                            ? maxQty
                            : normalizeRequestQty(row.J2RQTY, maxQty);

                    return {
                        ...row,
                        NO: index + 1,
                        WHI: row.WHI || 'WHI',
                        J2RQTY: requestQty,
                        REMARK: row.REMARKTABLE || '',
                    };
                }),
            )
            .draw();
    }
});

// hidden search Puritem/Schedule/Issueto when option2 was checked
$(document).on('click', '#btnaddDatarow', async function () {
    if ($('#option2').is(':checked')) {
        $('#modalHeader').html('SELECT DATA TO RETURN');
    } else {
        $('#modalHeader').html('SELECT DATA TO REVISE');
    }
});

async function createForm(data) {
    return fetchUtils({
        url: `${process.env.APP_API}/psform/ps-rp`,
        method: 'POST',
        data: data,
    });
}
