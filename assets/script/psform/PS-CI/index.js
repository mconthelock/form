import { host } from "../../utils";
import { createTable } from "@amec/webasset/dataTable";
import { showflow } from "@amec/webasset/api/webform";

$(document).ready(async function () {
    const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = $(".form-data").data();

    const flow = await showflow(
        {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: nrunno,
        }
    );
    $(".flow").html(flow.html);

    const data = await $.ajax({
        type: "POST",
        url: host + "psform/PS-CI/main/getDataForm",
        data: {
            nfrmno: nfrmno,
            vorgno: vorgno,
            cyear: cyear,
            cyear2: cyear2,
            nrunno: nrunno,
        },
        dataType: "json",
        beforeSend: function () {
            const loader = `<tr><td colspan="13" class="text-center py-5">Loading data...</td></tr>`;
            $(".table-detail").html(loader);
        },
        success: function (res) {
            $(".table-detail").empty();
            $(".skeleton").removeClass('skeleton');
        }
    });

    $(".total-item").text(data.length);
    const checkingItem = data.filter(item => item.ACTUAL_QTY !== null).length;
    $(".checking-item").text(checkingItem);
    const diffItemFirstTime = data.filter(item => (item.ACTUAL_QTY !== null) && (item.ACTUAL_QTY !== item.ON_HAND)).length;
    $(".diff-item-first-time").text(diffItemFirstTime);
    const diffItemAfterRecheck = data.filter(item => (item.ACTUAL_QTY !== null) && (item.REMARK !== null) && (item.ACTUAL_QTY !== item.ON_HAND)).length;
    $(".diff-item-after-recheck").text(diffItemAfterRecheck);
    const randomCheckItem = data.filter(item => item.RANDOM_CHECK !== null).length;
    $(".random-check").text(randomCheckItem);

    const columns = [
        {
            data: null,
            render: (data, type, row, meta) => meta.row + 1,
            className: "border-r border-slate-200 text-center"
        },
        { data: "IBUYC", className: "border-r border-slate-200" },
        { data: "IPROD", className: "border-r border-slate-200" },
        { data: "IDESC", className: "border-r border-slate-200" },
        { data: "IDRAW", className: "border-r border-slate-200 text-center" },
        { data: "IABBT", className: "border-r border-slate-200 text-right font-semibold bg-amber-50" },
        {
            data: null,
            render: (data, type, row) => `${row.CONTROLLER_ID} - ${row.STNAME}`,
            className: "border-r border-slate-200 text-center"
        },
        { data: "ON_HAND", className: "border-r border-slate-200 text-right font-semibold bg-amber-50" },
        { data: "IUMS", className: "border-r border-slate-200 text-center" },
        {
            data: null,
            render: (data, type, row) => row.ACTUAL_QTY ?? row.ON_HAND,
            createdCell: (td, cellData, rowData, row, col) => {
                $(td).addClass("border-r border-slate-200 text-right font-semibold");
                if (rowData.ACTUAL_QTY) {
                    $(td).addClass('bg-amber-50');
                }
            }
        },
        {
            data: null,
            render: (data, type, row) => {
                const ACTUAL_QTY = row.ACTUAL_QTY ?? row.ON_HAND;
                return ACTUAL_QTY - row.ON_HAND;
            },
            createdCell: (td, cellData, rowData, row, col) => {
                const ACTUAL_QTY = rowData.ACTUAL_QTY ?? rowData.ON_HAND;
                const DIFF = ACTUAL_QTY - rowData.ON_HAND;
                $(td).addClass("border-r border-slate-200 text-right font-bold");
                if (DIFF < 0) {
                    $(td).addClass('text-red-700 bg-red-50');
                } else {
                    $(td).addClass('text-green-700 bg-green-50');
                }
            }
        },
        { data: "RANDOM_CHECK", className: "border-r border-slate-200" },
        { data: "REMARK", defaultContent: "", className: "text-center" }
    ];

    await createTable({
        data: data,
        columns: columns,
        // createdRow: function (row, data, dataIndex) {
        //     $(row).addClass('hover:bg-slate-50 border-b border-slate-200');
        // }
        dom: `<"table-top domTop"
                <"top-menu"
                    <"left-menu join"
                        l
                        <"#filterBtnDt.filterBtnDt items-center">
                    >
                    <"middle-menu">
                    <"right-menu table-option join"f>
                >
                <"top-menu-row2">
            >
            <"table-body"rt>
            <"table-bottom"
                <"table-info" i>
                <"table-paging"p>
            >`
    }, {
        id: "#table",
        // dataTableSm: { status: false },
        // dataTableCss: false
    });


    console.log(data);
});
