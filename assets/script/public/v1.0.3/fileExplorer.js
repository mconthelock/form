import { downloadOrOpenFile, getListInFolder } from "../../api/file";
import { showErrorMessage } from "./jFuntion";

/**
 * Create Explorer UI component
 * @module fileExplorer
 * @description This module provides functions to create a file explorer UI component.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-11-18
 * @requires Api module:api/file
 * @requires Public module:public/jFuntion
 * @requires icofont for https://amecwebtest.mitsubishielevatorasia.co.th/cdn/icofont/icofont.min.css
 * @version 1.0.3
 */

/**
 * @typedef {Object} objectExplorer
 * @property {string} id - The ID of the HTML element where the explorer will be created.
 * @property {string} root - The root directory path for the explorer.
 * @property {string} [iconClass="text-xl"] - The CSS class for the icons.
 * @property {string} [minheight="min-h-[50vh]"] - The minimum height of the explorer content area.
 * @property {string} [maxheight="max-h-[50vh]"] - The maximum height of the explorer content area.
 * @property {string[]} [allow=[]] - Array of allowed file extensions.
 * @property {boolean} [download=false] - Whether to enable file download on click.
 * @property {boolean} [actions=true] - Whether to show the choose button.
 *
 * @param {objectExplorer} obj
 * @returns {Promise<{element: HTMLElement}>} - Returns a promise that resolves to an object containing the explorer element.
 * @example
 * const explorer = await createExplorer({
 *   id: "fileExplorer",            // (required) The ID of the HTML element to contain the explorer
 *   root: "//server/share/folder", // (required) The root directory path for the explorer
 *   iconClass: "text-lg",          // (optional) default is "text-xl"
 *   minheight: "min-h-[60vh]",     // (optional) default is "min-h-[50vh]"
 *   maxheight: "max-h-[80vh]",     // (optional) default is "max-h-[50vh]"
 *   allow: [".txt", ".jpg"],       // (optional) default is [] (all types)
 *   download: true,                // (optional) default is false
 *   actions: true,                 // (optional) default is true, show choose button
 * });
 * @events fe-choose - Fired when a file is chosen. The event detail contains the selected file information.
 * @example
 * vanillaJS:
 * document.addEventListener("fe-choose", async function(event) {
 *      if (event.target.id === "explorer") {
 *          const selected = event.detail;
 *          console.log('Selected:', selected);
 *
 *          const fullPath = `${selected.path}\\${selected.name}`;
 *          $("#PathFolder").val(fullPath);
 *          showMessage("Folder selected: " + selected.name);
 *          $("#treeModal").prop("checked", false);
 *      }
 * }, true); // true to capture the event during the capturing phase จะทำงานก่อน
 * jQuery:
 * $(document).on("fe-choose", "#explorer", async function (event) {
 *      console.log('jQuery event:', event);
 *      console.log('Original event:', event.originalEvent);
 *      console.log('Detail:', event.originalEvent.detail);
 *      console.log('Detail:', event.detail);
 *      const data = event.detail;
 *  });
 * @note jquery ไม่จำเป็นต้อง event.originalEvent.detail เพราะ jquery จะดึง detail มาให้แล้วใน event.detail
 */
