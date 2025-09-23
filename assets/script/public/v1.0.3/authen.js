import moment from "moment";
import { directlogin } from "../../api/auth";
import { showbgLoader } from "./preloader";
import { host, root } from "./jFuntion";
import { decryptText } from "./_crypto";
import {
  getAppDataById,
  getMenu,
  getGroup,
  setMenu,
  setGroup,
  deleteGroup,
  deleteMenu,
} from "../../indexDB/userAuth";
import { setSidebarMenu, initSidebar } from "./component/sidebar";
import {
  deleteCookie,
  getCookie,
  setCookie,
  getTimeLeft,
  extendSession,
} from "./_jsCookie";
import { initNavbar } from "./component/navbar";
/**
 * @version 1.0.3
 * @note 2025-07-25
 * เพิ่มการตรวจสอบ cookie ทุก 5 นาที เปลี่ยนสถานะออนไลน์/ออฟไลน์
 * @note 2025-08-08
 * เพิ่ม option sidebar และ navbar ในการ initAuthen
 */

var indexedDBID, timer, intervalId;
// ต้องมีอัันนี้ใน template
/* <div id="user-login"></div>
    <div id="navbar"></div>
    <div class="drawer md:drawer-open">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content bg-gray-200 shadow-2xl flex flex-col p-5 pb-12 mt-16 md:mt-0 min-h-[calc(100vh-64px)]">
            <div class="content-wrapper">
                @section('content')@show
            </div>
        </div>
        <div class="drawer-side z-20">
            <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
            <div id="sidebar"></div>
        </div>
    </div> */

export async function initAuthen(options = {}) {
  const opt = {
    setSessionPhp: false,
    sidebar: true,
    navbar: true,
    loader: true,
    // จะไปตั้งใน env ก็ได้ถ้า path ตรง ถ้าไม่ก็ส่ง path ที่ถูกต้องมาเลยเช่น `${host}/assets/images/icon.png`,
    icon: `${host}/assets/images/${process.env.APP_ICON}`,
    programName: process.env.APP_NAME,
    ...options,
  };

  
  showbgLoader({ show: opt.loader });
  let menu, info, group, res;
  const cookie = getCookie(process.env.APP_NAME);
  if (!cookie) {
    window.location.href = `${root}/form/authen/index/${process.env.APP_ID}`;
  } else {
    // ถ้ามี cookie ให้ decrypt ค่า cookie และเก็บค่าในตัวแปร indexedDBID
    // setCookie(process.env.APP_NAME, cookie, { expires: 0.5 / 24 }); // Set cookie ทุกครั้งที่โหลดหน้าเว็บ
    setCookie(process.env.APP_NAME, cookie, process.env.TIMEOUT || 30);
    indexedDBID = decryptText(cookie, process.env.APP_NAME);

    const [appid, empno] = indexedDBID.split("-");
    if (!(await getMenu(indexedDBID)) || !(await getGroup(indexedDBID))) {
      //console.log("set indexedDB");
      res = await directlogin(empno, appid);
      group = res.appgroup;
      info = res.appuser;
      menu = res.auth;
      setMenu(indexedDBID, menu);
      setGroup(indexedDBID, group);
    } else {
      //console.log("used indexedDB");
      res = await getAppDataById(indexedDBID);
      menu = res.menu.data;
      info = res.info.data;
      group = res.group.data;
    }

    // กรณีเว็บ set menu และ group ใน PHP จะส่งไปทำงานแบบเดิม
    if (opt.setSessionPhp) {
      const direct = await setSession(res);
      window.location.href = `${host}/${direct.url}`;
    }

    // $('#user-login').prop('empno', info.SEMPNO);
    if ($("#user-login").length == 0)
      $("body").prepend('<div id="user-login"></div>');
    $("#user-login").attr("empno", empno);
    $("#user-login").attr("empname", info.SNAME);
    $("#user-login").attr("appid", appid);
    $("#user-login").attr("program", indexedDBID);

    if (opt.navbar) {
      initNavbar(opt);
    }
    if (opt.sidebar) {
      initSidebar(opt);
      setSidebarMenu(menu, info); // ดึงข้อมูลแอปพลิเคชันตาม ID ที่เก็บไว้ใน indexedDBID
    }
    showbgLoader({ show: false });

    setInterval(async () => {
      const ck = await getCookie(process.env.APP_NAME);
      if (!ck) window.location.reload();
      const timeLeft = await getTimeLeft(process.env.APP_NAME);
      if (timeLeft > 0 && timeLeft <= 0.5 * 60 * 1000) {
        sessionTimeOut();
      }
    }, 1000 * 5);
  }
}

export function sessionTimeOut() {
  $("#handleTimeout").prop("checked", true);
  let count = 30;
  const el = document.getElementById("timeout-countdown");
  el.style.setProperty("--value", count);
  el.setAttribute("aria-label", count);
  extendSession(process.env.APP_NAME, 1);
  if (timer) return;
  timer = setInterval(() => {
    count--;
    el.style.setProperty("--value", count);
    el.setAttribute("aria-label", count);
    el.textContent = count;
    console.log(count, timer);
    if (count <= 0) {
      clearInterval(timer);
      deleteCookie(process.env.APP_NAME);
      window.location.reload();
    }
  }, 1000);
}

$(document).on("click", "#extend-cookie", function (e) {
  e.preventDefault();
  extendSession(process.env.APP_NAME, process.env.TIMEOUT || 30);
  $("#handleTimeout").prop("checked", false);
  clearInterval(timer);
  timer = undefined;
});

$(document).on("click", "#delete-cookie", async function (e) {
  e.preventDefault();
  await deleteGroup(indexedDBID);
  await deleteMenu(indexedDBID);
  deleteCookie(process.env.APP_NAME);
  window.location.href = `${root}/form/authen/index/${process.env.APP_ID}`;
});

$(document).on("click", ".logout", async function (e) {
  e.preventDefault();
  await deleteGroup(indexedDBID);
  await deleteMenu(indexedDBID);
  deleteCookie(process.env.APP_NAME);
  window.location.href = `${root}/form/authen/index/${process.env.APP_ID}`;
});

export function setSession(res) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      dataType: "json",
      url: `${host}/authen/setSession`,
      data: {
        group: res.appgroup,
        info: res.appuser,
        menu: res.auth,
        // group: res.group.data,
        // info: res.info.data,
        // menu: res.menu.data,
      },
      success: function (data) {
        resolve(data);
      },
    });
  });
}
// ตัวอย่างการใช้งาน PHP
// public function setSession(){
//     $_SESSION['user']  = (object)$_POST['info'];
//     $_SESSION['group']  = (object)$_POST['group'];
//     $_SESSION['menu']  = (object)$_POST['menu'];
// 	$_SESSION['profile-img'] = $_POST['info']['image'];
//      if($_SESSION['group'] != null && $_SESSION['group']->GROUP_HOME != null){
//         $redir = $_SESSION['group']->GROUP_HOME;
//     }else{
//         $redir = 'home';
//     }
//     echo json_encode(['url' => $redir]);
// }
