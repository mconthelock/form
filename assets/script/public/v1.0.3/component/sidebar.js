import { host } from "../jFuntion";
import "../../../../dist/css/sidebar.min.css";
import "../_tooltip";
import {
  deleteCookie,
  getCookie,
  setCookie,
  getTimeLeft,
  extendSession,
} from "../_jsCookie";

$(document).on("click", "#sidebarToggle", function () {
  // $('#sidebar').toggleClass('collapsed');
  if ($("#sidebar").hasClass("collapsed")) {
    console.log("Action 1: Menu หุบอยู่ แล้วกางออก");
    expandMenu();
    iconMenu();
    $(this).css("display", "none !important");
  } else if ($("#sidebar").hasClass("collapsed-hover")) {
    console.log("Action 2");
    expandMenu();
    iconMenu();
    $(this).css("display", "flex !important");
  } else {
    console.log("Action 3: Menu กางอยู่ แล้วหุบไป");
    collapsedMenu();
    iconMenu();
  }
});

$(document).on("mouseover", "#sidebar #menu, #sidebar #profile", function () {
  if ($("#sidebar").hasClass("collapsed")) {
    $("#sidebarToggle").html(
      `<svg xmlns="http://www.w3.org/2000/svg" class="w-[20px] h-[20px] fill-white" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="M7.535,17.9,1.707,23.707.293,22.293l5.828-5.809Zm6.3,2.765a7.478,7.478,0,0,0,1.942-7.146l-.312-1.276,3.62-3.64.57.571a2.578,2.578,0,0,0,3.293.346,2.5,2.5,0,0,0,.318-3.805L18.344.788A2.581,2.581,0,0,0,15.051.442a2.5,2.5,0,0,0-.319,3.806l.647.646-3.621,3.64L10.49,8.223a7.479,7.479,0,0,0-7.154,1.941l-.353.354,10.5,10.5Z"/></svg>`
    );
    $("#sidebarToggle").attr("data-html", "Keep menu open");
    $("#sidebarToggle").toggleClass("md:flex!");
    $("#sidebar").removeClass("collapsed").addClass("collapsed-hover");
    $(".list-disc").removeClass("hidden");
  }
});

$(document).on("mouseleave", "#sidebar", function () {
  if ($("#sidebar").hasClass("collapsed-hover")) {
    iconMenu();
    collapsedMenu();
    $("#sidebarToggle").removeClass("md:flex!");
  }
});

function iconMenu() {
  if ($("#sidebar").hasClass("collapsed")) {
    //Menu หุบอยู่
    $("#sidebarToggle").html(
      `<svg xmlns="http://www.w3.org/2000/svg" class="w-[28px] h-[28px] fill-white" id="arrow-circle-down" viewBox="0 0 24 24"><path d="M0,12A12,12,0,1,0,12,0,12.013,12.013,0,0,0,0,12Zm17.414-1.414a2,2,0,0,1,0,2.828l-4.243,4.243-1.414-1.414L15,13H6V11h9L11.757,7.757l1.414-1.414Z"/></svg>`
    );
    $("#sidebarToggle").removeClass("md:flex!");
  } else {
    $("#sidebarToggle").html(
      `<svg xmlns="http://www.w3.org/2000/svg" class="w-[28px] h-[28px] fill-white" id="arrow-circle-down" viewBox="0 0 24 24"><path d="M24,12A12,12,0,1,0,12,24,12.013,12.013,0,0,0,24,12ZM9.465,17.707,5.879,14.121h0a3,3,0,0,1,0-4.243L9.465,6.293l.025-.024a1,1,0,1,1,1.389,1.438L7.586,11,18,10.993a1,1,0,0,1,0,2L7.587,13l3.292,3.293a1,1,0,1,1-1.414,1.414Z"/></svg>`
    );
    $("#sidebarToggle").addClass("md:flex!");
  }
}

function expandMenu() {
  $("#sidebar").removeClass("collapsed-hover collapsed");
  $("#sidebarToggle").attr("data-html", "Collapse menu");
  $(".list-disc").removeClass("hidden");
  localStorage.setItem("pin", true);
}

function collapsedMenu() {
  $("#sidebarToggle").attr("data-html", "Expand menu");
  $("#sidebar").removeClass("collapsed-hover").addClass("collapsed");
  $(".list-disc").addClass("hidden");
  localStorage.setItem("pin", false);
}

