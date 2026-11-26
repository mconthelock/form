import jsSHA from 'jssha';
import { initAuthen, sessionTimeOut, clearAuth } from '@amec/webasset/authen';
import { getConfig } from '@amec/webasset/config';
import { decryptText } from '@amec/webasset/crypto';
import {
    getMenu,
    getGroup,
    deleteMenu,
    deleteGroup,
    displayEmpInfo,
} from '@amec/webasset/indexDB';
import { getCookie, setCookie, getTimeLeft } from '@amec/webasset/jsCookie';
import { initNavbar } from '@amec/webasset/navbar';
import { showbgLoader } from '@amec/webasset/preloader';
import {
    initSidebar,
    setSidebarMenu,
    expandMenu,
} from '@amec/webasset/sidebar';
import { root } from '@amec/webasset/utils';

export const host = $('meta[name=base_url]').attr('content');
export const uri = $('meta[name=base_uri]').attr('content');

const SIDEBAR_CACHE_KEY = 'amec_sidebar_html';

const saveSidebarSnapshot = () => {
    try {
        const sb = document.getElementById('sidebar');
        if (sb && sb.querySelector('#sidebar-menu')) {
            sessionStorage.setItem(SIDEBAR_CACHE_KEY, sb.outerHTML);
        }
    } catch {
        // Ignore storage quota or private mode errors
    }
};

export const clearSidebarSnapshot = () => {
    try {
        sessionStorage.removeItem(SIDEBAR_CACHE_KEY);
    } catch {
        // Ignore storage errors
    }
};

const clearCachedAuth = async (id) => {
    clearSidebarSnapshot();
    if (!id) return;
    await Promise.all([deleteGroup(id), deleteMenu(id)]).catch(() => {});
};

const initFromCache = async (opt) => {
    const { APP_NAME, APP_ID, TIMEOUT } = getConfig();
    const cookie = getCookie(APP_NAME);
    if (!cookie) {
        const lastEmpno = localStorage.getItem('amecUserLogin');
        await clearCachedAuth(lastEmpno ? `${APP_ID}-${lastEmpno}` : null);
        window.location.href = `${root}/form/authen/index/${APP_ID}`;
        return false;
    }

    setCookie(APP_NAME, cookie, TIMEOUT || 30);
    const indexedDBID = decryptText(cookie, APP_NAME);
    const [appid, empno] = indexedDBID.split('-');

    const [cachedMenu, cachedGroup] = await Promise.all([
        getMenu(indexedDBID),
        getGroup(indexedDBID),
    ]);
    if (!cachedMenu?.data || !cachedGroup?.data) {
        return null;
    }

    const info = await displayEmpInfo(empno);
    if (!info) {
        return null;
    }

    const menu = cachedMenu.data;
    const group = cachedGroup.data;

    localStorage.setItem('amecUserLogin', empno);
    if ($('#user-login').length === 0) {
        $('body').prepend('<div id="user-login"></div>');
    }
    $('#user-login')
        .attr('empno', empno)
        .attr('empname', info.SNAME)
        .attr('appid', appid)
        .attr('groupcode', group.GROUP_CODE)
        .attr('program', indexedDBID);

    if (opt.navbar !== false) {
        initNavbar(opt);
    }
    if (opt.sidebar !== false) {
        initSidebar(opt);
        await setSidebarMenu(menu, info, opt.lang || 'en');
        saveSidebarSnapshot();
    }
    showbgLoader({ show: false });

    const pin = localStorage.getItem('pin');
    if (pin === undefined || pin === null) {
        expandMenu();
    }

    $(document)
        .off('click.webformAuth', '#delete-cookie')
        .on('click.webformAuth', '#delete-cookie', async function (e) {
            e.preventDefault();
            clearSidebarSnapshot();
            await clearAuth(indexedDBID);
        });

    $(document)
        .off('click.webformAuth', '.logout')
        .on('click.webformAuth', '.logout', async function (e) {
            e.preventDefault();
            clearSidebarSnapshot();
            await clearAuth(indexedDBID);
            localStorage.removeItem('amecUserLogin');
        });

    if (!window.__APP_SESSION_WATCHER__) {
        window.__APP_SESSION_WATCHER__ = setInterval(async () => {
            const ck = await getCookie(APP_NAME);
            if (!ck) {
                await clearCachedAuth(indexedDBID);
                window.location.reload();
                return;
            }
            const timeLeft = await getTimeLeft(APP_NAME);
            if (timeLeft > 0 && timeLeft <= 0.5 * 60 * 1000) {
                sessionTimeOut();
            }
        }, 1000 * 5);
    }

    return true;
};

