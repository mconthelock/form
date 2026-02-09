import { showLoader } from "@amec/webasset/preloader";
import { showMessage } from "@amec/webasset/utils";
import { getLine, getRoute, getStop }  from "./data.js";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption} from "../../utils.js";

var tableLine;
var tableStop;
$(document).ready(async function () {
    await initApp({ submenu: ".nav-bus" });
    //console.log("BUS ROUTES VER.1");

    const data_line = await getLine();
    //console.log(data_routes);
    const tale_line = await lineOptions(data_line);
    tableLine = await createTable(tale_line, {id: "#line_table"});
    console.log("TABLE LINE:", tableLine);
    // showBusline();

    const data = tableLine.row($(this)).data();
    console.log(data);
        
    const route = await getRoute({ BUSLINE: 1 });
    const detail = await showRouteDetail(route);
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
                    }
                ];
            opt.createdRow = function( row, data ) {
               $(row).addClass('line-row cursor-pointer');
            }
    return opt;
}



$(document).on("click", ".line-row", async function(e){
    e.preventDefault();
    try{
        const data = tableLine.row($(this)).data();
        console.log(data);
        
        const route = await getRoute({ BUSLINE: data.BUSID });
        const detail = await showRouteDetail(route);
    } catch (error){
        console.error(error);
        showMessage("Failed to load route details", "error");
    }
});


async function showRouteDetail(data) {
    console.log("DATA ROUTE:", data);
    const stop = await getStop();
    const route_data = data.map(r => {
        const stops = stop.filter(s => s.STOP_ID === r.STOPNO);
        return { ...r, stops: stops };
    });

    console.log("ROUTE DATA WITH STOPS:", route_data);
    const tale_stop = await routeOptions(route_data);
    tableStop = await createTable(tale_stop, {id: "#route_detail_table"});
}

async function routeOptions(data) {
    const opt = {...tableOption};
    opt.data = data ;
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
               $(row).addClass('line-row');
            }
    return opt;
}


function formatTime4Digit(value) {
    if (!value) return "-";

    const str = value.toString().padStart(4, "0");
    return str.slice(0, 2) + ":" + str.slice(2, 4);
}