export function initSidebar(options = {}) {
  const sidebarPin = localStorage.getItem("pin");
  const pin = sidebarPin == "true" ? "" : "collapsed";
  const opt = {
    icon: `${host}/assets/images/${process.env.APP_ICON}`,
    iconLogo: `${host}/assets/images/${process.env.APP_ICON}`,
    showIcon: true,
    showProgramName: true,
    showLogo: false,
    programName: process.env.APP_NAME,
    sidebarClass: "bg-primary",
    toggleId: "my-drawer-2",
    ...options,
  };

  const sidebar = `<label for="${
    opt.toggleId
  }" aria-label="close sidebar" class="drawer-overlay"></label>
  <div id="sidebar" class="menu text-base-100 text-base pt-1 ${
    opt.sidebarClass
  } ${pin}">
    <div class="flex w-full items-center sidebar-head p-2 gap-3">
        <div tabindex="0" role="button" class="sidebar-logo btn btn-ghost btn-circle hover:bg-transparent! hover:border-none! w-12! h-12! ${
          opt.showIcon ? "" : "hidden"
        }"><img src="${opt.icon}">
        </div>
        <span class="text-white text-lg font-bold sidebar-title ${
          opt.showProgramName ? "" : "hidden"
        }">${opt.programName}</span>

        <a href="#" class="flex-1 sidebar-logo w-12 h-12 ${
          opt.showLogo ? "" : "hidden"
        }">
            <img src="${opt.icon}" class="sidebar-logo-full">
            <img src="${opt.iconLogo}" class="sidebar-logo-mini">
        </a>
        <button id="sidebarToggle" class="ml-auto btn btn-circle btn-ghost tooltip tooltip-bottom  hover:bg-transparent hidden md:flex!" data-html="Collapse menu"></button>
         <label for="my-drawer-2" aria-label="close sidebar" class="ml-auto btn btn-circle btn-ghost w-12! h-12! tooltip tooltip-bottom  hover:bg-transparent flex md:hidden!" data-html="Collapse menu"><svg xmlns="http://www.w3.org/2000/svg" class="w-[28px] h-[28px] fill-white" id="arrow-circle-down" viewBox="0 0 24 24"><path d="M24,12A12,12,0,1,0,12,24,12.013,12.013,0,0,0,24,12ZM9.465,17.707,5.879,14.121h0a3,3,0,0,1,0-4.243L9.465,6.293l.025-.024a1,1,0,1,1,1.389,1.438L7.586,11,18,10.993a1,1,0,0,1,0,2L7.587,13l3.292,3.293a1,1,0,1,1-1.414,1.414Z"/></svg></label>
    </div>
    <div id="menu" class="pt-4 flex flex-col gap-3"></div>
    <div id="profile" class="mt-auto"></div>
</div>`;
  $("#sidebar").replaceWith(sidebar);
  iconMenu();
  $("body").append(timeOutLayout());
}

/**
 * set sidebar menu and profile
 * @param {object} menu
 * @param {object} info
 */
