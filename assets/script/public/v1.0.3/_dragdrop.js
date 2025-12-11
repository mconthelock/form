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
 * @note 2025-09-22
    เพิ่มแสดงรูปภาพเฉพาะ format image
    ส่ง showImg: true ใน dragDropInit และ format: 'image'
 */
/**
 * @note 2025-10-10 เพิ่ม setFilePathToDragDrop สำหรับดึงไฟล์จาก path มาใส่ใน input file
 * @note 2025-10-11 แก้ .drop-remove ลบ index ผิด เปลี่ยนจาก numOfli -1 - index เป็นแค่ index
 */

import { getFile } from "../../api/file";
import { createFancyObjectURL, fancybox, fancyboxBasic } from "./_fancyBox";
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
    const files = e.originalEvent.dataTransfer.files;
    // const format  = $(this).siblings('input').attr('data-format');

    handleFiles({
        files: files,
        // element: element,
        // format: format
    });
});

/**
 * Remove a file from the drop zone
 */
$(document).on("click", ".drop-remove", async function (e) {
    // console.log(filesData);
    e.preventDefault();
    const dropZone = $(this).closest(".dropZone");
    const element = elementDragDrop(dropZone);
    const list = $(this).parent();
    const numOfLi = element.list.find("li").length;
    const index = list.index();
    const fileInput = element.fileInput[0];
    filesData[element.name].splice(index, 1);
    list.remove();
    addDataFile(fileInput, element);
});

$(document).on("click", ".drop-remove-db", async function (e) {
    e.preventDefault();
    const dropZone = $(this).closest(".dropZone");
    const element = elementDragDrop(dropZone);
    const list = $(this).closest("li");
    list.addClass("hidden delete-from-db");
    const fancy = list.find("a");
    fancy.removeAttr("data-fancybox");
    checkDropZone(element);
});

/**
 * Reset list
 */
$(document).on("click", ".drop-reset", async function (e) {
    e.preventDefault();
    const name = $(this).data("for");
    const element = elementDragDrop($(`input[name="${name}"]`));
    const fileInput = element.fileInput[0];
    filesData[name] = [];
    element.list.empty();
    addDataFile(fileInput, element);
});

const imagesData = [];
$(document).on("click", ".drop-image", async function (e) {
    e.preventDefault();
    const dropZone = $(this).closest(".dropZone");
    const element = elementDragDrop(dropZone);
    const list = $(this).closest("li");
    const index = list.index();
    fancyboxBasic([createFancyObjectURL(imagesData[element.name][index])]);
});

$(document).on("mouseenter mouseleave", ".drop-image", function () {
    $(this).toggleClass("icofont-image icofont-eye-alt");
});

/**
 * get icofont
 * @param {string} textSize e.g. text-xl
 * @returns
 */
export const iconfont = (textSize = "text-2xl") => {
    return {
        pdf: `<i class="icofont-file-pdf text-error ${textSize}"></i>`,
        xlsx: `<i class="icofont-file-excel text-success ${textSize}"></i>`,
        xls: `<i class="icofont-file-excel text-success ${textSize}"></i>`,
        docx: `<i class="icofont-file-word text-blue-600 ${textSize}"></i>`,
        doc: `<i class="icofont-file-word text-blue-600 ${textSize}"></i>`,
        pptx: `<i class="icofont-file-powerpoint text-orange-600 ${textSize}"></i>`,
        ppt: `<i class="icofont-file-powerpoint text-orange-600 ${textSize}"></i>`,
        image: `<div class="tooltip" data-html="preview image">
            <i class="icofont-image text-primary ${textSize} drop-image"></i>
        </div>`,
    };
};

/**
 *
 * @param {string} forInput e.g. fileResult[]
 * @returns
 */