export const initApp = async (opt = {}) => {
    if (window.__APP_INIT_PROMISE__) {
        return window.__APP_INIT_PROMISE__;
    }

    const mergedOpt = {
        icon: `${process.env.APP_ENV}/assets/images/logo_yellow.png`,
        iconLogo: `${process.env.APP_ENV}/assets/images/logo_yellow.png`,
        programName: 'WEBFLOW',
        sidebarClass: `size-xl text-gray-50 bg-primary!`,
        ...opt,
    };

    window.__APP_INIT_PROMISE__ = (async () => {
        try {
            const cached = await initFromCache(mergedOpt);
            if (cached === null) {
                const res = await initAuthen(mergedOpt);
                saveSidebarSnapshot();
                return res;
            }
            return cached;
        } catch (error) {
            window.__APP_INIT_PROMISE__ = null;
            console.error(error);
            return false;
        }
    })();

    return window.__APP_INIT_PROMISE__;
};

export const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    } else if (
        /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
            ua,
        )
    ) {
        return 'mobile';
    }
    return 'desktop';
};

export const tableOption = {
    dom: '<"flex mb-3 items-center"<"flex-1"f><"flex-none flex flex-row gap-2 table-option"l>><"bg-white border border-slate-300 rounded-lg overflow-x-auto my-5"t><"flex flex-col items-center gap-3 mt-5 lg:flex-row"<"flex-1"p><"flex-none flex gap-3 items-center table-foot-option"i>>',
    pageLength: 20,
    lengthMenu: [10, 20, 30, 50, 100],
    autoWidth: false,
    responsive: false,
    destroy: true,
    language: {
        info: '_START_ to _END_ of _TOTAL_ row(s)',
        infoEmpty: '',
        paginate: {
            previous: '<i class="icofont-circled-left"></i>',
            next: '<i class="icofont-circled-right"></i>',
            first: '<i class="icofont-double-left"></i>',
            last: '<i class="icofont-double-right"></i>',
        },
        search: '',
        searchPlaceholder: 'Search record',
        emptyTable:
            '<div class="w-full text-start md:text-center">No records available</div>',
        lengthMenu: '_MENU_',
    },
    columnDefs: [
        {
            targets: 'action',
            searchable: false,
            orderable: false,
        },
    ],
    drawCallback: function (settings) {
        const api = this.api();
        const pagination = $(this).closest('.dt-container').find('.dt-paging');
        if (api.page.info().pages <= 1) {
            pagination.addClass('hidden');
        } else {
            pagination.removeClass('hidden');
        }
    },
    initComplete: function (settings, json) {
        $(this).closest('.tableArea').find('.table-loader').addClass('hidden');
        const container = $(this.api().table().container());
        $('.dt-search').addClass('hidden');
        $('.dt-length').addClass('hidden');
        return { container };
    },
};

export const showConfirm = (
    func,
    title,
    message,
    icon,
    key = '',
    text = false,
) => {
    $('#confirm_accept').addClass(func);
    $('#confirm_accept').attr('data-function', func);
    $('#confirm_title').html(`${icon}${title}`);
    $('#confirm_message').html(message);
    $('#confirm_key').val(key);
    if (text) {
        $('#confirm_reason').removeClass('hidden');
    }
};

//ในกรณีที่ Bypass ไประบบอื่น จะส่งข้อมูลไปยัง Site ปลายทางทาง
//เพื่อ สร้าง  Session ในระบบนั้นรอไว้ แล้วค่อย Redirect ไปยัง Site นั้น
export function sendSession(url, data) {
    return new Promise((resolve) => {
        $.ajax({
            type: 'post',
            url: `${url}/authen/directlogin`,
            dataType: 'json',
            data: data,
            success: function (response) {
                resolve(response);
            },
        });
    });
}

