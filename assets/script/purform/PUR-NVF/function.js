import { showMessage } from '@amec/webasset/utils';
import {
    attachTypeManager,
    districtEnManager,
    districtThManager,
    postcodeEnManager,
    postcodeThManager,
    provinceEnManager,
    provinceThManager,
    subDistrictEnManager,
    subDistrictThManager,
} from './formManager';
export function selectAttachType(reqtype, type) {
    console.log(type);
    if (reqtype == 'A') {
        switch (type) {
            case 'Oversea':
                attachTypeManager.show(['cer', 'other']);
                break;
            default:
                attachTypeManager.show(['cer', 'vat', 'book', 'other']);
                break;
        }
    } else if (reqtype == 'U') {
        attachTypeManager.show(['letter', 'other']);
    } else if (reqtype == 'D') {
        attachTypeManager.show(['other']);
    }
}

export async function clearaddr() {
    provinceThManager.value = '';
    provinceEnManager.value = '';
    districtThManager.value = '';
    districtEnManager.value = '';
    subDistrictThManager.value = '';
    subDistrictEnManager.value = '';
    postcodeThManager.value = '';
    postcodeEnManager.value = '';
}

export function resetformid(id) {
    const selector = id.startsWith('#') ? id : `#${id}`;
    const $container = $(selector);

    if ($container.length === 0) {
        console.warn(`ไม่พบ Element ที่มี ID: ${selector}`);
        return;
    }

    const $inputs = $container.find('input, select, textarea');

    $inputs.each(function () {
        const type = this.type;
        const tag = this.tagName.toLowerCase();

        if (type === 'radio' || type === 'checkbox') {
            this.checked = false;
        } else if (tag === 'select') {
            //  $(this).prop('selectedIndex', 0);
            // แถม: ถ้าโปรเจกต์มีใช้ Select2 ให้ล้างหน้ากากมันด้วย
            //if ($(this).data('select2')) {
            //   $(this).trigger('change');
            // }
        } else {
            $(this).val('');
        }
    });
    $container.find('#COUNTRY_SELECT').prop('disabled', true);
    $container.find('.field-local').addClass('hidden');
    $container.find('.field-oversea').removeClass('hidden');
}

export function toggleAttachSection(type, show) {
    let selector = '';

    // กำหนดเงื่อนไขเลือก Class หรือ ID ของกล่องแต่ละประเภท
    switch (type) {
        case 'cer':
            selector = '#file-cer'; // หรืออ้างอิงถึง div หุ้ม
            break;
        case 'bank':
            selector = '#file-bank';
            break;
        case 'changeaddr':
            selector = '#file-changeaddr';
            break;
        case 'other':
            selector = '#file-other';
            break;
    }

    // ตัวอย่างการใช้ร่วมกับ jQuery ในการสลับการแสดงผล
    if (show) {
        $(selector).closest('.flex.flex-col.gap-2').show();
    } else {
        $(selector).closest('.flex.flex-col.gap-2').hide();
    }
}

export function checkAttFile() {
    const REQTYPE = $('input[name="REQTYPE_SHOW"]:checked').val();
    const hasCer =
        $('#file-cer')[0].files.length > 0 ||
        $('#file-type-11').children().length > 0;

    if (REQTYPE && REQTYPE == 'A') {
        if (!hasCer) {
            showMessage(
                'Please Attached Company Certificate / Vat Register / Company Profile',
                'warning',
            );
            return false;
        }
    }
    return true;
}
