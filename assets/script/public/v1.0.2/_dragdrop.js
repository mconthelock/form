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
 */

import { createFancyObjectURL, fancyboxBasic} from "./_fancyBox";
import { checkFileType, fileFormats } from "./_file";

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
    const element = elementDragDrop($(this));
    const files   = e.originalEvent.dataTransfer.files;
    const format  = $(this).siblings('input').data('format');
    console.log(format);
    // console.log(element);
    handleFiles(files, element, fileFormats[format]);
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
        image : `<div class="tooltip tooltip-info" data-tip="preview image">
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
        height: 'h-70',
        width: 'w-full', 
        ...options
    }
    return `<div class=" p-3 flex gap-3 ${opt.width} ${opt.height}">
    <label for='${opt.name}'  class="border border-primary border-dashed rounded-lg w-full min-h-60 text-primary  cursor-pointer dropZone  overflow-scroll">
        <div class="drop-message flex flex-col justify-center items-center h-full">
            <span>Drag & Drop files here or click to select</span>
        </div>
        <div class="drop-list w-full flex-col items-start text-gray-500 hidden p-1 gap"></div>
    </label>
    <input type="file" class="file-input txt-upper validator req hidden" data-format='${opt.format}' name="${opt.name}" id="${opt.name}" multiple/>
    </div>`;
};

export const dragDropReset = (name, size='btn-sm', color='btn-error', margin='ml-auto') => {
    return `<button class="btn ${color} ${size} ${margin} drop-reset" data-for="${name}">Reset</button>`
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
}


/**
 * Reset drop zone to default state
 * @param {object} e
 */
function checkDropZone(e) {
    e.fileInput[0].files.length > 0 ? hideList(e) : showList(e);
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
 */
const filesData = [];
export async function handleFiles(files, element, format = '') {
    console.log(files, element, filesData);
    
    const fileInput = element.fileInput[0];
    element.list.innerHTML = "";
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.name.split('.').pop().toLowerCase(); // get file extension);
        const icon = file.type.includes('image') ? iconfont().image : iconfont()[fileExtension];
        const txt = `
        <li class="flex flex-row gap-2 items-center hover:bg-gray-200 w-full px-2 rounded">
            ${icon}
            <span class="text-lg  overflow-hidden text-ellipsis">${file.name}</span>
            <i class="icofont-close-squared-alt ml-auto text-error text-2xl drop-remove"></i>
        </li>`;
        if(format != ''){
            if (! await checkFileType(file.name, format.extension, format.msg)) {
                // dataTransfer.items.remove(i);
                continue;
            }
        }
        // dataTransfer.items.add(file);
        filesData[element.name].push(file);
        imagesData[element.name].push(URL.createObjectURL(file));
        element.list.append(txt);
    }

    addDataFile(fileInput, element);
}