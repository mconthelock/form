
/**
 * https://amecwebtest.mitsubishielevatorasia.co.th/joborder
 */
// export const host = $("meta[name=base_url]").attr("content");
export const host = self.location.origin + self.location.pathname.split('/').slice(0,2).join('/');

/**
 * https://amecwebtest.mitsubishielevatorasia.co.th
 */
// export const root = $("meta[name=root_url]").attr("content");
export const root = self.location.origin;

/**
 * https://amecwebtest.mitsubishielevatorasia.co.th/joborder/assets/script/function/jFuntion.js
 */
export const selfLocation = self.location.href;

/**
 * http or https
 */
export const schema = self.location.protocol;
/**
 * /assets/script/function/jFuntion.js
 */
export const selfLocationPath = self.location.pathname;

/**
 * Required input
 */
$(document).on('input blur', '.req', function(){
    RequiredElement($(this));
});

export const showLoader = (boolean)=> {
    if($('#preload').length == 0) {
        const loader = `<div class="preload" id="preload"> 
            <div class="fixed inset-0 flex items-center justify-center bg-gray-200/50 z-[9999]">
                <img src="${host}/assets/images/${process.env.PRELOADER}" class="rounded-full h-28 w-28"/>
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
                <img src="${host}/assets/images/${process.env.PRELOADER}" class="rounded-full h-28 w-28"/>
            </div>
        </div>`;
        $('body').append(loader);
    }
    boolean ? $('#bgpreload').removeClass('hidden') : $('#bgpreload').addClass('hidden');
    // $('#preload').find('div').removeClass('bg-gray-200/50').addClass('bg-gray-200');
};


/**
 * Add minutes to time string
 * @param {string} timeStr 
 * @param {number} minutesToAdd 
 * @returns {string} Updated time string
 */
export function addMinutesToTime(timeStr, minutesToAdd) {
    let [h, m] = timeStr.split(':').map(Number);
    let date = new Date();
    date.setHours(h);
    date.setMinutes(m + minutesToAdd);
    return date.toTimeString().substring(0, 5);
}

/**
 * Show message popup
 * @param {string} msg 
 * @param {string} type 
 * @param {string} position toast-end | toast-top | toast-center | toast-bottom | toast-start | toast-middle
 */
export function showMessage(msg, type = "error", position = 'toast-end') {

    const prop = [
      {
        id: "error",
        bg: "bg-red-800",
        text: "text-white",
        title: "Processing Fail!",
      },
      { id: "success", bg: "bg-green-800", text: "text-white", title: 'Success' },
      { id: "info", bg: "bg-blue-800", text: "text-white", title: 'Info' },
      { id: "warning", bg: "bg-yellow-800", text: "text-white", title: 'Warning!' },
    ];
  
    const dt = prop.find((x) => x.id == type);
    const toast = $(`
          <dialog class="msg-notify toast ${position} ${dt.bg} z-[9999] !p-0 rounded-2xl m-5  alert-message w-80 max-w-80 opacity-100 transition-all duration-1000">
              <div class="alert flex flex-col gap-2 overflow-hidden relative ${dt.bg}">
                  <div class="msg-title text-xl font-semibold block w-full text-left ${dt.text}">${dt.title}</div>
                  <div class="msg-txt block w-full text-left max-w-80 text-wrap ${dt.text}">${msg}</div>
                  <div class="msg-close absolute top-2 right-5 z-[102] cursor-pointer">
                      <i class="icofont-ui-close"></i>
                  </div>
                  <div class="absolute right-[-30px] top-[-10px] text-[120px] z-0 opacity-20">
                      <i class="icofont-exclamation-circle"></i>
                  </div>
              </div>
          </dialog>
          `);
    $('.msg-notify').remove();
    toast.appendTo('body');
    setTimeout(() => {
      console.log(toast);
      toast.find('.msg-close').trigger('click'); 
    }, 5000); 
    $('.msg-close').on('click', function () {
        toast.removeClass('opacity-100').addClass('opacity-0');
        setTimeout(() => {
            toast.remove(); 
        }, 1000);
    });
}


export const ajaxOptionsLoad = {
    type: "post",
    dataType: "json",
    beforeSend: function () {
        showLoader(true);
    },
    complete: function (xhr) {
        checkAuthen(xhr);
        showLoader(false);
    }
};
export const ajaxOptions = {
    type: "post",
    dataType: "json",
    complete: function (xhr) {
        checkAuthen(xhr);
    }
};

export function getData(ajaxOptions){
    return new Promise((resolve, reject) => {
        const options = {
            ...ajaxOptions,
            success: function (res) {
                resolve(res); 
            },
            error: function (xhr, textStatus, errorThrown) {
                let error = new Error(errorThrown || "Unknown AJAX error");
                error.status = xhr.status;
                error.responseText = xhr.responseText; 
                reject(error);
            },
        };
        $.ajax(options);
    });
}


