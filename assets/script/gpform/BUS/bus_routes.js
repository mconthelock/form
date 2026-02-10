import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { getLine, getRoute, getStop }  from "./data.js";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption} from "../../utils.js";


var tableLine;
var tableStop;
let selectedBusId = null;

$(document).ready(async function () {
    await initApp({ submenu: ".nav-bus" });
    //console.log("BUS ROUTES VER.1");
    
    const data_line = await getLine();
    const tale_line = await lineOptions(data_line);
    tableLine = await createTable(tale_line, {id: "#line_table"});
    console.log("TABLE LINE:", tableLine);

     if (data_line.length > 0) {
        const firstRowData = data_line[0];
        selectedBusId = firstRowData.BUSID;
        const route = await getRoute({ BUSLINE: selectedBusId });
        await showRouteDetail(route);
        tableLine.rows().every(function () {
            const rowData = this.data();
            if (rowData.BUSID == selectedBusId) {
                $(this.node()).addClass("line-selected");
            }
        });
    }
});

async function lineOptions(data) {
    const opt = {...tableOption};
    opt.data = data ;
    opt.columns =  [
                    { data: "BUSNAME", title: "สายรถ" },
                    {
                        data: "BUSTYPE",
                        title: "ประเภทรถ",
                        className: "text-center",
                        render: function (data) {
                            if (data === "1")
                                return `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-900 rounded-full">Bus</span>`;
                            if (data === "2")
                                return `<span class="px-2 py-1 text-xs bg-orange-100 text-purple-900 rounded-full">Van</span>`;
                            return "-";
                        }
                    },
                    { data: "BUSSEAT", title: "จำนวนที่นั่ง", className: "text-center" },
                    {
                        data: "BUSSTATUS",
                        title: "สถานะ",
                        className: "text-center",
                        render: function (data) {
                            return data === "1"
                                ? `<span class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>`
                                : `<span class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">Inactive</span>`;
                        }
                    },
                    {
                        data: null,
                        title: "จัดการ",
                        className: "text-center",
                        orderable: false,
                        render: function (data, type, row) {
                            return `
                                <div class="flex justify-center gap-2">
                                    <button class="btn-edit-line px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 cursor-pointer"data-id="${row.BUSID}">✏️</button>
                                    <button class="btn-delete-line px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer" data-id="${row.BUSID}">🗑</button>
                                </div>
                             `;
                        }
                    }
                ];
            opt.createdRow = function( row, data ) {
               $(row).addClass('line-row cursor-pointer hover:bg-gray-100 transition');
            }
    return opt;
}

$(document).on("click", "#btnAddLine", function () {
    $("#lineModalTitle").text("เพิ่มสายรถ");
    $("#hdLineId").val("");
    $("#txtLineName").val("");
    $("input[name='busType'][value='1']").prop("checked", true);
    $("#ddlSeat").val("");
    document.getElementById("line_modal").showModal();
});

$(document).on("click", "#btnAddStop", function () {
    if (!selectedBusId) {
        showMessage("กรุณาเลือกสายรถก่อน", "warning");
        return;
    }
    // ดึงข้อมูลสายที่เลือก
    const rowData = tableLine.rows().data().toArray().find(r => r.BUSID == selectedBusId);

    $("#hdBusId").val(selectedBusId);
    $("#lblBusName").text(rowData?.BUSNAME || "-");
    //populateLineDropdown();
    generateTimeDropdown("workdayHour", "workdayMin");
    generateTimeDropdown("nightHour", "nightMin");
    generateTimeDropdown("holidayHour", "holidayMin");
    document.getElementById("stop_modal").showModal();
});


$(document).on("click", ".line-row", async function(e){
    e.preventDefault();
    try{
        const data = tableLine.row($(this)).data();
        console.log(data);

        selectedBusId = data.BUSID;
        $(".line-row").removeClass("line-selected");
        $(this).addClass("line-selected");
        
        const route = await getRoute({ BUSLINE: data.BUSID });
        const detail = await showRouteDetail(route);
    } catch (error){
        console.error(error);
        showMessage("Failed to load route details", "error");
    }
});

async function showRouteDetail(data) {
    console.log("DATA ROUTE:", data);
     if (tableStop) {
        tableStop.destroy();
        $("#route_detail_table").empty();
    }
    const stop = await getStop();
    const route_data = data.map(r => {
        const stops = stop.filter(s => s.STOP_ID === r.STOPNO);
        return { ...r, stops: stops };
    });

    // ✅ sort ตาม WORKDAY_TIMEIN น้อย → มาก
    route_data.sort((a, b) => {
        const t1 = a.stops?.[0]?.WORKDAY_TIMEIN || "9999";
        const t2 = b.stops?.[0]?.WORKDAY_TIMEIN || "9999";
        return parseInt(t1) - parseInt(t2);
    });

    console.log("ROUTE DATA WITH STOPS:", route_data);
    const tale_stop = await routeOptions(route_data);
    tableStop = await createTable(tale_stop, {id: "#route_detail_table"});
}

