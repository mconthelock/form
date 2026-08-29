import jsSHA from 'jssha';
import { initAuthen } from '@amec/webasset/authen';
export const host = $('meta[name=base_url]').attr('content');
export const uri = $('meta[name=base_uri]').attr('content');
export const initApp = async (opt = {}) => {
    try {
        const app = await initAuthen({
            icon: `${process.env.APP_ENV}/assets/images/logo_yellow.png`,
            iconLogo: `${process.env.APP_ENV}/assets/images/logo_yellow.png`,
            programName: 'WEBFLOW',
            sidebarClass: `size-xl text-gray-50 bg-primary!`,
        });

        $('.mainmenu').find('details').attr('open', false);
        if (opt.submenu !== undefined) {
            $(`.mainmenu${opt.submenu}`).find('details').attr('open', true);
        }
        return app;
    } catch (error) {
        console.log(error);
        return false;
    }
    await new Promise((r) => setTimeout(r, 1000));
    return;
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
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((h) => h + h)
            .join('');
    }
    const bigint = parseInt(hex, 16);
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

// ดึงรูปภาพจาก IndexedDB 2025-01-17
// export async function displayEmpImage(id) {
// 	const cachedImage = await getImage(id);
// 	if (cachedImage) {
// 		return `${cachedImage}`;
// 	} else {
// 		// ดึงรูปภาพจาก API
// 		const response = await fetch(
// 			`${process.env.APP_WEBSERVICE}/webflow/amecusers/images/${id}`
// 		);
// 		const data = await response.json();
// 		const base64Image = data;
// 		// บันทึกลง IndexedDB
// 		await setImage(id, base64Image);
// 		return `${base64Image}`;
// 	}
// }

// ดึงข้อมูลพนักงานจาก IndexedDB 2025-01-17
// export async function displayEmpInfo(id) {
// 	const cachedInfo = await getInfo(id);
// 	if (cachedInfo) {
// 		return cachedInfo.data;
// 	} else {
// 		// ดึงข้อมูลจาก API
// 		const response = await fetch(
// 			`${process.env.APP_WEBSERVICE}/webflow/amecusers/users/`,
// 			{
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({ id: id, mode: 1 }),
// 			}
// 		);
// 		const data = await response.json();
// 		await setInfo(id, data[0]);
// 		return data[0];
// 	}
// }

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