// Binds `input` on `searchSelector` to a multi-token, multi-column DataTables search:
// every whitespace-separated token must match at least one of `columns` (contains match).
export function bindTableColumnSearch(table, searchSelector, columns) {
    $.fn.dataTable.ext.search.push(function (settings, data) {
        if (settings.nTable !== table.table().node()) {
            return true;
        }

        const rawValue = $(searchSelector).val()
            ? $(searchSelector).val().trim().toLowerCase()
            : '';
        if (!rawValue) {
            return true;
        }

        const tokens = rawValue.split(/\s+/).filter(Boolean);
        const values = columns.map((col) =>
            String(data[col] || '').toLowerCase(),
        );

        return tokens.every((token) =>
            values.some((value) => value.includes(token)),
        );
    });

    $(searchSelector).on('input', function () {
        table.draw();
    });
}

export const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') {
        return '0,0,0';
    }
    hex = hex.trim().replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((h) => h + h)
            .join('');
    }
    const bigint = parseInt(hex, 16);
    if (Number.isNaN(bigint)) {
        return '0,0,0';
    }
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255].join(',');
};

export const stampApp = (data) => {
    let recentApp = JSON.parse(localStorage.getItem('recentapp')) || [];
    //if existing and version is not current, remove it
    if (recentApp && recentApp.ver !== process.env.VERSION) {
        recentApp = [];
    }

    const value = recentApp.data || [];
    const existingAppIndex = value.findIndex(
        (app) => app.id == data.id && app.user == $('#login-id').val(),
    );

    if (existingAppIndex !== -1) {
        value[existingAppIndex].updateDate = new Date().toISOString();
    } else {
        value.push(data);
    }
    value.sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate));
    localStorage.setItem(
        'recentapp',
        JSON.stringify({ ver: process.env.VERSION, data: value }),
    );
};

// IndexedDB
export async function generateSchemaHash(schema) {
    // ใช้ SHA-256 ในการสร้าง hash ของ schema รองรับ http
    if (!window.crypto || !window.crypto.subtle) {
        console.log('Web Crypto API not supported in this browser.');
        const schemaString = JSON.stringify(schema);
        const shaObj = new jsSHA('SHA-256', 'TEXT');
        shaObj.update(schemaString);
        return shaObj.getHash('HEX');
    }
    const schemaString = JSON.stringify(schema);
    const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(schemaString),
    );
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    return hashHex;
}

export function setSha256(text) {
    const shaObj = new jsSHA('SHA-256', 'TEXT');
    shaObj.update(text);
    const hash = shaObj.getHash('HEX');
    return hash;
}

export const intVal = function (i) {
    return typeof i === 'string'
        ? i.replace(/[\$,]/g, '') * 1
        : typeof i === 'number'
          ? i
          : 0;
};

export const digits = function (n, digit) {
    var str = '';
    n = intVal(n);
    if (digit > 0) {
        n = n.toFixed(digit);
        str = n.toString().split('.');
        var fstr =
            str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '.' + str[1];
    } else {
        var str = Math.round(n).toString();
        var fstr = str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }
    return fstr;
};

export function tableFillSelect(selector, data, valueKey, labelKey) {
    const element = $(selector);
    element.find('option:not(:first)').remove();
    data.forEach((item) => {
        element.append(
            `<option value="${item[valueKey]}">${item[labelKey]}</option>`,
        );
    });
}

export function getTagColor(tagName) {
    const colors = [
        'border-red-500 text-red-500',
        'border-green-500 text-green-500',
        'border-blue-500 text-blue-500',
        'border-purple-500 text-purple-500',
        'border-pink-500 text-pink-500',
        'border-orange-500 text-orange-500',
    ];

    let hash = 0;
    // เอาตัวอักษรแต่ละตัวมาแปลงเป็นรหัสตัวเลขแล้วบวกทบกันไปเรื่อยๆ
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // เอาผลลัพธ์มาหารเอาเศษ เพื่อให้ไม่เกินจำนวนสีที่มีใน Array
    const index = Math.abs(hash) % colors.length;

    return colors[index];
}

export function clientIp() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/auth/check-ip/`,
            type: 'get',
            dataType: 'json',
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, err) {
                console.log(err);
                reject(err);
            },
        });
    });
}
