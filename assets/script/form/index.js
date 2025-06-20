import ExcelJS from "exceljs";
import {
  tableOption,
  showLoader,
  displayEmpImage,
  displayEmpInfo,
  intVal,
  getfileInPath,
  fillImages,
} from "../utils.js";
import { getformlist } from "../webservice.js";

var table;
$(document).ready(async function () {
  showLoader(true);
  $(".nav-form").find("details").attr("open", true);
  const status = $("#status").val();
  const res = await getformlist({
    id: $("#loginuser").val(),
    type: $("#status").val(),
  });
  table = await createTable(res.data);
  showLoader(false);
});

async function createTable(data) {
  const id = "#table";
  const opt = { ...tableOption };
  opt.data = data;
  opt.pageLength = 20;
  opt.responsive = true;
  opt.order = [[0, "asc"]];
  opt.columns = [
    {
      title: "No.",
      className: "text-center",
      data: null,
      render: (data, type, row, meta) => {
        if (type === "display") {
          return `<div class="text-center">${meta.row + 1}</div>`;
        }
        return meta.row + 1;
      },
    },
    {
      data: "CST",
      title: "Status",
      className: "text-center",
      render: (data, type, row) => {
        if (type === "display") {
          const img = [
            `${process.env.APP_IMG}/form/waiting.gif`,
            `${process.env.APP_IMG}/form/waiting.gif`,
            `${process.env.APP_IMG}/form/approve.gif`,
            `${process.env.APP_IMG}/form/reject.gif`,
          ];
          /*  const status = data.split(" ");
            const statusText = status[0];
            const statusColor = status[1];
            return `<span class="badge ${statusColor}">${statusText}</span>`;*/
          return `<img src="${img[data]}" class="w-8 h-8" />`;
        }
        return data;
      },
    },
    {
      data: "VANAME",
      title: "Form No.",
      render: (data, type, row) => {
        const formno = `${data}${row.CYEAR2.slice(-2)}-${(
          "000000" + row.NRUNNO
        ).slice(-6)}`;
        if (type === "display") {
          //   return `<a class="link text-primary" href="#">${formno}</a>`;
          const serve = row.VFORMPAGE.startsWith("http")
            ? row.VFORMPAGE.replace("http", "https")
            : `http://webflow.mitsubishielevatorasia.co.th/${row.VFORMPAGE}`;
          const conjunction = serve.includes("?") ? "&" : "?";
          const url = `${serve}${conjunction}no=${row.NFRMNO}&orgNo=${row.VORGNO}&y=${row.CYEAR}&y2=${row.CYEAR2}&runNo=${row.NRUNNO}&empno=${row.VREQNO}`;
          if (row.VFORMPAGE.startsWith("http")) {
            //amecweb
            return `<a class="link link-self text-primary" href="#" data-url="${url}">${formno}</a>`;
          } else {
            //Webflow
            return `<a class="link text-primary" href="${url}" target="_blank">${formno}</a>`;
          }
        }
        return data;
      },
    },
    { data: "VNAME", title: "Detail" },
    {
      data: "VREQNO",
      title: "Request By",
      className: "text-start",
      render: (data, type, row) => {
        if (type === "display") {
          const value = row.VREQNAME.replace("  ", " ");
          const name = value.split(" ")[0];
          const fname =
            name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          const lname = value.split(" ")[1].substring(0, 1);
          return `<div class="flex items-center">
                        <div class="avatar border-0">
                            <div class="w-10 rounded-full border border-slate-300 shadow-md">
                                <img src="" id="req-${row.NFRMNO}-${row.VORGNO}-${row.CYEAR}-${row.CYEAR2}-${row.NRUNNO}" class="hidden" />
                                <div class="skeleton h-32 w-32"></div>
                            </div>
                        </div>
                        <div class="ml-2">
                            <div>${fname} ${lname}. (${row.VREQNO})</div>
                            <div class="text-xs text-gray-500" id="reqorg-${row.NFRMNO}-${row.VORGNO}-${row.CYEAR}-${row.CYEAR2}-${row.NRUNNO}"></div>
                        </div>
                </div>`;
        }
        return `${data}-${row.VREQNAME}`;
      },
    },
    {
      data: "VINPUTNAME",
      title: "Input By",
      className: "text-start",
      render: (data, type, row) => {
        if (type === "display") {
          const value = data.replace("  ", " ");
          const name = value.split(" ")[0];
          const fname =
            name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          const lname = value.split(" ")[1].substring(0, 1);
          return `<div class="flex items-center">
                        <div class="avatar border-0">
                            <div class="w-10 rounded-full border border-slate-300 shadow-md">
                                <img src="" id="input-${row.NFRMNO}-${row.VORGNO}-${row.CYEAR}-${row.CYEAR2}-${row.NRUNNO}" class="hidden" />
                                <div class="skeleton h-32 w-32"></div>
                            </div>
                        </div>
                        <div class="ml-2">
                            <div>${fname} ${lname}. (${row.VINPUTER})</div>
                            <div class="text-xs text-gray-500" id="inputorg-${row.NFRMNO}-${row.VORGNO}-${row.CYEAR}-${row.CYEAR2}-${row.NRUNNO}"></div>
                        </div>
                </div>`;
        }
        return data;
      },
    },
    {
      data: "DREQDATE",
      title: "Request Date",
      className: "text-start",
      render: (data, type, row) => {
        if (type === "display") {
          if (data == null || data == undefined) {
            return "";
          }
          return `<div class="text-center text-nowrap">${data} ${row.CREQTIME.substring(
            0,
            5
          )}</div>`;
        }
        return data == null ? "" : `${data} ${row.CREQTIME.substring(0, 5)}`;
      },
    },
    {
      data: "PREV_APVDATE",
      title: "Latest Approved",
      className: "text-start",
      render: (data, type, row) => {
        if (type === "display") {
          if (data == null || data == undefined) {
            return "";
          }
          return `<div class="text-center text-nowrap">${data} ${row.PREV_APVTIME.substring(
            0,
            5
          )}</div>`;
        }
        return data == null
          ? ""
          : `${data} ${row.PREV_APVTIME.substring(0, 5)}`;
      },
    },
  ];
  opt.createdRow = async function (row, data) {
    await fillOrg(row, data);
    await fillImgs(row, data);
  };
  return new DataTable(id, opt);
}

