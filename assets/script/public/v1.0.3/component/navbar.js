import { host } from "../jFuntion";
import "../../../../dist/css/navbar.min.css";

$(document).on("click", "#navbarToggle", function () {
  $("#sidebar").removeClass("collapsed-hover collapsed");
});

export function initNavbar(options = {}) {
  const opt = {
    icon: `${host}/assets/images/${process.env.APP_ICON}`, // จะไปตั้งใน env ก็ได้ถ้า path ตรง ถ้าไม่ก็ส่ง path ที่ถูกต้องมาเลยเช่น `${host}/assets/images/icon.png`,
    showIcon: true,
    programName: process.env.APP_NAME,
    toggleId: "my-drawer-2",
    ...options,
  };

  const navbar = `
        <div class="shadow-lg md:hidden!" id="navbar">
            <div class="navbar-start">
                <label for="${
                  opt.toggleId
                }" class="btn btn-ghost btn-circle drawer-button" id="navbarToggle">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Bold" viewBox="0 0 24 24" class="w-4 h-4"><path d="M11.832,24a1.5,1.5,0,0,1-1.061-2.561l7.672-7.671a2.5,2.5,0,0,0,0-3.536L10.771,2.561A1.5,1.5,0,0,1,12.893.439l7.671,7.672a5.5,5.5,0,0,1,0,7.778l-7.671,7.672A1.5,1.5,0,0,1,11.832,24Z"/><path d="M2.287,24a1.5,1.5,0,0,1-1.06-2.561l9.085-9.085a.5.5,0,0,0,0-.708L1.227,2.561A1.5,1.5,0,0,1,3.348.439l9.086,9.086a3.507,3.507,0,0,1,0,4.949L3.348,23.561A1.5,1.5,0,0,1,2.287,24Z"/></svg>
                </label>
                <div class="flex items-center">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle bg-gray-50 w-12 h-12 ${
                      opt.showIcon ? "" : "hidden"
                    }">
                        <img src="${opt.icon}" alt="" srcset="">
                    </div>
                    <div class="ms-2 w-max">
                        <h1 class="text-2xl font-bold">${opt.programName}</h1>
                    </div>
                </div>
            </div>

            <div class="navbar-end px-2">
                <div class="flex gap-1">
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar avatar-online">
                            <div class="w-10 rounded-full shadow-lg">
                                <div id="nav-profile"></div>
                            </div>
                        </div>
                        <ul tabindex="0"
                            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-20 mt-4 w-52 p-2 shadow">
                            <li>
                                <a tabindex="1" role="button" href="${host}/docs" target="_blank">
                                    <i class="icofont-book-alt text-2xl"></i>  Manual
                                </a>
                            </li>
                            <li><a href="" class="logout"><i class="icofont-logout text-2xl"></i> Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
  $("#navbar").replaceWith(navbar);
}