// prettier-ignore
export async function createExplorer({
    id = "",
    root = "",
    iconClass = "text-xl",
    minheight = "min-h-[50vh]",
    maxheight = "max-h-[50vh]",
    allow = [],
    download = false,
    actions = true,
    reset = true,
} = {}) {
    if(id == ""){
        throw new Error("ID is required");
    }
    if(root == ""){
        throw new Error("Root is required");
    }
    const el = document.getElementById(id)
    const data = await getListInFolder({
        baseDir: root,
        allow: allow,
    });

    let html = `
    <div id="fe_container" class="relative my-5 border min-w-[50vw]">
        <div id="fe_loading" class="absolute z-10 w-full h-full flex justify-center items-center bg-gray-500/20 hidden">
            <div class="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
        <div id="fe_header" class="w-full border join">
            <button class="btn btn-sm rounded-none btn-disabled join-item" id="fe_back"><i class="icofont-arrow-left text-xl"></i></button>
            <button class="btn btn-sm rounded-none btn-disabled join-item" id="fe_forward"><i class="icofont-arrow-right text-xl"></i></button>
            <button class="btn btn-sm rounded-none join-item" id="fe_refresh"><i class="icofont-refresh text-xl"></i></button>
            <input type="text" class="input input-sm input-bordered join-item w-full" id="fe_path" value="${root}" readonly>
            <input type="text" class="input input-sm input-bordered w-1/3" id="fe_search" placeholder="Search">
        </div>
        <div id="fe_content" class="overflow-auto ${minheight} ${maxheight}  border ">
    `;
    html += createListItem({data: data, iconClass: iconClass});
    html += `</div>
        <div id="fe_footer" class="w-full border join p-2">
            <span class="text-sm">${data.length} items</span>
        </div>
    </div>`;
    if(actions) html += `
        <div id="fe_actions" class="flex justify-end">
            <button class="btn btn-primary m-2" id="fe_choose">Choose</button>
        </div>
    `;
    
    if(el === null){
        throw new Error("Element not found");
    }
    
    if(el.init) {
        if(reset) {
            el.reset(html);
        }
        return el;
    }

    // set properties
    el.innerHTML = html;
    el.root = root;
    el.back = [];
    el.forward = [];
    el.data = data;
    el.init = 1; // ใช้บอกว่า สร้าง element เสร็จแล้ว
    el.id = id;
    el.path = () => {
        return el.querySelector("#fe_path").value;
    }
    el.select = () => { 
        const selected = el.querySelector('.fe-list-item.selected');
        if(!selected) return null;
        const name = selected.textContent.trim();
        const currentPath = el.path();
        const isDir = selected.classList.contains('fe-folder');
        return {
            name: name,
            path: currentPath,
            isDir: isDir,
        }
    };
    el.refresh = async () => {
        const currentPath = el.path();
        const newData = await getListInFolder({baseDir: currentPath, allow: allow,});
        updateContent({element: el, data: newData, iconClass: iconClass});
        el.data = newData;
        el.querySelector("#fe_search").value = "";
    };
    el.reset = async (html) => {
        const newData = await getListInFolder({baseDir: root, allow: allow});
        el.innerHTML = html;
        el.querySelector("#fe_path").value = root;
        el.data = newData;
        el.back = [];
        el.forward = [];
    }
    el.destroy = () => {
        try {
            // 1. ลบ event listeners ทั้งหมด (สำคัญ!)
            if (el._controller) {
                el._controller.abort();
                delete el._controller;
            }
            
            // 2. Clear all data properties
            el.data = null;
            el.back = null;
            el.forward = null;
            el.root = null;
            
            // 3. Remove all custom methods and flags
            delete el.path;
            delete el.select;
            delete el.refresh;
            delete el.init;
            
            // 4. Clear all DOM content (keep the main element)
            el.innerHTML = '';
            
            // 5. Remove destroy method itself
            delete el.destroy;
        } catch (error) {
            console.error('Error destroying explorer:', error);
        }
    }

    // Add click event listeners for folder navigation
     // ✅ สร้าง controller
    const controller = new AbortController();
    const { signal } = controller;
    el._controller = controller;
    el.addEventListener('dblclick', async function(event) {
        // เมื่อ ดับเบิลคลิกที่โฟลเดอร์ ให้เข้าโฟลเดอร์นั้น
        if (event.target.closest('.fe-folder')) {
            try {
                loading(el);
                const folderElement = event.target.closest('.fe-folder');
                const folderName = folderElement.textContent.trim();
                const currentPath = el.path();
                const newPath = `${currentPath}\\${folderName}`;
                const newData = await getListInFolder({baseDir: currentPath, path: folderName,allow: allow});
                el.querySelector("#fe_path").value = newPath;
                el.forward = [];
                el.back.push(currentPath);
                el.data = newData;
                updateContent({element: el, data: newData, iconClass: iconClass});
                el.querySelector("#fe_search").value = "";
            } catch (error) {
                console.error('Error navigating to folder:', error);
                showErrorMessage(error);
            } finally {
                loading(el, false);
            }
        }
        // เมื่อ ดับเบิลคลิกที่ไฟล์ ให้ดาวน์โหลดไฟล์นั้น
        if (event.target.closest('.fe-file')) {
            if(download != 'download') return;
            try {
                const fileElement = event.target.closest('.fe-file');
                const fileName = fileElement.textContent.trim();
                const currentPath = el.path();
            
                downloadOrOpenFile({
                    baseDir: currentPath,
                    storedName: fileName,
                    mode: 'download',
                })
            }catch (error) {
                console.error('Error navigating to file:', error);
                showErrorMessage(error);
            }
        }
    }, { signal });
    el.addEventListener('click', async function(event) {
        // เพิ่มคลาส selected การเลือกโฟลเดอร์หรือไฟล์
        if (event.target.closest('.fe-list-item')) {
            const list = event.target.closest('.fe-list-item');
            const selected = el.querySelector('.fe-list-item.selected');
            if(selected && selected !== list){
                selected.classList.remove('bg-base-300', 'selected');
                selected.classList.add('hover:text-primary-content', 'hover:bg-primary');
            }
             const isSelected = list.classList.contains('selected');
            if(isSelected){
                list.classList.remove('bg-base-300', 'selected');
                list.classList.add('hover:text-primary-content', 'hover:bg-primary');
                return;
            }
            list.classList.add('bg-base-300', 'selected');
            list.classList.remove('hover:text-primary-content', 'hover:bg-primary');
        }
        // ปุ่มรีเฟรช 
        if(event.target.closest("#fe_refresh")){
            try {
                loading(el);
                await el.refresh();
            } catch (error) {
                console.error('Error refreshing folder:', error);
                showErrorMessage(error);
            } finally {
                loading(el, false);
            }
        }
        // ปุ่มย้อนกลับ
        if(event.target.closest("#fe_back")){
            try {
                loading(el);
                const backPath = el.back[el.back.length - 1];
                const currentPath = el.path();
                const newData = await getListInFolder({baseDir: backPath, allow: allow,});
                el.querySelector("#fe_path").value = backPath;
                el.forward.push(currentPath);
                el.back.pop();
                el.data = newData;
                updateContent({element: el, data: newData, iconClass: iconClass});
                el.querySelector("#fe_search").value = "";
            } catch (error) {
                console.error('Error navigating back:', error);
                showErrorMessage(error);
            } finally {
                loading(el, false);
            }
        }
        // ปุ่มไปข้างหน้า
        if(event.target.closest("#fe_forward")){
            try {
                loading(el);
                const forwardPath = el.forward[el.forward.length - 1];
                const currentPath = el.path();
                const newData = await getListInFolder({baseDir: forwardPath, allow: allow,});
                el.querySelector("#fe_path").value = forwardPath;
                el.back.push(currentPath);
                el.forward.pop();
                el.data = newData;
                updateContent({element: el, data: newData, iconClass: iconClass});
                el.querySelector("#fe_search").value = "";
            } catch (error) {
                console.error('Error navigating forward:', error);
                showErrorMessage(error);
            } finally {
                loading(el, false);
            }
        }
        if(event.target.closest("#fe_choose")){
            try {
                const selected = el.select();
                if(!selected) return;
                const chooseEvent = new CustomEvent('fe-choose', { 
                    detail: selected,
                    bubbles: true,      // ให้ event bubble ขึ้นไป parent
                    composed: true      // ให้ event ทะลุ shadow DOM boundary
                });
                el.dispatchEvent(chooseEvent);
            } catch (error) {
                console.error('Error choosing file:', error);
                showErrorMessage(error);
            }
        }
    }, { signal });
    el.addEventListener('input', async function(event) {
        // ค้นหาไฟล์และโฟลเดอร์
        if (event.target.closest('#fe_search')) {
            const searchTerm = event.target.value.toLowerCase();
            const filteredData = el.data.filter((item) => {
                return item.name.toLowerCase().includes(searchTerm);
            });
            updateContent({element: el, data: filteredData, iconClass: iconClass});
        }
    }, { signal });
    return el;
}