async function routeOptions(data) {
    const opt = {...tableOption};
    opt.data = data ;
    opt.ordering = false;
    opt.columns =  [
                    { data: "stops", title: "จุดรถ", render: (data)=> data[0]?.STOP_NAME || "-" },
                    {
                        data: "stops",
                        title: "ขารถ",
                        render: (data) => {
                            const status = data?.[0]?.STOP_STATUS;
                            if (status === "1" || status === 1) return "ขาไป";
                            if (status === "2" || status === 2) return "ขากลับ";
                            return "-";
                        }
                    },
                    { data: "stops",  title: "กะปกติ",  render: (data) => formatTime4Digit(data?.[0]?.WORKDAY_TIMEIN)},
                    { data: "stops", title: "กะกลางคืน", render: (data)=> formatTime4Digit(data?.[0]?.NIGHT_TIMEIN)},
                    { data: "stops", title: "วันหยุด", render: (data)=> formatTime4Digit(data?.[0]?.HOLIDAY_TIMEIN)},
                ];
            opt.createdRow = function( row, data ) {
               $(row).addClass('stop-row');
            }
    return opt;
}

$(document).on("click", "#btnSaveLine", function () {
    const lineId = $("#hdLineId").val();
    const lineName = $("#txtLineName").val().trim();
    const seat = $("#ddlSeat").val();
    const busType = $("input[name='busType']:checked").val();

    if (!lineName) {
        showMessage("กรุณากรอกชื่อสายรถ", "warning");
        return;
    }

    if (!seat) {
        showMessage("กรุณาเลือกจำนวนที่นั่ง", "warning");
        return;
    }

    if (lineId) {
        console.log("UPDATE MODE:", {lineId,lineName,busType,seat});
        // 🔥 ยิง API update
    } else {
        console.log("ADD MODE:", {lineName,busType,seat});
        // 🔥 ยิง API add
    }
});

$(document).on("click", "#btnSaveStop", function () {
    const busLine = $("#hdBusId").val();
    const stopName = $("#txtStopName").val().trim();
    const workdayTime = buildTime("workdayHour", "workdayMin");
    if (!busLine) {
        showMessage("กรุณาเลือกสายรถ", "warning");
        return;
    }

    if (!stopName) {
        showMessage("กรุณากรอกชื่อจุดรถ", "warning");
        return;
    }

    // 🔹 เช็คเวลากะปกติ
    if (!workdayTime) {
        showMessage("กรุณาเลือกเวลากะปกติให้ครบ (ชั่วโมงและนาที)", "warning");
        return;
    }

    console.log("READY TO SAVE STOP:", { busLine, stopName, workdayTime });
    // ตรงนี้ค่อยยิง API save
});






function formatTime4Digit(value) {
    if (!value) return "-";
    const str = value.toString().padStart(4, "0");
    return str.slice(0, 2) + ":" + str.slice(2, 4);
}


function buildTime(hourId, minId) {
    const h = $("#" + hourId).val();
    const m = $("#" + minId).val();
    if (!h || !m) return null;
    return h + m;   // เช่น 0730
}

function generateTimeDropdown(hourId, minId) {
    const hourSelect = $("#" + hourId);
    const minSelect = $("#" + minId);
    hourSelect.empty();
    minSelect.empty();
    hourSelect.append(`<option value="">HH</option>`);
    minSelect.append(`<option value="">MM</option>`);
    for (let h = 0; h < 24; h++) {
        const val = h.toString().padStart(2, "0");
        hourSelect.append(`<option value="${val}">${val}</option>`);
    }

    for (let m = 0; m < 60; m++) {
        const val = m.toString().padStart(2, "0");
        minSelect.append(`<option value="${val}">${val}</option>`);
    }
}

$(document).on("click", ".btn-edit-line", function (e) {
    e.stopPropagation(); // กันไม่ให้ trigger click แถว

    const busId = $(this).data("id");
    const rowData = tableLine.rows().data().toArray().find(r => r.BUSID == busId);

    console.log("EDIT:", rowData);
    $("#txtLineName").val(rowData.BUSNAME);
    $("input[name='busType'][value='" + rowData.BUSTYPE + "']").prop("checked", true);
    $("#ddlSeat").val(rowData.BUSSEAT);
    document.getElementById("line_modal").showModal();
});

$(document).on("click", ".btn-delete-line", async function (e) {
    //e.stopPropagation();
    const busId = $(this).data("id");
    const isConfirm = await showConfirm({
            title: "ยืนยันการลบ",
            message: "ต้องการลบสายรถนี้หรือไม่?",
            acceptText: "ยืนยัน",
            cancelText: "ยกเลิก"
        });

        if (!isConfirm) {
            console.log("user canceled delete");
            return;
        }

    console.log("DELETE BUSID:", busId);
    // ตรงนี้ค่อยยิง API delete
});