/**
 * Check Authen
 * @param {*} xhr 
 * @param {*} status 
 */
export function checkAuthen(xhr, status=''){
    try{
        // console.log(xhr);
        if (!xhr.responseJSON) {
            throw new Error('Response is not JSON');
        }else{
            const statusCode  = xhr.responseJSON.status;
            const urlRedirect = xhr.responseJSON.url;
            // console.log('statusCode', statusCode);
            // console.log('urlRedirect', urlRedirect);
            if (statusCode == '403' && urlRedirect) {
                window.location.href = urlRedirect;
            }
        }
    } catch (error) {
        console.error("Error in checkAuthen: ", error);
        return;
    }
}



/**
 * reset form and remove class error in .req
 * @param {string} form id or class Form e.g. #chemical-master , .inspection-form
 */
export function resetForm(form){
    $(form)[0].reset();
    formRemoveError(form)
}

/**
 * Remove error class in form
 * @param {string} form id or class Form e.g. #chemical-master , .inspection-form
 */
export function formRemoveError(form){
    $(form).find(".req").map(function (i, el) {
        removeClassError($(el));
    });
}

/**
 * Check required form
 * @param {object} form element form class or id e.g. #chemical-master , .inspection-form
 * @param {object} fields e.g. [{element: element, message: message}]
 * @param {string} position e.g. toast-end | toast-top | toast-center | toast-bottom | toast-start | toast-middle
 * @returns 
 */
export async function requiredForm(form, fields=[], position = ''){
    let check = false;
    $(form).find('input, select, textarea').each(function() {
        const target = $(this);
        
        if(RequiredElement(target)){
            check = true;
        }
    });
    
    if (fields.length == 0 && check) {
        showMessage('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning', position);
        return false;
    }
    for (const field of fields) {
        if (!field.element.val() || field.element.val().length === 0) {
            showMessage(field.message, 'warning', position);
            return false;
        }
    }
    return true;

}

/**
 * Check Required element
 * @param {object} e 
 */
export function RequiredElement(e){
    const groupName = e.attr('name');
    const isEmptyRadioWithReq = ($(`input[name="${groupName}"].req:checked`).length === 0 && (e.prop('type') === 'radio' || e.prop('type') == 'checkbox') && e.hasClass('req'));
    const isEmptyWithReq      = ((!e.val() || e.val().length === 0) && e.hasClass('req')); // Fixed '=' to '===' and checked length
    if (isEmptyRadioWithReq || isEmptyWithReq) {
        // console.log('addClassError', e);
        addClassError(e);
        return true;
    }else{
        // console.log('removeClassError', e);
        removeClassError(e);
        return false;
    }
}

/**
 * Add css error class
 * @param {object} e 
 */
export function addClassError(e){
    if(e.is('input')){
        const groupName = e.attr('name'); 
        if($(`input[name="${groupName}"].req:checked`).length === 0){
            if (e.prop('type') == 'radio' ) {
                $(`input[name="${groupName}"]`).addClass('radio-error');
            } else if (e.prop('type') == 'checkbox') {
                $(`input[name="${groupName}"]`).addClass('checkbox-error');
            } else {
                e.addClass('input-error');
                if(e.closest('label').length > 0 && e.closest('label').hasClass('input')){
                    e.closest('label').addClass('input-error');
                }
            }
        }
    }else if(e.is('select')){
        e.next('.select2-container').addClass('select-error');
    }else if(e.is('textarea')){
        e.addClass('textarea-error');
    }
}

/**
 * Remove css error class
 * @param {object} e 
 */
export function removeClassError(e){
    if(e.is('input')){
        const groupName = e.attr('name'); 
        if(e.prop('type') == 'radio'){
            $(`input[name="${groupName}"]`).removeClass('radio-error');
        }else if (e.prop('type') == 'checkbox') {
            $(`input[name="${groupName}"]`).removeClass('checkbox-error');
        }else{
            e.removeClass('input-error');
            if(e.closest('label').length > 0 && e.closest('label').hasClass('input')){
                e.closest('label').removeClass('input-error');
            }
        }
    }else if(e.is('select')){
        e.next('.select2-container').removeClass('select-error');
    }else if(e.is('textarea')){
        e.removeClass('textarea-error');
    }
}