const loading = (element, show = true) => {
    const loading = document.getElementById("fe_loading");
    if(show){
        loading.classList.remove("hidden");
        element.querySelector("#fe_choose").classList.add("btn-disabled");
    }else{
        element.querySelector("#fe_choose").classList.remove("btn-disabled");
        loading.classList.add("hidden");
    }
}

function updateContent({ element, data, iconClass = "" }) {
    const contentEl = element.querySelector("#fe_content");
    let html = "";
    html += createListItem({ data: data, iconClass: iconClass });
    
    contentEl.innerHTML = html;
    element.querySelector(
        "#fe_footer span"
    ).textContent = `${data.length} items`;
    if (element.back.length === 0) {
        element.querySelector("#fe_back").classList.add("btn-disabled");
    } else {
        element.querySelector("#fe_back").classList.remove("btn-disabled");
    }
    if (element.forward.length === 0) {
        element.querySelector("#fe_forward").classList.add("btn-disabled");
    } else {
        element.querySelector("#fe_forward").classList.remove("btn-disabled");
    }
}

function createListItem({
    data = [],
    iconClass = "",
    className = "px-3 hover:text-primary-content hover:bg-primary hover:cursor-pointer",
}) {
    let html = "";
    data.forEach((d) => {
        if (d.isDir) {
            html += `<div class=" ${className} fe-folder fe-list-item">
            <i class="${classIcofont("dir", iconClass)}"></i>
            ${d.name}
        </div>`;
        } else {
            html += `<div class=" ${className} fe-file fe-list-item">
            <i class="${classIcofont(d.extension, iconClass)}"></i>
            ${d.name}
        </div>`;
        }
    });
    return html;
}