// prettier-ignore
export const dragDropInit = (options = {}) => {
    const opt = {
        id: "files",
        name: "files",
        format: "",
        msgRegion: "EN",
        height: "h-70",
        width: "w-full",
        class: "",
        showImg: false,
        list: "", // กรณีส่ง list มาให้เลย สำหรับ return
        text: "Drag & Drop files here or click to select",
        multiple: true,
        ...options,
    };
    
    const show = opt.list != "" ? true : false;
    return `<div class=" p-3 flex gap-3 ${opt.width} ${opt.height}">
    <label for='${opt.name}'  class="dropZone border border-primary border-dashed rounded-lg w-full min-h-60 text-primary  cursor-pointer   overflow-auto">
        <div class="drop-message ${show ? "hidden" : "flex"} flex-col justify-center items-center h-full">
            <span>${opt.text}</span>
        </div>
        <ul class="drop-list w-full  ${opt.showImg ? "gap-5 flex-wrap" : "flex-col"} items-start text-gray-500 ${show ? "flex" : "hidden"} p-1 gap-1">
            ${opt.list}
        </ul>
    </label>
    <input type="file" class="inputDrop file-input txt-upper validator ${opt.class} hidden" data-showimg="${opt.showImg}" data-format='${opt.format}' data-msg-region='${opt.msgRegion}' name="${opt.name}" id="${opt.id}" ${opt.multiple ? "multiple" : ""}/>
    </div>`;
};

export const dragDropListImage = ({
    src = "",
    attr = "",
    fromDB = false,
    remove = true,
    width = 'w-44'
} = {}) => {
    const clsName = fromDB ? " drop-remove-db" : " drop-remove";
    let html = `
            <li class="fancy-image relative shadow-lg"  ${attr}>
                <a href="${src}" data-fancybox="gallery" class="w-2/5 h-2/5">
                    <img src="${src}" class="${width} object-cover rounded-lg" />
                </a>`;
    html += remove ? `<i class="icofont-close-squared-alt bg-white ml-auto text-error text-2xl absolute right-0 top-0 ${clsName}"></i>` : ``;
    html += `</li>`;
    return html;
};

export const dragDropReset = (options = {}) => {
    const opt = {
        name: "files",
        size: "btn-sm",
        color: "btn-error",
        margin: "ml-auto",
        class: "",
        icon: true,
        ...options,
    };
    const icon = opt.icon ? `<i class="icofont-refresh"></i>` : "Reset";
    return `<button class="btn ${opt.color} ${opt.size} ${opt.margin} ${opt.class} drop-reset tooltip" data-html="Reset" data-for="${opt.name}">${icon}</button>`;
};

/**
 * Get element for drag and drop
 * @param {object} dropZone e.g. $('.dropZone') or tag input send $(this)
 * @returns
 */
export const elementDragDrop = (dropZone) => {
    if (dropZone.is("input")) {
        dropZone = dropZone.siblings(".dropZone");
    }
    const name = dropZone.attr("for");
    const messageElem = dropZone.find(".drop-message");
    if (!filesData[name]) filesData[name] = [];
    if (!imagesData[name]) imagesData[name] = [];
    // console.log(filesData);
    return {
        fileInput: $(`input[name="${name}"]`),
        list: dropZone.find(".drop-list"),
        message: messageElem.length ? messageElem : "",
        name: name,
    };
};

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
    // console.log(filesData);
}

/**
 * Reset drop zone to default state
 * @param {object} e
 */
function checkDropZone(e) {
    // e.fileInput[0].files.length > 0 ? hideList(e) : showList(e);

    if (
        e.fileInput[0].files.length > 0 ||
        e.list.find("li:not(.hidden)").length > 0
    ) {
        hideList(e);
        if (e.fileInput.hasClass("req"))
            e.fileInput
                .siblings(".dropZone")
                .removeClass("border-red-500 text-red-500")
                .addClass("border-primary text-primary");
    } else {
        showList(e);
        if (e.fileInput.hasClass("req"))
            e.fileInput
                .siblings(".dropZone")
                .addClass("border-red-500 text-red-500")
                .removeClass("border-primary text-primary");
    }
}

/**
 * Show file list
 * @param {object} e
 */
function showList(e) {
    e.list.addClass("hidden").removeClass("flex");
    if (e.message) e.message.removeClass("hidden").addClass("flex");
}

/**
 * Hide file list
 * @param {object} e
 */
function hideList(e) {
    e.list.removeClass("hidden").addClass("flex");
    if (e.message) e.message.addClass("hidden").removeClass("flex");
}

/**
 * จัดการไฟล์ที่เลือกมาแสดงใน drop zone
 * @param {object} options
 * @param {object} fileInput element to show file list e.g. $('#fileInput')
 * @param {object} list element to show file list e.g. $('#fileList')
 * @returns
 * @example
 * handleFiles({
 *     element: $('input[name="files"]'),
 *     iconSize: 'text-2xl'
 * });
 * @note หากมีแค่อันเดียวเรียกแค่ handleFiles(); ได้เลย
 * $(document).on('change', 'input[name="files"]', async function(e){
 *     handleFiles();
 * });
 */
