import { host } from "../jFuntion";
import "../../../../dist/css/sidebar.min.css";
import "../_tooltip"

$(document).on('click', '#sidebarToggle', function () {
    // $('#sidebar').toggleClass('collapsed');
    if ($('#sidebar').hasClass('collapsed')) {
        $('#sidebar').removeClass('collapsed');
        $('#sidebarToggle').attr('data-html', 'Collapse menu');
    } else if ($('#sidebar').hasClass('collapsed-hover')) {
        iconMenu();
        $('#sidebar').removeClass('collapsed-hover collapsed');
        $('#sidebarToggle').attr('data-html', 'Collapse menu');
    } else {
        $('#sidebar').addClass('collapsed');
        $('#sidebarToggle').attr('data-html', 'Expand menu');
    }
});



$(document).on('mouseover', '#sidebar #menu, #sidebar #profile', function(){
    if($('#sidebar').hasClass('collapsed')){
        $('#sidebarToggle').html(`<i class="icofont-tack-pin text-xl"></i>`);
        $('#sidebarToggle').attr('data-html', 'Keep menu open');
        $('#sidebar').removeClass('collapsed').addClass('collapsed-hover');
    }
});

$(document).on('mouseleave', '#sidebar', function(){
    if($('#sidebar').hasClass('collapsed-hover')){
        iconMenu();
        $('#sidebarToggle').attr('data-html', 'Expand menu');
        $('#sidebar').removeClass('collapsed-hover').addClass('collapsed');
    }
});

function iconMenu() {
    $('#sidebarToggle').html(`<i class="icofont-navigation-menu text-xl"></i>`);
}

export function initSidebar(options) {
    const sidebar = `
        <div id="sidebar" class="menu transition-all w-full md:w-64 lg:w-80 min-h-full bg-primary text-base-100 text-base pt-1" >
            <div class="flex items-center sidebar-head px-4 py-2 gap-3">
                <div tabindex="0" role="button" class="sidebar-logo btn btn-ghost btn-circle bg-gray-50 w-12 h-12">
                    <img src="${options.icon}" alt="" srcset="">
                </div>
                <span class="text-white text-lg font-bold sidebar-title">${options.programName}</span>
                <!-- Hamburger icon -->
                <button id="sidebarToggle" class="ml-auto btn btn-circle btn-ghost tooltip tooltip-right" data-html="Collapse menu">
                    <!--- <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg> --->
                    <i class="icofont-navigation-menu text-xl"></i>
                </button>
            </div>
            <div id="menu"></div>
            <div id="profile" class="mt-auto"></div>
        </div>
    `
    // $('#sidebar').html(sidebar);
    $('#sidebar').replaceWith(sidebar);
};


/**
 * set sidebar menu and profile
 * @param {object} menu 
 * @param {object} info 
 */
export async function setSidebarMenu(menu, info){
    let listMenu = '';
    // sidebar menu
    if(menu.length > 0){
        menu.forEach(m => {
            if(m.submenu){
                listMenu += `<li class="mainmenu ${m.menu_class} px-6">
                                <details>
                                    <summary class="font-semibold text-base">
                                        <span class="text-2xl">${m.menu_icon}</span>
                                        <span class='sidebar-text'>${m.menu_name}</span>
                                    </summary>
                                    <ul class="text-sm list-disc">`;
                m.submenu.forEach(sub => {
                    listMenu += `<li class="${sub.menu_class}"><a href="${host}}/${sub.menu_link}" class="menu-name sidebar-text">${sub.menu_name}</a></li>`;
                });
                listMenu += `</ul></details></li>`;
            }else{
                listMenu += `<li class="${m.menu_class} px-6">
                                <a href="${host}/${m.menu_link}" class="sidebar-link">
                                    <span class="text-2xl">${m.menu_icon}</span>
                                    <span class="font-semibold menu-name sidebar-text">${m.menu_name}</span>
                                </a>
                            </li>`;
            }
        });
        $('#menu').html(listMenu);
    }

    if (info) {
        const fullname = info.SNAME.split(' ');
        const name = fullname[0];
        const profileImg = info.image ? info.image : `${host}/assets/img/avatar.png`;
        
        // sidebar profile
        $('#profile').html(`
            <li class="">
                <hr>
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
                        <a tabindex="1" role="button" class="btn btn-ghost btn-circle" href="${host}/docs" target="_blank">
                            <i class="icofont-book-alt text-2xl"></i>
                        </a>
                        <a tabindex="1" role="button" class="logout btn btn-ghost btn-circle" href="#" >
                            <i class="icofont-logout text-2xl"></i>
                        </a>
                    </div>
                </div>
            </li>
        `);
        // navbar profile
        $('#nav-profile').html(`<img alt="${info.SNAME}" src="${profileImg}" />`) 
    }
    menuFocus();
}

export function menuFocus(){
    if ($("body").attr("menuTitle")) {
        const title = $("body").attr("menuTitle");
        const menu = $(`.${title}`);
        // console.log(title, menu);
        
        menu.find("a").addClass("menu-focus");
    }
}