/**
 * Create a fieldset element with a label and an input element.
 * @param {string} inputElement e.g. <div class="relative w-full">
                    <input type="text" class="input txt-upper validator w-full req" name="reqNo[]" id="reqNo[]" data-check="0" placeholder="e.g. IS-DEV25-000127" required pattern="[A-Za-z]+-[a-zA-Z0-9]+-[0-9]{6}$" autocomplete="off"/>
                    <span class="loading loading-spinner text-primary absolute top-1/2 right-16 -translate-y-1/2 hidden"></span>
                    <span class="badge badge-neutral badge-xs absolute top-1/2 right-2 -translate-y-1/2">Enter</span>
                  </div>
 * @param {string} label e.g. Request No.
 * @returns {string} HTML string for the fieldset element
 * @description Create a fieldset element with a label and an input element.
 * @example
 * const fieldsetHTML = fieldAddInput('<input type="text" class="input" />', 'Name');
 * // <label class="form-control w-full">
 * //     <div class="label">
 * //         <span class="label-text">Name</span>
 * //     </div>
 * //     <div class="flex gap-1">
 * //         <div class="flex flex-col flex-1 inputGroup gap-1">
 * //             <input type="text" class="input" />
 * //         </div>
 * //         <div class="flex flex-col justify-end">
 * //             <i class="icofont-minus-square text-5xl hover:text-gray-400 hover:scale-105 remove-keep hidden"></i>
 * //             <i class="icofont-plus-square text-5xl  hover:text-gray-400 hover:scale-105 add-keep"></i>
 * //         </div>
 * //     </div>
 * // </label>
 
 */
export const fieldAddInput = (inputElement, label = '') => {
    const labelElement = label == '' ? '' : `<div class="label">
                                                <span class="label-text">${label}</span>
                                            </div>`;
    return `<label class="form-control w-full">
                ${labelElement}
                <div class="flex gap-1">
                    <div class="flex flex-col flex-1 inputGroup gap-1">
                        ${inputElement}
                    </div>
                    <div class="flex flex-col justify-end">
                        <i class="icofont-minus-square text-5xl hover:text-gray-400 hover:scale-105 remove-keep hidden"></i>
                        <i class="icofont-plus-square text-5xl  hover:text-gray-400 hover:scale-105 add-keep"></i>
                    </div>
                </div>
            </label>`
}


/**
 * Add input
 * @param {object} e 
 * @param {string} html 
 * @param {string} groupSelector
 */
export function addInput(e, html, groupSelector){
    e.closest('div').siblings(groupSelector).append(html);
    e.siblings('i').removeClass('hidden');
    // console.log(e.siblings('i')); 
}

/**
 * Remove input
 * @param {object} e 
 * @param {string} groupSelector
 * @param {string} itemSelector
 */
export function removeInput(e, groupSelector, itemSelector){
    const input = e.closest('div').siblings(groupSelector).find(itemSelector);
    // console.log(input.length);
    if(input.length == 2){
        input.last().remove();
        e.addClass('hidden');
    }else{
        input.last().remove();
    }
}

/**
 * reset multi input
 * @param {string} input e.g. input[name="reqNo[]"]
 * @param {string} button e.g. .remove-input
 */
export async function resetInput(input, button = '.remove-input', clear = false){
    console.log('reset');
    
    $(input).each(function() {
        console.log('val',$(this).val().trim());
        console.log('length',$(input).length);
        
        if(clear){
            if ($(this).val().trim() === "" && $(input).length > 1) $(this).remove();
        }else{
            if ($(input).length > 1) $(this).remove();
        }
    });

    const updateInput = $(input)

    if(button != '' && updateInput.length == 1) $(button).addClass('hidden');
}

/**
 * set input on select list
 * @param {string} input e.g. input[name="reqNo[]"]
 * @param {string} button e.g. .add-input
 * @param {string} data e.g. Water Water Treatment | aaa | xxx
 */
export function setInput(input, button, data){
    console.log('set');

    console.log(data);
    const arr = data.split('|');
    console.log(arr);
    
    if(arr.length > 1){
        for (let index = 0; index < arr.length-1; index++) {
            $(button).trigger('click');
        }
        $(input).each(function(i, el){
            $(el).val(arr[i]);
        });
    }else{
        $(input).val(data);
    }
}

/**
 * Autosize the textarea element.
 * @param {object} el document.getElementById('workcontent')
 */
export function autosizeTextarea (el) {
    el.style.height = 'auto';           // รีเซ็ตก่อน
    el.style.height = el.scrollHeight + 'px'; // ปรับสูงเท่าคอนเทนต์
}

export function logFormData(formData) {
    for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
}

export function getLastWednesday() {
    const today = new Date();
    let lastWednesday = new Date(today);
    
    // Check if today is Wednesday
    if (today.getDay() === 3) {
        lastWednesday = today;
    } else {
        // Calculate the last Wednesday
        const daysToLastWednesday = (today.getDay() + 4) % 7 || 7;
        lastWednesday.setDate(today.getDate() - daysToLastWednesday);
    }
    return lastWednesday;
}