
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
 */

const dtopt = {
    show : true,
    button : true,
    search : true,
    page : true,
    info : true,
    middleMenu : false,
    width : 'w-full',
    height : 'h-[80vh]',
    idLoading : 'tableLoading',
    numberOfButtons : 1,
    numberOfMiddleMenu: 1,
    searchSize: { width: 'w-60', height: 'h-full' },
    middleSize: [
        { width: 'w-60', height: 'h-11' },
    ]
};

/**
 * loading data table skeleton
 * @description Create a skeleton loader for data tables.
 * @param {object} opt 
 * ให้ไปสร้าง html ที่มี id ก่อนและนำ id มาอ้างอิงใน opt.idLoading
 * @example
 * html : <div id="tableLoading"></div>
 * js : dataTableSkeleton({show: false, idLoading: 'tableDetailLoading'}); || dataTableSkeleton();
 */
export function dataTableSkeleton(options = {}){
    const opt = { ...dtopt, ...options };
    // console.log(opt);
    if($(`#${opt.idLoading} .dataTableSkeleton`).length == 0) {
        let loader = `
        <div id="dataTableSkeleton" class="s-main ${opt.width} ${opt.height} flex flex-col gap-3 Pomelo-Peel-White dataTableSkeleton bg-inherit">
            <div class="s-header flex items-start justify-between h-11 gap-3">`;
        if(opt.search) loader += `<div class="s-search skeleton ${opt.searchSize.width} ${opt.searchSize.height}"></div>`; 
        if(opt.middleMenu)  {
            loader += `<div class="flex flex-1 gap-3 h-full">`;
            for(let i = 0; i < opt.numberOfMiddleMenu; i++){
                // console.log(opt.middleSize[i]?.width||opt.middleSize[0].width);

                loader += `<div class="s-middle-menu skeleton ${opt.middleSize[i]?.width||opt.middleSize[0].width} ${opt.middleSize[i]?.height||opt.middleSize[0].height}"></div>`;
            }
            loader += `</div>`;
        }
        if(opt.button) {
            loader += `<div class="s-button-group flex gap-2 h-full  ml-auto">`;
            for(let i = 0; i < opt.numberOfButtons; i++){
                loader += `<div class="s-button skeleton w-12 h-full"></div>`;
            }  
            loader += `</div>`;
        }
        loader += `</div>
            <div class="s-table skeleton w-full h-full "></div>
            <div class="s-footer flex">`;
        if(opt.page) loader += `
                <div class="s-page flex gap-2 h-8 rounded-full">
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                    <div class="skeleton w-8"></div>
                </div>`;
        if(opt.info) loader += `<div class="s-info skeleton w-40 h-full ml-auto"></div>`;
        loader += `</div>
        </div>`;
        $(`#${opt.idLoading}`).html(loader);
    }
    opt.show ? $('.dataTableSkeleton').removeClass('hidden') : $('.dataTableSkeleton').addClass('hidden');
}

const eopt = {
    width: 'w-xs',
    height: 'h-11',
    classLoading : '',
    idLoading : ''
}
export function skeleton(option = {}){
    const opt = { ...eopt, ...option };
    const e = opt.idLoading != '' ? $(`#${opt.idLoading}`): (opt.classLoading != '' ? $(`.${opt.classLoading}`) : null);
    if (e) {
        e.html(`<div class="Pomelo-Peel-White skeleton ${opt.width} ${opt.height}"></div>`);
    }
    return ;
}