import "@fancyapps/ui/dist/carousel/carousel.css";
import "@fancyapps/ui/dist/carousel/carousel.autoplay.css";
import { Carousel } from "@fancyapps/ui/dist/carousel/carousel.esm.js";
import { Autoplay } from "@fancyapps/ui/dist/carousel/carousel.autoplay.esm.js";
import jsSHA from "jssha";

import { getNews } from "./webservice";
import { getImage, setImage, getInfo, setInfo } from "./indexDB/employee";

export const host = $("meta[name=base_url]").attr("content");
export const uri = $("meta[name=base_uri]").attr("content");
export const deviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
};

export const tableOption = {
  dom: '<"flex mb-3 items-center"<"flex-1"f><"flex-none flex flex-row gap-2 table-option"l>><"bg-white border border-slate-300 rounded-lg overflow-x-auto my-5"t><"flex flex-col items-center gap-3 mt-5 lg:flex-row"<"flex-1"p><"flex-none flex gap-3 items-center table-foot-option"i>>',
  pageLength: 20,
  lengthMenu: [10, 20, 30, 50, 100],
  autoWidth: false,
  responsive: true,
  destroy: true,
  language: {
    info: "_START_ to _END_ of _TOTAL_ row(s)",
    infoEmpty: "",
    paginate: {
      previous: '<i class="icofont-circled-left"></i>',
      next: '<i class="icofont-circled-right"></i>',
      first: '<i class="icofont-double-left"></i>',
      last: '<i class="icofont-double-right"></i>',
    },
    search: "",
    searchPlaceholder: "Search record",
    emptyTable:
      '<div class="w-full text-start md:text-center">No records available</div>',
    lengthMenu: "_MENU_",
  },
  columnDefs: [
    {
      targets: "action",
      searchable: false,
      orderable: false,
    },
  ],
  drawCallback: function (settings) {
    const api = this.api();
    const pagination = $(this).closest(".dt-container").find(".dt-paging");
    if (api.page.info().pages <= 1) {
      pagination.addClass("hidden");
    } else {
      pagination.removeClass("hidden");
    }
  },
};

export function showMessage(msg, type = "error") {
  const prop = [
    {
      id: "error",
      bg: "bg-red-800",
      text: "text-white",
      title: "Processing Fail!",
    },
    { id: "success", bg: "bg-green-800", text: "text-white" },
    { id: "info", bg: "bg-blue-800", text: "text-white" },
    { id: "warning", bg: "bg-yellow-800", text: "text-white" },
  ];

  const dt = prop.find((x) => x.id == type);
  const toast = `<div class="toast toast-end z-50 alert-message w-80 max-w-80 transition-all duration-1000">
          <div class="alert flex flex-col gap-2 overflow-hidden relative ${dt.bg}">
              <div class="msg-title text-xl font-semibold block w-full text-left ${dt.text}">${dt.title}</div>
              <div class="msg-txt block w-full text-left max-w-80 text-wrap ${dt.text}">${msg}</div>
              <div class="msg-close absolute top-2 right-5 z-10">
                  <i class="icofont-ui-close"></i>
              </div>
              <div class="absolute right-[-30px] top-[-10px] text-[120px] z-0 opacity-20">
                  <i class="icofont-exclamation-circle"></i>
              </div>
          </div>
      </div>
  </div>
    `;
  $(document.body).append(toast);
  setTimeout(() => {
    $(".msg-close").click();
  }, 1000);
}

export const showLoader = (val) => {
  $("#loading-box").prop("checked", val);
};

export const showConfirm = (
  func,
  title,
  message,
  icon,
  key = "",
  text = false
) => {
  $("#confirm_accept").addClass(func);
  $("#confirm_accept").attr("data-function", func);
  $("#confirm_title").html(`${icon}${title}`);
  $("#confirm_message").html(message);
  $("#confirm_key").val(key);
  if (text) {
    $("#confirm_reason").removeClass("hidden");
  }
};

