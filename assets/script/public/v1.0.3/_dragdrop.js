/**
 * Drag and Drop File Upload
 * @module _dragdrop
 * @description This file is used to manage drag and drop file upload functionality.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @note This file includes functions to handle drag and drop file upload, file validation, and file preview.
 * @requires jQuery npm install jquery
 * @requires fancyBox npm install --save @fancyapps/ui
 * @requires _fancyBox
 * @requires _file
 * @version 1.0.2
 * @note แก้ไข้ชื่อไฟล์ยาวให้ตัด ... เพิ่ม scroll และกำหนดขนาดกับความสูงของ dropZone
 * @note 2025-06-25 เพิ่มเมื่อไม่ใช่ file type ที่กำหนด ให้มี icon default
 * @note 2025-06-26 เปลี่ยนการตั้ง format ให้รับเป็น string มา
 * @version 1.0.3
 * @note 2025-07-17 
 * แก้การส่งใน function เป็น object แทนการส่งแยก
 * เปลี่ยนไม่ต้องส่ง object มาแล้วในกรณีมีอันเดีียว หากมีหลายอันส่งแค่ element มา
 * 
 * 
 * ***** สำคัญ *****
 * ต้อง handleFile ที่ js ของตนเองด้วยเพื่อใช้ประกอบกับเวลาคลิกปุ่มเลือกไฟล์
 * $(document).on('change', 'input[name="files[]"]', async function(e){
        handleFiles();
    });

 */

import { createFancyObjectURL, fancyboxBasic} from "./_fancyBox";
import { checkFileType, fileFormats } from "./_file";
import "./_tooltip";
import { RequiredElement } from "./jFuntion";

/**
 * drag over file
 */
$(document).on("dragover", ".dropZone", async function (e) {
    e.preventDefault();
    $(this).addClass("bg-gray-300");
});

/**
 * drag leave file
 */
$(document).on("dragleave", ".dropZone", async function (e) {
    e.preventDefault();
    $(this).removeClass("bg-gray-300");
});
  

/**
 * Drop file
 */
$(document).on("drop", ".dropZone", async function (e) {
    e.preventDefault();
    $(this).removeClass("bg-gray-300");
    // const element = elementDragDrop($(this));
    const files   = e.originalEvent.dataTransfer.files;
    // const format  = $(this).siblings('input').attr('data-format');
    
    handleFiles({
        files: files,
        // element: element,
        // format: format
    })
});

/**
 * Remove a file from the drop zone
 */
$(document).on('click',   ".drop-remove", async function (e) {
    // console.log(filesData);
    e.preventDefault();
    const dropZone = $(this).closest('.dropZone');
    const element  = elementDragDrop(dropZone);
    const list     = $(this).parent();
    const index    = list.index();
    const fileInput = element.fileInput[0];
    filesData[element.name].splice(index, 1);
    list.remove();
    addDataFile(fileInput, element);
    
});


/**
 * Reset list
 */
$(document).on('click', '.drop-reset', async function(e){
    e.preventDefault()
    const name    = $(this).data('for');
    const element = elementDragDrop($(`input[name="${name}"]`));
    const fileInput = element.fileInput[0];
    filesData[name] = [];
    element.list.empty();
    addDataFile(fileInput, element);
});

const imagesData = [];
$(document).on('click', '.drop-image', async function(e){
    e.preventDefault();
    const dropZone = $(this).closest('.dropZone');
    const element  = elementDragDrop(dropZone);
    const list     = $(this).closest('li');
    const index    = list.index();
    fancyboxBasic([createFancyObjectURL(imagesData[element.name][index])]);
});

$(document).on('mouseenter mouseleave', '.drop-image', function(){
    $(this).toggleClass('icofont-image icofont-eye-alt');
})


/**
 * get icofont 
 * @param {string} textSize e.g. text-xl 
 * @returns 
 */
export const iconfont = (textSize='text-2xl') => {
    return {
        pdf  : `<i class="icofont-file-pdf text-error ${textSize}"></i>`,
        xlsx : `<i class="icofont-file-excel text-success ${textSize}"></i>`,
        xls  : `<i class="icofont-file-excel text-success ${textSize}"></i>`,
        docx : `<i class="icofont-file-word text-blue-600 ${textSize}"></i>`,
        doc  : `<i class="icofont-file-word text-blue-600 ${textSize}"></i>`,
        pptx : `<i class="icofont-file-powerpoint text-orange-600 ${textSize}"></i>`,
        ppt  : `<i class="icofont-file-powerpoint text-orange-600 ${textSize}"></i>`,
        image : `<div class="tooltip" data-html="preview image">
            <i class="icofont-image text-primary ${textSize} drop-image"></i>
        </div>`
    }
};

/**
 * 
 * @param {string} forInput e.g. fileResult[] 
 * @returns 
 */
export const dragDropInit = (options = {}) => { 
    const opt = {
        name: 'files[]',  
        format: '',
        msgRegion: 'EN',
        height: 'h-70',
        width: 'w-full', 
        class: '',
        ...options
    }
    return `<div class=" p-3 flex gap-3 ${opt.width} ${opt.height}">
    <label for='${opt.name}'  class="dropZone border border-primary border-dashed rounded-lg w-full min-h-60 text-primary  cursor-pointer   overflow-scroll">
        <div class="drop-message flex flex-col justify-center items-center h-full">
            <span>Drag & Drop files here or click to select</span>
        </div>
        <div class="drop-list w-full flex-col items-start text-gray-500 hidden p-1 gap"></div>
    </label>
    <input type="file" class="inputDrop file-input txt-upper validator ${opt.class} hidden" data-format='${opt.format}' data-msg-region='${opt.msgRegion}' name="${opt.name}" id="${opt.name}" multiple/>
    </div>`;
};

