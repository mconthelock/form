
/**
 * Tooltip
 * @module _tooltip
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-17
 * @requires jQuery npm install jquery
 * @version 1.0.2
 * @note 2025-07-02
 *  แก้ไม่มี html ใน tooltip ไม่ต้องโชว์
 * @note 2025-07-03
 *  หากมี data-tip ลบทิ้งกันไปทับกับ daisy
 * @note 2025-07-07
 *  เพิ่มหากเอาเมาส์ชี้ที่ tooltip แล้ว tooltip จะไม่หาย สามารถนำไปใช้ได้กับที่แนบตารางหลายบรรทัดแล้ว scroll 
 * @note 2025-07-15
 *  เพิ่ม data-hold="true" เพื่อให้ tooltip ไม่หายเมื่อเอาเมาส์ชี้ที่ tooltip เพื่อกำหนดแต่ละอันแยก tooltip จะหายหรือไม่ 
 */

// Tooltip
// how to use 
// step 0: import this module in your script e.g. import "@v1.0.2/_tooltip";
// step 1: add class tooltip to element
// step 2: add class tooltip-bottom, tooltip-top, tooltip-left, tooltip-right to element for position
// step 3: add data-html="html" to element for content
// export const customTooltip = `<div id="custom-tooltip" class="absolute z-[10000] bg-primary text-white p-2 rounded shadow border border-base-300 text-sm !aspect-auto hidden"></div>` 
// export const customTooltip = `<div id="custom-tooltip" class="absolute z-[10000] bg-neutral text-white p-2 rounded shadow text-sm !aspect-auto "></div>` 
export const customTooltip = (hold) => `<div id="custom-tooltip" class="absolute z-[10000] bg-neutral text-white p-2 rounded shadow text-sm !aspect-auto" data-hold="${hold}"></div>` 

$(document).on("mouseover", ".tooltip", async function (e) {
    const hold = $(this).data("hold") || false;
    if($('#custom-tooltip').length == 0) $('body').append(customTooltip(hold));

    const tooltip = $("#custom-tooltip");
    const html = $(this).data("html");
    const target = $(this);
    console.log(html);
    
    if(html){
        $(this).removeAttr("data-tip");
        
    }else{
        tooltip.remove();
    }
    
    // Set HTML content
    tooltip.html(html);
    

    // หาขนาดและตำแหน่งของ element เป้าหมาย
    const offset = target.offset();
    const targetWidth = target.outerWidth();
    const targetHeight = target.outerHeight();
    const tooltipWidth = tooltip.outerWidth();
    const tooltipHeight = tooltip.outerHeight();

    // ตำแหน่ง default
    let top = offset.top - tooltipHeight - 8;
    let left = offset.left + (targetWidth / 2) - (tooltipWidth / 2);

    // อ่าน class ตำแหน่ง
    if (target.hasClass("tooltip-bottom")) {
        top = offset.top + targetHeight + 8;
    } else if (target.hasClass("tooltip-left")) {
        top = offset.top + (targetHeight / 2) - (tooltipHeight / 2);
        left = offset.left - tooltipWidth - 8;
    } else if (target.hasClass("tooltip-right")) {
        top = offset.top + (targetHeight / 2) - (tooltipHeight / 2);
        left = offset.left + targetWidth + 8;
    } 

    const screenWidth = $(window).width();
    const screenHeight = $(window).height();

    // ป้องกันล้นขวา
    if (left + tooltipWidth > screenWidth) {
        left = screenWidth - tooltipWidth - 8; // เว้นขอบขวา
    }

    // ป้องกันล้นซ้าย
    if (left < 0) {
        left = 8; // เว้นขอบซ้าย
    }

    // ป้องกันล้นขอบล่าง
    if (top + tooltipHeight > window.scrollY + screenHeight) {
        top = window.scrollY + screenHeight - tooltipHeight - 8;
    }

    // ป้องกันล้นขอบบน
    if (top < window.scrollY) {
        top = window.scrollY + 8;
    }

    tooltip.css({
        top: top + "px",
        left: left + "px"
    });

    $(this).on("click", () => {
        tooltip.addClass('hidden');
    });
});

let hideTooltipTimeout = null;

$(document).on("mouseenter", ".tooltip", function () {
    // ... set content/position ...
    $("#custom-tooltip").removeClass('hidden');
    clearTimeout(hideTooltipTimeout);
});

$(document).on("mouseleave", ".tooltip", function () {
    hideTooltipTimeout = setTimeout(function () {
        // $("#custom-tooltip").addClass('hidden');
        $("#custom-tooltip").remove();
    }, 100);
});

$(document).on("mouseenter", "#custom-tooltip", function () {
    if($(this).data("hold") == true) {
        clearTimeout(hideTooltipTimeout);
    }
});
$(document).on("mouseleave", "#custom-tooltip", function () {
    hideTooltipTimeout = setTimeout(function () {
        // $("#custom-tooltip").addClass('hidden');
        $("#custom-tooltip").remove();
    }, 100);
});