const filesData = [];
export async function handleFiles({
    files = [],
    element = $(".dropZone"),
    iconSize = "text-2xl",
} = {}) {
    const e = elementDragDrop(element);
    const format = e.fileInput.attr("data-format");
    const showImg = e.fileInput.attr("data-showimg");
    const msgRegion = e.fileInput.attr("data-msg-region") || "EN";
    const multiple = e.fileInput.attr("multiple") !== undefined;
    const fs = files.length > 0 ? files : e.fileInput[0].files;
    const fileInput = e.fileInput[0];
    e.list.innerHTML = "";

    for (let i = 0; i < fs.length; i++) {
        const file = fs[i];
        const fileExtension = file.name.split(".").pop().toLowerCase(); // get file extension
        const icon = file.type.includes("image")
            ? iconfont(iconSize).image
            : iconfont(iconSize)[fileExtension];
        let txt = "";
        const base64 = URL.createObjectURL(file);
        if (showImg && format == "image") {
            txt = dragDropListImage({ src: base64 });
        } else {
            txt = `
            <li class="flex flex-row gap-2 items-center hover:bg-gray-200 w-full px-2 rounded">
            ${icon || '<i class="icofont-file-alt text-2xl"></i>'}
            <span class="text-base overflow-hidden text-ellipsis whitespace-nowrap">${
                file.name
            }</span>
            <i class="icofont-close-squared-alt ml-auto text-error text-2xl drop-remove"></i>
            </li>`;
        }
        if (format != "") {
            const fm = fileFormats[format] || {};
            if (
                !(await checkFileType(
                    file.name,
                    fm.extension,
                    msgRegion == "EN" ? fm.msgEn : fm.msg
                ))
            ) {
                // dataTransfer.items.remove(i);
                RequiredElement(e.fileInput);

                continue;
            }
        }
        if(filesData[e.name].length > 0 && !multiple){
            filesData[e.name] = [file];
            imagesData[e.name] = [base64];
            e.list.html(txt);
            break;
        }
        // dataTransfer.items.add(file);
        filesData[e.name].push(file);
        imagesData[e.name].push(base64);
        e.list.append(txt);
        if (!multiple) break;
    }

    if (showImg && format == "image") fancybox();
    addDataFile(fileInput, e);
    
}

/**
 * Set file from path to drag and drop input
 * ดาวน์โหลดไฟล์จากเซิร์ฟเวอร์มาใส่ใน input type=file และแสดงใน drop zone
 * @param {object} options
 * @param {string|HTMLElement} options.element e.g. 'input[name="files"]' || '#files' || document.getElementById('files') || document.querySelector('input[name="files"]')
 * @param {string} options.id - id ของ input file e.g. files
 * @param {FileInfo[]} options.filesInfo - array ของข้อมูลไฟล์
 *
 * @typedef {object} filesInfo
 * @property  {string} baseDir e.g. //amecnas/AMECWEB/File/development/Form/QA/QAINS//QA-INS25-000005
 * @property  {string} storedName ชื่อไฟล์ที่อยู่ใน path จริง e.g. 1759891435422-433903288.xlsx
 * @property  {string} originalName ชื่อไฟล์ที่ต้องการแสดง e.g. Specification.xlsx
 * @example
 * await setFilePathToDragDrop({
 *     filesInfo: [
 *         {
 *             baseDir: "//amecnas/AMECWEB/File/development/Form/QA/QAINS//QA-INS25-000005",
 *             storedName: "1759891435422-433903288.xlsx",
 *             originalName: "Specification.xlsx"
 *         }
 *     ],
 *     element: 'input[name="files"]'
 * });
 */
export async function setFilePathToDragDrop({
    element = "#files",
    id = "",
    filesInfo = [],
} = {}) {
    if (id !== "") {
        element = document.getElementById(id);
    } else if (typeof element == "string") {
        element = document.querySelector(element);
    }
    let fileInput = element;
    const dataTransfer = new DataTransfer();
    if (filesInfo.length === 0) return;
    for (const f of filesInfo) {
        const file = await getFile({
            baseDir: f.baseDir,
            storedName: f.storedName,
            originalName: f.originalName,
            mode: "download",
        });
        dataTransfer.items.add(file);
    }
    fileInput.files = dataTransfer.files;
    handleFiles();
}