export const dragDropReset = (options = {}) => {
    const opt = {
        name: 'files[]',
        size: 'btn-sm',
        color: 'btn-error',
        margin: 'ml-auto',
        class: '',
        icon: true,
        ...options
    }
    const icon = opt.icon ? `<i class="icofont-refresh"></i>` : 'Reset';
    return `<button class="btn ${opt.color} ${opt.size} ${opt.margin} ${opt.class} drop-reset tooltip" data-html="Reset" data-for="${opt.name}">${icon}</button>`
}

/**
 * Get element for drag and drop
 * @param {object} dropZone e.g. $('.dropZone') or tag input send $(this)
 * @returns 
 */
export const elementDragDrop = (dropZone) => {
    if(dropZone.is('input')){
        dropZone = dropZone.siblings('.dropZone');
    }
    const name = dropZone.attr('for');
    const messageElem = dropZone.find('.drop-message');
    if(!filesData[name]) filesData[name] = [];
    if(!imagesData[name]) imagesData[name] = [];
    // console.log(filesData);
    return {    
        fileInput: $(`input[name="${name}"]`),
        list: dropZone.find('.drop-list'),
        message: messageElem.length ? messageElem : '',
        name : name
    };
}


/**
 * Add file data to input
 * @param {object} fileInput 
 * @param {string} element e.g. fileBefore[]
 */
function addDataFile(fileInput, element) {
    const dataTransfer = new DataTransfer();
    for (const f of filesData[element.name]) {
        dataTransfer.items.add(f);
    }
    fileInput.files = dataTransfer.files;
    checkDropZone(element);
    console.log(filesData);
}

/**
 * Reset drop zone to default state
 * @param {object} e
 */
function checkDropZone(e) {
    e.fileInput[0].files.length > 0 ? hideList(e) : showList(e);
    if(e.fileInput[0].files.length > 0) {
        hideList(e);
        if(e.fileInput.hasClass('req')) e.fileInput.siblings('.dropZone').removeClass('border-red-500 text-red-500').addClass('border-primary text-primary');
    } else {
        showList(e);
        if(e.fileInput.hasClass('req')) e.fileInput.siblings('.dropZone').addClass('border-red-500 text-red-500').removeClass('border-primary text-primary');
    }
}

/**
 * Show file list
 * @param {object} e 
 */
function showList(e) {
    e.list.addClass("hidden").removeClass("flex");
    if(e.message) e.message.removeClass('hidden');
}

/**
 * Hide file list
 * @param {object} e 
 */
function hideList(e){
    e.list.removeClass("hidden").addClass("flex");
    if(e.message) e.message.addClass('hidden');
}
  
/**
 * 
 * @param {*} files 
 * @param {object} fileInput element to show file list e.g. $('#fileInput')
 * @param {object} list element to show file list e.g. $('#fileList')
 * @returns 
 * @example
 * handleFiles({
 *     element: $('input[name="files[]"]'),
 *     iconSize: 'text-2xl'
 * });
 * @note หากมีแค่อันเดียวเรียกแค่ handleFiles(); ได้เลย
 * $(document).on('change', 'input[name="files[]"]', async function(e){
 *     handleFiles();
 * });
 */
const filesData = [];
export async function handleFiles(options = {}) {
    const opt = {
        files: [],
        element: $('.dropZone'),
        // format: '',
        iconSize: 'text-2xl',
        ...options
    }
    const element = elementDragDrop(opt.element);
    const format  = element.fileInput.attr('data-format');
    const msgRegion = element.fileInput.attr('data-msg-region') || 'EN';
    const files   = opt.files.length > 0 ? opt.files : element.fileInput[0].files;
    const fileInput = element.fileInput[0];
    element.list.innerHTML = "";

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.name.split('.').pop().toLowerCase(); // get file extension
        const icon = file.type.includes('image') ? iconfont(opt.iconSize).image : iconfont(opt.iconSize)[fileExtension];
        const txt = `
        <li class="flex flex-row gap-2 items-center hover:bg-gray-200 w-full px-2 rounded">
            ${icon || '<i class="icofont-file-alt text-2xl"></i>'}
            <span class="text-lg  overflow-hidden text-ellipsis">${file.name}</span>
            <i class="icofont-close-squared-alt ml-auto text-error text-2xl drop-remove"></i>
        </li>`;
        if(format != ''){
            const fm = fileFormats[format] || {};
            if (! await checkFileType(file.name, fm.extension, msgRegion == 'EN' ? fm.msgEn : fm.msg)) {
                // dataTransfer.items.remove(i);
                RequiredElement(element.fileInput);
                
                continue;
            }
        }
        // dataTransfer.items.add(file);
        filesData[element.name].push(file);
        imagesData[element.name].push(URL.createObjectURL(file));
        element.list.append(txt);
    }
    console.log('filelength',filesData.length);
    
    if(filesData.length > 0){
        
    }
    addDataFile(fileInput, element);
}