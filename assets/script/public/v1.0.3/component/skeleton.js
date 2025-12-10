/**
 * Skeleton
 * @module _dataTable
 * @description Preloading skeleton for data.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-07-25
 * @requires jQuery npm install jquery
 * @version 1.0.3
 * @note 2025-07-25
 * เพิ่ม middleMenu และ numberOfMiddleMenu เพื่อรองรับเมนูกลาง
 * เพิ่ม middleSize เพื่อรองรับขนาดของเมนูกลาง
 * เพิ่ม searchSize เพื่อรองรับขนาดของช่องค้นหา
 * @note 2025-08-19
 * เพิ่ม skeletons เพื่อให้กำหนดหลายแถว
 * @note 2025-08-20
 * เพิ่ม margin-bottom สำหรับ skeletons
 * เพิ่ม formDetailSkeleton
 * @note 2025-11-04
 * เพิ่ม method remove ใน dataTableSkeleton
 * เรียกใช้งานแบบ const load = dataTableSkeleton();
 * load.remove();
 * @note 2025-11-07
 * แก้ไข skeletons ให้รองรับการสร้าง skeleton แนวนอนภายใน skeleton แนวตั้ง
 */

/**
 * loading data table skeleton
 * ให้ไปสร้าง html ที่มี id ก่อนและนำ id มาอ้างอิงใน opt.idLoading
 * ** update 2025-11-04 เพิ่ม method remove ใน element ที่ return กลับไป และไม่ต้องไปเพิ่มที่ html ใหม่ทุกครั้งที่เรียกใช้
 * @typedef {Object} dataTableSkeleton
 * @property {boolean} [show=true] - แสดงหรือซ่อน skeleton
 * @property {boolean} [button=true] - แสดงหรือซ่อน ปุ่มด้านบนขวา
 * @property {boolean} [search=true] - แสดงหรือซ่อน ช่องค้นหาด้านบนซ้าย
 * @property {boolean} [page=true] - แสดงหรือซ่อน ตัวเลือกหน้าด้านล่างซ้าย
 * @property {boolean} [info=true] - แสดงหรือซ่อน ข้อมูลสถิติด้านล่างขวา
 * @property {boolean} [middleMenu=false] - แสดงหรือซ่อน เมนูกลางด้านบน
 * @property {string} [width="w-full"] - ความกว้างของ skeleton
 * @property {string} [height="h-[80vh]"] - ความสูงของ skeleton
 * @property {string} [idLoading="tableLoading"] - id ของ element ที่จะให้ไปสร้าง skeleton
 * @property {number} [numberOfButtons=1] - จำนวนปุ่มด้านบนขวา
 * @property {number} [numberOfMiddleMenu=1] - จำนวนเมนูกลางด้านบน
 * @property {searchSize} [searchSize={}] - ขนาดของช่องค้นหาด้านบนซ้าย
 * @property {Array<middleSize>} [middleSize=[]] - ขนาดของเมนูกลางด้านบน
 * 
 * @typedef {Object} searchSize
 * @property {string} [width="w-60"] - ความกว้างของช่องค้นหาด้านบนซ้าย
 * @property {string} [height="h-full"] - ความสูงของช่องค้นหาด้านบนซ้าย
 * 
 * @typedef {Object} middleSize
 * @property {string} [width="w-60"] - ความกว้างของเมนูกลางด้านบน
 * @property {string} [height="h-11"] - ความสูงของเมนูกลางด้านบน
 * 
 * @param {dataTableSkeleton} option
 * @returns {JQuery<HTMLElement>} - คืนค่าเป็น jQuery element ที่สร้าง skeleton ขึ้นมา
 * @example
 * dataTableSkeleton({show: false, idLoading: 'tableDetailLoading'}); || dataTableSkeleton();
 * const tableSkeleton = dataTableSkeleton({
 *     idLoading: "#table-master",
 *     numberOfButtons: 4,
 *     searchSize: {height: 'h-8'},
 *     height: 'h-[70vh]',
 * });
 */