export async function setSidebarMenu(menu, info) {
  let listMenu = "";
  // sidebar menu
  if (menu.length > 0) {
    menu.forEach((m) => {
      if (m.submenu) {
        listMenu += `<li class="mainmenu ${m.menu_class} px-4">
            <details>
                <summary class="font-semibold text-base">
                    <span class="text-2xl">${m.menu_icon || ""}</span>
                    <span class='sidebar-text'>${m.menu_name}</span>
                </summary>
                <ul class="text-sm list-disc">`;
        m.submenu.forEach((sub) => {
          listMenu += `<li class="${sub.menu_class}"><a href="${host}/${
            sub.menu_link
          }" class="menu-name"> <span class="text-2xl">${
            sub.menu_icon || ""
          }</span><span class='sidebar-text'>${sub.menu_name}</span></a></li>`;
        });
        listMenu += `</ul>
            </details>
        </li>`;
      } else {
        listMenu += `<li class="${m.menu_class} px-4">
            <a href="${host}/${m.menu_link}" class="sidebar-link">
                <span class="text-2xl">${m.menu_icon || ""}</span>
                <span class="font-semibold menu-name sidebar-text">${
                  m.menu_name
                }</span>
            </a>
        </li>`;
      }
    });
    $("#menu").html(listMenu);
  }

  if (info) {
    const fullname = info.SNAME.split(" ");
    const name = fullname[0];
    const profileImg = info.image
      ? info.image
      : `${process.env.APP_IMG}/avatar.png`;

    // sidebar profile
    $("#profile").html(`
        <div class="divider my-1" style="--divider-color: #fff !important"></div>
            <li class="">
                <div class="flex sidebar-profile">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar avatar-online">
                        <div class="w-10 rounded-full">
                            <img alt="${info.SNAME}" src="${profileImg}" />
                        </div>
                    </div>
                    <div class="block sidebar-text">
                        <div class="text-md font-bold">${name}</div>
                        <div class="text-xs">${info.SSEC}</div>
                    </div>
                    <div class="ms-auto flex sidebar-profile-menu">
                        <a tabindex="1" role="button" class="btn btn-ghost btn-circle hover:bg-transparent" href="${host}/docs" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" class="w-[24px] h-[24px] fill-white">
                                <path d="m17.5,11c-3.584,0-6.5,2.916-6.5,6.5s2.916,6.5,6.5,6.5,6.5-2.916,6.5-6.5-2.916-6.5-6.5-6.5Zm0,12c-3.033,0-5.5-2.467-5.5-5.5s2.467-5.5,5.5-5.5,5.5,2.467,5.5,5.5-2.467,5.5-5.5,5.5Zm-7,0H3.5c-1.378,0-2.5-1.122-2.5-2.5s1.122-2.5,2.5-2.5h5c.276,0,.5-.224.5-.5s-.224-.5-.5-.5h-3.5V1h10.5c1.93,0,3.5,1.57,3.5,3.5v4c0,.276.224.5.5.5s.5-.224.5-.5v-4c0-2.481-2.019-4.5-4.5-4.5H4.5C2.019,0,0,2.019,0,4.5v16c0,1.93,1.57,3.5,3.5,3.5h7c.276,0,.5-.224.5-.5s-.224-.5-.5-.5ZM1,4.5c0-1.758,1.308-3.204,3-3.449v15.949h-.5c-.98,0-1.864.407-2.5,1.058V4.5Zm17,13v3c0,.276-.224.5-.5.5s-.5-.224-.5-.5v-3c0-.276.224-.5.5-.5s.5.224.5.5Zm.5-2.5c0,.552-.448,1-1,1s-1-.448-1-1,.448-1,1-1,1,.448,1,1Z"/>
                            </svg>
                        </a>
                        <a tabindex="1" role="button" class="logout btn btn-ghost btn-circle hover:bg-transparent" href="#" >
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" class="w-[24px] h-[24px] fill-white">
                                <g>
                                    <path d="M170.698,448H72.757c-4.814-0.012-8.714-3.911-8.725-8.725V72.725c0.012-4.814,3.911-8.714,8.725-8.725h97.941   c17.673,0,32-14.327,32-32s-14.327-32-32-32H72.757C32.611,0.047,0.079,32.58,0.032,72.725v366.549   C0.079,479.42,32.611,511.953,72.757,512h97.941c17.673,0,32-14.327,32-32S188.371,448,170.698,448z"/>
                                    <path d="M483.914,188.117l-82.816-82.752c-12.501-12.495-32.764-12.49-45.259,0.011s-12.49,32.764,0.011,45.259l72.789,72.768   L138.698,224c-17.673,0-32,14.327-32,32s14.327,32,32,32l0,0l291.115-0.533l-73.963,73.963   c-12.042,12.936-11.317,33.184,1.618,45.226c12.295,11.445,31.346,11.436,43.63-0.021l82.752-82.752   c37.491-37.49,37.491-98.274,0.001-135.764c0,0-0.001-0.001-0.001-0.001L483.914,188.117z"/>
                                </g>
                            </svg>
                        </a>
                    </div>
                </div>
            </li>
        `);
    // navbar profile
    $("#nav-profile").html(`<img alt="${info.SNAME}" src="${profileImg}" />`);
  }
  menuFocus();
}

export function menuFocus() {
  if ($("body").attr("menuTitle")) {
    const title = $("body").attr("menuTitle");
    const menu = $(`.${title}`);
    const detail = menu.closest("details");
    detail.attr("open", true);
    // console.log(title, menu);
    menu.find("a").addClass("menu-focus");
  }
}

export function timeOutLayout() {
  return `<input type="checkbox" id="handleTimeout" class="modal-toggle" />
    <div class="modal" role="dialog">
        <div class="modal-box">
            <h3 class="text-lg font-extrabold text-red-500"><i class="fi fi-rr-session-timeout text-2xl"></i>Time Out!!
            </h3>
            <div id="handleErrorBox_msg" class="py-4">
                <h1 class="pb-3 ">Your session had already expired, Would you like to stay on our system?
                </h1>
                <div class="flex gap-3 justify-center">
                    <button class="btn btn-primary text-white" id="extend-cookie">Yes (
                        <div class="countdown font-mono">
                            <span class="" id="timeout-countdown" style="--value:30;" aria-live="polite"
                                aria-label="30"></span>
                        </div>)
                    </button>
                    <button class="btn " id="delete-cookie">No</button>
                </div>
            </div>
        </div>
    </div>`;
}
