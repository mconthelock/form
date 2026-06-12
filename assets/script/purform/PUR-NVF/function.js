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
    // ป้องกันกรณีส่งมาแค่ชื่อ id โดยไม่มีเครื่องหมาย # นำหน้า
    const selector = id.startsWith('#') ? id : `#${id}`;
    const $container = $(selector);

    if ($container.length === 0) {
        console.warn(`ไม่พบ Element ที่มี ID: ${selector}`);
        return;
    }

    // 1. ค้นหาฟิลด์กรอกข้อมูลทั้งหมดภายใน ID นั้น
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

    // 2. ปรับแต่ง UI เฉพาะเจาะจงภายใน Container นั้นๆ (แก้ให้เป็นแบบเจาะจงใน id)
    $container.find('#COUNTRY_SELECT').prop('disabled', true);
    $container.find('.field-local').addClass('hidden');
    $container.find('.field-oversea').removeClass('hidden');
}