export function dataTableSkeleton({
    show = true,
    button = true,
    search = true,
    page = true,
    info = true,
    middleMenu = false,
    width = "w-full",
    height = "h-[80vh]",
    idLoading = "tableLoading",
    numberOfButtons = 1,
    numberOfMiddleMenu = 1,
    searchSize = {},
    middleSize = [],
} = {}) {
    const defaultSearchSize = { width: "w-60", height: "h-full" };
    const defaultMiddleSize = [{ width: "w-60", height: "h-11" }];
    searchSize = { ...defaultSearchSize, ...searchSize };
    middleSize =
        middleSize.length > 0
            ? {  ...defaultMiddleSize, ...middleSize}
            : defaultMiddleSize;
    const id = idLoading.startsWith("#") ? idLoading : `#${idLoading}`;
    const element = $(id);
    var dataTableSkeleton = $(`${id} .dataTableSkeleton`);
    if (dataTableSkeleton.length == 0) {
        let loader = `
        <div id="dataTableSkeleton" class="s-main ${width} ${height} flex flex-col gap-3 Pomelo-Peel-White dataTableSkeleton bg-inherit">
            <div class="s-header flex items-start justify-between h-11 gap-3">`;
        if (search)
            loader += `<div class="s-search skeleton ${searchSize.width} ${searchSize.height}"></div>`;
        if (middleMenu) {
            loader += `<div class="flex flex-1 gap-3 h-full">`;
            for (let i = 0; i < numberOfMiddleMenu; i++) {
                // console.log(middleSize[i]?.width||middleSize[0].width);

                loader += `<div class="s-middle-menu skeleton ${
                    middleSize[i]?.width || middleSize[0].width
                } ${middleSize[i]?.height || middleSize[0].height}"></div>`;
            }
            loader += `</div>`;
        }
        if (button) {
            loader += `<div class="s-button-group flex gap-2 h-full  ml-auto">`;
            for (let i = 0; i < numberOfButtons; i++) {
                loader += `<div class="s-button skeleton w-12 h-full"></div>`;
            }
            loader += `</div>`;
        }
        loader += `</div>
            <div class="s-table skeleton w-full h-full "></div>
            <div class="s-footer flex">`;
        if (page)
            loader += `
                <div class="s-page flex gap-2 h-8 rounded-full">
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                </div>`;
        if (info)
            loader += `<div class="s-info skeleton w-40 h-8 ml-auto"></div>`;
        loader += `</div>
        </div>`;
        element.html(loader);
        dataTableSkeleton = $(`${id} .dataTableSkeleton`);
    }
    if (show) {
        element.removeClass("hidden");
        dataTableSkeleton.removeClass("hidden");
    } else {
        element.addClass("hidden");
        dataTableSkeleton.addClass("hidden");
    }

    element.remove = function () {
        dataTableSkeleton.remove();
    };
    return element;
}

/**
 * Create a skeleton loader element.
 * @typedef {Object} skeletonOpt
 * @property {string} [width="w-xs"] - The width class of the skeleton (e.g., "w-xs").
 * @property {string} [height="h-11"] - The height class of the skeleton (e.g., "h-11").
 * @property {string} [classLoading=""] - The class name of the element to contain the skeleton.
 * @property {string} [idLoading=""] - The ID of the element to contain the skeleton.
 * @property {string} [element=""] - The selector for the element to contain the skeleton (e.g., "#loading").
 *
 * @param {skeletonOpt} option
 * @returns {void}
 * @example
 * skeleton({
 *       idLoading: "loading",
 *       height: "h-20",
 *       width: "w-96",
 *   });
 */
// prettier-ignore
export function skeleton({
    element = "", // #loading
    idLoading = "",
    classLoading = "",
    height = "h-11",
    width = "w-xs",
} = {}) {
    let e;
    if (element != "") {
        e = $(element);
    } else {
        e =
            idLoading != "" ? $(`#${idLoading}`) : classLoading != "" ? $(`.${classLoading}`) : null;
    }
    if (e) {
        e.html(
            `<div class="Pomelo-Peel-White skeleton ${width} ${height}"></div>`
        );
    }
}

