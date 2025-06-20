// import $ from "jquery";
import { Fancybox } from "@fancyapps/ui";
import { Carousel } from "@fancyapps/ui/dist/carousel/carousel.esm.js";
import { Autoplay } from "@fancyapps/ui/dist/carousel/carousel.autoplay.esm.js";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import "@fancyapps/ui/dist/carousel/carousel.css";
import "@fancyapps/ui/dist/carousel/carousel.autoplay.css";
import { checkFileFormat, fileImgFormat } from "./_file";
import { ajaxOptions, getData, host, showMessage } from "../utils";

/**
 * Open image management dialog
 * @param {object} table dataTable
 * @param {object} e     element
 * @param {callbackfunction}
 */
export async function openImgDialog() {
  $("#fancyDialog").removeClass("hidden");
  $("#formAddFancyImage").addClass("hidden").removeClass("flex");
  $("#showFancyImgForm").removeClass("hidden");
  Fancybox.show([
    {
      src: "#fancyDialog",
      type: "inline",
    },
  ]);
}

export const fancyDialog = () => {
  return `<div id="fancyDialog" class="w-11/12 h-full hidden gap-5">
        <div class="flex">
            <div class="font-bold text-3xl FancyHeader"></div>
            <div class="ml-auto">
                <button id="showFancyImgForm" class="btn btn-primary max-w-sm">เพิ่มรูปภาพ</button>
                <form id="formAddFancyImage" action="#" class="gap-5 hidden"  enctype="multipart/form-data">
                    <input type="file" accept="image/*" multiple class="file-input file-input-bordered max-w-sm" name="FancyImage[]" id="FancyImage">
                    <div class="flex gap-1">
                        <button type="button" class="btn btn-neutral" id="cancelFancyImage" >ยกเลิก</button>
                        <button type="button" class="btn btn-primary" id="addFancyImage">ยืนยัน</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="fancyContainer" class="f-carousel h-full w-full max-w-[90vw] max-h-[65vh] hidden">
            <!-- รูปภาพจะถูกแสดงที่นี่ -->
        </div>
        <div id="navFancy" class="f-carousel navFancy"></div>
        {{-- <button id="deleteImage" class="btn hidden">ลบภาพ</button> --}}
    </div>`;
};

export const carouselContainer = () => {
  return `<div class="f-carousel overflow-hidden flex-1" id="fileBefore"></div>`;
};

export const carouselContent = (gallery, base64) => {
  return `<div href="${base64}" class="relative f-carousel__slide flex justify-center items-center" data-fancybox="${gallery}">
                <img src="${base64}">
            </div>`;
};

export const navContainer = (id) => {
  return `<div id="${id}" class="f-carousel navFancy"></div>`;
};

export const navContent = (gallery, base64) => {
  return `<div class="relative f-carousel__slide flex justify-center items-center" data-fancybox="${gallery}">
                <img src="${base64}">
            </div>`;
};

/**
 * set fancy image
 * @param {object} images
 * @param {string} herderName
 * @description:
 * images ต้องมี  base64 อยู่ในข้อมูลที่ส้งมา
 * และต้องมีการ set attribute เช่น data-id="imageId" เพื่อให้เป็น key ไว้ใช้งานต่อ
 */

export async function setFancyImage(images, herderName = "จัดการภาพ") {
  let container = $("#fancyContainer");
  let navFancy = $("#navFancy");
  container.empty(); // ล้างภาพเดิมออก
  navFancy.empty(); // ล้างภาพเดิมออก

  if ($("#fancyDialog").length == 0) {
    $("body").append(fancyDialog());
  }

  if (images.length > 0) {
    $("#fancyDialog").addClass("w-fit").removeClass("w-11/12");
    $(".FancyHeader").html(herderName);

    for (const img of images) {
      let imageTag = `
                <div href="${img.base64}" class="relative f-carousel__slide flex justify-center items-center" data-fancybox="gallery">
                    <img src="${img.base64}"  class="max-w-[90vw] max-h-[65vh]"
                         ${img.attr}">

                    <button class="deleteFancyImage absolute top-1 right-1 btn btn-error"
                       ${img.attr} >
                        <i class="icofont-trash p-1"></i>
                    </button>
                </div>
            `;
      let navTag = `
                <div class="relative f-carousel__slide flex justify-center items-center" data-fancybox="nav">
                    <img src="${img.base64}"  class="">
                </div>
            `;
      container.append(imageTag);
      navFancy.append(navTag);
    }
    const mainCarousel = carouselAuto("fancyContainer", carouselAutoOption);
    const navCarrousel = carousel("navFancy", {
      ...carouselNavOpt,
      Sync: { target: mainCarousel },
    });

    // console.log('main', mainCarousel);
    // console.log('nav', navCarrousel);

    $("#fancyDialog").removeClass("w-fit h-fit").addClass("w-11/12 h-full");
    setTimeout(() => {
      $("#fancyContainer").removeClass("hidden");
      $("#navFancy").removeClass("hidden").addClass("flex");
    }, 100);
  } else {
    $(".FancyHeader").html("");
    showMessage("ไม่พบรูปภาพกรุณา คลิกเพิ่มรูปภาพ", "warning");
    $("#fancyDialog").addClass("w-fit h-fit").removeClass("w-11/12 h-full");
  }
}

// $(document).on('click', '.deleteFancyImage', function(){
//     e.stopPropagation(); // ป้องกันการคลิกซ้ำ Fancybox
//     let imageId = $(this).data("id");
//     deleteImage(imageId, $(this).parent());
// });

/**
 * Show input form
 */
