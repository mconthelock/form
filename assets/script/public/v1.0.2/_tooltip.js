
/**
 * Tooltip
 * @module _tooltip
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-17
 * @requires jQuery npm install jquery
 * @version 1.0.2
 */

// Tooltip
// how to use 
// step 0: add customTooltip to body
// step 1: add class tooltip to element
// step 2: add class tooltip-bottom, tooltip-top, tooltip-left, tooltip-right to element for position
// step 3: add data-html="html" to element for content
export const customTooltip = `<div id="custom-tooltip" class="absolute z-[10000] bg-primary text-white p-3 rounded shadow border border-base-300 text-sm !aspect-auto"></div>` 

$(document).on("mouseover", ".tooltip", async function (e) {
    if($('#custom-tooltip').length == 0) $('body').append(customTooltip);
    const html = $(this).data("html");
    const tooltip = $("#custom-tooltip");
    const target = $(this);

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


    // const html = $(this).data("html");
    // const target = $(this);
    
    // // ถ้ายังไม่มี tooltip ให้เพิ่มเข้า body
    // if ($('#custom-tooltip').length === 0) {
    //     $('body').append(customTooltip);
    // }

    // const tooltip = $('#custom-tooltip');
    // tooltip.html(html).removeClass("hidden");

    // // ให้ browser render ก่อน แล้วค่อยคำนวณตำแหน่ง
    // requestAnimationFrame(() => {
    //     const rect = target[0].getBoundingClientRect();
    //     const tooltipWidth = tooltip.outerWidth();
    //     const tooltipHeight = tooltip.outerHeight();
    //     const targetWidth = target.outerWidth();
    //     const targetHeight = target.outerHeight();

    //     // ค่าเริ่มต้น: ด้านบน
    //     let top = rect.top + window.scrollY - tooltipHeight - 8;
    //     let left = rect.left + window.scrollX + (targetWidth / 2) - (tooltipWidth / 2);

    //     if (target.hasClass("tooltip-bottom")) {
    //         top = rect.top + window.scrollY + targetHeight + 8;
    //     } else if (target.hasClass("tooltip-left")) {
    //         top = rect.top + window.scrollY + (targetHeight / 2) - (tooltipHeight / 2);
    //         left = rect.left + window.scrollX - tooltipWidth - 8;
    //     } else if (target.hasClass("tooltip-right")) {
    //         top = rect.top + window.scrollY + (targetHeight / 2) - (tooltipHeight / 2);
    //         left = rect.left + window.scrollX + targetWidth + 8;
    //     }

    //     // ป้องกันล้นขอบ
    //     const screenWidth = $(window).width();
    //     const screenHeight = $(window).height();
    //     const scrollY = window.scrollY;

    //     if (left + tooltipWidth > screenWidth) left = screenWidth - tooltipWidth - 8;
    //     if (left < 0) left = 8;
    //     if (top + tooltipHeight > scrollY + screenHeight) top = scrollY + screenHeight - tooltipHeight - 8;
    //     if (top < scrollY) top = scrollY + 8;

    //     tooltip.css({ top: `${top}px`, left: `${left}px` });
    // });



    // tooltip.removeClass("hidden")
    $('.tooltip').on("mouseleave", () => {
        // tooltip.addClass('hidden');
        tooltip.remove();
    });
   
});