/**
 * loading multiple skeletons
 * @typedef {Object} skeletonsOpt
 * @property {string} [element=""] - The selector for the element to contain the skeletons (e.g., "#loading").
 * @property {string} [classLoading=""] - The class name of the element to contain the skeletons.
 * @property {string} [idLoading=""] - The ID of the element to contain the skeletons.
 * @property {number} [count=1] - The number of skeletons to create.
 * @property {string} [mb="mb-1"] - The margin-bottom
 * @property {Array<{pattern}>} [pattern=[{width: "w-xs", height: "h-11", type: "vertical", flag: ""}]] - An array defining the width, height, type, and flag of each skeleton pattern.
 *
 * @typedef {Object} pattern
 * @property {string} width - The width class of the skeleton (e.g., "w-xs").
 * @property {string} height - The height class of the skeleton (e.g., "h-11").
 * @property {string} [type="vertical"] - The type of skeleton, either "vertical" or "horizontal".
 * @property {string} [flag=""] - The flag for horizontal skeletons, can be "start" or "end" to denote the beginning or end of a horizontal group.
 *
 * @param {skeletonsOpt} option
 * @returns {void}
 * @example
 * skeletons({
 *       idLoading: "reportList",
 *       pattern: [
 *           { width: "w-96", height: "h-11" },
 *           { width: "w-48", height: "h-11", type: "horizontal", flag: "start"},
 *           { width: "w-48", height: "h-11", type: "horizontal"},
 *           { width: "w-24", height: "h-11", type: "horizontal"},
 *           { width: "w-24", height: "h-11", type: "horizontal", flag: "end"},
 *           { width: "w-full", height: "h-[70vh]" },
 *       ],
 *       count: 6,
 *   });
 */
// prettier-ignore
export function skeletons({
    element = "", // #loading
    classLoading = "",
    idLoading = "",
    count = 1,
    mb = "mb-1",
    pattern = [{ width: "w-xs", height: "h-11", type: "vertical", flag: "" }],
} = {}) {
    let e;
    if (element != "") {
        e = $(element);
    } else {
        e = idLoading != "" ? $(`#${idLoading}`) : classLoading != "" ? $(`.${classLoading}`) : null;
    }
    if (e) {
        e.empty();
        let html = '';
        for (let i = 0; i < count; i++) {
            if (count - i == 1) mb = "";
            const { width, height, type, flag } = pattern[i % pattern.length];
            // set skeleton horizontal
            if (type && type.toLowerCase() === "horizontal") {
                if(flag == "start"){
                    html += `<div class="flex gap-2 w-full h-full ${mb}">`;
                }
                html += `<div class="skeleton ${width} ${height}"></div>`
                if(flag == "end"){
                    html += `</div>`;
                }
            }else{
            // set skeleton vertical
                html +=`<div class="Pomelo-Peel-White skeleton ${width} ${height} ${mb}"></div>`;
            }
        }
        e.append(html);
    }
}

/**
 * loading form detail skeleton
 * @param {Object} element - The selector for the element to contain the skeletons (e.g., "#loading").
 * @returns {void}
 * @example
 * formDetailSkeleton("#loading");
 */
export function formDetailSkeleton(element) {
    skeletons({
        element: element,
        count: 2,
        mb: "mb-5",
        pattern: [
            { width: "w-[12rem]", height: "h-[2rem]" },
            { width: "w-[30rem]", height: "h-[10rem]" },
        ],
    });
}

/**
 * loading form submit skeleton
 * @typedef {Object} formSubmitSkeleton
 * @property {number} [count=3] - The number of button skeletons to create.
 * @property {string} [element=""] - The selector for the element to contain the skeleton (e.g., "#loading").
 * @property {string} [mode="edit"] - The mode of the form, either "edit" or "view".
 * @param {formSubmitSkeleton} option
 * @returns {void}
 * @example
 * formSubmitSkeleton({
 *       count: 3, // จำนวนปุ่ม
 *       element: "#loading",
 *       mode: "edit",
 *   });
 */
export function formSubmitSkeleton({
    count = 3,
    element = "",
    mode = "edit",
} = {}) {
    let html = `<div class="flex flex-col items-center">
    <div class="skeleton  min-h-24 w-56 mb-5"></div>
    <div class="flex gap-1">`;
    for (let i = 0; i < count; i++) {
        html += `<div class="skeleton h-10 w-24"></div>`;
    }
    html += `</div>
    </div>`;
    const flow = `<div id="flow" class="w-full my-5">
        <div class="flex justify-center">
            <div class="skeleton h-[20rem] w-[36rem]"></div>
        </div>
    </div>`;
    if (element) {
        switch (mode) {
            case "edit":
                $(element).html(html + flow);
                break;
            case "view":
                $(element).html(flow);
                break;
            case "create":
                $(element).html(html);
                break;
            default:
                $(element).html();
                break;
        }
    }
}
