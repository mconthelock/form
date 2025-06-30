const dtopt = {
    show : true,
    button : true,
    search : true,
    page : true,
    info : true,
    width : 'w-full',
    height : 'h-[80vh]',
    idLoading : 'tableLoading',
    numberOfButtons : 1
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
export function dataTableSkeleton(opt = {}){
    opt = { ...dtopt, ...opt };
    // console.log(opt);
    if($(`#${opt.idLoading} .dataTableSkeleton`).length == 0) {
        let loader = `
        <div id="dataTableSkeleton" class="s-main ${opt.width} ${opt.height} flex flex-col gap-3 Pomelo-Peel-White dataTableSkeleton bg-inherit">
            <div class="s-header flex items-center justify-between h-11">`;
        if(opt.search) loader += `<div class="s-search skeleton w-60 h-full"></div>`;   
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
    classLoading : 'sloading'
}
export function skeleton(opt = eopt){
    opt = { ...eopt, ...opt };
    $(`.${opt.classLoading}`).html(`<div class="Pomelo-Peel-White skeleton ${opt.width} ${opt.height}"></div>`)
    return ;
}