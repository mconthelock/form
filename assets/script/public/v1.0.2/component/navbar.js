import { host } from "../jFuntion";


$(document).on('click', '#navbarToggle', function () {
    $('#sidebar').removeClass('collapsed-hover collapsed');
});

export function initNavbar(options = {}){
    const opt = {
        icon: `${host}/assets/images/${process.env.APP_ICON}`, // จะไปตั้งใน env ก็ได้ถ้า path ตรง ถ้าไม่ก็ส่ง path ที่ถูกต้องมาเลยเช่น `${host}/assets/images/icon.png`,
        showIcon: true,
        programName: process.env.APP_NAME,
        toggleId: 'my-drawer-2',
        ...options
    }
    
    const navbar = `
        <div class="navbar bg-base-100 md:hidden shadow-xl fixed top-0 z-50 h-16 W-lvw">
            <div class="navbar-start">
                <label for="${opt.toggleId}" class="btn btn-ghost btn-circle drawer-button" id="navbarToggle">
                    <!--- <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg> --->
                    <i class="icofont-navigation-menu text-xl"></i>
                </label>
                <div class="flex items-center">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle bg-gray-50 w-12 h-12 ${opt.showIcon ? '' : 'hidden'}">
                        <img src="${opt.icon}" alt="" srcset="">
                    </div>
                    <div class="ms-2 w-max">
                        <h1 class="text-2xl font-bold">${opt.programName}</h1>
                    </div>
                </div>
            </div>
            <div class="navbar-end">
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
    $('#navbar').replaceWith(navbar);
}