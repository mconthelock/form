import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';
import { classIcofont } from '@amec/webasset/fileExplorer';

select2();
export const currencyManager = {
    list: ['stdcur', 'cur'],
    get select() {
        return $('.currency');
    },
    set text(val) {
        $('.currency').text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger('change');
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: 'sm',
                placeholder: 'Select currency',
                search: false,
                clear: false,
                emptyValue: false,
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$('#' + id).is(element)) {
                $('#' + id)
                    .val(value.toUpperCase())
                    .trigger('change');
            }
        }
    },
};

export const concernManager = {
    list: ['CONCERNEDORG'],
    get select() {
        return $('.org');
    },
    set text(val) {
        $('.org').text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger('change');
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: 'sm',
                placeholder: 'Select concerned division',
                search: true,
                clear: false,
                emptyValue: false,
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$('#' + id).is(element)) {
                $('#' + id)
                    .val(value.toUpperCase())
                    .trigger('change');
            }
        }
    },
};

// ตัวอย่างไฟล์ fileHelper.js (หรือไฟล์ utils ของโปรเจกต์คุณ)
export const renderFilesByType = (
    files,
    fileType,
    containerId,
    isReturn = false,
) => {
    const filteredFiles =
        files?.filter((f) => Number(f.FILE_TYPE) === Number(fileType)) || [];

    const $container = $(`#${containerId}`);

    if (filteredFiles.length === 0) {
        $container.html('');
        return;
    }

    let html = "<div class='flex flex-col gap-3 mt-2'>";
    filteredFiles.forEach((f) => {
        const ext = f.FILE_ONAME ? f.FILE_ONAME.split('.').pop() : '';
        html += `
        <a 
            href="${f.FILE_PATH}" 
            storedName="${f.FILE_FNAME}" 
            originalName="${f.FILE_ONAME}"
            target="_blank"
            class="file-link text-primary flex items-center gap-3 w-full border rounded-lg bg-base-100 p-3 hover:bg-gray-50 transition"
        >
            <i class="${classIcofont(ext)} text-4xl"></i>
            <span class="link link-primary">${f.FILE_ONAME}</span>
            <button 
                type="button" 
                file-id="${f.FILE_ID}"
                class="flex items-center justify-center ml-auto p-5 w-6 h-6 rounded hover:bg-red-100 text-red-500 hover:text-red-600 transition remove-file ${isReturn ? '' : 'hidden'}"
            >
                <i class="icofont-trash text-xl"></i>
            </button>
        </a>`;
    });
    html += '</div>';

    $container.html(html);
};

export function bindComplianceData(complianceString, complianceOther) {
    if (complianceString) {
        const selected = complianceString.split(',').map((i) => i.trim());
        $('#COMPLIANCE_READONLY_CONTAINER .chk-compliance').each(function () {
            if (selected.includes($(this).val())) {
                $(this)
                    .prop('checked', true)
                    .next('.chk-label')
                    .removeClass('text-gray-500')
                    .addClass('text-gray-900 font-medium');
            }
        });
    }
    if (complianceOther?.trim()) {
        const $other = $(
            '#COMPLIANCE_READONLY_CONTAINER .chk-compliance',
        ).filter(function () {
            return $(this).val() === 'อื่นๆ ระบุ';
        });
        if ($other.length)
            $other
                .prop('checked', true)
                .next('.chk-label')
                .removeClass('text-gray-500')
                .addClass('text-gray-900 font-medium');
        $('#COMPLIANCE_OTHER_READONLY').val(complianceOther);
    }
}
