const { fetchUtils } = require("@amec/webasset/api/fetch-utils");
const { webflowSubmit } = require("@amec/webasset/components/form");
const { showMessage, requiredForm } = require("@amec/webasset/utils");
const { getEmpData } = require("./data");
const { createTable, getSelectedData } = require("@amec/webasset/dataTable");
const { data } = require("jquery");

// main function
$(async function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const empno = urlParams.get("empno");
  const getName = await getEmpData(empno);
  $("#INPUTBY").val(empno);
  $("#inputName").val(getName.SNAME);

  const action = webflowSubmit({ request: true });
  $("#sentRequest").html(action);
});

// click request button
$(document).on("click", "#btnRequest", async function () {
  try {
    const requiredMessage = [
      {
        element: $("#REQBY"),
        message: "Please fill the Request By",
      },
      {
        element: $("#reason"),
        message: "Please fill the Remark",
      },
    ];
    if (!(await requiredForm(`#rpForm`, requiredMessage))) return;
  } catch (error) {
    console.log(error);
    showMessage(error.message);
  }
});

var table,
  addTable = null;
let selectedRows = [];

const makeRowKey = (row) =>
  [row.J2ODR, row.J2SEQ, row.J2INO, row.J2IINO, row.J2CUS, row.J2MTH].join("|");

const syncRemarkToSelectedRows = () => {
  $('#Addtable textarea[name="REMARK[]"]').each(function () {
    const key = $(this).data("key");
    const row = selectedRows.find((item) => makeRowKey(item) === key);

    if (row) {
      row.REMARK = $(this).val();
    }
  });
};

const syncSelectedRowsFromModal = () => {
  if (!table) return;

  syncRemarkToSelectedRows();

  const currentRows = table.rows().data().toArray();
  const currentRowKeys = currentRows.map((row) => makeRowKey(row));
  const selectedMap = new Map(
    selectedRows.map((row) => [makeRowKey(row), row]),
  );

  currentRows.forEach((row) => {
    const key = makeRowKey(row);

    if (row.selected) {
      selectedMap.set(key, {
        ...selectedMap.get(key),
        ...row,
        WHI: "WHI",
        REMARK: selectedMap.get(key)?.REMARK || row.REMARK || "",
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

// search data
$(document).on("click", "#btnSearch", async function () {
  try {
    if (table) {
      syncSelectedRowsFromModal();
    }

    const searchValue = {
      PURITEM: $("#PURITEM").val() || null,
      ISSUENO: $("#ISSUENO").val() || null,
      SCHEDULE: $("#SCHEDULE").val() || null,
      ISSUETO: $("#ISSUETO").val() || null,
    };

    console.log(searchValue);

    const search = await searchData(searchValue);
    const selectedKeys = new Set(selectedRows.map((row) => makeRowKey(row)));

    const searchDataWithSelected = search.map((row) => ({
      ...row,
      selected: selectedKeys.has(makeRowKey(row)),
    }));

    console.log(searchDataWithSelected);

    table = await createTable(
      {
        responsive: false,
        data: searchDataWithSelected,
        columns: [
          { data: "J2ODR", title: "Issue No" },
          { data: "J2SEQ", title: "Seq" },
          { data: "J2INO", title: "Item" },
          { data: "J2IINO", title: "Item No" },
          { data: "J2CUS", title: "Order No" },
          { data: "J2DRAW", title: "Drawing" },
          { data: "J2DES", title: "Part Name" },
          { data: "J2LOCN", title: "Location" },
          { data: "J2MTH", title: "Schedule" },
          { data: "J2RQTY", title: "Qty" },
          { data: "J2TO", title: "Shop" },
        ],
      },
      {
        id: "#modalTable",
        columnSelect: { status: true },
        domScroll: {
          status: true,
          maxHeight: "450px",
        },
      },
    );
  } catch (error) {
    console.log(error);
  }
});

// clr data
$(document).on("click", "#btnClear", async function () {
  $("#PURITEM").val("");
  $("#ISSUENO").val("");
  $("#SCHEDULE").val("");
  $("#ISSUETO").val("");

  if (table) {
    table.clear().draw();
  }
});

// get name Requester
$(document).on("change", "#REQBY", async function (e) {
  e.preventDefault();

  try {
    const empData = await getEmpData($(this).val());
    $("#empName").val(empData.SNAME);
  } catch (error) {
    console.log(error);
  }
});

$(document).on("input", '#Addtable textarea[name="REMARK[]"]', function () {
  const key = $(this).data("key");
  const row = selectedRows.find((item) => makeRowKey(item) === key);

  if (row) {
    row.REMARK = $(this).val();
  }
});

// Add data to Table form
$(document).on("click", "#addData", async function () {
  try {
    syncSelectedRowsFromModal();

    const addRows = selectedRows.map((row, index) => ({
      ...row,
      NO: index + 1,
      WHI: row.WHI || "WHI",
      REMARK: row.REMARK || "",
    }));

    console.log(addRows);

    addTable = await createTable(
      {
        responsive: false,
        data: addRows,
        columns: [
          {
            data: null,
            title: "Action",
            className: "text-center",
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
          { data: "NO", title: "NO" },
          { data: "J2INO", title: "Item PUR" },
          { data: "J2DES", title: "Description", className: "text-nowrap" },
          { data: "J2DRAW", title: "Drawing No", className: "text-nowrap" },
          { data: "J2CUS", title: "Order No." },
          { data: "J2IINO", title: "Item" },
          { data: "J2LOCN", title: "Address" },
          { data: "WHI", title: "Return To" },
          { data: "J2RQTY", title: "Q'ty" },
          { data: "J2ODR", title: "Issue Card No" },
          { data: "J2MTH", title: "Production" },
          {
            data: null,
            title: "Remark",
            width: "500px",
            render: function (data, type, row) {
              return `
                <textarea
                  class="textarea textarea-bordered textarea-md w-full min-w-[500px] min-h-20"
                  placeholder="WHI's reason to revise/return...."
                  name="REMARK[]"
                  data-key="${makeRowKey(row)}"
                  data-no="${row.NO}"
                >${row.REMARK || ""}</textarea>
              `;
            },
          },
        ],
      },
      {
        id: "#Addtable",
        domScroll: {
          status: true,
        },
      },
    );
  } catch (error) {
    console.log(error);
  }
});

$(document).on("click", ".btnRemoveAddRow", function () {
  const key = $(this).data("key");

  syncRemarkToSelectedRows();

  selectedRows = selectedRows.filter((row) => makeRowKey(row) !== key);

  uncheckModalTableRow(key);

  if (addTable) {
    addTable.clear().rows.add(
      selectedRows.map((row, index) => ({
        ...row,
        NO: index + 1,
        WHI: row.WHI || "WHI",
        REMARK: row.REMARK || "",
      }))
    ).draw();
  }
});

// hidden search Puritem/Schedule/Issueto when option2 was checked
$(document).on("click", "#btnaddDatarow", async function () {
  if ($("#option2").is(":checked")) {
    $("#hiddenPuritem").addClass("hidden");
    $("#hiddenSch").addClass("hidden");
    $("#hiddenIssueto").addClass("hidden");
  } else {
    $("#hiddenPuritem").removeClass("hidden");
    $("#hiddenSch").removeClass("hidden");
    $("#hiddenIssueto").removeClass("hidden");
  }
});

// const mokdata = [{test: 11 }];

async function searchData(data) {
  return fetchUtils({
    url: `${process.env.APP_API}/J002mp`,
    method: "POST",
    data,
  });
}