export function sendSession(url, data) {
  //ในกรณีที่ Bypass ไประบบอื่น จะส่งข้อมูลไปยัง Site ปลายทางทาง
  //เพื่อ สร้าง  Session ในระบบนั้นรอไว้ แล้วค่อย Redirect ไปยัง Site นั้น
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${url}/authen/directlogin`,
      dataType: "json",
      data: data,
      success: function (response) {
        resolve(response);
      },
    });
  });
}

export const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((h) => h + h)
      .join("");
  }
  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255].join(",");
};

export const stampApp = (data) => {
  let recentApp = JSON.parse(localStorage.getItem("recentapp")) || [];
  //if existing and version is not current, remove it
  if (recentApp && recentApp.ver !== process.env.VERSION) {
    recentApp = [];
  }

  const value = recentApp.data || [];
  const existingAppIndex = value.findIndex(
    (app) => app.id == data.id && app.user == $("#login-id").val()
  );

  if (existingAppIndex !== -1) {
    value[existingAppIndex].updateDate = new Date().toISOString();
  } else {
    value.push(data);
  }
  value.sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate));
  localStorage.setItem(
    "recentapp",
    JSON.stringify({ ver: process.env.VERSION, data: value })
  );
};

//สร้าง Banner ข่าวสาร
export async function createCarousel(type = "home") {
  const news = await getNews();
  if (news.length == 0) return;

  const obj = $("#news-carousel");
  const url = `https://amecweb.mitsubishielevatorasia.co.th/gpsystem/news/`;
  news.map((el) => {
    const html = type == "home" ? homeCarousel(el) : loginCarousel(el);
    obj.append(html);
  });

  const container = document.getElementById("news-carousel");
  const options = {
    Navigation: false,
    Dots: {
      minCount: 2,
    },
    Autoplay: {
      timeout: 7500,
      showProgress: false,
    },
  };
  new Carousel(container, options, { Autoplay });
  return;
}

const homeCarousel = (el) => {
  return `<div class="f-carousel__slide">
          <img class="w-full h-72 object-cover object-center" src="${url}${
    el.NEWS_IMG
  }" alt="title"/>
          <div
              class="absolute top-0 left-0 w-full h-72 p-10 overflow-hidden flex flex-col items-start justify-end lg:w-2/5 lg:min-w-2/5">
              <div class="bg-white/[0.75] p-3 w-full">
                  <h1 class="text-primary text-lg font-bold mb-3 line-clamp-1">${
                    el.NEWS_TITLE
                  }</h1>
                  <div class="line-clamp-2 mb-3">${el.NEWS_DETAIL.replace(
                    /<\/?[^>]+(>|$)/g,
                    ""
                  )}</div>
                  <a class="btn btn-sm btn-primary">Read More</a>
              </div>
          </div>
      </div>`;
};

const loginCarousel = (el) => {
  return `<div class="f-carousel__slide">
        <img class="w-[100vw] h-[100vh] object-cover" src="${url}${el.NEWS_IMG}" alt="${el.NEWS_TITLE}"/>
    </div>`;
};

// IndexedDB
export async function generateSchemaHash(schema) {
  // ใช้ SHA-256 ในการสร้าง hash ของ schema รองรับ http
  if (!window.crypto || !window.crypto.subtle) {
    console.log("Web Crypto API not supported in this browser.");
    const schemaString = JSON.stringify(schema);
    const shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(schemaString);
    return shaObj.getHash("HEX");
  }
  const schemaString = JSON.stringify(schema);
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(schemaString)
  );
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// ดึงรูปภาพจาก IndexedDB
export async function displayEmpImage(id) {
  const cachedImage = await getImage(id);
  if (cachedImage) {
    return `${cachedImage}`;
  } else {
    // ดึงรูปภาพจาก API
    const response = await fetch(
      `${process.env.APP_API}/webflow/amecusers/images/${id}`
    );
    const data = await response.json();
    const base64Image = data;
    // บันทึกลง IndexedDB
    await setImage(id, base64Image);
    return `${base64Image}`;
  }
}

// ดึงข้อมูลพนักงานจาก IndexedDB
export async function displayEmpInfo(id) {
  const cachedInfo = await getInfo(id);
  if (cachedInfo) {
    return cachedInfo.data;
  } else {
    // ดึงข้อมูลจาก API
    const response = await fetch(
      `${process.env.APP_WEBSERVICE}/webflow/amecusers/users/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, mode: 1 }),
      }
    );
    const data = await response.json();
    await setInfo(id, data[0]);
    return data[0];
  }
}

export function setSha256(text) {
  const shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(text);
  const hash = shaObj.getHash("HEX");
  return hash;
}

export const intVal = function (i) {
  return typeof i === "string"
    ? i.replace(/[\$,]/g, "") * 1
    : typeof i === "number"
    ? i
    : 0;
};

export const digits = function (n, digit) {
  var str = "";
  n = intVal(n);
  if (digit > 0) {
    n = n.toFixed(digit);
    str = n.toString().split(".");
    var fstr = str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "." + str[1];
  } else {
    var str = Math.round(n).toString();
    var fstr = str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }
  return fstr;
};