// Responsive table
$(document).on(
  "click",
  "#table tbody tr td.dtr-control:not(.dt-hasChild)",
  async function (e) {
    const rows = table.row($(this).closest("tr"));
    if (rows.child.isShown()) {
      const row = $(this).closest("tr").next();
      const data = rows.data();
      await fillImgs(row, data);
    }
  }
);

async function fillImgs(row, data) {
  const obj1 = $(row).find(
    `#input-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}`
  );
  //const element = $(row).find(obj1);
  const img = await displayEmpImage(data.VINPUTER);
  obj1.attr("src", img);
  obj1.removeClass("hidden");

  const obj2 = $(row).find(
    `#req-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}`
  );
  //const element2 = $(row).find(obj2);
  const img2 = await displayEmpImage(data.VREQNO);
  obj2.attr("src", img2);
  obj2.removeClass("hidden");
}

async function fillOrg(row, data) {
  const obj1 = $(row).find(
    `#inputorg-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}`
  );
  const info = await displayEmpInfo(data.VINPUTER);
  obj1.html(`${info.SDIV}-${info.SDEPT}-${info.SSEC}`);

  const obj2 = $(row).find(
    `#reqorg-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}`
  );
  const info2 = await displayEmpInfo(data.VREQNO);
  obj2.html(`${info2.SDIV}-${info2.SDEPT}-${info2.SSEC}`);
}

$(document).on("click", "#table a.link-self", async function (e) {
  e.preventDefault();
  const url = $(this).attr("data-url");
  window.location.href = `${
    process.env.APP_ENV
  }/webform/form/detail?data=${encodeURIComponent(url)}`;
});
