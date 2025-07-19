/**
 * Show preloader
 * @module preloader
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-06-20
 * @requires jQuery npm install jquery
 * @version 1.0.1
 * @version 1.0.3
 * @note 2025-07-17
 * แก้การส่งใน function เป็น object แทน boolean
 */


export const showLoader = (options = {})=> {
    const opt = {
        show: true, // true = show, false = hide
        src: `${process.env.APP_ENV}/assets/images/${process.env.PRELOADER}`,
        ...options
    }

    if($('#preload').length == 0) {
        const loader = `<div class="preload" id="preload"> 
            <div class="fixed inset-0 flex items-center justify-center bg-gray-200/50 z-[9999]">
                <img src="${opt.src}" class="rounded-full h-28 w-28"/>
            </div>
        </div>`;
        $('body').append(loader);
    }
    opt.show ? $('#preload').removeClass('hidden') : $('#preload').addClass('hidden');
    // $('#preload').find('div').removeClass('bg-gray-200').addClass('bg-gray-200/50');
};

export const showbgLoader = (options = {})=> {
    const opt = {
        show: true, // true = show, false = hide
        src: `${process.env.APP_ENV}/assets/images/${process.env.PRELOADER}`,
        ...options
    }
    if($('#bgpreload').length == 0) {
        const loader = `<div class="preload" id="bgpreload"> 
            <div class="fixed inset-0 flex items-center justify-center bg-gray-200 z-[9999]">
                <img src="${opt.src}" class="rounded-full h-28 w-28"/>
            </div>
        </div>`;
        $('body').append(loader);
    }
    opt.show ? $('#bgpreload').removeClass('hidden') : $('#bgpreload').addClass('hidden');
    // $('#preload').find('div').removeClass('bg-gray-200/50').addClass('bg-gray-200');
};
