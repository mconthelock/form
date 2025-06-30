/**
 * Show preloader
 * @module preloader
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-06-20
 * @requires jQuery npm install jquery
 * @version 1.0.1
 */


export const showLoader = (boolean)=> {
    if($('#preload').length == 0) {
        const loader = `<div class="preload" id="preload"> 
            <div class="fixed inset-0 flex items-center justify-center bg-gray-200/50 z-[9999]">
                <img src="${process.env.APP_ENV}/assets/images/${process.env.PRELOADER}" class="rounded-full h-28 w-28"/>
            </div>
        </div>`;
        $('body').append(loader);
    }
    boolean ? $('#preload').removeClass('hidden') : $('#preload').addClass('hidden');
    // $('#preload').find('div').removeClass('bg-gray-200').addClass('bg-gray-200/50');
};

export const showbgLoader = (boolean)=> {
    if($('#bgpreload').length == 0) {
        const loader = `<div class="preload" id="bgpreload"> 
            <div class="fixed inset-0 flex items-center justify-center bg-gray-200 z-[9999]">
                <img src="${process.env.APP_ENV}/assets/images/${process.env.PRELOADER}" class="rounded-full h-28 w-28"/>
            </div>
        </div>`;
        $('body').append(loader);
    }
    boolean ? $('#bgpreload').removeClass('hidden') : $('#bgpreload').addClass('hidden');
    // $('#preload').find('div').removeClass('bg-gray-200/50').addClass('bg-gray-200');
};
