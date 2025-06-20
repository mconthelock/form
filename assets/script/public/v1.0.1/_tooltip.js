
/**
 * Tooltip
 * @module _tooltip
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @requires jQuery npm install jquery
 * @version 1.0.1
 */

// Tooltip
// how to use 
// step 0: add customTooltip to body
// step 1: add class tooltip to element
// step 2: add class tooltip-bottom, tooltip-top, tooltip-left, tooltip-right to element for position
// step 3: add data-html="html" to element for content
export const customTooltip = `<div id="custom-tooltip" class="fixed hidden z-[10000] bg-primary text-white p-3 rounded shadow border border-base-300 text-sm"></div>` 

$(document).on("mouseover", ".tooltip", async function (e) {
    if($('#custom-tooltip').length == 0) $('body').append(customTooltip);
    const html = $(this).data("html");
    const tooltip = $("#custom-tooltip");
    const $target = $(this);

    // Set HTML content
    tooltip.html(html);

    // หาขนาดและตำแหน่งของ element เป้าหมาย
    const offset = $target.offset();
    const targetWidth = $target.outerWidth();
    const targetHeight = $target.outerHeight();
    const tooltipWidth = tooltip.outerWidth();
    const tooltipHeight = tooltip.outerHeight();

    // ตำแหน่ง default
    let top = offset.top - tooltipHeight - 8;
    let left = offset.left + (targetWidth / 2) - (tooltipWidth / 2);

    // อ่าน class ตำแหน่ง
    if ($target.hasClass("tooltip-bottom")) {
        top = offset.top + targetHeight + 8;
    } else if ($target.hasClass("tooltip-left")) {
        top = offset.top + (targetHeight / 2) - (tooltipHeight / 2);
        left = offset.left - tooltipWidth - 8;
    } else if ($target.hasClass("tooltip-right")) {
        top = offset.top + (targetHeight / 2) - (tooltipHeight / 2);
        left = offset.left + targetWidth + 8;
    } 

    tooltip.css({
        top: top + "px",
        left: left + "px"
    }).removeClass("hidden");
    $('.tooltip').on("mouseleave", () => {
        tooltip.addClass('hidden');
      });
});