$(document).on("click", "#showFancyImgForm", function () {
  $(this).addClass("hidden");
  $("#formAddFancyImage").toggleClass("hidden flex");
});

/**
 * Cancel
 */
$(document).on("click", "#cancelFancyImage", function () {
  $("#formAddFancyImage").toggleClass("hidden flex");
  $("#showFancyImgForm").removeClass("hidden");
});

/**
 * Check file format
 */
$(document).on("change", "#FancyImage", function () {
  const format = Array.isArray(fileImgFormat)
    ? fileImgFormat.join(", ")
    : fileImgFormat;
  checkFileFormat(
    $(this),
    fileImgFormat,
    `ไฟล์ไม่ถูกต้อง กรุณาแนบไฟล์นามสกุล ${format}`
  );
});

/**
 * slide show
 */
export const carouselSlide = {
  Slideshow: {
    playOnStart: true,
  },
};

/**
 * Auto play
 */
export const carouselAutoOption = (time = 3000) => {
  return {
    Autoplay: {
      timeout: time,
    },
  };
};
// options
// slidesPerPage: กำหนดจำนวนสไลด์ที่แสดงพร้อมกันใน 1 หน้า
// ถ้า slidesPerPage: 1 → แสดงทีละ 1 รูป → ได้ 10 หน้า
// ถ้า slidesPerPage: 5 → แสดงทีละ 5 รูป → ได้ 2 หน้า

// fill: false:
// ถ้า fill: true (ค่า default บางเวอร์ชัน) แล้ว Carousel เห็นว่ามีที่ว่างเหลือ มันจะขยายรูปให้เต็ม → ทำให้รูปทั้งหมดแสดงในหน้าเดียว (ไม่มีการเลื่อน)
// ถ้า fill: false → แสดงเท่าที่กำหนดใน slidesPerPage เท่านั้น เหลือที่ก็ไม่ขยาย จึงเกิด “หลายหน้า”

// infinite: false:
// ถ้า true → เลื่อนสุดแล้วจะวนกลับหน้าแรก (Carousel แบบ Loop)
// ถ้า false → เลื่อนสุดแล้วหยุด

// center: false:
// ถ้า center: true → สไลด์อาจถูกจัดกึ่งกลางใน container และ “พยายาม” ขยายเต็ม
// ถ้า false → จะจัดตามธรรมชาติ (ชิดซ้าย)

// transition: "slide":
// เพื่อให้เห็นเอฟเฟกต์เลื่อนจากซ้ายไปขวา
// หรือใช้ "fade" ถ้าอยากให้ภาพจางไป-จางมา
export const carouselNavOpt = {
  slidesPerPage: 1,
  fill: false,
  infinite: true,
  transition: "slide",
  Dots: false,
  Navigation: false,
};

/**
 * สร้าง fancy
 * @param {array} image imagedata = []; || imageData = [['gallery'] = [],['gallery2'] = []]
 */
export function fancyboxByData(image) {
  console.log(image);
  let img = [];
  new Promise((resolve) => {
    for (const key in image) {
      console.log(key, image[key], Array.isArray(image[key]));

      if (Array.isArray(image[key])) {
        image[key].forEach(function (i, index) {
          // console.log(i);
          img.push(createFancyObjectURL(i));
        });
      } else {
        // console.log(image[key]);
        img.push(createFancyObjectURL(image[key]));
      }
      // }
    }
    resolve(img);
  }).then((img) => {
    console.log(img);
    if (img.length > 0) {
      fancyboxBasic(img);
    }
  });
}

/**
 * Create object url from base64
 * @param {string} base64
 * @param {string} type
 * @returns
 */
export function createFancyObjectURL(base64, type = "html") {
  return {
    src: `<img src="${base64}" alt="" style="width:100%;">`,
    type: type,
  };
}

/**
 * Create fancy box
 * @param {array} img  [{src: img, type: 'html'}]
 */
export function fancyboxBasic(img) {
  console.log(img);

  new Fancybox(img);
}
/**
 * create fancy box
 * @param {string} dataFancy e.g. gallery
 * @description: สร้าง Carousel
 * <a href="${base64}" class="relative flex justify-center items-center spaceFancy" data-fancybox="gallery">
        <img src="${base64}">
    </a>
 */
export function fancybox(dataFancy) {
  Fancybox.bind(`[data-fancybox="${dataFancy}"]`, {
    Slideshow: {
      playOnStart: true,
    },
  });
}

/**
 * สร้าง Carousel
 * @param {string} id e.g. 'fancyContainer'
 * @param {object} opt
 * @returns
 * @description: สร้าง Carousel
 * จำเป็นต้องมีโครงสร้าง html
 * <div class="f-carousel" id="fancyContainer">
 *     <div class="f-carousel__slide">...</div>
 * </div>
 */
export function carousel(id, opt) {
  // return autoplay ? new Carousel(document.getElementById(id), opt, {Autoplay}) : new Carousel(document.getElementById(id), opt);
  return new Carousel(document.getElementById(id), opt);
}

/**
 * สร้าง Carousel
 * @param {string} id e.g. 'fancyContainer'
 * @param {object} opt
 * @returns
 * @description: สร้าง Carousel
 * จำเป็นต้องมีโครงสร้าง html
 * <div class="f-carousel" id="fancyContainer">
 *     <div class="f-carousel__slide">...</div>
 * </div>
 */
export function carouselAuto(id, opt = carouselAutoOption) {
  // console.log($(`#${id}`), opt);

  return new Carousel(document.getElementById(id), opt, { Autoplay });
}