const classIcofont = (ext, className = "") => {
    ext = ext.toLowerCase();
    let cls = "";
    switch (ext) {
        case "dir":
            cls = "icofont-folder text-yellow-500";
            break;
        case "pdf":
            cls = "icofont-file-pdf text-red-600";
            break;
        case "doc":
        case "docx":
            cls = "icofont-file-word text-blue-600";
            break;
        case "xls":
        case "xlsx":
        case "xlsm":
            cls = "icofont-file-excel text-green-600";
            break;
        case "ppt":
        case "pptx":
            cls = "icofont-file-powerpoint text-orange-600";
            break;
        case "zip":
        case "rar":
            cls = "icofont-file-zip";
            break;
        case "gif":
            cls = "icofont-file-gif text-blue-600";
            break;
        case "jpg":
        case "jpeg":
            cls = "icofont-file-jpg text-blue-600";
            break;
        case "png":
            cls = "icofont-file-png text-blue-600";
            break;
        case "svg":
            cls = "icofont-file-svg text-blue-600";
            break;
        case "tif":
        case "tiff":
            cls = "icofont-file-tiff text-blue-600";
            break;
        case "ico":
        case "webp":
        case "avif":
            cls = "icofont-image text-orange-600";
            break;
        case "bmp":
            cls = "icofont-file-bmp text-orange-600";
            break;
        case "mp3":
            cls = "icofont-file-mp3 text-orange-600";
            break;
        case "wav":
            cls = "icofont-file-wmv text-orange-600";
            break;
        case "flac":
            cls = "icofont-file-audio text-orange-600";
            break;
        case "avi":
            cls = "icofont-file-avi-mp4 text-orange-600";
            break;
        case "mp4":
        case "mkv":
            cls = "icofont-file-video text-orange-600";
            break;
        case "mov":
            cls = "icofont-file-mov text-orange-600";
            break;
        case "html":
            cls = "icofont-file-html5 text-orange-600";
            break;
        case "css":
            cls = "icofont-file-css text-purple-600";
            break;
        case "js":
            cls = "icofont-file-javascript text-yellow-600";
            break;
        case "php":
            cls = "icofont-file-php text-purple-600";
            break;
        case "py":
            cls =
                "icofont-file-python bg-gradient-to-r from-yellow-400 to-blue-600 bg-clip-text text-transparent";
            break;
        case "sql":
            cls = "icofont-file-sql text-yellow-600";
            break;
        case "txt":
            cls = "icofont-file-alt text-gray-600";
            break;
        case "exe":
            cls = "icofont-file-exe text-gray-600";
            break;
        default:
            cls = "icofont-file-file text-gray-600";
            break;
    }
    return `${cls} ${className}`;
};
